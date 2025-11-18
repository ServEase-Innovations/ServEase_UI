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
import MobileNumberDialog from "../User-Profile/MobileNumberDialog";

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

interface CustomerDetails {
  customerid: number;
  firstName: string;
  lastName: string;
  mobileNo: string | null;
  altMobileNo: string | null;
  email: string;
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
  const [customerData, setCustomerData] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAddressIds, setExpandedAddressIds] = useState<string[]>([]);
  const [showMobileDialog, setShowMobileDialog] = useState(false);

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

  const fetchCustomerDetails = async (customerId: number) => {
    try {
      console.log("Fetching customer details for ID:", customerId);
      const response = await axiosInstance.get(`/api/customer/get-customer-by-id/${customerId}`);
      console.log("✅ Customer details fetched successfully:", response.data);
      
      const customer = response.data;
      setCustomerData(customer);

      if (!customer?.mobileNo || customer.mobileNo === null || customer.mobileNo === "") {
        console.warn("⚠️ Customer mobile number is missing (null/empty).");
      }

      setUserData(prev => ({
        ...prev,
        contactNumber: customer.mobileNo || "",
        altContactNumber: customer.altMobileNo || ""
      }));

      return customer;
    } catch (error) {
      console.error("❌ Error fetching customer details:", error);
      return null;
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
            await fetchCustomerDetails(Number(id));
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
          .filter((loc: any) => loc.location?.address?.[0]?.formatted_address)
          .map((loc: any, idx: number) => {
            const primaryAddress = loc.location.address[0];
            const addressComponents = primaryAddress.address_components || [];
            
            const getComponent = (type: string) => {
              const component = addressComponents.find((c: any) => c.types.includes(type));
              return component?.long_name || "";
            };

            return {
              id: loc._id || idx.toString(),
              type: loc.name || "Other",
              street: primaryAddress.formatted_address,
              city: getComponent("locality") || 
                    getComponent("administrative_area_level_3") || 
                    getComponent("administrative_area_level_4") || 
                    "",
              country: getComponent("country") || "",
              postalCode: getComponent("postal_code") || "",
              isPrimary: loc.isPrimary || idx === 0,
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
          isPrimary: true,
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
          isPrimary: false,
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
          isPrimary: true,
        };
        addresses.push(serviceProviderAddress);
      }

      setAddresses(addresses);
    } catch (error) {
      console.error("Failed to fetch service provider data:", error);
    }
  };

  const hasValidMobileNumbers = () => {
    if (userRole !== "CUSTOMER") return true;
    
    return customerData?.mobileNo && 
           customerData.mobileNo !== null && 
           customerData.mobileNo !== "" &&
           customerData.mobileNo !== "null";
  };

  const formatMobileNumber = (number: string | null) => {
    if (!number || number === "null" || number === "undefined") return "Not provided";
    return number;
  };

  const getAvailableAddressTypes = () => {
    if (userRole === "SERVICE_PROVIDER") return ["Permanent", "Correspondence"];
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
                      lat: 0,
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
        const permanentAddress = addresses.find(addr => addr.type === "Permanent");
        const correspondenceAddress = addresses.find(addr => addr.type === "Correspondence");

        const payload = {
          serviceproviderId: userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          mobileNo: userData.contactNumber?.replace("+", "") || null,
          alternateNo: userData.altContactNumber?.replace("+", "") || null,
          buildingName: permanentAddress?.street || "",
          street: permanentAddress?.street || "",
          locality: permanentAddress?.city || "",
          pincode: permanentAddress?.postalCode || null,
          currentLocation: permanentAddress?.city || "",
          nearbyLocation: permanentAddress?.city || "",
          permanentAddress: permanentAddress ? {
            field1: permanentAddress.street.split(' ')[0] || "",
            field2: permanentAddress.street || "",
            ctArea: permanentAddress.city || "",
            pinNo: permanentAddress.postalCode || "",
            state: "West Bengal",
            country: permanentAddress.country || "India"
          } : null,
          correspondenceAddress: correspondenceAddress ? {
            field1: correspondenceAddress.street.split(' ')[0] || "",
            field2: correspondenceAddress.street || "",
            ctArea: correspondenceAddress.city || "",
            pinNo: correspondenceAddress.postalCode || "",
            state: "West Bengal",
            country: correspondenceAddress.country || "India"
          } : null
        };

        await axiosInstance.put(
          `/api/serviceproviders/update/serviceprovider/${userId}`,
          payload
        );
        await fetchServiceProviderData(userId);
      } else if (userRole === "CUSTOMER" && userId) {
        const payload = {
          customerid: userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          mobileNo: userData.contactNumber?.replace("+", "") || null,
          altMobileNo: userData.altContactNumber?.replace("+", "") || null,
          email: appUser?.email || auth0User?.email || "",
        };

        await axiosInstance.put(
          `/api/customer/update-customer/${userId}`,
          payload
        );
        
        await fetchCustomerDetails(userId);
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
      fetchCustomerDetails(appUser.customerid);
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
      {/* Fixed MobileNumberDialog - removed internal open state management */}
      <MobileNumberDialog 
        open={showMobileDialog}
        onClose={() => setShowMobileDialog(false)}
        customerId={userId || 0}
        onSuccess={() => {
          setShowMobileDialog(false);
          if (userId) {
            fetchCustomerDetails(userId);
          }
        }}
      />

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
                {userRole === "CUSTOMER" && !hasValidMobileNumbers() && (
                  <span className="ml-2 text-red-500 text-xs">⚠️ Mobile number required</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center w-full md:w-auto">
            {!isEditing && (
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
            {userRole === "CUSTOMER" && !hasValidMobileNumbers() && (
              <button
                onClick={() => setShowMobileDialog(true)}
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
                {userRole === "CUSTOMER" && (
                  <span className={`ml-1 ${!hasValidMobileNumbers() ? 'text-red-500' : 'text-green-500'}`}>
                    {!hasValidMobileNumbers() ? '⚠️' : '✓'}
                  </span>
                )}
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
                  value={formatMobileNumber(userData.contactNumber)}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder="No contact number provided"
                  style={{ 
                    backgroundColor: isEditing ? "white" : "#f9fafb",
                    borderColor: !hasValidMobileNumbers() && userRole === "CUSTOMER" ? "#ef4444" : "#d1d5db"
                  }}
                  type="tel"
                />
              </div>
              {userRole === "CUSTOMER" && !hasValidMobileNumbers() && (
                <p className="text-red-500 text-xs mt-1">
                  Mobile number is required for bookings and notifications
                </p>
              )}
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
                  value={formatMobileNumber(userData.altContactNumber)}
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
                <h4 className="font-medium text-gray-700 mb-3">Add New Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    name="type"
                    value={newAddress.type}
                    onChange={handleAddressInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {getAvailableAddressTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPrimary"
                      checked={newAddress.isPrimary}
                      onChange={handleAddressInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-600">Set as primary address</label>
                  </div>
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={handleAddressInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm md:col-span-2"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={handleAddressInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={handleAddressInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={newAddress.postalCode}
                    onChange={handleAddressInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => setShowAddAddress(false)}
                    className="px-3 py-1 text-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAddress}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Add Address
                  </button>
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
                      className={`border ${address.isPrimary ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} rounded-lg transition-all duration-300 overflow-hidden p-4`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{address.type}</span>
                          {address.isPrimary && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Primary</span>
                          )}
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

                        {isEditing && (
                          <div className="mt-3 space-y-2">
                            {!address.isPrimary && (
                              <button
                                onClick={() => setPrimaryAddress(address.id)}
                                className="text-blue-600 text-sm hover:text-blue-800"
                              >
                                Set as Primary
                              </button>
                            )}
                            {userRole === "SERVICE_PROVIDER" && (
                              <div className="text-xs text-gray-500 mt-2">
                                Service provider addresses are managed separately
                              </div>
                            )}
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
                <button
                  className="px-6 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px]"
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