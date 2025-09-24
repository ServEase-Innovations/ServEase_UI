/* eslint-disable */
import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { Button } from "../Button/button";
import axios from "axios";

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
    leave_start_date?: string;
    leave_end_date?: string;
    total_days?: number;
    refund_amount?: number;
  };
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

  const [selectedSection, setSelectedSection] = useState<
    "OPTIONS" | "BOOKING_DATE" | "BOOKING_TIME" | "VACATION"
  >("OPTIONS");

  const shouldDisableStartDate = (date: Dayjs) => date.isBefore(today, "day");

  const shouldDisableEndDate = (date: Dayjs) => {
    if (!startDate) return true;
    const min = startDate.add(1, "day");
    const max = startDate.add(20, "day");
    return date.isBefore(min, "day") || date.isAfter(max, "day");
  };

  // Extract the actual booked time from the booking
  const getBookedTime = () => {
    if (!booking) return dayjs();
    
    // Parse the time slot from the booking
    const [time, period] = booking.timeSlot.split(' ');
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    // Create a dayjs object with the booked time
    const bookedDate = dayjs(booking.startDate);
    return bookedDate.set('hour', hours).set('minute', minutes).set('second', 0);
  };

  // --- Checks for modification eligibility ---
  const isModificationTimeAllowed = (startDate: string, timeSlot: string) => {
    const now = dayjs();
    const [time, period] = timeSlot.split(' ');
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const bookingDateTime = dayjs(startDate).set('hour', hours).set('minute', minutes).set('second', 0);
    return now.isBefore(bookingDateTime.subtract(30, 'minute'));
  };

  const isBookingAlreadyModified = (booking: Booking | null): boolean => {
    if (!booking) return false;
    return new Date(booking.modifiedDate).getTime() !== new Date(booking.bookingDate).getTime();
  };

  const getModificationStatusMessage = (booking: Booking | null): string => {
    if (!booking) return "";
    if (isBookingAlreadyModified(booking)) return "This booking has already been modified and cannot be modified again.";
    if (!isModificationTimeAllowed(booking.startDate, booking.timeSlot)) return "Modification is only allowed at least 30 minutes before the scheduled time.";
    return "";
  };

  const isModificationDisabled = (booking: Booking | null): boolean => {
    if (!booking) return true;
    return !isModificationTimeAllowed(booking.startDate, booking.timeSlot) || isBookingAlreadyModified(booking);
  };

  const handleSubmit = async () => {
    if (!startDate || !booking) return;
    if (isModificationDisabled(booking)) {
      setError(getModificationStatusMessage(booking));
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Determine what type of modification based on selected section
      const isDateModification = selectedSection === "BOOKING_DATE";
      const isTimeModification = selectedSection === "BOOKING_TIME";
      
      // Prepare the update payload - only include what's being modified
      const updatePayload: any = {};

      if (isDateModification) {
        // Only send date changes for date rescheduling
        updatePayload.new_start_date = startDate.format("YYYY-MM-DD");
        
        // Calculate new end date based on booking type
        let finalEndDate = startDate;
        if (booking.bookingType === "MONTHLY") {
          finalEndDate = startDate.add(1, "month");
        } else if (booking.bookingType === "SHORT_TERM") {
          finalEndDate = endDate || startDate.add(1, "day");
        }
        updatePayload.new_end_date = finalEndDate.format("YYYY-MM-DD");
        
      } else if (isTimeModification) {
        // Only send time changes for time rescheduling
        const newStartTime = startDate.format("HH:mm");
        updatePayload.new_startTime = newStartTime;
      }

      console.log("Update payload:", updatePayload);

      // Make the API call
      const response = await axios.put(
        `https://payments-j5id.onrender.com/api/engagements/${booking.id}`,
        updatePayload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh the main bookings data after successful modification
      if (customerId !== null) {
        await refreshBookings();
      }

      // Calculate final end date for the onSave callback
      let finalEndDate = startDate;
      if (booking.bookingType === "MONTHLY") {
        finalEndDate = startDate.add(1, "month");
      } else if (booking.bookingType === "SHORT_TERM") {
        finalEndDate = endDate || startDate.add(1, "day");
      }

      const newStartTime = startDate.format("HH:mm");

      // Call the onSave callback with updated data
      onSave({
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: finalEndDate.format("YYYY-MM-DD"),
        timeSlot: newStartTime,
      });

      setSuccess("Booking modified successfully!");
      setOpenSnackbar(true);
      
      // Close the dialog after successful modification
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error("Error modifying booking:", error);
      setError("Failed to modify booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && booking) {
      const bookedTime = getBookedTime();
      setStartDate(bookedTime);
      setEndDate(dayjs(booking.endDate));
      setError(null);
      setSuccess(null);
      setSelectedSection("OPTIONS");
    }
  }, [open, booking]);

  if (!open || !booking) return null;

  const modificationDisabled = isModificationDisabled(booking);
  const statusMessage = getModificationStatusMessage(booking);

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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Modify Options</h3>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </div>

        {error && (<div className="p-4 bg-red-50 border-b border-red-200"><p className="text-red-700 text-sm">{error}</p></div>)}
        {success && (<div className="p-4 bg-green-50 border-b border-green-200"><p className="text-green-700 text-sm">{success}</p></div>)}

        {/* Options */}
        {selectedSection === "OPTIONS" && (
          <div className="p-6 flex flex-col gap-4">
            {booking?.hasVacation && (
              <Button
                onClick={() => setSelectedSection("VACATION")}
                variant="outlined"
                color="secondary"
                className="w-full mt-3"
              >
                Manage Vacation
              </Button>
            )}

            {booking.bookingType === "MONTHLY" && (
              <>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => setSelectedSection("BOOKING_DATE")} 
                  disabled={modificationDisabled || isLoading}
                >
                  Reschedule Date
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => setSelectedSection("BOOKING_TIME")} 
                  disabled={modificationDisabled || isLoading}
                >
                  Reschedule Time
                </Button>
              </>
            )}

            {modificationDisabled && (<p className="text-sm text-red-600 text-center">{statusMessage}</p>)}
          </div>
        )}

        {/* Reschedule Date */}
        {selectedSection === "BOOKING_DATE" && (
          <>
            <div className="p-4 space-y-4">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Select New Date"
                  value={startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      const originalTime = dayjs(booking.startDate);
                      const updated = newValue.set("hour", originalTime.hour()).set("minute", originalTime.minute());
                      setStartDate(updated);
                    }
                  }}
                  views={['year','month','day']}
                  minDate={today}
                  maxDate={maxDate90Days}
                  shouldDisableDate={shouldDisableStartDate}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </LocalizationProvider>
            </div>
            <div className="p-4 border-t flex justify-between">
              <button 
                onClick={() => setSelectedSection("OPTIONS")} 
                className="px-4 py-2 text-gray-700 border rounded-md"
                disabled={isLoading}
              >
                Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Date'
                )}
              </button>
            </div>
          </>
        )}

        {/* Reschedule Time */}
        {selectedSection === "BOOKING_TIME" && (
          <>
            <div className="p-4 space-y-4">
              <div className="mb-4">
                <Typography variant="body2" className="text-gray-600 mb-2">
                  Current Booked Time: <strong>{booking.timeSlot}</strong>
                </Typography>
              </div>
              
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Select New Time"
                  value={startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      const originalDate = dayjs(booking.startDate);
                      const updated = originalDate.set("hour", newValue.hour()).set("minute", newValue.minute());
                      setStartDate(updated);
                    }
                  }}
                  views={['hours','minutes']}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  ampm={true}
                />
              </LocalizationProvider>
            </div>
            <div className="p-4 border-t flex justify-between">
              <button 
                onClick={() => setSelectedSection("OPTIONS")} 
                className="px-4 py-2 text-gray-700 border rounded-md"
                disabled={isLoading}
              >
                Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Time'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModifyBookingDialog;