/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "../Button/button";
import { Card, CardContent } from "../Card/card";
import { CalendarIcon, ChevronLeft, ChevronRight, HandIcon, HomeIcon, MapPin, ShoppingCart, User } from "lucide-react";
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
import { Bookingtype } from "../../types/bookingTypeData";
import { DETAILS } from "../../Constants/pagesConstants";
import { useDispatch } from "react-redux";
import { add } from "../../features/bookingType/bookingTypeSlice";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import BookingDialog from "../BookingDialog/BookingDialog";
import ServiceProviderRegistration from "../Registration/ServiceProviderRegistration";
import ServiceDetailsDialog from "./ServiceDetailsDialog";
import Chatbot from "../Chat/Chatbot";
import { useAuth0 } from "@auth0/auth0-react";
import Footer from "../Footer/Footer";
import AgentRegistrationForm from "../Registration/AgentRegistrationForm";
import { useAppUser } from "src/context/AppUserContext";

const publicVapidKey = 'BO0fj8ZGgK5NOd9lv0T0E273Uh4VptN2d8clBns7aOBusDGbIh\_ZIyQ8W8C-WViT1bdJlr0NkEozugQQqj8\_nTo';
interface ChildComponentProps {
    sendDataToParent: (data: string) => void;
    bookingType: (data: string) => void;
      onAboutClick: () => void;
      onContactClick: () => void;
}
interface Auth0User {
  name?: string;
  email?: string;
  role?: string;
  serviceProviderId?: number;
}

const HomePage: React.FC<ChildComponentProps> = ({ sendDataToParent, bookingType, onAboutClick }) => {
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
    const [isAgentRegistrationOpen, setIsAgentRegistrationOpen] = useState(false);
     const [notificationPermission, setNotificationPermission] = useState<string>(Notification.permission);
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
  let timeRange = "";

  if (selectedRadioButtonValue === "Date") {
    // Single date booking → single time
    timeRange = startTime?.format("HH:mm") || "";
  } else if (selectedRadioButtonValue === "Short term") {
    // Short term booking → start - end
    timeRange = `${startTime?.format("HH:mm") || ""} - ${endTime?.format("HH:mm") || ""}`;
  } else {
    // Monthly booking → single time
    timeRange = startTime?.format("HH:mm") || "";
  }

  const booking: Bookingtype & { startTime?: string; endTime?: string } = {
    startDate: startDate ? startDate.split("T")[0] : "",
    endDate: endDate ? endDate.split("T")[0] : (startDate ? startDate.split("T")[0] : ""),
    timeRange: timeRange,
    bookingPreference: selectedRadioButtonValue,
    housekeepingRole: selectedType,
    // ✅ Store times in HH:mm format
    endTime: endTime?.format("HH:mm") || "",
  };

  console.log("Booking details:", {
    startDate: booking.startDate,
    endDate: booking.endDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    timeSlot: booking.timeRange,
    bookingPreference: booking.bookingPreference,
  });

  if (selectedRadioButtonValue === "Date") {
    setOpenServiceDialog(true);
  } else {
    sendDataToParent(DETAILS);
  }

  dispatch(add(booking));
  setOpen(false);
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

 function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);

    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
}
 // AUTH & INITIALIZATION
 const { user, isAuthenticated, loginWithRedirect } = useAuth0<Auth0User>();

  // Keep a local role state if you already use it for UI (your code references `role`)
  const [role, setRole] = useState<string | null>(null);

  const { appUser } = useAppUser();

useEffect(() => {
  if (!isAuthenticated || !appUser) return;

  const role = appUser.role;
  console.log("👤 User role:", appUser);
}, [isAuthenticated, appUser]);



 // Carousel state
    const [currentSlide, setCurrentSlide] = useState(0);
    const images = ['MAID.png', 'NANNY.png', 'COOK.png'];

    // Carousel navigation functions
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [currentSlide]);
    
  function onContactClick(): void {
    throw new Error("Function not implemented.");
  }

    return (
        <main className="pt-16">
            {/* Hero Section */}
<section className="py-8 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#0a2a66] to-[#004aad] text-white">

  <div className="md:w-1/2 space-y-4">
    <h1 className="text-3xl font-bold leading-tight">
      Book trusted and trained house-help in minutes
    </h1>
    <p className="text-sm opacity-90">
      ServEaso delivers instant, regular and short term access to safe, affordable, and trained maids, cooks, and caregivers.
    </p>

   <div style={{ display: "flex", justifyContent: "space-around", gap: "20px" }}>

  {/* Cook */}
  <div
    className={`flex flex-col items-center ${appUser?.role === "SERVICE_PROVIDER" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    onClick={() => appUser?.role !== "SERVICE_PROVIDER" && handleClick("COOK")}
  >
    <div className="card p-0">
      <div className="card-body flex justify-center p-1">
        <img
          src="../CookNew.png"
          alt="Cook"
          className={`transition-transform duration-300 ${appUser?.role !== "SERVICE_PROVIDER" ? "hover:scale-110" : ""}`}
          style={{ height: "121px", width: "121px" }}
        />
      </div>
    </div>
    <p className="mt-2 text-sm font-semibold text-white">Home Cook</p>
   
  </div>

  {/* Maid */}
  <div
    className={`flex flex-col items-center ${appUser?.role === "SERVICE_PROVIDER" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    onClick={() => appUser?.role !== "SERVICE_PROVIDER" && handleClick("MAID")}
  >
    <div className="card p-0">
      <div className="card-body flex justify-center p-1">
        <img
          src="../MaidNew.png"
          alt="Maid"
          className={`transition-transform duration-300 ${appUser?.role !== "SERVICE_PROVIDER" ? "hover:scale-110" : ""}`}
          style={{ height: "121px", width: "121px" }}
        />
      </div>
    </div>
    <p className="mt-2 text-sm font-semibold text-white">Cleaning Help</p>
   
  </div>

  {/* Nanny */}
  <div
    className={`flex flex-col items-center ${appUser?.role === "SERVICE_PROVIDER" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    onClick={() => appUser?.role !== "SERVICE_PROVIDER" && handleClick("NANNY")}
  >
    <div className="card p-0">
      <div className="card-body flex justify-center p-1">
        <img
          src="../NannyNew.png"
          alt="Nanny"
          className={`transition-transform duration-300 ${appUser?.role !== "SERVICE_PROVIDER" ? "hover:scale-110" : ""}`}
          style={{ height: "121px", width: "121px" }}
        />
      </div>
    </div>
    <p className="mt-2 text-sm font-semibold text-white">Caregiver</p>
    {/* {role === "SERVICE_PROVIDER" && (
      <span className="text-xs text-gray-300 mt-1">Not available</span>
    )} */}
  </div>
</div>
<div className="flex gap-3 pt-3 justify-center flex-nowrap">
  {/* Show registration buttons only for unauthenticated users */}
  {!isAuthenticated && (
    <>
      <Button
        className="text-sm px-4 py-2 bg-white text-[#0a2a66] hover:bg-gray-200 font-semibold 
                   max-[640px]:text-[10px] max-[640px]:px-2 max-[640px]:py-1 max-[640px]:leading-tight"
        onClick={() => loginWithRedirect()}
      >
        Register as an User
      </Button>

      <Button
        className="text-sm px-4 py-2 bg-white text-[#0a2a66] hover:bg-gray-200 font-semibold 
                   max-[640px]:text-[10px] max-[640px]:px-2 max-[640px]:py-1 max-[640px]:leading-tight"
        onClick={handleWorkClick}
      >
        Register as a Provider
      </Button>

      <Button
        className="text-sm px-4 py-2 bg-white text-[#0a2a66] hover:bg-gray-200 font-semibold 
                   max-[640px]:text-[10px] max-[640px]:px-2 max-[640px]:py-1 max-[640px]:leading-tight"
        onClick={() => setIsAgentRegistrationOpen(true)}
      >
        Register as an Agent
      </Button>
    </>
  )}
</div>


  </div>

  {/* Carousel Section */}
  <div className="w-full md:w-1/2 mt-8 md:mt-0 flex justify-center">
    <div className="relative w-full max-w-sm sm:max-w-md md:max-w-sm lg:max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-xl shadow-md h-48 sm:h-64 md:h-72 lg:h-80">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Service ${index + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-cover object-top transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-[#0a2a66] rounded-full p-2 shadow-md hover:bg-gray-200 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-[#0a2a66] rounded-full p-2 shadow-md hover:bg-gray-200 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
              index === currentSlide ? "bg-white" : "bg-gray-400"
            } hover:bg-gray-300 transition-colors`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  </div>
</section>


            {/* Services Section */}
        <section className="py-10 px-6 md:px-20 relative">
  {/* Floating Help Card */}
  {/* <div className="absolute -top-6 right-20">
    <button
      onClick={() => setChatbotOpen(true)}
      className="flex items-center gap-2 bg-[#fffbea] text-[#0a2a66] px-5 py-3 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition"
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0a2a66] text-white text-sm font-bold">
        ?
      </span>
      <span className="font-medium">Need any help?</span>
    </button>
  </div> */}

  {/* Popular Services Section */}
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
        icon: "🧹",
        type: "maid",
      },
      {
        title: "Caregiver",
        desc: "Trained support for children, seniors, or patients at home.",
        icon: "❤️",
        type: "babycare",
      },
    ].map((service, index) => (
      <Card
        key={index}
      // [#f5f9ff] via-[#eaf2ff] to-[#dbe8ff] 
      className="text-center p-5 transition-all duration-200 hover:shadow-lg rounded-xl bg-gradient-to-br from-[#accdff] via-[#eaf2ff] to-[#b3d1ff] border border-blue-100">
        <CardContent className="space-y-3">
          <div className="text-4xl">{service.icon}</div>
          <h3 className="text-lg font-semibold">{service.title}</h3>
          <p className="text-sm text-gray-600">{service.desc}</p>
          <Button
            variant="link"
            className="text-sm"
            onClick={() =>
              setServiceDialog({ open: true, type: service.type as any })
            }
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
              {isAgentRegistrationOpen && (
  <AgentRegistrationForm 
    onBackToLogin={(shouldClose) => {
      if (shouldClose) {
     setIsAgentRegistrationOpen(false);
      }
    }} 
  />
)}
        </main>
    );
}

export default HomePage;