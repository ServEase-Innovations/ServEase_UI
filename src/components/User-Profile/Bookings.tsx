/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Phone, MessageCircle, Star, CheckCircle, XCircle, History, Edit, XCircle as XCircleIcon, Menu, Search, CreditCard, FileText, ArrowLeft, Wallet, ArrowUpDown, Info, ChefHat, Home, HeartHandshake, LayoutGrid, Zap, CalendarClock, FilterX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Common/Card';
import _ from 'lodash';
import { Button } from '../../components/Button/button';
import { Badge } from '../../components/Common/Badge/Badge';
import { Separator } from '../../components/Common/Separator/Separator';
import axiosInstance from '../../services/axiosInstance';
import { useAuth0 } from '@auth0/auth0-react';
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
import {
  BookingService,
  isPaymentCancelledError,
  PAYMENT_CANCELLED_MESSAGE,
} from 'src/services/bookingService';
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
import {
  getNoProviderAutoCancelMessage,
  getPaymentTimeoutCancellationMessage,
  isNoProviderAutoCancelCancellation,
  isPaymentTimeoutCancellation,
  type BookingCancellationInfo,
} from 'src/utils/bookingCancellation';
import { formatProviderDisplayName } from 'src/utils/providerDisplayName';
import { useDispatch } from 'react-redux';
import {
  closeBookingDialog,
  commitSchedule,
  openBookingDialog,
} from '../../features/bookingType/bookingTypeSlice';
import { add as setGeoLocation } from '../../features/geoLocation/geoLocationSlice';
import { BOOKINGS, DETAILS } from 'src/Constants/pagesConstants';
import {
  buildRebookGeoLocation,
  buildRebookPayload,
  isOnDemandBookingType,
  type RebookSourceBooking,
} from 'src/utils/rebookFromBooking';
import { checkOnDemandProviderAvailability } from 'src/services/onDemandAvailability';
import OnDemandRebookDialog from './OnDemandRebookDialog';
import MaidServiceDialog from '../ProviderDetails/MaidServiceDialog';
import CookServicesDialog from '../ProviderDetails/CookServicesDialog';
import NannyServicesDialog from '../ProviderDetails/NannyServicesDialog';
import { EnhancedProviderDetails } from '../../types/ProviderDetailsType';
import { buildRebookProviderDetails } from 'src/utils/rebookProviderDetails';

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
  latitude?: number | null;
  longitude?: number | null;
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
  vacation?: {
    start_date?: string;
    end_date?: string;
    leave_days?: number;
  };
  vacationDetails?: {
    leave_type?: string;
    total_days?: number;
    refund_amount?: number;
    end_date?: string;
    start_date?: string;
    leave_start_date?: string;
    leave_end_date?: string;
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
  cancellation?: BookingCancellationInfo | null;
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
  cancellation?: BookingCancellationInfo | null;
  modifications?: any[];
  vacations?: Array<{
    start_date?: string;
    end_date?: string;
    leave_days?: number;
    refund?: number;
  }>;
  vacation_start_date?: string;
  vacation_end_date?: string;
  vacation?: {
    start_date?: string;
    end_date?: string;
    leave_days?: number;
  } | null;
  responsibilities?: Responsibilities;
  address?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
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

const isCompletedScheduleModification = (action?: string): boolean => {
  const value = String(action || "");
  return (
    value === "Schedule Rescheduled" ||
    value === "Date Rescheduled" ||
    value === "Time Rescheduled" ||
    value === "Rescheduled"
  );
};

const isBookingAlreadyModified = (booking: Booking | null): boolean => {
  if (!booking) return false;
  return (
    booking.modifications?.some((mod) => isCompletedScheduleModification(mod.action)) ?? false
  );
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

const getLatestModification = (
  modifications: Booking["modifications"] | undefined
) => {
  if (!modifications?.length) return null;
  return [...modifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
};

const hasScheduleModification = (booking: Booking): boolean =>
  booking.modifications?.some((mod) => isCompletedScheduleModification(mod.action)) ??
  false;

const getModificationDetails = (booking: Booking): string => {
  if (!booking.modifications || booking.modifications.length === 0) return "";

  const lastMod = getLatestModification(booking.modifications);
  if (!lastMod) return "";
  
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

type BookingsViewTab = "today" | "upcoming" | "past" | "cancelled" | "pending";
type UpcomingSortOrder = "newest" | "oldest";

const getBookingCreatedEpoch = (booking: Booking): number => {
  const raw = booking.created_at || booking.bookingDate;
  if (!raw) return 0;
  const epoch = new Date(raw).getTime();
  return Number.isFinite(epoch) ? epoch : 0;
};

const sortUpcomingByCreated = (
  bookings: Booking[],
  order: UpcomingSortOrder
): Booking[] => {
  const direction = order === "newest" ? -1 : 1;
  return [...bookings].sort((a, b) => {
    const createdDiff =
      (getBookingCreatedEpoch(a) - getBookingCreatedEpoch(b)) * direction;
    if (createdDiff !== 0) return createdDiff;
    return (a.id - b.id) * direction;
  });
};

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

const isUpcomingTabBooking = (booking: Booking): boolean => {
  const status = effectiveTaskStatus(booking);
  return status !== "CANCELLED" && status !== "COMPLETED";
};

type UpcomingServiceFilter = "ALL" | "cook" | "maid" | "nanny";
type UpcomingDurationFilter = "ALL" | "MONTHLY" | "SHORT_TERM" | "ON_DEMAND";

const UPCOMING_SERVICE_FILTERS: {
  value: UpcomingServiceFilter;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}[] = [
  { value: "ALL", label: "All services", shortLabel: "All", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: "cook", label: "Cook", shortLabel: "Cook", icon: <ChefHat className="h-3.5 w-3.5" /> },
  { value: "maid", label: "Maid", shortLabel: "Maid", icon: <Home className="h-3.5 w-3.5" /> },
  { value: "nanny", label: "Caregiver", shortLabel: "Caregiver", icon: <HeartHandshake className="h-3.5 w-3.5" /> },
];

const UPCOMING_DURATION_FILTERS: {
  value: UpcomingDurationFilter;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}[] = [
  { value: "ALL", label: "All types", shortLabel: "All", icon: <Calendar className="h-3.5 w-3.5" /> },
  { value: "MONTHLY", label: "Monthly", shortLabel: "Monthly", icon: <Calendar className="h-3.5 w-3.5" /> },
  { value: "SHORT_TERM", label: "Short term", shortLabel: "Short", icon: <CalendarClock className="h-3.5 w-3.5" /> },
  { value: "ON_DEMAND", label: "On demand", shortLabel: "On demand", icon: <Zap className="h-3.5 w-3.5" /> },
];

const normalizeBookingServiceType = (booking: Booking): string =>
  String(booking.service_type || "").toLowerCase().trim();

const matchesUpcomingServiceFilter = (
  booking: Booking,
  filter: UpcomingServiceFilter
): boolean => {
  if (filter === "ALL") return true;
  const serviceType = normalizeBookingServiceType(booking);
  if (filter === "nanny") return serviceType === "nanny" || serviceType === "caregiver";
  if (filter === "maid") return serviceType === "maid" || serviceType === "cleaning";
  return serviceType === filter;
};

const matchesUpcomingDurationFilter = (
  booking: Booking,
  filter: UpcomingDurationFilter
): boolean => {
  if (filter === "ALL") return true;
  return String(booking.bookingType || "").toUpperCase() === filter;
};

const applyUpcomingTabFilters = (
  bookings: Booking[],
  serviceFilter: UpcomingServiceFilter,
  durationFilter: UpcomingDurationFilter,
  statusFilter: string
): Booking[] =>
  bookings
    .filter((booking) => matchesUpcomingServiceFilter(booking, serviceFilter))
    .filter((booking) => matchesUpcomingDurationFilter(booking, durationFilter))
    .filter((booking) => {
      if (statusFilter === "ALL") return true;
      return effectiveTaskStatus(booking) === statusFilter;
    });

function toRebookSource(booking: Booking): RebookSourceBooking {
  return {
    service_type: booking.service_type,
    bookingType: booking.bookingType,
    startDate: booking.startDate,
    endDate: booking.endDate,
    start_time: booking.start_time,
    end_time: booking.end_time,
    address: booking.address,
    latitude: booking.latitude,
    longitude: booking.longitude,
    responsibilities: booking.responsibilities,
  };
}

function serviceTypeForOnDemandApi(serviceType: string): string {
  const normalized = String(serviceType || "").toLowerCase();
  if (normalized === "cook") return "COOK";
  if (normalized === "nanny") return "NANNY";
  return "MAID";
}

function rebookServiceKind(
  serviceType: string
): "maid" | "cook" | "nanny" | null {
  const normalized = String(serviceType || "").toLowerCase();
  if (normalized === "maid") return "maid";
  if (normalized === "cook") return "cook";
  if (normalized === "nanny") return "nanny";
  return null;
}

function durationMinutesFromHm(startTime?: string, endTime?: string): number {
  if (!startTime) return 60;
  if (!endTime) return 60;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins > 0) return Math.min(Math.max(mins, 15), 480);
  return 60;
}

const Booking: React.FC<any> = ({ handleDataFromChild }) => {
  const [viewTab, setViewTab] = useState<BookingsViewTab>("today");
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [futureBookings, setFutureBookings] = useState<Booking[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modifiedBookings, setModifiedBookings] = useState<number[]>([]);
  const [generatedOTPs, setGeneratedOTPs] = useState<Record<number, string>>({});
  
  const [openDialog, setOpenDialog] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
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
  const [onDemandRebookOpen, setOnDemandRebookOpen] = useState(false);
  const [rebookCandidate, setRebookCandidate] = useState<Booking | null>(null);
  const [checkingSameProviderRebook, setCheckingSameProviderRebook] = useState(false);
  const [sameProviderRebookError, setSameProviderRebookError] = useState<string | null>(
    null
  );
  const [rebookCheckoutOpen, setRebookCheckoutOpen] = useState(false);
  const [rebookCheckoutProvider, setRebookCheckoutProvider] =
    useState<EnhancedProviderDetails | null>(null);
  const [rebookCheckoutKind, setRebookCheckoutKind] = useState<
    "maid" | "cook" | "nanny" | null
  >(null);
  const rebookNavigateToDetailsRef = useRef(false);
  const rebookCheckoutSucceededRef = useRef(false);

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
  const [upcomingServiceFilter, setUpcomingServiceFilter] =
    useState<UpcomingServiceFilter>("ALL");
  const [upcomingDurationFilter, setUpcomingDurationFilter] =
    useState<UpcomingDurationFilter>("ALL");
  const [upcomingSortOrder, setUpcomingSortOrder] =
    useState<UpcomingSortOrder>("newest");
  useEffect(() => {
    if (statusFilter === "COMPLETED") {
      setStatusFilter("ALL");
    }
  }, [statusFilter]);
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
  const dispatch = useDispatch();

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
      if (isPaymentCancelledError(err)) {
        setSnackbarMessage(PAYMENT_CANCELLED_MESSAGE);
        setSnackbarSeverity("info");
        setOpenSnackbar(true);
        return;
      }
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

  const renderPaymentTimeoutCancellationNotice = (booking: Booking) => {
    if (!isPaymentTimeoutCancellation(booking)) return null;

    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-300/90 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 p-3.5 sm:p-4"
      >
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 ring-1 ring-amber-200/80">
            <XCircle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-950">
              Booking cancelled — payment not received
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/90 sm:text-sm">
              {getPaymentTimeoutCancellationMessage(booking)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderNoProviderAutoCancelNotice = (booking: Booking) => {
    if (!isNoProviderAutoCancelCancellation(booking)) return null;

    return (
      <div
        role="alert"
        className="rounded-xl border border-sky-300/90 bg-gradient-to-r from-sky-50 via-slate-50/80 to-sky-50 p-3.5 sm:p-4"
      >
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800 ring-1 ring-sky-200/80">
            <Info className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sky-950">
              No provider was available
            </p>
            <p className="mt-1 text-xs leading-relaxed text-sky-900/90 sm:text-sm">
              {getNoProviderAutoCancelMessage(booking)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAutoCancellationNotices = (booking: Booking) => (
    <>
      {renderPaymentTimeoutCancellationNotice(booking)}
      {renderNoProviderAutoCancelNotice(booking)}
    </>
  );

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

  const sortPendingPaymentBookings = (bookings: Booking[]): Booking[] => {
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

  const toVacationYmd = (value?: string | null) =>
    value ? String(value).trim().slice(0, 10) : undefined;

  const resolveLeaveDays = (...candidates: Array<number | undefined | null>) => {
    for (const candidate of candidates) {
      const days = Number(candidate ?? 0);
      if (days > 0) return days;
    }
    return undefined;
  };

  const resolveVacationFromEngagement = (item: EngagementApiItem) => {
    if (item.vacation?.start_date && item.vacation?.end_date) {
      return {
        start_date: toVacationYmd(item.vacation.start_date)!,
        end_date: toVacationYmd(item.vacation.end_date)!,
        leave_days: resolveLeaveDays(item.vacation.leave_days, item.leave_days),
      };
    }

    const startFromRow = toVacationYmd(item.vacation_start_date);
    const endFromRow = toVacationYmd(item.vacation_end_date);
    if (startFromRow && endFromRow) {
      return {
        start_date: startFromRow,
        end_date: endFromRow,
        leave_days: resolveLeaveDays(item.leave_days),
      };
    }

    const latestVacation = item.vacations?.[item.vacations.length - 1];
    const startFromHistory = toVacationYmd(latestVacation?.start_date);
    const endFromHistory = toVacationYmd(latestVacation?.end_date);
    if (startFromHistory && endFromHistory) {
      return {
        start_date: startFromHistory,
        end_date: endFromHistory,
        leave_days: resolveLeaveDays(latestVacation?.leave_days, item.leave_days),
      };
    }

    return undefined;
  };

  const mapBookingData = (data: EngagementApiItem[]) => {
    return Array.isArray(data)
      ? data.map((item) => {
          const vacation = resolveVacationFromEngagement(item);
          const hasVacation =
            Boolean(vacation) || Number(item.leave_days ?? 0) > 0;
          const modifications = item.modifications || [];
          const hasModifications = modifications.length > 0;

          let serviceProviderName = "Not Assigned";
          let providerRating = 0;
          const providerDisplay = formatProviderDisplayName(item?.provider);
          if (providerDisplay) {
            serviceProviderName = providerDisplay;
          } else if (item?.provider?.firstName && item?.provider?.lastName) {
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
            latitude:
              item.latitude != null && item.latitude !== ""
                ? Number(item.latitude)
                : undefined,
            longitude:
              item.longitude != null && item.longitude !== ""
                ? Number(item.longitude)
                : undefined,
            childAge: item.childAge || '',
            experience: item.experience || '',
            noOfPersons: item.noOfPersons || '',
            mealType: item.mealType || '',
            modifiedDate:
              (getLatestModification(modifications)?.date || item.created_at) ?? "",
            responsibilities: item.responsibilities || { tasks: [] },
            customerHolidays: item.customerHolidays || [],
            hasVacation: hasVacation,
            assignmentStatus: item.assignment_status || "ASSIGNED",
            leave_days: vacation?.leave_days ?? item.leave_days ?? 0,
            vacation,
            vacationDetails: vacation
              ? {
                  leave_type: "VACATION",
                  total_days: vacation.leave_days,
                  start_date: vacation.start_date,
                  end_date: vacation.end_date,
                  leave_start_date: vacation.start_date,
                  leave_end_date: vacation.end_date,
                }
              : undefined,
            modifications: modifications,
            today_service: item.today_service,
            payment: item.payment,
            cancellation: item.cancellation ?? null,
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
          setSelectedBookingForVacationManagement(booking);
          setVacationManagementDialogOpen(true);
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

  const commitRebookToStore = (
    booking: Booking,
    options?: { serviceProviderId?: number | null; clearProvider?: boolean }
  ) => {
    const payload = buildRebookPayload(toRebookSource(booking), {
      serviceProviderId: options?.serviceProviderId,
    });
    if (!payload) return null;

    const schedulePatch: Record<string, unknown> = { ...payload };
    if (options?.clearProvider) {
      schedulePatch.serviceproviderId = "";
      schedulePatch.serviceProviderId = "";
    }

    dispatch(commitSchedule(schedulePatch));
    const geo = buildRebookGeoLocation(toRebookSource(booking));
    if (geo) {
      dispatch(setGeoLocation(geo));
    }
    return payload;
  };

  const openRebookCheckout = (
    booking: Booking,
    options?: {
      providerDetails?: EnhancedProviderDetails | null;
      providerId?: number;
      navigateToDetailsOnClose?: boolean;
    }
  ) => {
    const serviceKind = rebookServiceKind(booking.service_type);
    if (!serviceKind) return false;

    const hasProvider =
      options?.providerId != null &&
      Number.isFinite(options.providerId) &&
      options.providerId > 0;

    if (
      !commitRebookToStore(booking, {
        serviceProviderId: hasProvider ? options?.providerId : undefined,
        clearProvider: !hasProvider,
      })
    ) {
      return false;
    }

    if (hasProvider) {
      dispatch(openBookingDialog(String(options!.providerId)));
    } else {
      dispatch(closeBookingDialog());
    }

    rebookNavigateToDetailsRef.current = options?.navigateToDetailsOnClose === true;
    rebookCheckoutSucceededRef.current = false;
    setRebookCheckoutKind(serviceKind);
    setRebookCheckoutProvider(options?.providerDetails ?? null);
    setRebookCheckoutOpen(true);
    return true;
  };

  const navigateToProviderSearch = () => {
    if (typeof handleDataFromChild === "function") {
      handleDataFromChild(DETAILS);
    }
  };

  const handleRebookDialogSendDataToParent = (data: string) => {
    if (data === BOOKINGS) {
      rebookCheckoutSucceededRef.current = true;
    }
    if (typeof handleDataFromChild === "function") {
      handleDataFromChild(data);
    }
  };

  const handleBookAgain = (booking: Booking) => {
    const payload = buildRebookPayload(toRebookSource(booking));
    if (!payload) {
      setSnackbarMessage(
        "This service type cannot be rebooked automatically. Please book from the home page."
      );
      setSnackbarSeverity("info");
      setOpenSnackbar(true);
      return;
    }

    if (isOnDemandBookingType(booking.bookingType)) {
      setRebookCandidate(booking);
      setSameProviderRebookError(null);
      setOnDemandRebookOpen(true);
      return;
    }

    const providerId = Number(booking.serviceProviderId);
    const hasProvider = Number.isFinite(providerId) && providerId > 0;

    if (
      !openRebookCheckout(booking, {
        providerId: hasProvider ? providerId : undefined,
        providerDetails: hasProvider ? buildRebookProviderDetails(booking) : null,
        navigateToDetailsOnClose: true,
      })
    ) {
      setSnackbarMessage(
        "This service type cannot be rebooked automatically. Please book from the home page."
      );
      setSnackbarSeverity("info");
      setOpenSnackbar(true);
    }
  };

  const handleOnDemandRebookDifferentProvider = () => {
    if (!rebookCandidate) return;

    if (!openRebookCheckout(rebookCandidate)) {
      setSameProviderRebookError(
        "This service type cannot be rebooked automatically. Please book from the home page."
      );
      return;
    }

    setOnDemandRebookOpen(false);
    setRebookCandidate(null);
    setSameProviderRebookError(null);
  };

  const handleOnDemandRebookSameProvider = async () => {
    if (!rebookCandidate) return;
    const providerId = Number(rebookCandidate.serviceProviderId);
    if (!Number.isFinite(providerId) || providerId < 1) {
      setSameProviderRebookError(
        "No provider was assigned on your last booking. Please choose a provider from the list."
      );
      return;
    }

    const lat = Number(rebookCandidate.latitude);
    const lng = Number(rebookCandidate.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setSameProviderRebookError(
        "We need your service location to check provider availability. Choose a different provider and confirm your address on the map."
      );
      return;
    }

    const payload = buildRebookPayload(toRebookSource(rebookCandidate), {
      serviceProviderId: providerId,
    });
    if (!payload) {
      setSameProviderRebookError(
        "This service type cannot be rebooked automatically. Please book from the home page."
      );
      return;
    }

    const serviceKind = rebookServiceKind(rebookCandidate.service_type);
    if (!serviceKind) {
      setSameProviderRebookError(
        "This service type cannot be rebooked automatically. Please book from the home page."
      );
      return;
    }

    setCheckingSameProviderRebook(true);
    setSameProviderRebookError(null);
    try {
      const availability = await checkOnDemandProviderAvailability({
        latitude: lat,
        longitude: lng,
        serviceType: serviceTypeForOnDemandApi(rebookCandidate.service_type),
        startDate: payload.startDate,
        startTime: payload.startTime,
        durationMinutes: durationMinutesFromHm(payload.startTime, payload.endTime),
        providerId,
      });

      if (!availability.available) {
        setSameProviderRebookError(
          availability.message ||
            "This provider is not available for your selected schedule. Try another time or choose a different provider."
        );
        return;
      }

      if (
        !openRebookCheckout(rebookCandidate, {
          providerId,
          providerDetails: buildRebookProviderDetails(rebookCandidate),
        })
      ) {
        setSameProviderRebookError(
          "This service type cannot be rebooked automatically. Please book from the home page."
        );
        return;
      }

      setOnDemandRebookOpen(false);
      setRebookCandidate(null);
    } catch {
      setSameProviderRebookError(
        "Could not verify provider availability. Please try again."
      );
    } finally {
      setCheckingSameProviderRebook(false);
    }
  };

  const handleCloseRebookCheckout = () => {
    dispatch(closeBookingDialog());
    const shouldNavigateToDetails =
      rebookNavigateToDetailsRef.current && !rebookCheckoutSucceededRef.current;
    rebookNavigateToDetailsRef.current = false;
    rebookCheckoutSucceededRef.current = false;
    setRebookCheckoutOpen(false);
    setRebookCheckoutProvider(null);
    setRebookCheckoutKind(null);
    if (shouldNavigateToDetails) {
      navigateToProviderSearch();
    }
  };

  const handleModifyClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setModifyDialogOpen(true);
  };

  const openVacationDialog = (booking: Booking) => {
    setSelectedBookingForVacationManagement(booking);
    setVacationManagementDialogOpen(true);
  };

  const handleVacationClick = (booking: Booking) => {
    openVacationDialog(booking);
  };

  const handleModifyVacationClick = (booking: Booking) => {
    openVacationDialog(booking);
  };

  const handleVacationSuccess = async (message = 'Vacation updated successfully!') => {
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    await refreshBookings();
  };

  const handleCancelBooking = async (booking: Booking) => {
    await PaymentInstance.post(`/api/v2/engagements/${booking.id}/cancel`, {});
    await refreshBookings();
    setViewTab("cancelled");
    setStatusFilter("ALL");
    setSnackbarMessage('Booking cancelled successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const handleSaveModifiedBooking = (updatedData: {
    startDate: string;
    endDate: string;
    timeSlot: string;
  }) => {
    setSnackbarMessage("Booking updated successfully!");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
    setModifyDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDrawerOpen(true);
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

            {(booking.bookingType === "MONTHLY" || booking.bookingType === "SHORT_TERM") && (
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
              onClick={() => handleBookAgain(booking)}
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
              onClick={() => handleBookAgain(booking)}
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

  const upcomingBookings = sortUpcomingByCreated(
    [...currentBookings, ...futureBookings].filter(isUpcomingTabBooking),
    upcomingSortOrder
  );

  const countUpcomingWithFilters = (
    source: Booking[],
    overrides: Partial<{
      serviceFilter: UpcomingServiceFilter;
      durationFilter: UpcomingDurationFilter;
      statusFilter: string;
    }> = {}
  ) =>
    applyUpcomingTabFilters(
      source,
      overrides.serviceFilter ?? upcomingServiceFilter,
      overrides.durationFilter ?? upcomingDurationFilter,
      overrides.statusFilter ?? statusFilter
    ).length;

  const upcomingFilterSource = upcomingBookings;

  const filteredUpcomingPreSearch = applyUpcomingTabFilters(
    upcomingFilterSource,
    upcomingServiceFilter,
    upcomingDurationFilter,
    statusFilter
  );

  const hasActiveUpcomingFilters =
    statusFilter !== "ALL" ||
    upcomingServiceFilter !== "ALL" ||
    upcomingDurationFilter !== "ALL";

  const clearUpcomingFilters = () => {
    setStatusFilter("ALL");
    setUpcomingServiceFilter("ALL");
    setUpcomingDurationFilter("ALL");
  };

  const pendingPaymentBookings = sortPendingPaymentBookings(
    [...currentBookings, ...futureBookings, ...pastBookings].filter(
      isPaymentPendingBooking
    )
  );

  const searchActive = Boolean(searchTerm.trim());

  const filteredUpcomingBookings = searchActive
    ? filterBookings(getAllBookings(), searchTerm)
    : filterBookings(filteredUpcomingPreSearch, searchTerm);

  const filteredPendingPaymentBookings = searchActive
    ? filterBookings(
        getAllBookings().filter((b) => isPaymentPendingBooking(b)),
        searchTerm
      )
    : filterBookings(pendingPaymentBookings, searchTerm);

  const filteredPastBookings = searchActive
    ? filterBookings(getAllBookings(), searchTerm)
    : filterBookings(pastBookings, searchTerm);

  const sortedCancelledBookings = sortUpcomingByCreated(cancelledBookings, "newest");
  const filteredCancelledBookings = filterBookings(sortedCancelledBookings, searchTerm);

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
      id: "cancelled",
      label: "Cancelled",
      shortLabel: "Cancel",
      count: cancelledBookings.length,
    },
    {
      id: "pending",
      label: "Pending payment",
      shortLabel: "Pending",
      count: pendingPaymentBookings.length,
    },
  ];

  const statusTabs = [
    { value: "ALL", label: "All", count: countUpcomingWithFilters(upcomingBookings, { statusFilter: "ALL" }) },
    {
      value: "NOT_STARTED",
      label: "Not Started",
      count: countUpcomingWithFilters(upcomingBookings, { statusFilter: "NOT_STARTED" }),
    },
    {
      value: "IN_PROGRESS",
      label: "In Progress",
      count: countUpcomingWithFilters(upcomingBookings, { statusFilter: "IN_PROGRESS" }),
    },
  ];

  const upcomingSelectClassName =
    "min-w-0 w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 sm:text-xs";

  const historyTabBookings =
    viewTab === "cancelled" ? filteredCancelledBookings : filteredPastBookings;
  const historyTabTotal =
    viewTab === "cancelled" ? cancelledBookings.length : pastBookings.length;
  const historyTabHasAny =
    viewTab === "cancelled" ? cancelledBookings.length > 0 : pastBookings.length > 0;

  const renderUpcomingFilterSelect = (
    shortLabel: string,
    label: string,
    value: string,
    onChange: (next: string) => void,
    options: { value: string; label: string; count: number }[],
    ariaLabel: string
  ) => (
    <label className="flex w-[7.5rem] shrink-0 flex-col gap-1 sm:w-[8.5rem]">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {shortLabel}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={upcomingSelectClassName}
        aria-label={ariaLabel}
        title={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );

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
                        : tab.id === "cancelled"
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
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
                        ? tab.id === "pending" || tab.id === "today" || tab.id === "cancelled"
                          ? "bg-white/25 text-white"
                          : "bg-sky-100 text-sky-800"
                        : tab.id === "today"
                          ? "bg-emerald-100 text-emerald-800"
                          : tab.id === "pending"
                            ? "bg-red-100 text-red-800"
                            : tab.id === "cancelled"
                              ? "bg-rose-100 text-rose-800"
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
                        : hasActiveUpcomingFilters
                          ? " match your filters"
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
            <div className="mb-4 -mx-1 overflow-x-auto pb-1 scrollbar-thin">
              <div className="flex min-w-max items-end gap-2 px-1 sm:gap-2.5">
              <label className="flex w-[7.5rem] shrink-0 flex-col gap-1 sm:w-[8.5rem]">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Sort
                </span>
                <div className="inline-flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
                  <select
                    value={upcomingSortOrder}
                    onChange={(e) =>
                      setUpcomingSortOrder(e.target.value as UpcomingSortOrder)
                    }
                    className={upcomingSelectClassName}
                    aria-label="Sort upcoming bookings"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              </label>
              {renderUpcomingFilterSelect(
                "Service",
                "Service type",
                upcomingServiceFilter,
                (value) => setUpcomingServiceFilter(value as UpcomingServiceFilter),
                UPCOMING_SERVICE_FILTERS.map((tab) => ({
                  value: tab.value,
                  label: tab.label,
                  count: countUpcomingWithFilters(upcomingFilterSource, {
                    serviceFilter: tab.value,
                  }),
                })),
                "Filter upcoming bookings by service type"
              )}
              {renderUpcomingFilterSelect(
                "Type",
                "Booking type",
                upcomingDurationFilter,
                (value) => setUpcomingDurationFilter(value as UpcomingDurationFilter),
                UPCOMING_DURATION_FILTERS.map((tab) => ({
                  value: tab.value,
                  label: tab.label,
                  count: countUpcomingWithFilters(upcomingFilterSource, {
                    durationFilter: tab.value,
                  }),
                })),
                "Filter upcoming bookings by booking type"
              )}
              {renderUpcomingFilterSelect(
                "Status",
                "Status",
                statusFilter,
                setStatusFilter,
                statusTabs.map((tab) => ({
                  value: tab.value,
                  label: tab.label,
                  count: tab.count,
                })),
                "Filter upcoming bookings by status"
              )}
              {hasActiveUpcomingFilters ? (
                <button
                  type="button"
                  onClick={clearUpcomingFilters}
                  className="mb-0.5 inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition hover:bg-sky-100 sm:text-xs"
                >
                  <FilterX className="h-3.5 w-3.5" />
                  Clear
                </button>
              ) : null}
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
            activeBookingsList.length > 0 ? (
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
                    {renderAutoCancellationNotices(booking)}

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
                            hasScheduleModification(booking) && (
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
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
                  <FilterX className="h-7 w-7 text-sky-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No matching bookings</h3>
                <p className="mx-auto mb-6 max-w-sm text-sm text-slate-600">
                  {hasActiveUpcomingFilters
                    ? "No upcoming bookings match your current filters. Try adjusting service type, booking type, or status."
                    : "No bookings match your search. Try different keywords or clear the search."}
                </p>
                {hasActiveUpcomingFilters ? (
                  <Button variant="outline" onClick={clearUpcomingFilters} className="rounded-xl">
                    Clear all filters
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setSearchTerm("")} className="rounded-xl">
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
            )
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

        {(viewTab === "past" || viewTab === "cancelled") && (
        <section>
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200/90 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-stretch gap-3">
              <div
                className={`w-1 shrink-0 rounded-full bg-gradient-to-b ${
                  viewTab === "cancelled"
                    ? "from-rose-500 to-rose-600"
                    : "from-slate-400 to-slate-500"
                }`}
                aria-hidden
              />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  {viewTab === "cancelled" ? "Cancelled" : "Past"}
                </h2>
                <div className="mt-1 text-sm leading-snug text-slate-500">
                  {isLoading ? (
                    <SkeletonLoader width="160px" height="0.875rem" />
                  ) : (
                    <>
                      <span className="font-medium text-slate-700">{historyTabBookings.length}</span>
                      {historyTabBookings.length === 1 ? " booking" : " bookings"}
                      {searchTerm.trim()
                        ? " match your search"
                        : viewTab === "cancelled"
                          ? " — bookings you cancelled"
                          : " — completed or ended"}
                      <span className="text-slate-400"> · </span>
                      <span className="tabular-nums text-slate-600">{historyTabTotal} total</span>
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
          ) : historyTabHasAny ? (
            <div className="grid gap-3">
              {historyTabBookings.map((booking) => {
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
                    {renderAutoCancellationNotices(booking)}

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
                            hasScheduleModification(booking) && (
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
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${
                    viewTab === "cancelled"
                      ? "bg-rose-50 ring-rose-200/80"
                      : "bg-slate-100 ring-slate-200/80"
                  }`}
                >
                  {viewTab === "cancelled" ? (
                    <XCircle className="h-7 w-7 text-rose-500" />
                  ) : (
                    <History className="h-7 w-7 text-slate-500" />
                  )}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {viewTab === "cancelled" ? "No cancelled bookings" : "No past bookings yet"}
                </h3>
                <p className="mx-auto max-w-sm text-sm text-slate-600">
                  {viewTab === "cancelled"
                    ? "When you cancel a booking, it will appear here."
                    : "Completed and ended bookings will appear here."}
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

      {/* Dialogs */}
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

      <OnDemandRebookDialog
        open={onDemandRebookOpen}
        onClose={() => {
          if (checkingSameProviderRebook) return;
          setOnDemandRebookOpen(false);
          setRebookCandidate(null);
          setSameProviderRebookError(null);
        }}
        booking={
          rebookCandidate
            ? {
                serviceProviderId: rebookCandidate.serviceProviderId,
                serviceProviderName: rebookCandidate.serviceProviderName,
              }
            : null
        }
        canCheckSameProvider={
          Boolean(rebookCandidate?.serviceProviderId) &&
          Number.isFinite(Number(rebookCandidate?.latitude)) &&
          Number.isFinite(Number(rebookCandidate?.longitude))
        }
        sameProviderDisabledReason={
          rebookCandidate &&
          (!rebookCandidate.serviceProviderId ||
            !Number.isFinite(Number(rebookCandidate.latitude)) ||
            !Number.isFinite(Number(rebookCandidate.longitude)))
            ? "Saved location is required to rebook with the same provider."
            : null
        }
        checkingSameProvider={checkingSameProviderRebook}
        sameProviderError={sameProviderRebookError}
        onBookSameProvider={() => void handleOnDemandRebookSameProvider()}
        onChooseDifferentProvider={handleOnDemandRebookDifferentProvider}
      />

      {rebookCheckoutKind === "maid" ? (
        <MaidServiceDialog
          open={rebookCheckoutOpen}
          handleClose={handleCloseRebookCheckout}
          providerDetails={rebookCheckoutProvider ?? undefined}
          sendDataToParent={handleRebookDialogSendDataToParent}
        />
      ) : null}
      {rebookCheckoutKind === "cook" ? (
        <CookServicesDialog
          open={rebookCheckoutOpen}
          handleClose={handleCloseRebookCheckout}
          providerDetails={rebookCheckoutProvider ?? undefined}
          sendDataToParent={handleRebookDialogSendDataToParent}
        />
      ) : null}
      {rebookCheckoutKind === "nanny" ? (
        <NannyServicesDialog
          open={rebookCheckoutOpen}
          handleClose={handleCloseRebookCheckout}
          providerDetails={rebookCheckoutProvider ?? undefined}
          sendDataToParent={handleRebookDialogSendDataToParent}
        />
      ) : null}

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