/* eslint-disable */
import { useState, useEffect } from "react";
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
  Receipt
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
import WithdrawalDialog from "./WithdrawalDialog"; // Add this import
import { WithdrawalHistoryDialog } from "./WithdrawalHistoryDialog";

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
    location: booking.address || booking.location || "Address not provided",
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
  // Add state for withdrawal dialog
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);

  const metrics = [
    {
      title: "Total Earnings",
      value: `₹${payout?.summary?.total_earned?.toLocaleString("en-IN") || 0}`,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: IndianRupee,
      description: "This month"
    },
    {
      title: "Security Deposit",
      value: `₹${payout?.summary?.security_deposit_amount?.toLocaleString("en-IN") || 0}`,
      change: payout?.summary?.security_deposit_paid ? "Paid" : "Not Paid",
      changeType: payout?.summary?.security_deposit_paid ? ("neutral" as const) : ("negative" as const),
      icon: Shield,
      description: "For active bookings"
    },
    {
      title: "Withdrawal",
      value: `₹${(
        (payout?.summary?.total_earned || 0) - (payout?.summary?.available_to_withdraw || 0)
      ).toLocaleString("en-IN")}`,
      change: "-10%",
      changeType: "negative" as const,
      icon: CreditCard,
      description: "Service charges"
    },
    {
      title: "Actual Payout",
      value: `₹${payout?.summary?.available_to_withdraw?.toLocaleString("en-IN") || 0}`,
      change: "+10.2%",
      changeType: "positive" as const,
      icon: Wallet,
      description: "After deductions"
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

  // Add function to handle withdrawal success
  const handleWithdrawalSuccess = async () => {
    // Refresh payout data after successful withdrawal
    if (serviceProviderId) {
      try {
        const currentMonthYear = getCurrentMonthYear();
        const payoutResponse: AxiosResponse<ProviderPayoutResponse> = await PaymentInstance.get(
          `/api/service-providers/${serviceProviderId}/payouts?month=${currentMonthYear}&detailed=true`
        );
        setPayout(payoutResponse.data);
        
        toast({
          title: "Balance Updated",
          description: "Your wallet balance has been updated.",
          variant: "default",
        });
      } catch (error) {
        console.error("Failed to refresh balance:", error);
      }
    }
  };

  const handleContactClient = (booking: any) => {
    const contactInfo = booking.contact || booking.bookingData?.mobileno || "Contact info not available";
    
    toast({
      title: "Contact Information",
      description: `Call ${booking.clientName} at ${contactInfo}`,
    });
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Home className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">ServEase Provider</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-semibold text-foreground">Maya Patel</p>
                  <p className="text-sm text-muted-foreground">Cleaning Specialist</p>
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">MP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className="mb-6 p-3 sm:p-6 shadow-sm flex items-center justify-between flex-wrap md:flex-nowrap"
        style={{
          background: "linear-gradient(rgb(177 213 232) 0%, rgb(255, 255, 255) 100%)",
          color: "white",
        }}
      >
        <div className="flex-1 text-center min-w-[180px]">
          <div className="flex justify-center items-center gap-1 md:gap-2 mb-1">
            <Home className="h-3.5 w-3.5 md:h-5 md:w-5 text-[#004aad]" />
            <h1 className="font-bold leading-tight">
              <span
                className="block md:hidden"
                style={{ fontSize: "1.2rem", color: "rgb(14, 48, 92)" }}
              >
                Welcome back, {userName || "Guest"}
              </span>
              <span
                className="hidden md:block"
                style={{ fontSize: "2.5rem", color: "rgb(14, 48, 92)" }}
              >
                Welcome back, {userName || "Guest"}
              </span>
            </h1>
          </div>
          <p className="opacity-90 text-[10px] sm:text-sm text-[#004aad]">
            Here's what's happening with your services today.
          </p>
        </div>

        <div className="flex gap-3 sm:gap-6 justify-center md:justify-end mt-2 md:mt-0">
          <div className="flex flex-col items-center">
            <div className="relative bg-white rounded-full p-1.5 md:p-2 shadow-md">
              <Calendar className="h-3.5 w-3.5 md:h-5 md:w-5 text-blue-500" />
              <span
                className="absolute -top-1 -right-1 bg-sky-300 rounded-full text-[9px] md:text-[10px] h-3.5 w-3.5 md:h-4 md:w-4 flex items-center justify-center"
                style={{ color: "rgb(14, 48, 92)" }}
              >
                +3
              </span>
            </div>
            <span
              className="text-[9px] sm:text-[10px] mt-1"
              style={{ color: "rgb(14, 48, 92)" }}
            >
              Bookings
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative bg-white rounded-full p-1.5 md:p-2 shadow-md">
              <Star className="h-3.5 w-3.5 md:h-5 md:w-5 text-yellow-500" />
              <span
                className="absolute -top-1 -right-1 bg-sky-300 rounded-full text-[9px] md:text-[10px] h-3.5 w-3.5 md:h-4 md:w-4 flex items-center justify-center"
                style={{ color: "rgb(14, 48, 92)" }}
              >
                +2%
              </span>
            </div>
            <span
              className="text-[9px] sm:text-[10px] mt-1"
              style={{ color: "rgb(14, 48, 92)" }}
            >
              Rating
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative bg-white rounded-full p-1.5 md:p-2 shadow-md">
              <TrendingUp className="h-3.5 w-3.5 md:h-5 md:w-5 text-green-500" />
              <span
                className="absolute -top-1 -right-1 bg-sky-300 rounded-full text-[9px] md:text-[10px] h-3.5 w-3.5 md:h-4 md:w-4 flex items-center justify-center"
                style={{ color: "rgb(14, 48, 92)" }}
              >
                +2%
              </span>
            </div>
            <span
              className="text-[9px] sm:text-[10px] mt-1"
              style={{ color: "rgb(14, 48, 92)" }}
            >
              Completion
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <DashboardMetricCard key={index} {...metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">Recent Booking</CardTitle>
                {!loading && latestBooking.length > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Latest
                  </Badge>
                )}
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Failed to load bookings. Please try again.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={fetchData}
                    >
                      Retry
                    </Button>
                  </div>
                ) : latestBooking.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No upcoming bookings found.</p>
                  </div>
                ) : (
                  latestBooking.map((booking) => {
                    // FIX: Check today_service status instead of just task_status
                    const todayServiceStatus = booking.bookingData?.today_service?.status;
                    const taskStatusOriginal = booking.task_status?.toUpperCase();
                    
                    // Check if service is in progress
                    const isInProgress = todayServiceStatus === 'IN_PROGRESS' || 
                                         taskStatus[booking.id] === 'IN_PROGRESS' || 
                                         taskStatusOriginal === 'IN_PROGRESS' || 
                                         taskStatusOriginal === 'STARTED';
                    
                    const isCompleted = todayServiceStatus === 'COMPLETED' || 
                                        taskStatusOriginal === 'COMPLETED';
                    
                    const isNotStarted = todayServiceStatus === 'SCHEDULED' || 
                                         taskStatusOriginal === 'NOT_STARTED';

                    // Check if service can be started based on today_service
                    const canStart = booking.bookingData?.today_service?.can_start === true;
                    
                    // Determine which button to show
                    const showStartButton = isNotStarted && canStart;
                    const showCompleteButton = isInProgress;
                    const showCompletedButton = isCompleted;

                    return (
                      <div key={booking.id} className="border rounded-xl p-6 mb-6 shadow-sm bg-white">
                        
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Booking ID: {booking.bookingId || "N/A"}
                            </p>
                            <h2 className="text-lg font-semibold">{booking.clientName}</h2>
                            <p className="text-sm text-muted-foreground">{booking.service}</p>
                          </div>
                          <div className="flex gap-2 items-center">
                            {getBookingTypeBadge(booking.bookingData.booking_type || booking.bookingData.bookingType)}
                            {getStatusBadge(booking.bookingData.task_status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                            <p className="text-sm">
                              {booking.date} at {booking.time}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Amount</p>
                            <p className="text-sm font-semibold">
                              {booking.amount}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Responsibilities</p>
                          <div className="flex flex-wrap gap-2">
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

                        <div className="mb-4">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                          <p className="text-sm">
                            {booking.location || "Address not provided"}
                          </p>
                          {booking.bookingData?.mobileno && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Contact: {booking.bookingData.mobileno}
                            </p>
                          )}
                        </div>

                        {/* Today's Service Status Badge */}
                        {todayServiceStatus && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">Today's Service:</span>
                              <Badge 
                                variant="outline"
                                className={`
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

                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium text-muted-foreground">
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
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </Button>
                            ) : showCompleteButton ? (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleStopTask(booking.id, booking.bookingData)}
                              >
                                Complete Task
                              </Button>
                            ) : showCompletedButton ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                disabled
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completed
                              </Button>
                            ) : showStartButton ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleStartTask(booking.id, booking.bookingData)}
                              >
                                Start Task
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                disabled
                                className="bg-gray-50 text-gray-500 border-gray-200"
                              >
                                Cannot Start Yet
                              </Button>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleContactClient(booking)}
                        >
                          Contact Client
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AllBookingsDialog
                  bookings={bookings}
                  serviceProviderId={serviceProviderId}
                  trigger={
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      View All Bookings
                    </Button>
                  }
                />
                {/* Updated Request Withdrawal Button */}
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setWithdrawalDialogOpen(true)}
                  // disabled={!payout?.summary?.available_to_withdraw || payout.summary.available_to_withdraw < 500}
                >
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Request Withdrawal
                  {/* {(payout?.summary?.available_to_withdraw || 0) < 500 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                      Min ₹500
                    </span>
                  )} */}
                </Button>
               <Button 
  className="w-full justify-start" 
  variant="outline"
  onClick={() => setWithdrawalHistoryDialogOpen(true)}
>
  <Receipt className="h-4 w-4 mr-2" /> {/* You might want to use a different icon */}
  Withdrawal History
</Button> 
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Apply Leave
                </Button>

                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Update Availability
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setReviewsDialogOpen(true)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  View Reviews
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Profile Status</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Verification</span>
                    <Badge className="bg-success text-success-foreground">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Availability</span>
                    <Badge className="bg-primary text-primary-foreground">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {serviceProviderId !== null && (
            <ProviderCalendarBig providerId={serviceProviderId} />
          )}
          <PaymentHistory payments={paymentHistory} />
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
        {/* Add WithdrawalDialog here */}
        <WithdrawalDialog
          open={withdrawalDialogOpen}
          onOpenChange={setWithdrawalDialogOpen}
          serviceProviderId={serviceProviderId}
          availableBalance={payout?.summary?.available_to_withdraw || 0}
          onWithdrawalSuccess={handleWithdrawalSuccess}
        />
      </main>
    </div>
  );
}