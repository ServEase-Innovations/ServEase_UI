/* eslint-disable */
import React, { useState } from "react";
import { X, Star, CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "@mui/material";
import { Button } from "../Button/button";
import axiosInstance from "../../services/axiosInstance";
import { useAuth0 } from "@auth0/auth0-react";
import { Alert, Snackbar } from "@mui/material";
import { ClipLoader } from "react-spinners";

interface AddReviewDialogProps {
  open: boolean;
  onClose: () => void;
  booking: any;
  onReviewSubmitted: (bookingId: number) => void; // Add this prop
}

const AddReviewDialog: React.FC<AddReviewDialogProps> = ({ 
  open, 
  onClose, 
  booking, 
  onReviewSubmitted 
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  
  const { user: auth0User } = useAuth0();

  const handleSubmit = async () => {
    if (!rating) {
      setSnackbar({ open: true, message: "Please provide a rating", severity: "error" });
      return;
    }

    if (!booking || !auth0User) {
      setSnackbar({ open: true, message: "Missing required information", severity: "error" });
      return;
    }

    // Ensure we have the service provider ID
    if (!booking.serviceProviderId) {
      setSnackbar({ open: true, message: "Service provider information is missing", severity: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerId: auth0User.customerid,
        customerName: auth0User.customerName,
        serviceProviderId: booking.serviceProviderId,
        rating: rating,
        comment: review.trim() || "No comment provided"
      };

      await axiosInstance.post('/api/customer/add-feedback', payload);
      
      // Notify parent component that review was submitted
      onReviewSubmitted(booking.id);
      
      setSnackbar({ open: true, message: "Review submitted successfully!", severity: "success" });
      
      // Reset form and close after a short delay
      setTimeout(() => {
        setRating(0);
        setReview("");
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit review. Please try again.";
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
      <Dialog open={open} onClose={isSubmitting ? undefined : onClose}>
        <DialogContent
          sx={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            "@media (max-width: 640px)": {
              maxWidth: "90%",
              margin: "16px",
            },
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Add Review</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <X className="w-5 w-5" />
            </button>
          </div>

          {/* Service Information */}
          {booking && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-sm text-gray-700">
                Reviewing service: {booking.serviceType ? 
                  booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1) : 
                  "Unknown Service"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Provider: {booking.serviceProviderName || "Not specified"}
              </p>
            </div>
          )}

          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate this service? *
            </label>
            <div className="flex gap-2">
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

          {/* Review Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-lg px-4 py-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddReviewDialog;