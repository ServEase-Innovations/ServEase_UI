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
} from "@mui/material";
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
      <Box sx={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        p: isMobile ? 2 : 3,
        mb: 2,
        backgroundColor: '#fafafa'
      }}>
        <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 600, mb: 2 }}>
          {t('serviceDuration')}
        </Typography>

        <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'text.secondary', mb: 2 }}>
          {selectedOption === "Short term" 
            ? "This duration applies to each day of service" 
            : selectedOption === "Monthly"
            ? "This duration applies to each day of your monthly subscription"
            : t('durationMessage')}
        </Typography>

        {/* Duration Control */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          p: 2
        }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleDecreaseDuration}
            disabled={!canDecreaseDuration()}
            sx={{ minWidth: '40px', height: '40px' }}
          >
            -
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 600 }}>
              {currentDuration} {t('hourUnit')}{currentDuration > 1 ? 's' : ''}
            </Typography>
            {hasStartTime && endTime && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('until')} {endTime.format('h:mm A')}
              </Typography>
            )}
            {!hasStartTime && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {t('selectStartTimeToAdjust') || 'Select a start time to adjust duration'}
              </Typography>
            )}
          </Box>

          <Button 
            variant="outlined" 
            size="small"
            onClick={handleIncreaseDuration}
            disabled={!canIncreaseDuration()}
            sx={{ minWidth: '40px', height: '40px' }}
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
      <Box sx={{ 
        mt: 2,
        p: isMobile ? 2 : 3, 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 600, mb: 2 }}>
          {t('bookingDetails')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
            <strong>{t('startDate')}:</strong> {startDate ? dayjs(startDate).format('MMMM D, YYYY') : t('notSelected')}
          </Typography>

          {selectedOption === "Monthly" && endDate && (
            <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
              <strong>{t('endDate')}:</strong> {dayjs(endDate).format('MMMM D, YYYY')} (1 month later)
            </Typography>
          )}

          {selectedOption === "Short term" && endDate && (
            <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
              <strong>{t('endDate')}:</strong> {dayjs(endDate).format('MMMM D, YYYY')}
            </Typography>
          )}

          <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
            <strong>{t('startTime')}:</strong> {startTime?.format('h:mm A')}
          </Typography>

          {endTime && (
            <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
              <strong>{t('endTime')}:</strong> {endTime.format('h:mm A')}
            </Typography>
          )}

          {/* Additional info strings */}
          {selectedOption === "Short term" && endDate && (
            <Typography variant="body2" sx={{ color: 'primary.main', mt: 1, fontStyle: 'italic' }}>
              Service will run from {dayjs(startDate).format('MMMM D')} to {dayjs(endDate).format('MMMM D, YYYY')}, 
              daily from {startTime?.format('h:mm A')} to {endTime?.format('h:mm A')}
            </Typography>
          )}

          {selectedOption === "Monthly" && endDate && (
            <Typography variant="body2" sx={{ color: 'primary.main', mt: 1, fontStyle: 'italic' }}>
              Monthly subscription from {dayjs(startDate).format('MMMM D, YYYY')} to {dayjs(endDate).format('MMMM D, YYYY')}
            </Typography>
          )}

          {selectedOption === "Date" && (
            <Typography variant="body2" sx={{ color: 'primary.main', mt: 1, fontStyle: 'italic' }}>
              {t('serviceStartMessage', { 
                date: startDate ? dayjs(startDate).format('MMMM D, YYYY') : '___',
                time: startTime ? startTime.format('h:mm A') : '___'
              })}
            </Typography>
          )}
        </Box>
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

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: "95%", maxWidth: "500px", margin: "auto", position: "relative", [theme.breakpoints.down('sm')]: { margin: '16px', width: 'calc(100% - 32px)', maxWidth: 'none' } } }}>
      <IconButton aria-label={t('close')} onClick={onClose} sx={{ position: 'absolute', right: 7, top: 7, color: 'white', '&:hover': { backgroundColor: 'rgba(47, 179, 255, 0.41)' }, zIndex: 1300, width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}>
        <CloseIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
      </IconButton>

      <DialogHeader className={`${isMobile ? "text-[1.1rem] px-4 pt-4 pb-2" : "text-[1.25rem] px-6 pt-6 pb-4"}`}>
        {t('selectBookingOption')}
      </DialogHeader>

      <DialogContent sx={{ padding: isMobile ? '8px 16px' : '16px 24px', '& .MuiFormControl-root': { marginBottom: isMobile ? '16px' : '24px' } }}>
        <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
          <FormLabel component="legend" sx={{ color: "primary.main", fontWeight: 500, fontSize: isMobile ? '0.9rem' : '1rem', mb: 1 }}>{t('bookBy')}</FormLabel>
          <RadioGroup row name="booking-option" value={selectedOption} onChange={(e) => handleOptionChange(e.target.value)} sx={{ flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? '8px' : '16px' }}>
            <FormControlLabel value="Date" control={<Radio size={isMobile ? "small" : "medium"} />} label={t('dateOption')} sx={{ marginRight: isMobile ? '8px' : '16px', '& .MuiFormControlLabel-label': { fontSize: isMobile ? '0.8rem' : '0.875rem' } }} />
            <FormControlLabel value="Short term" control={<Radio size={isMobile ? "small" : "medium"} />} label={t('shortTerm')} sx={{ marginRight: isMobile ? '8px' : '16px', '& .MuiFormControlLabel-label': { fontSize: isMobile ? '0.8rem' : '0.875rem' } }} />
            <FormControlLabel value="Monthly" control={<Radio size={isMobile ? "small" : "medium"} />} label={t('monthly')} sx={{ '& .MuiFormControlLabel-label': { fontSize: isMobile ? '0.8rem' : '0.875rem' } }} />
          </RadioGroup>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Date Option */}
          {selectedOption === "Date" && (
            <Box>
              {renderDurationControl()}
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                  <Box sx={{ width: "100%", maxWidth: 380 }}>
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
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f8ff', borderRadius: '8px', mt: 2 }}>
                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', fontStyle: 'italic', color: 'text.secondary' }}>{t('relaxWeHandle')}</Typography>
              </Box>
            </Box>
          )}

          {/* Short Term Option */}
          {selectedOption === "Short term" && (
            <Box>
              {renderDurationControl()}
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                  <Box sx={{ width: "100%", maxWidth: 380 }}>
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
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                  <Box sx={{ width: "100%", maxWidth: 380 }}>
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
                <Box sx={{ textAlign: 'center', p: 1.5, mt: 2, backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ color: '#1976d2' }}>📅 Subscription Period: {dayjs(startDate).format('MMMM D, YYYY')} - {dayjs(endDate).format('MMMM D, YYYY')}</Typography>
                </Box>
              )}
            </Box>
          )}
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ padding: isMobile ? '16px' : '24px', paddingTop: isMobile ? '8px' : '16px', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '8px' : '16px' }}>
        <Button onClick={onClose} variant="outlined" fullWidth={isMobile} size={isMobile ? "small" : "medium"}>{t('cancel')}</Button>
        <Button onClick={handleAccept} variant="contained" disabled={isConfirmDisabled()} fullWidth={isMobile} size={isMobile ? "small" : "medium"}>{t('confirm')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDialog;