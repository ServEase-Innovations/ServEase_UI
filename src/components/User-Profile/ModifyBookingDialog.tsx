/* eslint-disable */
import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  LocalizationProvider,
  DateTimePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { Button } from "../Button/button";
import PaymentInstance from "src/services/paymentInstance";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import VacationManagementDialog from "./VacationManagement";

interface Booking {
  bookingType: string;
  id: number;
  startDate: string;
  endDate: string;
  timeSlot: string;
  service_type: string;
  customerId?: number;
  modifiedDate: string;
  bookingDate: string;
  hasVacation?: boolean;
  vacationDetails?: {
    start_date?: string;
    end_date?: string;
    leave_days?: number;
  };
  modifications?: Array<{
    date: string;
    action: string;
    changes?: {
      new_start_date?: string;
      new_end_date?: string;
      new_start_time?: string;
      start_date?: { from: string; to: string };
      end_date?: { from: string; to: string };
      start_time?: { from: string; to: string };
    };
    refund?: number;
    penalty?: number;
  }>;
}

interface ModifyBookingDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  timeSlots: string[];
  onSave: (updatedData: {
    startDate: string;
    endDate: string;
    timeSlot: string;
  }) => void;
  customerId: number | null;
  refreshBookings: () => Promise<void>;
  setOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModifyBookingDialog: React.FC<ModifyBookingDialogProps> = ({
  open,
  onClose,
  booking,
  timeSlots,
  onSave,
  customerId,
  refreshBookings,
  setOpenSnackbar,
}) => {
  const today = dayjs();
  const maxDate90Days = dayjs().add(90, "day");

  const [startDate, setStartDate] = useState<Dayjs | null>(
    booking ? dayjs(booking.startDate) : null
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    booking ? dayjs(booking.endDate) : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVacationDialogOpen, setIsVacationDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<
    "OPTIONS" | "BOOKING_DATE" | "BOOKING_TIME" | "VACATION"
  >("OPTIONS");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const shouldDisableStartDate = (date: Dayjs) => date.isBefore(today, "day");

  const shouldDisableEndDate = (date: Dayjs) => {
    if (!startDate) return true;
    const min = startDate.add(1, "day");
    const max = startDate.add(20, "day");
    return date.isBefore(min, "day") || date.isAfter(max, "day");
  };

  const getBookedTime = () => {
    if (!booking) return dayjs();
    const [time, period] = booking.timeSlot.split(" ");
    const [hoursStr, minutesStr] = time.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return dayjs(booking.startDate)
      .set("hour", hours)
      .set("minute", minutes)
      .set("second", 0);
  };

  const isModificationTimeAllowed = (startDate: string, timeSlot: string): boolean => {
    const now = dayjs();
    const [time, period] = timeSlot.split(" ");
    const [hoursStr, minutesStr] = time.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const bookingDateTime = dayjs(startDate)
      .set("hour", hours)
      .set("minute", minutes)
      .set("second", 0);
    return now.isBefore(bookingDateTime.subtract(30, "minute"));
  };

  const isBookingAlreadyModified = (booking: Booking | null): boolean => {
    if (!booking) return false;
    const modifications = booking.modifications ?? [];
    return modifications.some((mod) =>
      ["Date Rescheduled", "Time Rescheduled", "Modified", "Rescheduled"].some(
        (kw) => mod.action?.includes(kw)
      )
    );
  };

  const getModificationStatusMessage = (booking: Booking | null): string => {
    if (!booking) return "";
    if (isBookingAlreadyModified(booking))
      return "This booking has already been modified and cannot be modified again.";
    if (!isModificationTimeAllowed(booking.startDate, booking.timeSlot))
      return "Modification is only allowed at least 30 minutes before the scheduled time.";
    return "";
  };

  const isModificationDisabled = (booking: Booking | null): boolean => {
    if (!booking) return true;
    return (
      !isModificationTimeAllowed(booking.startDate, booking.timeSlot) ||
      isBookingAlreadyModified(booking)
    );
  };

  const getTimeUntilBooking = (booking: Booking | null): string => {
    if (!booking) return "";
    const bookedTime = getBookedTime();
    const now = dayjs();
    const diffMinutes = bookedTime.diff(now, "minute");
    if (diffMinutes <= 0) return "Booking has already started or passed";
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0
      ? `${hours}h ${minutes}m until booking starts`
      : `${minutes}m until booking starts`;
  };

  const getLastModificationDetails = (booking: Booking | null): string => {
    const modifications = booking?.modifications ?? [];
    if (modifications.length === 0) return "";
    const lastMod = modifications[modifications.length - 1];
    if (lastMod.changes?.start_date)
      return `Last rescheduled from ${lastMod.changes.start_date.from} to ${lastMod.changes.start_date.to}`;
    if (lastMod.changes?.start_time)
      return `Last time changed from ${lastMod.changes.start_time.from} to ${lastMod.changes.start_time.to}`;
    return `Last modified: ${lastMod.action}`;
  };

  /** ✅ handleSubmit — sends correct payload depending on modification type **/
  const handleSubmit = async () => {
    if (!startDate || !booking) return;

    if (isModificationDisabled(booking)) {
      setError(getModificationStatusMessage(booking));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isDateModification = selectedSection === "BOOKING_DATE";
      const isTimeModification = selectedSection === "BOOKING_TIME";

      // Base payload (common)
      let updatePayload: any = {
        modified_by_id: customerId,
        modified_by_role: "CUSTOMER", // change if admin modifies
      };

      if (isDateModification) {
        updatePayload = {
          ...updatePayload,
          start_date: startDate.format("YYYY-MM-DD"),
          end_date:
            booking.bookingType === "MONTHLY"
              ? startDate.add(1, "month").format("YYYY-MM-DD")
              : endDate
              ? endDate.format("YYYY-MM-DD")
              : startDate.add(1, "day").format("YYYY-MM-DD"),
        };
      }

       if (isTimeModification) {
      updatePayload = {
        ...updatePayload,
        start_time: startDate.format("HH:mm:ss"),
        end_time: startDate.add(1, "hour").format("HH:mm:ss"), // 👈 automatically +1 hour
      };
    }

      console.log("📦 Sending Payload:", updatePayload);

      const response = await PaymentInstance.put(
        `/api/engagements/${booking.id}`,
        updatePayload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (customerId !== null) await refreshBookings();

      onSave({
        startDate: updatePayload.start_date || booking.startDate,
        endDate: updatePayload.end_date || booking.endDate,
        timeSlot:
          updatePayload.start_time
            ? dayjs().set("hour", startDate.hour()).set("minute", startDate.minute()).format("hh:mm A")
            : booking.timeSlot,
      });

      setSuccess(
        isDateModification
          ? "Booking date rescheduled successfully!"
          : "Booking time rescheduled successfully!"
      );
      setOpenSnackbar(true);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error("❌ Error modifying booking:", error);
      setError("Failed to modify booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /** Reset states on open **/
  useEffect(() => {
    if (open && booking) {
      const bookedTime = getBookedTime();
      setStartDate(bookedTime);
      setEndDate(dayjs(booking.endDate));
      setError(null);
      setSuccess(null);
      setSelectedSection("OPTIONS");
      setIsCalendarOpen(false);
    }
  }, [open, booking]);

  useEffect(() => {
    if (selectedSection === "BOOKING_DATE" && open)
      setTimeout(() => setIsCalendarOpen(true), 100);
  }, [selectedSection, open]);

  if (!open || !booking) return null;

  const modificationDisabled = isModificationDisabled(booking);
  const statusMessage = getModificationStatusMessage(booking);
  const timeUntilBooking = getTimeUntilBooking(booking);
  const lastModificationDetails = getLastModificationDetails(booking);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogHeader className="flex justify-between items-center">
        <Typography variant="h6">Modify Booking</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogHeader>

      <DialogContent dividers>
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <Typography variant="body2" className="font-medium text-gray-700">
            Booking #{booking.id} - {booking.service_type}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Scheduled: {dayjs(booking.startDate).format("MMM D, YYYY")} at{" "}
            {booking.timeSlot}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            {timeUntilBooking}
          </Typography>

          {(booking.modifications?.length ?? 0) > 0 && (
            <div className="mt-2">
              <Typography variant="body2" className="text-amber-600 font-medium">
                This booking has been modified {(booking.modifications?.length ?? 0)} time(s)
              </Typography>
              <Typography variant="body2" className="text-amber-600 text-sm">
                {lastModificationDetails}
              </Typography>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {selectedSection === "OPTIONS" && (
          <div className="flex flex-col gap-3">
            {/* {booking?.hasVacation && (
              <Button
                onClick={() => setIsVacationDialogOpen(true)}
                variant="outlined"
                color="secondary"
                className="w-full"
              >
                Manage Vacation
              </Button>
            )} */}

            <Button
              variant="contained"
              fullWidth
              onClick={() => setSelectedSection("BOOKING_DATE")}
              disabled={modificationDisabled || isLoading}
              title={modificationDisabled ? statusMessage : "Reschedule Date"}
            >
              Reschedule Date
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setSelectedSection("BOOKING_TIME")}
              disabled={modificationDisabled || isLoading}
              title={modificationDisabled ? statusMessage : "Reschedule Time"}
            >
              Reschedule Time
            </Button>

            {modificationDisabled && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-700 text-center">{statusMessage}</p>
              </div>
            )}
          </div>
        )}

        {selectedSection === "BOOKING_DATE" && (
          <div className="space-y-4">
            <Typography variant="body2" className="text-gray-600">
              Select a new date for your booking.
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Select New Date"
                value={startDate}
                onChange={(newValue) => {
                  if (newValue) {
                    const originalTime = dayjs(booking.startDate);
                    const updated = newValue
                      .set("hour", originalTime.hour())
                      .set("minute", originalTime.minute());
                    setStartDate(updated);
                  }
                }}
                onClose={() => setIsCalendarOpen(false)}
                open={isCalendarOpen}
                views={["year", "month", "day"]}
                minDate={today}
                maxDate={maxDate90Days}
                shouldDisableDate={shouldDisableStartDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    onClick: () => setIsCalendarOpen(true),
                  },
                }}
              />
            </LocalizationProvider>
          </div>
        )}

        {selectedSection === "BOOKING_TIME" && (
          <div className="p-4 space-y-4">
            <Typography variant="body2" className="text-gray-600">
              Current Time: <strong>{booking.timeSlot}</strong>
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Select New Time"
                value={startDate}
                onChange={(newValue) => {
                  if (newValue) {
                    const updated = dayjs(booking.startDate)
                      .set("hour", newValue.hour())
                      .set("minute", newValue.minute());
                    setStartDate(updated);
                  }
                }}
                ampm
                slotProps={{
                  textField: { fullWidth: true, size: "small" },
                }}
              />
            </LocalizationProvider>
          </div>
        )}
      </DialogContent>

      {(selectedSection === "BOOKING_DATE" || selectedSection === "BOOKING_TIME") && (
        <DialogActions className="justify-between p-4">
          <Button onClick={() => setSelectedSection("OPTIONS")} variant="outlined">
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || modificationDisabled}
            variant="contained"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : selectedSection === "BOOKING_DATE" ? (
              "Save Date"
            ) : (
              "Save Time"
            )}
          </Button>
        </DialogActions>
      )}

    </Dialog>
  );
};

export default ModifyBookingDialog;
