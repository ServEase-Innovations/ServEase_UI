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

import { AlertCircle } from "lucide-react";



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

      <div className="w-full min-h-[50vh] bg-slate-50/80">

        {/* Header Skeleton */}

        <div className="relative mt-16 overflow-hidden bg-gradient-to-br from-slate-800 via-sky-900 to-slate-900">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 0L64 32 32 64 0 32Z' fill='%23fff' fill-opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "12px 12px",
            }}
          />
          <div className="relative z-10 flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10 md:h-auto md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <SkeletonLoader variant="circular" width={80} height={80} style={{ backgroundColor: "#475569" }} />
              <div>
                <SkeletonLoader
                  width={200}
                  height={28}
                  className="mb-2"
                  style={{ backgroundColor: "#64748b" }}
                />
                <SkeletonLoader width={120} height={16} style={{ backgroundColor: "#64748b" }} />
              </div>
            </div>
            <SkeletonLoader
              width={140}
              height={40}
              className="!rounded-lg"
              style={{ backgroundColor: "#64748b" }}
            />
          </div>
        </div>

        {/* Content Skeleton */}

        <div className="flex w-full justify-center px-4 py-6 sm:px-6">

          <div className="w-full max-w-6xl rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/40 ring-1 ring-slate-900/5 sm:p-7">

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

    <div className="w-full min-h-screen bg-slate-50/80">

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

      <div className="relative mt-16 overflow-hidden bg-gradient-to-br from-sky-800 via-slate-800 to-slate-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 0L64 32 32 64 0 32Z' fill='%23fff' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "14px 14px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 py-9 sm:px-6 sm:py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-sky-400/30 to-violet-400/20 opacity-80 blur-sm" />
              <img
                src={
                  appUser?.picture ||
                  auth0User?.picture ||
                  "https://via.placeholder.com/80"
                }
                alt={userName || t("user")}
                className="relative h-20 w-20 rounded-full border-2 border-white/20 object-cover shadow-2xl ring-4 ring-white/10 sm:h-24 sm:w-24"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/90 sm:text-xs">
                {t("profile")}
              </p>
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {t("hello")}, {userName || t("user")}
              </h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-200/90">
                <span className="inline-flex max-w-full items-center rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium text-slate-100 ring-1 ring-white/10">
                  {getRoleDisplay()}
                </span>
                {userRole === "CUSTOMER" && hasMobileNumber === false && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-200/95">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {t("mobileNumberRequired")}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            {userRole === "CUSTOMER" && hasMobileNumber === false && (
              <button
                type="button"
                onClick={() => setMobileDialogOpen(true)}
                className="w-full rounded-xl border border-amber-300/40 bg-amber-500/20 px-4 py-2.5 text-sm font-semibold text-amber-100 shadow-sm backdrop-blur-sm transition hover:bg-amber-500/30 sm:w-auto"
              >
                {t("addMobileNumber")}
              </button>
            )}

            {userRole === "VENDOR" && userId && (
              <div className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-sky-100 shadow-inner backdrop-blur sm:w-auto">
                {t("vendorId")}: {userId}
              </div>
            )}
          </div>
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

      <footer className="border-t border-slate-200/90 bg-slate-50/90 py-5 text-center text-sm text-slate-500">

        © {new Date().getFullYear()} Serveaso. {t("allRightsReserved")}

      </footer>

    </div>

  );

};



export default ProfileScreen; 