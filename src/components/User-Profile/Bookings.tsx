/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Phone, MessageCircle, Star, CheckCircle, XCircle, AlertCircle, History, Edit, XCircle as XCircleIcon, Menu, Search, CreditCard } from 'lucide-react';
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
import AddReviewDialog from './AddReviewDialog';
import WalletDialog from './Wallet';
import axios from 'axios';
import PaymentInstance from 'src/services/paymentInstance';
import { useAppUser } from 'src/context/AppUserContext';
import VacationManagementDialog from './VacationManagement';
import ServicesDialog from '../ServicesDialog/ServicesDialog';

interface Task {
  taskType: string;
  [key: string]: any;
}

interface Responsibilities {
  tasks: Task[];
  add_ons?: Task[];
}

interface TodayService {
  service_day_id: string;
  status: string;
  can_start: boolean;
  can_generate_otp: boolean;
  can_complete: boolean;
  otp_active: boolean;
}

interface Payment {
  engagement_id: string;
  base_amount: string;
  platform_fee: string;
  gst: string;
  total_amount: string;
  payment_mode: string;
  status: string;
  created_at: string;
}

interface Booking {
  id: number;
  name: string;
  serviceProviderId: number;
  timeSlot: string;
  date: string;
  startDate: string;
  endDate: string;
  start_time: string;
  end_time: string;
  bookingType: string;
  monthlyAmount: number;
  paymentMode: string;
  address: string;
  customerName: string;
  serviceProviderName: string;
  providerRating: number;
  taskStatus: string;
  bookingDate: string;
  service_type: string;
  childAge: string;
  experience: string;
  noOfPersons: string;
  mealType: string;
  modifiedDate: string;
  responsibilities: Responsibilities;
  hasVacation?: boolean;
  assignmentStatus: string;
  start_epoch?: number;
  vacationDetails?: {
    leave_type?: string;
    total_days?: number;
    refund_amount?: number;
    end_date?: string;
    start_date?: string;
  };
  modifications: Array<{
    date: string;
    action: string;
    changes?: {
      new_start_date?: string;
      new_end_date?: string;
      new_start_time?: string;
      start_date?: { from: string; to: string };
      end_date?: { from: string; to: string };
      start_time?: { from: string; to: string };
    };
    refund?: number;
    penalty?: number;
  }>;
  today_service?: TodayService;
  payment?: Payment; // Added payment interface
}

const getServiceIcon = (type: string) => {
  const iconClass = "text-2xl";
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

// Modification restriction functions
const isModificationTimeAllowed = (startEpoch: any): boolean => {
  console.log("Start epoch ", startEpoch )
  const now = dayjs().unix(); // current time in seconds
  const cutoff = startEpoch - 30 * 60; // 30 minutes before booking start

  return now < cutoff;
};

const isBookingAlreadyModified = (booking: Booking | null): boolean => {
  if (!booking) return false;
  
  const hasExplicitModifications = booking.modifications && 
    booking.modifications.length > 0 && 
    booking.modifications.some(mod => 
      mod.action === "Date Rescheduled" || 
      mod.action === "Time Rescheduled" ||
      mod.action === "Modified" || 
      mod.action?.includes("Modified") ||
      mod.action?.includes("modified") ||
      mod.action === "Rescheduled" ||
      mod.action?.includes("Reschedule")
    );
  
  return !!hasExplicitModifications;
};

const isModificationDisabled = (booking: Booking | null): boolean => {
  if (!booking) return true;
  
  return !isModificationTimeAllowed(booking.start_epoch) || 
         isBookingAlreadyModified(booking);
};

const getModificationTooltip = (booking: Booking | null): string => {
  if (!booking) return "";
  
  if (isBookingAlreadyModified(booking)) {
    return "This booking has already been modified and cannot be modified again.";
  }
  if (!isModificationTimeAllowed(booking.start_epoch)) {
    return "Modification is only allowed at least 30 minutes before the scheduled time.";
  }
  return "Modify this booking";
};

// Get detailed modification information for display
const getModificationDetails = (booking: Booking): string => {
  if (!booking.modifications || booking.modifications.length === 0) return "";
  
  const lastMod = booking.modifications[booking.modifications.length - 1];
  
  if (lastMod.action === "Date Rescheduled" && lastMod.changes) {
    if (lastMod.changes.new_start_date && lastMod.changes.new_end_date) {
      return `Date rescheduled to ${lastMod.changes.new_start_date}`;
    } else if (lastMod.changes.start_date) {
      return `Date changed from ${dayjs(lastMod.changes.start_date.from).format('MMM D, YYYY')} to ${dayjs(lastMod.changes.start_date.to).format('MMM D, YYYY')}`;
    }
  } else if (lastMod.action === "Time Rescheduled" && lastMod.changes) {
    if (lastMod.changes.new_start_time) {
      return `Time rescheduled to ${lastMod.changes.new_start_time}`;
    } else if (lastMod.changes.start_time) {
      return `Time changed from ${lastMod.changes.start_time.from} to ${lastMod.changes.start_time.to}`;
    }
  }
  
  return `Last modified: ${lastMod.action}`;
};

const formatTimeToAMPM = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
    const displayMinute = minute.toString().padStart(2, '0');
    
    return `${displayHour}:${displayMinute} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return original if parsing fails
  }
};

const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTimeToAMPM(startTime)} - ${formatTimeToAMPM(endTime)}`;
};




