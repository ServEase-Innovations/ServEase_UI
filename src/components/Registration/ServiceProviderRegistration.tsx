/* eslint-disable */
import { IconButton } from "src/components/Button/icon-button";
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
  CircularProgress,  Tooltip,
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
  Map as MapIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useJsApiLoader } from "@react-google-maps/api";
import { keys } from "../../env/env";
import axiosInstance from "../../services/axiosInstance";
import { Button } from "../Button/button";
import AddressComponent from "./AddressComponent";
import { TermsCheckboxes } from "../Common/TermsCheckboxes/TermsCheckboxes";
import { debounce } from "src/utils/debounce";
import { useFieldValidation } from "./useFieldValidation";

// Import the components
import BasicInformation from "./BasicInformation";
import ServiceDetails from "./ServiceDetails";
import KYCVerification from "./KYCVerification";
import BankDetails, { BankDetailsData, BankDetailsErrors } from "./BankDetails";
import MapComponent from "../MapComponent/MapComponent";
import providerInstance from "src/services/providerInstance";
import { useLanguage } from "src/context/LanguageContext";
import { useAuth0 } from "@auth0/auth0-react";

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
  // NEW: Bank details
  bankDetails: BankDetailsData;
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
  // NEW: Bank details errors
  bankDetails?: BankDetailsErrors;
}

