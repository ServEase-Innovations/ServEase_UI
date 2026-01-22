/* eslint-disable */

import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
import {
  TextField,
  Input,
  InputAdornment,
  IconButton,
  Grid,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Alert,
  AlertColor,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  FormHelperText,
  FormGroup,
  Slider,
  Autocomplete,
  Tooltip,
  Snackbar,
  Dialog,
  CircularProgress,
  CardContent,
  Card,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  ArrowBack,
} from "@mui/icons-material";
import ProfileImageUpload from "./ProfileImageUpload";
import axios from "axios";
import { keys } from "../../env/env";
import axiosInstance from "../../services/axiosInstance";
import { Button } from "../Button/button";
import CustomFileInput from "./CustomFileInput";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Close as CloseIcon } from "@mui/icons-material";
import AddressComponent from "./AddressComponent";
import { TermsCheckboxes } from "../Common/TermsCheckboxes/TermsCheckboxes";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { debounce } from "src/utils/debounce";
import { useFieldValidation } from "./useFieldValidation";
import {  CheckIcon } from "lucide-react";
import {
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  ContentCopy as CopyIcon,
  MyLocation as MyLocationIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
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
  buildingName: string; // Add back
  locality: string; // Add back
  street: string; // Add back
  currentLocation: string; // Add back
  nearbyLocation: string; // Add back
  pincode: string; // Add back
  latitude: number;
  longitude: number;
  AADHAR: string;
  pan: string;
  panImage: File | null;
  housekeepingRole: string;
  description: string;
  experience: string;
  kyc: string;
  documentImage: File | null;
  otherDetails: string;
  profileImage: File | null;
  cookingSpeciality: string;
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
  diet?: string;
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
const MAX_NAME_LENGTH = 30;

const steps = [
  "Basic Information",
  "Address Information",
  "Additional Details",
  "KYC Verification",
  "Confirmation",
];

interface RegistrationProps {
  onBackToLogin: (data: boolean) => void;
}

const ServiceProviderRegistration: React.FC<RegistrationProps> = ({
  onBackToLogin,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isFieldsDisabled, setIsFieldsDisabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");
  const [sliderDisabled, setSliderDisabled] = useState(true);
  const [sliderValueMorning, setSliderValueMorning] = useState([6, 12]);
  const [sliderValueEvening, setSliderValueEvening] = useState([12, 20]);
  const [isCookSelected, setIsCookSelected] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

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
    buildingName: "", // Add back
    locality: "", // Add back
    street: "", // Add back
    currentLocation: "", // Add back
    nearbyLocation: "", // Add back
    pincode: "", // Add back
    latitude: 0,
    longitude: 0,
    AADHAR: "",
    pan: "",
    panImage: null,
    housekeepingRole: "",
    description: "",
    experience: "",
    kyc: "AADHAR",
    documentImage: null,
    otherDetails: "",
    profileImage: null,
    cookingSpeciality: "",
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
  };
const handleAddressChange = async (type: 'permanent' | 'correspondence', data: any) => {
  // First update the form data
  setFormData(prev => ({
    ...prev,
    [type === 'permanent' ? 'permanentAddress' : 'correspondenceAddress']: data
  }));

  // Geocode the address to get coordinates
  if (data.apartment && data.street && data.city && data.state && data.pincode) {
    try {
      const fullAddress = `${data.apartment}, ${data.street}, ${data.city}, ${data.state}, ${data.pincode}, ${data.country}`;
      
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: fullAddress,
            key: keys.api_key, // Your Google Maps API key
          },
        }
      );

      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        const address = response.data.results[0].formatted_address;

        // Update coordinates and address
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

        // Also update current location state if needed
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
      // Optional: Show error to user
      setSnackbarMessage("Could not get coordinates for this address. Please check the address details.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    }
  }
};

  const { validationResults, validateField, resetValidation } = useFieldValidation();

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
    setErrors(prev => ({ ...prev, emailId: "" }));
    resetValidation('email');
  };

  // Function to clear mobile field when cross icon is clicked
  const handleClearMobile = () => {
    setFormData(prev => ({ ...prev, mobileNo: "" }));
    setErrors(prev => ({ ...prev, mobileNo: "" }));
    resetValidation('mobile');
  };

  // Function to clear alternate mobile field when cross icon is clicked
  const handleClearAlternate = () => {
    setFormData(prev => ({ ...prev, AlternateNumber: "" }));
    setErrors(prev => ({ ...prev, AlternateNumber: "" }));
    resetValidation('alternate');
  };

  const handleRealTimeValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const aadhaarPattern = /^[0-9]{12}$/;

    if (name === "firstName") {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: "First Name is required.",
        }));
      } else if (!nameRegex.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: "First Name should contain only alphabets.",
        }));
      } else if (trimmedValue.length > MAX_NAME_LENGTH) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: `First Name should not exceed ${MAX_NAME_LENGTH} characters.`,
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: "",
        }));
      }
    }

    if (name === "lastName") {
      if (!value.trim()) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: "Last Name is required.",
        }));
      } else if (!nameRegex.test(value.trim())) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: "Last Name should contain only alphabets.",
        }));
      } else if (value.length > MAX_NAME_LENGTH) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: `Last Name should not exceed ${MAX_NAME_LENGTH} characters.`,
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: "",
        }));
      }
    }

    if (name === "password") {
      if (value.length < 8) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password must be at least 8 characters long.",
        }));
      } else if (!/[A-Z]/.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password must contain at least one uppercase letter.",
        }));
      } else if (!/[a-z]/.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password must contain at least one lowercase letter.",
        }));
      } else if (!/[0-9]/.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password must contain at least one digit.",
        }));
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password must contain at least one special character.",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "",
        }));
      }
    }

    if (name === "confirmPassword") {
      if (value !== formData.password) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: "",
        }));
      }
    }

    if (name === "emailId") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          emailId: "Please enter a valid email address.",
        }));
        resetValidation('email');
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          emailId: "",
        }));
        // Trigger debounced email validation
        debouncedEmailValidation(value);
      }
    }

    if (name === "mobileNo") {
      const mobilePattern = /^[0-9]{10}$/;
      if (!mobilePattern.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          mobileNo: "Please enter a valid 10-digit mobile number.",
        }));
        resetValidation('mobile');
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          mobileNo: "",
        }));
        // Trigger debounced mobile validation
        debouncedMobileValidation(value);
      }
    }

    if (name === "AlternateNumber" && value) {
      const mobilePattern = /^[0-9]{10}$/;
      if (!mobilePattern.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          AlternateNumber: "Please enter a valid 10-digit mobile number.",
        }));
        resetValidation('alternate');
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          AlternateNumber: "",
        }));
        // Trigger debounced alternate number validation
        debouncedAlternateValidation(value);
      }
    }

    if (name === "AADHAR") {
      if (!aadhaarPattern.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          AADHAR: "AADHAR number must be exactly 12 digits.",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          AADHAR: "",
        }));
      }
    }

    if (name === "pincode") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prevData) => ({
        ...prevData,
        [name]: numericValue.slice(0, 6),
      }));

      if (numericValue.length !== 6) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          pincode: "Pincode must be exactly 6 digits.",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          pincode: "",
        }));
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCookingSpecialityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    setFormData((prevData) => ({ ...prevData, cookingSpeciality: value }));
  };

  const validateForm = (): boolean => {
    let tempErrors: FormErrors = {};

    if (activeStep === 0) {
      if (!formData.firstName) {
        tempErrors.firstName = "First Name is required.";
      } else if (!nameRegex.test(formData.firstName)) {
        tempErrors.firstName = "First Name should contain only alphabets.";
      } else if (formData.firstName.length > MAX_NAME_LENGTH) {
        tempErrors.firstName = `First Name should be under ${MAX_NAME_LENGTH} characters.`;
      }

      if (!formData.lastName) {
        tempErrors.lastName = "Last Name is required.";
      } else if (!nameRegex.test(formData.lastName)) {
        tempErrors.lastName = "Last Name should contain only alphabets.";
      } else if (formData.lastName.length > MAX_NAME_LENGTH) {
        tempErrors.lastName = `Last Name should be under ${MAX_NAME_LENGTH} characters.`;
      }

      if (!formData.gender) {
        tempErrors.gender = "Please select a gender.";
      }
      if (validationResults.email.error) {
        tempErrors.emailId = validationResults.email.error;
      }
      if (!formData.password || !strongPasswordRegex.test(formData.password)) {
        tempErrors.password = "Password is required.";
      }
      if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = "Passwords do not match.";
      }
      if (validationResults.mobile.error) {
        tempErrors.mobileNo = validationResults.mobile.error;
      }
    }

    if (activeStep === 1) {
      // Validate permanent address
      if (!formData.permanentAddress.apartment) {
        tempErrors.permanentAddress = { ...tempErrors.permanentAddress, apartment: "Apartment is required." };
      }
      if (!formData.permanentAddress.street) {
        tempErrors.permanentAddress = { ...tempErrors.permanentAddress, street: "Street is required." };
      }
      if (!formData.permanentAddress.city) {
        tempErrors.permanentAddress = { ...tempErrors.permanentAddress, city: "City is required." };
      }
      if (!formData.permanentAddress.state) {
        tempErrors.permanentAddress = { ...tempErrors.permanentAddress, state: "State is required." };
      }
      if (!formData.permanentAddress.country) {
        tempErrors.permanentAddress = { ...tempErrors.permanentAddress, country: "Country is required." };
      }
      if (!formData.permanentAddress.pincode) {
        tempErrors.permanentAddress = { ...tempErrors.permanentAddress, pincode: "Pincode is required." };
      } else if (formData.permanentAddress.pincode.length !== 6) {
        tempErrors.permanentAddress = { ...tempErrors.permanentAddress, pincode: "Pincode must be exactly 6 digits." };
      }

      // Validate correspondence address only if it's different from permanent address
      const isSameAddress =
        formData.permanentAddress.apartment === formData.correspondenceAddress.apartment &&
        formData.permanentAddress.street === formData.correspondenceAddress.street &&
        formData.permanentAddress.city === formData.correspondenceAddress.city &&
        formData.permanentAddress.state === formData.correspondenceAddress.state &&
        formData.permanentAddress.country === formData.correspondenceAddress.country &&
        formData.permanentAddress.pincode === formData.correspondenceAddress.pincode;

      if (!isSameAddress) {
        if (!formData.correspondenceAddress.apartment) {
          tempErrors.correspondenceAddress = { ...tempErrors.correspondenceAddress, apartment: "Apartment is required." };
        }
        if (!formData.correspondenceAddress.street) {
          tempErrors.correspondenceAddress = { ...tempErrors.correspondenceAddress, street: "Street is required." };
        }
        if (!formData.correspondenceAddress.city) {
          tempErrors.correspondenceAddress = { ...tempErrors.correspondenceAddress, city: "City is required." };
        }
        if (!formData.correspondenceAddress.state) {
          tempErrors.correspondenceAddress = { ...tempErrors.correspondenceAddress, state: "State is required." };
        }
        if (!formData.correspondenceAddress.country) {
          tempErrors.correspondenceAddress = { ...tempErrors.correspondenceAddress, country: "Country is required." };
        }
        if (!formData.correspondenceAddress.pincode) {
          tempErrors.correspondenceAddress = { ...tempErrors.correspondenceAddress, pincode: "Pincode is required." };
        } else if (formData.correspondenceAddress.pincode.length !== 6) {
          tempErrors.correspondenceAddress = { ...tempErrors.correspondenceAddress, pincode: "Pincode must be exactly 6 digits." };
        }
      }
    }

    if (activeStep === 2) {
      if (!formData.housekeepingRole) {
        tempErrors.housekeepingRole = "Please select a service type.";
      }
      if (formData.housekeepingRole === "COOK" && !formData.cookingSpeciality) {
        tempErrors.cookingSpeciality =
          "Please select a speciality for the cook service.";
      }
      if (!formData.diet) {
        tempErrors.diet = "Please select diet.";
      }
      if (!formData.experience) {
        tempErrors.experience = "Please select experience.";
      }
    }

    if (activeStep === 3) {
      if (!formData.AADHAR || !aadhaarRegex.test(formData.AADHAR)) {
        tempErrors.kyc = "Aadhaar number must be exactly 12 digits.";
      }
    }

    if (activeStep === 4) {
      if (!formData.keyFacts) {
        tempErrors.keyFacts = "You must agree to the Key Facts Document";
      }
      if (!formData.terms) {
        tempErrors.terms = "You must agree to the Terms and Conditions";
      }
      if (!formData.privacy) {
        tempErrors.privacy = "You must agree to the Privacy Policy";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
      if (activeStep === steps.length - 1) {
        setSnackbarMessage("Registration Successful!");
        setSnackbarOpen(true);
      }
    }
  };

  const handleChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
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

    if (validateForm()) {
      setIsSubmitting(true); // Start loading
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
        // Prepare the payload with conditional cookingSpeciality
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
          housekeepingRole: formData.housekeepingRole,
          diet: formData.diet,
          ...(formData.housekeepingRole === "COOK" && {
            cookingSpeciality: formData.cookingSpeciality
          }),
          timeslot: formData.timeslot,
          expectedSalary: 0,
          experience: parseInt(formData.experience) || 0,
          username: formData.emailId,
          password: formData.password,
          privacy: formData.privacy,
          keyFacts: formData.keyFacts,
          permanentAddress: {
            field1: formData.permanentAddress.apartment,
            field2: formData.permanentAddress.street,
            ctArea: formData.permanentAddress.city,
            pinNo: formData.permanentAddress.pincode,
            state: formData.permanentAddress.state,
            country: formData.permanentAddress.country
          },
          correspondenceAddress: {
            field1: formData.correspondenceAddress.apartment,
            field2: formData.correspondenceAddress.street,
            ctArea: formData.correspondenceAddress.city,
            pinNo: formData.correspondenceAddress.pincode,
            state: formData.correspondenceAddress.state,
            country: formData.correspondenceAddress.country
          },
          active: true,
          kyc: formData.kyc,
          dob: formData.dob
        };

        const response = await axiosInstance.post(
          "/api/serviceproviders/serviceprovider/add",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setSnackbarOpen(true);
        setSnackbarSeverity("success");
        setSnackbarMessage("Service provider added successfully!");

        // Create Auth0 user
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
          setIsSubmitting(false); // Stop loading
          onBackToLogin(true);
        }, 3000);
      } catch (error) {
        setIsSubmitting(false); // Stop loading on error
        setSnackbarOpen(true);
        setSnackbarSeverity("error");
        setSnackbarMessage("Failed to add service provider. Please try again.");
        console.error("Error submitting form:", error);
      }
    } else {
      setIsSubmitting(false); // Stop loading if validation fails
      setSnackbarOpen(true);
      setSnackbarSeverity("warning");
      setSnackbarMessage("Please fill out all required fields.");
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
              apartment: apartment || "Not specified",
              street: street || "Not specified",
              city: city || "Not specified",
              state: state || "Not specified",
              country: country || "Not specified",
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

            setSnackbarMessage("Location fetched successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

          } catch (error) {
            console.error("Error fetching location data", error);
            setSnackbarMessage("Failed to fetch location data. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          setSnackbarMessage("Geolocation failed. Please check your browser permissions.");
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
      setSnackbarMessage("Geolocation is not supported by your browser.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    }
  };

  const validateAge = (dob: string) => {
    if (!dob) return false;

    const birthDate = moment(dob, "YYYY-MM-DD");
    const today = moment();
    const age = today.diff(birthDate, "years");

    return age >= 18;
  };

  const formatDisplayTime = (value: number) => {
    const hour = Math.floor(value);
    const minutes = value % 1 === 0.5 ? "30" : "00";
    const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
    return `${formattedHour}:${minutes}`;
  };

  const updateFormTimeSlot = (
    morningRange: number[],
    eveningRange: number[]
  ) => {
    const startMorning = formatDisplayTime(morningRange[0]);
    const endMorning = formatDisplayTime(morningRange[1]);
    const startEvening = formatDisplayTime(eveningRange[0]);
    const endEvening = formatDisplayTime(eveningRange[1]);

    const formattedTimeSlot = `${startMorning}-${endMorning}, ${startEvening}-${endEvening}`;
    setFormData((prev) => ({ ...prev, timeslot: formattedTimeSlot }));
  };

  const handledietChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData((prevData) => ({ ...prevData, diet: value }));
  };

  const handleDOBChange = (dob: string) => {
    setFormData((prev) => ({ ...prev, dob }));

    const isValidAge = validateAge(dob);

    if (!isValidAge) {
      setIsFieldsDisabled(true);
      setSnackbarMessage("You must be at least 18 years old to proceed.");
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
    } else {
      setIsFieldsDisabled(false);
      setSnackbarOpen(false);
    }
  };

  const handleTermsChange = useCallback((allAccepted: boolean) => {
    setFormData(prev => ({
      ...prev,
      keyFacts: allAccepted,
      terms: allAccepted,
      privacy: allAccepted,
    }));
  }, []);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <ProfileImageUpload onImageSelect={handleImageSelect} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="First Name *"
                name="firstName"
                fullWidth
                required
                value={formData.firstName}
                onChange={handleRealTimeValidation}
                error={!!errors.firstName}
                helperText={errors.firstName}
                inputProps={{ maxLength: MAX_NAME_LENGTH }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Middle Name"
                name="middleName"
                fullWidth
                value={formData.middleName}
                onChange={handleChange}
                disabled={isFieldsDisabled}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Last Name *"
                name="lastName"
                fullWidth
                required
                value={formData.lastName}
                onChange={handleRealTimeValidation}
                error={!!errors.lastName}
                helperText={errors.lastName}
                inputProps={{ maxLength: MAX_NAME_LENGTH }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                name="dob"
                type="date"
                fullWidth
                required
                value={formData.dob}
                onChange={(e) => handleDOBChange(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!errors.gender}>
                <FormLabel component="legend">Gender *</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="MALE"
                    control={<Radio />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="FEMALE"
                    control={<Radio />}
                    label="Female"
                  />
                  <FormControlLabel
                    value="OTHER"
                    control={<Radio />}
                    label="Other"
                  />
                </RadioGroup>
                {errors.gender && (
                  <FormHelperText>{errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Email *"
                name="emailId"
                fullWidth
                required
                value={formData.emailId}
                onChange={handleRealTimeValidation}
                error={!!errors.emailId || validationResults.email.isAvailable === false}
                helperText={
                  errors.emailId ||
                  (validationResults.email.loading ? "Checking availability..." :
                    validationResults.email.error ||
                    (validationResults.email.isAvailable ? "Email is available" : ""))
                }
                InputProps={{
                  endAdornment: validationResults.email.loading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : validationResults.email.isAvailable ? (
                    <InputAdornment position="end">
                      <CheckIcon color="success" />
                    </InputAdornment>
                  ) : validationResults.email.isAvailable === false ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearEmail}
                        edge="end"
                        aria-label="clear email"
                      >
                        <CloseIcon color="error" fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Password *"
                type={showPassword ? "text" : "password"}
                name="password"
                fullWidth
                required
                value={formData.password}
                onChange={handleRealTimeValidation}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Confirm Password *"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={handleRealTimeValidation}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                onPaste={(e) => e.preventDefault()} // Prevent paste
                onCopy={(e) => e.preventDefault()} // Prevent copy
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                        aria-label="toggle confirm password visibility"
                      >
                        {showConfirmPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Mobile Number *"
                name="mobileNo"
                fullWidth
                required
                value={formData.mobileNo}
                onChange={handleRealTimeValidation}
                error={!!errors.mobileNo || validationResults.mobile.isAvailable === false}
                helperText={
                  errors.mobileNo ||
                  (validationResults.mobile.loading ? "Checking availability..." :
                    validationResults.mobile.error ||
                    (validationResults.mobile.isAvailable ? "Mobile number is available" : ""))
                }
                InputProps={{
                  endAdornment: validationResults.mobile.loading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : validationResults.mobile.isAvailable ? (
                    <InputAdornment position="end">
                      <CheckIcon color="success" />
                    </InputAdornment>
                  ) : validationResults.mobile.isAvailable === false ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearMobile}
                        edge="end"
                        aria-label="clear mobile number"
                      >
                        <CloseIcon color="error" fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                placeholder="Alternate Number"
                name="AlternateNumber"
                fullWidth
                value={formData.AlternateNumber}
                onChange={handleRealTimeValidation}
                error={validationResults.alternate.isAvailable === false}
                helperText={
                  (validationResults.alternate.loading ? "Checking availability..." :
                    validationResults.alternate.error ||
                    (validationResults.alternate.isAvailable ? "Alternate number is available" : ""))
                }
                InputProps={{
                  endAdornment: validationResults.alternate.loading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : validationResults.alternate.isAvailable ? (
                    <InputAdornment position="end">
                      <CheckIcon color="success" />
                    </InputAdornment>
                  ) : validationResults.alternate.isAvailable === false ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearAlternate}
                        edge="end"
                        aria-label="clear alternate number"
                      >
                        <CloseIcon color="error" fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
          </Grid>
        );
      
     case 1:
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AddressComponent
          onAddressChange={handleAddressChange}
          permanentAddress={formData.permanentAddress}
          correspondenceAddress={formData.correspondenceAddress}
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
              Current Location
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Use GPS to automatically fetch your current location coordinates
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
                Fetch My Location (GPS)
              </Button>
              
              {(formData.latitude !== 0 || formData.longitude !== 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    <strong>Location found:</strong> 
                    Lat: {formData.latitude.toFixed(6)}, 
                    Lng: {formData.longitude.toFixed(6)}
                  </Typography>
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
                  <strong>Address detected:</strong> {formData.currentLocation || "Fetching address..."}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
      case 2: // Additional Details
        return (
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={12}
              className="mt-4 flex justify-center items-center ml-10"
            >
              <TextField
                select
                label="Select Service Type"
                name="housekeepingRole"
                fullWidth
                value={formData.housekeepingRole}
                onChange={(e) => {
                  handleChange(e);
                  setIsCookSelected(e.target.value === "COOK");
                }}
                error={!!errors.housekeepingRole}
                helperText={errors.housekeepingRole}
                required
              >
                <MenuItem value="" disabled>
                  Select Service Type
                </MenuItem>
                <MenuItem value="COOK">Cook</MenuItem>
                <MenuItem value="NANNY">Nanny</MenuItem>
                <MenuItem value="MAID">Maid</MenuItem>
              </TextField>
            </Grid>
            {isCookSelected && (
              <Grid item xs={12} >
                <FormControl
                  component="fieldset"
                  error={!!errors.cookingSpeciality}
                  required
                >
                  <FormLabel component="legend">Cooking Speciality</FormLabel>
                  <RadioGroup
                    name="cookingSpeciality"
                    value={formData.cookingSpeciality}
                    onChange={handleCookingSpecialityChange}
                  >
                    <FormControlLabel
                      value="VEG"
                      control={<Radio />}
                      label="Veg"
                    />
                    <FormControlLabel
                      value="NONVEG"
                      control={<Radio />}
                      label="Non-Veg"
                    />
                    <FormControlLabel
                      value="BOTH"
                      control={<Radio />}
                      label="Both"
                    />
                  </RadioGroup>
                  <FormHelperText>{errors.cookingSpeciality}</FormHelperText>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!errors.diet} required>
                <FormLabel component="legend">Diet</FormLabel>
                <RadioGroup
                  name="diet"
                  value={formData.diet}
                  onChange={handledietChange}
                >
                  <FormControlLabel
                    value="VEG"
                    control={<Radio />}
                    label="Veg"
                  />
                  <FormControlLabel
                    value="NONVEG"
                    control={<Radio />}
                    label="Non-Veg"
                  />
                  <FormControlLabel
                    value="BOTH"
                    control={<Radio />}
                    label="Both"
                  />
                </RadioGroup>
                <FormHelperText>{errors.diet}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} >
              <TextField
                placeholder="Description"
                name="description"
                fullWidth
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Experience *"
                name="experience"
                fullWidth
                required
                value={formData.experience}
                onChange={handleChange}
                error={!!errors.experience}
                helperText={
                  errors.experience ||
                  "Years in business or relevant experience"
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Referral Code (Optional)"
                name="referralCode"
                fullWidth
                value={formData.referralCode || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" >
                  Select Time Slot
                </FormLabel>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.timeslot === "06:00-20:00"}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              timeslot: "06:00-20:00",
                            });
                            setSliderDisabled(true);
                          } else {
                            setFormData({ ...formData, timeslot: "" });
                            setSliderDisabled(false);
                          }
                        }}
                      />
                    }
                    label="Choose Full Time Availability (6:00 AM - 8:00 PM)"
                    style={{ width: '100%', marginLeft: 0 }}
                  />

                  {/* Morning Slider */}
                  <Box sx={{ width: '100%', mt: 2, pl: 2 }}>
                    <Typography align="center" gutterBottom>
                      Morning (6:00 AM - 12:00 PM)
                    </Typography>
                    <Slider
                      value={sliderValueMorning}
                      onChange={(e, newValue) => {
                        const selectedRange = newValue as number[];
                        setSliderValueMorning(selectedRange);
                        updateFormTimeSlot(selectedRange, sliderValueEvening);
                      }}
                      valueLabelDisplay="on"
                      valueLabelFormat={(value) => formatDisplayTime(value)}
                      min={6}
                      max={12}
                      step={0.5}
                      marks={[
                        { value: 6, label: "6:00 AM" },
                        { value: 8, label: "8:00 AM" },
                        { value: 10, label: "10:00 AM" },
                        { value: 12, label: "12:00 PM" },
                      ]}
                      disabled={sliderDisabled}
                      sx={{
                        color: sliderDisabled ? "grey.500" : "primary.main",
                        width: '95%',
                        mx: 'auto',
                      }}
                      aria-labelledby="morning-slider"
                    />
                  </Box>

                  {/* Evening Slider */}
                  <Box sx={{ width: '100%', mt: 2, pl: 2 }}>
                    <Typography align="center" gutterBottom>
                      Evening (12:00 PM - 8:00 PM)
                    </Typography>
                    <Slider
                      value={sliderValueEvening}
                      onChange={(e, newValue) => {
                        const selectedRange = newValue as number[];
                        setSliderValueEvening(selectedRange);
                        updateFormTimeSlot(sliderValueMorning, selectedRange);
                      }}
                      valueLabelDisplay="on"
                      valueLabelFormat={(value) => formatDisplayTime(value)}
                      min={12}
                      max={20}
                      step={0.5}
                      marks={[
                        { value: 12, label: "12:00 PM" },
                        { value: 14, label: "2:00 PM" },
                        { value: 16, label: "4:00 PM" },
                        { value: 20, label: "8:00 PM" },
                      ]}
                      disabled={sliderDisabled}
                      sx={{
                        color: sliderDisabled ? "grey.500" : "primary.main",
                        width: '95%',
                        mx: 'auto',
                      }}
                      aria-labelledby="evening-slider"
                    />
                  </Box>
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <TextField
                placeholder="Aadhaar Number *"
                name="AADHAR"
                fullWidth
                required
                value={formData.AADHAR || ""}
                onChange={handleRealTimeValidation}
                error={!!errors.kyc}
                helperText={errors.kyc}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomFileInput
                name="documentImage"
                accept="image/*"
                required
                value={formData.documentImage}
                onChange={(file) => setFormData(prev => ({ ...prev, documentImage: file }))}
                buttonText="Upload Aadhaar Document"
              />
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Grid container spacing={1}>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography gutterBottom>
                Please agree to the following before proceeding with your Registration:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TermsCheckboxes onChange={handleTermsChange} />

              </Box>
            </Grid>
          </Grid>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={true} >
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
            Service Provider Registration
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
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Tooltip
                  title={!(formData.terms && formData.privacy && formData.keyFacts)
                    ? "Check terms and conditions to enable Submit"
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
                        "Submit"
                      )}
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    handleNext(); // Only proceed to next step
                  }}
                  endIcon={<ArrowForward />}
                  disabled={isSubmitting}
                >
                  Next
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
    </>
  );
};

export default ServiceProviderRegistration;