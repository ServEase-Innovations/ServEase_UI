import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Input } from "../../Common/input";
import { AlertTriangle, Loader2, RefreshCw, UserRound } from "lucide-react";
import { cn } from "../../utils";
import {
  assignOnDemandEngagement,
  fetchAdminEscalatedOnDemandEngagements,
  type AdminEngagementRow,
} from "src/services/adminEngagementsService";
import {
  ADMIN_ON_DEMAND_ESCALATION_EVENT,
  ADMIN_OPEN_ON_DEMAND_ESCALATIONS_EVENT,
  type AdminOnDemandEscalationDetail,
} from "src/utils/onDemandEscalationEvents";

function formatStart(row: AdminEngagementRow) {
  if (row.start_time && row.start_date) return `${row.start_date} ${row.start_time}`;
  return row.start_date || "—";
}

function customerLabel(row: AdminEngagementRow) {
  const name = [row.customer?.firstname, row.customer?.lastname].filter(Boolean).join(" ");
  return name || `Customer #${row.customer?.customerid ?? "?"}`;
}

const OnDemandEscalations = () => {
  const [rows, setRows] = useState<AdminEngagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AdminOnDemandEscalationDetail | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [providerByEngagement, setProviderByEngagement] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAdminEscalatedOnDemandEngagements();
      setRows(list);
    } catch (e) {
      const err = e as { response?: { status?: number; data?: { error?: string } }; message?: string };
      if (err?.response?.status === 401) {
        setError(
          "Admin secret missing or invalid. Set REACT_APP_ADMIN_PUSH_SECRET in the UI build env."
        );
      } else {
        setError(err?.response?.data?.error || err?.message || "Failed to load escalations");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onEscalation = (e: Event) => {
      const detail = (e as CustomEvent<AdminOnDemandEscalationDetail>).detail;
      if (!detail?.engagementId) return;
      setAlert(detail);
      void load();
    };
    const onOpenSection = () => {
      void load();
    };
    window.addEventListener(ADMIN_ON_DEMAND_ESCALATION_EVENT, onEscalation);
    window.addEventListener(ADMIN_OPEN_ON_DEMAND_ESCALATIONS_EVENT, onOpenSection);
    return () => {
      window.removeEventListener(ADMIN_ON_DEMAND_ESCALATION_EVENT, onEscalation);
      window.removeEventListener(ADMIN_OPEN_ON_DEMAND_ESCALATIONS_EVENT, onOpenSection);
    };
  }, [load]);

  const handleAssign = async (engagementId: number) => {
    const providerId = Number(providerByEngagement[engagementId]);
    if (!Number.isFinite(providerId) || providerId < 1) {
      setError("Enter a valid provider ID before assigning.");
      return;
    }
    setAssigningId(engagementId);
    setError(null);
    try {
      await assignOnDemandEngagement(engagementId, providerId);
      setRows((prev) => prev.filter((r) => r.engagement_id !== engagementId));
      if (alert?.engagementId === engagementId) setAlert(null);
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Assign failed");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">On-demand escalations</h2>
          <p className="text-sm text-muted-foreground">
            Paid bookings with no provider after the acceptance window or within 20 minutes of start.
            Assign a provider manually or contact nearby providers by phone.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {alert ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">New on-demand escalation</p>
            <p>
              Booking #{alert.engagementId}
              {alert.serviceType ? ` · ${alert.serviceType}` : ""}
              {alert.startTimeLabel ? ` · starts ${alert.startTimeLabel}` : ""}
              {alert.customerName ? ` · ${alert.customerName}` : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto shrink-0"
            onClick={() => setAlert(null)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            Escalated queue
          </CardTitle>
          <CardDescription>
            Keep this page open while logged in as admin — new escalations appear here and as a banner
            alert in real time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No escalated on-demand bookings right now.
            </p>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.engagement_id}
                  className="rounded-lg border p-4 space-y-3 bg-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        #{row.engagement_id} · {row.service_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customerLabel(row)}
                        {row.customer?.mobile ? ` · ${row.customer.mobile}` : ""}
                      </p>
                      <p className="text-sm">Start: {formatStart(row)}</p>
                      {row.address ? (
                        <p className="text-sm text-muted-foreground">{row.address}</p>
                      ) : null}
                      <p className="text-sm">
                        Amount: ₹{row.base_amount}
                        {row.payment_status ? ` · ${row.payment_status}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-300/60">
                      {row.engagement_status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="text-xs font-medium">
                      Provider ID
                      <Input
                        className="mt-1 h-9 w-32"
                        inputMode="numeric"
                        value={providerByEngagement[row.engagement_id] ?? ""}
                        onChange={(e) =>
                          setProviderByEngagement((prev) => ({
                            ...prev,
                            [row.engagement_id]: e.target.value,
                          }))
                        }
                        placeholder="e.g. 7"
                      />
                    </label>
                    <Button
                      size="sm"
                      onClick={() => void handleAssign(row.engagement_id)}
                      disabled={assigningId === row.engagement_id}
                    >
                      {assigningId === row.engagement_id ? "Assigning…" : "Assign provider"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnDemandEscalations;
