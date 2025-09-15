import React, { useState } from "react";
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
import axios from "axios";

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
  const [newEndDate, setNewEndDate] = useState<Dayjs | null>(null);

  const details = booking?.vacationDetails;
  const startDate = details?.leave_start_date
    ? dayjs(details.leave_start_date)
    : null;
  const endDate = details?.leave_end_date
    ? dayjs(details.leave_end_date)
    : null;
  const today = dayjs();

  // Cancel vacation completely
  const handleCancelVacation = async () => {
    if (!booking || !customerId) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete(
        `https://payments-j5id.onrender.com/api/customer/${customerId}/leaves/${booking.id}`,
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
    if (!booking || !customerId || !newEndDate) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put(
        `https://payments-j5id.onrender.com/api/customer/${customerId}/leaves/${booking.id}`,
        {
          engagement_id: booking.id,
          new_end_date: newEndDate.format("YYYY-MM-DD"),
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage Vacation</DialogTitle>
      <DialogContent dividers>
        {details ? (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Vacation Details
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Start: {startDate?.format("MMM D, YYYY")} <br />
              End: {endDate?.format("MMM D, YYYY")} <br />
              Total Days: {details?.total_days}
            </Typography>
          </Box>
        ) : (
          <Typography>No vacation details available.</Typography>
        )}

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
        {startDate && endDate && (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Modify Vacation End Date
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Select a new end date (between {startDate.format("MMM D")} and{" "}
              {endDate.format("MMM D")}).
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={newEndDate}
                onChange={setNewEndDate}
                shouldDisableDate={(date) =>
                  date.isBefore(startDate, "day") ||
                  date.isAfter(endDate, "day")
                }
              />
            </LocalizationProvider>
          </Box>
        )}
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
          disabled={!newEndDate || isLoading}
        >
          {isLoading ? "Updating..." : "Update Vacation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VacationManagementDialog;
