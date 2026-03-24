/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";

import { useAuth0 } from "@auth0/auth0-react";

import { useAppUser } from "src/context/AppUserContext";

import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";

import MobileNumberDialog from "../User-Profile/MobileNumberDialog";

import providerInstance from "src/services/providerInstance";



// Import sections

import CustomerProfileSection from "./CustomerProfileSection";

import ServiceProviderProfileSection from "./ServiceProviderProfileSection";

import VendorProfileSection from "./VendorProfileSection";

import { useLanguage } from "src/context/LanguageContext";



const ProfileScreen = () => {

  const { t } = useLanguage();

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



  // FIX 1: Wrap checkMobileNumber with useCallback

  const checkMobileNumber = useCallback(async (customerId: number) => {

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

  }, [dialogShownInSession]); // dialogShownInSession is now a dependency



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

    // FIX 2: Add checkMobileNumber to dependencies, remove dialogShownInSession

  }, [isAuthenticated, appUser, auth0User?.email, checkMobileNumber]);



  // FIX 3: Remove unused function getUserIdDisplay

  // const getUserIdDisplay = () => { ... }; // DELETED - not used anywhere



  const getRoleDisplay = () => {

    switch (userRole) {

      case "CUSTOMER":

        return t('customer');

      case "SERVICE_PROVIDER":

        return t('serviceProvider');

      case "VENDOR":

        return t('vendor');

      default:

        return t('user');

    }

  };



  // Loading skeleton for the entire profile

  if (isLoading) {

    return (

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



        {/* Content Skeleton */}

        <div className="flex justify-center w-full py-6">

          <div className="w-[85%] max-w-6xl bg-white rounded-lg shadow-lg p-6">

            {/* Header with edit button skeleton */}

            <div className="flex justify-between items-center border-b pb-3 mb-6">

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

              <div className="flex flex-wrap gap-4 mb-6">

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

              <div className="flex flex-wrap gap-4 mb-6">

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



            {/* Footer Skeleton */}

            <div className="bg-gray-100 py-4 text-center">

              <SkeletonLoader width={200} height={16} className="mx-auto" />

            </div>

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

             <div className="p-[3px] rounded-full bg-blue-500">
              <img
                src={
                  appUser?.picture ||
                  auth0User?.picture ||
                  "https://via.placeholder.com/80"
                }
                alt={userName || t("user")}
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold">

                {t('hello')}, {userName || t('user')}

              </h1>



              <p className="text-sm text-gray-600 mt-1">

                {getRoleDisplay()}

                {userRole === "CUSTOMER" && hasMobileNumber === false && (

                  <span className="ml-2 text-red-500 text-xs">

                    ⚠️ {t('mobileNumberRequired')}

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

              {t('addMobileNumber')}

            </button>

          )}



          {/* Vendor ID Display */}

          {userRole === "VENDOR" && userId && (

            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">

              {t('vendorId')}: {userId}

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

        © 2025 MyApp. {t('allRightsReserved')}

      </div>

    </div>

  );

};



export default ProfileScreen; 