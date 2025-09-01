/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";

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
}

const ProfileScreen = () => {
  const { user: auth0User, isAuthenticated } = useAuth0();

  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    contactNumber: "+1 (555) 123-4567",
    altContactNumber: "+1 (555) 987-6543"
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
      const name = auth0User.name || null;
      const email = auth0User.email || "";

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

      // Mock initial addresses - in a real app, this would come from an API
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

      console.log("User data:", auth0User);
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("ID:", id);
    }
  }, [isAuthenticated, auth0User]);

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
        type: "Home",
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

  return (
    <div className="w-full">
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
            <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left" style={{ color: "rgb(14, 48, 92)" }}>
              Hello, {userName || "User"}
            </h1>
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
                  User ID
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
                style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
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
              {isEditing && (
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
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
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
                          <button 
                            className="text-red-600 hover:text-red-800 text-sm"
                            onClick={() => removeAddress(address.id)}
                          >
                            Remove
                          </button>
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
    </div>
  );
};

export default ProfileScreen;