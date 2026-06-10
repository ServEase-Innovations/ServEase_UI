/* eslint-disable */
import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock, X } from "lucide-react";
import { Dialog, DialogContent, Alert, Snackbar } from "@mui/material";
import { Button } from "../Button/button";
import { BOOKING_HEADER_GRADIENT } from "../ProviderDetails/MaidServiceDialog.styles";
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

  const bookingReference = booking ? getEngagementIdFromBooking(booking) : null;
  const engagementId = bookingReference;

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
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
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
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold leading-tight tracking-tight">
                Raise a Complaint
              </h2>
              {bookingReference != null ? (
                <p className="mt-1 text-sm font-semibold text-white/95">
                  Booking #{bookingReference}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-3 space-y-1 border-t border-white/15 pt-3 text-sm leading-relaxed text-white/90">
            <p>Our support team will review your complaint.</p>
            <p className="flex items-center gap-1.5 font-medium text-white">
              <Clock className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              Expected response time: {defaultSla} hours
            </p>
          </div>
        </header>

        <DialogContent sx={{ pt: 2.5, px: 2.5, pb: 2.5 }}>
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
            variant="dialogPrimary"
            className="w-full"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Submit complaint
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
