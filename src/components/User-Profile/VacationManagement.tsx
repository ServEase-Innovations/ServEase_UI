/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
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
import { coalesceEndEpoch, coalesceStartEpoch } from "src/services/bookingEpoch";
import { countInclusiveDays, toCalendarDay } from "src/utils/inclusiveDayCount";

interface VacationBooking {
  id: number;
  startDate?: string;
  endDate?: string;
  start_epoch?: number | null;
  end_epoch?: number | null;
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
  onSuccess: () => void;
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
  const today = dayjs().startOf("day");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [minDate, setMinDate] = useState<Dayjs | null>(null);
  const [maxDate, setMaxDate] = useState<Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const isValidVacationPeriod = (): boolean => {
    if (!startDate || !endDate || !minDate || !maxDate) return false;
    if (startDate.isBefore(minDate, "day") || endDate.isAfter(maxDate, "day")) return false;
    return totalDays >= MIN_VACATION_DAYS;
  };

  useEffect(() => {
    if (!open || !booking) return;

    const effectiveMin =
      bookingStart && bookingStart.isBefore(today) ? today : bookingStart ?? today;

    setMinDate(effectiveMin);
    setMaxDate(bookingEnd ?? null);

    if (booking.vacation?.start_date && booking.vacation?.end_date) {
      setStartDate(toCalendarDay(booking.vacation.start_date));
      setEndDate(toCalendarDay(booking.vacation.end_date));
    } else {
      setStartDate(null);
      setEndDate(null);
    }

    setError(null);
    setSuccess(null);
  }, [open, booking, bookingStart, bookingEnd, today]);

  const handleRangeChange = (start: Date, end?: Date) => {
    setStartDate(toCalendarDay(start));
    setEndDate(end ? toCalendarDay(end) : null);
    setError(null);
  };

  const handleUpdateVacation = async () => {
    if (!startDate || !endDate || !booking) {
      setError(t("selectBothDates"));
      return;
    }

    if (startDate.isBefore(today, "day")) {
      setError(t("startDateCannotBePast"));
      return;
    }

    if (endDate.isBefore(startDate, "day")) {
      setError(t("endDateMustBeAfterStart"));
      return;
    }

    if (!isValidVacationPeriod()) {
      setError(t("minimumVacationDays"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        vacation_start_date: startDate.format("YYYY-MM-DD"),
        vacation_end_date: endDate.format("YYYY-MM-DD"),
        modified_by_id: customerId,
        modified_by_role: "CUSTOMER",
      };

      await PaymentInstance.put(`/api/engagements/${booking.id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setSuccess(t("vacationUpdated"));
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating vacation:", err);
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      setError(apiMessage || t("updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelVacation = async () => {
    if (!booking) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        cancel_vacation: true,
        modified_by_id: customerId,
        modified_by_role: "CUSTOMER",
      };

      await PaymentInstance.put(`/api/engagements/${booking.id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setSuccess(t("vacationCancelled"));
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error canceling vacation:", err);
      setError(t("cancelFailed"));
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
        title={t("modifyVacation")}
        icon={CalendarDays}
        onClose={onClose}
        closeDisabled={isLoading}
      />

      <DialogContent dividers sx={{ px: 3, py: 3 }}>
        {booking?.vacation ? (
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
            {t("updateVacationDates")}
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
                  minDate={minDate.toDate()}
                  maxDate={maxDate.toDate()}
                  value={{
                    startDate: startDate?.toDate(),
                    endDate: endDate?.toDate(),
                  }}
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
            <br />• {t("penaltyMessage")}
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions className={`${dialogActionsClassName} sm:!justify-between`}>
        <Button
          onClick={handleCancelVacation}
          variant="destructiveOutline"
          disabled={isLoading}
          className="sm:min-w-[140px]"
        >
          {t("cancelVacation")}
        </Button>
        <Button
          onClick={handleUpdateVacation}
          variant="dialogPrimary"
          disabled={isLoading || !startDate || !endDate || !isValidVacationPeriod()}
          loading={isLoading}
          className="sm:min-w-[160px]"
        >
          {t("updateVacation")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VacationManagementDialog;
