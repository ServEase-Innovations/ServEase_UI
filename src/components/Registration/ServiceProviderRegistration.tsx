import React, { useState } from 'react';
import {
  TextField,Input, Button, Grid, Typography, Box, Stepper, Step, StepLabel, Checkbox, FormControlLabel
} from '@mui/material';
import './ServiceProvider.css';

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
  serviceType: string;   // Dropdown for Service Type
  description: string;   // Text area for business description
  experience: string;    // Experience in years
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
  serviceType?: string;   // Error message for Service Type
  description?: string;   // Error message for Description
  experience?: string;    // Error message for Experience
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

const ServiceProviderRegistration = () => {
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

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  //   });
  // };
  // Add a state to hold the image preview URL
  const [aadhaarImagePreview, setAadhaarImagePreview] = useState<string | null>(null);
  const [panImagePreview, setPanImagePreview] = useState<string | null>(null);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, type, value, checked, files } = e.target;
  
  //   if (name === 'aadhaarImage' && files) {
  //     const file = files[0];
  //     setFormData({
  //       ...formData,
  //       aadhaarImage: file,
  //     });
  //     setAadhaarImagePreview(URL.createObjectURL(file)); // Aadhaar image preview
  //   } else if (name === 'panImage' && files) {
  //     const file = files[0];
  //     setFormData({
  //       ...formData,
  //       panImage: file,
  //     });
  //     setPanImagePreview(URL.createObjectURL(file)); // PAN image preview
  //   } else {
  //     setFormData({
  //       ...formData,
  //       [name]: type === 'checkbox' ? checked : value,
  //     });
  //   }
  // };
  const [aadhaarImageName, setAadhaarImageName] = useState<string>('');
  const [panImageName, setPanImageName] = useState<string>('');

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
        tempErrors.password = 'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.';
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
      
      // if (!formData.description) {
      //   tempErrors.description = 'Description is required.';
      // }
    
      
      // if (!formData.experience || isNaN(Number(formData.experience))) {
      //   tempErrors.experience = 'Experience must be a valid number.';
      // }
    }

    if (activeStep === 3) {
      // Aadhaar number validation (12 digits only)
      if (!formData.aadhaar || !aadhaarRegex.test(formData.aadhaar)) {
        tempErrors.aadhaar = 'Aadhaar number must be exactly 12 digits.';
      }
      
      // PAN number validation (10-character alphanumeric format)
      if (!formData.pan || !panRegex.test(formData.pan)) {
        tempErrors.pan = 'PAN number must be in a valid format (5 letters, 4 digits, 1 letter).';
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
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                type="password"
                name="password"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
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
        case 2:
       return (
    <>
      <Grid container spacing={2}>
        {/* Service Type Dropdown */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label={formData.serviceType ? 'Service Type' : 'Select Service Type'}
            name="serviceType"
            fullWidth
            required
            SelectProps={{ native: true }}
            value={formData.serviceType}
            onChange={handleChange}
            error={!!errors.serviceType}
            helperText={errors.serviceType || 'Select the service category'}
          >
            <option value="" disabled>
              Select Service Type
            </option>
            <option value="Cook">Cook</option>
            <option value="Nannies">Nannies</option>
            <option value="Maid">Maid</option>
          </TextField>
        </Grid>

        {/* Description Field */}
        <Grid item xs={12}>
          <TextField
            label="Description"
            name="description"
            fullWidth
            // required
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description || 'Provide a brief overview of the business'}
          />
        </Grid>

        {/* Experience Field */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Experience"
            name="experience"
            fullWidth
            // required
            value={formData.experience}
            onChange={handleChange}
            error={!!errors.experience}
            helperText={errors.experience || 'Years in business or relevant experience'}
          />
        </Grid>
      </Grid>

      {/* Checkbox for agreeing to Terms of Service */}
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
    </>
        );

        
      case 3:
        // return (
        //   <Grid container spacing={2}>
        //     <Grid item xs={12}>
        //       <TextField
        //         label="Aadhaar Number"
        //         name="aadhaar"
        //         fullWidth
        //         required
        //         value={formData.aadhaar}
        //         onChange={handleChange}
        //         error={!!errors.aadhaar}
        //         helperText={errors.aadhaar}
        //       />
        //       <Input
        //         type="file"
        //         inputProps={{ accept: 'image/*' }}
        //         name="aadhaarImage"
        //         onChange={handleChange}
        //         required
        //       />
        //       {aadhaarImagePreview && (
        //         <Box mt={2}>
        //           <Typography variant="h6">Aadhaar Preview:</Typography>
        //           <img src={aadhaarImagePreview} alt="Aadhaar Card" width="500" />
        //         </Box>
        //       )}
        //       {errors.document && <Typography color="error">{errors.document}</Typography>}
        //     </Grid>
        //     <Grid item xs={12}>
        //       <TextField
        //         label="PAN Number"
        //         name="pan"
        //         fullWidth
        //         required
        //         value={formData.pan}
        //         onChange={handleChange}
        //         error={!!errors.pan}
        //         helperText={errors.pan}
        //       />
        //       <Input
        //         type="file"
        //         inputProps={{ accept: 'image/*' }}
        //         name="panImage"
        //         onChange={handleChange}
        //         required
        //       />
        //       {panImagePreview && (
        //         <Box mt={2}>
        //           <Typography variant="h6">PAN Preview:</Typography>
        //           <img src={panImagePreview} alt="PAN Card" width="500" />
        //         </Box>
        //       )}
        //       {errors.document && <Typography color="error">{errors.document}</Typography>}
        //     </Grid>
        //   </Grid>
        // );
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
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

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Service Provider Registration
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
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
            color="secondary"
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained" color="primary">
              Next
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default ServiceProviderRegistration;
