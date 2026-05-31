/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { Star, X, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
  fetchProviderReviews,
  type ProviderRatingSummary,
  type ProviderReview,
} from "src/services/reviewsService";

interface ReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceProviderId: number | null;
}

type FilterKey = "ALL" | "ON_DEMAND" | "MONTHLY" | "SHORT_TERM";

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ON_DEMAND", label: "On demand" },
  { key: "MONTHLY", label: "Monthly" },
  { key: "SHORT_TERM", label: "Short term" },
];

function getGradeStyles(grade: string): string {
  const g = grade.replace(/[^A-Z]/g, "");
  if (g.startsWith("A")) return "bg-emerald-600 text-white";
  if (g.startsWith("B")) return "bg-[#193f79] text-white";
  if (g.startsWith("C")) return "bg-amber-600 text-white";
  if (g === "D") return "bg-orange-600 text-white";
  if (g === "F") return "bg-red-600 text-white";
  return "bg-slate-500 text-white";
}

function getServiceTypeLabel(type: string): string {
  switch (type) {
    case "ON_DEMAND":
      return "On demand";
    case "MONTHLY":
      return "Monthly";
    case "SHORT_TERM":
      return "Short term";
    default:
      return type;
  }
}

function getServiceTypeBadge(type: string): string {
  switch (type) {
    case "ON_DEMAND":
      return "bg-sky-50 text-sky-900 border-sky-200";
    case "MONTHLY":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "SHORT_TERM":
      return "bg-violet-50 text-violet-800 border-violet-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function renderStars(rating: number, size = "h-3.5 w-3.5") {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

export function ReviewsDialog({ open, onOpenChange, serviceProviderId }: ReviewsDialogProps) {
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerRating, setProviderRating] = useState<ProviderRatingSummary | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("ALL");
  const { toast } = useToast();

  const averageRating = providerRating?.rating ?? 0;
  const totalReviews = providerRating?.review_count ?? 0;

  const loadReviews = useCallback(async () => {
    if (!serviceProviderId) return;

    try {
      const data = await fetchProviderReviews(serviceProviderId, { limit: 100 });
      setProviderRating(data.provider);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again.",
        variant: "destructive",
      });
      setReviews([]);
      setProviderRating(null);
    }
  }, [serviceProviderId, toast]);

  useEffect(() => {
    if (open && serviceProviderId) {
      setLoading(true);
      loadReviews().finally(() => setLoading(false));
    } else if (!open) {
      setReviews([]);
      setProviderRating(null);
      setSelectedFilter("ALL");
    }
  }, [open, serviceProviderId, loadReviews]);

  const filteredReviews = useMemo(() => {
    if (selectedFilter === "ALL") return reviews;
    return reviews.filter((r) => r.service_type === selectedFilter);
  }, [reviews, selectedFilter]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      ALL: reviews.length,
      ON_DEMAND: 0,
      MONTHLY: 0,
      SHORT_TERM: 0,
    };
    reviews.forEach((r) => {
      const key = r.service_type as FilterKey;
      if (key in counts && key !== "ALL") counts[key] += 1;
    });
    return counts;
  }, [reviews]);

  const handleClose = () => {
    onOpenChange(false);
    setSelectedFilter("ALL");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "rounded-2xl overflow-hidden max-h-[90vh] flex flex-col",
        sx: { m: { xs: 1, sm: 2 } },
      }}
    >
      <div className="h-1 bg-[#193f79]" />
      <div className="flex items-start gap-3 border-b border-slate-200 bg-[#e8f1ff] px-4 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Customer reviews</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Ratings and feedback from your clients
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <DialogContent className="flex-1 overflow-y-auto bg-slate-50 p-4 !pt-4">
        {loading && reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            <p className="text-sm text-slate-500">Loading reviews...</p>
          </div>
        ) : (
          <>
            {providerRating && (
              <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-1 bg-[#193f79]" />
                <div className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-4xl font-extrabold tracking-tight text-slate-900">
                      {averageRating.toFixed(1)}
                    </p>
                    {renderStars(Math.round(averageRating))}
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Provider grade
                    </p>
                    <div
                      className={`mt-2 flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold ${getGradeStyles(providerRating.grade)}`}
                    >
                      {providerRating.grade}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {providerRating && totalReviews > 0 && (
              <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rating breakdown
                </p>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count =
                      providerRating.distribution[String(stars) as "1" | "2" | "3" | "4" | "5"] ?? 0;
                    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-3 text-xs font-semibold text-slate-700">{stars}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs text-slate-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-3 flex flex-wrap gap-2">
              {FILTER_TABS.map(({ key, label }) => {
                const active = selectedFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedFilter(key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      active
                        ? "border-[#193f79] bg-[#193f79] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50/80"
                    }`}
                  >
                    {label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {filterCounts[key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              {filteredReviews.length} {filteredReviews.length === 1 ? "review" : "reviews"}
              {selectedFilter !== "ALL" ? ` · ${getServiceTypeLabel(selectedFilter)}` : ""}
            </p>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {filteredReviews.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <MessageSquare className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-800">No reviews yet</p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                    {selectedFilter !== "ALL"
                      ? `No reviews for ${getServiceTypeLabel(selectedFilter)} services yet.`
                      : "When customers rate your work, reviews will appear here."}
                  </p>
                </div>
              ) : (
                filteredReviews.map((review, index) => {
                  const hasText = Boolean(review.review?.trim());
                  return (
                    <div
                      key={review.review_id}
                      className={`p-4 ${index < filteredReviews.length - 1 ? "border-b border-slate-100" : ""}`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-sm font-bold text-amber-800">
                            {review.rating.toFixed(1)}
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          </span>
                          {renderStars(review.rating)}
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getServiceTypeBadge(review.service_type)}`}
                          >
                            {getServiceTypeLabel(review.service_type)}
                          </span>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-slate-400">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      {review.customer_name ? (
                        <p className="mb-1 text-sm font-semibold text-slate-800">
                          {review.customer_name}
                        </p>
                      ) : null}
                      <p
                        className={`text-sm leading-relaxed ${
                          hasText ? "text-slate-700" : "italic text-slate-400"
                        }`}
                      >
                        {hasText ? review.review : "No written feedback"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
