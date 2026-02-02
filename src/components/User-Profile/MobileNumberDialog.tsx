/* eslint-disable */
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Input,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor,
  IconButton,
} from "@mui/material";
import { Button } from "../Button/button";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { useAppUser } from "src/context/AppUserContext";
import axiosInstance from "src/services/axiosInstance";
import { CheckIcon, X } from "lucide-react";
import providerInstance from "src/services/providerInstance";
import { useDispatch } from "react-redux"; // ADD THIS
import { setHasMobileNumber } from "../../features/customer/customerSlice"; // ADD THIS

interface MobileNumberDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: number;
  mobileNo?: string;
  alternativeMobileNo?: string;
  onSuccess: () => void;
}

interface ValidationState {
  loading: boolean;
  error: string;
  isAvailable: boolean | null;
  formatError: boolean;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const MobileNumberDialog: React.FC<MobileNumberDialogProps> = ({
  open,
  onClose,
  customerId,
  onSuccess,
}) => {
  const [contactNumber, setContactNumber] = useState("");
  const [altContactNumber, setAltContactNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { appUser, setAppUser } = useAppUser();
  const dispatch = useDispatch(); // ADD THIS

  const [contactValidation, setContactValidation] = useState<ValidationState>({
    loading: false,
    error: '',
    isAvailable: null,
    formatError: false
  });
  const [altContactValidation, setAltContactValidation] = useState<ValidationState>({
    loading: false,
    error: '',
    isAvailable: null,
    formatError: false
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Track which fields have been validated
  const [validatedFields, setValidatedFields] = useState<Set<string>>(new Set());

  // Initialize with existing user data if available
  useEffect(() => {
    if (open && appUser) {
      setContactNumber(appUser.mobileNo || "");
      setAltContactNumber(appUser.alternateNo || "");
      
      // Reset validation states
      setContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
      setAltContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
      setValidatedFields(new Set());
    }
  }, [open, appUser]);

  const showSnackbar = (message: string, severity: AlertColor = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const validateMobileFormat = (number: string): boolean => {
    const mobilePattern = /^[0-9]{10}$/;
    return mobilePattern.test(number);
  };

  const checkMobileAvailability = async (number: string, isAlternate: boolean = false): Promise<boolean> => {
    if (!number || !validateMobileFormat(number)) {
      return false;
    }

    const setValidation = isAlternate ? setAltContactValidation : setContactValidation;
    const fieldName = isAlternate ? 'altContactNumber' : 'contactNumber';
    
    setValidation({
      loading: true,
      error: '',
      isAvailable: null,
      formatError: false
    });

    try {
      // Use POST request with payload as shown in API documentation
      const endpoint = '/api/service-providers/check-mobile';
      const payload = { mobile: number };
      
      const response = await providerInstance.post(endpoint, payload);
      
      // Handle different API response structures
      let isAvailable = true;
      let errorMessage = '';
      
      if (response.data.exists !== undefined) {
        isAvailable = !response.data.exists;
        errorMessage = response.data.exists 
          ? `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered` 
          : '';
      } else if (response.data.available !== undefined) {
        isAvailable = response.data.available;
        errorMessage = !response.data.available 
          ? `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered` 
          : '';
      } else if (response.data.isAvailable !== undefined) {
        isAvailable = response.data.isAvailable;
        errorMessage = !response.data.isAvailable 
          ? `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered` 
          : '';
      } else {
        isAvailable = true;
      }
      
      setValidation({
        loading: false,
        error: errorMessage,
        isAvailable,
        formatError: false
      });

      // Mark this field as validated
      if (isAvailable) {
        setValidatedFields(prev => {
          const newSet = new Set(prev);
          newSet.add(fieldName);
          return newSet;
        });
      }

      return isAvailable;
    } catch (error: any) {
      console.error('Error validating mobile number:', error);
      
      let errorMessage = `Error checking ${isAlternate ? 'alternate' : 'mobile'} number`;
      
      if (error.response?.data) {
        const apiError = error.response.data;
        if (typeof apiError === 'string') {
          errorMessage = apiError;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.error) {
          errorMessage = apiError.error;
        }
      } else if (error.response?.status === 400) {
        errorMessage = `Invalid ${isAlternate ? 'alternate' : 'mobile'} number format`;
      } else if (error.response?.status === 409) {
        errorMessage = `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered`;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      setValidation({
        loading: false,
        error: errorMessage,
        isAvailable: false,
        formatError: false
      });

      return false;
    }
  };

  // Custom hook for debounced validation
  const useDebouncedValidation = () => {
    const timeouts = React.useRef<{
      contact: NodeJS.Timeout | null;
      alternate: NodeJS.Timeout | null;
    }>({
      contact: null,
      alternate: null
    });

    return (number: string, isAlternate: boolean = false) => {
      const timeoutKey = isAlternate ? 'alternate' : 'contact';
      
      if (timeouts.current[timeoutKey]) {
        clearTimeout(timeouts.current[timeoutKey]!);
      }

      timeouts.current[timeoutKey] = setTimeout(() => {
        checkMobileAvailability(number, isAlternate);
      }, 800);
    };
  };

  const debouncedValidation = useDebouncedValidation();

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setContactNumber(value);

    // Reset validation state when changing
    setContactValidation(prev => ({
      ...prev,
      loading: false,
      error: '',
      isAvailable: null,
      formatError: false
    }));

    if (value.length === 10) {
      // Clear any format error
      setContactValidation(prev => ({
        ...prev,
        formatError: false,
        error: prev.error === 'Please enter a valid 10-digit mobile number' ? '' : prev.error
      }));
      
      // Start debounced validation
      debouncedValidation(value, false);
      
      // Check if alternate number is same as contact number
      if (altContactNumber === value) {
        setAltContactValidation(prev => ({
          ...prev,
          error: 'Alternate number cannot be same as contact number',
          isAvailable: false,
          formatError: false
        }));
      } else if (altContactNumber && altContactNumber.length === 10) {
        // Re-validate alternate number if it was marked as same
        if (altContactValidation.error === 'Alternate number cannot be same as contact number') {
          setAltContactValidation(prev => ({
            ...prev,
            error: '',
            isAvailable: null,
            formatError: false
          }));
          debouncedValidation(altContactNumber, true);
        }
      }
    } else if (value) {
      // Show format error for incomplete numbers
      setContactValidation({
        loading: false,
        error: 'Please enter a valid 10-digit mobile number',
        isAvailable: null,
        formatError: true
      });
    } else {
      // Clear everything if empty
      setContactValidation({
        loading: false,
        error: '',
        isAvailable: null,
        formatError: false
      });
    }
  };

  const handleAltContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setAltContactNumber(value);

    // Reset validation state when changing
    setAltContactValidation(prev => ({
      ...prev,
      loading: false,
      error: '',
      isAvailable: null,
      formatError: false
    }));

    if (value) {
      if (value.length === 10) {
        // Clear format error
        setAltContactValidation(prev => ({
          ...prev,
          formatError: false,
          error: prev.error === 'Please enter a valid 10-digit mobile number' ? '' : prev.error
        }));

        // Check if it's the same as contact number
        if (value === contactNumber) {
          setAltContactValidation({
            loading: false,
            error: 'Alternate number cannot be same as contact number',
            isAvailable: false,
            formatError: false
          });
        } else {
          // Validate alternate number availability
          debouncedValidation(value, true);
        }
      } else {
        // Show format error for incomplete numbers
        setAltContactValidation({
          loading: false,
          error: 'Please enter a valid 10-digit mobile number',
          isAvailable: null,
          formatError: true
        });
      }
    } else {
      // Clear everything if empty
      setAltContactValidation({
        loading: false,
        error: '',
        isAvailable: null,
        formatError: false
      });
    }
  };

  const areNumbersUnique = (): boolean => {
    if (!contactNumber || !altContactNumber) return true;
    return contactNumber !== altContactNumber;
  };

  const validateAllFields = async (): Promise<boolean> => {
    if (!validateMobileFormat(contactNumber)) {
      showSnackbar("Please enter a valid 10-digit contact number", "error");
      return false;
    }

    // Check contact number availability if not already validated
    if (!validatedFields.has('contactNumber') || contactValidation.isAvailable === null) {
      const isContactAvailable = await checkMobileAvailability(contactNumber, false);
      if (!isContactAvailable) {
        showSnackbar("Contact number is not available", "error");
        return false;
      }
    } else if (contactValidation.isAvailable === false) {
      showSnackbar("Contact number is not available", "error");
      return false;
    }

    if (altContactNumber) {
      if (!validateMobileFormat(altContactNumber)) {
        showSnackbar("Please enter a valid 10-digit alternate contact number", "error");
        return false;
      }

      if (!areNumbersUnique()) {
        showSnackbar("Contact number and alternate contact number must be different", "error");
        return false;
      }

      // Check alternate number availability if not already validated
      if (!validatedFields.has('altContactNumber') || altContactValidation.isAvailable === null) {
        const isAltContactAvailable = await checkMobileAvailability(altContactNumber, true);
        if (!isAltContactAvailable) {
          showSnackbar("Alternate contact number is not available", "error");
          return false;
        }
      } else if (altContactValidation.isAvailable === false) {
        showSnackbar("Alternate contact number is not available", "error");
        return false;
      }
    }

    return true;
  };

 const handleSubmit = async () => {
  const isValid = await validateAllFields();
  if (!isValid) {
    return;
  }

  setLoading(true);

  try {
    if (!appUser?.customerid) {
      console.error("❌ Customer ID not found in appUser");
      showSnackbar("Customer ID not found!", "error");
      setLoading(false);
      return;
    }

    const payload: any = {
      customerid: appUser.customerid
    };
    
    if (contactNumber) payload.mobileNo = contactNumber;
    if (altContactNumber) payload.alternateNo = altContactNumber;

    console.log("📤 Sending update payload:", payload);

    const response = await axiosInstance.put(
      `/api/customer/update-customer/${appUser.customerid}`,
      payload
    );

    console.log("✅ API Response:", response.data);
    
    // Update the appUser context with mobile numbers
    const updatedUser = {
      ...appUser,
      mobileNo: contactNumber,
      alternateNo: altContactNumber || null,
    };
    
    setAppUser(updatedUser);

    // FIX: Pass true as argument to setHasMobileNumber
    dispatch(setHasMobileNumber(true));

    console.log("✅ Updated appUser with mobile numbers:", updatedUser);
    console.log("✅ Updated Redux state: hasMobileNumber = true");

    showSnackbar("Mobile number(s) updated successfully!", "success");
    
    // Reset validation states
    setValidatedFields(new Set());
    setContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
    setAltContactValidation({ loading: false, error: '', isAvailable: null, formatError: false });
    
    // Close dialog after successful update
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 1500);
  } catch (error: any) {
    console.error("❌ Error updating mobile numbers:", error);
    const errorMessage = error.response?.data?.message || "Something went wrong while updating!";
    showSnackbar(errorMessage, "error");
  } finally {
    setLoading(false);
  }
};

  const isFormValid = (): boolean => {
    // Contact number validation
    const contactValid = validateMobileFormat(contactNumber) && 
      (contactValidation.isAvailable === true || contactValidation.isAvailable === null);

    // Alternate contact number validation (optional field)
    const altContactValid = !altContactNumber ||  // Empty is valid
      (validateMobileFormat(altContactNumber) && 
       (altContactValidation.isAvailable === true || altContactValidation.isAvailable === null) &&
       areNumbersUnique());

    return contactValid && altContactValid;
  };

  // Function to clear contact number field
  const handleClearContactNumber = () => {
    setContactNumber("");
    setContactValidation({
      loading: false,
      error: '',
      isAvailable: null,
      formatError: false
    });
    // Remove from validated fields
    setValidatedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete('contactNumber');
      return newSet;
    });
  };

  // Function to clear alternate contact number field
  const handleClearAltContactNumber = () => {
    setAltContactNumber("");
    setAltContactValidation({
      loading: false,
      error: '',
      isAvailable: null,
      formatError: false
    });
    // Remove from validated fields
    setValidatedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete('altContactNumber');
      return newSet;
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogHeader className="flex justify-between items-center px-4 py-2 bg-blue-600 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-white">
            Update Contact Numbers
          </DialogTitle>
          <IconButton
            onClick={onClose}
            className="text-white hover:text-gray-200"
            aria-label="Close"
            size="small"
          >
            <X size={20} />
          </IconButton>
        </DialogHeader>

        <DialogContent className="p-6">
          <div className="flex flex-col gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Please enter your mobile and alternative contact numbers to continue.
              </p>
              <label className="text-sm font-medium text-gray-700">
                Contact Number *
              </label>
              <div className="relative">
                <Input
                  placeholder="10-digit mobile number"
                  value={contactNumber}
                  onChange={handleContactNumberChange}
                  className="mt-1 w-full"
                  inputProps={{ maxLength: 10 }}
                  error={!!contactValidation.error || contactValidation.formatError}
                  endAdornment={
                    <InputAdornment position="end">
                      {contactValidation.loading ? (
                        <CircularProgress size={20} />
                      ) : contactValidation.isAvailable ? (
                        <CheckIcon color="success" size={20} />
                      ) : contactValidation.isAvailable === false ? (
                        <IconButton
                          size="small"
                          onClick={handleClearContactNumber}
                          edge="end"
                          aria-label="clear contact number"
                        >
                          <X color="error" size={20} />
                        </IconButton>
                      ) : null}
                    </InputAdornment>
                  }
                />
              </div>
              {contactValidation.error && (
                <p className="text-red-500 text-xs mt-1">{contactValidation.error}</p>
              )}
              {contactValidation.formatError && (
                <p className="text-red-500 text-xs mt-1">Please enter exactly 10 digits</p>
              )}
              {contactValidation.isAvailable && (
                <p className="text-green-500 text-xs mt-1">Contact number is available</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Alternative Contact Number (Optional)
              </label>
              <div className="relative">
                <Input
                  placeholder="10-digit mobile number"
                  value={altContactNumber}
                  onChange={handleAltContactNumberChange}
                  className="mt-1 w-full"
                  inputProps={{ maxLength: 10 }}
                  error={!!altContactValidation.error || altContactValidation.formatError}
                  endAdornment={
                    <InputAdornment position="end">
                      {altContactValidation.loading ? (
                        <CircularProgress size={20} />
                      ) : altContactValidation.isAvailable ? (
                        <CheckIcon color="success" size={20} />
                      ) : altContactValidation.isAvailable === false ? (
                        <IconButton
                          size="small"
                          onClick={handleClearAltContactNumber}
                          edge="end"
                          aria-label="clear alternate number"
                        >
                          <X color="error" size={20} />
                        </IconButton>
                      ) : null}
                    </InputAdornment>
                  }
                />
              </div>
              {altContactValidation.error && (
                <p className="text-red-500 text-xs mt-1">{altContactValidation.error}</p>
              )}
              {altContactValidation.formatError && (
                <p className="text-red-500 text-xs mt-1">Please enter exactly 10 digits</p>
              )}
              {altContactValidation.isAvailable && (
                <p className="text-green-500 text-xs mt-1">Alternate number is available</p>
              )}
            </div>

            {!areNumbersUnique() && contactNumber && altContactNumber && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">
                  ⚠️ Contact number and alternate contact number must be different
                </p>
              </div>
            )}
          </div>

          <DialogActions className="mt-6">
            <Button
              onClick={onClose}
              variant="outlined"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !isFormValid()}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <CircularProgress size={16} color="inherit" className="mr-2" />
                  Updating...
                </>
              ) : "Submit"}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ marginTop: "60px" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MobileNumberDialog;