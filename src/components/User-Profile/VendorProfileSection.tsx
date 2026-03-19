// VendorProfileSection.tsx
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
          setError("Failed to fetch vendor data");
        }
      } catch (err) {
        console.error("Error fetching vendor data:", err);
        setError("Unable to load vendor information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Vendor Information Unavailable
          </h3>
          <p className="text-gray-500">
            {error || "Unable to load vendor details. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Company Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-full">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{vendorData.companyName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-blue-100">Registration ID:</span>
              <span className="font-mono bg-white/30 px-2 py-1 rounded text-sm">
                {vendorData.registrationId}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              vendorData.isActive 
                ? "bg-green-500/20 text-green-100" 
                : "bg-red-500/20 text-red-100"
            }`}>
              {vendorData.isActive ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </p>
                <p className="text-gray-800 font-medium">{vendorData.emailid}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </p>
                <p className="text-gray-800 font-medium">{vendorData.phoneNo || "Not provided"}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Business Address
                </p>
                <p className="text-gray-800 font-medium">{vendorData.address || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Business Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Vendor ID
                </p>
                <p className="text-gray-800 font-medium font-mono">
                  {vendorData.vendorId}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Registered Since
                </p>
                <p className="text-gray-800 font-medium">
                  {formatDate(vendorData.createdDate)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Associated Providers
                </p>
                <p className="text-gray-800 font-medium">
                  {vendorData.providers?.length || 0} providers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Manage Providers
              </button>
              <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                View Analytics
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vendorData.isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {vendorData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Providers</span>
                <span className="font-semibold">{vendorData.providers?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Registration ID</span>
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