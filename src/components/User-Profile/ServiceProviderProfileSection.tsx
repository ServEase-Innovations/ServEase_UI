/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
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
  Languages,
  Utensils,
  ChefHat,
  Clock,
  Heart,
  AlertCircle,
  ChevronDown,
  ChevronUp
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
  nannyCareType?: string;
  currentLocation: string;
  diet: string;
  timeslot: string | null;
  languageKnown: string[] | string | null;
  emailId: string;
  enrolleddate: string;
  experience: number;
  firstName: string;
  gender: string;
  housekeepingRole: string | string[];
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
  
  // Refs for debouncing
  const contactDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const altContactDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
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
    nannyCareType: "",
    housekeepingRole: [] as string[],
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

  // Mobile validation states
  const [contactValidation, setContactValidation] = useState({
    loading: false,
    error: '',
    isAvailable: null as boolean | null,
    formatError: false
  });
  
  const [altContactValidation, setAltContactValidation] = useState({
    loading: false,
    error: '',
    isAvailable: null as boolean | null,
    formatError: false
  });

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    professional: true,
    address: true,
    additional: true
  });

  const serviceTypes = [
    { value: "COOK", label: "Cook", icon: <ChefHat size={16} /> },
    { value: "NANNY", label: "Nanny", icon: <Heart size={16} /> },
    { value: "MAID", label: "Maid", icon: <Briefcase size={16} /> },
  ];

  const dietOptions = ["VEG", "NONVEG", "BOTH"];
  const cookingSpecialityOptions = ["VEG", "NONVEG", "BOTH"];
  
  const nannyCareOptions = [
    { value: "BABY_CARE", label: "Baby Care" },
    { value: "ELDERLY_CARE", label: "Elderly Care" },
    { value: "BOTH", label: "Both" },
  ];

  useEffect(() => {
    if (userId) {
      fetchServiceProviderData();
    }
    
    return () => {
      if (contactDebounceRef.current) clearTimeout(contactDebounceRef.current);
      if (altContactDebounceRef.current) clearTimeout(altContactDebounceRef.current);
    };
  }, [userId]);

  const validateMobileFormat = (number: string): boolean => {
    return /^[0-9]{10}$/.test(number);
  };

  const checkMobileAvailability = async (number: string, isAlternate: boolean = false): Promise<boolean> => {
    if (!number || !validateMobileFormat(number)) return false;

    const setValidation = isAlternate ? setAltContactValidation : setContactValidation;
    
    setValidation({ loading: true, error: '', isAvailable: null, formatError: false });

    try {
      const response = await providerInstance.post('/api/service-providers/check-mobile', { mobile: number });
      
      let isAvailable = true;
      if (response.data.exists !== undefined) {
        isAvailable = !response.data.exists;
      }

      setValidation({
        loading: false,
        error: isAvailable ? '' : `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered`,
        isAvailable,
        formatError: false
      });

      return isAvailable;
    } catch (error) {
      setValidation({
        loading: false,
        error: `Error checking ${isAlternate ? 'alternate' : 'mobile'} number`,
        isAvailable: false,
        formatError: false
      });
      return false;
    }
  };

  const fetchServiceProviderData = async () => {
    setIsLoading(true);
    try {
      const response = await providerInstance.get(`/api/service-providers/serviceprovider/${userId}`);
      const data = response.data.data;
      
      setProviderData(data);

      let languageKnown = data.languageKnown;
      if (Array.isArray(languageKnown)) {
        languageKnown = languageKnown.join(", ");
      }

      // Parse housekeepingRole
      let roles: string[] = [];
      if (typeof data.housekeepingRole === 'string') {
        if (data.housekeepingRole.includes(',')) {
          roles = data.housekeepingRole.split(',').map((r: string) => r.trim());
        } else {
          roles = [data.housekeepingRole];
        }
      } else if (Array.isArray(data.housekeepingRole)) {
        roles = data.housekeepingRole;
      }

      const updatedUserData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        middleName: data.middleName || "",
        email: data.emailId || userEmail || "",
        contactNumber: data.mobileNo || "",
        altContactNumber: data.alternateNo && data.alternateNo !== "0" ? data.alternateNo : "",
        gender: data.gender || "",
        dob: data.dob ? new Date(data.dob).toLocaleDateString() : "",
        diet: data.diet || "",
        cookingSpeciality: data.cookingSpeciality || "",
        nannyCareType: data.nannyCareType || "",
        housekeepingRole: roles,
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
      
      setContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
      setAltContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
      
    } catch (error) {
      console.error("Failed to fetch service provider data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUserData(prev => ({ ...prev, contactNumber: value }));

    setContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });

    if (value.length === 10) {
      setTimeout(() => checkMobileAvailability(value, false), 800);
    } else if (value) {
      setContactValidation({
        loading: false,
        error: 'Please enter a valid 10-digit mobile number',
        isAvailable: null,
        formatError: true
      });
    }
  };

  const handleAltContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUserData(prev => ({ ...prev, altContactNumber: value }));

    setAltContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });

    if (value.length === 10) {
      if (value === userData.contactNumber) {
        setAltContactValidation({
          loading: false,
          error: 'Alternate number cannot be same as contact number',
          isAvailable: false,
          formatError: false
        });
      } else {
        setTimeout(() => checkMobileAvailability(value, true), 800);
      }
    } else if (value) {
      setAltContactValidation({
        loading: false,
        error: 'Please enter a valid 10-digit mobile number',
        isAvailable: null,
        formatError: true
      });
    }
  };

  const handleRoleToggle = (role: string) => {
    setUserData(prev => ({
      ...prev,
      housekeepingRole: prev.housekeepingRole.includes(role)
        ? prev.housekeepingRole.filter(r => r !== role)
        : [...prev.housekeepingRole, role]
    }));
  };

  // 🔥 FIXED: Optimized handleSave function - sends only changed fields
  const handleSave = async () => {
    if (!userId) return;

    // Validate mobile numbers
    if (userData.contactNumber && !validateMobileFormat(userData.contactNumber)) {
      alert("Please enter a valid 10-digit contact number");
      return;
    }

    if (userData.altContactNumber && !validateMobileFormat(userData.altContactNumber)) {
      alert("Please enter a valid 10-digit alternate contact number");
      return;
    }

    if (
      userData.contactNumber &&
      userData.altContactNumber &&
      userData.contactNumber === userData.altContactNumber
    ) {
      alert("Contact number and alternate contact number must be different");
      return;
    }

    setIsSaving(true);

    try {
      const payload: any = {};

      // 🔥 Compare field by field and add ONLY changed ones
      if (userData.contactNumber !== originalData.contactNumber) {
        payload.mobileNo = userData.contactNumber;
      }

      if (userData.altContactNumber !== originalData.altContactNumber) {
        payload.alternateNo = userData.altContactNumber || null;
      }

      if (userData.gender !== originalData.gender) {
        payload.gender = userData.gender;
      }

      if (userData.diet !== originalData.diet) {
        payload.diet = userData.diet;
      }

      if (userData.cookingSpeciality !== originalData.cookingSpeciality) {
        payload.cookingSpeciality = userData.cookingSpeciality;
      }

      if (userData.nannyCareType !== originalData.nannyCareType) {
        payload.nannyCareType = userData.nannyCareType;
      }

      if (
        userData.housekeepingRole.join(",") !==
        originalData.housekeepingRole.join(",")
      ) {
        payload.housekeepingRole = userData.housekeepingRole.join(",");
      }

      if (userData.experience !== originalData.experience) {
        payload.experience = userData.experience;
      }

      if (userData.languageKnown !== originalData.languageKnown) {
        payload.languageKnown = userData.languageKnown;
      }

      if (userData.currentLocation !== originalData.currentLocation) {
        payload.currentLocation = userData.currentLocation;
      }

      if (userData.locality !== originalData.locality) {
        payload.locality = userData.locality;
      }

      if (userData.street !== originalData.street) {
        payload.street = userData.street;
      }

      if (userData.buildingName !== originalData.buildingName) {
        payload.buildingName = userData.buildingName;
      }

      if (userData.pincode !== originalData.pincode) {
        payload.pincode = parseInt(userData.pincode) || 0;
      }

      if (userData.nearbyLocation !== originalData.nearbyLocation) {
        payload.nearbyLocation = userData.nearbyLocation;
      }

      // ✅ If nothing changed, skip API
      if (Object.keys(payload).length === 0) {
        alert("No changes detected");
        setIsEditing(false);
        return;
      }

      // ✅ CORRECT API endpoint
      await providerInstance.put(
        `/api/service-providers/serviceprovider/${userId}`,
        payload
      );

      await fetchServiceProviderData();
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
    setContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
    setAltContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasChanges = (): boolean => {
    return JSON.stringify(userData) !== JSON.stringify(originalData);
  };

  const isFormValid = (): boolean => {
    if (userData.contactNumber && !validateMobileFormat(userData.contactNumber)) return false;
    if (userData.altContactNumber && !validateMobileFormat(userData.altContactNumber)) return false;
    if (userData.contactNumber && userData.altContactNumber && 
        userData.contactNumber === userData.altContactNumber) return false;
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <ClipLoader size={40} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-6">
      <div className="w-[85%] max-w-6xl bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
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
                setOriginalData({ ...userData });
                setIsEditing(true);
              }}
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Personal Information Section */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('personal')}
          >
            <div className="flex items-center">
              <User size={18} className="text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Personal Information
              </h3>
            </div>
            {expandedSections.personal ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.personal && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  First name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.firstName}
                  onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Middle name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.middleName}
                  onChange={(e) => setUserData(prev => ({ ...prev, middleName: e.target.value }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Last name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.lastName}
                  onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Email address
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={userData.email}
                  readOnly
                  style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Contact Number
                </label>
                <div className="relative">
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.contactNumber}
                    onChange={handleContactNumberChange}
                    readOnly={!isEditing}
                    placeholder="Enter 10-digit number"
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      borderColor: contactValidation.error ? '#ef4444' : '#d1d5db'
                    }}
                    maxLength={10}
                  />
                  {isEditing && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      {contactValidation.loading && <ClipLoader size={16} color="#3b82f6" />}
                      {contactValidation.isAvailable && !contactValidation.loading && <CheckCircle size={16} className="text-green-500" />}
                      {contactValidation.isAvailable === false && !contactValidation.loading && <AlertCircle size={16} className="text-red-500" />}
                    </div>
                  )}
                </div>
                {contactValidation.error && (
                  <p className="text-red-500 text-xs mt-1">{contactValidation.error}</p>
                )}
              </div>

              {/* Alternate Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Alternate Number
                </label>
                <div className="relative">
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.altContactNumber}
                    onChange={handleAltContactNumberChange}
                    readOnly={!isEditing}
                    placeholder="Enter 10-digit number"
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      borderColor: altContactValidation.error ? '#ef4444' : '#d1d5db'
                    }}
                    maxLength={10}
                  />
                  {isEditing && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      {altContactValidation.loading && <ClipLoader size={16} color="#3b82f6" />}
                      {altContactValidation.isAvailable && !altContactValidation.loading && <CheckCircle size={16} className="text-green-500" />}
                      {altContactValidation.isAvailable === false && !altContactValidation.loading && <AlertCircle size={16} className="text-red-500" />}
                    </div>
                  )}
                </div>
                {altContactValidation.error && (
                  <p className="text-red-500 text-xs mt-1">{altContactValidation.error}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    value={userData.gender}
                    onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                ) : (
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                    value={userData.gender || "Not specified"}
                    readOnly
                    style={{ backgroundColor: '#f9fafb' }}
                  />
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Date of Birth
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={userData.dob || "Not specified"}
                  readOnly
                  style={{ backgroundColor: '#f9fafb' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gray-200 my-4" />

        {/* Professional Information Section */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('professional')}
          >
            <div className="flex items-center">
              <Briefcase size={18} className="text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Professional Information
              </h3>
            </div>
            {expandedSections.professional ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.professional && (
            <div className="space-y-4">
              {/* Service Types */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-3">
                  Service Types
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {serviceTypes.map(service => (
                      <div
                        key={service.value}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          userData.housekeepingRole.includes(service.value)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleRoleToggle(service.value)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={userData.housekeepingRole.includes(service.value) ? 'text-blue-600' : 'text-gray-600'}>
                              {service.icon}
                            </span>
                            <span className={`text-sm font-medium ${
                              userData.housekeepingRole.includes(service.value) ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {service.label}
                            </span>
                          </div>
                          {userData.housekeepingRole.includes(service.value) && (
                            <CheckCircle size={16} className="text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userData.housekeepingRole.length > 0 ? (
                      userData.housekeepingRole.map(role => (
                        <span
                          key={role}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {serviceTypes.find(s => s.value === role)?.label || role}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No services selected</span>
                    )}
                  </div>
                )}
              </div>

              {/* Service-specific fields */}
              {userData.housekeepingRole.includes('COOK') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Cooking Speciality
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={userData.cookingSpeciality}
                        onChange={(e) => setUserData(prev => ({ ...prev, cookingSpeciality: e.target.value }))}
                      >
                        <option value="">Select Speciality</option>
                        {cookingSpecialityOptions.map(opt => (
                          <option key={opt} value={opt}>
                            {opt === "VEG" ? "Vegetarian" : opt === "NONVEG" ? "Non-Vegetarian" : "Both"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        value={userData.cookingSpeciality ? 
                          (userData.cookingSpeciality === "VEG" ? "Vegetarian" : 
                           userData.cookingSpeciality === "NONVEG" ? "Non-Vegetarian" : 
                           userData.cookingSpeciality) : "Not specified"}
                        readOnly
                        style={{ backgroundColor: '#f9fafb' }}
                      />
                    )}
                  </div>
                </div>
              )}

              {userData.housekeepingRole.includes('NANNY') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Nanny Care Type
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={userData.nannyCareType}
                        onChange={(e) => setUserData(prev => ({ ...prev, nannyCareType: e.target.value }))}
                      >
                        <option value="">Select Care Type</option>
                        {nannyCareOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        value={userData.nannyCareType ? 
                          (nannyCareOptions.find(o => o.value === userData.nannyCareType)?.label || userData.nannyCareType) 
                          : "Not specified"}
                        readOnly
                        style={{ backgroundColor: '#f9fafb' }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Diet Preference (for all selected roles) */}
              {(userData.housekeepingRole.includes('COOK') || 
                userData.housekeepingRole.includes('NANNY') || 
                userData.housekeepingRole.includes('MAID')) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Diet Preference
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={userData.diet}
                        onChange={(e) => setUserData(prev => ({ ...prev, diet: e.target.value }))}
                      >
                        <option value="">Select Diet</option>
                        {dietOptions.map(opt => (
                          <option key={opt} value={opt}>
                            {opt === "VEG" ? "Vegetarian" : opt === "NONVEG" ? "Non-Vegetarian" : "Both"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        value={userData.diet ? 
                          (userData.diet === "VEG" ? "Vegetarian" : 
                           userData.diet === "NONVEG" ? "Non-Vegetarian" : 
                           userData.diet) : "Not specified"}
                        readOnly
                        style={{ backgroundColor: '#f9fafb' }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.experience}
                    onChange={(e) => setUserData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    readOnly={!isEditing}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Languages Known
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.languageKnown}
                    onChange={(e) => setUserData(prev => ({ ...prev, languageKnown: e.target.value }))}
                    readOnly={!isEditing}
                    placeholder="e.g., English, Hindi, Marathi"
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gray-200 my-4" />

        {/* Address Information Section */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('address')}
          >
            <div className="flex items-center">
              <MapPin size={18} className="text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Address Information
              </h3>
            </div>
            {expandedSections.address ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.address && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Current Location
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.currentLocation}
                    onChange={(e) => setUserData(prev => ({ ...prev, currentLocation: e.target.value }))}
                    readOnly={!isEditing}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Locality
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.locality}
                    onChange={(e) => setUserData(prev => ({ ...prev, locality: e.target.value }))}
                    readOnly={!isEditing}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Street
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.street}
                    onChange={(e) => setUserData(prev => ({ ...prev, street: e.target.value }))}
                    readOnly={!isEditing}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Building Name
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.buildingName}
                    onChange={(e) => setUserData(prev => ({ ...prev, buildingName: e.target.value }))}
                    readOnly={!isEditing}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Pincode
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.pincode}
                    onChange={(e) => setUserData(prev => ({ ...prev, pincode: e.target.value }))}
                    readOnly={!isEditing}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Nearby Location
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.nearbyLocation}
                    onChange={(e) => setUserData(prev => ({ ...prev, nearbyLocation: e.target.value }))}
                    readOnly={!isEditing}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                  />
                </div>
              </div>

              {/* Permanent and Correspondence Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providerData?.permanentAddress && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Home size={16} className="mr-2 text-blue-600" />
                      Permanent Address
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{providerData.permanentAddress.field1} {providerData.permanentAddress.field2}</p>
                      <p>{providerData.permanentAddress.ctarea}, {providerData.permanentAddress.state}</p>
                      <p>{providerData.permanentAddress.country} - {providerData.permanentAddress.pinno}</p>
                    </div>
                  </div>
                )}

                {providerData?.correspondenceAddress && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <MapPin size={16} className="mr-2 text-blue-600" />
                      Correspondence Address
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{providerData.correspondenceAddress.field1} {providerData.correspondenceAddress.field2}</p>
                      <p>{providerData.correspondenceAddress.ctarea}, {providerData.correspondenceAddress.state}</p>
                      <p>{providerData.correspondenceAddress.country} - {providerData.correspondenceAddress.pinno}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="h-px bg-gray-200 my-4" />

        {/* Additional Information Section */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('additional')}
          >
            <div className="flex items-center">
              <Award size={18} className="text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Additional Information
              </h3>
            </div>
            {expandedSections.additional ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.additional && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  KYC Status
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={providerData?.kyc ? "Verified" : "Pending"}
                  readOnly
                  style={{ backgroundColor: '#f9fafb' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Enrolled Date
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={providerData?.enrolleddate ? new Date(providerData.enrolleddate).toLocaleDateString() : "Not available"}
                  readOnly
                  style={{ backgroundColor: '#f9fafb' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Key Facts
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={providerData?.keyFacts ? "Available" : "Not Available"}
                  readOnly
                  style={{ backgroundColor: '#f9fafb' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <Button 
                onClick={handleCancel} 
                disabled={isSaving}
                variant="outline"
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !isFormValid() || !hasChanges()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
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
  );
};

export default ServiceProviderProfileSection;