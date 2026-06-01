import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Ticket, X } from "lucide-react";
import { Badge } from "@mui/material";
import { Button } from "src/components/Common/button";
import { cn } from "../../utils";
import {
  ADMIN_TICKET_ACTIVITY_EVENT,
  dispatchAdminOpenTicket,
  type AdminTicketActivityDetail,
} from "src/utils/supportTicketEvents";

type StoredActivity = AdminTicketActivityDetail & { id: string; read: boolean };

function activityKey(a: AdminTicketActivityDetail) {
  return `${a.ticketId}-${a.createdAt || ""}-${a.reason || ""}`;
}

type Props = {
  onGoToTickets?: () => void;
};

export function AdminTicketNotifications({ onGoToTickets }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<StoredActivity[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((i) => !i.read).length;

  const pushActivity = useCallback((detail: AdminTicketActivityDetail) => {
    const id = activityKey(detail);
    setItems((prev) => {
      const without = prev.filter((x) => x.id !== id);
      return [{ ...detail, id, read: false }, ...without].slice(0, 40);
    });
  }, []);

  useEffect(() => {
    const onActivity = (e: Event) => {
      const detail = (e as CustomEvent<AdminTicketActivityDetail>).detail;
      if (!detail?.ticketId) return;
      pushActivity(detail);
    };
    window.addEventListener(ADMIN_TICKET_ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(ADMIN_TICKET_ACTIVITY_EVENT, onActivity);
  }, [pushActivity]);

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
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  };

  const openTicket = (ticketId: number) => {
    setItems((prev) =>
      prev.map((i) => (i.ticketId === ticketId ? { ...i, read: true } : i))
    );
    setOpen(false);
    onGoToTickets?.();
    dispatchAdminOpenTicket(ticketId);
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
          title="Support ticket notifications"
          aria-label="Support ticket notifications"
          onClick={() => setOpen((v) => !v)}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </Badge>

      {open && (
        <div
          className="absolute right-0 top-full z-[200] mt-2 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-xl border border-slate-700/40 bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/10"
          role="dialog"
          aria-label="Ticket notifications"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Ticket alerts
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
                New customer tickets and replies appear here in real time.
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
                    onClick={() => openTicket(n.ticketId)}
                  >
                    <div className="flex items-start gap-2">
                      <Ticket className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-tight text-slate-900">
                          {n.title || "Support ticket"}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{n.body}</p>
                        )}
                        <p className="mt-1 font-mono text-[10px] text-slate-400">
                          {n.ticketNumber || `#${n.ticketId}`}
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
