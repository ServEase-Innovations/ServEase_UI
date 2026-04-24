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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      case "Date": return !startDate || !startTime;
      case "Short term":
        if (!startDate || !endDate || !startTime || !endTime) return true;
        return dayjs(endDate).isBefore(dayjs(startDate));
      case "Monthly": return !startDate || !startTime;
      default: return true;
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
          p: isMobile ? 2 : 2.5,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, letterSpacing: "-0.01em", color: "text.primary", mb: 0.5 }}
        >
          {t("serviceDuration")}
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, lineHeight: 1.5 }}>
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
            p: 1.5,
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={handleDecreaseDuration}
            disabled={!canDecreaseDuration()}
            sx={{
              minWidth: 44,
              height: 44,
              borderRadius: 2,
              fontSize: "1.25rem",
              fontWeight: 600,
              borderColor: "divider",
            }}
          >
            −
          </Button>

          <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em", color: "primary.dark" }}>
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
            size="small"
            onClick={handleIncreaseDuration}
            disabled={!canIncreaseDuration()}
            sx={{
              minWidth: 44,
              height: 44,
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
          p: isMobile ? 2 : 2.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderLeft: "4px solid",
          borderLeftColor: "primary.main",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
          {t("bookingDetails")}
        </Typography>

        <Stack spacing={1.25}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              {t("startDate")}:{" "}
            </Box>
            {startDate ? dayjs(startDate).format("MMMM D, YYYY") : t("notSelected")}
          </Typography>

          {selectedOption === "Monthly" && endDate && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {t("endDate")}:{" "}
              </Box>
              {dayjs(endDate).format("MMMM D, YYYY")} (1 month later)
            </Typography>
          )}

          {selectedOption === "Short term" && endDate && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {t("endDate")}:{" "}
              </Box>
              {dayjs(endDate).format("MMMM D, YYYY")}
            </Typography>
          )}

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              {t("startTime")}:{" "}
            </Box>
            {startTime?.format("h:mm A")}
          </Typography>

          {endTime && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {t("endTime")}:{" "}
              </Box>
              {endTime.format("h:mm A")}
            </Typography>
          )}

          {selectedOption === "Short term" && endDate && (
            <Typography variant="body2" sx={{ mt: 0.5, color: "primary.dark", lineHeight: 1.55, fontSize: "0.8125rem" }}>
              Service will run from {dayjs(startDate).format("MMMM D")} to {dayjs(endDate).format("MMMM D, YYYY")}, daily
              from {startTime?.format("h:mm A")} to {endTime?.format("h:mm A")}
            </Typography>
          )}

          {selectedOption === "Monthly" && endDate && (
            <Typography variant="body2" sx={{ mt: 0.5, color: "primary.dark", lineHeight: 1.55, fontSize: "0.8125rem" }}>
              Monthly subscription from {dayjs(startDate).format("MMMM D, YYYY")} to{" "}
              {dayjs(endDate).format("MMMM D, YYYY")}
            </Typography>
          )}

          {selectedOption === "Date" && (
            <Typography variant="body2" sx={{ mt: 0.5, color: "primary.dark", lineHeight: 1.55, fontSize: "0.8125rem" }}>
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
    maxWidth: 380,
    mx: "auto",
    p: { xs: 1.5, sm: 2 },
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll="body"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 540,
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
            color: "common.white",
            bgcolor: alpha("#fff", 0.12),
            width: isMobile ? 36 : 40,
            height: isMobile ? 36 : 40,
            "&:hover": { bgcolor: alpha("#fff", 0.22) },
          }}
        >
          <CloseIcon sx={{ fontSize: isMobile ? 20 : 22 }} />
        </IconButton>

        <DialogHeader
          className={`flex items-center !border-b-0 !px-5 ${isMobile ? "!py-3 !min-h-[3.25rem]" : "!py-4 !min-h-[3.75rem]"}`}
        >
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em", pr: 5, lineHeight: 1.25 }}>
            {t("selectBookingOption")}
          </Typography>
        </DialogHeader>
      </Box>

      <DialogContent
        sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 2.5,
          pt: isMobile ? 1.5 : 2,
          maxHeight: { xs: "min(78vh, 560px)", sm: "min(72vh, 620px)" },
          overflowY: "auto",
          bgcolor: "grey.50",
          borderTop: "1px solid",
          borderColor: "divider",
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
              gap: 1.25,
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
                        fontWeight: 700,
                        fontSize: "0.9375rem",
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
                    py: 1.5,
                    px: 1.75,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 1,
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
                    transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
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
                <Typography variant="body2" sx={{ color: "primary.dark", lineHeight: 1.55, fontSize: "0.8125rem" }}>
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
                        const end = dayjs(endDate);
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
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.dark", fontSize: "0.8125rem" }}>
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
          py: isMobile ? 2 : 2.5,
          pt: isMobile ? 1.5 : 2,
          gap: 1.5,
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
          sx={{ borderRadius: 2, minWidth: { sm: 120 }, textTransform: "none", fontWeight: 600 }}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          disabled={isConfirmDisabled()}
          fullWidth={isMobile}
          size={isMobile ? "medium" : "large"}
          sx={{ borderRadius: 2, minWidth: { sm: 140 }, textTransform: "none", fontWeight: 700, boxShadow: "none" }}
        >
          {t("confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDialog;