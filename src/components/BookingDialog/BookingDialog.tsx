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
  
  // Allow times that are at least 30 minutes ahead OR exactly on the 30-minute mark
  if (time.isBefore(now.add(30, "minute").subtract(1, 'second'))) return false;
  
  const hour = time.hour();
  return hour >= 5 && hour < 22; // 5 AM–10 PM
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
  // Use the language context
  const { t } = useLanguage();
  
  const [lastSelectedDate, setLastSelectedDate] = useState<Dayjs | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const today = dayjs();
  const maxDate21Days = today.add(21, "day");
  const maxDate90Days = today.add(89, "day");
  
  // Reset all date states when dialog closes
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
    
    // Check if only the date changed (not the time)
    const isDateChanged = lastSelectedDate && 
      !newValue.isSame(lastSelectedDate, 'day') && 
      newValue.isSame(lastSelectedDate, 'hour') && 
      newValue.isSame(lastSelectedDate, 'minute');
    
    // Case 1: Current date selected - set to current time + 30 minutes
    if (newValue.isSame(today, 'day')) {
      const nowPlus30 = today.add(30, 'minute');
      
      // If selected time is before now + 30, adjust it
      if (newValue.isBefore(nowPlus30)) {
        adjustedTime = nowPlus30;
      }
      
      // Ensure time is within 5 AM - 10 PM
      if (adjustedTime.hour() < 5) {
        adjustedTime = adjustedTime.hour(5).minute(0);
      } else if (adjustedTime.hour() >= 22) {
        adjustedTime = adjustedTime.hour(21).minute(55);
      }
    } else {
      // Case 2: Future date selected - set to 5:00 AM by default
      // Only set to 5:00 AM if the date changed but time didn't
      if (isDateChanged || (newValue.hour() === 0 && newValue.minute() === 0)) {
        adjustedTime = newValue.hour(5).minute(0);
      }
    }
    
    setStartDate(adjustedTime.toISOString());
    setStartTime(adjustedTime);
    setLastSelectedDate(adjustedTime);

    // Set default end time (1 hour after start)
    const defaultEndTime = adjustedTime.add(1, 'hour');
    setEndTime(defaultEndTime);
    
    // For Date option, also update endDate
    if (selectedOption === "Date") {
      setEndDate(defaultEndTime.toISOString());
    }
    
    // For Monthly option, set end date to exactly one month later
    if (selectedOption === "Monthly") {
      const endDateValue = adjustedTime.add(1, 'month');
      setEndDate(endDateValue.toISOString());
    }
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
        return !startDate || !startTime;
      case "Short term":
        if (!startDate || !endDate || !startTime || !endTime) return true;
        return dayjs(endDate).isBefore(dayjs(startDate));
      case "Monthly":
        return !startDate || !startTime;
      default:
        return true;
    }
  };

  // Reusable duration selector component
  const renderDurationSelector = () => {
    // Don't show if start time is not set
    if (!startTime) return null;

    // For Monthly, we need end time
    if (selectedOption === "Monthly" && !endTime) return null;
    
    // For Short term, we need start date and end date
    if (selectedOption === "Short term" && (!startDate || !endDate)) return null;

    // Calculate current duration
    const currentDuration = endTime ? endTime.diff(startTime, 'hour') : 1;
    
    // Check if we can increase duration (not exceeding 10 PM)
    const canIncreaseDuration = () => {
      if (!startTime) return false;
      const newEndTime = startTime.add(currentDuration + 1, 'hour');
      return newEndTime.hour() < 22;
    };

    // Check if we can decrease duration (minimum 1 hour)
    const canDecreaseDuration = () => {
      return currentDuration > 1;
    };

    // Handle duration increase
    const handleIncreaseDuration = () => {
      if (!startTime) return;
      
      const newEndTime = startTime.add(currentDuration + 1, 'hour');
      
      // Check if exceeds max time
      if (newEndTime.hour() >= 22) {
        return;
      }
      
      setEndTime(newEndTime);
      // For Date option, also update endDate
      if (selectedOption === "Date") {
        setEndDate(newEndTime.toISOString());
      }
      // For Monthly and Short term, don't update endDate
    };

    // Handle duration decrease
    const handleDecreaseDuration = () => {
      if (!startTime) return;
      
      if (currentDuration > 1) {
        const newEndTime = startTime.add(currentDuration - 1, 'hour');
        setEndTime(newEndTime);
        // For Date option, also update endDate
        if (selectedOption === "Date") {
          setEndDate(newEndTime.toISOString());
        }
        // For Monthly and Short term, don't update endDate
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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 600 }}>
            {t('serviceDuration')}
          </Typography>
        </Box>

        {/* Booking Details Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 600, mb: 1 }}>
            {t('bookingDetails')}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'text.secondary' }}>
            {t('startDate')}: {startDate ? dayjs(startDate).format('MMMM D, YYYY') : t('notSelected')}
          </Typography>
          {selectedOption === "Monthly" && endDate && (
            <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'text.secondary' }}>
              {t('endDate')}: {dayjs(endDate).format('MMMM D, YYYY')} (1 month later)
            </Typography>
          )}
          {selectedOption === "Short term" && endDate && (
            <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'text.secondary' }}>
              {t('endDate')}: {dayjs(endDate).format('MMMM D, YYYY')}
            </Typography>
          )}
          <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'text.secondary' }}>
            {t('startTime')}: {startTime ? startTime.format('h:mm A') : t('notSelected')}
          </Typography>
          {endTime && (
            <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'text.secondary' }}>
              {t('endTime')}: {endTime.format('h:mm A')}
            </Typography>
          )}
          
          {/* Show date range for Short term */}
          {selectedOption === "Short term" && endDate && (
            <Typography variant="body2" sx={{ 
              fontSize: isMobile ? '0.8rem' : '0.875rem', 
              color: 'primary.main',
              mt: 1,
              fontStyle: 'italic'
            }}>
              Service will run from {dayjs(startDate).format('MMMM D')} to {dayjs(endDate).format('MMMM D, YYYY')}, 
              daily from {startTime?.format('h:mm A')} to {endTime?.format('h:mm A')}
            </Typography>
          )}
          
          {/* Show monthly subscription message */}
          {selectedOption === "Monthly" && endDate && (
            <Typography variant="body2" sx={{ 
              fontSize: isMobile ? '0.8rem' : '0.875rem', 
              color: 'primary.main',
              mt: 1,
              fontStyle: 'italic'
            }}>
              Monthly subscription from {dayjs(startDate).format('MMMM D, YYYY')} to {dayjs(endDate).format('MMMM D, YYYY')}
            </Typography>
          )}
          
          {selectedOption === "Date" && (
            <Typography variant="body2" sx={{ 
              fontSize: isMobile ? '0.8rem' : '0.875rem', 
              color: 'primary.main',
              mt: 1,
              fontStyle: 'italic'
            }}>
              {t('serviceStartMessage', { 
                date: startDate ? dayjs(startDate).format('MMMM D, YYYY') : '___',
                time: startTime ? startTime.format('h:mm A') : '___'
              })}
            </Typography>
          )}
        </Box>

        {/* Duration Selector */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 600, mb: 1 }}>
            {t('serviceDuration')}
          </Typography>
          <Typography variant="body2" sx={{ 
            fontSize: isMobile ? '0.8rem' : '0.875rem', 
            color: 'text.secondary',
            mb: 2
          }}>
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
                {currentDuration} {t('hourUnit')}
                {currentDuration > 1 ? 's' : ''}
              </Typography>
              {endTime && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('until')} {endTime.format('h:mm A')}
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      PaperProps={{ 
        sx: { 
          width: "95%",
          maxWidth: "500px",
          margin: "auto",
          position: "relative",
          [theme.breakpoints.down('sm')]: {
            margin: '16px',
            width: 'calc(100% - 32px)',
            maxWidth: 'none'
          }
        } 
      }}
    >
      {/* Close Button */}
      <IconButton
        aria-label={t('close')}
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 7,
          top: 7,
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(47, 179, 255, 0.41)',
          },
          zIndex: 1300,
          width: isMobile ? 32 : 40,
          height: isMobile ? 32 : 40,
        }}
      >
        <CloseIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
      </IconButton>

      <DialogHeader
        className={`${isMobile ? "text-[1.1rem] px-4 pt-4 pb-2" : "text-[1.25rem] px-6 pt-6 pb-4"}`}
      >
        {t('selectBookingOption')}
      </DialogHeader>

      <DialogContent sx={{ 
        padding: isMobile ? '8px 16px' : '16px 24px',
        '& .MuiFormControl-root': {
          marginBottom: isMobile ? '16px' : '24px'
        }
      }}>
        <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
          <FormLabel component="legend" sx={{ 
            color: "primary.main", 
            fontWeight: 500,
            fontSize: isMobile ? '0.9rem' : '1rem',
            mb: 1
          }}>
            {t('bookBy')}
          </FormLabel>
          <RadioGroup 
            row 
            name="booking-option" 
            value={selectedOption} 
            onChange={(e) => handleOptionChange(e.target.value)}
            sx={{
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: isMobile ? '8px' : '16px'
            }}
          >
            <FormControlLabel 
              value="Date" 
              control={<Radio size={isMobile ? "small" : "medium"} />} 
              label={t('dateOption')} 
              sx={{ 
                marginRight: isMobile ? '8px' : '16px',
                '& .MuiFormControlLabel-label': {
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }
              }}
            />
            <FormControlLabel 
              value="Short term" 
              control={<Radio size={isMobile ? "small" : "medium"} />} 
              label={t('shortTerm')} 
              sx={{ 
                marginRight: isMobile ? '8px' : '16px',
                '& .MuiFormControlLabel-label': {
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }
              }}
            />
            <FormControlLabel 
              value="Monthly" 
              control={<Radio size={isMobile ? "small" : "medium"} />} 
              label={t('monthly')} 
              sx={{ 
                '& .MuiFormControlLabel-label': {
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }
              }}
            />
          </RadioGroup>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>

          {/* --- Date Option --- */}
          {selectedOption === "Date" && (
            <Box>
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Box sx={{ width: "100%", maxWidth: 380 }}>
                    <DribbbleDateTimePicker
                      mode="single"
                      value={startDate ? dayjs(startDate).toDate() : undefined}
                      onChange={(selectedDateTime: Date) => {
                        const selected = dayjs(selectedDateTime);
                        const now = dayjs();

                        // ⛔ Minimum 30 minutes from now
                        if (selected.isBefore(now.add(30, "minute"))) {
                          alert(t('timeMinuteRestriction'));
                          return;
                        }

                        // ⛔ Allowed hours: 5 AM – 9 PM
                        if (selected.hour() < 5 || selected.hour() > 21) {
                          alert(t('timeHourRestriction'));
                          return;
                        }

                        // ⛔ Max 21 days
                        if (selected.isAfter(maxDate21Days)) {
                          alert(t('dateExceedRestriction'));
                          return;
                        }

                        // ✅ Save final value
                        updateStartDate(selected);
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Duration Selector for Date option */}
              {startDate && startTime && renderDurationSelector()}

              {/* Relax Message */}
              <Box sx={{ 
                textAlign: 'center', 
                p: 2,
                backgroundColor: '#f0f8ff',
                borderRadius: '8px',
                mb: 2
              }}>
                <Typography variant="body2" sx={{ 
                  fontSize: isMobile ? '0.8rem' : '0.875rem', 
                  fontStyle: 'italic',
                  color: 'text.secondary'
                }}>
                  {t('relaxWeHandle')}
                </Typography>
              </Box>
            </Box>
          )}

          {/* --- Short Term Option --- */}
          {selectedOption === "Short term" && (
            <Box>
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Box sx={{ width: "100%", maxWidth: 380 }}>
                    <DribbbleDateTimePicker
                      mode="range"
                      value={{
                        startDate: startDate ? dayjs(startDate).toDate() : undefined,
                        endDate: endDate ? dayjs(endDate).toDate() : undefined,
                      }}
                      onChange={({ startDate, endDate, time }) => {
                        const start = dayjs(startDate);
                        const end = dayjs(endDate);
                        
                        // Parse the time string
                        const [t, meridian] = time.split(" ");
                        let hour = Number(t.split(":")[0]);
                        
                        if (meridian === "PM" && hour !== 12) hour += 12;
                        if (meridian === "AM" && hour === 12) hour = 0;
                        
                        // Apply the selected time to start date only
                        const startWithTime = start.hour(hour).minute(0);
                        
                        setStartDate(startWithTime.toISOString());
                        setStartTime(startWithTime);
                        
                        // Store the end date separately (without time)
                        setEndDate(end.format('YYYY-MM-DD'));
                        
                        // Set default end time to start time + 1 hour (NOT based on end date)
                        const defaultEndTime = startWithTime.add(1, 'hour');
                        setEndTime(defaultEndTime);
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              
              {/* Duration Selector for Short term option */}
              {startDate && startTime && endTime && renderDurationSelector()}
            </Box>
          )}

          {/* --- Monthly Option --- */}
          {selectedOption === "Monthly" && (
            <Box>
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Box sx={{ width: "100%", maxWidth: 380 }}>
                    <DribbbleDateTimePicker
                      mode="single"
                      value={startDate ? dayjs(startDate).toDate() : undefined}
                      onChange={(selectedDateTime: Date) => {
                        const selected = dayjs(selectedDateTime);
                        const now = dayjs();

                        // ⛔ Minimum 30 minutes from now
                        if (selected.isBefore(now.add(30, "minute"))) {
                          alert(t('timeMinuteRestriction'));
                          return;
                        }

                        // ⛔ Allowed hours: 5 AM – 9 PM
                        if (selected.hour() < 5 || selected.hour() > 21) {
                          alert(t('timeHourRestriction'));
                          return;
                        }

                        // ⛔ Max 90 days
                        if (selected.isAfter(maxDate90Days, "day")) {
                          alert(t('monthlyDateExceedRestriction'));
                          return;
                        }

                        // ⛔ Disable past dates
                        if (selected.isBefore(today, "day")) {
                          alert(t('pastDateRestriction'));
                          return;
                        }

                        // ✅ Valid → update state
                        updateStartDate(selected);
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              
              {/* Show end date info */}
              {startDate && endDate && (
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 1.5, 
                  mb: 2,
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px'
                }}>
                  <Typography variant="body2" sx={{ color: '#1976d2' }}>
                    📅 Subscription Period: {dayjs(startDate).format('MMMM D, YYYY')} - {dayjs(endDate).format('MMMM D, YYYY')}
                  </Typography>
                </Box>
              )}
              
              {/* Duration Selector for Monthly option */}
              {startDate && startTime && endTime && renderDurationSelector()}
            </Box>
          )}

        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ 
        padding: isMobile ? '16px' : '24px',
        paddingTop: isMobile ? '8px' : '16px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '8px' : '16px'
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          {t('cancel')}
        </Button>
        <Button 
          onClick={handleAccept} 
          variant="contained" 
          disabled={isConfirmDisabled()}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          {t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDialog;