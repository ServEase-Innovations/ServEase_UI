/* eslint-disable */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import "./DetailsView.css";
import ProviderDetails from "../ProviderDetails/ProviderDetails";
import { useDispatch, useSelector } from "react-redux";
import { usePricingFilterService } from "../../utils/PricingFilter";
import providerInstance from "../../services/providerInstance";
import { ServiceProviderDTO } from "src/types/ProviderDetailsType";
import { resolveProviderId } from "src/utils/providerId";
import dayjs from "dayjs";

import { Badge } from "@mui/material";
import { Button } from "../Button/button";
import { Filter } from "lucide-react";
import ProviderFilter, { FilterCriteria } from "./ProviderFilter";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import { useAppUser } from "src/context/AppUserContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLanguage } from "src/context/LanguageContext";
import { ArrowLeft, CalendarDays, Clock, MapPinOff, SlidersHorizontal, Users } from "lucide-react";
import {
  formatDateOnly,
  formatInr,
  getBookingTypeFromPreference,
  getCatalogPrice,
  getPriceUnitSuffix,
  filterMaidRowsForBooking,
  type MaidPricingRow,
} from "src/utils/maidPricingUtils";
import { isBookingScheduleComplete, computeDurationHours } from "src/components/ProviderDetails/serviceBookingConfig";
import { formatMonthlyHourlyRateBand } from "src/Constants/servicePricing";
import {
  buildLocationSearchKey,
  resolveLocationCoords,
} from "src/utils/bookingLocation";
import { resolveScheduleTimeFields } from "src/utils/bookingSchedulePatch";
import { checkSelectedProviderAvailability } from "src/services/providerScheduleAvailability";
import {
  confirmProviderScheduleVerified,
} from "src/features/bookingType/bookingTypeSlice";

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
  const dispatch = useDispatch();
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

  const { getBookingType, getFilteredPricing } = usePricingFilterService();
  const bookingType = getBookingType();

  // Fields that affect the nearby-providers API — exclude provider id / slot picks
  // so Book Now (redux update) does not remount the list and close the booking dialog.
  const providerSearchCriteria = useMemo(
    () => ({
      startDate: bookingType?.startDate,
      endDate: bookingType?.endDate,
      startTime: bookingType?.startTime,
      endTime: bookingType?.endTime,
      timeRange: bookingType?.timeRange,
      timeSlot: bookingType?.timeSlot,
      housekeepingRole: bookingType?.housekeepingRole,
      bookingPreference: bookingType?.bookingPreference,
    }),
    [
      bookingType?.startDate,
      bookingType?.endDate,
      bookingType?.startTime,
      bookingType?.endTime,
      bookingType?.timeRange,
      bookingType?.timeSlot,
      bookingType?.housekeepingRole,
      bookingType?.bookingPreference,
    ]
  );

  const providerSearchKey = useMemo(
    () => JSON.stringify(providerSearchCriteria),
    [providerSearchCriteria]
  );

  const canSearchProviders = useMemo(() => {
    const bookingTypeCode = getBookingTypeFromPreference(
      providerSearchCriteria.bookingPreference
    );
    return isBookingScheduleComplete(
      providerSearchCriteria as Record<string, unknown>,
      bookingTypeCode
    );
  }, [providerSearchCriteria]);

  const scheduleRevision = useSelector(
    (state: { bookingType?: { scheduleRevision?: number } }) =>
      state.bookingType?.scheduleRevision ?? 0
  );
  const verifiedProviderSchedule = useSelector(
    (state: {
      bookingType?: {
        verifiedProviderSchedule?: {
          providerId: string;
          scheduleRevision: number;
        } | null;
      };
    }) => state.bookingType?.verifiedProviderSchedule ?? null
  );

  const providerSearchTriggerKey = useMemo(
    () =>
      canSearchProviders ? `${providerSearchKey}:${scheduleRevision}` : "",
    [canSearchProviders, providerSearchKey, scheduleRevision]
  );

  const location = useSelector((state: any) => state?.geoLocation?.value);
  const locationUpdatedAt = useSelector((state: any) => state?.geoLocation?.updatedAt ?? 0);
  const locationSearchKey = useMemo(
    () => buildLocationSearchKey(location),
    [location, locationUpdatedAt]
  );

  const { appUser } = useAppUser();
  const { t } = useLanguage();
  const customerId = appUser?.role === "CUSTOMER" ? appUser?.customerid : null;

  const formatDisplayTime = (hhmm?: string) => {
    if (!hhmm) return "";
    const parsed = dayjs(hhmm.trim(), ["HH:mm", "H:mm", "hh:mm A", "h:mm A"], true);
    return parsed.isValid() ? parsed.format("h:mm A") : hhmm;
  };

  const formatDisplayDate = (value?: string) => {
    const ymd = formatDateOnly(value);
    return ymd ? dayjs(ymd).format("MMM D, YYYY") : "";
  };

  const resolveSearchRateLabel = (
    rows: MaidPricingRow[],
    bookingPreference?: string,
    bookingTypeCode?: string
  ): string | null => {
    if (bookingTypeCode === "MONTHLY") {
      return formatMonthlyHourlyRateBand();
    }
    if (!rows.length) return null;
    const filtered = filterMaidRowsForBooking(rows, bookingPreference, bookingTypeCode);
    const prices = filtered
      .map((row) => getCatalogPrice(row, bookingPreference, bookingTypeCode))
      .filter((price) => price > 0);
    if (!prices.length) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const suffix = getPriceUnitSuffix(bookingPreference, bookingTypeCode);
    if (min === max) return `${formatInr(min)}${suffix}`;
    return `${formatInr(min)} – ${formatInr(max)}${suffix}`;
  };

  const searchContextSummary = useMemo(() => {
    const pref = providerSearchCriteria.bookingPreference;
    const bookingTypeCode = getBookingTypeFromPreference(pref);
    const role = String(providerSearchCriteria.housekeepingRole || "COOK").toUpperCase();
    const serviceLabel =
      role === "MAID" ? t("cleaningHelp") || "Maid" : role === "NANNY" ? t("caregiver") || "Nanny" : t("homeCook") || "Cook";
    const modeLabel =
      bookingTypeCode === "ON_DEMAND"
        ? t("dateOption") || "On demand"
        : bookingTypeCode === "SHORT_TERM"
          ? t("shortTerm") || "Short term"
          : t("monthly") || "Monthly";

    const start = formatDisplayDate(providerSearchCriteria.startDate);
    const end = formatDisplayDate(providerSearchCriteria.endDate);
    let dateLine = "";
    if (bookingTypeCode === "SHORT_TERM" && start && end && start !== end) {
      dateLine = `${start} – ${end}`;
    } else if (start) {
      dateLine = start;
    } else if (end) {
      dateLine = end;
    }

    const startT = formatDisplayTime(providerSearchCriteria.startTime);
    const endT = formatDisplayTime(providerSearchCriteria.endTime);
    let timeLine = "";
    if (startT && endT) {
      timeLine = `${startT} – ${endT}`;
    } else if (providerSearchCriteria.timeRange) {
      timeLine = providerSearchCriteria.timeRange.replace(/-/g, " – ");
    } else if (startT) {
      timeLine = startT;
    }

    const pricingKey = role === "NANNY" ? "nanny" : role === "MAID" ? "maid" : "cook";
    let catalogRows = getFilteredPricing(pricingKey) as MaidPricingRow[];
    if (!catalogRows?.length && pricingKey === "cook") {
      catalogRows = getFilteredPricing("maid") as MaidPricingRow[];
    }
    const rateLine = resolveSearchRateLabel(catalogRows, pref, bookingTypeCode);

    if (!dateLine && !timeLine && !rateLine) return null;

    return { serviceLabel, modeLabel, dateLine, timeLine, rateLine };
  }, [providerSearchCriteria, getFilteredPricing, t]);

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
        const startDateTime = dayjs().hour(startHour).minute(startMinute).second(0).millisecond(0);
        let endDateTime = dayjs().hour(endHour).minute(endMinute).second(0).millisecond(0);
        if (endDateTime.isBefore(startDateTime)) {
          endDateTime = endDateTime.add(1, "day");
        }
        const diffInMinutes = endDateTime.diff(startDateTime, "minute");
        if (diffInMinutes < 0) return diffInMinutes + (24 * 60);
        return diffInMinutes > 0 ? diffInMinutes : 60;
      }
    } catch (error) {
      console.error("Error calculating duration:", error);
    }
    return 60;
  };

  // Core fetch function with pagination + filter parameters (transformed to backend format)
  const fetchProviders = async (
    page: number,
    reset: boolean = false,
    preserveList: boolean = false
  ) => {
    try {
      if (reset) {
        setIsLoadingMore(false);
        if (!preserveList) {
          setLoading(true);
        }
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

      const bookingTypeCode = getBookingTypeFromPreference(
        providerSearchCriteria.bookingPreference
      );
      const startDateYmd =
        formatDateOnly(providerSearchCriteria.startDate) || dayjs().format("YYYY-MM-DD");
      const endDateYmd =
        formatDateOnly(providerSearchCriteria.endDate) ||
        formatDateOnly(providerSearchCriteria.startDate) ||
        dayjs().format("YYYY-MM-DD");
      const { startTime: resolvedStart, endTime: resolvedEnd } = resolveScheduleTimeFields(
        providerSearchCriteria as Record<string, unknown>
      );
      const durationHours = computeDurationHours(
        bookingTypeCode,
        resolvedStart,
        resolvedEnd,
        startDateYmd,
        endDateYmd,
        String(providerSearchCriteria.timeRange ?? ""),
        String(providerSearchCriteria.timeSlot ?? "")
      );
      const serviceDurationMinutes =
        durationHours != null && durationHours > 0
          ? Math.round(durationHours * 60)
          : calculateDurationInMinutes(resolvedStart, resolvedEnd);

      // Base payload
      const payload: any = {
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: 10,
        startDate: startDateYmd,
        endDate: endDateYmd,
        preferredStartTime: resolvedStart || "09:00",
        role: providerSearchCriteria.housekeepingRole || "COOK",
        serviceDurationMinutes,
        bookingType: bookingTypeCode,
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

        if (activeFilters.distance && activeFilters.distance[1] < 50) {
          payload.radius = activeFilters.distance[1];
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

      const rawProviders = response.data.providers || [];
      const newProviders = rawProviders.map((p: Record<string, unknown>) => {
        const id = resolveProviderId(p);
        return {
          ...p,
          serviceproviderid: id ?? "",
          serviceProviderId: id ?? p.serviceProviderId,
        };
      });
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

  const lastLocationSearchKeyRef = useRef("");

  // Perform search – resets pagination when reset=true
  const performSearch = useCallback(async (reset: boolean = true) => {
    const preserveList =
      reset &&
      allProviders.length > 0 &&
      lastLocationSearchKeyRef.current === locationSearchKey;

    if (reset) {
      setCurrentPage(1);
      setHasMore(true);
      if (!preserveList) {
        setAllProviders([]);
        setHasFetchedOnce(false);
      }
    }

    lastLocationSearchKeyRef.current = locationSearchKey;

    await fetchProviders(reset ? 1 : currentPage + 1, reset, preserveList);
  }, [
    allProviders.length,
    locationSearchKey,
    location,
    providerSearchCriteria,
    activeFilters,
    customerId,
    appUser,
    currentPage,
  ]);

  // Trigger search only when date + time are complete (not on date-only edits).
  useEffect(() => {
    if (
      selectedProviderType !== undefined &&
      locationSearchKey &&
      canSearchProviders &&
      providerSearchTriggerKey
    ) {
      performSearch(true);
    }
  }, [
    selectedProviderType,
    locationSearchKey,
    canSearchProviders,
    providerSearchTriggerKey,
    activeFilters,
    performSearch,
  ]);

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
    // MAID/COOK/NANNY all use in-card booking dialogs on the provider card.
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

  const showResultsHeader =
    totalCount > 0 || activeFilters || (hasFetchedOnce && Boolean(searchContextSummary));

  const selectedProviderId = Number(
    bookingType?.serviceproviderId ?? bookingType?.serviceProviderId ?? 0
  );

  const [selectedProviderLiveCheck, setSelectedProviderLiveCheck] = useState<{
    loading: boolean;
    unavailable: boolean;
  }>({ loading: false, unavailable: false });

  useEffect(() => {
    const selectedIdStr = String(selectedProviderId);
    const verified =
      verifiedProviderSchedule &&
      verifiedProviderSchedule.providerId === selectedIdStr &&
      verifiedProviderSchedule.scheduleRevision === scheduleRevision;

    if (!Number.isFinite(selectedProviderId) || selectedProviderId < 1 || verified) {
      setSelectedProviderLiveCheck({ loading: false, unavailable: false });
      return;
    }

    if (!canSearchProviders || !hasFetchedOnce) {
      return;
    }

    const bookingTypeCode = getBookingTypeFromPreference(
      providerSearchCriteria.bookingPreference
    );
    if (bookingTypeCode === "ON_DEMAND") {
      setSelectedProviderLiveCheck({ loading: false, unavailable: false });
      return;
    }

    const coords = resolveLocationCoords(location);
    if (!coords) {
      return;
    }

    const startDateYmd =
      formatDateOnly(String(providerSearchCriteria.startDate ?? "")) ||
      dayjs().format("YYYY-MM-DD");
    const endDateYmd =
      formatDateOnly(String(providerSearchCriteria.endDate ?? "")) || startDateYmd;
    const { startTime, endTime } = resolveScheduleTimeFields(
      providerSearchCriteria as Record<string, unknown>
    );
    const durationHours = computeDurationHours(
      bookingTypeCode,
      startTime,
      endTime,
      startDateYmd,
      endDateYmd,
      String(providerSearchCriteria.timeRange ?? ""),
      String(providerSearchCriteria.timeSlot ?? "")
    );
    const durationMinutes =
      durationHours != null && durationHours > 0
        ? Math.round(durationHours * 60)
        : 60;

    let cancelled = false;
    setSelectedProviderLiveCheck({ loading: true, unavailable: false });

    checkSelectedProviderAvailability({
      providerId: selectedProviderId,
      latitude: coords.lat,
      longitude: coords.lng,
      role: String(providerSearchCriteria.housekeepingRole || "COOK"),
      startDate: startDateYmd,
      endDate: endDateYmd,
      preferredStartTime: startTime,
      serviceDurationMinutes: durationMinutes,
      customerId,
    })
      .then((result) => {
        if (cancelled) return;
        setSelectedProviderLiveCheck({
          loading: false,
          unavailable: !result.available,
        });
        if (result.available) {
          dispatch(confirmProviderScheduleVerified(selectedIdStr));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedProviderLiveCheck({ loading: false, unavailable: false });
      });

    return () => {
      cancelled = true;
    };
  }, [
    canSearchProviders,
    customerId,
    dispatch,
    hasFetchedOnce,
    location,
    locationSearchKey,
    providerSearchCriteria,
    providerSearchTriggerKey,
    scheduleRevision,
    selectedProviderId,
    verifiedProviderSchedule,
  ]);

  const selectedProviderUnavailable =
    selectedProviderLiveCheck.unavailable && !selectedProviderLiveCheck.loading;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/80">
      {loading && allProviders.length === 0 ? (
        renderLoadingSkeleton()
      ) : (
        <main className="mx-auto max-w-5xl px-4 pb-12 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:px-6 sm:pt-[calc(4.75rem+env(safe-area-inset-top,0px))] md:pt-[calc(5.75rem+env(safe-area-inset-top,0px))]">
          {selectedProviderUnavailable ? (
            <div
              className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              role="alert"
            >
              Your selected provider is not available for the dates and time you chose. Adjust your
              schedule or choose another provider from the list.
            </div>
          ) : null}
          {showResultsHeader ? (
            <header
              className="mb-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.03]"
              role="status"
              aria-live="polite"
            >
              <div
                className={`grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-gradient-to-r from-sky-50/80 to-white px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 ${
                  searchContextSummary ? "border-b border-slate-100" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="inline-flex w-fit items-center justify-center gap-1.5 justify-self-start rounded-xl border border-slate-200/90 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-sky-50/80 sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  <span className="hidden sm:inline">{t("back")}</span>
                </button>

                <p className="min-w-0 max-w-[10.5rem] truncate text-center text-xs font-semibold tabular-nums tracking-tight text-slate-800 sm:max-w-none sm:text-sm md:text-base">
                  {resultsLabel}
                </p>

                <div className="flex min-w-0 items-center justify-end justify-self-end gap-1 sm:gap-1.5">
                  <Badge badgeContent={activeFilterCount} color="primary" invisible={activeFilterCount === 0}>
                    <Button
                      variant="outline"
                      size="sm"
                      startIcon={<Filter className="h-4 w-4" />}
                      onClick={() => setFilterOpen(true)}
                      className="rounded-xl bg-white font-semibold"
                    >
                      <span className="hidden sm:inline">{t("detailsFilters")}</span>
                      <span className="sm:hidden sr-only">{t("detailsFilters")}</span>
                    </Button>
                  </Badge>
                  {activeFilterCount > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="hidden rounded-lg font-semibold text-slate-600 md:inline-flex"
                    >
                      {t("clearAll")}
                    </Button>
                  ) : null}
                </div>
              </div>

              {searchContextSummary ? (
                <div className="px-3 py-3 text-center sm:px-4 sm:py-3.5">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <span className="inline-flex items-center rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900 ring-1 ring-sky-100">
                      {searchContextSummary.serviceLabel}
                    </span>
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">
                      {searchContextSummary.modeLabel}
                    </span>
                    {searchContextSummary.dateLine ? (
                      <span className="inline-flex max-w-full items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                        <span className="min-w-0">{searchContextSummary.dateLine}</span>
                      </span>
                    ) : null}
                    {searchContextSummary.timeLine ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                        {searchContextSummary.timeLine}
                      </span>
                    ) : null}
                    {searchContextSummary.rateLine ? (
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900 ring-1 ring-emerald-100">
                        {searchContextSummary.rateLine}
                      </span>
                    ) : null}
                  </div>

                  {activeFilterCount > 0 ? (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="mx-auto mt-2.5 block text-xs font-semibold text-sky-700 underline-offset-2 hover:underline md:hidden"
                    >
                      {t("detailsClearFilters")} ({activeFilterCount})
                    </button>
                  ) : null}
                </div>
              ) : null}
            </header>
          ) : null}

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
                    variant="outline"
                    onClick={handleClearFilters}
                    className="min-w-[160px] rounded-xl font-semibold"
                  >
                    {t("detailsClearFilters")}
                  </Button>
                ) : null}
                <Button
                  variant="contained"
                  onClick={() => sendDataToParent("")}
                  className="min-w-[160px] rounded-xl font-semibold shadow-lg shadow-sky-500/30"
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