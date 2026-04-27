import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Input } from "../../Common/input";
import { Label } from "../../Common/label";
import { Badge } from "../../Common/Badge";
import { cn } from "../../utils";
import {
  AlertCircle,
  BookOpen,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Landmark,
  Loader2,
  PiggyBank,
  Receipt,
  RefreshCw,
  Scale,
} from "lucide-react";
import paymentInstance from "src/services/paymentInstance";

type LedgerRow = {
  date: string;
  type: string;
  reference: string;
  engagement_id: number | null;
  debit: number | string;
  credit: number | string;
  balance: number;
  note: string;
  created_at: string;
};

type LedgerSummary = {
  total_collected?: string | number;
  platform_revenue?: string | number;
  gst_payable?: string | number;
  provider_payouts?: string | number;
  refunds?: string | number;
  net_balance?: string | number;
};

const PAGE_SIZES = [25, 50, 100] as const;

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function defaultFromTo() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: ymd(start), to: ymd(now) };
}

function n(v: string | number | null | undefined): number {
  if (v == null) {
    return 0;
  }
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function formatInrAmount(amount: string | number | null | undefined): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n(amount));
}

function formatRowDate(p: ValueFormatterParams<LedgerRow, string | undefined>) {
  const v = p.value;
  if (!v) {
    return "—";
  }
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    return String(v);
  }
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const TypeCell = (p: ICellRendererParams<LedgerRow, string>) => {
  const t = (p.value || "").toUpperCase();
  const isPay = t === "PAYMENT";
  return (
    <div className="flex h-full items-center">
      <Badge
        className={cn(
          "border font-medium",
          isPay ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-950"
        )}
        variant="outline"
      >
        {p.value || "—"}
      </Badge>
    </div>
  );
};

export default function AdminLedgerGrid() {
  const defaults = useMemo(() => defaultFromTo(), []);
  const [rowData, setRowData] = useState<LedgerRow[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Committed to API (updated on Apply and initial load). */
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  /** Draft range in inputs (not sent until Apply). */
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const loadLedger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentInstance.get<{
        success?: boolean;
        ledger: LedgerRow[];
        summary: LedgerSummary;
        total?: number;
        error?: string;
      }>("/api/admin/ledger", {
        params: { from, to, limit, offset } as Record<string, string | number>,
      });
      if (res.data?.success === false) {
        setError(res.data.error || "Failed to load ledger");
        setRowData([]);
        setSummary(null);
        setTotal(0);
        return;
      }
      setRowData(res.data.ledger || []);
      setSummary(res.data.summary || null);
      setTotal(typeof res.data.total === "number" ? res.data.total : res.data.ledger?.length ?? 0);
    } catch (e) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setError(
        err?.response?.data?.error || err?.message || "Request failed. Check the payments service URL and auth."
      );
      setRowData([]);
      setSummary(null);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [from, to, limit, offset]);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  const onApplyRange = () => {
    if (dateFrom > dateTo) {
      return;
    }
    setFrom(dateFrom);
    setTo(dateTo);
    setOffset(0);
  };

  const rangeInvalid = Boolean(dateFrom && dateTo && dateFrom > dateTo);

  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(Math.max(0, total) / limit));
  const fromRow = total === 0 ? 0 : offset + 1;
  const toRow = total === 0 ? 0 : Math.min(offset + rowData.length, total);

  const canPrev = offset > 0;
  const canNext = offset + rowData.length < total;

  const columnDefs = useMemo<ColDef<LedgerRow>[]>(
    () => [
      { field: "date", headerName: "Date", minWidth: 120, valueFormatter: formatRowDate, sortable: true },
      { field: "type", headerName: "Type", minWidth: 120, maxWidth: 160, cellRenderer: TypeCell, filter: true },
      { field: "reference", headerName: "Reference", minWidth: 140, flex: 0.8, filter: true },
      {
        field: "engagement_id",
        headerName: "Engagement",
        minWidth: 120,
        filter: "agNumberColumnFilter",
        valueFormatter: (p) => (p.value == null || p.value === "" ? "—" : String(p.value)),
      },
      {
        field: "debit",
        headerName: "Debit",
        type: "rightAligned",
        minWidth: 120,
        valueFormatter: (p) => (n(p.value) > 0 ? formatInrAmount(p.value) : "—"),
      },
      {
        field: "credit",
        headerName: "Credit",
        type: "rightAligned",
        minWidth: 120,
        valueFormatter: (p) => (n(p.value) > 0 ? formatInrAmount(p.value) : "—"),
      },
      {
        field: "balance",
        headerName: "Balance (page)",
        type: "rightAligned",
        minWidth: 130,
        valueFormatter: (p) => formatInrAmount(p.value),
        tooltipValueGetter: () => "Running total within the current result page; rows are ordered newest first.",
      },
      { field: "note", headerName: "Note", flex: 1, minWidth: 160, filter: true },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<LedgerRow>>(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  const getRowId = (p: { data?: LedgerRow }) => {
    const d = p.data;
    if (!d) {
      return "";
    }
    return `${d.type}-${d.reference}-${String(d.created_at)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ledger</h1>
          <p className="mt-0.5 max-w-2xl text-sm text-slate-600 sm:text-base">
            Combined view of <strong>successful</strong> customer payments and provider payouts. Amounts in INR. Balance in the
            grid is per page; date filter applies to both the summary and the list.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadLedger()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong className="font-semibold">Could not load ledger. </strong>
            {error}
          </div>
        </div>
      )}

      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { key: "col", label: "Total collected", value: summary.total_collected, icon: IndianRupee, tone: "emerald" as const },
            { key: "pf", label: "Platform fee", value: summary.platform_revenue, icon: Receipt, tone: "slate" as const },
            { key: "gst", label: "GST", value: summary.gst_payable, icon: Scale, tone: "slate" as const },
            { key: "payouts", label: "Provider payouts", value: summary.provider_payouts, icon: PiggyBank, tone: "amber" as const },
            { key: "ref", label: "Refunds", value: summary.refunds, icon: Landmark, tone: "slate" as const },
            { key: "net", label: "Net balance (range)", value: summary.net_balance, icon: BookOpen, tone: "sky" as const },
          ].map((s) => (
            <div
              key={s.key}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-3 shadow-sm",
                s.tone === "emerald" && "border-emerald-200/80 bg-emerald-50/50",
                s.tone === "amber" && "border-amber-200/80 bg-amber-50/40",
                s.tone === "sky" && "border-sky-200/80 bg-sky-50/50",
                s.tone === "slate" && "border-slate-200/80 bg-white"
              )}
            >
              <s.icon
                className={cn(
                  "h-8 w-8 shrink-0",
                  s.tone === "emerald" && "text-emerald-600",
                  s.tone === "amber" && "text-amber-600",
                  s.tone === "sky" && "text-sky-600",
                  s.tone === "slate" && "text-slate-500"
                )}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <p className="truncate text-base font-bold tabular-nums text-slate-900" title={formatInrAmount(s.value)}>
                  {formatInrAmount(s.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader>
          <CardTitle className="!text-lg text-slate-900">Date range & page size</CardTitle>
          <CardDescription>Filters apply to the financial summary and the table below. Pagination is server-side.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="ledger-from" className="text-xs text-slate-600">
                From
              </Label>
              <Input
                id="ledger-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                }}
                className="w-full min-w-[9rem] border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ledger-to" className="text-xs text-slate-600">
                To
              </Label>
              <Input
                id="ledger-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                }}
                className="w-full min-w-[9rem] border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Rows per page</Label>
              <select
                className="flex h-9 w-full min-w-[5.5rem] rounded-md border border-slate-200 bg-white px-2 text-sm"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setOffset(0);
                }}
                aria-label="Rows per page"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              className="sm:mb-0.5"
              onClick={onApplyRange}
              disabled={loading || rangeInvalid}
            >
              Apply
            </Button>
          </div>
          {rangeInvalid && (
            <p className="mt-2 text-sm text-amber-800">“From” should be on or before “To”.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/90 shadow-sm">
        <CardContent className="p-0 sm:px-0">
          {loading && !rowData.length && !error ? (
            <div className="flex h-[min(50vh,480px)] min-h-[280px] flex-col items-center justify-center gap-2 border-b border-slate-100 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-sm font-medium">Loading ledger…</p>
            </div>
          ) : (
            <div
              className={cn("ag-theme-alpine w-full overflow-hidden rounded-b-xl")}
              style={{ width: "100%", height: "min(60vh, 520px)", minHeight: 320 }}
            >
              {rowData.length === 0 && !loading ? (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-slate-500">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                  <p className="text-sm">No ledger rows in this range.</p>
                </div>
              ) : (
                <AgGridReact<LedgerRow>
                  rowData={rowData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  suppressPaginationPanel
                  animateRows
                  getRowId={getRowId}
                  domLayout="normal"
                  rowHeight={44}
                  headerHeight={40}
                  overlayNoRowsTemplate="No rows"
                />
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-slate-200/80 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500 sm:text-sm">
              <CalendarRange className="mb-0.5 mr-1 inline h-3.5 w-3.5 text-slate-400" />
              {total > 0 ? (
                <span>
                  Row <span className="font-medium text-slate-800">{fromRow}</span>–
                  <span className="font-medium text-slate-800">{toRow}</span> of{" "}
                  <span className="font-medium text-slate-800">{total}</span> · page{" "}
                  <span className="font-medium text-slate-800">
                    {currentPage} of {pageCount}
                  </span>
                </span>
              ) : (
                "No entries to paginate"
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canPrev || loading}
                onClick={() => setOffset((o) => Math.max(0, o - limit))}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canNext || loading}
                onClick={() => setOffset((o) => o + limit)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
