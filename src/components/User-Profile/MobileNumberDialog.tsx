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

interface MobileNumberDialogProps {
  open: boolean;
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
  open,
  onClose,
  customerId,
  onSuccess,
}) => {
  const [contactNumber, setContactNumber] = useState("");
  const [altContactNumber, setAltContactNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { appUser, setAppUser } = useAppUser();

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
    if (open) {
      // Reset form when dialog opens
      setContactNumber("");
      setAltContactNumber("");
      setContactValidation({ loading: false, error: '', isAvailable: null });
      setAltContactValidation({ loading: false, error: '', isAvailable: null });
    }
  }, [open]);

  const validateMobileFormat = (number: string): boolean => {
    const mobilePattern = /^[0-9]{10}$/;
    return mobilePattern.test(number);
  };

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

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setContactNumber(value);

    if (value.length === 10) {
      debouncedValidation(value, false);
      
      if (altContactNumber === value) {
        setAltContactValidation(prev => ({
          ...prev,
          error: 'Alternate number cannot be same as contact number',
          isAvailable: false
        }));
      } else if (altContactNumber && altContactValidation.error === 'Alternate number cannot be same as contact number') {
        setAltContactValidation(prev => ({
          ...prev,
          error: '',
          isAvailable: null
        }));
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

  const handleAltContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setAltContactNumber(value);

    if (value && value.length === 10) {
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

  const areNumbersUnique = (): boolean => {
    if (!contactNumber || !altContactNumber) return true;
    return contactNumber !== altContactNumber;
  };

  const validateAllFields = async (): Promise<boolean> => {
    if (!validateMobileFormat(contactNumber)) {
      alert("Please enter a valid 10-digit contact number");
      return false;
    }

    if (altContactNumber && !validateMobileFormat(altContactNumber)) {
      alert("Please enter a valid 10-digit alternate contact number");
      return false;
    }

    if (!areNumbersUnique()) {
      alert("Contact number and alternate contact number must be different");
      return false;
    }

    const isContactAvailable = await checkMobileAvailability(contactNumber, false);
    if (!isContactAvailable) {
      alert("Contact number is not available");
      return false;
    }

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

      const payload: any = {};
      if (contactNumber) payload.mobileNo = contactNumber;
      if (altContactNumber) payload.alternateNo = altContactNumber;

      console.log(" Sending update payload:", payload);

      const response = await axiosInstance.put(
        `/api/customer/update-customer/${appUser.customerid}`,
        payload
      );

      console.log("✅ API Response:", response.data);
      
      setAppUser((prevUser: any) => ({
        ...prevUser,
        mobileNo: contactNumber,
        alternateNo: altContactNumber || null,
      }));

      console.log("✅ Updated appUser with mobile numbers:", {
        ...appUser,
        mobileNo: contactNumber,
        alternateNo: altContactNumber || null,
      });

      alert("Mobile number(s) updated successfully!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("❌ Error updating mobile numbers:", error);
      alert("Something went wrong while updating!");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = (): boolean => {
    const basicValidation = validateMobileFormat(contactNumber) &&
      contactValidation.isAvailable !== false &&
      (altContactNumber === '' || validateMobileFormat(altContactNumber)) &&
      areNumbersUnique();

    const altNumberValidation = altContactNumber === '' || 
      (validateMobileFormat(altContactNumber) && 
       altContactValidation.isAvailable !== false &&
       areNumbersUnique());

    return basicValidation && altNumberValidation;
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader className="flex justify-between items-center px-4 py-2 bg-blue-600 rounded-t-lg">
        <DialogTitle className="text-xl font-semibold text-white">
          Update Contact Numbers
        </DialogTitle>
        <button
          onClick={onClose}
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
            onClick={onClose}
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