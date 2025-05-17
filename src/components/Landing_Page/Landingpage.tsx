import React, { useContext, useState, useEffect } from "react";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Tooltip } from "@mui/material";
import "./Landingpage.css";
import DialogComponent from "../Common/DialogComponent/DialogComponent";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { CONFIRMATION, DETAILS } from "../../Constants/pagesConstants";
import { COOK, MAID, NANNY } from "../../Constants/providerConstants";
import { ServiceProviderContext } from "../../context/ServiceProviderContext";
import { useDispatch } from "react-redux";
import { add } from "../../features/bookingType/bookingTypeSlice";
import { Bookingtype } from "../../types/bookingTypeData";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import MaidServiceDialog from "../ProviderDetails/MaidServiceDialog";
import CookServicesDialog from "../ProviderDetails/CookServicesDialog";
import NannyServicesDialog from "../ProviderDetails/NannyServicesDialog";
import { FaBell } from "react-icons/fa";

const publicVapidKey = 'BO0fj8ZGgK5NOd9lv0T0E273Uh4VptN2d8clBns7aOBusDGbIh\_ZIyQ8W8C-WViT1bdJlr0NkEozugQQqj8\_nTo';

interface ChildComponentProps {
  sendDataToParent: (data: string) => void;
  bookingType: (data: string) => void;
}

export const Landingpage: React.FC<ChildComponentProps> = ({ sendDataToParent, bookingType }) => {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedtype] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>(Notification.permission);

  const { selectedBookingType, setSelectedBookingType } = useContext(ServiceProviderContext);
  const dispatch = useDispatch();

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        if ('serviceWorker' in navigator && 'Notification' in window) {
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);
          
          if (permission === 'granted') {
            await subscribeUser();
          }
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };

    // Only request permission if it hasn't been granted or denied yet
    if (notificationPermission === 'default') {
      requestNotificationPermission();
    } else if (notificationPermission === 'granted') {
      // If already granted, subscribe the user
      subscribeUser();
    }
  }, [notificationPermission]);

  const handleStartDateChange = (newDate: any) => {
    setStartDate(newDate ? newDate.format('YYYY-MM-DD') : null);
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
    let duration = 0;
    let timeRange = "";

    if (selectedRadioButtonValue === "Date") {
      duration = calculateDuration(startTime, endTime);
      timeRange = `${startTime} - ${endTime}`;
    }

    const booking: Bookingtype = {
      startDate,
      endDate,
      bookingPreference: selectedRadioButtonValue,
      startTime: selectedRadioButtonValue === "Date" ? startTime : undefined,
      endTime: selectedRadioButtonValue === "Date" ? endTime : undefined,
      timeRange: selectedRadioButtonValue === "Date" ? timeRange : undefined,
      duration: selectedRadioButtonValue === "Date" ? duration : undefined
    };

    if (selectedRadioButtonValue === "Date") {
      setOpenServiceDialog(true);
    } 

    if (selectedRadioButtonValue != "Date") {
      sendDataToParent(DETAILS);
    }

    dispatch(add(booking));
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return (endTotalMinutes - startTotalMinutes) / 60;
  };

  const getSelectedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    getSelectedRadioButtonValue(e.target.value);
    setStartDate(null);
    setEndDate(null);
  };

  const getMaxEndDate = () => {
    if (!startDate) return '';
    const start = new Date(startDate);
    if(selectedRadioButtonValue === "Monthly"){
      start.setDate(start.getDate() + 31);
    } else {
      start.setDate(start.getDate() + 15);
    }
    return start.toISOString().split('T')[0];
  };

  const isConfirmDisabled = () => {
    if (selectedRadioButtonValue === "Date") {
      return !(startDate && startTime.trim() !== "" && endTime.trim() !== "");
    } else if (selectedRadioButtonValue === "Short term") {
      return !(startDate && endDate);
    } else if (selectedRadioButtonValue === "Monthly") {
      return !startDate;
    }
    return true;
  };

  const subscribeUser = async () => {
    try {
      const register = await navigator.serviceWorker.ready;

      const existingSubscription = await register.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      await fetch('http://localhost:4000/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('User subscribed:', subscription);
    } catch (error) {
      console.error('Error subscribing user:', error);
    }
  };

  const triggerNotification = async () => {
    try {
      const response = await fetch('http://localhost:4000/send-notification', {
        method: 'POST',
        body: JSON.stringify({
          title: "Hello from your App!",
          body: "This is a test push notification.",
          url: "http://localhost:3000"
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        console.log('Notification triggered!');
        alert('Notification sent!');
      } else {
        console.error('Notification failed');
        alert('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    }
  };

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);

    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <section className="landing-container">
      {/* <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaBell
          size={24}
          style={{ cursor: 'pointer' }}
          onClick={triggerNotification}
          title="Send Test Notification"
        />
      </div> */}

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

              <div style={{ display: 'flex', gap: '75px' }}>
                <div className="field">
                  <div className="input-with-label">
                    <span className="inline-label">Start Time</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="time-input"
                      required
                      style={{
                        border: startTime ? '2px solid #1976d2' : '1px solid #ccc',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div className="field">
                  <div className="input-with-label">
                    <span className="inline-label">End Time</span>
                    <input
                      type="time"
                      value={endTime}
                      min={startTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="time-input"
                      required
                      style={{
                        border: endTime ? '2px solid #1976d2' : '1px solid #ccc',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </LocalizationProvider>
        )}

        {selectedRadioButtonValue === "Short term" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="date-container">
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
                  setEndDate(newDate ? newDate.add(1, 'month').format('YYYY-MM-DD') : null);
                }}
                disablePast
              />
            </div>
          </LocalizationProvider>
        )}
      </DialogComponent>

      {selectedType === "cook" && (
        <CookServicesDialog
          open={openServiceDialog}
          handleClose={() => setOpenServiceDialog(false)}
        />
      )}
      {selectedType === "maid" && (
        <MaidServiceDialog
          open={openServiceDialog}
          handleClose={() => setOpenServiceDialog(false)}
        />
      )}
      {selectedType === "nanny" && (
        <NannyServicesDialog
          open={openServiceDialog}
          handleClose={() => setOpenServiceDialog(false)}
        />
      )}
    </section>
  );
};