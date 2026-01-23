/* eslint-disable */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
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
import { LocalizationProvider, DateTimePicker, DesktopDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import CloseIcon from "@mui/icons-material/Close";

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
  const [value, setValue] = useState<Dayjs | null>(dayjs());
  const [lastSelectedDate, setLastSelectedDate] = useState<Dayjs | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const today = dayjs();
  const maxDate21Days = today.add(21, "day");
  const maxDate90Days = today.add(89, "day");

  const prefers24Hour = !new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
  }).formatToParts(new Date()).some((part) => part.type === "dayPeriod");
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
      if (isDateChanged || newValue.hour() === 0 && newValue.minute() === 0) {
        adjustedTime = newValue.hour(5).minute(0);
      }
    }
    
    setStartDate(adjustedTime.toISOString());
    setStartTime(adjustedTime);
    setLastSelectedDate(adjustedTime);

    // Set default end time (1 hour after start)
    const defaultEndTime = adjustedTime.add(1, 'hour');
    setEndDate(defaultEndTime.toISOString());
    setEndTime(defaultEndTime);

    if (selectedOption === "Monthly") {
      const endDateValue = adjustedTime.add(1, "month");
      setEndDate(endDateValue.toISOString());
      setEndTime(endDateValue);
    }
  };

  const updateEndDate = (newValue: Dayjs | null) => {
    if (!newValue) return;
    setEndDate(newValue.toISOString());
    setEndTime(newValue);
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

  const handleAccept = () => {
    if (startTime && !isBookingValid(startTime)) {
      alert("Please select a time between 5 AM and 10 PM, at least 30 minutes from now");
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

  // Disable dates outside allowed range
  const shouldDisableDate = (date: Dayjs) => {
    if (selectedOption === "Monthly") return date.isBefore(today, "day") || date.isAfter(maxDate90Days, "day");
    return date.isBefore(today, "day") || date.isAfter(maxDate21Days, "day");
  };

  const shouldDisableEndDate = (date: Dayjs) => {
    if (!startDate) return true;
    const start = dayjs(startDate);
    return date.isBefore(start.add(1, "day"), "day") || date.isAfter(start.add(20, "day"), "day");
  };

  // Calculate duration in hours
  const getDuration = () => {
    if (!startTime || !endTime) return 1;
    return endTime.diff(startTime, 'hour');
  };

  // Calculate estimated cost
  const getEstimatedCost = () => {
    const duration = getDuration();
    return duration * 1200; // ₹1200 per hour
  };

  // Check if end time would exceed 10 PM
  const wouldExceedMaxTime = (additionalHours: number = 1) => {
    if (!startTime) return false;
    const proposedEndTime = startTime.add(getDuration() + additionalHours, 'hour');
    return proposedEndTime.hour() >= 22;
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
        aria-label="close"
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
        Select your Booking Option
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
            Book by
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
              label="Date" 
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
              label="Short term" 
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
              label="Monthly" 
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
              <DemoContainer components={["DesktopDateTimePicker"]} sx={{ width: "100%", mb: 2 }}>
                <DesktopDateTimePicker
                  label="Select Start Date"
                  ampm={!prefers24Hour}
                  value={startDate ? dayjs(startDate) : null}
                  onChange={(newValue) => {
                    if (!newValue) return;
                    // Directly update start date/time as user changes it
                    updateStartDate(newValue);
                  }}
                  minDateTime={dayjs().add(30, "minute")}
                  maxDate={maxDate21Days}
                  shouldDisableTime={(value, view) => {
                    const hour = value.hour();
                    const minute = value.minute();

                    if (view === "hours") {
                      return hour < 5 || hour > 21;
                    }

                    if (view === "minutes") {
                      return minute % 5 !== 0;
                    }

                    return false;
                  }}
                  minutesStep={5}
                  format={prefers24Hour ? "MM/DD/YYYY HH:mm" : "MM/DD/YYYY"}
                  slotProps={{
                    textField: {
                      size: isMobile ? "small" : "medium",
                      fullWidth: true,
                      placeholder: "MM/DD/YYYY"
                    }
                  }}
                />
              </DemoContainer>

              {/* Duration Selector Section */}
              {startDate && startTime && (
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
                      Confirm Your Booking
                    </Typography>
                  </Box>

                  {/* Booking Details */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 600, mb: 1 }}>
                      Booking Details
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'text.secondary' }}>
                      Start Date: {startDate ? dayjs(startDate).format('MMMM D, YYYY') : 'Not selected'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: 'text.secondary' }}>
                      Start Time: {startTime ? startTime.format('h:mm A') : 'Not selected'}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontSize: isMobile ? '0.8rem' : '0.875rem', 
                      color: 'primary.main',
                      mt: 1,
                      fontStyle: 'italic'
                    }}>
                      Your service is set to start on {startDate ? dayjs(startDate).format('MMMM D, YYYY') : '___'} at {startTime ? startTime.format('h:mm A') : '___'}.
                    </Typography>
                  </Box>

                  {/* Service Duration */}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 600, mb: 1 }}>
                      Service Duration
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontSize: isMobile ? '0.8rem' : '0.875rem', 
                      color: 'text.secondary',
                      mb: 2
                    }}>
                      If you need more time, adjust your service duration below.
                    </Typography>

                    {/* Duration Selector */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      p: 2,
                      mb: 2
                    }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                          if (startTime && endTime) {
                            const currentDuration = endTime.diff(startTime, 'hour');
                            if (currentDuration > 1) {
                              const newEnd = startTime.add(currentDuration - 1, 'hour');
                              setEndTime(newEnd);
                              setEndDate(newEnd.toISOString());
                            }
                          }
                        }}
                        disabled={!startTime || !endTime || endTime.diff(startTime, 'hour') <= 1}
                        sx={{ minWidth: '40px', height: '40px' }}
                      >
                        -
                      </Button>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 600 }}>
                          {startTime && endTime ? endTime.diff(startTime, 'hour') : 1} hour{startTime && endTime && endTime.diff(startTime, 'hour') > 1 ? 's' : ''}
                        </Typography>
                      </Box>

                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                          if (startTime && endTime) {
                            const currentDuration = endTime.diff(startTime, 'hour');
                            const newEnd = startTime.add(currentDuration + 1, 'hour');
                            if (newEnd.hour() < 22) { // max 10 PM
                              setEndTime(newEnd);
                              setEndDate(newEnd.toISOString());
                            }
                          }
                        }}
                        disabled={!startTime || !endTime || endTime.hour() >= 21}
                        sx={{ minWidth: '40px', height: '40px' }}
                      >
                        +
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}

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
                  Relax, we'll handle the rest. Our verified professionals ensure your peace of mind.
                </Typography>
              </Box>
            </Box>
          )}

          {/* --- Short Term Option --- */}
          {selectedOption === "Short term" && (
            <Box display="flex" gap={isMobile ? 2 : 3} flexDirection="column">
              <DateTimePicker
                label="Select Start Date"
                value={startDate ? dayjs(startDate) : null}
                onChange={(newValue) => updateStartDate(newValue)}
                minDate={today}
                maxDate={maxDate90Days}
                shouldDisableDate={(date) => date.isBefore(today, "day")}
                format={startDate ? "MM/DD/YYYY hh:mm A" : "MM/DD/YYYY"}
                slotProps={{
                  textField: {
                    size: isMobile ? "small" : "medium",
                    fullWidth: true
                  }
                }}
              />
              <DateTimePicker
                label="Select End Date"
                value={endDate ? dayjs(endDate) : null}
                onChange={(newValue) => updateEndDate(newValue)}
                shouldDisableDate={shouldDisableEndDate}
                minDate={startDate ? dayjs(startDate).add(1, "day") : today}
                maxDate={startDate ? dayjs(startDate).add(20, "day") : today}
                format={endDate ? "MM/DD/YYYY hh:mm A" : "MM/DD/YYYY"}
                slotProps={{
                  textField: {
                    size: isMobile ? "small" : "medium",
                    fullWidth: true
                  }
                }}
              />
            </Box>
          )}

          {/* --- Monthly Option --- */}
          {selectedOption === "Monthly" && (
            <DateTimePicker
              label="Select Start Date"
              value={startDate ? dayjs(startDate) : null}
              onChange={(newValue) => {
                if (!newValue) return;
                updateStartDate(newValue);
              }}
              minDate={today}
              maxDate={maxDate90Days}
              shouldDisableDate={shouldDisableDate}
              format={startDate ? "MM/DD/YYYY hh:mm A" : "MM/DD/YYYY"}
              slotProps={{
                textField: {
                  size: isMobile ? "small" : "medium",
                  fullWidth: true
                }
              }}
            />
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
          Cancel
        </Button>
        <Button 
          onClick={handleAccept} 
          variant="contained" 
          disabled={isConfirmDisabled()}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDialog;