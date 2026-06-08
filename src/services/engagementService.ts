import PaymentInstance from "./paymentInstance";
import { resolveProviderIdNumber } from "src/utils/spSession";

export type AcceptEngagementResult = {
  message: string;
  engagement?: Record<string, unknown>;
};

/** Coerce API/socket ids (number, string, bigint) into a positive integer. */
export function parseEngagementId(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.trunc(n);
}

function resolveProviderId(
  appUser: Record<string, unknown> | null | undefined
): number | null {
  return resolveProviderIdNumber(appUser);
}

/** Map payments API accept errors to user-facing copy. */
export function parseAcceptEngagementError(err: unknown): string {
  const ax = err as {
    response?: { status?: number; data?: { error?: string } };
    message?: string;
  };
  const apiMsg = ax.response?.data?.error;
  if (apiMsg) {
    if (/no longer available/i.test(apiMsg)) {
      return "This booking is no longer available. It may have been accepted by another provider or expired.";
    }
    if (/already accepted/i.test(apiMsg)) {
      return "This booking was already accepted.";
    }
    if (/payment not completed/i.test(apiMsg)) {
      return "Customer payment is not complete yet. Try again after payment succeeds.";
    }
    if (/time conflict|not available at this time|provider has time conflict/i.test(apiMsg)) {
      const detail = (ax.response?.data as { detail?: string })?.detail;
      return detail
        ? `You already have another booking at this time (${detail}).`
        : "You already have another booking at this time.";
    }
    if (/provider id required/i.test(apiMsg)) {
      return "Provider account not found. Sign in again as a service provider.";
    }
    return apiMsg;
  }
  if (ax.response?.status === 404) {
    return "Booking not found. It may have been removed.";
  }
  if (ax.response?.status === 409) {
    return "This booking cannot be accepted right now.";
  }
  return ax.message || "Could not accept this booking. Please try again.";
}

function isNewBookingNotificationType(type: string): boolean {
  const t = (type || "").toUpperCase();
  return (
    t === "NEW_BOOKING_OPPORTUNITY" ||
    t === "NEW_BOOKING_REQUEST" ||
    t.includes("NEW_BOOKING") ||
    t.includes("OPPORTUNITY")
  );
}

/** Mark provider "new booking" notifications read so the Accept/Decline popup does not return. */
export async function dismissProviderNewBookingNotifications(
  engagementId: number,
  providerId: number
): Promise<void> {
  const eid = parseEngagementId(engagementId);
  if (eid == null || !Number.isFinite(providerId) || providerId < 1) return;

  try {
    const { data } = await PaymentInstance.get("/api/in-app-notifications", {
      params: {
        recipientType: "provider",
        recipientId: String(providerId),
        limit: 50,
      },
    });
    const list = (data?.notifications || []) as Array<{
      id: string;
      type?: string;
      engagementId?: string | null;
      readAt?: string | null;
    }>;

    const targets = list.filter((n) => {
      if (n.readAt) return false;
      if (String(n.engagementId) !== String(eid)) return false;
      return isNewBookingNotificationType(n.type || "");
    });

    await Promise.all(
      targets.map((n) =>
        PaymentInstance.patch(
          `/api/in-app-notifications/${n.id}/read`,
          { recipientType: "provider", recipientId: providerId },
          { params: { recipientType: "provider", recipientId: providerId } }
        )
      )
    );
  } catch (e) {
    console.warn("[sp-booking] dismiss notification failed", e);
  }
}

export async function acceptEngagement(
  engagementId: number | string,
  appUser: Record<string, unknown> | null | undefined
): Promise<AcceptEngagementResult> {
  const providerId = resolveProviderId(appUser);
  if (!providerId) {
    throw new Error("Sign in as a service provider to accept bookings.");
  }
  const eid = parseEngagementId(engagementId);
  if (eid == null) {
    throw new Error("Invalid booking id.");
  }

  const { data } = await PaymentInstance.post(
    `/api/v2/engagements/${eid}/accept`,
    {
      serviceproviderid: providerId,
      providerId,
    }
  );

  return {
    message: data?.message || "Booking accepted successfully",
    engagement: data?.engagement,
  };
}

export { resolveProviderId };
