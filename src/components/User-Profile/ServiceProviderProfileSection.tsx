/* eslint-disable */
import React, { useEffect, useState, useRef, useMemo } from "react";
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
  IdCard,
  CreditCard
} from "lucide-react";
import providerInstance from "src/services/providerInstance";
import { useLanguage } from "src/context/LanguageContext";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";

import { 
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Paper,
  Fade
} from "@mui/material";
import TimeSlotSelector from "../Common/TimeSlotSelector/TimeSlotSelector";

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
  housekeepingRoles: string | string[];
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
  // Bank details fields
  bankName?: string;
  ifscCode?: string;
  accountHolderName?: string;
  accountNumber?: string;
  accountType?: string;
  upiId?: string;
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
  
  // Time slots state
  const [morningSlots, setMorningSlots] = useState<number[][]>([]);
  const [eveningSlots, setEveningSlots] = useState<number[][]>([]);
  const [isFullTime, setIsFullTime] = useState(false);
  
  // Original time slots for change detection
  const [originalMorningSlots, setOriginalMorningSlots] = useState<number[][]>([]);
  const [originalEveningSlots, setOriginalEveningSlots] = useState<number[][]>([]);
  const [originalIsFullTime, setOriginalIsFullTime] = useState<boolean>(true);
  
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
    housekeepingRoles: [] as string[],
    experience: 0,
    languageKnown: "",
    currentLocation: "",
    locality: "",
    street: "",
    buildingName: "",
    pincode: "",
    nearbyLocation: "",
    timeslot: "",
    // Bank details
    bankName: "",
    ifscCode: "",
    accountHolderName: "",
    accountNumber: "",
    accountType: "",
    upiId: ""
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
    bankDetails: true,
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

  // Helper functions for time slots
  const formatDisplayTime = (value: number): string => {
    const hour = Math.floor(value);
    const minute = (value % 1) * 60;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute === 0 ? '00' : minute} ${ampm}`;
  };

  const formatTimeForPayload = (value: number): string => {
    const hour = Math.floor(value);
    const minute = (value % 1) * 60;
    const paddedHour = hour.toString().padStart(2, '0');
    const paddedMinute = minute === 0 ? '00' : minute.toString().padStart(2, '0');
    return `${paddedHour}:${paddedMinute}`;
  };

  // Parse 12-hour format like "06:00 AM" → number
  const parseTimeToNumber = (timeStr: string): number => {
    const [time, period] = timeStr.trim().split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour + (minute / 60);
  };

  // NEW: Parse 24-hour format like "06:00" → number
  const parse24HourTimeToNumber = (timeStr: string): number => {
    const [hour, minute] = timeStr.split(':').map(Number);
    return hour + (minute / 60);
  };

  const mergeTimeSlots = (slots: number[][]): string => {
    if (!slots.length) return "";
    const sorted = [...slots].sort((a, b) => a[0] - b[0]);
    const merged: number[][] = [];
    for (const slot of sorted) {
      if (merged.length === 0) {
        merged.push([slot[0], slot[1]]);
      } else {
        const last = merged[merged.length - 1];
        if (slot[0] <= last[1]) {
          last[1] = Math.max(last[1], slot[1]);
        } else {
          merged.push([slot[0], slot[1]]);
        }
      }
    }
    return merged
      .map(([start, end]) => `${formatDisplayTime(start)} - ${formatDisplayTime(end)}`)
      .join(", ");
  };

  const mergedTimeSlotsString = useMemo(() => {
    const allSlots = [...morningSlots, ...eveningSlots];
    return mergeTimeSlots(allSlots);
  }, [morningSlots, eveningSlots]);

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

      let roles: string[] = [];
      if (data.housekeepingRoles && Array.isArray(data.housekeepingRoles)) {
        roles = data.housekeepingRoles;
      } else if (typeof data.housekeepingRoles === 'string') {
        if (data.housekeepingRoles.includes(',')) {
          roles = data.housekeepingRoles.split(',').map((r: string) => r.trim());
        } else {
          roles = [data.housekeepingRoles];
        }
      }

      // --- FIX: Parse timeslot in 24-hour format and split crossing noon ---
      let morning: number[][] = [];
      let evening: number[][] = [];

      if (data.timeslot) {
        const slots = data.timeslot.split(',').map(slot => slot.trim());
        slots.forEach(slot => {
          const [startStr, endStr] = slot.split('-');
          if (startStr && endStr) {
            try {
              let start = parse24HourTimeToNumber(startStr);
              let end = parse24HourTimeToNumber(endStr);
              
              // If slot crosses 12:00 (noon), split it
              if (start < 12 && end > 12) {
                morning.push([start, 12]);
                evening.push([12, end]);
              } else if (start < 12) {
                morning.push([start, end]);
              } else {
                evening.push([start, end]);
              }
            } catch (error) {
              console.error("Error parsing time slot:", slot);
            }
          }
        });
      }
      
      setMorningSlots(morning);
      setEveningSlots(evening);
      setIsFullTime(morning.length === 0 && evening.length === 0);
      setOriginalMorningSlots(morning);
      setOriginalEveningSlots(evening);
      setOriginalIsFullTime(morning.length === 0 && evening.length === 0);

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
        housekeepingRoles: roles,
        experience: data.experience || 0,
        languageKnown: languageKnown || "",
        currentLocation: data.currentLocation || "",
        locality: data.locality || "",
        street: data.street || "",
        buildingName: data.buildingName || "",
        pincode: data.pincode?.toString() || "",
        nearbyLocation: data.nearbyLocation || "",
        timeslot: data.timeslot || "",
        bankName: data.bankName || "",
        ifscCode: data.ifscCode || "",
        accountHolderName: data.accountHolderName || "",
        accountNumber: data.accountNumber || "",
        accountType: data.accountType || "",
        upiId: data.upiId || ""
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

  const handleAddMorningSlot = () => {
    if (morningSlots.length < 12) {
      setMorningSlots([...morningSlots, [6, 12]]);
    } else {
      alert(t("maxMorningSlotsReached"));
    }
  };

  const handleRemoveMorningSlot = (index: number) => {
    setMorningSlots(morningSlots.filter((_, i) => i !== index));
  };

  const handleClearMorningSlots = () => {
    setMorningSlots([]);
  };

  const handleAddEveningSlot = () => {
    if (eveningSlots.length < 16) {
      setEveningSlots([...eveningSlots, [12, 20]]);
    } else {
      alert(t("maxEveningSlotsReached"));
    }
  };

  const handleRemoveEveningSlot = (index: number) => {
    setEveningSlots(eveningSlots.filter((_, i) => i !== index));
  };

  const handleClearEveningSlots = () => {
    setEveningSlots([]);
  };

  const handleMorningSlotChange = (index: number, newValue: number[]) => {
    const updatedSlots = [...morningSlots];
    updatedSlots[index] = newValue;
    setMorningSlots(updatedSlots);
  };

  const handleEveningSlotChange = (index: number, newValue: number[]) => {
    const updatedSlots = [...eveningSlots];
    updatedSlots[index] = newValue;
    setEveningSlots(updatedSlots);
  };

  const handleFullTimeToggle = (checked: boolean) => {
    setIsFullTime(checked);
    if (checked) {
      setMorningSlots([]);
      setEveningSlots([]);
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
      housekeepingRoles: prev.housekeepingRoles.includes(role)
        ? prev.housekeepingRoles.filter(r => r !== role)
        : [...prev.housekeepingRoles, role]
    }));
  };

  const handleSave = async () => {
    if (!userId) return;

    if (userData.contactNumber && !validateMobileFormat(userData.contactNumber)) {
      alert(t("phoneValidationError"));
      return;
    }
    if (userData.altContactNumber && !validateMobileFormat(userData.altContactNumber)) {
      alert(t("phoneValidationError"));
      return;
    }
    if (userData.contactNumber && userData.altContactNumber && userData.contactNumber === userData.altContactNumber) {
      alert(t("contactNumbersMustBeDifferent"));
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {};

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

      // Send housekeepingRoles as an array
      if (
        userData.housekeepingRoles.join(",") !==
        originalData.housekeepingRoles.join(",")
      ) {
        payload.housekeepingRoles = userData.housekeepingRoles; // Array format
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

      // Bank details
      if (userData.accountHolderName !== originalData.accountHolderName) payload.accountHolderName = userData.accountHolderName;
      if (userData.accountNumber !== originalData.accountNumber) payload.accountNumber = userData.accountNumber;
      if (userData.accountType !== originalData.accountType) payload.accountType = userData.accountType;
      if (userData.bankName !== originalData.bankName) payload.bankName = userData.bankName;
      if (userData.ifscCode !== originalData.ifscCode) payload.ifscCode = userData.ifscCode;
      if (userData.upiId !== originalData.upiId) payload.upiId = userData.upiId;

      let timeslotString = '';
      if (!isFullTime) {
        const allSlots = [...morningSlots, ...eveningSlots];
        if (allSlots.length > 0) {
          timeslotString = allSlots
            .map(slot => `${formatTimeForPayload(slot[0])}-${formatTimeForPayload(slot[1])}`)
            .join(',');
        }
      }
      const slotsChanged = 
        isFullTime !== originalIsFullTime ||
        JSON.stringify(morningSlots) !== JSON.stringify(originalMorningSlots) ||
        JSON.stringify(eveningSlots) !== JSON.stringify(originalEveningSlots);
      if (slotsChanged) {
        payload.timeslot = timeslotString || null;
      }

      if (Object.keys(payload).length === 0) {
        alert(t("noChangesDetected"));
        setIsEditing(false);
        return;
      }

      await providerInstance.put(`/api/service-providers/serviceprovider/${userId}`, payload);
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
    setMorningSlots(originalMorningSlots);
    setEveningSlots(originalEveningSlots);
    setIsFullTime(originalIsFullTime);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasChanges = (): boolean => {
    const userDataChanged = JSON.stringify(userData) !== JSON.stringify(originalData);
    const slotsChanged = 
      isFullTime !== originalIsFullTime ||
      JSON.stringify(morningSlots) !== JSON.stringify(originalMorningSlots) ||
      JSON.stringify(eveningSlots) !== JSON.stringify(originalEveningSlots);
    return userDataChanged || slotsChanged;
  };

  const isFormValid = (): boolean => {
    if (userData.contactNumber && !validateMobileFormat(userData.contactNumber)) return false;
    if (userData.altContactNumber && !validateMobileFormat(userData.altContactNumber)) return false;
    if (userData.contactNumber && userData.altContactNumber && userData.contactNumber === userData.altContactNumber) return false;
    return true;
  };

  const kycStatus = getKYCStatus();

  function getKYCStatus() {
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
  }

  if (isLoading) {
    return (
      <div className="flex w-full justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-6xl rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/30 ring-1 ring-slate-900/5 sm:p-7">
          {/* Header Skeleton */}
          <div className="mb-6 flex justify-between items-center border-b border-slate-200/90 pb-3">
            <div>
              <SkeletonLoader width={180} height={24} className="mb-2" />
              <div className="flex items-center mt-1 space-x-2">
                <SkeletonLoader width={80} height={24} />
                <SkeletonLoader width={60} height={20} />
              </div>
            </div>
            <SkeletonLoader width={120} height={40} />
          </div>

          {/* Personal Information Section Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <SkeletonLoader width={18} height={18} className="mr-2" />
                <SkeletonLoader width={150} height={20} />
              </div>
              <SkeletonLoader width={20} height={20} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index}>
                  <SkeletonLoader width={100} height={16} className="mb-2" />
                  <SkeletonLoader height={40} />
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          {/* Professional Information Section Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <SkeletonLoader width={18} height={18} className="mr-2" />
                <SkeletonLoader width={160} height={20} />
              </div>
              <SkeletonLoader width={20} height={20} />
            </div>
            <div className="space-y-4">
              <div>
                <SkeletonLoader width={120} height={16} className="mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, index) => (
                    <SkeletonLoader key={index} height={60} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <SkeletonLoader width={120} height={16} className="mb-2" />
                  <SkeletonLoader height={40} />
                </div>
                <div>
                  <SkeletonLoader width={120} height={16} className="mb-2" />
                  <SkeletonLoader height={40} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <SkeletonLoader width={100} height={16} className="mb-2" />
                  <SkeletonLoader height={40} />
                </div>
                <div>
                  <SkeletonLoader width={120} height={16} className="mb-2" />
                  <SkeletonLoader height={40} />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          {/* Availability Section Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <SkeletonLoader width={18} height={18} className="mr-2" />
                <SkeletonLoader width={100} height={20} />
              </div>
              <SkeletonLoader width={20} height={20} />
            </div>
            <div>
              <SkeletonLoader width={140} height={16} className="mb-2" />
              <SkeletonLoader height={80} />
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          {/* KYC Section Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <SkeletonLoader width={18} height={18} className="mr-2" />
                <SkeletonLoader width={130} height={20} />
              </div>
              <SkeletonLoader width={20} height={20} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <SkeletonLoader width={80} height={16} className="mb-2" />
                  <SkeletonLoader width={120} height={32} />
                </div>
                <div>
                  <SkeletonLoader width={80} height={16} className="mb-2" />
                  <SkeletonLoader width={150} height={32} />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          {/* Address Section Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <SkeletonLoader width={18} height={18} className="mr-2" />
                <SkeletonLoader width={140} height={20} />
              </div>
              <SkeletonLoader width={20} height={20} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[...Array(6)].map((_, index) => (
                <div key={index}>
                  <SkeletonLoader width={100} height={16} className="mb-2" />
                  <SkeletonLoader height={40} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonLoader height={120} />
              <SkeletonLoader height={120} />
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          {/* Additional Section Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <SkeletonLoader width={18} height={18} className="mr-2" />
                <SkeletonLoader width={150} height={20} />
              </div>
              <SkeletonLoader width={20} height={20} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index}>
                  <SkeletonLoader width={100} height={16} className="mb-2" />
                  <SkeletonLoader height={40} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/30 ring-1 ring-slate-900/5 sm:p-7">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 border-b border-slate-200/90 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{t("serviceProvider")} {t("profile")}</h2>
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
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 sm:w-auto"
              onClick={() => {
                setOriginalData({ ...userData });
                setIsEditing(true);
              }}
            >
              <Edit3 size={16} className="shrink-0" />
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
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("firstName")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.firstName}
                  onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("middleName")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.middleName}
                  onChange={(e) => setUserData(prev => ({ ...prev, middleName: e.target.value }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("lastName")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.lastName}
                  onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("email")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={userData.email}
                  readOnly
                  style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("contactNumber")}</label>
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
                {contactValidation.error && <p className="text-red-500 text-xs mt-1">{contactValidation.error}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("alternateContactNumber")}</label>
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
                {altContactValidation.error && <p className="text-red-500 text-xs mt-1">{altContactValidation.error}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("gender")}</label>
                {isEditing ? (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    value={userData.gender}
                    onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">{t("selectGender")}</option>
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                    value={userData.gender ? (genderOptions.find(g => g.value === userData.gender)?.label || userData.gender) : t("notSpecified")}
                    readOnly
                    style={{ backgroundColor: '#f9fafb' }}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("dateOfBirth")}</label>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {serviceTypes.map(service => {
                  const isSelected = userData.housekeepingRoles.includes(service.value);
                  return (
                    <div
                      key={service.value}
                      className={`border rounded-lg p-3 transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      } ${isEditing ? 'cursor-pointer hover:border-gray-300' : 'opacity-90'}`}
                      onClick={() => { if (isEditing) handleRoleToggle(service.value); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={isSelected ? 'text-blue-600' : 'text-gray-600'}>{service.icon}</span>
                          <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                            {service.label}
                          </span>
                        </div>
                        {isSelected && <CheckCircle size={16} className="text-blue-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                {userData.housekeepingRoles.includes('COOK') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">{t("cookingSpeciality")}</label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={userData.cookingSpeciality}
                        onChange={(e) => setUserData(prev => ({ ...prev, cookingSpeciality: e.target.value }))}
                      >
                        <option value="">{t("selectSpeciality")}</option>
                        {cookingSpecialityOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        value={userData.cookingSpeciality ? (cookingSpecialityOptions.find(o => o.value === userData.cookingSpeciality)?.label || userData.cookingSpeciality) : t("notSpecified")}
                        readOnly
                      />
                    )}
                  </div>
                )}
                {userData.housekeepingRoles.includes('NANNY') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">{t("careType")}</label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={userData.nannyCareType}
                        onChange={(e) => setUserData(prev => ({ ...prev, nannyCareType: e.target.value }))}
                      >
                        <option value="">{t("selectCareType")}</option>
                        {nannyCareOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        value={userData.nannyCareType ? (nannyCareOptions.find(o => o.value === userData.nannyCareType)?.label || userData.nannyCareType) : t("notSpecified")}
                        readOnly
                      />
                    )}
                  </div>
                )}
                {(userData.housekeepingRoles.includes('COOK') || userData.housekeepingRoles.includes('NANNY') || userData.housekeepingRoles.includes('MAID')) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">{t("dietPreference")}</label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        value={userData.diet}
                        onChange={(e) => setUserData(prev => ({ ...prev, diet: e.target.value }))}
                      >
                        <option value="">{t("selectDiet")}</option>
                        {dietOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        value={userData.diet ? (dietOptions.find(o => o.value === userData.diet)?.label || userData.diet) : t("notSpecified")}
                        readOnly
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">{t("experience")}</label>
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
                  <label className="block text-sm font-semibold text-gray-600 mb-2">{t("languagesKnown")}</label>
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
            <div className="space-y-4">
              {isEditing ? (
                <Box sx={{ width: '100%' }}>
                  <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: isFullTime ? '#e3f2fd' : 'transparent', borderRadius: 2 }}>
                    <FormControlLabel
                      control={<Checkbox checked={isFullTime} onChange={(e) => handleFullTimeToggle(e.target.checked)} color="primary" />}
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">{t("fullTimeAvailability")}</Typography>
                          <Typography variant="body2" color="text.secondary">{t("fullTimeDescription")}</Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Paper>
                  {!isFullTime && (
                    <Fade in={!isFullTime}>
                      <Box>
                        <TimeSlotSelector
                          key={`morning-${morningSlots.length}-${morningSlots.map(s => s.join()).join()}`}
                          title={t("morningAvailability")}
                          slots={morningSlots}
                          minTime={6}
                          maxTime={12}
                          marks={[
                            { value: 6, label: "6:00 AM" },
                            { value: 8, label: "8:00 AM" },
                            { value: 10, label: "10:00 AM" },
                            { value: 12, label: "12:00 PM" },
                          ]}
                          notAvailableMessage={t("notAvailableMorning")}
                          addSlotMessage={t("addMorningSlots")}
                          slotLabel={t("timeSlot")}
                          addButtonLabel={t("addSlot")}
                          clearButtonLabel={t("clearAll")}
                          duplicateErrorKey={t("timeSlotDuplicateError")}
                          onAddSlot={handleAddMorningSlot}
                          onRemoveSlot={handleRemoveMorningSlot}
                          onClearSlots={handleClearMorningSlots}
                          onSlotChange={handleMorningSlotChange}
                          formatDisplayTime={formatDisplayTime}
                        />
                        <TimeSlotSelector
                          key={`evening-${eveningSlots.length}-${eveningSlots.map(s => s.join()).join()}`}
                          title={t("eveningAvailability")}
                          slots={eveningSlots}
                          minTime={12}
                          maxTime={20}
                          marks={[
                            { value: 12, label: "12:00 PM" },
                            { value: 14, label: "2:00 PM" },
                            { value: 16, label: "4:00 PM" },
                            { value: 18, label: "6:00 PM" },
                            { value: 20, label: "8:00 PM" },
                          ]}
                          notAvailableMessage={t("notAvailableEvening")}
                          addSlotMessage={t("addEveningSlots")}
                          slotLabel={t("timeSlot")}
                          addButtonLabel={t("addSlot")}
                          clearButtonLabel={t("clearAll")}
                          duplicateErrorKey={t("timeSlotDuplicateError")}
                          onAddSlot={handleAddEveningSlot}
                          onRemoveSlot={handleRemoveEveningSlot}
                          onClearSlots={handleClearEveningSlots}
                          onSlotChange={handleEveningSlotChange}
                          formatDisplayTime={formatDisplayTime}
                        />
                        {mergedTimeSlotsString && (
                          <Paper elevation={3} sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#e3f2fd', color: '#1976d2', border: '1px solid #90caf9' }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{t("yourSelectedTimeSlots")}</Typography>
                            <Typography variant="body1">{mergedTimeSlotsString}</Typography>
                          </Paper>
                        )}
                      </Box>
                    </Fade>
                  )}
                </Box>
              ) : (
                <div>
                  {providerData?.timeslot ? (
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                      {providerData.timeslot.split(',').map((slot, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Clock size={12} className="mr-1" />
                          {slot.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">{t("noTimeSlotsSpecified")}</span>
                  )}
                </div>
              )}
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
                  <label className="block text-sm font-semibold text-gray-600 mb-2">{t("kycStatus")}</label>
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
                    <label className="block text-sm font-semibold text-gray-600 mb-2">{t("kycType")}</label>
                    <div className="flex items-center space-x-2">
                      <FileText size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{providerData.kycType}</span>
                    </div>
                  </div>
                )}
                {providerData?.kycNumber && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">{t("kycNumber")}</label>
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
                    <label className="block text-sm font-semibold text-gray-600 mb-2">{t("kycDocument")}</label>
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                      onClick={() => { if (providerData.kycImage) window.open(providerData.kycImage, '_blank'); }}
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

        {/* Bank Details Section */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('bankDetails')}
          >
            <div className="flex items-center">
              <CreditCard size={18} className="text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t("bankDetails")}
              </h3>
            </div>
            {expandedSections.bankDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expandedSections.bankDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("accountHolderName")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.accountHolderName}
                  onChange={(e) => setUserData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("accountNumber")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.accountNumber}
                  onChange={(e) => setUserData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("accountType")}</label>
                {isEditing ? (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    value={userData.accountType}
                    onChange={(e) => setUserData(prev => ({ ...prev, accountType: e.target.value }))}
                  >
                    <option value="">{t("selectAccountType")}</option>
                    <option value="SAVINGS">{t("savings")}</option>
                    <option value="CURRENT">{t("current")}</option>
                  </select>
                ) : (
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                    value={userData.accountType || t("notSpecified")}
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("bankName")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.bankName}
                  onChange={(e) => setUserData(prev => ({ ...prev, bankName: e.target.value }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("ifscCode")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.ifscCode}
                  onChange={(e) => setUserData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                  readOnly={!isEditing}
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("upiId")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={userData.upiId}
                  onChange={(e) => setUserData(prev => ({ ...prev, upiId: e.target.value }))}
                  readOnly={!isEditing}
                  placeholder="example@okhdfcbank"
                  style={{ backgroundColor: isEditing ? 'white' : '#f9fafb' }}
                />
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
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("enrolledDate")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={providerData?.enrolleddate ? new Date(providerData.enrolleddate).toLocaleDateString() : t("notAvailable")}
                  readOnly
                  style={{ backgroundColor: '#f9fafb' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("keyFacts")}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  value={providerData?.keyFacts ? t("available") : t("notAvailable")}
                  readOnly
                  style={{ backgroundColor: '#f9fafb' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t("profileCreated")}</label>
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
              <Button onClick={handleCancel} disabled={isSaving} variant="outline" className="px-6 py-2">
                {t("cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !isFormValid() || !hasChanges()}>
                {isSaving ? <><ClipLoader size={16} color="white" className="mr-2" />{t('saving')}</> : t('saveChanges')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceProviderProfileSection;