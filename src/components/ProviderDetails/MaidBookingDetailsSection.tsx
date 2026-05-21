/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { update } from "../../features/bookingType/bookingTypeSlice";
import DribbbleDateTimePicker from "../Common/DribbbleDateTimePicker";
import { useLanguage } from "src/context/LanguageContext";
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
  if (adjusted.hour() < 5) adjusted = adjusted.hour(5).minute(0);
  else if (adjusted.hour() >= 22) adjusted = adjusted.hour(21).minute(55);
  return adjusted;
}

function buildReduxBookingPatch(
  preference: string,
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  startTime: Dayjs | null,
  endTime: Dayjs | null,
  existing: Record<string, unknown> | null
) {
  const startIso = startDate?.toISOString() ?? startTime?.toISOString() ?? "";
  const endIso =
    endDate?.toISOString() ??
    (preference === "Monthly" && startDate
      ? startDate.add(1, "month").toISOString()
      : startIso);

  let timeRange = "";
  let timeSlot = "";
  if (preference === "Date") {
    timeRange = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    timeSlot = timeRange;
  } else if (preference === "Short term") {
    timeRange = startTime?.format("HH:mm") || "";
    timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
  } else {
    timeRange = startTime?.format("HH:mm") || "";
    timeSlot = startTime?.format("HH:mm") || "";
  }

  return {
    ...(existing ?? {}),
    startDate: startIso ? startIso.split("T")[0] : "",
    endDate: endIso ? endIso.split("T")[0] : "",
    timeRange,
    bookingPreference: preference,
    startTime: startTime?.format("HH:mm") || "",
    endTime: endTime?.format("HH:mm") || "",
    timeSlot,
  };
}

interface MaidBookingDetailsSectionProps {
  active: boolean;
}

