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


  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  /* -------------------- Calendar Setup -------------------- */

  const today = dayjs().startOf("day");

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDay = (startOfMonth.day() + 6) % 7 + 1;

  const calendarCells = [
    ...Array(startDay - 1).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  type SingleProps = Extract<Props, { mode?: "single" }>;
    type RangeProps = Extract<Props, { mode: "range" }>;


  /* -------------------- Helpers -------------------- */

  const isRangeStart = (day: number) =>
    rangeStart &&
    currentMonth.date(day).isSame(rangeStart, "day");

  const isRangeEnd = (day: number) =>
    rangeEnd &&
    currentMonth.date(day).isSame(rangeEnd, "day");

  const isInRange = (day: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const d = currentMonth.date(day);
    return d.isAfter(rangeStart, "day") && d.isBefore(rangeEnd, "day");
  };

  /* -------------------- Handlers -------------------- */

  const selectDate = (day: number) => {
  const date = currentMonth.date(day);

  if (mode === "single") {
    setSelectedDate(date);
    return;
  }

  // RANGE MODE
  if (!rangeStart || rangeEnd) {
    setRangeStart(date);
    setRangeEnd(null);
    return;
  }

  // ⛔ Prevent selecting more than 21 days
  if (date.diff(rangeStart, "day") > MAX_RANGE_DAYS) {
    return;
  }

  if (date.isBefore(rangeStart, "day")) {
    setRangeStart(date);
  } else {
    setRangeEnd(date);
  }
};


  const selectTime = (time: string) => {
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

  const MAX_RANGE_DAYS = 21;

const isDisabledInRangeMode = (day: number) => {
  const date = currentMonth.date(day);

  // ❌ Disable past dates (for all modes)
  if (date.isBefore(today, "day")) {
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


  /* -------------------- Render -------------------- */

  return (
    <div className="dtp-card">
      {/* Header */}
      <div className="dtp-header">
        <button onClick={() => setCurrentMonth(m => m.subtract(1, "month"))}>
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
      ].join(" ")}
      onClick={() => !disabled && day && selectDate(day)}
    >
      {day}
    </div>
  );
})}


      </div>

      {/* Time */}
      <div className="dtp-divider" />
      <h4 className="dtp-time-title">Select Time</h4>

      <div className="dtp-time-grid">
        {TIMES.map(time => (
          <button
            key={time}
            className={`dtp-time ${selectedTime === time ? "active" : ""}`}
            onClick={() => selectTime(time)}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
}
