/* eslint-disable */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Timer,
} from "lucide-react";
import DribbbleDateTimePicker from "../Common/DribbbleDateTimePicker";
import { useLanguage } from "src/context/LanguageContext";
import { getBookingTypeFromPreference } from "src/utils/maidPricingUtils";
import { isBookingScheduleComplete } from "src/components/ProviderDetails/serviceBookingConfig";
import { buildReduxBookingPatch } from "src/utils/bookingSchedulePatch";
import { checkSelectedProviderAvailability } from "src/services/providerScheduleAvailability";
import { computeDurationHours } from "src/components/ProviderDetails/serviceBookingConfig";
import { formatDateOnly, parseCalendarDateYmd } from "src/utils/maidPricingUtils";
import { cn } from "../utils";
import {
  MaidDurationChip,
  MaidDurationChips,
  MaidPickerPanel,
} from "../ProviderDetails/MaidServiceDialog.styles";


dayjs.extend(customParseFormat);

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6];

const QUICK_TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 6; h <= 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 19 && m > 0) continue;
      const hour12 = h % 12 || 12;
      const minute = m === 0 ? "00" : m;
      const ampm = h < 12 ? "AM" : "PM";
      slots.push(`${hour12}:${minute} ${ampm}`);
    }
  }
  return slots;
})();

const WORK_DAY_START = { hour: 6, minute: 0 };
const WORK_DAY_END = { hour: 20, minute: 0 };
const LATEST_START = { hour: 19, minute: 0 };

const WIZARD_STEPS = [
  { id: "schedule" as const, label: "Schedule", icon: CalendarDays },
  { id: "review" as const, label: "Review", icon: CheckCircle2 },
];

export type ModifyWizardStep = (typeof WIZARD_STEPS)[number]["id"];

function workDayStart(day: Dayjs): Dayjs {
  return day.hour(WORK_DAY_START.hour).minute(WORK_DAY_START.minute).second(0).millisecond(0);
}

function latestStartTime(day: Dayjs): Dayjs {
  return day.hour(LATEST_START.hour).minute(LATEST_START.minute).second(0).millisecond(0);
}

function isStartWithinWorkHours(time: Dayjs): boolean {
  return !time.isBefore(workDayStart(time)) && !time.isAfter(latestStartTime(time));
}

function timeMinutesOnDay(time: Dayjs): number {
  return time.hour() * 60 + time.minute();
}

const WORK_END_MINUTES = WORK_DAY_END.hour * 60 + WORK_DAY_END.minute;

function isDurationWithinWorkHours(start: Dayjs, hours: number): boolean {
  return timeMinutesOnDay(start) + hours * 60 <= WORK_END_MINUTES;
}

function maxAllowedDurationHours(start: Dayjs): number {
  let max = 0;
  for (const h of DURATION_OPTIONS) {
    if (isDurationWithinWorkHours(start, h)) max = h;
  }
  return max;
}

function durationHoursFromTimes(start: Dayjs | null, end: Dayjs | null): number {
  if (!start || !end) return 0;
  const mins = end.diff(start, "minute");
  if (mins <= 0) return 0;
  return Math.max(1, Math.min(6, Math.round(mins / 60)));
}

function parseTimeOnDate(dateStr: string | undefined, timeStr: string | undefined): Dayjs | null {
  if (!dateStr || !timeStr) return null;
  const base = parseCalendarDateYmd(dateStr);
  if (!base) return null;
  const normalized = String(timeStr).trim();
  const parsed = dayjs(normalized, ["HH:mm:ss", "HH:mm", "h:mm A", "hh:mm A"], true);
  if (parsed.isValid()) {
    return base.hour(parsed.hour()).minute(parsed.minute()).second(0).millisecond(0);
  }
  const [h, m] = normalized.split(":").map(Number);
  if (!Number.isFinite(h)) return null;
  return base.hour(h).minute(Number.isFinite(m) ? m : 0);
}

function bookingPreferenceFromType(bookingType: string): string {
  const code = String(bookingType || "").toUpperCase();
  if (code === "SHORT_TERM") return "Short term";
  return "Monthly";
}

function stepIndex(step: ModifyWizardStep): number {
  return WIZARD_STEPS.findIndex((s) => s.id === step);
}

export type ModifyScheduleSnapshot = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export type ModifyWizardState = {
  step: ModifyWizardStep;
  canGoNext: boolean;
  canGoBack: boolean;
  canSubmit: boolean;
};

