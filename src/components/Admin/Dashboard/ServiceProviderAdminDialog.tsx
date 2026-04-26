import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  X,
  Loader2,
  User,
  CalendarDays,
  ListChecks,
  History,
  RefreshCw,
  CalendarOff,
  Sparkles,
  Pencil,
  Inbox,
  Shield,
} from "lucide-react";
import dayjs from "dayjs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import paymentInstance from "src/services/paymentInstance";
import providerInstance from "src/services/providerInstance";

type ProviderDetails = Record<string, unknown>;

type EngRow = {
  engagement_id: number;
  serviceproviderid?: number;
  customerid?: number;
  firstname?: string;
  lastname?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  start_date?: string;
  end_date?: string;
  booking_type?: string;
  service_type?: string;
  task_status?: string;
  base_amount?: string | number;
  active?: boolean;
  bucket: string;
};

type CalRow = {
  id: number;
  date?: string;
  status?: string;
  engagement_id?: number | null;
  start_time?: string | null;
  end_time?: string | null;
};

type BlockRow = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
};

type ModLogRow = Record<string, unknown> & {
  engagement_id: number;
  modified_at: string;
  modification_id: number;
};

const fmtModSummary = (fields: unknown) => {
  if (fields == null) return "—";
  if (typeof fields === "string") {
    try {
      return JSON.stringify(JSON.parse(fields)).slice(0, 200);
    } catch {
      return fields.slice(0, 200);
    }
  }
  try {
    return JSON.stringify(fields).slice(0, 300);
  } catch {
    return "—";
  }
};

const defaultMonth = () => dayjs().format("YYYY-MM");

function humanizeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

type SectionCardProps = {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  accent?: "default" | "emerald" | "amber" | "violet" | "rose" | "sky";
};

const accentTints: Record<NonNullable<SectionCardProps["accent"]>, string> = {
  default: "transparent",
  emerald: "#059669",
  amber: "#d97706",
  violet: "#7c3aed",
  rose: "#e11d48",
  sky: "#0284c7",
};

function SectionCard({ title, description, icon, children, accent = "default" }: SectionCardProps) {
  const theme = useTheme();
  const bg =
    accent === "default" && theme.palette.mode === "dark"
      ? theme.palette.action.hover
      : accent === "default" && theme.palette.mode !== "dark"
        ? alpha("#f1f5f9", 0.95)
        : alpha(accentTints[accent] || theme.palette.primary.main, 0.08);

  return (
    <Paper
      variant="outlined"
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        borderColor: (th) => alpha(th.palette.divider, 0.8),
        background: `linear-gradient(180deg, ${String(bg)} 0%, ${alpha(
          theme.palette.background.paper,
          0.95
        )} 48%)`,
      }}
    >
      <Box sx={{ px: 2.25, py: 1.75, borderBottom: 1, borderColor: (th) => alpha(th.palette.divider, 0.5) }}>
        <Stack direction="row" alignItems="flex-start" gap={1.5}>
          <Box
            sx={(th) => ({
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: th.palette.primary.main,
              backgroundColor: alpha(th.palette.primary.main, 0.1),
            })}
            aria-hidden
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} letterSpacing="-0.01em" color="text.primary">
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Paper>
  );
}

type AgFrameProps = {
  children: ReactNode;
  minH: number;
  empty: boolean;
  emptyTitle: string;
  emptyHint?: string;
};

function AgFrame({ children, minH, empty, emptyTitle, emptyHint }: AgFrameProps) {
  const theme = useTheme();
  const divider = String(theme.palette.divider);
  if (empty) {
    return (
      <Box
        sx={{
          minHeight: minH,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          px: 2,
          py: 4,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: (th) => alpha(th.palette.text.primary, 0.02),
        }}
      >
        <Inbox strokeWidth={1.25} size={40} className="text-slate-300" />
        <Typography fontWeight={600} color="text.primary">
          {emptyTitle}
        </Typography>
        {emptyHint && (
          <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={400}>
            {emptyHint}
          </Typography>
        )}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        minHeight: minH,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: (th) => th.palette.background.paper,
        "& .ag-header": {
          background: (th) => `linear-gradient(180deg, ${alpha(th.palette.text.primary, 0.04)} 0%, ${alpha(
            th.palette.text.primary,
            0.01
          )} 100%)`,
          borderBottom: `1px solid ${divider}`,
        },
        "& .ag-header-cell": {
          fontWeight: 700,
          fontSize: 12,
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
        },
        "& .ag-paging-panel": {
          borderTop: (th) => `1px solid ${th.palette.divider}`,
          minHeight: 40,
        },
        "& .ag-row": { borderBottom: (th) => `1px solid ${alpha(String(th.palette.divider), 0.6)}` },
        "& .ag-row-hover::before": { backgroundColor: (th) => alpha(th.palette.primary.main, 0.04) },
      }}
    >
      {children}
    </Box>
  );
}

export function ServiceProviderAdminDialog(props: {
  open: boolean;
  onClose: () => void;
  serviceproviderid: number;
  displayName: string;
}) {
  const { open, onClose, serviceproviderid, displayName } = props;
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(defaultMonth);
  const [snack, setSnack] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [provider, setProvider] = useState<ProviderDetails | null>(null);
  const [engagements, setEngagements] = useState<EngRow[]>([]);
  const [calendar, setCalendar] = useState<CalRow[]>([]);
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [modLog, setModLog] = useState<ModLogRow[]>([]);

  const [blockStart, setBlockStart] = useState<string>("");
  const [blockEnd, setBlockEnd] = useState<string>("");
  const [savingBlock, setSavingBlock] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<EngRow | null>(null);
  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    start_time: "",
    task_status: "",
    service_type: "",
    booking_type: "",
    base_amount: "",
    active: true,
    serviceproviderid: "" as string,
    admin_name: "",
    admin_id: "",
  });
  const [savingEng, setSavingEng] = useState(false);

  const loadProvider = useCallback(async () => {
    const r = await providerInstance.get<{
      status: number;
      data: ProviderDetails | null;
    }>(`/api/service-providers/serviceprovider/${serviceproviderid}`);
    setProvider(r.data?.data ?? null);
  }, [serviceproviderid]);

  const loadEngagements = useCallback(async () => {
    const r = await paymentInstance.get<{
      success: boolean;
      current: unknown[];
      upcoming: unknown[];
      past: unknown[];
    }>(`/api/service-providers/${serviceproviderid}/engagements`);
    if (!r.data?.success) return;
    const cur = (r.data.current as EngRow[]).map((e) => ({ ...e, bucket: "current" as const }));
    const up = (r.data.upcoming as EngRow[]).map((e) => ({ ...e, bucket: "upcoming" as const }));
    const pa = (r.data.past as EngRow[]).map((e) => ({ ...e, bucket: "past" as const }));
    setEngagements([...cur, ...up, ...pa]);
  }, [serviceproviderid]);

  const loadCalendar = useCallback(
    async (m?: string) => {
      const y = m ?? month;
      const r = await paymentInstance.get<{ success: boolean; calendar: CalRow[] }>(
        `/api/service-providers/${serviceproviderid}/calendar?month=${encodeURIComponent(y)}`
      );
      if (r.data?.success && Array.isArray(r.data.calendar)) {
        setCalendar(r.data.calendar);
      } else {
        setCalendar([]);
      }
    },
    [serviceproviderid, month]
  );

  const loadBlocks = useCallback(
    async (m?: string) => {
      const y = m ?? month;
      const r = await paymentInstance.get<{
        success: boolean;
        blocks: { id: number; date: string; start_time: string; end_time: string }[];
      }>(`/api/service-providers/${serviceproviderid}/availability/blocks?month=${encodeURIComponent(y)}`);
      if (r.data?.success && Array.isArray(r.data.blocks)) {
        setBlocks(r.data.blocks);
      } else {
        setBlocks([]);
      }
    },
    [serviceproviderid, month]
  );

  const loadModLog = useCallback(async () => {
    const r = await paymentInstance.get<{
      success: boolean;
      log: ModLogRow[];
    }>(`/api/service-providers/${serviceproviderid}/modification-log?limit=300`);
    if (r.data?.success && Array.isArray(r.data.log)) {
      setModLog(r.data.log);
    } else {
      setModLog([]);
    }
  }, [serviceproviderid]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadProvider(), loadEngagements(), loadModLog()]);
    } catch (e) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setSnack({
        type: "error",
        message: err?.response?.data?.error || err?.message || "Failed to load provider workspace",
      });
    } finally {
      setLoading(false);
    }
  }, [loadProvider, loadEngagements, loadModLog]);

  useEffect(() => {
    if (!open) return;
    setTab(0);
    setMonth(defaultMonth());
    void loadAll();
  }, [open, serviceproviderid, loadAll]);

  useEffect(() => {
    if (!open) return;
    void loadCalendar(month);
    void loadBlocks(month);
  }, [open, month, serviceproviderid, loadCalendar, loadBlocks]);

  const hero = useMemo(() => {
    if (!provider) return null;
    const p = (k: string) => (provider as Record<string, unknown>)[k];
    const parts = [p("firstName"), p("middleName"), p("lastName")].filter((x) => x != null && String(x) !== "");
    return {
      name: parts.length ? parts.map((x) => String(x)).join(" ") : displayName,
      email: p("emailId") != null ? String(p("emailId")) : "—",
      phone: p("mobileNo") != null ? String(p("mobileNo")) : "—",
    };
  }, [provider, displayName]);

  const openEdit = (row: EngRow) => {
    setEditing(row);
    setForm({
      start_date: (row.startDate || row.start_date || "").toString().slice(0, 10),
      end_date: (row.endDate || row.end_date || "").toString().slice(0, 10),
      start_time: (row.startTime || "").toString() || "09:00",
      task_status: (row.task_status as string) || "NOT_STARTED",
      service_type: (row.service_type as string) || "",
      booking_type: (row.booking_type as string) || "",
      base_amount: row.base_amount != null ? String(row.base_amount) : "",
      active: row.active !== false,
      serviceproviderid: String(row.serviceproviderid || serviceproviderid),
      admin_name: "",
      admin_id: "",
    });
    setEditOpen(true);
  };

  const submitBlock = async () => {
    if (!blockStart || !blockEnd) {
      setSnack({ type: "error", message: "Select start and end date for the block" });
      return;
    }
    setSavingBlock(true);
    try {
      await paymentInstance.post(`/api/service-providers/${serviceproviderid}/availability/blocks`, {
        start_date: blockStart,
        end_date: blockEnd,
      });
      setSnack({ type: "success", message: "Unavailability block saved" });
      setBlockStart("");
      setBlockEnd("");
      await loadCalendar();
      await loadBlocks();
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setSnack({ type: "error", message: err?.response?.data?.error || "Could not add block" });
    } finally {
      setSavingBlock(false);
    }
  };

  const removeBlock = async (blockId: number) => {
    try {
      await paymentInstance.delete(
        `/api/service-providers/${serviceproviderid}/availability/blocks/${blockId}`
      );
      setSnack({ type: "success", message: "Block removed" });
      await loadCalendar();
      await loadBlocks();
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setSnack({ type: "error", message: err?.response?.data?.error || "Could not remove" });
    }
  };

  const saveEngagement = async () => {
    if (!editing?.engagement_id) return;
    setSavingEng(true);
    try {
      const body: Record<string, unknown> = {
        modified_by_role: "ADMIN",
      };
      if (form.admin_id.trim() !== "" && /^\d+$/.test(form.admin_id.trim())) {
        body.modified_by_id = Number(form.admin_id.trim());
      }
      if (form.admin_name.trim() !== "") {
        body.modified_by_name = form.admin_name.trim();
        body.source = "ADMIN_PORTAL";
      }
      if (form.start_date) body.start_date = form.start_date;
      if (form.end_date) body.end_date = form.end_date;
      if (form.start_time) body.start_time = form.start_time;
      if (form.task_status) body.task_status = form.task_status;
      if (form.service_type) body.service_type = form.service_type;
      if (form.booking_type) body.booking_type = form.booking_type;
      if (form.base_amount !== "") body.base_amount = Number(form.base_amount);
      body.active = form.active;
      if (form.serviceproviderid.trim() !== "" && /^\d+$/.test(form.serviceproviderid.trim())) {
        const pid = Number(form.serviceproviderid.trim());
        if (pid !== serviceproviderid) {
          body.serviceproviderid = pid;
        }
      }
      await paymentInstance.put(`/api/engagements/${editing.engagement_id}`, body);
      setSnack({ type: "success", message: "Engagement updated" });
      setEditOpen(false);
      await loadEngagements();
      await loadCalendar();
      await loadModLog();
    } catch (e) {
      const err = e as { response?: { data?: { error?: string; detail?: string } } };
      setSnack({
        type: "error",
        message: err?.response?.data?.error || err?.response?.data?.detail || "Update failed",
      });
    } finally {
      setSavingEng(false);
    }
  };

  const detailRows = useMemo(() => {
    if (!provider) return [];
    const hidden = new Set(["permanentAddress", "correspondenceAddress", "housekeepingRoles"]);
    return Object.entries(provider)
      .filter(([k, v]) => !hidden.has(k) && v !== null && v !== undefined)
      .map(([k, v]) => {
        if (typeof v === "object") return [k, JSON.stringify(v, null, 0)] as [string, string];
        return [k, String(v)] as [string, string];
      });
  }, [provider]);

  const bucketClass = (p: { value?: string }) => {
    const b = p.value;
    if (b === "current") return "font-semibold text-emerald-800";
    if (b === "upcoming") return "font-semibold text-sky-800";
    if (b === "past") return "text-slate-500";
    return "";
  };

  const statusCellClass = (p: { value?: string | null }) => {
    const s = (p.value || "").toUpperCase();
    if (s === "BOOKED") return "font-medium text-violet-900";
    if (s === "FREE" || s === "AVAILABLE") return "font-medium text-emerald-800";
    if (s === "UNAVAILABLE") return "font-medium text-amber-900";
    return "font-medium";
  };

  const engColDefs: ColDef<EngRow>[] = useMemo(
    () => [
      { field: "engagement_id", headerName: "ID", width: 90 },
      {
        field: "bucket",
        headerName: "Phase",
        width: 100,
        cellClass: (p) => String(bucketClass(p as { value?: string })),
        valueFormatter: (p) => (p.value ? String(p.value).charAt(0).toUpperCase() + String(p.value).slice(1) : ""),
      },
      {
        valueGetter: (p) => `${(p.data?.firstname as string) || ""} ${(p.data?.lastname as string) || ""}`.trim() || "—",
        headerName: "Customer",
        minWidth: 150,
        flex: 1,
      },
      { field: "booking_type", width: 120 },
      { field: "service_type", width: 120 },
      { field: "task_status", width: 120 },
      { field: "startDate", headerName: "Start", width: 120 },
      { field: "endDate", headerName: "End", width: 120 },
      { field: "startTime", headerName: "Time", width: 90 },
      { field: "base_amount", width: 110, valueFormatter: (p) => (p.value != null ? String(p.value) : "—") },
      {
        colId: "edit",
        headerName: "Action",
        width: 108,
        sortable: false,
        filter: false,
        valueGetter: () => "Edit",
        cellClass: "text-sky-600 font-semibold cursor-pointer hover:underline",
      },
    ],
    []
  );

  const calColDefs: ColDef<CalRow>[] = useMemo(
    () => [
      { field: "date", width: 120, filter: true },
      {
        field: "status",
        width: 120,
        cellClass: (p) => String(statusCellClass(p as { value?: string | null })),
        valueFormatter: (p) => (p.value ? String(p.value) : "—"),
      },
      {
        field: "engagement_id",
        width: 120,
        valueFormatter: (p: ValueFormatterParams<CalRow, unknown>) =>
          p.value != null && p.value !== "" ? String(p.value) : "—",
      },
      { field: "start_time", width: 100, valueFormatter: (p) => p.value || "—" },
      { field: "end_time", width: 100, valueFormatter: (p) => p.value || "—" },
    ],
    []
  );

  const blockColDefs: ColDef<BlockRow & { _actions?: true }>[] = useMemo(
    () => [
      { field: "id", width: 90, headerName: "Row" },
      { field: "date" },
      { field: "start_time", width: 100 },
      { field: "end_time", width: 100 },
      {
        colId: "act",
        headerName: "Action",
        width: 100,
        valueGetter: () => "Remove",
        cellClass: "text-rose-600 font-semibold cursor-pointer hover:underline",
      },
    ],
    []
  );

  const logColDefs: ColDef<ModLogRow>[] = useMemo(
    () => [
      { field: "modified_at", headerName: "When", width: 180 },
      { field: "engagement_id", width: 110 },
      { field: "task_status", width: 100, valueFormatter: (p) => (p.value != null ? String(p.value) : "—") },
      { field: "service_type", width: 110, valueFormatter: (p) => (p.value != null ? String(p.value) : "—") },
      { field: "modified_by_role", width: 100, valueFormatter: (p) => (p.value != null ? String(p.value) : "—") },
      { field: "modified_by_id", width: 110, valueFormatter: (p) => (p.value != null ? String(p.value) : "—") },
      {
        headerName: "Change (summary)",
        minWidth: 300,
        flex: 1,
        valueGetter: (p) => fmtModSummary(p.data?.modified_fields),
      },
    ],
    []
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            elevation: 12,
            sx: {
              borderRadius: 2.5,
              overflow: "hidden",
              backgroundImage: (th) =>
                th.palette.mode === "dark" ? th.palette.background.paper : "linear-gradient(180deg, #f8fafc 0%, #fff 20%)",
              border: (th) => `1px solid ${alpha(th.palette.divider, 0.9)}`,
            },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={(th) => ({
            px: 2.5,
            py: 2,
            background: `linear-gradient(135deg, ${alpha(th.palette.primary.main, 0.1)} 0%, ${alpha(
              th.palette.primary.main,
              0.02
            )} 100%)`,
            borderBottom: `1px solid ${th.palette.divider}`,
          })}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Stack direction="row" alignItems="flex-start" gap={1.5} minWidth={0}>
              <Box
                sx={(th) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: th.palette.primary.main,
                  backgroundColor: alpha(th.palette.primary.main, 0.12),
                })}
                aria-hidden
              >
                <User size={26} strokeWidth={1.5} />
              </Box>
              <Box minWidth={0}>
                <Typography
                  component="h2"
                  variant="h6"
                  fontWeight={800}
                  letterSpacing="-0.02em"
                  sx={{ lineHeight: 1.25, wordBreak: "break-word" }}
                >
                  {displayName}
                </Typography>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                  <Chip size="small" label={`ID ${serviceproviderid}`} variant="outlined" color="default" />
                  {engagements.length > 0 && <Chip size="small" color="info" label={`${engagements.length} bookings`} variant="outlined" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.4 }}>
                  Manage profile, time off, and engagements. Data loads from the providers and payments services.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  void loadAll();
                  void loadCalendar(month);
                  void loadBlocks(month);
                }}
                disabled={loading}
                startIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw size={16} />}
                sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none" }}
              >
                Refresh
              </Button>
              <IconButton
                onClick={onClose}
                aria-label="Close"
                sx={{ color: (th) => th.palette.text.secondary, "&:hover": { color: (th) => th.palette.text.primary } }}
                size="small"
              >
                <X className="h-5 w-5" />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, minHeight: 480, backgroundColor: (th) => alpha(th.palette.text.primary, 0.01) }}>
          {loading && !provider ? (
            <Box
              className="flex h-[22rem] flex-col items-center justify-center gap-2"
              sx={{ p: 4, backgroundColor: (th) => alpha(th.palette.text.primary, 0.01) }}
            >
              <Loader2 className="h-9 w-9 animate-spin" style={{ color: theme.palette.primary.main }} />
              <Typography color="text.secondary" fontWeight={500}>
                Loading provider workspace…
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ px: 0, backgroundColor: (th) => th.palette.background.paper }}>
                <Tabs
                  value={tab}
                  onChange={(_e, v) => setTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={(th) => ({
                    px: 2,
                    minHeight: 48,
                    "& .MuiTab-root": { textTransform: "none", minHeight: 48, fontWeight: 600, fontSize: "0.9rem" },
                    "& .Mui-selected": { color: th.palette.primary.main + " !important" },
                    "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
                  })}
                >
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" gap={1} component="span">
                        <User size={17} />
                        <span>Profile</span>
                      </Stack>
                    }
                  />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" gap={1} component="span">
                        <CalendarDays size={17} />
                        <span>Calendar</span>
                      </Stack>
                    }
                  />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" gap={1} component="span">
                        <ListChecks size={17} />
                        <span>Bookings</span>
                      </Stack>
                    }
                  />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" gap={1} component="span">
                        <History size={17} />
                        <span>Change log</span>
                      </Stack>
                    }
                  />
                </Tabs>
              </Box>
              <Divider />
              <Box sx={{ p: 2.5, pt: 2.25, maxHeight: { xs: "60vh", md: "min(64vh, 600px)" }, overflow: "auto" }}>
                {tab === 0 && (
                  <Stack spacing={2.5}>
                    {hero && (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.25,
                          borderRadius: 2,
                          borderColor: (th) => alpha(th.palette.divider, 0.8),
                          background: (th) => `linear-gradient(150deg, ${alpha(th.palette.primary.main, 0.06)} 0%, #fff 55%)`,
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                          gap={2}
                        >
                          <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.12em" }}>
                              Primary
                            </Typography>
                            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
                              {hero.name}
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1.25} sx={{ mt: 0.5 }}>
                              <Stack direction="row" alignItems="center" gap={0.5}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase" }}>
                                  Email
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {hero.email}
                                </Typography>
                              </Stack>
                              <Box sx={{ display: { xs: "none", sm: "block" }, color: "divider" }}>·</Box>
                              <Stack direction="row" alignItems="center" gap={0.5}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase" }}>
                                  Phone
                                </Typography>
                                <Typography variant="body2" fontWeight={500} fontFamily="ui-monospace, Menlo, monospace" letterSpacing="0.02em">
                                  {hero.phone}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Box>
                          <Chip
                            size="small"
                            icon={<Sparkles size={14} />}
                            label="Live record from providers"
                            color="default"
                            variant="outlined"
                            sx={{ fontWeight: 600, alignSelf: { xs: "stretch", sm: "auto" } }}
                          />
                        </Stack>
                      </Paper>
                    )}
                    <SectionCard
                      title="All fields"
                      description="Key–value data returned by the providers service (nested objects are JSON). Scroll horizontally on narrow viewports if needed."
                      icon={<Pencil size={20} strokeWidth={1.75} />}
                    >
                      {detailRows.length === 0 ? (
                        <Typography color="text.secondary" variant="body2">
                          No data returned.
                        </Typography>
                      ) : (
                        <TableContainer sx={{ maxHeight: 320, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
                          <Table size="small" stickyHeader>
                            <TableBody>
                              {detailRows.map(([k, v]) => (
                                <TableRow
                                  key={k}
                                  hover
                                  sx={{ "&:nth-of-type(odd)": { bgcolor: (th) => alpha(th.palette.text.primary, 0.02) } }}
                                >
                                  <TableCell
                                    sx={{ fontWeight: 600, width: 220, verticalAlign: "top", fontSize: 13, color: "text.secondary" }}
                                  >
                                    {humanizeKey(k)}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      wordBreak: "break-all",
                                      maxWidth: 0,
                                      fontSize: 13,
                                      fontFamily: v.length > 40 ? "ui-monospace, Menlo, monospace" : "inherit",
                                    }}
                                    title={v}
                                  >
                                    {v}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </SectionCard>
                  </Stack>
                )}

                {tab === 1 && (
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2}>
                      <TextField
                        label="View month"
                        type="month"
                        size="small"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                      />
                      <Typography variant="body2" color="text.secondary" maxWidth={420}>
                        Pick a month to load calendar and unavailability. Blocks are full-day “UNAVAILABLE” markers when the provider
                        is not free.
                      </Typography>
                    </Stack>

                    <SectionCard
                      title="Provider calendar"
                      description="Includes BOOKED slots tied to engagements and any FREE rows for the selected month."
                      icon={<CalendarDays size={20} strokeWidth={1.75} />}
                      accent="emerald"
                    >
                      <AgFrame
                        minH={280}
                        empty={!loading && calendar.length === 0}
                        emptyTitle="No calendar rows for this month"
                        emptyHint="This may be normal if there is no activity yet. Try a different month or add unavailability below."
                      >
                        {!(!loading && calendar.length === 0) && (
                          <div className="ag-theme-alpine" style={{ width: "100%", height: 280 }}>
                            <AgGridReact<CalRow>
                              rowData={calendar}
                              columnDefs={calColDefs}
                              pagination
                              paginationPageSize={10}
                              getRowId={(p) => String(p.data?.id ?? "")}
                              defaultColDef={{ resizable: true, sortable: true, minWidth: 100 }}
                            />
                          </div>
                        )}
                      </AgFrame>
                    </SectionCard>

                    <SectionCard
                      title="Add unavailability"
                      description="Blocks whole days. Days that already have a paid booking are skipped by the server."
                      icon={<CalendarOff size={20} strokeWidth={1.75} />}
                      accent="amber"
                    >
                      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "flex-end" }} gap={1.5} flexWrap="wrap" useFlexGap>
                        <TextField
                          label="From"
                          type="date"
                          size="small"
                          value={blockStart}
                          onChange={(e) => setBlockStart(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{ flex: 1, minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                        />
                        <TextField
                          label="To"
                          type="date"
                          size="small"
                          value={blockEnd}
                          onChange={(e) => setBlockEnd(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{ flex: 1, minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                        />
                        <Button
                          variant="contained"
                          onClick={() => void submitBlock()}
                          disabled={savingBlock}
                          sx={{ textTransform: "none", fontWeight: 700, px: 2.5, height: 40, borderRadius: 1.5, boxShadow: "none" }}
                        >
                          {savingBlock ? "Saving…" : "Add block"}
                        </Button>
                      </Stack>
                    </SectionCard>

                    <SectionCard
                      title="This month’s blocks"
                      description="Click Remove in the grid to clear a day that was marked unavailable. Only UNAVAILABLE, non-engagement rows are listed here."
                      icon={<Shield size={20} strokeWidth={1.75} />}
                      accent="rose"
                    >
                      <AgFrame
                        minH={200}
                        empty={!loading && blocks.length === 0}
                        emptyTitle="No unavailability blocks in this month"
                        emptyHint="Add a date range in the card above, or change the month."
                      >
                        {blocks.length > 0 && (
                          <div className="ag-theme-alpine" style={{ width: "100%", height: 200 }}>
                            <AgGridReact
                              rowData={blocks}
                              columnDefs={blockColDefs}
                              getRowId={(p) => String(p.data?.id ?? "")}
                              defaultColDef={{ resizable: true, minWidth: 100 }}
                              onCellClicked={(e) => {
                                if (e.colDef?.colId === "act" && (e.data as BlockRow | undefined)?.id) {
                                  void removeBlock((e.data as BlockRow).id);
                                }
                              }}
                            />
                          </div>
                        )}
                      </AgFrame>
                    </SectionCard>
                  </Stack>
                )}

                {tab === 2 && (
                  <Stack spacing={1.5}>
                    <SectionCard
                      title="All engagements for this provider"
                      description="Double-click a row or use Edit. Server-side overlap checks apply for schedule and reassignment. Audit fields use your optional admin name / id in the form."
                      icon={<ListChecks size={20} strokeWidth={1.75} />}
                      accent="violet"
                    >
                      <AgFrame
                        minH={400}
                        empty={!loading && engagements.length === 0}
                        emptyTitle="No bookings for this service provider"
                        emptyHint="When the provider has scheduled work, you’ll see it here in one combined table (current, upcoming, past)."
                      >
                        {engagements.length > 0 && (
                          <div className="ag-theme-alpine" style={{ width: "100%", height: 400 }}>
                            <AgGridReact<EngRow>
                              rowData={engagements}
                              columnDefs={engColDefs}
                              pagination
                              paginationPageSize={10}
                              getRowId={(p) => String(p.data?.engagement_id ?? "")}
                              onRowDoubleClicked={(e) => {
                                if (e.data) openEdit(e.data);
                              }}
                              onCellClicked={(e) => {
                                if (e.colDef?.colId === "edit" && e.data) openEdit(e.data);
                              }}
                              defaultColDef={{ resizable: true, sortable: true, minWidth: 100 }}
                            />
                          </div>
                        )}
                      </AgFrame>
                    </SectionCard>
                  </Stack>
                )}

                {tab === 3 && (
                  <Stack spacing={1.5}>
                    <SectionCard
                      title="Change history (engagement modifications)"
                      description="Latest first. “Who” comes from stored modified_by_id / role when the API was called; payload shows what changed (including vacation and admin edits)."
                      icon={<History size={20} strokeWidth={1.75} />}
                      accent="sky"
                    >
                      <AgFrame
                        minH={420}
                        empty={!loading && modLog.length === 0}
                        emptyTitle="No modification log yet"
                        emptyHint="Log entries are created when engagements are updated, vacations apply, or the admin form saves a change to the API."
                      >
                        {modLog.length > 0 && (
                          <div className="ag-theme-alpine" style={{ width: "100%", height: 420 }}>
                            <AgGridReact<ModLogRow>
                              rowData={modLog}
                              columnDefs={logColDefs}
                              pagination
                              paginationPageSize={12}
                              getRowId={(p) => String((p.data as ModLogRow | undefined)?.modification_id ?? "")}
                              defaultColDef={{ sortable: true, resizable: true, filter: true, minWidth: 80 }}
                            />
                          </div>
                        )}
                      </AgFrame>
                    </SectionCard>
                  </Stack>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.75, bgcolor: (th) => alpha(th.palette.text.primary, 0.02) }}>
          <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            elevation: 16,
            sx: (th) => ({
              borderRadius: 2.5,
              border: `1px solid ${alpha(String(th.palette.divider), 0.9)}`,
            }),
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={(th) => ({
            px: 2.5,
            py: 2,
            borderBottom: 1,
            borderColor: "divider",
            background: `linear-gradient(135deg, ${alpha("#7c3aed", 0.08)} 0%, #fff 55%)`,
          })}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap" useFlexGap>
            <Stack>
              <Typography component="h3" fontWeight={800} variant="h6" letterSpacing="-0.02em">
                Update engagement
              </Typography>
              {editing?.engagement_id && (
                <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  <Chip size="small" label={`#${editing.engagement_id}`} color="secondary" />
                  <Typography variant="body2" color="text.secondary">
                    Adjust schedule, type, and assignment. Only changed values are required.
                  </Typography>
                </Stack>
              )}
            </Stack>
            <Button
              size="small"
              startIcon={<X className="h-4 w-4" />}
              onClick={() => setEditOpen(false)}
              color="inherit"
              sx={{ textTransform: "none" }}
            >
              Dismiss
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: (th) => alpha(th.palette.text.primary, 0.01) }}>
          <Stack spacing={0}>
            <Box sx={{ p: 2.5, pb: 0 }}>
              <Alert severity="info" variant="filled" icon={false} sx={{ borderRadius: 2, py: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>
                  Wallet, overlap, and vacation business rules on the server still apply. Be deliberate about what you
                  change.
                </Typography>
              </Alert>
            </Box>
            <Box sx={{ px: 2.5, py: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Start date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
                sx={{ gridColumn: { sm: "span 1" }, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
              <TextField
                label="End date"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
              <TextField
                label="Start time (IST)"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                size="small"
                fullWidth
                placeholder="HH:mm"
                sx={{ gridColumn: { xs: "1", sm: "span 2" }, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
              <FormControl fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}>
                <InputLabel id="ts">Task status</InputLabel>
                <Select
                  labelId="ts"
                  value={form.task_status}
                  label="Task status"
                  onChange={(e) => setForm((f) => ({ ...f, task_status: e.target.value }))}
                >
                  {["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "HOLD"].map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Service type"
                value={form.service_type}
                onChange={(e) => setForm((f) => ({ ...f, service_type: e.target.value }))}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
              <TextField
                label="Booking type"
                value={form.booking_type}
                onChange={(e) => setForm((f) => ({ ...f, booking_type: e.target.value }))}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
              <TextField
                label="Base amount"
                value={form.base_amount}
                onChange={(e) => setForm((f) => ({ ...f, base_amount: e.target.value }))}
                size="small"
                type="number"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
              <TextField
                label="Reassign to provider id"
                value={form.serviceproviderid}
                onChange={(e) => setForm((f) => ({ ...f, serviceproviderid: e.target.value }))}
                size="small"
                fullWidth
                helperText="Set another id only if you are reassigning. Overlap is validated on the server."
                sx={{ gridColumn: { sm: "span 2" }, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
            <Paper variant="outlined" sx={{ mx: 2.5, p: 2, borderRadius: 2, bgcolor: (th) => alpha(th.palette.text.primary, 0.02) }}>
              <Typography fontWeight={700} variant="subtitle2" gutterBottom>
                Audit
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                flexWrap="wrap"
                useFlexGap
                gap={2}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.active}
                      onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                      size="small"
                    />
                  }
                  label="Engagement active"
                />
                <TextField
                  label="Admin name (optional)"
                  value={form.admin_name}
                  onChange={(e) => setForm((f) => ({ ...f, admin_name: e.target.value }))}
                  size="small"
                  sx={{ flex: 1, minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
                <TextField
                  label="Admin user id"
                  value={form.admin_id}
                  onChange={(e) => setForm((f) => ({ ...f, admin_id: e.target.value }))}
                  size="small"
                  type="number"
                  sx={{ width: 160, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 2, gap: 1, borderTop: 1, borderColor: "divider" }}>
          <Button
            onClick={() => setEditOpen(false)}
            color="inherit"
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5, px: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void saveEngagement()}
            variant="contained"
            disabled={savingEng}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5, minWidth: 120, boxShadow: "none" }}
          >
            {savingEng ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={5000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snack ? <Alert severity={snack.type}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </>
  );
}

export default ServiceProviderAdminDialog;
