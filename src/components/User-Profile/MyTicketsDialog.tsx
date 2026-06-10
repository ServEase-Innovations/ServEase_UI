/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import { X, Clock, AlertCircle, LifeBuoy, ChevronRight, Plus, Inbox } from "lucide-react";
import { Dialog, DialogContent } from "@mui/material";
import { Button } from "../Button/button";
import { ClipLoader } from "react-spinners";
import { BOOKING_HEADER_GRADIENT } from "../ProviderDetails/MaidServiceDialog.styles";
import { useAppUser } from "src/context/AppUserContext";
import {
  fetchMyTickets,
  type SupportTicket,
  type TicketStatus,
} from "src/services/ticketsService";
import { openSupportTicketDialog } from "src/utils/supportTicketEvents";

interface MyTicketsDialogProps {
  open: boolean;
  onClose: () => void;
  onRaiseNew?: () => void;
}

function priorityBadgeClass(p: string) {
  if (p === "HIGH") return "bg-red-100 text-red-800 ring-red-200/80";
  if (p === "LOW") return "bg-slate-100 text-slate-700 ring-slate-200/80";
  return "bg-amber-100 text-amber-900 ring-amber-200/80";
}

function statusBadgeClass(status: TicketStatus) {
  if (status === "OPEN") return "bg-sky-100 text-sky-800";
  if (status === "IN_PROGRESS") return "bg-indigo-100 text-indigo-800";
  if (status === "WAITING_CUSTOMER") return "bg-amber-100 text-amber-900";
  if (status === "RESOLVED") return "bg-emerald-100 text-emerald-800";
  if (status === "CLOSED") return "bg-slate-100 text-slate-600";
  return "bg-slate-100 text-slate-700";
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function formatSlaDue(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const MyTicketsDialog: React.FC<MyTicketsDialogProps> = ({ open, onClose, onRaiseNew }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  const { appUser } = useAppUser();
  const customerId =
    appUser?.customerId != null
      ? Number(appUser.customerId)
      : appUser?.customerid != null
        ? Number(appUser.customerid)
        : undefined;

  useEffect(() => {
    if (!open || !customerId) return;
    setLoading(true);
    fetchMyTickets(customerId)
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [open, customerId]);

  const openTicketCount = useMemo(
    () => tickets.filter((t) => !["CLOSED", "CANCELLED", "RESOLVED"].includes(t.status)).length,
    [tickets]
  );

  const headerSubtitle = useMemo(() => {
    if (loading) return "Loading your support requests…";
    if (tickets.length === 0) return "No tickets yet — we're here when you need help.";
    if (openTicketCount === 1) return "1 active ticket · Track replies from our support team";
    if (openTicketCount > 1) return `${openTicketCount} active tickets · Track replies from our support team`;
    return `${tickets.length} ticket${tickets.length === 1 ? "" : "s"} · View past resolutions`;
  }, [loading, tickets.length, openTicketCount]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
        },
      }}
    >
      <header
        className="relative px-5 pb-4 pt-5 pr-12 text-white"
        style={{ background: BOOKING_HEADER_GRADIENT }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-white/90 transition-colors hover:bg-white/15"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <LifeBuoy className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight tracking-tight">My Support Tickets</h2>
            <p className="mt-1 text-sm leading-snug text-white/90">{headerSubtitle}</p>
          </div>
        </div>
      </header>

      <DialogContent sx={{ pt: 2, px: 2.5, pb: 2.5, bgcolor: "#f8fafc" }}>
        {onRaiseNew ? (
          <Button
            variant="dialogPrimary"
            className="mb-4 w-full gap-2"
            onClick={onRaiseNew}
          >
            <Plus className="h-4 w-4" />
            Raise new complaint
          </Button>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <ClipLoader size={28} color="#0b5bd3" />
            <p className="text-sm text-slate-500">Fetching your tickets…</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Inbox className="h-6 w-6 text-slate-400" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-slate-800">No support tickets yet</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Report an issue from a booking and we&apos;ll respond here with updates.
            </p>
            {onRaiseNew ? (
              <Button variant="outline" size="sm" className="mt-4" onClick={onRaiseNew}>
                Raise a complaint
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="max-h-[26rem] space-y-2.5 overflow-y-auto pr-0.5">
            {tickets.map((t) => (
              <li key={t.ticket_id}>
                <button
                  type="button"
                  className="group w-full rounded-xl border border-slate-200/80 bg-white p-3.5 text-left shadow-sm transition-all hover:border-sky-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                  onClick={() => openSupportTicketDialog(t.ticket_id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-medium text-slate-500">
                          {t.ticket_number}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${priorityBadgeClass(t.priority)}`}
                        >
                          {t.priority}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(t.status)}`}
                        >
                          {formatStatusLabel(t.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-sky-900">
                        {t.subject}
                      </p>

                      {t.description ? (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
                          {t.description}
                        </p>
                      ) : null}

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          SLA due {formatSlaDue(t.sla_due_at)}
                        </span>
                        {t.engagement_id != null ? (
                          <span className="text-slate-400">· Booking #{t.engagement_id}</span>
                        ) : null}
                        {t.is_overdue ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                            <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                            Overdue
                          </span>
                        ) : null}
                      </div>

                      {t.resolution_notes ? (
                        <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-2 text-xs text-emerald-900">
                          <span className="font-semibold">Resolution: </span>
                          {t.resolution_notes}
                        </p>
                      ) : null}
                    </div>

                    <ChevronRight
                      className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-sky-500"
                      aria-hidden
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MyTicketsDialog;