export type ModifyBookingScheduleSectionProps = {
  bookingType: string;
  serviceType: string;
  engagementId: number;
  providerId?: number | null;
  customerId?: number | null;
  bookingCoords?: { lat: number; lng: number } | null;
  initialStartDate?: string;
  initialEndDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  onAvailabilityVerifiedChange?: (verified: boolean, message?: string) => void;
  onScheduleChange?: () => void;
  onWizardStateChange?: (state: ModifyWizardState) => void;
  availabilityVerified?: boolean;
  isCheckingAvailability?: boolean;
};

function WizardProgress({ activeStep }: { activeStep: ModifyWizardStep }) {
  const activeIdx = stepIndex(activeStep);

  return (
    <div className="mb-1.5 flex justify-center">
      <div className="inline-flex items-start">
        {WIZARD_STEPS.map((step, idx) => {
          const done = idx < activeIdx;
          const active = idx === activeIdx;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className="flex w-[52px] flex-col items-center gap-0.5">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    active && !done && "border-sky-600 bg-sky-600 text-white",
                    !done && !active && "border-slate-200 bg-white text-slate-400"
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                  ) : (
                    <Icon className="h-3 w-3" aria-hidden />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[8px] font-bold uppercase tracking-wide",
                    active ? "text-sky-700" : done ? "text-emerald-700" : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < WIZARD_STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mx-0.5 mt-3 h-0.5 w-5 shrink-0 rounded-full",
                    idx < activeIdx ? "bg-emerald-400" : "bg-slate-200"
                  )}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const ModifyBookingScheduleSection = forwardRef<
  ModifyBookingScheduleHandle,
  ModifyBookingScheduleSectionProps
>(({
  bookingType,
  serviceType,
  engagementId,
  providerId,
  customerId,
  bookingCoords,
  initialStartDate,
  initialEndDate,
  initialStartTime,
  initialEndTime,
  onAvailabilityVerifiedChange,
  onScheduleChange,
  onWizardStateChange,
  availabilityVerified = false,
  isCheckingAvailability = false,
}, ref) => {
  const { t } = useLanguage();
  const preference = bookingPreferenceFromType(bookingType);
  const today = dayjs();
  const maxDate90Days = today.add(89, "day");

  const [activeStep, setActiveStep] = useState<ModifyWizardStep>("schedule");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedDurationHours, setSelectedDurationHours] = useState(1);
  const [showAllTimes, setShowAllTimes] = useState(false);
  const [showAvailabilityBanner, setShowAvailabilityBanner] = useState(false);
  const originalScheduleRef = useRef<{
    dateSummary: string;
    timeSummary: string;
    durationHours: number;
  } | null>(null);

  const onAvailabilityVerifiedChangeRef = useRef(onAvailabilityVerifiedChange);
  const onScheduleChangeRef = useRef(onScheduleChange);
  const onWizardStateChangeRef = useRef(onWizardStateChange);
  useEffect(() => {
    onAvailabilityVerifiedChangeRef.current = onAvailabilityVerifiedChange;
    onScheduleChangeRef.current = onScheduleChange;
    onWizardStateChangeRef.current = onWizardStateChange;
  }, [onAvailabilityVerifiedChange, onScheduleChange, onWizardStateChange]);

  useEffect(() => {
    if (!availabilityVerified) {
      setShowAvailabilityBanner(false);
      return;
    }
    setShowAvailabilityBanner(true);
    const timer = window.setTimeout(() => setShowAvailabilityBanner(false), 5000);
    return () => window.clearTimeout(timer);
  }, [availabilityVerified]);

  const bookingHydrationKey = useMemo(
    () =>
      [
        engagementId,
        bookingType,
        initialStartDate ?? "",
        initialEndDate ?? "",
        initialStartTime ?? "",
        initialEndTime ?? "",
      ].join("|"),
    [
      bookingType,
      engagementId,
      initialEndDate,
      initialEndTime,
      initialStartDate,
      initialStartTime,
    ]
  );

  useEffect(() => {
    const dateStr = formatDateOnly(initialStartDate) || dayjs().format("YYYY-MM-DD");
    const endStr = formatDateOnly(initialEndDate) || dateStr;
    const sd = parseCalendarDateYmd(dateStr) ?? dayjs().startOf("day");
    let ed = parseCalendarDateYmd(endStr) ?? sd;
    const st =
      parseTimeOnDate(dateStr, initialStartTime) ??
      parseTimeOnDate(dateStr, initialStartTime?.replace(/\s*(AM|PM)/i, "")) ??
      sd.hour(9).minute(0);
    const et =
      parseTimeOnDate(dateStr, initialEndTime) ??
      (st ? st.add(1, "hour") : null);

    if (preference === "Monthly") {
      ed = sd.add(1, "month");
    }

    setActiveStep("schedule");
    setStartDate(sd);
    setEndDate(ed);
    setStartTime(st);
    setEndTime(et);
    const dur = durationHoursFromTimes(st, et);
    setSelectedDurationHours(dur > 0 ? dur : 1);
    setValidationMsg(null);
    setShowAllTimes(false);
    onAvailabilityVerifiedChangeRef.current?.(false);

    const dateSummary =
      preference === "Short term" && sd && ed
        ? `${sd.format("MMM D")} – ${ed.format("MMM D")}`
        : sd.format("ddd, MMM D");
    const timeSummary =
      st && et && preference !== "Monthly"
        ? `${st.format("h:mm A")} – ${et.format("h:mm A")}`
        : st?.format("h:mm A") ?? "—";
    originalScheduleRef.current = {
      dateSummary,
      timeSummary,
      durationHours: dur > 0 ? dur : 1,
    };
  }, [bookingHydrationKey, initialEndDate, initialEndTime, initialStartDate, initialStartTime, preference]);

  const markScheduleTouched = useCallback(() => {
    onAvailabilityVerifiedChangeRef.current?.(false);
    onScheduleChangeRef.current?.();
  }, []);

  const localSchedulePatch = useMemo(
    () => buildReduxBookingPatch(preference, startDate, endDate, startTime, endTime, null),
    [preference, startDate, endDate, startTime, endTime]
  );

  const isLocalScheduleComplete = useMemo(() => {
    const bookingTypeCode = getBookingTypeFromPreference(preference);
    return isBookingScheduleComplete(
      localSchedulePatch as Record<string, unknown>,
      bookingTypeCode
    );
  }, [localSchedulePatch, preference]);

  const durationFromTimes = useMemo(
    () => durationHoursFromTimes(startTime, endTime),
    [startTime, endTime]
  );
  const durationHours =
    durationFromTimes > 0 ? durationFromTimes : selectedDurationHours;

  const datesComplete =
    preference === "Short term"
      ? Boolean(startDate && endDate)
      : Boolean(startDate);

  const validateSelection = (selected: Dayjs): boolean => {
    const now = dayjs();
    if (selected.isBefore(now.add(30, "minute"))) {
      setValidationMsg(t("timeMinuteRestriction"));
      return false;
    }
    if (!isStartWithinWorkHours(selected)) {
      setValidationMsg(t("timeHourRestriction"));
      return false;
    }
    if (preference === "Short term" && selected.isAfter(today.add(21, "day"))) {
      setValidationMsg(t("dateExceedRestriction"));
      return false;
    }
    if (preference === "Monthly" && selected.isAfter(maxDate90Days, "day")) {
      setValidationMsg(t("monthlyDateExceedRestriction"));
      return false;
    }
    return true;
  };

  const handleDateOnlyChange = (date: Date) => {
    markScheduleTouched();
    const day = dayjs(date).startOf("day");
    if (day.isBefore(today, "day")) {
      setValidationMsg(t("pastDateRestriction"));
      return;
    }
    const monthlyEnd = day.add(1, "month");
    setStartDate(day);
    setStartTime(null);
    setEndTime(null);
    setEndDate(preference === "Monthly" ? monthlyEnd : endDate);
    setValidationMsg(null);
  };

  const handleRangeDateOnlyChange = (payload: { startDate: Date; endDate?: Date }) => {
    markScheduleTouched();
    const start = dayjs(payload.startDate).startOf("day");
    if (start.isBefore(today, "day")) {
      setValidationMsg(t("pastDateRestriction"));
      return;
    }
    const end = payload.endDate ? dayjs(payload.endDate).startOf("day") : null;
    setStartDate(start);
    setEndDate(end);
    setStartTime(null);
    setEndTime(null);
    setValidationMsg(null);
  };

  const setDurationHours = (hours: number) => {
    markScheduleTouched();
    setSelectedDurationHours(hours);
    if (!startTime) return;
    const newEnd = startTime.add(hours, "hour");
    if (!isDurationWithinWorkHours(startTime, hours)) {
      setValidationMsg(t("timeHourRestriction"));
      return;
    }
    setEndTime(newEnd);
    setValidationMsg(null);
  };

  const applyQuickTime = (timeLabel: string) => {
    if (!startDate || (preference === "Short term" && !endDate)) return;
    const parsed = dayjs(timeLabel, "h:mm A");
    if (!parsed.isValid()) return;
    const baseDay = startDate.startOf("day");
    const nextStart = baseDay.hour(parsed.hour()).minute(parsed.minute()).second(0);
    if (!validateSelection(nextStart)) return;
    if (!isDurationWithinWorkHours(nextStart, durationHours)) {
      setValidationMsg(t("timeHourRestriction"));
      return;
    }
    markScheduleTouched();
    const nextEnd = nextStart.add(durationHours, "hour");
    setStartTime(nextStart);
    setEndTime(nextEnd);
    if (preference === "Short term") {
      setStartDate(nextStart);
    } else {
      setStartDate(baseDay);
      setEndDate(nextStart.add(1, "month"));
    }
    setValidationMsg(null);
  };

  const checkAvailability = useCallback(async (): Promise<boolean> => {
    if (!isLocalScheduleComplete) {
      setValidationMsg("Complete your schedule before continuing.");
      onAvailabilityVerifiedChangeRef.current?.(false);
      return false;
    }

    const resolvedProviderId = Number(providerId);
    if (!Number.isFinite(resolvedProviderId) || resolvedProviderId < 1) {
      setValidationMsg("No provider assigned to this booking.");
      onAvailabilityVerifiedChangeRef.current?.(false);
      return false;
    }

    if (!bookingCoords) {
      setValidationMsg(
        "Service location is required to check provider availability."
      );
      onAvailabilityVerifiedChangeRef.current?.(false);
      return false;
    }

    const bookingTypeCode = getBookingTypeFromPreference(preference);
    const startDateYmd = formatDateOnly(String(localSchedulePatch.startDate ?? ""));
    const endDateYmd =
      formatDateOnly(String(localSchedulePatch.endDate ?? "")) || startDateYmd;
    const startTimeStr = String(localSchedulePatch.startTime ?? "").trim();
    const endTimeStr = String(localSchedulePatch.endTime ?? "").trim();
    const durationHoursResolved = computeDurationHours(
      bookingTypeCode,
      startTimeStr,
      endTimeStr,
      startDateYmd,
      endDateYmd,
      String(localSchedulePatch.timeRange ?? "")
    );
    const durationMinutes =
      durationHoursResolved != null && durationHoursResolved > 0
        ? Math.round(durationHoursResolved * 60)
        : 60;

    setIsChecking(true);
    try {
      const role = String(serviceType || "maid").toUpperCase();
      const availability = await checkSelectedProviderAvailability({
        providerId: resolvedProviderId,
        latitude: bookingCoords.lat,
        longitude: bookingCoords.lng,
        role,
        startDate: startDateYmd,
        endDate: endDateYmd,
        preferredStartTime: startTimeStr,
        serviceDurationMinutes: durationMinutes,
        customerId,
        excludeEngagementId: engagementId,
      });

      if (!availability.available) {
        const message =
          availability.message ||
          "This provider is not available for your selected schedule.";
        setValidationMsg(message);
        onAvailabilityVerifiedChangeRef.current?.(false, message);
        return false;
      }

      setValidationMsg(null);
      onAvailabilityVerifiedChangeRef.current?.(true);
      return true;
    } catch {
      const message = "Could not verify provider availability. Please try again.";
      setValidationMsg(message);
      onAvailabilityVerifiedChangeRef.current?.(false, message);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [
    bookingCoords,
    customerId,
    engagementId,
    isLocalScheduleComplete,
    localSchedulePatch,
    preference,
    providerId,
    serviceType,
  ]);

  const getScheduleSnapshot = useCallback((): ModifyScheduleSnapshot | null => {
    if (!isLocalScheduleComplete) return null;
    return {
      startDate: formatDateOnly(String(localSchedulePatch.startDate ?? "")),
      endDate: formatDateOnly(String(localSchedulePatch.endDate ?? "")),
      startTime: String(localSchedulePatch.startTime ?? "").trim(),
      endTime: String(localSchedulePatch.endTime ?? "").trim(),
    };
  }, [isLocalScheduleComplete, localSchedulePatch]);

  const dateSummary = useMemo(() => {
    if (preference === "Short term" && startDate && endDate) {
      return `${startDate.format("MMM D")} – ${endDate.format("MMM D, YYYY")}`;
    }
    if (startDate) return startDate.format("ddd, MMM D, YYYY");
    return "—";
  }, [preference, startDate, endDate]);

  const timeSummary = useMemo(() => {
    if (!startTime) return "—";
    if (endTime && preference !== "Monthly") {
      return `${startTime.format("h:mm A")} – ${endTime.format("h:mm A")}`;
    }
    return startTime.format("h:mm A");
  }, [startTime, endTime, preference]);

  const scheduleChanged = useMemo(() => {
    const orig = originalScheduleRef.current;
    if (!orig) return false;
    const compactDateSummary =
      preference === "Short term" && startDate && endDate
        ? `${startDate.format("MMM D")} – ${endDate.format("MMM D")}`
        : startDate?.format("ddd, MMM D") ?? "—";
    return (
      orig.dateSummary !== compactDateSummary ||
      orig.timeSummary !== timeSummary ||
      orig.durationHours !== durationHours
    );
  }, [durationHours, endDate, preference, startDate, timeSummary]);

  const canGoNext = useMemo(() => {
    if (activeStep === "schedule") return datesComplete && Boolean(startTime);
    return false;
  }, [activeStep, datesComplete, startTime]);

  const canSubmit =
    activeStep === "review" && isLocalScheduleComplete && scheduleChanged;

  const goNext = useCallback((): boolean => {
    if (activeStep === "schedule") {
      if (!datesComplete) {
        setValidationMsg(
          preference === "Short term"
            ? "Select a start and end date to continue."
            : "Select a start date to continue."
        );
        return false;
      }
      if (!startTime) {
        setValidationMsg("Pick a daily start time below to continue.");
        return false;
      }
      setValidationMsg(null);
      setActiveStep("review");
      return true;
    }
    return false;
  }, [activeStep, datesComplete, preference, startTime]);

  const goBack = useCallback(() => {
    setValidationMsg(null);
    if (activeStep === "review") setActiveStep("schedule");
  }, [activeStep]);

  useEffect(() => {
    onWizardStateChangeRef.current?.({
      step: activeStep,
      canGoNext,
      canGoBack: activeStep !== "schedule",
      canSubmit,
    });
  }, [activeStep, canGoNext, canSubmit]);

  useImperativeHandle(
    ref,
    () => ({
      activeStep,
      canGoNext,
      canSubmit,
      goNext,
      goBack,
      checkAvailability,
      getScheduleSnapshot,
      isChecking,
      isLocalScheduleComplete,
    }),
    [
      activeStep,
      canGoNext,
      canSubmit,
      checkAvailability,
      getScheduleSnapshot,
      goBack,
      goNext,
      isChecking,
      isLocalScheduleComplete,
    ]
  );

  const selectedTimeLabel = startTime?.format("h:mm A") ?? null;

  const availableQuickTimes = useMemo(() => {
    if (!startDate) return [];
    const dayBase = startDate.startOf("day");
    const now = dayjs();
    const isToday = dayBase.isSame(now, "day");
    return QUICK_TIME_SLOTS.filter((slot) => {
      const parsed = dayjs(slot, "h:mm A");
      const candidate = dayBase
        .hour(parsed.hour())
        .minute(parsed.minute())
        .second(0);
      if (!isStartWithinWorkHours(candidate)) return false;
      if (!isDurationWithinWorkHours(candidate, durationHours)) return false;
      if (isToday && candidate.isBefore(now.add(30, "minute"))) return false;
      return true;
    });
  }, [startDate, durationHours]);

  const displayedTimes = showAllTimes
    ? availableQuickTimes
    : availableQuickTimes.length <= 15
      ? availableQuickTimes
      : availableQuickTimes.slice(0, 15);

  const maxDurationHours = startTime ? maxAllowedDurationHours(startTime) : 6;
  const planLabel = preference === "Short term" ? "Short-term" : "Monthly";
  const checking = isCheckingAvailability || isChecking;

  return (
    <div>
      <WizardProgress activeStep={activeStep} />

      {activeStep === "schedule" ? (
        <div className="w-full">
          <MaidPickerPanel $visible className="!mt-0 w-full">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {preference === "Short term" ? (
                <DribbbleDateTimePicker
                  compact
                  mode="range"
                  hideTimeSelection
                  minDate={today.startOf("day").toDate()}
                  value={{
                    startDate: startDate?.toDate(),
                    endDate: endDate?.toDate(),
                  }}
                  onDateChange={handleRangeDateOnlyChange}
                  onChange={() => undefined}
                  maxRangeDays={14}
                />
              ) : (
                <DribbbleDateTimePicker
                  compact
                  mode="single"
                  hideTimeSelection
                  value={startDate?.toDate()}
                  maxDate={maxDate90Days.toDate()}
                  onDateChange={handleDateOnlyChange}
                  onChange={() => undefined}
                />
              )}
            </LocalizationProvider>
          </MaidPickerPanel>

          <div className="mt-3 border-t border-slate-100 px-4 pt-3">
            {preference === "Short term" ? (
              <div className="mb-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5 text-sky-600" aria-hidden />
                  <span className="text-xs font-semibold text-slate-800">Hours per visit</span>
                </div>
                <MaidDurationChips>
                  {DURATION_OPTIONS.map((h) => {
                    const disabled =
                      !datesComplete || (Boolean(startTime) && h > maxDurationHours);
                    return (
                      <MaidDurationChip
                        key={h}
                        type="button"
                        $active={durationHours === h}
                        disabled={disabled}
                        onClick={() => setDurationHours(h)}
                      >
                        {h}h
                      </MaidDurationChip>
                    );
                  })}
                </MaidDurationChips>
              </div>
            ) : null}

            <div className="mb-2 flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-sky-600" aria-hidden />
              <span className="text-sm font-semibold text-slate-800">Daily start time</span>
            </div>
            <p className="mb-2 text-xs text-slate-500">
              Same time applies on each day in your range.
            </p>

            {!datesComplete ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
                Select your dates above to choose a start time.
              </p>
            ) : displayedTimes.length === 0 ? (
              <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
                No available time slots for this date. Try a different date or duration.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {displayedTimes.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => applyQuickTime(slot)}
                      className={cn(
                        "rounded-lg border px-1.5 py-2 text-center text-xs font-semibold transition-colors",
                        selectedTimeLabel === slot
                          ? "border-sky-600 bg-sky-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                {availableQuickTimes.length > 9 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllTimes((v) => !v)}
                    className="mt-2 w-full text-center text-xs font-semibold text-sky-700 hover:underline"
                  >
                    {showAllTimes
                      ? "Show fewer times"
                      : `Show all ${availableQuickTimes.length} times`}
                  </button>
                ) : null}
              </>
            )}

            {startTime ? (
              <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="font-medium">
                  {timeSummary}
                  {preference === "Short term" ? ` · ${durationHours}h per visit` : ""}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeStep === "review" ? (
        <div className="space-y-3 px-4">
          <p className="text-center text-sm font-semibold text-slate-800">Review changes</p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Current</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-slate-700">
              {originalScheduleRef.current?.dateSummary}
            </p>
            <p className="text-sm text-slate-600">{originalScheduleRef.current?.timeSummary}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {originalScheduleRef.current?.durationHours}h per visit
            </p>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-4 w-4 rotate-90 text-sky-500" aria-hidden />
          </div>

          <div className="rounded-xl border-2 border-sky-200 bg-sky-50/60 px-3 py-2.5 text-left">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-sky-600">New</p>
              <span className="shrink-0 rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-700">
                {planLabel}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">{dateSummary}</p>
            <p className="text-sm text-slate-700">{timeSummary}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{durationHours}h per visit</p>
          </div>

          {checking ? (
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Checking availability…
            </div>
          ) : availabilityVerified && showAvailabilityBanner ? (
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Provider available — ready to save
            </div>
          ) : scheduleChanged ? (
            <p className="text-center text-xs text-slate-600">
              {availabilityVerified
                ? "Provider confirmed — review the modification charge below, then update."
                : "Use Check provider availability below before saving."}
            </p>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
              No changes yet — go back to adjust dates or time.
            </div>
          )}
        </div>
      ) : null}

      {validationMsg ? (
        <div
          role="alert"
          className="mx-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-900"
        >
          {validationMsg}
        </div>
      ) : null}
    </div>
  );
});

ModifyBookingScheduleSection.displayName = "ModifyBookingScheduleSection";

export type ModifyBookingScheduleHandle = {
  activeStep: ModifyWizardStep;
  canGoNext: boolean;
  canSubmit: boolean;
  goNext: () => boolean;
  goBack: () => void;
  checkAvailability: () => Promise<boolean>;
  getScheduleSnapshot: () => ModifyScheduleSnapshot | null;
  isChecking: boolean;
  isLocalScheduleComplete: boolean;
};

export default ModifyBookingScheduleSection;
