/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  X,
  Clock,
  AlertCircle,
  Send,
  Loader2,
  LifeBuoy,
  CheckCircle2,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, Alert, Snackbar } from "@mui/material";
import { Button } from "../Button/button";
import { IconButton } from "../Button/icon-button";
import {
  acceptTicketResolution,
  addCustomerTicketComment,
  fetchTicketById,
  isAwaitingCustomerConfirmation,
  reopenSupportTicket,
  ticketErrorMessage,
  type SupportTicket,
  type TicketStatus,
} from "src/services/ticketsService";
import { TicketConversationThread } from "./TicketConversationThread";

function priorityBadgeClass(p: string) {
  if (p === "HIGH") return "bg-red-100 text-red-800 ring-red-200/80";
  if (p === "LOW") return "bg-slate-100 text-slate-700 ring-slate-200/80";
  return "bg-amber-100 text-amber-900 ring-amber-200/80";
}

function statusBadgeClass(status: TicketStatus | string) {
  if (status === "OPEN") return "bg-sky-100 text-sky-800";
  if (status === "IN_PROGRESS") return "bg-indigo-100 text-indigo-800";
  if (status === "WAITING_CUSTOMER") return "bg-amber-100 text-amber-900";
  if (status === "PENDING_CUSTOMER_CONFIRMATION" || status === "RESOLUTION_PROVIDED") {
    return "bg-amber-100 text-amber-900 ring-1 ring-amber-300/60";
  }
  if (status === "REOPENED") return "bg-orange-100 text-orange-900";
  if (status === "RESOLVED" || status === "CLOSED") return "bg-emerald-100 text-emerald-800";
  if (status === "CANCELLED") return "bg-slate-100 text-slate-600";
  return "bg-slate-100 text-slate-700";
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function formatWhen(iso: string) {
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

const dialogSlotProps: {
  paper: { className: string };
  backdrop: { className: string };
} = {
  paper: {
    className:
      "relative flex max-h-[min(92vh,720px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-900/10 m-0 sm:mx-4",
  },
  backdrop: { className: "bg-slate-900/40 backdrop-blur-[2px]" },
};

export type SupportTicketDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  ticketId: number | null;
  customerId: number | undefined;
  onRaiseNew?: () => void;
};

const SupportTicketDetailDialog: React.FC<SupportTicketDetailDialogProps> = ({
  open,
  onClose,
  ticketId,
  customerId,
  onRaiseNew,
}) => {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [reopenNote, setReopenNote] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const load = useCallback(async () => {
    if (!open || !ticketId || !customerId) return;
    setLoading(true);
    setError(null);
    try {
      const t = await fetchTicketById(ticketId, customerId);
      setTicket(t);
    } catch {
      setError("Could not load this ticket.");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [open, ticketId, customerId]);

  useEffect(() => {
    if (!open) {
      setTicket(null);
      setReply("");
      setReopenNote("");
      setError(null);
      return;
    }
    void load();
  }, [open, load]);

  const handleSend = async () => {
    if (!ticketId || !customerId || !reply.trim()) return;
    setSending(true);
    try {
      await addCustomerTicketComment(ticketId, customerId, reply.trim());
      setReply("");
      const refreshed = await fetchTicketById(ticketId, customerId);
      setTicket(refreshed);
      setSnack({ open: true, message: "Reply sent.", severity: "success" });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setSnack({
        open: true,
        message: ticketErrorMessage(err?.response?.data?.error, "Could not send reply."),
        severity: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const awaitingConfirmation = ticket ? isAwaitingCustomerConfirmation(ticket.status) : false;
  const isClosed = ticket?.status === "CLOSED";
  const isCancelled = ticket?.status === "CANCELLED";
  const isTerminal = isClosed || isCancelled;

  const canReply = ticket && !isTerminal && !awaitingConfirmation;

  const headerSubtitle = useMemo(() => {
    if (!ticket) return "Loading ticket details…";
    if (awaitingConfirmation) return "Your confirmation is needed before we close this ticket";
    if (isClosed) return "This issue was resolved and the ticket is closed";
    if (isCancelled) return "This ticket was cancelled";
    if (ticket.status === "REOPENED") return "Reopened — our team is reviewing your feedback";
    if (ticket.status === "IN_PROGRESS") return "Our support team is working on your request";
    return "We typically respond within the SLA window shown below";
  }, [ticket, awaitingConfirmation, isClosed, isCancelled]);

  const handleAcceptResolution = async () => {
    if (!ticketId || !customerId) return;
    setActing(true);
    try {
      const updated = await acceptTicketResolution(ticketId, customerId);
      setTicket(updated);
      setSnack({
        open: true,
        message: "Thank you — this ticket is now closed.",
        severity: "success",
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setSnack({
        open: true,
        message: ticketErrorMessage(err?.response?.data?.error, "Could not accept resolution."),
        severity: "error",
      });
    } finally {
      setActing(false);
    }
  };

  const handleReopen = async () => {
    if (!ticketId || !customerId) return;
    setActing(true);
    try {
      const updated = await reopenSupportTicket(
        ticketId,
        customerId,
        reopenNote.trim() || undefined
      );
      setTicket(updated);
      setReopenNote("");
      setSnack({
        open: true,
        message: "Ticket reopened. Our team will follow up.",
        severity: "success",
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setSnack({
        open: true,
        message: ticketErrorMessage(err?.response?.data?.error, "Could not reopen ticket."),
        severity: "error",
      });
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="body"
        aria-labelledby="support-ticket-title"
        slotProps={dialogSlotProps}
        disableEnforceFocus
      >
        <div className="shrink-0 border-b border-white/10 bg-gradient-to-r from-sky-700 via-slate-800 to-slate-900 px-4 py-3.5 pr-12 text-white sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/90 sm:text-xs">
            {ticket ? `Support · ${ticket.ticket_number}` : "Support"}
          </p>
          <DialogTitle
            className="!m-0 !p-0 !pt-0.5 !text-base !font-semibold !leading-tight !text-white sm:!text-lg line-clamp-2"
            component="div"
            id="support-ticket-title"
          >
            {ticket?.subject ?? "Support ticket"}
          </DialogTitle>
        </div>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          className="!absolute !right-2 !top-2 h-9 w-9 !rounded-lg !text-white hover:!bg-white/10 sm:!right-3 sm:!top-3"
        >
          <X className="h-5 w-5" />
        </IconButton>

        <DialogContent className="!flex !min-h-0 !flex-1 !flex-col !p-0 !bg-slate-50">
          <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-left text-xs leading-snug text-slate-600 sm:px-5 sm:text-sm">
            <LifeBuoy
              className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5 text-sky-600 sm:h-4 sm:w-4"
              aria-hidden
            />
            {headerSubtitle}
            {ticket ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityBadgeClass(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(ticket.status)}`}
                >
                  {formatStatusLabel(ticket.status)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-[#f8fafc]">
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-14">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-sm text-slate-500">Loading ticket…</p>
            </div>
          ) : error ? (
            <p className="p-4 text-sm text-red-600">{error}</p>
          ) : ticket ? (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 sm:px-4 space-y-3">
                {awaitingConfirmation ? (
                  <section className="rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                        <AlertCircle className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-amber-950">
                          Action required: confirm resolution
                        </h3>
                        <p className="mt-1 text-sm text-amber-900/90">
                          Our team believes your issue is resolved. Please accept to close the ticket,
                          or let us know if you still need help.
                        </p>
                      </div>
                    </div>

                    {ticket.resolution_notes ? (
                      <div className="mt-3 rounded-lg border border-amber-200/80 bg-white/80 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/70">
                          Resolution summary
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                          {ticket.resolution_notes}
                        </p>
                      </div>
                    ) : null}

                    <textarea
                      className="mt-3 w-full min-h-[3.5rem] rounded-lg border border-amber-200 bg-white p-2.5 text-sm text-slate-800 placeholder:text-slate-400"
                      placeholder="If reopening: what is still unresolved? (optional)"
                      value={reopenNote}
                      onChange={(e) => setReopenNote(e.target.value)}
                    />

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Button
                        variant="success"
                        className="w-full min-h-11"
                        disabled={acting}
                        onClick={() => void handleAcceptResolution()}
                      >
                        {acting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Accept resolution
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructiveOutline"
                        className="w-full min-h-11"
                        disabled={acting}
                        onClick={() => void handleReopen()}
                      >
                        Still need help
                      </Button>
                    </div>
                  </section>
                ) : null}

                {isClosed ? (
                  <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">Resolved and closed</p>
                        <p className="mt-1 text-sm text-emerald-800/90">
                          {ticket.resolved_at
                            ? `Closed on ${formatWhen(ticket.resolved_at)}.`
                            : "This ticket is closed."}{" "}
                          Thank you for using ServEaso support.
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}

                {isCancelled ? (
                  <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700">
                    This ticket was cancelled and is no longer active.
                  </section>
                ) : null}

                <section className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Your complaint
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      SLA due {formatWhen(ticket.sla_due_at)}
                    </span>
                    {ticket.engagement_id != null ? (
                      <span>· Booking #{ticket.engagement_id}</span>
                    ) : null}
                    {ticket.is_overdue ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                        Overdue
                      </span>
                    ) : null}
                  </div>
                </section>

                <section>
                  <div className="mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-500" aria-hidden />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Conversation
                    </p>
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-2.5 sm:max-h-64">
                    <TicketConversationThread
                      comments={ticket.comments}
                      ticket={
                        awaitingConfirmation
                          ? { ...ticket, resolution_notes: null }
                          : ticket
                      }
                      emptyLabel="No replies yet. Our team will respond here."
                    />
                  </div>
                </section>
              </div>

              <footer className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 sm:px-4">
                {canReply ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full min-h-[4.5rem] rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="Write a reply to our support team…"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <Button
                      variant="dialogPrimary"
                      className="w-full min-h-11"
                      disabled={sending || !reply.trim()}
                      onClick={() => void handleSend()}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send reply
                        </>
                      )}
                    </Button>
                  </div>
                ) : isTerminal && onRaiseNew ? (
                  <div className="space-y-2">
                    <p className="text-center text-sm text-slate-600">
                      Need help with something else?
                    </p>
                    <Button
                      variant="dialogPrimary"
                      className="w-full min-h-11 gap-2"
                      onClick={() => {
                        onClose();
                        onRaiseNew();
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Raise a new complaint
                    </Button>
                  </div>
                ) : isTerminal ? (
                  <p className="text-center text-sm text-slate-500">
                    This ticket is {isClosed ? "closed" : "cancelled"}. Open a new complaint from
                    your bookings if you need more help.
                  </p>
                ) : awaitingConfirmation ? (
                  <p className="text-center text-sm text-amber-800">
                    Use the buttons above to accept the resolution or reopen this ticket.
                  </p>
                ) : null}
              </footer>
            </>
          ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SupportTicketDetailDialog;