// Regex for validation - kept for optional format checks (if user enters data)
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
  const { t } = useLanguage();
  const { user: auth0User, isAuthenticated } = useAuth0();
  const auth0LoginEmail = (auth0User?.email ?? "").trim().toLowerCase();

  // Steps with translations - added Bank Details step
  const steps = [
    t("basicInformation"),
    t("addressInformation"),
    t("additionalDetails"),
    t("kycVerification"),
    t("bankDetails"),
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
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [pendingMapSelection, setPendingMapSelection] = useState<{
    lat: number;
    lng: number;
    locationData: any;
  } | null>(null);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useJsApiLoader({
    googleMapsApiKey: keys.api_key || "",
    libraries: ["places"],
  });

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
    // NEW: Bank details initial state
    bankDetails: {
      bankName: "",
      ifscCode: "",
      accountHolderName: "",
      accountNumber: "",
      accountType: "",
      upiId: ""
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [image, setImage] = useState<Blob | null>(null);

  const [kycDocumentFile, setKycDocumentFile] = useState<File | null>(null);

  // ============================================================
  // FIX: Helper to check if all mandatory agreements are accepted
  // ============================================================
  const areTermsAccepted = (): boolean => {
    return formData.terms && formData.privacy && formData.keyFacts;
  };

  // NEW: Handler for bank details field changes
  const handleBankFieldChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [name]: value
        }
      }));
      // Clear bank error for this field if any
      if (errors.bankDetails && errors.bankDetails[name as keyof BankDetailsErrors]) {
        setErrors(prev => ({
          ...prev,
          bankDetails: {
            ...prev.bankDetails,
            [name]: ""
          }
        }));
      }
    }
  };

  const handleBankFieldFocus = (fieldName: string) => {
    if (errors.bankDetails && errors.bankDetails[fieldName as keyof BankDetailsErrors]) {
      setErrors(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [fieldName]: ""
        }
      }));
    }
  };

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
  const normalizeSlots = (slots: number[][]): number[][] => {
    if (!slots.length) return [];

    // Normalize invalid ranges and sort by start time
    const sanitized = slots
      .filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end) && end > start)
      .map(([start, end]) => [Number(start), Number(end)] as number[])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    if (!sanitized.length) return [];

    // Remove exact duplicates, then merge only overlapping ranges (not adjacent)
    const unique: number[][] = [];
    sanitized.forEach(([start, end]) => {
      const last = unique[unique.length - 1];
      if (!last || last[0] !== start || last[1] !== end) {
        unique.push([start, end]);
      }
    });

    const merged: number[][] = [unique[0]];
    for (let i = 1; i < unique.length; i++) {
      const [start, end] = unique[i];
      const last = merged[merged.length - 1];

      if (start < last[1]) {
        last[1] = Math.max(last[1], end);
      } else {
        merged.push([start, end]);
      }
    }

    return merged;
  };

  const updateSelectedTimeSlots = useCallback(() => {
    if (isFullTime) {
      setSelectedTimeSlots(t("fullDay"));
      setFormData((prev) => ({ ...prev, timeslot: "06:00-20:00" }));
      return;
    }

    const normalizedSlots = normalizeSlots([...morningSlots, ...eveningSlots]);

    const normalizedSlotStrings = normalizedSlots.map(([start, end]) =>
      `${formatTimeForStorage(start)}-${formatTimeForStorage(end)}`
    );

    let displaySlots: string[] = [];
    let storageSlots: string[] = [];

    // Format for display (with AM/PM)
    normalizedSlots.forEach(([start, end]) => {
      displaySlots.push(`${formatDisplayTime(start)} - ${formatDisplayTime(end)}`);
    });

    // Format for storage (24-hour format)
    normalizedSlotStrings.forEach(slot => storageSlots.push(slot));

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

  const handleKycDocumentSelect = (file: File | null) => {
    setKycDocumentFile(file);
    if (file) {
      setSnackbarMessage(t("kycDocumentSelected") || "Document selected");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
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

  useEffect(() => {
    if (!auth0LoginEmail) return;
    setFormData((prev) => ({
      ...prev,
      emailId: auth0LoginEmail,
    }));
    validateField("email", auth0LoginEmail);
  }, [auth0LoginEmail, validateField]);

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

  // Helper function to check if step 0 is ready for next - **NOW ALWAYS TRUE**
  const isStep0ReadyForNext = () => {
    // All fields are optional - always allow next
    return true;
  };

  // Validate age function - kept for informational purposes only (not blocking)
  const validateAge = (dob: string): { isValid: boolean; message: string } => {
    if (!dob) {
      return { isValid: true, message: "" }; // No error if empty
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
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    if (name === "firstName" && value.trim()) {
      const trimmedValue = value.trim();
      if (!nameRegex.test(trimmedValue)) {
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

    if (name === "lastName" && value.trim()) {
      const trimmedValue = value.trim();
      if (!nameRegex.test(trimmedValue)) {
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

    if (name === "password" && value.trim()) {
      const trimmedValue = value.trim();
      if (trimmedValue.length < 8) {
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

    if (name === "confirmPassword" && value.trim()) {
      const trimmedValue = value.trim();
      if (trimmedValue !== formData.password) {
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

    if (name === "emailId" && value.trim()) {
      const trimmedValue = value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(trimmedValue)) {
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
    } else if (name === "emailId" && !value.trim()) {
      resetValidation('email');
    }

    if (name === "mobileNo" && value.trim()) {
      const trimmedValue = value.trim();
      const mobilePattern = /^[0-9]{10}$/;

      if (!mobilePattern.test(trimmedValue)) {
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
    } else if (name === "mobileNo" && !value.trim()) {
      resetValidation('mobile');
    }

    if (name === "AlternateNumber" && value.trim()) {
      const trimmedValue = value.trim();
      const mobilePattern = /^[0-9]{10}$/;

      if (!mobilePattern.test(trimmedValue)) {
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
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          AlternateNumber: "",
        }));
        debouncedAlternateValidation(trimmedValue);
      }
    } else if (name === "AlternateNumber" && !value.trim()) {
      resetValidation('alternate');
    }

    if (name === "kycNumber" && value.trim()) {
      const trimmedValue = value.trim();
      setFormData(prev => ({ ...prev, kycNumber: trimmedValue }));

      // Validate based on kycType
      let isValid = true;
      let errorMessage = "";

      switch (formData.kycType) {
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
    } else if (name === "kycNumber" && !value.trim()) {
      setErrors(prev => ({ ...prev, kycNumber: "" }));
    }

    if (name === "pincode") {
      const numericValue = value.replace(/\D/g, "");
      const trimmedValue = numericValue.slice(0, 6);

      setFormData((prevData) => ({
        ...prevData,
        [name]: trimmedValue,
      }));

      if (trimmedValue && trimmedValue.length !== 6) {
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

    // Validate DOB (optional, just for UX)
    const { isValid, message } = validateAge(value);
    setIsDobValid(isValid);

    if (!isValid && value.trim()) {
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

  // ============================================================
  // VALIDATION IS NOW DISABLED FOR ALL STEPS
  // ============================================================
  const validateStep = (step: number): boolean => {
    // All steps are always valid - no required fields
    return true;
  };

  const handleNext = () => {
    // No validation needed - just proceed
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

    // ============================================================
    // FIX: Guard — do not submit if terms are not accepted
    // ============================================================
    if (!areTermsAccepted()) {
      setSnackbarMessage(
        t("pleaseAcceptAllAgreements") ||
          "Please accept all agreements before submitting."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      let profilePicUrl = "";

      // 1. Upload profile image if any
      if (image) {
        const formData1 = new FormData();
        formData1.append("image", image);

        const imageResponse = await axios.post(
          "https://imageuploader-5njj.onrender.com/api/images/upload",
          formData1,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (imageResponse.status === 200) {
          profilePicUrl = imageResponse.data.imageUrl || imageResponse.data.url || "";
        }
      }

      // 2. Upload KYC document if a file was selected
      let uploadedKycUrl = "";
      if (kycDocumentFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", kycDocumentFile);

        const uploadResponse = await axios.post(
          "https://imageuploader-5njj.onrender.com/api/files/upload-file",
          uploadFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Accept both 200 and 201 status codes
        if (uploadResponse.status === 200 || uploadResponse.status === 201) {
          const url = uploadResponse.data.file?.url || "";
          if (url) {
            uploadedKycUrl = url;
          } else {
            throw new Error("No URL returned from KYC upload");
          }
        } else {
          throw new Error("KYC upload failed");
        }
      }

      // 3. Prepare the registration payload
      const primaryRole = formData.housekeepingRole.length > 0 ? formData.housekeepingRole[0] : "";

      // Prepare bank details object (only include non-empty fields)
      const bankDetailsPayload = Object.fromEntries(
        Object.entries(formData.bankDetails).filter(([_, v]) => v && v.trim() !== "")
      );

      // Helper to convert empty strings to null
      const toNull = (value: any) => (value === "" ? null : value);

      const registrationEmail = (
        isAuthenticated && auth0LoginEmail
          ? auth0LoginEmail
          : (formData.emailId || "").trim().toLowerCase()
      );
      if (!registrationEmail) {
        setIsSubmitting(false);
        setSnackbarOpen(true);
        setSnackbarSeverity("error");
        setSnackbarMessage(
          t("emailRequired") ||
            "Email is required. Sign in with Auth0 first or enter the same email you will use to log in."
        );
        return;
      }

      const payload = {
        firstName: toNull(formData.firstName),
        middleName: toNull(formData.middleName),
        lastName: toNull(formData.lastName),
        mobileNo: formData.mobileNo ? parseInt(formData.mobileNo) : null,
        alternateNo: formData.AlternateNumber ? parseInt(formData.AlternateNumber) : null,
        emailId: registrationEmail,
        gender: toNull(formData.gender),
        buildingName: toNull(formData.buildingName),
        locality: toNull(formData.locality),
        latitude: currentLocation?.latitude || formData.latitude || null,
        longitude: currentLocation?.longitude || formData.longitude || null,
        street: toNull(formData.street),
        pincode: formData.pincode ? parseInt(formData.pincode) : null,
        currentLocation: toNull(formData.currentLocation),
        nearbyLocation: toNull(formData.nearbyLocation),
        location: toNull(formData.currentLocation),
        housekeepingRoles: formData.housekeepingRole.length ? formData.housekeepingRole : null,
        serviceTypes: formData.housekeepingRole.length ? formData.housekeepingRole : null,
        diet: toNull(formData.diet),
        languages: selectedLanguages.length ? selectedLanguages : null,
        ...(formData.housekeepingRole.includes("COOK") && formData.cookingSpeciality && {
          cookingSpeciality: formData.cookingSpeciality
        }),
        ...(formData.housekeepingRole.includes("NANNY") && formData.nannyCareType && {
          nannyCareType: formData.nannyCareType
        }),
        timeslot: toNull(formData.timeslot),
        expectedSalary: 0,
        experience: formData.experience ? parseInt(formData.experience) : null,
        username: registrationEmail,
        password: toNull(formData.password),
        agentReferralId: toNull(formData.agentReferralId),
        privacy: formData.privacy || false,
        keyFacts: formData.keyFacts || false,
        permanentAddress: {
          field1: toNull(formData.permanentAddress.apartment),
          field2: toNull(formData.permanentAddress.street),
          ctarea: toNull(formData.permanentAddress.city),
          pinno: toNull(formData.permanentAddress.pincode),
          state: toNull(formData.permanentAddress.state),
          country: toNull(formData.permanentAddress.country)
        },
        correspondenceAddress: {
          field1: toNull(formData.correspondenceAddress.apartment),
          field2: toNull(formData.correspondenceAddress.street),
          ctarea: toNull(formData.correspondenceAddress.city),
          pinno: toNull(formData.correspondenceAddress.pincode),
          state: toNull(formData.correspondenceAddress.state),
          country: toNull(formData.correspondenceAddress.country)
        },
        active: true,
        kycType: toNull(formData.kycType),
        kycNumber: toNull(formData.kycNumber),
        kycDocumentUrl: uploadedKycUrl || null,
        dob: toNull(formData.dob),
        bankName: toNull(formData.bankDetails.bankName),
        ifscCode: toNull(formData.bankDetails.ifscCode),
        accountHolderName: toNull(formData.bankDetails.accountHolderName),
        accountNumber: toNull(formData.bankDetails.accountNumber),
        accountType: toNull(formData.bankDetails.accountType),
        upiId: toNull(formData.bankDetails.upiId),
      };

      // 4. Submit registration
      const response = await providerInstance.post(
        "/api/service-providers/serviceprovider/add",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const created =
        response.data?.data ??
        response.data;
      const spId =
        created?.serviceProviderId ??
        created?.serviceproviderid ??
        created?.id;
      if (spId != null && isAuthenticated && auth0LoginEmail) {
        const storedEmail = String(created?.emailId ?? created?.emailid ?? "").toLowerCase();
        if (storedEmail !== auth0LoginEmail) {
          await providerInstance.put(`/api/service-providers/serviceprovider/${spId}`, {
            emailId: auth0LoginEmail,
          });
        }
      }

      setSnackbarOpen(true);
      setSnackbarSeverity("success");
      setSnackbarMessage(t("serviceProviderAdded"));

      // 5. Create Auth0 user if email and password provided
      if (registrationEmail && formData.password) {
        const authPayload = {
          email: registrationEmail,
          password: formData.password,
          name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || "Service Provider",
        };

        axios.post('https://utils-ndt3.onrender.com/authO/create-autho-user', authPayload)
          .then((authResponse) => {
            console.log("AuthO user created successfully:", authResponse.data);
          }).catch((authError) => {
            console.error("Error creating AuthO user:", authError);
          });
      }

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

  const applySelectedLocation = (latitude: number, longitude: number, locationData: any) => {
    const address = locationData?.formatted_address || "";
    const components = locationData?.address_components || [];
    let apartment = "";
    let street = "";
    let city = "";
    let pincode = "";
    let state = "";
    let country = "";

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
      if (cityComponent) city = cityComponent.long_name;
    }

    const newAddress = {
      apartment: apartment || t("notSpecified"),
      street: street || t("notSpecified"),
      city: city || t("notSpecified"),
      state: state || t("notSpecified"),
      country: country || t("notSpecified"),
      pincode: pincode || "",
    };

    setCurrentLocation({
      latitude,
      longitude,
      address,
    });

    setFormData((prev) => ({
      ...prev,
      permanentAddress: newAddress,
      correspondenceAddress: newAddress,
      latitude,
      longitude,
      currentLocation: address,
      locality: city || "",
      street: street || "",
      pincode: pincode || "",
      buildingName: apartment || "",
    }));

    setIsSameAddress(true);
  };

  const handleMapLocationSelect = (data: { address: any; lat: number; lng: number }) => {
    const locationData = Array.isArray(data.address) ? data.address[0] : data.address;
    setPendingMapSelection({
      lat: data.lat,
      lng: data.lng,
      locationData,
    });
  };

  const handleSaveMapSelection = () => {
    if (!pendingMapSelection) {
      setSnackbarMessage("Please select a location from map first");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    applySelectedLocation(
      pendingMapSelection.lat,
      pendingMapSelection.lng,
      pendingMapSelection.locationData
    );
    setMapPickerOpen(false);
    setPendingMapSelection(null);
    setSnackbarMessage("Location saved to address fields");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
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
            lockAuth0Email={Boolean(auth0LoginEmail)}
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
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setPendingMapSelection(null);
                        setMapPickerOpen(true);
                      }}
                      startIcon={<MapIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Select from map
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
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        lat: {formData.latitude.toFixed(6)} | lng: {formData.longitude.toFixed(6)}
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
            onFileSelect={handleKycDocumentSelect}
            onKycTypeChange={handleKycTypeChange}
            selectedFile={kycDocumentFile}
          />
        );

      // NEW: Bank Details step
      case 4:
        return (
          <BankDetails
            formData={formData.bankDetails}
            errors={errors.bankDetails || {}}
            onFieldChange={handleBankFieldChange}
            onFieldFocus={handleBankFieldFocus}
          />
        );

      case 5:
        return (
          <Grid container spacing={1}>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography gutterBottom>
                {t("pleaseAgreeToFollowing")}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TermsCheckboxes onChange={handleTermsChange} />
              </Box>

              {/* ============================================================
                  FIX: Show inline hint when agreements are not yet accepted
                  ============================================================ */}
              {!areTermsAccepted() && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  {t("pleaseAcceptAllAgreements") ||
                    "Please accept all agreements above to enable the Submit button."}
                </Alert>
              )}
            </Grid>
          </Grid>
        );

      default:
        return t("unknownStep");
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        open
        onClose={() => onBackToLogin(true)}
        scroll="paper"
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(15, 23, 42, 0.55)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxHeight: "min(92vh, 880px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255,255,255,0.12)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: { xs: 2, sm: 3 },
            py: 2,
            background: "linear-gradient(90deg, #020617 0%, #0b2a5c 45%, #0c4a6e 100%)",
            color: "#fff",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t("serviceProviderRegistration")}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => onBackToLogin(true)}
            edge="end"
            sx={{
              color: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(255,255,255,0.2)",
              bgcolor: "rgba(255,255,255,0.08)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            px: { xs: 2, sm: 3 },
            pt: 2.5,
            pb: 2,
            background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 28%)",
          }}
        >
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: 2.5,
              "& .MuiStepLabel-label": { fontSize: { xs: "0.7rem", sm: "0.8rem" }, fontWeight: 500 },
              "& .MuiStepLabel-label.Mui-active": { color: "primary.main", fontWeight: 700 },
              "& .MuiStepLabel-label.Mui-completed": { color: "text.secondary" },
              "& .MuiStepConnector-line": { borderTopWidth: 2, borderColor: "divider" },
              "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": { borderColor: "primary.main" },
              "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": { borderColor: "success.light" },
            }}
          >
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (activeStep === steps.length - 1) {
                handleSubmit(e);
              }
            }}
          >
            {renderStepContent(activeStep)}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                mt: 3,
                pt: 2.5,
                borderTop: "1px solid",
                borderColor: "divider",
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
                // ============================================================
                // FIX: Disable Submit until all agreements are accepted.
                // Wrap in a span so Tooltip works on a disabled button.
                // ============================================================
                <Tooltip
                  title={
                    !areTermsAccepted()
                      ? t("pleaseAcceptAllAgreements") ||
                        "Please accept all agreements to submit"
                      : ""
                  }
                  placement="top"
                >
                  <span>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || !areTermsAccepted()}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} sx={{ color: "white" }} />
                      ) : (
                        t("submit")
                      )}
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  endIcon={<ArrowForward />}
                  disabled={isSubmitting}
                >
                  {t("next")}
                </Button>
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
      <Dialog
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Select location from map
          </Typography>
          <IconButton onClick={() => setMapPickerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          {mapLoadError ? (
            <Alert severity="error">Failed to load map. Please check API key.</Alert>
          ) : !isMapLoaded ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ height: 420, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
              <MapComponent
                style={{ width: "100%", height: "100%" }}
                onLocationSelect={handleMapLocationSelect}
              />
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Click on the map to choose the exact service address, then press Save location.
          </Typography>
          {pendingMapSelection && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              Selected: {pendingMapSelection.lat.toFixed(6)}, {pendingMapSelection.lng.toFixed(6)}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button variant="outlined" color="primary" onClick={() => setMapPickerOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveMapSelection}
              disabled={!pendingMapSelection}
            >
              Save location
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default ServiceProviderRegistration;
