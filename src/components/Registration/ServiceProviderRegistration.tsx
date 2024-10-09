import React, { useState } from 'react';
import {
  TextField,
  Input,
  Button,
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
} from '@mui/material';
import { Visibility, VisibilityOff,ArrowForward,ArrowBack  } from '@mui/icons-material';

// Define the shape of formData using an interface
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  aadhaar: string;
  pan: string;
  agreeToTerms: boolean;
  aadhaarImage: File | null; // New field for Aadhaar image upload
  panImage: File | null; // New field for PAN image upload
  serviceType: string; // Dropdown for Service Type
  description: string; // Text area for business description
  experience: string; // Experience in years
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
  aadhaar?: string;
  pan?: string;
  agreeToTerms?: string; // This is now a string for error messages
  document?: string; // Error message for document
  serviceType?: string; // Error message for Service Type
  description?: string; // Error message for Description
  experience?: string; // Error message for Experience
}

// Regex for validation
const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Z|a-z]{2,}$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^[0-9]{10}$/;
const zipCodeRegex = /^[0-9]{6}$/;
const aadhaarRegex = /^[0-9]{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const steps = [
  'Basic Information',
  'Address Information',
  'Additional Details',
  'KYC Verification',
  'Confirmation',
];

interface RegistrationProps {
  onBackToLogin: (data: boolean) => void;
}

const ServiceProviderRegistration: React.FC<RegistrationProps> = ({ onBackToLogin }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    aadhaar: '',
    pan: '',
    agreeToTerms: false,
    aadhaarImage: null, // Initialize Aadhaar image field
    panImage: null, // Initialize PAN image field
    serviceType: '',
    description: '',
    experience: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // States for image previews and names
  const [aadhaarImagePreview, setAadhaarImagePreview] = useState<string | null>(null);
  const [panImagePreview, setPanImagePreview] = useState<string | null>(null);
  const [aadhaarImageName, setAadhaarImageName] = useState<string>('');
  const [panImageName, setPanImageName] = useState<string>('');

  // States for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked, files } = e.target;

    if (name === 'aadhaarImage' && files) {
      const file = files[0];
      setFormData({
        ...formData,
        aadhaarImage: file,
      });
      setAadhaarImagePreview(URL.createObjectURL(file)); // Aadhaar image preview
      setAadhaarImageName(file.name); // Set Aadhaar image file name
    } else if (name === 'panImage' && files) {
      const file = files[0];
      setFormData({
        ...formData,
        panImage: file,
      });
      setPanImagePreview(URL.createObjectURL(file)); // PAN image preview
      setPanImageName(file.name); // Set PAN image file name
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const validateForm = () => {
    let tempErrors: FormErrors = {};

    if (activeStep === 0) {
      // Basic Information validation (Step 1)
      if (!formData.firstName || !nameRegex.test(formData.firstName)) {
        tempErrors.firstName = 'First Name is required and should contain only alphabets.';
      }
      if (!formData.lastName || !nameRegex.test(formData.lastName)) {
        tempErrors.lastName = 'Last Name is required and should contain only alphabets.';
      }
      if (!formData.email || !emailRegex.test(formData.email)) {
        tempErrors.email = 'Valid email is required.';
      }
      if (!formData.password || !strongPasswordRegex.test(formData.password)) {
        tempErrors.password =
          'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.';
      }
      if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = 'Passwords do not match.';
      }
      if (!formData.phoneNumber || !phoneRegex.test(formData.phoneNumber)) {
        tempErrors.phoneNumber = 'Phone number must be exactly 10 digits.';
      }
    }

    if (activeStep === 1) {
      // Address validation (Step 2)
      if (!formData.address) {
        tempErrors.address = 'Address is required.';
      }
      if (!formData.city) {
        tempErrors.city = 'City is required.';
      }
      if (!formData.state) {
        tempErrors.state = 'State is required.';
      }
      if (!formData.zipCode || !zipCodeRegex.test(formData.zipCode)) {
        tempErrors.zipCode = 'Zip/Postal Code must be exactly 6 digits.';
      }
    }

    if (activeStep === 2) {
      // Additional Details validation (Step 3)
      if (!formData.agreeToTerms) {
        tempErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy.';
      }
      if (!formData.serviceType) {
        tempErrors.serviceType = 'Please select a service type.';
      }
      // Uncomment if needed
      // if (!formData.description) {
      //   tempErrors.description = 'Description is required.';
      // }
      // if (!formData.experience || isNaN(Number(formData.experience))) {
      //   tempErrors.experience = 'Experience must be a valid number.';
      // }
    }

    if (activeStep === 3) {
      // KYC Verification validation (Step 4)
      if (!formData.aadhaar || !aadhaarRegex.test(formData.aadhaar)) {
        tempErrors.aadhaar = 'Aadhaar number must be exactly 12 digits.';
      }
      if (!formData.pan || !panRegex.test(formData.pan)) {
        tempErrors.pan = 'PAN number must be in a valid format (5 letters, 4 digits, 1 letter).';
      }
      if (!formData.aadhaarImage) {
        tempErrors.document = 'Aadhaar image is required.';
      }
      if (!formData.panImage) {
        tempErrors.document = 'PAN image is required.';
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
      console.log('Form submitted:', formData);
      // You can perform further actions here, such as sending data to the server
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} className="pt-5">
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                required
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6} className="pt-5">
              <TextField
                label="Last Name"
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
              <TextField
                label="Email"
                name="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
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
                type={showConfirmPassword ? 'text' : 'password'}
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
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} className='pt-5' >
              <TextField
                label="Address"
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
                label="City"
                name="city"
                fullWidth
                required
                value={formData.city}
                onChange={handleChange}
                error={!!errors.city}
                helperText={errors.city}
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
              />
            </Grid>
          </Grid>
        );
      case 2: // Additional Details
      return (
        <> 
            <Grid container spacing={2}>
            {/* serviceType Dropdown */}
                <Grid item xs={12} sm={6} className='pt-5'>
                    <TextField
                        select
                        label="Select Service Type"
                        name="serviceType"
                        fullWidth
                        required
                        value={formData.serviceType}
                        onChange={handleChange}
                    >
                        <option value="" disabled>
                            Select Service Type
                        </option>
                        <option value="Cook">Cook</option>
                        <option value="Nanny">Nanny</option>
                        <option value="Maid">Maid</option>
                    </TextField>
                </Grid>
                {/* Description */}
                <Grid item xs={12} >
                    <TextField
                        label="Description"
                        name="description"
                        fullWidth
                        value={formData.description}
                        onChange={handleChange}
                    />
                </Grid>
            {/* Experience Field */}
          <Grid item xs={12} sm={6}>
            <TextField
            label="Experience"
            name="experience"
            fullWidth
            required
            value={formData.experience}
            onChange={handleChange}
             error={!!errors.experience}
            helperText={errors.experience || 'Years in business or relevant experience'}
             />
          </Grid>
         

            {/* Checkbox for agreeing to Terms of Service */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    name="agreeToTerms"
                    required
                  />
                }
                label="I agree to the Terms of Service and Privacy Policy"
              />
              {errors.agreeToTerms && (
                <Typography color="error">{errors.agreeToTerms}</Typography>
              )}
            </Grid>
          </Grid>
        </>
      );


      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} className='py-4'>
              <TextField
                label="Aadhaar Number"
                name="aadhaar"
                fullWidth
                required
                value={formData.aadhaar}
                onChange={handleChange}
                error={!!errors.aadhaar}
                helperText={errors.aadhaar}
              />
              <Input
                type="file"
                inputProps={{ accept: 'image/*' }}
                name="aadhaarImage"
                onChange={handleChange}
                required
              />
              {aadhaarImageName && (
                <Typography variant="body2">Selected File: {aadhaarImageName}</Typography>
              )}
              {aadhaarImagePreview && (
                <Box mt={2}>
                  <Typography variant="h6">Aadhaar Preview:</Typography>
                  <img src={aadhaarImagePreview} alt="Aadhaar Card" width="500" />
                </Box>
              )}
              {errors.document && <Typography color="error">{errors.document}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="PAN Number"
                name="pan"
                fullWidth
                required
                value={formData.pan}
                onChange={handleChange}
                error={!!errors.pan}
                helperText={errors.pan}
              />
              <Input
                type="file"
                inputProps={{ accept: 'image/*' }}
                name="panImage"
                onChange={handleChange}
                required
              />
              {panImageName && (
                <Typography variant="body2">Selected File: {panImageName}</Typography>
              )}
              {panImagePreview && (
                <Box mt={2}>
                  <Typography variant="h6">PAN Preview:</Typography>
                  <img src={panImagePreview} alt="PAN Card" width="500" />
                </Box>
              )}
              {errors.document && <Typography color="error">{errors.document}</Typography>}
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Typography variant="h6" align="center">
            All steps completed - You're ready to submit your information!
          </Typography>
        );
      default:
        return 'Unknown step';
    }
  };

  const handleBackLogin = (data: boolean) => {
    onBackToLogin(data);
  };

  return (
    <>
      <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2, display: 'block' }}>
        <Typography variant="h5" gutterBottom className="text-center pb-3 ">
          Service Provider Registration
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
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
              // <Button onClick={handleNext} variant="contained" color="primary">
              //   Next
              // </Button>
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
        </form>
      </Box>
      <div className="flex flex-col mt-4 items-center justify-center text-sm">
        <Typography variant="h6" className="dark:text-gray-300 pb-3">
          Already have an account?
          <Button
            className="text-blue-500 ml-2 underline"
            onClick={() => handleBackLogin(false)}
          >
            Sign in
          </Button>
        </Typography>
      </div>
    </>
  );
};

export default ServiceProviderRegistration;
