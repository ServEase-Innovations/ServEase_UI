/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
  IconButton
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from 'dayjs';
import Booking from './Bookings';
import { Button } from "../Button/button";
import CloseIcon from '@mui/icons-material/Close';
interface UserHolidayProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onLeaveSubmit: (startDate: string, endDate: string, serviceType: string) => Promise<void>;
}

const UserHoliday: React.FC<UserHolidayProps> = ({ open, onClose, booking, onLeaveSubmit }) => {
  const [leaveStartDate, setLeaveStartDate] = useState<Dayjs | null>(null);
  const [leaveEndDate, setLeaveEndDate] = useState<Dayjs | null>(null);
  const [minDate, setMinDate] = useState<Dayjs | undefined>();
  const [maxDate, setMaxDate] = useState<Dayjs | undefined>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      const start = dayjs(booking.startDate);
      const end = dayjs(booking.endDate);
      setMinDate(start);
      setMaxDate(end);
      setLeaveStartDate(start);
      setLeaveEndDate(end);
    }
  }, [booking]);

  const handleSubmit = async () => {
  if (!leaveStartDate || !leaveEndDate || !booking?.serviceType) return;

  if (leaveStartDate.isBefore(minDate) || leaveEndDate.isAfter(maxDate)) {
    alert('Holiday dates must be within your booked period');
    return;
  }

  const diffInDays = leaveEndDate.diff(leaveStartDate, 'day') + 1;
  if (diffInDays < 10) {
    alert('Leave duration must be at least 10 days');
    return;
  }

  setIsSubmitting(true);
  try {
    await onLeaveSubmit(
      leaveStartDate.format('YYYY-MM-DD'),
      leaveEndDate.format('YYYY-MM-DD'),
      booking.serviceType
    );
    setSnackbarOpen(true);
    onClose();
  } catch (error) {
    console.error("Error submitting leave:", error);
  } finally {
    setIsSubmitting(false);
  }
};


 const disableDates = (date: Dayjs): boolean => {
  if (!minDate || !maxDate) return false;
  return date.isBefore(minDate) || date.isAfter(maxDate);
};


  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Holiday
            <IconButton
    aria-label="close"
    onClick={onClose}
    sx={{
      position: 'absolute',
      right: 8,
      top: 8,
      color: (theme) => theme.palette.grey[500],
    }}
  >
    <CloseIcon />
  </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Start Date"
                value={leaveStartDate}
                onChange={(newValue) => setLeaveStartDate(newValue)}
                shouldDisableDate={disableDates}
                minDate={minDate}
                maxDate={maxDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="End Date"
                value={leaveEndDate}
                onChange={(newValue) => setLeaveEndDate(newValue)}
                shouldDisableDate={disableDates}
                minDate={leaveStartDate || minDate}
                maxDate={maxDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            {booking && (
              <div className="text-sm text-muted-foreground">
                <p>Your booked period: {dayjs(booking.startDate).format('DD/MM/YYYY')} to {dayjs(booking.endDate).format('DD/MM/YYYY')}</p>
                <p>Service Type: {booking.serviceType}</p>
                <p>Booking Type: {booking.bookingType}</p>
              </div>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={isSubmitting || !leaveStartDate || !leaveEndDate}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Leave'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Leave application submitted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserHoliday;
