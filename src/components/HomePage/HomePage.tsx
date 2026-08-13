/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "../Button/button";
import { Card, CardContent } from "../Card/card";
import { ArrowRight, CalendarIcon, ChevronLeft, ChevronRight, HandIcon, HomeIcon, MapPin, ShoppingCart, User } from "lucide-react";
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import CookServicesDialog from "../ProviderDetails/CookServicesDialog";
import MaidServiceDialog from "../ProviderDetails/MaidServiceDialog";
import NannyServicesDialog from "../ProviderDetails/NannyServicesDialog";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
import { shouldResumeSpRegistration } from "src/services/spRegistrationDraft";
import { resolveProviderIdNumber } from "src/utils/spSession";
import ServiceDetailsDialog from "./ServiceDetailsDialog";
import Chatbot from "../Chat/Chatbot";
import { useAuth0 } from "@auth0/auth0-react";
import Footer from "../Footer/Footer";
import AgentRegistrationForm from "../Registration/AgentRegistrationForm";
import { useAppUser } from "src/context/AppUserContext";
import { useLanguage } from "src/context/LanguageContext";
import { publicAsset } from "src/utils/publicAsset";
import FirstBookingOffer from "./FirstBookingOffer";
import ServiceSelectionDialog from "./ServiceSelectionDialog";
import { useFirstBookingOfferVisible } from "../hooks/useFirstBookingOfferVisible";


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
    const [showRegistrationDialog, setShowRegistrationDialog] = useState(false); // Changed this state name
    const [serviceDialog, setServiceDialog] = useState<{
    open: boolean;
    type: "cook" | "maid" | "babycare" | null;
    }>({ open: false, type: null });
    const [showServiceSelection, setShowServiceSelection] = useState(false);

    const { appUser } = useAppUser();

    useEffect(() => {
        if (shouldResumeSpRegistration(appUser as Record<string, unknown> | null)) {
            setShowRegistrationDialog(true);
        } else {
            setShowRegistrationDialog(false);
        }
    }, [appUser]);

    useEffect(() => {
        // Handle tinyurl deep links for direct booking (e.g. /cook)
        const path = window.location.pathname.toLowerCase();
        if (path === "/cook") {
            handleClick("COOK");
        } else if (path === "/maid") {
            handleClick("MAID");
        } else if (path === "/nanny") {
            handleClick("NANNY");
        }
    }, []);

    const handleWorkClick = () => {
        setShowRegistrationDialog(true);
    };

    const handleCloseRegistrationDialog = () => {
        setShowRegistrationDialog(false);
    };

    const handleClick = (data: string) => {
        if (isServiceProvider) return;
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

const handleSave = (bookingDetails?: {
  option: string;
  startDate: string | null;
  endDate: string | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  start_epoch: number | null;
  end_epoch: number | null;
  genderPreference?: string;
}) => {
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

  const startDateYmd = startDate ? dayjs(startDate).format("YYYY-MM-DD") : "";
  const endDateYmd = endDate
    ? dayjs(endDate).format("YYYY-MM-DD")
    : startDateYmd;

  const booking: Bookingtype & { 
    startTime?: string; 
    endTime?: string;
    timeSlot?: string;
    genderPreference?: string;
  } = {
    startDate: startDateYmd,
    endDate: endDateYmd,
    timeRange: timeRange, // "05:35-09:35" for Date, "05:35" for others
    bookingPreference: selectedRadioButtonValue,
    housekeepingRole: selectedType,
    // ✅ Store individual times
    startTime: startTime?.format("HH:mm") || "",
    endTime: endTime?.format("HH:mm") || "",
    // ✅ timeSlot will have time range when applicable
    timeSlot: timeSlot,
    // ✅ Store gender preference from bookingDetails
    genderPreference: bookingDetails?.genderPreference || "No Preference"
  };

  console.log("Booking details:", {
    startDate: booking.startDate,
    endDate: booking.endDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    timeRange: booking.timeRange, // "05:35-09:35" for Date, "05:35" for others
    timeSlot: booking.timeSlot,   // "05:35-09:35" for Date/Short term, "05:35" for Monthly
    bookingPreference: booking.bookingPreference,
    housekeepingRole: booking.housekeepingRole,
    genderPreference: booking.genderPreference
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
    
 // AUTH & INITIALIZATION
 const { user, isAuthenticated, loginWithPopup } = useAuth0<Auth0User>();

  // Keep a local role state if you already use it for UI (your code references `role`)
  const [role, setRole] = useState<string | null>(null);

  const { showOffer, checking: checkingOffer } = useFirstBookingOfferVisible();
  const isLoggedIn = isAuthenticated || Boolean(appUser);
  const isServiceProvider =
    isLoggedIn &&
    (appUser?.role === "SERVICE_PROVIDER" ||
      appUser?.user_role === "SERVICE_PROVIDER" ||
      resolveProviderIdNumber(appUser as Record<string, unknown> | null) != null);

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
        <main className="min-h-screen bg-slate-50 flex flex-col">
            {/* 1. Hero Gradient Section */}
            <section className="relative w-full bg-gradient-chrome pt-[calc(4rem+env(safe-area-inset-top,0px))] pb-12 sm:pt-[calc(5rem+env(safe-area-inset-top,0px))] sm:pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <div className="w-full max-w-6xl space-y-5 text-center text-white">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.65rem] text-white">
                        {t("heroTitle")}
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                        {t("heroDescription")}
                    </p>

                    {/* Chips Row */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        {[{ icon: "✓", label: "Trusted Pros" }, { icon: "✨", label: "Easy Booking" }, { icon: "📅", label: "Flexible Slots" }].map((chip, i) => (
                            <div key={i} className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                <span>{chip.icon}</span>
                                <span>{chip.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="mx-auto mt-6 flex w-full max-w-md items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-sky-500">
                        <span className="text-slate-400">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Find a cook, maid, or cleaner..." 
                            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                        <span className="text-slate-400">⚙️</span>
                    </div>

                </div>
            </section>

            {/* 2. Main Canvas Section */}
            <section className="-mt-8 relative z-10 flex-1 rounded-t-[32px] bg-white px-4 pt-8 pb-16 sm:px-6 lg:px-8 shadow-sm ring-1 ring-slate-900/5">
                <div className="mx-auto max-w-6xl space-y-12">
                    
                    {/* Header */}
                    <div className="flex flex-col items-start gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            {isServiceProvider ? t("hero.exploreServices") : "What service do you need?"}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {isServiceProvider ? t("hero.learnAboutServices") : "Choose a professional for your home"}
                        </p>
                    </div>

                    {/* Services Grid (iOS Style) */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {[
                            { key: "COOK", label: t("homeCook"), desc: "Daily meals & parties", icon: "👩‍🍳", bg: "bg-orange-50", color: "text-orange-600" },
                            { key: "MAID", label: t("cleaningHelp"), desc: "Deep home cleaning", icon: "🧹", bg: "bg-blue-50", color: "text-blue-600" },
                            { key: "NANNY", label: t("caregiver"), desc: "Eldercare & support", icon: "❤️", bg: "bg-rose-50", color: "text-rose-600" },
                        ].map((svc) => (
                            <button
                                key={svc.key}
                                type="button"
                                disabled={isServiceProvider}
                                onClick={() => handleClick(svc.key)}
                                className={`flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                                    isServiceProvider ? "cursor-not-allowed opacity-50" : "hover:border-sky-300 hover:shadow-md active:scale-[0.98]"
                                }`}
                            >
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${svc.bg} text-2xl`}>
                                    {svc.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-slate-900 line-clamp-1">{svc.label}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2">{svc.desc}</p>
                                </div>
                                {!isServiceProvider && (
                                    <span className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                        ⭐ Top Rated
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-xs text-slate-400">Click a card to book a service</p>

                    {/* First Booking Offer */}
                    {!isServiceProvider && !checkingOffer && showOffer ? (
                        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                            <FirstBookingOffer onPress={() => setShowServiceSelection(true)} />
                        </div>
                    ) : null}

                    {/* Stats Row */}
                    <div className="flex divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50 py-6">
                        <div className="flex flex-1 flex-col items-center justify-center space-y-1">
                            <span className="text-2xl font-bold tracking-tight text-slate-900">50k+</span>
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Happy Homes</span>
                        </div>
                        <div className="flex flex-1 flex-col items-center justify-center space-y-1">
                            <span className="text-2xl font-bold tracking-tight text-slate-900">2000+</span>
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Verified Pros</span>
                        </div>
                        <div className="flex flex-1 flex-col items-center justify-center space-y-1">
                            <span className="text-2xl font-bold tracking-tight text-slate-900">4.8/5</span>
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Avg Rating</span>
                        </div>
                    </div>

                    {/* Need Help Choosing */}
                    <div className="flex flex-col items-center justify-center space-y-4 pt-4 text-center">
                        <h4 className="text-sm font-medium text-slate-500">Need help choosing?</h4>
                        <div className="flex items-center gap-4 text-sm font-semibold text-sky-600">
                            <button onClick={() => onContactClick?.()} className="flex items-center gap-1.5 hover:text-sky-700">
                                <span>🎧</span> Talk to Support
                            </button>
                            <span className="text-slate-300">|</span>
                            <button className="flex items-center gap-1.5 hover:text-sky-700">
                                <span>❓</span> How it works
                            </button>
                        </div>
                    </div>

                    {/* How It Works Steps Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-6 text-lg font-bold text-slate-900">{t("howItWorks")}</h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">1</div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{t("chooseService")}</h4>
                                    <p className="text-sm text-slate-500">{t("chooseServiceDesc")}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">2</div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{t("scheduleInMinutes")}</h4>
                                    <p className="text-sm text-slate-500">{t("scheduleInMinutesDesc")}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">3</div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{t("relaxWeHandle")}</h4>
                                    <p className="text-sm text-slate-500">{t("relaxWeHandleDesc")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
<ServiceDetailsDialog
  open={serviceDialog.open}
  onClose={() => setServiceDialog({ open: false, type: null })}
  serviceType={serviceDialog.type as "cook" | "maid" | "babycare"}
  onBookNow={() => {
    const roleByType: Record<"cook" | "maid" | "babycare", string> = {
      cook: "COOK",
      maid: "MAID",
      babycare: "NANNY",
    };
    const type = serviceDialog.type;
    if (!type || isServiceProvider) return;
    setServiceDialog({ open: false, type: null });
    handleClick(roleByType[type]);
  }}
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

            <ServiceSelectionDialog
                open={showServiceSelection}
                onClose={() => setShowServiceSelection(false)}
                onSelectService={(serviceType: string) => {
                    setSelectedtype(serviceType);
                    setOpen(true);
                }}
            />

            {showRegistrationDialog ? (
              <ServiceProviderRegistration onBackToLogin={handleCloseRegistrationDialog} />
            ) : null}
            <Chatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
              {isAgentRegistrationOpen && (
                <AgentRegistrationForm
                  onBackToLogin={(shouldClose) => {
                    if (shouldClose) setIsAgentRegistrationOpen(false);
                  }}
                  onClose={() => setIsAgentRegistrationOpen(false)}
                />
              )}
        </main>
    );
}

export default HomePage;