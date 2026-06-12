import type {
  PreviousBookingDetails,
  ServiceProviderDTO,
  VacationAvailabilityDTO,
} from "src/types/ProviderDetailsType";
import dayjs from "dayjs";

export function resolveProviderVacationAvailability(
  provider: Pick<ServiceProviderDTO, "vacationAvailability" | "previousBookingDetails">
): VacationAvailabilityDTO | null {
  if (provider.vacationAvailability?.status === "ACTIVE") {
    return provider.vacationAvailability;
  }

  const prev = provider.previousBookingDetails;
  if (!prev) return null;

  const leaveDays = Number(prev.leaveDays) || 0;
  const vacationStartDate = toYmd(prev.vacationStartDate);
  const vacationEndDate = toYmd(prev.vacationEndDate);
  if (leaveDays <= 0 || !vacationStartDate || !vacationEndDate) return null;

  return {
    status: "ACTIVE",
    engagementId: prev.engagementId,
    leaveDays,
    vacationStartDate,
    vacationEndDate,
    engagementStartDate: toYmd(prev.startDate),
    engagementEndDate: toYmd(prev.endDate),
    overlapsSearchWindow: false,
  };
}

function toYmd(value: string | null | undefined): string | null {
  if (!value) return null;
  const s = String(value).trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

export function formatVacationDateRange(vac: VacationAvailabilityDTO): string {
  const start = dayjs(vac.vacationStartDate).format("MMM D, YYYY");
  const end = dayjs(vac.vacationEndDate).format("MMM D, YYYY");
  if (start === end) return start;
  return `${start} – ${end}`;
}

export function formatVacationSummary(
  vac: VacationAvailabilityDTO,
  options?: { includeEngagement?: boolean }
): string {
  const days = `${vac.leaveDays} day${vac.leaveDays === 1 ? "" : "s"}`;
  const range = formatVacationDateRange(vac);
  const parts = [days, range];
  if (options?.includeEngagement && vac.engagementId) {
    parts.unshift(`Engagement #${vac.engagementId}`);
  }
  return parts.join(" · ");
}

export function vacationOverlapsSearch(
  vac: VacationAvailabilityDTO,
  searchStart?: string | null,
  searchEnd?: string | null
): boolean {
  if (vac.overlapsSearchWindow) return true;
  if (!searchStart) return false;
  const end = searchEnd || searchStart;
  const a0 = toYmd(vac.vacationStartDate);
  const a1 = toYmd(vac.vacationEndDate);
  const b0 = toYmd(searchStart);
  const b1 = toYmd(end);
  if (!a0 || !a1 || !b0 || !b1) return false;
  return a0 <= b1 && b0 <= a1;
}

export type { PreviousBookingDetails };
