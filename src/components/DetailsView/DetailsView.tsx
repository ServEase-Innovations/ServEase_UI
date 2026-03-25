/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import { useEffect, useState } from "react";
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
import ProviderFilter,{ FilterCriteria } from "./ProviderFilter";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import { useAppUser } from "src/context/AppUserContext";

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
  const [ServiceProvidersData, setServiceProvidersData] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProviderType, setSelectedProviderType] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria | null>(null);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProviderDTO[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0); // Add state for total count
  
  const { getBookingType, getPricingData, getFilteredPricing } = usePricingFilterService();
  const bookingType = getBookingType();
  console.log("Deatils:",bookingType);
  
  const dispatch = useDispatch();
  const location = useSelector((state: any) => state?.geoLocation?.value);
  
  // Get appUser from context
  const { appUser } = useAppUser();
  
  // Only get customerId if the user role is CUSTOMER
  const customerId = appUser?.role === "CUSTOMER" ? appUser?.customerid : null;
  
  console.log("HIKKERS", selectedProviderType);
  console.log("App User Role:", appUser?.role);
  console.log("Customer ID:", customerId); // For debugging

  const handleCheckoutData = (data: any) => {
    console.log("Received checkout data:", data);
    if (checkoutItem) {
      checkoutItem(data);
    }
  };

  useEffect(() => {
    performSearch();
  }, [selectedProviderType, location, bookingType]);

  const handleBackClick = () => {
    sendDataToParent("");
  };

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const handleSearchResults = (data: any[]) => {
    setSearchResults(data);
    toggleDrawer(false);
  };

  const handleSelectedProvider = (provider: any) => {
    if (selectedProvider) {
      selectedProvider(provider);
    }
    sendDataToParent(CONFIRMATION);
  };

  const [searchData, setSearchData] = useState<any>();
  const [serviceProviderData, setServiceProviderData] = useState<ServiceProviderDTO[]>([]);

  const handleSearch = (formData: { serviceType: string; startTime: string; endTime: string }) => {
    console.log("Search data received in MainComponent:", formData);
    setSearchData(formData);
  };
  
  const performSearch = async () => {
    try {
      setLoading(true);

      console.log("Booking Type in performSearch:", location);
      console.log("Location object:", location?.geometry?.location);

      let latitude = 0;
      let longitude = 0;

      if(location?.geometry?.location){
        latitude = location?.geometry?.location?.lat;
        longitude = location?.geometry?.location?.lng;
      } else if (location?.lat && location?.lng) {
        latitude = location?.lat;
        longitude = location?.lng;
      }

      const formatDateOnly = (dateString?: string) => {
        if (!dateString) return "";
        return dateString.split("T")[0];
      };

      // Build the base payload without customerId
      const payload: any = {
        "lat": latitude.toString(),
        "lng": longitude.toString(),
        "radius": 10,
        "startDate": formatDateOnly(bookingType?.startDate) || "2025-04-01",
        "endDate": formatDateOnly(bookingType?.endDate) || "2025-04-30",
        "preferredStartTime": bookingType?.timeRange ? bookingType.timeRange.split('-')[0] : "16:37",
        "role": bookingType?.housekeepingRole || "COOK",
        "serviceDurationMinutes": 60
      };

      // Only add customerId if user role is CUSTOMER and customerId exists
      if (appUser?.role === "CUSTOMER" && customerId && customerId !== 0 && customerId !== null && customerId !== undefined) {
        payload.customerID = Number(customerId);
        console.log("Adding customerId to payload:", customerId);
      } else {
        console.log("Not adding customerId - User is not a CUSTOMER or customerId not available");
      }

      console.log("Sending payload to API:", payload); // For debugging

      const response = await providerInstance.post('/api/service-providers/nearby-monthly', payload);

      console.log("API Response:", response.data); // For debugging

      // Store total count from response
      setTotalCount(response.data.count || 0);

      if (response.data.count === 0) {
        setServiceProviderData([]);
        setFilteredProviders([]);
      } else {
        setServiceProviderData(response.data.providers);
        setFilteredProviders(response.data.providers);
      }
    } catch (error: any) {
      console.error("Geolocation or API error:", error.message || error);
      setServiceProviderData([]);
      setFilteredProviders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to normalize languages to array
  const normalizeLanguages = (languages: string | string[] | null | undefined): string[] => {
    if (!languages) return [];
    if (Array.isArray(languages)) return languages;
    // If it's a string, split by comma
    if (typeof languages === 'string') {
      return languages.split(',').map(lang => lang.trim());
    }
    return [];
  };

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

      // Language filter - FIXED: Normalize to array first
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
    
    // Apply filters to current providers
    const filtered = applyFilters(serviceProviderData, filters);
    setFilteredProviders(filtered);
  };

  useEffect(() => {
    if (activeFilters) {
      const filtered = applyFilters(serviceProviderData, activeFilters);
      setFilteredProviders(filtered);
    } else {
      setFilteredProviders(serviceProviderData);
    }
  }, [serviceProviderData, activeFilters]);

  const handleClearFilters = () => {
    setActiveFilters(null);
    setFilteredProviders(serviceProviderData);
    setActiveFilterCount(0);
  };

  console.log("Service Providers Data:", ServiceProvidersData);
  console.log("Service Providers Data:", serviceProviderData);

  // Loading skeleton for providers list
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
              {/* Provider Card Skeleton */}
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

  return (
    <div style={{ position: "relative"}}>
      {/* Content Area */}
      {loading ? (
        // Show skeleton loading state
        renderLoadingSkeleton()
      ) : (
        <main className="main-container" >
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
              {/* BACK ACTION */}
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

              {/* DYNAMIC MESSAGE */}
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

              {/* FILTER ACTIONS */}
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
          
          {Array.isArray(filteredProviders) && filteredProviders.length > 0 ? (
            filteredProviders.map((provider, index) => (
              <div key={index} style={{ paddingTop: '1%' }}>
                <ProviderDetails 
                  {...provider} 
                  selectedProvider={handleSelectedProvider}
                  sendDataToParent={sendDataToParent} 
                />
              </div>
            ))
          ) : (
            // Show "no providers found" message
            <div
              style={{
                width: "100%",
                display: "grid",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                top: "40%",
                left: "0",
                textAlign: "center",
                padding: "20px"
              }}
            >
              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "10px"
              }}>
                {activeFilters ? "No Providers Match Your Filters" : "Service Not Available in Your Area"}
              </h3>
              <p style={{
                fontSize: "14px",
                color: "#666",
                lineHeight: "1.5",
                maxWidth: "300px",
                marginBottom: "20px",
                marginLeft: "auto",
                marginRight: "auto"
              }}>
                {activeFilters 
                  ? "Try adjusting your filters to see more providers." 
                  : "Currently, we are unable to provide services in your location. We hope to be available in your area soon."}
              </p>
              {activeFilters && (
                <button
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    marginBottom: "10px",
                    width: "200px",
                    marginLeft: "auto",
                    marginRight: "auto"
                  }}
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
              <button
                style={{
                  padding: "12px 24px",
                  backgroundColor: activeFilters ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  width: "200px",
                  marginLeft: "auto",
                  marginRight: "auto"
                }}
                onClick={() => sendDataToParent("")}
              >
                Go Back
              </button>
            </div>
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