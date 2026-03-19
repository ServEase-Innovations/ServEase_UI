// ProfileScreen.tsx (updated section)
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppUser } from "src/context/AppUserContext";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import MobileNumberDialog from "../User-Profile/MobileNumberDialog";
import providerInstance from "src/services/providerInstance";

// Import sections
import CustomerProfileSection from "./CustomerProfileSection";
import ServiceProviderProfileSection from "./ServiceProviderProfileSection";
import VendorProfileSection from "./VendorProfileSection";
const ProfileScreen = () => {
  const { user: auth0User, isAuthenticated } = useAuth0();
  const { appUser } = useAppUser();

  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<"CUSTOMER" | "SERVICE_PROVIDER" | "VENDOR">("CUSTOMER");
  const [isLoading, setIsLoading] = useState(true);
  const [dialogShownInSession, setDialogShownInSession] = useState(false);
  const [hasMobileNumber, setHasMobileNumber] = useState<boolean | null>(null);

  const checkMobileNumber = async (customerId: number) => {
    try {
      const response = await providerInstance.get(`/api/customer/${customerId}`);
      const mobileExists = !!response.data?.data?.mobileno;
      setHasMobileNumber(mobileExists);

      if (!mobileExists && !dialogShownInSession) {
        setTimeout(() => {
          setMobileDialogOpen(true);
          setDialogShownInSession(true);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      setIsLoading(true);

      if (isAuthenticated && appUser) {
        const name = appUser.name || null;
        const email = appUser.email || auth0User?.email || null;
        const role = (appUser.role as "CUSTOMER" | "SERVICE_PROVIDER" | "VENDOR") || "CUSTOMER";

        setUserRole(role);
        setUserName(name);
        setUserEmail(email);

        let id = null;
        if (role === "SERVICE_PROVIDER") {
          id = appUser.serviceProviderId;
        } else if (role === "CUSTOMER") {
          id = appUser.customerid;
        } else if (role === "VENDOR") {
          id = appUser.vendorId;
        }

        const numericId = id ? Number(id) : null;
        setUserId(numericId);

        if (role === "CUSTOMER" && numericId) {
          await checkMobileNumber(numericId);
        } else if (role === "SERVICE_PROVIDER" || role === "VENDOR") {
          setHasMobileNumber(true);
        }
      }

      setIsLoading(false);
    };

    initializeProfile();
  }, [isAuthenticated, appUser, auth0User?.email, dialogShownInSession]);

  const getUserIdDisplay = () => {
    if (userRole === "SERVICE_PROVIDER") {
      return appUser?.serviceProviderId || "N/A";
    } else if (userRole === "CUSTOMER") {
      return appUser?.customerid || "N/A";
    } else if (userRole === "VENDOR") {
      return appUser?.vendorId || "N/A";
    }
    return "N/A";
  };

  const getRoleDisplay = () => {
    switch (userRole) {
      case "CUSTOMER":
        return "Customer";
      case "SERVICE_PROVIDER":
        return "Service Provider";
      case "VENDOR":
        return "Vendor";
      default:
        return "User";
    }
  };

  if (isLoading) {
    return (
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
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Dialog */}
      {mobileDialogOpen && userId && userRole === "CUSTOMER" && (
        <MobileNumberDialog
          open={mobileDialogOpen}
          onClose={() => setMobileDialogOpen(false)}
          customerId={userId}
          onSuccess={() => {
            setHasMobileNumber(true);
            setMobileDialogOpen(false);
          }}
        />
      )}

      {/* Header */}
      <div className="relative mt-16 bg-gradient-to-b from-blue-100 to-white text-blue-900">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between h-auto md:h-32 max-w-6xl px-6 mx-auto py-8 gap-4 md:gap-0">
          
          <div className="flex items-center gap-5">
            <img
              src={
                appUser?.picture ||
                auth0User?.picture ||
                "https://via.placeholder.com/80"
              }
              alt={userName || "User"}
              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Hello, {userName || "User"}
              </h1>

              <p className="text-sm text-gray-600 mt-1">
                {getRoleDisplay()}
                {userRole === "CUSTOMER" && hasMobileNumber === false && (
                  <span className="ml-2 text-red-500 text-xs">
                    ⚠️ Mobile number required
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Add Mobile Button - Only for Customers */}
          {userRole === "CUSTOMER" && hasMobileNumber === false && (
            <button
              onClick={() => setMobileDialogOpen(true)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200"
            >
              Add Mobile Number
            </button>
          )}

          {/* Vendor ID Display */}
          {userRole === "VENDOR" && userId && (
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
              Vendor ID: {userId}
            </div>
          )}
        </div>
      </div>

      {/* Profile Section - Now includes Vendor */}
      {userRole === "CUSTOMER" ? (
        <CustomerProfileSection userId={userId} userEmail={userEmail} />
      ) : userRole === "SERVICE_PROVIDER" ? (
        <ServiceProviderProfileSection userId={userId} userEmail={userEmail} />
      ) : userRole === "VENDOR" ? (
        <VendorProfileSection userId={userId} userEmail={userEmail} />
      ) : null}

      {/* Footer */}
      <div className="bg-gray-100 py-4 text-center text-gray-500 text-sm">
        © 2025 MyApp. All rights reserved.
      </div>
    </div>
  );
};

export default ProfileScreen;