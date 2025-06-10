/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  FormLabel,
  FormControl,
  Alert,
  Snackbar,
  AlertColor,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import "./Registration.css";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  ArrowBack,
} from "@mui/icons-material";
import ProfileImageUpload from "./ProfileImageUpload";
import axios from "axios";
import ChipInput from "../Common/ChipInput/ChipInput";
import { keys } from "../../env/env";
import axiosInstance from "../../services/axiosInstance";

// Define the shape of formData using an interface
interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  emailId: string;
  password: string;
  confirmPassword: string;
  mobileNo: string;
  gender: string;
  address: string;
  locality: string;
  street: string;
  pincode: string;
  buildingName: string;
  currentLocation: string;
  agreeToTerms: boolean;
  hobbies: string;
  language: string;
  profilePic: string;
}

// Define the shape of errors to hold string messages
interface FormErrors {
  firstName?: string;
  lastName?: string;
  emailId?: string;
  password?: string;
  confirmPassword?: string;
  mobileNo?: string;
  gender?: string;
  address?: string;
  locality?: string;
  street?: string;
  pincode?: string;
  buildingName?: string;
  currentLocation?: string;
  agreeToTerms?: string;
}

// Regex for validation
const nameRegex = /^[A-Za-z]+(?:[ ][A-Za-z]+)*$/;
const emailIdRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Z|a-z]{2,}$/;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^[0-9]{10}$/;
const pincodeRegex = /^[0-9]{6}$/;
const MAX_NAME_LENGTH = 30;

const steps = ["Basic Info", "Address", "Additional Details", "Confirmation"];

