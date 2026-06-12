/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Alert,
  Chip,
  Paper,
} from "@mui/material";
import { CalendarDays, CalendarRange } from "lucide-react";
import { Button, dialogActionsClassName } from "../Button/button";
import PaymentInstance from "src/services/paymentInstance";
import { useLanguage } from "src/context/LanguageContext";
import ProfileDialogHeader from "./ProfileDialogHeader";
import DribbbleDateTimePicker from "../Common/DribbbleDateTimePicker";
import { getServiceTitle } from "../Common/Booking/BookingUtils";
import { coalesceEndEpoch, coalesceStartEpoch } from "src/services/bookingEpoch";
import { countInclusiveDays, toCalendarDay } from "src/utils/inclusiveDayCount";
import ConfirmationDialog from "./ConfirmationDialog";

const VACATION_MODIFICATION_PENALTY = 400;

interface VacationBooking {
  id: number;
  startDate?: string;
  endDate?: string;
  start_epoch?: number | null;
  end_epoch?: number | null;
  service_type?: string;
  bookingType?: string;
  vacation?: {
    start_date?: string;
    end_date?: string;
    leave_days?: number;
  };
  hasVacation?: boolean;
}

interface VacationManagementDialogProps {
  open: boolean;
  onClose: () => void;
  booking: VacationBooking | null;
  customerId: number | null;
  onSuccess: (message?: string) => void;
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

const VacationManagementDialog: React.FC<VacationManagementDialogProps> = ({
  open,
  onClose,
  booking,
  customerId,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const today = useMemo(() => dayjs().startOf("day"), []);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [minDate, setMinDate] = useState<Dayjs | null>(null);
  const [maxDate, setMaxDate] = useState<Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const bookingStart = useMemo(() => {
    if (!booking) return null;
    const epoch = coalesceStartEpoch(booking.start_epoch, booking.startDate);
    if (epoch != null) return dayjs.unix(epoch).startOf("day");
    return booking.startDate ? toCalendarDay(booking.startDate) : null;
  }, [booking]);

  const bookingEnd = useMemo(() => {
    if (!booking) return null;
    const epoch = coalesceEndEpoch(booking.end_epoch, booking.endDate);
    if (epoch != null) return dayjs.unix(epoch).startOf("day");
    return booking.endDate ? toCalendarDay(booking.endDate) : null;
  }, [booking]);

  const totalDays =
    startDate && endDate ? countInclusiveDays(startDate, endDate) : 0;

  const earliestEndDate = startDate ? startDate.add(MIN_VACATION_DAYS - 1, "day") : null;

  const startDateKey = startDate?.format("YYYY-MM-DD") ?? "";
  const endDateKey = endDate?.format("YYYY-MM-DD") ?? "";
  const bookingId = booking?.id ?? null;
  const vacationStartKey = booking?.vacation?.start_date ?? "";
  const vacationEndKey = booking?.vacation?.end_date ?? "";
  const bookingStartKey = bookingStart?.format("YYYY-MM-DD") ?? "";
  const bookingEndKey = bookingEnd?.format("YYYY-MM-DD") ?? "";

  const pickerRangeValue = useMemo(
    () => ({
      startDate: startDate?.toDate(),
      endDate: endDate?.toDate(),
    }),
    [startDateKey, endDateKey, startDate, endDate]
  );

  const pickerMinDate = useMemo(() => minDate?.toDate(), [minDate]);
  const pickerMaxDate = useMemo(() => maxDate?.toDate(), [maxDate]);

  const isAddMode = !booking?.vacation?.start_date || !booking?.vacation?.end_date;

  const vacationDatesChanged = useMemo(() => {
    if (isAddMode || !startDate || !endDate || !vacationStartKey || !vacationEndKey) {
      return false;
    }
    const prevStart = toCalendarDay(vacationStartKey);
    const prevEnd = toCalendarDay(vacationEndKey);
    if (!prevStart || !prevEnd) return false;
    return !startDate.isSame(prevStart, "day") || !endDate.isSame(prevEnd, "day");
  }, [isAddMode, startDate, endDate, vacationStartKey, vacationEndKey]);

  const isValidVacationPeriod = (): boolean => {
    if (!startDate || !endDate || !minDate || !maxDate) return false;
    if (startDate.isBefore(minDate, "day") || endDate.isAfter(maxDate, "day")) return false;
    return totalDays >= MIN_VACATION_DAYS;
  };

  useEffect(() => {
    if (!open || bookingId == null) return;

    const startBound = bookingStartKey ? toCalendarDay(bookingStartKey) : null;
    const endBound = bookingEndKey ? toCalendarDay(bookingEndKey) : null;
    const effectiveMin =
      startBound && startBound.isBefore(today) ? today : startBound ?? today;

    setMinDate((prev) => (prev?.isSame(effectiveMin, "day") ? prev : effectiveMin));
    setMaxDate((prev) => {
      const next = endBound ?? null;
      if (prev === null && next === null) return prev;
      if (prev && next && prev.isSame(next, "day")) return prev;
      if (prev && next === null) return null;
      return next;
    });

    if (vacationStartKey && vacationEndKey) {
      const nextStart = toCalendarDay(vacationStartKey);
      const nextEnd = toCalendarDay(vacationEndKey);
      setStartDate((prev) =>
        prev && nextStart && prev.isSame(nextStart, "day") ? prev : nextStart
      );
      setEndDate((prev) =>
        prev && nextEnd && prev.isSame(nextEnd, "day") ? prev : nextEnd
      );
    } else {
      setStartDate((prev) => (prev === null ? prev : null));
      setEndDate((prev) => (prev === null ? prev : null));
    }

    setError(null);
    setSuccess(null);
    setShowConfirm(false);
  }, [
    open,
    bookingId,
    bookingStartKey,
    bookingEndKey,
    today,
    vacationEndKey,
    vacationStartKey,
  ]);

  const handleRangeChange = useCallback((start: Date, end?: Date) => {
    const nextStart = toCalendarDay(start);
    const nextEnd = end ? toCalendarDay(end) : null;
    setStartDate((prev) =>
      prev && nextStart && prev.isSame(nextStart, "day") ? prev : nextStart
    );
    setEndDate((prev) => {
      if (prev === null && nextEnd === null) return prev;
      if (prev && nextEnd && prev.isSame(nextEnd, "day")) return prev;
      return nextEnd;
    });
    setError(null);
  }, []);

  const validateVacationForm = (): boolean => {
    if (!startDate || !endDate || !booking?.id) {
      setError(t("selectBothDates"));
      return false;
    }
    if (startDate.isBefore(today, "day")) {
      setError(t("startDateCannotBePast"));
      return false;
    }
    if (endDate.isBefore(startDate, "day")) {
      setError(t("endDateMustBeAfterStart"));
      return false;
    }
    if (!isValidVacationPeriod()) {
      setError(t("minimumVacationDays"));
      return false;
    }
    setError(null);
    return true;
  };

  const submitVacation = async () => {
    if (!startDate || !endDate || !booking || !customerId) return;

    const successMessage = isAddMode
      ? t("vacationSubmittedSuccess") || "Vacation applied successfully!"
      : t("vacationUpdated");

    setIsLoading(true);
    setError(null);

    try {
      const res = await PaymentInstance.post(
        `api/v2/createEngagements/${booking.id}/vacation`,
        {
          customerid: customerId,
          vacation_start_date: startDate.format("YYYY-MM-DD"),
          vacation_end_date: endDate.format("YYYY-MM-DD"),
          leave_type: "VACATION",
          modified_by_id: customerId,
          modified_by_role: "CUSTOMER",
        }
      );

      const penalty = Number(res.data?.penalty ?? 0);
      let message = successMessage;
      if (penalty > 0) {
        message += ` A modification fee of ₹${penalty.toFixed(0)} was charged to your wallet.`;
      }

      setSuccess(message);
      setShowConfirm(false);
      setTimeout(() => {
        onSuccess(message);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error saving vacation:", err);
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      setError(apiMessage || t("updateFailed"));
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVacation = () => {
    if (!validateVacationForm() || !customerId) return;

    if (!isAddMode && vacationDatesChanged) {
      setShowConfirm(true);
      return;
    }

    void submitVacation();
  };

  const handleCancelVacation = async () => {
    if (!booking || !customerId) return;

    setIsLoading(true);
    setError(null);

    try {
      await PaymentInstance.post(
        `api/v2/createEngagements/${booking.id}/vacation/cancel`,
        {
          customerid: customerId,
          modified_by_id: customerId,
          modified_by_role: "CUSTOMER",
        }
      );

      setSuccess(t("vacationCancelled"));
      setTimeout(() => {
        onSuccess(t("vacationCancelled"));
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error canceling vacation:", err);
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      setError(apiMessage || t("cancelFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        subtitle="Vacation"
        title={
          isAddMode
            ? t("applyVacationHoliday") || "Apply vacation"
            : t("modifyVacation")
        }
        icon={CalendarDays}
        onClose={onClose}
        closeDisabled={isLoading}
      />

      <DialogContent dividers sx={{ px: 3, py: 3 }}>
        {isAddMode && booking && bookingStart && bookingEnd ? (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              bgcolor: "info.light",
              border: "1px solid",
              borderColor: "info.main",
              borderRadius: 2,
            }}
          >
            <Box className="flex items-center gap-2 mb-2">
              <CalendarRange className="h-5 w-5 text-sky-600" aria-hidden />
              <Typography variant="subtitle1" fontWeight="600" color="info.dark">
                {t("bookedPeriod") || "Your booking"}
              </Typography>
            </Box>
            <Box className="flex flex-wrap gap-2 items-center mb-2">
              <Chip label={`#${booking.id}`} size="small" variant="outlined" color="info" />
              {booking.service_type ? (
                <Chip
                  label={getServiceTitle(booking.service_type)}
                  size="small"
                  color="info"
                />
              ) : null}
              {booking.bookingType ? (
                <Chip label={booking.bookingType} size="small" variant="outlined" />
              ) : null}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {bookingStart.format("MMM D, YYYY")} {t("to")}{" "}
              {bookingEnd.format("MMM D, YYYY")}
            </Typography>
          </Paper>
        ) : null}

        {!isAddMode && booking?.vacation ? (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              bgcolor: "info.light",
              border: "1px solid",
              borderColor: "info.main",
              borderRadius: 2,
            }}
          >
            <Box className="flex items-center gap-2 mb-2">
              <CalendarRange className="h-5 w-5 text-sky-600" aria-hidden />
              <Typography variant="subtitle1" fontWeight="600" color="info.dark">
                {t("currentVacationPeriod")}
              </Typography>
            </Box>
            <Box className="flex flex-wrap gap-2 items-center">
              <Chip
                label={dayjs(booking.vacation.start_date).format("MMM D, YYYY")}
                variant="outlined"
                color="info"
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {t("to")}
              </Typography>
              <Chip
                label={dayjs(booking.vacation.end_date).format("MMM D, YYYY")}
                variant="outlined"
                color="info"
                size="small"
              />
              <Chip
                label={`${booking.vacation.leave_days} ${t("days")}`}
                color="info"
                size="small"
              />
            </Box>
          </Paper>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} role="alert">
            {error}
          </Alert>
        ) : null}
        {success ? (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        ) : null}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 1, color: "text.primary" }}>
            {isAddMode
              ? t("selectVacationDates") || "Select vacation dates"
              : t("updateVacationDates")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {t("minimumVacationNote")}{" "}
            {earliestEndDate && startDate ? (
              <strong>{earliestEndDate.format("MMM D, YYYY")}</strong>
            ) : (
              <strong>
                {MIN_VACATION_DAYS} {t("days")}
              </strong>
            )}
          </Typography>

          {minDate && maxDate ? (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Box sx={pickerShellSx}>
                <DribbbleDateTimePicker
                  mode="range"
                  hideTimeSelection
                  minRangeDays={MIN_VACATION_DAYS}
                  minDate={pickerMinDate}
                  maxDate={pickerMaxDate}
                  value={pickerRangeValue}
                  onDateChange={({ startDate: rangeStart, endDate: rangeEnd }) => {
                    handleRangeChange(rangeStart, rangeEnd);
                  }}
                  onChange={({ startDate: rangeStart, endDate: rangeEnd }) => {
                    handleRangeChange(rangeStart, rangeEnd);
                  }}
                />
              </Box>
            </Box>
          ) : null}

          {startDate ? (
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
              <Box className="flex flex-wrap gap-4">
                <Typography variant="body2">
                  {t("start")}: <strong>{startDate.format("MMM D, YYYY")}</strong>
                </Typography>
                {endDate ? (
                  <Typography variant="body2">
                    {t("end")}: <strong>{endDate.format("MMM D, YYYY")}</strong>
                  </Typography>
                ) : null}
                {totalDays > 0 ? (
                  <Typography
                    variant="body2"
                    color={totalDays >= MIN_VACATION_DAYS ? "primary.main" : "error.main"}
                    fontWeight="600"
                  >
                    {t("totalDays")}: {totalDays}{" "}
                    {totalDays < MIN_VACATION_DAYS && `(${t("minimumDaysRequired")})`}
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
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: "text.primary" }}>
            {t("vacationPolicy")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            • {t("minimumVacationPeriod")}: <strong>10 {t("days")}</strong>
            <br />• {t("vacationPauseMessage")}
            {!isAddMode ? (
              <>
                <br />•{" "}
                {t("penaltyMessage") ||
                  `Updating vacation dates incurs a ₹${VACATION_MODIFICATION_PENALTY} modification fee (debited from wallet).`}
              </>
            ) : null}
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions
        className={
          isAddMode
            ? dialogActionsClassName
            : `${dialogActionsClassName} sm:!justify-between`
        }
      >
        {isAddMode ? (
          <Button
            onClick={onClose}
            variant="dialogCancel"
            disabled={isLoading}
            className="sm:min-w-[120px]"
          >
            {t("cancel")}
          </Button>
        ) : (
          <Button
            onClick={handleCancelVacation}
            variant="destructiveOutline"
            disabled={isLoading}
            className="sm:min-w-[140px]"
          >
            {t("cancelVacation")}
          </Button>
        )}
        <Button
          onClick={handleSaveVacation}
          variant="dialogPrimary"
          disabled={isLoading || !startDate || !endDate || !isValidVacationPeriod()}
          loading={isLoading}
          className="sm:min-w-[160px]"
        >
          {isAddMode
            ? t("applyVacation") || "Apply vacation"
            : t("updateVacation")}
        </Button>
      </DialogActions>

      <ConfirmationDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => void submitVacation()}
        title={t("confirmVacationUpdate") || "Confirm vacation update"}
        message={
          t("confirmVacationUpdateMessage", {
            start: startDate?.format("MMMM D, YYYY") ?? "",
            end: endDate?.format("MMMM D, YYYY") ?? "",
            days: String(totalDays),
            fee: String(VACATION_MODIFICATION_PENALTY),
          }) ||
          `Your previous vacation will be cancelled and replaced with ${startDate?.format("MMMM D, YYYY")} to ${endDate?.format("MMMM D, YYYY")} (${totalDays} days). A ₹${VACATION_MODIFICATION_PENALTY} modification fee will be charged to your wallet, and your refund will be recalculated for the new dates.`
        }
        confirmText={t("confirmUpdate") || "Confirm update"}
        cancelText={t("cancel")}
        loading={isLoading}
        severity="warning"
      />
    </Dialog>
  );
};

export default VacationManagementDialog;
