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
import ServiceProviderRegistration from "../Registration/ServiceProviderRegistration";
import ServiceDetailsDialog from "./ServiceDetailsDialog";
import Chatbot from "../Chat/Chatbot";

interface ChildComponentProps {
    sendDataToParent: (data: string) => void;
    bookingType: (data: string) => void;
}

const HomePage: React.FC<ChildComponentProps> = ({ sendDataToParent, bookingType }) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedtype] = useState('');
    const [selectedRadioButtonValue, getSelectedRadioButtonValue] = React.useState<string>('');
    const [openServiceDialog, setOpenServiceDialog] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [showRegistrationDialog, setShowRegistrationDialog] = useState(false); // Changed this state name
    const [serviceDialog, setServiceDialog] = useState<{
    open: boolean;
    type: "cook" | "maid" | "babycare" | null;
    }>({ open: false, type: null });


    const handleWorkClick = () => {
        setShowRegistrationDialog(true);
    };

    const handleCloseRegistrationDialog = () => {
        setShowRegistrationDialog(false);
    };

    const handleClick = (data: string) => {
        setOpen(true);
        setSelectedtype(data);
    };

    const getSelectedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        getSelectedRadioButtonValue(e.target.value);
        setStartDate(null);
        setEndDate(null);
    };

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
    
    if (selectedRadioButtonValue !== "Date") {
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
                        <Button variant="outline" className="text-sm px-4 py-2"   onClick={() => setChatbotOpen(true)}>I need help</Button>
                        <Button variant="outline" className="text-sm px-4 py-2" onClick={handleWorkClick}>I want to work</Button>
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
    type: "cook",
  },
  {
    title: "Cleaning Help",
    desc: "Reliable maids for daily, deep, or special occasion cleaning.",
    icon: "🧼",
    type: "maid",
  },
  {
    title: "Caregiver",
    desc: "Trained support for children, seniors, or patients at home.",
    icon: "❤️",
    type: "babycare",
  },
].map((service, index) => (
  <Card key={index} className="text-center p-5">
    <CardContent className="space-y-3">
      <div className="text-4xl">{service.icon}</div>
      <h3 className="text-lg font-semibold">{service.title}</h3>
      <p className="text-sm text-gray-600">{service.desc}</p>
      <Button
        variant="link"
        className="text-sm"
        onClick={() => setServiceDialog({ open: true, type: service.type as any })}
      >
        Learn More
      </Button>
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
                        <h4 className="font-semibold">Relax, we'll handle the rest</h4>
                        <p>Our verified professionals ensure your peace of mind.</p>
                    </div>
                </div>
            </section>
<ServiceDetailsDialog
  open={serviceDialog.open}
  onClose={() => setServiceDialog({ open: false, type: null })}
  serviceType={serviceDialog.type as "cook" | "maid" | "babycare"}
/>
{selectedType === "COOK" && (
    <CookServicesDialog
        open={openServiceDialog}
        handleClose={() => setOpenServiceDialog(false)}
    />
)}
{selectedType === "MAID" && (
    <MaidServiceDialog
        open={openServiceDialog}
        handleClose={() => setOpenServiceDialog(false)}
    />
)}
{selectedType === "NANNY" && (
    <NannyServicesDialog
        open={openServiceDialog}
        handleClose={() => setOpenServiceDialog(false)}
    />
)}
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

            {/* Service Provider Registration Dialog */}
            <DialogComponent 
                open={showRegistrationDialog} 
                onClose={handleCloseRegistrationDialog}
                title="Service Provider Registration"
               
            >
                <ServiceProviderRegistration onBackToLogin={handleCloseRegistrationDialog} />
            </DialogComponent>
            <Chatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
        </main>
    );
}

export default HomePage;