interface RegistrationProps {
  onBackToLogin: (data: boolean) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onBackToLogin }) => {
  const handleBackLogin = (e: any) => {
    onBackToLogin(e);
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  const showSnackbar = (message: string, severity: AlertColor = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    emailId: "",
    password: "",
    confirmPassword: "",
    mobileNo: "",
    gender: "",
    address: "",
    locality: "",
    street: "",
    pincode: "",
    buildingName: "",
    currentLocation: "",
    agreeToTerms: false,
    hobbies: "",
    language: "",
    profilePic: "",
  });

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json`,
              {
                params: {
                  latlng: `${latitude},${longitude}`,
                  key: keys.api_key,
                },
              }
            );

            const address =
              response.data.results[0]?.formatted_address ||
              "Address not found";
            setFormData((prevData) => ({
              ...prevData,
              address,
              currentLocation: address,
            }));
          } catch (error) {
            console.error("Failed to fetch location:", error);
          }
        },
        (error) => {
          console.error("Error retrieving geolocation:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const [availableLanguages] = useState<string[]>([
    "Assamese",
    "Bengali",
    "Gujarati",
    "Hindi",
    "Kannada",
    "Kashmiri",
    "Marathi",
    "Malayalam",
    "Oriya",
    "Punjabi",
    "Sanskrit",
    "Tamil",
    "Telugu",
    "Urdu",
    "English",
    "Sindhi",
    "Konkani",
    "Nepali",
    "Manipuri",
    "Bodo",
    "Dogri",
    "Maithili",
    "Santhali",
  ]);
const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const handleChipChange = (newChips: string[]) => {
    setSelectedChips(newChips);
  };

  useEffect(() => {
    console.log(selectedChips); // Logs updated state after re-render
  }, [selectedChips]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const [image, setImage] = useState<Blob | null>(null);

  const handleImageSelect = (file: Blob | null) => {
    if (file) {
      setImage(file);
    }
  };

  const handleRealTimeValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim();

    if (name === "firstName") {
  if (!trimmedValue) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      firstName: "First Name is required.",
    }));
  } else if (!nameRegex.test(trimmedValue)) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      firstName: trimmedValue.includes('  ') ? 
        "Only one space allowed between words" : 
        "First Name should contain only alphabets with single spaces",
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
  if (!trimmedValue) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      lastName: "Last Name is required.",
    }));
  } else if (!nameRegex.test(trimmedValue)) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      lastName: trimmedValue.includes('  ') ? 
        "Only one space allowed between words" : 
        "Last Name should contain only alphabets with single spaces",
    }));
  } else if (trimmedValue.length > MAX_NAME_LENGTH) {
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

  if (name === "pincode") {
  // Only allow numeric input
  const numericValue = value.replace(/\D/g, '');
  
  // Update form data with only numbers
  setFormData((prevData) => ({
    ...prevData,
    [name]: numericValue.slice(0, 6) // Limit to 6 digits
  }));

  // Validation
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

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const currentStepHasErrors = () => {
    if (activeStep === 0) {
      return (
        !formData.firstName.trim() ||
        !nameRegex.test(formData.firstName.trim()) ||
        formData.firstName.trim().length > MAX_NAME_LENGTH ||
        !formData.lastName.trim() ||
        !nameRegex.test(formData.lastName.trim()) ||
         formData.lastName.trim().length > MAX_NAME_LENGTH || 
        !formData.emailId ||
        !emailIdRegex.test(formData.emailId) ||
        !formData.password ||
        !strongPasswordRegex.test(formData.password) ||
        formData.password !== formData.confirmPassword ||
        !formData.mobileNo ||
        !phoneRegex.test(formData.mobileNo) ||
        !formData.gender
      );
    }
    if (activeStep === 1) {
      return (
        !formData.address ||
        !formData.locality ||
        !formData.street ||
        !formData.pincode ||
        !pincodeRegex.test(formData.pincode) ||
        !formData.currentLocation ||
        !formData.buildingName
      );
    }
    if (activeStep === 3) {
      return !formData.agreeToTerms;
    }
    return false;
  };

  const validateForm = () => {
    let tempErrors: FormErrors = {};

    if (activeStep === 0) {
     if (!formData.firstName.trim()) {
  tempErrors.firstName = "First Name is required.";
} else if (!nameRegex.test(formData.firstName.trim())) {
  tempErrors.firstName = formData.firstName.includes('  ') ? 
    "Only one space allowed between words" : 
    "First Name should contain only alphabets with single spaces";
} else if (formData.firstName.trim().length > MAX_NAME_LENGTH) {
  tempErrors.firstName = `First Name should not exceed ${MAX_NAME_LENGTH} characters.`;
}

 if (!formData.lastName.trim()) {
  tempErrors.lastName = "Last Name is required.";
} else if (!nameRegex.test(formData.lastName.trim())) {
  tempErrors.lastName = formData.lastName.includes('  ') ? 
    "Only one space allowed between words" : 
    "Last Name should contain only alphabets with single spaces";
} else if (formData.lastName.trim().length > MAX_NAME_LENGTH) {
  tempErrors.lastName = `Last Name should not exceed ${MAX_NAME_LENGTH} characters.`;
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
      if (!formData.gender) {
        tempErrors.gender = "Select Your Gender.";
      }
    }

    if (activeStep === 1) {
      if (!formData.address) {
        tempErrors.address = "Address is required.";
      }
      if (!formData.locality) {
        tempErrors.locality = "City is required.";
      }
      if (!formData.street) {
        tempErrors.street = "State is required.";
      }
    if (!formData.pincode) {
    tempErrors.pincode = "Pincode is required.";
} else if (formData.pincode.length !== 6) {
    tempErrors.pincode = "Pincode must be exactly 6 digits.";
}

      if (!formData.currentLocation) {
        tempErrors.currentLocation = "Current Location is required.";
      }
      if (!formData.buildingName) {
        tempErrors.buildingName = "Building Name is required.";
      }
    }

    if (activeStep === 3) {
      if (!formData.agreeToTerms) {
        tempErrors.agreeToTerms =
          "You must agree to the Terms of Service and Privacy Policy.";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (validateForm()) {
    try {
      // Image upload logic
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
          formData.profilePic = imageResponse.data.imageUrl;
        }
      }

      // Main form submission
      const response = await axiosInstance.post(
        "/api/customer/add-customer",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Only proceed to show success if main form submission succeeds
      if (response.status === 201) {
        // Email sending (now optional)
        try {
          const data = { email: formData.emailId, name: formData.firstName };
          await axiosInstance.post(
            "http://3.110.168.35:3000/send-email",
            data,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } catch (emailError) {
          console.warn("Email sending failed (optional):", emailError);
          // Don't treat email failure as an overall failure
        }

        setSnackbarSeverity("success");
        setSnackbarMessage("User added successfully!");
        setSnackbarOpen(true);

        setTimeout(() => {
          onBackToLogin(true);
        }, 3000);
      }
    } catch (error) {
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to add User. Please try again.");
      console.error("Error submitting form:", error);
    }
  } else {
    setSnackbarOpen(true);
    setSnackbarSeverity("warning");
    setSnackbarMessage("Please fill out all required fields.");
  }
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="topic">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ProfileImageUpload onImageSelect={handleImageSelect} />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  placeholder="Middle Name"
                  name="middleName"
                  fullWidth
                  value={formData.middleName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  placeholder="Last Name *"
                  name="lastName"
                  fullWidth
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  component="fieldset"
                  error={!!errors.gender}
                  required
                >
                  <FormLabel component="legend">Gender</FormLabel>
                  <RadioGroup
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    row
                  >
                    <FormControlLabel
                      value="MALE"
                      control={<Radio />}
                      label="MALE"
                      sx={{ color: "#333" }}
                    />
                    <FormControlLabel
                      value="FEMALE"
                      control={<Radio />}
                      label="FEMALE"
                      sx={{ color: "#333" }}
                    />
                    <FormControlLabel
                      value="OTHERS"
                      control={<Radio />}
                      label="OTHERS"
                      sx={{ color: "#333" }}
                    />
                  </RadioGroup>
                  {errors.gender && (
                    <Typography color="error">{errors.gender}</Typography>
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
                          aria-label="toggle password visibility"
                        >
                          {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  placeholder="Phone Number *"
                  name="mobileNo"
                  fullWidth
                  required
                  value={formData.mobileNo}
                  onChange={handleRealTimeValidation}
                  error={!!errors.mobileNo}
                  helperText={errors.mobileNo}
                />
              </Grid>
            </Grid>
          </div>
        );
      case 1:
        return (
          <div className="topic">
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
         inputMode: 'numeric',
         pattern: '[0-9]*'
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
                  placeholder="BuildingName *"
                  name="buildingName"
                  fullWidth
                  required
                  value={formData.buildingName}
                  onChange={handleChange}
                  error={!!errors.buildingName}
                  helperText={errors.buildingName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  placeholder="CurrentLocation *"
                  name="currentLocation"
                  fullWidth
                  required
                  value={formData.currentLocation}
                  onChange={handleChange}
                  error={!!errors.currentLocation}
                  helperText={errors.currentLocation}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={fetchLocation}
                >
                  Fetch Location
                </Button>
              </Grid>
            </Grid>
          </div>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                placeholder="Hobbies"
                name="hobbies"
                fullWidth
                value={formData.hobbies}
                onChange={handleChange}
              />
            </Grid>
          <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={availableLanguages} // Provides selectable options
                value={selectedChips} // Keeps selected values
                onChange={(event, newValue) => setSelectedChips(newValue)} // Updates state
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Languages"
                    placeholder="Pick/Type Your Languages"
                    fullWidth
                  />
                )} 
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <>
            <div className="topic">
              <Typography variant="h6" align="center" className="text">
                All steps completed - You're ready to submit your information!
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    name="agreeToTerms"
                  />
                }
                required
                label="I agree to the Terms of Service and Privacy Policy"
              />
              {errors.agreeToTerms && (
                <Typography color="error">{errors.agreeToTerms}</Typography>
              )}
            </div>
          </>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Box
      sx={{ maxWidth: 600, margin: "auto", padding: 2, display: "block" }}
      className="parent"
    >
      <Typography variant="h5" gutterBottom className="text">
        User Registration
      </Typography>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        style={{ overflow: "overlay" }}
      >
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <form onSubmit={handleSubmit}>
        {renderStepContent(activeStep)}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 2,
          }}
        >
          <Button
            onClick={() =>
              activeStep === 0 ? handleBackLogin("true") : handleBack()
            }
            variant="contained"
            color="primary"
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
         <Tooltip title={!formData.agreeToTerms ? "Check terms and conditions to enable Submit" : ""}>
  <span> {/* Wrapping in a span to avoid tooltip issue on disabled buttons */}
    <Button 
      type="submit" 
      variant="contained" 
      color="primary" 
      disabled={!formData.agreeToTerms}
    >
      Submit
    </Button>
  </span>
</Tooltip>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              disabled={currentStepHasErrors()}
            >
              Next
            </Button>
          )}
        </Box>
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
        <div className="flex flex-col mt-4 items-center justify-center text-sm">
          <h3 className="dark:text-gray-300">
            Already have an account?{" "}
            <button
              className="text-blue-500 ml-2 underline"
              onClick={(e) => handleBackLogin("true")}
            >
              Sign in
            </button>
          </h3>
        </div>
      </form>
    </Box>
  );
};

export default Registration;