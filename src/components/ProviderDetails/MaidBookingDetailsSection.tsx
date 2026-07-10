/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import TimelapseOutlinedIcon from "@mui/icons-material/TimelapseOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  commitSchedule,
  confirmProviderScheduleVerified,
  openBookingDialog,
  setScheduleDirty,
  setScheduleIncomplete,
  setScheduleDraft,
} from "../../features/bookingType/bookingTypeSlice";
import { checkSelectedProviderAvailability } from "src/services/providerScheduleAvailability";
import { computeDurationHours } from "./serviceBookingConfig";
import DribbbleDateTimePicker from "../Common/DribbbleDateTimePicker";
import { useLanguage } from "src/context/LanguageContext";
import { getBookingTypeFromPreference } from "src/utils/maidPricingUtils";
import { isBookingScheduleComplete } from "./serviceBookingConfig";
import {
  buildReduxBookingPatch,
  resolveScheduleTimeFields,
  schedulePatchKey,
} from "src/utils/bookingSchedulePatch";
import { formatDateOnly } from "src/utils/maidPricingUtils";
import {
  MaidBadge,
  MaidCardSub,
  MaidCardTitle,
  MaidDurationChip,
  MaidDurationChips,
  MaidDurationHint,
  MaidDurationSection,
  MaidEditToggle,
  MaidInlineNote,
  MaidPickerPanel,
  MaidPickerShell,
  MaidSectionHead,
  MaidSectionTitle,
  MaidSummaryGrid,
  MaidSummaryIcon,
  MaidSummaryLabel,
  MaidSummaryTile,
  MaidSummaryValue,
} from "./MaidServiceDialog.styles";

dayjs.extend(customParseFormat);

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6];

/** Platform service window: 6:00 AM – 8:00 PM on the same calendar day. */
const WORK_DAY_START = { hour: 6, minute: 0 };
const WORK_DAY_END = { hour: 20, minute: 0 };
/** Latest bookable start (7:00 PM — minimum 1h service must end by 8:00 PM). */
const LATEST_START = { hour: 19, minute: 0 };

function workDayStart(day: Dayjs): Dayjs {
  return day
    .hour(WORK_DAY_START.hour)
    .minute(WORK_DAY_START.minute)
    .second(0)
    .millisecond(0);
}

function workDayEnd(day: Dayjs): Dayjs {
  return day.hour(WORK_DAY_END.hour).minute(WORK_DAY_END.minute).second(0).millisecond(0);
}

function latestStartTime(day: Dayjs): Dayjs {
  return day
    .hour(LATEST_START.hour)
    .minute(LATEST_START.minute)
    .second(0)
    .millisecond(0);
}

/** Latest start time that still allows at least `minHours` before end of work day. */
function latestStartForMinDuration(day: Dayjs, minHours = 1): Dayjs {
  const byDuration = workDayEnd(day).subtract(minHours, "hour");
  const bySlot = latestStartTime(day);
  return byDuration.isBefore(bySlot) ? byDuration : bySlot;
}

function isStartWithinWorkHours(time: Dayjs): boolean {
  return !time.isBefore(workDayStart(time)) && !time.isAfter(latestStartTime(time));
}

/** Minutes from midnight for a time on its calendar day. */
function timeMinutesOnDay(time: Dayjs): number {
  return time.hour() * 60 + time.minute();
}

const WORK_END_MINUTES = WORK_DAY_END.hour * 60 + WORK_DAY_END.minute;

/** True when `start` + `hours` ends on the same day and by 8:00 PM (inclusive). */
function isDurationWithinWorkHours(start: Dayjs, hours: number): boolean {
  const endMinutes = timeMinutesOnDay(start) + hours * 60;
  return endMinutes <= WORK_END_MINUTES;
}

function maxAllowedDurationHours(start: Dayjs): number {
  let max = 0;
  for (const h of DURATION_OPTIONS) {
    if (isDurationWithinWorkHours(start, h)) max = h;
  }
  return max;
}

function clampScheduleToWorkHours(
  start: Dayjs,
  end: Dayjs
): { start: Dayjs; end: Dayjs } {
  let nextStart = start;
  if (!isStartWithinWorkHours(nextStart)) {
    if (nextStart.isBefore(workDayStart(nextStart))) {
      nextStart = workDayStart(nextStart);
    } else {
      nextStart = latestStartForMinDuration(nextStart, 1);
    }
  }

  let allowedHours = maxAllowedDurationHours(nextStart);
  if (allowedHours === 0) {
    nextStart = latestStartForMinDuration(nextStart, 1);
    allowedHours = maxAllowedDurationHours(nextStart);
  }

  const requestedHours = Math.max(1, Math.round(end.diff(nextStart, "hour", true)));
  const hours = Math.min(requestedHours, allowedHours || 1);

  return {
    start: nextStart,
    end: nextStart.add(hours, "hour"),
  };
}

function durationHoursFromTimes(start: Dayjs | null, end: Dayjs | null): number {
  if (!start || !end) return 0;
  const mins = end.diff(start, "minute");
  if (mins <= 0) return 0;
  return Math.max(1, Math.min(6, Math.round(mins / 60)));
}

function parseTimeOnDate(dateStr: string | undefined, timeStr: string | undefined): Dayjs | null {
  if (!dateStr || !timeStr) return null;
  const base = dayjs(dateStr.split("T")[0]);
  const [h, m] = timeStr.split(":").map(Number);
  if (!Number.isFinite(h)) return null;
  return base.hour(h).minute(Number.isFinite(m) ? m : 0);
}

function defaultOnDemandStart(): Dayjs {
  const now = dayjs();
  let adjusted = now.add(30, "minute");
  if (adjusted.isBefore(workDayStart(adjusted))) {
    adjusted = workDayStart(adjusted);
  }
  const latestStart = latestStartForMinDuration(adjusted, 1);
  if (adjusted.isAfter(latestStart)) {
    adjusted = latestStart;
  }
  return adjusted;
}

export type MaidBookingDetailsSectionHandle = {
  checkAvailability: () => Promise<void>;
};

interface MaidBookingDetailsSectionProps {
  active: boolean;
  providerId?: number | string | null;
  bookingCoords?: { lat: number; lng: number } | null;
  role?: string;
  customerId?: number | null;
  onApplyingScheduleChange?: (loading: boolean) => void;
  onScheduleActionsReady?: (actions: MaidBookingDetailsSectionHandle) => void;
  /** Fired when an availability check fails until the user edits the schedule again. */
  onAvailabilityCheckBlockedChange?: (blocked: boolean, message?: string) => void;
  /** When set, restricts duration choices to these specific hours (renders these chips). */
  allowedDurationHours?: number[];
}

