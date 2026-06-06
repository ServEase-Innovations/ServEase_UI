/* eslint-disable */
import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import dayjs from "dayjs";
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
  Shield,
  CreditCard,
  Wallet,
  Receipt,
  Phone,
  MapPin,
  Play,
  AlertTriangle,
} from "lucide-react";
import { useAuth0 } from '@auth0/auth0-react';
import { AllBookingsDialog } from "./AllBookingsDialog";
import {
  effectiveProviderTaskStatus,
  getBookingTypeBadge,
  getServiceTitle,
  getStatusBadge,
} from "../Common/Booking/BookingUtils";
import { ReviewsDialog } from "./ReviewsDialog";
import axios, { AxiosResponse } from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ProviderCalendarBig from "./ProviderCalendarBig";
import PaymentInstance from "src/services/paymentInstance";
import { useAppUser } from "src/context/AppUserContext";
import { resolveProviderId } from "src/services/engagementService";
import {
  epochToDisplayTime,
  toEpochOrNull,
} from "src/services/bookingEpoch";
import type { EngagementEpochFields } from "src/services/epochContract";
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
  [key: string]: unknown;
}

interface ResponsibilityAddOn {
  [key: string]: unknown;
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
  bookingData: ProviderDashboardBooking;
}

export interface BookingHistoryResponse {
  current: ProviderDashboardBooking[];
  upcoming?: ProviderDashboardBooking[];
  past: ProviderDashboardBooking[];
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

/** One booked visit on the provider's calendar for today (IST), from GET .../today-bookings */
export interface TodayBookingSlot {
  availability_id: number;
  engagement_id: number;
  visit_date: string;
  slot_start_epoch: number | null;
  slot_end_epoch: number | null;
  engagement_start_epoch?: number | null;
  engagement_end_epoch?: number | null;
  start_time_ist: string | null;
  end_time_ist: string | null;
  booking_type: string;
  service_type: string;
  task_status: string;
  engagement_status: string;
  address: string | null;
  base_amount: number | null;
  customer_firstname: string | null;
  customer_lastname: string | null;
  mobileno: string | null;
  /** Present when a `service_days` row exists for this engagement + visit date (required to start/complete visit). */
  service_day_id: number | null;
  /** `service_days.status`: SCHEDULED | IN_PROGRESS | COMPLETED | … */
  service_day_status: string | null;
  is_overdue?: boolean;
  overdue_message?: string | null;
}

type TaskBookingData = {
  today_service?: {
    service_day_id?: string | number | null;
    status?: string | null;
    can_start?: boolean;
  };
  firstname?: string;
  lastname?: string;
  customerName?: string;
  service_type?: string;
  serviceType?: string;
  engagement_id?: string | number;
  id?: string | number;
  mobileno?: string | null;
};

type CurrentBookingState = {
  bookingId: string;
  bookingData: TaskBookingData;
} | null;

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

type ProviderDashboardBooking = Partial<EngagementEpochFields> & {
  [key: string]: unknown;
  id?: number | string;
  engagement_id?: number | string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  startTime?: string;
  endTime?: string;
  booking_type?: string;
  bookingType?: string;
  firstname?: string;
  customerName?: string;
  email?: string;
  base_amount?: number | string;
  service_type?: string;
  serviceType?: string;
  address?: string | null;
  location?: string;
  task_status?: string;
  responsibilities?: { tasks?: unknown[]; add_ons?: unknown[] };
  mobileno?: string | null;
  today_service?: {
    service_day_id?: string | number | null;
    status?: string | null;
    can_start?: boolean;
  };
};

interface TodayVisitsCardProps {
  loading: boolean;
  providerMissing?: boolean;
  todaySchedule: TodayBookingSlot[];
  taskStatusUpdating: Record<string, boolean>;
  onCallCustomer: (phone: string, name: string) => void;
  onTrackAddress: (address: string) => void;
  /** Resolves today’s service day when needed, then calls the start API */
  onStartTodayVisit: (slot: TodayBookingSlot) => void | Promise<void>;
  onStopTask: (bookingId: string, bookingData: TaskBookingData) => void;
}

function isSlotOverdue(slot: TodayBookingSlot): boolean {
  if (slot.is_overdue) return true;
  const sd = String(slot.service_day_status ?? "").toUpperCase();
  if (["IN_PROGRESS", "STARTED", "COMPLETED", "DONE", "SKIPPED"].includes(sd)) {
    return false;
  }
  const startEp = toEpochOrNull(slot.slot_start_epoch) ?? toEpochOrNull(slot.engagement_start_epoch);
  if (startEp == null) return false;
  return dayjs().unix() >= startEp;
}

function TodayVisitsCard({
  loading,
  providerMissing = false,
  todaySchedule,
  taskStatusUpdating,
  onCallCustomer,
  onTrackAddress,
  onStartTodayVisit,
  onStopTask,
}: TodayVisitsCardProps) {
  const overdueCount = todaySchedule.filter(isSlotOverdue).length;

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/30 ring-1 ring-slate-900/5">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-100/90 bg-gradient-to-r from-sky-50/90 to-white py-3.5 sm:py-4">
        <div className="min-w-0">
          <CardTitle className="text-base font-bold text-slate-900 sm:text-lg">
            Today&apos;s visits
          </CardTitle>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Booked slots for today (India time), ordered by start time.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/60">
          <Clock className="h-5 w-5" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        {overdueCount > 0 ? (
          <div
            role="alert"
            className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="font-semibold">
                {overdueCount === 1
                  ? "1 visit is overdue to start"
                  : `${overdueCount} visits are overdue to start`}
              </p>
              <p className="mt-0.5 text-xs text-amber-900/90">
                Scheduled start time has passed. Please start the task or update the booking status.
              </p>
            </div>
          </div>
        ) : null}
        {loading ? (
          <div className="flex min-h-[72px] items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
          </div>
        ) : todaySchedule.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-600">
            {providerMissing
              ? "Provider profile not linked. Log out and sign in again with your service provider email."
              : "No visits on your calendar for today."}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {todaySchedule.map((b) => {
              const clientName =
                [b.customer_firstname, b.customer_lastname].filter(Boolean).join(" ").trim() ||
                "Customer";
              const sd = String(b.service_day_status ?? "").toUpperCase();
              const displayStatus = effectiveProviderTaskStatus(
                b.task_status,
                b.service_day_status
              );
              const taskU = displayStatus.toUpperCase();
              const recurring =
                b.booking_type === "MONTHLY" || b.booking_type === "SHORT_TERM";
              const isOnDemand =
                String(b.booking_type || "").toUpperCase() === "ON_DEMAND";
              const showComplete =
                b.service_day_id != null && sd === "IN_PROGRESS";
              const showStart =
                !showComplete &&
                taskU !== "COMPLETED" &&
                taskU !== "IN_PROGRESS" &&
                taskU !== "STARTED" &&
                (sd === "SCHEDULED" ||
                  (isOnDemand && (b.service_day_id == null || !sd)) ||
                  (recurring && (b.service_day_id == null || sd === "")));
              const slotStart = toEpochOrNull(b.slot_start_epoch);
              const slotEnd = toEpochOrNull(b.slot_end_epoch);
              const startLabel =
                epochToDisplayTime(slotStart) ||
                (b.start_time_ist ? formatTimeToAMPM(b.start_time_ist) : null);
              const endLabel =
                epochToDisplayTime(slotEnd) ||
                (b.end_time_ist ? formatTimeToAMPM(b.end_time_ist) : null);
              const timeRange =
                startLabel && endLabel
                  ? `${startLabel} – ${endLabel}`
                  : startLabel
                    ? startLabel
                    : "Time TBD";
              const amountLabel =
                b.base_amount != null
                  ? `₹${Number(b.base_amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`
                  : null;
              const overdue = isSlotOverdue(b);
              const overdueMessage =
                b.overdue_message ||
                (overdue && startLabel
                  ? `Scheduled for ${startLabel} — please start the task.`
                  : null);
              return (
                <li
                  key={`${b.availability_id}-${b.engagement_id}`}
                  className={`flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between ${
                    overdue ? "rounded-xl border border-amber-200/80 bg-amber-50/40 px-3 -mx-1" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-bold tabular-nums text-slate-900">{timeRange}</p>
                    <p className="truncate text-sm font-semibold text-slate-800">{clientName}</p>
                    <p className="truncate text-xs text-slate-500">
                      #{b.engagement_id} · {getServiceTitle(b.service_type || "")}
                      {amountLabel ? ` · ${amountLabel}` : ""}
                    </p>
                    {overdue && overdueMessage ? (
                      <p className="mt-1 flex items-start gap-1 text-xs font-medium text-amber-800">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span>{overdueMessage}</span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    {getBookingTypeBadge(String(b.booking_type || ""))}
                    {getStatusBadge(displayStatus)}
                    {b.mobileno ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => onCallCustomer(b.mobileno!, clientName)}
                      >
                        <Phone className="mr-1 h-3.5 w-3.5" />
                        Call
                      </Button>
                    ) : null}
                    {b.address ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => onTrackAddress(b.address!)}
                      >
                        <MapPin className="mr-1 h-3.5 w-3.5" />
                        Map
                      </Button>
                    ) : null}
                    {showStart ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 border-slate-200 px-2 text-xs text-slate-800 hover:border-sky-200 hover:bg-sky-50/80"
                        disabled={!!taskStatusUpdating[String(b.engagement_id)]}
                        onClick={() => void onStartTodayVisit(b)}
                      >
                        {taskStatusUpdating[String(b.engagement_id)] ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span className="inline-flex items-center">
                            <Play className="mr-1 h-3.5 w-3.5" aria-hidden />
                            Start task
                          </span>
                        )}
                      </Button>
                    ) : null}
                    {showComplete ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() =>
                          onStopTask(String(b.engagement_id), {
                            today_service: {
                              service_day_id: b.service_day_id,
                              status: b.service_day_status,
                            },
                          })
                        }
                      >
                        Complete task
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingHistoryResponse | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<TodayBookingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [todayLoading, setTodayLoading] = useState(false);
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
  const [currentBooking, setCurrentBooking] = useState<CurrentBookingState>(null);
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
    return dayjs().format("YYYY-MM");
  };

  const { appUser, authSessionReady } = useAppUser();

  useEffect(() => {
    const pid = resolveProviderId(
      appUser && typeof appUser === "object" ? (appUser as Record<string, unknown>) : null
    );
    setServiceProviderId(pid);
    if (appUser?.name) {
      setUserName(String(appUser.name));
    } else if (isAuthenticated && auth0User?.name) {
      setUserName(auth0User.name);
    }
  }, [appUser, isAuthenticated, auth0User]);

  const normalizeTodaySlots = (raw: unknown): TodayBookingSlot[] => {
    const slots = (raw as { bookings?: TodayBookingSlot[] })?.bookings;
    if (!Array.isArray(slots)) return [];
    return slots.map((slot) => ({
      ...slot,
      slot_start_epoch: toEpochOrNull(slot.slot_start_epoch),
      slot_end_epoch: toEpochOrNull(slot.slot_end_epoch),
      engagement_start_epoch: toEpochOrNull(slot.engagement_start_epoch),
      engagement_end_epoch: toEpochOrNull(slot.engagement_end_epoch),
    }));
  };

  const fetchTodayVisits = async (pid: number) => {
    setTodayLoading(true);
    try {
      const todayRes = await PaymentInstance.get(
        `/api/service-providers/${pid}/today-bookings`
      );
      setTodaySchedule(normalizeTodaySlots(todayRes.data));
    } catch (todayErr) {
      console.warn("Today bookings fetch failed:", todayErr);
      setTodaySchedule([]);
    } finally {
      setTodayLoading(false);
    }
  };

  const fetchDashboardData = async (pid: number) => {
    setLoading(true);
    try {
      const currentMonthYear = getCurrentMonthYear();

      const [payoutResult, monthResult] = await Promise.allSettled([
        PaymentInstance.get(
          `/api/service-providers/${pid}/payouts?month=${currentMonthYear}&detailed=true`
        ),
        PaymentInstance.get(
          `/api/service-providers/${pid}/engagements?month=${currentMonthYear}`
        ),
      ]);

      const partialErrors: string[] = [];

      if (payoutResult.status === "fulfilled") {
        setPayout(payoutResult.value.data);
      } else {
        partialErrors.push("payouts");
        console.warn("Payout fetch failed:", payoutResult.reason);
      }

      if (monthResult.status === "fulfilled") {
        if (monthResult.value.status !== 200) {
          partialErrors.push("monthly bookings");
        } else {
          setBookings(monthResult.value.data as BookingHistoryResponse);
        }
      } else {
        partialErrors.push("monthly bookings");
        console.warn("Monthly engagements fetch failed:", monthResult.reason);
      }

      if (partialErrors.length > 0) {
        setError(`Could not load ${partialErrors.join(" and ")}`);
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authSessionReady) return;

    if (!serviceProviderId) {
      setTodayLoading(false);
      setLoading(false);
      setTodaySchedule([]);
      return;
    }

    void fetchTodayVisits(serviceProviderId);
    void fetchDashboardData(serviceProviderId);
  }, [serviceProviderId, authSessionReady]);

  useEffect(() => {
    if (!serviceProviderId || !authSessionReady) return;
    const intervalId = window.setInterval(() => {
      void fetchTodayVisits(serviceProviderId);
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [serviceProviderId, authSessionReady]);

  const refreshDashboard = async () => {
    if (!serviceProviderId) return;
    await Promise.all([
      fetchTodayVisits(serviceProviderId),
      fetchDashboardData(serviceProviderId),
    ]);
  };

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

  const handleStartTask = async (bookingId: string, bookingData: TaskBookingData) => {
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
        `/api/engagement-service/service-days/${serviceDayId}/start`,
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

      await refreshDashboard();
    } catch (err) {
      setTaskStatus(prev => ({ ...prev, [bookingId]: previousStatus }));
      
      let errorMessage = "Failed to start service";
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as { error?: string; message?: string } | undefined;
        errorMessage = d?.error || d?.message || err.message || errorMessage;
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

  const handleStartTodayVisit = async (b: TodayBookingSlot) => {
    const bookingId = String(b.engagement_id);
    let serviceDayId = b.service_day_id != null ? Number(b.service_day_id) : null;
    if (serviceDayId == null || !Number.isFinite(serviceDayId)) {
      try {
        const { data } = await PaymentInstance.get(
          `/api/engagement-service/engagements/${b.engagement_id}/service-days/today`
        );
        const row = data?.service_day as { service_day_id?: number | string } | undefined;
        if (row?.service_day_id != null) {
          const n = Number(row.service_day_id);
          if (Number.isFinite(n) && n > 0) serviceDayId = n;
        }
      } catch {
        /* 404: no row for server "today" */
      }
    }
    if (serviceDayId == null) {
      toast({
        title: "Can't start this visit",
        description:
          "No service day was found for today. If the booking is new, wait a moment and refresh the dashboard.",
        variant: "destructive",
      });
      return;
    }
    await handleStartTask(bookingId, {
      today_service: { service_day_id: serviceDayId },
    });
  };

  const handleStopTask = async (bookingId: string, bookingData: TaskBookingData) => {
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
        `/api/engagement-service/service-days/${serviceDayId}/complete`,
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
      await refreshDashboard();
      return Promise.resolve();
    } catch (err) {
      let errorMessage = "Failed to complete service";
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as { error?: string; message?: string } | undefined;
        errorMessage = d?.error || d?.message || err.message || errorMessage;
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

  const unavailabilityMonth = useMemo(
    () => moment().format("YYYY-MM"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unavailDialogOpen]
  );
  const leaveEngagementOptions = useMemo(() => {
    if (!bookings) return [] as { value: string; label: string }[];
    const out: { value: string; label: string }[] = [];
    const seen = new Set<string>();
    const fromRow = (b: ProviderDashboardBooking) => {
      const id = b?.engagement_id ?? b?.id;
      if (id == null) return;
      const s = String(id);
      if (seen.has(s)) return;
      seen.add(s);
      const name =
        b?.customerName?.trim() || "—";
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

        <div className="mb-6">
          <TodayVisitsCard
            loading={todayLoading}
            providerMissing={authSessionReady && serviceProviderId == null}
            todaySchedule={todaySchedule}
            taskStatusUpdating={taskStatusUpdating}
            onCallCustomer={handleCallCustomer}
            onTrackAddress={handleTrackAddress}
            onStartTodayVisit={handleStartTodayVisit}
            onStopTask={handleStopTask}
          />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
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

        {/* FIXED: Updated bookingInfo to properly pass the booking ID */}
        <OtpVerificationDialog
          open={otpDialogOpen}
          onOpenChange={setOtpDialogOpen}
          onVerify={handleVerifyOtp}
          verifying={verifyingOtp}
          bookingInfo={currentBooking ? {
            clientName: currentBooking.bookingData?.firstname || currentBooking.bookingData?.customerName,
            service: getServiceTitle(String(currentBooking.bookingData?.service_type || currentBooking.bookingData?.serviceType || "")),
            bookingId:
              currentBooking.bookingData?.engagement_id ??
              currentBooking.bookingData?.id ??
              currentBooking.bookingId,
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
