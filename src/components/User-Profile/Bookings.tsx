/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Phone, MessageCircle, Star, CheckCircle, XCircle, AlertCircle, History, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Common/Card';
import _ from 'lodash';
import { Button } from '../../components/Button/button';
import { Badge } from '../../components/Common/Badge/Badge';
import { Separator } from '../../components/Common/Separator/Separator';
import axiosInstance from '../../services/axiosInstance';
import { useAuth0 } from '@auth0/auth0-react';
import UserHoliday from './UserHoliday';
import { Alert, Snackbar } from '@mui/material';
import ModifyBookingDialog from './ModifyBookingDialog';
import dayjs from 'dayjs';
import { ClipLoader } from 'react-spinners';
import { getBookingTypeBadge, getServiceTitle, getStatusBadge } from '../Common/Booking/BookingUtils';
import ConfirmationDialog from './ConfirmationDialog';

interface CustomerHoliday {
  id: number;
  engagementId: number;
  customerId: number;
  applyHolidayDate: string;
  startDate: string;
  endDate: string;
  serviceType: string;
  active: boolean;
}
interface Booking {
  id: number;
  name: string;
  serviceProviderId: number;
  timeSlot: string;
  date: string;
  startDate: string;
  endDate: string;
  bookingType: string;
  monthlyAmount: number;
  paymentMode: string;
  address: string;
  customerName: string;
  serviceProviderName: string;
  taskStatus: string;
  bookingDate: string;
  engagements: string;
  serviceType: string;
  childAge: string;
  experience: string;
  noOfPersons: string;
  mealType: string;
  modifiedDate: string;
  responsibilities: string;
  customerHolidays?: CustomerHoliday[];
}

const getServiceIcon = (type: string) => {
  const iconClass = "text-2xl"; // Bigger emoji size
  switch (type) {
    case 'maid':
      return <span className={`${iconClass} text-orange-500`}>🧹</span>;
    case 'cleaning':
      return <span className={`${iconClass} text-pink-500`}>🧹</span>;
    case 'nanny':
      return <span className={`${iconClass} text-red-500`}>❤️</span>;
    default:
      return <span className={iconClass}>👩‍🍳</span>;
  }
};


const Booking: React.FC = () => {
   // STATE VARIABLES (grouped by category)
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [futureBookings, setFutureBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookingForLeave, setSelectedBookingForLeave] = useState<Booking | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modifiedBookings, setModifiedBookings] = useState<number[]>([]);
  const [bookingsWithVacation, setBookingsWithVacation] = useState<number[]>([]);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Other states
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [uniqueMissingSlots, setUniqueMissingSlots] = useState<string[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    type: 'cancel' | 'modify' | 'vacation' | null;
    booking: Booking | null;
    message: string;
    title: string;
    severity: 'info' | 'warning' | 'error' | 'success';
  }>({
    open: false,
    type: null,
    booking: null,
    message: '',
    title: '',
    severity: 'info'
  });

  // AUTH & INITIALIZATION
  const { user: auth0User, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      setCustomerId(auth0User.customerid);
      console.log("auth0User.customerid:", auth0User.customerid);
    }
  }, [isAuthenticated, auth0User]);

  // DATA FETCHING FUNCTIONS
  
