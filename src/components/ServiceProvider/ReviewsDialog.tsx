import React, { useState, useEffect } from "react";

import { Button } from "../../components/Button";
import { Star, User, Calendar, MessageSquare, X } from "lucide-react";
import { Badge } from "../../components/Common/Badge";
import { useToast } from "../hooks/use-toast";
import axiosInstance from "../../services/axiosInstance";
import { ClipLoader } from "react-spinners";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { DialogHeader } from "../ProviderDetails/MaidServiceDialog.styles";

interface Review {
  id: number;
  customerId: number;
  customerName: string;
  customerImage?: string;
  serviceProviderId: number;
  bookingId: number;
  rating: number;
  comment: string;
  createdAt: string;
  serviceType: string;
  response?: string;
  respondedAt?: string;
}

interface ReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceProviderId: number | null;
}

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
      // Replace with your actual API endpoint
      const response = await axiosInstance.get(
        `/api/serviceproviders/reviews/${serviceProviderId}`
      );
      
      if (response.status === 200) {
        const data = response.data;
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        setRatingDistribution(data.ratingDistribution || [0, 0, 0, 0, 0]);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
      
      // Mock data for demonstration
      const mockReviews: Review[] = [
        {
          id: 1,
          customerId: 101,
          customerName: "Priya Sharma",
          rating: 5,
          comment: "Excellent service! Maya was very professional and thorough in her cleaning. Would definitely hire again.",
          createdAt: "2024-12-20T10:30:00Z",
          serviceType: "Home Cleaning",
          serviceProviderId: serviceProviderId || 0,
          bookingId: 1001
        },
        {
          id: 2,
          customerId: 102,
          customerName: "Rajesh Kumar",
          rating: 4,
          comment: "Good service, arrived on time. Could improve on attention to corners.",
          createdAt: "2024-12-18T14:20:00Z",
          serviceType: "Deep Cleaning",
          serviceProviderId: serviceProviderId || 0,
          bookingId: 1002,
          response: "Thank you for your feedback. We'll ensure better corner cleaning in future services.",
          respondedAt: "2024-12-19T09:15:00Z"
        },
        {
          id: 3,
          customerId: 103,
          customerName: "Anita Patel",
          rating: 5,
          comment: "Outstanding work! The kitchen was spotless. Very satisfied with the service.",
          createdAt: "2024-12-15T16:45:00Z",
          serviceType: "Kitchen Cleaning",
          serviceProviderId: serviceProviderId || 0,
          bookingId: 1003
        }
      ];
      
      setReviews(mockReviews);
      setAverageRating(4.7);
      setTotalReviews(3);
      setRatingDistribution([0, 0, 0, 1, 2]);
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

  return (
    <Dialog open={open} >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            Customer Reviews
          </DialogTitle>
        
            Feedback from your clients helps you improve your services
         
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <ClipLoader color="#0E305C" size={40} />
          </div>
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
                            width: `${(ratingDistribution[5 - stars] / Math.max(1, totalReviews)) * 100}%`
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
                        {formatDate(review.createdAt)}
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
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}