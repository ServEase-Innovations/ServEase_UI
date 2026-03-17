/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "../Button/button";
import { ClipLoader } from "react-spinners";
import { 
  Edit3, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Star, 
  CheckCircle, 
  XCircle,
  User,
  Briefcase,
  Home,
  Globe,
  Languages,
  Utensils,
  ChefHat,
  Sparkles,
  Clock
} from "lucide-react";
import providerInstance from "src/services/providerInstance";

interface ServiceProviderProfileSectionProps {
  userId: number | null;
  userEmail: string | null;
}

interface ServiceProviderData {
  serviceproviderid: string;
  dob: string;
  kyc: any | null;
  age: number | null;
  alternateNo: string;
  buildingName: string;
  cookingSpeciality: string;
  currentLocation: string;
  diet: string;
  timeslot: string | null;
  languageKnown: string[] | string | null;
  emailId: string;
  enrolleddate: string;
  experience: number;
  firstName: string;
  gender: string;
  housekeepingRole: string;
  lastName: string;
  latitude: number;
  locality: string;
  location: string;
  longitude: number;
  middleName: string;
  mobileNo: string;
  nearbyLocation: string;
  pincode: number;
  rating: number;
  isactive: boolean;
  street: string;
  keyFacts: boolean;
  correspondenceAddress: {
    id: string;
    country: string;
    ctarea: string;
    field1: string;
    field2: string;
    pinno: string;
    state: string;
  };
  permanentAddress: {
    id: string;
    country: string;
    ctarea: string;
    field1: string;
    field2: string;
    pinno: string;
    state: string;
  };
}

