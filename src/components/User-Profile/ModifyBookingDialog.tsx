/* eslint-disable */
import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';

interface Booking {
  bookingType: string;
  id: number;
  startDate: string;
  endDate: string;
  timeSlot: string;
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
}

const ModifyBookingDialog: React.FC<ModifyBookingDialogProps> = ({
  open,
  onClose,
  booking,
  timeSlots,
  onSave,
}) => {
  const today = dayjs();
  const maxDate90Days = dayjs().add(90, 'day');

  const [startDate, setStartDate] = useState<Dayjs | null>(
    booking ? dayjs(booking.startDate) : null
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    booking ? dayjs(booking.endDate) : null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    booking?.timeSlot || ''
  );

  const shouldDisableStartDate = (date: Dayjs) => {
    return date.isBefore(today, 'day');
  };

  const shouldDisableEndDate = (date: Dayjs) => {
    if (!startDate) return true;
    const min = startDate.add(1, 'day');
    const max = startDate.add(20, 'day');
    return date.isBefore(min, 'day') || date.isAfter(max, 'day');
  };

  const resetForm = () => {
    setStartDate(booking ? dayjs(booking.startDate) : null);
    setEndDate(booking ? dayjs(booking.endDate) : null);
    setSelectedTimeSlot(booking?.timeSlot || '');
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    setStartDate(newValue);
    
    if (newValue && booking?.bookingType === 'MONTHLY') {
      setEndDate(newValue.add(1, 'month'));
    } else if (newValue && booking?.bookingType === 'SHORT_TERM') {
      setEndDate(newValue.add(1, 'day'));
    }
  };

  const handleSubmit = () => {
    if (!startDate) return;

    const timePortion = startDate.format('HH:mm');
    
    let finalEndDate = startDate;
    if (booking?.bookingType === 'MONTHLY') {
      finalEndDate = startDate.add(1, 'month');
    } else if (booking?.bookingType === 'SHORT_TERM') {
      finalEndDate = endDate || startDate.add(1, 'day');
    }

    onSave({
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: finalEndDate.format('YYYY-MM-DD'),
      timeSlot: timePortion,
    });
  };

  const handleClose = () => {
    onClose();
  };

  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Modify Booking</h3>
          {booking && (
            <div className="text-sm text-muted-foreground mt-2">
              <p>Current booking period: {dayjs(booking.startDate).format('DD/MM/YYYY')} to {dayjs(booking.endDate).format('DD/MM/YYYY')}</p>
              <p>Booking Type: {booking.bookingType}</p>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div>
              <Typography variant="subtitle2">New Start Date & Time</Typography>
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
                    size: 'small',
                  },
                }}
                ampm={false}
                format="YYYY-MM-DD HH:mm"
              />
            </div>

            {booking.bookingType === 'SHORT_TERM' && (
              <div>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  New End Date
                </Typography>
                <DateTimePicker
                  label="Select End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate ? startDate.add(1, 'day') : today}
                  maxDate={startDate ? startDate.add(20, 'day') : today}
                  shouldDisableDate={shouldDisableEndDate}
                  disabled={!startDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </div>
            )}
          </LocalizationProvider>
        </div>

        <div className="p-4 border-t flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={!startDate || (booking.bookingType === 'SHORT_TERM' && !endDate)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyBookingDialog;
