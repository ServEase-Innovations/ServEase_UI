/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, MapPin, Phone, MessageCircle, Star, CheckCircle, XCircle, History, Edit, XCircle as XCircleIcon, Menu, Search, CreditCard, FileText, ArrowLeft, Wallet } from 'lucide-react';
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
import EngagementDetailsDrawer from './EngagementDetailsDrawer';
import ChatInterface from './ChatInterface';

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
  leave_days?: number;
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
  payment?: Payment;
}

// Skeleton Loader Component
interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  variant?: "rectangular" | "circular" | "text";
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = "1rem",
  className = "",
  style = {},
  variant = "rectangular"
}) => {
  const baseStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: "#e5e7eb",
    borderRadius: variant === "circular" ? "50%" : variant === "text" ? "4px" : "8px",
    animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    display: "inline-block",
    ...style
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
      <div 
        className={`skeleton-loader ${className}`} 
        style={baseStyle}
      />
    </>
  );
};

// Booking Card Skeleton
const BookingCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/40 p-4 sm:py-4">
        <div className="flex gap-3 sm:gap-4">
          <SkeletonLoader width="2.75rem" height="2.75rem" className="!rounded-xl shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <SkeletonLoader width="160px" height="1.25rem" />
              <SkeletonLoader width="64px" height="1.25rem" className="shrink-0" />
            </div>
            <SkeletonLoader width="220px" height="0.8rem" />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <SkeletonLoader width="72px" height="1.35rem" className="!rounded-full" />
              <SkeletonLoader width="88px" height="1.35rem" className="!rounded-full" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 sm:pt-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-slate-100 p-3">
            <SkeletonLoader width="100%" height="0.875rem" />
            <SkeletonLoader width="85%" height="0.875rem" />
            <SkeletonLoader width="95%" height="0.875rem" />
          </div>
          <div className="rounded-lg border border-slate-100 p-3">
            <SkeletonLoader width="100px" height="0.65rem" className="mb-2" />
            <div className="flex flex-wrap gap-1.5">
              <SkeletonLoader width="88px" height="1.35rem" className="!rounded-full" />
              <SkeletonLoader width="100px" height="1.35rem" className="!rounded-full" />
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          <SkeletonLoader width="96px" height="2rem" className="!rounded-md" />
          <SkeletonLoader width="96px" height="2rem" className="!rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

