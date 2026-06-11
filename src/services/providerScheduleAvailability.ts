import providerInstance from "./providerInstance";
import { formatDateOnly } from "src/utils/maidPricingUtils";

export type ProviderScheduleCheckParams = {
  providerId: number;
  latitude: number;
  longitude: number;
  role: string;
  startDate: string;
  endDate: string;
  preferredStartTime: string;
  serviceDurationMinutes: number;
  customerId?: number | null;
  /** When modifying a booking, exclude its current allocation from conflict checks. */
  excludeEngagementId?: number | string | null;
};

export type ProviderScheduleCheckResult = {
  available: boolean;
  message?: string;
  provider?: Record<string, unknown>;
};

const UNAVAILABLE_MESSAGE =
  "This service provider is not available for your selected dates and time. Please adjust your schedule or choose another provider.";

export async function checkSelectedProviderAvailability(
  params: ProviderScheduleCheckParams
): Promise<ProviderScheduleCheckResult> {
  const {
    providerId,
    latitude,
    longitude,
    role,
    startDate,
    endDate,
    preferredStartTime,
    serviceDurationMinutes,
    customerId,
    excludeEngagementId,
  } = params;

  if (!Number.isFinite(providerId) || providerId < 1) {
    return { available: true };
  }

  const payload: Record<string, unknown> = {
    lat: String(latitude),
    lng: String(longitude),
    radius: 50,
    role: role || "COOK",
    startDate: formatDateOnly(startDate),
    endDate: formatDateOnly(endDate),
    preferredStartTime,
    serviceDurationMinutes,
  };

  if (customerId != null && Number.isFinite(Number(customerId)) && Number(customerId) > 0) {
    payload.customerID = Number(customerId);
  }

  if (
    excludeEngagementId != null &&
    String(excludeEngagementId).trim() !== ""
  ) {
    payload.excludeEngagementId = String(excludeEngagementId).trim();
  }

  const { data } = await providerInstance.post(
    `/api/service-providers/${providerId}/check-schedule`,
    payload
  );

  if (data?.success === false) {
    return {
      available: false,
      message: String(data?.message || UNAVAILABLE_MESSAGE),
    };
  }

  const available = data?.available === true || data?.fullyAvailable === true;
  if (available) {
    return {
      available: true,
      provider: (data?.provider as Record<string, unknown>) ?? undefined,
    };
  }

  const summary = data?.summary as
    | { unavailableDays?: number; daysWithDifferentTime?: number }
    | undefined;
  let detail = "";
  if (summary && (summary.unavailableDays ?? 0) > 0) {
    detail = " Some days in your range are fully booked.";
  } else if (summary && (summary.daysWithDifferentTime ?? 0) > 0) {
    detail = " Your preferred time is not available on all days in this range.";
  }

  return {
    available: false,
    message: `${String(data?.message || UNAVAILABLE_MESSAGE)}${detail}`,
    provider: (data?.provider as Record<string, unknown>) ?? undefined,
  };
}
