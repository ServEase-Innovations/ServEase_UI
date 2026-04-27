import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Badge } from "../../Common/Badge";
import {
  Search,
  Download,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CalendarRange,
  User,
  Building2,
  IndianRupee,
  Hash,
  X,
  Copy,
  Check,
  Briefcase,
} from "lucide-react";
import { Input } from "../../Common/input";
import { cn } from "../../utils";
import paymentInstance from "src/services/paymentInstance";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";

type AdminPaymentSummary = {
  success_count?: string | number;
  failed_count?: string | number;
  open_count?: string | number;
  total_all?: string | number;
  total_transactions?: string | number;
  total_collected?: string | number;
  platform_fee?: string | number;
  gst?: string | number;
  net_revenue?: string | number;
};

type AdminPaymentRow = {
  payment_id: number;
  engagement_id: number;
  base_amount: string | number;
  platform_fee: string | number;
  gst: string | number;
  total_amount: string | number;
  payment_mode: string | null;
  transaction_id: string | null;
  status: string | null;
  created_at: string;
  razorpay_order_id?: string | null;
  booking_type?: string;
  service_type?: string;
  customer_firstname?: string;
  customer_lastname?: string;
  provider_firstname?: string | null;
  provider_lastname?: string | null;
};

const PAGE_SIZE = 25;

function n(v: string | number | null | undefined): number {
  if (v == null) {
    return 0;
  }
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function formatInr(amount: string | number | null | undefined): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n(amount));
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusVariant(s: string | null | undefined): "default" | "secondary" | "destructive" {
  const u = String(s || "").toUpperCase();
  if (u === "SUCCESS") {
    return "default";
  }
  if (u === "FAILED" || u === "FAIL") {
    return "destructive";
  }
  return "secondary";
}

function getStr(d: Record<string, unknown>, key: string): string {
  const v = d[key];
  if (v == null) {
    return "";
  }
  return String(v);
}

function formatDetailValue(key: string, v: unknown): string {
  if (v == null) {
    return "—";
  }
  const l = key.toLowerCase();
  if (l.includes("amount") || l === "base_amount" || l === "platform_fee" || l === "gst" || l === "total_amount") {
    return formatInr(v as string | number);
  }
  if (l.includes("date") || l.includes("_at") || l === "start_date" || l === "end_date") {
    return formatDate(String(v));
  }
  if (typeof v === "object") {
    return JSON.stringify(v);
  }
  return String(v);
}

const DETAIL_FIELD_LABELS: Record<string, string> = {
  payment_id: "Payment ID",
  engagement_id: "Engagement ID",
  base_amount: "Base amount",
  platform_fee: "Platform fee",
  gst: "GST (on platform fee)",
  total_amount: "Total charged",
  payment_mode: "Payment mode",
  transaction_id: "Razorpay payment / txn id",
  status: "Status",
  created_at: "Created",
  updated_at: "Last updated",
  razorpay_order_id: "Razorpay order id",
  booking_type: "Booking type",
  service_type: "Service type",
  start_date: "Service start",
  end_date: "Service end",
  customer_firstname: "Customer first name",
  customer_lastname: "Customer last name",
  mobileno: "Customer mobile",
  provider_firstname: "Provider first name",
  provider_lastname: "Provider last name",
};

const KNOWN_DETAIL_KEYS = new Set(Object.keys(DETAIL_FIELD_LABELS));

function CopyChip({ value, label = "Copy" }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  if (!value || value === "—") {
    return null;
  }
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          window.setTimeout(() => setOk(false), 2000);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-800"
    >
      {ok ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {ok ? "Copied" : label}
    </button>
  );
}

