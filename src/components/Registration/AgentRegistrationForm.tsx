/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Container,
  Grid,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff, FileCopy } from "@mui/icons-material";
import axiosInstance from "../../services/axiosInstance";

const AgentRegistrationForm = ({ onBackToLogin }) => {
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

  const [validationErrors, setValidationErrors] = useState({
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");

  const [referralCode, setReferralCode] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

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

  const validateForm = (field, value) => {
    switch (field) {
      case "mobileNumber":
        setValidationErrors({
          ...validationErrors,
          mobileNumber: !mobileRegex.test(value) ? "Enter a valid 10-digit mobile number" : "",
        });
        break;
      case "email":
        setValidationErrors({
          ...validationErrors,
          email: !emailRegex.test(value) ? "Enter a valid email address" : "",
        });
        break;
      case "password":
        setValidationErrors({
          ...validationErrors,
          password: !passwordRegex.test(value) ? "Password must contain at least 8 characters, including 1 letter, 1 number, and 1 special character" : "",
        });
        break;
      case "confirmPassword":
        setValidationErrors({
          ...validationErrors,
          confirmPassword: value !== formData.password ? "Passwords do not match" : "",
        });
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare the request body to match the API format
    const requestData = {
      companyName: formData.companyName,
      emailId: formData.email, // Change 'email' to 'emailId'
      phoneNo: Number(formData.mobileNumber), // Change 'mobileNumber' to 'phoneNo' and ensure it's a number
      address: formData.address,
      password: formData.password,
    };
  
    try {
      const response = await axiosInstance.post(
        "vendors/add", 
        requestData, 
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        const generatedReferralCode = response.data.referralCode || "REF1234567"; // Use referral code from response
        setReferralCode(generatedReferralCode);
        setMessage("Vendor added successfully!");
        setOpenSnackbar(true);
  
        // Automatically copy the referral code to the clipboard
        navigator.clipboard.writeText(generatedReferralCode).then(() => {
          alert("Referral code copied to clipboard!");
        }).catch((err) => {
          console.error("Failed to copy referral code: ", err);
        });
      } else {
        setMessage(response.data.error || "Failed to add vendor.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessage("An error occurred while connecting to the API.");
      setOpenSnackbar(true);
    }
  };
  
  // Close the Snackbar when clicked
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  // Manually copy the referral code to clipboard
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      alert("Referral code copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy referral code: ", err);
    });
  };
  
  return (
    <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Container maxWidth="sm">
      <Box
          sx={{
            maxWidth: 600, 
            margin: "auto",
            padding: 2, 
            display: "block" ,
            backgroundColor: "#fff",
            borderRadius: "8px",
            // boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        > 
          <Typography variant="h5" gutterBottom className="text"
            sx={{
              marginBottom: "16px", 
              marginTop: "-16px",  
            }}>
              Agent Registration
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Name of the Company *"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </Grid>
     

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Mobile Number *"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                  type="tel"
                  error={!!validationErrors.mobileNumber}
                  helperText={validationErrors.mobileNumber}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Email ID *"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  type="email"
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Password *"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  type={showPassword ? "text" : "password"}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Confirm Password *"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  error={!!validationErrors.confirmPassword}
                  helperText={validationErrors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleToggleConfirmPasswordVisibility} edge="end">
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
                  placeholder="Company Address *"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </Box>
          </form>

          {/* Referral Code Box */}
          {referralCode && (
            <Box
              sx={{
                marginTop: 4,
                padding: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1">Referral Code: {referralCode}</Typography>
              <IconButton onClick={handleCopyReferralCode}>
                <FileCopy />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Success Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }} // Position top-right
          sx={{ marginTop: "60px" }} // Adjust margin-top if needed
        >
          <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: "100%" }}>
            {message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AgentRegistrationForm;