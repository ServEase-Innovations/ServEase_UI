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
        setStartDate(newValue.format("YYYY-MM-DD")); // Changed to YYYY-MM-DD format
        setStartTime(newValue);
        // console.log("Start Date (YYYY-MM-DD):", newValue.format("YYYY-MM-DD"));
        // console.log("Start Time:", newValue.format("hh:mm A"));
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
                        onChange={(e) => onOptionChange(e.target.value)}
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
                                    }} />
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
                                    }} />
                                </DemoContainer>
                            </LocalizationProvider>
                        </>
                    )}
                </LocalizationProvider>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={onSave} variant="outlined">Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BookingDialog;
