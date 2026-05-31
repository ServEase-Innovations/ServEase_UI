/* eslint-disable */
import React, { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, Alert, Snackbar } from "@mui/material";
import { Button } from "../Button/button";
import { ClipLoader } from "react-spinners";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { useAppUser } from "src/context/AppUserContext";
import {
  checkReviewEligibility,
  createReview,
  getEngagementIdFromBooking,
  reviewReasonMessage,
} from "src/services/reviewsService";

interface AddReviewDialogProps {
  open: boolean;
  onClose: () => void;
  booking: any;
  onReviewSubmitted: (bookingId: number) => void;
}

const AddReviewDialog: React.FC<AddReviewDialogProps> = ({
  open,
  onClose,
  booking,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState<string | null>(null);
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
    if (!open || !engagementId) {
      setEligibilityMessage(null);
      return;
    }

    let cancelled = false;
    setCheckingEligibility(true);
    checkReviewEligibility(engagementId, customerId)
      .then((result) => {
        if (cancelled) return;
        if (!result.eligible) {
          setEligibilityMessage(
            result.message || reviewReasonMessage(result.reason)
          );
        } else {
          setEligibilityMessage(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEligibilityMessage(null);
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingEligibility(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, engagementId, customerId]);

  const handleSubmit = async () => {
    if (!rating) {
      setSnackbar({
        open: true,
        message: "Please provide a rating",
        severity: "error",
      });
      return;
    }

    if (!booking || !engagementId) {
      setSnackbar({
        open: true,
        message: "Service engagement information is missing",
        severity: "error",
      });
      return;
    }

    if (eligibilityMessage) {
      setSnackbar({ open: true, message: eligibilityMessage, severity: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview({
        engagementId,
        rating,
        review: review.trim() || undefined,
        customerId,
      });

      if (!result.success) {
        throw new Error(
          result.message || reviewReasonMessage(result.reason, "Failed to submit review")
        );
      }

      onReviewSubmitted(booking.id ?? engagementId);

      setSnackbar({
        open: true,
        message: "Review submitted successfully!",
        severity: "success",
      });

      setTimeout(() => {
        setRating(0);
        setReview("");
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const data = error.response?.data;
      const errorMessage =
        data?.message ||
        reviewReasonMessage(data?.reason) ||
        error.message ||
        "Failed to submit review. Please try again.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const submitDisabled =
    isSubmitting || checkingEligibility || !rating || !!eligibilityMessage || !engagementId;

  return (
    <>
      <Dialog
        open={open}
        onClose={isSubmitting ? undefined : onClose}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "450px",
            borderRadius: "16px",
            overflow: "hidden",
            m: 2,
          },
        }}
      >
        <DialogHeader className="flex flex-row items-center justify-between px-3 py-2 h-12 bg-gray-900">
          <DialogTitle className="text-sm font-semibold text-white">Add Review</DialogTitle>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {booking && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg mx-4 mt-4">
            <p className="font-medium text-sm text-gray-700">
              Reviewing service:{" "}
              {booking.service_type
                ? booking.service_type.charAt(0).toUpperCase() +
                  booking.service_type.slice(1).toLowerCase()
                : "Unknown Service"}
            </p>
            {booking.serviceProviderName ? (
              <p className="text-xs text-gray-500 mt-1">
                Provider: {booking.serviceProviderName}
              </p>
            ) : null}
          </div>
        )}

        {checkingEligibility && (
          <p className="text-xs text-slate-500 text-center mb-2">Checking eligibility...</p>
        )}

        {eligibilityMessage && (
          <div className="mx-4 mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {eligibilityMessage}
          </div>
        )}

        <DialogContent>
          <div className="flex justify-center mb-6">
            <div className="w-full bg-white rounded-lg shadow p-4 text-center">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate this service? *
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer ${
                      rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => !isSubmitting && setRating(star)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-full bg-white rounded-lg shadow p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Your review (optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full min-h-[100px] border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your experience with this service..."
                disabled={isSubmitting}
                maxLength={2000}
              />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleSubmit}
              className="rounded-lg px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={submitDisabled}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <ClipLoader color="#ffffff" size={16} className="mr-2" />
                  Submitting...
                </div>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddReviewDialog;
