/* eslint-disable */
import { useState, useEffect } from "react";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { BookingCard } from "./BookingCard";
import { PaymentHistory } from "./PaymentHistory";
import { PerformanceChart } from "./PerformanceChart";
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
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  CreditCard,
  Wallet
} from "lucide-react";
import axiosInstance from "../../services/axiosInstance";
import { useAuth0 } from '@auth0/auth0-react';
import { AllBookingsDialog } from "./AllBookingsDialog";
import { getBookingTypeBadge, getServiceTitle, getStatusBadge } from "../Common/Booking/BookingUtils";
// Removed MUI Switch import as requested; we'll use start/stop buttons instead
import { ReviewsDialog } from "./ReviewsDialog";
import axios, { AxiosResponse } from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ProviderCalendarBig from "./ProviderCalendarBig";
import PaymentInstance from "src/services/paymentInstance";

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

// Function to format API booking data for the BookingCard component
const formatBookingForCard = (booking: any) => {
  const startDateRaw = booking.startDate || booking.start_date;
  const endDateRaw = booking.endDate || booking.endDate;
  const startTimeStr = booking.startTime || "00:00";
  const endTimeStr = booking.endTime || "00:00";

  const startDate = new Date(startDateRaw);
  const endDate = new Date(startDateRaw);

  const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
  const [endHours, endMinutes] = endTimeStr.split(":").map(Number);

  startDate.setHours(startHours, startMinutes);
  endDate.setHours(endHours, endMinutes);

  const timeRange = `${startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} - ${endDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;

  const clientName = [booking.firstname, booking.middlename, booking.lastname, booking.customerName]
    .filter(Boolean)
    .join(" ");

  return {
    id: booking.id.toString(),
    bookingId: booking.id.toString(),
    clientName,
    service: getServiceTitle(booking.serviceType || booking.service_type),
    date: startDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: timeRange,
    location: booking.address || "Address not provided",
    status: booking.taskStatus === "COMPLETED" ? "completed" : 
            booking.taskStatus === "IN_PROGRESS" ? "in-progress" : "upcoming",
    amount: `₹${booking.monthlyAmount}`,
    bookingData: booking,
    responsibilities: booking.responsibilities || {},
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
  // taskStatus now stores explicit status strings rather than booleans
  const [taskStatus, setTaskStatus] = useState<Record<string, "IN_PROGRESS" | "COMPLETED" | undefined>>({});
  // track which booking is currently updating so we can show a loader on the button
  const [taskStatusUpdating, setTaskStatusUpdating] = useState<Record<string, boolean>>({});

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
      title: "Service Fee",
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

  // Get current month and year in "YYYY-MM" format
  const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  // ✅ Extract name and serviceProviderId from Auth0 user
  useEffect(() => {
    if (isAuthenticated && auth0User) {
      const name = auth0User.name || null;
      const id =
        auth0User.serviceProviderId ||
        auth0User["https://yourdomain.com/serviceProviderId"] || 
        null;

      setUserName(name);
      setServiceProviderId(id ? Number(id) : null);
    }
  }, [isAuthenticated, auth0User]);

//  fetchData outside of useEffect
const fetchData = async () => {
  if (!serviceProviderId) return;

  try {
    setLoading(true);
    const currentMonthYear = getCurrentMonthYear();

    // Fetch payout data
    const payoutResponse: AxiosResponse<ProviderPayoutResponse> = await PaymentInstance.get(
      `/api/service-providers/${serviceProviderId}/payouts?month=${currentMonthYear}&detailed=true`
    );
    setPayout(payoutResponse.data);

    // Fetch booking engagements
    const response = await PaymentInstance.get(
      `/api/service-providers/${serviceProviderId}/engagements?month=${currentMonthYear}`
    );

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BookingHistoryResponse = response.data;
    setBookings(data);

    setError(null); // clear any previous errors
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

//  Keep useEffect, just call fetchData
useEffect(() => {
  if (serviceProviderId) {
    fetchData();
  }
}, [serviceProviderId, toast]);


  const handleContactClient = (booking: any) => {
    toast({
      title: "Contact Information",
      description: `Call ${booking.clientName} at ${booking.contact || "contact info not available"}`,
    });
  };

  // New start/stop handler (replaces Switch behavior)
  // When 'start' is true we send IN_PROGRESS; when false we send COMPLETED.
  const handleStartStop = async (bookingId: string, start: boolean) => {
    if (!bookingId) return;

    const statusToSend = start ? "IN_PROGRESS" : "COMPLETED";
    const previousStatus = taskStatus[bookingId];

    // optimistically update UI
    setTaskStatus(prev => ({ ...prev, [bookingId]: statusToSend }));
    setTaskStatusUpdating(prev => ({ ...prev, [bookingId]: true }));

    try {
      await PaymentInstance.put(
        `/api/engagements/${bookingId}`,
        { task_status: statusToSend },
        { headers: { "Content-Type": "application/json" } }
      );

      toast({
        title: "Task Status Updated",
        description: `Task is now ${statusToSend}`,
        variant: "default",
      });

      // Re-fetch the main data (payouts + engagements) to keep UI in sync
      await fetchData();
    } catch (err) {
      // revert optimistic update
      setTaskStatus(prev => ({ ...prev, [bookingId]: previousStatus }));
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setTaskStatusUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Combine current and future bookings for display
  const upcomingBookings = bookings
    ? [...(bookings.current || []), ...(bookings.upcoming || [])].map(formatBookingForCard)
    : [];

  // Get the most recent booking for display
  const latestBooking = upcomingBookings.length > 0 ? [upcomingBookings[0]] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* Welcome Section */}
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

        {/* Stats Section */}
        <div className="flex gap-3 sm:gap-6 justify-center md:justify-end mt-2 md:mt-0">
          {/* Active Bookings */}
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

          {/* Average Rating */}
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

          {/* Completion Rate */}
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
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <DashboardMetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Main Content Grid */}
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
    // derive status helpers
    const originalStatus = booking.bookingData?.taskStatus ? String(booking.bookingData.taskStatus).toUpperCase() : undefined;
    const isInProgress = taskStatus[booking.id] === 'IN_PROGRESS' || originalStatus === 'IN_PROGRESS' || originalStatus === 'STARTED';

    return (
      <div key={booking.id} className="border rounded-xl p-6 mb-6 shadow-sm bg-white">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Booking ID: {booking.bookingId}</p>
            <h2 className="text-lg font-semibold">{booking.clientName}</h2>
            <p className="text-sm text-muted-foreground">{booking.service}</p>
          </div>
          <div className="flex gap-2 items-center">
            {getBookingTypeBadge(booking.bookingData.booking_type || booking.bookingData.bookingType)}
            {getStatusBadge(booking.bookingData.taskStatus)}
          </div>
        </div>

        {/* Date & Amount */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
            <p className="text-sm">{booking.date} at {booking.time}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Amount</p>
            <p className="text-sm font-semibold">{booking.amount}</p>
          </div>
        </div>

        {/* Responsibilities */}
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Responsibilities</p>
          <div className="flex flex-wrap gap-2">
            {[
              ...((booking.responsibilities?.tasks || []).map((task: any) => ({ task, isAddon: false }))),
              ...((booking.responsibilities?.add_ons || []).map((task: any) => ({ task, isAddon: true }))),
            ].map((item: any, index: number) => {
              const { task, isAddon } = item;
              const taskLabel =
                typeof task === "object" && task !== null
                  ? Object.entries(task)
                      .filter(([key]) => key !== "taskType")
                      .map(([key, value]) => `${value} ${key}`)
                      .join(", ")
                  : "";
              const taskName = typeof task === "object" ? task.taskType : task;
              return (
                <Badge key={index} variant="outline" className="text-xs">
                  {isAddon ? "Add-ons: " : ""}
                  {taskName} {taskLabel && `- ${taskLabel}`}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Address */}
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
          <p className="text-sm">{booking.location || "Address not provided"}</p>
        </div>

        {/* Start / Stop Buttons */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">
            {isInProgress ? "Task In Progress" : (originalStatus === 'COMPLETED' ? 'Task Completed' : 'Not Started')}
          </p>
          <div className="flex gap-2">
            {taskStatusUpdating[booking.id] ? (
              <Button variant="ghost" size="sm" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : isInProgress ? (
              <Button variant="destructive" size="sm" onClick={() => handleStartStop(booking.id, false)}>
                Stop Task
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleStartStop(booking.id, true)}>
                Start Task
              </Button>
            )}
          </div>
        </div>

        {/* Contact Button */}
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

          {/* Quick Actions */}
          <div>
            <Card className="border-0 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
               <AllBookingsDialog
              bookings={bookings}   // pass the whole object {current, future, past}
              serviceProviderId={serviceProviderId}  // pass ID so dialog can refetch
                trigger={
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    View All Bookings
                  </Button>
                }
              />
                <Button className="w-full justify-start" variant="outline">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Request Withdrawal
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

            {/* Service Status */}
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

        {/* Charts and Payment History */}
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
      </main>
    </div>
  );
}
