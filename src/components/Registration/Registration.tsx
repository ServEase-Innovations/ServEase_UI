import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import "./Registration.css";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  ArrowBack,
} from "@mui/icons-material";

// Define the shape of formData using an interface
interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  agreeToTerms: boolean;
  hobbies: string;
  language: string;
}

// Define the shape of errors to hold string messages
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  agreeToTerms?: string; // This is now a string for error messages
}

// Regex for validation
const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Z|a-z]{2,}$/;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^[0-9]{10}$/;
const zipCodeRegex = /^[0-9]{6}$/;

const steps = ["Basic Info", "Address", "Additional Details", "Confirmation"];

interface RegistrationProps {
  onBackToLogin: (data: boolean) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onBackToLogin }) => {
  const handleBackLogin = (e: any) => {
    onBackToLogin(e);
  };

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    agreeToTerms: false,
    hobbies: "",
    language: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const validateForm = () => {
    let tempErrors: FormErrors = {};

    if (activeStep === 0) {
      if (!formData.firstName || !nameRegex.test(formData.firstName)) {
        tempErrors.firstName =
          "First Name is required and should contain only alphabets.";
      }
      if (!formData.lastName || !nameRegex.test(formData.lastName)) {
        tempErrors.lastName =
          "Last Name is required and should contain only alphabets.";
      }
      if (!formData.email || !emailRegex.test(formData.email)) {
        tempErrors.email = "Valid email is required.";
      }
      if (!formData.password || !strongPasswordRegex.test(formData.password)) {
        tempErrors.password =
          "Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.";
      }
      if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = "Passwords do not match.";
      }
      if (!formData.phoneNumber || !phoneRegex.test(formData.phoneNumber)) {
        tempErrors.phoneNumber = "Phone number must be exactly 10 digits.";
      }
    }

    if (activeStep === 1) {
      if (!formData.address) {
        tempErrors.address = "Address is required.";
      }
      if (!formData.city) {
        tempErrors.city = "City is required.";
      }
      if (!formData.state) {
        tempErrors.state = "State is required.";
      }
      if (!formData.zipCode || !zipCodeRegex.test(formData.zipCode)) {
        tempErrors.zipCode = 'Zip/Postal Code must be exactly 6 digits.';
      }
    }

    if (activeStep === 3) {
      if (!formData.agreeToTerms) {
        tempErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy.';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="topic">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  fullWidth
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  sx={{
                    "& .MuiInputBase-root": { height: "36px" },
                    "& .MuiInputBase-input": { padding: "10px 12px" },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Middle Name"
                  name="middleName"
                  fullWidth
                  value={formData.middleName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  sx={{
                    "& .MuiInputBase-root": { height: "36px" },
                    "& .MuiInputBase-input": { padding: "10px 12px" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  fullWidth
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  sx={{
                    "& .MuiInputBase-root": { height: "36px" },
                    "& .MuiInputBase-input": { padding: "10px 12px" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  fullWidth
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{
                    "& .MuiInputBase-root": { height: "36px" },
                    "& .MuiInputBase-input": { padding: "10px 12px" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  fullWidth
                  required
                  value={formData.password}
                  onChange={handleChange}
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
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  fullWidth
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                          aria-label="toggle confirm password visibility"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  fullWidth
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  sx={{
                    "& .MuiInputBase-root": { height: "36px" },
                    "& .MuiInputBase-input": { padding: "10px 12px" },
                  }}
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
                  label="Address"
                  name="address"
                  fullWidth
                  required
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  sx={{
                    "& .MuiInputBase-root": { height: "36px" },
                    "& .MuiInputBase-input": { padding: "10px 12px" },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  name="city"
                  fullWidth
                  required
                  value={formData.city}
                  onChange={handleChange}
                  error={!!errors.city}
                  helperText={errors.city}
                  sx={{
                    "& .MuiInputBase-root": { height: "36px" },
                    "& .MuiInputBase-input": { padding: "10px 12px" },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="State"
                  name="state"
                  fullWidth
                  required
                  value={formData.state}
                  onChange={handleChange}
                  error={!!errors.state}
                  helperText={errors.state}
                  sx={{
                    "& .MuiInputBase-root": { height: "36px" },
                    "& .MuiInputBase-input": { padding: "10px 12px" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Zip/Postal Code"
                  name="zipCode"
                  fullWidth
                  required
                  value={formData.zipCode}
                  onChange={handleChange}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode}
                  sx={{
                    "& .MuiInputBase-root": { height: "36px" },
                    "& .MuiInputBase-input": { padding: "10px 12px" },
                  }}
                />
              </Grid>
            </Grid>
          </div>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Hobbies"
                name="hobbies"
                fullWidth
                value={formData.hobbies}
                onChange={handleChange}
                sx={{
                  "& .MuiInputBase-root": { height: "36px" },
                  "& .MuiInputBase-input": { padding: "10px 12px" },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Language"
                name="language"
                fullWidth
                value={formData.language}
                onChange={handleChange}
                sx={{
                  "& .MuiInputBase-root": { height: "36px" },
                  "& .MuiInputBase-input": { padding: "10px 12px" },
                }}
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
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 2, display: 'block' }} className="parent">
      <Typography variant="h5" gutterBottom className="text">
        User Registration
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel style={{ overflow: 'overlay' }}>
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
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="contained"
              color="primary"
              startIcon={<ArrowBack />} // Add the icon here
            >
              Back
            </Button>
          {activeStep === steps.length - 1 ? (
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          ) : (
            <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<ArrowForward />} // This will place the icon after the text
              >
              Next
              </Button>
          )}
        </Box>

        <div className="flex flex-col mt-4 items-center justify-center text-sm">
          <h3 className="dark:text-gray-300">
            Already have an account?{" "}
            <button
              className="text-blue-500 ml-2 underline"
              onClick={(e) => handleBackLogin("false")}
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
