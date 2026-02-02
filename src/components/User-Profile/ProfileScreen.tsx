/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";
import axiosInstance from "src/services/axiosInstance";
import { ClipLoader } from "react-spinners";
import { ChevronDown, ChevronUp, Plus, X, Check, AlertCircle, Edit3 } from "lucide-react";
import utilsInstance from "src/services/utilsInstance";
import { useAppUser } from "src/context/AppUserContext";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import MobileNumberDialog from "../User-Profile/MobileNumberDialog";
import { FaHome, FaLocationArrow } from "react-icons/fa";
import { HiBuildingOffice } from "react-icons/hi2";
// USE REDUX ONLY - NO DUPLICATE API CALLS
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/store/userStore";
import { 
  setHasMobileNumber 
} from "src/features/customer/customerSlice";
import providerInstance from "src/services/providerInstance";

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  rawData?: {
    formattedAddress: string;
    latitude: number;
    longitude: number;
    placeId: string;
  };
}

interface PermanentAddress {
  field1: string;
  field2: string;
  ctArea: string;
  pinNo: string;
  state: string;
  country: string;
}

interface CorrespondenceAddress {
  field1: string;
  field2: string;
  ctArea: string;
  pinNo: string;
  state: string;
  country: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  altContactNumber: string;
  role?: string;
}

interface ServiceProvider {
  serviceproviderId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  mobileNo: number;
  alternateNo: number | null;
  emailId: string;
  gender: string;
  buildingName: string;
  locality: string;
  street: string;
  pincode: number;
  currentLocation: string;
  nearbyLocation: string;
  permanentAddress: PermanentAddress;
  correspondenceAddress: CorrespondenceAddress;
}

interface ValidationState {
  loading: boolean;
  error: string;
  isAvailable: boolean | null;
  formatError: boolean;
}

interface OriginalData {
  userData: UserData;
  addresses: Address[];
}

