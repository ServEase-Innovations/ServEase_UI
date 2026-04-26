/* eslint-disable */
import React, { useEffect, useState } from "react";
import {
  Calendar as BigCalendar,
  Views,
  momentLocalizer,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import PaymentInstance from "src/services/paymentInstance";

const localizer = momentLocalizer(moment);

interface CalendarEntry {
  id: number;
  provider_id: number;
  engagement_id?: number;
  date: string; // ISO string from backend, e.g. "2025-09-14T18:30:00.000Z"
  start_time: string; // "HH:mm:ss"
  end_time: string; // "HH:mm:ss"
  status: string;
}

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  engagement_id?: number;
}

export default function ProviderCalendarBig({
  providerId,
  refreshToken = 0,
}: {
  providerId: number;
  /** Increment to refetch the same month (e.g. after leave/block change). */
  refreshToken?: number;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const month = moment(currentDate).format("YYYY-MM");
        const res = await PaymentInstance.get(
          `/api/service-providers/${providerId}/calendar?month=${month}`
        );
        const entries: CalendarEntry[] = res.data.calendar || [];

        const normalizeTime = (t: string) => {
            if (!t) return "00:00:00";
            const parts = t.split(":");
            if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
            return t;
          };

        const evts = entries
            .filter((e) => {
              const st = String(e.status || "").toUpperCase();
              return st === "BOOKED" || st === "UNAVAILABLE" || st === "FREE";
            })
            .map((e) => {
              const baseDate = new Date(e.date);
              const [sh, sm, ss] = normalizeTime(e.start_time).split(":").map(Number);
              const [eh, em, es] = normalizeTime(e.end_time).split(":").map(Number);
              const start = new Date(baseDate);
              start.setHours(sh, sm, ss);
              const end = new Date(baseDate);
              end.setHours(eh, em, es);
              const st = String(e.status || "").toUpperCase();
              const title =
                st === "UNAVAILABLE"
                  ? "Unavailable (blocked)"
                  : st === "FREE"
                    ? "Free / open"
                    : `Engagement #${e.engagement_id ?? "?"}`;

              return {
                id: e.id,
                engagement_id: e.engagement_id,
                title,
                start,
                end,
                status: st,
              };
            });

        setEvents(evts);
      } catch (err) {
        console.error("Error fetching calendar", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [providerId, currentDate, refreshToken]);

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center text-slate-500 sm:h-[320px]">
        <span className="text-sm">Loading calendar…</span>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]" style={{ height: "min(70vh, 700px)" }}>
      <BigCalendar
        localizer={localizer}
        events={events}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        step={30}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        eventPropGetter={(event) => {
          let backgroundColor = "#3174ad"; // default
          if (event.status === "BOOKED") backgroundColor = "#e74c3c"; // red
          else if (event.status === "AVAILABLE") backgroundColor = "#2ecc71"; // green
          else if (event.status === "UNAVAILABLE") backgroundColor = "#95a5a6"; // gray
          return { style: { backgroundColor, color: "white" } };
        }}
        onSelectEvent={(event) =>
          alert(
            event.status === "BOOKED"
              ? `This slot is BOOKED (Engagement #${event.engagement_id})`
              : `This slot is ${event.status}`
          )
        }
      />
    </div>
  );
}
