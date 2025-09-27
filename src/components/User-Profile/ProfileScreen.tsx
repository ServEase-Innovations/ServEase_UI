/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";
import axiosInstance from "src/services/axiosInstance";
import { ClipLoader } from "react-spinners";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import utilsInstance from "src/services/utilsInstance";
import { useAppUser } from "src/context/AppUserContext";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isPrimary: boolean;
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
}

const ProfileScreen = () => {
  const { user: auth0User, isAuthenticated } = useAuth0();
  const { appUser } = useAppUser();
  
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>("CUSTOMER");
  const [serviceProviderData, setServiceProviderData] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAddressIds, setExpandedAddressIds] = useState<string[]>([]);

  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    contactNumber: "",
    altContactNumber: ""
  });
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: "Home",
    street: "",
    city: "",
    country: "",
    postalCode: "",
    isPrimary: false
  });

  const [countryCode, setCountryCode] = useState("+91");
  const [altCountryCode, setAltCountryCode] = useState("+91");

  const toggleAddress = (id: string) => {
    setExpandedAddressIds((prev) =>
      prev.includes(id) ? prev.filter((addrId) => addrId !== id) : [...prev, id]
    );
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

        if (name) {
          const nameParts = name.split(" ");
          setUserData(prev => ({
            ...prev,
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || ""
          }));
        }

        try {
          if (role === "SERVICE_PROVIDER" && id) {
            await fetchServiceProviderData(id);
          } else if (role === "CUSTOMER" && id) {
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
  }, [isAuthenticated, appUser]);

 const fetchCustomerAddresses = async (customerId: number) => {
  try {
    const response = await utilsInstance.get(`/user-settings/${customerId}`);
    const data = response.data;

    if (Array.isArray(data) && data.length > 0) {
      const allSavedLocations = data.flatMap(doc => doc.savedLocations || []);

      const mappedAddresses: Address[] = allSavedLocations
        .filter((loc: any) => loc.location?.address?.[0]?.formatted_address) // Check for proper address structure
        .map((loc: any, idx: number) => {
          const primaryAddress = loc.location.address[0]; // Use the first address object
          const addressComponents = primaryAddress.address_components || [];
          
          // Helper function to extract address component by type
          const getComponent = (type: string) => {
            const component = addressComponents.find((c: any) => c.types.includes(type));
            return component?.long_name || "";
          };

          return {
            id: loc._id || idx.toString(),
            type: loc.name || "Other",
            street: primaryAddress.formatted_address, // Use the full formatted address as street
            city: getComponent("locality") || 
                  getComponent("administrative_area_level_3") || 
                  getComponent("administrative_area_level_4") || 
                  "",
            country: getComponent("country") || "",
            postalCode: getComponent("postal_code") || "",
            isPrimary: loc.isPrimary || idx === 0,
            // Store additional data for reference
            rawData: {
              formattedAddress: primaryAddress.formatted_address,
              latitude: loc.location.lat,
              longitude: loc.location.lng,
              placeId: primaryAddress.place_id
            }
          };
        });

      setAddresses(mappedAddresses);
      console.log("Mapped addresses:", mappedAddresses);
    } else {
      console.log("No address data found");
      setAddresses([]);
    }
  } catch (err) {
    console.error("Failed to fetch customer addresses:", err);
    setAddresses([]);
  }
};
  
  const fetchServiceProviderData = async (serviceProviderId: number) => {
    try {
      const response = await axiosInstance.get(
        `/api/serviceproviders/get/serviceprovider/${serviceProviderId}`
      );

      const data = response.data;
      setServiceProviderData(data);

      setUserData(prev => ({
        ...prev,
        contactNumber: data.mobileNo ? data.mobileNo.toString() : "",
        altContactNumber: data.alternateNo ? data.alternateNo.toString() : ""
      }));

      const serviceProviderAddress: Address = {
        id: "1",
        type: "Home",
        street: `${data.buildingName || ""} ${data.street || ""} ${data.locality || ""}`.trim(),
        city: data.nearbyLocation || data.currentLocation || "",
        country: "India",
        postalCode: data.pincode ? data.pincode.toString() : "",
        isPrimary: true,
      };

      setAddresses([serviceProviderAddress]);
    } catch (error) {
      console.error("Failed to fetch service provider data:", error);
    }
  };

  const getAvailableAddressTypes = () => {
    if (userRole === "SERVICE_PROVIDER") return ["Home"];
    return ["Home", "Work", "Other"];
  };

  const handleAddAddress = async () => {
  if (newAddress.street && newAddress.city && newAddress.country && newAddress.postalCode) {
    const addressToAdd = {
      ...newAddress,
      id: Date.now().toString(),
    };

    let updatedAddresses;
    if (newAddress.isPrimary) {
      updatedAddresses = addresses.map((addr) => ({ ...addr, isPrimary: false }));
      updatedAddresses.push(addressToAdd);
    } else {
      updatedAddresses = [...addresses, addressToAdd];
    }

    setAddresses(updatedAddresses);

    if (userRole === "CUSTOMER" && userId) {
      try {
        const payload = {
          customerId: userId,
          savedLocations: [{
            name: addressToAdd.type,
            location: {
              address: [{
                formatted_address: addressToAdd.street,
                address_components: [
                  { long_name: addressToAdd.city, types: ["locality"] },
                  { long_name: addressToAdd.country, types: ["country"] },
                  { long_name: addressToAdd.postalCode, types: ["postal_code"] },
                ],
                geometry: {
                  location: {
                    lat: 0, // You might want to get actual coordinates
                    lng: 0
                  }
                }
              }],
              lat: 0,
              lng: 0
            },
            isPrimary: addressToAdd.isPrimary,
          }],
        };

        await utilsInstance.post("/user-settings", payload);
        console.log("✅ Address saved successfully");
      } catch (err) {
        console.error("❌ Failed to save new address:", err);
        alert("Could not save address. Try again.");
      }
    }

    setNewAddress({
      type: "Home",
      street: "",
      city: "",
      country: "",
      postalCode: "",
      isPrimary: false,
    });
    setShowAddAddress(false);
  }
};

  const setPrimaryAddress = (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isPrimary: addr.id === id
    }));
    setAddresses(updatedAddresses);
  };

  const removeAddress = (id: string) => {
    if (addresses.length <= 1) return;
    
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    
    if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isPrimary)) {
      updatedAddresses[0].isPrimary = true;
    }
    
    setAddresses(updatedAddresses);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setNewAddress(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditAddress = (id: string, field: string, value: string | boolean) => {
    setAddresses(prev => 
      prev.map(addr => 
        addr.id === id ? { ...addr, [field]: value } : addr
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (userRole === "SERVICE_PROVIDER" && userId) {
        const currentAddress = addresses[0];
        const payload = {
          serviceproviderId: userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          mobileNo: userData.contactNumber?.replace("+", "") || null,
          alternateNo: userData.altContactNumber?.replace("+", "") || null,
          buildingName: currentAddress.street || "",
          street: currentAddress.street || "",
          locality: currentAddress.city || "",
          pincode: currentAddress.postalCode || null,
          currentLocation: currentAddress.city || "",
          nearbyLocation: currentAddress.city || "",
        };

        await axiosInstance.put(
          `/api/serviceproviders/update/serviceprovider/${userId}`,
          payload
        );
        await fetchServiceProviderData(userId);
      }
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
    
    if (userRole === "SERVICE_PROVIDER" && appUser?.serviceProviderId) {
      fetchServiceProviderData(appUser.serviceProviderId);
    } else if (userRole === "CUSTOMER" && appUser?.customerid) {
      fetchCustomerAddresses(appUser.customerid);
    }
  };

  const getUserIdDisplay = () => {
    if (userRole === "SERVICE_PROVIDER") {
      return appUser?.serviceProviderId || "N/A";
    } else {
      return appUser?.customerid || "N/A";
    }
  };

  // Skeleton Loading Component using the common SkeletonLoader
  const ProfileSkeleton = () => (
    <div className="w-full">
      {/* Header Skeleton */}
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

      {/* Main Content Skeleton */}
      <div className="flex justify-center w-full py-6">
        <div className="w-[85%] max-w-6xl bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-6">
            <SkeletonLoader width={120} height={24} />
          </div>

          {/* User Info Section */}
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

          {/* Contact Info Section */}
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

          {/* Address Section */}
          <div className="mb-6">
            <SkeletonLoader width={96} height={16} className="mb-4" />
            <div className="space-y-3">
              <SkeletonLoader height={80} />
              <SkeletonLoader height={80} />
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
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center w-full md:w-auto">
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  className="px-5 py-2 rounded-md font-semibold shadow-md bg-gray-500 text-white"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <Button
                  className="px-5 py-2 rounded-md font-semibold shadow-md bg-blue-600 text-white flex items-center justify-center"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <ClipLoader size={16} color="white" className="mr-2" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            ) : (
              <button
                className="px-5 py-2 rounded-md font-semibold shadow-md bg-blue-600 text-white"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
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
          </div>

          {/* User Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              User Information
            </h3>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Username
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={appUser?.nickname || userName || "User"}
                  readOnly
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Email address
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={appUser?.email || auth0User?.email || "No email available"}
                  readOnly
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
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
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
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
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
              </label>
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
                  value={userData.contactNumber || ""}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder="No contact number provided"
                  style={{ backgroundColor: isEditing ? "white" : "#f9fafb" }}
                  type="tel"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Alternative Contact Number
              </label>
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
                  value={userData.altContactNumber || ""}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder="No alternative number"
                  style={{ backgroundColor: isEditing ? "white" : "#f9fafb" }}
                  type="tel"
                />
              </div>
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
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-blue-800">Add New Address</h4>
                  <button onClick={() => setShowAddAddress(false)}>
                    <X size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Type
                    </label>
                    <select
                      name="type"
                      value={newAddress.type}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {getAvailableAddressTypes().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPrimary"
                        name="isPrimary"
                        checked={newAddress.isPrimary}
                        onChange={handleAddressInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
                        Set as primary address
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Enter street address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={newAddress.country}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Enter country"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={newAddress.postalCode}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleAddAddress}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                >
                  Add Address
                </button>
              </div>
            )}

            {addresses.length === 0 ? (
              <p className="text-gray-500 italic">No addresses saved yet</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((address, idx) => {
                  const isExpanded = idx === 0 || expandedAddressIds.includes(address.id);

                  return (
                    <div
                      key={address.id}
                      className={`border ${address.isPrimary ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} rounded-lg transition-all duration-300 overflow-hidden ${
                        isExpanded ? "p-4" : "p-3"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {isEditing ? (
                            <select
                              value={address.type}
                              onChange={(e) => handleEditAddress(address.id, 'type', e.target.value)}
                              className="font-semibold bg-transparent border-none p-0 m-0 mr-2"
                            >
                              {getAvailableAddressTypes().map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-semibold">{address.type} Address</span>
                          )}
                          {address.isPrimary && (
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isEditing && addresses.length > 1 && (
                            <>
                              {!address.isPrimary && (
                                <button
                                  onClick={() => setPrimaryAddress(address.id)}
                                  className="text-blue-600 text-sm font-medium"
                                >
                                  Set Primary
                                </button>
                              )}
                              <button
                                onClick={() => removeAddress(address.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                          {idx !== 0 && (
                            <button
                              onClick={() => toggleAddress(address.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          )}
                        </div>
                      </div>

                     {isExpanded && (
  <div className="mt-2 text-sm text-gray-700 space-y-2">
    {isEditing ? (
      <>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Street Address</label>
          <input
            type="text"
            value={address.street}
            onChange={(e) => handleEditAddress(address.id, 'street', e.target.value)}
            className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">City</label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => handleEditAddress(address.id, 'city', e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Country</label>
            <input
              type="text"
              value={address.country}
              onChange={(e) => handleEditAddress(address.id, 'country', e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
            <input
              type="text"
              value={address.postalCode}
              onChange={(e) => handleEditAddress(address.id, 'postalCode', e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </>
    ) : (
      <>
        {/* Show the full formatted address */}
        <p className="font-medium">{address.street}</p>
        <div className="text-xs text-gray-500 space-y-1">
          {address.city && <p><span className="font-semibold">City:</span> {address.city}</p>}
          {address.country && <p><span className="font-semibold">Country:</span> {address.country}</p>}
          {address.postalCode && <p><span className="font-semibold">Postal Code:</span> {address.postalCode}</p>}
          {address.rawData && (
            <>
              {/* <p><span className="font-semibold">Coordinates:</span> {address.rawData.latitude.toFixed(6)}, {address.rawData.longitude.toFixed(6)}</p>
              <p><span className="font-semibold">Place ID:</span> {address.rawData.placeId}</p> */}
            </>
          )}
        </div>
      </>
    )}
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
              
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase mb-1">
                      Profile Status
                    </span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm font-semibold text-gray-800">Active</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase mb-1">
                      Verification
                    </span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm font-semibold text-gray-800">Verified</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase mb-1">
                      Availability
                    </span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm font-semibold text-gray-800">Available</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
                    <button className="text-xs text-blue-600 font-medium hover:underline">
                      View complete status details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-4">
                <button
                  className="px-6 py-2 bg-gray-500 text-white rounded-md font-medium"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium flex items-center"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <ClipLoader size={16} color="white" className="mr-2" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
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