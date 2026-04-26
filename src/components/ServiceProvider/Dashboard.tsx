/* eslint-disable */
import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { PaymentHistory } from "./PaymentHistory";
import { Button } from "../../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Common/Card";
import { Badge } from "../../components/Common/Badge";
import { useToast } from "../hooks/use-toast";
import {
  IndianRupee,
  Calendar,
  Star,
  TrendingUp,
  Users,
  Clock,
  Home,
  Bell,
  Loader2,
  CheckCircle,
  Shield,
  CreditCard,
  Wallet,
  Receipt,
  Phone,
  MapPin
} from "lucide-react";
import { useAuth0 } from '@auth0/auth0-react';
import { AllBookingsDialog } from "./AllBookingsDialog";
import { getBookingTypeBadge, getServiceTitle, getStatusBadge } from "../Common/Booking/BookingUtils";
import { ReviewsDialog } from "./ReviewsDialog";
import axios, { AxiosResponse } from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ProviderCalendarBig from "./ProviderCalendarBig";
import PaymentInstance from "src/services/paymentInstance";
import { useAppUser } from "src/context/AppUserContext";
import { OtpVerificationDialog } from "./OtpVerificationDialog";
import WithdrawalDialog from "./WithdrawalDialog";
import { WithdrawalHistoryDialog } from "./WithdrawalHistoryDialog";
import TrackAddress from "./TrackAddress";
import {
  ProviderLeaveDialog,
  ProviderUnavailabilityDialog,
} from "./ProviderScheduleDialogs";
import { useLanguage } from "src/context/LanguageContext";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBWoIIAX-gE7fvfAkiquz70WFgDaL7YXSk';

// Types for API response
interface CustomerHoliday {
  id: number;
  customerId: number;
  applyHolidayDate: string;
  start_date: string;
  endDate: string;
  service_type: string;
  active: boolean;
}

interface ServiceProviderLeave {
  id: number;
  serviceProviderId: number;
  applyLeaveDate: string;
  start_date: string;
  endDate: string;
  service_type: string;
  active: boolean;
}

interface ResponsibilityTask {
  taskType: string;
  persons?: number;
  [key: string]: any;
}

interface ResponsibilityAddOn {
  [key: string]: any;
}
interface Responsibilities {
  tasks?: ResponsibilityTask[];
  add_ons?: ResponsibilityAddOn[];
}
export interface Booking {
  id: number;
  serviceProviderId: number;
  customerId: number;
  start_date: string;
  endDate: string;
  engagements: string;
  timeslot: string;
  monthlyAmount: number;
  paymentMode: string;
  booking_type: string;
  service_type: string;
  bookingDate: string;
  responsibilities: Responsibilities;
  housekeepingRole: string | null;
  mealType: string | null;
  noOfPersons: number | null;
  experience: string | null;
  childAge: number | null;
  customerName: string;
  serviceProviderName: string;
  address: string | null;
  taskStatus: string;
  modifiedBy: string;
  modifiedDate: string;
  availableTimeSlots: string | null;
  customerHolidays: CustomerHoliday[];
  serviceProviderLeaves: ServiceProviderLeave[];
  active: boolean;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: string;
  amount: string;
  bookingData: any;
}

export interface BookingHistoryResponse {
  current: Booking[];
  upcoming?: any[];
  past: Booking[];
}

export interface ProviderPayoutResponse {
  success: boolean;
  serviceproviderid: string;
  month: string | null;
  summary: PayoutSummary;
  payouts: Payout[];
}

export interface PayoutSummary {
  total_earned: number;
  total_withdrawn: number;
  available_to_withdraw: number;
  security_deposit_paid: boolean;
  security_deposit_amount: number;
}

export interface Payout {
  payout_id: string;
  engagement_id: string;
  gross_amount: number;
  provider_fee: number;
  tds_amount: number;
  net_amount: number;
  payout_mode: string | null;
  status: string;
  created_at: string;
}

