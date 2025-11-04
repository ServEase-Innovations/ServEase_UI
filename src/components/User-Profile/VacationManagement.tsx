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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { Button } from "../Button/button";
import PaymentInstance from "src/services/paymentInstance";

interface VacationBooking {
  id: number;
  vacationDetails?: {
    leave_start_date?: string;
    leave_end_date?: string;
    total_days?: number;
  };
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

  // Calculate total days between start and end date
  const calculateTotalDays = (): number => {
    if (!startDate || !endDate) return 0;
    return endDate.diff(startDate, 'day') + 1;
  };

  const totalDays = calculateTotalDays();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && booking) {
      if (booking.vacationDetails?.leave_start_date && booking.vacationDetails?.leave_end_date) {
        setStartDate(dayjs(booking.vacationDetails.leave_start_date));
        setEndDate(dayjs(booking.vacationDetails.leave_end_date));
      } else {
        setStartDate(null);
        setEndDate(null);
      }
      setError(null);
      setSuccess(null);
    }
  }, [open, booking]);

  const handleApplyVacation = async () => {
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

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        vacation_start_date: startDate.format("YYYY-MM-DD"),
        vacation_end_date: endDate.format("YYYY-MM-DD"),
        modified_by_id: customerId,
        modified_by_role: "CUSTOMER",
      };

      console.log("📦 Applying vacation:", payload);

      const response = await PaymentInstance.put(
        `/api/engagements/${booking.id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccess("Vacation applied successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("❌ Error applying vacation:", error);
      setError("Failed to apply vacation. Please try again.");
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

  const hasExistingVacation = booking?.vacationDetails?.leave_start_date && 
                             booking?.vacationDetails?.leave_end_date;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }} className="flex justify-between items-center">
        <Typography variant="h6">Manage Vacation</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Existing Vacation Info */}
        {hasExistingVacation && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium">
              Current Vacation Period
            </Typography>
            <Typography variant="body2">
              {dayjs(booking.vacationDetails?.leave_start_date).format("MMM D, YYYY")} 
              {" to "}
              {dayjs(booking.vacationDetails?.leave_end_date).format("MMM D, YYYY")}
            </Typography>
            <Typography variant="body2">
              Total days: {booking.vacationDetails?.total_days}
            </Typography>
          </Alert>
        )}

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Vacation Date Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="medium" sx={{ mb: 2 }}>
            {hasExistingVacation ? "Modify Vacation Dates" : "Apply for Vacation"}
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DatePicker
                label="Vacation Start Date"
                value={startDate}
                onChange={setStartDate}
                minDate={today}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
              <DatePicker
                label="Vacation End Date"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate || today}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          {totalDays > 0 && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              Total vacation days: <strong>{totalDays}</strong>
            </Typography>
          )}
        </Box>

        {/* Vacation Policy Info */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Vacation Policy:</strong> During vacation period, services will be paused and 
            applicable refunds will be processed to your wallet. A penalty may apply for modifications 
            to existing vacation periods.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {hasExistingVacation && (
          <Button
            onClick={handleCancelVacation}
            variant="outlined"
            color="error"
            disabled={isLoading}
          >
            Cancel Vacation
          </Button>
        )}
        <Button
          onClick={handleApplyVacation}
          variant="contained"
          disabled={isLoading || !startDate || !endDate}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {hasExistingVacation ? "Updating..." : "Applying..."}
            </>
          ) : hasExistingVacation ? (
            "Update Vacation"
          ) : (
            "Apply Vacation"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VacationManagementDialog;