const Booking: React.FC<any> = ({ handleDataFromChild }) => {
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
  const [generatedOTPs, setGeneratedOTPs] = useState<Record<number, string>>({});
  
  const [openDialog, setOpenDialog] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<Booking | null>(null);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState<number[]>([]);
  const [vacationManagementDialogOpen, setVacationManagementDialogOpen] = useState(false);
  const [selectedBookingForVacationManagement, setSelectedBookingForVacationManagement] = useState<Booking | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState<number | null>(null);
  
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [uniqueMissingSlots, setUniqueMissingSlots] = useState<string[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [servicesDialogOpen, setServicesDialogOpen] = useState(false);
  
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    type: 'cancel' | 'modify' | 'vacation' | 'payment' | null;
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

  const { user: auth0User, isAuthenticated } = useAuth0();
  const { appUser } = useAppUser();

  const handleGenerateOTP = async (booking: Booking) => {
    if (!booking.today_service?.service_day_id) {
      console.error('Service day ID not found for OTP generation');
      setSnackbarMessage('Service day ID not found for OTP generation');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      // Show loading state for this specific booking
      setOtpLoading(booking.id);
      
      // Call the OTP generation API
      const response = await PaymentInstance.post(
       `/api/engagement-service/service-days/${booking.today_service.service_day_id}/otp`
      );

      if (response.status === 200 || response.status === 201) {
        // Assuming the API returns the OTP in the response
        // Adjust this based on actual API response structure
        const otp = response.data.otp || response.data.data?.otp || '123456';
        
        // Store the OTP
        setGeneratedOTPs(prev => ({
          ...prev,
          [booking.id]: otp
        }));

        // Update the booking state to reflect OTP is active
        setCurrentBookings(prev => prev.map(b => 
          b.id === booking.id ? {
            ...b,
            today_service: b.today_service ? {
              ...b.today_service,
              otp_active: true,
              can_generate_otp: false // Disable generate button after OTP is generated
            } : b.today_service
          } : b
        ));

        setFutureBookings(prev => prev.map(b => 
          b.id === booking.id ? {
            ...b,
            today_service: b.today_service ? {
              ...b.today_service,
              otp_active: true,
              can_generate_otp: false
            } : b.today_service
          } : b
        ));

        // Show success message
        setSnackbarMessage('OTP generated successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      console.error('Error generating OTP:', error);
      
      // Show error message
      const errorMessage = error.response?.data?.message || 'Failed to generate OTP. Please try again.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setOtpLoading(null);
    }
  };

  // Function to handle payment completion
 const handleCompletePayment = async (booking: Booking) => {
  try {
    // 1️⃣ Call resume-payment API
    const resumeRes = await PaymentInstance.get(
      `/api/payments/${booking.payment?.engagement_id}/resume`
    );

    const {
      razorpay_order_id,
      amount,
      currency,
      engagement_id,
      customer
    } = resumeRes.data;

    // 2️⃣ Open Razorpay Checkout
    const options = {
      key: "rzp_test_lTdgjtSRlEwreA",
      amount: amount * 100, // paise
      currency,
      order_id: razorpay_order_id,
      name: "Serveaso",
      description: "Complete your payment",
      prefill: {
        name: customer?.firstname || booking.customerName,
        contact:  customer?.contact || '9999999999',
      },
      handler: async function (response: any) {
        // 3️⃣ Verify payment
        await PaymentInstance.post("/api/payments/verify", {
          engagementId: engagement_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        refreshBookings();
      },
      theme: {
        color: "#0A7CFF",
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();

  } catch (err: any) {
    console.error("Complete payment error:", err);
    alert("Unable to resume payment. Please try again.");
  }
};

const renderScheduledMessage = (booking: Booking) => {
  if (booking.today_service && booking.today_service.status === "SCHEDULED") {
    return (
      <div className="mt-4 w-full">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-md shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                  <p className="text-sm font-medium text-gray-900">
                    Confirmed: Scheduled for today.
                  </p>
                  <Badge 
                    className="bg-green-100 text-green-800 border-green-200 text-xs font-medium px-2 py-0.5 w-fit"
                  >
                    Scheduled
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  We are waiting for the provider to initiate start process at {formatTimeToAMPM(booking.start_time)}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (booking.today_service && booking.today_service.status === "IN_PROGRESS") {
    return (
      <div className="mt-4 w-full">
        <div className="p-3 bg-gradient-to-r from-green-50 to-white border border-green-100 rounded-md shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                  <p className="text-sm font-medium text-gray-900">
                    Your service is in progress!
                  </p>
                  <Badge 
                    className="bg-green-100 text-green-800 border-green-200 text-xs font-medium px-2 py-0.5 w-fit"
                  >
                    In Progress
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  The provider has started session. Please generate OTP below so they can complete task.
                </p>
                
                {/* OTP Generation Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleGenerateOTP(booking)}
                    disabled={otpLoading === booking.id || !booking.today_service?.can_generate_otp}
                    className="w-full sm:w-auto min-w-[180px]"
                  >
                    {otpLoading === booking.id ? (
                      <>
                        <ClipLoader size={14} color="#ffffff" />
                        <span className="ml-2">Generating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Generate & Share OTP
                      </>
                    )}
                  </Button>
                  
                  {booking.today_service.otp_active && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      OTP Active
                    </Badge>
                  )}
                </div>
                
                {/* OTP Display Section (if OTP is generated) */}
                {booking.today_service.otp_active && generatedOTPs[booking.id] && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs font-medium text-gray-700 mb-1">Share this OTP with your provider:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-bold tracking-wider text-gray-900">
                        {generatedOTPs[booking.id]}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedOTPs[booking.id]);
                          setSnackbarMessage('OTP copied to clipboard!');
                          setSnackbarSeverity('info');
                          setOpenSnackbar(true);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Valid for 10 minutes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (booking.today_service && booking.today_service.status === "COMPLETED") {
    return (
      <div className="mt-4 w-full">
        <div className="p-3 bg-gradient-to-r from-green-50 to-white border border-green-100 rounded-md shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                  <p className="text-sm font-medium text-gray-900">
                    Service Completed Successfully!
                  </p>
                  <Badge 
                    className="bg-green-100 text-green-800 border-green-200 text-xs font-medium px-2 py-0.5 w-fit"
                  >
                    Completed
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Your {getServiceTitle(booking.service_type)} service has been completed at {formatTimeToAMPM(booking.end_time)}. 
                  We hope you enjoyed the service!
                </p>
                
                {/* Review Prompt Section */}
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700">
                        How was your experience?
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Help us improve by leaving a review for your provider
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveReviewClick(booking)}
                      className="sm:ml-2 w-full sm:w-auto"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Leave Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

  const hasVacation = (booking: Booking): boolean => {
    return booking.hasVacation || false;
  };

  const filterBookings = (bookings: Booking[], term: string) => {
    if (!term) return bookings;
    
    return bookings.filter(booking => 
      getServiceTitle(booking?.service_type).toLowerCase().includes(term?.toLowerCase()) ||
      booking.serviceProviderName?.toLowerCase().includes(term?.toLowerCase()) ||
      booking.address?.toLowerCase().includes(term?.toLowerCase()) ||
      booking.bookingType?.toLowerCase().includes(term?.toLowerCase())
    );
  };

  const sortUpcomingBookings = (bookings: Booking[]): Booking[] => {
    const statusOrder: Record<string, number> = {
      'NOT_STARTED': 2,
      'IN_PROGRESS': 1,
      'COMPLETED': 3,
      'CANCELLED': 4
    };

    return [...bookings].sort((a, b) => {
      const statusComparison = statusOrder[a.taskStatus] - statusOrder[b.taskStatus];
      if (statusComparison !== 0) return statusComparison;
      return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
    });
  };

  // Function to refresh bookings data
  const refreshBookings = async (id?: string) => {
    const effectiveId = id || customerId;
    if (effectiveId !== null && effectiveId !== undefined) {
      console.log("Fetching bookings for customerId:", effectiveId);

      const response = await PaymentInstance.get(
        `/api/customers/${effectiveId}/engagements`
      );

      const { past = [], ongoing = [], upcoming = [], cancelled = [] } = response.data || {};

      setPastBookings(mapBookingData(past));
      setCurrentBookings(mapBookingData(ongoing));
      setFutureBookings(mapBookingData(upcoming));
    }
  };

  useEffect(() => {
    if (isAuthenticated && appUser?.customerid) {
      setIsLoading(true);
      setCustomerId(appUser.customerid);
      fetchBookings(appUser.customerid);
    } else {
      setIsLoading(false);
    }
  }, [appUser, isAuthenticated]);
  
  const fetchBookings = async (id: string) => {
    try {
      await refreshBookings(id);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapBookingData = (data: any[]) => {
    return Array.isArray(data)
      ? data.map((item) => {
          console.log("Mapping booking item:", item);
          const hasVacation = item?.vacations?.length > 0;
          const modifications = item.modifications || [];
          const hasModifications = modifications.length > 0;

          // Get provider information from the provider object
          let serviceProviderName = "Not Assigned";
          let providerRating = 0;
          
          if (item.provider && item.provider.firstname && item.provider.lastname) {
            serviceProviderName = `${item.provider.firstname} ${item.provider.lastname}`;
            providerRating = item.provider.rating || 0;
          } else if (item.assignment_status === "UNASSIGNED") {
            serviceProviderName = "Awaiting Assignment";
          } else if (item.serviceProviderName && item.serviceProviderName !== "undefined undefined") {
            serviceProviderName = item.serviceProviderName;
          }

          // Use the current dates from API (which should reflect modifications)
          const effectiveStartDate = item.start_date;
          const effectiveEndDate = item.end_date;

          return {
            start_epoch: item.start_epoch,
            id: item.engagement_id,
            customerId: item.customerId,
            serviceProviderId: item.serviceproviderid,
            name: item.customerName,
            timeSlot: item.start_time,
            date: effectiveStartDate,
            startDate: effectiveStartDate,
            endDate: effectiveEndDate,
            start_time: item.start_time, 
            end_time: item.end_time,    
            bookingType: item.booking_type,
            monthlyAmount: item.base_amount,
            paymentMode: item.payment?.payment_mode || item.paymentMode,
            address: item.address || 'No address specified',
            customerName: item.customerName,
            serviceProviderName: serviceProviderName,
            providerRating: providerRating,
            taskStatus: item.task_status,
            engagements: item.engagements,
            bookingDate: item.created_at,
            service_type: item.service_type?.toLowerCase() || 'other',
            childAge: item.childAge,
            experience: item.experience,
            noOfPersons: item.noOfPersons,
            mealType: item.mealType,
            modifiedDate: hasModifications
              ? modifications[modifications.length - 1]?.date || item.created_at
              : item.created_at,
            responsibilities: item.responsibilities,
            customerHolidays: item.customerHolidays || [],
            hasVacation: hasVacation,
            assignmentStatus: item.assignment_status || "ASSIGNED",
            vacationDetails: hasVacation && item.vacation?.leave_days > 0 
              ? item.vacation 
              : null,
            modifications: modifications,
            today_service: item.today_service,
            payment: item.payment // Added payment data
          };
        })
      : [];
  };

  const showConfirmation = (
    type: 'cancel' | 'modify' | 'vacation' | 'payment',
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
        case 'payment':
          await handleCompletePayment(booking);
          break;
      }
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      setActionLoading(false);
      setConfirmationDialog(prev => ({ ...prev, open: false }));
    }
  };

  const handleCancelClick = (booking: Booking) => {
    showConfirmation(
      'cancel',
      booking,
      'Cancel Booking',
      `Are you sure you want to cancel your ${getServiceTitle(booking.service_type)} booking? This action cannot be undone.`,
      'warning'
    );
  };

  const handlePaymentClick = (booking: Booking) => {
    showConfirmation(
      'payment',
      booking,
      'Complete Payment',
      `Complete payment of ₹${booking.monthlyAmount} for your ${getServiceTitle(booking.service_type)} booking?`,
      'info'
    );
  };

  const handleReviewSubmitted = (bookingId: number) => {
    setReviewedBookings(prev => [...prev, bookingId]);
  };

  const hasReview = (booking: Booking): boolean => {
    return reviewedBookings.includes(booking.id);
  };

  const handleLeaveReviewClick = (booking: Booking) => {
    setSelectedReviewBooking(booking);
    setReviewDialogOpen(true);
  };

  const handleModifyClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setModifyDialogOpen(true);
  };

  const handleVacationClick = (booking: Booking) => {
    setSelectedBookingForLeave(booking);
    setHolidayDialogOpen(true);
  };

  const handleModifyVacationClick = (booking: Booking) => {
    setSelectedBookingForVacationManagement(booking);
    setVacationManagementDialogOpen(true);
  };

  const handleVacationSuccess = async () => {
    setSnackbarMessage('Vacation applied successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    await refreshBookings();
  };

  const handleApplyLeaveClick = (booking: Booking) => {
    setSelectedBookingForLeave(booking);
    setHolidayDialogOpen(true);
  };

  const handleCancelBooking = async (booking: Booking) => {
    try {
      setActionLoading(true);
      
      const response = await PaymentInstance.put(
        `/api/engagements/${booking.id}`,
        {
          task_status: "CANCELLED"
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      await refreshBookings();
      setSnackbarMessage('Booking cancelled successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
    } catch (error: any) {
      console.error("Error cancelling engagement:", error);
      setCurrentBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, taskStatus: "CANCELLED" } : b
        )
      );
      setFutureBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, taskStatus: "CANCELLED" } : b
        )
      );
      setSnackbarMessage('Error cancelling booking. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveModifiedBooking = async (updatedData: {
    startDate: string;
    endDate: string;
    timeSlot: string;
  }) => {
    setModifyDialogOpen(false);
  };

  const handleLeaveSubmit = async (startDate: string, endDate: string, service_type: string): Promise<void> => {
    if (!selectedBookingForLeave || !customerId) {
      throw new Error("Missing required information for leave application");
    }

    try {
      setIsRefreshing(true);
      
      await PaymentInstance.put(
        `api/engagements/${selectedBookingForLeave.id}`,
        {
          modified_by_role: appUser.role,
          vacation_start_date: startDate,
          vacation_end_date: endDate,
          modified_by_id : customerId,
        }
      );

      setBookingsWithVacation(prev => [...prev, selectedBookingForLeave.id]);
      await refreshBookings();
      setSnackbarMessage('Leave applied successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setHolidayDialogOpen(false);
    } catch (error) {
      console.error("Error applying leave:", error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderActionButtons = (booking: Booking) => {
    const modificationDisabled = isModificationDisabled(booking);
    const modificationTooltip = getModificationTooltip(booking);
    const hasExistingVacation = hasVacation(booking);

    switch (booking.taskStatus) {
      case 'NOT_STARTED':
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Phone className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Call Provider</span>
              <span className="sm:hidden">Call</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Message</span>
              <span className="sm:hidden">Msg</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              onClick={() => handleCancelClick(booking)}
            >
              <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Cancel Booking</span>
              <span className="sm:hidden">Cancel</span>
            </Button>

            {booking.bookingType === "MONTHLY" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                onClick={() => handleModifyClick(booking)}
                disabled={modificationDisabled}
                title={modificationTooltip}
              >
                <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{modificationDisabled ? "Modify (Unavailable)" : "Modify Booking"}</span>
                <span className="sm:hidden">Modify</span>
              </Button>
            )}

            {booking.bookingType === "MONTHLY" && (
              <>
                {hasExistingVacation ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    onClick={() => handleModifyVacationClick(booking)}
                    disabled={isRefreshing}
                  >
                    <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Modify Vacation</span>
                    <span className="sm:hidden">Modify Vacation</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    onClick={() => handleVacationClick(booking)}
                    disabled={isRefreshing}
                  >
                    <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Vacation</span>
                    <span className="sm:hidden">Add Vacation</span>
                  </Button>
                )}
              </>
            )}
          </>
        );

      case 'IN_PROGRESS':
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Phone className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Call Provider</span>
              <span className="sm:hidden">Call</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Message</span>
              <span className="sm:hidden">Msg</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              onClick={() => handleCancelClick(booking)}
            >
              <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Cancel Booking</span>
              <span className="sm:hidden">Cancel</span>
            </Button>

            {booking.bookingType === "MONTHLY" && (
              <>
                {hasExistingVacation ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    onClick={() => handleModifyVacationClick(booking)}
                    disabled={isRefreshing}
                  >
                    <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Modify Vacation</span>
                    <span className="sm:hidden">Modify</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    onClick={() => handleVacationClick(booking)}
                    disabled={isRefreshing}
                  >
                    <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Vacation</span>
                    <span className="sm:hidden">Add Vacation</span>
                  </Button>
                )}
              </>
            )}
          </>
        );

      case 'COMPLETED':
        return (
          <>
            {hasReview(booking) ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                disabled={true}
              >
                <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Review Submitted</span>
                <span className="sm:hidden">Reviewed</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                onClick={() => handleLeaveReviewClick(booking)}
              >
                <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Leave Review</span>
                <span className="sm:hidden">Review</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <span className="hidden sm:inline">Book Again</span>
              <span className="sm:hidden">Book</span>
            </Button>
          </>
        );

      case 'CANCELLED':
        return (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            <span className="hidden sm:inline">Book Again</span>
            <span className="sm:hidden">Book</span>
          </Button>
        );

      default:
        return null;
    }
  };

  const upcomingBookings = sortUpcomingBookings([...currentBookings, ...futureBookings]);
  
  const filteredByStatus = statusFilter === 'ALL' 
    ? upcomingBookings 
    : upcomingBookings.filter(booking => booking.taskStatus === statusFilter);
  
  const filteredUpcomingBookings = filterBookings(filteredByStatus, searchTerm);
  const filteredPastBookings = filterBookings(pastBookings, searchTerm);

  const statusTabs = [
    { value: 'ALL', label: 'All', count: upcomingBookings.length },
    { value: 'NOT_STARTED', label: 'Not Started', count: upcomingBookings.filter(b => b.taskStatus === 'NOT_STARTED').length },
    { value: 'IN_PROGRESS', label: 'In Progress', count: upcomingBookings.filter(b => b.taskStatus === 'IN_PROGRESS').length },
    { value: 'COMPLETED', label: 'Completed', count: upcomingBookings.filter(b => b.taskStatus === 'COMPLETED').length },
    { value: 'CANCELLED', label: 'Cancelled', count: upcomingBookings.filter(b => b.taskStatus === 'CANCELLED').length },
  ];

  return (
    <div className="min-h-screen bg-background">
{/* Header */}  
<div
  className="px-4"
  style={{
    background: "linear-gradient(rgb(177 213 232) 0%, rgb(255, 255, 255) 100%)",
    color: "rgb(14, 48, 92)",
    paddingTop: '6.5rem',
    paddingBottom: '0.5rem'
  }}
>
  <div className="container mx-auto">
    {/* Back Button Row */}
    <div className="mb-4">
      <button
        onClick={() => window.history.back()}
        className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/90 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-200"
        style={{ color: "rgb(14, 48, 92)" }}
      >
        {/* Animated arrow */}
        <div className="relative h-5 w-5 overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute inset-0 transition-all duration-300 group-hover:-translate-x-full"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute inset-0 translate-x-full transition-all duration-300 group-hover:translate-x-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        <span className="font-medium transition-colors duration-200 group-hover:text-blue-700">
          Back
        </span>
        
        {/* Hover effect line */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></div>
      </button>
    </div>

    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left side - empty on mobile, logo on desktop if needed */}
      <div className="hidden md:block w-1/3"></div>

      {/* Center - Title */}
      <div className="text-center order-1 md:order-2 w-full md:w-1/3">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold" style={{ color: "rgb(14, 48, 92)" }}>
          My Bookings
        </h1>
        <p className="mt-1 text-xs md:text-sm lg:text-base opacity-90" style={{ color: "rgb(14, 48, 92)" }}>
          Manage your househelp service appointments
        </p>
      </div>

      {/* Right side - Search and Wallet */}
      <div className="flex items-center justify-end w-full md:w-1/3 order-2 md:order-3 gap-3">
        {/* Search Container */}
        <div className="relative flex-1 md:flex-none w-full md:w-64">
          {/* Desktop Search - Always visible */}
          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full px-4 py-2 rounded-lg bg-white shadow-md text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500"
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
          
          {/* Mobile Search - Icon button that toggles search input */}
          <div className="md:hidden">
            <div className="flex items-center gap-2">
              {/* Search input that appears when active */}
              {showMobileSearch ? (
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="w-full px-4 py-2.5 rounded-lg bg-white shadow-md text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowMobileSearch(false);
                      setSearchTerm("");
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Show search icon button */}
                  <button
                    onClick={() => setShowMobileSearch(true)}
                    className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Search className="h-5 w-5 text-gray-600" />
                  </button>
                  {/* Show clear search button if there's an active search term */}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="w-10 h-10 rounded-full bg-red-50 shadow-md border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors duration-200"
                      title="Clear search"
                    >
                      <XCircle className="h-5 w-5 text-red-500" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Button */}
        <div className="flex flex-col items-center">
          <button 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 hover:bg-blue-50 transition-colors duration-200"
            onClick={() => setWalletDialogOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="rgb(14, 48, 92)"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </button>
          <span className="mt-1 text-xs" style={{ color: "rgb(14, 48, 92)" }}>Wallet</span>
        </div>
      </div>
    </div>

    {/* Mobile Search Bar (when active) */}
    {searchTerm && (
      <div className="mt-4 md:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full px-4 py-3 rounded-lg bg-white shadow-md text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
    )}
  </div>
</div>

      <div className="container mx-auto px-4 py-4 md:py-8">
       {isLoading && (
  <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm" style={{ top: '64px' }}> {/* Adjust 64px to match your header height */}
    <ClipLoader color="#3b82f6" size={50} />
    <p className="mt-4 text-lg font-medium text-gray-700">Loading your bookings...</p>
  </div>
)}

        {/* Upcoming Bookings Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 p-3 md:p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-l-4 border-primary">
            <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-semibold text-card-foreground">Upcoming Bookings</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                {filteredUpcomingBookings.length} {filteredUpcomingBookings.length === 1 ? 'booking' : 'bookings'} scheduled
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mt-2 md:mt-0 w-fit">
              {upcomingBookings.length}
            </Badge>
          </div>

          {/* Status Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-1 md:gap-2">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    statusFilter === tab.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span className="ml-2 bg-gray-200 text-gray-700 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="grid gap-4">
              {filteredUpcomingBookings.map((booking) => (
                <Card key={booking.id} className="shadow-card hover:shadow-hover transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getServiceIcon(booking.service_type)}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <CardTitle className="text-base md:text-lg">{getServiceTitle(booking.service_type)}</CardTitle>
                              <p className="text-xs md:text-sm text-muted-foreground">Booking #{booking.id}</p>
                            </div>
                            
                            {/* Provider name and rating */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="text-left sm:text-right">
                                <p className="text-sm md:text-base font-medium text-gray-800">
                                  {booking.assignmentStatus === "UNASSIGNED" ? (
                                    <span className="text-yellow-600">Awaiting Assignment</span>
                                  ) : (
                                    <>ServiceProvider: {booking.serviceProviderName}</>
                                  )}
                                </p>
                                {booking.providerRating > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-gray-600">
                                      {booking.providerRating.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Booking type and status badges */}
                      <div className="flex flex-col items-start md:items-end gap-1">
                        <div className="flex flex-wrap gap-2">
                          {getBookingTypeBadge(booking.bookingType)}
                          {getStatusBadge(booking.taskStatus)}
                          {/* Hide these badges when taskStatus is CANCELLED */}
                          {booking.taskStatus !== 'CANCELLED' && (
                            <>
                              {booking.modifications && booking.modifications.length > 0 && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                  Modified
                                </Badge>
                              )}
                              {booking.assignmentStatus === "UNASSIGNED" && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                  Awaiting
                                </Badge>
                              )}
                              {/* Payment status badge - only show when not cancelled */}
                              {booking.payment && booking.payment.status === "PENDING" && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                  Payment Pending
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">
                          Booking Date:{" "}
                          {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                          {booking.modifications && booking.modifications.length > 0 && (
                            <>
                              <br />
                              Last Modified:{" "}
                              {new Date(booking.modifications[booking.modifications.length - 1].date).toLocaleDateString("en-US", {
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
                      {/* Left Column - Booking Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs md:text-sm">
                            {new Date(booking.startDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {/* Hide "Rescheduled" text when taskStatus is CANCELLED */}
                            {booking.taskStatus !== 'CANCELLED' && booking.modifications && booking.modifications.length > 0 && (
                              <span className="ml-1 text-xs text-green-600 font-medium">
                                (Rescheduled)
                              </span>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs md:text-sm">{formatTimeRange(booking.start_time, booking.end_time)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs md:text-sm">{booking.address}</span>
                        </div>

                        {/* Show modification details if available */}
                        {booking.modifications && booking.modifications.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
                            {getModificationDetails(booking)}
                          </div>
                        )}
                      </div>
                      
                      {/* Right Column - Responsibilities and Price */}
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-sm mb-1">Responsibilities:</p>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {[
                              ...(booking.responsibilities?.tasks || []).map(task => ({ task, isAddon: false })),
                              ...(booking.responsibilities?.add_ons || []).map(task => ({ task, isAddon: true })),
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
                                <Badge key={index} variant="outline" className="text-xs max-w-full truncate">
                                  {isAddon ? "Add-ons - " : ""}
                                  {taskName} {taskLabel && `- ${taskLabel}`}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {/* Check if payment status is PENDING */}
                          {booking.payment && booking.payment.status === "PENDING" ? (
                            <div className="flex flex-col items-end gap-3">
                              <p className="text-sm text-red-600 font-medium mb-1">
                                Payment Required
                              </p>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePaymentClick(booking)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={booking.taskStatus === 'CANCELLED'}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Complete Payment
                              </Button>
                              <p className="text-xs text-gray-500">
                                Complete payment to confirm your booking
                              </p>
                            </div>
                          ) : (
                            <p className="text-xl md:text-2xl font-bold text-primary">₹{booking.monthlyAmount}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Scheduled Message Section */}
                    <div className="flex justify-center">
                      {renderScheduledMessage(booking)}
                    </div>
                    
                    <Separator />
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {renderActionButtons(booking)}
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
                <Button 
                  onClick={() => setServicesDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                  Book a Service
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Past Bookings Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 p-3 md:p-4 bg-gradient-to-r from-muted/30 to-transparent rounded-lg border-l-4 border-muted-foreground/30">
            <History className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-card-foreground">Past Bookings</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                {filteredPastBookings.length} {filteredPastBookings.length === 1 ? 'booking' : 'bookings'} in history
              </p>
            </div>
            <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground mt-2 md:mt-0 w-fit">
              {pastBookings.length}
            </Badge>
          </div>

          {pastBookings.length > 0 ? (
            <div className="grid gap-4">
              {filteredPastBookings.map((booking) => (
                <Card key={booking.id} className="shadow-card">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getServiceIcon(booking.service_type)}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <CardTitle className="text-base md:text-lg">{getServiceTitle(booking.service_type)}</CardTitle>
                              <p className="text-xs md:text-sm text-muted-foreground">Booking #{booking.id}</p>
                            </div>
                            
                            {/* Provider name and rating */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="text-left sm:text-right">
                                <p className="text-sm md:text-base font-medium text-gray-800">
                                  ServiceProvider: {booking.serviceProviderName}
                                </p>
                                {booking.providerRating > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-gray-600">
                                      {booking.providerRating.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Booking type and status badges */}
                      <div className="flex flex-wrap gap-2 ml-4">
                        {getBookingTypeBadge(booking.bookingType)}
                        {getStatusBadge(booking.taskStatus)}
                        {/* Hide these badges when taskStatus is CANCELLED */}
                        {booking.taskStatus !== 'CANCELLED' && (
                          <>
                            {booking.modifications && booking.modifications.length > 0 && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                Modified
                              </Badge>
                            )}
                            {/* Payment status badge for past bookings - only show when not cancelled */}
                            {booking.payment && booking.payment.status === "PENDING" && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                Payment Pending
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Left Column - Booking Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs md:text-sm">
                            {new Date(booking.startDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {/* Hide "Rescheduled" text when taskStatus is CANCELLED */}
                            {booking.taskStatus !== 'CANCELLED' && booking.modifications && booking.modifications.length > 0 && (
                              <span className="ml-1 text-xs text-green-600 font-medium">
                                (Rescheduled)
                              </span>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs md:text-sm">{formatTimeRange(booking.start_time, booking.end_time)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs md:text-sm">{booking.address}</span>
                        </div>

                        {/* Show modification details if available */}
                        {booking.modifications && booking.modifications.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
                            {getModificationDetails(booking)}
                          </div>
                        )}
                      </div>
                      
                      {/* Right Column - Responsibilities and Price */}
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-sm mb-1">Responsibilities:</p>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {[
                              ...(booking.responsibilities?.tasks || []).map(task => ({ task, isAddon: false })),
                              ...(booking.responsibilities?.add_ons || []).map(task => ({ task, isAddon: true })),
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
                                <Badge key={index} variant="outline" className="text-xs max-w-full truncate">
                                  {isAddon ? "Add-ons - " : ""}
                                  {taskName} {taskLabel && `- ${taskLabel}`}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        <div className="text-right">
                          {/* Check if payment status is PENDING */}
                          {booking.payment && booking.payment.status === "PENDING" ? (
                            <div className="flex flex-col items-end gap-3">
                              <p className="text-sm text-red-600 font-medium mb-1">
                                Payment Required
                              </p>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePaymentClick(booking)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={booking.taskStatus === 'CANCELLED'}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Complete Payment
                              </Button>
                              <p className="text-xs text-gray-500">
                                Complete payment to confirm your booking
                              </p>
                            </div>
                          ) : (
                            <p className="text-xl md:text-2xl font-bold text-primary">₹{booking.monthlyAmount}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Message Section */}
                    <div className="mt-4">
                      {renderScheduledMessage(booking)}
                    </div>
                    
                    <Separator />
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {booking.taskStatus === "COMPLETED" && (
                        <>
                          {hasReview(booking) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                              disabled={true}
                            >
                              <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Review Submitted</span>
                              <span className="sm:hidden">Reviewed</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                              onClick={() => handleLeaveReviewClick(booking)}
                            >
                              <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Leave Review</span>
                              <span className="sm:hidden">Review</span>
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                          >
                            <span className="hidden sm:inline">Book Again</span>
                            <span className="sm:hidden">Book</span>
                          </Button>
                        </>
                      )}

                      {booking.taskStatus === "CANCELLED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          <span className="hidden sm:inline">Book Again</span>
                          <span className="sm:hidden">Book</span>
                        </Button>
                      )}

                      {booking.taskStatus === "NOT_STARTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          <span className="hidden sm:inline">Book Again</span>
                          <span className="sm:hidden">Book</span>
                        </Button>
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
      <VacationManagementDialog
        open={vacationManagementDialogOpen}
        onClose={() => {
          setVacationManagementDialogOpen(false);
          setSelectedBookingForVacationManagement(null);
        }}
        booking={selectedBookingForVacationManagement}
        customerId={customerId}
        onSuccess={handleVacationSuccess}
      />
      <ModifyBookingDialog
        open={modifyDialogOpen}
        onClose={() => {
          setModifyDialogOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        timeSlots={timeSlots}
        onSave={handleSaveModifiedBooking}
        customerId={customerId}
        refreshBookings={refreshBookings}
        setOpenSnackbar={setOpenSnackbar}
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
      
      <AddReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        booking={selectedReviewBooking}
        onReviewSubmitted={handleReviewSubmitted}
      />
      
      <WalletDialog 
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
      />
      
      <ServicesDialog
        open={servicesDialogOpen}
        onClose={() => setServicesDialogOpen(false)}
        sendDataToParent={(data) => handleDataFromChild(data)}
        onServiceSelect={(serviceType) => {
          console.log('Selected service type:', serviceType);
        }}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Booking;