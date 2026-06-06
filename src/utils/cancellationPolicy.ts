import dayjs from "dayjs";
import { coalesceStartEpoch } from "src/services/bookingEpoch";

export type CancellationPolicy = {
  onDemandMinutesBeforeStart: number;
  shortTermDaysBeforeStart: number;
  monthlyDaysBeforeStart: number;
};

export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  onDemandMinutesBeforeStart: 30,
  shortTermDaysBeforeStart: 2,
  monthlyDaysBeforeStart: 2,
};

export function parseCancellationPolicy(settings: unknown): CancellationPolicy {
  const raw =
    settings && typeof settings === "object"
      ? (settings as { cancellation?: Partial<CancellationPolicy> }).cancellation
      : undefined;

  const clamp = (value: unknown, min: number, max: number, fallback: number) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  };

  return {
    onDemandMinutesBeforeStart: clamp(
      raw?.onDemandMinutesBeforeStart,
      0,
      24 * 60,
      DEFAULT_CANCELLATION_POLICY.onDemandMinutesBeforeStart
    ),
    shortTermDaysBeforeStart: clamp(
      raw?.shortTermDaysBeforeStart,
      0,
      365,
      DEFAULT_CANCELLATION_POLICY.shortTermDaysBeforeStart
    ),
    monthlyDaysBeforeStart: clamp(
      raw?.monthlyDaysBeforeStart,
      0,
      365,
      DEFAULT_CANCELLATION_POLICY.monthlyDaysBeforeStart
    ),
  };
}

function normalizeBookingType(bookingType?: string | null): string {
  return String(bookingType || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function daysBeforeStartForType(bookingType: string, policy: CancellationPolicy): number {
  if (bookingType === "MONTHLY") return policy.monthlyDaysBeforeStart;
  return policy.shortTermDaysBeforeStart;
}

export function isCancellationTimeAllowed(
  booking: {
    bookingType?: string;
    start_epoch?: number | string | null;
    startDate?: string | null;
  },
  policy: CancellationPolicy = DEFAULT_CANCELLATION_POLICY,
  nowUnix = dayjs().unix()
): boolean {
  const bookingType = normalizeBookingType(booking.bookingType);

  if (bookingType === "ON_DEMAND") {
    const startEpoch = coalesceStartEpoch(booking.start_epoch, booking.startDate);
    if (startEpoch == null) return false;
    const cutoff = startEpoch - policy.onDemandMinutesBeforeStart * 60;
    return nowUnix < cutoff;
  }

  const startDate = booking.startDate;
  if (!startDate || !dayjs(startDate).isValid()) {
    const startEpoch = coalesceStartEpoch(booking.start_epoch, null);
    if (startEpoch == null) return false;
    const daysBefore = daysBeforeStartForType(bookingType, policy);
    const cutoff = dayjs.unix(startEpoch).startOf("day").subtract(daysBefore, "day");
    return dayjs.unix(nowUnix).startOf("day").isBefore(cutoff.add(1, "day"));
  }

  const daysBefore = daysBeforeStartForType(bookingType, policy);
  const lastCancelDay = dayjs(startDate).startOf("day").subtract(daysBefore, "day");
  return !dayjs.unix(nowUnix).startOf("day").isAfter(lastCancelDay);
}

export function getCancellationUnavailableMessage(
  booking: {
    bookingType?: string;
    start_epoch?: number | string | null;
    startDate?: string | null;
  },
  policy: CancellationPolicy = DEFAULT_CANCELLATION_POLICY
): string {
  const bookingType = normalizeBookingType(booking.bookingType);

  if (bookingType === "ON_DEMAND") {
    const minutes = policy.onDemandMinutesBeforeStart;
    return `Cancellation is only allowed at least ${minutes} minute${minutes === 1 ? "" : "s"} before the scheduled start time.`;
  }

  const days = daysBeforeStartForType(bookingType, policy);
  const label = bookingType === "MONTHLY" ? "monthly" : "short-term";
  return `Cancellation for ${label} bookings is only allowed until ${days} day${days === 1 ? "" : "s"} before the service start date.`;
}
