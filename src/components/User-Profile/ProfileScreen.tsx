/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";
import axiosInstance from "src/services/axiosInstance";
import { ClipLoader } from "react-spinners";

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isPrimary: boolean;
}

interface UserData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  altContactNumber: string;
  role?: string;
}

// Interface for Service Provider API response
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
  // Other fields can be added as needed
}

const ProfileScreen = () => {
  const { user: auth0User, isAuthenticated } = useAuth0();

  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>("CUSTOMER");
  const [serviceProviderData, setServiceProviderData] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // User data state
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    contactNumber: "",
    altContactNumber: ""
  });
  
  // Address state
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

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      setIsLoading(true);
      const name = auth0User.name || null;
      const email = auth0User.email || "";

      // Extract role from Auth0 user metadata
      const role = 
        auth0User.role || 
        auth0User["https://yourdomain.com/roles"]?.[0] || 
        "CUSTOMER";
      
      setUserRole(role);

      if (name) {
        const nameParts = name.split(" ");
        setUserData(prev => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || ""
        }));
      }

      const id =
        auth0User.serviceProviderId ||
        auth0User["https://yourdomain.com/serviceProviderId"] ||
        auth0User.customerid ||
        null;

      setUserName(name);
      setUserId(id ? Number(id) : null);

      // Fetch service provider data if user is a service provider
      if (role === "SERVICE_PROVIDER") {
        fetchServiceProviderData();
      } else {
        // For customers, use hardcoded data (to be replaced with API call later)
        setUserData(prev => ({
          ...prev,
          contactNumber: "+1 (555) 123-4567",
          altContactNumber: "+1 (555) 987-6543"
        }));
        
        // Customers get home and work addresses
        setAddresses([
          {
            id: "1",
            type: "Home",
            street: "Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09",
            city: "New York",
            country: "United States",
            postalCode: "10001",
            isPrimary: true
          },
          {
            id: "2",
            type: "Work",
            street: "123 Business Ave, Suite 500",
            city: "New York",
            country: "United States",
            postalCode: "10002",
            isPrimary: false
          }
        ]);
        setIsLoading(false);
      }

      console.log("User data:", auth0User);
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("ID:", id);
      console.log("Role:", role);
    }
  }, [isAuthenticated, auth0User]);

  // Fetch service provider data
  const fetchServiceProviderData = async () => {
    try {
      const serviceProviderId = 
      auth0User?.serviceProviderId ||
      auth0User?.["https://yourdomain.com/serviceProviderId"] ||
      auth0User?.sub?.split("|")[1] 
      // Hardcoded ID for now - replace with dynamic ID if available
      const response = await axiosInstance.get(`/api/serviceproviders/get/serviceprovider/${serviceProviderId}`);
      const data = response.data;
      setServiceProviderData(data);
      
      // Update user data with service provider info
      setUserData(prev => ({
        ...prev,
        contactNumber: data.mobileNo ? `+${data.mobileNo}` : "",
        altContactNumber: data.alternateNo ? `+${data.alternateNo}` : "No alternative number"
      }));
      
      // Create address from service provider data
      const serviceProviderAddress: Address = {
        id: "1",
        type: "Office",
        street: `${data.buildingName || ''} ${data.street || ''} ${data.locality || ''}`.trim(),
        city: data.nearbyLocation || data.currentLocation || "",
        country: "India", // Assuming India based on pincode format
        postalCode: data.pincode ? data.pincode.toString() : "",
        isPrimary: true
      };
      
      setAddresses([serviceProviderAddress]);
    } catch (error) {
      console.error("Failed to fetch service provider data:", error);
      // Fallback to default data if API fails
      setUserData(prev => ({
        ...prev,
        contactNumber: "+1 (555) 123-4567",
        altContactNumber: "No alternative number"
      }));
      
      setAddresses([
        {
          id: "1",
          type: "Office",
          street: "123 Business Ave, Suite 500",
          city: "New York",
          country: "United States",
          postalCode: "10002",
          isPrimary: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter address types based on user role
  const getAvailableAddressTypes = () => {
    if (userRole === "SERVICE_PROVIDER") {
      return ["Office"];
    }
    return ["Home", "Work", "Other"];
  };

  const handleAddAddress = () => {
    if (newAddress.street && newAddress.city && newAddress.country && newAddress.postalCode) {
      const addressToAdd = {
        ...newAddress,
        id: Date.now().toString() // Simple ID generation
      };
      
      // If this is set as primary, unset all other primaries
      let updatedAddresses;
      if (newAddress.isPrimary) {
        updatedAddresses = addresses.map(addr => ({ ...addr, isPrimary: false }));
        updatedAddresses.push(addressToAdd);
      } else {
        updatedAddresses = [...addresses, addressToAdd];
      }
      
      setAddresses(updatedAddresses);
      setNewAddress({
        type: userRole === "SERVICE_PROVIDER" ? "Office" : "Home",
        street: "",
        city: "",
        country: "",
        postalCode: "",
        isPrimary: false
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
    // Don't allow removal if it's the only address
    if (addresses.length <= 1) return;
    
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    
    // If we removed the primary, set the first address as primary
    if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isPrimary)) {
      updatedAddresses[0].isPrimary = true;
    }
    
    setAddresses(updatedAddresses);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make a PUT request to your API
      // await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...userData,
      //     addresses
      //   })
      // });
      
      console.log("Data saved:", { ...userData, addresses });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data if needed
    setIsEditing(false);
  };

  // Loading Screen Component
  const LoadingScreen = () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white shadow-xl">
        <ClipLoader color="#0E305C" size={60} />
        <p className="mt-4 text-lg font-semibold text-gray-800">Loading your profile</p>
        <p className="mt-2 text-sm text-gray-600">Please wait while we fetch your information</p>
      </div>
    </div>
  );

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="w-full">
      {/* Header Skeleton */}
      <div
        className="relative mt-16"
        style={{
          background: "linear-gradient(rgb(177 213 232) 0%, rgb(255, 255, 255) 100%)",
          color: "rgb(14, 48, 92)",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between h-auto md:h-32 max-w-6xl px-6 mx-auto py-8 gap-4 md:gap-0">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gray-300 animate-pulse"></div>
            <div>
              <div className="h-7 w-40 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex justify-center w-full py-6">
        <div className="w-[85%] max-w-6xl bg-white rounded-lg shadow-lg p-6">
          {/* Form Header Skeleton */}
          <div className="flex justify-between items-center border-b pb-3 mb-6">
            <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
          </div>

          {/* User Info Section Skeleton */}
          <div className="mb-6">
            <div className="h-5 w-40 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-6"></div>

          {/* Contact Info Section Skeleton */}
          <div className="mb-6">
            <div className="h-5 w-40 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="h-4 w-40 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Address Section Skeleton */}
          <div className="mb-6">
            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Header */}
          <div
            className="relative mt-16"
            style={{
              background: "linear-gradient(rgb(177 213 232) 0%, rgb(255, 255, 255) 100%)",
              color: "rgb(14, 48, 92)",
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between h-auto md:h-32 max-w-6xl px-6 mx-auto py-8 gap-4 md:gap-0">
              
              {/* Profile Left Section */}
              <div className="flex items-center gap-5">
                <img
                  src={auth0User?.picture || "https://via.placeholder.com/80"}
                  alt={userName || "User"}
                  className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
                />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left" style={{ color: "rgb(14, 48, 92)" }}>
                    Hello, {userName || "User"}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {userRole === "SERVICE_PROVIDER" ? "Service Provider" : "Customer"}
                  </p>
                </div>
              </div>

              {/* Edit Profile Button - Now properly centered */}
              <div className="flex items-center justify-center w-full md:w-auto">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      className="px-5 py-2 rounded-md font-semibold shadow-md transition-colors"
                      style={{
                        backgroundColor: "#6c757d",
                        color: "white",
                      }}
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <Button
                      className="px-5 py-2 rounded-md font-semibold shadow-md transition-colors flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(21, 82, 162, 1)",
                        color: "white",
                      }}
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : "Save Changes"}
                    </Button>
                  </div>
                ) : (
                  <button
                    className="px-5 py-2 rounded-md font-semibold shadow-md transition-colors"
                    style={{
                      backgroundColor: "rgba(21, 82, 162, 1)",
                      color: "white",
                    }}
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
              {/* Form Header */}
              <div className="flex justify-between items-center border-b pb-3 mb-6">
                <h2 className="text-lg font-semibold text-[#32325d]">My account</h2>
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
                      value={auth0User?.nickname || userName || "User"}
                      readOnly
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Email address
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                      value={auth0User?.email || "No email available"}
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
                      value={
                        auth0User?.serviceProviderId ||
                        auth0User?.customerid ||
                        "N/A"
                      }
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
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    name="contactNumber"
                    value={userData.contactNumber}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                    type="tel"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Alternative Contact Number
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    name="altContactNumber"
                    value={userData.altContactNumber}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      fontStyle: userData.altContactNumber === "No alternative number" ? 'italic' : 'normal',
                      color: userData.altContactNumber === "No alternative number" ? '#6b7280' : 'inherit'
                    }}
                    type="tel"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-600">
                    Addresses
                  </label>
                  {isEditing && addresses.length < (userRole === "SERVICE_PROVIDER" ? 1 : 3) && (
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setShowAddAddress(!showAddAddress)}
                    >
                      {showAddAddress ? 'Cancel' : '+ Add New Address'}
                    </button>
                  )}
                </div>

                {/* Add New Address Form */}
                {showAddAddress && isEditing && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-md font-semibold mb-3">Add New Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Address Type
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={newAddress.type}
                          onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                        >
                          {getAvailableAddressTypes().map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center mt-6">
                        <input
                          type="checkbox"
                          id="isPrimary"
                          checked={newAddress.isPrimary}
                          onChange={(e) => setNewAddress({...newAddress, isPrimary: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="isPrimary" className="text-sm text-gray-600">
                          Set as primary address
                        </label>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        Street Address
                        </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                        placeholder="Enter street address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          City
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Country
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                          placeholder="Country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Postal Code
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                          placeholder="Postal code"
                          type="text"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                        onClick={handleAddAddress}
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                )}

                {/* Address List */}
                {addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold">{address.type} Address</span>
                        {address.isPrimary && (
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex space-x-2">
                          {!address.isPrimary && (
                            <>
                              <button 
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                onClick={() => setPrimaryAddress(address.id)}
                              >
                                Set Primary
                              </button>
                              {userRole !== "SERVICE_PROVIDER" && (
                                <button 
                                  className="text-red-600 hover:text-red-800 text-sm"
                                  onClick={() => removeAddress(address.id)}
                                >
                                  Remove
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700">{address.street}</p>
                    <p className="text-gray-700">
                      {address.city}, {address.country} {address.postalCode}
                    </p>
                  </div>
                ))}
                
              
              </div>

              {/* Submit Button - Only show when editing */}
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
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 py-4 text-center text-gray-500 text-sm">
            © 2025 MyApp. All rights reserved.
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileScreen;