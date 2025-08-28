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

    const timePortion = startDate.format("HH:mm");
    let finalEndDate = startDate;
    if (booking.bookingType === "MONTHLY") {
      finalEndDate = startDate.add(1, "month");
    } else if (booking.bookingType === "SHORT_TERM") {
      finalEndDate = endDate || startDate.add(1, "day");
    }

    try {
      const updatePayload: any = {
        customerId: customerId,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: finalEndDate.format("YYYY-MM-DD"),
        timeslot: timePortion,
        modifiedBy: "CUSTOMER",
      };
      await axiosInstance.put(`/api/serviceproviders/update/engagement/${booking.id}`, updatePayload);
      onSave({
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: finalEndDate.format("YYYY-MM-DD"),
        timeSlot: timePortion,
      });
    } catch (error: any) {
      console.error("Error updating booking:", error);
      setError("Failed to update booking. Please try again.");
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

        {/* Options */}
        {selectedSection === "OPTIONS" && (
          <div className="p-6 flex flex-col gap-4">
            <Button variant="outlined" fullWidth onClick={() => setSelectedSection("VACATION")}>Modify Vacation</Button>

            {booking.bookingType === "MONTHLY" && (
              <>
                <Button variant="contained" fullWidth onClick={() => setSelectedSection("BOOKING_DATE")} disabled={modificationDisabled}>Reschedule Date</Button>
                <Button variant="contained" fullWidth onClick={() => setSelectedSection("BOOKING_TIME")} disabled={modificationDisabled}>Reschedule Time</Button>
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
              <button onClick={() => setSelectedSection("OPTIONS")} className="px-4 py-2 text-gray-700 border">Back</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Date</button>
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
              <button onClick={() => setSelectedSection("OPTIONS")} className="px-4 py-2 text-gray-700 border">Back</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Time</button>
            </div>
          </>
        )}

        {/* Vacation Section */}
        {selectedSection === "VACATION" && (
          <div className="p-6 space-y-4">
            <Typography variant="body1">Vacation modification section will go here.</Typography>
            <div className="p-4 border-t flex justify-between">
              <button onClick={() => setSelectedSection("OPTIONS")} className="px-4 py-2 text-gray-700 border">Back</button>
              <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModifyBookingDialog;