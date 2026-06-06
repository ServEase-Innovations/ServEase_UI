import React, { useState, useMemo, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import "./DribbbleDateTimePicker.css";

/* -------------------- Constants -------------------- */

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** Bookable start times: 6:00 AM – 7:30 PM (excludes 5:00/5:30 AM and 8:00 PM). */
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 6; h <= 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h % 12 || 12;
      const minute = m === 0 ? "00" : m;
      const ampm = h < 12 ? "AM" : "PM";
      slots.push(`${hour12}:${minute} ${ampm}`);
    }
  }
  return slots;
};

const ALL_TIMES = generateTimeSlots();
/** Default max span between range start and end (inclusive window = this + 1 days). */
const DEFAULT_MAX_RANGE_DAYS = 21;

/* -------------------- Types -------------------- */

type RangeValue = {
  startDate?: Date;
  endDate?: Date;
};

type SingleProps = {
  mode?: "single";
  value?: Date;
  maxDate?: Date;
  /** Fired when the calendar date changes (time selection is cleared). */
  onDateChange?: (date: Date) => void;
  onChange: (date: Date) => void;
};

type RangeProps = {
  mode: "range";
  value?: RangeValue;
  /** Max days after start date for end selection (14 = 15 calendar days inclusive). */
  maxRangeDays?: number;
  /** Fired when start/end dates change (time selection is cleared). */
  onDateChange?: (payload: { startDate: Date; endDate?: Date }) => void;
  onChange: (payload: {
    startDate: Date;
    endDate: Date;
    time: string;
  }) => void;
};

type Props = SingleProps | RangeProps;

/* -------------------- Helper: get available times for a given date -------------------- */
const getAvailableTimes = (date: Dayjs | null): string[] => {
  if (!date) return [];
  const now = dayjs();
  const isToday = date.isSame(now, "day");

  if (!isToday) {
    // Future date → all time slots are available
    return ALL_TIMES;
  }

  // Today: only future slots (with 30 min buffer)
  return ALL_TIMES.filter((time) => {
    const parsed = dayjs(time, "h:mm A");
    const timeDateTime = now
      .hour(parsed.hour())
      .minute(parsed.minute())
      .second(0)
      .millisecond(0);
    return timeDateTime.isAfter(now.add(30, "minute"));
  });
};

/* -------------------- Helper: filter times before or equal to noon -------------------- */
const getTimesUpToNoon = (times: string[]): string[] => {
  return times.filter((time) => {
    const parsed = dayjs(time, "h:mm A");
    const totalMinutes = parsed.hour() * 60 + parsed.minute();
    // 12:00 PM = 12*60 = 720 minutes
    return totalMinutes <= 720;
  });
};

/* -------------------- Component -------------------- */

