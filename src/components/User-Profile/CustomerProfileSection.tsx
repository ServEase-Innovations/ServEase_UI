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
  initialData?: any; // Optional initial data from parent
}

const CustomerProfileSection: React.FC<CustomerProfileSectionProps> = ({ 
  userId, 
  userEmail,
  initialData 
}) => {
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
      const response = await utilsInstance.get(`/user-settings/${customerId}`);
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
                type: loc.name || "Other",
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
      } else {
        // Fetch data if not provided
        Promise.all([
          fetchCustomerDetails(),
          fetchCustomerAddresses(userId)
        ]);
      }
    }
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
        error: isAvailable ? '' : `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered`,
        isAvailable,
        formatError: false
      });

      return isAvailable;
    } catch (error) {
      setValidation({
        loading: false,
        error: `Error checking ${isAlternate ? 'alternate' : 'mobile'} number`,
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
        error: 'Please enter a valid 10-digit mobile number',
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
          error: 'Alternate number cannot be same as contact number',
          isAvailable: false,
          formatError: false
        });
      } else {
        setTimeout(() => checkMobileAvailability(value, true), 800);
      }
    } else if (value) {
      setAltContactValidation({
        loading: false,
        error: 'Please enter a valid 10-digit mobile number',
        isAvailable: null,
        formatError: true
      });
    }
  };

  const saveAddressToUserSettings = async (addressData: any) => {
    if (!userId) return;

    try {
      const response = await utilsInstance.get(`/user-settings/${userId}`);
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
      await utilsInstance.put(`/user-settings/${userId}`, {
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

      await utilsInstance.put(`/user-settings/${userId}`, {
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
      alert("Please fill in all address fields");
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
        alert("Could not save address. Try again.");
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
        alert("Could not remove address. Try again.");
      }
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    // Validate
    if (userData.contactNumber && !validateMobileFormat(userData.contactNumber)) {
      alert("Please enter a valid 10-digit contact number");
      return;
    }

    if (userData.altContactNumber && !validateMobileFormat(userData.altContactNumber)) {
      alert("Please enter a valid 10-digit alternate contact number");
      return;
    }

    if (userData.contactNumber && userData.altContactNumber && 
        userData.contactNumber === userData.altContactNumber) {
      alert("Contact number and alternate contact number must be different");
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <ClipLoader size={40} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-6">
      <div className="w-[85%] max-w-6xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-lg font-semibold text-gray-800">My account</h2>
          {!isEditing && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md text-sm font-medium"
              onClick={() => {
                setOriginalData({ userData: { ...userData }, addresses: [...addresses] });
                setIsEditing(true);
              }}
            >
              <Edit3 size={16} />
              Edit
            </button>
          )}
        </div>

        {/* User Info with Email and ID */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            User Information
          </h3>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Email address
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                value={userEmail || "No email available"}
                readOnly
                style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                User ID
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                value={customerId || userId || "N/A"}
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
                value={userData.firstName}
                onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                readOnly={!isEditing}
                style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Last name
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={userData.lastName}
                onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                readOnly={!isEditing}
                style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-6" />
        
        {/* Contact Info */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Contact Information
        </h3>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Contact Number
              <span className={`ml-1 ${hasMobileNumber ? 'text-green-500' : 'text-red-500'}`}>
                {hasMobileNumber ? '✓ Verified' : '⚠ Required'}
              </span>
            </label>
            <div className="relative">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={userData.contactNumber}
                onChange={handleContactNumberChange}
                readOnly={!isEditing}
                placeholder="Enter 10-digit number"
                style={{ 
                  backgroundColor: isEditing ? "white" : "#f9fafb",
                  borderColor: contactValidation.error ? "#ef4444" : "#d1d5db"
                }}
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
                Mobile number is required for bookings
              </p>
            )}
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Alternative Contact Number
            </label>
            <div className="relative">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={userData.altContactNumber}
                onChange={handleAltContactNumberChange}
                readOnly={!isEditing}
                placeholder="Enter 10-digit number"
                style={{ 
                  backgroundColor: isEditing ? "white" : "#f9fafb",
                  borderColor: altContactValidation.error ? "#ef4444" : "#d1d5db"
                }}
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
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-gray-600">
              Addresses
            </label>
            {isEditing && (
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
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-600 mb-2">Save As</label>
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAddress(prev => ({ 
                        ...prev, 
                        type, 
                        customType: type === "Other" ? prev.customType : "" 
                      }))}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm ${
                        newAddress.type === type 
                          ? "bg-blue-100 text-blue-700 border border-blue-300" 
                          : "bg-white text-gray-700 border border-gray-300"
                      }`}
                    >
                      {type === "Home" && <FaHome size={14} />}
                      {type === "Work" && <HiBuildingOffice size={14} />}
                      {type === "Other" && <FaLocationArrow size={14} />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              {newAddress.type === "Other" && (
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Location Name"
                    value={newAddress.customType}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, customType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm md:col-span-2"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-3">
                <Button onClick={() => setShowAddAddress(false)}>Cancel</Button>
                <Button onClick={handleAddAddress}>Save Address</Button>
              </div>
            </div>
          )}

          {addresses.length === 0 ? (
            <p className="text-gray-500 italic">No addresses saved yet</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {addresses.map((address) => (
                <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-800">{address.type}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleAddress(address.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedAddressIds.includes(address.id) ? 
                          <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isEditing && addresses.length > 1 && (
                        <button
                          onClick={() => removeAddress(address.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedAddressIds.includes(address.id) ? (
                    <>
                      <p className="text-sm text-gray-600 mt-2">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.country} {address.postalCode}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 mt-2 truncate">{address.street}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <Button onClick={handleCancel} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving || !isFormValid() || !hasChanges()}>
                {isSaving ? <><ClipLoader size={16} color="white" className="mr-2" />Saving...</> : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfileSection;