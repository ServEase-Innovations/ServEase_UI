/* eslint-disable */
import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import axiosInstance from '../../services/axiosInstance';
import { Button } from "../Button/button";
interface Booking {
  bookingType: string;
  id: number;
  startDate: string;
  endDate: string;
  timeSlot: string;
  serviceType: string;
  customerId?: number;
  modifiedDate: string;
  bookingDate: string;
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
}

const ModifyBookingDialog: React.FC<ModifyBookingDialogProps> = ({
  open,
  onClose,
  booking,
  timeSlots,
  onSave,
  customerId,
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

  const [selectedSection, setSelectedSection] = useState<
    "OPTIONS" | "BOOKING" | "VACATION"
  >("OPTIONS");

  const shouldDisableStartDate = (date: Dayjs) => date.isBefore(today, "day");

  const shouldDisableEndDate = (date: Dayjs) => {
    if (!startDate) return true;
    const min = startDate.add(1, "day");
    const max = startDate.add(20, "day");
    return date.isBefore(min, "day") || date.isAfter(max, "day");
  };

  // Check if modification is allowed based on time (30 minutes before booking)
  const isModificationTimeAllowed = (startDate: string, timeSlot: string) => {
    const today = dayjs();
    
    // Parse the time slot (e.g., "04:00 AM")
    const [time, period] = timeSlot.split(' ');
    const [hoursStr, minutesStr] = time.split(':');
    
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Create a dayjs object for the booking datetime
    const bookingDateTime = dayjs(startDate)
      .set('hour', hours)
      .set('minute', minutes)
      .set('second', 0);
    
    // Check if current time is at least 30 minutes before the booking
    return today.isBefore(bookingDateTime.subtract(30, 'minute'));
  };

  // Check if booking has already been modified
  const isBookingAlreadyModified = (booking: Booking | null): boolean => {
    if (!booking) return false;
    return new Date(booking.modifiedDate).getTime() !== new Date(booking.bookingDate).getTime();
  };

  // Get appropriate error message based on the disabled condition
  const getModificationStatusMessage = (booking: Booking | null): string => {
    if (!booking) return "";
    
    const timeAllowed = isModificationTimeAllowed(booking.startDate, booking.timeSlot);
    const alreadyModified = isBookingAlreadyModified(booking);
    
    if (alreadyModified) {
      return "This booking has already been modified and cannot be modified again.";
    }
    
    if (!timeAllowed) {
      return "Modification is only allowed at least 30 minutes before the scheduled time.";
    }
    
    return "";
  };

  // Check if modification is disabled based on both conditions
  const isModificationDisabled = (booking: Booking | null): boolean => {
    if (!booking) return true;
    
    const timeNotAllowed = !isModificationTimeAllowed(booking.startDate, booking.timeSlot);
    const alreadyModified = isBookingAlreadyModified(booking);
    
    return timeNotAllowed || alreadyModified;
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    setStartDate(newValue);

    if (newValue && booking?.bookingType === "MONTHLY") {
      setEndDate(newValue.add(1, "month"));
    } else if (newValue && booking?.bookingType === "SHORT_TERM") {
      setEndDate(newValue.add(1, "day"));
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !booking) return;

    // Check if modification is disabled based on both conditions
    if (isModificationDisabled(booking)) {
      setError(getModificationStatusMessage(booking));
      return;
    }

    setIsLoading(true);
    setError(null);

    const timePortion = startDate.format("HH:mm");

    let finalEndDate = startDate;
    if (booking.bookingType === "MONTHLY") {
      finalEndDate = startDate.add(1, "month");
    } else if (booking.bookingType === "SHORT_TERM") {
      finalEndDate = endDate || startDate.add(1, "day");
    }

    try {
      let updatePayload: any = {
        customerId: customerId,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: finalEndDate.format("YYYY-MM-DD"),
        timeslot: timePortion,
        modifiedBy: "CUSTOMER",
      };

      const response = await axiosInstance.put(
        `/api/serviceproviders/update/engagement/${booking.id}`,
        updatePayload
      );

      // Call the parent onSave with updated data
      onSave({
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: finalEndDate.format("YYYY-MM-DD"),
        timeSlot: timePortion,
      });

    } catch (error: any) {
      console.error("Error updating booking:", error);
      setError("Failed to update booking. Please try again.");
      if (error.response) {
        console.error("Full error response:", error.response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && booking) {
      setStartDate(dayjs(booking.startDate));
      setEndDate(dayjs(booking.endDate));
      setError(null);
      setSelectedSection("OPTIONS");
    }
  }, [open, booking]);

  if (!open || !booking) return null;

  const modificationDisabled = isModificationDisabled(booking);
  const statusMessage = getModificationStatusMessage(booking);

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === "dialog-backdrop") {
      onClose();
    }
  };

  return (
    <div
      id="dialog-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dialog
      >
        {/* Header with Close button */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Modify Options</h3>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Section Switcher */}
        {selectedSection === "OPTIONS" && (
          <div className="p-6 flex flex-col gap-4">
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setSelectedSection("VACATION")}
            >
              Modify Vacation
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setSelectedSection("BOOKING")}
              disabled={modificationDisabled}
            >
              Modify Booking
            </Button>
            {modificationDisabled && (
              <p className="text-sm text-red-600 text-center">
                {statusMessage}
              </p>
            )}
          </div>
        )}

        {/* Modify Booking Section */}
        {selectedSection === "BOOKING" && (
          <>
            <div className="p-4 space-y-4">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div>
                 
                  <DateTimePicker
                    label="Select Start Date & Time"
                    value={startDate}
                    onChange={handleStartDateChange}
                    minDate={today}
                    maxDate={maxDate90Days}
                    shouldDisableDate={shouldDisableStartDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                    }}
                    ampm={false}
                    format="YYYY-MM-DD HH:mm"
                  />
                </div>

                {booking.bookingType === "SHORT_TERM" && (
                  <div>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      New End Date
                    </Typography>
                    <DateTimePicker
                      label="Select End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      minDate={startDate ? startDate.add(1, "day") : today}
                      maxDate={startDate ? startDate.add(20, "day") : today}
                      shouldDisableDate={shouldDisableEndDate}
                      disabled={!startDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                        },
                      }}
                    />
                  </div>
                )}
              </LocalizationProvider>
            </div>

            <div className="p-4 border-t flex justify-between">
              <button
                onClick={() => setSelectedSection("OPTIONS")}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={
                    isLoading ||
                    !startDate ||
                    (booking.bookingType === "SHORT_TERM" && !endDate) ||
                    modificationDisabled
                  }
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modify Vacation Section (Placeholder for now) */}
        {selectedSection === "VACATION" && (
          <div className="p-6 space-y-4">
            <Typography variant="body1">
              Vacation modification section will go here.
            </Typography>

            <div className="p-4 border-t flex justify-between">
              <button
                onClick={() => setSelectedSection("OPTIONS")}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModifyBookingDialog;