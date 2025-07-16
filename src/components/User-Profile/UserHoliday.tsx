import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import Booking from './Bookings';
import { Button } from "../Button/button";

interface UserHolidayProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onLeaveSubmit: (startDate: string, endDate: string) => Promise<void>;
}

const UserHoliday: React.FC<UserHolidayProps> = ({ open, onClose, booking, onLeaveSubmit }) => {
  const [leaveStartDate, setLeaveStartDate] = useState<string>(booking?.startDate || '');
  const [leaveEndDate, setLeaveEndDate] = useState<string>(booking?.endDate || '');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!leaveStartDate || !leaveEndDate) return;
    
    setIsSubmitting(true);
    try {
      await onLeaveSubmit(leaveStartDate, leaveEndDate);
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error("Error submitting leave:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Start Date"
              type="date"
              value={leaveStartDate}
              onChange={(e) => setLeaveStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={isSubmitting}
            />
            <TextField
              label="End Date"
              type="date"
              value={leaveEndDate}
              onChange={(e) => setLeaveEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={isSubmitting}
            />
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