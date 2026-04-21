/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Container,
  Grid,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputLabel,
  FormHelperText,
  Tooltip,
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  FileCopy,
  CheckCircle,
  Error as ErrorIcon,
  InfoOutlined,
} from "@mui/icons-material";

import { Button } from "../Button/button";
import { ArrowBack as ArrowBackIcon, Close as CloseIcon } from "@mui/icons-material";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { useFieldValidation } from "./useFieldValidation";
import providerInstance from "src/services/providerInstance";
import { useLanguage } from "src/context/LanguageContext";
import axios from "axios";

interface RegistrationProps {
  onBackToLogin: (data: boolean) => void;
  onClose?: () => void;
}

interface FormData {
  companyName: string;
  phoneNo: string;
  emailId: string;
  address: string;
  registrationId: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  phoneNo: string;
  emailId: string;
  registrationId: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse {
  registrationId?: string;
  message?: string;
  error?: string;
}

interface ApiRequestPayload {
  companyName: string;
  address: string;
  emailid: string;
  phoneNo: string;
  registrationId: string;
}

const AgentRegistrationForm: React.FC<RegistrationProps> = ({
  onBackToLogin,
  onClose,
}) => {
  const { t, currentLanguage } = useLanguage();
  
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    phoneNo: "",
    emailId: "",
    address: "",
    registrationId: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    phoneNo: "",
    emailId: "",
    registrationId: "",
    password: "",
    confirmPassword: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const [returnedRegistrationId, setReturnedRegistrationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { validationResults, validateField, resetValidation } = useFieldValidation();

  const [emailTimer, setEmailTimer] = useState<NodeJS.Timeout | null>(null);
  const [mobileTimer, setMobileTimer] = useState<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setValidationErrors({
      ...validationErrors,
      [name]: "",
    });

    if (name === "emailId") {
      if (emailTimer) clearTimeout(emailTimer);
      const timer = setTimeout(() => {
        if (value && emailRegex.test(value)) {
          validateField("email", value);
        }
      }, 500);
      setEmailTimer(timer);
    }

    if (name === "phoneNo") {
      if (mobileTimer) clearTimeout(mobileTimer);
      const timer = setTimeout(() => {
        if (value && mobileRegex.test(value)) {
          validateField("mobile", value);
        }
      }, 500);
      setMobileTimer(timer);
    }

    validateForm(name, value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const mobileRegex = /^[0-9]{10}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const registrationIdRegex = /^[A-Z0-9]{10,20}$/;

  const validateForm = (field: string, value: string) => {
    switch (field) {
      case "phoneNo":
        setValidationErrors((prev) => ({
          ...prev,
          phoneNo: !mobileRegex.test(value)
            ? t("phoneValidationError")
            : "",
        }));
        break;
      case "emailId":
        setValidationErrors((prev) => ({
          ...prev,
          emailId: !emailRegex.test(value) ? t("emailValidationError") : "",
        }));
        break;
      case "registrationId":
        setValidationErrors((prev) => ({
          ...prev,
          registrationId: !value.trim() 
            ? t("registrationIdRequired")
            : !registrationIdRegex.test(value)
            ? t("registrationIdValidationError")
            : "",
        }));
        break;
      case "password":
        setValidationErrors((prev) => ({
          ...prev,
          password: !passwordRegex.test(value)
            ? t("passwordValidationError")
            : "",
        }));
        break;
      case "confirmPassword":
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword:
            value !== formData.password ? t("passwordMismatch") : "",
        }));
        break;
      default:
        break;
    }
  };

