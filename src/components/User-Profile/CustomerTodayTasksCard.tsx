import React from "react";
import { Clock, MapPin, Phone, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../Common/Card";
import { Button } from "../Button/button";
import { Badge } from "../Common/Badge/Badge";
import { getBookingTypeBadge, getServiceTitle } from "../Common/Booking/BookingUtils";
import dayjs from "dayjs";

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
  address: string | null;
  base_amount: number | null;
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
  return dayjs.unix(Number(epoch)).format("h:mm A");
};

const visitStatusLabel = (sd: string | null | undefined): string => {
  const u = String(sd ?? "").toUpperCase();
  if (u === "IN_PROGRESS" || u === "STARTED") return "In progress";
  if (u === "COMPLETED" || u === "DONE") return "Completed";
  if (u === "SCHEDULED") return "Scheduled";
  return "Scheduled";
};

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
          <ul className="divide-y divide-slate-100">
            {todaySchedule.map((b) => {
              const providerName =
                [b.provider_firstname, b.provider_lastname].filter(Boolean).join(" ").trim() ||
                "Provider";
              const sd = String(b.service_day_status ?? b.today_service?.status ?? "").toUpperCase();
              const startLabel =
                epochToAmPm(b.slot_start_epoch) ||
                (b.start_time_ist ? formatTimeToAMPM(b.start_time_ist) : null);
              const endLabel =
                epochToAmPm(b.slot_end_epoch) ||
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
                      {sd === "SCHEDULED" && (
                        <p className="text-xs text-slate-600">
                          Waiting for your provider to start at{" "}
                          {startLabel || "the scheduled time"}.
                        </p>
                      )}
                      {sd === "IN_PROGRESS" && (
                        <p className="text-xs text-slate-600">
                          Service in progress — generate an OTP when the provider is ready to finish.
                        </p>
                      )}
                      {sd === "COMPLETED" && (
                        <p className="text-xs text-slate-600">Today&apos;s visit is complete.</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {getBookingTypeBadge(b.booking_type)}
                      <Badge
                        variant="outline"
                        className={
                          sd === "IN_PROGRESS"
                            ? "border-sky-200 bg-sky-50 text-sky-800"
                            : sd === "COMPLETED"
                              ? "border-green-200 bg-green-50 text-green-800"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                        }
                      >
                        {visitStatusLabel(sd)}
                      </Badge>
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

                  {sd === "IN_PROGRESS" && (
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
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