useEffect(() => {
  // Set loading to true immediately when component mounts
  setIsLoading(true);
  
  const fetchBookings = async () => {
    try {
      if (customerId !== null && customerId !== undefined) {
        const response = await axiosInstance.get(
          `api/serviceproviders/get-sp-booking-history-by-customer?customerId=${customerId}`
        );
        
        const { past = [], current = [], future = [] } = response.data || {};
        setPastBookings(mapBookingData(past));
        setCurrentBookings(mapBookingData(current));
        setFutureBookings(mapBookingData(future));
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If we already have customerId, fetch immediately
  if (customerId !== null && customerId !== undefined) {
    fetchBookings();
  } 
  // If customerId is not available yet but we're authenticated, wait for it
  else if (isAuthenticated) {
    // Customer ID will be set by the other useEffect, which will trigger this flow
  }
  // If not authenticated at all, stop loading
  else {
    setIsLoading(false);
  }
}, [customerId, isAuthenticated]);

  // DATA MAPPING & UTILITY FUNCTIONS
  const mapBookingData = (data: any[]) => {
    return Array.isArray(data)
      ? data.map((item) => {
          return {
            id: item.id,
            customerId: item.customerId,
            serviceProviderId: item.serviceProviderId,
            name: item.customerName,
            timeSlot: item.timeslot,
            date: item.startDate,
            startDate: item.startDate,
            endDate: item.endDate,
            bookingType: item.bookingType,
            monthlyAmount: item.monthlyAmount,
            paymentMode: item.paymentMode,
            address: item.address || 'No address specified',
            customerName: item.customerName,
            serviceProviderName: item.serviceProviderName === "undefined undefined" ? "Not Assigned" : item.serviceProviderName,
            taskStatus: item.taskStatus,
            engagements: item.engagements,
            bookingDate: item.bookingDate,
            serviceType: item.serviceType?.toLowerCase() || 'other',
            childAge: item.childAge,
            experience: item.experience,
            noOfPersons: item.noOfPersons,
            mealType: item.mealType,
            modifiedDate: item.modifiedDate,
            responsibilities: item.responsibilities,
            customerHolidays: item.customerHolidays || [],
          };
        })
      : [];
  };
const hasMatchingHolidayIds = (booking: Booking): boolean => {
  if (!booking.customerHolidays || booking.customerHolidays.length === 0) {
    return false;
  }
  
  return _.some(
    booking.customerHolidays,
    (holiday) => holiday.engagementId === booking.id
  );
};



  // FILTER & SORT FUNCTIONS
  const filterBookings = (bookings: Booking[], term: string) => {
    if (!term) return bookings;
    
    return bookings.filter(booking => 
      getServiceTitle(booking?.serviceType).toLowerCase().includes(term?.toLowerCase()) ||
      booking.serviceProviderName?.toLowerCase().includes(term?.toLowerCase()) ||
      booking.address?.toLowerCase().includes(term?.toLowerCase()) ||
      booking.bookingType?.toLowerCase().includes(term?.toLowerCase())
    );
  };

  const sortUpcomingBookings = (bookings: Booking[]): Booking[] => {
    const statusOrder: Record<string, number> = {
      'ACTIVE': 1,
      'IN_PROGRESS': 2,
      'NOT_STARTED': 3,
      'COMPLETED': 4,
      'CANCELLED': 5
    };

    return [...bookings].sort((a, b) => {
      const statusComparison = statusOrder[a.taskStatus] - statusOrder[b.taskStatus];
      if (statusComparison !== 0) return statusComparison;
      return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
    });
  };

  const getRecentPastBookings = (bookings: Booking[]) => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= twoMonthsAgo;
    });
  };

  // ACTION HANDLERS - CONFIRMATION DIALOG
  const showConfirmation = (
    type: 'cancel' | 'modify' | 'vacation',
    booking: Booking,
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) => {
    setConfirmationDialog({
      open: true,
      type,
      booking,
      message,
      title,
      severity
    });
  };

  const handleConfirmAction = async () => {
    const { type, booking } = confirmationDialog;
    if (!booking) return;

    setActionLoading(true);

    try {
      switch (type) {
        case 'cancel':
          await handleCancelBooking(booking);
          break;
        case 'modify':
          setModifyDialogOpen(true);
          setSelectedBooking(booking);
          break;
        case 'vacation':
          setSelectedBookingForLeave(booking);
          setHolidayDialogOpen(true);
          break;
      }
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      setActionLoading(false);
      setConfirmationDialog(prev => ({ ...prev, open: false }));
    }
  };

  // ACTION HANDLERS - BUTTON CLICKS
  const handleCancelClick = (booking: Booking) => {
    showConfirmation(
      'cancel',
      booking,
      'Cancel Booking',
      `Are you sure you want to cancel your ${getServiceTitle(booking.serviceType)} booking? This action cannot be undone.`,
      'warning'
    );
  };

 const handleModifyClick = (booking: Booking) => {
  setSelectedBooking(booking);
  setModifyDialogOpen(true);
};
 const handleVacationClick = (booking: Booking) => {
  // if (booking.customerHolidays && booking.customerHolidays.some(h => h.active)) {
  //   return;
  // }

  // Just open the holiday dialog directly
  setSelectedBookingForLeave(booking);
  setHolidayDialogOpen(true);
};

  const handleApplyLeaveClick = (booking: Booking) => {
    setSelectedBookingForLeave(booking);
    setHolidayDialogOpen(true);
  };

  // ACTION HANDLERS - API CALLS
  const handleCancelBooking = async (booking: Booking) => {
    const updatedStatus = "CANCELLED";
    const serviceTypeUpperCase = booking.serviceType.toUpperCase();

    let updatePayload: any = {
      customerId: customerId,
      taskStatus: updatedStatus,
      modifiedBy: "CUSTOMER"
    };

    try {
      const response = await axiosInstance.put(
        `/api/serviceproviders/update/engagement/${booking.id}`,
        updatePayload
      );

      setCurrentBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, taskStatus: updatedStatus } : b
        )
      );
      setFutureBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, taskStatus: updatedStatus } : b
        )
      );
    } catch (error: any) {
      console.error("Error updating task status:", error);
      if (error.response) {
        console.error("Full error response:", error.response.data);
      } else if (error.message) {
        console.error("Error message:", error.message);
      } else {
        console.error("Unknown error occurred");
      }
    }

    setOpenSnackbar(true);
  };

 // Simplify the handleSaveModifiedBooking function:
const handleSaveModifiedBooking = async (updatedData: {
  startDate: string;
  endDate: string;
  timeSlot: string;
}) => {
  if (!selectedBooking) return;

  try {
    setIsRefreshing(true);
    
    // Update local state
    setCurrentBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBooking.id
          ? { 
              ...b, 
              startDate: updatedData.startDate,
              endDate: updatedData.endDate,
              timeSlot: updatedData.timeSlot 
            }
          : b
      )
    );
    setFutureBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBooking.id
          ? { 
              ...b, 
              startDate: updatedData.startDate,
              endDate: updatedData.endDate,
              timeSlot: updatedData.timeSlot 
            }
          : b
      )
    );
    setModifiedBookings(prev => [...prev, selectedBooking.id]);
    setModifyDialogOpen(false);
    setOpenSnackbar(true);
    
    // Refresh data
    if (customerId !== null) {
      await axiosInstance
        .get(`api/serviceproviders/get-sp-booking-history-by-customer?customerId=${customerId}`)
        .then((response) => {
          const { past = [], current = [], future = [] } = response.data || {};
          setPastBookings(mapBookingData(past));
          setCurrentBookings(mapBookingData(current));
          setFutureBookings(mapBookingData(future));
        });
    }
  } catch (error: any) {
    console.error("Error updating booking:", error);
    if (error.response) {
      console.error("Full error response:", error.response.data);
    }
  }
};

  const handleLeaveSubmit = async (startDate: string, endDate: string, serviceType: string): Promise<void> => {
    if (!selectedBookingForLeave || !customerId) {
      throw new Error("Missing required information for leave application");
    }

    try {
      setIsRefreshing(true);
      
      await axiosInstance.post(
        '/api/customer/add-customer-holiday',
        {
          engagementId: selectedBookingForLeave.id,
          startDate: startDate,
          endDate: endDate,
          serviceType: serviceType.toUpperCase()
        }
      );

      setBookingsWithVacation(prev => [...prev, selectedBookingForLeave.id]);

      if (customerId !== null) {
        await axiosInstance
          .get(`api/serviceproviders/get-sp-booking-history-by-customer?customerId=${customerId}`)
          .then((response) => {
            const { past = [], current = [], future = [] } = response.data || {};
            setPastBookings(mapBookingData(past));
            setCurrentBookings(mapBookingData(current));
            setFutureBookings(mapBookingData(future));
          });
      }

      setOpenSnackbar(true);
      setHolidayDialogOpen(false);
    } catch (error) {
      console.error("Error applying leave:", error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  // DATA PROCESSING (placed right before return for better readability)
  const upcomingBookings = sortUpcomingBookings([...currentBookings, ...futureBookings]);
  const filteredUpcomingBookings = filterBookings(upcomingBookings, searchTerm);
  const filteredPastBookings = filterBookings(pastBookings, searchTerm);

 return (
  <div className="min-h-screen bg-background" style={{marginTop: '4%'}}>
    {/* Header */}  
    <div
  className="py-12"
  style={{
    background: "linear-gradient(rgb(177 213 232) 0%, rgb(255, 255, 255) 100%)",
    color: "rgb(14, 48, 92)",
  }}
>
  <div className="container mx-auto px-4">
    {/* Flex container: left = centered title/subtitle, right = search */}
    <div className="flex flex-col md:flex-row items-center md:justify-between">
      
      {/* Title + Subtitle (center aligned) */}
      <div className="flex flex-col items-center text-center md:items-center md:text-center w-full">
        <h1 className="text-3xl font-bold" style={{ color: "rgb(14, 48, 92)" }}>
          My Bookings
        </h1>
        <p className="mt-2 opacity-90" style={{ color: "rgb(14, 48, 92)" }}>
          Manage your househelp service appointments
        </p>
      </div>

      {/* Search Bar (keeps its right-side position) */}
      <div className="relative w-full md:w-64 mt-4 md:mt-0">
        <input
          type="text"
          placeholder="Search bookings..."
          className="w-full px-4 py-2 rounded-lg bg-white shadow-md text-[14px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  </div>
</div>



    <div className="container mx-auto px-4 py-8">
      {/* Loading Overlay */}
      {isLoading && (
        <div 
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center bg-white/90 backdrop-blur-sm" 
          style={{ top: '75px' }}
        >
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <ClipLoader color="#3b82f6" size={50} />
            <p className="mt-4 text-lg font-medium text-gray-700">Loading your bookings...</p>
          </div>
        </div>
      )}

      {/* Upcoming Bookings Section */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-l-4 border-primary">
          <AlertCircle className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-card-foreground">Upcoming Bookings</h2>
            <p className="text-sm text-muted-foreground">
              {filteredUpcomingBookings.length} {filteredUpcomingBookings.length === 1 ? 'booking' : 'bookings'} scheduled
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {upcomingBookings.length}
          </Badge>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="grid gap-4">
            {filteredUpcomingBookings.map((booking) => (
              <Card key={booking.id} className="shadow-card hover:shadow-hover transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(booking.serviceType)}
                      <div>
                        <CardTitle className="text-lg">{getServiceTitle(booking.serviceType)}</CardTitle>
                        <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-2">
                        {getBookingTypeBadge(booking.bookingType)}
                        {getStatusBadge(booking.taskStatus)}
                      </div>
                      <p className="text-xs text-muted-foreground pt-2">
                        Booking Date:{" "}
                        {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                        {new Date(booking.modifiedDate).getTime() !==
                          new Date(booking.bookingDate).getTime() && (
                          <>
                            <br />
                            Modified Date:{" "}
                            {new Date(booking.modifiedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.timeSlot}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.address}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">{booking.serviceProviderName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">{booking['providerRating'] || 4.5}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{booking.monthlyAmount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
 <div className="flex flex-wrap gap-2">
  {/* ACTIVE Status */}
  {booking.taskStatus === "ACTIVE" && (
    <>
      {/* Call Provider Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        <Phone className="h-4 w-4 mr-1 sm:mr-2" />
        Call Provider
      </Button>

      {/* Message Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
        Message
      </Button>

      {/* Cancel Booking Button - Show for all booking types */}
      <Button
        variant="destructive"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
        onClick={() => handleCancelClick(booking)}
      >
        <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
        Cancel Booking
      </Button>

      {/* Modify Booking Button - Show only for MONTHLY bookings */}
      {booking.bookingType === "MONTHLY" && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-0 justify-center 
                     text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                     w-1/3 sm:w-auto"
          onClick={() => handleModifyClick(booking)}
        >
          <Edit className="h-4 w-4 mr-1 sm:mr-2" />
          Modify Booking
        </Button>
      )}

      {/* Add Vacation Button - Show only for MONTHLY bookings */}
      {booking.bookingType === "MONTHLY" && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-0 justify-center 
                     text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                     w-1/3 sm:w-auto"
          onClick={() => handleVacationClick(booking)}
          disabled={hasMatchingHolidayIds(booking) || isRefreshing}
        >
          {hasMatchingHolidayIds(booking)
            ? "Vacation Added"
            : "Add Vacation"}
        </Button>
      )}
    </>
  )}

  {/* IN_PROGRESS Status */}
  {booking.taskStatus === "IN_PROGRESS" && (
    <>
      {/* Call Provider Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        <Phone className="h-4 w-4 mr-1 sm:mr-2" />
        Call Provider
      </Button>

      {/* Message Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
        Message
      </Button>

      {/* Cancel Booking Button - Show for all booking types (optional) */}
      <Button
        variant="destructive"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
        onClick={() => handleCancelClick(booking)}
      >
        <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
        Cancel Booking
      </Button>

      {/* Add Vacation Button - Show only for MONTHLY bookings */}
      {booking.bookingType === "MONTHLY" && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-0 justify-center 
                     text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                     w-1/3 sm:w-auto"
          onClick={() => handleVacationClick(booking)}
          disabled={hasMatchingHolidayIds(booking) || isRefreshing}
        >
          {hasMatchingHolidayIds(booking)
            ? "Vacation Added"
            : "Add Vacation"}
        </Button>
      )}
    </>
  )}

  {/* NOT_STARTED Status */}
  {booking.taskStatus === "NOT_STARTED" && (
    <>
      {/* Call Provider Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        <Phone className="h-4 w-4 mr-1 sm:mr-2" />
        Call Provider
      </Button>

      {/* Message Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
        Message
      </Button>

      {/* Cancel Booking Button - Show for all booking types */}
      <Button
        variant="destructive"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
        onClick={() => handleCancelClick(booking)}
      >
        <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
        Cancel Booking
      </Button>

      {/* Modify Booking Button - Show only for MONTHLY bookings */}
      {booking.bookingType === "MONTHLY" && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-0 justify-center 
                     text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                     w-1/3 sm:w-auto"
          onClick={() => handleModifyClick(booking)}
        >
          <Edit className="h-4 w-4 mr-1 sm:mr-2" />
          Modify Booking
        </Button>
      )}

      {/* Add Vacation Button - Show only for MONTHLY bookings */}
      {booking.bookingType === "MONTHLY" && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-0 justify-center 
                     text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                     w-1/3 sm:w-auto"
          onClick={() => handleVacationClick(booking)}
          disabled={hasMatchingHolidayIds(booking) || isRefreshing}
        >
          {hasMatchingHolidayIds(booking)
            ? "Vacation Added"
            : "Add Vacation"}
        </Button>
      )}
    </>
  )}

  {/* COMPLETED Status */}
  {booking.taskStatus === "COMPLETED" && (
    <>
      {/* Rate Service Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        <Star className="h-4 w-4 mr-1 sm:mr-2" />
        Rate Service
      </Button>

      {/* Leave Review Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
        Leave Review
      </Button>

      {/* Book Again Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        Book Again
      </Button>
    </>
  )}

  {/* CANCELLED Status */}
  {booking.taskStatus === "CANCELLED" && (
    <>
      {/* Book Again Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2
                   w-1/3 sm:w-auto"
      >
        Book Again
      </Button>
    </>
  )}
</div>

                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No Upcoming Bookings</h3>
              <p className="text-muted-foreground mb-4">Ready to book your next service?</p>
              <Button>Book a Service</Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Past Bookings Section */}
      <section>
        <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-muted/30 to-transparent rounded-lg border-l-4 border-muted-foreground/30">
          <History className="h-6 w-6 text-muted-foreground" />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-card-foreground">Past Bookings</h2>
            <p className="text-sm text-muted-foreground">
              {filteredPastBookings.length} {filteredPastBookings.length === 1 ? 'booking' : 'bookings'} in history
            </p>
          </div>
          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
            {pastBookings.length}
          </Badge>
        </div>

        {pastBookings.length > 0 ? (
          <div className="grid gap-4">
            {filteredPastBookings.map((booking) => (
              <Card key={booking.id} className="shadow-card">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(booking.serviceType)}
                      <div>
                        <CardTitle className="text-lg">{getServiceTitle(booking.serviceType)}</CardTitle>
                        <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getBookingTypeBadge(booking.bookingType)}
                      {getStatusBadge(booking.taskStatus)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.startDate} ({booking.endDate})</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.address}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">{booking.serviceProviderName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">{booking['providerRating'] || 4.5}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{booking.monthlyAmount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
<div className="flex flex-wrap gap-2">
  {/* NOT_STARTED Status - Show only Book Again for all booking types */}
  {booking.taskStatus === "NOT_STARTED" && (
    <>
      {/* Book Again Button - Show for all booking types */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2 
                   w-1/3 sm:w-auto"
      >
        Book Again
      </Button>
    </>
  )}

  {/* COMPLETED Status - Show for all booking types */}
  {booking.taskStatus === "COMPLETED" && (
    <>
      {/* Rate Service Button */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2 
                   w-1/3 sm:w-auto"
      >
        <Star className="h-4 w-4 mr-1 sm:mr-2" />
        Rate Service
      </Button>

      {/* Leave Review Button */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2 
                   w-1/3 sm:w-auto"
      >
        <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
        Leave Review
      </Button>

      {/* Book Again Button */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2 
                   w-1/3 sm:w-auto"
      >
        Book Again
      </Button>
    </>
  )}

  {/* CANCELLED Status - Show for all booking types */}
  {booking.taskStatus === "CANCELLED" && (
    <>
      {/* Book Again Button */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-w-0 justify-center 
                   text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2 
                   w-1/3 sm:w-auto"
      >
        Book Again
      </Button>
    </>
  )}
</div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No Past Bookings</h3>
              <p className="text-muted-foreground">Your completed and cancelled bookings will appear here.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>

    {/* Dialogs */}
    <UserHoliday 
      open={holidayDialogOpen}
      onClose={() => setHolidayDialogOpen(false)}
      booking={selectedBookingForLeave}
      onLeaveSubmit={handleLeaveSubmit}
    />
    
    <ModifyBookingDialog
  open={modifyDialogOpen}
  onClose={() => setModifyDialogOpen(false)}
  booking={selectedBooking}
  timeSlots={timeSlots}
  onSave={handleSaveModifiedBooking}
  customerId={customerId}
/>

    <ConfirmationDialog
      open={confirmationDialog.open}
      onClose={() => setConfirmationDialog(prev => ({ ...prev, open: false }))}
      onConfirm={handleConfirmAction}
      title={confirmationDialog.title}
      message={confirmationDialog.message}
      confirmText={confirmationDialog.type === 'cancel' ? 'Yes, Cancel' : 'Confirm'}
      loading={actionLoading}
      severity={confirmationDialog.severity}
    />

    {/* Snackbar for notifications */}
    <Snackbar
      open={openSnackbar}
      autoHideDuration={3000}
      onClose={() => setOpenSnackbar(false)}
    >
      <Alert onClose={() => setOpenSnackbar(false)} severity="success">
        Operation completed successfully!
      </Alert>
    </Snackbar>
  </div>
);
};

export default Booking;