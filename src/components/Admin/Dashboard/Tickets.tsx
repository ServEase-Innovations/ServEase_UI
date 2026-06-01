import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Input } from "../../Common/input";
import { Loader2, RefreshCw, Ticket, AlertTriangle, Clock } from "lucide-react";
import { cn } from "../../utils";
import {
  addAdminTicketComment,
  fetchAdminTicketById,
  fetchAdminTickets,
  fetchAdminTicketStats,
  updateAdminTicket,
  type SupportTicket,
  type TicketPriority,
  type TicketStatus,
} from "src/services/ticketsService";

const STATUS_OPTIONS: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
];

const PRIORITY_OPTIONS: TicketPriority[] = ["LOW", "MEDIUM", "HIGH"];

function priorityClass(p: string) {
  if (p === "HIGH") return "bg-red-500/15 text-red-200 ring-red-500/30";
  if (p === "LOW") return "bg-slate-500/20 text-slate-200 ring-slate-500/30";
  return "bg-amber-500/15 text-amber-200 ring-amber-500/30";
}

function statusClass(s: string) {
  if (s === "OPEN") return "bg-sky-500/15 text-sky-200";
  if (s === "IN_PROGRESS") return "bg-violet-500/15 text-violet-200";
  if (s === "RESOLVED" || s === "CLOSED") return "bg-emerald-500/15 text-emerald-200";
  if (s === "CANCELLED") return "bg-slate-500/20 text-slate-400";
  return "bg-amber-500/15 text-amber-200";
}

function formatDue(iso: string, isOverdue: boolean) {
  const d = new Date(iso);
  const label = d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  return { label, isOverdue };
}

