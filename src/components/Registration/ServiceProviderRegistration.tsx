import React, { useState ,ChangeEvent,SyntheticEvent,useRef} from 'react';
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
  MenuItem,
  Alert,
  AlertColor,
  RadioGroup,
  Radio,
  FormControl, 
  FormLabel,
  FormHelperText,
  Avatar
} from '@mui/material';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import { Visibility, VisibilityOff,ArrowForward,ArrowBack,CameraAlt as CameraAltIcon   } from '@mui/icons-material';
import { px } from 'framer-motion';
import ProfileImageUpload from './ProfileImageUpload';
import axios from 'axios';

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
  locality:String;
  street: string;
  currentLocation: string;
  nearbyLocation: string;
  // city: string;
  // state: string;
  pincode: string;
  aadhaar: string;
  pan: string;
  agreeToTerms: boolean;
  aadhaarImage: File | null; // New field for Aadhaar image upload
  panImage: File | null; // New field for PAN image upload
  housekeepingRole: string; // Dropdown for Service Type
  description: string; // Text area for business description
  experience: string; // Experience in years
  kyc: string;
  documentDetails: string;
  documentImage: File | null;
  profileImage: File | null; // New field for Profile Image
  speciality: string;
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
  street ?: string;
  currentLocation?: string;
  city?: string;
  state?: string;
  pincode?: string;
  aadhaar?: string;
  pan?: string;
  agreeToTerms?: string; // This is now a string for error messages
  document?: string; // Error message for document
  housekeepingRole?: string; // Error message for Service Type
  description?: string; // Error message for Description
  experience?: string; // Error message for Experience
  kyc?: string;
  documentDetails?: string;
  documentImage?: string;
  speciality?: string;
}
 
// Regex for validation
const nameRegex = /^[A-Za-z\s]+$/;
const emailIdRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Z|a-z]{2,}$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^[0-9]{10}$/;
const pincodeRegex = /^[0-9]{6}$/;
// const aadhaarRegex = /^[0-9]{12}$/;
// const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success'); // Use AlertColor for correct typing
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const [isCookSelected, setIsCookSelected] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    middleName:'',
    lastName: '',
    gender: '',
    emailId: '',
    password: '',
    confirmPassword: '',
    mobileNo: '',
    AlternateNumber:'',
    address: '',
    buildingName:'',
    locality:'',
    street: '',
    currentLocation:'',
    nearbyLocation:'',
    // city: '',
    // state: '',
    pincode: '',
    aadhaar: '',
    pan: '',
    agreeToTerms: false,
    aadhaarImage: null, 
    panImage: null, 
    housekeepingRole: '',
    description: '',
    experience: '',
    kyc : '',
    documentDetails: '',
    documentImage: null,
    profileImage: null,
    speciality: '',
    });

  const [errors, setErrors] = useState<FormErrors>({});
  

  // States for image previews and names
