/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "../Button/button";
import { Card, CardContent } from "../Card/card";
import { ArrowRight, CalendarIcon, ChevronLeft, ChevronRight, HandIcon, HomeIcon, MapPin, ShoppingCart, User } from "lucide-react";
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
import { useLanguage } from "src/context/LanguageContext";
import { publicAsset } from "src/utils/publicAsset";


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
    // Use the language hook
    const { t, currentLanguage } = useLanguage();
    
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
  let timeSlot = "";

  if (selectedRadioButtonValue === "Date") {
    // For "Date" preference → send startTime-endTime for timeRange
    timeRange = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
  } else if (selectedRadioButtonValue === "Short term") {
    // For "Short term" → send just startTime for timeRange
    timeRange = startTime?.format("HH:mm") || "";
    timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
  } else {
    // For "Monthly" → send just startTime for timeRange
    timeRange = startTime?.format("HH:mm") || "";
    timeSlot = startTime?.format("HH:mm") || "";
  }

  const booking: Bookingtype & { 
    startTime?: string; 
    endTime?: string;
    timeSlot?: string;
  } = {
    startDate: startDate ? startDate.split("T")[0] : "",
    endDate: endDate ? endDate.split("T")[0] : (startDate ? startDate.split("T")[0] : ""),
    timeRange: timeRange, // "05:35-09:35" for Date, "05:35" for others
    bookingPreference: selectedRadioButtonValue,
    housekeepingRole: selectedType,
    // ✅ Store individual times
    startTime: startTime?.format("HH:mm") || "",
    endTime: endTime?.format("HH:mm") || "",
    // ✅ timeSlot will have time range when applicable
    timeSlot: timeSlot
  };

  console.log("Booking details:", {
    startDate: booking.startDate,
    endDate: booking.endDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    timeRange: booking.timeRange, // "05:35-09:35" for Date, "05:35" for others
    timeSlot: booking.timeSlot,   // "05:35-09:35" for Date/Short term, "05:35" for Monthly
    bookingPreference: booking.bookingPreference,
    housekeepingRole: booking.housekeepingRole
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
    const images = [publicAsset("MAID.png"), publicAsset("NANNY.png"), publicAsset("COOK.png")];

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
        <main className="min-h-screen bg-slate-50 pt-[calc(8rem+env(safe-area-inset-top,0px))] md:pt-[calc(7rem+env(safe-area-inset-top,0px))] lg:pt-[calc(5.5rem+env(safe-area-inset-top,0px))]">
            <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-sky-50/90 via-white to-slate-50">
                <div
                    className="pointer-events-none absolute inset-x-0 -top-32 h-[28rem] bg-[radial-gradient(ellipse_75%_50%_at_50%_-5%,rgba(14,165,233,0.18),transparent)]"
                    aria-hidden
                />
                <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-14 md:py-14 lg:px-8">
                    <div className="w-full max-w-xl space-y-6 text-center md:w-1/2 md:text-left">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800/80">
                            {t("ourServices")}
                        </p>
                        <h1 className="text-3xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-4xl md:text-[2.65rem]">
                            {t("heroTitle")}
                        </h1>
                        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                            {t("heroDescription")}
                        </p>

                        <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2.5 sm:max-w-lg sm:gap-4 md:mx-0">
                            {[
                                { key: "COOK", img: publicAsset("CookNew.png"), label: t("homeCook") },
                                { key: "MAID", img: publicAsset("MaidNew.png"), label: t("cleaningHelp") },
                                { key: "NANNY", img: publicAsset("NannyNew.png"), label: t("caregiver") },
                            ].map((svc) => (
                                <button
                                    key={svc.key}
                                    type="button"
                                    disabled={appUser?.role === "SERVICE_PROVIDER"}
                                    onClick={() => appUser?.role !== "SERVICE_PROVIDER" && handleClick(svc.key)}
                                    aria-label={
                                        appUser?.role === "SERVICE_PROVIDER"
                                            ? svc.label
                                            : `${svc.label} — ${t("bookService")}`
                                    }
                                    className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white text-center shadow-md shadow-slate-900/[0.06] ring-1 ring-slate-200/70 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 min-h-0 ${
                                        appUser?.role === "SERVICE_PROVIDER"
                                            ? "cursor-not-allowed opacity-50 grayscale"
                                            : "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-900/[0.08] hover:ring-sky-300/50 active:translate-y-0 active:shadow-md"
                                    }`}
                                >
                                    <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200/90">
                                        <img
                                            src={svc.img}
                                            alt=""
                                            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div
                                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent opacity-80"
                                            aria-hidden
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col items-center justify-between gap-1.5 px-2 py-2.5 sm:px-3 sm:py-3">
                                        <span className="line-clamp-2 min-h-[2.25rem] text-[11px] font-semibold leading-tight tracking-tight text-slate-900 sm:min-h-[2.5rem] sm:text-xs">
                                            {svc.label}
                                        </span>
                                        {appUser?.role !== "SERVICE_PROVIDER" && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700 sm:text-[11px]">
                                                {t("bookService")}
                                                <ArrowRight
                                                    className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5"
                                                    aria-hidden
                                                />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {!isAuthenticated && (
                            <div className="flex flex-wrap justify-center gap-2 pt-2 sm:gap-3 md:justify-start">
                                <Button
                                    type="button"
                                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:text-sm"
                                    onClick={() => loginWithRedirect()}
                                >
                                    {t("registerAsUser")}
                                </Button>
                                <Button
                                    type="button"
                                    className="rounded-lg border-slate-300 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:text-sm"
                                    onClick={handleWorkClick}
                                >
                                    {t("registerAsProvider")}
                                </Button>
                                <Button
                                    type="button"
                                    className="rounded-lg border-slate-300 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:text-sm"
                                    onClick={() => setIsAgentRegistrationOpen(true)}
                                >
                                    {t("registerAsAgent")}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-1/2 md:max-w-lg">
                        <div className="relative mx-auto w-full max-w-md">
                            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-slate-200 shadow-lg ring-1 ring-slate-200/80 sm:aspect-[4/3] md:aspect-[5/4]">
                                {images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`${t("service")} ${index + 1}`}
                                        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
                                            index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"
                                        }`}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={prevSlide}
                                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-2 text-slate-800 shadow-md ring-1 ring-slate-200/80 transition hover:bg-white"
                                aria-label={t("previousSlide")}
                            >
                                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                            <button
                                type="button"
                                onClick={nextSlide}
                                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-2 text-slate-800 shadow-md ring-1 ring-slate-200/80 transition hover:bg-white"
                                aria-label={t("nextSlide")}
                            >
                                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 sm:bottom-4">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => goToSlide(index)}
                                        className={`h-2.5 rounded-full transition-all ${
                                            index === currentSlide
                                                ? "w-8 bg-white shadow"
                                                : "w-2.5 bg-white/50 hover:bg-white/80"
                                        }`}
                                        aria-label={`${t("goToSlide")} ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="border-b border-slate-200/60 bg-white py-12 sm:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-10 max-w-2xl text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {t("popularServices")}
                        </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                        {[
                            {
                                title: t("homeCook"),
                                desc: t("homeCookDesc"),
                                icon: "👩‍🍳",
                                type: "cook",
                            },
                            {
                                title: t("cleaningHelp"),
                                desc: t("cleaningHelpDesc"),
                                icon: "🧹",
                                type: "maid",
                            },
                            {
                                title: t("caregiver"),
                                desc: t("caregiverDesc"),
                                icon: "❤️",
                                type: "babycare",
                            },
                        ].map((service, index) => (
                            <Card
                                key={index}
                                className="border border-slate-200/90 bg-white text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
                            >
                                <CardContent className="space-y-4 p-6 sm:p-7">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-slate-50 text-3xl ring-1 ring-sky-100/80">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">{service.title}</h3>
                                    <p className="text-sm leading-relaxed text-slate-600">{service.desc}</p>
                                    <Button
                                        type="button"
                                        className="border-transparent bg-transparent px-0 py-1 text-sm font-semibold text-sky-700 shadow-none hover:bg-transparent hover:text-sky-900"
                                        onClick={() => setServiceDialog({ open: true, type: service.type as any })}
                                    >
                                        {t("learnMore")}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-b from-slate-100/80 to-slate-50 py-14 sm:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {t("howItWorks")}
                    </h2>
                    <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
                        {(
                            [
                                {
                                    Icon: HandIcon,
                                    title: t("chooseService"),
                                    body: t("chooseServiceDesc"),
                                },
                                {
                                    Icon: CalendarIcon,
                                    title: t("scheduleInMinutes"),
                                    body: t("scheduleInMinutesDesc"),
                                },
                                {
                                    Icon: HomeIcon,
                                    title: t("relaxWeHandle"),
                                    body: t("relaxWeHandleDesc"),
                                },
                            ] as const
                        ).map((step, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 text-center shadow-sm ring-1 ring-slate-100/80"
                            >
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/25">
                                    <step.Icon className="h-6 w-6" aria-hidden />
                                </div>
                                <h4 className="text-base font-semibold text-slate-900">{step.title}</h4>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                            </div>
                        ))}
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
        sendDataToParent={sendDataToParent}
    />
)}
{selectedType === "MAID" && (
    <MaidServiceDialog
        open={openServiceDialog}
        handleClose={() => setOpenServiceDialog(false)}
        sendDataToParent={sendDataToParent}
    />
)}
{selectedType === "NANNY" && (
    <NannyServicesDialog
        open={openServiceDialog}
        handleClose={() => setOpenServiceDialog(false)}
         sendDataToParent={sendDataToParent}
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
                title={t('serviceProviderRegistration')} /* Updated to use t() */
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