const MaidBookingDetailsSection: React.FC<MaidBookingDetailsSectionProps> = ({ active }) => {
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

  const hydrateFromRedux = useCallback(() => {
    const pref = String(bookingType?.bookingPreference ?? "Date");
    const dateStr =
      bookingType?.startDate != null
        ? String(bookingType.startDate).split("T")[0]
        : dayjs().format("YYYY-MM-DD");

    let sd = bookingType?.startDate ? dayjs(dateStr) : null;
    let ed = bookingType?.endDate ? dayjs(String(bookingType.endDate).split("T")[0]) : null;

    let st =
      parseTimeOnDate(dateStr, String(bookingType?.startTime ?? "")) ??
      (sd ? sd.hour(9).minute(0) : null);
    let et =
      parseTimeOnDate(dateStr, String(bookingType?.endTime ?? "")) ??
      (st ? st.add(1, "hour") : null);

    const timeRange = String(bookingType?.timeRange ?? "");
    if ((!st || !et) && timeRange.includes("-")) {
      const [startPart, endPart] = timeRange.split("-").map((s) => s.trim());
      st = st ?? parseTimeOnDate(dateStr, startPart);
      et = et ?? parseTimeOnDate(dateStr, endPart);
    }

    if (pref === "Date" && (!st || !et)) {
      const adjusted = defaultOnDemandStart();
      st = adjusted;
      et = adjusted.add(1, "hour");
      sd = adjusted;
      ed = et;
    }

    setStartDate(sd);
    setEndDate(ed ?? sd);
    setStartTime(st);
    setEndTime(et);
    setValidationMsg(null);
  }, [bookingType]);

  useEffect(() => {
    if (active) {
      hydrateFromRedux();
      setScheduleOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const persist = useCallback(
    (
      nextStartDate: Dayjs | null,
      nextEndDate: Dayjs | null,
      nextStartTime: Dayjs | null,
      nextEndTime: Dayjs | null
    ) => {
      dispatch(
        update(
          buildReduxBookingPatch(
            preference,
            nextStartDate,
            nextEndDate,
            nextStartTime,
            nextEndTime,
            bookingType
          )
        )
      );
      setValidationMsg(null);
    },
    [bookingType, dispatch, preference]
  );

  /** Push hydrated schedule into Redux so pricing / checkout see the same times. */
  useEffect(() => {
    if (!active || !startTime || !endTime) return;
    const reduxStart = String(bookingType?.startTime ?? "");
    const reduxEnd = String(bookingType?.endTime ?? "");
    if (reduxStart && reduxEnd) return;
    persist(startDate, endDate, startTime, endTime);
  }, [active, bookingType, startDate, endDate, startTime, endTime, persist]);

  const planLabel = useMemo(() => {
    const pref = preference.toLowerCase();
    if (pref === "date") return "On-demand";
    if (pref === "short term") return "Short-term";
    return "Monthly";
  }, [preference]);

  const durationHours =
    startTime && endTime ? Math.max(1, endTime.diff(startTime, "hour")) : 1;

  const applyStartDateTime = (selected: Dayjs) => {
    const now = dayjs();
    let adjusted = selected;
    if (selected.isSame(now, "day")) {
      const nowPlus30 = now.add(30, "minute");
      if (adjusted.isBefore(nowPlus30)) adjusted = nowPlus30;
      if (adjusted.hour() < 5) adjusted = adjusted.hour(5).minute(0);
      else if (adjusted.hour() >= 22) adjusted = adjusted.hour(21).minute(55);
    } else if (adjusted.hour() === 0 && adjusted.minute() === 0) {
      adjusted = adjusted.hour(5).minute(0);
    }

    const nextEnd = adjusted.add(durationHours, "hour");
    const monthlyEnd = adjusted.add(1, "month");
    setStartDate(adjusted);
    setStartTime(adjusted);
    setEndTime(nextEnd);
    if (preference === "Date") setEndDate(nextEnd);
    if (preference === "Monthly") setEndDate(monthlyEnd);
    persist(
      adjusted,
      preference === "Monthly" ? monthlyEnd : preference === "Date" ? nextEnd : endDate,
      adjusted,
      nextEnd
    );
  };

  const setDurationHours = (hours: number) => {
    if (!startTime) return;
    const newEnd = startTime.add(hours, "hour");
    if (newEnd.hour() >= 22) {
      setValidationMsg(t("timeHourRestriction"));
      return;
    }
    setEndTime(newEnd);
    if (preference === "Date") setEndDate(newEnd);
    persist(startDate, preference === "Date" ? newEnd : endDate, startTime, newEnd);
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
    if (selected.hour() < 5 || selected.hour() > 21) {
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
            {durationHours} {t("hourUnit")}
            {durationHours > 1 ? "s" : ""}
          </MaidSummaryValue>
        </MaidSummaryTile>
      </MaidSummaryGrid>

      {(preference === "Date" || preference === "Short term") && (
        <>
          <MaidSectionHead>
            <MaidSectionTitle>{t("serviceDuration")}</MaidSectionTitle>
          </MaidSectionHead>
          <MaidDurationSection>
            <MaidDurationHint>
              {preference === "Short term"
                ? "Hours per visit — price updates for each day in your range."
                : t("durationMessage")}
            </MaidDurationHint>
            <MaidDurationChips>
              {DURATION_OPTIONS.map((h) => {
                const disabled =
                  !startTime || startTime.add(h, "hour").hour() >= 22;
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
                value={startTime?.toDate() ?? startDate?.toDate()}
                maxDate={maxDate21Days.toDate()}
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
                }}
                onChange={({ startDate: rangeStart, endDate: rangeEnd, time }) => {
                  const start = dayjs(rangeStart);
                  let end = dayjs(rangeEnd);
                  if (end.diff(start, "day") > 14) {
                    end = start.add(14, "day");
                    setValidationMsg("Short-term bookings are limited to 15 days.");
                  } else {
                    setValidationMsg(null);
                  }
                  const [tPart, meridian] = time.split(" ");
                  let hour = Number(tPart.split(":")[0]);
                  if (meridian === "PM" && hour !== 12) hour += 12;
                  if (meridian === "AM" && hour === 12) hour = 0;
                  const startWithTime = start.hour(hour).minute(0);
                  if (!validateSelection(startWithTime)) return;
                  const endT = startWithTime.add(durationHours, "hour");
                  setStartDate(startWithTime);
                  setStartTime(startWithTime);
                  setEndDate(end);
                  setEndTime(endT);
                  persist(startWithTime, end, startWithTime, endT);
                }}
              />
            </MaidPickerShell>
          )}

          {preference === "Monthly" && (
            <MaidPickerShell>
              <DribbbleDateTimePicker
                mode="single"
                value={startTime?.toDate() ?? startDate?.toDate()}
                maxDate={maxDate90Days.toDate()}
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
