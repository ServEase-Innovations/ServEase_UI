/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import { Button } from "../Button/button";
import { useToast } from "../hooks/use-toast";
import { X, CalendarOff, Ban, Loader2, Trash2, CalendarRange, ArrowRight } from "lucide-react";
import PaymentInstance from "src/services/paymentInstance";
import { useLanguage } from "src/context/LanguageContext";
import { ClipLoader } from "react-spinners";

export interface LeaveEngagementOption {
  value: string;
  label: string;
}

export interface ProviderLeave {
  leave_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  engagement_id: string | null;
  created_at?: string;
}

interface ProviderLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceProviderId: number | null;
  engagementOptions: LeaveEngagementOption[];
  onSuccess?: () => void;
}

function formatLeaveDate(s: string): string {
  const d = dayjs(s);
  return d.isValid() ? d.format("D MMM YYYY") : s;
}

const leavePickerZ = 2000;

export const ProviderLeaveDialog: React.FC<ProviderLeaveDialogProps> = ({
  open,
  onOpenChange,
  serviceProviderId,
  engagementOptions,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<ProviderLeave[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [from, setFrom] = useState<Dayjs | null>(null);
  const [to, setTo] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");
  const [engagementId, setEngagementId] = useState("");

  const today = useMemo(() => dayjs().startOf("day"), [open]);
  const leaveDayCount = useMemo(() => {
    if (!from || !to || to.isBefore(from, "day")) {
      return null;
    }
    return to.diff(from, "day") + 1;
  }, [from, to]);
  const datesValid = Boolean(
    from && to && !to.isBefore(from, "day")
  );

  const fetchLeaves = useCallback(async () => {
    if (!serviceProviderId) return;
    setLoading(true);
    try {
      const res = await PaymentInstance.get(
        `/api/service-providers/${serviceProviderId}/leaves`
      );
      setLeaves(res.data?.leaves || []);
    } catch {
      setLeaves([]);
      toast({
        title: t("messageError"),
        description: t("providerLeaveFetchFailed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [serviceProviderId, t, toast]);

  useEffect(() => {
    if (open) {
      setFrom(null);
      setTo(null);
      setReason("");
      setEngagementId("");
      void fetchLeaves();
    }
  }, [open, fetchLeaves]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceProviderId) return;
    if (!from || !to) {
      toast({ title: t("messageError"), description: t("providerSelectDates"), variant: "destructive" });
      return;
    }
    if (to.isBefore(from, "day")) {
      toast({
        title: t("messageError"),
        description: t("providerSelectDates"),
        variant: "destructive",
      });
      return;
    }
    const start = from.format("YYYY-MM-DD");
    const end = to.format("YYYY-MM-DD");
    setSaving(true);
    try {
      const body: Record<string, string | null | number> = {
        start_date: start,
        end_date: end,
        reason: reason.trim() || null,
      };
      if (engagementId) body.engagement_id = Number(engagementId);
      await PaymentInstance.post(`/api/service-providers/${serviceProviderId}/leaves`, body);
      toast({ title: t("messageSuccess"), description: t("providerLeaveCreated") });
      onSuccess?.();
      await fetchLeaves();
      setFrom(null);
      setTo(null);
      setReason("");
      setEngagementId("");
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Failed";
      toast({ title: t("messageError"), description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!serviceProviderId) return;
    setDeleting(id);
    try {
      await PaymentInstance.delete(
        `/api/service-providers/${serviceProviderId}/leaves/${id}`
      );
      toast({ title: t("messageSuccess"), description: t("providerLeaveCancelled") });
      onSuccess?.();
      await fetchLeaves();
    } catch (e: any) {
      const msg = e?.response?.data?.error || t("providerLeaveNotCancelled");
      toast({ title: t("messageError"), description: msg, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { className: "rounded-2xl" },
        backdrop: { className: "bg-slate-900/50 backdrop-blur-sm" },
      }}
    >
      <div className="relative border-b border-white/10 bg-gradient-to-r from-sky-800 via-slate-800 to-slate-900 px-4 py-3.5 pr-10 text-white sm:px-5 sm:py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/90">
          {t("serviceProvider")} {t("profile").toLowerCase()}
        </p>
        <h2 className="mt-0.5 flex items-center gap-2 text-lg font-bold">
          <CalendarOff className="h-5 w-5 text-sky-200" />
          {t("providerApplyLeave")}
        </h2>
        <IconButton
          onClick={() => onOpenChange(false)}
          className="!absolute !right-2 !top-2 h-8 w-8 !rounded-lg !text-white hover:!bg-white/10"
          size="small"
        >
          <X className="h-4 w-4" />
        </IconButton>
      </div>
      <DialogContent className="!p-0">
        <div className="space-y-5 p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-slate-600">{t("providerLeaveBlurb")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="overflow-hidden rounded-2xl border border-sky-200/70 bg-gradient-to-b from-white via-sky-50/40 to-slate-50/30 shadow-sm ring-1 ring-slate-900/[0.04]">
                <div className="flex flex-col gap-2 border-b border-sky-100/80 bg-sky-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm ring-1 ring-sky-200/50">
                      <CalendarRange className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {t("providerLeaveDateSectionTitle")}
                      </p>
                      <p className="text-xs text-slate-500">{t("providerLeaveDateHint")}</p>
                    </div>
                  </div>
                  {leaveDayCount != null && (
                    <div className="w-fit rounded-full border border-sky-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-sky-900 tabular-nums shadow-sm sm:ml-auto">
                      {leaveDayCount} calendar {leaveDayCount === 1 ? "day" : "days"}
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                    <DatePicker
                      label={t("providerLeaveFrom")}
                      format="D MMM YYYY"
                      value={from}
                      onChange={(v) => {
                        setFrom(v);
                        if (v && to && to.isBefore(v, "day")) {
                          setTo(null);
                        }
                      }}
                      minDate={today}
                      slotProps={{
                        popper: { sx: { zIndex: leavePickerZ } },
                        dialog: { sx: { zIndex: leavePickerZ } },
                        textField: {
                          size: "small",
                          fullWidth: true,
                        },
                      }}
                    />
                    <div className="hidden items-center justify-center pb-1 sm:flex">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200/60 bg-sky-50/80 text-sky-500">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                    <DatePicker
                      label={t("providerLeaveTo")}
                      format="D MMM YYYY"
                      value={to}
                      onChange={setTo}
                      minDate={from ?? today}
                      slotProps={{
                        popper: { sx: { zIndex: leavePickerZ } },
                        dialog: { sx: { zIndex: leavePickerZ } },
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: Boolean(to && from && to.isBefore(from, "day")),
                          helperText:
                            to && from && to.isBefore(from, "day")
                              ? t("providerLeaveEndBeforeStart")
                              : undefined,
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </LocalizationProvider>

            <div className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/40 p-4">
              <TextField
                label={t("providerLeaveReason")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                size="small"
                fullWidth
                multiline
                minRows={2}
              />
              <FormControl size="small" fullWidth>
                <InputLabel id="leave-engagement-label">{t("providerLeaveForEngagement")}</InputLabel>
                <Select
                  labelId="leave-engagement-label"
                  value={engagementId}
                  label={t("providerLeaveForEngagement")}
                  onChange={(e) => setEngagementId(e.target.value as string)}
                >
                  <MenuItem value="">
                    <em>{t("optionalNone")}</em>
                  </MenuItem>
                  {engagementOptions.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:pt-0">
              <Button
                type="submit"
                disabled={saving || !datesValid}
                className="!h-10 !w-full !justify-center !rounded-xl !bg-sky-600 !px-5 !text-white !shadow-sm !ring-0 hover:!bg-sky-700 disabled:!bg-slate-200 disabled:!text-slate-500 sm:!w-auto"
              >
                {saving ? <ClipLoader size={16} color="white" className="mr-2" /> : null}
                {t("submitLeave")}
              </Button>
            </div>
          </form>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <span className="h-px flex-1 bg-slate-200" aria-hidden />
              {t("providerLeaveList")}
              <span className="h-px flex-1 bg-slate-200" aria-hidden />
            </h3>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200/90 bg-slate-50/50 py-9 text-center">
                <p className="text-sm text-slate-500">{t("providerNoLeaves")}</p>
              </div>
            ) : (
              <ul className="max-h-60 space-y-2.5 overflow-y-auto pr-0.5">
                {leaves.map((lv) => {
                  const st = (lv.status || "").toLowerCase();
                  return (
                    <li
                      key={String(lv.leave_id)}
                      className="group flex items-stretch justify-between gap-3 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm sm:items-center"
                    >
                      <div className="w-0 min-w-0 flex-1 border-l-[3px] border-sky-500/90 py-2.5 pl-3.5 pr-1 sm:py-3 sm:pl-4">
                        <p className="text-sm font-semibold text-slate-900 sm:text-base">
                          <time dateTime={lv.start_date}>
                            {formatLeaveDate(lv.start_date)}
                          </time>
                          <span className="mx-1.5 font-normal text-slate-400" aria-hidden>
                            →
                          </span>
                          <time dateTime={lv.end_date}>
                            {formatLeaveDate(lv.end_date)}
                          </time>
                        </p>
                        {lv.reason ? (
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 sm:line-clamp-1">{lv.reason}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-1 self-center py-1 pr-2">
                        <span
                          className={`whitespace-nowrap rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize ${
                            st === "pending"
                              ? "bg-amber-100 text-amber-900"
                              : st === "approved" || st === "accepted" || st === "confirmed"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {lv.status}
                        </span>
                        {String(lv.status).toUpperCase() === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(String(lv.leave_id))}
                            disabled={deleting === String(lv.leave_id)}
                            className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                            title={t("providerCancelLeave")}
                          >
                            {deleting === String(lv.leave_id) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface UnavailBlock {
  id: string;
  date: string;
}

interface ProviderUnavailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceProviderId: number | null;
  month: string; // YYYY-MM
  onSuccess?: () => void;
}

export const ProviderUnavailabilityDialog: React.FC<ProviderUnavailabilityDialogProps> = ({
  open,
  onOpenChange,
  serviceProviderId,
  month: monthProp,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<UnavailBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [viewMonth, setViewMonth] = useState(monthProp);

  useEffect(() => {
    if (open) setViewMonth(monthProp);
  }, [open, monthProp]);

  const loadBlocks = useCallback(async () => {
    if (!serviceProviderId || !open) return;
    setLoading(true);
    try {
      const res = await PaymentInstance.get(
        `/api/service-providers/${serviceProviderId}/availability/blocks?month=${encodeURIComponent(
          viewMonth
        )}`
      );
      setBlocks((res.data?.blocks || []).map((b: { id: number; date: string }) => ({ id: String(b.id), date: b.date })));
    } catch {
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, [serviceProviderId, viewMonth, open]);

  useEffect(() => {
    if (open) {
      setStart("");
      setEnd("");
      void loadBlocks();
    }
  }, [open, loadBlocks]);

  const addRange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceProviderId || !start || !end) {
      toast({ title: t("messageError"), description: t("providerSelectDates"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await PaymentInstance.post(
        `/api/service-providers/${serviceProviderId}/availability/blocks`,
        { start_date: start, end_date: end }
      );
      const errList = res.data?.errors;
      if (errList && errList.length) {
        toast({
          title: t("messageSuccess"),
          description: t("providerSkipBookingDays"),
          variant: "default",
        });
      } else {
        toast({ title: t("messageSuccess"), description: t("providerBlocksCreated") });
      }
      onSuccess?.();
      await loadBlocks();
      setStart("");
      setEnd("");
    } catch (e2: any) {
      const msg = e2?.response?.data?.error || t("providerBlockFailed");
      toast({ title: t("messageError"), description: String(msg), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!serviceProviderId) return;
    try {
      await PaymentInstance.delete(
        `/api/service-providers/${serviceProviderId}/availability/blocks/${id}`
      );
      toast({ title: t("messageSuccess"), description: t("providerBlockRemoved") });
      onSuccess?.();
      await loadBlocks();
    } catch (e2: any) {
      const msg = e2?.response?.data?.error || t("providerBlockFailed");
      toast({ title: t("messageError"), description: String(msg), variant: "destructive" });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { className: "rounded-2xl" },
        backdrop: { className: "bg-slate-900/50 backdrop-blur-sm" },
      }}
    >
      <div className="relative border-b border-white/10 bg-gradient-to-r from-slate-800 via-slate-800 to-sky-900 px-4 py-3.5 pr-10 text-white sm:px-5 sm:py-4">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Ban className="h-5 w-5 text-sky-200" />
          {t("providerMarkUnavailable")}
        </h2>
        <IconButton
          onClick={() => onOpenChange(false)}
          className="!absolute !right-2 !top-2 h-8 w-8 !rounded-lg !text-white hover:!bg-white/10"
          size="small"
        >
          <X className="h-4 w-4" />
        </IconButton>
      </div>
      <DialogContent className="!p-0">
        <div className="space-y-4 p-4 sm:p-5">
          <TextField
            type="month"
            label={t("providerViewMonth")}
            value={viewMonth}
            onChange={(e) => setViewMonth(e.target.value)}
            size="small"
            className="max-w-xs"
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText={t("providerUnavailBlurb")}
          />
          <form
            onSubmit={addRange}
            className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/50 p-4"
          >
            <p className="text-sm font-medium text-slate-700">{t("providerAddBlockRange")}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                type="date"
                label={t("providerLeaveFrom")}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label={t("providerLeaveTo")}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="!w-full !justify-center !bg-slate-800 !text-white !border-slate-800 sm:!w-auto"
            >
              {saving ? <ClipLoader size={16} color="white" className="mr-2" /> : null}
              {t("providerAddBlock")}
            </Button>
          </form>

          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
              {t("providerBlockedList")}
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
              </div>
            ) : blocks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                {t("providerNoBlocks")}
              </p>
            ) : (
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {blocks.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <span className="font-mono text-sm text-slate-800">{b.date}</span>
                    <button
                      type="button"
                      onClick={() => void remove(b.id)}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      {t("providerRemoveBlock")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
