/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useState, useEffect } from "react";

import { Button } from "../../components/Button";
import { Star, User, Calendar, MessageSquare, X, Filter } from "lucide-react";
import { Badge } from "../../components/Common/Badge";
import { useToast } from "../hooks/use-toast";

import { Dialog, DialogContent, DialogTitle, Select, MenuItem, FormControl, Chip } from "@mui/material";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import reviewsInstance from "src/services/reviewsInstance";

// Define types based on the API response
interface ProviderRating {
  id: number;
  rating: string;
  review_count: number;
  grade: string;
  distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}

interface Review {
  review_id: number;
  rating: number;
  review: string;
  service_type: string;
  created_at: number;
  customerName?: string;
}

interface ReviewsApiResponse {
  success: boolean;
  provider: ProviderRating;
  count: number;
  reviews: Review[];
}

interface ReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceProviderId: number | null;
}

// Service type options
const SERVICE_TYPES = [
  { value: "ALL", label: "All Services" },
  { value: "ON_DEMAND", label: "On Demand" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "SHORT_TERM", label: "Short Term" }
];

// Get emoji based on rating
const getRatingEmoji = (rating: number): string => {
  switch (rating) {
    case 5:
      return "😍"; // Love it
    case 4:
      return "😊"; // Happy
    case 3:
      return "😐"; // Neutral
    case 2:
      return "😕"; // Disappointed
    case 1:
      return "😞"; // Sad
    default:
      return "👤"; // Default user
  }
};

// Get grade color based on grade value
const getGradeColor = (grade: string): string => {
  // Remove any "New" or other text and just check the grade
  const gradeValue = grade.replace(/[^A-Z]/g, '');
  
  switch(gradeValue) {
    case 'A':
    case 'A+':
    case 'A-':
      return 'bg-green-600 text-white font-bold shadow-md'; // Dark green for A grades
    case 'B':
    case 'B+':
    case 'B-':
      return 'bg-blue-600 text-white font-bold shadow-md'; // Dark blue for B grades
    case 'C':
    case 'C+':
    case 'C-':
      return 'bg-yellow-600 text-white font-bold shadow-md'; // Dark yellow for C grades
    case 'D':
      return 'bg-orange-600 text-white font-bold shadow-md'; // Orange for D grades
    case 'F':
      return 'bg-red-600 text-white font-bold shadow-md'; // Red for F grades
    default:
      return 'bg-purple-600 text-white font-bold shadow-md'; // Default
  }
};

// Compact SkeletonLoader
const SkeletonLoader = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Rating Summary Skeleton - Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="h-8 w-16 bg-gray-300 rounded-lg mx-auto mb-1"></div>
            <div className="flex justify-center mt-1 gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-3 bg-gray-300 rounded-sm"></div>
              ))}
            </div>
            <div className="h-3 w-20 bg-gray-300 rounded mx-auto mt-1"></div>
          </div>
          
          <div className="text-center">
            <div className="h-8 w-16 bg-gray-300 rounded-lg mx-auto mb-1"></div>
            <div className="h-3 w-20 bg-gray-300 rounded mx-auto"></div>
          </div>
          
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-1">
                <div className="h-3 w-3 bg-gray-300 rounded"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-sm"></div>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="h-3 w-5 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Skeleton */}
      <div className="flex justify-between items-center mb-3">
        <div className="h-6 w-32 bg-gray-300 rounded"></div>
        <div className="h-6 w-28 bg-gray-300 rounded"></div>
      </div>

      {/* Review Items Skeleton - Compact */}
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-3 bg-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div>
                <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-3 w-3 bg-gray-300 rounded-sm"></div>
                    ))}
                  </div>
                  <div className="h-4 w-14 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
            <div className="h-3 w-16 bg-gray-300 rounded"></div>
          </div>
          <div className="h-3 w-full bg-gray-300 rounded ml-10"></div>
        </div>
      ))}
    </div>
  );
};

