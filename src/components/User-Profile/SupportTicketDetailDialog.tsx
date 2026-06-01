/* eslint-disable */
import React, { useCallback, useEffect, useState } from "react";
import { X, Clock, AlertCircle, Send, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, Alert, Snackbar } from "@mui/material";
import { Button } from "../Button/button";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import {
  addCustomerTicketComment,
  fetchTicketById,
  ticketErrorMessage,
  type SupportTicket,
} from "src/services/ticketsService";
import { TicketConversationThread } from "./TicketConversationThread";

function priorityBadgeClass(p: string) {
  if (p === "HIGH") return "bg-red-100 text-red-800";
  if (p === "LOW") return "bg-slate-100 text-slate-700";
  return "bg-amber-100 text-amber-900";
}

export type SupportTicketDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  ticketId: number | null;
  customerId: number | undefined;
};

const SupportTicketDetailDialog: React.FC<SupportTicketDetailDialogProps> = ({
  open,
  onClose,
  ticketId,
  customerId,
}) => {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
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

  const canReply =
    ticket &&
    !["CLOSED", "CANCELLED"].includes(ticket.status);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
        <DialogHeader>
          <DialogTitle>Support ticket</DialogTitle>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        <DialogContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600 py-4">{error}</p>
          ) : ticket ? (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-xs text-gray-500">{ticket.ticket_number}</p>
                <h3 className="text-lg font-semibold mt-1">{ticket.subject}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityBadgeClass(ticket.priority)}`}
                  >
                    {ticket.priority}
                  </span>
                  <span className="text-xs font-medium text-gray-700 bg-gray-100 rounded-full px-2 py-0.5">
                    {ticket.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{ticket.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  SLA due {new Date(ticket.sla_due_at).toLocaleString()}
                  {ticket.is_overdue && (
                    <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                      <AlertCircle className="h-3 w-3" /> Overdue
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Conversation</p>
                <div className="max-h-52 overflow-y-auto pr-1">
                  <TicketConversationThread
                    comments={ticket.comments}
                    ticket={ticket}
                    emptyLabel="No replies yet. Our team will respond here."
                  />
                </div>
              </div>

              {canReply ? (
                <div className="flex gap-2 pt-1">
                  <textarea
                    className="flex-1 min-h-[4rem] rounded-lg border border-gray-200 p-2 text-sm"
                    placeholder="Add a comment for our support team…"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="self-end shrink-0"
                    disabled={sending || !reply.trim()}
                    onClick={() => void handleSend()}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-500">This ticket is closed. Open a new complaint if you need more help.</p>
              )}
            </div>
          ) : null}
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
