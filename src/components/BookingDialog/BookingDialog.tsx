import { IconButton } from "src/components/Button/icon-button";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Typography,  Stack,
  SwipeableDrawer,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import CloseIcon from "@mui/icons-material/Close";
import DribbbleDateTimePicker from "../Common/DribbbleDateTimePicker";
import { useLanguage } from "src/context/LanguageContext";
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (bookingDetails: {
    option: string;
    startDate: string | null;
    endDate: string | null;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
    start_epoch: number | null;
    end_epoch: number | null;
    genderPreference?: string;
  }) => void;
  selectedOption: string;
  onOptionChange: (val: string) => void;
  startDate: string | null;
  endDate: string | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  setStartDate: (val: string | null) => void;
  setEndDate: (val: string | null) => void;
  setStartTime: (val: Dayjs | null) => void;
  setEndTime: (val: Dayjs | null) => void;
}

const WORK_START_MINUTES = 6 * 60;
const LATEST_START_MINUTES = 19 * 60;
const WORK_END_MINUTES = 20 * 60;

function isBookingStartValid(time: Dayjs): boolean {
  const mins = time.hour() * 60 + time.minute();
  return mins >= WORK_START_MINUTES && mins <= LATEST_START_MINUTES;
}

function isBookingEndValid(start: Dayjs, end: Dayjs): boolean {
  if (!end.isSame(start, "day")) return false;
  const endMins = end.hour() * 60 + end.minute();
  return endMins <= WORK_END_MINUTES;
}

// Check if a time is within allowed booking hours
const isBookingValid = (time: Dayjs | null) => {
  if (!time) return false;
  const now = dayjs();
  if (time.isBefore(now.add(30, "minute").subtract(1, 'second'))) return false;
  return isBookingStartValid(time);
};

const toEpochSeconds = (value: Dayjs | null): number | null => {
  if (!value || !value.isValid()) return null;
  return value.unix();
};

/** Max day offset from range start → 14 means 15 calendar days inclusive. */
const SHORT_TERM_MAX_SPAN_DAYS = 14;
const SHORT_TERM_WINDOW_DAYS = SHORT_TERM_MAX_SPAN_DAYS + 1;

const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onClose,
  onSave,
  selectedOption,
  onOptionChange,
  startDate,
  endDate,
  startTime,
  endTime,
  setStartDate,
  setEndDate,
  setStartTime,
  setEndTime,
}) => {
  const { t } = useLanguage();
  const [lastSelectedDate, setLastSelectedDate] = useState<Dayjs | null>(null);
  const [genderPreference, setGenderPreference] = useState<string>("No Preference");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const today = dayjs();
  const maxDate21Days = today.add(21, "day");
  const maxDate90Days = today.add(89, "day");

  useEffect(() => {
    if (!open) {
      setStartDate(null);
      setEndDate(null);
      setStartTime(null);
      setEndTime(null);
      setLastSelectedDate(null);
      setGenderPreference("No Preference");
    }
  }, [open, setStartDate, setEndDate, setStartTime, setEndTime]);

  const updateStartDate = (newValue: Dayjs | null) => {
    if (!newValue) return;
    
    // Add validation for Date option - 21 day limit
    if (selectedOption === "Date" && newValue.isAfter(maxDate21Days, "day")) {
      alert(t('dateExceedRestriction'));
      return;
    }
    
    // Add validation for Monthly option - 90 day limit
    if (selectedOption === "Monthly" && newValue.isAfter(maxDate90Days, "day")) {
      alert(t('monthlyDateExceedRestriction'));
      return;
    }
    
    let adjustedTime = newValue;
    const isDateChanged = lastSelectedDate && 
      !newValue.isSame(lastSelectedDate, 'day') && 
      newValue.isSame(lastSelectedDate, 'hour') && 
      newValue.isSame(lastSelectedDate, 'minute');
    
    if (newValue.isSame(today, 'day')) {
      const nowPlus30 = today.add(30, 'minute');
      if (newValue.isBefore(nowPlus30)) adjustedTime = nowPlus30;
      if (!isBookingStartValid(adjustedTime)) {
        const mins = adjustedTime.hour() * 60 + adjustedTime.minute();
        adjustedTime =
          mins < WORK_START_MINUTES
            ? adjustedTime.hour(6).minute(0)
            : adjustedTime.hour(19).minute(0);
      }
    } else {
      if (isDateChanged || (newValue.hour() === 0 && newValue.minute() === 0)) {
        adjustedTime = newValue.hour(6).minute(0);
      }
    }
    
    setStartDate(adjustedTime.toISOString());
    setStartTime(adjustedTime);
    setLastSelectedDate(adjustedTime);

    const defaultEndTime = adjustedTime.add(1, 'hour');
    setEndTime(defaultEndTime);
    if (selectedOption === "Date") setEndDate(defaultEndTime.toISOString());
    if (selectedOption === "Monthly") setEndDate(adjustedTime.add(1, 'month').toISOString());
  };

  const handleOptionChange = (val: string) => {
    setStartDate(null);
    setEndDate(null);
    setStartTime(null);
    setEndTime(null);
    setLastSelectedDate(null);
    onOptionChange(val);
  };

  /** Calendar date changed — time was cleared in the picker; parent must drop stale times. */
  const handleDateOnlyChange = (date: Date) => {
    const day = dayjs(date).startOf("day");
    setStartDate(day.toISOString());
    setStartTime(null);
    setEndTime(null);
    setLastSelectedDate(day);
    if (selectedOption === "Date") setEndDate(null);
    if (selectedOption === "Monthly") setEndDate(day.add(1, "month").toISOString());
  };

  const handleRangeDateOnlyChange = (payload: { startDate: Date; endDate?: Date }) => {
    const start = dayjs(payload.startDate).startOf("day");
    setStartDate(start.toISOString());
    setStartTime(null);
    setEndTime(null);
    setLastSelectedDate(start);
    if (payload.endDate) {
      let end = dayjs(payload.endDate).startOf("day");
      if (end.diff(start, "day") > SHORT_TERM_MAX_SPAN_DAYS) {
        end = start.add(SHORT_TERM_MAX_SPAN_DAYS, "day");
      }
      setEndDate(end.toISOString());
    } else {
      setEndDate(null);
    }
  };

  const renderShortTermStepGuide = () => {
    const steps = [
      { n: 1, label: "Select first service day", done: Boolean(startDate) },
      { n: 2, label: `Select last day (within ${SHORT_TERM_WINDOW_DAYS} days)`, done: Boolean(endDate) },
      { n: 3, label: "Select daily start time", done: Boolean(startTime) },
      { n: 4, label: "Set hours per day", done: Boolean(startTime && endTime) },
    ];
    const activeStep = steps.find((s) => !s.done)?.n ?? 4;

    return (
      <Box
        sx={{
          mb: 2,
          p: isMobile ? 1.25 : 1.75,
          borderRadius: 2,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.2),
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "primary.dark" }}>
          How to book (short term)
        </Typography>
        <Stack spacing={0.75}>
          {steps.map((step) => (
            <Box
              key={step.n}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                opacity: step.done ? 0.75 : 1,
              }}
            >
              <Box
                sx={{
                  minWidth: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: step.done
                    ? "success.main"
                    : step.n === activeStep
                      ? "primary.main"
                      : "grey.300",
                  color: step.done || step.n === activeStep ? "common.white" : "text.secondary",
                }}
              >
                {step.done ? "✓" : step.n}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: step.n === activeStep ? 700 : 500,
                  color: step.n === activeStep ? "text.primary" : "text.secondary",
                  fontSize: isMobile ? "0.75rem" : "0.8125rem",
                }}
              >
                {step.label}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Typography variant="caption" sx={{ display: "block", mt: 1.25, color: "text.secondary" }}>
          One time slot applies to every day in your range. Use +/− below to set how many hours per day.
        </Typography>
      </Box>
    );
  };

  const isConfirmDisabled = () => {
    switch (selectedOption) {
      case "Date": 
        if (!startDate || !startTime || !isBookingValid(startTime)) return true;
        // Check if selected date is beyond 21 days from today
        const selectedDate = dayjs(startDate);
        const maxAllowedDate = today.add(21, "day");
        if (selectedDate.isAfter(maxAllowedDate, "day")) return true;
        return false;
      case "Short term":
        if (!startDate || !endDate || !startTime || !endTime || !isBookingValid(startTime)) return true;
        return dayjs(endDate).isBefore(dayjs(startDate), "day");
      case "Monthly": 
        if (!startDate || !startTime || !isBookingValid(startTime)) return true;
        // Check 90-day limit for monthly
        const monthlySelectedDate = dayjs(startDate);
        const maxMonthlyDate = today.add(89, "day");
        if (monthlySelectedDate.isAfter(maxMonthlyDate, "day")) return true;
        return false;
      default: 
        return true;
    }
  };

  // Duration control (without booking details)
  const renderDurationControl = () => {
    const hasStartTime = !!startTime;
    const currentDuration = (hasStartTime && endTime) ? endTime.diff(startTime, 'hour') : 1;
    
    const canIncreaseDuration = () => {
      if (!hasStartTime) return false;
      const newEndTime = startTime!.add(currentDuration + 1, 'hour');
      return isBookingEndValid(startTime!, newEndTime);
    };
    const canDecreaseDuration = () => {
      return hasStartTime && currentDuration > 1;
    };

    const handleIncreaseDuration = () => {
      if (!hasStartTime) return;
      const newEndTime = startTime!.add(currentDuration + 1, 'hour');
      if (!isBookingEndValid(startTime!, newEndTime)) return;
      setEndTime(newEndTime);
      if (selectedOption === "Date") setEndDate(newEndTime.toISOString());
    };

    const handleDecreaseDuration = () => {
      if (!hasStartTime) return;
      if (currentDuration > 1) {
        const newEndTime = startTime!.add(currentDuration - 1, 'hour');
        setEndTime(newEndTime);
        if (selectedOption === "Date") setEndDate(newEndTime.toISOString());
      }
    };

    return (
      <Box
        sx={{
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
          p: isMobile ? 1.5 : 2.5,
        }}
      >
        <Typography
          variant={isMobile ? "subtitle2" : "subtitle1"}
          sx={{ fontWeight: 700, letterSpacing: "-0.01em", color: "text.primary", mb: 0.5 }}
        >
          {t("serviceDuration")}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ 
            color: "text.secondary", 
            mb: 2, 
            lineHeight: 1.5,
            fontSize: isMobile ? "0.75rem" : "0.875rem"
          }}
        >
          {selectedOption === "Short term"
            ? "This duration applies to each day of service"
            : selectedOption === "Monthly"
              ? "This duration applies to each day of your monthly subscription"
              : t("durationMessage")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            p: isMobile ? 1 : 1.5,
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={handleDecreaseDuration}
            disabled={!canDecreaseDuration()}
            sx={{
              minWidth: isMobile ? 36 : 44,
              height: isMobile ? 36 : 44,
              borderRadius: 2,
              fontSize: "1.25rem",
              fontWeight: 600,
              borderColor: "divider",
            }}
          >
            −
          </Button>

          <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                fontWeight: 700, 
                letterSpacing: "-0.02em", 
                color: "primary.dark",
                fontSize: isMobile ? "1.25rem" : "1.5rem"
              }}
            >
              {currentDuration} {t("hourUnit")}
              {currentDuration > 1 ? "s" : ""}
            </Typography>
            {hasStartTime && endTime && (
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                {t("until")} {endTime.format("h:mm A")}
              </Typography>
            )}
            {!hasStartTime && (
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                {t("selectStartTimeToAdjust")}
              </Typography>
            )}
          </Box>

          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={handleIncreaseDuration}
            disabled={!canIncreaseDuration()}
            sx={{
              minWidth: isMobile ? 36 : 44,
              height: isMobile ? 36 : 44,
              borderRadius: 2,
              fontSize: "1.25rem",
              fontWeight: 600,
              borderColor: "divider",
            }}
          >
            +
          </Button>
        </Box>
      </Box>
    );
  };

  // Booking details section (rendered below the date/time picker)
  const renderBookingDetails = () => {
    if (selectedOption === "Short term") {
      if (!startDate) return null;
    } else if (!startTime) {
      return null;
    }

    return (
      <Box
        sx={{
          mt: 2,
          p: isMobile ? 1.5 : 2.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderLeft: "4px solid",
          borderLeftColor: "primary.main",
        }}
      >
        <Typography 
          variant={isMobile ? "subtitle2" : "subtitle1"} 
          sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}
        >
          {t("bookingDetails")}
        </Typography>

        <Stack spacing={1.25}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "text.secondary",
              fontSize: isMobile ? "0.75rem" : "0.875rem"
            }}
          >
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              {t("startDate")}:{" "}
            </Box>
            {startDate ? dayjs(startDate).format("MMMM D, YYYY") : t("notSelected")}
          </Typography>

          {selectedOption === "Monthly" && endDate && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontSize: isMobile ? "0.75rem" : "0.875rem"
              }}
            >
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {t("endDate")}:{" "}
              </Box>
              {dayjs(endDate).format("MMMM D, YYYY")} (1 month later)
            </Typography>
          )}

          {selectedOption === "Short term" && endDate && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontSize: isMobile ? "0.75rem" : "0.875rem"
              }}
            >
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {t("endDate")}:{" "}
              </Box>
              {dayjs(endDate).format("MMMM D, YYYY")}
            </Typography>
          )}

          {startTime ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              }}
            >
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {t("startTime")}:{" "}
              </Box>
              {startTime.format("h:mm A")}
            </Typography>
          ) : selectedOption === "Short term" ? (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              Daily start time: not selected yet
            </Typography>
          ) : null}

          {endTime && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontSize: isMobile ? "0.75rem" : "0.875rem"
              }}
            >
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {t("endTime")}:{" "}
              </Box>
              {endTime.format("h:mm A")}
            </Typography>
          )}

          {selectedOption === "Short term" && endDate && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 0.5, 
                color: "primary.dark", 
                lineHeight: 1.55, 
                fontSize: isMobile ? "0.7rem" : "0.8125rem"
              }}
            >
              Service will run from {dayjs(startDate).format("MMMM D")} to {dayjs(endDate).format("MMMM D, YYYY")}, daily
              from {startTime?.format("h:mm A")} to {endTime?.format("h:mm A")}
            </Typography>
          )}

          {selectedOption === "Monthly" && endDate && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 0.5, 
                color: "primary.dark", 
                lineHeight: 1.55, 
                fontSize: isMobile ? "0.7rem" : "0.8125rem"
              }}
            >
              Monthly subscription from {dayjs(startDate).format("MMMM D, YYYY")} to{" "}
              {dayjs(endDate).format("MMMM D, YYYY")}
            </Typography>
          )}

          {selectedOption === "Date" && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 0.5, 
                color: "primary.dark", 
                lineHeight: 1.55, 
                fontSize: isMobile ? "0.7rem" : "0.8125rem"
              }}
            >
              {t("serviceStartMessage", {
                date: startDate ? dayjs(startDate).format("MMMM D, YYYY") : "___",
                time: startTime ? startTime.format("h:mm A") : "___",
              })}
            </Typography>
          )}
        </Stack>
      </Box>
    );
  };

  // Render Gender Preference Selector (Only for Date/One-time bookings)
  const renderGenderPreference = () => {
    const genderOptions = [
      { value: "Male", label: "Male", icon: "👨" },
      { value: "Female", label: "Female", icon: "👩" },
      { value: "No Preference", label: "No Preference", icon: "👥" },
    ];

    return (
      <Box
        sx={{
          mb: 2,
          p: isMobile ? 1.5 : 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Typography
          variant={isMobile ? "subtitle2" : "subtitle1"}
          sx={{ fontWeight: 700, mb: 0.5, color: "text.primary", display: "flex", alignItems: "center", gap: 0.75 }}
        >
          <span style={{ fontSize: "1.1em" }}>👤</span>
          Provider Gender Preference
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: "text.secondary", 
            mb: 2, 
            fontSize: isMobile ? "0.75rem" : "0.875rem" 
          }}
        >
          Select your preferred provider gender (optional)
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? 1 : 1.5,
          }}
        >
          {genderOptions.map((option) => {
            const isSelected = genderPreference === option.value;
            return (
              <Button
                key={option.value}
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => setGenderPreference(option.value)}
                sx={{
                  py: isMobile ? 1.25 : 1.5,
                  px: isMobile ? 1.5 : 2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.875rem" : "0.9375rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  alignItems: "center",
                  justifyContent: "center",
                  border: isSelected ? "2px solid" : "2px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: isSelected ? "primary.main" : "background.paper",
                  color: isSelected ? "primary.contrastText" : "text.primary",
                  boxShadow: isSelected ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}` : "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: isSelected ? "primary.dark" : alpha(theme.palette.primary.main, 0.04),
                    borderColor: isSelected ? "primary.dark" : "primary.light",
                    transform: "translateY(-2px)",
                    boxShadow: isSelected 
                      ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                      : "0 2px 8px rgba(15, 23, 42, 0.08)",
                  },
                }}
              >
                <span style={{ fontSize: isMobile ? "1.5rem" : "1.75rem" }}>{option.icon}</span>
                <span>{option.label}</span>
              </Button>
            );
          })}
        </Box>
      </Box>
    );
  };

  const handleAccept = () => {
    if (startTime && !isBookingValid(startTime)) {
      alert(t('bookingTimeRestriction'));
      return;
    }
    const normalizedStart = startTime || (startDate ? dayjs(startDate) : null);
    const normalizedEnd =
      endTime ||
      (selectedOption === "Monthly" && endDate
        ? dayjs(endDate).endOf("day")
        : endDate
          ? dayjs(endDate)
          : null);

    onSave({
      option: selectedOption,
      startDate,
      endDate,
      startTime,
      endTime,
      start_epoch: toEpochSeconds(normalizedStart),
      end_epoch: toEpochSeconds(normalizedEnd),
      genderPreference: genderPreference,
    });
  };

  const bookingTypeOptions: { value: string; label: string }[] = [
    { value: "Date", label: t("dateOption") },
    { value: "Short term", label: t("shortTerm") },
    { value: "Monthly", label: t("monthly") },
  ];

  const pickerShellSx = {
    width: "100%",
    maxWidth: isMobile ? "100%" : 380,
    mx: "auto",
    p: { xs: 1, sm: 1.5, md: 2 },
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  };

  const dialogContent = (
    <>
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <IconButton
          aria-label={t("close")}
          onClick={onClose}
          className="absolute right-2 top-1/2 z-[2] -translate-y-1/2"
          style={{
            color: isMobile ? theme.palette.text.primary : theme.palette.common.white,
            backgroundColor: isMobile ? alpha(theme.palette.grey[500], 0.1) : alpha("#fff", 0.12),
            width: isMobile ? 32 : 40,
            height: isMobile ? 32 : 40,
          }}
        >
          <CloseIcon sx={{ fontSize: isMobile ? 18 : 22 }} />
        </IconButton>

        <DialogHeader
          className={`flex items-center !border-b-0 ${isMobile ? "!px-4 !py-3 !min-h-[3rem]" : "!px-5 !py-4 !min-h-[3.75rem]"}`}
        >
          <Typography 
            component="h2" 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ 
              fontWeight: 700, 
              letterSpacing: "-0.02em", 
              pr: isMobile ? 4 : 5, 
              lineHeight: 1.25,
              fontSize: isMobile ? "1.1rem" : "1.25rem"
            }}
          >
            {t("selectBookingOption")}
          </Typography>
        </DialogHeader>
      </Box>

      <DialogContent
        sx={{
          px: isMobile ? 1.5 : 3,
          py: isMobile ? 1.5 : 2.5,
          pt: isMobile ? 1 : 2,
          maxHeight: { xs: "min(78vh, 560px)", sm: "min(72vh, 620px)" },
          overflowY: "auto",
          bgcolor: isMobile ? "background.paper" : "grey.50",
          borderTop: isMobile ? "none" : "1px solid",
          borderColor: "divider",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <FormControl component="fieldset" variant="standard" sx={{ mb: 2.5, width: "100%" }}>
          <FormLabel
            component="legend"
            sx={{
              mb: 1.5,
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "text.secondary",
              "&.Mui-focused": { color: "text.secondary" },
            }}
          >
            {t("bookBy")}
          </FormLabel>
          <RadioGroup
            name="booking-option"
            value={selectedOption}
            onChange={(e) => handleOptionChange(e.target.value)}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              alignItems: "stretch",
              gap: isMobile ? 1 : 1.25,
              width: "100%",
            }}
          >
            {bookingTypeOptions.map((opt) => {
              const selected = selectedOption === opt.value;
              return (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        p: 0.5,
                        color: selected ? "primary.main" : "action.active",
                      }}
                    />
                  }
                  label={
                    <Typography
                      component="span"
                      sx={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: isMobile ? "0.875rem" : "0.9375rem",
                        lineHeight: 1.3,
                        color: "text.primary",
                      }}
                    >
                      {opt.label}
                    </Typography>
                  }
                  sx={{
                    m: 0,
                    mx: 0,
                    py: isMobile ? 1 : 1.5,
                    px: isMobile ? 1.25 : 1.75,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: isMobile ? 0.75 : 1,
                    width: "100%",
                    maxWidth: "100%",
                    minHeight: { xs: "auto", sm: 56 },
                    height: { xs: "auto", sm: "100%" },
                    alignSelf: "stretch",
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: selected ? "primary.main" : "divider",
                    bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                    boxShadow: selected ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.25)}` : "0 1px 2px rgba(15, 23, 42, 0.05)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    "& .MuiFormControlLabel-label": {
                      width: "100%",
                      flex: 1,
                      minWidth: 0,
                    },
                    "&:hover": {
                      borderColor: selected ? "primary.main" : "primary.light",
                      bgcolor: alpha(theme.palette.primary.main, selected ? 0.1 : 0.04),
                    },
                  }}
                />
              );
            })}
          </RadioGroup>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Date Option */}
          {selectedOption === "Date" && (
            <Box>
              {renderDurationControl()}
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <Box sx={pickerShellSx}>
                    <DribbbleDateTimePicker
                      mode="single"
                      value={startTime?.toDate()}
                      maxDate={maxDate21Days.toDate()}
                      onDateChange={handleDateOnlyChange}
                      onChange={(selectedDateTime: Date) => {
                        const selected = dayjs(selectedDateTime);
                        const now = dayjs();
                        if (selected.isBefore(now.add(30, "minute"))) { alert(t('timeMinuteRestriction')); return; }
                        if (!isBookingStartValid(selected)) { alert(t('timeHourRestriction')); return; }
                        if (selected.isAfter(maxDate21Days)) { alert(t('dateExceedRestriction')); return; }
                        updateStartDate(selected);
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              {renderGenderPreference()}
              {renderBookingDetails()}
              <Box
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  px: 2,
                  py: 1.75,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.25),
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "primary.dark", 
                    lineHeight: 1.55, 
                    fontSize: isMobile ? "0.7rem" : "0.8125rem"
                  }}
                >
                  {t("relaxWeHandle")}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Short Term Option */}
          {selectedOption === "Short term" && (
            <Box>
              {renderShortTermStepGuide()}
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <Box sx={pickerShellSx}>
                    <DribbbleDateTimePicker
                      mode="range"
                      maxRangeDays={SHORT_TERM_MAX_SPAN_DAYS}
                      value={{
                        startDate: startDate ? dayjs(startDate).toDate() : undefined,
                        endDate: endDate ? dayjs(endDate).toDate() : undefined,
                      }}
                      onDateChange={handleRangeDateOnlyChange}
                      onChange={({ startDate: rangeStart, endDate: rangeEnd, time }) => {
                        if (!time) return;
                        const startWithTime = dayjs(rangeStart);
                        let end = dayjs(rangeEnd).startOf("day");
                        if (end.diff(startWithTime.startOf("day"), "day") > SHORT_TERM_MAX_SPAN_DAYS) {
                          end = startWithTime.startOf("day").add(SHORT_TERM_MAX_SPAN_DAYS, "day");
                        }
                        setStartDate(startWithTime.toISOString());
                        setStartTime(startWithTime);
                        setEndDate(end.toISOString());
                        setEndTime(startWithTime.add(1, "hour"));
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              {startTime ? renderDurationControl() : null}
              {renderBookingDetails()}
            </Box>
          )}

          {/* Monthly Option */}
          {selectedOption === "Monthly" && (
            <Box>
              {renderDurationControl()}
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <Box sx={pickerShellSx}>
                    <DribbbleDateTimePicker
                      mode="single"
                      value={startTime?.toDate()}
                      maxDate={maxDate90Days.toDate()}
                      onDateChange={handleDateOnlyChange}
                      onChange={(selectedDateTime: Date) => {
                        const selected = dayjs(selectedDateTime);
                        const now = dayjs();
                        if (selected.isBefore(now.add(30, "minute"))) { alert(t('timeMinuteRestriction')); return; }
                        if (!isBookingStartValid(selected)) { alert(t('timeHourRestriction')); return; }
                        if (selected.isAfter(maxDate90Days, "day")) { alert(t('monthlyDateExceedRestriction')); return; }
                        if (selected.isBefore(today, "day")) { alert(t('pastDateRestriction')); return; }
                        updateStartDate(selected);
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              {renderBookingDetails()}
              {startDate && endDate && (
                <Box
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    px: 2,
                    py: 1.75,
                    textAlign: "center",
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      color: "primary.dark", 
                      fontSize: isMobile ? "0.7rem" : "0.8125rem"
                    }}
                  >
                    {t("subscriptionPeriodLabel")}: {dayjs(startDate).format("MMMM D, YYYY")} –{" "}
                    {dayjs(endDate).format("MMMM D, YYYY")}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </LocalizationProvider>
      </DialogContent>

      <DialogActions
        sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 1.5 : 2.5,
          pt: isMobile ? 1 : 2,
          gap: isMobile ? 1 : 1.5,
          flexDirection: isMobile ? "column-reverse" : "row",
          justifyContent: "flex-end",
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={isMobile}
          size={isMobile ? "medium" : "large"}
          sx={{ 
            borderRadius: 2, 
            minWidth: { sm: 120 }, 
            textTransform: "none", 
            fontWeight: 600,
            py: isMobile ? 1 : 1.5
          }}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          disabled={isConfirmDisabled()}
          fullWidth={isMobile}
          size={isMobile ? "medium" : "large"}
          sx={{ 
            borderRadius: 2, 
            minWidth: { sm: 140 }, 
            textTransform: "none", 
            fontWeight: 700, 
            boxShadow: "none",
            py: isMobile ? 1 : 1.5
          }}
        >
          {t("confirm")}
        </Button>
      </DialogActions>
    </>
  );

  // For mobile, use a full-screen drawer for better UX
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '90vh',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {dialogContent}
        </Box>
      </SwipeableDrawer>
    );
  }

  // For tablet and desktop, use the dialog
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll="body"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: isTablet ? 600 : 540,
          margin: "auto",
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.22)",
          [theme.breakpoints.down("sm")]: {
            margin: "12px",
            width: "calc(100% - 24px)",
            maxWidth: "none",
            borderRadius: "14px",
          },
        },
      }}
    >
      {dialogContent}
    </Dialog>
  );
};

export default BookingDialog;