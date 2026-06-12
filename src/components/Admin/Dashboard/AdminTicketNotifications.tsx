import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bell, Ticket, X } from "lucide-react";
import { Badge } from "@mui/material";
import { Button } from "src/components/Common/button";
import { cn } from "../../utils";
import {
  ADMIN_TICKET_ACTIVITY_EVENT,
  dispatchAdminOpenTicket,
  type AdminTicketActivityDetail,
} from "src/utils/supportTicketEvents";
import {
  ADMIN_ON_DEMAND_ESCALATION_EVENT,
  dispatchAdminOpenOnDemandEscalations,
  type AdminOnDemandEscalationDetail,
} from "src/utils/onDemandEscalationEvents";
import { fetchAdminEscalatedOnDemandEngagements } from "src/services/adminEngagementsService";
import {
  onDemandEscalationAlertKey,
  ticketAlertKey,
} from "src/utils/adminAlertKeys";
import {
  fetchAdminAlertReadKeys,
  getAdminAlertUserId,
  saveAdminAlertReadKeys,
} from "src/services/adminAlertReadsService";

type TicketActivity = AdminTicketActivityDetail & {
  kind: "ticket";
  id: string;
};

type EscalationActivity = AdminOnDemandEscalationDetail & {
  kind: "on-demand";
  id: string;
  title: string;
  body: string;
};

type StoredActivity = (TicketActivity | EscalationActivity) & { read: boolean };

type Props = {
  onGoToTickets?: () => void;
  onGoToOnDemandEscalations?: () => void;
};

export function AdminTicketNotifications({
  onGoToTickets,
  onGoToOnDemandEscalations,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<Array<TicketActivity | EscalationActivity>>([]);
  const [readKeys, setReadKeys] = useState<Set<string>>(new Set());
  const [readKeysLoaded, setReadKeysLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const adminUserId = getAdminAlertUserId();

  const items: StoredActivity[] = useMemo(
    () => activities.map((a) => ({ ...a, read: readKeys.has(a.id) })),
    [activities, readKeys]
  );

  const unread = items.filter((i) => !i.read).length;

  const persistReadKeys = useCallback(
    async (keys: string[]) => {
      if (!adminUserId || keys.length === 0) return;
      try {
        await saveAdminAlertReadKeys(adminUserId, keys);
      } catch (err) {
        console.warn("[admin-alerts] failed to persist read state", err);
      }
    },
    [adminUserId]
  );

  const markKeysRead = useCallback(
    (keys: string[]) => {
      const fresh = keys.filter((k) => k && !readKeys.has(k));
      if (fresh.length === 0) return;
      setReadKeys((prev) => {
        const next = new Set(prev);
        fresh.forEach((k) => next.add(k));
        return next;
      });
      void persistReadKeys(fresh);
    },
    [persistReadKeys, readKeys]
  );

  const pushTicketActivity = useCallback((detail: AdminTicketActivityDetail) => {
    const id = ticketAlertKey(detail);
    setActivities((prev) => {
      const without = prev.filter((x) => x.id !== id);
      return [{ ...detail, kind: "ticket" as const, id }, ...without].slice(0, 40);
    });
  }, []);

  const pushEscalationActivity = useCallback((detail: AdminOnDemandEscalationDetail) => {
    const id = onDemandEscalationAlertKey(detail);
    const title = "On-demand booking needs a provider";
    const body = [
      detail.serviceType,
      detail.startTimeLabel ? `Starts ${detail.startTimeLabel}` : null,
      detail.customerName,
    ]
      .filter(Boolean)
      .join(" · ");
    setActivities((prev) => {
      const without = prev.filter((x) => x.id !== id);
      return [
        { ...detail, kind: "on-demand" as const, id, title, body },
        ...without,
      ].slice(0, 40);
    });
  }, []);

  useEffect(() => {
    if (!adminUserId) {
      setReadKeysLoaded(true);
      return;
    }
    let cancelled = false;
    void fetchAdminAlertReadKeys(adminUserId)
      .then((keys) => {
        if (!cancelled) setReadKeys(keys);
      })
      .catch((err) => {
        console.warn("[admin-alerts] failed to load read keys", err);
      })
      .finally(() => {
        if (!cancelled) setReadKeysLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [adminUserId]);

  useEffect(() => {
    const onTicket = (e: Event) => {
      const detail = (e as CustomEvent<AdminTicketActivityDetail>).detail;
      if (!detail?.ticketId) return;
      pushTicketActivity(detail);
    };
    const onEscalation = (e: Event) => {
      const detail = (e as CustomEvent<AdminOnDemandEscalationDetail>).detail;
      if (!detail?.engagementId) return;
      pushEscalationActivity(detail);
    };
    window.addEventListener(ADMIN_TICKET_ACTIVITY_EVENT, onTicket);
    window.addEventListener(ADMIN_ON_DEMAND_ESCALATION_EVENT, onEscalation);
    return () => {
      window.removeEventListener(ADMIN_TICKET_ACTIVITY_EVENT, onTicket);
      window.removeEventListener(ADMIN_ON_DEMAND_ESCALATION_EVENT, onEscalation);
    };
  }, [pushTicketActivity, pushEscalationActivity]);

  useEffect(() => {
    if (!readKeysLoaded) return;
    let cancelled = false;
    void fetchAdminEscalatedOnDemandEngagements()
      .then((rows) => {
        if (cancelled || !rows.length) return;
        rows.slice(0, 10).forEach((row) => {
          pushEscalationActivity({
            engagementId: row.engagement_id,
            serviceType: row.service_type,
            startTimeLabel:
              row.start_date && row.start_time
                ? `${row.start_date} ${row.start_time}`
                : row.start_date,
            customerName: [row.customer?.firstname, row.customer?.lastname]
              .filter(Boolean)
              .join(" ")
              .trim(),
            customerMobile: row.customer?.mobile ?? null,
            escalatedAt: undefined,
          });
        });
      })
      .catch(() => {
        /* secret missing or API unavailable — On-demand escalations page shows error */
      });
    return () => {
      cancelled = true;
    };
  }, [pushEscalationActivity, readKeysLoaded]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const markAllRead = () => {
    const keys = items.filter((i) => !i.read).map((i) => i.id);
    markKeysRead(keys);
  };

  const openItem = (item: StoredActivity) => {
    markKeysRead([item.id]);
    setOpen(false);
    if (item.kind === "ticket") {
      onGoToTickets?.();
      dispatchAdminOpenTicket(item.ticketId);
      return;
    }
    onGoToOnDemandEscalations?.();
    dispatchAdminOpenOnDemandEscalations();
  };

  return (
    <div className="relative" ref={panelRef}>
      <Badge
        color="error"
        badgeContent={unread}
        invisible={!unread}
        max={99}
        sx={{
          "& .MuiBadge-badge": {
            fontSize: 10,
            minWidth: 16,
            height: 16,
            padding: "0 4px",
          },
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-9 w-9 text-slate-200/90 hover:bg-white/10 hover:text-white"
          title="Admin alerts"
          aria-label="Admin alerts"
          onClick={() => setOpen((v) => !v)}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </Badge>

      {open && (
        <div
          className="absolute right-0 top-full z-[200] mt-2 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-xl border border-slate-700/40 bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/10"
          role="dialog"
          aria-label="Admin notifications"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Admin alerts
            </p>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  className="text-[10px] font-medium text-sky-600 hover:underline"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ul className="max-h-72 overflow-y-auto py-1">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-500">
                Support tickets and on-demand booking escalations appear here in real time.
              </li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-2.5 text-left transition hover:bg-sky-50/90",
                      !n.read && "bg-sky-50/50 border-l-2 border-l-sky-500"
                    )}
                    onClick={() => openItem(n)}
                  >
                    <div className="flex items-start gap-2">
                      {n.kind === "ticket" ? (
                        <Ticket className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-tight text-slate-900">
                          {n.kind === "ticket" ? n.title || "Support ticket" : n.title}
                        </p>
                        {n.body ? (
                          <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{n.body}</p>
                        ) : null}
                        <p className="mt-1 font-mono text-[10px] text-slate-400">
                          {n.kind === "ticket"
                            ? n.ticketNumber || `#${n.ticketId}`
                            : `Booking #${n.engagementId}`}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
