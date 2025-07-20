/* eslint-disable */
import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Button,
    Box,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);


interface BookingDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    selectedOption: string;
    onOptionChange: (val: string) => void;
    startDate: string | null;
    endDate: string | null;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
    setStartDate: (val: string | null) => void;
    setEndDate: (val: string | null) => void;
    setStartTime: (val: Dayjs | null) => void;
    setEndTime: (val: Dayjs | null) => void;
}

const BookingDialog: React.FC<BookingDialogProps> = ({
    open,
    onClose,
    onSave,
    selectedOption,
    onOptionChange,
    startDate,
    endDate,
    startTime,
    endTime,
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
}) => {
    const [value, setValue] = useState<Dayjs | null>(dayjs());

  const updateStartDate = (newValue: dayjs.Dayjs | null) => {
    if (newValue) {
        setStartDate(newValue.format("YYYY-MM-DD"));
        setStartTime(newValue);
        
        // Add this logic for Monthly preference
        if (selectedOption === "Monthly") {
            const endDateValue = newValue.add(1, 'month');
            setEndDate(endDateValue.format("YYYY-MM-DD"));
            setEndTime(endDateValue);
        }
        
        // For Date preference, set end date same as start date
        if (selectedOption === "Date") {
            setEndDate(newValue.format("YYYY-MM-DD"));
            setEndTime(newValue);
        }
    }
};

const updateEndDate = (newValue: dayjs.Dayjs | null) => {
    if (newValue) {
        setEndDate(newValue.format("YYYY-MM-DD")); // Changed to YYYY-MM-DD format
        setEndTime(newValue);
        // console.log("End Date (YYYY-MM-DD):", newValue.format("YYYY-MM-DD"));
        // console.log("End Time:", newValue.format("hh:mm A"));
    }
};

const isConfirmDisabled = () => {
  if (!selectedOption) return true;

  switch (selectedOption) {
    case "Date":
      return !startDate || !startTime;
    case "Short term":
      if (!startDate || !endDate || !startTime || !endTime) return true;
      return dayjs(endDate).isBefore(dayjs(startDate));
    case "Monthly":
      return !startDate || !startTime;
    default:
      return true;
  }
};
const handleOptionChange = (val: string) => {
  setStartDate(null);
  setEndDate(null);
  setStartTime(null);
  setEndTime(null);
  onOptionChange(val);
};
    const today = dayjs();
    const maxDate21Days = today.add(21, 'day');
     const maxDate90Days = today.add(90, 'day');
     // Function to disable dates outside our range
    // Disable dates outside the allowed range (differs by booking type)
    const shouldDisableDate = (date: Dayjs) => {
        if (selectedOption === "Monthly") {
            return date.isBefore(today, 'day') || date.isAfter(maxDate90Days, 'day');
        } else { // "Date" or "Short term"
            return date.isBefore(today, 'day') || date.isAfter(maxDate21Days, 'day');
        }
    };

    // Disable months outside the allowed range
    const shouldDisableMonth = (month: Dayjs) => {
        if (selectedOption === "Monthly") {
            return month.isBefore(today, 'month') || month.isAfter(maxDate90Days, 'month');
        } else { // "Date" or "Short term"
            return month.isBefore(today, 'month') || month.isAfter(maxDate21Days, 'month');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { width: "40%" } }}>
            <DialogTitle>Select your Booking</DialogTitle>
            <DialogContent>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend" sx={{ color: "primary.main", fontWeight: 500 }}>
                        Book by
                    </FormLabel>
                    <RadioGroup
                        row
                        name="booking-option"
                        value={selectedOption}
                        onChange={(e) => handleOptionChange(e.target.value)}
                    >
                        <FormControlLabel value="Date" control={<Radio />} label="Date" />
                        <FormControlLabel value="Short term" control={<Radio />} label="Short term" />
                        <FormControlLabel value="Monthly" control={<Radio />} label="Monthly" />
                    </RadioGroup>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {selectedOption === "Date" && (
                        <>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DateTimePicker']}>

                                    <DateTimePicker label="Basic date time picker" onChange={(newValue) => {
                                        updateStartDate(newValue);
                                    }} 
                                     minDate={today}
                                maxDate={maxDate21Days}
                                shouldDisableDate={shouldDisableDate}
                                disableFuture={false}
                                disablePast={false}
                                viewRenderers={{ month: undefined }}/>

                                </DemoContainer>
                            </LocalizationProvider>
                        </>
                    )}

                    {selectedOption === "Short term" && (
                        <Box display="flex" gap={3} displayPrint={"flex"} flexDirection="column">
                            <Box>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DateTimePicker']}>

                                        <DateTimePicker label="Basic date time picker" onChange={(newValue) => {
                                            updateStartDate(newValue);
                                        }} />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Box>
                            <Box>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DateTimePicker']}>

                                        <DateTimePicker label="Basic date time picker" onChange={(newValue) => {
                                            updateEndDate(newValue);
                                        }} />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Box>
                        </Box>
                    )}

                    {selectedOption === "Monthly" && (
                        <>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DateTimePicker']}>

                                    <DateTimePicker label="Basic date time picker" onChange={(newValue) => {
                                        updateStartDate(newValue);
                                    }} 
                                minDate={today}
                                maxDate={maxDate90Days}
                                shouldDisableDate={shouldDisableDate}
                                disableFuture={false}
                                disablePast={false}/>
                                </DemoContainer>
                            </LocalizationProvider>
                        </>
                    )}
                </LocalizationProvider>
            </DialogContent>

           <DialogActions>
    <Button onClick={onClose} variant="outlined">Cancel</Button>
    <Button 
        onClick={onSave} 
        variant="outlined"
        disabled={isConfirmDisabled()}
    >
        Confirm
    </Button>
</DialogActions>
        </Dialog>
    );
};

export default BookingDialog;
