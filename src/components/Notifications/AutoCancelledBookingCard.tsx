import React, { useMemo } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CalendarClock,
  Clock,
  IndianRupee,
  MapPin,
  Sparkles,
  UserX,
} from "lucide-react";
import {
  asMetaRecord,
  notificationBookingLines,
  type NotificationBookingLine,
} from "./notificationBookingSummary";

function formatLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export type AutoCancelledBookingCardProps = {
  metadata: unknown;
  engagementId?: string | number | null;
  /** List row vs detail dialog */
  variant?: "compact" | "expanded";
};

function pickLine(lines: NotificationBookingLine[], label: string): string | null {
  const row = lines.find((l) => l.label === label);
  return row?.value ?? null;
}

export function AutoCancelledBookingCard({
  metadata,
  engagementId = null,
  variant = "compact",
}: AutoCancelledBookingCardProps) {
  const meta = asMetaRecord(metadata);
  const lines = notificationBookingLines(metadata);

  const service = pickLine(lines, "Service");
  const bookingType = pickLine(lines, "Booking type");
  const scheduled = pickLine(lines, "Scheduled");
  const duration = pickLine(lines, "Duration");
  const location = pickLine(lines, "Location");
  const refund = pickLine(lines, "Refund amount");

  const headline = useMemo(() => {
    if (service && scheduled) return `${service} · ${scheduled}`;
    if (service) return service;
    if (scheduled) return scheduled;
    return "On-demand booking";
  }, [service, scheduled]);

  const bookingRef =
    engagementId != null && String(engagementId).trim() !== ""
      ? `#${String(engagementId)}`
      : null;

  const isExpanded = variant === "expanded";

  return (
    <Stack
      gap={1.25}
      sx={{
        width: "100%",
        mt: isExpanded ? 0 : 0.75,
        p: isExpanded ? 0 : 1.25,
        borderRadius: 2,
        ...(isExpanded
          ? {}
          : {
              bgcolor: (th) => alpha(th.palette.error.main, 0.04),
              border: 1,
              borderColor: (th) => alpha(th.palette.error.main, 0.18),
            }),
      }}
    >
      <Stack direction="row" alignItems="flex-start" gap={1.25}>
        <Box
          sx={{
            mt: 0.25,
            p: 0.75,
            borderRadius: 1.5,
            bgcolor: (th) => alpha(th.palette.error.main, 0.12),
            color: "error.main",
            display: "inline-flex",
          }}
        >
          <UserX size={18} strokeWidth={2.2} aria-hidden />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant={isExpanded ? "h6" : "subtitle2"}
            fontWeight={800}
            color="text.primary"
            lineHeight={1.35}
          >
            No provider was available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.5 }}>
            {headline}
            {bookingRef ? (
              <Typography component="span" variant="body2" color="text.disabled" sx={{ ml: 0.75 }}>
                · Booking {bookingRef}
              </Typography>
            ) : null}
          </Typography>
        </Box>
      </Stack>

      <Typography
        variant="body2"
        color="text.secondary"
        lineHeight={1.55}
        sx={{
          pl: isExpanded ? 0 : 0.25,
          ...(isExpanded ? { fontSize: "0.95rem" } : {}),
        }}
      >
        We could not assign anyone before your scheduled start time, so this booking was cancelled
        automatically. You have not been charged for an unfulfilled visit.
      </Typography>

      <Box
        sx={{
          borderRadius: 1.75,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={0.75}
          sx={{
            px: 1.5,
            py: 1,
            bgcolor: (th) => alpha(th.palette.primary.main, 0.06),
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Sparkles size={15} className="text-sky-600" aria-hidden />
          <Typography variant="caption" fontWeight={700} letterSpacing={0.4} color="text.secondary">
            BOOKING DETAILS
          </Typography>
        </Stack>

        <Stack gap={1.1} sx={{ px: 1.5, py: 1.25 }}>
          {(service || bookingType) && (
            <DetailRow
              icon={<Sparkles size={16} strokeWidth={2} />}
              label="Service"
              value={[service, bookingType].filter(Boolean).join(" · ")}
            />
          )}
          {scheduled && (
            <DetailRow
              icon={<CalendarClock size={16} strokeWidth={2} />}
              label="Scheduled"
              value={scheduled}
            />
          )}
          {duration && (
            <DetailRow icon={<Clock size={16} strokeWidth={2} />} label="Duration" value={duration} />
          )}
          {location && (
            <DetailRow icon={<MapPin size={16} strokeWidth={2} />} label="Location" value={location} />
          )}
          {!service && !scheduled && !location && lines.length === 0 && bookingRef && (
            <Typography variant="body2" color="text.secondary">
              Booking reference {bookingRef}
            </Typography>
          )}
        </Stack>
      </Box>

      {refund && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: 1.75,
            bgcolor: (th) => alpha(th.palette.success.main, 0.1),
            border: 1,
            borderColor: (th) => alpha(th.palette.success.main, 0.28),
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <IndianRupee size={18} className="text-emerald-700" strokeWidth={2.2} aria-hidden />
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="success.dark">
                Full refund · {refund}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Returning to your original payment method
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label="Refund initiated"
            sx={{
              fontWeight: 700,
              bgcolor: (th) => alpha(th.palette.success.main, 0.16),
              color: "success.dark",
            }}
          />
        </Stack>
      )}

      {meta?.cancellation_reason && isExpanded ? (
        <Typography variant="caption" color="text.disabled">
          Reason: {formatLabel(String(meta.cancellation_reason))}
        </Typography>
      ) : null}
    </Stack>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" alignItems="flex-start" gap={1}>
      <Box sx={{ color: "text.secondary", mt: 0.15, display: "inline-flex" }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" color="text.primary" lineHeight={1.45}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}
