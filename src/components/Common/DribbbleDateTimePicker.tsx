import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "./DribbbleDateTimePicker.css";

/* -------------------- Constants -------------------- */

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 5; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h % 12 || 12;
      const minute = m === 0 ? "00" : m;
      const ampm = h < 12 ? "AM" : "PM";
      slots.push(`${hour12}:${minute} ${ampm}`);
    }
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

  const isToday = (date: Dayjs): boolean => date.isSame(now, "day");
  const isPastDate = (date: Dayjs): boolean => date.isBefore(today, "day");
  const isPastMonth = (month: Dayjs): boolean => month.isBefore(today, "month");

  // ✅ FIXED: parse time fully (hour + minute) for disabling logic
  const isTimeSlotDisabled = (time: string): boolean => {
    if (mode === "range" && (!rangeStart || !rangeEnd)) return true;

    let selectedDateToCheck: Dayjs | null = null;
    if (mode === "single") selectedDateToCheck = selectedDate;
    else if (mode === "range" && rangeStart) selectedDateToCheck = rangeStart;

    if (!selectedDateToCheck) return mode === "range";
    if (isPastDate(selectedDateToCheck)) return true;
    if (!isToday(selectedDateToCheck)) return false;

    // Parse full time (e.g., "7:30 PM")
    const parsedTime = dayjs(time, "h:mm A");
    if (!parsedTime.isValid()) return true;

    const timeDateTime = now
      .hour(parsedTime.hour())
      .minute(parsedTime.minute())
      .second(0)
      .millisecond(0);

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
    if (isPastDate(date)) return true;
    if (mode === "range" && rangeStart && !rangeEnd) {
      if (date.isAfter(rangeStart.add(MAX_RANGE_DAYS, "day"), "day")) return true;
    }
    return false;
  };

  const getDisabledTimeMessage = () => {
    if (mode === "range" && (!rangeStart || !rangeEnd))
      return "Select start and end dates first";
    const selectedDateToCheck = mode === "single" ? selectedDate : rangeStart;
    if (selectedDateToCheck) {
      if (isPastDate(selectedDateToCheck)) return "Past dates cannot be booked";
      if (isToday(selectedDateToCheck)) return "Past times are disabled for today";
    }
    return null;
  };

  const isTimeSelectionDisabled = mode === "range" && (!rangeStart || !rangeEnd);

  /* -------------------- Handlers -------------------- */

  const selectDate = (day: number) => {
    const date = currentMonth.date(day);
    if (isDisabledInRangeMode(day)) return;

    if (mode === "single") {
      setSelectedDate(date);
      setSelectedTime(null);
      return;
    }

    // RANGE MODE
    if (!rangeStart || rangeEnd) {
      setRangeStart(date);
      setRangeEnd(null);
      setSelectedTime(null);
      return;
    }

    if (date.isSame(rangeStart, "day")) return;

    if (date.diff(rangeStart, "day") > MAX_RANGE_DAYS) {
      setShowTimeHint(true);
      setTimeout(() => setShowTimeHint(false), 3000);
      return;
    }

    if (date.isBefore(rangeStart, "day")) setRangeStart(date);
    else setRangeEnd(date);
    setSelectedTime(null);
  };

  // ✅ FIXED: preserve minutes when selecting a time
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

      {showTimeHint && <div className="dtp-range-hint">Maximum range is {MAX_RANGE_DAYS} days</div>}

      <div className="dtp-divider" />
      <div className="dtp-time-header">
        <h4 className="dtp-time-title">Select Time</h4>
        {getDisabledTimeMessage() && (
          <span className="dtp-time-hint">{getDisabledTimeMessage()}</span>
        )}
      </div>

      <div className="dtp-time-grid">
        {TIMES.map((time) => {
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
    </div>
  );
}