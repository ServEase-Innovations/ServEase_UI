import React from "react";
import { Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export function asMetaRecord(m: unknown): Record<string, unknown> | null {
  if (m == null) return null;
  if (typeof m === "string") {
    try {
      const parsed = JSON.parse(m) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
    return null;
  }
  if (typeof m === "object" && !Array.isArray(m)) {
    return m as Record<string, unknown>;
  }
  return null;
}

export function isAutoCancelledNoProviderType(type: string): boolean {
  return (type || "").toUpperCase() === "BOOKING_AUTO_CANCELLED_NO_PROVIDER";
}

export type NotificationBookingLine = { label: string; value: string };

export function notificationBookingLines(
  metadata: unknown
): NotificationBookingLine[] {
  const meta = asMetaRecord(metadata);
  if (!meta) return [];

  const lines: NotificationBookingLine[] = [];

  const serviceType =
    meta.service_type != null
      ? String(meta.service_type)
      : meta.serviceType != null
        ? String(meta.serviceType)
        : "";
  if (serviceType.trim()) {
    lines.push({
      label: "Service",
      value: serviceType.replace(/_/g, " "),
    });
  }

  const bookingType =
    meta.booking_type != null
      ? String(meta.booking_type)
      : meta.bookingType != null
        ? String(meta.bookingType)
        : "";
  if (bookingType.trim()) {
    lines.push({
      label: "Booking type",
      value: bookingType.replace(/_/g, " "),
    });
  }

  let scheduled = "";
  const startLabel =
    meta.start_time_label ?? meta.startTimeLabel ?? meta.scheduled_at ?? null;
  const startEpochRaw = meta.start_epoch ?? meta.startEpoch;
  if (startLabel && typeof startLabel === "string" && startLabel.trim()) {
    scheduled = startLabel.trim();
  } else if (startEpochRaw != null && Number.isFinite(Number(startEpochRaw))) {
    scheduled = dayjs
      .unix(Number(startEpochRaw))
      .tz("Asia/Kolkata")
      .format("D MMM YYYY, h:mm a");
  }
  if (scheduled) {
    lines.push({ label: "Scheduled", value: scheduled });
  }

  const durationRaw = meta.duration_minutes ?? meta.durationMinutes;
  if (durationRaw != null && Number(durationRaw) > 0) {
    lines.push({
      label: "Duration",
      value: `${String(durationRaw)} min`,
    });
  }

  const address =
    meta.address != null && String(meta.address).trim()
      ? String(meta.address).trim()
      : "";
  if (address) {
    lines.push({ label: "Location", value: address });
  }

  const refundAmount =
    meta.refund_amount_inr ??
    meta.refundAmountInr ??
    meta.total_amount ??
    meta.totalAmount ??
    meta.base_amount ??
    meta.baseAmount;
  if (refundAmount != null && Number.isFinite(Number(refundAmount))) {
    lines.push({
      label: "Refund amount",
      value: `₹${Number(refundAmount)}`,
    });
  }

  return lines;
}

type Props = {
  metadata: unknown;
  /** Tighter spacing for list cards */
  compact?: boolean;
};

export function NotificationBookingSummary({ metadata, compact = false }: Props) {
  const lines = notificationBookingLines(metadata);
  if (!lines.length) return null;

  return (
    <Stack
      gap={compact ? 0.25 : 0.5}
      sx={{
        width: "100%",
        mt: compact ? 0.5 : 1,
        p: compact ? 1 : 1.25,
        borderRadius: 1.5,
        bgcolor: "action.hover",
        border: 1,
        borderColor: "divider",
      }}
    >
      {lines.map((line) => (
        <Typography
          key={line.label}
          variant={compact ? "body2" : "body2"}
          color="text.secondary"
          lineHeight={1.45}
        >
          <strong className="font-semibold text-slate-700">{line.label}:</strong>{" "}
          {line.value}
        </Typography>
      ))}
    </Stack>
  );
}
