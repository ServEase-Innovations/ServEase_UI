import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Input } from "../../Common/input";
import {
  AlertCircle,
  Download,
  IndianRupee,
  Loader2,
  RefreshCw,
  Search,
  Table2,
  Tag,
} from "lucide-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";
import { cn } from "../../utils";
import utilsInstance from "src/services/utilsInstance";

interface ServicePricing {
  _id: string;
  SNo: number;
  Service: string;
  Type: string;
  Categories: string;
  SubCategories: string;
  NumbersOrSize: string;
  Price: number;
  JobDescription: string;
  RemarksOrConditions: string;
  BookingType: string;
}

function getStr(r: Record<string, unknown>, k: string): string {
  const v = r[k];
  if (v == null) {
    return "";
  }
  return String(v);
}

function getNum(r: Record<string, unknown>, k: string): number {
  const v = r[k];
  if (typeof v === "number" && Number.isFinite(v)) {
    return v;
  }
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function mapApiItemToRow(item: Record<string, unknown>): ServicePricing {
  const type = getStr(item, "Type");
  const isRegular = type.toLowerCase().includes("regular");
  const price = isRegular
    ? getNum(item, "Price /Month (INR)") || getNum(item, "Price /Day (INR)")
    : getNum(item, "Price /Day (INR)");
  const snoRaw = item["S.No."];
  const sno = typeof snoRaw === "number" && Number.isFinite(snoRaw) ? snoRaw : parseInt(String(snoRaw), 10) || 0;

  return {
    _id: String(item._id ?? ""),
    SNo: sno,
    Service: getStr(item, "Service"),
    Type: type,
    Categories: getStr(item, "Categories"),
    SubCategories: getStr(item, "Sub-Categories"),
    NumbersOrSize: getStr(item, "Numbers/Size"),
    Price: price,
    JobDescription: getStr(item, "Job Description"),
    RemarksOrConditions: getStr(item, "Remarks/Conditions"),
    BookingType: getStr(item, "BookingType"),
  };
}

function formatInrCompact(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function downloadPricingCsv(rows: ServicePricing[]) {
  const header = [
    "S.No.",
    "Service",
    "Type",
    "Categories",
    "Sub-Categories",
    "Numbers/Size",
    "Price (INR raw)",
    "Unit",
    "Job Description",
    "Remarks/Conditions",
    "BookingType",
  ];
  const esc = (s: string) => {
    if (/[",\r\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = rows.map((r) => {
    const typeLower = r.Type.toLowerCase();
    const unit = typeLower.includes("regular") ? "month" : "day";
    return [
      String(r.SNo),
      r.Service,
      r.Type,
      r.Categories,
      r.SubCategories,
      r.NumbersOrSize,
      String(r.Price),
      unit,
      r.JobDescription,
      r.RemarksOrConditions,
      r.BookingType,
    ]
      .map((c) => esc(c))
      .join(",");
  });
  const body = [header.map(esc).join(","), ...lines].join("\r\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `servease-pricing-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const TypeCell = (p: ICellRendererParams<ServicePricing, string>) => {
  const t = p.value ?? "";
  const isRegular = t.toLowerCase().includes("regular");
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        isRegular
          ? "border-sky-200 bg-sky-50 text-sky-800"
          : "border-slate-200 bg-slate-100 text-slate-700"
      )}
      title={t}
    >
      <span className="truncate">{t || "—"}</span>
    </span>
  );
};

const PriceCell = (p: ICellRendererParams<ServicePricing, number>) => {
  const v = typeof p.value === "number" && Number.isFinite(p.value) ? p.value : 0;
  const type = p.data?.Type?.toLowerCase() ?? "";
  const suffix = type.includes("regular") ? "/mo" : "/day";
  return (
    <span className="font-tabular-nums text-slate-900" title={`${formatInrCompact(v)} per ${suffix.slice(1)}`}>
      {formatInrCompact(v)}
      <span className="ml-1 text-xs font-normal text-slate-500">{suffix}</span>
    </span>
  );
};

const Pricing = () => {
  const [rowData, setRowData] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await utilsInstance.get<unknown>("/records");
      if (!Array.isArray(data)) {
        setError("Unexpected response from the pricing service.");
        setRowData([]);
        return;
      }
      const mapped: ServicePricing[] = (data as Record<string, unknown>[]).map((item) => mapApiItemToRow(item));
      setRowData(mapped);
    } catch (e) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setError(
        err?.response?.data?.error || err?.message || "Could not load pricing. Check the utils service URL and your connection."
      );
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const total = rowData.length;
    const recurring = rowData.filter((r) => r.Type.toLowerCase().includes("regular")).length;
    const other = total - recurring;
    return { total, recurring, other };
  }, [rowData]);

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) {
      return rowData;
    }
    return rowData.filter((r) => {
      const blob = [
        r.SNo,
        r.Service,
        r.Type,
        r.Categories,
        r.SubCategories,
        r.NumbersOrSize,
        r.Price,
        r.JobDescription,
        r.RemarksOrConditions,
        r.BookingType,
      ]
        .map((x) => String(x ?? ""))
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rowData, searchText]);

  const columnDefs = useMemo<ColDef<ServicePricing>[]>(
    () => [
      { field: "SNo", headerName: "S.No.", width: 88, maxWidth: 100, pinned: "left" },
      { field: "Service", minWidth: 160, flex: 1.2, tooltipField: "Service" },
      { field: "Type", minWidth: 120, cellRenderer: TypeCell },
      { field: "Categories", minWidth: 120, flex: 0.8, tooltipField: "Categories" },
      { field: "SubCategories", headerName: "Sub-Categories", minWidth: 130, flex: 0.8, tooltipField: "SubCategories" },
      { field: "NumbersOrSize", headerName: "Numbers/Size", minWidth: 110, maxWidth: 140 },
      {
        field: "Price",
        headerName: "Price",
        minWidth: 130,
        maxWidth: 200,
        cellRenderer: PriceCell,
        type: "rightAligned",
        comparator: (a, b) => (Number(a) || 0) - (Number(b) || 0),
      },
      { field: "JobDescription", headerName: "Job description", minWidth: 200, flex: 1, tooltipField: "JobDescription" },
      { field: "RemarksOrConditions", headerName: "Remarks / conditions", minWidth: 180, flex: 0.9, tooltipField: "RemarksOrConditions" },
      { field: "BookingType", headerName: "Booking", minWidth: 110, maxWidth: 160, tooltipField: "BookingType" },
    ],
    []
  );

  const defaultColDef: ColDef<ServicePricing> = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: true,
    }),
    []
  );

  const showInitialSkeleton = loading && !rowData.length && !error;
  const showGrid = !showInitialSkeleton;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Pricing</h1>
          <p className="mt-0.5 max-w-2xl text-sm text-slate-600 sm:text-base">
            Service rate card from the catalog (read-only). Use search and column filters to find rows; export the current
            result as CSV.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadPricingCsv(filteredRows)}
            disabled={!filteredRows.length || Boolean(error)}
            title="Export the rows you see in the table (after search)"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong className="font-semibold">Could not load pricing.</strong> {error}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total rates",
            value: stats.total,
            sub: "rows in catalog",
            icon: Table2,
            tone: "slate" as const,
          },
          {
            label: "Recurring (regular)",
            value: stats.recurring,
            sub: "per-month style rows",
            icon: IndianRupee,
            tone: "sky" as const,
          },
          {
            label: "Other",
            value: stats.other,
            sub: "day or non-regular",
            icon: Tag,
            tone: "slate" as const,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm",
              s.tone === "sky" ? "border-sky-200/80 bg-sky-50/60" : "border-slate-200/80 bg-white"
            )}
          >
            <s.icon className={cn("h-8 w-8 shrink-0", s.tone === "sky" ? "text-sky-600" : "text-slate-500")} />
            <div>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{loading && !rowData.length ? "—" : s.value}</p>
              <p className="text-xs text-slate-500">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Rate table</CardTitle>
          <CardDescription>Search below filters rows client-side. Use column header menus to sort and filter per column.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search all columns…"
              className="pl-9"
              disabled={showInitialSkeleton || Boolean(error && !rowData.length)}
              aria-label="Filter pricing table"
            />
          </div>

          {showInitialSkeleton ? (
            <div className="flex h-[min(60vh,560px)] min-h-[320px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-sm font-medium">Loading pricing…</p>
            </div>
          ) : showGrid ? (
            <div
              className={cn("ag-theme-alpine w-full rounded-lg border border-slate-200/80 overflow-hidden shadow-inner")}
              style={{ width: "100%", height: "min(60vh, 560px)", minHeight: 320 }}
            >
              {filteredRows.length === 0 ? (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 bg-slate-50/50 px-4 text-center text-slate-500">
                  <Table2 className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium">
                    {rowData.length === 0 ? "No pricing rows returned." : "No rows match your search."}
                  </p>
                  {rowData.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setSearchText("")}>
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <AgGridReact<ServicePricing>
                  rowData={filteredRows}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  initialState={{ sort: { sortModel: [{ colId: "SNo", sort: "asc" }] } } }
                  pagination
                  paginationPageSize={25}
                  paginationPageSizeSelector={[15, 25, 50, 100]}
                  animateRows
                  getRowId={(p) => p.data?._id || `row-${p.data?.SNo}`}
                  suppressCellFocus
                  tooltipShowDelay={200}
                />
              )}
            </div>
          ) : null}

          {showGrid && (rowData.length > 0 || !loading) && (
            <p className="text-sm text-slate-500">
              {loading
                ? "Loading…"
                : (() => {
                    const n = filteredRows.length;
                    const t = rowData.length;
                    if (t === 0) {
                      return "No data loaded.";
                    }
                    if (n === t) {
                      return `${t} rate row${t === 1 ? "" : "s"}.`;
                    }
                    return (
                      <span>
                        {n} match{n === 1 ? "" : "es"} of {t} total.
                      </span>
                    );
                  })()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;
