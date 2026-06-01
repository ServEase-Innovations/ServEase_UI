/* eslint-disable */
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, Alert, Snackbar } from "@mui/material";
import { Button } from "../Button/button";
import { ClipLoader } from "react-spinners";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { useAppUser } from "src/context/AppUserContext";
import {
  createSupportTicket,
  fetchTicketMeta,
  getEngagementIdFromBooking,
  ticketErrorMessage,
  type TicketCategory,
} from "src/services/ticketsService";

interface RaiseComplaintDialogProps {
  open: boolean;
  onClose: () => void;
  booking?: { id?: number; engagement_id?: number; service_type?: string } | null;
  onSubmitted?: () => void;
}

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  GENERAL: "General",
  BOOKING: "Booking issue",
  PAYMENT: "Payment / billing",
  SERVICE_QUALITY: "Service quality",
  PROVIDER_CONDUCT: "Provider conduct",
  REFUND: "Refund request",
  APP_TECHNICAL: "App / technical",
};

const RaiseComplaintDialog: React.FC<RaiseComplaintDialogProps> = ({
  open,
  onClose,
  booking,
  onSubmitted,
}) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("GENERAL");
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [defaultSla, setDefaultSla] = useState(48);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { appUser } = useAppUser();
  const customerId =
    appUser?.customerId != null
      ? Number(appUser.customerId)
      : appUser?.customerid != null
        ? Number(appUser.customerid)
        : undefined;

  const engagementId = booking ? getEngagementIdFromBooking(booking) : null;

  useEffect(() => {
    if (!open) return;
    fetchTicketMeta()
      .then((meta) => {
        if (meta.categories?.length) setCategories(meta.categories);
        if (meta.default_sla_hours) setDefaultSla(meta.default_sla_hours);
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open && booking?.service_type) {
      setSubject((prev) => prev || `Issue with ${booking.service_type} booking`);
    }
  }, [open, booking]);

  const handleSubmit = async () => {
    if (!customerId) {
      setSnackbar({
        open: true,
        message: "Please sign in to raise a complaint.",
        severity: "error",
      });
      return;
    }
    if (!subject.trim() || !description.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a subject and description.",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSupportTicket({
        customerId,
        subject: subject.trim(),
        description: description.trim(),
        category,
        engagementId,
      });
      if (!result.success) {
        throw new Error(ticketErrorMessage(result.error, "Failed to create ticket"));
      }
      setSnackbar({
        open: true,
        message:
          result.message ||
          `Ticket ${result.ticket?.ticket_number || ""} created. We aim to respond within ${defaultSla} hours.`,
        severity: "success",
      });
      setSubject("");
      setDescription("");
      onSubmitted?.();
      setTimeout(onClose, 1200);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setSnackbar({
        open: true,
        message: ticketErrorMessage(err?.response?.data?.error, err?.message || "Failed to submit"),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogHeader>
          <DialogTitle>Raise a complaint</DialogTitle>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-gray-600 mb-4">
            Our support team will review your complaint. Default response target:{" "}
            <strong>{defaultSla} hours</strong>.
            {engagementId ? (
              <>
                {" "}
                Linked to booking <strong>#{engagementId}</strong>.
              </>
            ) : null}
          </p>

          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="w-full border rounded-md p-2 mb-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
          >
            {(categories.length ? categories : (Object.keys(CATEGORY_LABELS) as TicketCategory[])).map(
              (c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c] || c}
                </option>
              )
            )}
          </select>

          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            className="w-full border rounded-md p-2 mb-3 text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={255}
          />

          <label className="block text-sm font-medium mb-1">Describe the issue</label>
          <textarea
            className="w-full border rounded-md p-2 mb-4 text-sm min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ClipLoader size={20} color="#fff" /> : "Submit complaint"}
          </Button>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default RaiseComplaintDialog;
