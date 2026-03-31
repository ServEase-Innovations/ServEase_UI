/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
import {
  Grid,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  AlertColor,
  Snackbar,
  Dialog,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Slider,
} from "@mui/material";
import {
  ArrowForward,
  ArrowBack,
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  MyLocation as MyLocationIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import axios from "axios";
import { keys } from "../../env/env";
import axiosInstance from "../../services/axiosInstance";
import { Button } from "../Button/button";
import AddressComponent from "./AddressComponent";
import { TermsCheckboxes } from "../Common/TermsCheckboxes/TermsCheckboxes";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { debounce } from "src/utils/debounce";
import { useFieldValidation } from "./useFieldValidation";


// Import the components
import BasicInformation from "./BasicInformation";
import ServiceDetails from "./ServiceDetails";
import KYCVerification from "./KYCVerification";
import providerInstance from "src/services/providerInstance";
import { useLanguage } from "src/context/LanguageContext";

// Define the shape of formData using an interface
interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  emailId: string;
  password: string;
  confirmPassword: string;
  mobileNo: string;
  AlternateNumber: string;
  buildingName: string;
  locality: string;
  street: string;
  currentLocation: string;
  nearbyLocation: string;
  pincode: string;
  latitude: number;
  longitude: number;
  AADHAR: string;
  pan: string;
  panImage: File | null;
  housekeepingRole: string[];
  description: string;
  experience: string;
  kyc: string;
  documentImage: File | null;
  otherDetails: string;
  profileImage: File | null;
  cookingSpeciality: string;
  nannyCareType: string;
  age: string;
  diet: string;
  dob: string;
  profilePic: string;
  timeslot: string;
  referralCode: string;
  agreeToTerms: boolean;
  terms: boolean;
  privacy: boolean;
  keyFacts: boolean;
  kycType: string;
  kycNumber: string;
  agentReferralId: string;
  permanentAddress: {
    apartment: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  correspondenceAddress: {
    apartment: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

// Define the shape of errors to hold string messages
interface FormErrors {
  firstName?: string;
  lastName?: string;
  gender?: string;
  emailId?: string;
  password?: string;
  confirmPassword?: string;
  mobileNo?: string;
  AlternateNumber?: string;
  buildingName?: string;
  locality?: string;
  street?: string;
  currentLocation?: string;
  pincode?: string;
  AADHAR?: string;
  pan?: string;
  agreeToTerms?: string;
  terms?: string;
  privacy?: string;
  keyFacts?: string;
  housekeepingRole?: string;
  description?: string;
  experience?: string;
  kyc?: string;
  documentImage?: string;
  cookingSpeciality?: string;
  nannyCareType?: string;
  diet?: string;
  dob?: string;
  kycType?: string;
  kycNumber?: string;
  permanentAddress?: {
    apartment?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  correspondenceAddress?: {
    apartment?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
}

// Regex for validation
const nameRegex = /^[A-Za-z]+(?:[ ][A-Za-z]+)*$/;
const emailIdRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Z|a-z]{2,}$/;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^[0-9]{10}$/;
const pincodeRegex = /^[0-9]{6}$/;
const aadhaarRegex = /^[0-9]{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const drivingLicenseRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4,11}$/;
const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
const passportRegex = /^[A-Z]{1}[0-9]{7}$/;
const MAX_NAME_LENGTH = 30;

interface RegistrationProps {
  onBackToLogin: (data: boolean) => void;
}

const ServiceProviderRegistration: React.FC<RegistrationProps> = ({
  onBackToLogin,
}) => {
  const { t } = useLanguage(); // Use the language context
  
  // Steps with translations
  const steps = [
    t("basicInformation"),
    t("addressInformation"),
    t("additionalDetails"),
    t("kycVerification"),
    t("confirmation"),
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");
  const [isCookSelected, setIsCookSelected] = useState(false);
  const [isNannySelected, setIsNannySelected] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [isDobValid, setIsDobValid] = useState(true);
  
  
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  
  // New state variables for multi-slot time selection
  const [morningSlots, setMorningSlots] = useState<number[][]>([[6, 12]]);
  const [eveningSlots, setEveningSlots] = useState<number[][]>([[12, 20]]);
  const [isFullTime, setIsFullTime] = useState(true);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string>("06:00-20:00");

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    emailId: "",
    password: "",
    confirmPassword: "",
    mobileNo: "",
    AlternateNumber: "",
    buildingName: "",
    locality: "",
    street: "",
    currentLocation: "",
    nearbyLocation: "",
    pincode: "",
    latitude: 0,
    longitude: 0,
    AADHAR: "",
    agentReferralId: "", 
    pan: "",
    panImage: null,
    housekeepingRole: [],
    description: "",
    experience: "",
    kyc: "AADHAR",
    documentImage: null,
    otherDetails: "",
    profileImage: null,
    cookingSpeciality: "",
    nannyCareType: "",
    age: "",
    diet: "",
    dob: "",
    profilePic: "",
    timeslot: "06:00-20:00",
    referralCode: "",
    agreeToTerms: false,
    terms: false,
    privacy: false,
    keyFacts: false,
    kycType: "AADHAR",
    kycNumber: "",
    permanentAddress: {
      apartment: "",
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: ""
    },
    correspondenceAddress: {
      apartment: "",
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: ""
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [image, setImage] = useState<Blob | null>(null);

  // Helper function to check if two time ranges overlap
  const isRangeOverlapping = (range1: number[], range2: number[]): boolean => {
    return !(range1[1] <= range2[0] || range1[0] >= range2[1]);
  };

  // Get disabled ranges for a specific slot (all other slots)
  const getDisabledRangesForSlot = (slots: number[][], currentIndex: number): number[][] => {
    return slots.filter((_, index) => index !== currentIndex);
  };

  // Helper function to format time display
  const formatDisplayTime = (value: number): string => {
    const hour = Math.floor(value);
    const minute = Math.round((value - hour) * 60);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    const displayHourFormatted = displayHour === 0 ? 12 : displayHour;
    const minuteFormatted = minute === 30 ? '30' : '00';
    return `${displayHourFormatted}:${minuteFormatted} ${period}`;
  };

  // Helper function to format time for storage (24-hour format)
  const formatTimeForStorage = (value: number): string => {
    const hour = Math.floor(value);
    const minute = value % 1 === 0.5 ? "30" : "00";
    const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
    return `${formattedHour}:${minute}`;
  };

 // Custom Slider component with disabled ranges
 const TimeSliderWithDisabledRanges: React.FC<{
  value: number[];
  onChange: (newValue: number[]) => void;
  min: number;
  max: number;
  marks: Array<{ value: number; label: string }>;
  disabledRanges: number[][];
}> = ({ value, onChange, min, max, marks, disabledRanges }) => {
  
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const range = newValue as number[];
    const [start, end] = range;
    
    // Check if the new range overlaps with any disabled ranges
    const hasOverlap = disabledRanges.some(disabledRange => 
      isRangeOverlapping([start, end], disabledRange)
    );
    
    if (!hasOverlap) {
      onChange(range);
    } else {
      setSnackbarMessage("This time range overlaps with another selected slot");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    }
  };

  return (
    <Slider
      value={value}
      onChange={handleSliderChange}
      valueLabelDisplay="on"
      valueLabelFormat={(value) => formatDisplayTime(value)}
      min={min}
      max={max}
      step={0.5}
      marks={marks}
      sx={{
        color: "primary.main",
        '& .MuiSlider-markLabel': {
          fontSize: '0.75rem'
        },
        '& .MuiSlider-mark': {
          backgroundColor: '#bfbfbf',
          height: 8,
          width: 2,
        },
        '& .MuiSlider-rail': {
          opacity: 0.3,
          backgroundColor: '#bfbfbf',
        },
        '& .MuiSlider-track': {
          backgroundColor: '#1976d2',
        },
      }}
    />
  );
};



 // Component to visually show disabled ranges
  const DisabledRangesIndicator: React.FC<{
    ranges: number[][];
    min: number;
    max: number;
  }> = ({ ranges, min, max }) => {
    if (ranges.length === 0) return null;

    const totalWidth = max - min;
    
    return (
      <Box sx={{ position: 'relative', width: '100%', height: 4, mt: 1, mb: 2 }}>
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#e0e0e0', borderRadius: 2 }} />
        {ranges.map((range, index) => {
          const startPercent = ((range[0] - min) / totalWidth) * 100;
          const widthPercent = ((range[1] - range[0]) / totalWidth) * 100;
          
          return (
            <Tooltip
              key={index}
              title={`Already selected: ${formatDisplayTime(range[0])} - ${formatDisplayTime(range[1])}`}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  height: '100%',
                  backgroundColor: '#ff9800',
                  opacity: 0.5,
                  borderRadius: 2,
                  cursor: 'not-allowed',
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    );
  };

  // Update selected time slots summary
  const updateSelectedTimeSlots = useCallback(() => {
    if (isFullTime) {
      setSelectedTimeSlots(t("fullDay"));
      setFormData((prev) => ({ ...prev, timeslot: "06:00-20:00" }));
      return;
    }

    const morningSlotStrings = morningSlots.map(([start, end]) => 
      `${formatTimeForStorage(start)}-${formatTimeForStorage(end)}`
    );
    
    const eveningSlotStrings = eveningSlots.map(([start, end]) => 
      `${formatTimeForStorage(start)}-${formatTimeForStorage(end)}`
    );

    let displaySlots: string[] = [];
    let storageSlots: string[] = [];

    // Format for display (with AM/PM)
    morningSlots.forEach(([start, end]) => {
      displaySlots.push(`${formatDisplayTime(start)} - ${formatDisplayTime(end)}`);
    });
    
    eveningSlots.forEach(([start, end]) => {
      displaySlots.push(`${formatDisplayTime(start)} - ${formatDisplayTime(end)}`);
    });

    // Format for storage (24-hour format)
    morningSlotStrings.forEach(slot => storageSlots.push(slot));
    eveningSlotStrings.forEach(slot => storageSlots.push(slot));

    if (displaySlots.length > 0) {
      setSelectedTimeSlots(displaySlots.join(', '));
      setFormData((prev) => ({ ...prev, timeslot: storageSlots.join(', ') }));
    } else {
      setSelectedTimeSlots(t("noSlotsSelected"));
      setFormData((prev) => ({ ...prev, timeslot: '' }));
    }
  }, [isFullTime, morningSlots, eveningSlots, t]);

  // Update slots when they change
  useEffect(() => {
    updateSelectedTimeSlots();
  }, [morningSlots, eveningSlots, isFullTime, updateSelectedTimeSlots]);

  const handleAddMorningSlot = () => {
    // Simply add a new slot with default morning range – no overlap check
    setMorningSlots(prevSlots => [...prevSlots, [6, 12]]);
  };

    const handleAddEveningSlot = () => {
    // Simply add a new slot with default evening range – no overlap check
    setEveningSlots(prevSlots => [...prevSlots, [12, 20]]);
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

  const handleRemoveMorningSlot = (index: number) => {
    const newSlots = morningSlots.filter((_, i) => i !== index);
    setMorningSlots(newSlots.length > 0 ? newSlots : []);
  };

  const handleRemoveEveningSlot = (index: number) => {
    const newSlots = eveningSlots.filter((_, i) => i !== index);
    setEveningSlots(newSlots.length > 0 ? newSlots : []);
  };

  const handleClearMorningSlots = () => {
    setMorningSlots([]);
  };

  const handleClearEveningSlots = () => {
    setEveningSlots([]);
  };
  // -----------------------------------------------------------

  const handleFullTimeToggle = (checked: boolean) => {
    setIsFullTime(checked);
    if (checked) {
      setMorningSlots([[6, 12]]);
      setEveningSlots([[12, 20]]);
    }
  };

  const handleImageSelect = (file: Blob | null) => {
    if (file) {
      setImage(file);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setIsSameAddress(checked);
    
    if (checked) {
      // Copy permanent address to correspondence address
      setFormData(prev => ({
        ...prev,
        correspondenceAddress: { ...prev.permanentAddress }
      }));
      
      // Clear correspondence address errors
      setErrors(prev => ({
        ...prev,
        correspondenceAddress: undefined
      }));
    }
  };

  const handleAddressChange = async (type: 'permanent' | 'correspondence', data: any) => {
    const newFormData = {
      ...formData,
      [type === 'permanent' ? 'permanentAddress' : 'correspondenceAddress']: data
    };
    
    // If isSameAddress is true and we're updating permanent address, also update correspondence address
    if (isSameAddress && type === 'permanent') {
      newFormData.correspondenceAddress = data;
    }
    
    setFormData(newFormData);

    // Clear address errors when address is being filled
    if (type === 'permanent') {
      setErrors(prev => ({
        ...prev,
        permanentAddress: undefined
      }));
    } else if (!isSameAddress) {
      setErrors(prev => ({
        ...prev,
        correspondenceAddress: undefined
      }));
    }

    // If permanent address is updated and isSameAddress is true, also clear correspondence errors
    if (type === 'permanent' && isSameAddress) {
      setErrors(prev => ({
        ...prev,
        correspondenceAddress: undefined
      }));
    }

    if (data.apartment && data.street && data.city && data.state && data.pincode) {
      try {
        const fullAddress = `${data.apartment}, ${data.street}, ${data.city}, ${data.state}, ${data.pincode}, ${data.country}`;
        
        const response = await axios.get(
          "https://maps.googleapis.com/maps/api/geocode/json",
          {
            params: {
              address: fullAddress,
              key: keys.api_key,
            },
          }
        );

        if (response.data.results && response.data.results.length > 0) {
          const location = response.data.results[0].geometry.location;
          const address = response.data.results[0].formatted_address;

          setFormData(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng,
            currentLocation: address,
            locality: data.city,
            street: data.street,
            pincode: data.pincode,
            buildingName: data.apartment
          }));

          if (type === 'permanent') {
            setCurrentLocation({
              latitude: location.lat,
              longitude: location.lng,
              address: address
            });
          }
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
        setSnackbarMessage(t("couldNotGetCoordinates"));
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
      }
    }
  };
const handleAgentReferralIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = e.target;
  setFormData(prev => ({
    ...prev,
    agentReferralId: value
  }));
};
  const { validationResults, validateField, resetValidation, isStep0ValidationsComplete } = useFieldValidation({ t });
  // Handler for KYC type change
  const handleKycTypeChange = (kycType: string) => {
    setFormData(prev => ({ 
      ...prev, 
      kycType,
      kycNumber: "" // Clear the number when type changes
    }));
    setErrors(prev => ({ 
      ...prev, 
      kycType: "",
      kycNumber: "" 
    }));
  };

  // Helper function to get KYC label
  const getKycLabel = (kycType: string): string => {
    const labels: Record<string, string> = {
      "AADHAR": t("aadhaarCard"),
      "PAN": t("panCard"),
      "DRIVING_LICENSE": t("drivingLicense"),
      "VOTER_ID": t("voterId"),
      "PASSPORT": t("passport")
    };
    return labels[kycType] || t("kyc");
  };

  // Add debounced validation functions
  const debouncedEmailValidation = useCallback(
    debounce((email: string) => {
      validateField('email', email);
    }, 500),
    [validateField]
  );

  const debouncedMobileValidation = useCallback(
    debounce((mobile: string) => {
      validateField('mobile', mobile);
    }, 500),
    [validateField]
  );

  const debouncedAlternateValidation = useCallback(
    debounce((alternate: string) => {
      validateField('alternate', alternate);
    }, 500),
    [validateField]
  );

  // Function to clear email field when cross icon is clicked
  const handleClearEmail = () => {
    setFormData(prev => ({ ...prev, emailId: "" }));
    setErrors(prev => ({ ...prev, emailId: undefined }));
    resetValidation('email');
  };

  // Function to clear mobile field when cross icon is clicked
  const handleClearMobile = () => {
    setFormData(prev => ({ ...prev, mobileNo: "" }));
    setErrors(prev => ({ ...prev, mobileNo: undefined }));
    resetValidation('mobile');
  };

  // Function to clear alternate mobile field when cross icon is clicked
  const handleClearAlternate = () => {
    setFormData(prev => ({ ...prev, AlternateNumber: "" }));
    setErrors(prev => ({ ...prev, AlternateNumber: undefined }));
    resetValidation('alternate');
  };

  // Helper function to check if step 0 is ready for next
  const isStep0ReadyForNext = () => {
    // Check if required fields are filled
    const requiredFieldsFilled = formData.firstName.trim() && 
                                 formData.lastName.trim() && 
                                 formData.gender && 
                                 formData.emailId.trim() && 
                                 formData.password.trim() && 
                                 formData.confirmPassword.trim() && 
                                 formData.mobileNo.trim() &&
                                 formData.dob.trim();

    // Check if there are any validation errors
    const hasValidationErrors = validationResults.email.error || 
                               validationResults.mobile.error ||
                               !validationResults.email.isAvailable ||
                               !validationResults.mobile.isAvailable ||
                               !!errors.dob;

    // Check if DOB is valid
    const isDobFieldValid = isDobValid && !errors.dob;

    return requiredFieldsFilled && !hasValidationErrors && isDobFieldValid;
  };

  // Validate age function
  const validateAge = (dob: string): { isValid: boolean; message: string } => {
    if (!dob) {
      return { isValid: false, message: t("dobRequired") };
    }

    const birthDate = moment(dob, "YYYY-MM-DD");
    const today = moment();
    const age = today.diff(birthDate, "years");

    if (age < 18) {
      return { isValid: false, message: t("ageRequirement") };
    }

    return { isValid: true, message: "" };
  };

  const handleRealTimeValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const aadhaarPattern = /^[0-9]{12}$/;

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    if (name === "firstName") {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: t("firstNameRequired"),
        }));
      } else if (!nameRegex.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: t("firstNameAlphabetsOnly"),
        }));
      } else if (trimmedValue.length > MAX_NAME_LENGTH) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: t("firstNameMaxLength").replace("{MAX_NAME_LENGTH}", MAX_NAME_LENGTH.toString()),
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: "",
        }));
      }
    }

    if (name === "lastName") {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: t("lastNameRequired"),
        }));
      } else if (!nameRegex.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: t("lastNameAlphabetsOnly"),
        }));
      } else if (trimmedValue.length > MAX_NAME_LENGTH) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: t("lastNameMaxLength").replace("{MAX_NAME_LENGTH}", MAX_NAME_LENGTH.toString()),
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: "",
        }));
      }
    }

    if (name === "password") {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: t("passwordRequired"),
        }));
      } else if (trimmedValue.length < 8) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: t("passwordMinLength"),
        }));
      } else if (!/[A-Z]/.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: t("passwordUppercase"),
        }));
      } else if (!/[a-z]/.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: t("passwordLowercase"),
        }));
      } else if (!/[0-9]/.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: t("passwordNumber"),
        }));
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: t("passwordSpecialChar"),
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "",
        }));
      }
    }

    if (name === "confirmPassword") {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: t("confirmPasswordRequired"),
        }));
      } else if (trimmedValue !== formData.password) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: t("passwordsDoNotMatch"),
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: "",
        }));
      }
    }

    if (name === "emailId") {
      const trimmedValue = value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!trimmedValue) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          emailId: t("emailRequired"),
        }));
        resetValidation('email');
      } else if (!emailPattern.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          emailId: t("emailInvalid"),
        }));
        resetValidation('email');
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          emailId: "",
        }));
        debouncedEmailValidation(trimmedValue);
      }
    }

    if (name === "mobileNo") {
      const trimmedValue = value.trim();
      const mobilePattern = /^[0-9]{10}$/;
      
      if (!trimmedValue) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          mobileNo: t("mobileRequired"),
        }));
        resetValidation('mobile');
      } else if (!mobilePattern.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          mobileNo: t("mobileInvalid"),
        }));
        resetValidation('mobile');
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          mobileNo: "",
        }));
        debouncedMobileValidation(trimmedValue);
      }
    }

    if (name === "AlternateNumber" && value) {
      const trimmedValue = value.trim();
      const mobilePattern = /^[0-9]{10}$/;
      
      if (trimmedValue && !mobilePattern.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          AlternateNumber: t("alternateInvalid"),
        }));
        resetValidation('alternate');
      } else if (trimmedValue === formData.mobileNo) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          AlternateNumber: t("alternateDifferent"),
        }));
        resetValidation('alternate');
      } else if (trimmedValue) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          AlternateNumber: "",
        }));
        debouncedAlternateValidation(trimmedValue);
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          AlternateNumber: "",
        }));
        resetValidation('alternate');
      }
    }

    if (name === "kycNumber") {
      const trimmedValue = value.trim();
      setFormData(prev => ({ ...prev, kycNumber: trimmedValue }));
      
      // Validate based on kycType
      if (trimmedValue) {
        let isValid = true;
        let errorMessage = "";
        
        switch(formData.kycType) {
          case "AADHAR":
            isValid = /^[0-9]{12}$/.test(trimmedValue);
            errorMessage = t("aadhaarInvalid");
            break;
          case "PAN":
            isValid = panRegex.test(trimmedValue);
            errorMessage = t("panInvalid");
            break;
          case "DRIVING_LICENSE":
            isValid = trimmedValue.length >= 8;
            errorMessage = t("drivingLicenseInvalid");
            break;
          case "VOTER_ID":
            isValid = voterIdRegex.test(trimmedValue);
            errorMessage = t("voterIdInvalid");
            break;
          case "PASSPORT":
            isValid = passportRegex.test(trimmedValue);
            errorMessage = t("passportInvalid");
            break;
        }
        
        if (!isValid) {
          setErrors(prev => ({ ...prev, kycNumber: errorMessage }));
        } else {
          setErrors(prev => ({ ...prev, kycNumber: "" }));
        }
      } else {
        setErrors(prev => ({ ...prev, kycNumber: t("kycNumberRequired").replace("{documentName}", getKycLabel(formData.kycType)) }));
      }
    }

    if (name === "pincode") {
      const numericValue = value.replace(/\D/g, "");
      const trimmedValue = numericValue.slice(0, 6);
      
      setFormData((prevData) => ({
        ...prevData,
        [name]: trimmedValue,
      }));

      if (!trimmedValue) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          pincode: t("pincodeRequired"),
        }));
      } else if (trimmedValue.length !== 6) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          pincode: t("pincodeInvalid"),
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          pincode: "",
        }));
      }
    }

    // Handle other fields
    if (name !== "pincode" && name !== "kycNumber" && name !== "AADHAR") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Separate handler for DOB field
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate DOB
    const { isValid, message } = validateAge(value);
    setIsDobValid(isValid);

    if (!isValid) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dob: message,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dob: "",
      }));
    }
  };

  // Clear specific error when field is focused
  const handleFieldFocus = (fieldName: string) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: ""
    }));
  };

  const handleCookingSpecialityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    setFormData((prevData) => ({ ...prevData, cookingSpeciality: value }));
    setErrors(prevErrors => ({ ...prevErrors, cookingSpeciality: "" }));
  };

  // Handler for nanny care type
  const handleNannyCareTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, nannyCareType: value }));
    setErrors(prev => ({ ...prev, nannyCareType: "" }));
  };

  const validateStep = (step: number): boolean => {
    let tempErrors: FormErrors = {};

    if (step === 0) {
      if (!formData.firstName.trim()) {
        tempErrors.firstName = t("firstNameRequired");
      } else if (!nameRegex.test(formData.firstName.trim())) {
        tempErrors.firstName = t("firstNameAlphabetsOnly");
      } else if (formData.firstName.length > MAX_NAME_LENGTH) {
        tempErrors.firstName = t("firstNameMaxLength").replace("{MAX_NAME_LENGTH}", MAX_NAME_LENGTH.toString());
      }

      if (!formData.lastName.trim()) {
        tempErrors.lastName = t("lastNameRequired");
      } else if (!nameRegex.test(formData.lastName.trim())) {
        tempErrors.lastName = t("lastNameAlphabetsOnly");
      } else if (formData.lastName.length > MAX_NAME_LENGTH) {
        tempErrors.lastName = t("lastNameMaxLength").replace("{MAX_NAME_LENGTH}", MAX_NAME_LENGTH.toString());
      }

      if (!formData.gender) {
        tempErrors.gender = t("genderRequired");
      }
      
      if (!formData.emailId.trim()) {
        tempErrors.emailId = t("emailRequired");
      } else if (!emailIdRegex.test(formData.emailId.trim())) {
        tempErrors.emailId = t("emailInvalid");
      } else if (validationResults.email.error) {
        tempErrors.emailId = validationResults.email.error;
      } else if (!validationResults.email.isAvailable) {
        tempErrors.emailId = t("emailNotAvailable");
      }
      
      if (!formData.password.trim()) {
        tempErrors.password = t("passwordRequired");
      } else if (!strongPasswordRegex.test(formData.password.trim())) {
        tempErrors.password = t("passwordComplexity");
      }
      
      if (!formData.confirmPassword.trim()) {
        tempErrors.confirmPassword = t("confirmPasswordRequired");
      } else if (formData.password.trim() !== formData.confirmPassword.trim()) {
        tempErrors.confirmPassword = t("passwordsDoNotMatch");
      }
      
      if (!formData.mobileNo.trim()) {
        tempErrors.mobileNo = t("mobileRequired");
      } else if (!phoneRegex.test(formData.mobileNo.trim())) {
        tempErrors.mobileNo = t("mobileInvalid");
      } else if (validationResults.mobile.error) {
        tempErrors.mobileNo = validationResults.mobile.error;
      } else if (!validationResults.mobile.isAvailable) {
        tempErrors.mobileNo = t("mobileNotAvailable");
      }
      
      // Validate alternate number if provided
      if (formData.AlternateNumber.trim()) {
        if (!phoneRegex.test(formData.AlternateNumber.trim())) {
          tempErrors.AlternateNumber = t("alternateInvalid");
        } else if (formData.AlternateNumber.trim() === formData.mobileNo.trim()) {
          tempErrors.AlternateNumber = t("alternateDifferent");
        } else if (!validationResults.alternate.isAvailable) {
          tempErrors.AlternateNumber = t("alternateNotAvailable");
        }
      }

      // Validate DOB
      if (!formData.dob.trim()) {
        tempErrors.dob = t("dobRequired");
      } else {
        const { isValid, message } = validateAge(formData.dob);
        if (!isValid) {
          tempErrors.dob = message;
        }
      }
    }

    if (step === 1) {
      const permanentErrors: any = {};
      if (!formData.permanentAddress.apartment?.trim()) {
        permanentErrors.apartment = t("apartmentRequired");
      }
      if (!formData.permanentAddress.street?.trim()) {
        permanentErrors.street = t("streetRequired");
      }
      if (!formData.permanentAddress.city?.trim()) {
        permanentErrors.city = t("cityRequired");
      }
      if (!formData.permanentAddress.state?.trim()) {
        permanentErrors.state = t("stateRequired");
      }
      if (!formData.permanentAddress.country?.trim()) {
        permanentErrors.country = t("countryRequired");
      }
      if (!formData.permanentAddress.pincode?.trim()) {
        permanentErrors.pincode = t("pincodeRequired");
      } else if (formData.permanentAddress.pincode.length !== 6) {
        permanentErrors.pincode = t("pincodeInvalid");
      }

      if (Object.keys(permanentErrors).length > 0) {
        tempErrors.permanentAddress = permanentErrors;
      }

      // Only validate correspondence address if not same as permanent
      if (!isSameAddress) {
        const correspondenceErrors: any = {};
        if (!formData.correspondenceAddress.apartment?.trim()) {
          correspondenceErrors.apartment = t("apartmentRequired");
        }
        if (!formData.correspondenceAddress.street?.trim()) {
          correspondenceErrors.street = t("streetRequired");
        }
        if (!formData.correspondenceAddress.city?.trim()) {
          correspondenceErrors.city = t("cityRequired");
        }
        if (!formData.correspondenceAddress.state?.trim()) {
          correspondenceErrors.state = t("stateRequired");
        }
        if (!formData.correspondenceAddress.country?.trim()) {
          correspondenceErrors.country = t("countryRequired");
        }
        if (!formData.correspondenceAddress.pincode?.trim()) {
          correspondenceErrors.pincode = t("pincodeRequired");
        } else if (formData.correspondenceAddress.pincode.length !== 6) {
          correspondenceErrors.pincode = t("pincodeInvalid");
        }

        if (Object.keys(correspondenceErrors).length > 0) {
          tempErrors.correspondenceAddress = correspondenceErrors;
        }
      }
    }

    if (step === 2) {
      if (formData.housekeepingRole.length === 0) {
        tempErrors.housekeepingRole = t("serviceTypeRequired");
      }
      if (formData.housekeepingRole.includes("COOK") && !formData.cookingSpeciality) {
        tempErrors.cookingSpeciality = t("cookingSpecialityRequired");
      }
      if (formData.housekeepingRole.includes("NANNY") && !formData.nannyCareType) {
        tempErrors.nannyCareType = t("nannyCareTypeRequired");
      }
      if (!formData.diet) {
        tempErrors.diet = t("dietRequired");
      }
      if (!formData.experience) {
        tempErrors.experience = t("experienceRequired");
      }
    }

    if (step === 3) {
      if (!formData.kycType) {
        tempErrors.kycType = t("kycTypeRequired");
      }
      if (!formData.kycNumber) {
        tempErrors.kycNumber = t("kycNumberRequired").replace("{documentName}", getKycLabel(formData.kycType));
      } else {
        // Add specific validation based on KYC type
        switch(formData.kycType) {
          case "AADHAR":
            if (!aadhaarRegex.test(formData.kycNumber)) {
              tempErrors.kycNumber = t("aadhaarInvalid");
            }
            break;
          case "PAN":
            if (!panRegex.test(formData.kycNumber)) {
              tempErrors.kycNumber = t("panInvalid");
            }
            break;
          case "DRIVING_LICENSE":
            if (formData.kycNumber.length < 8) {
              tempErrors.kycNumber = t("drivingLicenseInvalid");
            }
            break;
          case "VOTER_ID":
            if (!voterIdRegex.test(formData.kycNumber)) {
              tempErrors.kycNumber = t("voterIdInvalid");
            }
            break;
          case "PASSPORT":
            if (!passportRegex.test(formData.kycNumber)) {
              tempErrors.kycNumber = t("passportInvalid");
            }
            break;
        }
      }
      if (!formData.documentImage) {
        tempErrors.documentImage = t("documentImageRequired");
      }
    }

    if (step === 4) {
      if (!formData.keyFacts) {
        tempErrors.keyFacts = t("keyFactsRequired");
      }
      if (!formData.terms) {
        tempErrors.terms = t("termsRequired");
      }
      if (!formData.privacy) {
        tempErrors.privacy = t("privacyRequired");
      }
    }

    // Only set errors if there are any
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    // For step 0, check if validations are complete before proceeding
    if (activeStep === 0) {
      if (validationResults.email.loading || validationResults.mobile.loading) {
        setSnackbarMessage(t("pleaseWaitForValidation"));
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }
      
      // Validate the current step
      if (!validateStep(activeStep)) {
        return;
      }
      
      // Additional check for validation results
      if (!isStep0ReadyForNext()) {
        setSnackbarMessage(t("pleaseFixValidationErrors"));
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
    } else {
      // For other steps, just validate
      if (!validateStep(activeStep)) {
        return;
      }
    }
    
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
    if (activeStep === steps.length - 1) {
      setSnackbarMessage(t("registrationSuccessful"));
      setSnackbarOpen(true);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      onBackToLogin(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (activeStep !== steps.length - 1) return;

    if (validateStep(activeStep)) {
      setIsSubmitting(true);
      try {
        let profilePicUrl = "";

        if (image) {
          const formData1 = new FormData();
          formData1.append("image", image);

          const imageResponse = await axiosInstance.post(
            "http://65.2.153.173:3000/upload",
            formData1,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (imageResponse.status === 200) {
            profilePicUrl = imageResponse.data.imageUrl;
          }
        }
        
        const primaryRole = formData.housekeepingRole.length > 0 ? formData.housekeepingRole[0] : "";
        
        const payload = {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          mobileNo: parseInt(formData.mobileNo) || 0,
          alternateNo: parseInt(formData.AlternateNumber) || 0,
          emailId: formData.emailId,
          gender: formData.gender,
          buildingName: formData.buildingName,
          locality: formData.locality,
          latitude: currentLocation?.latitude || formData.latitude,
          longitude: currentLocation?.longitude || formData.longitude,
          street: formData.street,
          pincode: parseInt(formData.pincode) || 0,
          currentLocation: formData.currentLocation,
          nearbyLocation: formData.nearbyLocation,
          location: formData.currentLocation,
          housekeepingRoles: formData.housekeepingRole,
          serviceTypes: formData.housekeepingRole,
          diet: formData.diet,
          languages: selectedLanguages, // <-- ADDED LANGUAGES PARAMETER HERE
          ...(formData.housekeepingRole.includes("COOK") && {
            cookingSpeciality: formData.cookingSpeciality
          }),
          ...(formData.housekeepingRole.includes("NANNY") && {
            nannyCareType: formData.nannyCareType
          }),
          timeslot: formData.timeslot,
          expectedSalary: 0,
          experience: parseInt(formData.experience) || 0,
          username: formData.emailId,
          password: formData.password,
          agentReferralId: formData.agentReferralId, 
          privacy: formData.privacy,
          keyFacts: formData.keyFacts,
          permanentAddress: {
            field1: formData.permanentAddress.apartment,
            field2: formData.permanentAddress.street,
            ctarea: formData.permanentAddress.city,
            pinno: formData.permanentAddress.pincode,
            state: formData.permanentAddress.state,
            country: formData.permanentAddress.country
          },
          correspondenceAddress: {
            field1: formData.correspondenceAddress.apartment,
            field2: formData.correspondenceAddress.street,
            ctarea: formData.correspondenceAddress.city,
            pinno: formData.correspondenceAddress.pincode,
            state: formData.correspondenceAddress.state,
            country: formData.correspondenceAddress.country
          },
          active: true,
          kycType: formData.kycType,
          kycNumber: formData.kycNumber,
          dob: formData.dob
        };

        const response = await providerInstance.post(
          "/api/service-providers/serviceprovider/add",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setSnackbarOpen(true);
        setSnackbarSeverity("success");
        setSnackbarMessage(t("serviceProviderAdded"));

        const authPayload = {
          email: formData.emailId,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
        };

        axios.post('https://utils-ndt3.onrender.com/authO/create-autho-user', authPayload)
          .then((authResponse) => {
            console.log("AuthO user created successfully:", authResponse.data);
          }).catch((authError) => {
            console.error("Error creating AuthO user:", authError);
          });

        setTimeout(() => {
          setIsSubmitting(false);
          onBackToLogin(true);
        }, 3000);
      } catch (error) {
        setIsSubmitting(false);
        setSnackbarOpen(true);
        setSnackbarSeverity("error");
        setSnackbarMessage(t("failedToAddServiceProvider"));
        console.error("Error submitting form:", error);
      }
    } else {
      setIsSubmitting(false);
      setSnackbarOpen(true);
      setSnackbarSeverity("warning");
      setSnackbarMessage(t("fillRequiredFields"));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const fetchLocationData = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              "https://maps.googleapis.com/maps/api/geocode/json",
              {
                params: {
                  latlng: `${latitude},${longitude}`,
                  key: keys.api_key,
                },
              }
            );

            const locationData = response.data.results[0];
            const address = locationData.formatted_address || "";
            const components = locationData.address_components;

            let apartment = "", street = "", city = "", pincode = "", state = "", country = "";

            components.forEach((component: any) => {
              if (component.types.includes("street_number")) {
                apartment = component.long_name;
              } else if (component.types.includes("route")) {
                street = component.long_name;
              } else if (component.types.includes("locality") || component.types.includes("sublocality")) {
                city = component.long_name;
              } else if (component.types.includes("administrative_area_level_1")) {
                state = component.long_name;
              } else if (component.types.includes("country")) {
                country = component.long_name;
              } else if (component.types.includes("postal_code")) {
                pincode = component.long_name;
              }
            });

            if (!city) {
              const cityComponent = components.find((comp: any) =>
                comp.types.includes("locality") ||
                comp.types.includes("sublocality") ||
                comp.types.includes("administrative_area_level_2")
              );
              if (cityComponent) {
                city = cityComponent.long_name;
              }
            }

            const newAddress = {
              apartment: apartment || t("notSpecified"),
              street: street || t("notSpecified"),
              city: city || t("notSpecified"),
              state: state || t("notSpecified"),
              country: country || t("notSpecified"),
              pincode: pincode || ""
            };

            setCurrentLocation({
              latitude,
              longitude,
              address
            });

            setFormData(prev => ({
              ...prev,
              permanentAddress: newAddress,
              correspondenceAddress: newAddress,
              latitude,
              longitude,
              currentLocation: address,
              locality: city || "",
              street: street || "",
              pincode: pincode || "",
              buildingName: apartment || ""
            }));

            setIsSameAddress(true);

            setSnackbarMessage(t("locationFetchedSuccessfully"));
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

          } catch (error) {
            console.error("Error fetching location data", error);
            setSnackbarMessage(t("failedToFetchLocation"));
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          setSnackbarMessage(t("geolocationFailed"));
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setSnackbarMessage(t("geolocationNotSupported"));
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    }
  };

  const handledietChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData((prevData) => ({ ...prevData, diet: value }));
    setErrors(prevErrors => ({ ...prevErrors, diet: "" }));
  };

  const handleTermsChange = useCallback((allAccepted: boolean) => {
    setFormData(prev => ({
      ...prev,
      keyFacts: allAccepted,
      terms: allAccepted,
      privacy: allAccepted,
    }));
    
    if (allAccepted) {
      setErrors(prev => ({
        ...prev,
        keyFacts: "",
        terms: "",
        privacy: ""
      }));
    }
  }, []);

  // Handler for service type selection
  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let updatedRoles: string[];
    
    if (formData.housekeepingRole.includes(value)) {
      // Remove if already selected
      updatedRoles = formData.housekeepingRole.filter(role => role !== value);
      // Clear related fields when service is deselected
      if (value === "COOK") {
        setFormData(prev => ({ ...prev, cookingSpeciality: "" }));
      }
      if (value === "NANNY") {
        setFormData(prev => ({ ...prev, nannyCareType: "" }));
      }
    } else {
      // Add if not selected
      updatedRoles = [...formData.housekeepingRole, value];
    }
    
    setFormData(prev => ({ ...prev, housekeepingRole: updatedRoles }));
    setIsCookSelected(updatedRoles.includes("COOK"));
    setIsNannySelected(updatedRoles.includes("NANNY"));
    
    // Clear error if at least one role is selected
    if (updatedRoles.length > 0) {
      setErrors(prev => ({ ...prev, housekeepingRole: "" }));
    }
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, experience: value }));
    setErrors(prev => ({ ...prev, experience: "" }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BasicInformation
            formData={formData}
            errors={errors}
            validationResults={validationResults}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            isDobValid={isDobValid}
            onImageSelect={handleImageSelect}
            onFieldChange={handleRealTimeValidation}
            onFieldFocus={handleFieldFocus}
            onDobChange={handleDobChange}
            onTogglePasswordVisibility={handleTogglePasswordVisibility}
            onToggleConfirmPasswordVisibility={handleToggleConfirmPasswordVisibility}
            onClearEmail={handleClearEmail}
            onClearMobile={handleClearMobile}
            onClearAlternate={handleClearAlternate}
          />
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AddressComponent
                onAddressChange={handleAddressChange}
                onSameAddressToggle={handleSameAddressToggle}
                permanentAddress={formData.permanentAddress}
                correspondenceAddress={formData.correspondenceAddress}
                isSameAddress={isSameAddress}
                errors={{
                  permanent: errors.permanentAddress,
                  correspondence: errors.correspondenceAddress
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                    {t("currentLocation")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t("useGpsToFetchLocation")}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={fetchLocationData}
                      startIcon={<MyLocationIcon />}
                      sx={{ 
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      {t("fetchMyLocation")}
                    </Button>
                    
                    {(formData.latitude !== 0 || formData.longitude !== 0) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" />
                      </Box>
                    )}
                  </Box>
                  
                  {(formData.latitude !== 0 || formData.longitude !== 0) && (
                    <Alert 
                      severity="success" 
                      sx={{ mt: 2, borderRadius: 2 }}
                      icon={false}
                    >
                      <Typography variant="body2">
                        <strong>{t("addressDetected")}</strong> {formData.currentLocation || t("fetchingAddress")}
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
      <ServiceDetails
  formData={formData}
  errors={errors}
  isCookSelected={isCookSelected}
  isNannySelected={isNannySelected}
  morningSlots={morningSlots}
  eveningSlots={eveningSlots}
  isFullTime={isFullTime}
  selectedTimeSlots={selectedTimeSlots}
  onServiceTypeChange={handleServiceTypeChange}
  onCookingSpecialityChange={handleCookingSpecialityChange}
  onNannyCareTypeChange={handleNannyCareTypeChange}
  onDietChange={handledietChange}
  onExperienceChange={handleExperienceChange}
  onDescriptionChange={handleChange}
  onReferralCodeChange={handleChange}
  onAgentReferralIdChange={handleAgentReferralIdChange}
  onFullTimeToggle={handleFullTimeToggle}
  onAddMorningSlot={handleAddMorningSlot}
  onRemoveMorningSlot={handleRemoveMorningSlot}
  onClearMorningSlots={handleClearMorningSlots}
  onAddEveningSlot={handleAddEveningSlot}
  onRemoveEveningSlot={handleRemoveEveningSlot}
  onClearEveningSlots={handleClearEveningSlots}
  onMorningSlotChange={handleMorningSlotChange}
  onEveningSlotChange={handleEveningSlotChange}
  formatDisplayTime={formatDisplayTime}
  selectedLanguages={selectedLanguages}
  onLanguagesChange={setSelectedLanguages}
/>
        );
      
      case 3:
        return (
          <KYCVerification
            formData={formData}
            errors={errors}
            onFieldChange={handleRealTimeValidation}
            onFieldFocus={handleFieldFocus}
            onDocumentUpload={(file) => setFormData(prev => ({ ...prev, documentImage: file }))}
            onKycTypeChange={handleKycTypeChange}
          />
        );
      
      case 4:
        return (
          <Grid container spacing={1}>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography gutterBottom>
                {t("pleaseAgreeToFollowing")}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TermsCheckboxes onChange={handleTermsChange} />
              </Box>
            </Grid>
          </Grid>
        );
      
      default:
        return t("unknownStep");
    }
  };

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={true}>
        <DialogHeader
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ textAlign: 'center', paddingTop: 2 }}
          >
            {t("serviceProviderRegistration")}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => onBackToLogin(true)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#fff',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogHeader>

        <Box sx={{ padding: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (activeStep === steps.length - 1) {
              handleSubmit(e);
            }
          }}>
            {renderStepContent(activeStep)}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <Button
                onClick={handleBack}
                variant="contained"
                color="primary"
                startIcon={<ArrowBack />}
                disabled={activeStep === 0 || isSubmitting}
              >
                {t("back")}
              </Button>
              {activeStep === steps.length - 1 ? (
                <Tooltip
                  title={!(formData.terms && formData.privacy && formData.keyFacts)
                    ? t("checkTermsToEnableSubmit")
                    : ""
                  }
                >
                  <span>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={!(formData.terms && formData.privacy && formData.keyFacts) || isSubmitting}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        t("submit")
                      )}
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Tooltip
                  title={
                    activeStep === 0 && !isStep0ReadyForNext()
                      ? validationResults.email.loading || validationResults.mobile.loading
                        ? t("validatingEmailMobile")
                        : !isStep0ValidationsComplete() || !isDobValid
                        ? t("fixValidationErrors")
                        : t("completeAllRequiredFields")
                      : activeStep === 2 && formData.housekeepingRole.length === 0
                      ? t("pleaseSelectServiceType")
                      : activeStep === 3 && (!formData.kycNumber || !formData.documentImage)
                      ? t("pleaseCompleteKyc")
                      : ""
                  }
                >
                  <span>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNext();
                      }}
                      endIcon={<ArrowForward />}
                      disabled={
                        isSubmitting || 
                        (activeStep === 0 && !isStep0ReadyForNext()) ||
                        (activeStep === 2 && formData.housekeepingRole.length === 0)
                      }
                    >
                      {t("next")}
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Box>
          </form>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ marginTop: "60px" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbarSeverity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Dialog>
    </>
  );
};

export default ServiceProviderRegistration;