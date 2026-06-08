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
  return dayjs.unix(ep).tz(IST).format("DD MMM YYYY");
}

/** Milliseconds since epoch; naive API timestamps are treated as UTC wall clock. */
export function toInstantMs(value?: string | number | null): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }
  const s = String(value).trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return n < 1e12 ? n * 1000 : n;
  }
  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  const iso =
    /Z$/i.test(normalized) || /[+-]\d{2}:?\d{2}$/.test(normalized)
      ? normalized
      : `${normalized}Z`;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

function istCalendarYmd(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

function istYesterdayYmd(nowMs = Date.now()): string {
  return istCalendarYmd(dayjs(nowMs).tz(IST).startOf("day").subtract(1, "millisecond").valueOf());
}

const PLACED_TODAY_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Format an absolute instant as h:mm am/pm in Asia/Kolkata (never browser-local). */
function formatIstTime12h(ms: number): string {
  const d = new Date(ms);
  let totalMinutes = d.getUTCHours() * 60 + d.getUTCMinutes() + 330;
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(min).padStart(2, "0")} ${period}`;
}

/**
 * API / Postgres instants: timestamptz (Z) or naive UTC `timestamp without time zone`.
 */
export function parseServerInstantToIst(value?: string | number | null): dayjs.Dayjs | null {
  const ms = toInstantMs(value);
  if (ms == null) return null;
  const d = dayjs(ms).tz(IST);
  return d.isValid() ? d : null;
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
export function formatBookingCreatedAt(value?: string | number | null): string {
  const ms = toInstantMs(value);
  if (ms == null) return "";
  const nowMs = Date.now();
  const ageMs = nowMs - ms;
  const timePart = formatIstTime12h(ms);
  // After IST midnight, calendar "yesterday" feels wrong for bookings placed a few hours ago.
  if (ageMs >= 0 && ageMs < PLACED_TODAY_WINDOW_MS) {
    return `Today at ${timePart}`;
  }
  const ymd = istCalendarYmd(ms);
  const todayYmd = istCalendarYmd(nowMs);
  if (ymd === todayYmd) return `Today at ${timePart}`;
  const yesterdayYmd = istYesterdayYmd(nowMs);
  if (ymd === yesterdayYmd) return `Yesterday at ${timePart}`;
  const datePart = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
  return `${datePart} at ${timePart}`;
}

/** Scheduled service calendar day from start epoch (IST). */
export function formatBookingServiceDate(
  startEpoch?: EpochLike,
  startDate?: string | null
): string {
  const ep = coalesceStartEpoch(startEpoch, startDate);
  if (ep != null) {
    return dayjs.unix(ep).tz(IST).format("dddd, MMMM D, YYYY");
  }
  if (startDate?.trim()) {
    const d = dayjs.tz(startDate.trim().slice(0, 10), "YYYY-MM-DD", IST);
    return d.isValid() ? d.format("dddd, MMMM D, YYYY") : "—";
  }
  return "—";
}

