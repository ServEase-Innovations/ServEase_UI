/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useState, useEffect } from "react";

import { Button } from "../../components/Button";
import { Star, User, Calendar, MessageSquare, X } from "lucide-react";
import { Badge } from "../../components/Common/Badge";
import { useToast } from "../hooks/use-toast";
import axiosInstance from "../../services/axiosInstance";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { DialogHeader } from "../ProviderDetails/MaidServiceDialog.styles";

interface Review {
  id: number;
  customerId: number;
  customerName: string | null;
  serviceProviderId: number;
  rating: number;
  comment: string;
  commentedOn: string;
  serviceType?: string;
  response?: string;
  respondedAt?: string;
}

interface ReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceProviderId: number | null;
}

// SkeletonLoader Component
const SkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {/* Rating Summary Skeleton */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="h-12 w-16 bg-gray-300 rounded-md mx-auto mb-2 animate-pulse"></div>
            <div className="flex justify-center mt-2 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-4 bg-gray-300 rounded-sm animate-pulse"></div>
              ))}
            </div>
            <div className="h-4 w-32 bg-gray-300 rounded mx-auto mt-2 animate-pulse"></div>
          </div>
          
          <div className="text-center">
            <div className="h-12 w-16 bg-gray-300 rounded-md mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-300 rounded mx-auto mt-2 animate-pulse"></div>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm font-medium w-4 bg-gray-300 h-4 rounded animate-pulse"></span>
                <div className="h-4 w-4 bg-gray-300 rounded-sm animate-pulse"></div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-300 h-2 rounded-full animate-pulse" style={{ width: `${Math.random() * 70 + 10}%` }}></div>
                </div>
                <span className="text-xs w-8 bg-gray-300 h-4 rounded animate-pulse"></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Items Skeleton */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
              <div>
                <div className="h-5 w-32 bg-gray-300 rounded mb-2 animate-pulse"></div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-4 w-4 bg-gray-300 rounded-sm animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-5 w-16 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
            <div className="h-4 w-4/5 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-4 w-3/5 bg-gray-300 rounded animate-pulse"></div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="h-4 w-32 bg-gray-300 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export function ReviewsDialog({ open, onOpenChange, serviceProviderId }: ReviewsDialogProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && serviceProviderId) {
      fetchReviews();
    }
  }, [open, serviceProviderId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/customer/get-feedback-by-service-provider/${serviceProviderId}`
      );
      
      if (response.status === 200) {
        const reviewsData: Review[] = response.data;
        
        // Process the API response
        const processedReviews = reviewsData.map(review => ({
          ...review,
          customerName: review.customerName || "Test User",
          createdAt: review.commentedOn,
          serviceType: review.serviceType || "Service",
          bookingId: review.id
        }));

        // Sort reviews by date in descending order (newest first)
        const sortedReviews = processedReviews.sort((a, b) => {
          return new Date(b.commentedOn).getTime() - new Date(a.commentedOn).getTime();
        });

        setReviews(sortedReviews);
        
        // Calculate average rating
        const totalRating = sortedReviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = sortedReviews.length > 0 ? totalRating / sortedReviews.length : 0;
        setAverageRating(avgRating);
        
        // Set total reviews
        setTotalReviews(sortedReviews.length);
        
        // Calculate rating distribution (1-5 stars)
        const distribution = [0, 0, 0, 0, 0]; // [1-star, 2-star, 3-star, 4-star, 5-star]
        sortedReviews.forEach(review => {
          if (review.rating >= 1 && review.rating <= 5) {
            distribution[review.rating - 1]++;
          }
        });
        setRatingDistribution(distribution);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
      
      // Fallback to empty state instead of mock data
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
      setRatingDistribution([0, 0, 0, 0, 0]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
    >
       <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            Customer Reviews
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Feedback from your clients helps you improve your services
          </p>
          <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 rounded-full p-1 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        </DialogHeader>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto relative">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Rating Summary */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-900">{averageRating.toFixed(1)}</div>
                  <div className="flex justify-center mt-2">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <p className="text-sm text-blue-700 mt-1">Average Rating</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-900">{totalReviews}</div>
                  <p className="text-sm text-blue-700 mt-1">Total Reviews</p>
                </div>
                
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars, index) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-4">{stars}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${totalReviews > 0 ? (ratingDistribution[5 - stars] / totalReviews) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8">
                        {ratingDistribution[5 - stars]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No reviews yet</p>
                  <p className="text-sm">Your reviews will appear here once clients rate your services</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{review.customerName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {review.serviceType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(review.commentedOn)}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {review.response && (
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">Your Response</span>
                          {review.respondedAt && (
                            <span className="text-xs text-gray-500">
                              {formatDate(review.respondedAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">{review.response}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}