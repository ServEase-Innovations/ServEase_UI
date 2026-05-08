/* eslint-disable */
import React, { useState, useEffect } from "react";
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
  Chip,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CustomFileInput from "./CustomFileInput";
import { useLanguage } from "src/context/LanguageContext";

interface KYCVerificationProps {
  formData: any;
  errors: any;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldFocus: (fieldName: string) => void;
  onFileSelect: (file: File | null) => void; // renamed from onDocumentUpload
  onKycTypeChange: (kycType: string) => void;
  selectedFile?: File | null; // optional file for preview
}

const KYCVerification: React.FC<KYCVerificationProps> = ({
  formData,
  errors,
  onFieldChange,
  onFieldFocus,
  onFileSelect,
  onKycTypeChange,
  selectedFile,
}) => {
  const { t } = useLanguage();

  // Local preview URL
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Generate preview URL when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl("");
    }
  }, [selectedFile]);

  const kycOptions = [
    { 
      value: "AADHAR", 
      label: t("aadhaarCard"), 
      description: t("governmentIdProof"), 
      placeholder: t("aadhaarNumberPlaceholder"), 
      pattern: "[0-9]{12}", 
      maxLength: 12, 
      helperText: t("aadhaarHelperText") 
    },
    { 
      value: "PAN", 
      label: t("panCard"), 
      description: t("panDescription"), 
      placeholder: t("panNumberPlaceholder"), 
      pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}", 
      maxLength: 10, 
      helperText: t("panHelperText") 
    },
    { 
      value: "DRIVING_LICENSE", 
      label: t("drivingLicense"), 
      description: t("drivingLicense"), 
      placeholder: t("drivingLicensePlaceholder"), 
      pattern: "^[A-Z]{2}[0-9]{2}[0-9]{4,11}*$", 
      maxLength: 16, 
      helperText: t("drivingLicenseHelperText") 
    },
    { 
      value: "VOTER_ID", 
      label: t("voterId"), 
      description: t("voterIdDescription"), 
      placeholder: t("voterIdPlaceholder"), 
      pattern: "[A-Z]{3}[0-9]{7}", 
      maxLength: 10, 
      helperText: t("voterIdHelperText") 
    },
    { 
      value: "PASSPORT", 
      label: t("passport"), 
      description: t("passport"), 
      placeholder: t("passportPlaceholder"), 
      pattern: "[A-Z]{1}[0-9]{7}", 
      maxLength: 8, 
      helperText: t("passportHelperText") 
    },
  ];

  const getCurrentKycOption = () => {
    return kycOptions.find(option => option.value === formData.kycType) || kycOptions[0];
  };

  const currentOption = getCurrentKycOption();

  // Determine if the selected file is an image
  const isImage = selectedFile?.type.startsWith("image/");

  // Handler for removing the selected file
  const handleRemoveFile = () => {
    onFileSelect(null);
  };

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
            {t("selectKycDocumentType")}
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

      {/* Document Upload Section with Preview */}
      <Grid item xs={12}>
        <CustomFileInput
          name="documentImage"
          accept="image/*,.pdf"
          required
          value={formData.documentImage}
          onChange={onFileSelect} // now just selects file, no upload
          buttonText={t("uploadDocument").replace("{documentName}", currentOption.label)}
        />
        
        {/* Preview area */}
        {selectedFile && (
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: '#f5f5f5', position: 'relative' }}>
            <IconButton
              size="small"
              onClick={handleRemoveFile}
              sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isImage && previewUrl ? (
                <Avatar
                  src={previewUrl}
                  variant="rounded"
                  sx={{ width: 80, height: 80, objectFit: 'cover' }}
                />
              ) : (
                <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                  <PdfIcon sx={{ fontSize: 32, color: 'white' }} />
                </Avatar>
              )}
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
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
            {t("kycNote").replace("{documentName}", currentOption.label)}
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );
};

export default KYCVerification;