  const isFormValid = () => {
    const basicValidations = 
      !validationErrors.phoneNo &&
      !validationErrors.emailId &&
      !validationErrors.registrationId &&
      !validationErrors.password &&
      !validationErrors.confirmPassword &&
      formData.companyName &&
      formData.phoneNo &&
      formData.emailId &&
      formData.address &&
      formData.registrationId &&
      formData.password &&
      formData.confirmPassword;

    const availabilityValidations = 
      validationResults.email.isAvailable === true &&
      validationResults.mobile.isAvailable === true;

    return basicValidations && availabilityValidations;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.address) {
      setMessage(t("fillRequiredFields"));
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    if (!isFormValid()) {
      setMessage(t("ensureValidFields"));
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);

    const requestData: ApiRequestPayload = {
      companyName: formData.companyName,
      address: formData.address,
      emailid: formData.emailId,
      phoneNo: formData.phoneNo,
      registrationId: formData.registrationId,
    };

    try {
      const response = await providerInstance.post<ApiResponse>("/api/vendor/add", requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {

        const authPayload = {
          email: formData.emailId,
          password: formData.password,
          name: `${formData.companyName}`,
        };

        axios.post('https://utils-ndt3.onrender.com/authO/create-autho-user', authPayload)
          .then((authResponse) => {
            console.log("AuthO user created successfully:", authResponse.data);
          }).catch((authError) => {
            console.error("Error creating AuthO user:", authError);
          });

        const apiReturnedId = response.data.registrationId || formData.registrationId;
        setReturnedRegistrationId(apiReturnedId);
        setMessage(t("vendorAdded"));
        setSnackbarSeverity("success");
        setOpenSnackbar(true);

        try {
          await navigator.clipboard.writeText(apiReturnedId);
        } catch (err) {
          console.error("Failed to copy registration ID: ", err);
        }

        setFormData({
          companyName: "",
          phoneNo: "",
          emailId: "",
          address: "",
          registrationId: "",
          password: "",
          confirmPassword: "",
        });

        resetValidation();

        setTimeout(() => {
          setIsSubmitting(false);
          if (onClose) {
            onClose();
          } else {
            onBackToLogin(true);
          }
        }, 2000);
      } else {
        setMessage(response.data.error || t("vendorAddFailed"));
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("API Error:", error);
      
      if (error.response) {
        setMessage(error.response.data.error || t("serverError"));
      } else if (error.request) {
        setMessage(t("noServerResponse"));
      } else {
        setMessage(t("apiConnectionError"));
      }
      
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCopyRegistrationId = () => {
    navigator.clipboard
      .writeText(returnedRegistrationId)
      .then(() => {
        setMessage(t("registrationIdCopied"));
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      })
      .catch((err) => {
        console.error("Failed to copy registration ID: ", err);
      });
  };

  useEffect(() => {
    return () => {
      if (emailTimer) clearTimeout(emailTimer);
      if (mobileTimer) clearTimeout(mobileTimer);
    };
  }, [emailTimer, mobileTimer]);

  const renderValidationIcon = (fieldType: 'email' | 'mobile') => {
    const result = validationResults[fieldType];
    
    if (result.loading) {
      return <CircularProgress size={20} />;
    }
    
    if (result.isAvailable === true && result.isValidated) {
      return <CheckCircle sx={{ color: 'success.main' }} />;
    }
    
    if (result.isAvailable === false && result.isValidated) {
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    }
    
    return null;
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={true}>
      <DialogHeader
        style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <IconButton
          aria-label="back"
          onClick={() => onBackToLogin(true)}
          sx={{ color: (theme) => theme.palette.grey[500], position: 'absolute', left: 8 }}
          disabled={isSubmitting}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" align="center">
          {t("agentRegistration")}
        </Typography>

        <IconButton
          aria-label="close"
          onClick={() => onBackToLogin(true)}
          sx={{
            position: 'absolute',
            right: 8,
            color: '#fff',
          }}
          disabled={isSubmitting}
        >
          <CloseIcon />
        </IconButton>
      </DialogHeader>

      <DialogContent>
        <Box sx={{ padding: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("companyName")}
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  disabled={isSubmitting}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label={t("mobileNumber")}
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    required
                    type="tel"
                    error={!!validationErrors.phoneNo || validationResults.mobile.isAvailable === false}
                    helperText={
                      validationErrors.phoneNo || 
                      (validationResults.mobile.error) ||
                      (validationResults.mobile.isAvailable === false ? t("mobileAlreadyRegistered") : "")
                    }
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 10 }}
                    disabled={isSubmitting}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {renderValidationIcon('mobile')}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label={t("emailId")}
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    required
                    type="email"
                    error={!!validationErrors.emailId || validationResults.email.isAvailable === false}
                    helperText={
                      validationErrors.emailId || 
                      (validationResults.email.error) ||
                      (validationResults.email.isAvailable === false ? t("emailAlreadyRegistered") : "")
                    }
                    variant="outlined"
                    size="small"
                    disabled={isSubmitting}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {renderValidationIcon('email')}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Grid>

              {/* Registration ID field with Info button */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("registrationId")}
                  name="registrationId"
                  value={formData.registrationId}
                  onChange={handleChange}
                  required
                  error={!!validationErrors.registrationId}
                  helperText={validationErrors.registrationId}
                  variant="outlined"
                  size="small"
                  inputProps={{ 
                    maxLength: 20,
                    style: { textTransform: 'uppercase' }
                  }}
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip 
                          title="Government-issued company registration ID"
                          arrow
                        >
                          <IconButton 
                            edge="end" 
                            size="small"
                            disabled={isSubmitting}
                            aria-label="info about registration ID"
                          >
                            <InfoOutlined />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("password")}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  type={showPassword ? "text" : "password"}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  variant="outlined"
                  size="small"
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          size="small"
                          disabled={isSubmitting}
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
                  fullWidth
                  label={t("confirmPassword")}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  error={!!validationErrors.confirmPassword}
                  helperText={validationErrors.confirmPassword}
                  variant="outlined"
                  size="small"
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                          size="small"
                          disabled={isSubmitting}
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
                  fullWidth
                  label={t("companyAddress")}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                  disabled={isSubmitting}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                marginTop: "2rem",
                display: "flex",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    {t("submitting")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
            </Box>
          </form>

          {returnedRegistrationId && (
            <Box
              sx={{
                marginTop: 4,
                padding: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#e8f5e9",
                borderRadius: "8px",
                boxShadow: 1,
                border: "1px solid #4caf50"
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  {t("registrationId")}
                </Typography>
                <Typography variant="h6" color="primary">
                  {returnedRegistrationId}
                </Typography>
              </Box>
              <IconButton onClick={handleCopyRegistrationId} color="primary" size="small" disabled={isSubmitting}>
                <FileCopy />
              </IconButton>
            </Box>
          )}
        </Box>

        <Snackbar
          open={openSnackbar}
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
            {message}
          </Alert>
        </Snackbar>
      </DialogContent>
    </Dialog>
  );
};

export default AgentRegistrationForm;