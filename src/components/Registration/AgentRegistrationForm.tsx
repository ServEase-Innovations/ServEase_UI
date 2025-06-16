import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
  Box,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff, FileCopy, Close } from "@mui/icons-material";
import axiosInstance from "../../services/axiosInstance";

interface ValidationErrors {
  companyName?: string;
  mobileNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
}

const AgentRegistrationDialog = ({ open, onClose, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!open) {
      setFormData({
        companyName: "",
        mobileNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
      });
      setValidationErrors({});
      setReferralCode("");
      setMessage("");
      setOpenSnackbar(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setLoading(false);
    }
  }, [open]);

  const mobileRegex = /^[0-9]{10}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateForm = (field: string, value: string) => {
    let errors: ValidationErrors = { ...validationErrors };
    switch (field) {
      case "mobileNumber":
        errors.mobileNumber = !mobileRegex.test(value) ? "Enter a valid 10-digit mobile number" : "";
        break;
      case "email":
        errors.email = !emailRegex.test(value) ? "Enter a valid email address" : "";
        break;
      case "password":
        errors.password = !passwordRegex.test(value)
          ? "Password must contain at least 8 characters, including 1 letter, 1 number, and 1 special character"
          : "";
        break;
      case "confirmPassword":
        errors.confirmPassword = value !== formData.password ? "Passwords do not match" : "";
        break;
      default:
        break;
    }
    setValidationErrors(errors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateForm(name, value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((show) => !show);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((show) => !show);
  };

  const validateAll = () => {
    const errors: ValidationErrors = {};
    if (!formData.companyName.trim()) errors.companyName = "Company name is required";
    if (!mobileRegex.test(formData.mobileNumber)) errors.mobileNumber = "Enter a valid 10-digit mobile number";
    if (!emailRegex.test(formData.email)) errors.email = "Enter a valid email address";
    if (!passwordRegex.test(formData.password))
      errors.password = "Password must contain at least 8 characters, including 1 letter, 1 number, and 1 special character";
    if (formData.confirmPassword !== formData.password) errors.confirmPassword = "Passwords do not match";
    if (!formData.address.trim()) errors.address = "Company address is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll()) return;

    setLoading(true);
    setMessage("");
    setReferralCode("");

    const requestData = {
      companyName: formData.companyName,
      emailId: formData.email,
      phoneNo: Number(formData.mobileNumber),
      address: formData.address,
      password: formData.password,
    };

    try {
      const response = await axiosInstance.post("vendors/add", requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const generatedReferralCode = response.data.referralCode || "REF1234567";
        setReferralCode(generatedReferralCode);
        setMessage("Vendor added successfully!");
        setOpenSnackbar(true);
        navigator.clipboard.writeText(generatedReferralCode).catch(() => {});
      } else {
        setMessage(response.data.error || "Failed to add vendor.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessage("An error occurred while connecting to the API.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCopyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode).then(() => {
        alert("Referral code copied to clipboard!");
      }).catch((err) => {
        console.error("Failed to copy referral code: ", err);
      });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        aria-labelledby="agent-registration-dialog-title"
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Agent Registration
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="large"
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box component="form" id="agent-registration-form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name of the Company *"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={!!validationErrors.companyName}
                  helperText={validationErrors.companyName}
                  required
                  autoFocus
                  autoComplete="organization"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mobile Number *"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  error={!!validationErrors.mobileNumber}
                  helperText={validationErrors.mobileNumber}
                  required
                  type="tel"
                  inputProps={{ maxLength: 10, pattern: "[0-9]{10}" }}
                  autoComplete="tel"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email ID *"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  required
                  type="email"
                  autoComplete="email"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password *"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleTogglePasswordVisibility} edge="end" size="large" aria-label={showPassword ? "Hide password" : "Show password"}>
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
                  label="Confirm Password *"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!validationErrors.confirmPassword}
                  helperText={validationErrors.confirmPassword}
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                          size="large"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                  label="Company Address *"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!validationErrors.address}
                  helperText={validationErrors.address}
                  required
                  multiline
                  minRows={2}
                  autoComplete="street-address"
                />
              </Grid>
            </Grid>

            {referralCode && (
              <Box
                sx={{
                  marginTop: 3,
                  padding: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  boxShadow: 1,
                }}
                aria-live="polite"
              >
                <Typography variant="body1">Referral Code: {referralCode}</Typography>
                <IconButton onClick={handleCopyReferralCode} aria-label="Copy referral code" size="large">
                  <FileCopy />
                </IconButton>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="agent-registration-form" variant="contained" color="primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ marginTop: "60px" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AgentRegistrationDialog;
