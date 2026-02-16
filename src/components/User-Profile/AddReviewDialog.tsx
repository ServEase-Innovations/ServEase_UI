/* eslint-disable */
import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, Alert, Snackbar } from "@mui/material";
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";
import { ClipLoader } from "react-spinners";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import reviewsInstance from "src/services/reviewsInstance";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { user: auth0User } = useAuth0();

  const handleSubmit = async () => {
    if (!rating) {
      setSnackbar({
        open: true,
        message: "Please provide a rating",
        severity: "error",
      });
      return;
    }

    if (!booking || !auth0User) {
      setSnackbar({
        open: true,
        message: "Missing required information",
        severity: "error",
      });
      return;
    }

    // Check if engagementId exists (required by the API)
    if (!booking.engagementId && !booking.id) {
      setSnackbar({
        open: true,
        message: "Service engagement information is missing",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload according to the API specification
      const payload = {
        engagementId: booking.engagementId || booking.id, // Use engagementId if available, fallback to booking.id
        rating: rating,
        review: review.trim() || "No review provided" // Using "review" instead of "comment" per API spec
      };

      // Make POST request to the reviews endpoint
      await reviewsInstance.post("/reviews", payload);

      onReviewSubmitted(booking.id);

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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit review. Please try again.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={isSubmitting ? undefined : onClose}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "450px", // responsive dialog
            borderRadius: "16px",
            overflow: "hidden",
            m: 2, // margin on small screens
          },
        }}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-3 py-2 h-12 bg-gray-900">
          <DialogTitle className="text-sm font-semibold text-white">
            Add Review
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Service Information */}
        {booking && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-sm text-gray-700">
              Reviewing service:{" "}
              {booking.service_type
                ? booking.service_type.charAt(0).toUpperCase() +
                  booking.service_type.slice(1).toLowerCase()
                : "Unknown Service"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Engagement ID: {booking.engagementId || booking.id || "Not specified"}
            </p>
          </div>
        )}

        <DialogContent>
          {/* Star Rating */}
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
                      rating >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => !isSubmitting && setRating(star)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Review Input */}
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
              />
            </div>
          </div>

          {/* Submit Button Only */}
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleSubmit}
              className="rounded-lg px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting || !rating}
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

      {/* Snackbar */}
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