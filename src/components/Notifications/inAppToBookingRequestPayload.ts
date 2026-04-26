import type { NewBookingRequestPayload } from "./BookingRequestToast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/** Subset of `InAppNotification` used to build a booking request payload. */
type InAppLike = {
  engagementId: string | null;
  title: string;
  body?: string;
  metadata?: unknown;
};

function asMeta(m: unknown): Record<string, unknown> | null {
  if (m && typeof m === "object" && !Array.isArray(m)) {
    return m as Record<string, unknown>;
  }
  return null;
}

/**
 * Map an in-app notification (new booking) into the same shape the live socket toast uses,
 * so the SP sees consistent schedule / distance / amount in the “View details” panel.
 */
export function inAppToBookingRequestPayload(n: InAppLike): NewBookingRequestPayload | null {
  const eid = n.engagementId != null && n.engagementId !== "" ? Number(n.engagementId) : NaN;
  if (!Number.isFinite(eid) || eid < 1) return null;

  const m = asMeta(n.metadata) ?? {};
  const serviceType = String(m.service_type ?? n.title ?? "Service");
  const bookingType = String(m.booking_type ?? "ON_DEMAND");
  const base = m.base_amount != null ? Number(m.base_amount) : 0;
  const duration = m.duration_minutes != null ? Number(m.duration_minutes) : undefined;
  const address = m.address != null && String(m.address).trim() !== "" ? String(m.address) : undefined;

  const startEpoch = m.start_epoch != null ? Number(m.start_epoch) : NaN;

  let ymd: string;
  if (m.start_date != null && String(m.start_date).trim() !== "") {
    const raw = String(m.start_date).slice(0, 10);
    ymd = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : dayjs(String(m.start_date)).format("YYYY-MM-DD");
  } else if (Number.isFinite(startEpoch)) {
    ymd = dayjs.unix(startEpoch).tz("Asia/Kolkata").format("YYYY-MM-DD");
  } else {
    ymd = dayjs().format("YYYY-MM-DD");
  }

  let startTime: string;
  if (m.start_time_label && typeof m.start_time_label === "string" && m.start_time_label.length > 0) {
    const s = m.start_time_label;
    const comma = s.indexOf(",");
    if (comma >= 0) {
      startTime = s.slice(comma + 1).trim();
    } else {
      startTime = s.trim();
    }
  } else if (Number.isFinite(startEpoch)) {
    startTime = dayjs.unix(startEpoch).tz("Asia/Kolkata").format("h:mm a");
  } else {
    startTime = "—";
  }

  let endTime: string | undefined;
  let endEpoch: number = NaN;
  if (m.end_epoch != null) {
    endEpoch = Number(m.end_epoch);
  } else if (Number.isFinite(startEpoch) && duration && duration > 0) {
    endEpoch = startEpoch + Math.round((duration * 60) as number);
  }
  if (Number.isFinite(endEpoch)) {
    endTime = dayjs.unix(endEpoch).tz("Asia/Kolkata").format("h:mm a");
  }

  let distM: number | undefined;
  if (m.distance_m != null && Number.isFinite(Number(m.distance_m))) {
    distM = Number(m.distance_m);
  } else if (m.distance_km != null && Number.isFinite(Number(m.distance_km))) {
    distM = Number(m.distance_km) * 1000;
  }

  return {
    engagement_id: eid,
    service_type: serviceType,
    booking_type: bookingType,
    start_date: ymd,
    start_time: startTime,
    end_time: endTime,
    duration_minutes: duration,
    base_amount: Number.isFinite(base) ? base : 0,
    address: address ?? null,
    distance_meters: distM,
  };
}