// Status Tabs Skeleton
const StatusTabsSkeleton: React.FC = () => {
  return (
    <div className="mb-4">
      <div className="-mx-1 flex min-w-max gap-2 px-1 pb-1 md:flex-wrap md:min-w-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonLoader key={i} width="88px" height="2.25rem" />
        ))}
      </div>
    </div>
  );
};

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
  const now = dayjs().unix();
  const cutoff = startEpoch - 30 * 60;
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
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChatBooking, setSelectedChatBooking] = useState<Booking | null>(null);

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

  // Refs for preventing multiple loads
  const initialLoadDone = useRef(false);
  const isFetchingRef = useRef(false);
  const processedDeepLink = useRef(false);

  const { user: auth0User, isAuthenticated } = useAuth0();
  const { appUser } = useAppUser();

  // ============= MODIFIED DEEP LINKING EFFECT =============
  useEffect(() => {
    const processDeepLink = async () => {
      // Check if we have deep-linked data
      const deepLinkCustomerId = sessionStorage.getItem('deepLinkCustomerId');
      const deepLinkBookingId = sessionStorage.getItem('deepLinkBookingId');
      const deepLinkTimestamp = sessionStorage.getItem('deepLinkTimestamp');
      const deepLinkAction = sessionStorage.getItem('deepLinkAction');
      
      // If no deep link data or already processed, return
      if ((!deepLinkCustomerId && !deepLinkBookingId) || !deepLinkTimestamp || processedDeepLink.current) {
        return;
      }

      // Check if the deep link is recent (within last 10 minutes)
      const now = Date.now();
      const linkTime = parseInt(deepLinkTimestamp);
      const tenMinutes = 10 * 60 * 1000;
      
      if (now - linkTime > tenMinutes) {
        console.log('⚠️ Deep link expired');
        setSnackbarMessage('This link has expired');
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
        sessionStorage.removeItem('deepLinkCustomerId');
        sessionStorage.removeItem('deepLinkBookingId');
        sessionStorage.removeItem('deepLinkTimestamp');
        sessionStorage.removeItem('deepLinkAction');
        return;
      }

      console.log('🎯 Deep link data:', {
        customerId: deepLinkCustomerId,
        bookingId: deepLinkBookingId,
        action: deepLinkAction
      });

      // Mark as processed immediately to prevent multiple executions
      processedDeepLink.current = true;

      // CASE 1: View ALL bookings for a specific customer
      if (deepLinkCustomerId && !deepLinkBookingId) {
        console.log(`📋 VIEWING ALL BOOKINGS FOR CUSTOMER #${deepLinkCustomerId}`);
        
        const loggedInCustomerId = appUser?.customerid?.toString();
        
        if (loggedInCustomerId !== deepLinkCustomerId) {
          console.log('👑 Admin view - fetching customer bookings');
          await refreshBookings(deepLinkCustomerId);
        }
        
      // CASE 2: View specific booking
      } else if (deepLinkBookingId) {
        console.log(`🎯 OPENING SPECIFIC BOOKING #${deepLinkBookingId}`);
        
        // Helper function to find and highlight booking
        const findAndHighlightBooking = (bookingId: string) => {
          const allBookings = [...currentBookings, ...futureBookings, ...pastBookings];
          const targetBooking = allBookings.find(b => b.id.toString() === bookingId);
          
          if (targetBooking) {
            console.log('✅ Found booking:', targetBooking.id);
            setSelectedBooking(targetBooking);
            
            // Scroll and highlight
            setTimeout(() => {
              const element = document.getElementById(`booking-${bookingId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('highlight-booking');
                
                // MODIFIED: Always open drawer by default, regardless of action parameter
                const shouldOpenDrawer = deepLinkAction === 'drawer' || !deepLinkAction || deepLinkAction === 'open';
                
                if (shouldOpenDrawer) {
                  console.log('📂 Opening details drawer automatically (default behavior)');
                  setTimeout(() => {
                    setDetailsDrawerOpen(true);
                    console.log('✅ Drawer opened');
                  }, 500);
                }
                
                setTimeout(() => {
                  element.classList.remove('highlight-booking');
                }, 3000);
              }
            }, 500);
            
            return true;
          }
          return false;
        };
        
        // Try to find booking immediately
        const found = findAndHighlightBooking(deepLinkBookingId);
        
        // If not found, try a few more times as bookings load
        if (!found) {
          console.log('⏳ Booking not found yet, waiting for data to load...');
          let attempts = 0;
          const maxAttempts = 20; // Try for 20 seconds
          
          const checkInterval = setInterval(() => {
            attempts++;
            const allBookings = [...currentBookings, ...futureBookings, ...pastBookings];
            const found = allBookings.find(b => b.id.toString() === deepLinkBookingId);
            
            if (found) {
              console.log(`✅ Found booking after ${attempts} attempts`);
              clearInterval(checkInterval);
              
              setSelectedBooking(found);
              
              setTimeout(() => {
                const element = document.getElementById(`booking-${deepLinkBookingId}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  element.classList.add('highlight-booking');
                  
                  // MODIFIED: Always open drawer by default, regardless of action parameter
                  const shouldOpenDrawer = deepLinkAction === 'drawer' || !deepLinkAction || deepLinkAction === 'open';
                  
                  if (shouldOpenDrawer) {
                    console.log('📂 Opening details drawer automatically (delayed)');
                    setTimeout(() => {
                      setDetailsDrawerOpen(true);
                      console.log('✅ Drawer opened');
                    }, 500);
                  }
                  
                  setTimeout(() => {
                    element.classList.remove('highlight-booking');
                  }, 3000);
                }
              }, 500);
              
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              console.log('❌ Could not find booking after multiple attempts');
              setSnackbarMessage(`Booking #${deepLinkBookingId} not found`);
              setSnackbarSeverity('error');
              setOpenSnackbar(true);
            }
          }, 1000);
        }
      }

      // Clean up session storage after processing
      setTimeout(() => {
        sessionStorage.removeItem('deepLinkCustomerId');
        sessionStorage.removeItem('deepLinkBookingId');
        sessionStorage.removeItem('deepLinkTimestamp');
        sessionStorage.removeItem('deepLinkAction');
        console.log('🧹 Cleaned up session storage');
      }, 5000);
    };

    // Only run if bookings are loaded and we're not already loading
    if (!isLoading && (currentBookings.length > 0 || futureBookings.length > 0 || pastBookings.length > 0)) {
      processDeepLink();
    }
    
  }, [currentBookings, futureBookings, pastBookings, isLoading, appUser?.customerid]);

  const handleGenerateOTP = async (booking: Booking) => {
    if (!booking.today_service?.service_day_id) {
      console.error('Service day ID not found for OTP generation');
      setSnackbarMessage('Service day ID not found for OTP generation');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      setOtpLoading(booking.id);
      
      const response = await PaymentInstance.post(
        `/api/engagement-service/service-days/${booking.today_service.service_day_id}/otp`
      );

      if (response.status === 200 || response.status === 201) {
        const otp = response.data.otp || response.data.data?.otp || '123456';
        
        setGeneratedOTPs(prev => ({
          ...prev,
          [booking.id]: otp
        }));

        setCurrentBookings(prev => prev.map(b => 
          b.id === booking.id ? {
            ...b,
            today_service: b.today_service ? {
              ...b.today_service,
              otp_active: true,
              can_generate_otp: false
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

        setSnackbarMessage('OTP generated successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      console.error('Error generating OTP:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to generate OTP. Please try again.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setOtpLoading(null);
    }
  };

  const handleCompletePayment = async (booking: Booking) => {
   try {
    // Use POST with request body
    const resumeRes = await PaymentInstance.post(
      '/api/v2/createEngagements/resume-payment',
      { engagementId: booking.payment?.engagement_id }
    );

      const {
        razorpay_order_id,
        amount,
        currency,
        engagementId: engagement_id,
        customer
      } = resumeRes.data;

      const options = {
        key: "rzp_test_SHU1MPGbiCzst9",
       amount: amount,
        currency,
        order_id: razorpay_order_id,
        name: "Serveaso",
        description: "Complete your payment",
        prefill: {
          name: customer?.firstname || booking.customerName,
          contact:  customer?.contact || '9999999999',
        },
        handler: async function (response: any) {
          await PaymentInstance.post("/api/v2/createEngagements/verify", {
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
     console.log("FINAL ORDER ID USED:", options.order_id);
console.log("FULL OPTIONS:", options);
console.log("RAZORPAY OBJECT:", (window as any).Razorpay);

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

  // Fixed fetch bookings effect with prevention of multiple calls
  useEffect(() => {
    const loadBookings = async () => {
      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current) return;
      
      if (isAuthenticated && appUser?.customerid) {
        // Only show loading on first load
        if (!initialLoadDone.current) {
          setIsLoading(true);
        }
        
        isFetchingRef.current = true;
        setCustomerId(appUser.customerid);
        
        try {
          await refreshBookings(appUser.customerid);
          initialLoadDone.current = true;
        } catch (error) {
          console.error("Error fetching booking details:", error);
        } finally {
          setIsLoading(false);
          isFetchingRef.current = false;
        }
      } else {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [appUser?.customerid, isAuthenticated]);

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
          const hasVacation = item?.vacations?.length > 0;
          const modifications = item.modifications || [];
          const hasModifications = modifications.length > 0;

          let serviceProviderName = "Not Assigned";
          let providerRating = 0;
          if (item?.provider?.firstName && item?.provider?.lastName) {
            serviceProviderName = `${item.provider.firstName} ${item.provider.lastName}`;

            providerRating = item.provider.rating || 0;
          } else if (item.assignment_status === "UNASSIGNED") {
            serviceProviderName = "Awaiting Assignment";
          } else if (item.serviceProviderName && item.serviceProviderName !== "undefined undefined") {
            serviceProviderName = item.serviceProviderName;
          }

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
           customerName: item.customerName || (appUser?.firstname && appUser?.lastname 
  ? `${appUser.firstname} ${appUser.lastname}` 
  : appUser?.email?.split('@')[0] || 'Customer'),
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
            leave_days: item.leave_days || 0,
            vacationDetails: hasVacation && item.vacation?.leave_days > 0 
              ? item.vacation 
              : null,
            modifications: modifications,
            today_service: item.today_service,
            payment: item.payment
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

    await PaymentInstance.post(
      `api/v2/createEngagements/${selectedBookingForLeave.id}/vacation`,   
      {
       customerid: customerId,                                           
        vacation_start_date: startDate,
        vacation_end_date: endDate,
        leave_type: "VACATION",
        modified_by_id: customerId,                                        
        modified_by_role: "CUSTOMER"
      }
    );

    setBookingsWithVacation(prev => [...prev, selectedBookingForLeave.id]);
    await refreshBookings();
    setSnackbarMessage('Leave applied successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    setHolidayDialogOpen(false);
  } catch (error: any) {
    console.error("Error applying leave:", error);
    const errorMsg = error.response?.data?.message || 'Failed to apply leave. Please try again.';
    setSnackbarMessage(errorMsg);
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
    throw error;
  } finally {
    setIsRefreshing(false);
  }
};

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDrawerOpen(true);
  };

  // Handle opening chat
  const handleOpenChat = (booking: Booking) => {
    setSelectedChatBooking(booking);
    setChatOpen(true);
  };

  const renderActionButtons = (booking: Booking) => {
    const modificationDisabled = isModificationDisabled(booking);
    const modificationTooltip = getModificationTooltip(booking);
    const hasExistingVacation = hasVacation(booking);

    // View Details button to be included in all cases
    const viewDetailsButton = (
      <Button
        key="view-details"
        variant="outline"
        size="sm"
        className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
        onClick={() => handleViewDetails(booking)}
      >
        <FileText className="h-4 w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">View Details</span>
        <span className="sm:hidden">Details</span>
      </Button>
    );

    switch (booking.taskStatus) {
      case 'NOT_STARTED':
        return (
          <>
            {viewDetailsButton}
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
              onClick={() => handleOpenChat(booking)}
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
            {viewDetailsButton}
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
              onClick={() => handleOpenChat(booking)}
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
            {viewDetailsButton}
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
          <>
            {viewDetailsButton}
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

      default:
        return viewDetailsButton;
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/95 to-slate-100/80">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="container mx-auto max-w-6xl px-4 pb-4 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5rem+env(safe-area-inset-top,0px))] md:pt-[calc(6rem+env(safe-area-inset-top,0px))] lg:pt-[calc(6.5rem+env(safe-area-inset-top,0px))] xl:pt-[calc(7rem+env(safe-area-inset-top,0px))] md:pb-5">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:h-10 md:w-10"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <div className="min-w-0 flex-1 pr-1">
                  <h1 className="text-lg font-semibold leading-tight tracking-tight text-slate-900 sm:text-xl md:text-2xl">
                    My bookings
                  </h1>
                  <p className="mt-1 text-xs leading-snug text-slate-500 sm:text-sm">
                    Search below, or open your wallet from the icon on the right.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setWalletDialogOpen(true)}
                aria-label="Open wallet"
              >
                <Wallet className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search by provider, service, address, or booking #"
                className="w-full rounded-lg border-0 bg-slate-100 py-2.5 pl-10 pr-10 text-sm text-slate-900 ring-1 ring-slate-200/80 transition placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-5 md:py-7">
        <section className="mb-8 md:mb-10">
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200/90 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-stretch gap-3">
              <div
                className="w-1 shrink-0 rounded-full bg-gradient-to-b from-sky-500 to-sky-600"
                aria-hidden
              />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  Upcoming
                </h2>
                <p className="mt-1 text-sm leading-snug text-slate-500">
                  {isLoading ? (
                    <SkeletonLoader width="180px" height="0.875rem" />
                  ) : (
                    <>
                      <span className="font-medium text-slate-700">{filteredUpcomingBookings.length}</span>
                      {filteredUpcomingBookings.length === 1 ? " booking" : " bookings"}
                      {searchTerm.trim()
                        ? " match your search"
                        : statusFilter !== "ALL"
                          ? " with this status"
                          : " on your calendar"}
                      <span className="text-slate-400"> · </span>
                      <span className="tabular-nums text-slate-600">{upcomingBookings.length} total</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <StatusTabsSkeleton />
          ) : (
            <div className="mb-4">
              <div className="-mx-1 overflow-x-auto pb-0.5 scrollbar-thin">
                <div className="flex min-w-max gap-1.5 px-1 md:flex-wrap md:min-w-0 md:gap-2">
                  {statusTabs.map((tab) => {
                    const active = statusFilter === tab.value;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setStatusFilter(tab.value)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all md:px-3.5 md:text-sm ${
                          active
                            ? "border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-600/25"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums md:text-xs ${
                            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          ) : upcomingBookings.length > 0 ? (
            <div className="grid gap-3">
              {filteredUpcomingBookings.map((booking) => (
                <Card
                  key={booking.id}
                  id={`booking-${booking.id}`}
                  className="overflow-hidden rounded-2xl border border-slate-200/90 bg-card shadow-sm transition-all duration-200 hover:border-sky-200/70 hover:shadow-md"
                >
                  <CardHeader className="border-b border-slate-100 bg-slate-50/40 p-4 sm:px-5 sm:py-4">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-slate-200/70 sm:h-12 sm:w-12 sm:text-2xl">
                        {getServiceIcon(booking.service_type)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <CardTitle className="mb-0 min-w-0 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                            {getServiceTitle(booking.service_type)}
                          </CardTitle>
                          {!(booking.payment && booking.payment.status === "PENDING") && (
                            <span className="shrink-0 text-lg font-bold tabular-nums tracking-tight text-slate-900 sm:text-xl">
                              ₹{booking.monthlyAmount}
                            </span>
                          )}
                        </div>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 sm:text-[13px]">
                          <span className="text-slate-500">Booking #{booking.id}</span>
                          <span className="text-slate-300" aria-hidden>
                            ·
                          </span>
                          <span className="font-medium text-slate-700">
                            {booking.assignmentStatus === "UNASSIGNED" ? (
                              <span className="text-amber-700">Awaiting assignment</span>
                            ) : (
                              <>Provider: {booking.serviceProviderName}</>
                            )}
                          </span>
                          {booking.providerRating > 0 && (
                            <>
                              <span className="text-slate-300" aria-hidden>
                                ·
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-slate-600">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {booking.providerRating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {getBookingTypeBadge(booking.bookingType)}
                          {getStatusBadge(booking.taskStatus)}
                          {booking.taskStatus !== "CANCELLED" && (
                            <>
                              {booking.modifications && booking.modifications.length > 0 && (
                                <Badge variant="outline" className="border-amber-200/80 bg-amber-50 text-xs text-amber-900">
                                  Modified
                                </Badge>
                              )}
                              {booking.assignmentStatus === "UNASSIGNED" && (
                                <Badge variant="outline" className="border-amber-200/80 bg-amber-50 text-xs text-amber-900">
                                  Awaiting
                                </Badge>
                              )}
                              {booking.payment && booking.payment.status === "PENDING" && (
                                <Badge variant="outline" className="border-red-200 bg-red-50 text-xs font-medium text-red-800">
                                  Payment pending
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 p-4 sm:p-4 sm:pt-3">
                    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                      <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 sm:p-3">
                        <div className="flex items-start gap-2.5 text-sm">
                          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                          <span className="text-xs leading-relaxed text-slate-700 sm:text-sm">
                            {new Date(booking.startDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                            {booking.taskStatus !== "CANCELLED" &&
                              booking.modifications &&
                              booking.modifications.length > 0 && (
                                <span className="ml-1 text-xs font-medium text-emerald-600">(Rescheduled)</span>
                              )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                          <Clock className="h-4 w-4 shrink-0 text-sky-600" />
                          <span className="text-xs text-slate-700 sm:text-sm">
                            {formatTimeRange(booking.start_time, booking.end_time)}
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                          <span className="text-xs leading-relaxed text-slate-700 sm:text-sm break-words">
                            {booking.address}
                          </span>
                        </div>
                        {booking.modifications && booking.modifications.length > 0 && (
                          <div className="mt-1 rounded-lg border border-slate-100 bg-white/90 p-2.5 text-xs text-slate-600">
                            {getModificationDetails(booking)}
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-slate-100 bg-white p-2.5 sm:p-3">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Responsibilities
                        </p>
                        <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin md:flex-wrap md:overflow-visible md:pb-0">
                          {[
                            ...(booking.responsibilities?.tasks || []).map((task) => ({ task, isAddon: false })),
                            ...(booking.responsibilities?.add_ons || []).map((task) => ({ task, isAddon: true })),
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
                              <Badge
                                key={index}
                                variant="outline"
                                className="whitespace-nowrap border-slate-200 bg-slate-50/80 text-xs text-slate-700 md:whitespace-normal"
                              >
                                {isAddon ? "Add-ons - " : ""}
                                {taskName} {taskLabel && `- ${taskLabel}`}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {booking.payment && booking.payment.status === "PENDING" && (
                      <div className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-red-800">Payment required</p>
                          <p className="text-xs text-slate-600">
                            ₹{booking.monthlyAmount} · complete to confirm this booking
                          </p>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePaymentClick(booking)}
                          className="w-full shrink-0 bg-red-600 text-white hover:bg-red-700 sm:w-auto"
                          disabled={booking.taskStatus === "CANCELLED"}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay now
                        </Button>
                      </div>
                    )}

                    <div className="flex w-full justify-center">{renderScheduledMessage(booking)}</div>

                    <Separator className="bg-slate-200/80" />

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                      {renderActionButtons(booking)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/90 py-12 text-center shadow-none">
              <CardContent className="px-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
                  <Calendar className="h-7 w-7 text-sky-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No upcoming bookings</h3>
                <p className="mx-auto mb-6 max-w-sm text-sm text-slate-600">
                  When you book a service, it will show up here with status, schedule, and quick actions.
                </p>
                <Button onClick={() => setServicesDialogOpen(true)} className="w-full rounded-xl sm:w-auto">
                  Book a service
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200/90 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-stretch gap-3">
              <div
                className="w-1 shrink-0 rounded-full bg-gradient-to-b from-slate-400 to-slate-500"
                aria-hidden
              />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  History
                </h2>
                <p className="mt-1 text-sm leading-snug text-slate-500">
                  {isLoading ? (
                    <SkeletonLoader width="160px" height="0.875rem" />
                  ) : (
                    <>
                      <span className="font-medium text-slate-700">{filteredPastBookings.length}</span>
                      {filteredPastBookings.length === 1 ? " booking" : " bookings"}
                      {searchTerm.trim() ? " match your search" : " in your history"}
                      <span className="text-slate-400"> · </span>
                      <span className="tabular-nums text-slate-600">{pastBookings.length} total</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2].map((i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          ) : pastBookings.length > 0 ? (
            <div className="grid gap-3">
              {filteredPastBookings.map((booking) => (
                <Card
                  key={booking.id}
                  id={`booking-${booking.id}`}
                  className="overflow-hidden rounded-2xl border border-slate-200/90 bg-card shadow-sm transition-all duration-200 hover:border-slate-300/90 hover:shadow-md"
                >
                  <CardHeader className="border-b border-slate-100 bg-slate-50/40 p-4 sm:px-5 sm:py-4">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-slate-200/70 sm:h-12 sm:w-12 sm:text-2xl">
                        {getServiceIcon(booking.service_type)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <CardTitle className="mb-0 min-w-0 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                            {getServiceTitle(booking.service_type)}
                          </CardTitle>
                          {!(booking.payment && booking.payment.status === "PENDING") && (
                            <span className="shrink-0 text-lg font-bold tabular-nums tracking-tight text-slate-900 sm:text-xl">
                              ₹{booking.monthlyAmount}
                            </span>
                          )}
                        </div>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 sm:text-[13px]">
                          <span className="text-slate-500">Booking #{booking.id}</span>
                          <span className="text-slate-300" aria-hidden>
                            ·
                          </span>
                          <span className="font-medium text-slate-700">Provider: {booking.serviceProviderName}</span>
                          {booking.providerRating > 0 && (
                            <>
                              <span className="text-slate-300" aria-hidden>
                                ·
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-slate-600">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {booking.providerRating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {getBookingTypeBadge(booking.bookingType)}
                          {getStatusBadge(booking.taskStatus)}
                          {booking.taskStatus !== "CANCELLED" && (
                            <>
                              {booking.modifications && booking.modifications.length > 0 && (
                                <Badge variant="outline" className="border-amber-200/80 bg-amber-50 text-xs text-amber-900">
                                  Modified
                                </Badge>
                              )}
                              {booking.payment && booking.payment.status === "PENDING" && (
                                <Badge variant="outline" className="border-red-200 bg-red-50 text-xs font-medium text-red-800">
                                  Payment pending
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 p-4 sm:p-4 sm:pt-3">
                    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                      <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 sm:p-3">
                        <div className="flex items-start gap-2.5 text-sm">
                          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <span className="text-xs leading-relaxed text-slate-700 sm:text-sm">
                            {new Date(booking.startDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                            {booking.taskStatus !== "CANCELLED" &&
                              booking.modifications &&
                              booking.modifications.length > 0 && (
                                <span className="ml-1 text-xs font-medium text-emerald-600">(Rescheduled)</span>
                              )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                          <Clock className="h-4 w-4 shrink-0 text-slate-500" />
                          <span className="text-xs text-slate-700 sm:text-sm">
                            {formatTimeRange(booking.start_time, booking.end_time)}
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <span className="text-xs leading-relaxed text-slate-700 sm:text-sm break-words">
                            {booking.address}
                          </span>
                        </div>
                        {booking.modifications && booking.modifications.length > 0 && (
                          <div className="mt-1 rounded-lg border border-slate-100 bg-white/90 p-2.5 text-xs text-slate-600">
                            {getModificationDetails(booking)}
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-slate-100 bg-white p-2.5 sm:p-3">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Responsibilities
                        </p>
                        <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin md:flex-wrap md:overflow-visible md:pb-0">
                          {[
                            ...(booking.responsibilities?.tasks || []).map((task) => ({ task, isAddon: false })),
                            ...(booking.responsibilities?.add_ons || []).map((task) => ({ task, isAddon: true })),
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
                              <Badge
                                key={index}
                                variant="outline"
                                className="whitespace-nowrap border-slate-200 bg-slate-50/80 text-xs text-slate-700 md:whitespace-normal"
                              >
                                {isAddon ? "Add-ons - " : ""}
                                {taskName} {taskLabel && `- ${taskLabel}`}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {booking.payment && booking.payment.status === "PENDING" && (
                      <div className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-red-800">Payment required</p>
                          <p className="text-xs text-slate-600">
                            ₹{booking.monthlyAmount} · complete to confirm this booking
                          </p>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePaymentClick(booking)}
                          className="w-full shrink-0 bg-red-600 text-white hover:bg-red-700 sm:w-auto"
                          disabled={booking.taskStatus === "CANCELLED"}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay now
                        </Button>
                      </div>
                    )}

                    <div className="flex w-full justify-center">{renderScheduledMessage(booking)}</div>

                    <Separator className="bg-slate-200/80" />

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                      {renderActionButtons(booking)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/90 py-12 text-center shadow-none">
              <CardContent className="px-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200/80">
                  <History className="h-7 w-7 text-slate-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No past bookings yet</h3>
                <p className="mx-auto max-w-sm text-sm text-slate-600">
                  Finished and cancelled visits will appear here for your records.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* Details Drawer */}
      <EngagementDetailsDrawer
        isOpen={detailsDrawerOpen}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />

      {/* Chat Interface */}
      <ChatInterface
        open={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setSelectedChatBooking(null);
        }}
        bookingDetails={selectedChatBooking ? {
          id: selectedChatBooking.id,
          serviceType: getServiceTitle(selectedChatBooking.service_type),
          providerName: selectedChatBooking.serviceProviderName,
          bookingDate: selectedChatBooking.startDate
        } : null}
      />

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

      {/* Add CSS for highlight animation and scrollbar */}
      <style>{`
        .highlight-booking {
          animation: highlightPulse 2s ease-in-out;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        @keyframes highlightPulse {
          0%, 100% {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }
          50% {
            border-color: #60a5fa;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          }
        }

        /* Custom scrollbar for responsibilities chips on mobile */
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Booking;