const ProfileScreen = () => {
  const { user: auth0User, isAuthenticated } = useAuth0();
  const { appUser } = useAppUser();
  
  // USE REDUX STATE - DATA ALREADY LOADED BY APP COMPONENT
  const dispatch = useDispatch();
  const {
    customerId,
    mobileNo,
    alternateNo,
    firstName,
    lastName,
    emailId,
    hasMobileNumber,
    loading: customerLoading
  } = useSelector((state: RootState) => state.customer);
  
  // Keep local state for dialog
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>("CUSTOMER");
  const [serviceProviderData, setServiceProviderData] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAddressIds, setExpandedAddressIds] = useState<string[]>([]);
  const [dialogShownInSession, setDialogShownInSession] = useState(false);

  // Initialize userData from Redux or name
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    contactNumber: "",
    altContactNumber: ""
  });

  const [originalData, setOriginalData] = useState<OriginalData>({
    userData: {
      firstName: "",
      lastName: "",
      contactNumber: "",
      altContactNumber: ""
    },
    addresses: []
  });
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: "Home",
    customType: "",
    street: "",
    city: "",
    country: "",
    postalCode: ""
  });

  const [countryCode, setCountryCode] = useState("+91");
  const [altCountryCode, setAltCountryCode] = useState("+91");

  // Validation states
  const [contactValidation, setContactValidation] = useState<ValidationState>({
    loading: false,
    error: '',
    isAvailable: null,
    formatError: false
  });
  const [altContactValidation, setAltContactValidation] = useState<ValidationState>({
    loading: false,
    error: '',
    isAvailable: null,
    formatError: false
  });

  // Track which fields have been validated
  const [validatedFields, setValidatedFields] = useState<Set<string>>(new Set());

  // Function to handle user preference selection (like Header component)
  const handleUserPreference = (preference?: string) => {
    console.log("User preference selected: ", preference);

    if (!preference) {
      setNewAddress(prev => ({ ...prev, type: "Other", customType: "" }));
    } else {
      setNewAddress(prev => ({ ...prev, type: preference, customType: "" }));
    }
  };

  const toggleAddress = (id: string) => {
    setExpandedAddressIds((prev) =>
      prev.includes(id) ? prev.filter((addrId) => addrId !== id) : [...prev, id]
    );
  };

  // Function to save address to user-settings API (same as Header component)
  const saveAddressToUserSettings = async (addressData: any) => {
    if (!userId || userRole !== "CUSTOMER") return;

    try {
      // First, get current user settings
      const response = await utilsInstance.get(`/user-settings/${userId}`);
      const currentSettings = response.data;

      let existingLocations = [];
      
      if (Array.isArray(currentSettings) && currentSettings.length > 0) {
        existingLocations = currentSettings[0].savedLocations || [];
      } else {
        // If no settings exist, create new one
        await utilsInstance.post("/user-settings", {
          customerId: userId,
          savedLocations: []
        });
      }

      // Create the new location object in the same format as Header component
      const addressType = addressData.type === "Other" && addressData.customType 
        ? addressData.customType 
        : addressData.type;

      const newLocation = {
        name: addressType,
        location: {
          address: [{
            formatted_address: addressData.street,
            address_components: [
              { long_name: addressData.city, types: ["locality"] },
              { long_name: addressData.country, types: ["country"] },
              { long_name: addressData.postalCode, types: ["postal_code"] },
            ],
            geometry: {
              location: {
                lat: addressData.rawData?.latitude || 0,
                lng: addressData.rawData?.longitude || 0
              }
            },
            place_id: addressData.rawData?.placeId || `manual_${Date.now()}`
          }],
          lat: addressData.rawData?.latitude || 0,
          lng: addressData.rawData?.longitude || 0
        }
      };

      // Add the new location to existing locations
      const updatedLocations = [...existingLocations, newLocation];

      // Prepare payload in the same format as Header component
      const payload = {
        customerId: userId,
        savedLocations: updatedLocations
      };

      // Update user settings
      await utilsInstance.put(`/user-settings/${userId}`, payload);
      
      console.log("✅ Address saved successfully to user settings");
      return true;
    } catch (error) {
      console.error("❌ Failed to save address to user settings:", error);
      throw error;
    }
  };

  // Function to update addresses in user-settings API
  const updateAddressesInUserSettings = async (updatedAddresses: Address[]) => {
    if (!userId || userRole !== "CUSTOMER") return;

    try {
      const savedLocations = updatedAddresses.map((addr) => {
        const addressType = addr.type;

        return {
          name: addressType,
          location: {
            address: [{
              formatted_address: addr.street,
              address_components: [
                { long_name: addr.city, types: ["locality"] },
                { long_name: addr.country, types: ["country"] },
                { long_name: addr.postalCode, types: ["postal_code"] },
              ],
              geometry: {
                location: {
                  lat: addr.rawData?.latitude || 0,
                  lng: addr.rawData?.longitude || 0
                }
              },
              place_id: addr.rawData?.placeId || `manual_${Date.now()}`
            }],
            lat: addr.rawData?.latitude || 0,
            lng: addr.rawData?.longitude || 0
          }
        };
      });

      const payload = {
        customerId: userId,
        savedLocations: savedLocations
      };

      await utilsInstance.put(`/user-settings/${userId}`, payload);
      console.log("✅ Addresses updated successfully in user settings");
    } catch (error) {
      console.error("❌ Failed to update addresses in user settings:", error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      setIsLoading(true);

      if (isAuthenticated && appUser) {
        const name = appUser.name || null;
        const role = appUser.role || "CUSTOMER";
        setUserRole(role);

        const id = role === "SERVICE_PROVIDER" 
          ? appUser.serviceProviderId 
          : appUser.customerid;
        
        setUserName(name);
        setUserId(id ? Number(id) : null);

        try {
          if (role === "SERVICE_PROVIDER" && id) {
            await fetchServiceProviderData(id);
            // Service providers don't need mobile validation
            dispatch(setHasMobileNumber(true));
          } else if (role === "CUSTOMER" && id) {
            // NO API CALL NEEDED - DATA ALREADY IN REDUX FROM APP COMPONENT
            
            // Wait for Redux data to load (if still loading)
            if (customerLoading) {
              console.log("⏳ Waiting for Redux customer data to load...");
              // Give it a moment to load
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Initialize userData from Redux state
            const updatedUserData = {
              firstName: firstName || name?.split(" ")[0] || "",
              lastName: lastName || name?.split(" ").slice(1).join(" ") || "",
              contactNumber: mobileNo || "",
              altContactNumber: alternateNo || ""
            };
            
            setUserData(updatedUserData);
            setOriginalData(prev => ({
              ...prev,
              userData: updatedUserData
            }));
            
            console.log("✅ Profile data loaded from Redux:", {
              firstName,
              lastName,
              mobileNo,
              hasMobileNumber
            });
            
            // Check if mobile number is missing and dialog hasn't been shown in this session
            if (!hasMobileNumber && !dialogShownInSession) {
              // Add a small delay to ensure UI is loaded
              setTimeout(() => {
                setMobileDialogOpen(true);
                setDialogShownInSession(true);
              }, 1000);
            }
            
            await fetchCustomerAddresses(Number(id));
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [isAuthenticated, appUser, dialogShownInSession, dispatch]);

  // Update userData when Redux state changes
  useEffect(() => {
    if (userRole === "CUSTOMER" && (firstName || lastName)) {
      const updatedUserData = {
        firstName: firstName || userData.firstName || "",
        lastName: lastName || userData.lastName || "",
        contactNumber: mobileNo || userData.contactNumber || "",
        altContactNumber: alternateNo || userData.altContactNumber || ""
      };
      
      // Only update if data actually changed
      if (JSON.stringify(userData) !== JSON.stringify(updatedUserData)) {
        setUserData(updatedUserData);
        // Only update originalData if not editing
        if (!isEditing) {
          setOriginalData(prev => ({
            ...prev,
            userData: updatedUserData
          }));
        }
      }
    }
  }, [firstName, lastName, mobileNo, alternateNo, userRole, isEditing]);

  const fetchCustomerAddresses = async (customerId: number) => {
    try {
      const response = await utilsInstance.get(`/user-settings/${customerId}`);
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        const allSavedLocations = data.flatMap(doc => doc.savedLocations || []);

        // Use a Map to deduplicate addresses by location coordinates
        const uniqueAddresses = new Map();
        
        allSavedLocations
          .filter((loc: any) => loc.location?.address?.[0]?.formatted_address)
          .forEach((loc: any, idx: number) => {
            const primaryAddress = loc.location.address[0];
            const addressComponents = primaryAddress.address_components || [];
            
            const getComponent = (type: string) => {
              const component = addressComponents.find((c: any) => c.types.includes(type));
              return component?.long_name || "";
            };

            // Create a unique key based on coordinates or formatted address
            const locationKey = loc.location.lat && loc.location.lng 
              ? `${loc.location.lat},${loc.location.lng}`
              : primaryAddress.formatted_address;

            // Only add if this location doesn't exist yet
            if (!uniqueAddresses.has(locationKey)) {
              uniqueAddresses.set(locationKey, {
                id: loc._id || `addr_${idx}`,
                type: loc.name || "Other",
                street: primaryAddress.formatted_address,
                city: getComponent("locality") || 
                      getComponent("administrative_area_level_3") || 
                      getComponent("administrative_area_level_4") || 
                      "",
                country: getComponent("country") || "",
                postalCode: getComponent("postal_code") || "",
                rawData: {
                  formattedAddress: primaryAddress.formatted_address,
                  latitude: loc.location.lat,
                  longitude: loc.location.lng,
                  placeId: primaryAddress.place_id
                }
              });
            } else {
              console.log(`Duplicate address found: ${primaryAddress.formatted_address}`);
            }
          });

        const mappedAddresses = Array.from(uniqueAddresses.values());
        
        setAddresses(mappedAddresses);
        setOriginalData(prev => ({
          ...prev,
          addresses: mappedAddresses
        }));
        console.log("Deduplicated addresses:", mappedAddresses);
      } else {
        console.log("No address data found");
        setAddresses([]);
        setOriginalData(prev => ({
          ...prev,
          addresses: []
        }));
      }
    } catch (err) {
      console.error("Failed to fetch customer addresses:", err);
      setAddresses([]);
      setOriginalData(prev => ({
        ...prev,
        addresses: []
      }));
    }
  };
  
  const fetchServiceProviderData = async (serviceProviderId: number) => {
    try {
      const response = await axiosInstance.get(
        `/api/serviceproviders/get/serviceprovider/${serviceProviderId}`
      );

      const data = response.data;
      setServiceProviderData(data);

      const updatedUserData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        contactNumber: data.mobileNo ? data.mobileNo.toString() : "",
        altContactNumber: data.alternateNo ? data.alternateNo.toString() : ""
      };

      setUserData(updatedUserData);
      setOriginalData(prev => ({
        ...prev,
        userData: updatedUserData
      }));

      const addresses: Address[] = [];

      if (data.permanentAddress) {
        const permAddr = data.permanentAddress;
        const streetAddress = `${permAddr.field1 || ""} ${permAddr.field2 || ""}`.trim() || 
                             data.street || 
                             data.buildingName || 
                             "";
        
        addresses.push({
          id: "permanent",
          type: "Permanent",
          street: streetAddress || "Address not specified",
          city: permAddr.ctArea || data.locality || data.currentLocation || "",
          country: permAddr.country || "India",
          postalCode: permAddr.pinNo || (data.pincode ? data.pincode.toString() : ""),
        });
      }

      if (data.correspondenceAddress) {
        const corrAddr = data.correspondenceAddress;
        const streetAddress = `${corrAddr.field1 || ""} ${corrAddr.field2 || ""}`.trim() || 
                             data.street || 
                             data.buildingName || 
                             "";
        
        addresses.push({
          id: "correspondence",
          type: "Correspondence",
          street: streetAddress || "Address not specified",
          city: corrAddr.ctArea || data.locality || data.currentLocation || "",
          country: corrAddr.country || "India",
          postalCode: corrAddr.pinNo || (data.pincode ? data.pincode.toString() : ""),
        });
      }

      if (addresses.length === 0) {
        const serviceProviderAddress: Address = {
          id: "1",
          type: "Home",
          street: `${data.buildingName || ""} ${data.street || ""} ${data.locality || ""}`.trim(),
          city: data.nearbyLocation || data.currentLocation || "",
          country: "India",
          postalCode: data.pincode ? data.pincode.toString() : "",
        };
        addresses.push(serviceProviderAddress);
      }

      setAddresses(addresses);
      setOriginalData(prev => ({
        ...prev,
        addresses: addresses
      }));
    } catch (error) {
      console.error("Failed to fetch service provider data:", error);
    }
  };

  const formatMobileNumber = (number: string | null) => {
    if (!number || number === "null" || number === "undefined") return "";
    return number;
  };

  const getAvailableAddressTypes = () => {
    if (userRole === "SERVICE_PROVIDER") return ["Permanent", "Correspondence"];
    return ["Home", "Work", "Other"];
  };

  // Mobile number validation functions
  const validateMobileFormat = (number: string): boolean => {
    const mobilePattern = /^[0-9]{10}$/;
    return mobilePattern.test(number);
  };

  const checkMobileAvailability = async (number: string, isAlternate: boolean = false): Promise<boolean> => {
    if (!number || !validateMobileFormat(number)) {
      return false;
    }

    const setValidation = isAlternate ? setAltContactValidation : setContactValidation;
    const fieldName = isAlternate ? 'altContactNumber' : 'contactNumber';
    
    setValidation({
      loading: true,
      error: '',
      isAvailable: null,
      formatError: false
    });

    try {
      // Use POST request with payload as shown in your API documentation
      const endpoint = '/api/service-providers/check-mobile'; // Same endpoint for both
      const payload = { mobile: number };
      
      const response = await providerInstance.post(endpoint, payload);
      
      // Handle different API response structures
      let isAvailable = true;
      let errorMessage = '';
      
      if (response.data.exists !== undefined) {
        isAvailable = !response.data.exists; // If exists is true, then NOT available
        errorMessage = response.data.exists 
          ? `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered` 
          : '';
      } else if (response.data.available !== undefined) {
        isAvailable = response.data.available;
        errorMessage = !response.data.available 
          ? `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered` 
          : '';
      } else if (response.data.isAvailable !== undefined) {
        isAvailable = response.data.isAvailable;
        errorMessage = !response.data.isAvailable 
          ? `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered` 
          : '';
      } else {
        // Default assumption if API returns success without specific availability flag
        isAvailable = true;
      }
      
      setValidation({
        loading: false,
        error: errorMessage,
        isAvailable,
        formatError: false
      });

      // Mark this field as validated
      if (isAvailable) {
        setValidatedFields(prev => {
          const newSet = new Set(prev);
          newSet.add(fieldName);
          return newSet;
        });
      }

      return isAvailable;
    } catch (error: any) {
      console.error('Error validating mobile number:', error);
      
      let errorMessage = `Error checking ${isAlternate ? 'alternate' : 'mobile'} number`;
      
      if (error.response?.data) {
        const apiError = error.response.data;
        if (typeof apiError === 'string') {
          errorMessage = apiError;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.error) {
          errorMessage = apiError.error;
        }
      } else if (error.response?.status === 400) {
        errorMessage = `Invalid ${isAlternate ? 'alternate' : 'mobile'} number format`;
      } else if (error.response?.status === 409) {
        errorMessage = `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered`;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      setValidation({
        loading: false,
        error: errorMessage,
        isAvailable: false,
        formatError: false
      });

      return false;
    }
  };

  // Debounced validation using setTimeout
  const useDebouncedValidation = () => {
    const timeouts = {
      contact: null as NodeJS.Timeout | null,
      alternate: null as NodeJS.Timeout | null
    };

    return (number: string, isAlternate: boolean = false) => {
      const timeoutKey = isAlternate ? 'alternate' : 'contact';
      
      if (timeouts[timeoutKey]) {
        clearTimeout(timeouts[timeoutKey]!);
      }

      timeouts[timeoutKey] = setTimeout(() => {
        checkMobileAvailability(number, isAlternate);
      }, 800); // Increased to 800ms for better debouncing
    };
  };

  const debouncedValidation = useDebouncedValidation();

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUserData(prev => ({ ...prev, contactNumber: value }));

    // Reset validation state when changing
    setContactValidation(prev => ({
      ...prev,
      loading: false,
      error: '',
      isAvailable: null,
      formatError: false
    }));

    if (value.length === 10) {
      // Clear any format error
      setContactValidation(prev => ({
        ...prev,
        formatError: false,
        error: prev.error === 'Please enter a valid 10-digit mobile number' ? '' : prev.error
      }));
      
      // Start debounced validation
      debouncedValidation(value, false);
      
      // Check if alternate number is same as contact number
      if (userData.altContactNumber === value) {
        setAltContactValidation(prev => ({
          ...prev,
          error: 'Alternate number cannot be same as contact number',
          isAvailable: false,
          formatError: false
        }));
      } else if (userData.altContactNumber && userData.altContactNumber.length === 10) {
        // Re-validate alternate number if it was marked as same
        if (altContactValidation.error === 'Alternate number cannot be same as contact number') {
          setAltContactValidation(prev => ({
            ...prev,
            error: '',
            isAvailable: null,
            formatError: false
          }));
          debouncedValidation(userData.altContactNumber, true);
        }
      }
    } else if (value) {
      // Show format error for incomplete numbers
      setContactValidation({
        loading: false,
        error: 'Please enter a valid 10-digit mobile number',
        isAvailable: null,
        formatError: true
      });
    } else {
      // Clear everything if empty
      setContactValidation({
        loading: false,
        error: '',
        isAvailable: null,
        formatError: false
      });
    }
  };

  const handleAltContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUserData(prev => ({ ...prev, altContactNumber: value }));

    // Reset validation state when changing
    setAltContactValidation(prev => ({
      ...prev,
      loading: false,
      error: '',
      isAvailable: null,
      formatError: false
    }));

    if (value) {
      if (value.length === 10) {
        // Clear format error
        setAltContactValidation(prev => ({
          ...prev,
          formatError: false,
          error: prev.error === 'Please enter a valid 10-digit mobile number' ? '' : prev.error
        }));

        // Check if it's the same as contact number
        if (value === userData.contactNumber) {
          setAltContactValidation({
            loading: false,
            error: 'Alternate number cannot be same as contact number',
            isAvailable: false,
            formatError: false
          });
        } else {
          // Validate alternate number availability
          debouncedValidation(value, true);
        }
      } else {
        // Show format error for incomplete numbers
        setAltContactValidation({
          loading: false,
          error: 'Please enter a valid 10-digit mobile number',
          isAvailable: null,
          formatError: true
        });
      }
    } else {
      // Clear everything if empty
      setAltContactValidation({
        loading: false,
        error: '',
        isAvailable: null,
        formatError: false
      });
    }
  };

  const areNumbersUnique = (): boolean => {
    if (!userData.contactNumber || !userData.altContactNumber) return true;
    return userData.contactNumber !== userData.altContactNumber;
  };

  // Check if any field has been modified
  const hasChanges = (): boolean => {
    // Check user data changes
    const userDataChanged = 
      userData.firstName !== originalData.userData.firstName ||
      userData.lastName !== originalData.userData.lastName ||
      userData.contactNumber !== originalData.userData.contactNumber ||
      userData.altContactNumber !== originalData.userData.altContactNumber;

    // Check address changes (simplified check)
    const addressesChanged = 
      addresses.length !== originalData.addresses.length ||
      addresses.some((addr, index) => {
        const originalAddr = originalData.addresses[index];
        if (!originalAddr) return true;
        return (
          addr.street !== originalAddr.street ||
          addr.city !== originalAddr.city ||
          addr.country !== originalAddr.country ||
          addr.postalCode !== originalAddr.postalCode ||
          addr.type !== originalAddr.type
        );
      });

    return userDataChanged || addressesChanged || showAddAddress;
  };

  const validateAllFields = async (): Promise<boolean> => {
    const contactNumberChanged = userData.contactNumber !== originalData.userData.contactNumber;
    const altContactNumberChanged = userData.altContactNumber !== originalData.userData.altContactNumber;

    let allValid = true;
    const validationPromises: Promise<boolean>[] = [];

    // Validate contact number if changed
    if (contactNumberChanged) {
      if (!validateMobileFormat(userData.contactNumber)) {
        alert("Please enter a valid 10-digit contact number");
        return false;
      }

      // Check if we need to validate availability
      if (!validatedFields.has('contactNumber') || contactValidation.isAvailable === null) {
        validationPromises.push(checkMobileAvailability(userData.contactNumber, false));
      }
    }

    // Validate alternate number if changed
    if (altContactNumberChanged && userData.altContactNumber) {
      if (!validateMobileFormat(userData.altContactNumber)) {
        alert("Please enter a valid 10-digit alternate contact number");
        return false;
      }

      if (!areNumbersUnique()) {
        alert("Contact number and alternate contact number must be different");
        return false;
      }

      // Check if we need to validate availability
      if (!validatedFields.has('altContactNumber') || altContactValidation.isAvailable === null) {
        validationPromises.push(checkMobileAvailability(userData.altContactNumber, true));
      }
    }

    // Wait for all validations to complete
    if (validationPromises.length > 0) {
      const results = await Promise.all(validationPromises);
      allValid = results.every(result => result === true);
    }

    // Also check current validation states
    if (contactNumberChanged && contactValidation.isAvailable === false) {
      alert("Contact number is not available");
      allValid = false;
    }

    if (altContactNumberChanged && userData.altContactNumber && altContactValidation.isAvailable === false) {
      alert("Alternate contact number is not available");
      allValid = false;
    }

    return allValid;
  };

  const handleAddAddress = async () => {
    if (newAddress.street && newAddress.city && newAddress.country && newAddress.postalCode) {
      // Use custom type if "Other" is selected and customType is provided
      const addressType = newAddress.type === "Other" && newAddress.customType 
        ? newAddress.customType 
        : newAddress.type;

      const addressToAdd: Address = {
        type: addressType,
        street: newAddress.street,
        city: newAddress.city,
        country: newAddress.country,
        postalCode: newAddress.postalCode,
        id: `addr_${Date.now()}`,
        rawData: {
          formattedAddress: newAddress.street,
          latitude: 0,
          longitude: 0,
          placeId: `manual_${Date.now()}`
        }
      };

      const updatedAddresses = [...addresses, addressToAdd];
      setAddresses(updatedAddresses);

      // Save to user-settings API (same as Header component)
      if (userRole === "CUSTOMER" && userId) {
        try {
          await saveAddressToUserSettings(addressToAdd);
          
          // Refresh addresses from API to ensure consistency
          await fetchCustomerAddresses(userId);
          
          console.log("✅ Address saved successfully");
        } catch (err) {
          console.error("❌ Failed to save new address:", err);
          alert("Could not save address. Try again.");
          // Revert local state if API call fails
          setAddresses(addresses);
          return;
        }
      }

      setNewAddress({
        type: "Home",
        customType: "",
        street: "",
        city: "",
        country: "",
        postalCode: ""
      });
      setShowAddAddress(false);
    } else {
      alert("Please fill in all address fields");
    }
  };

  const removeAddress = async (id: string) => {
    if (addresses.length <= 1) return;
    
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    
    setAddresses(updatedAddresses);

    // Also remove from user-settings API
    if (userRole === "CUSTOMER" && userId) {
      try {
        await updateAddressesInUserSettings(updatedAddresses);
        console.log("✅ Address removed from user settings");
      } catch (error) {
        console.error("❌ Failed to remove address from user settings:", error);
        // Revert local state if API call fails
        setAddresses(addresses);
        alert("Could not remove address. Try again.");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validate only changed mobile numbers before saving
    const isValid = await validateAllFields();
    if (!isValid) {
      return;
    }

    setIsSaving(true);

    try {
      if (userRole === "SERVICE_PROVIDER" && userId) {
        // Only include changed fields in the payload
        const payload: any = {
          serviceproviderId: userId,
        };

        // Add only changed fields
        if (userData.firstName !== originalData.userData.firstName) {
          payload.firstName = userData.firstName;
        }
        if (userData.lastName !== originalData.userData.lastName) {
          payload.lastName = userData.lastName;
        }
        if (userData.contactNumber !== originalData.userData.contactNumber) {
          payload.mobileNo = userData.contactNumber?.replace("+", "") || null;
        }
        if (userData.altContactNumber !== originalData.userData.altContactNumber) {
          payload.alternateNo = userData.altContactNumber?.replace("+", "") || null;
        }

        // Only include address data if addresses changed
        const permanentAddress = addresses.find(addr => addr.type === "Permanent");
        const correspondenceAddress = addresses.find(addr => addr.type === "Correspondence");

        if (permanentAddress) {
          payload.permanentAddress = {
            field1: permanentAddress.street.split(' ')[0] || "",
            field2: permanentAddress.street || "",
            ctArea: permanentAddress.city || "",
            pinNo: permanentAddress.postalCode || "",
            state: "West Bengal",
            country: permanentAddress.country || "India"
          };
        }

        if (correspondenceAddress) {
          payload.correspondenceAddress = {
            field1: correspondenceAddress.street.split(' ')[0] || "",
            field2: correspondenceAddress.street || "",
            ctArea: correspondenceAddress.city || "",
            pinNo: correspondenceAddress.postalCode || "",
            state: "West Bengal",
            country: correspondenceAddress.country || "India"
          };
        }

        await axiosInstance.put(
          `/api/serviceproviders/update/serviceprovider/${userId}`,
          payload
        );
        await fetchServiceProviderData(userId);
      } else if (userRole === "CUSTOMER" && userId) {
        // Only include changed fields in the payload
        const payload: any = {
          customerid: userId,
        };

        if (userData.firstName !== originalData.userData.firstName) {
          payload.firstName = userData.firstName;
        }
        if (userData.lastName !== originalData.userData.lastName) {
          payload.lastName = userData.lastName;
        }
        if (userData.contactNumber !== originalData.userData.contactNumber) {
          payload.mobileNo = userData.contactNumber?.replace("+", "") || null;
        }
        if (userData.altContactNumber !== originalData.userData.altContactNumber) {
          payload.alternateNo = userData.altContactNumber?.replace("+", "") || null;
        }

        await axiosInstance.put(
          `/api/customer/update-customer/${userId}`,
          payload
        );
        
        // After saving, update local state from the response if needed
        // We don't need to fetch from API since the data is updated
        // Just update Redux state if needed
        if (userData.contactNumber) {
          dispatch(setHasMobileNumber(true));
        }
        
        // Update addresses in user-settings if they changed
        if (JSON.stringify(addresses) !== JSON.stringify(originalData.addresses)) {
          await updateAddressesInUserSettings(addresses);
        }
      }

      // Reset validation states and tracked fields
      setValidatedFields(new Set());
      setContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
      setAltContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowAddAddress(false);
    
    // Reset to original data (which comes from Redux)
    setUserData(originalData.userData);
    setAddresses([...originalData.addresses]);
    
    // Reset validation states
    setValidatedFields(new Set());
    setContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
    setAltContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
  };

  const handleEditStart = () => {
    // Store current state as original data when starting to edit
    setOriginalData({
      userData: { ...userData },
      addresses: [...addresses]
    });
    setIsEditing(true);
  };

  const getUserIdDisplay = () => {
    if (userRole === "SERVICE_PROVIDER") {
      return appUser?.serviceProviderId || "N/A";
    } else {
      return appUser?.customerid || "N/A";
    }
  };

  const isFormValid = (): boolean => {
    const contactNumberChanged = userData.contactNumber !== originalData.userData.contactNumber;
    const altContactNumberChanged = userData.altContactNumber !== originalData.userData.altContactNumber;

    // Contact number validation
    const contactValid = !contactNumberChanged || 
      (validateMobileFormat(userData.contactNumber) && 
       (contactValidation.isAvailable === true || contactValidation.isAvailable === null));

    // Alternate contact number validation (optional field)
    const altContactValid = !altContactNumberChanged || 
      (!userData.altContactNumber ||  // Empty is valid
       (validateMobileFormat(userData.altContactNumber) && 
        (altContactValidation.isAvailable === true || altContactValidation.isAvailable === null) &&
        areNumbersUnique()));

    return contactValid && altContactValid;
  };

  const ProfileSkeleton = () => (
    <div className="w-full">
      <div className="relative mt-16 bg-gradient-to-b from-blue-100 to-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between h-auto md:h-32 max-w-6xl px-6 mx-auto py-8 gap-4 md:gap-0">
          <div className="flex items-center gap-5">
            <SkeletonLoader variant="circular" width={80} height={80} />
            <div>
              <SkeletonLoader width={160} height={28} className="mb-2" />
              <SkeletonLoader width={96} height={16} />
            </div>
          </div>
          <SkeletonLoader width={128} height={40} />
        </div>
      </div>

      <div className="flex justify-center w-full py-6">
        <div className="w-[85%] max-w-6xl bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-6">
            <SkeletonLoader width={120} height={24} />
          </div>

          <div className="mb-6">
            <SkeletonLoader width={160} height={20} className="mb-4" />
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={96} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={96} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={96} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={96} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={96} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-6" />

          <div className="mb-6">
            <SkeletonLoader width={160} height={20} className="mb-4" />
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={128} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={160} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <SkeletonLoader width={96} height={16} className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonLoader height={120} />
              <SkeletonLoader height={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Mobile Number Dialog - Controlled by local state */}
      {mobileDialogOpen && appUser?.customerid && (
        <MobileNumberDialog
          open={mobileDialogOpen}
          onClose={() => {
            setMobileDialogOpen(false);
          }}
          customerId={appUser.customerid}
          onSuccess={() => {
            console.log("Mobile number updated successfully from ProfileScreen!");
            
            // Update Redux state
            dispatch(setHasMobileNumber(true));
            
            // Close dialog
            setMobileDialogOpen(false);
            
            // No API call needed - data will be refreshed on next page load
            // Or you can manually update Redux state if you get the new mobile number
          }}
        />
      )}

      {/* Header */}
      <div className="relative mt-16 bg-gradient-to-b from-blue-100 to-white text-blue-900">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between h-auto md:h-32 max-w-6xl px-6 mx-auto py-8 gap-4 md:gap-0">
          
          <div className="flex items-center gap-5">
            <img
              src={appUser?.picture || auth0User?.picture || "https://via.placeholder.com/80"}
              alt={userName || "User"}
              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">
                Hello, {userName || "User"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {userRole === "SERVICE_PROVIDER" ? "Service Provider" : "Customer"}
                {/* Use Redux state for mobile number warning */}
                {userRole === "CUSTOMER" && !hasMobileNumber && (
                  <span className="ml-2 text-red-500 text-xs">⚠️ Mobile number required</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center w-full md:w-auto">
            {!isEditing && (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md text-sm font-medium"
                onClick={handleEditStart}
                title="Edit Profile"
              >
                <Edit3 size={16} />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center w-full py-6">
        <div className="w-[85%] max-w-6xl bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-800">My account</h2>
            {/* Use Redux state for mobile number warning */}
            {userRole === "CUSTOMER" && !hasMobileNumber && (
              <button
                onClick={() => setMobileDialogOpen(true)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200"
              >
                Add Mobile Number
              </button>
            )}
          </div>

          {/* User Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              User Information
            </h3>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  User Name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={appUser?.nickname || userName || "User"}
                  readOnly
                  style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Email address
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={appUser?.email || auth0User?.email || emailId || "No email available"}
                  readOnly
                  style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  First name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb', cursor: isEditing ? 'text' : 'not-allowed' }}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Last name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb', cursor: isEditing ? 'text' : 'not-allowed' }}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {userRole === "SERVICE_PROVIDER" ? "Provider ID" : "User ID"}
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={getUserIdDisplay()}
                  readOnly
                  style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-6" />
          
          {/* Contact Info Section */}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Contact Information
          </h3>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Contact Number
                {userRole === "CUSTOMER" && (
                  <span className={`ml-1 ${!hasMobileNumber ? 'text-red-500' : 'text-green-500'}`}>
                    {!hasMobileNumber ? '⚠️' : '✓'}
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="flex">
                  {isEditing ? (
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-white"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-100">
                      {countryCode}
                    </div>
                  )}
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-md text-sm"
                    name="contactNumber"
                    value={formatMobileNumber(userData.contactNumber)}
                    onChange={handleContactNumberChange}
                    readOnly={!isEditing}
                    placeholder="Enter 10-digit number"
                    style={{ 
                      backgroundColor: isEditing ? "white" : "#f9fafb",
                      borderColor: contactValidation.error ? "#ef4444" : "#d1d5db",
                      cursor: isEditing ? 'text' : 'not-allowed'
                    }}
                    type="tel"
                    maxLength={10}
                  />
                </div>
                
                {/* Validation Status Icons */}
                {isEditing && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {contactValidation.loading && (
                      <ClipLoader size={16} color="#3b82f6" />
                    )}
                    {contactValidation.isAvailable && !contactValidation.loading && (
                      <Check size={16} className="text-green-500" />
                    )}
                    {contactValidation.isAvailable === false && !contactValidation.loading && (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Validation Messages */}
              {contactValidation.error && (
                <p className="text-red-500 text-xs mt-1">{contactValidation.error}</p>
              )}
              {contactValidation.formatError && isEditing && (
                <p className="text-red-500 text-xs mt-1">Please enter exactly 10 digits</p>
              )}
              {contactValidation.isAvailable && (
                <p className="text-green-500 text-xs mt-1">Contact number is available</p>
              )}
              {/* Use Redux state for mobile number warning */}
              {userRole === "CUSTOMER" && !hasMobileNumber && !isEditing && (
                <div className="mt-1">
                  <p className="text-red-500 text-xs">
                    Mobile number is required for bookings and notifications
                  </p>
                  <button
                    onClick={() => setMobileDialogOpen(true)}
                    className="mt-1 text-blue-600 text-xs hover:underline"
                  >
                    Click here to add mobile number
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Alternative Contact Number
              </label>
              <div className="relative">
                <div className="flex">
                  {isEditing ? (
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-white"
                      value={altCountryCode}
                      onChange={(e) => setAltCountryCode(e.target.value)}
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-100">
                      {altCountryCode}
                    </div>
                  )}
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-md text-sm"
                    name="altContactNumber"
                    value={formatMobileNumber(userData.altContactNumber)}
                    onChange={handleAltContactNumberChange}
                    readOnly={!isEditing}
                    placeholder="Enter 10-digit number"
                    style={{ 
                      backgroundColor: isEditing ? "white" : "#f9fafb",
                      borderColor: altContactValidation.error ? "#ef4444" : "#d1d5db",
                      cursor: isEditing ? 'text' : 'not-allowed'
                    }}
                    type="tel"
                    maxLength={10}
                  />
                </div>
                
                {/* Validation Status Icons */}
                {isEditing && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {altContactValidation.loading && (
                      <ClipLoader size={16} color="#3b82f6" />
                    )}
                    {altContactValidation.isAvailable && !altContactValidation.loading && (
                      <Check size={16} className="text-green-500" />
                    )}
                    {altContactValidation.isAvailable === false && !altContactValidation.loading && (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Validation Messages */}
              {altContactValidation.error && (
                <p className="text-red-500 text-xs mt-1">{altContactValidation.error}</p>
              )}
              {altContactValidation.formatError && isEditing && (
                <p className="text-red-500 text-xs mt-1">Please enter exactly 10 digits</p>
              )}
              {altContactValidation.isAvailable && (
                <p className="text-green-500 text-xs mt-1">Alternate number is available</p>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-semibold text-gray-600">
                Addresses
              </label>
              {isEditing && userRole === "CUSTOMER" && (
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="flex items-center text-blue-600 text-sm font-medium"
                >
                  <Plus size={16} className="mr-1" />
                  Add New Address
                </button>
              )}
            </div>

            {showAddAddress && isEditing && (
              <div className="border border-blue-200 rounded-lg p-4 mb-4 bg-blue-50">
                <h4 className="font-medium text-gray-700 mb-3">Add New Address</h4>
                
                {/* Address Type Selection - Same as Header */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Save As
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUserPreference("Home")}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm ${
                        newAddress.type === "Home" 
                          ? "bg-blue-100 text-blue-700 border border-blue-300" 
                          : "bg-white text-gray-700 border border-gray-300"
                      }`}
                    >
                      <FaHome size={14} />
                      Home
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUserPreference("Work")}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm ${
                        newAddress.type === "Work" 
                          ? "bg-blue-100 text-blue-700 border border-blue-300" 
                          : "bg-white text-gray-700 border border-gray-300"
                      }`}
                    >
                      <HiBuildingOffice size={14} />
                      Work
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUserPreference()}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm ${
                        newAddress.type === "Other" 
                          ? "bg-blue-100 text-blue-700 border border-blue-300" 
                          : "bg-white text-gray-700 border border-gray-300"
                      }`}
                    >
                      <FaLocationArrow size={14} />
                      Other
                    </button>
                  </div>
                </div>
                
                {/* Custom Type Input for "Other" */}
                {newAddress.type === "Other" && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Location Name
                    </label>
                    <input
                      type="text"
                      name="customType"
                      placeholder="Enter location name"
                      value={newAddress.customType}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                )}

                {/* Address Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={handleAddressInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm md:col-span-2"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={handleAddressInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={handleAddressInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={newAddress.postalCode}
                    onChange={handleAddressInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  <Button
                    onClick={() => setShowAddAddress(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAddress}
                    disabled={!newAddress.street || !newAddress.city || !newAddress.country || !newAddress.postalCode}
                  >
                    Save Address
                  </Button>
                </div>
              </div>
            )}

            {addresses.length === 0 ? (
              <p className="text-gray-500 italic">No addresses saved yet</p>
            ) : (
              <div className={`grid grid-cols-1 ${userRole === "SERVICE_PROVIDER" ? 'md:grid-cols-2' : ''} gap-4`}>
                {addresses.map((address) => {
                  const isExpanded = userRole === "SERVICE_PROVIDER" || expandedAddressIds.includes(address.id);

                  return (
                    <div
                      key={address.id}
                      className="border border-gray-200 rounded-lg transition-all duration-300 overflow-hidden p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{address.type}</span>
                        </div>
                        <div className="flex space-x-1">
                          {userRole === "CUSTOMER" && (
                            <button
                              onClick={() => toggleAddress(address.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          )}
                          {isEditing && userRole === "CUSTOMER" && addresses.length > 1 && (
                            <button
                              onClick={() => removeAddress(address.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={`transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
                        <p className="text-sm text-gray-600 mt-2">{address.street}</p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.country} {address.postalCode}
                        </p>

                        {userRole === "SERVICE_PROVIDER" && (
                          <div className="text-xs text-gray-500 mt-2">
                            Service provider addresses are managed separately
                          </div>
                        )}
                      </div>

                      {userRole === "CUSTOMER" && !isExpanded && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 truncate">{address.street}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Service Provider Status Section */}
          {userRole === "SERVICE_PROVIDER" && (
            <div className="mb-6">
              <div className="h-px bg-gray-200 my-6" />
              
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Service Status
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Account Status</p>
                    <p className="text-sm text-gray-600">Active Service Provider</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Now only at the bottom */}
          {isEditing && (
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <Button
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !isFormValid() || !hasChanges()}
                >
                  {isSaving ? (
                    <>
                      <ClipLoader size={16} color="white" className="mr-2" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-100 py-4 text-center text-gray-500 text-sm">
        © 2025 MyApp. All rights reserved.
      </div>
    </div>
  );
};

export default ProfileScreen;