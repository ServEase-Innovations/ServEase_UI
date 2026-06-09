/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import React, { useEffect, useRef, useState, useMemo } from 'react';
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
import RaiseComplaintDialog from './RaiseComplaintDialog';
import MyTicketsDialog from './MyTicketsDialog';
import WalletDialog from './Wallet';
import axios from 'axios';
import PaymentInstance from 'src/services/paymentInstance';
import { BookingService } from 'src/services/bookingService';
import { useAppUser } from 'src/context/AppUserContext';
import { resolveCustomerId } from 'src/services/couponService';
import {
  coalesceStartEpoch,
  formatBookingCreatedAt,
  formatBookingServiceDate,
  formatBookingTimeRange,
  toEpochOrNull,
} from 'src/services/bookingEpoch';
import { authApiErrorMessage, isAuthApiError } from 'src/utils/apiAuthError';
import type { EngagementEpochFields, TodayBookingEpochFields } from 'src/services/epochContract';
import VacationManagementDialog from './VacationManagement';
import ServicesDialog from '../ServicesDialog/ServicesDialog';
import EngagementDetailsDrawer from './EngagementDetailsDrawer';
import ChatInterface from './ChatInterface';
import CustomerTodayTasksCard, {
  CustomerTodayBookingSlot,
} from './CustomerTodayTasksCard';
import utilsInstance from 'src/services/utilsInstance';
import {
  DEFAULT_CANCELLATION_POLICY,
  getCancellationUnavailableMessage,
  isCancellationTimeAllowed,
  parseCancellationPolicy,
  type CancellationPolicy,
} from 'src/utils/cancellationPolicy';

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
  created_at?: string;
  placed_at_label?: string;
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
  end_epoch?: number;
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

type EngagementApiItem = Partial<EngagementEpochFields> & {
  engagement_id?: number | string;
  task_status?: string;
  task_status_stored?: string;
  engagement_status?: string;
  assignment_status?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  booking_type?: string;
  service_type?: string;
  created_at?: string;
  placed_at_label?: string;
  serviceproviderid?: number | string | null;
  provider?: { firstName?: string; lastName?: string; rating?: number | null };
  payment?: Payment;
  modifications?: any[];
  vacations?: any[];
  vacation?: { leave_days?: number };
  responsibilities?: Responsibilities;
  address?: string;
  customerName?: string;
  paymentMode?: string;
  serviceProviderName?: string;
  base_amount?: number | string;
  customerId?: number | string;
  engagements?: unknown;
  childAge?: string;
  experience?: string;
  noOfPersons?: string;
  mealType?: string;
  customerHolidays?: unknown[];
  leave_days?: number;
  today_service?: TodayService;
};

type CustomerTodaySlotApi = Partial<TodayBookingEpochFields> & {
  availability_id?: number | string;
  engagement_id?: number | string;
  start_time_ist?: string;
  end_time_ist?: string;
  provider_name?: string;
  provider_phone?: string;
  provider_firstname?: string | null;
  provider_lastname?: string | null;
  provider_mobileno?: string | null;
  serviceproviderid?: number | string | null;
  service_type?: string;
  booking_type?: string;
  task_status?: string;
  availability_status?: string | null;
  engagement_status?: string | null;
  assignment_status?: string | null;
  service_day_id?: number | string | null;
  service_day_status?: string | null;
  today_service?: TodayService | null;
  base_amount?: number | string | null;
  date_ist?: string;
  date?: string;
  address?: string;
};

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

const formatBookingDisplayDate = (booking: Booking): string =>
  formatBookingServiceDate(booking.start_epoch, booking.startDate);

const formatServiceTimeRange = (booking: Booking): string => {
  const label = formatBookingTimeRange({
    start_epoch: booking.start_epoch,
    end_epoch: booking.end_epoch,
    start_time: booking.start_time,
    end_time: booking.end_time,
  });
  return label || "";
};

const formatBookedAtLabel = (booking: Booking): string => {
  const raw = booking.created_at || booking.bookingDate;
  return formatBookingCreatedAt(raw) || booking.placed_at_label?.trim() || "";
};

type BookingsViewTab = "today" | "upcoming" | "past" | "pending";

const isPaymentPendingBooking = (booking: Booking) =>
  Boolean(
    booking.payment?.status === "PENDING" && booking.taskStatus !== "CANCELLED"
  );

/** Aligns list badges/filters with today’s visit (service_days), not only task_status. */
const effectiveTaskStatus = (booking: Booking): string => {
  if (booking.taskStatus === "CANCELLED") return "CANCELLED";
  const visit = booking.today_service?.status?.toUpperCase();
  if (visit === "IN_PROGRESS" || visit === "STARTED") return "IN_PROGRESS";
  if (visit === "COMPLETED" || visit === "DONE") return "COMPLETED";
  return booking.taskStatus;
};

