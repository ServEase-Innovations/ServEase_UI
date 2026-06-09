/* eslint-disable */
import { useState, useEffect, useMemo, useCallback, type ComponentType, type ReactNode } from "react";
import { Button } from "../../components/Button";
import {
  Calendar,
  MapPin,
  X,
  Phone,
  Loader2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  RefreshCw,
  Play,
  Clock,
  ListChecks,
  AlertTriangle,
  User,
  Mail,
  Palmtree,
} from "lucide-react";
import { Dialog, DialogContent } from "@mui/material";
import {
  effectiveProviderTaskStatus,
  getBookingTypeBadge,
  getServiceTitle,
  getStatusBadge,
} from "../Common/Booking/BookingUtils";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Booking, BookingHistoryResponse } from "./Dashboard";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import dayjs, { Dayjs } from "dayjs";
import PaymentInstance from "src/services/paymentInstance";
import { useToast } from "../hooks/use-toast";
import axios from "axios";
import { OtpVerificationDialog } from "./OtpVerificationDialog";
import {
  coalesceEndEpoch,
  coalesceStartEpoch,
  epochToDisplayDate,
  epochToDisplayTime,
} from "src/services/bookingEpoch";
import type { EngagementEpochFields } from "src/services/epochContract";
import { sortProviderEngagementsByServiceDate } from "src/utils/sortProviderEngagements";

interface AllBookingsDialogProps {
  bookings: BookingHistoryResponse | null;
  serviceProviderId: number | null;
  trigger: React.ReactNode;
}

type TabKey = "ongoing" | "future" | "past";

type ProviderEngagementApi = Partial<EngagementEpochFields> & {
  id?: number | string;
  engagement_id?: number | string;
  serviceproviderid?: number | string;
  serviceProviderId?: number | string;
  customerid?: number | string;
  customerId?: number | string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  startTime?: string;
  endTime?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  customer_email?: string;
  base_amount?: number | string;
  monthlyAmount?: number | string;
  responsibilities?: Booking["responsibilities"] | Record<string, unknown>;
  booking_type?: string;
  bookingType?: string;
  service_type?: string;
  serviceType?: string;
  created_at?: string;
  bookingDate?: string;
  address?: string | null;
  task_status?: string;
  taskStatus?: string;
  mobileno?: string;
  duration_minutes?: number | null;
  assignment_status?: string;
  engagement_status?: string;
  vacation_start_date?: string | null;
  vacation_end_date?: string | null;
  leave_days?: number | null;
  today_service?: {
    service_day_id?: string | number | null;
    status?: string | null;
    can_start?: boolean;
    can_complete?: boolean;
    otp_active?: boolean;
  };
};

type TaskBookingData = {
  today_service?: ProviderEngagementApi["today_service"];
  firstname?: string;
  customerName?: string;
  service_type?: string;
  serviceType?: string;
  engagement_id?: string | number;
  id?: string | number;
};

type CurrentBookingState = {
  bookingId: string;
  bookingData: TaskBookingData;
} | null;

const TAB_CONFIG: { key: TabKey; label: string; emptyTitle: string; emptyHint: string }[] = [
  {
    key: "ongoing",
    label: "Current",
    emptyTitle: "No active bookings this month",
    emptyHint: "Engagements in progress or scheduled for this month appear here.",
  },
  {
    key: "future",
    label: "Upcoming",
    emptyTitle: "No upcoming bookings this month",
    emptyHint: "Future engagements starting in the selected month will show here.",
  },
  {
    key: "past",
    label: "Past",
    emptyTitle: "No past bookings this month",
    emptyHint: "Completed or ended engagements from this month appear here.",
  },
];

const formatTimeToAMPM = (timeString: string): string => {
  if (!timeString) return "";
  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${period}`;
  } catch {
    return timeString;
  }
};

const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTimeToAMPM(startTime)} – ${formatTimeToAMPM(endTime)}`;
};

const formatDateLabel = (ymd?: string | null): string => {
  if (!ymd) return "—";
  const d = dayjs(ymd);
  return d.isValid() ? d.format("ddd, D MMM YYYY") : String(ymd);
};

const formatDuration = (minutes?: number | null): string | null => {
  if (minutes == null || !Number.isFinite(Number(minutes)) || Number(minutes) <= 0) {
    return null;
  }
  const m = Number(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
};

function formatResponsibilityLines(
  responsibilities?: Booking["responsibilities"] | Record<string, unknown>
): string[] {
  const raw = responsibilities as Booking["responsibilities"] | undefined;
  const tasks = raw?.tasks ?? [];
  const addOns = raw?.add_ons ?? [];
  const lines: string[] = [];

  for (const task of tasks) {
    const type = String((task as { taskType?: string }).taskType || "Task");
    const persons = (task as { persons?: number }).persons;
    const mealType = (task as { mealType?: string }).mealType;
    const childAge = (task as { childAge?: string | number }).childAge;
    const extras = [
      persons != null ? `${persons} person${persons !== 1 ? "s" : ""}` : null,
      mealType ? `meal: ${mealType}` : null,
      childAge != null && childAge !== "" ? `child age: ${childAge}` : null,
    ].filter(Boolean);
    lines.push(extras.length ? `${type} (${extras.join(", ")})` : type);
  }

  for (const addOn of addOns) {
    const type = String((addOn as { taskType?: string }).taskType || "Add-on");
    lines.push(type);
  }

  return lines;
}

function toDisplayName(name: string): string {
  return String(name || "Customer")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function DetailsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="px-4 py-3.5">
      <h4 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white ring-1 ring-slate-200/80">
          <Icon className="h-3.5 w-3.5 text-sky-600" aria-hidden />
        </span>
        {title}
      </h4>
      {children}
    </section>
  );
}

function DetailRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div className={`flex items-start justify-between gap-3 py-1.5 ${className}`}>
      <span className="shrink-0 text-xs text-slate-500">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium text-slate-900 break-words">{value}</span>
    </div>
  );
}

/** Legacy helper kept for hot-reload safety — used by BookingDetailsPanel via DetailRow */
function DetailCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800 break-words">{value}</p>
    </div>
  );
}

type BookingDetailsPanelProps = {
  booking: Booking;
  api: ProviderEngagementApi;
  tab: TabKey;
  customerEmail: string;
  vacationLabel: string | null;
  todayVisitStatus: string | null;
  address?: string;
  responsibilityLines: string[];
  onCall: (phone: string, name: string) => void;
  onTrack: (address: string) => void;
};

function BookingDetailsPanel({
  booking,
  api,
  tab,
  customerEmail,
  vacationLabel,
  todayVisitStatus,
  address,
  responsibilityLines,
  onCall,
  onTrack,
}: BookingDetailsPanelProps) {
  const initial = toDisplayName(booking.clientName).charAt(0) || "C";
  const bookedOn = formatDateLabel(booking.bookingDate);

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.02]">
      <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2">
        <p className="text-xs font-medium text-slate-600">Booking overview</p>
      </div>

      <div className="divide-y divide-slate-100">
        <DetailsSection title="Customer" icon={User}>
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-base font-semibold text-sky-800 ring-2 ring-white"
              aria-hidden
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold text-slate-900">{toDisplayName(booking.clientName)}</p>
              <div className="flex flex-wrap gap-2">
                {api.mobileno ? (
                  <button
                    type="button"
                    onClick={() => onCall(String(api.mobileno), booking.clientName)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-sky-800 ring-1 ring-slate-200 transition-colors hover:bg-sky-50"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    {String(api.mobileno)}
                  </button>
                ) : null}
                {customerEmail ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                    <span className="truncate">{customerEmail}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </DetailsSection>

        {(tab === "ongoing" && todayVisitStatus) || vacationLabel ? (
          <DetailsSection title="Visit status" icon={Clock}>
            {tab === "ongoing" && todayVisitStatus ? (
              <div className="flex items-center justify-between rounded-lg bg-sky-50/70 px-3 py-2 ring-1 ring-sky-100">
                <span className="text-xs text-slate-600">Today&apos;s visit</span>
                <span className="text-sm font-semibold capitalize text-sky-900">{todayVisitStatus}</span>
              </div>
            ) : null}
            {vacationLabel ? (
              <div
                className={`flex items-start gap-2 rounded-lg bg-violet-50/70 px-3 py-2 ring-1 ring-violet-100 ${tab === "ongoing" && todayVisitStatus ? "mt-2" : ""}`}
              >
                <Palmtree className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
                <div>
                  <p className="text-xs font-medium text-violet-900">Customer vacation</p>
                  <p className="mt-0.5 text-sm text-violet-800">{vacationLabel}</p>
                </div>
              </div>
            ) : null}
          </DetailsSection>
        ) : null}

        {address ? (
          <DetailsSection title="Service location" icon={MapPin}>
            <p className="text-sm leading-relaxed text-slate-800">{address}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2.5 h-8 gap-1.5 text-xs"
              onClick={() => onTrack(address)}
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Open in Maps
            </Button>
          </DetailsSection>
        ) : null}

        {responsibilityLines.length > 0 ? (
          <DetailsSection title="Service scope" icon={ListChecks}>
            <ul className="flex flex-wrap gap-1.5">
              {responsibilityLines.map((line, i) => (
                <li
                  key={i}
                  className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900 ring-1 ring-sky-100"
                >
                  {line}
                </li>
              ))}
            </ul>
          </DetailsSection>
        ) : null}

        <DetailsSection title="Booking info" icon={Calendar}>
          <div className="rounded-lg bg-slate-50/80 px-3 py-1 ring-1 ring-slate-100">
            <DetailRow label="Booked on" value={bookedOn !== "—" ? bookedOn : null} />
            <DetailRow
              label="Assignment"
              value={
                api.assignment_status ? (
                  <span className="capitalize">{String(api.assignment_status).toLowerCase()}</span>
                ) : null
              }
            />
            <DetailRow label="Booking ID" value={`#${booking.id}`} />
          </div>
        </DetailsSection>
      </div>
    </div>
  );
}