const ServiceProviderProfileSection: React.FC<ServiceProviderProfileSectionProps> = ({ userId, userEmail }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [providerData, setProviderData] = useState<ServiceProviderData | null>(null);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    contactNumber: "",
    altContactNumber: "",
    gender: "",
    dob: "",
    diet: "",
    cookingSpeciality: "",
    housekeepingRole: "",
    experience: 0,
    languageKnown: "",
    currentLocation: "",
    locality: "",
    street: "",
    buildingName: "",
    pincode: "",
    nearbyLocation: ""
  });
  const [originalData, setOriginalData] = useState({ ...userData });

  useEffect(() => {
    if (userId) {
      fetchServiceProviderData();
    }
  }, [userId]);

  const fetchServiceProviderData = async () => {
    setIsLoading(true);
    try {
      const response = await providerInstance.get(`/api/service-providers/serviceprovider/${userId}`);
      const data = response.data.data;
      
      console.log("Provider data:", data);
      setProviderData(data);

      let languageKnown = data.languageKnown;
      if (Array.isArray(languageKnown)) {
        languageKnown = languageKnown.join(", ");
      }

      const updatedUserData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        middleName: data.middleName || "",
        email: data.emailId || userEmail || "",
        contactNumber: data.mobileNo || "",
        altContactNumber: data.alternateNo || "",
        gender: data.gender || "",
        dob: data.dob ? new Date(data.dob).toLocaleDateString() : "",
        diet: data.diet || "",
        cookingSpeciality: data.cookingSpeciality || "",
        housekeepingRole: data.housekeepingRole || "",
        experience: data.experience || 0,
        languageKnown: languageKnown || "",
        currentLocation: data.currentLocation || "",
        locality: data.locality || "",
        street: data.street || "",
        buildingName: data.buildingName || "",
        pincode: data.pincode?.toString() || "",
        nearbyLocation: data.nearbyLocation || ""
      };

      setUserData(updatedUserData);
      setOriginalData(updatedUserData);
    } catch (error) {
      console.error("Failed to fetch service provider data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);

    try {
      const payload: any = { 
        serviceproviderId: userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        mobileNo: userData.contactNumber,
        alternateNo: userData.altContactNumber,
        gender: userData.gender,
        diet: userData.diet,
        cookingSpeciality: userData.cookingSpeciality,
        housekeepingRole: userData.housekeepingRole,
        experience: userData.experience,
        languageKnown: userData.languageKnown,
        currentLocation: userData.currentLocation,
        locality: userData.locality,
        street: userData.street,
        buildingName: userData.buildingName,
        pincode: parseInt(userData.pincode) || 0,
        nearbyLocation: userData.nearbyLocation
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === originalData[key as keyof typeof originalData]) {
          delete payload[key];
        }
      });

      if (Object.keys(payload).length > 1) {
        await providerInstance.put(`/api/service-providers/update/serviceprovider/${userId}`, payload);
        await fetchServiceProviderData();
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
    setUserData(originalData);
    setIsEditing(false);
  };

  // InfoRow component for displaying data
  const InfoRow = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
    <div className="flex flex-col space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </div>
      <span className="text-sm text-gray-900 font-medium">{value || "Not specified"}</span>
    </div>
  );

  // EditableField component for edit mode
  const EditableField = ({ 
    label, 
    value, 
    onChange, 
    type = "text",
    options = [] as string[],
    icon
  }: { 
    label: string; 
    value: string | number; 
    onChange: (value: string) => void;
    type?: "text" | "select" | "number";
    options?: string[];
    icon?: React.ReactNode;
  }) => (
    <div className="flex flex-col space-y-1">
      <label className="flex items-center text-xs font-medium text-gray-600 uppercase tracking-wide">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </label>
      {type === "select" ? (
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
    </div>
  );

  // Section Header component
  const SectionHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
      <div className="p-2 bg-blue-50 rounded-lg mr-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <ClipLoader size={48} color="#3b82f6" />
          <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-8 px-4">
      <div className="w-full max-w-5xl">
        {/* Profile Header Card */}
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Service Provider Profile</h2>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                providerData?.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {providerData?.isactive ? (
                  <><CheckCircle size={12} className="mr-1" /> Active</>
                ) : (
                  <><XCircle size={12} className="mr-1" /> Inactive</>
                )}
              </span>
              {providerData?.rating ? (
                <span className="ml-2 flex items-center text-sm text-yellow-600">
                  <Star size={14} className="fill-current" /> {providerData.rating}
                </span>
              ) : null}
            </div>
          </div>
          {!isEditing && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md text-sm font-medium"
              onClick={() => {
                setOriginalData(userData);
                setIsEditing(true);
              }}
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          )}
        </div>


        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Personal Information Section */}
          <div className="mb-8">
            <SectionHeader title="Personal Information" icon={<User size={18} className="text-blue-600" />} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isEditing ? (
                // Edit Mode
                <>
                  <EditableField
                    label="First Name"
                    value={userData.firstName}
                    onChange={(value) => setUserData(prev => ({ ...prev, firstName: value }))}
                    icon={<User size={14} />}
                  />
                  <EditableField
                    label="Middle Name"
                    value={userData.middleName}
                    onChange={(value) => setUserData(prev => ({ ...prev, middleName: value }))}
                    icon={<User size={14} />}
                  />
                  <EditableField
                    label="Last Name"
                    value={userData.lastName}
                    onChange={(value) => setUserData(prev => ({ ...prev, lastName: value }))}
                    icon={<User size={14} />}
                  />
                  <EditableField
                    label="Email"
                    value={userData.email}
                    onChange={(value) => setUserData(prev => ({ ...prev, email: value }))}
                    icon={<Mail size={14} />}
                  />
                  <EditableField
                    label="Mobile Number"
                    value={userData.contactNumber}
                    onChange={(value) => setUserData(prev => ({ ...prev, contactNumber: value }))}
                    icon={<Phone size={14} />}
                  />
                  <EditableField
                    label="Alternate Number"
                    value={userData.altContactNumber}
                    onChange={(value) => setUserData(prev => ({ ...prev, altContactNumber: value }))}
                    icon={<Phone size={14} />}
                  />
                  <EditableField
                    label="Gender"
                    value={userData.gender}
                    onChange={(value) => setUserData(prev => ({ ...prev, gender: value }))}
                    type="select"
                    options={["MALE", "FEMALE", "OTHER"]}
                    icon={<User size={14} />}
                  />
                  <InfoRow label="Date of Birth" value={userData.dob} icon={<Calendar size={14} />} />
                </>
              ) : (
                // View Mode
                <>
                  <InfoRow label="First Name" value={userData.firstName} icon={<User size={14} />} />
                  <InfoRow label="Middle Name" value={userData.middleName} icon={<User size={14} />} />
                  <InfoRow label="Last Name" value={userData.lastName} icon={<User size={14} />} />
                  <InfoRow label="Email" value={userData.email} icon={<Mail size={14} />} />
                  <InfoRow label="Mobile Number" value={userData.contactNumber} icon={<Phone size={14} />} />
                  <InfoRow label="Alternate Number" value={userData.altContactNumber} icon={<Phone size={14} />} />
                  <InfoRow label="Gender" value={userData.gender} icon={<User size={14} />} />
                  <InfoRow label="Date of Birth" value={userData.dob} icon={<Calendar size={14} />} />
                </>
              )}
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="mb-8">
            <SectionHeader title="Professional Information" icon={<Briefcase size={18} className="text-blue-600" />} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isEditing ? (
                // Edit Mode
                <>
                  <EditableField
                    label="Role"
                    value={userData.housekeepingRole}
                    onChange={(value) => setUserData(prev => ({ ...prev, housekeepingRole: value }))}
                    type="select"
                    options={["COOK", "CLEANER", "BOTH"]}
                    icon={<Briefcase size={14} />}
                  />
                  <EditableField
                    label="Diet Preference"
                    value={userData.diet}
                    onChange={(value) => setUserData(prev => ({ ...prev, diet: value }))}
                    type="select"
                    options={["VEG", "NON_VEG", "EGG"]}
                    icon={<Utensils size={14} />}
                  />
                  <EditableField
                    label="Cooking Speciality"
                    value={userData.cookingSpeciality}
                    onChange={(value) => setUserData(prev => ({ ...prev, cookingSpeciality: value }))}
                    type="select"
                    options={["VEG", "NON_VEG", "BOTH", "SPECIAL"]}
                    icon={<ChefHat size={14} />}
                  />
                  <EditableField
                    label="Experience (years)"
                    value={userData.experience}
                    onChange={(value) => setUserData(prev => ({ ...prev, experience: parseInt(value) || 0 }))}
                    type="number"
                    icon={<Clock size={14} />}
                  />
                  <EditableField
                    label="Languages Known"
                    value={userData.languageKnown}
                    onChange={(value) => setUserData(prev => ({ ...prev, languageKnown: value }))}
                    icon={<Languages size={14} />}
                  />
                </>
              ) : (
                // View Mode
                <>
                  <InfoRow label="Role" value={userData.housekeepingRole} icon={<Briefcase size={14} />} />
                  <InfoRow label="Diet Preference" value={userData.diet} icon={<Utensils size={14} />} />
                  <InfoRow label="Cooking Speciality" value={userData.cookingSpeciality} icon={<ChefHat size={14} />} />
                  <InfoRow label="Experience" value={`${userData.experience} years`} icon={<Clock size={14} />} />
                  <InfoRow label="Languages Known" value={userData.languageKnown} icon={<Languages size={14} />} />
                </>
              )}
            </div>
          </div>

          {/* Address Information Section */}
          <div className="mb-8">
            <SectionHeader title="Address Information" icon={<MapPin size={18} className="text-blue-600" />} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Permanent Address */}
              {providerData?.permanentAddress && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                      <Home size={16} className="text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-800">Permanent Address</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 pl-9">
                    <p>{providerData.permanentAddress.field1} {providerData.permanentAddress.field2}</p>
                    <p>{providerData.permanentAddress.ctarea}, {providerData.permanentAddress.state}</p>
                    <p>{providerData.permanentAddress.country} - {providerData.permanentAddress.pinno}</p>
                  </div>
                </div>
              )}

              {/* Correspondence Address */}
              {providerData?.correspondenceAddress && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                      <MapPin size={16} className="text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-800">Correspondence Address</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 pl-9">
                    <p>{providerData.correspondenceAddress.field1} {providerData.correspondenceAddress.field2}</p>
                    <p>{providerData.correspondenceAddress.ctarea}, {providerData.correspondenceAddress.state}</p>
                    <p>{providerData.correspondenceAddress.country} - {providerData.correspondenceAddress.pinno}</p>
                  </div>
                </div>
              )}
            </div>

          
          </div>

          {/* Additional Information Section */}
          <div className="mb-8">
            <SectionHeader title="Additional Information" icon={<Award size={18} className="text-blue-600" />} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoRow 
                label="KYC Status" 
                value={providerData?.kyc ? "Verified" : "Pending"} 
                icon={providerData?.kyc ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-yellow-500" />}
              />
              <InfoRow 
                label="Enrolled Date" 
                value={new Date(providerData?.enrolleddate || "").toLocaleDateString()} 
                icon={<Calendar size={14} />}
              />
              <InfoRow 
                label="Key Facts" 
                value={providerData?.keyFacts ? "Available" : "Not Available"} 
                icon={<Award size={14} />}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <Button 
                  onClick={handleCancel} 
                  disabled={isSaving} 
                  variant="outline"
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <><ClipLoader size={16} color="white" className="mr-2" />Saving...</>
                  ) : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderProfileSection;