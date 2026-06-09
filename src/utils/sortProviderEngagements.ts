import dayjs from "dayjs";
import { coalesceEndEpoch, coalesceStartEpoch } from "src/services/bookingEpoch";

export type ProviderEngagementSortable = {
  engagement_id?: number | string;
  id?: number | string;
  start_epoch?: number | null;
  end_epoch?: number | null;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
};

export type ProviderEngagementTab = "ongoing" | "future" | "past";

function serviceStartSortKey(row: ProviderEngagementSortable): number {
  const epoch = coalesceStartEpoch(row.start_epoch, row.start_date ?? row.startDate);
  if (epoch != null) return epoch;
  const raw = row.start_date ?? row.startDate;
  if (raw) return dayjs(raw).startOf("day").unix();
  return 0;
}

function serviceEndSortKey(row: ProviderEngagementSortable): number {
  const epoch = coalesceEndEpoch(
    row.end_epoch,
    row.end_date ?? row.endDate ?? row.start_date ?? row.startDate
  );
  if (epoch != null) return epoch;
  const raw = row.end_date ?? row.endDate ?? row.start_date ?? row.startDate;
  if (raw) return dayjs(raw).endOf("day").unix();
  return serviceStartSortKey(row);
}

/** Order provider bookings by service date (not booking creation time). */
export function sortProviderEngagementsByServiceDate<T extends ProviderEngagementSortable>(
  rows: T[],
  tab: ProviderEngagementTab
): T[] {
  const ascending = tab === "ongoing" || tab === "future";
  const useEnd = tab === "past";

  return [...rows].sort((a, b) => {
    const aKey = useEnd ? serviceEndSortKey(a) : serviceStartSortKey(a);
    const bKey = useEnd ? serviceEndSortKey(b) : serviceStartSortKey(b);
    const diff = ascending ? aKey - bKey : bKey - aKey;
    if (diff !== 0) return diff;
    return String(a.engagement_id ?? a.id ?? "").localeCompare(
      String(b.engagement_id ?? b.id ?? ""),
      undefined,
      { numeric: true }
    );
  });
}
