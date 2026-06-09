import React, { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Phone, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../Common/Card";
import { Button } from "../Button/button";
import { Badge } from "../Common/Badge/Badge";
import { getBookingTypeBadge, getServiceTitle, getStatusBadge } from "../Common/Booking/BookingUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface CustomerTodayBookingSlot {
  availability_id: number;
  engagement_id: number;
  slot_start_epoch?: number | null;
  slot_end_epoch?: number | null;
  engagement_start_epoch?: number | null;
  engagement_end_epoch?: number | null;
  start_time_ist: string | null;
  end_time_ist: string | null;
  booking_type: string;
  service_type: string;
  task_status: string;
  availability_status?: string | null;
  engagement_status?: string | null;
  assignment_status?: string | null;
  address: string | null;
  base_amount: number | null;
  serviceproviderid?: number | null;
  provider_firstname: string | null;
  provider_lastname: string | null;
  provider_mobileno: string | null;
  service_day_id: number | null;
  service_day_status: string | null;
  today_service?: {
    service_day_id: number;
    status: string;
    can_generate_otp?: boolean;
    otp_active?: boolean;
  } | null;
}

type TodayVisitFilter = "ALL" | "UPCOMING" | "IN_PROGRESS" | "COMPLETED";

type TodayVisitPhase = "UPCOMING" | "IN_PROGRESS" | "COMPLETED";

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

const epochToAmPm = (epoch?: number | null): string | null => {
  if (epoch == null || !Number.isFinite(epoch) || epoch <= 0) return null;
  return dayjs.unix(Number(epoch)).tz("Asia/Kolkata").format("h:mm A");
};

function isUnassigned(slot: CustomerTodayBookingSlot): boolean {
  const avail = String(slot.availability_status ?? "").toUpperCase();
  const assign = String(slot.assignment_status ?? "").toUpperCase();
  return (
    avail === "UNASSIGNED" ||
    assign === "UNASSIGNED" ||
    slot.serviceproviderid == null
  );
}

function deriveTodayVisitPhase(slot: CustomerTodayBookingSlot): TodayVisitPhase {
  const sd = String(slot.service_day_status ?? slot.today_service?.status ?? "").toUpperCase();
  if (sd === "COMPLETED" || sd === "DONE") return "COMPLETED";
  if (sd === "IN_PROGRESS" || sd === "STARTED") return "IN_PROGRESS";
  return "UPCOMING";
}

function statusForBadge(phase: TodayVisitPhase): string {
  if (phase === "COMPLETED") return "COMPLETED";
  if (phase === "IN_PROGRESS") return "IN_PROGRESS";
  return "NOT_STARTED";
}

function visitHelperMessage(
  slot: CustomerTodayBookingSlot,
  phase: TodayVisitPhase,
  startLabel: string | null
): string | null {
  if (isUnassigned(slot)) {
    return "We are finding a provider for your on-demand booking. You will be notified once someone accepts.";
  }
  if (phase === "UPCOMING") {
    return `Waiting for your provider to start${startLabel ? ` at ${startLabel}` : " at the scheduled time"}.`;
  }
  if (phase === "IN_PROGRESS") {
    return "Service in progress — generate an OTP when the provider is ready to finish.";
  }
  if (phase === "COMPLETED") {
    return "Today's visit is complete.";
  }
  return null;
}

interface CustomerTodayTasksCardProps {
  loading: boolean;
  todaySchedule: CustomerTodayBookingSlot[];
  otpLoadingId: number | null;
  generatedOTPs: Record<number, string>;
  onGenerateOtp: (slot: CustomerTodayBookingSlot) => void;
  onOpenBooking: (engagementId: number) => void;
  onCallProvider: (phone: string, name: string) => void;
  onOpenMap: (address: string) => void;
}