function mapApiBookingToBooking(apiBooking: ProviderEngagementApi): Booking {
  let date: string;
  let timeRange: string;
  const startEpoch = coalesceStartEpoch(
    apiBooking.start_epoch,
    apiBooking.startDate || apiBooking.start_date
  );
  const endEpoch = coalesceEndEpoch(
    apiBooking.end_epoch,
    apiBooking.endDate || apiBooking.end_date
  );

  if (startEpoch != null) {
    date = epochToDisplayDate(startEpoch) ?? "—";
    const startLabel = epochToDisplayTime(startEpoch);
    const endLabel = epochToDisplayTime(endEpoch);
    timeRange =
      startLabel && endLabel ? `${startLabel} – ${endLabel}` : startLabel ?? "Time TBD";
  } else {
    const startDateRaw = apiBooking.startDate || apiBooking.start_date || "";
    timeRange = formatTimeRange(apiBooking.startTime || "", apiBooking.endTime || "");
    date = startDateRaw ? dayjs(startDateRaw).format("ddd, D MMM YYYY") : "—";
  }

  const clientName =
    apiBooking.firstname && apiBooking.lastname
      ? `${apiBooking.firstname} ${apiBooking.lastname}`.trim()
      : apiBooking.firstname || apiBooking.email || "Customer";

  const amount = apiBooking.base_amount
    ? `₹${parseFloat(String(apiBooking.base_amount)).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`
    : "—";

  const responsibilities = (apiBooking.responsibilities as Booking["responsibilities"]) || {};

  return {
    id: Number(apiBooking.engagement_id || apiBooking.id || 0),
    serviceProviderId: Number(apiBooking.serviceproviderid || apiBooking.serviceProviderId || 0),
    customerId: Number(apiBooking.customerid || apiBooking.customerId || 0),
    start_date: apiBooking.start_date || apiBooking.startDate || "",
    endDate: apiBooking.end_date || apiBooking.endDate || "",
    engagements: "",
    timeslot: timeRange || "",
    monthlyAmount: Number(apiBooking.base_amount || apiBooking.monthlyAmount || 0),
    paymentMode: "",
    booking_type: apiBooking.booking_type || apiBooking.bookingType || "",
    service_type: apiBooking.service_type || apiBooking.serviceType || "",
    bookingDate: apiBooking.created_at || apiBooking.bookingDate || "",
    responsibilities,
    housekeepingRole: null,
    mealType: null,
    noOfPersons: responsibilities.tasks?.[0]?.persons || null,
    experience: null,
    childAge: null,
    customerName: clientName,
    serviceProviderName: "",
    address: apiBooking.address || "",
    taskStatus: apiBooking.task_status || apiBooking.taskStatus || "",
    modifiedBy: "",
    modifiedDate: "",
    availableTimeSlots: null,
    customerHolidays: [],
    serviceProviderLeaves: [],
    active: true,
    clientName,
    service: apiBooking.service_type || apiBooking.serviceType || "",
    date,
    time: timeRange || "",
    location: apiBooking.address || "",
    status: apiBooking.task_status || apiBooking.taskStatus || "",
    amount,
    bookingData: {
      ...apiBooking,
      mobileno: apiBooking.mobileno || "",
      email: apiBooking.email || apiBooking.customer_email || "",
      address: apiBooking.address || "",
      duration_minutes: apiBooking.duration_minutes ?? null,
      assignment_status: apiBooking.assignment_status,
      engagement_status: apiBooking.engagement_status,
      vacation_start_date: apiBooking.vacation_start_date,
      vacation_end_date: apiBooking.vacation_end_date,
      leave_days: apiBooking.leave_days,
      today_service: apiBooking.today_service,
    },
  };
}

type BookingRowProps = {
  booking: Booking;
  tab: TabKey;
  taskStatus: Record<string, "IN_PROGRESS" | "COMPLETED" | undefined>;
  taskStatusUpdating: Record<string, boolean>;
  onCall: (phone: string, name: string) => void;
  onTrack: (address: string) => void;
  onStart: (bookingId: string, data: TaskBookingData) => void;
  onComplete: (bookingId: string, data: TaskBookingData) => void;
};

function BookingRow({
  booking,
  tab,
  taskStatus,
  taskStatusUpdating,
  onCall,
  onTrack,
  onStart,
  onComplete,
}: BookingRowProps) {
  const [expanded, setExpanded] = useState(false);
  const bookingKey = booking.id.toString();
  const api = booking.bookingData as ProviderEngagementApi;
  const todayServiceStatus = booking.bookingData?.today_service?.status;
  const displayStatus = effectiveProviderTaskStatus(
    booking.taskStatus,
    todayServiceStatus,
    taskStatus[bookingKey]
  );
  const taskStatusOriginal = displayStatus.toUpperCase();

  const isInProgress =
    todayServiceStatus === "IN_PROGRESS" ||
    taskStatus[bookingKey] === "IN_PROGRESS" ||
    taskStatusOriginal === "IN_PROGRESS" ||
    taskStatusOriginal === "STARTED";

  const isCompleted =
    todayServiceStatus === "COMPLETED" || taskStatusOriginal === "COMPLETED";

  const isNotStarted =
    todayServiceStatus === "SCHEDULED" || taskStatusOriginal === "NOT_STARTED";

  const canStart = booking.bookingData?.today_service?.can_start === true;
  const showActions = tab === "ongoing";
  const showStartButton = showActions && isNotStarted && canStart;
  const showCompleteButton = showActions && isInProgress;
  const showCompletedButton = showActions && isCompleted;
  const address = booking.location?.trim();
  const bookingType = String(booking.booking_type || "").toUpperCase();
  const isRecurring = bookingType === "MONTHLY" || bookingType === "SHORT_TERM";
  const startDateLabel = formatDateLabel(booking.start_date);
  const endDateLabel = formatDateLabel(booking.endDate);
  const dateRangeLabel =
    isRecurring && booking.endDate && booking.endDate !== booking.start_date
      ? `${startDateLabel} – ${endDateLabel}`
      : startDateLabel;
  const durationLabel = formatDuration(api.duration_minutes);
  const responsibilityLines = formatResponsibilityLines(booking.responsibilities);
  const customerEmail = api.email || api.customer_email || "";
  const vacationLabel =
    api.vacation_start_date && api.vacation_end_date
      ? `${formatDateLabel(api.vacation_start_date)} – ${formatDateLabel(api.vacation_end_date)}`
      : null;
  const todayVisitStatus = api.today_service?.status
    ? String(api.today_service.status).replace(/_/g, " ")
    : null;
  const slotStartEpoch = coalesceStartEpoch(api.start_epoch, api.startDate || api.start_date);
  const isOverdue =
    tab === "ongoing" &&
    slotStartEpoch != null &&
    dayjs().unix() >= slotStartEpoch &&
    !isInProgress &&
    !isCompleted &&
    (todayServiceStatus === "SCHEDULED" || taskStatusOriginal === "NOT_STARTED");

  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:border-slate-300/90 hover:shadow-md">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-500">Booking #{booking.id}</p>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {getBookingTypeBadge(booking.booking_type)}
            {getStatusBadge(displayStatus)}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
              {toDisplayName(booking.clientName)}
            </h3>
            <p className="mt-0.5 text-sm text-slate-600">{getServiceTitle(booking.service)}</p>
          </div>
          {booking.amount !== "—" ? (
            <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-emerald-800 ring-1 ring-emerald-100">
              {booking.amount}
            </span>
          ) : null}
        </div>

        <div className="mt-3 grid gap-2 rounded-lg bg-slate-50/90 px-3 py-2.5 text-sm text-slate-700 sm:grid-cols-2">
          <div className="flex items-start gap-2 min-w-0 sm:col-span-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            <span className="leading-snug">{dateRangeLabel}</span>
          </div>
          {booking.time ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
              <span>
                {booking.time}
                {durationLabel ? (
                  <span className="ml-1 text-slate-500">({durationLabel})</span>
                ) : null}
              </span>
            </div>
          ) : null}
          {address && !expanded ? (
            <div className="flex items-start gap-2 min-w-0 sm:col-span-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
              <span className="line-clamp-1 text-slate-600">{address}</span>
            </div>
          ) : null}
        </div>

        {isOverdue ? (
          <p className="mt-2 flex items-start gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-900">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Scheduled start time has passed — please start the visit.
          </p>
        ) : null}

        {expanded ? (
          <BookingDetailsPanel
            booking={booking}
            api={api}
            tab={tab}
            customerEmail={customerEmail}
            vacationLabel={vacationLabel}
            todayVisitStatus={todayVisitStatus}
            address={address}
            responsibilityLines={responsibilityLines}
            onCall={onCall}
            onTrack={onTrack}
          />
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {booking.bookingData?.mobileno ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg border-slate-200 text-xs"
                onClick={() => onCall(String(booking.bookingData.mobileno), booking.clientName)}
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </Button>
            ) : null}
            {address ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg border-slate-200 text-xs"
                onClick={() => onTrack(address)}
              >
                <MapPin className="h-3.5 w-3.5" />
                Directions
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs text-sky-700 hover:bg-sky-50"
              onClick={() => setExpanded((v) => !v)}
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                aria-hidden
              />
              {expanded ? "Less" : "More details"}
            </Button>

            {showActions ? (
              taskStatusUpdating[bookingKey] ? (
                <Button type="button" variant="ghost" size="sm" disabled className="h-8">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </Button>
              ) : showCompleteButton ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="ml-auto h-8 text-xs"
                  onClick={() => onComplete(bookingKey, booking.bookingData)}
                >
                  Complete visit
                </Button>
              ) : showCompletedButton ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="ml-auto h-8 gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-800"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Completed
                </Button>
              ) : showStartButton ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-auto h-8 gap-1 border-sky-200 bg-sky-50 text-xs text-sky-900 hover:bg-sky-100"
                  onClick={() => onStart(bookingKey, booking.bookingData)}
                >
                  <Play className="h-3.5 w-3.5" />
                  Start visit
                </Button>
              ) : tab === "ongoing" && !isCompleted ? (
                <span className="ml-auto text-xs text-slate-500">Not ready to start yet</span>
              ) : null
            ) : null}
        </div>
      </div>
    </article>
  );
}

