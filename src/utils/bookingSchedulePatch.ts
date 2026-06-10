import type { Dayjs } from "dayjs";
import { formatDateOnly } from "src/utils/maidPricingUtils";

export function buildReduxBookingPatch(
  preference: string,
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  startTime: Dayjs | null,
  endTime: Dayjs | null,
  existing: Record<string, unknown> | null
) {
  const startIso = startDate?.toISOString() ?? startTime?.toISOString() ?? "";
  const endIso =
    endDate?.toISOString() ??
    (preference === "Monthly" && startDate
      ? startDate.add(1, "month").toISOString()
      : startIso);

  let timeRange = "";
  let timeSlot = "";
  if (preference === "Date") {
    timeRange = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    timeSlot = timeRange;
  } else if (preference === "Short term") {
    timeRange = startTime?.format("HH:mm") || "";
    timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
  } else {
    timeRange = startTime?.format("HH:mm") || "";
    timeSlot = startTime?.format("HH:mm") || "";
  }

  const patch = {
    ...(existing ?? {}),
    startDate: startIso ? startIso.split("T")[0] : "",
    endDate: endIso ? endIso.split("T")[0] : "",
    timeRange,
    bookingPreference: preference,
    startTime: startTime?.format("HH:mm") || "",
    endTime: endTime?.format("HH:mm") || "",
    timeSlot,
  };

  if (!startTime && !endTime) {
    patch.timeRange = "";
    patch.timeSlot = "";
    patch.startTime = "";
    patch.endTime = "";
  }

  return patch;
}

export function isSchedulePatchDirty(
  localPatch: Record<string, unknown>,
  committed: Record<string, unknown> | null
): boolean {
  return schedulePatchKey(localPatch) !== schedulePatchKey(committed);
}

/** Stable comparison key for date, time, and duration fields. */
export function schedulePatchKey(patch: Record<string, unknown> | null): string {
  if (!patch) return "";
  return [
    formatDateOnly(String(patch.startDate ?? "")),
    formatDateOnly(String(patch.endDate ?? "")),
    String(patch.startTime ?? "").trim(),
    String(patch.endTime ?? "").trim(),
  ].join("|");
}
