/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import { useEffect, useState, useMemo } from "react";
import "./DetailsView.css";
import axiosInstance from "../../services/axiosInstance";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import { CONFIRMATION } from "../../Constants/pagesConstants";
import ProviderDetails from "../ProviderDetails/ProviderDetails";
import { useDispatch, useSelector } from "react-redux";
import { add } from "../../features/detailsData/detailsDataSlice";
import HeaderSearch from "../HeaderSearch/HeaderSearch";
import PreferenceSelection from "../PreferenceSelection/PreferenceSelection";
import axios from "axios";
import { keys } from "../../env/env";
import { usePricingFilterService } from '../../utils/PricingFilter';
import providerInstance from "../../services/providerInstance";
import { ServiceProviderDTO } from "src/types/ProviderDetailsType";

import FilterListIcon from '@mui/icons-material/FilterList';
import { Button, Badge } from '@mui/material';
import ProviderFilter, { FilterCriteria } from "./ProviderFilter";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import { useAppUser } from "src/context/AppUserContext";
import InfiniteScroll from 'react-infinite-scroll-component';

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

  // ✅ Compute filteredProviders synchronously (no flicker)
  const filteredProviders = useMemo(() => {
    if (activeFilters) {
      return applyFilters(allProviders, activeFilters);
    }
    return allProviders;
  }, [allProviders, activeFilters]);

  const { getBookingType, getPricingData, getFilteredPricing } = usePricingFilterService();
  const bookingType = getBookingType();
  console.log("Details:", bookingType);

  const dispatch = useDispatch();
  const location = useSelector((state: any) => state?.geoLocation?.value);

  // Get appUser from context
  const { appUser } = useAppUser();

  // Only get customerId if the user role is CUSTOMER
  const customerId = appUser?.role === "CUSTOMER" ? appUser?.customerid : null;

  console.log("HIKKERS", selectedProviderType);
  console.log("App User Role:", appUser?.role);
  console.log("Customer ID:", customerId);

  const handleCheckoutData = (data: any) => {
    console.log("Received checkout data:", data);
    if (checkoutItem) {
      checkoutItem(data);
    }
  };

  useEffect(() => {
    performSearch(true);
  }, [selectedProviderType, location, bookingType]);

  const handleBackClick = () => {
    sendDataToParent("");
  };

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const handleSearchResults = (data: any[]) => {
    toggleDrawer(false);
  };

  const handleSelectedProvider = (provider: any) => {
    if (selectedProvider) {
      selectedProvider(provider);
    }
    sendDataToParent(CONFIRMATION);
  };

  const [searchData, setSearchData] = useState<any>();

  const handleSearch = (formData: { serviceType: string; startTime: string; endTime: string }) => {
    console.log("Search data received in MainComponent:", formData);
    setSearchData(formData);
  };

  // Helper: normalize languages
  const normalizeLanguages = (languages: string | string[] | null | undefined): string[] => {
    if (!languages) return [];
    if (Array.isArray(languages)) return languages;
    if (typeof languages === 'string') {
      return languages.split(',').map(lang => lang.trim());
    }
    return [];
  };

  // Apply filters client-side on the accumulated providers
  const applyFilters = (providers: ServiceProviderDTO[], filters: FilterCriteria): ServiceProviderDTO[] => {
    return providers.filter(provider => {
      // Experience filter
      if (filters.experience && (provider.experience < filters.experience[0] || provider.experience > filters.experience[1])) {
        return false;
      }

      // Rating filter
      if (filters.rating && (provider.rating || 0) < filters.rating) {
        return false;
      }

      // Distance filter
      if (filters.distance && (provider.distance_km || 0) > filters.distance[1]) {
        return false;
      }

      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(provider.gender || '')) {
        return false;
      }

      // Diet filter
      if (filters.diet.length > 0 && !filters.diet.includes(provider.diet || '')) {
        return false;
      }

      // Language filter
      if (filters.language.length > 0) {
        const providerLanguages = normalizeLanguages(provider.languageknown);
        const hasMatchingLanguage = providerLanguages.some(lang =>
          filters.language.includes(lang)
        );
        if (!hasMatchingLanguage) return false;
      }

      // Availability filter
      if (filters.availability.length > 0) {
        const availabilityStatus = provider.monthlyAvailability?.fullyAvailable
          ? 'Fully Available'
          : provider.monthlyAvailability?.exceptions?.length
            ? provider.monthlyAvailability.exceptions.length > 10
              ? 'Limited'
              : 'Partially Available'
            : 'Partially Available';

        if (!filters.availability.includes(availabilityStatus)) {
          return false;
        }
      }

      return true;
    });
  };

  const handleApplyFilters = (filters: FilterCriteria) => {
    setActiveFilters(filters);

    // Count active filters
    let count = 0;
    if (filters.experience[0] > 0 || filters.experience[1] < 30) count++;
    if (filters.rating) count++;
    if (filters.distance[0] > 0 || filters.distance[1] < 50) count++;
    if (filters.gender.length > 0) count++;
    if (filters.diet.length > 0) count++;
    if (filters.language.length > 0) count++;
    if (filters.availability.length > 0) count++;

    setActiveFilterCount(count);
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    setActiveFilterCount(0);
  };

  // Core fetch function with pagination
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

            if (diffInMinutes < 0) {
              return diffInMinutes + (24 * 60);
            }
            return diffInMinutes > 0 ? diffInMinutes : 60;
          }
        } catch (error) {
          console.error("Error calculating duration:", error);
        }
        return 60;
      };

      const serviceDurationMinutes = calculateDurationInMinutes(
        bookingType?.startTime,
        bookingType?.endTime
      );

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

      if (appUser?.role === "CUSTOMER" && customerId && customerId !== 0 && customerId !== null && customerId !== undefined) {
        payload.customerID = Number(customerId);
        console.log("Adding customerId to payload:", customerId);
      } else {
        console.log("Not adding customerId - User is not a CUSTOMER or customerId not available");
      }

      console.log(`Fetching page ${page} with payload:`, payload);

      const response = await providerInstance.post(
        `/api/service-providers/nearby-monthly?page=${page}&limit=10`,
        payload
      );

      // Optional: small delay to make skeleton visible and avoid flicker
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
      console.error("Geolocation or API error:", error.message || error);
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

  const performSearch = async (reset: boolean = true) => {
    if (reset) {
      setCurrentPage(1);
      setHasMore(true);
      setAllProviders([]);
      setHasFetchedOnce(false);
    }
    await fetchProviders(reset ? 1 : currentPage + 1, reset);
  };

  // ✅ Prevent duplicate calls
  const fetchMoreData = () => {
    if (isLoadingMore || !hasMore) return;
    fetchProviders(currentPage + 1, false);
  };

  // Loading skeleton for initial load
  const renderLoadingSkeleton = () => {
    return (
      <div className="main-container" style={{ paddingTop: '1%' }}>
        {[1, 2, 3].map((index) => (
          <div key={index} style={{ paddingTop: '1%' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <SkeletonLoader variant="circular" width={80} height={80} />
                <div style={{ flex: 1 }}>
                  <SkeletonLoader width={200} height={24} className="mb-2" />
                  <SkeletonLoader width={150} height={16} className="mb-2" />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <SkeletonLoader width={60} height={20} />
                    <SkeletonLoader width={80} height={20} />
                  </div>
                </div>
                <SkeletonLoader width={100} height={40} />
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <SkeletonLoader width={120} height={20} />
                  <SkeletonLoader width={120} height={20} />
                  <SkeletonLoader width={120} height={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ✅ Skeleton loader for infinite scroll (appears while loading more)
  const renderInfiniteScrollLoader = () => (
    <div style={{ padding: '0 0 20px 0' }}>
      {[1, 2].map((index) => (
        <div key={`skeleton-${index}`} style={{ paddingTop: '1%' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
              <SkeletonLoader variant="circular" width={80} height={80} />
              <div style={{ flex: 1 }}>
                <SkeletonLoader width={200} height={24} className="mb-2" />
                <SkeletonLoader width={150} height={16} className="mb-2" />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <SkeletonLoader width={60} height={20} />
                  <SkeletonLoader width={80} height={20} />
                </div>
              </div>
              <SkeletonLoader width={100} height={40} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      {/* Content Area */}
      {loading && allProviders.length === 0 ? (
        renderLoadingSkeleton()
      ) : (
        <main className="main-container">
          {/* COMBINED ACTION & MESSAGE BAR */}
          {(totalCount > 0 || activeFilters) && (
            <div
              style={{
                padding: '12px 16px',
                margin: '0 0 16px 0',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div
                onClick={handleBackClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#495057",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  transition: "0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e9ecef";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span style={{ fontSize: "20px" }}>←</span>
                <span>Back</span>
              </div>

              <div style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '14px',
                color: '#6c757d',
                fontWeight: 500
              }}>
                {activeFilters
                  ? `Found ${filteredProviders.length} provider${filteredProviders.length !== 1 ? 's' : ''} matching your filters`
                  : `${totalCount} service provider${totalCount !== 1 ? 's' : ''} found near your location`
                }
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge badgeContent={activeFilterCount} color="primary">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FilterListIcon />}
                    onClick={() => setFilterOpen(true)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      bgcolor: 'white',
                      '&:hover': {
                        bgcolor: '#f8f9fa'
                      }
                    }}
                  >
                    Filter
                  </Button>
                </Badge>
                {activeFilterCount > 0 && (
                  <Button
                    size="small"
                    onClick={handleClearFilters}
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                      textTransform: "none",
                      '&:hover': {
                        bgcolor: '#f8f9fa'
                      }
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ✅ FIXED EMPTY STATE – centered vertically & horizontally */}
          {hasFetchedOnce && filteredProviders.length === 0 && !loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                padding: '20px'
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '10px'
                }}
              >
                {activeFilters
                  ? 'No Providers Match Your Filters'
                  : 'Service Not Available in Your Area'}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                  maxWidth: '300px',
                  marginBottom: '20px'
                }}
              >
                {activeFilters
                  ? 'Try adjusting your filters to see more providers.'
                  : 'Currently, we are unable to provide services in your location. We hope to be available in your area soon.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {activeFilters && (
                  <Button variant="outlined" onClick={handleClearFilters} sx={{ width: '200px' }}>
                    Clear Filters
                  </Button>
                )}
                <Button variant="contained" onClick={() => sendDataToParent("")} sx={{ width: '200px' }}>
                  Go Back
                </Button>
              </div>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={filteredProviders.length}
              next={fetchMoreData}
              hasMore={hasMore}
              scrollThreshold="200px"
              style={{ overflow: 'visible' }}
              loader={renderInfiniteScrollLoader()}
              endMessage={
                <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  {filteredProviders.length === 0
                    ? (activeFilters ? "No providers match your filters" : "No providers found")
                    : "You have seen all providers"}
                </p>
              }
            >
              {filteredProviders.map((provider, index) => (
                <div key={index} style={{ paddingTop: '1%' }}>
                  <ProviderDetails
                    {...provider}
                    selectedProvider={handleSelectedProvider}
                    sendDataToParent={sendDataToParent}
                  />
                </div>
              ))}
            </InfiniteScroll>
          )}
        </main>
      )}

      {/* Filter Drawer */}
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