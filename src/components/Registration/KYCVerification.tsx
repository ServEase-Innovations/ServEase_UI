/* eslint-disable */
import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Paper,
  Box,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import CustomFileInput from "./CustomFileInput";

interface KYCVerificationProps {
  formData: any;
  errors: any;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldFocus: (fieldName: string) => void;
  onDocumentUpload: (file: File | null) => void;
  onKycTypeChange: (kycType: string) => void;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({
  formData,
  errors,
  onFieldChange,
  onFieldFocus,
  onDocumentUpload,
  onKycTypeChange,
}) => {
  const kycOptions = [
    { 
      value: "AADHAR", 
      label: "Aadhaar Card", 
      description: "Government ID proof", 
      placeholder: "Aadhaar Number *", 
      pattern: "[0-9]{12}", 
      maxLength: 12, 
      helperText: "Enter 12-digit Aadhaar number" 
    },
    { 
      value: "PAN", 
      label: "PAN Card", 
      description: "Permanent Account Number", 
      placeholder: "PAN Number *", 
      pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}", 
      maxLength: 10, 
      helperText: "Enter 10-digit PAN (e.g., ABCDE1234F)" 
    },
    { 
      value: "DRIVING_LICENSE", 
      label: "Driving License", 
      description: "Driving License", 
      placeholder: "Driving License Number *", 
      pattern: "^[A-Z]{2}[0-9]{2}[0-9]{4,11}*$", 
      maxLength: 16, 
      helperText: "Enter your driving license number" 
    },
    { 
      value: "VOTER_ID", 
      label: "Voter ID", 
      description: "Voter Identification Card", 
      placeholder: "Voter ID Number *", 
      pattern: "[A-Z]{3}[0-9]{7}", 
      maxLength: 10, 
      helperText: "Enter 10-digit Voter ID" 
    },
    { 
      value: "PASSPORT", 
      label: "Passport", 
      description: "Passport", 
      placeholder: "Passport Number *", 
      pattern: "[A-Z]{1}[0-9]{7}", 
      maxLength: 8, 
      helperText: "Enter 8-character passport number" 
    },
  ];

  const getCurrentKycOption = () => {
    return kycOptions.find(option => option.value === formData.kycType) || kycOptions[0];
  };

  const currentOption = getCurrentKycOption();

  return (
    <Grid container spacing={2.5}>
      {/* KYC Type Selection */}
      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!errors.kycType} required fullWidth>
          <FormLabel 
            component="legend" 
            sx={{ 
              mb: 1.5,
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'text.primary',
              '& .MuiFormLabel-asterisk': {
                color: '#d32f2f',
                fontSize: '0.95rem',
                marginLeft: '2px'
              }
            }}
          >
            Select KYC Document Type *
          </FormLabel>
          
          <RadioGroup
            name="kycType"
            value={formData.kycType || "AADHAR"}
            onChange={(e) => onKycTypeChange(e.target.value)}
          >
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
              gap: 1,
              width: '100%',
            }}>
              {kycOptions.map((option) => (
                <Paper
                  key={option.value}
                  elevation={formData.kycType === option.value ? 2 : 0}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: formData.kycType === option.value ? '#e3f2fd' : '#fff',
                    border: '1.5px solid',
                    borderColor: formData.kycType === option.value ? '#1976d2' : '#e0e0e0',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      borderColor: '#1976d2',
                      bgcolor: formData.kycType === option.value ? '#e3f2fd' : '#f5f5f5',
                    },
                  }}
                  onClick={() => onKycTypeChange(option.value)}
                >
                  <FormControlLabel
                    value={option.value}
                    control={<Radio sx={{ display: 'none' }} />}
                    label={
                      <Box sx={{ 
                        textAlign: 'center',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography 
                          variant="caption"
                          fontWeight={formData.kycType === option.value ? 600 : 500}
                          color={formData.kycType === option.value ? 'primary' : 'text.primary'}
                          sx={{ 
                            fontSize: '0.7rem',
                            display: 'block',
                            lineHeight: 1.2,
                            mb: 0.25,
                            textAlign: 'center',
                            width: '100%'
                          }}
                        >
                          {option.label}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.6rem',
                            display: 'block',
                            lineHeight: 1.1,
                            opacity: 0.8,
                            textAlign: 'center',
                            width: '100%'
                          }}
                        >
                          {option.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ 
                      m: 0, 
                      width: '100%',
                      '& .MuiFormControlLabel-label': {
                        width: '100%'
                      }
                    }}
                  />
                </Paper>
              ))}
            </Box>
          </RadioGroup>
          {errors.kycType && (
            <FormHelperText error sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {errors.kycType}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }} />
      </Grid>

      {/* Selected KYC Type Header */}
      <Grid item xs={12}>
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {currentOption.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {currentOption.description}
          </Typography>
        </Box>
      </Grid>

      {/* Dynamic Document Number Field based on KYC Type */}
      <Grid item xs={12}>
        <TextField
          placeholder={currentOption.placeholder}
          name="kycNumber"
          fullWidth
          required
          size="small"
          value={formData.kycNumber || ""}
          onChange={onFieldChange}
          onFocus={() => onFieldFocus("kycNumber")}
          error={!!errors.kycNumber}
          helperText={errors.kycNumber || currentOption.helperText}
          FormHelperTextProps={{
            sx: { fontSize: '0.7rem', mt: 0.5 }
          }}
          inputProps={{
            maxLength: currentOption.maxLength,
            pattern: currentOption.pattern,
            inputMode: currentOption.value === "AADHAR" ? "numeric" : "text"
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              fontSize: '0.85rem'
            }
          }}
        />
      </Grid>

      {/* Document Upload Section */}
      <Grid item xs={12}>
        <CustomFileInput
          name="documentImage"
          accept="image/*,.pdf"
          required
          value={formData.documentImage}
          onChange={onDocumentUpload}
          buttonText={`Upload ${currentOption.label} Document`}
        />
      </Grid>

      {/* Helper Text based on KYC Type */}
      <Grid item xs={12}>
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 1.5,
            bgcolor: '#f5f5f5',
            py: 0.5,
            '& .MuiAlert-message': {
              padding: '4px 0',
              width: '100%'
            }
          }}
          icon={false}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textAlign: 'left', display: 'block' }}>
            <Box component="span" sx={{ fontWeight: 600, color: '#1976d2', mr: 0.5 }}>Note:</Box>
            Please upload a clear image of your {currentOption.label}. Accepted formats: JPG, PNG, PDF. Max size: 5MB.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );
};

export default KYCVerification;