/* eslint-disable @typescript-eslint/no-unused-vars */

import { IconButton } from "src/components/Button/icon-button";
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Grid,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { Button } from "../Button/button";
import { Copy, Check } from "lucide-react";
import { useFieldValidation } from "./useFieldValidation";
import providerInstance from "src/services/providerInstance";
import { useLanguage } from "src/context/LanguageContext";
import axios from "axios";
import { urls } from "../../config/urls";

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

const REGISTRATION_HEADER_GRADIENT =
  "linear-gradient(90deg, #020617 0%, #0b2a5c 45%, #0c4a6e 100%)";

const RegistrationDialogHeader = ({
  title,
  onClose,
  closeDisabled = false,
}: {
  title: string;
  onClose: () => void;
  closeDisabled?: boolean;
}) => (
  <Box
    sx={{
      position: "relative",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      px: { xs: 2, sm: 3 },
      py: 2,
      background: REGISTRATION_HEADER_GRADIENT,
      color: "#fff",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </Typography>
    </Box>
    <IconButton
      aria-label="close"
      onClick={onClose}
      edge="end"
      disabled={closeDisabled}
      sx={{
        color: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(255,255,255,0.2)",
        bgcolor: "rgba(255,255,255,0.08)",
        "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
      }}
    >
      <CloseIcon />
    </IconButton>
  </Box>
);

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
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copiedId, setCopiedId] = useState(false);

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
    setSubmitError("");

    if (!formData.companyName || !formData.address) {
      setSubmitError(t("fillRequiredFields"));
      return;
    }

    if (!isFormValid()) {
      setSubmitError(t("ensureValidFields"));
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

        axios.post(`${urls.utils}/authO/create-autho-user`, authPayload)
          .then((authResponse) => {
            console.log("AuthO user created successfully:", authResponse.data);
          }).catch((authError) => {
            console.error("Error creating AuthO user:", authError);
          });

        const apiReturnedId = response.data.registrationId || formData.registrationId;
        setReturnedRegistrationId(apiReturnedId);
        setRegistrationComplete(true);
        setIsSubmitting(false);

        try {
          await navigator.clipboard.writeText(apiReturnedId);
          setCopiedId(true);
        } catch (err) {
          console.error("Failed to copy registration ID: ", err);
        }
      } else {
        setSubmitError(response.data.error || t("vendorAddFailed"));
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("API Error:", error);

      if (error.response) {
        setSubmitError(error.response.data.error || t("serverError"));
      } else if (error.request) {
        setSubmitError(t("noServerResponse"));
      } else {
        setSubmitError(t("apiConnectionError"));
      }

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
        setCopiedId(true);
        setMessage(t("registrationIdCopied"));
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      })
      .catch((err) => {
        console.error("Failed to copy registration ID: ", err);
      });
  };

  const handleContinueAfterSuccess = () => {
    setRegistrationComplete(false);
    setReturnedRegistrationId("");
    setCopiedId(false);
    setFormData({
      companyName: "",
      phoneNo: "",
      emailId: "",
      address: "",
      registrationId: "",
      password: "",
      confirmPassword: "",
    });
    resetValidation("email");
    resetValidation("mobile");
    handleDismiss();
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

  const handleDismiss = () => {
    if (onClose) onClose();
    else onBackToLogin(true);
  };

  const TOTAL_FIELDS = 7;
  const filledFieldCount = [
    formData.companyName,
    formData.registrationId,
    formData.address,
    formData.phoneNo,
    formData.emailId,
    formData.password,
    formData.confirmPassword,
  ].filter((v) => v.trim()).length;
  const formProgress = Math.round((filledFieldCount / TOTAL_FIELDS) * 100);

  const passwordChecks = [
    { key: "passwordReqMinLength", ok: formData.password.length >= 8 },
    { key: "passwordReqLetter", ok: /[A-Za-z]/.test(formData.password) },
    { key: "passwordReqNumber", ok: /\d/.test(formData.password) },
    { key: "passwordReqSpecial", ok: /[@$!%*?&]/.test(formData.password) },
  ];

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 first:mt-0">
      {children}
    </p>
  );

  const registrationDialogProps = {
    fullWidth: true as const,
    maxWidth: "sm" as const,
    open: true,
    scroll: "paper" as const,
    slotProps: {
      backdrop: {
        sx: {
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(15, 23, 42, 0.55)",
        },
      },
    },
    PaperProps: {
      sx: {
        borderRadius: "16px",
        maxHeight: "min(92vh, 720px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255,255,255,0.12)",
      },
    },
  };

  const dialogContentSx = {
    flex: 1,
    minHeight: 0,
    overflowY: "auto" as const,
    px: { xs: 2, sm: 3 },
    pt: 2.5,
    background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 28%)",
  };

  if (registrationComplete) {
    return (
      <>
        <Dialog
          {...registrationDialogProps}
          onClose={handleContinueAfterSuccess}
        >
          <RegistrationDialogHeader
            title={t("agentRegistrationSuccessTitle")}
            onClose={handleContinueAfterSuccess}
          />

          <DialogContent sx={{ ...dialogContentSx, pb: 2.5 }}>
            <p className="mb-1 text-sm font-semibold text-slate-800">
              {formData.companyName}
            </p>
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              {t("agentRegistrationSuccessMessage")}
            </p>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                {t("registrationId")}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="font-mono text-lg font-bold tracking-wide text-emerald-900 break-all">
                  {returnedRegistrationId}
                </p>
                <button
                  type="button"
                  onClick={handleCopyRegistrationId}
                  className="shrink-0 rounded-lg border border-emerald-300 bg-white p-2 text-emerald-700 transition-colors hover:bg-emerald-100"
                  aria-label={t("registrationIdCopied")}
                >
                  {copiedId ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
              {copiedId ? (
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  {t("registrationIdCopied")}
                </p>
              ) : null}
            </div>

            <Button
              variant="dialogPrimary"
              className="mt-5 w-full"
              onClick={handleContinueAfterSuccess}
            >
              {t("agentRegistrationContinueLogin")}
            </Button>
          </DialogContent>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled">
            {message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Dialog {...registrationDialogProps} onClose={handleDismiss}>
        <RegistrationDialogHeader
          title={t("agentRegistration")}
          onClose={handleDismiss}
          closeDisabled={isSubmitting}
        />

        <DialogContent sx={{ ...dialogContentSx, pb: 0 }}>
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            {t("agentRegistrationSubtitle")}
          </p>

          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>
                {t("agentRegistrationFieldsProgress", {
                  filled: filledFieldCount,
                  total: TOTAL_FIELDS,
                })}
              </span>
              <span>{formProgress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-300"
                style={{ width: `${formProgress}%` }}
              />
            </div>
          </div>

          {submitError ? (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError("")}>
              {submitError}
            </Alert>
          ) : null}

          <form id="agent-registration-form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <SectionLabel>{t("agentRegistrationSectionAgency")}</SectionLabel>
              </Grid>

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
                <TextField
                  fullWidth
                  label={t("registrationId")}
                  name="registrationId"
                  value={formData.registrationId}
                  onChange={handleChange}
                  required
                  error={!!validationErrors.registrationId}
                  helperText={validationErrors.registrationId || t("registrationIdHint")}
                  variant="outlined"
                  size="small"
                  inputProps={{
                    maxLength: 20,
                    style: { textTransform: "uppercase" },
                  }}
                  disabled={isSubmitting}
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
                  rows={2}
                  size="small"
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12} sx={{ pt: 0.5 }}>
                <SectionLabel>{t("agentRegistrationSectionContact")}</SectionLabel>
              </Grid>

              <Grid item xs={12}>
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
                    validationResults.mobile.error ||
                    (validationResults.mobile.isAvailable === false
                      ? t("mobileAlreadyRegistered")
                      : "")
                  }
                  variant="outlined"
                  size="small"
                  inputProps={{ maxLength: 10 }}
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {renderValidationIcon("mobile")}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
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
                    validationResults.email.error ||
                    (validationResults.email.isAvailable === false
                      ? t("emailAlreadyRegistered")
                      : "")
                  }
                  variant="outlined"
                  size="small"
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {renderValidationIcon("email")}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sx={{ pt: 0.5 }}>
                <SectionLabel>{t("agentRegistrationSectionSecurity")}</SectionLabel>
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
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {formData.password ? (
                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {passwordChecks.map(({ key, ok }) => (
                      <li
                        key={key}
                        className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-slate-500"}`}
                      >
                        {ok ? (
                          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        ) : (
                          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300" />
                        )}
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                ) : null}
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
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2.5,
            py: 2,
            gap: 1.5,
            flexDirection: { xs: "column-reverse", sm: "row" },
            justifyContent: "stretch",
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Button
            type="button"
            variant="dialogCancel"
            className="w-full sm:flex-1"
            onClick={handleDismiss}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="agent-registration-form"
            variant="dialogPrimary"
            className="w-full sm:flex-1"
            disabled={!isFormValid() || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AgentRegistrationForm;