export default function DribbbleDateTimePicker(props: Props) {
  const mode = props.mode ?? "single";
  const value = props.value;
  const maxDate = props.mode === "single" ? props.maxDate : undefined;
  const maxRangeDays =
    props.mode === "range"
      ? Math.max(1, props.maxRangeDays ?? DEFAULT_MAX_RANGE_DAYS)
      : DEFAULT_MAX_RANGE_DAYS;
  const maxRangeDaysInclusive = maxRangeDays + 1;

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTimeHint, setShowTimeHint] = useState(false);
  const [showAllTimes, setShowAllTimes] = useState(false); // expand all future slots

  /* ---------- Single Date ---------- */
  const [selectedDate, setSelectedDate] = useState<Dayjs>(
    mode === "single" && value instanceof Date ? dayjs(value) : dayjs()
  );

  /* ---------- Range ---------- */
  const rangeValue =
    mode === "range" && value && typeof value === "object" && "startDate" in value
      ? value
      : undefined;

  const [rangeStart, setRangeStart] = useState<Dayjs | null>(
    rangeValue?.startDate ? dayjs(rangeValue.startDate) : null
  );

  const [rangeEnd, setRangeEnd] = useState<Dayjs | null>(
    rangeValue?.endDate ? dayjs(rangeValue.endDate) : null
  );

  const formatTimeSlot = (d: Dayjs): string | null => {
    const match = ALL_TIMES.find((slot) => {
      const parsed = dayjs(slot, "h:mm A");
      return parsed.hour() === d.hour() && parsed.minute() === d.minute();
    });
    return match ?? null;
  };

  useEffect(() => {
    if (mode === "single" && value instanceof Date) {
      const d = dayjs(value);
      setSelectedDate(d);
      setSelectedTime(formatTimeSlot(d));
      return;
    }
    if (mode === "range" && value && typeof value === "object" && "startDate" in value) {
      const rv = value as RangeValue;
      if (rv.startDate) setRangeStart(dayjs(rv.startDate));
      if (rv.endDate) setRangeEnd(dayjs(rv.endDate));
      else setRangeEnd(null);
    }
  }, [mode, value]);

  /* -------------------- Calendar Setup -------------------- */

  const today = dayjs().startOf("day");
  const now = dayjs();

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDay = (startOfMonth.day() + 6) % 7;

  const calendarCells = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  /* -------------------- Determine active date for time slots -------------------- */
  const activeDate = useMemo(() => {
    if (mode === "single") return selectedDate;
    if (mode === "range" && rangeStart) return rangeStart;
    return null;
  }, [mode, selectedDate, rangeStart]);

  /* -------------------- Get available times -------------------- */
  const availableTimes = useMemo(() => {
    return getAvailableTimes(activeDate);
  }, [activeDate]);

  const hasAvailableTimes = availableTimes.length > 0;

  /** When every slot for today is in the past, block selecting today on the calendar. */
  const todayHasNoSlots = useMemo(
    () => getAvailableTimes(today).length === 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-check when active month/day context changes
    [today.format("YYYY-MM-DD"), now.hour(), now.minute()]
  );

  // For the "More time" toggle: 
  // - For today: show first 6 slots initially (same as before)
  // - For future dates: show only slots up to 12 PM initially, then all slots after expanding
  const displayedTimes = useMemo(() => {
    if (!hasAvailableTimes) return [];
    if (showAllTimes) return availableTimes;

    // If activeDate is today, keep original behavior (first 6 slots)
    if (activeDate && activeDate.isSame(now, "day")) {
      return availableTimes.slice(0, 6);
    }

    // For future dates: show only times up to 12 PM initially
    return getTimesUpToNoon(availableTimes);
  }, [availableTimes, showAllTimes, hasAvailableTimes, activeDate, now]);

  // Determine if "More time" button should be shown
  const canExpand = useMemo(() => {
    if (!hasAvailableTimes) return false;
    
    // For today: show expand if more than 6 slots
    if (activeDate && activeDate.isSame(now, "day")) {
      return availableTimes.length > 6;
    }
    
    // For future dates: show expand if there are any times after 12 PM
    const timesUpToNoon = getTimesUpToNoon(availableTimes);
    return availableTimes.length > timesUpToNoon.length;
  }, [availableTimes, hasAvailableTimes, activeDate, now]);

  /* -------------------- Helper Functions -------------------- */
  const isTodayDate = (date: Dayjs | null): boolean => {
    return date ? date.isSame(now, "day") : false;
  };

  const isPastDate = (date: Dayjs): boolean => date.isBefore(today, "day");
  const isPastMonth = (month: Dayjs): boolean => month.isBefore(today, "month");

  const isTimeSlotDisabled = (time: string): boolean => {
    // In range mode, if both dates not selected → disabled
    if (mode === "range" && (!rangeStart || !rangeEnd)) return true;
    // Otherwise, time is not in availableTimes → disabled
    return !availableTimes.includes(time);
  };

  const isRangeStart = (day: number) =>
    rangeStart && currentMonth.date(day).isSame(rangeStart, "day");

  const isRangeEnd = (day: number) =>
    rangeEnd && currentMonth.date(day).isSame(rangeEnd, "day");

  const isInRange = (day: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const d = currentMonth.date(day);
    return d.isAfter(rangeStart, "day") && d.isBefore(rangeEnd, "day");
  };

  const isDisabledInRangeMode = (day: number) => {
    const date = currentMonth.date(day);
    if (isPastDate(date)) return true;
    if (date.isSame(today, "day") && todayHasNoSlots) return true;

    // For single mode (on-demand), disable dates beyond maxDate
    if (mode === "single" && maxDate) {
      if (date.isAfter(dayjs(maxDate), "day")) return true;
    }

    if (mode === "range" && rangeStart && !rangeEnd) {
      if (date.isBefore(rangeStart, "day")) return true;
      if (date.isAfter(rangeStart.add(maxRangeDays, "day"), "day")) return true;
    }
    return false;
  };

  const getTimeSectionMessage = () => {
    if (mode === "range") {
      if (!rangeStart) return "Step 1: Tap your first service day on the calendar";
      if (!rangeEnd) {
        return `Step 2: Tap your last day (up to ${maxRangeDaysInclusive} days from the first)`;
      }
      if (!selectedTime) {
        return "Step 3: Choose the daily start time (same time applies on each day)";
      }
      return null;
    }
    if (!activeDate) return "Select a date first";
    if (isPastDate(activeDate)) return "Past dates cannot be booked";
    if (!hasAvailableTimes) return "No time slots available for today. Please select another date.";
    if (isTodayDate(activeDate)) return "Only upcoming time slots are available today";
    return null;
  };

  const isTimeSelectionDisabled = mode === "range" && (!rangeStart || !rangeEnd);

  /* -------------------- Handlers -------------------- */

  const selectDate = (day: number) => {
    const date = currentMonth.date(day);
    if (isDisabledInRangeMode(day)) return;
    if (date.isSame(today, "day") && todayHasNoSlots) return;

    if (mode === "single") {
      // Check max date limit
      if (maxDate && date.isAfter(dayjs(maxDate), "day")) {
        setShowTimeHint(true);
        setTimeout(() => setShowTimeHint(false), 3000);
        return;
      }
      setSelectedDate(date);
      setSelectedTime(null);
      (props as SingleProps).onDateChange?.(date.toDate());
      return;
    }

    // RANGE MODE
    const rangeProps = props as RangeProps;
    if (!rangeStart || rangeEnd) {
      setRangeStart(date);
      setRangeEnd(null);
      setSelectedTime(null);
      setShowAllTimes(false);
      rangeProps.onDateChange?.({ startDate: date.toDate() });
      return;
    }

    if (date.isSame(rangeStart, "day")) return;

    if (date.diff(rangeStart, "day") > maxRangeDays) {
      setShowTimeHint(true);
      setTimeout(() => setShowTimeHint(false), 3000);
      return;
    }

    if (date.isBefore(rangeStart, "day")) {
      setRangeStart(date);
      setRangeEnd(null);
      rangeProps.onDateChange?.({ startDate: date.toDate() });
    } else {
      setRangeEnd(date);
      rangeProps.onDateChange?.({
        startDate: rangeStart.toDate(),
        endDate: date.toDate(),
      });
    }
    setSelectedTime(null);
    setShowAllTimes(false);
  };

  const selectTime = (time: string) => {
    if (isTimeSlotDisabled(time)) return;
    if (mode === "range" && (!rangeStart || !rangeEnd)) return;

    setSelectedTime(time);

    const parsedTime = dayjs(time, "h:mm A");
    if (!parsedTime.isValid()) return;

    if (mode === "single") {
      const finalDate = selectedDate
        .hour(parsedTime.hour())
        .minute(parsedTime.minute())
        .second(0)
        .toDate();

      (props as SingleProps).onChange(finalDate);
      return;
    }

    // Range mode
    if (!rangeStart || !rangeEnd) return;
    const rangeProps = props as RangeProps;
    rangeProps.onChange({
      startDate: rangeStart
        .hour(parsedTime.hour())
        .minute(parsedTime.minute())
        .toDate(),
      endDate: rangeEnd
        .hour(parsedTime.hour())
        .minute(parsedTime.minute())
        .toDate(),
      time,
    });
  };

  /* -------------------- Render -------------------- */

  return (
    <div className="dtp-card">
      <div className="dtp-header">
        <button
          onClick={() => setCurrentMonth((m) => m.subtract(1, "month"))}
          disabled={isPastMonth(currentMonth.subtract(1, "month"))}
          style={{
            opacity: isPastMonth(currentMonth.subtract(1, "month")) ? 0.3 : 1,
            cursor: isPastMonth(currentMonth.subtract(1, "month")) ? "not-allowed" : "pointer",
          }}
        >
          ‹
        </button>
        <h3>{currentMonth.format("MMMM YYYY")}</h3>
        <button onClick={() => setCurrentMonth((m) => m.add(1, "month"))}>›</button>
      </div>

      <div className="dtp-week">
        {WEEK_DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="dtp-grid">
        {calendarCells.map((day, i) => {
          const disabled = day ? isDisabledInRangeMode(day) : true;
          return (
            <div
              key={i}
              className={[
                "dtp-day",
                disabled ? "disabled" : "",
                day &&
                mode === "single" &&
                selectedDate.isSame(currentMonth.date(day), "day")
                  ? "active"
                  : "",
                day && mode === "range" && isRangeStart(day) ? "range-start" : "",
                day && mode === "range" && isRangeEnd(day) ? "range-end" : "",
                day && mode === "range" && isInRange(day) ? "range-middle" : "",
                !day ? "empty" : "",
              ].join(" ")}
              onClick={() => !disabled && day && selectDate(day)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {todayHasNoSlots && currentMonth.isSame(today, "month") && (
        <div className="dtp-day-unavailable-hint">
          Today has no remaining time slots. Please select a future date.
        </div>
      )}

      {showTimeHint && (
        <div className="dtp-range-hint">
          Short-term bookings are limited to {maxRangeDaysInclusive} days. Pick an end date within that
          window.
        </div>
      )}

      {mode === "range" && rangeStart && rangeEnd && (
        <div className="dtp-range-summary">
          {rangeStart.format("MMM D")} – {rangeEnd.format("MMM D, YYYY")} ·{" "}
          {rangeEnd.diff(rangeStart, "day") + 1} day
          {rangeEnd.diff(rangeStart, "day") + 1 === 1 ? "" : "s"}
        </div>
      )}

      <div className="dtp-divider" />
      <div className="dtp-time-header">
        <h4 className="dtp-time-title">
          {mode === "range" && (!rangeStart || !rangeEnd) ? "Time (after dates)" : "Select time"}
        </h4>
        {getTimeSectionMessage() && (
          <span
            className={
              mode === "range" && (!rangeStart || !rangeEnd || !selectedTime)
                ? "dtp-step-hint"
                : "dtp-time-hint"
            }
          >
            {getTimeSectionMessage()}
          </span>
        )}
      </div>

      {hasAvailableTimes ? (
        <>
          <div className={`dtp-time-grid ${showAllTimes ? "expanded" : ""}`}>
            {displayedTimes.map((time) => {
              const isDisabled = isTimeSlotDisabled(time);
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  className={[
                    "dtp-time",
                    isSelected ? "active" : "",
                    isDisabled || isTimeSelectionDisabled ? "disabled" : "",
                  ].join(" ")}
                  onClick={() => selectTime(time)}
                  disabled={isDisabled || isTimeSelectionDisabled}
                >
                  {time}
                </button>
              );
            })}
          </div>

          {canExpand && (
            <div className="dtp-more-time">
              <button onClick={() => setShowAllTimes((prev) => !prev)}>
                {showAllTimes ? "Less time ▲" : "More time ▼"}
              </button>
            </div>
          )}

          {hasAvailableTimes && activeDate && isTodayDate(activeDate) && (
            <div className="dtp-helper-note">Past times are hidden. Showing available slots.</div>
          )}
        </>
      ) : (
        <div className="dtp-no-times-message">
          {getTimeSectionMessage() || "No time slots available"}
        </div>
      )}
    </div>
  );
}