export function AllBookingsDialog({
  serviceProviderId,
  trigger,
}: AllBookingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("ongoing");
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(() => dayjs().startOf("month"));
  const [monthResponse, setMonthResponse] = useState<BookingHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const [taskStatus, setTaskStatus] = useState<
    Record<string, "IN_PROGRESS" | "COMPLETED" | undefined>
  >({});
  const [taskStatusUpdating, setTaskStatusUpdating] = useState<Record<string, boolean>>({});
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<CurrentBookingState>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const tabCounts = useMemo(
    () => ({
      ongoing: monthResponse?.current?.length ?? 0,
      future: monthResponse?.upcoming?.length ?? 0,
      past: monthResponse?.past?.length ?? 0,
    }),
    [monthResponse]
  );

  const rawTabData = useMemo((): Booking[] => {
    if (!monthResponse) return [];
    let rows: ProviderEngagementApi[] = [];
    if (tab === "ongoing") rows = (monthResponse.current || []) as ProviderEngagementApi[];
    else if (tab === "future") rows = (monthResponse.upcoming || []) as ProviderEngagementApi[];
    else rows = (monthResponse.past || []) as ProviderEngagementApi[];
    return sortProviderEngagementsByServiceDate(rows, tab).map(mapApiBookingToBooking);
  }, [monthResponse, tab]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rawTabData;
    return rawTabData.filter((b) => {
      const api = b.bookingData as ProviderEngagementApi;
      const hay = [
        b.clientName,
        b.id,
        b.service,
        b.booking_type,
        b.location,
        b.taskStatus,
        api.mobileno,
        api.email,
        api.customer_email,
        api.assignment_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rawTabData, searchQuery]);

  const fetchMonth = useCallback(async () => {
    if (!serviceProviderId || !selectedMonth) return;
    setLoading(true);
    try {
      const formattedMonth = selectedMonth.format("YYYY-MM");
      const res = await PaymentInstance.get(
        `/api/service-providers/${serviceProviderId}/engagements?month=${formattedMonth}`
      );
      setMonthResponse(res.data as BookingHistoryResponse);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setMonthResponse({ current: [], upcoming: [], past: [] });
      toast({
        title: "Could not load bookings",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [serviceProviderId, selectedMonth, toast]);

  const handleCallCustomer = (phoneNumber: string, clientName: string) => {
    if (!phoneNumber) {
      toast({
        title: "No phone number",
        description: "Customer contact is not available for this booking.",
        variant: "destructive",
      });
      return;
    }
    window.open(`tel:${phoneNumber}`, "_self");
    toast({ title: "Calling customer", description: `${clientName} · ${phoneNumber}` });
  };

  const handleTrackAddress = (address: string) => {
    if (!address) {
      toast({
        title: "No address",
        description: "Address is not available for this booking.",
        variant: "destructive",
      });
      return;
    }
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      "_blank"
    );
  };

  const handleStartTask = async (bookingId: string, bookingData: TaskBookingData) => {
    const serviceDayId = bookingData.today_service?.service_day_id;
    if (!serviceDayId) {
      toast({
        title: "Cannot start yet",
        description: "No service day is scheduled for today on this booking.",
        variant: "destructive",
      });
      return;
    }

    const previousStatus = taskStatus[bookingId];
    setTaskStatus((prev) => ({ ...prev, [bookingId]: "IN_PROGRESS" }));
    setTaskStatusUpdating((prev) => ({ ...prev, [bookingId]: true }));

    try {
      await PaymentInstance.post(
        `api/engagement-service/service-days/${serviceDayId}/start`,
        {},
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );
      toast({ title: "Visit started", description: "Mark complete when the service is done." });
      await fetchMonth();
    } catch (err) {
      setTaskStatus((prev) => ({ ...prev, [bookingId]: previousStatus }));
      let errorMessage = "Failed to start service";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setTaskStatusUpdating((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleStopTask = (bookingId: string, bookingData: TaskBookingData) => {
    setCurrentBooking({ bookingId, bookingData });
    setOtpDialogOpen(true);
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!currentBooking) return;
    const serviceDayId = currentBooking.bookingData.today_service?.service_day_id;
    if (!serviceDayId) {
      toast({ title: "Error", description: "Service day ID not found", variant: "destructive" });
      return;
    }

    setVerifyingOtp(true);
    try {
      await PaymentInstance.post(
        `api/engagement-service/service-days/${serviceDayId}/complete`,
        { otp },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );
      toast({
        title: "Visit completed",
        description: "Earnings will reflect in your wallet shortly.",
      });
      setTaskStatus((prev) => ({ ...prev, [currentBooking.bookingId]: "COMPLETED" }));
      await fetchMonth();
    } catch (err) {
      let errorMessage = "Failed to complete service";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    } finally {
      setVerifyingOtp(false);
      setOtpDialogOpen(false);
    }
  };

  const shiftMonth = (delta: number) => {
    setSelectedMonth((m) => {
      const next = m.add(delta, "month").startOf("month");
      const currentMonth = dayjs().startOf("month");
      if (tab === "future" && next.isBefore(currentMonth, "month")) return currentMonth;
      if (tab === "past" && next.isAfter(currentMonth, "month")) return currentMonth;
      return next;
    });
  };

  const activeTabMeta = TAB_CONFIG.find((t) => t.key === tab)!;

  useEffect(() => {
    if (!open) return;
    setSearchQuery("");
    setTab("ongoing");
    setSelectedMonth(dayjs().startOf("month"));
    setMonthResponse(null);
  }, [open]);

  useEffect(() => {
    if (!open || !selectedMonth) return;
    void fetchMonth();
  }, [open, selectedMonth, fetchMonth]);

  return (
    <>
      <div role="presentation" onClick={() => setOpen(true)}>
        {trigger}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxHeight: "92vh",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          },
        }}
      >
        {/* Header */}
        <div className="border-b border-slate-200/90 bg-gradient-to-r from-slate-50 to-sky-50/80 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">All bookings</h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Browse, search, and manage your engagements by month.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {TAB_CONFIG.map(({ key, label }) => {
              const count = tabCounts[key];
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-sky-600 text-white shadow-sm shadow-sky-600/25"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  {label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                      active ? "bg-white/20 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200/80"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: month + search */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 rounded-lg p-0"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                views={["month", "year"]}
                openTo="month"
                value={selectedMonth}
                onChange={(d) => d && setSelectedMonth(d.startOf("month"))}
                shouldDisableMonth={(date) => {
                  const currentMonth = dayjs().startOf("month");
                  const targetMonth = date.startOf("month");
                  if (tab === "future") return targetMonth.isBefore(currentMonth, "month");
                  if (tab === "past") return targetMonth.isAfter(currentMonth, "month");
                  return false;
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    variant: "outlined",
                    sx: {
                      width: 168,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: "white",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 rounded-lg p-0"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 rounded-lg p-0 text-slate-600"
              onClick={() => void fetchMonth()}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ID, service…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        <DialogContent className="!p-0">
          <div className="max-h-[min(58vh,520px)] overflow-y-auto px-4 py-4 sm:px-6">
            {loading && !monthResponse ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4">
                    <SkeletonLoader height={20} width="45%" className="mb-2" />
                    <SkeletonLoader height={14} width="70%" className="mb-3" />
                    <SkeletonLoader height={32} width="100%" />
                  </div>
                ))}
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <Calendar className="h-7 w-7" />
                </div>
                <p className="text-base font-semibold text-slate-800">
                  {searchQuery.trim()
                    ? "No bookings match your search"
                    : activeTabMeta.emptyTitle}
                </p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {searchQuery.trim()
                    ? "Try a different name, booking ID, or service type."
                    : `${activeTabMeta.emptyHint} (${selectedMonth.format("MMMM YYYY")})`}
                </p>
              </div>
            ) : (
              <>
                <p className="mb-3 text-xs font-medium text-slate-500">
                  {filteredData.length} booking{filteredData.length !== 1 ? "s" : ""}
                  {searchQuery.trim() ? ` matching “${searchQuery.trim()}”` : ""}
                  {" · "}
                  {selectedMonth.format("MMMM YYYY")}
                </p>
                <div className="space-y-3">
                  {filteredData.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      tab={tab}
                      taskStatus={taskStatus}
                      taskStatusUpdating={taskStatusUpdating}
                      onCall={handleCallCustomer}
                      onTrack={handleTrackAddress}
                      onStart={handleStartTask}
                      onComplete={handleStopTask}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>

        {/* Footer hint for current tab actions */}
        {tab === "ongoing" && filteredData.length > 0 ? (
          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-center text-xs text-slate-500 sm:px-6">
            Start and complete visits from the <strong className="font-medium text-slate-700">Current</strong>{" "}
            tab when today&apos;s service day is ready.
          </div>
        ) : null}
      </Dialog>

      <OtpVerificationDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        onVerify={handleVerifyOtp}
        verifying={verifyingOtp}
        bookingInfo={
          currentBooking
            ? {
                clientName:
                  currentBooking.bookingData?.firstname ||
                  currentBooking.bookingData?.customerName,
                service: getServiceTitle(
                  String(
                    currentBooking.bookingData?.service_type ||
                      currentBooking.bookingData?.serviceType ||
                      ""
                  )
                ),
                bookingId:
                  currentBooking.bookingData?.engagement_id ||
                  currentBooking.bookingData?.id,
              }
            : undefined
        }
      />
    </>
  );
}