interface CalendarEntry {
  id: number;
  provider_id: number;
  engagement_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
  created_at: string;
  updated_at: string;
}

// Mock data for payments
const paymentHistory = [
  {
    id: "1",
    date: "Dec 25, 2024",
    description: "Cleaning Service - Priya S.",
    amount: "₹800",
    status: "completed" as const,
    type: "earning" as const
  },
  {
    id: "2",
    date: "Dec 24, 2024",
    description: "Cooking Service - Rajesh K.",
    amount: "₹1,200",
    status: "completed" as const,
    type: "earning" as const
  },
  {
    id: "3",
    date: "Dec 23, 2024",
    description: "Withdrawal to Bank",
    amount: "₹5,000",
    status: "completed" as const,
    type: "withdrawal" as const
  },
  {
    id: "4",
    date: "Dec 22, 2024",
    description: "Care Service - Anita P.",
    amount: "₹1,500",
    status: "pending" as const,
    type: "earning" as const
  }
];

// Function to format time string to AM/PM format
const formatTimeToAMPM = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    
    return `${displayHour}:${displayMinute} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

// Function to format time range from start and end time strings
const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTimeToAMPM(startTime)} - ${formatTimeToAMPM(endTime)}`;
};

// Function to format API booking data for the BookingCard component
const formatBookingForCard = (booking: any) => {
  let date, timeRange;
  
  if (booking.start_epoch && booking.end_epoch) {
    const startDate = new Date(booking.start_epoch * 1000);
    const endDate = new Date(booking.end_epoch * 1000);
    
    const formattedDate = startDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    
    timeRange = `${startDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })} - ${endDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })}`;
    
    date = formattedDate;
  } else {
    const startDateRaw = booking.startDate || booking.start_date;
    const startTimeStr = booking.startTime || "00:00";
    const endTimeStr = booking.endTime || "00:00";

    const startDate = new Date(startDateRaw);
    const endDate = new Date(startDateRaw);

    const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
    const [endHours, endMinutes] = endTimeStr.split(":").map(Number);

    startDate.setHours(startHours, startMinutes);
    endDate.setHours(endHours, endMinutes);

    timeRange = formatTimeRange(booking.startTime, booking.endTime);
    
    date = startDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  const clientName = booking.firstname || 
                    booking.customerName || 
                    booking.email || 
                    "Client";

  const bookingId = booking.engagement_id || booking.id;

  const amount = booking.base_amount ? 
    `₹${parseFloat(booking.base_amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
    "₹0";

  return {
    id: booking.engagement_id?.toString() || booking.id?.toString() || "",
    bookingId: booking.engagement_id || booking.id,
    engagement_id: booking.engagement_id?.toString() || booking.id?.toString(),
    clientName,
    service: getServiceTitle(booking.service_type || booking.serviceType),
    date: date,
    time: timeRange,
    location: booking.address || booking.location || "R4J8+WCR, Bazar, Haripal Station Rd, opposite to state bank, Haripal, Jejur, West Bengal 712405, India",
    status: booking.task_status === "COMPLETED" ? "completed" : 
            booking.task_status === "IN_PROGRESS" || booking.task_status === "STARTED" ? "in-progress" : 
            booking.task_status === "NOT_STARTED" ? "upcoming" : "upcoming",
    amount: amount,
    bookingData: booking,
    responsibilities: booking.responsibilities || {},
    contact: booking.mobileno || "Contact info not available",
    task_status: booking.task_status
  };
};

export default function Dashboard() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: auth0User, isAuthenticated } = useAuth0();
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [serviceProviderId, setServiceProviderId] = useState<number | null>(null);
  const [payout, setPayout] = useState<ProviderPayoutResponse | null>(null);
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [taskStatus, setTaskStatus] = useState<Record<string, "IN_PROGRESS" | "COMPLETED" | undefined>>({});
  const [taskStatusUpdating, setTaskStatusUpdating] = useState<Record<string, boolean>>({});
  
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [withdrawalHistoryDialogOpen, setWithdrawalHistoryDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  
  // Add state for Track Address dialog
  const [trackAddressDialogOpen, setTrackAddressDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const { t } = useLanguage();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [unavailDialogOpen, setUnavailDialogOpen] = useState(false);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const metrics = [
    {
      title: "Total Earnings",
      value: `₹${payout?.summary?.total_earned?.toLocaleString("en-IN") || 0}`,
      icon: IndianRupee,
      description: "This month (credited to wallet)"
    },
    {
      title: "Security Deposit",
      value: `₹${payout?.summary?.security_deposit_amount?.toLocaleString("en-IN") || 0}`,
      change: payout?.summary?.security_deposit_paid ? "Paid" : "Not paid",
      changeType: payout?.summary?.security_deposit_paid
        ? ("neutral" as const)
        : ("negative" as const),
      icon: Shield,
      description: "For active bookings"
    },
    {
      title: "Total Withdrawn",
      value: `₹${(payout?.summary?.total_withdrawn ?? 0).toLocaleString("en-IN")}`,
      icon: CreditCard,
      description: "Already withdrawn or deducted"
    },
    {
      title: "Available to withdraw",
      value: `₹${payout?.summary?.available_to_withdraw?.toLocaleString("en-IN") || 0}`,
      icon: Wallet,
      description: "After service charges and TDS"
    }
  ];

  const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  const { appUser } = useAppUser();
  
  useEffect(() => {
    if (isAuthenticated && auth0User) {
      setUserName(appUser?.name);
      setServiceProviderId(appUser?.serviceProviderId ? Number(appUser?.serviceProviderId) : null);
    }
  }, [isAuthenticated, appUser]);

  const fetchData = async () => {
    if (!serviceProviderId) return;

    try {
      setLoading(true);
      const currentMonthYear = getCurrentMonthYear();

      const payoutResponse: AxiosResponse<ProviderPayoutResponse> = await PaymentInstance.get(
        `/api/service-providers/${serviceProviderId}/payouts?month=${currentMonthYear}&detailed=true`
      );
      setPayout(payoutResponse.data);

      const response = await PaymentInstance.get(
        `/api/service-providers/${serviceProviderId}/engagements?month=${currentMonthYear}`
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BookingHistoryResponse = response.data;
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceProviderId) {
      fetchData();
    }
  }, [serviceProviderId, toast]);

  const handleWithdrawalSuccess = async () => {
    if (serviceProviderId) {
      try {
        const currentMonthYear = getCurrentMonthYear();
        const payoutResponse: AxiosResponse<ProviderPayoutResponse> = await PaymentInstance.get(
          `/api/service-providers/${serviceProviderId}/payouts?month=${currentMonthYear}&detailed=true`
        );
        setPayout(payoutResponse.data);
      } catch (error) {
        console.error("Failed to refresh balance:", error);
        toast({
          title: "Could not refresh balance",
          description: "Your withdrawal was submitted. Pull to refresh the page to see the latest amount.",
          variant: "default",
        });
      }
    }
  };

  const handleCallCustomer = (phoneNumber: string, clientName: string) => {
    if (!phoneNumber || phoneNumber === "Contact info not available") {
      toast({
        title: "No Contact Info",
        description: "Customer contact information is not available.",
        variant: "destructive",
      });
      return;
    }
    
    const telLink = `tel:${phoneNumber}`;
    window.open(telLink, '_blank');
    
    toast({
      title: "Calling Customer",
      description: `Calling ${clientName}`,
    });
  };

const handleTrackAddress = (address: string) => {
  console.log("Track Address clicked with address:", address);
  
  if (!address || address === "Address not provided" || address === "Contact info not available") {
    console.log("Address validation failed");
    toast({
      title: "No Address",
      description: "Address is not provided for this booking.",
      variant: "destructive",
    });
    return;
  }
  
  console.log("Setting trackAddressDialogOpen to true with address:", address);
  setSelectedAddress(address);
  setTrackAddressDialogOpen(true);
};

  const handleStartTask = async (bookingId: string, bookingData: any) => {
    if (!bookingId || !bookingData) return;

    const serviceDayId = bookingData.today_service?.service_day_id;
    if (!serviceDayId) {
      toast({
        title: "Error",
        description: "Service day ID not found. Cannot start service.",
        variant: "destructive",
      });
      return;
    }

    const previousStatus = taskStatus[bookingId];

    setTaskStatus(prev => ({ ...prev, [bookingId]: "IN_PROGRESS" }));
    setTaskStatusUpdating(prev => ({ ...prev, [bookingId]: true }));

    try {
      await PaymentInstance.post(
        `api/engagement-service/service-days/${serviceDayId}/start`,
        {},
        { 
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          } 
        }
      );

      toast({
        title: "Service Started",
        description: "You have successfully started the service. Task is now IN_PROGRESS",
        variant: "default",
      });

      await fetchData();
    } catch (err) {
      setTaskStatus(prev => ({ ...prev, [bookingId]: previousStatus }));
      
      let errorMessage = "Failed to start service";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTaskStatusUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleStopTask = async (bookingId: string, bookingData: any) => {
    setCurrentBooking({ bookingId, bookingData });
    setOtpDialogOpen(true);
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!currentBooking) return;

    const serviceDayId = currentBooking.bookingData.today_service?.service_day_id;
    if (!serviceDayId) {
      toast({
        title: "Error",
        description: "Service day ID not found",
        variant: "destructive",
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      await PaymentInstance.post(
        `api/engagement-service/service-days/${serviceDayId}/complete`,
        { otp },
        { 
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          } 
        }
      );

      toast({
        title: "Success",
        description: "Service completed successfully! Earnings credited to your account.",
        variant: "default",
      });

      setTaskStatus(prev => ({ ...prev, [currentBooking.bookingId]: "COMPLETED" }));
      await fetchData();
      return Promise.resolve();
    } catch (err) {
      let errorMessage = "Failed to complete service";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return Promise.reject(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const upcomingBookings = bookings
    ? [...(bookings.current || []), ...(bookings.upcoming || [])].map(formatBookingForCard)
    : [];

  const latestBooking = upcomingBookings.length > 0 ? [upcomingBookings[0]] : [];

  const unavailabilityMonth = useMemo(
    () => moment().format("YYYY-MM"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unavailDialogOpen]
  );
  const leaveEngagementOptions = useMemo(() => {
    if (!bookings) return [] as { value: string; label: string }[];
    const out: { value: string; label: string }[] = [];
    const seen = new Set<string>();
    const fromRow = (b: any) => {
      const id = b?.engagement_id;
      if (id == null) return;
      const s = String(id);
      if (seen.has(s)) return;
      seen.add(s);
      const name =
        [b?.firstname, b?.lastname]
          .filter(Boolean)
          .join(" ")
          .trim() || (b?.customerid != null ? `Customer #${b.customerid}` : "—");
      out.push({ value: s, label: `#${s} · ${name}` });
    };
    bookings.current?.forEach(fromRow);
    bookings.upcoming?.forEach(fromRow);
    return out;
  }, [bookings]);

  const bumpCalendar = () => setCalendarRefresh((c) => c + 1);

  const userDisplayName = userName || auth0User?.name || "Guest";
  const userEmail = appUser?.email || auth0User?.email;
  const avatarUrl = (appUser?.picture as string) || (auth0User?.picture as string) || null;
  const userInitials = userDisplayName
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SP";

  return (
    <div className="min-h-screen bg-slate-50/80">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/90 shadow-sm shadow-slate-200/30 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3 sm:h-[4.25rem]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-slate-800 text-white shadow-md ring-1 ring-slate-900/10">
                <Home className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 sm:text-base">Serveaso Provider</p>
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:text-xs">
                  Service dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <div className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden />
              <div className="flex min-w-0 max-w-[10rem] items-center gap-2.5 sm:max-w-xs">
                <div className="min-w-0 text-right sm:block">
                  <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                    {userDisplayName}
                  </p>
                  {userEmail && (
                    <p className="hidden truncate text-[11px] text-slate-500 sm:block sm:text-xs">
                      {userEmail}
                    </p>
                  )}
                </div>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-slate-200/80"
                  />
                ) : (
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800 ring-2 ring-slate-200/60"
                    aria-hidden
                  >
                    {userInitials}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200/60 bg-gradient-to-b from-sky-100/50 via-white to-slate-50/40">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-800/80 sm:text-xs">
            Today
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {userDisplayName}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:max-w-2xl">
            {`Here's what's happening with your services today. Bookings, payouts, and quick actions in one place.`}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-5 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <DashboardMetricCard key={index} {...metric} />
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-900/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100/90 bg-slate-50/50 py-3.5 sm:py-4">
                <CardTitle className="text-base font-bold text-slate-900 sm:text-lg">Recent booking</CardTitle>
                {!loading && latestBooking.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-sky-100 text-[10px] font-semibold text-sky-800 ring-1 ring-sky-200/60 sm:text-xs"
                  >
                    Latest
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="p-4 sm:p-5">
                {loading ? (
                  <div className="flex min-h-[120px] items-center justify-center py-6">
                    <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-slate-600">
                    <p className="text-sm font-medium">Failed to load bookings. Please try again.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 border-slate-300"
                      onClick={fetchData}
                    >
                      Retry
                    </Button>
                  </div>
                ) : latestBooking.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 py-10 text-center">
                    <p className="text-sm text-slate-500">No upcoming bookings found.</p>
                  </div>
                ) : (
                  latestBooking.map((booking) => {
                    const todayServiceStatus = booking.bookingData?.today_service?.status;
                    const taskStatusOriginal = booking.task_status?.toUpperCase();
                    
                    const isInProgress = todayServiceStatus === 'IN_PROGRESS' || 
                                         taskStatus[booking.id] === 'IN_PROGRESS' || 
                                         taskStatusOriginal === 'IN_PROGRESS' || 
                                         taskStatusOriginal === 'STARTED';
                    
                    const isCompleted = todayServiceStatus === 'COMPLETED' || 
                                        taskStatusOriginal === 'COMPLETED';
                    
                    const isNotStarted = todayServiceStatus === 'SCHEDULED' || 
                                         taskStatusOriginal === 'NOT_STARTED';

                    const canStart = booking.bookingData?.today_service?.can_start === true;
                    
                    const showStartButton = isNotStarted && canStart;
                    const showCompleteButton = isInProgress;
                    const showCompletedButton = isCompleted;

                    return (
                      <div
                        key={booking.id}
                        className="mb-0 rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 ring-1 ring-slate-900/5"
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                              Booking ID: {booking.bookingId || "N/A"}
                            </p>
                            <h2 className="text-base font-semibold text-slate-900">{booking.clientName}</h2>
                            <p className="text-xs text-slate-500">{booking.service}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                            {getBookingTypeBadge(booking.bookingData.booking_type || booking.bookingData.bookingType)}
                            {getStatusBadge(booking.bookingData.task_status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Date & Time</p>
                            <p className="text-xs">
                              {booking.date} at {booking.time}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Amount</p>
                              <p className="text-xs font-semibold">
                                {booking.amount}
                              </p>
                            </div>
                            {booking.bookingData?.mobileno && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => handleCallCustomer(booking.bookingData.mobileno, booking.clientName)}
                                title={`Call ${booking.clientName}`}
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Responsibilities</p>
                          <div className="flex flex-wrap gap-1">
                            {booking.bookingData?.responsibilities?.tasks?.map((task: any, index: number) => {
                              const taskLabel = task.persons ? `${task.persons} persons` : "";
                              return (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {task.taskType} {taskLabel}
                                </Badge>
                              );
                            })}
                            {booking.bookingData?.responsibilities?.add_ons?.map((addon: any, index: number) => (
                              <Badge key={`addon-${index}`} variant="outline" className="text-xs bg-blue-50">
                                Add-on: {typeof addon === 'object' ? JSON.stringify(addon) : addon}
                              </Badge>
                            ))}
                            {(!booking.bookingData?.responsibilities?.tasks?.length && !booking.bookingData?.responsibilities?.add_ons?.length) && (
                              <span className="text-xs text-muted-foreground">No responsibilities listed</span>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-muted-foreground">Address</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleTrackAddress(booking.location)}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              Track Address
                            </Button>
                          </div>
                          <p className="text-xs">
                            {booking.location || "R4J8+WCR, Bazar, Haripal Station Rd, opposite to state bank, Haripal, Jejur, West Bengal 712405, India"}
                          </p>
                        </div>

                        {todayServiceStatus && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Today's Service:</span>
                              <Badge 
                                variant="outline"
                                className={`
                                  text-xs
                                  ${todayServiceStatus === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                  ${todayServiceStatus === 'IN_PROGRESS' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                  ${todayServiceStatus === 'COMPLETED' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                                `}
                              >
                                {todayServiceStatus}
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">
                            {isInProgress 
                              ? "Task In Progress" 
                              : isCompleted 
                                ? 'Task Completed' 
                                : isNotStarted
                                  ? 'Not Started' 
                                  : 'Upcoming'
                            }
                          </p>
                          <div className="flex gap-2">
                            {taskStatusUpdating[booking.id] ? (
                              <Button variant="ghost" size="sm" disabled>
                                <Loader2 className="h-3 w-3 animate-spin" />
                              </Button>
                            ) : showCompleteButton ? (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => handleStopTask(booking.id, booking.bookingData)}
                              >
                                Complete Task
                              </Button>
                            ) : showCompletedButton ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-7 text-xs px-2 bg-green-50 text-green-700 border-green-200"
                                disabled
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Button>
                            ) : showStartButton ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => handleStartTask(booking.id, booking.bookingData)}
                              >
                                Start Task
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-7 text-xs px-2 bg-gray-50 text-gray-500 border-gray-200"
                                disabled
                              >
                                Cannot Start Yet
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/30 ring-1 ring-slate-900/5">
              <CardHeader className="border-b border-slate-100/90 bg-slate-50/50 py-3.5">
                <CardTitle className="text-base font-bold text-slate-900">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 sm:p-4">
                <AllBookingsDialog
                  bookings={bookings}
                  serviceProviderId={serviceProviderId}
                  trigger={
                    <Button
                      type="button"
                      className="w-full justify-start gap-2 rounded-lg border-slate-200/90 text-sm text-slate-800 hover:border-sky-200 hover:bg-sky-50/80"
                      variant="outline"
                      size="sm"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-100 text-sky-800">
                        <Users className="h-3.5 w-3.5" />
                      </span>
                      View all bookings
                    </Button>
                  }
                />
                <Button
                  type="button"
                  className="w-full justify-start gap-2 rounded-lg border-slate-200/90 text-sm text-slate-800 hover:border-sky-200 hover:bg-sky-50/80"
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawalDialogOpen(true)}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 text-violet-800">
                    <IndianRupee className="h-3.5 w-3.5" />
                  </span>
                  Request withdrawal
                </Button>
                <Button
                  type="button"
                  className="w-full justify-start gap-2 rounded-lg border-slate-200/90 text-sm text-slate-800 hover:border-sky-200 hover:bg-sky-50/80"
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawalHistoryDialogOpen(true)}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-900">
                    <Receipt className="h-3.5 w-3.5" />
                  </span>
                  Withdrawal history
                </Button>
                <Button
                  type="button"
                  className="w-full justify-start gap-2 rounded-lg border-slate-200/90 text-sm text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                  variant="outline"
                  size="sm"
                  onClick={() => setLeaveDialogOpen(true)}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Calendar className="h-3.5 w-3.5" />
                  </span>
                  {t("providerApplyLeave")}
                </Button>
                <Button
                  type="button"
                  className="w-full justify-start gap-2 rounded-lg border-slate-200/90 text-sm text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                  variant="outline"
                  size="sm"
                  onClick={() => setUnavailDialogOpen(true)}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Clock className="h-3.5 w-3.5" />
                  </span>
                  {t("providerMarkUnavailable")}
                </Button>
                <Button
                  type="button"
                  className="w-full justify-start gap-2 rounded-lg border-slate-200/90 text-sm text-slate-800 hover:border-amber-200 hover:bg-amber-50/80"
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewsDialogOpen(true)}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-900">
                    <Star className="h-3.5 w-3.5" />
                  </span>
                  View reviews
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/30 ring-1 ring-slate-900/5">
              <CardHeader className="border-b border-slate-100/90 bg-slate-50/50 py-3.5">
                <CardTitle className="text-base font-bold text-slate-900">Service status</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100/90 bg-slate-50/50 px-3 py-2">
                    <span className="text-xs font-medium text-slate-600">Profile status</span>
                    <Badge className="border-0 bg-emerald-100 text-xs font-medium text-emerald-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100/90 bg-slate-50/50 px-3 py-2">
                    <span className="text-xs font-medium text-slate-600">Verification</span>
                    <Badge className="border-0 bg-emerald-100 text-xs font-medium text-emerald-800">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100/90 bg-slate-50/50 px-3 py-2">
                    <span className="text-xs font-medium text-slate-600">Availability</span>
                    <Badge className="border-0 bg-sky-100 text-xs font-medium text-sky-900">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-2">
          {serviceProviderId !== null && (
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2 sm:p-3 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/5">
              <ProviderCalendarBig
                providerId={serviceProviderId}
                refreshToken={calendarRefresh}
              />
            </div>
          )}
        </div>
        
        <ReviewsDialog
          open={reviewsDialogOpen}
          onOpenChange={setReviewsDialogOpen}
          serviceProviderId={serviceProviderId}
        />

        <OtpVerificationDialog
          open={otpDialogOpen}
          onOpenChange={setOtpDialogOpen}
          onVerify={handleVerifyOtp}
          verifying={verifyingOtp}
          bookingInfo={currentBooking ? {
            clientName: currentBooking.bookingData?.firstname || currentBooking.bookingData?.customerName,
            service: getServiceTitle(currentBooking.bookingData?.service_type || currentBooking.bookingData?.serviceType),
            bookingId: currentBooking.bookingData?.engagement_id || currentBooking.bookingData?.id,
          } : undefined}
        />
        
        <WithdrawalHistoryDialog
          open={withdrawalHistoryDialogOpen}
          onOpenChange={setWithdrawalHistoryDialogOpen}
          serviceProviderId={serviceProviderId}
        />
        
        <WithdrawalDialog
          open={withdrawalDialogOpen}
          onOpenChange={setWithdrawalDialogOpen}
          serviceProviderId={serviceProviderId}
          availableBalance={payout?.summary?.available_to_withdraw || 0}
          onWithdrawalSuccess={handleWithdrawalSuccess}
        />

        <ProviderLeaveDialog
          open={leaveDialogOpen}
          onOpenChange={setLeaveDialogOpen}
          serviceProviderId={serviceProviderId}
          engagementOptions={leaveEngagementOptions}
          onSuccess={bumpCalendar}
        />
        <ProviderUnavailabilityDialog
          open={unavailDialogOpen}
          onOpenChange={setUnavailDialogOpen}
          serviceProviderId={serviceProviderId}
          month={unavailabilityMonth}
          onSuccess={bumpCalendar}
        />

        {/* Track Address Dialog - Simplified */}
        {trackAddressDialogOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div className="w-full max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
      <TrackAddress 
        onClose={() => setTrackAddressDialogOpen(false)}
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        destinationAddress={selectedAddress}
      />
    </div>
  </div>
)}
      </main>
    </div>
  );
}