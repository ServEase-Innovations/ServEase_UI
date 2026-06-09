/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import { CalendarDays, CalendarRange, Info } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { Button, dialogActionsClassName } from "../Button/button";
import ConfirmationDialog from "./ConfirmationDialog";
import ProfileDialogHeader from "./ProfileDialogHeader";
import DribbbleDateTimePicker from "../Common/DribbbleDateTimePicker";
import { getServiceTitle } from "../Common/Booking/BookingUtils";
import { coalesceEndEpoch, coalesceStartEpoch } from "src/services/bookingEpoch";
import { useLanguage } from "src/context/LanguageContext";
import { countInclusiveDays, toCalendarDay } from "src/utils/inclusiveDayCount";

interface Booking {
  id: number;
  service_type: string;
  startDate: string;
  endDate: string;
  bookingType: string;
  start_epoch?: number | null;
  end_epoch?: number | null;
}

interface UserHolidayProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onLeaveSubmit: (startDate: string, endDate: string, service_type: string) => Promise<void>;
}

const MIN_VACATION_DAYS = 10;

const pickerShellSx = {
  width: "100%",
  maxWidth: 380,
  mx: "auto",
  p: { xs: 1, sm: 1.5, md: 2 },
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
};

const UserHoliday: React.FC<UserHolidayProps> = ({
  open,
  onClose,
  booking,
  onLeaveSubmit,
}) => {
  const { t } = useLanguage();
  const [leaveStartDate, setLeaveStartDate] = useState<Dayjs | null>(null);
  const [leaveEndDate, setLeaveEndDate] = useState<Dayjs | null>(null);
  const [minDate, setMinDate] = useState<Dayjs | undefined>();
  const [maxDate, setMaxDate] = useState<Dayjs | undefined>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const bookingStartEpoch = coalesceStartEpoch(booking?.start_epoch, booking?.startDate);
  const bookingEndEpoch = coalesceEndEpoch(booking?.end_epoch, booking?.endDate);

  const bookingStart = useMemo(() => {
    if (bookingStartEpoch != null) return dayjs.unix(bookingStartEpoch).startOf("day");
    return booking?.startDate ? toCalendarDay(booking.startDate) : null;
  }, [booking?.startDate, bookingStartEpoch]);

  const bookingEnd = useMemo(() => {
    if (bookingEndEpoch != null) return dayjs.unix(bookingEndEpoch).startOf("day");
    return booking?.endDate ? toCalendarDay(booking.endDate) : null;
  }, [booking?.endDate, bookingEndEpoch]);

  useEffect(() => {
    if (!open) {
      setShowConfirmation(false);
      setFormError(null);
      return;
    }
    if (!booking) return;

    const startEpoch = coalesceStartEpoch(booking.start_epoch, booking.startDate);
    const endEpoch = coalesceEndEpoch(booking.end_epoch, booking.endDate);
    const start =
      startEpoch != null
        ? dayjs.unix(startEpoch).startOf("day")
        : toCalendarDay(booking.startDate)!;
    const end =
      endEpoch != null
        ? dayjs.unix(endEpoch).startOf("day")
        : toCalendarDay(booking.endDate)!;

    const today = dayjs().startOf("day");
    const effectiveMin = start.isBefore(today) ? today : start;

    setMinDate(effectiveMin);
    setMaxDate(end);
    setLeaveStartDate(null);
    setLeaveEndDate(null);
    setFormError(null);
  }, [booking, open]);

  const totalDays =
    leaveStartDate && leaveEndDate
      ? countInclusiveDays(leaveStartDate, leaveEndDate)
      : 0;

  const earliestEndDate = leaveStartDate
    ? leaveStartDate.add(MIN_VACATION_DAYS - 1, "day")
    : null;

  const isWithinBookingPeriod = Boolean(
    leaveStartDate &&
      leaveEndDate &&
      minDate &&
      maxDate &&
      !leaveStartDate.isBefore(minDate, "day") &&
      !leaveEndDate.isAfter(maxDate, "day")
  );

  const isValidVacationPeriod = totalDays >= MIN_VACATION_DAYS && isWithinBookingPeriod;

  const handleRangeChange = (start: Date, end?: Date) => {
    const startDay = toCalendarDay(start);
    setLeaveStartDate(startDay);
    setLeaveEndDate(end ? toCalendarDay(end) : null);
    setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!leaveStartDate || !leaveEndDate || !booking?.service_type) {
      setFormError(t("selectBothDates"));
      return false;
    }
    if (leaveStartDate.isBefore(dayjs().startOf("day"))) {
      setFormError(t("startDateCannotBePast"));
      return false;
    }
    if (leaveEndDate.isBefore(leaveStartDate, "day")) {
      setFormError(t("endDateMustBeAfterStart"));
      return false;
    }
    if (!isWithinBookingPeriod) {
      setFormError(
        t("vacationDatesWithinBooking") ||
          "Vacation dates must fall within your active booking period."
      );
      return false;
    }
    if (totalDays < MIN_VACATION_DAYS) {
      setFormError(t("minimumVacationDays"));
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!leaveStartDate || !leaveEndDate || !booking?.service_type) return;

    setIsSubmitting(true);
    try {
      await onLeaveSubmit(
        leaveStartDate.format("YYYY-MM-DD"),
        leaveEndDate.format("YYYY-MM-DD"),
        booking.service_type
      );
      setSnackbarOpen(true);
      setShowConfirmation(false);
      onClose();
    } catch (error: any) {
      console.error("Error submitting leave:", error);
      const apiMessage =
        error?.response?.data?.error || error?.response?.data?.message;
      setFormError(apiMessage || t("updateFailed") || "Failed to submit leave application. Please try again.");
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            m: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        <ProfileDialogHeader
          subtitle={t("leaveRequestSubtitle") || "Leave request"}
          title={t("applyVacationHoliday") || "Apply vacation / holiday"}
          icon={CalendarDays}
          onClose={onClose}
          closeDisabled={isSubmitting}
        />

        <DialogContent dividers sx={{ px: 3, py: 3 }}>
          {booking && bookingStart && bookingEnd ? (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                bgcolor: "rgba(14, 165, 233, 0.08)",
                border: "1px solid",
                borderColor: "info.main",
                borderRadius: 2,
              }}
            >
              <Box className="flex items-center gap-2 mb-2">
                <CalendarRange className="h-5 w-5 text-sky-600" aria-hidden />
                <Typography variant="subtitle1" fontWeight={600} color="info.dark">
                  {t("bookedPeriod") || "Your booking"}
                </Typography>
              </Box>
              <Box className="flex flex-wrap gap-2 items-center mb-2">
                <Chip label={`#${booking.id}`} size="small" variant="outlined" color="info" />
                <Chip
                  label={getServiceTitle(booking.service_type)}
                  size="small"
                  color="info"
                />
                <Chip label={booking.bookingType} size="small" variant="outlined" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {bookingStart.format("MMM D, YYYY")} {t("to")}{" "}
                {bookingEnd.format("MMM D, YYYY")}
              </Typography>
            </Paper>
          ) : null}

          {formError ? (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} role="alert">
              {formError}
            </Alert>
          ) : null}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, color: "text.primary" }}>
              {t("selectVacationDates") || "Select vacation dates"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {t("minimumVacationNote")}{" "}
              {earliestEndDate && leaveStartDate ? (
                <strong>{earliestEndDate.format("MMM D, YYYY")}</strong>
              ) : (
                <strong>{MIN_VACATION_DAYS} {t("days")}</strong>
              )}
            </Typography>

            {minDate && maxDate ? (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
                <Box sx={pickerShellSx}>
                  <DribbbleDateTimePicker
                    mode="range"
                    hideTimeSelection
                    minRangeDays={MIN_VACATION_DAYS}
                    minDate={minDate.toDate()}
                    maxDate={maxDate.toDate()}
                    value={{
                      startDate: leaveStartDate?.toDate(),
                      endDate: leaveEndDate?.toDate(),
                    }}
                    onDateChange={({ startDate, endDate }) => {
                      handleRangeChange(startDate, endDate);
                    }}
                    onChange={({ startDate, endDate }) => {
                      handleRangeChange(startDate, endDate);
                    }}
                  />
                </Box>
              </Box>
            ) : null}

            {leaveStartDate ? (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                  <strong>{t("dateInformation")}:</strong>
                </Typography>
                <Box className="flex flex-wrap gap-x-4 gap-y-1">
                  <Typography variant="body2">
                    {t("start")}:{" "}
                    <strong>{leaveStartDate.format("MMM D, YYYY")}</strong>
                  </Typography>
                  {leaveEndDate ? (
                    <Typography variant="body2">
                      {t("end")}: <strong>{leaveEndDate.format("MMM D, YYYY")}</strong>
                    </Typography>
                  ) : null}
                  {totalDays > 0 ? (
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={totalDays >= MIN_VACATION_DAYS ? "primary.main" : "error.main"}
                    >
                      {t("totalDays")}: {totalDays}
                      {totalDays < MIN_VACATION_DAYS
                        ? ` (${t("minimumDaysRequired")})`
                        : ""}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            ) : null}
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "background.default",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" aria-hidden />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  {t("vacationPolicy")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  • {t("minimumVacationPeriod")}: <strong>10 {t("days")}</strong>
                  <br />• {t("vacationPauseMessage")}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </DialogContent>

        <DialogActions className={dialogActionsClassName}>
          <Button variant="dialogCancel" onClick={onClose} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button
            variant="dialogPrimary"
            onClick={handleSubmit}
            disabled={isSubmitting || !leaveStartDate || !leaveEndDate || !isValidVacationPeriod}
          >
            {t("continueLabel")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        title={t("confirmVacationApplication") || "Confirm vacation application"}
        message={
          t("confirmVacationMessage", {
            start: leaveStartDate?.format("MMMM D, YYYY") ?? "",
            end: leaveEndDate?.format("MMMM D, YYYY") ?? "",
            service: getServiceTitle(booking?.service_type || ""),
            days: String(totalDays),
          }) ||
          `Apply vacation from ${leaveStartDate?.format("MMMM D, YYYY")} to ${leaveEndDate?.format("MMMM D, YYYY")} (${totalDays} days) for your ${getServiceTitle(booking?.service_type || "")} booking?`
        }
        confirmText={t("yesApply") || "Yes, apply"}
        cancelText={t("cancel")}
        loading={isSubmitting}
        severity="info"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)} variant="filled">
          {t("vacationSubmittedSuccess") ||
            "Vacation application submitted successfully!"}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserHoliday;
