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
  IconButton,
  Typography
} from '@mui/material';
import { LocalizationProvider, DateTimePicker, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from 'dayjs';
import { Button } from "../Button/button";
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationDialog from './ConfirmationDialog';
import { getServiceTitle } from '../Common/Booking/BookingUtils';
import { DialogHeader } from '../ProviderDetails/CookServicesDialog.styles';

interface Booking {
  id: number;
  service_type: string;
  startDate: string;
  endDate: string;
  bookingType: string;
}

interface UserHolidayProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onLeaveSubmit: (startDate: string, endDate: string, service_type: string) => Promise<void>;
}

const UserHoliday: React.FC<UserHolidayProps> = ({ open, onClose, booking, onLeaveSubmit }) => {
  const [leaveStartDate, setLeaveStartDate] = useState<Dayjs | null>(null);
  const [leaveEndDate, setLeaveEndDate] = useState<Dayjs | null>(null);
  const [minDate, setMinDate] = useState<Dayjs | undefined>();
  const [maxDate, setMaxDate] = useState<Dayjs | undefined>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (booking) {
      const start = dayjs(booking.startDate);
      const end = dayjs(booking.endDate);

      // ✅ Ensure start date cannot be in the past
      const today = dayjs().startOf('day');
      const effectiveMin = start.isBefore(today) ? today : start;

      setMinDate(effectiveMin);
      setMaxDate(end);
      setLeaveStartDate(effectiveMin);
      setLeaveEndDate(null); // let user pick end date
    }
  }, [booking]);

  const handleSubmit = async () => {
    if (!leaveStartDate || !leaveEndDate || !booking?.service_type) return;

    if (leaveStartDate.isBefore(minDate) || leaveEndDate.isAfter(maxDate)) {
      alert('Holiday dates must be within your booked period');
      return;
    }

    const diffInDays = leaveEndDate.diff(leaveStartDate, 'day') + 1;
    if (diffInDays < 10) {
      alert('Leave duration must be at least 10 days');
      return;
    }

    onClose();
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!leaveStartDate || !leaveEndDate || !booking?.service_type) return;

    setIsSubmitting(true);
    try {
      await onLeaveSubmit(
        leaveStartDate.format('YYYY-MM-DD'),
        leaveEndDate.format('YYYY-MM-DD'),
        booking.service_type
      );
      setSnackbarOpen(true);
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error("Error submitting leave:", error);
      alert('Failed to submit leave application. Please try again.');
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
  
  {/* ✅ Custom DialogHeader */}
  <DialogHeader
  >
    <Typography variant="h6" fontWeight="600">
      Apply Holiday
    </Typography>

    {/* ✅ White Close Button */}
    <IconButton
      aria-label="close"
      onClick={onClose}
      sx={{
        position: "absolute",
        right: 12,
        top: 12,
        color: "white",
        width: 32,
        height: 32,
       
      }}
    >
      <CloseIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </DialogHeader>

  {/* Dialog Content */}
  <DialogContent>
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        
        {/* Start Date */}
       <DatePicker
          label="Start Date"
          value={leaveStartDate}
          onChange={(newValue) => {
            setLeaveStartDate(newValue);
            setLeaveEndDate(null);
          }}
          shouldDisableDate={disableDates}
          minDate={minDate}
          maxDate={maxDate}
          slotProps={{ textField: { fullWidth: true } }}
        />

        {/* End Date */}
       <DatePicker
          label="End Date"
          value={leaveEndDate}
          onChange={(newValue) => setLeaveEndDate(newValue)}
          shouldDisableDate={disableDates}
          minDate={leaveStartDate ? leaveStartDate.add(9, "day") : minDate}
          maxDate={maxDate}
          slotProps={{ textField: { fullWidth: true } }}
        />

      </LocalizationProvider>

      {/* Note */}
      <Typography variant="body2" color="textSecondary">
        📌 Note: Holiday applications must be for a minimum of 10 days.  
        You can only select an end date that is at least 9 days after your start date.
      </Typography>

      {/* Booking Info */}
      {booking && (
        <div className="text-sm text-muted-foreground">
          <p>Your booked period: {dayjs(booking.startDate).format('DD/MM/YYYY')} to {dayjs(booking.endDate).format('DD/MM/YYYY')}</p>
          <p>Service Type: {booking.service_type}</p>
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
      Submit
    </Button>
  </DialogActions>

</Dialog>

      <ConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Vacation Application"
        message={`Are you sure you want to apply for vacation from ${leaveStartDate?.format('MMMM DD, YYYY')} to ${leaveEndDate?.format('MMMM DD, YYYY')} for your ${getServiceTitle(booking?.service_type || '')} service?`}
        confirmText="Yes, Apply"
        cancelText="Cancel"
        loading={isSubmitting}
        severity="info"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Vacation application submitted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};



export default UserHoliday;
