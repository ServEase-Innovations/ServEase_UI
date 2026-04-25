/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/store/userStore";
import { setHasMobileNumber } from "src/features/customer/customerSlice";
import { Button } from "../Button/button";
import { ClipLoader } from "react-spinners";
import { ChevronDown, ChevronUp, Plus, X, Check, AlertCircle, Edit3 } from "lucide-react";
import { FaHome, FaLocationArrow } from "react-icons/fa";
import { HiBuildingOffice } from "react-icons/hi2";
import utilsInstance from "src/services/utilsInstance";
import providerInstance from "src/services/providerInstance";
import { useLanguage } from "src/context/LanguageContext";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import preferenceInstance from "src/services/preferenceInstance";

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

interface UserData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  altContactNumber: string;
}

interface CustomerProfileSectionProps {
  userId: number | null;
  userEmail: string | null;
  initialData?: any; 
  isExternalEdit?: boolean; // Add this
  setExternalEdit?: (val: boolean) => void; // Add this
}

const CustomerProfileSection: React.FC<CustomerProfileSectionProps> = ({ 
  userId, 
  userEmail,
  initialData ,
  isExternalEdit,
  setExternalEdit
}) => {
  const { t } = useLanguage(); // Initialize the translation function
  const dispatch = useDispatch();
  // ✅ Only keep what we need from Redux
  const { customerId } = useSelector((state: RootState) => state.customer);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    contactNumber: "",
    altContactNumber: ""
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [originalData, setOriginalData] = useState({
    userData: { firstName: "", lastName: "", contactNumber: "", altContactNumber: "" },
    addresses: [] as Address[]
  });
  const [expandedAddressIds, setExpandedAddressIds] = useState<string[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: "Home",
    customType: "",
    street: "",
    city: "",
    country: "",
    postalCode: ""
  });

  // ✅ Derive hasMobileNumber from actual userData
  const hasMobileNumber = !!userData.contactNumber;

  // Validation states
  const [contactValidation, setContactValidation] = useState({
    loading: false,
    error: '',
    isAvailable: null as boolean | null,
    formatError: false
  });
  const [altContactValidation, setAltContactValidation] = useState({
    loading: false,
    error: '',
    isAvailable: null as boolean | null,
    formatError: false
  });

  const fetchCustomerDetails = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await providerInstance.get(`/api/customer/${userId}`);
      const data = response.data?.data;

      const userDataFromApi = {
        firstName: data?.firstname || "",
        lastName: data?.lastname || "",
        contactNumber: data?.mobileno || "",
        altContactNumber: data?.alternateno || ""
      };

      setUserData(userDataFromApi);
      setOriginalData(prev => ({
        ...prev,
        userData: userDataFromApi
      }));

      // ✅ Update Redux if you still need it elsewhere in the app
      if (data?.mobileno) {
        dispatch(setHasMobileNumber(true));
      }

    } catch (err) {
      console.error("Failed to fetch customer details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerAddresses = async (customerId: number) => {
    try {
      const response = await preferenceInstance.get(`/api/user-settings/${customerId}`);
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        const allSavedLocations = data.flatMap((doc: any) => doc.savedLocations || []);
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

            const locationKey = loc.location.lat && loc.location.lng 
              ? `${loc.location.lat},${loc.location.lng}`
              : primaryAddress.formatted_address;

            if (!uniqueAddresses.has(locationKey)) {
              uniqueAddresses.set(locationKey, {
                id: loc._id || `addr_${idx}`,
                type: loc.name || t("others"),
                street: primaryAddress.formatted_address,
                city: getComponent("locality") || "",
                country: getComponent("country") || "",
                postalCode: getComponent("postal_code") || "",
                rawData: {
                  formattedAddress: primaryAddress.formatted_address,
                  latitude: loc.location.lat,
                  longitude: loc.location.lng,
                  placeId: primaryAddress.place_id
                }
              });
            }
          });

        const mappedAddresses = Array.from(uniqueAddresses.values());
        setAddresses(mappedAddresses);
        setOriginalData(prev => ({
          ...prev,
          addresses: mappedAddresses
        }));
      }
    } catch (err) {
      console.error("Failed to fetch customer addresses:", err);
    }
  };
useEffect(() => {
    if (isExternalEdit !== undefined) {
      setIsEditing(isExternalEdit);
    }
  }, [isExternalEdit]);

  useEffect(() => {
    const loadData = async () => {
      if (userId) {
        if (initialData) {
          // Use initial data if provided
          const userDataFromProps = {
            firstName: initialData.firstname || "",
            lastName: initialData.lastname || "",
            contactNumber: initialData.mobileno || "",
            altContactNumber: initialData.alternateno || ""
          };
          setUserData(userDataFromProps);
          setOriginalData(prev => ({
            ...prev,
            userData: userDataFromProps
          }));
          setIsLoading(false);
          
          // Update Redux if needed
          if (initialData.mobileno) {
            dispatch(setHasMobileNumber(true));
          }
          
          // Still fetch addresses
          await fetchCustomerAddresses(userId);
        } else {
          // Fetch data if not provided
          await Promise.all([
            fetchCustomerDetails(),
            fetchCustomerAddresses(userId)
          ]);
        }
      }
    };

    loadData();
  }, [userId, initialData, dispatch]);

  const validateMobileFormat = (number: string): boolean => {
    return /^[0-9]{10}$/.test(number);
  };

  const checkMobileAvailability = async (number: string, isAlternate: boolean = false): Promise<boolean> => {
    if (!number || !validateMobileFormat(number)) return false;

    const setValidation = isAlternate ? setAltContactValidation : setContactValidation;
    
    setValidation({ loading: true, error: '', isAvailable: null, formatError: false });

    try {
      const response = await providerInstance.post('/api/service-providers/check-mobile', { mobile: number });
      
      let isAvailable = true;
      if (response.data.exists !== undefined) {
        isAvailable = !response.data.exists;
      }

      setValidation({
        loading: false,
        error: isAvailable ? '' : `${isAlternate ? t('alternate') : t('mobile')} ${t('numberAlreadyRegistered')}`,
        isAvailable,
        formatError: false
      });

      return isAvailable;
    } catch (error) {
      setValidation({
        loading: false,
        error: t('errorCheckingNumber'),
        isAvailable: false,
        formatError: false
      });
      return false;
    }
  };

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUserData(prev => ({ ...prev, contactNumber: value }));

    setContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });

    if (value.length === 10) {
      setTimeout(() => checkMobileAvailability(value, false), 800);
    } else if (value) {
      setContactValidation({
        loading: false,
        error: t('phoneValidationError'),
        isAvailable: null,
        formatError: true
      });
    }
  };

  const handleAltContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUserData(prev => ({ ...prev, altContactNumber: value }));

    setAltContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });

    if (value.length === 10) {
      if (value === userData.contactNumber) {
        setAltContactValidation({
          loading: false,
          error: t('alternateNumberCannotBeSame'),
          isAvailable: false,
          formatError: false
        });
      } else {
        setTimeout(() => checkMobileAvailability(value, true), 800);
      }
    } else if (value) {
      setAltContactValidation({
        loading: false,
        error: t('phoneValidationError'),
        isAvailable: null,
        formatError: true
      });
    }
  };

  const saveAddressToUserSettings = async (addressData: any) => {
    if (!userId) return;

    try {
      const response = await preferenceInstance.get(`/api/user-settings/${userId}`);
      const currentSettings = response.data;

      let existingLocations = [];
      
      if (Array.isArray(currentSettings) && currentSettings.length > 0) {
        existingLocations = currentSettings[0].savedLocations || [];
      }

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

      const updatedLocations = [...existingLocations, newLocation];
      await preferenceInstance.put(`/api/user-settings/${userId}`, {
        customerId: userId,
        savedLocations: updatedLocations
      });
      
      return true;
    } catch (error) {
      console.error("Failed to save address:", error);
      throw error;
    }
  };

  const updateAddressesInUserSettings = async (updatedAddresses: Address[]) => {
    if (!userId) return;

    try {
      const savedLocations = updatedAddresses.map((addr) => ({
        name: addr.type,
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
      }));

      await preferenceInstance.put(`/api/user-settings/${userId}`, {
        customerId: userId,
        savedLocations: savedLocations
      });
    } catch (error) {
      console.error("Failed to update addresses:", error);
      throw error;
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.country || !newAddress.postalCode) {
      alert(t('fillAllAddressFields'));
      return;
    }

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

    if (userId) {
      try {
        await saveAddressToUserSettings(addressToAdd);
        await fetchCustomerAddresses(userId);
        setShowAddAddress(false);
        setNewAddress({ type: "Home", customType: "", street: "", city: "", country: "", postalCode: "" });
      } catch (err) {
        console.error("Failed to save new address:", err);
        alert(t('addressSaveError'));
        setAddresses(addresses);
      }
    }
  };

  const removeAddress = async (id: string) => {
    if (addresses.length <= 1) return;
    
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    setAddresses(updatedAddresses);

    if (userId) {
      try {
        await updateAddressesInUserSettings(updatedAddresses);
      } catch (error) {
        console.error("Failed to remove address:", error);
        setAddresses(addresses);
        alert(t('addressRemoveError'));
      }
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    // Validate
    if (userData.contactNumber && !validateMobileFormat(userData.contactNumber)) {
      alert(t('phoneValidationError'));
      return;
    }

    if (userData.altContactNumber && !validateMobileFormat(userData.altContactNumber)) {
      alert(t('phoneValidationError'));
      return;
    }

    if (userData.contactNumber && userData.altContactNumber && 
        userData.contactNumber === userData.altContactNumber) {
      alert(t('contactNumbersMustBeDifferent'));
      return;
    }

    setIsSaving(true);

    try {
      // Create payload with only changed fields
      const payload: any = { customerid: userId };

      if (userData.firstName !== originalData.userData.firstName) {
        payload.firstname = userData.firstName;
      }
      
      if (userData.lastName !== originalData.userData.lastName) {
        payload.lastname = userData.lastName;
      }
      
      if (userData.contactNumber !== originalData.userData.contactNumber && userData.contactNumber) {
        payload.mobileno = userData.contactNumber.replace("+", "");
      }
      
      if (userData.altContactNumber !== originalData.userData.altContactNumber) {
        payload.alternateno = userData.altContactNumber?.replace("+", "") || null;
      }

      // Only make API call if there are changes (excluding customerid)
      if (Object.keys(payload).length > 1) {
        await providerInstance.put(`/api/customer/${userId}`, payload);
        // Refresh data after save
        await fetchCustomerDetails();
      }
      
      // ✅ Update Redux if needed
      if (userData.contactNumber) {
        dispatch(setHasMobileNumber(true));
      }
      
      if (JSON.stringify(addresses) !== JSON.stringify(originalData.addresses)) {
        await updateAddressesInUserSettings(addresses);
      }

      setOriginalData({ userData: { ...userData }, addresses: [...addresses] });
   setIsEditing(false);
      if (setExternalEdit) setExternalEdit(false);
    } catch (error) {
      console.error("Failed to save data:", error);
      alert(t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (setExternalEdit) setExternalEdit(false);
    setUserData(originalData.userData);
    setAddresses([...originalData.addresses]);
    setContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
    setAltContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
  };

  const toggleAddress = (id: string) => {
    setExpandedAddressIds(prev =>
      prev.includes(id) ? prev.filter(addrId => addrId !== id) : [...prev, id]
    );
  };

  const hasChanges = (): boolean => {
    return (
      userData.firstName !== originalData.userData.firstName ||
      userData.lastName !== originalData.userData.lastName ||
      userData.contactNumber !== originalData.userData.contactNumber ||
      userData.altContactNumber !== originalData.userData.altContactNumber ||
      JSON.stringify(addresses) !== JSON.stringify(originalData.addresses)
    );
  };

  const isFormValid = (): boolean => {
    if (userData.contactNumber && !validateMobileFormat(userData.contactNumber)) return false;
    if (userData.altContactNumber && !validateMobileFormat(userData.altContactNumber)) return false;
    if (userData.contactNumber && userData.altContactNumber && 
        userData.contactNumber === userData.altContactNumber) return false;
    return true;
  };

  const roField =
    "w-full cursor-not-allowed rounded-xl border border-slate-200/80 bg-slate-50/90 px-3.5 py-2.5 text-sm text-slate-600";
  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";
  const fieldView =
    "w-full cursor-not-allowed rounded-xl border border-slate-200/80 bg-slate-50/90 px-3.5 py-2.5 text-sm text-slate-700";

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex w-full justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-6xl rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/30 ring-1 ring-slate-900/5 sm:p-7">
          {/* Header with edit button skeleton */}
          <div className="mb-6 flex items-center justify-between border-b border-slate-200/90 pb-4">
            <SkeletonLoader width={120} height={24} />
            <SkeletonLoader width={80} height={36} />
          </div>

          {/* User Information Section Skeleton */}
          <div className="mb-6">
            <SkeletonLoader width={150} height={20} className="mb-4" />
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={60} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={60} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={80} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={80} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-6" />

          {/* Contact Information Section Skeleton */}
          <div className="mb-6">
            <SkeletonLoader width={150} height={20} className="mb-4" />
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={120} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <SkeletonLoader width={180} height={16} className="mb-2" />
                <SkeletonLoader height={40} />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-6" />

          {/* Addresses Section Skeleton */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <SkeletonLoader width={80} height={20} />
              <SkeletonLoader width={120} height={32} />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2].map((item) => (
                <div key={item} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <SkeletonLoader width={80} height={20} />
                    <SkeletonLoader width={60} height={20} />
                  </div>
                  <div className="mt-2">
                    <SkeletonLoader height={20} className="mb-1" />
                    <SkeletonLoader width="80%" height={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/30 ring-1 ring-slate-900/5 sm:p-7">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/90 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('myAccount')}</h2>
          {!isEditing && (
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 sm:w-auto"
              onClick={() => {
                setOriginalData({ userData: { ...userData }, addresses: [...addresses] });
                setIsEditing(true);
              }}
            >
              <Edit3 size={16} className="shrink-0" />
              {t('edit')}
            </button>
          )}
        </div>

        {/* User Info with Email and ID */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
            {t('userInformation')}
          </h3>

          <div className="mb-5 flex flex-wrap gap-4 rounded-xl border border-slate-100/90 bg-slate-50/40 p-4 sm:p-5">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                {t('email')}
              </label>
              <input
                className={roField}
                value={userEmail || t('noEmailAvailable')}
                readOnly
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                {t('userId')}
              </label>
              <input
                className={roField}
                value={String(customerId || userId || "N/A")}
                readOnly
              />
            </div>
          </div>

          <div className="mb-1 flex flex-wrap gap-4">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                {t('firstName')}
              </label>
              <input
                className={isEditing ? field : fieldView}
                value={userData.firstName}
                onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                readOnly={!isEditing}
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                {t('lastName')}
              </label>
              <input
                className={isEditing ? field : fieldView}
                value={userData.lastName}
                onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                readOnly={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="my-6 h-px bg-slate-200/90" />
        
        {/* Contact Info */}
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          {t("profileContactInformation")}
        </h3>

        <div className="mb-6 flex flex-wrap gap-4 rounded-xl border border-slate-100/90 bg-slate-50/40 p-4 sm:p-5">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              {t('contactNumber')}{" "}
              <span className={hasMobileNumber ? "font-medium text-emerald-600" : "font-medium text-amber-600"}>
                {hasMobileNumber ? `· ${t('verified')}` : `· ${t('required')}`}
              </span>
            </label>
            <div className="relative">
              <input
                className={`${isEditing ? field : fieldView} ${
                  contactValidation.error ? "!border-rose-500" : ""
                }`}
                value={userData.contactNumber}
                onChange={handleContactNumberChange}
                readOnly={!isEditing}
                placeholder={t('enter10DigitNumber')}
                maxLength={10}
              />
              {isEditing && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  {contactValidation.loading && <ClipLoader size={16} color="#3b82f6" />}
                  {contactValidation.isAvailable && !contactValidation.loading && <Check size={16} className="text-green-500" />}
                  {contactValidation.isAvailable === false && !contactValidation.loading && <AlertCircle size={16} className="text-red-500" />}
                </div>
              )}
            </div>
            {contactValidation.error && <p className="text-red-500 text-xs mt-1">{contactValidation.error}</p>}
            {!hasMobileNumber && !isEditing && (
              <p className="text-red-500 text-xs mt-1">
                {t('mobileNumberRequired')}
              </p>
            )}
          </div>

          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              {t('alternativeContactNumber')}
            </label>
            <div className="relative">
              <input
                className={`${isEditing ? field : fieldView} ${
                  altContactValidation.error ? "!border-rose-500" : ""
                }`}
                value={userData.altContactNumber}
                onChange={handleAltContactNumberChange}
                readOnly={!isEditing}
                placeholder={t('enter10DigitNumber')}
                maxLength={10}
              />
              {isEditing && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  {altContactValidation.loading && <ClipLoader size={16} color="#3b82f6" />}
                  {altContactValidation.isAvailable && !altContactValidation.loading && <Check size={16} className="text-green-500" />}
                  {altContactValidation.isAvailable === false && !altContactValidation.loading && <AlertCircle size={16} className="text-red-500" />}
                </div>
              )}
            </div>
            {altContactValidation.error && <p className="text-red-500 text-xs mt-1">{altContactValidation.error}</p>}
          </div>
        </div>

        {/* Addresses */}
        <div className="mb-2 mt-4">
          <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {t('addresses')}
            </h3>
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-100/90 sm:w-auto"
              >
                <Plus size={16} className="shrink-0" />
                {t('addNewAddress')}
              </button>
            )}
          </div>

          {showAddAddress && isEditing && (
            <div className="mb-4 rounded-xl border border-sky-200/70 bg-sky-50/60 p-4 sm:p-5">
              <h4 className="mb-3 text-sm font-semibold text-slate-800">{t('addNewAddress')}</h4>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-600 mb-2">{t('saveAs')}</label>
                <div className="flex gap-2">
                  {[t('home'), t('work'), t('others')].map((type, index) => {
                    const typeValue = index === 0 ? "Home" : index === 1 ? "Work" : "Other";
                    return (
                      <button
                        key={type}
                        onClick={() => setNewAddress(prev => ({ 
                          ...prev, 
                          type: typeValue, 
                          customType: typeValue === "Other" ? prev.customType : "" 
                        }))}
                        className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          newAddress.type === typeValue 
                            ? "border-sky-500 bg-sky-100 text-sky-900 shadow-sm" 
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {typeValue === "Home" && <FaHome size={14} />}
                        {typeValue === "Work" && <HiBuildingOffice size={14} />}
                        {typeValue === "Other" && <FaLocationArrow size={14} />}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {newAddress.type === "Other" && (
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder={t('locationName')}
                    value={newAddress.customType}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, customType: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="text"
                  placeholder={t('streetAddress')}
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="md:col-span-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <input
                  type="text"
                  placeholder={t('city')}
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <input
                  type="text"
                  placeholder={t('country')}
                  value={newAddress.country}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <input
                  type="text"
                  placeholder={t('postalCode')}
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              
              <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row sm:gap-3">
                <Button onClick={() => setShowAddAddress(false)}>{t('cancel')}</Button>
                <Button onClick={handleAddAddress}>{t('saveAddress')}</Button>
              </div>
            </div>
          )}

          {addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
              {t('noAddressesSaved')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-slate-300/90 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-800">{address.type}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => toggleAddress(address.id)}
                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        aria-expanded={expandedAddressIds.includes(address.id)}
                      >
                        {expandedAddressIds.includes(address.id) ? 
                          <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isEditing && addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAddress(address.id)}
                          className="rounded-md p-1.5 text-rose-500 transition hover:bg-rose-50"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedAddressIds.includes(address.id) ? (
                    <>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{address.street}</p>
                      <p className="text-sm text-slate-500">
                        {address.city}, {address.country} {address.postalCode}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 truncate text-sm text-slate-600">{address.street}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="mt-8 border-t border-slate-200/90 pt-6">
            <div className="flex flex-col-reverse justify-center gap-2 sm:flex-row sm:gap-3">
              <Button onClick={handleCancel} disabled={isSaving} className="!min-w-0 !justify-center sm:!w-auto">
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !isFormValid() || !hasChanges()}
                className="!min-w-0 !justify-center !bg-sky-600 !text-white !border-sky-600 hover:!bg-sky-700 sm:!w-auto"
              >
                {isSaving ? <><ClipLoader size={16} color="white" className="mr-2" />{t('saving')}</> : t('saveChanges')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfileSection;