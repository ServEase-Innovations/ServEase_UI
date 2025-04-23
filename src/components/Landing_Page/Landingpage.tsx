import React, { useContext, useState } from "react";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Tooltip } from "@mui/material";
import "./Landingpage.css";
import DialogComponent from "../Common/DialogComponent/DialogComponent";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'; // New import
import { CONFIRMATION, DETAILS } from "../../Constants/pagesConstants";
import { COOK, MAID, NANNY } from "../../Constants/providerConstants";
import { ServiceProviderContext } from "../../context/ServiceProviderContext";
import { useDispatch } from "react-redux";
import { add } from "../../features/bookingType/bookingTypeSlice";
import { Bookingtype } from "../../types/bookingTypeData";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

interface ChildComponentProps {
  sendDataToParent: (data: string) => void;
  bookingType: (data: string) => void;
}

export const Landingpage: React.FC<ChildComponentProps> = ({ sendDataToParent, bookingType }) => {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedtype] = useState('');
  
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  
  const { selectedBookingType, setSelectedBookingType } = useContext(ServiceProviderContext);

  const dispatch = useDispatch();

  const handleStartDateChange = (newDate: any) => {
    setStartDate(newDate ? newDate.format('YYYY-MM-DD') : null); // Update state with selected date
  };

  const handleEndDateChange = (newDate: any) => {
    setEndDate(newDate ? newDate.format('YYYY-MM-DD') : null);
  };

  const [selectedRadioButtonValue, getSelectedRadioButtonValue] = React.useState<string>('');

  const handleClick = (data: string) => {
    setOpen(true);
    setSelectedtype(data);
    setSelectedBookingType(data);
  };

  const handleClose = (data: string) => {
    setOpen(false);
  };

  const handleSave = () => {
    console.log("Selected Start Date:", startDate);
    console.log("Selected End Date:", endDate);
    const booking: Bookingtype = {
      startDate,  // Use the state directly
      endDate,    // Use the state directly
      bookingPreference: selectedRadioButtonValue,
    };

    if (selectedRadioButtonValue === "Date") {
      bookingType(selectedType);
      sendDataToParent(CONFIRMATION);
    } else {
      sendDataToParent(DETAILS);
    }
    console.log("------- BOOKING------------", booking);
    dispatch(add(booking));
  };

  const getSelectedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    getSelectedRadioButtonValue(e.target.value);
    setStartDate(null);
    setEndDate(null); // Reset start and end dates when switching options
  };

  const getMaxEndDate = () => {
    if (!startDate) return ''; // Return empty if no start date
    const start = new Date(startDate);
    if(selectedRadioButtonValue === "Monthly"){
      start.setDate(start.getDate() + 31);
    } else {
      start.setDate(start.getDate() + 15);
    }
     // 4 days after start date
    return start.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
  };

  const isConfirmDisabled = () => {
    if (selectedRadioButtonValue === "Date") {
      return !(startDate && startTime && endTime);
    } else if (selectedRadioButtonValue === "Short term") {
      return !(startDate && endDate);
    } else if (selectedRadioButtonValue === "Monthly") {
      return !startDate;
    }
    return true;
  };
  

  return (
    <section className="landing-container">
      <div className="selector-container">
        <Tooltip title="Cook" arrow>
          <div className="selectors" onClick={() => handleClick(COOK)}>
            <img src="../newCook.png" alt="Cook" />
          </div>
        </Tooltip>
        <p className="label-text">Cook</p>
      </div>

      <div className="selector-container">
        <Tooltip title="Maid" arrow>
          <div className="selectors" onClick={() => handleClick(MAID)}>
            <img src="../maidWomen.png" alt="Maid" />
          </div>
        </Tooltip>
        <p className="label-text">Maid</p>
      </div>

      <div className="selector-container">
        <Tooltip title="Nanny" arrow>
          <div className="selectors" onClick={() => handleClick(NANNY)}>
            <img src="../newNanny.png" alt="Nanny" />
          </div>
        </Tooltip>
        <p className="label-text">Nanny</p>
      </div>

      <DialogComponent
        open={open}
        onClose={handleClose}
        title="Select your Booking"
        onSave={handleSave}
        disableConfirm={isConfirmDisabled()}
      >
        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Book by</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={selectedRadioButtonValue}
            onChange={getSelectedValue}
          >
            <FormControlLabel value="Date" control={<Radio />} label="Date" />
            <FormControlLabel value="Short term" control={<Radio />} label="Short term" />
            <FormControlLabel value="Monthly" control={<Radio />} label="Monthly" />
          </RadioGroup>
        </FormControl>
        {selectedRadioButtonValue === "Date" && (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <label htmlFor="startDate">Date</label>
      <DateCalendar
        value={startDate ? dayjs(startDate) : null}
        onChange={(newDate) => {
          const formattedDate = newDate ? newDate.format('YYYY-MM-DD') : null;
          setStartDate(formattedDate);
          setEndDate(formattedDate);
        }}
        disablePast
      />

      <TimePicker
        label="Start Time"
        value={startTime ? dayjs(startTime, 'HH:mm') : null}
        onChange={(newTime) => setStartTime(newTime ? newTime.format('HH:mm') : null)}
      />

      <TimePicker
        label="End Time"
        value={endTime ? dayjs(endTime, 'HH:mm') : null}
        onChange={(newTime) => setEndTime(newTime ? newTime.format('HH:mm') : null)}
        minTime={startTime ? dayjs(startTime, 'HH:mm') : undefined}
      />
    </div>
  </LocalizationProvider>
)}

    {selectedRadioButtonValue === "Short term" && (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div className="date-container">
      {/* Start Date Block */}
      <div className="date-block">
        <label htmlFor="startDate" className="date-label">
          Start Date
        </label>
        <DateCalendar
          value={startDate ? dayjs(startDate) : null}
          onChange={handleStartDateChange}
          disablePast
          sx={{ width: '100%' }}
        />
      </div>

      {/* End Date Block */}
      <div className="date-block">
        <label htmlFor="endDate" className="date-label">
          End Date
        </label>
        <DateCalendar
          value={endDate ? dayjs(endDate) : null}
          onChange={handleEndDateChange}
          minDate={dayjs(startDate)}
          maxDate={dayjs(getMaxEndDate())}
          sx={{ width: '100%' }}
        />
      </div>
    </div>
  </LocalizationProvider>
)}

{selectedRadioButtonValue === "Monthly" && (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label htmlFor="startDate">Start Date</label>
      <DateCalendar
        value={startDate ? dayjs(startDate) : null}
        onChange={(newDate) => {
          const formattedDate = newDate ? newDate.format('YYYY-MM-DD') : null;
          setStartDate(formattedDate);
          setEndDate(newDate ? newDate.add(1, 'month').format('YYYY-MM-DD') : null); // Auto-set end date to 1 month later
        }}
        disablePast
      />
    </div>
  </LocalizationProvider>
)}
      </DialogComponent>
    </section>
  );
};