const [documentImageName, setDocumentImageName] = useState<string>('');
const [documentImagePreview, setDocumentImagePreview] = useState<string | null>(null);

  // const [aadhaarImagePreview, setAadhaarImagePreview] = useState<string | null>(null);
  // const [panImagePreview, setPanImagePreview] = useState<string | null>(null);
  // const [aadhaarImageName, setAadhaarImageName] = useState<string>('');
  // const [panImageName, setPanImageName] = useState<string>('');

  // States for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   // File change handler to update the profile picture
   const handleImageSelect = (file: File | null) => {
    setFormData((prevData) => ({ ...prevData, profileImage: file }));
  };
  
  // Click handler to trigger file input click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
   // Handle changes in service type selection
   const handleServiceTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData((prevData) => ({ ...prevData, housekeepingRole: value }));

    // Check if 'COOK' is selected and update isCookSelected accordingly
    if (value === 'COOK') {
      setIsCookSelected(true);
    } else {
      setIsCookSelected(false);
      // Reset speciality if not cook
      setFormData((prevData) => ({ ...prevData, speciality: '' }));
    }
  };

  // Handle changes in speciality selection
  const handleSpecialityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData((prevData) => ({ ...prevData, speciality: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
  
    // Handle file upload separately
    if (type === 'file') {
      const target = e.target as HTMLInputElement; // Cast to HTMLInputElement
      const files = target.files; // Access files property
      setFormData((prev) => ({
        ...prev,
        documentImage: files ? files[0] : null, // Set the first file or null
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    let tempErrors: FormErrors = {}; // Temporary object to store errors
  
    // Step 1: Basic Information Validation
    if (activeStep === 0) {
      if (!formData.firstName || !nameRegex.test(formData.firstName)) {
        tempErrors.firstName = 'First Name is required and should contain only alphabets.';
      }
      if (!formData.lastName || !nameRegex.test(formData.lastName)) {
        tempErrors.lastName = 'Last Name is required and should contain only alphabets.';
      }
      if (!formData.gender) {
        tempErrors.gender = 'Please select a gender.';
      }
      if (!formData.emailId || !emailIdRegex.test(formData.emailId)) {
        tempErrors.emailId = 'Valid email is required.';
      }
      if (!formData.password || !strongPasswordRegex.test(formData.password)) {
        tempErrors.password =
          'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.';
      }
      if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = 'Passwords do not match.';
      }
      if (!formData.mobileNo || !phoneRegex.test(formData.mobileNo)) {
        tempErrors.mobileNo = 'Phone number must be exactly 10 digits.';
      }
    }
  
    // Step 2: Address Information Validation
    if (activeStep === 1) {
      if (!formData.address) {
        tempErrors.address = 'Address is required.';
      }
      if (!formData.buildingName) {
        tempErrors.buildingName = 'Building Name is required.';
      }
      if (!formData.locality) {
        tempErrors.locality = 'Locality is required.';
      }
      if (!formData.street) {
        tempErrors.street = 'Street is required.';
      }
      if (!formData.currentLocation) {
        tempErrors.currentLocation = 'Current Location is required.';
      }
      if (!formData.pincode || !pincodeRegex.test(formData.pincode)) {
        tempErrors.pincode = 'Pin Code must be exactly 6 digits.';
      }
    }
  
    // Step 3: Additional Details Validation
    if (activeStep === 2) {
      if (!formData.agreeToTerms) {
        tempErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy.';
      }
      if (!formData.housekeepingRole) {
        tempErrors.housekeepingRole = 'Please select a service type.';
      }
      if (formData.housekeepingRole === 'COOK' && !formData.speciality) {
        tempErrors.speciality = 'Please select a speciality for the cook service.';
      }
      // Optional fields (uncomment if needed)
      // if (!formData.description) {
      //   tempErrors.description = 'Description is required.';
      // }
      // if (!formData.experience || isNaN(Number(formData.experience))) {
      //   tempErrors.experience = 'Experience must be a valid number.';
      // }
    }
  
    // Step 4: KYC Verification Validation
    if (activeStep === 3) {
      if (!formData.kyc) {
        tempErrors.kyc = 'Document type is required.';
      }
  
      if (formData.kyc === 'AADHAR') {
        if (!formData.documentDetails) {
          tempErrors.documentDetails = 'Aadhaar details are required.';
        } else if (!/^\d{12}$/.test(formData.documentDetails)) {
          tempErrors.documentDetails = 'Aadhaar number must be exactly 12 digits.';
        }
      } else if (formData.kyc === 'PAN') {
        if (!formData.documentDetails) {
          tempErrors.documentDetails = 'PAN details are required.';
        } else if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.documentDetails)) {
          tempErrors.documentDetails = 'PAN number must be in the format ABCDE1234F.';
        }
      } else if (formData.kyc === 'DL') {
        if (!formData.documentDetails) {
          tempErrors.documentDetails = 'DL details are required.';
        } else if (!/^[A-Z]{2}\d{13}$/.test(formData.documentDetails)) {
          tempErrors.documentDetails = 'DL number must be in the format AB123456789012.';
        }
      }
  
      if (!formData.documentImage) {
        tempErrors.documentImage = 'Document image is required.';
      }
    }
  
    // Set errors to state and return the validation result
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  // const handleNext = () => {
  //   if (validateForm()) {
  //     setActiveStep((prevStep) => prevStep + 1);
  //   }
  // };
 
  const handleNext = () => {
    if (validateForm ()) {
      setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
      if (activeStep === steps.length - 1) {
        setSnackbarMessage('Registration Successful!');
        setSnackbarOpen(true);
        // Optionally, reset form data or redirect
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check for internet connectivity
    if (!navigator.onLine) {
      setSnackbarSeverity('error'); // Set snackbar to error (red)
      setSnackbarMessage('Something went wrong , Please contact administrator');
      setSnackbarOpen(true);
      return; // Exit if offline
    }

    // If online, proceed with form submission
    console.log('Form submitted successfully!');
    setSnackbarSeverity('success'); // Set snackbar to success (green)
    setSnackbarMessage('Registration done successfully!');
    setSnackbarOpen(true);

    const response =  axios.post(
      "http://localhost:8080/api/serviceproviders/serviceprovider/add",
       formData
    );
  };
   // Close snackbar function
   const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  //  const handleCloseSnackbar = (
  //   event: React.SyntheticEvent<Element, Event> | null,
  //   reason?: SnackbarCloseReason
  // ) => {
  //   if (reason === 'clickaway') {
  //     return;
  //   }
  //   setSnackbarOpen(false);
  // };
  // Function to show the snackbar
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            
        {/* Profile Picture Upload Section */}
      <Grid item xs={12}>
        <ProfileImageUpload onImageSelect={handleImageSelect} />
      </Grid>

      <Grid item xs={12}>
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

      <Grid item xs={12}>
        <TextField
          label="Middle Name"
          name="middleName"
          fullWidth
          value={formData.middleName}
          onChange={handleChange}
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
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!errors.gender}>
          <FormLabel component="legend">Gender</FormLabel>
          <RadioGroup
            row
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <FormControlLabel value="MALE" control={<Radio />} label="Male" />
            <FormControlLabel value="FEMALE" control={<Radio />} label="Female" />
            <FormControlLabel value="OTHER" control={<Radio />} label="Other" />
          </RadioGroup>
          {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Email"
          name="emailId"
          fullWidth
          required
          value={formData.emailId}
          onChange={handleChange}
          error={!!errors.emailId}
          helperText={errors.emailId}
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
                <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} className="pt-4">
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
                label="BuildingName"
                name="buildingName"
                fullWidth
                required
                value={formData.buildingName}
                onChange={handleChange}
                error={!!errors.buildingName}
                helperText={errors.buildingName}
              />
            </Grid>
            <Grid item xs={12} sm={6} >
              <TextField
                label="Locality"
                name="locality"
                fullWidth
                required
                value={formData.locality}
                onChange={handleChange}
                error={!!errors.locality}
                helperText={errors.locality}
              />
            </Grid>
            <Grid item xs={12} sm={6} >
              <TextField
                label="Street"
                name="street"
                fullWidth
                required
                value={formData.street}
                onChange={handleChange}
                error={!!errors.street}
                helperText={errors.street}
              />
            </Grid>
            <Grid item xs={12}sm={6}>
              <TextField
                label="Pincode"
                name="pincode"
                fullWidth
                required
                value={formData.pincode}
                onChange={handleChange}
                error={!!errors.pincode}
                helperText={errors.pincode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CurrentLocation"
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
                label="NearbyLocation"
                name="nearbyLocation"
                fullWidth
                value={formData.nearbyLocation}
                onChange={handleChange}
                // error={!!errors.nearbyLocation}
                // helperText={errors.nearbyLocation}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
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
            </Grid> */}
          </Grid>
        );
      case 2: // Additional Details
      return (
        <>
  <Grid container spacing={2}>
     {/* Service Type Dropdown */}
     <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Select Service Type"
            name="housekeepingRole"
            fullWidth
            value={formData.housekeepingRole}
            onChange={handleServiceTypeChange}
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

        {/* Speciality Radio Buttons (Visible if 'COOK' is selected) */}
        {isCookSelected && (
          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset" error={!!errors.speciality} required>
              <FormLabel component="legend">Speciality</FormLabel>
              <RadioGroup
                name="speciality"
                value={formData.speciality}
                onChange={handleSpecialityChange}
              >
                <FormControlLabel value="veg" control={<Radio />} label="Veg" />
                <FormControlLabel value="non-veg" control={<Radio />} label="Non-Veg" />
                <FormControlLabel value="both" control={<Radio />} label="Both" />
              </RadioGroup>
              <FormHelperText>{errors.speciality}</FormHelperText>
            </FormControl>
          </Grid>
        )}
    {/* Description Field */}
    <Grid item xs={12}>
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
        helperText={errors.experience || "Years in business or relevant experience"}
      />
    </Grid>

    {/* Checkbox for Terms of Service */}
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
        <Grid item xs={12}  className='pt-4'>
          <TextField
            select
            label="Select Document Type"
            name="kyc"
            fullWidth
            required
            value={formData.kyc}
            onChange={handleChange}
            error={!!errors.kyc}
            helperText={errors.kyc}
          >
            <MenuItem value="AADHAR">Aadhaar</MenuItem>
            <MenuItem value="PAN">PAN</MenuItem>
            <MenuItem value="DL">DL</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={
              formData.kyc === 'AADHAR'
                ? "Aadhaar Number (12 digits)"
                : formData.kyc === 'PAN'
                ? "PAN Number (10 characters)"
                : formData.kyc=== 'DL'
                ? "DL Number (details required)"
                : "Document Details"
            }
            name="documentDetails"
            fullWidth
            required
            value={formData.documentDetails}
            onChange={handleChange}
            error={!!errors.documentDetails}
            helperText={errors.documentDetails}
          />
        </Grid>
        <Grid item xs={12}>
          <Input
            type="file"
            inputProps={{ accept: 'image/*' }}
            name="documentImage"
            onChange={handleChange}
            required
          />
          {formData.documentImage && (
            <Typography variant="body2">Selected File: {formData.documentImage.name}</Typography>
          )}
          {formData.documentImage && (
            <Box mt={2}>
              <Typography variant="h6">Document Preview:</Typography>
              <img src={URL.createObjectURL(formData.documentImage)} alt="Document" width="300" />
            </Box>
          )}
          {errors.documentImage && <Typography color="error">{errors.documentImage}</Typography>}
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
            variant="contained"
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            endIcon={<ArrowForward />}
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </form>
      </Box>
      <Snackbar open={snackbarOpen} 
      autoHideDuration={6000} 
      onClose={handleCloseSnackbar}   
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ marginTop: '60px',}}
      >
       <Alert onClose={handleCloseSnackbar}
        severity={snackbarSeverity}  
        sx={{ width: '100%', fontSize: '1.5rem', padding: '16px', border: '1px solid grey',}}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {/* Snackbar for success message */}
      {/* <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar> */}
      <div className="flex flex-col mt-4 items-center justify-center text-sm">
        <Typography variant="h6">
          Already have an account?
          <Button
            className="text-blue-400 ml-2 underline"
            onClick={() => onBackToLogin(false)}
          >
            Sign in
          </Button>
        </Typography>
      </div>
    </>
  );
};

export default ServiceProviderRegistration;