const Tickets = () => {
  const [rows, setRows] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SupportTicket | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [internalNote, setInternalNote] = useState(false);

  const [edit, setEdit] = useState({
    status: "OPEN" as TicketStatus,
    priority: "MEDIUM" as TicketPriority,
    sla_hours: 48,
    assigned_admin_email: "",
    resolution_notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tickets, statRes] = await Promise.all([
        fetchAdminTickets({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          overdueOnly,
          search: search.trim() || undefined,
        }),
        fetchAdminTicketStats(),
      ]);
      setRows(tickets);
      setStats(statRes.stats as unknown as Record<string, number>);
    } catch (e) {
      const err = e as { response?: { status?: number; data?: { error?: string } }; message?: string };
      if (err?.response?.status === 401) {
        setError("Admin secret missing or invalid. Set REACT_APP_ADMIN_TICKET_SECRET in the UI build env.");
      } else {
        setError(err?.response?.data?.error || err?.message || "Failed to load tickets");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, overdueOnly, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = async (ticketId: number) => {
    setSelectedId(ticketId);
    setDetailLoading(true);
    try {
      const t = await fetchAdminTicketById(ticketId);
      setDetail(t);
      setEdit({
        status: t.status,
        priority: t.priority,
        sla_hours: t.sla_hours,
        assigned_admin_email: t.assigned_admin_email || "",
        resolution_notes: t.resolution_notes || "",
      });
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const updated = await updateAdminTicket(selectedId, edit);
      setDetail(updated);
      setRows((prev) => prev.map((r) => (r.ticket_id === selectedId ? { ...r, ...updated } : r)));
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleComment = async () => {
    if (!selectedId || !comment.trim()) return;
    setSaving(true);
    try {
      const updated = await addAdminTicketComment(selectedId, comment.trim(), internalNote);
      setDetail(updated);
      setComment("");
      setInternalNote(false);
    } finally {
      setSaving(false);
    }
  };

  const statCards = useMemo(
    () => [
      { label: "Open", value: stats?.open ?? 0, icon: Ticket },
      { label: "In progress", value: stats?.in_progress ?? 0, icon: Clock },
      { label: "Overdue", value: stats?.overdue ?? 0, icon: AlertTriangle },
      { label: "High priority", value: stats?.high_priority_open ?? 0, icon: AlertTriangle },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Support tickets</h2>
          <p className="text-sm text-muted-foreground">
            Customer complaints with SLA (default 48h). Set priority and resolution time per ticket.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className="h-8 w-8 text-sky-500/80" />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Queue</CardTitle>
          <CardDescription>Filter and select a ticket to manage SLA, priority, and replies.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search ticket #, subject, customer id…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <select
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All priorities</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
              />
              Overdue only
            </label>
          </div>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="max-h-[28rem] overflow-y-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-muted/80 text-xs uppercase">
                    <tr>
                      <th className="p-2">Ticket</th>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Priority</th>
                      <th className="p-2">SLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No tickets match filters.
                        </td>
                      </tr>
                    ) : (
                      rows.map((t) => {
                        const due = formatDue(t.sla_due_at, t.is_overdue);
                        return (
                          <tr
                            key={t.ticket_id}
                            className={cn(
                              "cursor-pointer border-t hover:bg-muted/50",
                              selectedId === t.ticket_id && "bg-sky-500/10"
                            )}
                            onClick={() => void openDetail(t.ticket_id)}
                          >
                            <td className="p-2 font-mono text-xs">{t.ticket_number}</td>
                            <td className="p-2 max-w-[10rem] truncate" title={t.subject}>
                              {t.subject}
                            </td>
                            <td className="p-2">
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs ring-1",
                                  priorityClass(t.priority)
                                )}
                              >
                                {t.priority}
                              </span>
                            </td>
                            <td
                              className={cn(
                                "p-2 text-xs",
                                due.isOverdue && "font-semibold text-red-600"
                              )}
                            >
                              {due.label}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border p-4 min-h-[16rem]">
                {!selectedId ? (
                  <p className="text-sm text-muted-foreground">Select a ticket to view details.</p>
                ) : detailLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : detail ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">{detail.ticket_number}</p>
                      <h3 className="font-semibold">{detail.subject}</h3>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                        {detail.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Customer: {detail.customer_name || detail.customerid}
                        {detail.engagement_id ? ` · Booking #${detail.engagement_id}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs", statusClass(detail.status))}>
                        {detail.status.replace(/_/g, " ")}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs ring-1",
                          priorityClass(detail.priority)
                        )}
                      >
                        {detail.priority}
                      </span>
                      {detail.is_overdue && (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs font-medium">
                        Status
                        <select
                          className="mt-1 flex h-9 w-full rounded-md border px-2 text-sm"
                          value={edit.status}
                          onChange={(e) =>
                            setEdit((p) => ({ ...p, status: e.target.value as TicketStatus }))
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-medium">
                        Priority
                        <select
                          className="mt-1 flex h-9 w-full rounded-md border px-2 text-sm"
                          value={edit.priority}
                          onChange={(e) =>
                            setEdit((p) => ({ ...p, priority: e.target.value as TicketPriority }))
                          }
                        >
                          {PRIORITY_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-medium">
                        SLA (hours)
                        <Input
                          type="number"
                          min={1}
                          max={720}
                          className="mt-1 h-9"
                          value={edit.sla_hours}
                          onChange={(e) =>
                            setEdit((p) => ({ ...p, sla_hours: Number(e.target.value) || 48 }))
                          }
                        />
                      </label>
                      <label className="text-xs font-medium">
                        Assigned admin
                        <Input
                          className="mt-1 h-9"
                          value={edit.assigned_admin_email}
                          onChange={(e) =>
                            setEdit((p) => ({ ...p, assigned_admin_email: e.target.value }))
                          }
                          placeholder="admin@serveaso.com"
                        />
                      </label>
                    </div>

                    <label className="block text-xs font-medium">
                      Resolution notes
                      <textarea
                        className="mt-1 w-full rounded-md border p-2 text-sm min-h-[4rem]"
                        value={edit.resolution_notes}
                        onChange={(e) =>
                          setEdit((p) => ({ ...p, resolution_notes: e.target.value }))
                        }
                      />
                    </label>

                    <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </Button>

                    <div className="border-t pt-3 space-y-2 max-h-40 overflow-y-auto">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Thread</p>
                      {(detail.comments || []).map((c) => (
                        <div
                          key={c.comment_id}
                          className={cn(
                            "rounded-md p-2 text-sm",
                            c.is_internal ? "bg-amber-50 border border-amber-200" : "bg-muted/50"
                          )}
                        >
                          <p className="text-xs text-muted-foreground">
                            {c.author_name || c.author_type}
                            {c.is_internal ? " (internal)" : ""} ·{" "}
                            {new Date(c.created_at).toLocaleString()}
                          </p>
                          <p>{c.body}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Reply to customer or internal note…"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" variant="outline" onClick={() => void handleComment()} disabled={saving}>
                        Send
                      </Button>
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={internalNote}
                        onChange={(e) => setInternalNote(e.target.checked)}
                      />
                      Internal note (hidden from customer)
                    </label>
                  </div>
                ) : (
                  <p className="text-sm text-destructive">Could not load ticket.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets;
