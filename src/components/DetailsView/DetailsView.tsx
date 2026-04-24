/* eslint-disable */
import { useEffect, useState, useCallback } from "react";
import "./DetailsView.css";
import { CONFIRMATION } from "../../Constants/pagesConstants";
import ProviderDetails from "../ProviderDetails/ProviderDetails";
import { useSelector } from "react-redux";
import { usePricingFilterService } from "../../utils/PricingFilter";
import providerInstance from "../../services/providerInstance";
import { ServiceProviderDTO } from "src/types/ProviderDetailsType";

import FilterListIcon from "@mui/icons-material/FilterList";
import { Button, Badge } from "@mui/material";
import ProviderFilter, { FilterCriteria } from "./ProviderFilter";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import { useAppUser } from "src/context/AppUserContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLanguage } from "src/context/LanguageContext";
import { ArrowLeft, MapPinOff, SlidersHorizontal, Users } from "lucide-react";

interface DetailsViewProps {
  sendDataToParent: (data: string) => void;
  selected?: string;
  checkoutItem?: (data: any) => void;
  selectedProvider?: (data: any) => void;
}

export const DetailsView: React.FC<DetailsViewProps> = ({
  sendDataToParent,
  selected,
  checkoutItem,
  selectedProvider,
}) => {
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProviderType, setSelectedProviderType] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria | null>(null);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allProviders, setAllProviders] = useState<ServiceProviderDTO[]>([]);

  // No client-side filtering needed – backend does it
  const filteredProviders = allProviders;

  const { getBookingType, getPricingData, getFilteredPricing } = usePricingFilterService();
  const bookingType = getBookingType();
  console.log("Details:", bookingType);

  const location = useSelector((state: any) => state?.geoLocation?.value);

  const { appUser } = useAppUser();
  const { t } = useLanguage();
  const customerId = appUser?.role === "CUSTOMER" ? appUser?.customerid : null;

  const handleCheckoutData = (data: any) => {
    console.log("Received checkout data:", data);
    if (checkoutItem) {
      checkoutItem(data);
    }
  };

  // Helper: calculate duration in minutes
  const calculateDurationInMinutes = (startTime?: string, endTime?: string): number => {
    if (!startTime || !endTime) return 60;
    try {
      const startTimeStr = startTime.trim();
      const endTimeStr = endTime.trim();
      const today = new Date();
      const startDateTime = new Date(today);
      const endDateTime = new Date(today);
      const startParts = startTimeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
      const endParts = endTimeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
      if (startParts && endParts) {
        let startHour = parseInt(startParts[1]);
        let startMinute = parseInt(startParts[2]);
        let endHour = parseInt(endParts[1]);
        let endMinute = parseInt(endParts[2]);
        if (startParts[3]) {
          const startPeriod = startParts[3].toUpperCase();
          if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
          if (startPeriod === 'AM' && startHour === 12) startHour = 0;
        }
        if (endParts[3]) {
          const endPeriod = endParts[3].toUpperCase();
          if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
          if (endPeriod === 'AM' && endHour === 12) endHour = 0;
        }
        startDateTime.setHours(startHour, startMinute, 0, 0);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        const diffInMilliseconds = endDateTime.getTime() - startDateTime.getTime();
        const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));
        if (diffInMinutes < 0) return diffInMinutes + (24 * 60);
        return diffInMinutes > 0 ? diffInMinutes : 60;
      }
    } catch (error) {
      console.error("Error calculating duration:", error);
    }
    return 60;
  };

  // Core fetch function with pagination + filter parameters (transformed to backend format)
  const fetchProviders = async (page: number, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoadingMore(false);
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      let latitude = 0;
      let longitude = 0;
      if (location?.geometry?.location) {
        latitude = location.geometry.location.lat;
        longitude = location.geometry.location.lng;
      } else if (location?.lat && location?.lng) {
        latitude = location.lat;
        longitude = location.lng;
      }

      const formatDateOnly = (dateString?: string) => {
        if (!dateString) return "";
        return dateString.split("T")[0];
      };

      const serviceDurationMinutes = calculateDurationInMinutes(
        bookingType?.startTime,
        bookingType?.endTime
      );

      // Base payload
      const payload: any = {
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: 10,
        startDate: formatDateOnly(bookingType?.startDate) || "2025-04-01",
        endDate: formatDateOnly(bookingType?.endDate) || "2025-04-30",
        preferredStartTime: bookingType?.timeRange ? bookingType.timeRange.split('-')[0] : "16:37",
        role: bookingType?.housekeepingRole || "COOK",
        serviceDurationMinutes: serviceDurationMinutes
      };

      // ✅ Transform filters to match required backend format
      if (activeFilters) {
        // Experience -> "min-max" string
        const [minExp, maxExp] = activeFilters.experience;
        if (minExp > 0 || maxExp < 30) {
          payload.experienceRange = `${minExp}-${maxExp}`;
        }

        // Rating -> minRating number
        if (activeFilters.rating) {
          payload.minRating = activeFilters.rating;
        }

        // Gender -> single string (if selected and not empty)
        if (activeFilters.gender && activeFilters.gender !== "") {
          payload.gender = activeFilters.gender;
        }

        // Diet -> single string (if selected and not empty)
        if (activeFilters.diet && activeFilters.diet !== "") {
          payload.diet = activeFilters.diet;
        }

        // Languages -> array of strings
        if (activeFilters.language.length > 0) {
          payload.languages = activeFilters.language;
        }

        // Distance (optional, only if changed from default max 50)
        if (activeFilters.distance && activeFilters.distance[1] < 50) {
          payload.maxDistance = activeFilters.distance[1];
        }

        // Availability (optional)
        if (activeFilters.availability.length > 0) {
          payload.availabilityStatuses = activeFilters.availability;
        }
      }

      if (appUser?.role === "CUSTOMER" && customerId && customerId !== 0 && customerId !== null) {
        payload.customerID = Number(customerId);
      }

      console.log(`Fetching page ${page} with payload:`, payload);

      const response = await providerInstance.post(
        `/api/service-providers/nearby-monthly?page=${page}&limit=10`,
        payload
      );

      await new Promise(resolve => setTimeout(resolve, 300));

      console.log("API Response:", response.data);

      const newProviders = response.data.providers || [];
      const total = response.data.count || 0;
      setTotalCount(total);

      if (reset) {
        setAllProviders(newProviders);
        setHasFetchedOnce(true);
      } else {
        setAllProviders(prev => [...prev, ...newProviders]);
      }

      const loadedCount = reset ? newProviders.length : allProviders.length + newProviders.length;
      setHasMore(loadedCount < total);
      setCurrentPage(page);

    } catch (error: any) {
      console.error("API error:", error.message || error);
      if (reset) {
        setAllProviders([]);
        setTotalCount(0);
        setHasFetchedOnce(true);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Perform search – resets pagination when reset=true
  const performSearch = useCallback(async (reset: boolean = true) => {
    if (reset) {
      setCurrentPage(1);
      setHasMore(true);
      setAllProviders([]);
      setHasFetchedOnce(false);
    }
    await fetchProviders(reset ? 1 : currentPage + 1, reset);
  }, [location, bookingType, activeFilters, customerId, appUser]);

  // Trigger search when dependencies change
  useEffect(() => {
    if (selectedProviderType !== undefined && location && bookingType) {
      performSearch(true);
    }
  }, [selectedProviderType, location, bookingType, activeFilters, performSearch]);

  const fetchMoreData = () => {
    if (isLoadingMore || !hasMore) return;
    fetchProviders(currentPage + 1, false);
  };

  const handleBackClick = () => {
    sendDataToParent("");
  };

  const handleSelectedProvider = (provider: any) => {
    if (selectedProvider) {
      selectedProvider(provider);
    }
    sendDataToParent(CONFIRMATION);
  };

  // Filter handlers
  const handleApplyFilters = (filters: FilterCriteria) => {
    setActiveFilters(filters);
    // Count active filters for badge
    let count = 0;
    if (filters.experience[0] > 0 || filters.experience[1] < 30) count++;
    if (filters.rating) count++;
    if (filters.distance[0] > 0 || filters.distance[1] < 50) count++;
    if (filters.gender && filters.gender !== "") count++;
    if (filters.diet && filters.diet !== "") count++;
    if (filters.language.length > 0) count++;
    if (filters.availability.length > 0) count++;
    setActiveFilterCount(count);
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    setActiveFilterCount(0);
    // Refetch will happen automatically due to useEffect dependency
  };

  const skeletonCard = (key: string | number) => (
    <div
      key={key}
      className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.03] sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <SkeletonLoader variant="circular" width={80} height={80} />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonLoader width={220} height={22} />
          <SkeletonLoader width={160} height={16} />
          <div className="flex flex-wrap gap-2 pt-1">
            <SkeletonLoader width={72} height={22} />
            <SkeletonLoader width={96} height={22} />
          </div>
        </div>
        <SkeletonLoader width={100} height={40} />
      </div>
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="mx-auto max-w-5xl space-y-4 px-4 pb-12 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:px-6 sm:pt-[calc(4.75rem+env(safe-area-inset-top,0px))] md:pt-[calc(5.75rem+env(safe-area-inset-top,0px))]">
      {[1, 2, 3].map((i) => skeletonCard(i))}
    </div>
  );

  const renderInfiniteScrollLoader = () => (
    <div className="space-y-4 pb-6 pt-2">
      {[1, 2].map((i) => skeletonCard(`more-${i}`))}
    </div>
  );

  const resultsLabel =
    totalCount === 1 ? t("detailsOneProviderFound") : t("detailsManyProvidersFound", { count: totalCount });

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/80">
      {loading && allProviders.length === 0 ? (
        renderLoadingSkeleton()
      ) : (
        <main className="mx-auto max-w-5xl px-4 pb-12 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:px-6 sm:pt-[calc(4.75rem+env(safe-area-inset-top,0px))] md:pt-[calc(5.75rem+env(safe-area-inset-top,0px))]">
          {(totalCount > 0 || activeFilters) && (
            <div className="relative mb-6 flex min-h-[2.75rem] items-center rounded-2xl border border-slate-200/90 bg-white/90 px-2 py-2.5 shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.03] backdrop-blur-sm sm:min-h-[3rem] sm:px-4 sm:py-3.5">
              {/* Equal halves so left/right chrome balances; label is centered on the full bar */}
              <div className="relative z-[1] flex min-h-[2.5rem] min-w-0 flex-1 items-center justify-start">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-sky-50/80 sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  {t("back")}
                </button>
              </div>

              <div className="relative z-[1] flex min-h-[2.5rem] min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
                <Badge badgeContent={activeFilterCount} color="primary" invisible={activeFilterCount === 0}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FilterListIcon />}
                    onClick={() => setFilterOpen(true)}
                    sx={{
                      textTransform: "none",
                      borderRadius: "12px",
                      fontWeight: 600,
                      borderColor: "rgba(15, 23, 42, 0.12)",
                      color: "rgb(15 23 42)",
                      bgcolor: "rgba(255,255,255,0.95)",
                      "&:hover": { borderColor: "rgb(14 165 233)", bgcolor: "rgb(240 249 255)" },
                    }}
                  >
                    {t("detailsFilters")}
                  </Button>
                </Badge>
                {activeFilterCount > 0 ? (
                  <Button
                    size="small"
                    onClick={handleClearFilters}
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.8125rem",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "10px",
                      "&:hover": { bgcolor: "rgba(14, 165, 233, 0.08)" },
                    }}
                  >
                    {t("clearAll")}
                  </Button>
                ) : null}
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-[28%] sm:px-[26%]">
                <p className="w-full min-w-0 truncate text-center text-xs font-medium tabular-nums leading-none text-slate-600 sm:text-sm">
                  {resultsLabel}
                </p>
              </div>
            </div>
          )}

          {hasFetchedOnce && filteredProviders.length === 0 && !loading ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-white/70 px-6 py-14 text-center shadow-sm">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-slate-100 text-sky-700 ring-1 ring-sky-100/80">
                {activeFilters ? (
                  <SlidersHorizontal className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                ) : (
                  <MapPinOff className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                )}
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                {activeFilters ? t("detailsNoMatchTitle") : t("detailsNoAreaTitle")}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                {activeFilters ? t("detailsNoMatchBody") : t("detailsNoAreaBody")}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {activeFilters ? (
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    sx={{ textTransform: "none", borderRadius: "12px", fontWeight: 600, minWidth: 160 }}
                  >
                    {t("detailsClearFilters")}
                  </Button>
                ) : null}
                <Button
                  variant="contained"
                  onClick={() => sendDataToParent("")}
                  sx={{
                    textTransform: "none",
                    borderRadius: "12px",
                    fontWeight: 600,
                    minWidth: 160,
                    boxShadow: "0 8px 20px -6px rgba(14, 165, 233, 0.45)",
                  }}
                >
                  {t("back")}
                </Button>
              </div>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={filteredProviders.length}
              next={fetchMoreData}
              hasMore={hasMore}
              scrollThreshold="200px"
              style={{ overflow: "visible" }}
              loader={renderInfiniteScrollLoader()}
              endMessage={
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Users className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {filteredProviders.length === 0 ? t("detailsNoResultsShort") : t("detailsEndOfList")}
                  </p>
                </div>
              }
            >
              <div className="space-y-4 sm:space-y-5">
                {filteredProviders.map((provider, index) => (
                  <div key={provider.serviceproviderid ?? index}>
                    <ProviderDetails
                      {...provider}
                      selectedProvider={handleSelectedProvider}
                      sendDataToParent={sendDataToParent}
                    />
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </main>
      )}

      <ProviderFilter
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters || undefined}
      />
    </div>
  );
};

export default DetailsView;