const MaidBookingDetailsSection: React.FC<MaidBookingDetailsSectionProps> = ({
  active,
  providerId,
  bookingCoords,
  role = "COOK",
  customerId,
  onApplyingScheduleChange,
  onScheduleActionsReady,
  onAvailabilityCheckBlockedChange,
  allowedDurationHours,
}) => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const bookingType = useSelector((state: { bookingType?: { value?: Record<string, unknown> } }) =>
    state.bookingType?.value ?? null
  );

  const preference = String(bookingType?.bookingPreference ?? "Date");
  const today = dayjs();
  const maxDate21Days = today.add(21, "day");
  const maxDate90Days = today.add(89, "day");

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [isApplyingSchedule, setIsApplyingSchedule] = useState(false);
  const [userTouchedSchedule, setUserTouchedSchedule] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  /** User's duration choice — kept when date/time is cleared so chips stay highlighted. */
  const [selectedDurationHours, setSelectedDurationHours] = useState(() => {
    if (allowedDurationHours) {
      return allowedDurationHours.includes(8) ? 8 : allowedDurationHours[0];
    }
    return 1;
  });
  const scheduleBaselineRef = useRef("");
  const onAvailabilityBlockedRef = useRef(onAvailabilityCheckBlockedChange);
  onAvailabilityBlockedRef.current = onAvailabilityCheckBlockedChange;

  const markScheduleTouched = useCallback(() => {
    setUserTouchedSchedule(true);
    onAvailabilityBlockedRef.current?.(false);
  }, []);

  const hydrateFromRedux = useCallback(() => {
    const pref = String(bookingType?.bookingPreference ?? "Date");
    const dateStr =
      bookingType?.startDate != null
        ? String(bookingType.startDate).split("T")[0]
        : dayjs().format("YYYY-MM-DD");

    let sd = bookingType?.startDate ? dayjs(dateStr) : null;
    let ed = bookingType?.endDate ? dayjs(String(bookingType.endDate).split("T")[0]) : null;

    const { startTime: reduxStart, endTime: reduxEnd } = resolveScheduleTimeFields(
      bookingType
    );
    let st = parseTimeOnDate(dateStr, reduxStart);
    let et = parseTimeOnDate(dateStr, reduxEnd);

    if (pref === "Date") {
      if (st && et) {
        const clamped = clampScheduleToWorkHours(st, et);
        st = clamped.start;
        et = clamped.end;
        sd = st;
        ed = et;
      } else {
        st = null;
        et = null;
        sd = bookingType?.startDate ? dayjs(dateStr) : null;
        ed = null;
      }
    } else if (pref === "Short term") {
      if (!reduxStart) {
        st = null;
        et = null;
      } else if (!et && st) {
        et = st.add(1, "hour");
      }
    } else if (pref === "Monthly" && !reduxStart) {
      st = null;
      et = null;
    }

    setStartDate(sd);
    setEndDate(ed ?? sd);
    setStartTime(st);
    setEndTime(et);
    const hydratedDuration = durationHoursFromTimes(st, et);
    const defaultDuration = allowedDurationHours
      ? (allowedDurationHours.includes(8) ? 8 : allowedDurationHours[0])
      : 1;
    setSelectedDurationHours(
      hydratedDuration > 0 && (!allowedDurationHours || allowedDurationHours.includes(hydratedDuration))
        ? hydratedDuration
        : defaultDuration
    );
    setValidationMsg(null);
  }, [bookingType]);

  const committedScheduleKey = useMemo(
    () => schedulePatchKey((bookingType ?? {}) as Record<string, unknown>),
    [
      bookingType?.startDate,
      bookingType?.endDate,
      bookingType?.startTime,
      bookingType?.endTime,
      bookingType?.timeRange,
      bookingType?.timeSlot,
    ]
  );

  useEffect(() => {
    if (active) {
      hydrateFromRedux();
      setUserTouchedSchedule(false);
      setHydrated(true);
      setScheduleOpen(false);
      return;
    }
    setHydrated(false);
    dispatch(setScheduleDirty(false));
    dispatch(setScheduleDraft(null));
    dispatch(setScheduleIncomplete(false));
    onAvailabilityBlockedRef.current?.(false);
    // Only re-hydrate when the committed schedule changes — not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, committedScheduleKey, dispatch]);

  const planLabel = useMemo(() => {
    const pref = preference.toLowerCase();
    if (pref === "date") return "On-demand";
    if (pref === "short term") return "Short-term";
    return "Monthly";
  }, [preference]);

  const durationFromTimes = useMemo(
    () => durationHoursFromTimes(startTime, endTime),
    [startTime, endTime]
  );
  const durationHours =
    durationFromTimes > 0 ? durationFromTimes : selectedDurationHours;

  useEffect(() => {
    if (durationFromTimes > 0) {
      setSelectedDurationHours(durationFromTimes);
    }
  }, [durationFromTimes]);

  const maxDurationHours = useMemo(() => {
    if (!startTime) return 0;
    return maxAllowedDurationHours(startTime);
  }, [startTime]);

  const localSchedulePatch = useMemo(
    () =>
      buildReduxBookingPatch(preference, startDate, endDate, startTime, endTime, null),
    [preference, startDate, endDate, startTime, endTime]
  );

  const isLocalScheduleComplete = useMemo(() => {
    const bookingTypeCode = getBookingTypeFromPreference(preference);
    return isBookingScheduleComplete(
      localSchedulePatch as Record<string, unknown>,
      bookingTypeCode
    );
  }, [localSchedulePatch, preference]);

  useEffect(() => {
    if (!active || !hydrated) return;

    if (!isLocalScheduleComplete) {
      if (userTouchedSchedule) {
        dispatch(setScheduleDirty(true));
        dispatch(setScheduleIncomplete(true));
        dispatch(setScheduleDraft(null));
      } else {
        dispatch(setScheduleDirty(false));
        dispatch(setScheduleIncomplete(false));
        dispatch(setScheduleDraft(null));
      }
      return;
    }

    dispatch(setScheduleIncomplete(false));

    const localKey = schedulePatchKey(localSchedulePatch);

    if (!userTouchedSchedule) {
      scheduleBaselineRef.current = localKey;
      dispatch(setScheduleDirty(false));
      dispatch(setScheduleDraft(null));
      return;
    }

    const dirty = localKey !== scheduleBaselineRef.current;
    dispatch(setScheduleDirty(dirty));
    dispatch(setScheduleDraft(dirty ? localSchedulePatch : null));
  }, [
    active,
    dispatch,
    hydrated,
    isLocalScheduleComplete,
    localSchedulePatch,
    userTouchedSchedule,
  ]);

  const applySchedule = useCallback(
    async (options?: { closePicker?: boolean }) => {
      if (!isLocalScheduleComplete) {
        setValidationMsg("Select your date and time before checking availability.");
        return;
      }

      setIsApplyingSchedule(true);
      onApplyingScheduleChange?.(true);
      try {
        const patch = buildReduxBookingPatch(
          preference,
          startDate,
          endDate,
          startTime,
          endTime,
          bookingType
        );
        const bookingTypeCode = getBookingTypeFromPreference(preference);
        const resolvedProviderId = Number(providerId);
        const hasProvider =
          Number.isFinite(resolvedProviderId) && resolvedProviderId > 0;

        if (
          hasProvider &&
          bookingCoords &&
          bookingTypeCode !== "ON_DEMAND"
        ) {
          const startDateYmd =
            formatDateOnly(String(patch.startDate ?? "")) ||
            dayjs().format("YYYY-MM-DD");
          const endDateYmd =
            formatDateOnly(String(patch.endDate ?? "")) || startDateYmd;
          const { startTime: startTimeStr, endTime: endTimeStr } =
            resolveScheduleTimeFields(patch);
          const durationHours = computeDurationHours(
            bookingTypeCode,
            startTimeStr,
            endTimeStr,
            startDateYmd,
            endDateYmd,
            String(patch.timeRange ?? ""),
            String(patch.timeSlot ?? "")
          );
          const durationMinutes =
            durationHours != null && durationHours > 0
              ? Math.round(durationHours * 60)
              : 60;

          const availability = await checkSelectedProviderAvailability({
            providerId: resolvedProviderId,
            latitude: bookingCoords.lat,
            longitude: bookingCoords.lng,
            role: String(bookingType?.housekeepingRole || role),
            startDate: startDateYmd,
            endDate: endDateYmd,
            preferredStartTime: startTimeStr,
            serviceDurationMinutes: durationMinutes,
            customerId,
          });

          if (!availability.available) {
            const message =
              availability.message ||
              "This provider is not available for your selected schedule.";
            setValidationMsg(message);
            onAvailabilityCheckBlockedChange?.(true, message);
            return;
          }
        }

        const ranProviderAvailabilityCheck =
          hasProvider &&
          Boolean(bookingCoords) &&
          bookingTypeCode !== "ON_DEMAND";

        dispatch(commitSchedule(patch));
        scheduleBaselineRef.current = schedulePatchKey(patch);
        setUserTouchedSchedule(false);
        setValidationMsg(null);
        onAvailabilityCheckBlockedChange?.(false);
        if (options?.closePicker) setScheduleOpen(false);

        if (ranProviderAvailabilityCheck) {
          dispatch(confirmProviderScheduleVerified(String(resolvedProviderId)));
        }

        if (hasProvider) {
          dispatch(openBookingDialog(String(resolvedProviderId)));
        }
      } finally {
        setIsApplyingSchedule(false);
        onApplyingScheduleChange?.(false);
      }
    },
    [
      bookingCoords,
      bookingType,
      customerId,
      dispatch,
      endDate,
      endTime,
      isLocalScheduleComplete,
      onApplyingScheduleChange,
      onAvailabilityCheckBlockedChange,
      preference,
      providerId,
      role,
      startDate,
      startTime,
    ]
  );

  useEffect(() => {
    onScheduleActionsReady?.({
      checkAvailability: () => applySchedule({ closePicker: true }),
    });
  }, [applySchedule, onScheduleActionsReady]);

  const handleDateOnlyChange = (date: Date) => {
    markScheduleTouched();
    const day = dayjs(date).startOf("day");
    const monthlyEnd = day.add(1, "month");
    setStartDate(day);
    setStartTime(null);
    setEndTime(null);
    setEndDate(preference === "Monthly" ? monthlyEnd : preference === "Date" ? null : endDate);
    setValidationMsg("Select a time for this date to update provider availability.");
  };

  const handleRangeDateOnlyChange = (payload: { startDate: Date; endDate?: Date }) => {
    markScheduleTouched();
    const start = dayjs(payload.startDate).startOf("day");
    const end = payload.endDate ? dayjs(payload.endDate).startOf("day") : null;
    setStartDate(start);
    setEndDate(end);
    setStartTime(null);
    setEndTime(null);
    setValidationMsg(
      end
        ? "Select a daily start time for your date range."
        : "Select your date range, then choose a daily start time."
    );
  };

  const applyStartDateTime = (selected: Dayjs) => {
    markScheduleTouched();
    const now = dayjs();
    let adjusted = selected;
    if (selected.isSame(now, "day")) {
      const nowPlus30 = now.add(30, "minute");
      if (adjusted.isBefore(nowPlus30)) adjusted = nowPlus30;
    }
    if (adjusted.isBefore(workDayStart(adjusted))) {
      adjusted = workDayStart(adjusted);
    }
    if (adjusted.isAfter(latestStartTime(adjusted))) {
      adjusted = latestStartTime(adjusted);
    }

    const allowedHours = maxAllowedDurationHours(adjusted);
    const hours = Math.min(durationHours, allowedHours || 1);
    const nextEnd = adjusted.add(hours, "hour");
    const monthlyEnd = adjusted.add(1, "month");
    setStartDate(adjusted);
    setStartTime(adjusted);
    setEndTime(nextEnd);
    if (preference === "Date") setEndDate(nextEnd);
    if (preference === "Monthly") setEndDate(monthlyEnd);
    setValidationMsg("Tap Check availability to search providers for this schedule.");
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
    if (preference === "Date") setEndDate(newEnd);
    setValidationMsg("Tap Check availability to search providers for this duration.");
  };

  const dateSummary = useMemo(() => {
    if (preference === "Short term" && startDate && endDate) {
      return `${startDate.format("MMM D")} – ${endDate.format("MMM D")}`;
    }
    if (startDate) return startDate.format("ddd, MMM D");
    return "—";
  }, [preference, startDate, endDate]);

  const timeSummary = useMemo(() => {
    if (!startTime) return "—";
    if (endTime && preference !== "Monthly") {
      return `${startTime.format("h:mm A")} – ${endTime.format("h:mm A")}`;
    }
    return startTime.format("h:mm A");
  }, [startTime, endTime, preference]);

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
    if (preference === "Date" && !isDurationWithinWorkHours(selected, 1)) {
      setValidationMsg(t("timeHourRestriction"));
      return false;
    }
    if (preference === "Date" && selected.isAfter(maxDate21Days)) {
      setValidationMsg(t("dateExceedRestriction"));
      return false;
    }
    if (preference === "Monthly" && selected.isAfter(maxDate90Days, "day")) {
      setValidationMsg(t("monthlyDateExceedRestriction"));
      return false;
    }
    return true;
  };

  return (
    <>
      <MaidBadge>{planLabel}</MaidBadge>
      <MaidCardTitle>{t("bookingDetails")}</MaidCardTitle>
      <MaidCardSub>
        {preference === "Short term"
          ? "Daily visits across your selected date range."
          : preference === "Monthly"
            ? "Recurring monthly service from your start date."
            : "One visit on the day and time you choose."}
      </MaidCardSub>

      <MaidSummaryGrid>
        <MaidSummaryTile>
          <MaidSummaryIcon>
            <CalendarMonthOutlinedIcon fontSize="inherit" />
          </MaidSummaryIcon>
          <MaidSummaryLabel>{t("date")}</MaidSummaryLabel>
          <MaidSummaryValue>{dateSummary}</MaidSummaryValue>
        </MaidSummaryTile>
        <MaidSummaryTile>
          <MaidSummaryIcon>
            <ScheduleOutlinedIcon fontSize="inherit" />
          </MaidSummaryIcon>
          <MaidSummaryLabel>{t("startTime")}</MaidSummaryLabel>
          <MaidSummaryValue>{timeSummary}</MaidSummaryValue>
        </MaidSummaryTile>
        <MaidSummaryTile>
          <MaidSummaryIcon>
            <TimelapseOutlinedIcon fontSize="inherit" />
          </MaidSummaryIcon>
          <MaidSummaryLabel>{t("serviceDuration")}</MaidSummaryLabel>
          <MaidSummaryValue>
            {durationHours > 0
              ? `${durationHours} ${t("hourUnit")}${durationHours > 1 ? "s" : ""}`
              : "—"}
          </MaidSummaryValue>
        </MaidSummaryTile>
      </MaidSummaryGrid>

      {(preference === "Date" || preference === "Short term" || preference === "Monthly") && (
        <>
          <MaidSectionHead>
            <MaidSectionTitle>{t("serviceDuration")}</MaidSectionTitle>
          </MaidSectionHead>
          <MaidDurationSection>
            <MaidDurationHint>
              {allowedDurationHours
                ? "Select duration for your caregiver service."
                : preference === "Short term"
                  ? "Hours per visit — price updates for each day in your range."
                  : preference === "Monthly"
                    ? "Hours per visit — price updates for your monthly service."
                    : t("durationMessage")}
            </MaidDurationHint>
            <MaidDurationChips>
              {(allowedDurationHours ?? DURATION_OPTIONS).map((h) => {
                const disabled = Boolean(startTime) && h > maxDurationHours;
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
          </MaidDurationSection>
        </>
      )}

      <MaidSectionHead>
        <MaidSectionTitle>
          {preference === "Short term" ? "Date range & time" : t("date")}
        </MaidSectionTitle>
        <MaidEditToggle
          type="button"
          $open={scheduleOpen}
          onClick={() => setScheduleOpen((o) => !o)}
          aria-expanded={scheduleOpen}
        >
          {scheduleOpen ? "Hide" : "Change"}
          {scheduleOpen ? (
            <ExpandLessIcon sx={{ fontSize: 18 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18 }} />
          )}
        </MaidEditToggle>
      </MaidSectionHead>

      <MaidPickerPanel $visible={scheduleOpen}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {preference === "Date" && (
            <MaidPickerShell>
              <DribbbleDateTimePicker
                mode="single"
                value={startTime?.toDate()}
                maxDate={maxDate21Days.toDate()}
                onDateChange={handleDateOnlyChange}
                onChange={(selectedDateTime: Date) => {
                  const selected = dayjs(selectedDateTime);
                  if (!validateSelection(selected)) return;
                  applyStartDateTime(selected);
                }}
              />
            </MaidPickerShell>
          )}

          {preference === "Short term" && (
            <MaidPickerShell>
              <DribbbleDateTimePicker
                mode="range"
                value={{
                  startDate: startDate?.toDate(),
                  endDate: endDate?.toDate(),
                  time: startTime?.format("h:mm A"),
                }}
                onDateChange={handleRangeDateOnlyChange}
                onChange={({ startDate: rangeStart, endDate: rangeEnd, time }) => {
                  if (!time) return;
                  markScheduleTouched();
                  const startWithTime = dayjs(rangeStart);
                  let end = dayjs(rangeEnd).startOf("day");
                  if (end.diff(startWithTime.startOf("day"), "day") > 14) {
                    end = startWithTime.startOf("day").add(14, "day");
                    setValidationMsg("Short-term bookings are limited to 15 days.");
                  } else {
                    setValidationMsg(null);
                  }
                  if (!validateSelection(startWithTime)) return;
                  if (!isDurationWithinWorkHours(startWithTime, durationHours)) {
                    setValidationMsg(t("timeHourRestriction"));
                    return;
                  }
                  const endT = startWithTime.add(durationHours, "hour");
                  setStartDate(startWithTime);
                  setStartTime(startWithTime);
                  setEndDate(end);
                  setEndTime(endT);
                  setValidationMsg(
                    "Tap Check availability to search providers for this schedule."
                  );
                }}
              />
            </MaidPickerShell>
          )}

          {preference === "Monthly" && (
            <MaidPickerShell>
              <DribbbleDateTimePicker
                mode="single"
                value={startTime?.toDate()}
                maxDate={maxDate90Days.toDate()}
                onDateChange={handleDateOnlyChange}
                onChange={(selectedDateTime: Date) => {
                  const selected = dayjs(selectedDateTime);
                  if (!validateSelection(selected)) return;
                  applyStartDateTime(selected);
                }}
              />
            </MaidPickerShell>
          )}
        </LocalizationProvider>
      </MaidPickerPanel>

      {validationMsg ? <MaidInlineNote role="alert">{validationMsg}</MaidInlineNote> : null}
    </>
  );
};

export default MaidBookingDetailsSection;
