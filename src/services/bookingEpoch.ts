import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const IST = "Asia/Kolkata";

export type EpochLike = number | string | null | undefined;

export type BookingTimeFields = {
  start_epoch?: EpochLike;
  end_epoch?: EpochLike;
  start_time?: string | null;
  end_time?: string | null;
};

export function toEpochOrNull(value: EpochLike): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function dateToEpochStartOrNull(value?: string | null): number | null {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.startOf("day").unix() : null;
}

export function coalesceStartEpoch(
  startEpoch?: EpochLike,
  startDate?: string | null
): number | null {
  return toEpochOrNull(startEpoch) ?? dateToEpochStartOrNull(startDate ?? null);
}

export function coalesceEndEpoch(
  endEpoch?: EpochLike,
  endDate?: string | null
): number | null {
  const ep = toEpochOrNull(endEpoch);
  if (ep != null) return ep;
  if (!endDate) return null;
  const d = dayjs(endDate);
  return d.isValid() ? d.endOf("day").unix() : null;
}

export function epochToDisplayDate(epoch?: EpochLike): string | null {
  const ep = toEpochOrNull(epoch);
  if (ep == null) return null;
  return dayjs.unix(ep).format("DD MMM YYYY");
}

export function epochToDisplayTime(epoch?: EpochLike): string | null {
  const ep = toEpochOrNull(epoch);
  if (ep == null) return null;
  return dayjs.unix(ep).tz(IST).format("h:mm A");
}

/** HH:mm (24h) → h:mm A */
export function formatHmToAmPm(timeString?: string | null): string {
  if (!timeString?.trim()) return "";
  try {
    const [hours, minutes] = timeString.trim().split(":");
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return timeString;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${period}`;
  } catch {
    return timeString;
  }
}

/** Scheduled visit time from epoch or API time strings (IST). */
export function formatBookingTimeRange(fields: BookingTimeFields): string {
  const startEpoch = toEpochOrNull(fields.start_epoch);
  const endEpoch = toEpochOrNull(fields.end_epoch);

  if (startEpoch != null) {
    const startLabel = dayjs.unix(startEpoch).tz(IST).format("h:mm A");
    if (endEpoch != null && endEpoch > startEpoch) {
      const endLabel = dayjs.unix(endEpoch).tz(IST).format("h:mm A");
      return `${startLabel} – ${endLabel}`;
    }
    return startLabel;
  }

  const startTime = formatHmToAmPm(fields.start_time);
  const endTime = formatHmToAmPm(fields.end_time);
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  return startTime || endTime || "";
}

/** When the customer placed the booking (IST). */
export function formatBookingCreatedAt(value?: string | null): string {
  if (!value?.trim()) return "";
  const d = dayjs(value).tz(IST);
  if (!d.isValid()) return "";
  const now = dayjs().tz(IST);
  const timePart = d.format("h:mm A");
  if (d.isSame(now, "day")) return `Today at ${timePart}`;
  if (d.isSame(now.subtract(1, "day"), "day")) return `Yesterday at ${timePart}`;
  return d.format("MMM D, YYYY [at] h:mm A");
}

