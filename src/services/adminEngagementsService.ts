import PaymentInstance from "./paymentInstance";
import {
  formatVacationSummary,
  resolveProviderVacationAvailability,
  vacationOverlapsSearch,
} from "src/utils/providerVacationAvailability";

export type AdminEngagementRow = {
  engagement_id: number;
  booking_type: string;
  service_type: string;
  assignment_status: string;
  engagement_status: string;
  task_status: string;
  start_date: string | null;
  start_time: string | null;
  base_amount: number;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  customer: {
    customerid: number;
    firstname?: string;
    lastname?: string;
    mobile?: string;
  };
  provider: {
    serviceproviderid: number;
    firstname?: string;
    lastname?: string;
  } | null;
  payment_status?: string;
  total_amount?: number;
};

export async function fetchAdminEscalatedOnDemandEngagements() {
  const { data } = await PaymentInstance.get<{
    success: boolean;
    engagements: AdminEngagementRow[];
    count: number;
  }>("/api/admin/engagements", {
    params: {
      booking_type: "ON_DEMAND",
      crm_escalated: true,
      limit: 100,
    },
  });
  return data.engagements ?? [];
}

export async function assignOnDemandEngagement(engagementId: number, providerId: number) {
  const { data } = await PaymentInstance.post<{ success: boolean }>(
    `/api/v2/engagements/${engagementId}/assign`,
    { providerId }
  );
  return data;
}

export type AdminVacationProviderRow = {
  engagement_id: number;
  customer: {
    customerid: number;
    firstname?: string;
    lastname?: string;
    mobile?: string;
  };
  provider: {
    serviceproviderid: number;
    firstname?: string;
    lastname?: string;
    mobile?: string;
  };
  booking_type: string;
  service_type: string;
  vacation_start_date: string;
  vacation_end_date: string;
  leave_days: number;
  address?: string | null;
  pending_on_demand?: Array<{
    engagement_id: number;
    service_type: string;
    start_date: string | null;
    address?: string | null;
  }>;
};

export async function fetchAdminVacationProviders(
  includePendingOnDemand = true,
  options?: { scope?: "active" | "future"; overlapDate?: string }
) {
  const { data } = await PaymentInstance.get<{
    success: boolean;
    vacations: AdminVacationProviderRow[];
    count: number;
  }>("/api/admin/vacation-providers", {
    params: {
      include_pending_on_demand: includePendingOnDemand,
      scope: options?.scope,
      overlap_date: options?.overlapDate,
    },
  });
  return data.vacations ?? [];
}

export type AdminBookingProviderRow = {
  serviceproviderid: number;
  firstName?: string;
  lastName?: string;
  housekeepingRole?: string;
  rating?: number;
  distanceKm?: number;
  vacationStatus: "Vacation priority" | "Active vacation" | "—";
  vacationDays: number | null;
  vacationPeriod: string | null;
  vacationEngagementId: number | null;
  vacationOverlapsVisit: boolean;
  vacationTooltip?: string | null;
  raw: Record<string, unknown>;
};

function serviceTypeToHousekeepingRole(serviceType: string): string {
  const s = String(serviceType || "").toLowerCase();
  if (s.includes("maid")) return "MAID";
  if (s.includes("nanny")) return "NANNY";
  return "COOK";
}

export function mapProviderToAdminBookingRow(
  provider: Record<string, unknown>,
  visitDate?: string | null
): AdminBookingProviderRow {
  const id = Number(provider.serviceproviderid ?? provider.serviceProviderId);
  const vac = resolveProviderVacationAvailability({
    vacationAvailability: provider.vacationAvailability as never,
    previousBookingDetails: provider.previousBookingDetails as never,
  });
  const overlaps = vac
    ? vacationOverlapsSearch(vac, visitDate, visitDate)
    : false;

  let vacationStatus: AdminBookingProviderRow["vacationStatus"] = "—";
  if (vac) {
    vacationStatus = overlaps ? "Vacation priority" : "Active vacation";
  }

  return {
    serviceproviderid: id,
    firstName: String(provider.firstName ?? provider.firstname ?? ""),
    lastName: String(provider.lastName ?? provider.lastname ?? ""),
    housekeepingRole: String(
      provider.housekeepingRole ??
        (Array.isArray(provider.housekeepingRoles)
          ? provider.housekeepingRoles[0]
          : "") ??
        ""
    ),
    rating: provider.rating != null ? Number(provider.rating) : undefined,
    distanceKm: provider.distanceKm != null ? Number(provider.distanceKm) : undefined,
    vacationStatus,
    vacationDays: vac?.leaveDays ?? null,
    vacationPeriod: vac ? formatVacationSummary(vac) : null,
    vacationEngagementId:
      vac?.engagementId != null ? Number(vac.engagementId) : null,
    vacationOverlapsVisit: overlaps,
    vacationTooltip: vac
      ? formatVacationSummary(vac, { includeEngagement: true })
      : null,
    raw: provider,
  };
}

export async function fetchProvidersForAdminBooking(params: {
  visitDate?: string | null;
  endDate?: string | null;
  serviceType: string;
  latitude?: number | null;
  longitude?: number | null;
  startTime?: string;
  durationMinutes?: number;
}): Promise<AdminBookingProviderRow[]> {
  const visitDate = params.visitDate || new Date().toISOString().slice(0, 10);
  const lat = Number(params.latitude);
  const lng = Number(params.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(
      "Engagement is missing map coordinates. Cannot search nearby providers."
    );
  }

  const role = serviceTypeToHousekeepingRole(params.serviceType);
  const { data } = await PaymentInstance.post<{
    providers?: Record<string, unknown>[];
    count?: number;
  }>("/api/v2/service-providers/nearby-monthly?limit=100", {
    lat: String(lat),
    lng: String(lng),
    radius: 30,
    startDate: visitDate,
    endDate: params.endDate || visitDate,
    preferredStartTime: params.startTime || "09:00",
    role,
    serviceDurationMinutes: params.durationMinutes ?? 60,
    bookingType: "ON_DEMAND",
  });

  const mapped = (data.providers ?? []).map((p) =>
    mapProviderToAdminBookingRow(p, visitDate)
  );

  return mapped.sort((a, b) => {
    if (a.vacationOverlapsVisit !== b.vacationOverlapsVisit) {
      return a.vacationOverlapsVisit ? -1 : 1;
    }
    const da = a.distanceKm ?? 9999;
    const db = b.distanceKm ?? 9999;
    return da - db;
  });
}
