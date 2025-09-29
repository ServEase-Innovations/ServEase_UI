/* eslint-disable */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import PaymentInstance from "src/services/paymentInstance";

// MUI X date pickers
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

interface VacationDetails {
  leave_start_date?: string;
  leave_end_date?: string;
  total_days?: number;
  refund_amount?: number;
}

interface VacationManagementDialogProps {
  open: boolean;
  onClose: () => void;
  booking: {
    id: number;
    vacationDetails?: VacationDetails;
  };
  customerId: number | null;
  onSuccess?: () => void;
}

const VacationManagementDialog: React.FC<VacationManagementDialogProps> = ({
  open,
  onClose,
  booking,
  customerId,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(null);

  const details = booking?.vacationDetails;
  const startDate = details?.leave_start_date
    ? dayjs(details.leave_start_date)
    : null;
  const endDate = details?.leave_end_date ? dayjs(details.leave_end_date) : null;

  const today = dayjs();

  // Total vacation days and max modifiable days (half)
  const totalVacationDays = endDate && startDate ? endDate.diff(startDate, "day") + 1 : 0;
  const maxModifiableDays = Math.floor(totalVacationDays / 2);

  // Initialize selected end date to the current vacation end
useEffect(() => {
  // Only set initial selectedEndDate once on mount or when booking changes
  if (booking?.vacationDetails?.leave_end_date) {
    setSelectedEndDate(dayjs(booking.vacationDetails.leave_end_date));
  }
}, [booking?.vacationDetails?.leave_end_date]);


  // Cancel vacation completely
  const handleCancelVacation = async () => {
    if (!booking || !customerId) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await PaymentInstance.delete(
        `/api/customer/${customerId}/leaves/${booking.id}`,
        {
          data: {
            engagement_id: booking.id,
            cancellation_reason: "Customer requested cancellation",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Vacation cancelled successfully!");
        if (onSuccess) onSuccess();
        setTimeout(onClose, 2000);
      } else {
        setError("Failed to cancel vacation. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to cancel vacation. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Modify vacation (shorten)
  const handleModifyVacation = async () => {
    if (!booking || !customerId || !selectedEndDate || !startDate) return;

    const daysSelected = selectedEndDate.diff(startDate, "day") + 1;
    if (daysSelected > maxModifiableDays) {
      setError(`You can only modify up to ${maxModifiableDays} day(s) of vacation.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await PaymentInstance.put(
        `/api/customer/${customerId}/leaves/${booking.id}`,
        {
          engagement_id: booking.id,
          new_end_date: selectedEndDate.format("YYYY-MM-DD"),
        }
      );

      if (response.data.success) {
        setSuccess("Vacation updated successfully!");
        if (onSuccess) onSuccess();
        setTimeout(onClose, 2000);
      } else {
        setError("Failed to update vacation. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to update vacation. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!startDate || !endDate) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage Vacation</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Vacation Details
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Start: {startDate.format("MMM D, YYYY")} <br />
            End: {endDate.format("MMM D, YYYY")} <br />
            Total Days: {totalVacationDays}
          </Typography>
        </Box>

        {error && (
          <Box mt={2} p={2} bgcolor="error.light" borderRadius={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {success && (
          <Box mt={2} p={2} bgcolor="success.light" borderRadius={2}>
            <Typography color="success.contrastText">{success}</Typography>
          </Box>
        )}

        {/* Modify vacation section */}
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Modify Vacation End Date
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Select a new end date (you can shorten vacation up to {maxModifiableDays} day(s)).
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedEndDate}
              onChange={(date) => {
                if (!date) return;
                const daysSelected = date.diff(startDate, "day") + 1;
                if (daysSelected > maxModifiableDays) {
                  setSelectedEndDate(startDate.add(maxModifiableDays - 1, "day"));
                } else {
                  setSelectedEndDate(date);
                }
              }}
              shouldDisableDate={(date) =>
                date.isBefore(today, "day") || date.isAfter(endDate, "day")
              }
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Close
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleCancelVacation}
          disabled={isLoading}
        >
          {isLoading ? "Cancelling..." : "Cancel Vacation"}
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleModifyVacation}
          disabled={!selectedEndDate || isLoading}
        >
          {isLoading ? "Updating..." : "Update Vacation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VacationManagementDialog;