export function ReviewsDialog({ open, onOpenChange, serviceProviderId }: ReviewsDialogProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerRating, setProviderRating] = useState<ProviderRating | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("ALL");
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open && serviceProviderId) {
      fetchReviews();
    }
  }, [open, serviceProviderId]);

  useEffect(() => {
    if (selectedServiceType === "ALL") {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter(
        review => review.service_type === selectedServiceType
      );
      setFilteredReviews(filtered);
    }
  }, [selectedServiceType, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const response = await reviewsInstance.get<ReviewsApiResponse>(
        `/reviews/providers/${serviceProviderId}/reviews`
      );
      
      if (response.data.success) {
        const { provider, reviews: reviewsData } = response.data;
        
        setProviderRating(provider);
        setAverageRating(parseFloat(provider.rating));
        setTotalReviews(provider.review_count);
        
        // Keep customerName but we'll enhance it with emoji in display
        const processedReviews = reviewsData.map(review => ({
          ...review,
          customerName: `Customer ${review.review_id}`
        }));

        const sortedReviews = processedReviews.sort((a, b) => b.created_at - a.created_at);
        
        setReviews(sortedReviews);
        setFilteredReviews(sortedReviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again.",
        variant: "destructive",
      });
      
      setReviews([]);
      setFilteredReviews([]);
      setProviderRating(null);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsByServiceType = async (serviceType: string) => {
    if (!serviceProviderId || serviceType === "ALL") return;
    
    try {
      setLoading(true);
      const response = await reviewsInstance.get<ReviewsApiResponse>(
        `/reviews/providers/${serviceProviderId}/reviews`,
        {
          params: {
            serviceType: serviceType
          }
        }
      );
      
      if (response.data.success) {
        const { reviews: reviewsData } = response.data;
        
        const processedReviews = reviewsData.map(review => ({
          ...review,
          customerName: `Customer ${review.review_id}`
        }));

        const sortedReviews = processedReviews.sort((a, b) => b.created_at - a.created_at);
        setReviews(prevReviews => {
          const existingIds = new Set(prevReviews.map(r => r.review_id));
          const newReviews = sortedReviews.filter(r => !existingIds.has(r.review_id));
          return [...prevReviews, ...newReviews];
        });
      }
    } catch (error) {
      console.error("Failed to fetch reviews by service type:", error);
      toast({
        title: "Error",
        description: "Failed to filter reviews by service type",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceTypeChange = async (event: any) => {
    const serviceType = event.target.value;
    setSelectedServiceType(serviceType);
    
    if (serviceType !== "ALL") {
      await fetchReviewsByServiceType(serviceType);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'ON_DEMAND':
        return 'On Demand';
      case 'MONTHLY':
        return 'Monthly';
      case 'SHORT_TERM':
        return 'Short Term';
      default:
        return type;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'ON_DEMAND':
        return 'bg-blue-100 text-blue-800';
      case 'MONTHLY':
        return 'bg-green-100 text-green-800';
      case 'SHORT_TERM':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedServiceType("ALL");
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          maxWidth: '600px'
        }
      }}
    >
     <DialogHeader className="relative border-b px-4 py-3">
      <div className="flex items-center">
        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <span>Customer Reviews</span>

          {providerRating && (
            <Chip
              label={providerRating.grade}
              size="small"
              className={`ml-1 ${getGradeColor(providerRating.grade)} text-xs h-6 px-2`}
              style={{ 
                fontWeight: 'bold',
                borderRadius: '16px'
              }}
            />
          )}
        </DialogTitle>
      </div>

      <p className="text-xs text-white/70 mt-0.5">
        Feedback from your clients helps you improve
      </p>

      {/* Close Button - Top Right */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 rounded-full p-1 hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </DialogHeader>

      
      <DialogContent className="p-4 max-h-[80vh] overflow-y-auto">
        {loading && reviews.length === 0 ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Rating Summary - Compact */}
            {providerRating && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mt-0.5 gap-0.5">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <p className="text-xs text-blue-700 mt-0.5">Avg Rating</p>
                  </div>
                  
                  <div className="text-center border-l border-r border-blue-200">
                    <div className="text-2xl font-bold text-blue-900">{totalReviews}</div>
                    <p className="text-xs text-blue-700 mt-0.5">Total Reviews</p>
                  </div>
                  
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-1">
                        <span className="text-xs font-medium w-3 text-gray-700">{stars}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${totalReviews > 0 ? (providerRating.distribution[stars.toString() as keyof typeof providerRating.distribution] / totalReviews) * 100 : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-5">
                          {providerRating.distribution[stars.toString() as keyof typeof providerRating.distribution]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Service Type Filter - Compact */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Filter:</span>
              </div>
              <FormControl size="small" className="w-36">
                <Select
                  value={selectedServiceType}
                  onChange={handleServiceTypeChange}
                  displayEmpty
                  className="bg-white text-xs h-8"
                >
                  {SERVICE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value} className="text-xs">
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Results count */}
            <div className="mb-2 text-xs text-gray-500">
              Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
              {selectedServiceType !== 'ALL' && ` for ${getServiceTypeLabel(selectedServiceType)}`}
            </div>

            {/* Reviews List - Compact */}
            <div className="space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">No reviews yet</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedServiceType !== 'ALL' 
                      ? `No reviews for ${getServiceTypeLabel(selectedServiceType)}`
                      : 'Reviews will appear here once clients rate your services'}
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div 
                    key={review.review_id} 
                    className="border rounded-lg p-3 hover:shadow-sm transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                            {/* <span>{review.customerName || 'Anonymous'}</span> */}
                            <span className="text-base" role="img" aria-label={`Rating ${review.rating}`}>
                              {getRatingEmoji(review.rating)}
                            </span>
                          </h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex gap-0.5">
                              {renderStars(review.rating)}
                            </div>
                            <Badge className={`${getServiceTypeColor(review.service_type)} font-medium px-1.5 py-0.5 text-[10px]`}>
                              {getServiceTypeLabel(review.service_type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded">
                        <Calendar className="h-3 w-3" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 ml-10">{review.review}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

       
      </DialogContent>
    </Dialog>
  );
}