/* eslint-disable */
import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Alert,
  Chip,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { Button } from "../Button/button";
import PaymentInstance from "src/services/paymentInstance";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";

interface VacationBooking {
  id: number;
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

const VacationManagementDialog: React.FC<VacationManagementDialogProps> = ({
  open,
  onClose,
  booking,
  customerId,
  onSuccess,
}) => {
  const today = dayjs();
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(true);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [endDateCalendarMonth, setEndDateCalendarMonth] = useState<Dayjs | null>(null);

  // Calculate total days between start and end date
  const calculateTotalDays = (): number => {
    if (!startDate || !endDate) return 0;
    return endDate.diff(startDate, 'day') + 1;
  };

  const totalDays = calculateTotalDays();

  // Get the first available end date (startDate + 9 days)
  const getFirstAvailableEndDate = (): Dayjs | null => {
    if (!startDate) return null;
    return startDate.add(9, 'day');
  };

  // Check if all dates in a month are disabled
  const isMonthFullyDisabled = (month: Dayjs): boolean => {
    if (!startDate) return false;
    
    const firstDayOfMonth = month.startOf('month');
    const lastDayOfMonth = month.endOf('month');
    const firstAvailableDate = getFirstAvailableEndDate();
    
    if (!firstAvailableDate) return false;
    
    // If the first available date is after the last day of this month, then all dates in this month are disabled
    return firstAvailableDate.isAfter(lastDayOfMonth);
  };

  // Get the calendar month that should be shown for end date picker
  const getEndDateCalendarMonth = (): Dayjs => {
    if (!startDate) return today;
    
    const firstAvailableDate = getFirstAvailableEndDate();
    if (!firstAvailableDate) return today;
    
    // Check if the start date's month is fully disabled
    const startDateMonth = startDate.startOf('month');
    if (isMonthFullyDisabled(startDateMonth)) {
      // If start date's month is fully disabled, show the month of first available date
      return firstAvailableDate.startOf('month');
    }
    
    // Otherwise, check if we need to show a different month based on current view
    if (endDateCalendarMonth) {
      const currentViewMonth = endDateCalendarMonth.startOf('month');
      if (isMonthFullyDisabled(currentViewMonth)) {
        // If the current view month is fully disabled, show the month of first available date
        return firstAvailableDate.startOf('month');
      }
    }
    
    return endDateCalendarMonth || firstAvailableDate.startOf('month');
  };

  const isEndDateDisabled = (date: Dayjs) => {
    if (!startDate) return false;
    
    const firstAvailableDate = getFirstAvailableEndDate();
    if (!firstAvailableDate) return true;
    
    // Disable all dates before the first available date
    return date.isBefore(firstAvailableDate, 'day');
  };

  // Check if selected dates meet minimum 10 days requirement
  const isValidVacationPeriod = (): boolean => {
    if (!startDate || !endDate) return false;
    const days = calculateTotalDays();
    return days >= 10;
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && booking && booking.vacation) {
      // Pre-fill with existing vacation dates
      const start = dayjs(booking.vacation?.start_date);
      const end = dayjs(booking.vacation?.end_date);
      setStartDate(start);
      setEndDate(end);
      
      setError(null);
      setSuccess(null);
      setStartDatePickerOpen(true);
      setEndDatePickerOpen(false);
      setEndDateCalendarMonth(null);
    }
  }, [open, booking]);

  // Auto-open start date picker when dialog opens
  useEffect(() => {
    if (open) {
      setStartDatePickerOpen(true);
    }
  }, [open]);

  // Update end date calendar month when start date changes
  useEffect(() => {
    if (startDate) {
      const calendarMonth = getEndDateCalendarMonth();
      setEndDateCalendarMonth(calendarMonth);
    }
  }, [startDate]);

  const handleStartDateChange = (newValue: Dayjs | null) => {
    setStartDate(newValue);
    setEndDate(null); // Reset end date when start date changes
    
    if (newValue) {
      const calendarMonth = getEndDateCalendarMonth();
      setEndDateCalendarMonth(calendarMonth);
    }
    
    setStartDatePickerOpen(false);
    
    // Auto-open end date picker after a short delay for better UX
    setTimeout(() => {
      setEndDatePickerOpen(true);
    }, 300);
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    setEndDate(newValue);
    setEndDatePickerOpen(false);
  };

  // Custom slot props to force the calendar to show the correct month
  const getEndDateSlotProps = () => {
    const slotProps: any = {
      textField: {
        fullWidth: true,
        size: "medium",
        placeholder: "Select end date",
        sx: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'background.paper',
          }
        }
      },
      popper: {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              mainAxis: false,
            },
          },
        ],
      },
      actionBar: {
        actions: ['today', 'accept', 'cancel', 'clear']
      },
      desktopPaper: {
        sx: {
          '& .MuiPickersCalendarHeader-root': {
            position: 'relative',
          },
        },
      },
    };

    // Force the calendar to show the specific month where enabled dates start
    if (endDateCalendarMonth && startDate) {
      const firstAvailableDate = getFirstAvailableEndDate();
      
      if (firstAvailableDate) {
        // Use referenceDate to control which month is displayed
        return {
          ...slotProps,
          referenceDate: firstAvailableDate
        };
      }
    }

    return slotProps;
  };

  const handleUpdateVacation = async () => {
    if (!startDate || !endDate || !booking) {
      setError("Please select both start and end dates");
      return;
    }

    if (startDate.isBefore(today, 'day')) {
      setError("Vacation start date cannot be in the past");
      return;
    }

    if (endDate.isBefore(startDate)) {
      setError("Vacation end date must be after start date");
      return;
    }

    if (!isValidVacationPeriod()) {
      setError("Vacation must be for minimum 10 days. Please select a later end date.");
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

      console.log("📦 Updating vacation:", payload);

      const response = await PaymentInstance.put(
        `/api/engagements/${booking.id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccess("Vacation updated successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("❌ Error updating vacation:", error);
      setError("Failed to update vacation. Please try again.");
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

      console.log("📦 Canceling vacation:", payload);

      const response = await PaymentInstance.put(
        `/api/engagements/${booking.id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccess("Vacation cancelled successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("❌ Error canceling vacation:", error);
      setError("Failed to cancel vacation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const firstAvailableEndDate = getFirstAvailableEndDate();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }
      }}
    > 
      <DialogHeader
  style={{
    position: "relative",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  <Box className="flex items-center gap-2">
    <EventIcon />
    <Typography variant="h6" fontWeight="600">Modify Vacation</Typography>
  </Box>

 <IconButton
  onClick={onClose}
  size="small"
  sx={{
    position: "absolute",
    right: 12,
    top: 12,
    color: "white",          // icon color
    width: 32,
    height: 32,
  }}
>
    <CloseIcon />
  </IconButton>
</DialogHeader>


      <DialogContent dividers sx={{ p: 4 }}>
        {/* Current Vacation Info */}
        {booking?.vacation && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              mb: 3, 
              bgcolor: 'info.light', 
              border: '1px solid',
              borderColor: 'info.main',
              borderRadius: 2
            }}
          >
            <Box className="flex items-center gap-2 mb-2">
              <EditCalendarIcon color="info" />
              <Typography variant="subtitle1" fontWeight="600" color="info.dark">
                Current Vacation Period
              </Typography>
            </Box>
            <Box className="flex flex-wrap gap-2 items-center">
              <Chip 
                label={dayjs(booking.vacation.start_date).format("MMM D, YYYY")} 
                variant="outlined"
                color="info"
                size="small"
              />
              <Typography variant="body2" color="text.secondary">to</Typography>
              <Chip 
                label={dayjs(booking.vacation.end_date).format("MMM D, YYYY")} 
                variant="outlined"
                color="info"
                size="small"
              />
              <Chip 
                label={`${booking.vacation.leave_days} days`} 
                color="info"
                size="small"
              />
            </Box>
          </Paper>
        )}

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Vacation Date Selection */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: 'text.primary' }}>
            Update Vacation Dates
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  Start Date
                </Typography>
                <DatePicker
                  open={startDatePickerOpen}
                  onOpen={() => setStartDatePickerOpen(true)}
                  onClose={() => setStartDatePickerOpen(false)}
                  value={startDate}
                  onChange={handleStartDateChange}
                  minDate={today}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "medium",
                      placeholder: "Select start date",
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                        }
                      }
                    },
                    popper: {
                      placement: 'bottom-start',
                    },
                    actionBar: {
                      actions: ['today', 'accept', 'cancel', 'clear']
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  End Date
                </Typography>
                <DatePicker
                  open={endDatePickerOpen}
                  onOpen={() => {
                    // When opening, ensure we're showing the correct month
                    if (startDate) {
                      const calendarMonth = getEndDateCalendarMonth();
                      setEndDateCalendarMonth(calendarMonth);
                    }
                    setEndDatePickerOpen(true);
                  }}
                  onClose={() => setEndDatePickerOpen(false)}
                  value={endDate}
                  onChange={handleEndDateChange}
                  minDate={startDate || today}
                  shouldDisableDate={isEndDateDisabled}
                  // Force the calendar to show the month where enabled dates start
                  {...(endDateCalendarMonth && {
                    referenceDate: endDateCalendarMonth
                  })}
                  slotProps={getEndDateSlotProps()}
                />
              </Box>
            </Box>
          </LocalizationProvider>

          {/* Date Information */}
          {startDate && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                <strong>Date Information:</strong>
              </Typography>
              <Box className="flex flex-wrap gap-4">
                {startDate && (
                  <Typography variant="body2">
                    Start: <strong>{startDate.format("MMM D, YYYY")}</strong>
                  </Typography>
                )}
                {endDate && (
                  <Typography variant="body2">
                    End: <strong>{endDate.format("MMM D, YYYY")}</strong>
                  </Typography>
                )}
                {totalDays > 0 && (
                  <Typography variant="body2" color={totalDays >= 10 ? "primary.main" : "error.main"} fontWeight="600">
                    Total days: {totalDays} {totalDays < 10 && "(Minimum 10 days required)"}
                  </Typography>
                )}
                {firstAvailableEndDate && (
                  <Typography variant="body2" color="warning.main" fontSize="0.75rem">
                    Note: Minimum 10 days vacation required. Select end date on or after {firstAvailableEndDate.format("MMM D, YYYY")}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Vacation Policy Info */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2.5, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: 'text.primary' }}>
            Vacation Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            • Minimum vacation period: <strong>10 days</strong><br/>
            • During vacation period, services will be paused and applicable refunds will be processed to your wallet<br/>
            • A penalty may apply for modifications to existing vacation periods
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          onClick={handleCancelVacation}
          variant="outlined"
          color="error"
          disabled={isLoading}
          sx={{ minWidth: 140 }}
        >
          Cancel Vacation
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={handleUpdateVacation}
          variant="contained"
          disabled={isLoading || !startDate || !endDate || !isValidVacationPeriod()}
          sx={{ minWidth: 160 }}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            "Update Vacation"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VacationManagementDialog;