/* eslint-disable */

import React, { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import providerInstance from "src/services/providerInstance";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import { useLanguage } from "src/context/LanguageContext";
 // Import the language hook

interface VendorProfileSectionProps {
  userId: number | null;
  userEmail: string | null;
}

interface VendorData {
  vendorId: string;
  address: string;
  companyName: string;
  createdDate: string;
  emailid: string;
  isActive: boolean;
  phoneNo: string;
  registrationId: string;
  providers: any[];
}

const VendorProfileSection: React.FC<VendorProfileSectionProps> = ({
  userId,
  userEmail,
}) => {
  const { t } = useLanguage(); // Initialize the translation hook
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await providerInstance.get(`/api/vendor/${userId}`);
        
        if (response.data?.status === 200 && response.data?.data) {
          setVendorData(response.data.data);
          setError(null);
        } else {
          setError(t("fetchFailed"));
        }
      } catch (err) {
        console.error("Error fetching vendor data:", err);
        setError(t("unableToLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [userId, t]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/30 ring-1 ring-slate-900/5 sm:p-7">
          <SkeletonLoader width={200} height={28} className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <SkeletonLoader width={100} height={16} />
                <SkeletonLoader width="100%" height={20} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendorData) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/20 ring-1 ring-slate-900/5">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("vendorInfoUnavailable")}
          </h3>
          <p className="text-gray-500">
            {error || t("unableToLoadVendorDetails")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Company Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/25 ring-1 ring-slate-900/5 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
              <Building2 className="h-5 w-5 text-sky-600" />
              {t("profileContactInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("emailAddress")}
                </p>
                <p className="text-gray-800 font-medium">{vendorData.emailid}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t("phoneNumber")}
                </p>
                <p className="text-gray-800 font-medium">{vendorData.phoneNo || t("notProvided")}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t("businessAddress")}
                </p>
                <p className="text-gray-800 font-medium">{vendorData.address || t("notProvided")}</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/25 ring-1 ring-slate-900/5 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
              <Building2 className="h-5 w-5 text-sky-600" />
              {t("businessDetails")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  {t("vendorId")}
                </p>
                <p className="text-gray-800 font-medium font-mono">
                  {vendorData.vendorId}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("registeredSince")}
                </p>
                <p className="text-gray-800 font-medium">
                  {formatDate(vendorData.createdDate)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t("associatedProviders")}
                </p>
                <p className="text-gray-800 font-medium">
                  {vendorData.providers?.length || 0} {t("providers")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/25 ring-1 ring-slate-900/5 sm:p-6">
            <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-900">{t("quickActions")}</h3>
            <div className="space-y-2.5">
              <button type="button" className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700">
                {t("manageProviders")}
              </button>
              <button type="button" className="w-full rounded-xl border-2 border-sky-200 bg-sky-50/50 px-4 py-2.5 text-sm font-semibold text-sky-800 transition hover:bg-sky-100/80">
                {t("viewAnalytics")}
              </button>
              <button type="button" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                {t("editProfile")}
              </button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/25 ring-1 ring-slate-900/5 sm:p-6">
            <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-900">{t("summary")}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("accountStatus")}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vendorData.isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {vendorData.isActive ? t("active") : t("inactive")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("totalProviders")}</span>
                <span className="font-semibold">{vendorData.providers?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("registrationId")}</span>
                <span className="font-mono text-sm">{vendorData.registrationId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfileSection;