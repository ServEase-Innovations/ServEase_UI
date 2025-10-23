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
} from "@mui/material";
import { Button } from "../Button/button";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { useAppUser } from "src/context/AppUserContext";
import axiosInstance from "src/services/axiosInstance";
import { CheckIcon, X } from "lucide-react";
// ✅ Define props interface
interface MobileNumberDialogProps {
  onClose: () => void;
  customerId: number;
  onSuccess?: () => void;
}
interface ValidationState {
  loading: boolean;
  error: string;
  isAvailable: boolean | null;
}

const MobileNumberDialog: React.FC<MobileNumberDialogProps> = ({
  onClose,
  customerId,
  onSuccess,
}) => {
  const [open, setOpen] = useState(true); // directly true instead of useEffect
  const [contactNumber, setContactNumber] = useState("");
  const [altContactNumber, setAltContactNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { appUser, setAppUser } = useAppUser();

  // Validation states
  const [contactValidation, setContactValidation] = useState<ValidationState>({
    loading: false,
    error: '',
    isAvailable: null
  });
  const [altContactValidation, setAltContactValidation] = useState<ValidationState>({
    loading: false,
    error: '',
    isAvailable: null
  });

  

  useEffect(() => {
    setOpen(true);
  }, []);

  // Validate mobile number format
  const validateMobileFormat = (number: string): boolean => {
    const mobilePattern = /^[0-9]{10}$/;
    return mobilePattern.test(number);
  };

  // Check if mobile number is available
  const checkMobileAvailability = async (number: string, isAlternate: boolean = false): Promise<boolean> => {
    if (!number || !validateMobileFormat(number)) {
      return false;
    }

    const setValidation = isAlternate ? setAltContactValidation : setContactValidation;
    
    setValidation({
      loading: true,
      error: '',
      isAvailable: null
    });

    try {
      // Use different endpoints for mobile and alternate number validation
      const endpoint = isAlternate 
        ? `/api/serviceproviders/check-alternate/${encodeURIComponent(number)}`
        : `/api/serviceproviders/check-mobile/${encodeURIComponent(number)}`;
      
      const response = await axiosInstance.get(endpoint);
      
      const isAvailable = response.data.available !== false;
      
      setValidation({
        loading: false,
        error: isAvailable ? '' : `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered`,
        isAvailable
      });

      return isAvailable;
    } catch (error: any) {
      console.error('Error validating mobile number:', error);
      
      let errorMessage = `Error checking ${isAlternate ? 'alternate' : 'mobile'} number`;
      if (error.response?.status === 409) {
        errorMessage = `${isAlternate ? 'Alternate' : 'Mobile'} number is already registered`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setValidation({
        loading: false,
        error: errorMessage,
        isAvailable: false
      });

      return false;
    }
  };

  // Debounced validation for mobile numbers
  const useDebouncedValidation = () => {
    const timeouts = {
      contact: null as NodeJS.Timeout | null,
      alternate: null as NodeJS.Timeout | null
    };

    return (number: string, isAlternate: boolean = false) => {
      const timeoutKey = isAlternate ? 'alternate' : 'contact';
      
      if (timeouts[timeoutKey]) {
        clearTimeout(timeouts[timeoutKey]!);
      }

      timeouts[timeoutKey] = setTimeout(() => {
        checkMobileAvailability(number, isAlternate);
      }, 500);
    };
  };

  const debouncedValidation = useDebouncedValidation();

  // Handle contact number change
  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setContactNumber(value);

    if (value.length === 10) {
      debouncedValidation(value, false);
      
      // Also check if alternate number is same as contact number
      if (altContactNumber === value) {
        setAltContactValidation(prev => ({
          ...prev,
          error: 'Alternate number cannot be same as contact number',
          isAvailable: false
        }));
      } else if (altContactNumber && altContactValidation.error === 'Alternate number cannot be same as contact number') {
        // Clear the error if numbers are now different
        setAltContactValidation(prev => ({
          ...prev,
          error: '',
          isAvailable: null
        }));
        // Re-validate alternate number
        if (validateMobileFormat(altContactNumber)) {
          debouncedValidation(altContactNumber, true);
        }
      }
    } else {
      setContactValidation({
        loading: false,
        error: value ? 'Please enter a valid 10-digit mobile number' : '',
        isAvailable: null
      });
    }
  };

  // Handle alternate contact number change
  const handleAltContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setAltContactNumber(value);

    if (value && value.length === 10) {
      // Check if alternate number is same as contact number
      if (value === contactNumber) {
        setAltContactValidation({
          loading: false,
          error: 'Alternate number cannot be same as contact number',
          isAvailable: false
        });
      } else {
        debouncedValidation(value, true);
      }
    } else {
      setAltContactValidation({
        loading: false,
        error: value ? 'Please enter a valid 10-digit mobile number' : '',
        isAvailable: null
      });
    }
  };

  // Check if numbers are unique
  const areNumbersUnique = (): boolean => {
    if (!contactNumber || !altContactNumber) return true;
    return contactNumber !== altContactNumber;
  };

  // Validate all fields before submission
  const validateAllFields = async (): Promise<boolean> => {
    // Validate contact number
    if (!validateMobileFormat(contactNumber)) {
      alert("Please enter a valid 10-digit contact number");
      return false;
    }

    // Validate alternate number if provided
    if (altContactNumber && !validateMobileFormat(altContactNumber)) {
      alert("Please enter a valid 10-digit alternate contact number");
      return false;
    }

    // Check uniqueness
    if (!areNumbersUnique()) {
      alert("Contact number and alternate contact number must be different");
      return false;
    }

    // Check contact number availability
    const isContactAvailable = await checkMobileAvailability(contactNumber, false);
    if (!isContactAvailable) {
      alert("Contact number is not available");
      return false;
    }

    // Check alternate number availability if provided
    if (altContactNumber) {
      const isAltContactAvailable = await checkMobileAvailability(altContactNumber, true);
      if (!isAltContactAvailable) {
        alert("Alternate contact number is not available");
        return false;
      }
    }

    return true;
  };

const handleSubmit = async () => {
    // Validate all fields before submission
    const isValid = await validateAllFields();
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      if (!appUser?.customerid) {
        console.error("❌ Customer ID not found in appUser");
        alert("Customer ID not found!");
        setLoading(false);
        return;
      }

      // Prepare payload conditionally
      const payload: any = {};
      if (contactNumber) payload.mobileNo = contactNumber;
      if (altContactNumber) payload.alternateNo = altContactNumber;

      console.log(" Sending update payload:", payload);

      // Real PUT API call
      const response = await axiosInstance.put(
        `/api/customer/update-customer/${appUser.customerid}`,
        payload
      );

      console.log("✅ API Response:", response.data);
      
      // ✅ UPDATE APPUSER WITH MOBILE NUMBERS HERE
      setAppUser((prevUser: any) => ({
        ...prevUser,
        mobileNo: contactNumber,
        alternateNo: altContactNumber || null, // Store null if empty
      }));

      console.log("✅ Updated appUser with mobile numbers:", {
        ...appUser,
        mobileNo: contactNumber,
        alternateNo: altContactNumber || null,
      });

      alert("Mobile number(s) updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("❌ Error updating mobile numbers:", error);
      alert("Something went wrong while updating!");
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = (): boolean => {
    const basicValidation = validateMobileFormat(contactNumber) &&
      contactValidation.isAvailable !== false &&
      (altContactNumber === '' || validateMobileFormat(altContactNumber)) &&
      areNumbersUnique();

    // For alternate number, check availability only if it's provided and valid
    const altNumberValidation = altContactNumber === '' || 
      (validateMobileFormat(altContactNumber) && 
       altContactValidation.isAvailable !== false &&
       areNumbersUnique());

    return basicValidation && altNumberValidation;
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
     <DialogHeader className="flex justify-between items-center px-4 py-2 bg-blue-600 rounded-t-lg">
  <DialogTitle className="text-xl font-semibold text-white">
    Update Contact Numbers
  </DialogTitle>

  <button
    onClick={() => setOpen(false)}
    className="text-white hover:text-gray-200 text-2xl font-light focus:outline-none"
    aria-label="Close"
  >
    &times;
  </button>
</DialogHeader>


      <DialogContent className="max-w-md p-6">
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <p className="text-sm text-black-500 ">
          Please enter your mobile and alternative contact numbers to continue.
        </p>
            <label className="text-sm font-medium text-gray-700">
              Contact Number *
            </label>
            <Input
              placeholder="10-digit mobile number"
              value={contactNumber}
              onChange={handleContactNumberChange}
              className="mt-1 w-full"
              inputProps={{ maxLength: 10 }}
              error={!!contactValidation.error || (contactNumber.length > 0 && contactNumber.length !== 10)}
              endAdornment={
                contactValidation.loading ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : contactValidation.isAvailable ? (
                  <InputAdornment position="end">
                    <CheckIcon color="success" size={20} />
                  </InputAdornment>
                ) : contactValidation.isAvailable === false ? (
                  <InputAdornment position="end">
                    <X color="error" size={20} />
                  </InputAdornment>
                ) : null
              }
            />
            {contactValidation.error && (
              <p className="text-red-500 text-xs mt-1">{contactValidation.error}</p>
            )}
            {contactNumber && contactNumber.length !== 10 && (
              <p className="text-red-500 text-xs mt-1">Please enter exactly 10 digits</p>
            )}
            {contactValidation.isAvailable && (
              <p className="text-green-500 text-xs mt-1">Contact number is available</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Alternative Contact Number
            </label>
            <Input
              placeholder="10-digit mobile number"
              value={altContactNumber}
              onChange={handleAltContactNumberChange}
              className="mt-1 w-full"
              inputProps={{ maxLength: 10 }}
              error={!!altContactValidation.error || (altContactNumber.length > 0 && altContactNumber.length !== 10)}
              endAdornment={
                altContactValidation.loading ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : altContactValidation.isAvailable ? (
                  <InputAdornment position="end">
                    <CheckIcon color="success" size={20} />
                  </InputAdornment>
                ) : altContactValidation.isAvailable === false ? (
                  <InputAdornment position="end">
                    <X color="error" size={20} />
                  </InputAdornment>
                ) : null
              }
            />
            {altContactValidation.error && (
              <p className="text-red-500 text-xs mt-1">{altContactValidation.error}</p>
            )}
            {altContactNumber && altContactNumber.length !== 10 && (
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
            onClick={() => setOpen(false)}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Submit"}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default MobileNumberDialog;