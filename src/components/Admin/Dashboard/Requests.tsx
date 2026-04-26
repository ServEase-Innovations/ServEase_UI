import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Input } from "../../Common/input";
import { Loader2, Search, Filter, RefreshCw, ClipboardList } from "lucide-react";
import { cn } from "../../utils";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import paymentInstance from "src/services/paymentInstance";
import {
  type AdminEngagementRow,
  adminRowToFormInitial,
  deriveEngagementStage,
} from "./engagementAdminUtils";
import { EngagementEditDialog, type EngagementFormInitial } from "./EngagementEditDialog";

type EngGridRow = AdminEngagementRow & { stage: string; customerName: string; providerName: string };

const AssignmentFilter = {
  ALL: "all",
  UNASSIGNED: "unassigned",
  ASSIGNED: "assigned",
} as const;

const Requests = () => {
  const [rows, setRows] = useState<EngGridRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const [assignment, setAssignment] = useState<(typeof AssignmentFilter)[keyof typeof AssignmentFilter]>("all");
  const [taskStatus, setTaskStatus] = useState<string>("");
  const [bookingType, setBookingType] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");

  const [editOpen, setEditOpen] = useState(false);
  const [editInitial, setEditInitial] = useState<EngagementFormInitial | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      q.set("limit", "1000");
      q.set("offset", "0");
      if (assignment === "unassigned") {
        q.set("assignment_status", "UNASSIGNED");
      } else if (assignment === "assigned") {
        q.set("assignment_status", "ASSIGNED");
      }
      if (taskStatus) q.set("task_status", taskStatus);
      if (bookingType) q.set("booking_type", bookingType);
      if (activeFilter === "true") q.set("active", "true");
      if (activeFilter === "false") q.set("active", "false");

      const res = await paymentInstance.get<{
        success: boolean;
        count: number;
        engagements: AdminEngagementRow[];
        error?: string;
      }>(`/api/admin/engagements?${q.toString()}`);

      if (!res.data?.success) {
        setError(res.data?.error || "Failed to load engagements");
        setRows([]);
        return;
      }

      const list = (res.data.engagements || []).map((e) => {
        const c = e.customer;
        const p = e.provider;
        return {
          ...e,
          stage: deriveEngagementStage(e),
          customerName: [c?.firstname, c?.lastname].filter(Boolean).join(" ").trim() || "—",
          providerName: p ? [p.firstname, p.lastname].filter(Boolean).join(" ").trim() : "—",
        } as EngGridRow;
      });

      setRows(list);
      setTotalCount(Number(res.data.count) || list.length);
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Request failed. Check payments service URL and auth.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [assignment, taskStatus, bookingType, activeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const s = [
        r.engagement_id,
        r.booking_type,
        r.service_type,
        r.task_status,
        r.assignment_status,
        r.stage,
        r.customerName,
        r.customer?.customerid,
        r.customer?.mobile,
        r.providerName,
        r.provider?.serviceproviderid,
      ]
        .map((v) => (v != null ? String(v).toLowerCase() : ""))
        .join(" ");
      return s.includes(q);
    });
  }, [rows, searchText]);

  const unassignedInView = useMemo(
    () => displayRows.filter((r) => String(r.assignment_status || "").toUpperCase() === "UNASSIGNED").length,
    [displayRows]
  );

  const columnDefs: ColDef<EngGridRow>[] = useMemo(
    () => [
      { field: "engagement_id", headerName: "ID", width: 90, valueFormatter: (p) => String(p.value ?? "") },
      { field: "stage", headerName: "Stage", flex: 1, minWidth: 220, wrapText: true },
      { field: "assignment_status", headerName: "Assignment", width: 120 },
      { field: "task_status", headerName: "Task", width: 120 },
      { field: "booking_type", headerName: "Booking", width: 120, valueFormatter: (p) => p.value || "—" },
      { field: "service_type", headerName: "Service", width: 120, valueFormatter: (p) => p.value || "—" },
      { field: "customerName", headerName: "Customer", minWidth: 150 },
      { field: "customer", headerName: "Customer ID", width: 110, valueFormatter: (p) => (p.data?.customer?.customerid != null ? String(p.data?.customer?.customerid) : "—") },
      { field: "providerName", headerName: "Provider", minWidth: 140, valueFormatter: (p) => p.value || "—" },
      { field: "base_amount", headerName: "Amount", width: 100, valueFormatter: (p: ValueFormatterParams) => (p.data?.base_amount != null ? String(p.data?.base_amount) : "—") },
      { field: "active", headerName: "Active", width: 90, valueFormatter: (p) => (p.data?.active ? "Yes" : "No") },
      {
        field: "payment",
        headerName: "Payment",
        minWidth: 100,
        valueFormatter: (p) => p.data?.payment?.status || "—",
      },
      {
        colId: "edit",
        headerName: "Action",
        width: 100,
        sortable: false,
        filter: false,
        valueGetter: () => "Update",
        cellClass: "text-sky-600 font-semibold cursor-pointer hover:underline",
      },
    ],
    []
  );

  const onEdit = (r: EngGridRow) => {
    setEditInitial(adminRowToFormInitial(r));
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Engagement requests</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            All engagements from the payments service. Rows with <strong>no provider accepted</strong> are highlighted. Use
            filters and <strong>Update</strong> to open the admin editor (assign / reassign, dates, status).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
          className="shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <strong className="font-semibold">Could not load data.</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/90 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold tabular-nums text-slate-900">{totalCount.toLocaleString()}</div>
            <p className="text-sm text-slate-500">Total matching (server count)</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/90 bg-amber-50/40 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold tabular-nums text-amber-800">{unassignedInView.toLocaleString()}</div>
            <p className="text-sm text-amber-900/80">Unassigned in current list</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/90 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold tabular-nums text-slate-900">{displayRows.length.toLocaleString()}</div>
            <p className="text-sm text-slate-500">After text search</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/90 shadow-sm">
          <CardContent className="p-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-slate-400" />
            <p className="text-sm text-slate-600">Filters apply to the next API load. Search filters client-side on loaded rows.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Assignment = UNASSIGNED is the same as &quot;not accepted by a provider yet&quot; for the listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Assignment</span>
              <select
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={assignment}
                onChange={(e) => setAssignment(e.target.value as typeof assignment)}
                aria-label="Filter by assignment"
              >
                <option value="all">All</option>
                <option value="unassigned">Unassigned only</option>
                <option value="assigned">Assigned only</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Task status</span>
              <select
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                aria-label="Filter by task status"
              >
                <option value="">Any</option>
                {["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "HOLD"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Booking type</span>
              <select
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value)}
                aria-label="Filter by booking type"
              >
                <option value="">Any</option>
                {["ON_DEMAND", "MONTHLY", "SHORT_TERM"].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Active</span>
              <select
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as "all" | "true" | "false")}
                aria-label="Filter by active"
              >
                <option value="all">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">All engagements</CardTitle>
              <CardDescription>
                <Filter className="mr-1.5 -mt-0.5 inline h-4 w-4 text-slate-400" />
                Amber / orange row background: still unassigned (no provider on record).
              </CardDescription>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Filter loaded rows: id, name, type…"
                aria-label="Search engagements"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && !rows.length && !error ? (
            <div className="flex h-[400px] flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-sm">Loading engagements…</p>
            </div>
          ) : (
            <div
              className={cn("ag-theme-alpine w-full rounded-lg border border-slate-200/80 overflow-hidden")}
              style={{ width: "100%", height: 520 }}
            >
              <AgGridReact<EngGridRow>
                rowData={displayRows}
                columnDefs={columnDefs}
                defaultColDef={{ sortable: true, resizable: true, filter: true, minWidth: 80 }}
                pagination
                paginationPageSize={25}
                getRowId={(p) => String(p.data?.engagement_id ?? "")}
                getRowStyle={(p) => {
                  const a = String(p.data?.assignment_status || "").toUpperCase();
                  if (a === "UNASSIGNED") {
                    return {
                      background: "linear-gradient(90deg, rgba(254, 243, 199, 0.95) 0%, rgba(255, 251, 235, 0.75) 100%)",
                      borderLeft: "4px solid rgb(245, 158, 11)",
                    };
                  }
                  return undefined;
                }}
                onCellClicked={(e) => {
                  if (e.colDef?.colId === "edit" && e.data) {
                    onEdit(e.data);
                  }
                }}
                onRowDoubleClicked={(e) => {
                  if (e.data) onEdit(e.data);
                }}
                animateRows
                suppressRowClickSelection
                rowSelection="single"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <EngagementEditDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditInitial(null);
        }}
        initial={editInitial}
        onSaved={() => {
          void load();
        }}
      />
    </div>
  );
};

export default Requests;
