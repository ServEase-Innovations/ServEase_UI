/* eslint-disable */

import React, { useEffect, useState } from "react";
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
  address: string;
  buildingName: string;
  locality: string;
  street: string;
  currentLocation: string;
  nearbyLocation: string;
  pincode: string;
  AADHAR: string;
  pan: string;
  panImage: File | null; // New field for PAN image upload
  housekeepingRole: string; // Dropdown for Service Type
  description: string; // Text area for business description
  experience: string; // Experience in years
  kyc: string;
  documentImage: File | null;
  otherDetails: string;
  profileImage: File | null; // New field for Profile Image
  cookingSpeciality: string;
  age: "";
  diet: string;
  dob: "";
  profilePic: string;
  timeslot: string;
  referralCode: "";
   agreeToTerms: boolean;
  terms: boolean;
  privacy: boolean;
  keyFacts: boolean;
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
  address?: string;
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
    address: "",
    buildingName: "",
    locality: "",
    street: "",
    currentLocation: "",
    nearbyLocation: "",
    pincode: "",
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
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          emailId: "",
        }));
      }
    }

    if (name === "mobileNo") {
      const mobilePattern = /^[0-9]{10}$/;
      if (!mobilePattern.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          mobileNo: "Please enter a valid 10-digit mobile number.",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          mobileNo: "",
        }));
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
      if (!formData.emailId || !emailIdRegex.test(formData.emailId)) {
        tempErrors.emailId = "Valid email is required.";
      }
      if (!formData.password || !strongPasswordRegex.test(formData.password)) {
        tempErrors.password = "Password is required.";
      }
      if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = "Passwords do not match.";
      }
      if (!formData.mobileNo || !phoneRegex.test(formData.mobileNo)) {
        tempErrors.mobileNo = "Phone number is required.";
      }
    }

    if (activeStep === 1) {
      if (!formData.address) {
        tempErrors.address = "Address is required.";
      }
      if (!formData.buildingName) {
        tempErrors.buildingName = "Building Name is required.";
      }
      if (!formData.locality) {
        tempErrors.locality = "Locality is required.";
      }
      if (!formData.street) {
        tempErrors.street = "Street is required.";
      }
      if (!formData.currentLocation) {
        tempErrors.currentLocation = "Current Location is required.";
      }
      if (!formData.pincode) {
        tempErrors.pincode = "Pincode is required.";
      } else if (formData.pincode.length !== 6) {
        tempErrors.pincode = "Pincode must be exactly 6 digits.";
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
    // If you want to keep agreeToTerms as a master checkbox that requires all others:
    agreeToTerms: name === 'terms' || name === 'privacy' || name === 'keyFacts' 
      ? checked && prev.terms && prev.privacy && prev.keyFacts
      : prev.agreeToTerms
  }));
};
  const handleBack = () => {
    if (activeStep === 0) {
      onBackToLogin(true); // Navigate to login page
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    // Only proceed if we're on the last step
    if (activeStep !== steps.length - 1) return;

    // Filter out empty values from the form data
    const filteredPayload = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    // Form validation
    if (validateForm()) {
      try {
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
            filteredPayload.profilePic = imageResponse.data.imageUrl;
          } else {
            setSnackbarOpen(true);
            setSnackbarSeverity("error");
            setSnackbarMessage(
              "Image upload failed. Proceeding without profile picture."
            );
          }
        }

        const response = await axiosInstance.post(
          "/api/serviceproviders/serviceprovider/add",
          filteredPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setSnackbarOpen(true);
        setSnackbarSeverity("success");
        setSnackbarMessage("Service provider added successfully!");

        // add SP in autho DB
        const authPayload = {
          email: filteredPayload.emailId,
          password: filteredPayload.password,
          name : `${filteredPayload.firstName} ${filteredPayload.lastName}`,
        };

        axios.post('https://utils-ndt3.onrender.com/authO/create-autho-user', authPayload)
          .then((authResponse) => {
            console.log("AuthO user created successfully:", authResponse.data);
          }).catch((authError) => {
            console.error("Error creating AuthO user:", authError);
          });
        
        setTimeout(() => {
          onBackToLogin(true);
        }, 3000);
      } catch (error) {
        setSnackbarOpen(true);
        setSnackbarSeverity("error");
        setSnackbarMessage("Failed to add service provider. Please try again.");
        console.error("Error submitting form:", error);
      }
    } else {
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
            // Use the latitude and longitude to fetch location data from the Geocode API
            const response = await axios.get(
              "https://maps.googleapis.com/maps/api/geocode/json",
              {
                params: {
                  latlng: `${latitude},${longitude}`,
                  key: keys.api_key, // Ensure your API key is here
                },
              }
            );

            // Extract the location data from the API response
            const locationData = response.data.results[0];

            // Extract relevant fields from the location data
            const address = locationData.formatted_address || "";
            const components = locationData.address_components;

            let buildingName = "",
              locality = "",
              street = "",
              pincode = "",
              nearbyLocation = "";

            components.forEach((component: any) => {
              if (component.types.includes("street_number")) {
                street = component.long_name;
              } else if (component.types.includes("route")) {
                street += ` ${component.long_name}`;
              } else if (component.types.includes("locality")) {
                locality = component.long_name;
              } else if (component.types.includes("postal_code")) {
                pincode = component.long_name;
              } else if (
                component.types.includes("administrative_area_level_1")
              ) {
                nearbyLocation = component.long_name;
              }
            });

            // Autofill form fields with the location data
            setFormData((prevState) => ({
              ...prevState,
              address: address,
              buildingName: buildingName,
              locality: locality,
              street: street,
              pincode: pincode,
              currentLocation: address,
              nearbyLocation: nearbyLocation,
              latitude: latitude,
              longitude: longitude,
            }));
          } catch (error) {
            console.error("Error fetching location data", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };
  const validateAge = (dob) => {
    if (!dob) return false;

    const birthDate = moment(dob, "YYYY-MM-DD");
    const today = moment();
    const age = today.diff(birthDate, "years");

    console.log("Entered DOB:", dob);
    console.log("Calculated Age:", age);

    return age >= 18;
  };
  const formatDisplayTime = (value: number) => {
    const hour = Math.floor(value);
    const minutes = value % 1 === 0.5 ? "30" : "00";
    const formattedHour = hour < 10 ? `0${hour}` : `${hour}`; // Add leading zero

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

    // Format as "HH:MM-HH:MM, HH:MM-HH:MM"
    const formattedTimeSlot = `${startMorning}-${endMorning}, ${startEvening}-${endEvening}`;

    setFormData((prev) => ({ ...prev, timeslot: formattedTimeSlot }));
  };

  const handledietChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData((prevData) => ({ ...prevData, diet: value }));
  };

  const handleDOBChange = (dob) => {
    setFormData((prev) => ({ ...prev, dob }));

    // Validate age and set field disabled status
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
                error={!!errors.emailId}
                helperText={errors.emailId}
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
                error={!!errors.mobileNo}
                helperText={errors.mobileNo}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Alternate Number"
                name="AlternateNumber"
                fullWidth
                value={formData.AlternateNumber}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <TextField
                placeholder="Address *"
                name="address"
                fullWidth
                required
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Building Name *"
                name="buildingName"
                fullWidth
                required
                value={formData.buildingName}
                onChange={handleChange}
                error={!!errors.buildingName}
                helperText={errors.buildingName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Locality *"
                name="locality"
                fullWidth
                required
                value={formData.locality}
                onChange={handleChange}
                error={!!errors.locality}
                helperText={errors.locality}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Street *"
                name="street"
                fullWidth
                required
                value={formData.street}
                onChange={handleChange}
                error={!!errors.street}
                helperText={errors.street}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Pincode *"
                name="pincode"
                fullWidth
                required
                value={formData.pincode}
                onChange={handleRealTimeValidation}
                error={!!errors.pincode}
                helperText={errors.pincode}
                inputProps={{
                  maxLength: 6,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Current Location *"
                name="currentLocation"
                fullWidth
                required
                value={formData.currentLocation}
                onChange={handleChange}
                error={!!errors.currentLocation}
                helperText={errors.currentLocation}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Nearby Location"
                name="nearbyLocation"
                fullWidth
                value={formData.nearbyLocation}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={fetchLocationData}
              >
                Fetch Location
              </Button>
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
  {/* Key Facts */}
  <FormControlLabel
    control={
      <Checkbox
        checked={formData.keyFacts}
        onChange={handleChangeCheckbox}
        name="keyFacts"
        required
      />
    }
    label={
      <Typography
        component="span"
        sx={{ color: '#4a5568', cursor: 'pointer' }}
        onClick={() => window.open('/KeyFactsStatement', '_blank')}
      >
        I agree to the ServEaso{' '}
        <a
          href="/KeyFactsStatement"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#3182ce',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          onClick={(e) => e.stopPropagation()} // prevent parent click
        >
          Key Facts Statement
          <OpenInNewIcon
            fontSize="small"
            style={{ marginLeft: 4, verticalAlign: 'middle' }}
          />
        </a>
      </Typography>
    }
  />

  {/* Terms & Conditions */}
  <FormControlLabel
    control={
      <Checkbox
        checked={formData.terms}
        onChange={handleChangeCheckbox}
        name="terms"
        required
      />
    }
    label={
      <Typography
        component="span"
        sx={{ color: '#4a5568', cursor: 'pointer' }}
        onClick={() => window.open('/TnC', '_blank')}
      >
        I agree to the ServEaso{' '}
        <a
          href="/TnC"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#3182ce',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          Terms and Conditions
          <OpenInNewIcon
            fontSize="small"
            style={{ marginLeft: 4, verticalAlign: 'middle' }}
          />
        </a>
      </Typography>
    }
  />

  {/* Privacy */}
  <FormControlLabel
    control={
      <Checkbox
        checked={formData.privacy}
        onChange={handleChangeCheckbox}
        name="privacy"
        required
      />
    }
    label={
      <Typography
        component="span"
        sx={{ color: '#4a5568', cursor: 'pointer' }}
        onClick={() => window.open('/Privacy', '_blank')}
      >
        I agree to the ServEaso{' '}
        <a
          href="/Privacy"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#3182ce',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          Privacy Statement
          <OpenInNewIcon
            fontSize="small"
            style={{ marginLeft: 4, verticalAlign: 'middle' }}
          />
        </a>
      </Typography>
    }
  />
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
        <Box sx={{ padding: 2 }}>
          <IconButton
          aria-label="close"
          onClick={() => onBackToLogin(true)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
          <Typography variant="h5" gutterBottom className="text-center pb-3">
            Service Provider Registration
          </Typography>
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
                disabled={activeStep === 0}
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
  disabled={!(formData.terms && formData.privacy && formData.keyFacts)}
>
  Submit
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
