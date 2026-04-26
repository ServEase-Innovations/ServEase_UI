import React, { useEffect, useMemo } from "react";
import { Box, Button, Dialog, DialogContent, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Bell, CheckCircle, Clock, MapPin, XCircle, Sparkles } from "lucide-react";

/** Payload from Socket.IO `new-engagement` (see payments `createEngagements.js`). */
export interface NewBookingRequestPayload {
  engagement_id: number;
  service_type: string;
  booking_type?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  base_amount: number;
  address?: string | null;
  /** Straight-line distance (m) from this provider to the customer's service location. */
  distance_meters?: number;
}

function formatDateLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDistanceMetersLine(m?: number): string | null {
  if (m == null || !Number.isFinite(m) || m < 0) return null;
  if (m < 1000) return `About ${Math.round(m)} m from you`;
  return `About ${(m / 1000).toFixed(1)} km from you`;
}

function timeRange(eng: NewBookingRequestPayload): string {
  if (eng.end_time) {
    return `${eng.start_time} – ${eng.end_time}`;
  }
  if (eng.duration_minutes) {
    return `${eng.start_time} · ${eng.duration_minutes} min slot`;
  }
  return eng.start_time;
}

export type OndemandBookingRequestPanelProps = {
  engagement: NewBookingRequestPayload;
  onAccept: (engagementId: number) => void;
  onReject: (engagementId: number) => void;
  footerHelperText?: string | null;
  actionBusy?: boolean;
  errorText?: string | null;
  /** Renders an extra line in the header (e.g. engagement #). */
  headerCaption?: string | null;
};

/**
 * Same “new on-demand booking” layout as the live toast (schedule, distance, amount) + Accept / Decline.
 * Use from the notification center inside a [nested] `Dialog` as well as the socket-driven toast.
 */
export function OndemandBookingRequestPanel({
  engagement,
  onAccept,
  onReject,
  footerHelperText = null,
  actionBusy = false,
  errorText = null,
  headerCaption = null,
}: OndemandBookingRequestPanelProps) {
  const distanceLine = useMemo(
    () => formatDistanceMetersLine(engagement.distance_meters),
    [engagement.distance_meters]
  );
  const scheduleLine = timeRange(engagement);

  const typeLabel = engagement.service_type
    ? engagement.service_type.replace(/_/g, " ")
    : "Service";
  const bookLabel = engagement.booking_type
    ? engagement.booking_type.replace(/_/g, " ")
    : "Booking";

  return (
    <>
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
              theme.palette.primary.dark,
              0.95
            )} 100%)`,
          color: "primary.contrastText",
          px: 2.5,
          py: 2,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
          <Sparkles className="h-5 w-5 opacity-95" aria-hidden />
          <Typography
            component="h2"
            className="text-center font-semibold"
            sx={{ fontSize: "1.1rem", letterSpacing: 0.2 }}
          >
            New booking request
          </Typography>
          <Bell className="h-5 w-5 opacity-95" aria-hidden />
        </Stack>
        {headerCaption ? (
          <Typography variant="body2" sx={{ opacity: 0.95, textAlign: "center", mt: 0.5, fontSize: 12 }}>
            {headerCaption}
          </Typography>
        ) : null}
        <Typography variant="body2" sx={{ opacity: 0.9, textAlign: "center", mt: headerCaption ? 0.25 : 0.5, fontSize: 13 }}>
          A customer nearby is requesting your service
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3, pb: 1.5, px: 2.5 }}>
        <Stack spacing={2.25}>
          {errorText ? (
            <Box
              sx={(theme) => ({
                p: 1.25,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: "error.dark",
                fontSize: 14,
              })}
            >
              {errorText}
            </Box>
          ) : null}
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            useFlexGap
            justifyContent="center"
            sx={{ mb: 0.5 }}
          >
            <Box
              component="span"
              className="rounded-full px-2.5 py-0.5"
              sx={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "capitalize",
                backgroundColor: (theme) => alpha(theme.palette.info.main, 0.12),
                color: "info.dark",
              }}
            >
              {bookLabel}
            </Box>
            <Box
              component="span"
              className="rounded-full px-2.5 py-0.5"
              sx={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "capitalize",
                backgroundColor: (theme) => alpha(theme.palette.success.main, 0.12),
                color: "success.dark",
              }}
            >
              {typeLabel}
            </Box>
          </Stack>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
              border: 1,
              borderColor: "divider",
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="flex-start" gap={1.25}>
                <Clock
                  className="mt-0.5 h-[18px] w-[18px] shrink-0"
                  style={{ color: "var(--mui-palette-text-secondary, #64748b)" }}
                  strokeWidth={2}
                  aria-hidden
                />
                <div>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                    Schedule
                  </Typography>
                  <Typography variant="body1" color="text.primary" fontWeight={500}>
                    {formatDateLabel(engagement.start_date)} · {scheduleLine}
                  </Typography>
                </div>
              </Stack>

              {distanceLine && (
                <Stack direction="row" alignItems="flex-start" gap={1.25}>
                  <MapPin
                    className="mt-0.5 h-[18px] w-[18px] shrink-0"
                    style={{ color: "var(--mui-palette-text-secondary, #64748b)" }}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <div>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                      Distance
                    </Typography>
                    <Typography variant="body1" color="text.primary" fontWeight={500}>
                      {distanceLine}
                    </Typography>
                    {engagement.address && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {engagement.address}
                      </Typography>
                    )}
                  </div>
                </Stack>
              )}

              {!distanceLine && engagement.address && (
                <Stack direction="row" alignItems="flex-start" gap={1.25}>
                  <MapPin
                    className="mt-0.5 h-[18px] w-[18px] shrink-0"
                    style={{ color: "var(--mui-palette-text-secondary, #64748b)" }}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <div>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                      Location
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {engagement.address}
                    </Typography>
                  </div>
                </Stack>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  pt: 0.5,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Est. service amount
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  ₹{Number(engagement.base_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5 }}>
        <Stack direction="row" gap={1.5} justifyContent="stretch" sx={{ "& .MuiButton-root": { flex: 1 } }}>
          <Button
            type="button"
            fullWidth
            size="large"
            variant="outlined"
            color="error"
            disabled={actionBusy}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReject(engagement.engagement_id);
            }}
            startIcon={<XCircle className="h-4 w-4" strokeWidth={2.4} aria-hidden />}
          >
            Decline
          </Button>
          <Button
            type="button"
            fullWidth
            size="large"
            variant="contained"
            color="success"
            disabled={actionBusy}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAccept(engagement.engagement_id);
            }}
            startIcon={<CheckCircle className="h-4 w-4" strokeWidth={2.4} aria-hidden />}
            sx={{ boxShadow: 2 }}
          >
            Accept
          </Button>
        </Stack>
        {footerHelperText != null && footerHelperText.length > 0 && (
          <Typography variant="caption" color="text.disabled" textAlign="center" display="block" sx={{ mt: 1.5 }}>
            {footerHelperText}
          </Typography>
        )}
      </Box>
    </>
  );
}

interface BookingRequestToastProps {
  engagement: NewBookingRequestPayload;
  onAccept: (engagementId: number) => void;
  onReject: (engagementId: number) => void;
  onClose: () => void;
}

export default function BookingRequestToast({
  engagement,
  onAccept: onAcceptFromParent,
  onReject: onRejectFromParent,
  onClose,
}: BookingRequestToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 60_000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      keepMounted={false}
      slotProps={{
        paper: {
          className: "relative w-[calc(100%-1.5rem)] max-w-md overflow-hidden rounded-2xl m-0 sm:mx-4",
          elevation: 0,
          sx: {
            background: (theme) =>
              `linear-gradient(180deg, ${alpha(
                theme.palette.primary.main,
                0.06
              )} 0%, ${theme.palette.background.paper} 32%)`,
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: 1,
            borderColor: "divider",
          },
        },
        backdrop: {
          className: "bg-slate-900/50 backdrop-blur-sm",
        },
      }}
    >
      <OndemandBookingRequestPanel
        engagement={engagement}
        onAccept={(id) => {
          onAcceptFromParent(id);
          onClose();
        }}
        onReject={(id) => {
          onRejectFromParent(id);
          onClose();
        }}
        footerHelperText="This request closes in 60 seconds if you take no action."
      />
    </Dialog>
  );
}