const Booking: React.FC<any> = ({ handleDataFromChild }) => {
  const [viewTab, setViewTab] = useState<BookingsViewTab>("upcoming");
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [futureBookings, setFutureBookings] = useState<Booking[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<Booking[]>([]);
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
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
  const [selectedComplaintBooking, setSelectedComplaintBooking] = useState<Booking | null>(null);
  const [myTicketsOpen, setMyTicketsOpen] = useState(false);
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
  const [paymentLoading, setPaymentLoading] = useState<number | null>(null);
  const [otpLoading, setOtpLoading] = useState<number | null>(null);
  
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [uniqueMissingSlots, setUniqueMissingSlots] = useState<string[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [servicesDialogOpen, setServicesDialogOpen] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState<CustomerTodayBookingSlot[]>([]);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>(
    DEFAULT_CANCELLATION_POLICY
  );
  
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

  const { user: auth0User, isAuthenticated: auth0IsAuthenticated } = useAuth0();
  const { appUser, authSessionReady } = useAppUser();

  const isAuthenticated = useMemo(
    () => auth0IsAuthenticated || !!(appUser && localStorage.getItem("token")),
    [auth0IsAuthenticated, appUser]
  );
  const resolvedCustomerId = useMemo(() => resolveCustomerId(appUser), [appUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await utilsInstance.get<{ success?: boolean; settings?: unknown }>(
          "/api/platform-settings/public"
        );
        if (!cancelled && res.data?.settings) {
          setCancellationPolicy(parseCancellationPolicy(res.data.settings));
        }
      } catch {
        // Keep default cancellation policy when settings API is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isCancellationDisabled = (booking: Booking): boolean =>
    !isCancellationTimeAllowed(booking, cancellationPolicy);

  const getCancellationTooltip = (booking: Booking): string =>
    isCancellationDisabled(booking)
      ? getCancellationUnavailableMessage(booking, cancellationPolicy)
      : "Cancel this booking";

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

        if (deepLinkAction === "resume_payment") {
          setViewTab("pending");
        }
        
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
                
                const shouldOpenDrawer =
                  deepLinkAction === "resume_payment" ||
                  deepLinkAction === "drawer" ||
                  !deepLinkAction ||
                  deepLinkAction === "open";
                
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
                  
                  const shouldOpenDrawer =
                    deepLinkAction === "resume_payment" ||
                    deepLinkAction === "drawer" ||
                    !deepLinkAction ||
                    deepLinkAction === "open";
                  
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

  const applyOtpGenerated = (engagementId: number, otp: string) => {
    setGeneratedOTPs((prev) => ({ ...prev, [engagementId]: otp }));
    const patchTodayService = (ts: TodayService | undefined) =>
      ts
        ? { ...ts, otp_active: true, can_generate_otp: false }
        : ts;
    setCurrentBookings((prev) =>
      prev.map((b) =>
        b.id === engagementId
          ? { ...b, today_service: patchTodayService(b.today_service) }
          : b
      )
    );
    setFutureBookings((prev) =>
      prev.map((b) =>
        b.id === engagementId
          ? { ...b, today_service: patchTodayService(b.today_service) }
          : b
      )
    );
    setTodaySchedule((prev) =>
      prev.map((slot) =>
        slot.engagement_id === engagementId && slot.today_service
          ? {
              ...slot,
              today_service: {
                ...slot.today_service,
                otp_active: true,
                can_generate_otp: false,
              },
            }
          : slot
      )
    );
  };

  const handleGenerateOTP = async (booking: Booking) => {
    const serviceDayId = booking.today_service?.service_day_id;
    if (!serviceDayId) {
      setSnackbarMessage('Service day ID not found for OTP generation');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      setOtpLoading(booking.id);
      const response = await PaymentInstance.post(
        `/api/engagement-service/service-days/${serviceDayId}/otp`
      );

      if (response.status === 200 || response.status === 201) {
        const otp = response.data.otp || response.data.data?.otp || '123456';
        applyOtpGenerated(booking.id, otp);
        setSnackbarMessage('OTP generated successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      console.error('Error generating OTP:', error);
      const errData = error.response?.data;
      setSnackbarMessage(
        errData?.error ||
          errData?.message ||
          'Failed to generate OTP. Please try again.'
      );
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setOtpLoading(null);
    }
  };

  const handleGenerateOtpFromToday = async (slot: CustomerTodayBookingSlot) => {
    const serviceDayId =
      slot.today_service?.service_day_id ?? slot.service_day_id ?? null;
    if (!serviceDayId) {
      setSnackbarMessage('Service day ID not found for OTP generation');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      setOtpLoading(slot.engagement_id);
      const response = await PaymentInstance.post(
        `/api/engagement-service/service-days/${serviceDayId}/otp`
      );

      if (response.status === 200 || response.status === 201) {
        const otp = response.data.otp || response.data.data?.otp || '123456';
        applyOtpGenerated(slot.engagement_id, otp);
        setSnackbarMessage('OTP generated successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      console.error('Error generating OTP:', error);
      const errData = error.response?.data;
      setSnackbarMessage(
        errData?.error ||
          errData?.message ||
          'Failed to generate OTP. Please try again.'
      );
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setOtpLoading(null);
    }
  };

  const scrollToBooking = (engagementId: number) => {
    setViewTab('upcoming');
    requestAnimationFrame(() => {
      document
        .getElementById(`booking-${engagementId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const afterPaymentSuccess = async () => {
    const effectiveCustomerId = customerId ?? appUser?.customerid;
    if (effectiveCustomerId != null) {
      await refreshBookings(effectiveCustomerId);
    }
    setDetailsDrawerOpen(false);
    setSelectedBooking(null);
    setViewTab("upcoming");
    setSnackbarMessage("Payment completed successfully.");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  };

  const handleCompletePayment = async (booking: Booking) => {
    const engagementId =
      booking.payment?.engagement_id ?? booking.id;
    if (!engagementId) {
      setSnackbarMessage("Cannot resume payment: booking id missing.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      setPaymentLoading(booking.id);
      const customerName =
        booking.customerName ||
        (appUser?.firstname && appUser?.lastname
          ? `${appUser.firstname} ${appUser.lastname}`
          : appUser?.email?.split("@")[0] || "Customer");

      await BookingService.payPendingEngagement(engagementId, {
        name: customerName,
        email: appUser?.email || undefined,
        contact: appUser?.mobileno || undefined,
      });

      await afterPaymentSuccess();
    } catch (err: any) {
      console.error("Complete payment error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.description ||
        err?.message ||
        "Unable to resume payment. Please try again.";
      setSnackbarMessage(msg);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setPaymentLoading(null);
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

  const getAllBookings = (): Booking[] => {
    const byId = new Map<number, Booking>();
    [...futureBookings, ...currentBookings, ...pastBookings, ...cancelledBookings].forEach(
      (b) => byId.set(b.id, b)
    );
    return Array.from(byId.values());
  };

  const normalizeSearchQuery = (term: string) =>
    term.trim().toLowerCase().replace(/^#/, '');

  const bookingMatchesSearch = (booking: Booking, term: string): boolean => {
    const q = normalizeSearchQuery(term);
    if (!q) return true;

    const idStr = String(booking.id ?? '');
    if (idStr === q || idStr.includes(q)) return true;

    return (
      getServiceTitle(booking?.service_type).toLowerCase().includes(q) ||
      booking.serviceProviderName?.toLowerCase().includes(q) ||
      (booking.address?.toLowerCase().includes(q) ?? false) ||
      booking.bookingType?.toLowerCase().includes(q)
    );
  };

  const filterBookings = (bookings: Booking[], term: string) => {
    if (!term.trim()) return bookings;
    return bookings.filter((booking) => bookingMatchesSearch(booking, term));
  };

  const sortUpcomingBookings = (bookings: Booking[]): Booking[] => {
    const statusOrder: Record<string, number> = {
      'NOT_STARTED': 2,
      'IN_PROGRESS': 1,
      'COMPLETED': 3,
      'CANCELLED': 4
    };

    const toEpoch = (booking: Booking): number =>
      coalesceStartEpoch(booking.start_epoch, booking.startDate) ?? 0;

    return [...bookings].sort((a, b) => {
      const statusComparison = statusOrder[a.taskStatus] - statusOrder[b.taskStatus];
      if (statusComparison !== 0) return statusComparison;
      // Epoch-first ordering for upcoming/pending lists (earliest first).
      return toEpoch(a) - toEpoch(b);
    });
  };

  const refreshBookings = async (id?: string | number) => {
    const effectiveId = id ?? customerId;
    if (effectiveId !== null && effectiveId !== undefined) {
      console.log("Fetching bookings for customerId:", effectiveId);

      const [engagementsRes, todayRes] = await Promise.all([
        PaymentInstance.get(`/api/customers/${effectiveId}/engagements`),
        PaymentInstance.get(`/api/customers/${effectiveId}/today-bookings`).catch(
          () => ({ data: { bookings: [] } })
        ),
      ]);

      const {
        past = [],
        ongoing = [],
        upcoming = [],
        cancelled: cancelledFromApi = [],
      } = engagementsRes.data || {};

      const partitioned = partitionEngagementLists(
        upcoming,
        ongoing,
        past,
        cancelledFromApi
      );

      const normalizedTodaySchedule: CustomerTodayBookingSlot[] = (todayRes.data?.bookings ?? []).map((slot: CustomerTodaySlotApi) => ({
        ...slot,
        availability_id: Number(slot.availability_id),
        engagement_id: Number(slot.engagement_id),
        slot_start_epoch:
          slot.slot_start_epoch != null && Number.isFinite(Number(slot.slot_start_epoch))
            ? Number(slot.slot_start_epoch)
            : null,
        slot_end_epoch:
          slot.slot_end_epoch != null && Number.isFinite(Number(slot.slot_end_epoch))
            ? Number(slot.slot_end_epoch)
            : null,
        engagement_start_epoch:
          slot.engagement_start_epoch != null && Number.isFinite(Number(slot.engagement_start_epoch))
            ? Number(slot.engagement_start_epoch)
            : null,
        engagement_end_epoch:
          slot.engagement_end_epoch != null && Number.isFinite(Number(slot.engagement_end_epoch))
            ? Number(slot.engagement_end_epoch)
            : null,
        serviceproviderid:
          slot.serviceproviderid != null && Number.isFinite(Number(slot.serviceproviderid))
            ? Number(slot.serviceproviderid)
            : null,
        service_day_id:
          slot.service_day_id != null && Number.isFinite(Number(slot.service_day_id))
            ? Number(slot.service_day_id)
            : null,
        provider_firstname: slot.provider_firstname ?? null,
        provider_lastname: slot.provider_lastname ?? null,
        provider_mobileno: slot.provider_mobileno ?? null,
        availability_status: slot.availability_status ?? null,
        engagement_status: slot.engagement_status ?? null,
        assignment_status: slot.assignment_status ?? null,
        service_day_status: slot.service_day_status ?? null,
        today_service: slot.today_service ?? null,
        start_time_ist: slot.start_time_ist ?? null,
        end_time_ist: slot.end_time_ist ?? null,
        task_status: slot.task_status ?? "NOT_STARTED",
        booking_type: slot.booking_type ?? "",
        service_type: slot.service_type ?? "",
        address: slot.address ?? null,
        base_amount:
          slot.base_amount != null && Number.isFinite(Number(slot.base_amount))
            ? Number(slot.base_amount)
            : null,
      }));

      setPastBookings(mapBookingData(partitioned.past));
      setCurrentBookings(mapBookingData(partitioned.ongoing));
      setFutureBookings(mapBookingData(partitioned.upcoming));
      setCancelledBookings(mapBookingData(partitioned.cancelled));
      setTodaySchedule(normalizedTodaySchedule);
    }
  };

  // Fixed fetch bookings effect with prevention of multiple calls
  useEffect(() => {
    const loadBookings = async () => {
      if (!authSessionReady) return;

      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current) return;

      if (isAuthenticated && resolvedCustomerId) {
        // Only show loading on first load
        if (!initialLoadDone.current) {
          setIsLoading(true);
        }

        isFetchingRef.current = true;
        setCustomerId(Number(resolvedCustomerId));

        try {
          await refreshBookings(resolvedCustomerId);
          initialLoadDone.current = true;
        } catch (error) {
          console.error("Error fetching booking details:", error);
          if (isAuthApiError(error)) {
            setSnackbarMessage(authApiErrorMessage(error));
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
          }
        } finally {
          setIsLoading(false);
          isFetchingRef.current = false;
        }
      } else {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [authSessionReady, resolvedCustomerId, isAuthenticated]);

  const fetchBookings = async (id: string) => {
    try {
      await refreshBookings(id);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  
  const isCancelledEngagementItem = (item: EngagementApiItem): boolean => {
    const life = String(item?.engagement_status ?? '').toUpperCase();
    const stored = String(item?.task_status_stored ?? item?.task_status ?? '').toUpperCase();
    return life === 'CANCELLED' || stored === 'CANCELLED';
  };

  const resolveTaskStatusFromEngagement = (item: EngagementApiItem): string => {
    if (isCancelledEngagementItem(item)) return 'CANCELLED';
    return item?.task_status || '';
  };

  const partitionEngagementLists = (
    upcoming: EngagementApiItem[],
    ongoing: EngagementApiItem[],
    past: EngagementApiItem[],
    cancelledFromApi: EngagementApiItem[] = []
  ) => {
    const cancelled: EngagementApiItem[] = [...cancelledFromApi];
    const activeUpcoming: EngagementApiItem[] = [];
    const activeOngoing: EngagementApiItem[] = [];
    const activePast: EngagementApiItem[] = [];

    upcoming.forEach((item) =>
      (isCancelledEngagementItem(item) ? cancelled : activeUpcoming).push(item)
    );
    ongoing.forEach((item) =>
      (isCancelledEngagementItem(item) ? cancelled : activeOngoing).push(item)
    );
    past.forEach((item) =>
      (isCancelledEngagementItem(item) ? cancelled : activePast).push(item)
    );

    const seen = new Set<number>();
    const dedupedCancelled = cancelled.filter((item) => {
      const id = Number(item?.engagement_id);
      if (!Number.isFinite(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return {
      upcoming: activeUpcoming,
      ongoing: activeOngoing,
      past: activePast,
      cancelled: dedupedCancelled,
    };
  };

  const mapBookingData = (data: EngagementApiItem[]) => {
    return Array.isArray(data)
      ? data.map((item) => {
          const hasVacation = (item?.vacations?.length ?? 0) > 0;
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
            start_epoch: toEpochOrNull(item.start_epoch) ?? undefined,
            end_epoch: toEpochOrNull(item.end_epoch) ?? undefined,
            id: Number(item.engagement_id ?? 0),
            customerId: Number(item.customerId ?? 0),
            serviceProviderId: Number(item.serviceproviderid ?? 0),
            name: item.customerName || 'Customer',
            timeSlot: item.start_time || '',
            date: effectiveStartDate || '',
            startDate: effectiveStartDate || '',
            endDate: effectiveEndDate || '',
            start_time: item.start_time || '', 
            end_time: item.end_time || '',    
            bookingType: item.booking_type || '',
            monthlyAmount:
              item.payment?.total_amount != null
                ? Number(item.payment.total_amount)
                : Number(item.base_amount) || 0,
            paymentMode: item.payment?.payment_mode || item.paymentMode || '',
            address: item.address || 'No address specified',
           customerName: item.customerName || (appUser?.firstname && appUser?.lastname 
  ? `${appUser.firstname} ${appUser.lastname}` 
  : appUser?.email?.split('@')[0] || 'Customer'),
            serviceProviderName: serviceProviderName,
            providerRating: providerRating,
            taskStatus: resolveTaskStatusFromEngagement(item),
            engagements: item.engagements,
            placed_at_label: item.placed_at_label || '',
            bookingDate: item.created_at || item.payment?.created_at || '',
            created_at: item.created_at || item.payment?.created_at || '',
            service_type: item.service_type?.toLowerCase() || 'other',
            childAge: item.childAge || '',
            experience: item.experience || '',
            noOfPersons: item.noOfPersons || '',
            mealType: item.mealType || '',
            modifiedDate: (hasModifications
              ? modifications[modifications.length - 1]?.date || item.created_at
              : item.created_at) || '',
            responsibilities: item.responsibilities || { tasks: [] },
            customerHolidays: item.customerHolidays || [],
            hasVacation: hasVacation,
            assignmentStatus: item.assignment_status || "ASSIGNED",
            leave_days: item.leave_days || 0,
            vacationDetails: hasVacation && (item.vacation?.leave_days ?? 0) > 0
              ? {
                  total_days: item.vacation?.leave_days,
                }
              : undefined,
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
    } catch (error: any) {
      console.error("Error performing action:", error);
      if (type === 'cancel') {
        const msg =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Failed to cancel booking. Please try again.';
        setSnackbarMessage(msg);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } finally {
      setActionLoading(false);
      setConfirmationDialog(prev => ({ ...prev, open: false }));
    }
  };

  const handleCancelClick = (booking: Booking) => {
    if (isCancellationDisabled(booking)) {
      setSnackbarMessage(getCancellationUnavailableMessage(booking, cancellationPolicy));
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    showConfirmation(
      'cancel',
      booking,
      'Cancel Booking',
      `Are you sure you want to cancel your ${getServiceTitle(booking.service_type)} booking? This action cannot be undone.`,
      'warning'
    );
  };

  const handlePaymentClick = (booking: Booking) => {
    const amount =
      booking.payment?.total_amount != null
        ? Number(booking.payment.total_amount)
        : booking.monthlyAmount;
    showConfirmation(
      'payment',
      booking,
      'Complete Payment',
      `Complete payment of ₹${amount} for your ${getServiceTitle(booking.service_type)} booking?`,
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

  const handleReportIssueClick = (booking: Booking) => {
    setSelectedComplaintBooking(booking);
    setComplaintDialogOpen(true);
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
    await PaymentInstance.post(`/api/v2/engagements/${booking.id}/cancel`, {});
    await refreshBookings();
    setStatusFilter('CANCELLED');
    setSnackbarMessage('Booking cancelled successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
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
    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to apply leave. Please try again.';
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

  const reportIssueButton = (booking: Booking) => (
    <Button
      variant="outline"
      size="sm"
      className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
      onClick={() => handleReportIssueClick(booking)}
    >
      <FileText className="h-4 w-4 mr-1 sm:mr-2" />
      <span className="hidden sm:inline">Report issue</span>
      <span className="sm:hidden">Issue</span>
    </Button>
  );

  const renderActionButtons = (booking: Booking) => {
    const modificationDisabled = isModificationDisabled(booking);
    const modificationTooltip = getModificationTooltip(booking);
    const cancellationDisabled = isCancellationDisabled(booking);
    const cancellationTooltip = getCancellationTooltip(booking);
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
            {reportIssueButton(booking)}
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
              disabled={cancellationDisabled}
              title={cancellationTooltip}
            >
              <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">
                {cancellationDisabled ? "Cancel (Unavailable)" : "Cancel Booking"}
              </span>
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
            {reportIssueButton(booking)}
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
              disabled={cancellationDisabled}
              title={cancellationTooltip}
            >
              <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">
                {cancellationDisabled ? "Cancel (Unavailable)" : "Cancel Booking"}
              </span>
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
            {reportIssueButton(booking)}
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
            {reportIssueButton(booking)}
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
        return (
          <>
            {viewDetailsButton}
            {reportIssueButton(booking)}
          </>
        );
    }
  };

  const upcomingBookings = sortUpcomingBookings(
    [...currentBookings, ...futureBookings].filter((b) => b.taskStatus !== 'CANCELLED')
  );

  const pendingPaymentBookings = sortUpcomingBookings(
    [...currentBookings, ...futureBookings, ...pastBookings].filter(
      isPaymentPendingBooking
    )
  );

  const searchActive = Boolean(searchTerm.trim());

  const filteredByStatus =
    statusFilter === 'ALL'
      ? upcomingBookings
      : statusFilter === 'CANCELLED'
        ? cancelledBookings
        : upcomingBookings.filter(
            (booking) => effectiveTaskStatus(booking) === statusFilter
          );

  const filteredUpcomingBookings = searchActive
    ? filterBookings(getAllBookings(), searchTerm)
    : filterBookings(filteredByStatus, searchTerm);

  const filteredPendingPaymentBookings = searchActive
    ? filterBookings(
        getAllBookings().filter((b) => isPaymentPendingBooking(b)),
        searchTerm
      )
    : filterBookings(pendingPaymentBookings, searchTerm);

  const filteredPastBookings = searchActive
    ? filterBookings(getAllBookings(), searchTerm)
    : filterBookings(pastBookings, searchTerm);

  const filteredTodaySchedule = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return todaySchedule;
    return todaySchedule.filter((slot) => {
      const provider = [slot.provider_firstname, slot.provider_lastname]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        String(slot.engagement_id).includes(q) ||
        provider.includes(q) ||
        String(slot.service_type || "").toLowerCase().includes(q) ||
        String(slot.address || "").toLowerCase().includes(q) ||
        String(slot.booking_type || "").toLowerCase().includes(q)
      );
    });
  }, [todaySchedule, searchTerm]);

  const activeBookingsList =
    viewTab === "pending"
      ? filteredPendingPaymentBookings
      : filteredUpcomingBookings;

  const hasActiveBookings =
    viewTab === "pending"
      ? pendingPaymentBookings.length > 0
      : upcomingBookings.length > 0;

  const mainViewTabs: {
    id: BookingsViewTab;
    label: string;
    shortLabel: string;
    count?: number;
  }[] = [
    {
      id: "today",
      label: "Today",
      shortLabel: "Today",
      count: todaySchedule.length,
    },
    { id: "upcoming", label: "Upcoming", shortLabel: "Upcoming" },
    { id: "past", label: "Past", shortLabel: "Past" },
    {
      id: "pending",
      label: "Pending payment",
      shortLabel: "Pending",
      count: pendingPaymentBookings.length,
    },
  ];

  const statusTabs = [
    { value: 'ALL', label: 'All', count: upcomingBookings.length },
    { value: 'NOT_STARTED', label: 'Not Started', count: upcomingBookings.filter(b => effectiveTaskStatus(b) === 'NOT_STARTED').length },
    { value: 'IN_PROGRESS', label: 'In Progress', count: upcomingBookings.filter(b => effectiveTaskStatus(b) === 'IN_PROGRESS').length },
    { value: 'COMPLETED', label: 'Completed', count: upcomingBookings.filter(b => effectiveTaskStatus(b) === 'COMPLETED').length },
    { value: 'CANCELLED', label: 'Cancelled', count: cancelledBookings.length },
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
                  onClick={() => {
                    if (typeof handleDataFromChild === "function") {
                      handleDataFromChild("HOME", "section");
                    } else {
                      window.location.href = "/";
                    }
                  }}
                  className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:h-10 md:w-10"
                  aria-label="Back to home"
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
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  className="mt-0.5 inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:text-sm"
                  onClick={() => setMyTicketsOpen(true)}
                  aria-label="My support tickets"
                >
                  <FileText className="h-4 w-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Support</span>
                </button>
                <button
                  type="button"
                  className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setWalletDialogOpen(true)}
                  aria-label="Open wallet"
                >
                  <Wallet className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search by booking #, provider, service, or address"
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
        <div
          className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/80 scrollbar-thin"
          role="tablist"
          aria-label="Bookings views"
        >
          {mainViewTabs.map((tab) => {
            const active = viewTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setViewTab(tab.id);
                  if (tab.id !== "upcoming") {
                    setStatusFilter("ALL");
                  }
                }}
                className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                  active
                    ? tab.id === "pending"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                      : tab.id === "today"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.count != null && tab.count > 0 ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                      active
                        ? tab.id === "pending" || tab.id === "today"
                          ? "bg-white/25 text-white"
                          : "bg-sky-100 text-sky-800"
                        : tab.id === "today"
                          ? "bg-emerald-100 text-emerald-800"
                          : tab.id === "pending"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {viewTab === "today" && (
          <section className="mb-8 md:mb-10">
            <CustomerTodayTasksCard
              loading={isLoading}
              todaySchedule={filteredTodaySchedule}
              otpLoadingId={otpLoading}
              generatedOTPs={generatedOTPs}
              onGenerateOtp={handleGenerateOtpFromToday}
              onOpenBooking={scrollToBooking}
              onCallProvider={(phone) => {
                window.location.href = `tel:${phone}`;
              }}
              onOpenMap={(address) => {
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            />
            {!isLoading && searchTerm.trim() && filteredTodaySchedule.length === 0 ? (
              <p className="mt-3 text-center text-sm text-slate-600">
                No today&apos;s visits match your search.
              </p>
            ) : null}
          </section>
        )}

        {(viewTab === "upcoming" || viewTab === "pending") && (
        <section className="mb-8 md:mb-10">
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200/90 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-stretch gap-3">
              <div
                className={`w-1 shrink-0 rounded-full bg-gradient-to-b ${
                  viewTab === "pending"
                    ? "from-red-500 to-red-600"
                    : "from-sky-500 to-sky-600"
                }`}
                aria-hidden
              />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  {viewTab === "pending" ? "Pending payment" : "Upcoming"}
                </h2>
                <div className="mt-1 text-sm leading-snug text-slate-500">
                  {isLoading ? (
                    <SkeletonLoader width="180px" height="0.875rem" />
                  ) : viewTab === "pending" ? (
                    <>
                      <span className="font-medium text-slate-700">
                        {filteredPendingPaymentBookings.length}
                      </span>
                      {filteredPendingPaymentBookings.length === 1
                        ? " booking"
                        : " bookings"}
                      {searchTerm.trim()
                        ? " match your search"
                        : " awaiting payment"}
                      <span className="text-slate-400"> · </span>
                      <span className="tabular-nums text-slate-600">
                        {pendingPaymentBookings.length} total
                      </span>
                    </>
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
                </div>
              </div>
            </div>
          </div>

          {viewTab === "upcoming" && (isLoading ? (
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
          ))}

          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          ) : hasActiveBookings ? (
            <div className="grid gap-3">
              {activeBookingsList.map((booking) => {
                const bookedAtLabel = formatBookedAtLabel(booking);
                const serviceTimeLabel = formatServiceTimeRange(booking);
                return (
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
                          {bookedAtLabel ? (
                            <>
                              <span className="text-slate-300" aria-hidden>
                                ·
                              </span>
                              <span className="inline-flex items-center gap-1 font-medium tabular-nums text-slate-700">
                                <Clock className="h-3 w-3 shrink-0 text-sky-600" aria-hidden />
                                Placed {bookedAtLabel}
                              </span>
                            </>
                          ) : null}
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
                          {getStatusBadge(effectiveTaskStatus(booking))}
                          {effectiveTaskStatus(booking) !== "CANCELLED" && (
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
                    <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 sm:p-3">
                      <div className="flex items-start gap-2.5 text-sm">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                        <span className="text-xs leading-relaxed text-slate-700 sm:text-sm">
                          <span className="text-slate-500">Service: </span>
                          {formatBookingDisplayDate(booking)}
                          {serviceTimeLabel ? (
                            <>
                              <span className="text-slate-400"> · </span>
                              <span className="font-medium tabular-nums">{serviceTimeLabel}</span>
                            </>
                          ) : null}
                          {booking.taskStatus !== "CANCELLED" &&
                            booking.modifications &&
                            booking.modifications.length > 0 && (
                              <span className="ml-1 text-xs font-medium text-emerald-600">(Rescheduled)</span>
                            )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Clock className="h-4 w-4 shrink-0 text-sky-600" />
                        <span className="text-xs font-medium tabular-nums text-slate-700 sm:text-sm">
                          {bookedAtLabel ? `Placed ${bookedAtLabel}` : "Order time unavailable"}
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
                          disabled={
                            booking.taskStatus === "CANCELLED" ||
                            paymentLoading === booking.id
                          }
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {paymentLoading === booking.id ? "Processing…" : "Pay now"}
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
              );
              })}
            </div>
          ) : (
            <Card className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/90 py-12 text-center shadow-none">
              <CardContent className="px-6">
                {viewTab === "pending" ? (
                  <>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
                      <CreditCard className="h-7 w-7 text-red-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900">
                      No pending payments
                    </h3>
                    <p className="mx-auto max-w-sm text-sm text-slate-600">
                      Bookings that still need payment will appear here with a Pay now button.
                    </p>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </section>
        )}

        {viewTab === "past" && (
        <section>
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200/90 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-stretch gap-3">
              <div
                className="w-1 shrink-0 rounded-full bg-gradient-to-b from-slate-400 to-slate-500"
                aria-hidden
              />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  Past
                </h2>
                <div className="mt-1 text-sm leading-snug text-slate-500">
                  {isLoading ? (
                    <SkeletonLoader width="160px" height="0.875rem" />
                  ) : (
                    <>
                      <span className="font-medium text-slate-700">{filteredPastBookings.length}</span>
                      {filteredPastBookings.length === 1 ? " booking" : " bookings"}
                      {searchTerm.trim()
                        ? " match your search"
                        : " — completed, cancelled, or ended"}
                      <span className="text-slate-400"> · </span>
                      <span className="tabular-nums text-slate-600">{pastBookings.length} total</span>
                    </>
                  )}
                </div>
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
              {filteredPastBookings.map((booking) => {
                const bookedAtLabel = formatBookedAtLabel(booking);
                const serviceTimeLabel = formatServiceTimeRange(booking);
                return (
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
                          {bookedAtLabel ? (
                            <>
                              <span className="text-slate-300" aria-hidden>
                                ·
                              </span>
                              <span className="inline-flex items-center gap-1 font-medium tabular-nums text-slate-700">
                                <Clock className="h-3 w-3 shrink-0 text-slate-500" aria-hidden />
                                Placed {bookedAtLabel}
                              </span>
                            </>
                          ) : null}
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
                          {getStatusBadge(effectiveTaskStatus(booking))}
                          {effectiveTaskStatus(booking) !== "CANCELLED" && (
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
                    <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 sm:p-3">
                      <div className="flex items-start gap-2.5 text-sm">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        <span className="text-xs leading-relaxed text-slate-700 sm:text-sm">
                          <span className="text-slate-500">Service: </span>
                          {formatBookingDisplayDate(booking)}
                          {serviceTimeLabel ? (
                            <>
                              <span className="text-slate-400"> · </span>
                              <span className="font-medium tabular-nums">{serviceTimeLabel}</span>
                            </>
                          ) : null}
                          {booking.taskStatus !== "CANCELLED" &&
                            booking.modifications &&
                            booking.modifications.length > 0 && (
                              <span className="ml-1 text-xs font-medium text-emerald-600">(Rescheduled)</span>
                            )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Clock className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="text-xs font-medium tabular-nums text-slate-700 sm:text-sm">
                          {bookedAtLabel ? `Placed ${bookedAtLabel}` : "Order time unavailable"}
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
                          disabled={
                            booking.taskStatus === "CANCELLED" ||
                            paymentLoading === booking.id
                          }
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {paymentLoading === booking.id ? "Processing…" : "Pay now"}
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
              );
              })}
            </div>
          ) : (
            <Card className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/90 py-12 text-center shadow-none">
              <CardContent className="px-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200/80">
                  <History className="h-7 w-7 text-slate-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No past bookings yet</h3>
                <p className="mx-auto max-w-sm text-sm text-slate-600">
                  Completed, cancelled, and ended bookings will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
        )}
      </div>

      {/* Details Drawer */}
      <EngagementDetailsDrawer
        isOpen={detailsDrawerOpen}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onPaymentComplete={afterPaymentSuccess}
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
        confirmText={
          confirmationDialog.type === 'cancel'
            ? 'Yes, Cancel Booking'
            : confirmationDialog.type === 'payment'
              ? 'Pay now'
              : 'Confirm'
        }
        cancelText={
          confirmationDialog.type === 'cancel' ? 'No, Keep It' : 'Cancel'
        }
        loading={actionLoading}
        severity={confirmationDialog.severity}
      />
      
      <AddReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        booking={selectedReviewBooking}
        onReviewSubmitted={handleReviewSubmitted}
      />

      <RaiseComplaintDialog
        open={complaintDialogOpen}
        onClose={() => {
          setComplaintDialogOpen(false);
          setSelectedComplaintBooking(null);
        }}
        booking={selectedComplaintBooking}
      />

      <MyTicketsDialog
        open={myTicketsOpen}
        onClose={() => setMyTicketsOpen(false)}
        onRaiseNew={() => {
          setMyTicketsOpen(false);
          setSelectedComplaintBooking(null);
          setComplaintDialogOpen(true);
        }}
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

        /* Custom scrollbar for horizontal tab strip on mobile */
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