function PaymentDetailView({ data }: { data: Record<string, unknown> }) {
  const st = getStr(data, "status");
  const stU = st.toUpperCase();
  const customerName = [getStr(data, "customer_firstname"), getStr(data, "customer_lastname")].filter(Boolean).join(" ");
  const providerName = [getStr(data, "provider_firstname"), getStr(data, "provider_lastname")].filter(Boolean).join(" ");

  const otherEntries = useMemo(() => {
    return Object.keys(data).filter((k) => !KNOWN_DETAIL_KEYS.has(k) && k !== "error");
  }, [data]);

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-4",
          stU === "SUCCESS" && "border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 to-white",
          stU === "FAILED" && "border-rose-200/90 bg-gradient-to-br from-rose-50/80 to-white",
          stU !== "SUCCESS" && stU !== "FAILED" && "border-slate-200/90 bg-slate-50/50"
        )}
      >
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
          <Badge variant={statusVariant(st)} className="text-sm">
            {st || "—"}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
            {formatInr(data.total_amount as string | number | undefined)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatDate(getStr(data, "created_at"))}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <IndianRupee className="h-4 w-4 text-slate-500" />
          Amount breakdown
        </h3>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white">
          {(
            [
              ["base_amount", "Base (service)"],
              ["platform_fee", "Platform fee"],
              ["gst", "GST"],
              ["total_amount", "Total"],
            ] as const
          ).map(([key, label]) => (
            <li key={key} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl">
              <span className="text-slate-600">{label}</span>
              <span className="font-mono font-medium tabular-nums text-slate-900">{formatDetailValue(key, data[key])}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Hash className="h-4 w-4 text-slate-500" />
          Reference ids
        </h3>
        <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3">
          {(
            [
              ["payment_id", "Payment id"],
              ["engagement_id", "Engagement id"],
              ["transaction_id", "Transaction id"],
              ["razorpay_order_id", "Razorpay order id"],
            ] as const
          ).map(([key, short]) => {
            const raw = getStr(data, key);
            const show = raw || "—";
            return (
              <div key={key} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="shrink-0 text-xs text-slate-500">{short}</span>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <code className="max-w-full truncate rounded bg-white px-2 py-0.5 text-left text-xs text-slate-800 ring-1 ring-slate-200/80">
                    {show}
                  </code>
                  {raw ? <CopyChip value={raw} /> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Briefcase className="h-4 w-4 text-slate-500" />
          Engagement
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["booking_type", "Booking"],
              ["service_type", "Service"],
              ["start_date", "Start"],
              ["end_date", "End"],
            ] as const
          ).map(([key]) => (
            <div key={key} className="rounded-lg border border-slate-200/60 bg-white px-3 py-2">
              <p className="text-xs text-slate-500">{DETAIL_FIELD_LABELS[key]}</p>
              <p className="text-sm font-medium text-slate-900">{formatDetailValue(key, data[key])}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <User className="h-4 w-4 text-slate-500" />
          Customer
        </h3>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3">
          <p className="text-base font-semibold text-slate-900">{customerName || "—"}</p>
          {getStr(data, "mobileno") ? <p className="mt-1 text-sm text-slate-600">{getStr(data, "mobileno")}</p> : null}
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Building2 className="h-4 w-4 text-slate-500" />
          Provider
        </h3>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3">
          <p className="text-base font-semibold text-slate-900">{providerName || "—"}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Other</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["payment_mode", "updated_at"] as const).map((key) => (
            <div key={key} className="rounded-lg border border-slate-200/60 bg-slate-50/50 px-3 py-2">
              <p className="text-xs text-slate-500">{DETAIL_FIELD_LABELS[key]}</p>
              <p className="text-sm text-slate-900">{formatDetailValue(key, data[key])}</p>
            </div>
          ))}
        </div>
      </div>

      {otherEntries.length > 0 && (
        <details className="group rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-3 text-sm">
          <summary className="cursor-pointer list-none font-medium text-slate-600 outline-none marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="group-open:text-sky-800">+ {otherEntries.length} more field{otherEntries.length === 1 ? "" : "s"}</span>
          </summary>
          <dl className="mt-3 space-y-2 border-t border-slate-200/80 pt-3">
            {otherEntries.map((k) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs text-slate-500">{k}</dt>
                <dd className="mt-0.5 break-words font-mono text-xs text-slate-800">
                  {formatDetailValue(k, data[k])}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}

const Payments = () => {
  const [summary, setSummary] = useState<AdminPaymentSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);

  const [rows, setRows] = useState<AdminPaymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [engagementIdInput, setEngagementIdInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [engagementIdFilter, setEngagementIdFilter] = useState("");

  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    setSummaryError(null);
    setSummaryLoading(true);
    try {
      const { data } = await paymentInstance.get<{ success: boolean; summary: AdminPaymentSummary }>(
        "/api/admin/payments/summary"
      );
      if (data?.success && data.summary) {
        setSummary(data.summary);
      } else {
        setSummaryError("Invalid summary response");
        setSummary(null);
      }
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setSummaryError(err?.response?.data?.error || err?.message || "Could not load payment summary");
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadList = useCallback(async () => {
    setListError(null);
    setListLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("limit", String(PAGE_SIZE));
      q.set("offset", String(offset));
      if (statusFilter) {
        q.set("status", statusFilter);
      }
      if (engagementIdFilter.trim()) {
        q.set("engagement_id", engagementIdFilter.trim());
      }
      if (dateFrom) {
        q.set("from", new Date(dateFrom + "T00:00:00.000Z").toISOString());
      }
      if (dateTo) {
        q.set("to", new Date(dateTo + "T23:59:59.999Z").toISOString());
      }
      const { data } = await paymentInstance.get<{
        success: boolean;
        payments: AdminPaymentRow[];
        total?: number;
        error?: string;
      }>(`/api/admin/payments?${q.toString()}`);
      if (!data?.success) {
        setListError(data?.error || "Failed to load payments");
        setRows([]);
        return;
      }
      setRows(data.payments || []);
      setTotal(Number(data.total) || 0);
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setListError(err?.response?.data?.error || err?.message || "Could not load payments");
      setRows([]);
    } finally {
      setListLoading(false);
    }
  }, [offset, statusFilter, engagementIdFilter, dateFrom, dateTo]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const applyEngagementFromInput = useCallback(() => {
    setOffset(0);
    setEngagementIdFilter(engagementIdInput.trim());
  }, [engagementIdInput]);

  const displayRows = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    if (!t) {
      return rows;
    }
    return rows.filter((r) => {
      const blob = [
        r.payment_id,
        r.engagement_id,
        r.transaction_id,
        r.status,
        r.customer_firstname,
        r.customer_lastname,
        r.provider_firstname,
        r.provider_lastname,
        r.booking_type,
        r.service_type,
        r.razorpay_order_id,
      ]
        .map((x) => (x != null ? String(x).toLowerCase() : ""))
        .join(" ");
      return blob.includes(t);
    });
  }, [rows, searchText]);

  const openDetail = useCallback(
    async (id: number) => {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetail(null);
      try {
        const { data } = await paymentInstance.get<{ success: boolean; payment: Record<string, unknown> }>(
          `/api/admin/payments/${id}`
        );
        if (data?.success && data.payment) {
          setDetail(data.payment);
        } else {
          setDetail({ error: "Not found" });
        }
      } catch (e) {
        setDetail({ error: String((e as Error).message || e) });
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  const exportCsv = useCallback(() => {
    if (!displayRows.length) {
      return;
    }
    const headers = [
      "payment_id",
      "engagement_id",
      "status",
      "total_amount",
      "base_amount",
      "platform_fee",
      "gst",
      "payment_mode",
      "transaction_id",
      "razorpay_order_id",
      "created_at",
      "customer",
      "provider",
    ] as const;
    const lines = [headers.join(",")].concat(
      displayRows.map((r) => {
        const c = [r.customer_firstname, r.customer_lastname].filter(Boolean).join(" ");
        const p = [r.provider_firstname, r.provider_lastname].filter(Boolean).join(" ");
        const vals = [
          r.payment_id,
          r.engagement_id,
          r.status ?? "",
          n(r.total_amount),
          n(r.base_amount),
          n(r.platform_fee),
          n(r.gst),
          r.payment_mode ?? "",
          r.transaction_id ?? "",
          r.razorpay_order_id ?? "",
          r.created_at,
          c,
          p,
        ];
        return vals.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",");
      })
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [displayRows]);

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
  const canPrev = offset > 0;
  const canNext = offset + rows.length < total;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Payments</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Real transaction data from the payments service. Filter by status and date, open a row for full detail, and export
            the current table view to CSV.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadSummary()} disabled={summaryLoading} className="shrink-0">
            {summaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh stats</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void loadList();
            }}
            disabled={listLoading}
            className="shrink-0"
          >
            {listLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh list</span>
          </Button>
          <Button type="button" size="sm" onClick={exportCsv} disabled={!displayRows.length} className="shrink-0">
            <Download className="h-4 w-4" />
            <span className="ml-2">Export page (CSV)</span>
          </Button>
        </div>
      </div>

      {summaryError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          <strong>Summary: </strong>
          {summaryError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/90 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            {summaryLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : (
              <div className="flex items-start gap-3">
                <TrendingUp className="h-7 w-7 shrink-0 text-emerald-600" aria-hidden />
                <div>
                  <div className="text-xl font-bold tabular-nums text-slate-900">{formatInr(summary?.total_collected)}</div>
                  <p className="text-xs text-slate-500">Total collected (successful)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-slate-200/90 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            {summaryLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : (
              <div className="flex items-start gap-3">
                <CreditCard className="h-7 w-7 shrink-0 text-sky-600" aria-hidden />
                <div>
                  <div className="text-xl font-bold tabular-nums text-slate-900">{formatInr(summary?.platform_fee)}</div>
                  <p className="text-xs text-slate-500">Platform fee (incl. GST on fee)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-slate-200/90 bg-emerald-50/30 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            {summaryLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" aria-hidden />
                <div>
                  <div className="text-xl font-bold tabular-nums text-slate-900">{n(summary?.success_count).toLocaleString()}</div>
                  <p className="text-xs text-slate-500">Successful payments</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-slate-200/90 bg-rose-50/30 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            {summaryLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : (
              <div className="flex items-start gap-3">
                <XCircle className="h-7 w-7 shrink-0 text-rose-600" aria-hidden />
                <div>
                  <div className="text-xl font-bold tabular-nums text-slate-900">{n(summary?.failed_count).toLocaleString()}</div>
                  <p className="text-xs text-slate-500">Failed / declined</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {summary && !summaryLoading && (
        <p className="text-xs text-slate-500">
          Open / pending: <span className="font-semibold text-slate-700">{n(summary.open_count).toLocaleString()}</span> · Net
          revenue (fee − fee-GST) estimate: <span className="font-mono text-slate-800">{formatInr(summary.net_revenue)}</span> ·
          Total rows in DB: {n(summary.total_all).toLocaleString()}
        </p>
      )}

      {listError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-semibold">List error. </span>
              {listError}
            </div>
          </div>
        </div>
      )}

      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Showing {listLoading ? "—" : `${offset + 1}–${offset + rows.length}`} of {total.toLocaleString()} (page {page} of{" "}
                {pageCount})
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-full min-w-[8rem] sm:w-auto">
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="pm-status">
                  Status
                </label>
                <select
                  id="pm-status"
                  className="h-9 w-full min-w-[7rem] rounded-md border border-slate-200 bg-white px-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setOffset(0);
                    setStatusFilter(e.target.value);
                  }}
                >
                  <option value="">All</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="pm-from">
                  From
                </label>
                <Input
                  id="pm-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setOffset(0);
                  }}
                  className="h-9 w-[9.5rem] border-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="pm-to">
                  To
                </label>
                <Input
                  id="pm-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setOffset(0);
                  }}
                  className="h-9 w-[9.5rem] border-slate-200"
                />
              </div>
              <div className="flex w-full min-w-0 max-w-sm flex-1 items-end gap-1 sm:max-w-xs">
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="pm-eng">
                    Engagement ID
                  </label>
                  <Input
                    id="pm-eng"
                    placeholder="e.g. 1234"
                    value={engagementIdInput}
                    onChange={(e) => setEngagementIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyEngagementFromInput()}
                    className="h-9 border-slate-200"
                  />
                </div>
                <Button type="button" variant="secondary" className="h-9 shrink-0" onClick={applyEngagementFromInput}>
                  Filter
                </Button>
              </div>
            </div>
            <div className="relative w-full min-w-0 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-9 w-full pl-9 border-slate-200"
                placeholder="Filter this page (search)…"
                aria-label="Filter current page"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {listLoading && !rows.length ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Engagement</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Provider</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5">Fee / GST</th>
                    <th className="p-2.5">Mode</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">When</th>
                    <th className="p-2.5"> </th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((r) => {
                    const cust = [r.customer_firstname, r.customer_lastname].filter(Boolean).join(" ");
                    const prov = [r.provider_firstname, r.provider_lastname].filter(Boolean).join(" ");
                    return (
                      <tr key={r.payment_id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                        <td className="p-2.5 font-mono text-xs text-slate-800">{r.payment_id}</td>
                        <td className="p-2.5 font-mono text-xs text-slate-600">{r.engagement_id}</td>
                        <td className="p-2.5 text-slate-800">{cust || "—"}</td>
                        <td className="p-2.5 text-slate-700">{prov || "—"}</td>
                        <td className="p-2.5 font-medium tabular-nums text-slate-900">{formatInr(r.total_amount)}</td>
                        <td className="p-2.5 text-xs tabular-nums text-slate-600">
                          {formatInr(r.platform_fee)} / {formatInr(r.gst)}
                        </td>
                        <td className="p-2.5 text-slate-600">{r.payment_mode || "—"}</td>
                        <td className="p-2.5">
                          <Badge variant={statusVariant(r.status)}>{r.status || "—"}</Badge>
                        </td>
                        <td className="p-2.5 text-xs text-slate-500">{formatDate(r.created_at)}</td>
                        <td className="p-2.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-sky-700"
                            onClick={() => void openDetail(r.payment_id)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!listLoading && !displayRows.length && !listError && (
            <p className="py-12 text-center text-sm text-slate-500">No payment rows for these filters.</p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
            <div className="inline-flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                disabled={!canPrev || listLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                disabled={!canNext || listLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs sm:text-sm">
              <CalendarRange className="mb-0.5 mr-1 inline h-3.5 w-3.5 text-slate-400" />
              {PAGE_SIZE} per page
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        aria-labelledby="payment-detail-title"
        slotProps={{
          paper: {
            elevation: 0,
            className: cn(
              "overflow-hidden rounded-2xl !border !border-slate-200 !bg-white shadow-2xl",
              "ring-1 ring-slate-900/5"
            ),
            sx: { backgroundImage: "none" },
          },
          backdrop: {
            className: "bg-slate-950/50 supports-[backdrop-filter]:backdrop-blur-sm",
          },
        }}
        transitionDuration={220}
      >
        <DialogTitle
          id="payment-detail-title"
          className="!m-0 flex !min-h-0 items-start !gap-0 !py-0"
        >
          <div
            className="flex w-full items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3.5 pr-1 sm:px-5 sm:py-4"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-800 shadow-sm ring-1 ring-sky-200/50"
                aria-hidden
              >
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">Payment details</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
                  Razorpay, engagement, and customer context
                </p>
              </div>
            </div>
            <IconButton
              onClick={() => setDetailOpen(false)}
              size="small"
              aria-label="Close payment details"
              className="shrink-0 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className="!border-t-0 !bg-white !px-4 !py-4 !sm:px-5 !sm:py-5">
          {detailLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
              <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-sm">
                <Loader2 className="mx-auto h-9 w-9 animate-spin text-sky-600" />
                <p className="mt-3 text-center text-sm font-medium">Loading details…</p>
              </div>
            </div>
          )}
          {!detailLoading && detail && (detail as { error?: string }).error && (
            <div
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/95 px-3 py-2.5 text-sm text-rose-800"
              role="alert"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{(detail as { error: string }).error}</span>
            </div>
          )}
          {!detailLoading && detail && !(detail as { error?: string }).error && <PaymentDetailView data={detail} />}
        </DialogContent>
        <DialogActions className="!justify-between !border-t !border-slate-200/80 !bg-white !px-4 !py-3 !sm:px-5 !sm:py-3.5">
          <p className="text-xs text-slate-500">
            <IndianRupee className="mb-0.5 mr-0.5 inline h-3.5 w-3.5 text-slate-400" aria-hidden />
            Amounts in <span className="font-medium text-slate-600">INR</span> unless otherwise noted
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDetailOpen(false)}
            className="shrink-0 min-w-[5.5rem] border-slate-200/90 shadow-sm"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Payments;
