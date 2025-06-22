import React, { useState } from "react";
import { Button } from "../Button/button";
import { Card, CardContent } from "../Card/card";
import { CalendarIcon, HandIcon, HomeIcon, MapPin, ShoppingCart, User } from "lucide-react";
import DialogComponent from "../Common/Dialog/DialogComponent";
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CookServicesDialog from "../ProviderDetails/CookServicesDialog";
import MaidServiceDialog from "../ProviderDetails/MaidServiceDialog";
import NannyServicesDialog from "../ProviderDetails/NannyServicesDialog";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { Dayjs } from "dayjs";
import { PickerSelectionState } from "@mui/x-date-pickers/internals";
import { DateView } from "@mui/x-date-pickers/models";
import { Bookingtype } from "@/types/bookingTypeData";
import { DETAILS } from "../../Constants/pagesConstants";
import { useDispatch } from "react-redux";
import { add } from "../../features/bookingType/bookingTypeSlice";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import BookingDialog from "../BookingDialog/BookingDialog";

interface ChildComponentProps {
    sendDataToParent: (data: string) => void;
    bookingType: (data: string) => void;
  }


  

  const HomePage: React.FC<ChildComponentProps> = ({ sendDataToParent, bookingType }) => {

    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedtype] = useState('');
    const [selectedRadioButtonValue, getSelectedRadioButtonValue] = React.useState<string>('');
    const [openServiceDialog, setOpenServiceDialog] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(null);
const [endDate, setEndDate] = useState<string | null>(null);
const [startTime, setStartTime] = useState<Dayjs | null>(null);
const [endTime, setEndTime] = useState<Dayjs | null>(null);
    

    const handleClick = (data: string) => {
        setOpen(true);
        setSelectedtype(data);
        // setSelectedBookingType(data);
      };

      const getSelectedValue = (e: React.ChangeEvent<HTMLInputElement>) => {

          getSelectedRadioButtonValue(e.target.value);
          setStartDate(null);
          setEndDate(null);
        };

        const dispatch = useDispatch();

      function handleClose(): void {
          setOpen(false);
      }

      const calculateDuration = (start: string, end: string) => {
        const [startHours, startMinutes] = start.split(":").map(Number);
        const [endHours, endMinutes] = end.split(":").map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        return (endTotalMinutes - startTotalMinutes) / 60;
      };

      const handleSave = () => {
          let duration = 0;
          const booking: Bookingtype = {
            startDate,
            endDate,
            bookingPreference: selectedRadioButtonValue,
          };
      
          if (selectedRadioButtonValue === "Date") {
            setOpenServiceDialog(true);
          } 
      
          if (selectedRadioButtonValue != "Date") {
            sendDataToParent(DETAILS);
          }
      
          dispatch(add(booking));
        };

      function isConfirmDisabled(): boolean | undefined {
         return false;
      }

      const getMaxEndDate = () => {
        if (!startDate) return '';
        const start = new Date();
        if(selectedRadioButtonValue === "Monthly"){
          start.setDate(start.getDate() + 31);
        } else {
          start.setDate(start.getDate() + 15);
        }
        return start.toISOString().split('T')[0];
      };

    return (
            <main className="pt-16">
                {/* Hero Section */}
                <section className="bg-white py-8 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 space-y-4">
                        <h1 className="text-3xl font-bold leading-tight">
                            Book trusted household help in minutes
                        </h1>
                        <p className="text-gray-600 text-sm">
                            ServEase connects you to trained maids, cooks, and caregivers on demand. Safe, affordable and instant.
                        </p>
                        <div className="space-y" style={{ display: 'flex', justifyContent: 'space-around' }}>

                            <div className="card" onClick={() => handleClick('COOK')}>
                                <div className="card-body">
                                    <img src="../newCook.png" alt="Cook" style={{ height: '100px', width: '100px' }} />
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-body">
                                    <img src="../maidWomen.png" alt="Cook" style={{ height: '100px', width: '100px' }} />
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-body">
                                    <img src="../newNanny.png" alt="Cook" style={{ height: '100px', width: '100px' }} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-3" style={{justifyContent:'center'}}>
                            <Button variant="outline" className="text-sm px-4 py-2">I need help</Button>
                            <Button variant="outline" className="text-sm px-4 py-2">I want to work</Button>
                        </div>
                    </div>
                    <div className="md:w-1/2 mt-8 md:mt-0">
                        <img
                            src="maid-hero.png"
                            alt="Smiling house helper"
                            className="rounded-xl shadow-md w-full max-w-md mx-auto"
                            style={{ maxHeight: '280px', objectFit: 'cover' }}
                        />
                    </div>
                </section>

                {/* Services Section */}
                <section className="py-10 px-6 md:px-20">
                    <h2 className="text-3xl font-semibold text-center mb-8">Popular Services</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Home Cook",
                                desc: "Skilled and hygienic cooks who specialize in home-style meals.",
                                icon: "👩‍🍳",
                            },
                            {
                                title: "Cleaning Help",
                                desc: "Reliable maids for daily, deep, or special occasion cleaning.",
                                icon: "🧼",
                            },
                            {
                                title: "Caregiver",
                                desc: "Trained support for children, seniors, or patients at home.",
                                icon: "❤️",
                            },
                        ].map((service, index) => (
                            <Card key={index} className="text-center p-5">
                                <CardContent className="space-y-3">
                                    <div className="text-4xl">{service.icon}</div>
                                    <h3 className="text-lg font-semibold">{service.title}</h3>
                                    <p className="text-sm text-gray-600">{service.desc}</p>
                                    <Button variant="link" className="text-sm">Learn More</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="bg-blue-50 py-14 px-6 md:px-20">
                    <h2 className="text-3xl font-semibold text-center mb-10">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <HandIcon className="mx-auto h-8 w-8 text-blue-700 mb-2" />
                            <h4 className="font-semibold">Choose your service</h4>
                            <p>Select from a variety of tasks that suit your needs.</p>
                        </div>
                        <div>
                            <CalendarIcon className="mx-auto h-8 w-8 text-blue-700 mb-2" />
                            <h4 className="font-semibold">Schedule in minutes</h4>
                            <p>Book a time that works for you, quickly and easily.</p>
                        </div>
                        <div>
                            <HomeIcon className="mx-auto h-8 w-8 text-blue-700 mb-2" />
                            <h4 className="font-semibold">Relax, we’ll handle the rest</h4>
                            <p>Our verified professionals ensure your peace of mind.</p>
                        </div>
                    </div>
                </section>

                {/* <DialogComponent
  open={open}
  onClose={handleClose}
  title="Select your Booking"
  onSave={handleSave}
  disableConfirm={isConfirmDisabled()}
>
  <FormControl>
    <FormLabel id="booking-type">Book by</FormLabel>
    <RadioGroup
      row
      aria-labelledby="booking-type"
      name="booking-type"
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
                      inputProps={{ min: startTime }}
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
      )} */}

<BookingDialog
  open={open}
  onClose={handleClose}
  onSave={handleSave}
  selectedOption={selectedRadioButtonValue}
  onOptionChange={getSelectedRadioButtonValue}
  startDate={startDate}
  endDate={endDate}
  startTime={startTime}
  endTime={endTime}
  setStartDate={setStartDate}
  setEndDate={setEndDate}
  setStartTime={setStartTime}
  setEndTime={setEndTime}
/>


            </main>


    );
}

export default HomePage;