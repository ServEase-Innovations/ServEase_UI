/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";

const ProfileScreen = () => {
  const { user: auth0User, isAuthenticated } = useAuth0();

  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      const name = auth0User.name || null;
      const email = auth0User.email || "";

      if (name) {
        const nameParts = name.split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
      }

      const id =
        auth0User.serviceProviderId ||
        auth0User["https://yourdomain.com/serviceProviderId"] ||
        auth0User.customerid ||
        null;

      setUserName(name);
      setUserId(id ? Number(id) : null);

      console.log("User data:", auth0User);
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("ID:", id);
    }
  }, [isAuthenticated, auth0User]);

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
    src={auth0User?.picture || "https://via.placeholder.com/80"} // fallback if no picture
    alt={userName || "User"}
    className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
  />
      <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left" style={{ color: "rgb(14, 48, 92)" }}>
        Hello,{userName || "User"}
      </h1>
    </div>

    {/* Edit Profile Button */}
    <button
      className="px-5 py-2 rounded-md font-semibold shadow-md transition-colors w-full md:w-auto text-center"
      style={{
        backgroundColor: "rgba(21, 82, 162, 1)",
        color: "white",
      }}
    >
      Edit Profile
    </button>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={auth0User?.nickname || userName || "User"}
                  readOnly
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Email address
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                  value={firstName}
                  readOnly
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Last name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={lastName}
                  readOnly
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  User ID
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                value="+1 (555) 123-4567"
                type="tel"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Alternative Contact Number
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value="+1 (555) 987-6543"
                type="tel"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Address
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value="Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09"
              readOnly
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                City
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value="New York"
                readOnly
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Country
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value="United States"
                readOnly
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Postal Code
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Postal code"
                type="number"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center mt-6">
            <Button >
              Submit
            </Button>
          </div>
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
