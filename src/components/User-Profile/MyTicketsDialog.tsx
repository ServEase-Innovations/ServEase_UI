/* eslint-disable */
import React, { useEffect, useState } from "react";
import { X, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Button } from "../Button/button";
import { ClipLoader } from "react-spinners";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { useAppUser } from "src/context/AppUserContext";
import {
  fetchMyTickets,
  type SupportTicket,
} from "src/services/ticketsService";

interface MyTicketsDialogProps {
  open: boolean;
  onClose: () => void;
  onRaiseNew?: () => void;
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogHeader>
        <DialogTitle>My support tickets</DialogTitle>
        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </DialogHeader>
      <DialogContent>
        {onRaiseNew && (
          <Button variant="outline" size="sm" className="mb-4" onClick={onRaiseNew}>
            Raise new complaint
          </Button>
        )}
        {loading ? (
          <div className="flex justify-center py-8">
            <ClipLoader />
          </div>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-gray-600 py-4">No support tickets yet.</p>
        ) : (
          <ul className="space-y-3 max-h-[24rem] overflow-y-auto">
            {tickets.map((t) => (
              <li key={t.ticket_id} className="border rounded-lg p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-mono text-xs text-gray-500">{t.ticket_number}</span>
                  <span className="text-xs font-medium">{t.status.replace(/_/g, " ")}</span>
                </div>
                <p className="font-medium mt-1">{t.subject}</p>
                <p className="text-gray-600 mt-1 line-clamp-2">{t.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  SLA due {new Date(t.sla_due_at).toLocaleString()}
                  {t.is_overdue && (
                    <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                      <AlertCircle className="h-3 w-3" /> Overdue
                    </span>
                  )}
                </div>
                {t.resolution_notes && (
                  <p className="mt-2 text-xs bg-green-50 border border-green-100 rounded p-2">
                    Resolution: {t.resolution_notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MyTicketsDialog;
