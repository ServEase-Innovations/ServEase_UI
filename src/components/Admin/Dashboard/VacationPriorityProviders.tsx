import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { CalendarDays, Loader2, RefreshCw, UserRound } from "lucide-react";
import { cn } from "../../utils";
import {
  assignOnDemandEngagement,
  fetchAdminVacationProviders,
  type AdminVacationProviderRow,
} from "src/services/adminEngagementsService";

function customerLabel(row: AdminVacationProviderRow) {
  const name = [row.customer?.firstname, row.customer?.lastname].filter(Boolean).join(" ");
  return name || `Customer #${row.customer?.customerid ?? "?"}`;
}

function providerLabel(row: AdminVacationProviderRow) {
  const name = [row.provider?.firstname, row.provider?.lastname].filter(Boolean).join(" ");
  return name || `Provider #${row.provider?.serviceproviderid ?? "?"}`;
}

const VacationPriorityProviders = () => {
  const [rows, setRows] = useState<AdminVacationProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAdminVacationProviders(true);
      setRows(list);
    } catch (e) {
      const err = e as { response?: { status?: number; data?: { error?: string } }; message?: string };
      if (err?.response?.status === 401) {
        setError(
          "Admin secret missing or invalid. Set REACT_APP_ADMIN_PUSH_SECRET in the UI build env."
        );
      } else {
        setError(err?.response?.data?.error || err?.message || "Failed to load vacation providers");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAssign = async (onDemandEngagementId: number, providerId: number) => {
    setAssigningId(onDemandEngagementId);
    setError(null);
    try {
      await assignOnDemandEngagement(onDemandEngagementId, providerId);
      await load();
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
          <h2 className="text-xl font-semibold text-foreground">Vacation priority providers</h2>
          <p className="text-sm text-muted-foreground">
            Service providers reserved during customer vacation (not freed). They receive top priority
            for on-demand bookings in this window — assign pending on-demand jobs to them here.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Active vacation windows
          </CardTitle>
          <CardDescription>
            Customers on approved vacation leave; their assigned provider stays reserved and is eligible
            for on-demand work until vacation ends or is cancelled.
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
              No service providers are in an active customer vacation window today.
            </p>
          ) : (
            <div className="space-y-4">
              {rows.map((row) => (
                <div key={row.engagement_id} className="rounded-lg border p-4 space-y-3 bg-card">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-sky-600" />
                        {providerLabel(row)}
                        <span className="text-muted-foreground font-normal">
                          (#{row.provider?.serviceproviderid})
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vacation customer: {customerLabel(row)}
                        {row.customer?.mobile ? ` · ${row.customer.mobile}` : ""}
                      </p>
                      <p className="text-sm">
                        Vacation: {row.vacation_start_date} → {row.vacation_end_date}
                        {row.leave_days ? ` · ${row.leave_days} day(s)` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Contract #{row.engagement_id} · {row.service_type} · {row.booking_type}
                      </p>
                      {row.address ? (
                        <p className="text-sm text-muted-foreground">{row.address}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900 ring-1 ring-sky-300/60">
                      Vacation priority
                    </span>
                  </div>

                  {(row.pending_on_demand?.length ?? 0) > 0 ? (
                    <div className="rounded-md border border-dashed bg-muted/30 p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Pending on-demand in this window
                      </p>
                      {row.pending_on_demand!.map((od) => (
                        <div
                          key={od.engagement_id}
                          className="flex flex-wrap items-center justify-between gap-2 text-sm"
                        >
                          <div>
                            <span className="font-medium">#{od.engagement_id}</span>
                            {" · "}
                            {od.service_type}
                            {od.start_date ? ` · ${od.start_date}` : ""}
                            {od.address ? ` · ${od.address}` : ""}
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              void handleAssign(
                                od.engagement_id,
                                row.provider!.serviceproviderid
                              )
                            }
                            disabled={assigningId === od.engagement_id}
                          >
                            {assigningId === od.engagement_id
                              ? "Assigning…"
                              : `Assign to ${providerLabel(row)}`}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No unassigned on-demand bookings in this vacation window.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VacationPriorityProviders;
