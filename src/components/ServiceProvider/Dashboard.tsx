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
 
// Types for API response
interface CustomerHoliday {
  id: number;
  customerId: number;
  applyHolidayDate: string;
  startDate: string;
  endDate: string;
  serviceType: string;
  active: boolean;
}

interface ServiceProviderLeave {
  id: number;
  serviceProviderId: number;
  applyLeaveDate: string;
  startDate: string;
  endDate: string;
  serviceType: string;
  active: boolean;
}

interface Booking {
  id: number;
  serviceProviderId: number;
  customerId: number;
  startDate: string;
  endDate: string;
  engagements: string;
  timeslot: string;
  monthlyAmount: number;
  paymentMode: string;
  bookingType: string;
  serviceType: string;
  bookingDate: string;
  responsibilities: string[];
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
}

interface BookingHistoryResponse {
  current: Booking[];
  future: Booking[];
  past: Booking[];
}

// Mock data for metrics and payments (you might want to fetch these from APIs too)
const metrics = [
  {
    title: "Total Earnings",
    value: "₹24,580",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: IndianRupee,
    description: "This month"
  },
 
  {
    title: "Security Deposit",
    value: "₹2,500",
    change: "Held",
    changeType: "neutral" as const,
    icon: Shield,
    description: "For active bookings"
  },
  {
    title: "Service Fee",
    value: "₹1,230",
    change: "-10%",
    changeType: "negative" as const,
    icon: CreditCard,
    description: "Service charges"
  },
  {
    title: "Actual Payout",
    value: "₹20,850",
    change: "+10.2%",
    changeType: "positive" as const,
    icon: Wallet,
    description: "After deductions"
  }
];

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
const formatBookingForCard = (booking: Booking) => {
  const status = booking.taskStatus === "COMPLETED" ? "completed" : 
                booking.taskStatus === "IN_PROGRESS" ? "in-progress" : "upcoming";
  
  return {
    id: booking.id.toString(),
    clientName: booking.customerName,
    service: getServiceTitle(booking.serviceType),
    date: new Date(booking.startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    time: booking.timeslot,
    location: booking.address || "Address not provided",
    status: status,
    amount: `₹${booking.monthlyAmount}`,
    contact: "Contact info not available", // You might want to fetch this separately
    bookingData: booking // Keep the original data for reference
  };
};

export default function Dashboard() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: auth0User, isAuthenticated } = useAuth0();
  
 const [userName, setUserName] = useState<string | null>(null);
  const [serviceProviderId, setServiceProviderId] = useState<number | null>(null);

  // ✅ Extract name and serviceProviderId from Auth0 user
  useEffect(() => {
    if (isAuthenticated && auth0User) {
      const name = auth0User.name || null;

      // 👇 Adjust this depending on how your Auth0 stores custom claims
      const id =
        auth0User.serviceProviderId ||
        auth0User["https://yourdomain.com/serviceProviderId"] || 
        null;

      setUserName(name);
      setServiceProviderId(id ? Number(id) : null);

      // console.log("Name:", name);
      // console.log("Service Provider ID:", id);
    }
  }, [isAuthenticated, auth0User]);

  // ✅ Fetch booking history once serviceProviderId is available
  useEffect(() => {
    if (!serviceProviderId) return; // Skip if null

    const fetchBookingHistory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/api/serviceproviders/get-sp-booking-history-by-serviceprovider?serviceProviderId=${serviceProviderId}`
        );
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BookingHistoryResponse = response.data;
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch booking history');
        toast({
          title: "Error",
          description: "Failed to load booking data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [serviceProviderId, toast]);

  const handleContactClient = (booking: any) => {
    toast({
      title: "Contact Information",
      description: `Call ${booking.clientName} at ${booking.contact}`,
    });
  };

  // Combine current and future bookings for display
  const upcomingBookings = bookings ? [
    ...(bookings.current || []),
    ...(bookings.future || [])
  ].map(formatBookingForCard) : [];

  // Get the most recent bookings for display (limit to 3)
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
  className="mb-6 p-4 sm:p-6 shadow-sm flex items-center justify-between"
  style={{
    background:
      "linear-gradient(to right, rgba(23, 43, 77, 0.8), rgba(26, 23, 77, 0.8))",
    color: "white",
  }}
>
  {/* Left Side - Welcome Section */}
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-1">
      <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      <h1 className="text-base sm:text-lg md:text-2xl font-bold">
        Welcome back, {userName || "Guest"}
      </h1>
    </div>
    <p className="opacity-90 text-xs sm:text-sm ml-6 sm:ml-7">
      Here's what's happening with your services today.
    </p>
  </div>

  {/* Right Side - Stats Section */}
  <div className="flex gap-2 sm:gap-3 md:gap-4">
    {/* Active Bookings */}
<div className="flex flex-col items-center">
  <div className="relative bg-white rounded-full p-1.5 sm:p-2 shadow-md">
    <Calendar className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-500" />
    <span className="absolute -top-1 -right-1 bg-sky-500 text-white rounded-full text-[9px] sm:text-[10px] h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center">
      +3
    </span>
  </div>
  <span className="text-[9px] sm:text-[10px] text-gray-200 mt-1 hidden md:block">
    Bookings
  </span>
</div>


    {/* Average Rating */}
    <div className="flex flex-col items-center">
      <div className="relative bg-white rounded-full p-1.5 sm:p-2 shadow-md">
  <Star className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-yellow-500" />
        <span className="absolute -top-1 -right-1 bg-sky-400 text-white rounded-full text-[9px] sm:text-[10px] h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center">
          +0.2
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] text-gray-200 mt-1 hidden md:block">
        Rating
      </span>
    </div>

    {/* Completion Rate */}
    <div className="flex flex-col items-center">
      <div className="relative bg-white rounded-full p-1.5 sm:p-2 shadow-md">
  <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-500" />
        <span className="absolute -top-1 -right-1 bg-sky-400 text-white rounded-full text-[9px] sm:text-[10px] h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center">
          +2%
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] text-gray-200 mt-1 hidden md:block">
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
           {/* Recent Booking (only 1) */}
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
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : latestBooking.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No upcoming bookings found.</p>
                </div>
              ) : (
                latestBooking.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{booking.clientName}</h3>
                        <p className="text-sm text-muted-foreground">{booking.service}</p>
                      </div>
                      <div className="flex gap-2">
                        {getBookingTypeBadge(booking.bookingData.bookingType)}
                        {getStatusBadge(booking.bookingData.taskStatus)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium">Date & Time</p>
                        <p className="text-sm">{booking.date} at {booking.time}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Amount</p>
                        <p className="text-sm font-semibold">{booking.amount}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm">{booking.location}</p>
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
                ))
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
                bookings={upcomingBookings}
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
                <Button className="w-full justify-start" variant="outline">
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
          <PerformanceChart />
          <PaymentHistory payments={paymentHistory} />
        </div>
      </main>
    </div>
  );
}