export default function CustomerTodayTasksCard({
  loading,
  todaySchedule,
  otpLoadingId,
  generatedOTPs,
  onGenerateOtp,
  onOpenBooking,
  onCallProvider,
  onOpenMap,
}: CustomerTodayTasksCardProps) {
  const [todayFilter, setTodayFilter] = useState<TodayVisitFilter>("ALL");

  const slotsWithPhase = useMemo(
    () =>
      todaySchedule.map((slot) => ({
        slot,
        phase: deriveTodayVisitPhase(slot),
      })),
    [todaySchedule]
  );

  const todayFilterTabs = useMemo(() => {
    const counts = { ACTIVE: 0, UPCOMING: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    slotsWithPhase.forEach(({ phase }) => {
      if (phase === "UPCOMING") {
        counts.UPCOMING += 1;
        counts.ACTIVE += 1;
      } else if (phase === "IN_PROGRESS") {
        counts.IN_PROGRESS += 1;
        counts.ACTIVE += 1;
      } else if (phase === "COMPLETED") {
        counts.COMPLETED += 1;
      }
    });
    const tabs: { value: TodayVisitFilter; label: string; count: number }[] = [
      { value: "ALL", label: "All", count: counts.ACTIVE },
      { value: "UPCOMING", label: "Upcoming", count: counts.UPCOMING },
      { value: "IN_PROGRESS", label: "In progress", count: counts.IN_PROGRESS },
    ];
    if (counts.COMPLETED > 0) {
      tabs.push({ value: "COMPLETED", label: "Completed", count: counts.COMPLETED });
    }
    return tabs;
  }, [slotsWithPhase]);

  const filteredSlots = useMemo(() => {
    if (todayFilter === "ALL") {
      return slotsWithPhase.filter(({ phase }) => phase !== "COMPLETED");
    }
    return slotsWithPhase.filter(({ phase }) => phase === todayFilter);
  }, [slotsWithPhase, todayFilter]);

  useEffect(() => {
    if (todayFilter === "COMPLETED") {
      const hasCompleted = slotsWithPhase.some(({ phase }) => phase === "COMPLETED");
      if (!hasCompleted) setTodayFilter("ALL");
    }
  }, [todayFilter, slotsWithPhase]);

  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/30 ring-1 ring-slate-900/5">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-100/90 bg-gradient-to-r from-sky-50/90 to-white py-3.5 sm:py-4">
        <div className="min-w-0">
          <CardTitle className="text-base font-bold text-slate-900 sm:text-lg">
            Today&apos;s service
          </CardTitle>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Visits scheduled for today (India time), ordered by start time.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/60">
          <Clock className="h-5 w-5" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        {loading ? (
          <div className="flex min-h-[72px] items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
          </div>
        ) : todaySchedule.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-600">
            No service scheduled for today.
          </div>
        ) : (
          <>
            <div className="mb-4 -mx-1 overflow-x-auto pb-0.5 scrollbar-thin">
              <div className="flex min-w-max gap-1.5 px-1 md:flex-wrap md:min-w-0 md:gap-2">
                {todayFilterTabs.map((tab) => {
                  const active = todayFilter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setTodayFilter(tab.value)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all md:px-3.5 md:text-sm ${
                        active
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums md:text-xs ${
                          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredSlots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-600">
                {todayFilter === "ALL" &&
                slotsWithPhase.length > 0 &&
                slotsWithPhase.every(({ phase }) => phase === "COMPLETED") ? (
                  <>
                    No active visits for today.{" "}
                    <button
                      type="button"
                      className="font-medium text-emerald-700 underline-offset-2 hover:underline"
                      onClick={() => setTodayFilter("COMPLETED")}
                    >
                      View completed visits
                    </button>
                  </>
                ) : (
                  "No visits in this category for today."
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredSlots.map(({ slot: b, phase }) => {
                  const unassigned = isUnassigned(b);
                  const providerName = unassigned
                    ? "Awaiting provider"
                    : [b.provider_firstname, b.provider_lastname].filter(Boolean).join(" ").trim() ||
                      "Provider";
                  const startLabel =
                    epochToAmPm(b.slot_start_epoch ?? b.engagement_start_epoch) ||
                    (b.start_time_ist ? formatTimeToAMPM(b.start_time_ist) : null);
                  const endLabel =
                    epochToAmPm(b.slot_end_epoch ?? b.engagement_end_epoch) ||
                    (b.end_time_ist ? formatTimeToAMPM(b.end_time_ist) : null);
                  const timeRange =
                    startLabel && endLabel
                      ? `${startLabel} – ${endLabel}`
                      : startLabel
                        ? startLabel
                        : "Time TBD";
                  const engId = b.engagement_id;
                  const otp = generatedOTPs[engId];
                  const canOtp = b.today_service?.can_generate_otp;
                  const otpActive = b.today_service?.otp_active;
                  const helperMessage = visitHelperMessage(b, phase, startLabel);

                  return (
                    <li
                      key={`${b.availability_id}-${b.engagement_id}`}
                      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-bold tabular-nums text-slate-900">{timeRange}</p>
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {getServiceTitle(b.service_type || "")}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            #{b.engagement_id} · {providerName}
                          </p>
                          {helperMessage ? (
                            <p className="text-xs text-slate-600">{helperMessage}</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          {getBookingTypeBadge(b.booking_type)}
                          {unassigned ? (
                            <Badge
                              variant="outline"
                              className="border-amber-200/80 bg-amber-50 text-xs text-amber-900"
                            >
                              Awaiting
                            </Badge>
                          ) : (
                            getStatusBadge(statusForBadge(phase))
                          )}
                          {b.provider_mobileno ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => onCallProvider(b.provider_mobileno!, providerName)}
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
                              onClick={() => onOpenMap(b.address!)}
                            >
                              <MapPin className="mr-1 h-3.5 w-3.5" />
                              Map
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => onOpenBooking(engId)}
                          >
                            View booking
                          </Button>
                        </div>
                      </div>

                      {phase === "IN_PROGRESS" && (
                        <div className="rounded-lg border border-green-100 bg-green-50/60 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={otpLoadingId === engId || !canOtp}
                              onClick={() => onGenerateOtp(b)}
                            >
                              {otpLoadingId === engId ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating…
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Generate & share OTP
                                </>
                              )}
                            </Button>
                            {otpActive && (
                              <Badge variant="outline" className="border-green-200 bg-white text-green-700">
                                OTP active
                              </Badge>
                            )}
                          </div>
                          {otpActive && otp && (
                            <div className="mt-3 rounded-md bg-white p-3 ring-1 ring-green-100">
                              <p className="text-xs font-medium text-slate-700">Share with your provider:</p>
                              <code className="text-lg font-bold tracking-wider text-slate-900">{otp}</code>
                            </div>
                          )}
                        </div>
                      )}

                      {phase === "COMPLETED" && (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                          <div className="flex items-start gap-2 text-sm text-emerald-900">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                            <p>Today&apos;s visit is complete.</p>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
