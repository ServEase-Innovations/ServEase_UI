import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "./DribbbleDateTimePicker.css";

/* -------------------- Constants -------------------- */

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 5; h <= 20; h++) {
    const hour12 = h % 12 || 12;
    const ampm = h < 12 ? "AM" : "PM";
    slots.push(`${hour12}:00 ${ampm}`);
  }
  return slots;
};

const TIMES = generateTimeSlots();
const MAX_RANGE_DAYS = 21;

/* -------------------- Types -------------------- */

type RangeValue = {
  startDate?: Date;
  endDate?: Date;
};

type SingleProps = {
  mode?: "single";
  value?: Date;
  onChange: (date: Date) => void;
};

type RangeProps = {
  mode: "range";
  value?: RangeValue;
  onChange: (payload: {
    startDate: Date;
    endDate: Date;
    time: string;
  }) => void;
};

type Props = SingleProps | RangeProps;

/* -------------------- Component -------------------- */

export default function DribbbleDateTimePicker(props: Props) {
  const mode = props.mode ?? "single";
  const value = props.value;

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTimeHint, setShowTimeHint] = useState(false);

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

  /* -------------------- Helper Functions -------------------- */

  // Check if a date is today
  const isToday = (date: Dayjs): boolean => {
    return date.isSame(now, "day");
  };

  // Check if a date is in the past (before today)
  const isPastDate = (date: Dayjs): boolean => {
    return date.isBefore(today, "day");
  };

  // Check if a month is in the past
  const isPastMonth = (month: Dayjs): boolean => {
    return month.isBefore(today, "month");
  };

  // Check if a time slot should be disabled based on selected date
  const isTimeSlotDisabled = (time: string): boolean => {
    // For range mode, if no dates selected, disable all times
    if (mode === "range" && (!rangeStart || !rangeEnd)) {
      return true;
    }

    // Get the selected date(s) to check
    let selectedDateToCheck: Dayjs | null = null;
    
    if (mode === "single") {
      selectedDateToCheck = selectedDate;
    } else if (mode === "range" && rangeStart) {
      selectedDateToCheck = rangeStart;
    }

    // If no date selected, disable in range mode
    if (!selectedDateToCheck) {
      return mode === "range";
    }

    // If the selected date is in the past, disable ALL time slots
    if (isPastDate(selectedDateToCheck)) {
      return true;
    }

    // Only apply time restrictions if the selected date is today
    if (!isToday(selectedDateToCheck)) {
      return false; // Future dates can select any time
    }

    // Parse the time string
    const [t, meridian] = time.split(" ");
    let hour = Number(t.split(":")[0]);

    // Convert to 24-hour format
    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;

    // Create a datetime object for today with the selected time
    const timeDateTime = now.hour(hour).minute(0).second(0).millisecond(0);

    // For start times, require at least 30 minutes buffer
    if (mode === "single" || (mode === "range" && rangeStart === selectedDateToCheck)) {
      return timeDateTime.isBefore(now.add(30, "minute"));
    } else {
      return timeDateTime.isBefore(now);
    }
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

    // ❌ Disable ALL past dates (including previous months)
    if (isPastDate(date)) {
      return true;
    }

    // ❌ Range mode: disable dates beyond +21 days from start
    if (mode === "range" && rangeStart && !rangeEnd) {
      if (date.isAfter(rangeStart.add(MAX_RANGE_DAYS, "day"), "day")) {
        return true;
      }
    }

    return false;
  };

  // Get the appropriate message for disabled times
  const getDisabledTimeMessage = () => {
    if (mode === "range" && (!rangeStart || !rangeEnd)) {
      return "Select start and end dates first";
    }
    
    const selectedDateToCheck = mode === "single" ? selectedDate : rangeStart;
    
    if (selectedDateToCheck) {
      if (isPastDate(selectedDateToCheck)) {
        return "Past dates cannot be booked";
      }
      if (isToday(selectedDateToCheck)) {
        return "Past times are disabled for today";
      }
    }
    
    return null;
  };

  // Determine if time selection should be disabled overall
  const isTimeSelectionDisabled = mode === "range" && (!rangeStart || !rangeEnd);

  /* -------------------- Handlers -------------------- */

  const selectDate = (day: number) => {
    const date = currentMonth.date(day);

    // Don't allow selecting disabled dates
    if (isDisabledInRangeMode(day)) return;

    if (mode === "single") {
      setSelectedDate(date);
      setSelectedTime(null); // Clear selected time when date changes
      return;
    }

    // RANGE MODE
    if (!rangeStart || rangeEnd) {
      setRangeStart(date);
      setRangeEnd(null);
      setSelectedTime(null); // Clear selected time when date changes
      return;
    }

    // Prevent selecting same day as range start
    if (date.isSame(rangeStart, "day")) {
      return;
    }

    // ⛔ Prevent selecting more than 21 days
    if (date.diff(rangeStart, "day") > MAX_RANGE_DAYS) {
      setShowTimeHint(true);
      setTimeout(() => setShowTimeHint(false), 3000);
      return;
    }

    if (date.isBefore(rangeStart, "day")) {
      setRangeStart(date);
    } else {
      setRangeEnd(date);
    }
    setSelectedTime(null); // Clear selected time when date changes
  };

  const selectTime = (time: string) => {
    // Don't allow selecting disabled times
    if (isTimeSlotDisabled(time)) return;

    // For range mode, require both dates selected
    if (mode === "range" && (!rangeStart || !rangeEnd)) return;

    setSelectedTime(time);

    const [t, meridian] = time.split(" ");
    let hour = Number(t.split(":")[0]);

    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;

    if (mode === "single") {
      const finalDate = selectedDate
        .hour(hour)
        .minute(0)
        .second(0)
        .toDate();

      const singleProps = props as SingleProps;
      singleProps.onChange(finalDate);
      return;
    }

    if (!rangeStart || !rangeEnd) return;

    const rangeProps = props as RangeProps;
    rangeProps.onChange({
      startDate: rangeStart.hour(hour).minute(0).toDate(),
      endDate: rangeEnd.hour(hour).minute(0).toDate(),
      time,
    });
  };

  /* -------------------- Render -------------------- */

  return (
    <div className="dtp-card">
      {/* Header */}
      <div className="dtp-header">
        <button 
          onClick={() => setCurrentMonth(m => m.subtract(1, "month"))}
          disabled={isPastMonth(currentMonth.subtract(1, "month"))}
          style={{ 
            opacity: isPastMonth(currentMonth.subtract(1, "month")) ? 0.3 : 1,
            cursor: isPastMonth(currentMonth.subtract(1, "month")) ? 'not-allowed' : 'pointer'
          }}
        >
          ‹
        </button>
        <h3>{currentMonth.format("MMMM YYYY")}</h3>
        <button onClick={() => setCurrentMonth(m => m.add(1, "month"))}>
          ›
        </button>
      </div>

      {/* Week Days */}
      <div className="dtp-week">
        {WEEK_DAYS.map(d => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* Calendar */}
      <div className="dtp-grid">
        {calendarCells.map((day, i) => {
          const disabled = day ? isDisabledInRangeMode(day) : true;

          return (
            <div
              key={i}
              className={[
                "dtp-day",
                disabled ? "disabled" : "",
                day && mode === "single" &&
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

      {/* Range hint */}
      {showTimeHint && (
        <div className="dtp-range-hint">
          Maximum range is {MAX_RANGE_DAYS} days
        </div>
      )}

      {/* Time */}
      <div className="dtp-divider" />
      <div className="dtp-time-header">
        <h4 className="dtp-time-title">Select Time</h4>
        {getDisabledTimeMessage() && (
          <span className="dtp-time-hint">{getDisabledTimeMessage()}</span>
        )}
      </div>

      <div className="dtp-time-grid">
        {TIMES.map(time => {
          const isDisabled = isTimeSlotDisabled(time);
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              className={[
                "dtp-time",
                isSelected ? "active" : "",
                (isDisabled || isTimeSelectionDisabled) ? "disabled" : "",
              ].join(" ")}
              onClick={() => selectTime(time)}
              disabled={isDisabled || isTimeSelectionDisabled}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}