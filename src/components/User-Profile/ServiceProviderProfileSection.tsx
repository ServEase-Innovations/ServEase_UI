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
  ChevronUp,
  FileText,
  IdCard
} from "lucide-react";
import providerInstance from "src/services/providerInstance";
import { useLanguage } from "src/context/LanguageContext";

interface ServiceProviderProfileSectionProps {
  userId: number | null;
  userEmail: string | null;
}

interface ServiceProviderData {
  serviceproviderid: string;
  dob: string;
  kyc: any | null;
  kycType?: string;
  kycNumber?: string;
  kycImage?: string | null;
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
  const { t } = useLanguage();
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
    nearbyLocation: "",
    timeslot: ""
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
    availability: true,
    kyc: true,
    additional: true
  });

  const serviceTypes = [
    { value: "COOK", label: t("cook"), icon: <ChefHat size={16} /> },
    { value: "NANNY", label: t("nanny"), icon: <Heart size={16} /> },
    { value: "MAID", label: t("maid"), icon: <Briefcase size={16} /> },
  ];

  const dietOptions = [
    { value: "VEG", label: t("veg") },
    { value: "NONVEG", label: t("nonVeg") },
    { value: "BOTH", label: t("both") }
  ];
  
  const cookingSpecialityOptions = [
    { value: "VEG", label: t("veg") },
    { value: "NONVEG", label: t("nonVeg") },
    { value: "BOTH", label: t("both") }
  ];
  
  const nannyCareOptions = [
    { value: "BABY_CARE", label: t("babyCare") },
    { value: "ELDERLY_CARE", label: t("elderlyCare") },
    { value: "BOTH", label: t("both") },
  ];

  const genderOptions = [
    { value: "MALE", label: t("male") },
    { value: "FEMALE", label: t("female") },
    { value: "OTHER", label: t("other") }
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
        error: isAvailable ? '' : `${isAlternate ? t("alternate") : t("mobile")} ${t("numberAlreadyRegistered")}`,
        isAvailable,
        formatError: false
      });

      return isAvailable;
    } catch (error) {
      setValidation({
        loading: false,
        error: `${t("errorCheckingNumber")} ${isAlternate ? t("alternate") : t("mobile")}`,
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
        nearbyLocation: data.nearbyLocation || "",
        timeslot: data.timeslot || ""
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

  // Format time slot for display
  const formatTimeSlot = (timeslot: string | null): string => {
    if (!timeslot) return t("notSpecified");
    return timeslot.split(',').map(slot => slot.trim()).join(' • ');
  };

  // Get KYC status with details
  const getKYCStatus = () => {
    if (!providerData) return { status: t("pending"), color: "red", icon: <XCircle size={14} /> };
    
    if (providerData.kyc) {
      return { 
        status: t("verified"), 
        color: "green", 
        icon: <CheckCircle size={14} />,
        details: providerData.kycType ? `(${providerData.kycType})` : ""
      };
    }
    
    if (providerData.kycNumber && providerData.kycType) {
      return { 
        status: t("pendingVerification"), 
        color: "orange", 
        icon: <AlertCircle size={14} />,
        details: `${providerData.kycType} ${t("numberProvidedAwaitingVerification")}`
      };
    }
    
    return { 
      status: t("notSubmitted"), 
      color: "red", 
      icon: <XCircle size={14} />,
      details: t("pleaseSubmitKYCDocuments")
    };
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
        error: t("phoneValidationError"),
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
          error: t("alternateNumberCannotBeSame"),
          isAvailable: false,
          formatError: false
        });
      } else {
        setTimeout(() => checkMobileAvailability(value, true), 800);
      }
    } else if (value) {
      setAltContactValidation({
        loading: false,
        error: t("phoneValidationError"),
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

  const handleSave = async () => {
    if (!userId) return;

    // Validate mobile numbers
    if (userData.contactNumber && !validateMobileFormat(userData.contactNumber)) {
      alert(t("phoneValidationError"));
      return;
    }

    if (userData.altContactNumber && !validateMobileFormat(userData.altContactNumber)) {
      alert(t("phoneValidationError"));
      return;
    }

    if (
      userData.contactNumber &&
      userData.altContactNumber &&
      userData.contactNumber === userData.altContactNumber
    ) {
      alert(t("contactNumbersMustBeDifferent"));
      return;
    }

    setIsSaving(true);

    try {
      const payload: any = {};

      // Compare field by field and add ONLY changed ones
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

      if (userData.timeslot !== originalData.timeslot) {
        payload.timeslot = userData.timeslot;
      }

      // If nothing changed, skip API
      if (Object.keys(payload).length === 0) {
        alert(t("noChangesDetected"));
        setIsEditing(false);
        return;
      }

      await providerInstance.put(
        `/api/service-providers/serviceprovider/${userId}`,
        payload
      );

      await fetchServiceProviderData();
      setIsEditing(false);

    } catch (error) {
      console.error("Failed to save data:", error);
      alert(t("saveFailed"));
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

  const kycStatus = getKYCStatus();

  return (
    <div className="flex justify-center w-full py-6">
      <div className="w-[85%] max-w-6xl bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{t("serviceProvider")} {t("profile")}</h2>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                providerData?.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {providerData?.isactive ? (
                  <><CheckCircle size={12} className="mr-1" /> {t("active")}</>
                ) : (
                  <><XCircle size={12} className="mr-1" /> {t("inactive")}</>
                )}
              </span>
              {providerData?.rating && providerData.rating > 0 ? (
                <span className="flex items-center text-sm text-yellow-600">
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
              {t("edit")} {t("profile")}
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
                {t("personalInformation")}
              </h3>
            </div>
            {expandedSections.personal ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.personal && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {t("firstName")}
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
                  {t("middleName")}
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
                  {t("lastName")}
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
                  {t("email")}
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
                  {t("contactNumber")}
                </label>
                <div className="relative">
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.contactNumber}
                    onChange={handleContactNumberChange}
                    readOnly={!isEditing}
                    placeholder={t("enter10DigitNumber")}
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
                  {t("alternateContactNumber")}
                </label>
                <div className="relative">
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.altContactNumber}
                    onChange={handleAltContactNumberChange}
                    readOnly={!isEditing}
                    placeholder={t("enter10DigitNumber")}
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
                  {t("gender")}
                </label>
                {isEditing ? (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    value={userData.gender}
                    onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">{t("selectGender")}</option>
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                    value={userData.gender ? 
                      (genderOptions.find(g => g.value === userData.gender)?.label || userData.gender) 
                      : t("notSpecified")}
                    readOnly
                    style={{ backgroundColor: '#f9fafb' }}
                  />
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {t("dateOfBirth")}
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={userData.dob || t("notSpecified")}
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
                {t("professionalInformation")}
              </h3>
            </div>
            {expandedSections.professional ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.professional && (
            <div className="space-y-4">
              {/* Service Types */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-3">
                  {t("serviceTypes")}
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
                      <span className="text-sm text-gray-500">{t("noServicesSelected")}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Service-specific fields */}
              {userData.housekeepingRole.includes('COOK') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      {t("cookingSpeciality")}
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={userData.cookingSpeciality}
                        onChange={(e) => setUserData(prev => ({ ...prev, cookingSpeciality: e.target.value }))}
                      >
                        <option value="">{t("selectSpeciality")}</option>
                        {cookingSpecialityOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        value={userData.cookingSpeciality ? 
                          (cookingSpecialityOptions.find(o => o.value === userData.cookingSpeciality)?.label || userData.cookingSpeciality) 
                          : t("notSpecified")}
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
                      {t("careType")}
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={userData.nannyCareType}
                        onChange={(e) => setUserData(prev => ({ ...prev, nannyCareType: e.target.value }))}
                      >
                        <option value="">{t("selectCareType")}</option>
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
                          : t("notSpecified")}
                        readOnly
                        style={{ backgroundColor: '#f9fafb' }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Diet Preference */}
              {(userData.housekeepingRole.includes('COOK') || 
                userData.housekeepingRole.includes('NANNY') || 
                userData.housekeepingRole.includes('MAID')) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      {t("dietPreference")}
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={userData.diet}
                        onChange={(e) => setUserData(prev => ({ ...prev, diet: e.target.value }))}
                      >
                        <option value="">{t("selectDiet")}</option>
                        {dietOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        value={userData.diet ? 
                          (dietOptions.find(o => o.value === userData.diet)?.label || userData.diet) 
                          : t("notSpecified")}
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
                    {t("experience")}
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
                    {t("languagesKnown")}
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.languageKnown}
                    onChange={(e) => setUserData(prev => ({ ...prev, languageKnown: e.target.value }))}
                    readOnly={!isEditing}
                    placeholder={t("languagesPlaceholder")}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gray-200 my-4" />

        {/* Availability Section */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('availability')}
          >
            <div className="flex items-center">
              <Clock size={18} className="text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t("availability")}
              </h3>
            </div>
            {expandedSections.availability ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.availability && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {t("timeSlotsAvailable")}
                </label>
                {isEditing ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={userData.timeslot}
                    onChange={(e) => setUserData(prev => ({ ...prev, timeslot: e.target.value }))}
                    placeholder={t("timeSlotPlaceholder")}
                    rows={3}
                    style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    {userData.timeslot ? (
                      userData.timeslot.split(',').map((slot, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          <Clock size={12} className="mr-1" />
                          {slot.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">{t("noTimeSlotsSpecified")}</span>
                    )}
                  </div>
                )}
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t("timeSlotHelperText")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gray-200 my-4" />

        {/* KYC Information Section */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('kyc')}
          >
            <div className="flex items-center">
              <IdCard size={18} className="text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t("kycInformation")}
              </h3>
            </div>
            {expandedSections.kyc ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.kyc && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    {t("kycStatus")}
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      kycStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                      kycStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {kycStatus.icon}
                      <span className="ml-1">{kycStatus.status}</span>
                    </span>
                  </div>
                </div>

                {providerData?.kycType && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      {t("kycType")}
                    </label>
                    <div className="flex items-center space-x-2">
                      <FileText size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{providerData.kycType}</span>
                    </div>
                  </div>
                )}

                {providerData?.kycNumber && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      {t("kycNumber")}
                    </label>
                    <div className="flex items-center space-x-2">
                      <IdCard size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {providerData.kycNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')}
                      </span>
                    </div>
                  </div>
                )}

                {kycStatus.details && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 mt-1">{kycStatus.details}</p>
                  </div>
                )}

                {providerData?.kycImage && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      {t("kycDocument")}
                    </label>
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                      onClick={() => {
                        if (providerData.kycImage) {
                          window.open(providerData.kycImage, '_blank');
                        }
                      }}
                    >
                      <FileText size={14} />
                      {t("viewDocument")}
                    </button>
                  </div>
                )}
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
                {t("addressInformation")}
              </h3>
            </div>
            {expandedSections.address ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.address && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    {t("currentLocation")}
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
                    {t("locality")}
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
                    {t("street")}
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
                    {t("buildingName")}
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
                    {t("pincode")}
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
                    {t("nearbyLocation")}
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
                      {t("permanentAddress")}
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
                      {t("correspondenceAddress")}
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
                {t("additionalInformation")}
              </h3>
            </div>
            {expandedSections.additional ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.additional && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {t("enrolledDate")}
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={providerData?.enrolleddate ? new Date(providerData.enrolleddate).toLocaleDateString() : t("notAvailable")}
                  readOnly
                  style={{ backgroundColor: '#f9fafb' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {t("keyFacts")}
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={providerData?.keyFacts ? t("available") : t("notAvailable")}
                  readOnly
                  style={{ backgroundColor: '#f9fafb' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {t("profileCreated")}
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={providerData?.enrolleddate ? new Date(providerData.enrolleddate).toLocaleDateString() : t("notAvailable")}
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
                {t("cancel")}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !isFormValid() || !hasChanges()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <><ClipLoader size={16} color="white" className="mr-2" />{t("saving")}</>
                ) : t("saveChanges")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceProviderProfileSection;