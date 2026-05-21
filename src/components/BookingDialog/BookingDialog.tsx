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
  Typography,
  IconButton,
  Stack,
  Drawer,
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
  onSave: (bookingDetails: any) => void;
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

// Check if a time is within allowed booking hours
const isBookingValid = (time: Dayjs | null) => {
  if (!time) return false;
  const now = dayjs();
  if (time.isBefore(now.add(30, "minute").subtract(1, 'second'))) return false;
  const hour = time.hour();
  return hour >= 5 && hour < 22;
};

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
      if (adjustedTime.hour() < 5) adjustedTime = adjustedTime.hour(5).minute(0);
      else if (adjustedTime.hour() >= 22) adjustedTime = adjustedTime.hour(21).minute(55);
    } else {
      if (isDateChanged || (newValue.hour() === 0 && newValue.minute() === 0)) {
        adjustedTime = newValue.hour(5).minute(0);
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

  const isConfirmDisabled = () => {
    switch (selectedOption) {
      case "Date": 
        if (!startDate || !startTime) return true;
        // Check if selected date is beyond 21 days from today
        const selectedDate = dayjs(startDate);
        const maxAllowedDate = today.add(21, "day");
        if (selectedDate.isAfter(maxAllowedDate, "day")) return true;
        return false;
      case "Short term":
        if (!startDate || !endDate || !startTime || !endTime) return true;
        return dayjs(endDate).isBefore(dayjs(startDate));
      case "Monthly": 
        if (!startDate || !startTime) return true;
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
      return newEndTime.hour() < 22;
    };
    const canDecreaseDuration = () => {
      return hasStartTime && currentDuration > 1;
    };

    const handleIncreaseDuration = () => {
      if (!hasStartTime) return;
      const newEndTime = startTime!.add(currentDuration + 1, 'hour');
      if (newEndTime.hour() >= 22) return;
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
                {t("selectStartTimeToAdjust") || "Select a start time to adjust duration"}
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
    if (!startTime) return null; // Only show once a start time is selected

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

          <Typography 
            variant="body2" 
            sx={{ 
              color: "text.secondary",
              fontSize: isMobile ? "0.75rem" : "0.875rem"
            }}
          >
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              {t("startTime")}:{" "}
            </Box>
            {startTime?.format("h:mm A")}
          </Typography>

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

  const handleAccept = () => {
    if (startTime && !isBookingValid(startTime)) {
      alert(t('bookingTimeRestriction'));
      return;
    }
    onSave({
      option: selectedOption,
      startDate,
      endDate,
      startTime,
      endTime,
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
          sx={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            color: isMobile ? "text.primary" : "common.white",
            bgcolor: isMobile ? alpha(theme.palette.grey[500], 0.1) : alpha("#fff", 0.12),
            width: isMobile ? 32 : 40,
            height: isMobile ? 32 : 40,
            "&:hover": { bgcolor: isMobile ? alpha(theme.palette.grey[500], 0.2) : alpha("#fff", 0.22) },
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
                        display: "flex",
                        alignItems: "center",
                        minHeight: "2.75em",
                        fontWeight: 600,
                        fontSize: isMobile ? "0.875rem" : "0.9375rem",
                        lineHeight: 1.3,
                        color: "text.primary",
                        textAlign: "left",
                        hyphens: "auto",
                        overflowWrap: "break-word",
                        pr: 0.5,
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
                      value={startDate ? dayjs(startDate).toDate() : undefined}
                      maxDate={maxDate21Days.toDate()}
                      onChange={(selectedDateTime: Date) => {
                        const selected = dayjs(selectedDateTime);
                        const now = dayjs();
                        if (selected.isBefore(now.add(30, "minute"))) { alert(t('timeMinuteRestriction')); return; }
                        if (selected.hour() < 5 || selected.hour() > 21) { alert(t('timeHourRestriction')); return; }
                        if (selected.isAfter(maxDate21Days)) { alert(t('dateExceedRestriction')); return; }
                        updateStartDate(selected);
                      }}
                    />
                  </Box>
                </Box>
              </Box>
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
              {renderDurationControl()}
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <Box sx={pickerShellSx}>
                    <DribbbleDateTimePicker
                      mode="range"
                      value={{ startDate: startDate ? dayjs(startDate).toDate() : undefined, endDate: endDate ? dayjs(endDate).toDate() : undefined }}
                      onChange={({ startDate, endDate, time }) => {
                        const start = dayjs(startDate);
                        let end = dayjs(endDate);
                        if (end.diff(start, "day") > 14) {
                          end = start.add(14, "day");
                          alert("Short-term bookings are limited to 15 days.");
                        }
                        const [t, meridian] = time.split(" ");
                        let hour = Number(t.split(":")[0]);
                        if (meridian === "PM" && hour !== 12) hour += 12;
                        if (meridian === "AM" && hour === 12) hour = 0;
                        const startWithTime = start.hour(hour).minute(0);
                        setStartDate(startWithTime.toISOString());
                        setStartTime(startWithTime);
                        setEndDate(end.format('YYYY-MM-DD'));
                        setEndTime(startWithTime.add(1, 'hour'));
                      }}
                    />
                  </Box>
                </Box>
              </Box>
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
                      value={startDate ? dayjs(startDate).toDate() : undefined}
                      maxDate={maxDate90Days.toDate()}
                      onChange={(selectedDateTime: Date) => {
                        const selected = dayjs(selectedDateTime);
                        const now = dayjs();
                        if (selected.isBefore(now.add(30, "minute"))) { alert(t('timeMinuteRestriction')); return; }
                        if (selected.hour() < 5 || selected.hour() > 21) { alert(t('timeHourRestriction')); return; }
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