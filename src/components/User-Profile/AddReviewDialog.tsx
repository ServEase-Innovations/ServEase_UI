/* eslint-disable */
import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { Dialog, DialogContent } from "@mui/material";
import { Button } from "../Button/button";

const AddReviewDialog = ({ open, onClose, booking }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = () => {
    // Hardcoded API call simulation
    console.log("Review submitted:", { rating, review });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent
        sx={{
          width: "100%",
          maxWidth: "500px", // 👈 Fixed width for desktop
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          "@media (max-width: 640px)": {
            maxWidth: "90%", // 👈 Responsive for mobile
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
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Star Rating */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 cursor-pointer ${
                rating >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        {/* Review Input */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full min-h-[100px] border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your review..."
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-xl px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewDialog;
