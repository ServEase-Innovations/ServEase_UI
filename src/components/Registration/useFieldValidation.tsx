/* eslint-disable */
import { useState, useCallback } from 'react';
import providerInstance from 'src/services/providerInstance';

interface ValidationState {
  loading: boolean;
  error: string;
  isAvailable: boolean | null;
  isValidated: boolean; // Add this flag
}

interface ValidationResults {
  email: ValidationState;
  mobile: ValidationState;
  alternate: ValidationState;
}

export const useFieldValidation = () => {
  const [validationResults, setValidationResults] = useState<ValidationResults>({
    email: { loading: false, error: '', isAvailable: null, isValidated: false },
    mobile: { loading: false, error: '', isAvailable: null, isValidated: false },
    alternate: { loading: false, error: '', isAvailable: null, isValidated: false },
  });

  const validateField = useCallback(async (fieldType: 'email' | 'mobile' | 'alternate', value: string) => {
    if (!value.trim()) {
      setValidationResults(prev => ({
        ...prev,
        [fieldType]: { 
          loading: false, 
          error: '', 
          isAvailable: null,
          isValidated: false 
        }
      }));
      return;
    }

    setValidationResults(prev => ({
      ...prev,
      [fieldType]: { 
        loading: true, 
        error: '', 
        isAvailable: null,
        isValidated: false 
      }
    }));

    try {
      let endpoint = '';
      let payload = {};
      
      switch (fieldType) {
        case 'email':
          endpoint = '/api/service-providers/check-email';
          payload = { email: value };
          break;
        case 'mobile':
        case 'alternate':
          endpoint = '/api/service-providers/check-mobile';
          payload = { mobile: value };
          break;
      }

      const response = await providerInstance.post(endpoint, payload);
      
      let isAvailable = true;
      let errorMessage = '';
      
      if (response.data.exists !== undefined) {
        isAvailable = !response.data.exists;
        errorMessage = response.data.exists 
          ? `${fieldType === 'email' ? 'Email' : 'Mobile number'} is already registered` 
          : '';
      } else if (response.data.available !== undefined) {
        isAvailable = response.data.available;
        errorMessage = !response.data.available 
          ? `${fieldType === 'email' ? 'Email' : 'Mobile number'} is already registered` 
          : '';
      } else if (response.data.isAvailable !== undefined) {
        isAvailable = response.data.isAvailable;
        errorMessage = !response.data.isAvailable 
          ? `${fieldType === 'email' ? 'Email' : 'Mobile number'} is already registered` 
          : '';
      } else {
        isAvailable = true;
      }
      
      setValidationResults(prev => ({
        ...prev,
        [fieldType]: { 
          loading: false, 
          error: errorMessage, 
          isAvailable,
          isValidated: true
        }
      }));

      return isAvailable;

    } catch (error: any) {
      console.error(`Error validating ${fieldType}:`, error);
      
      let errorMessage = `Error checking ${fieldType === 'email' ? 'email' : 'mobile number'}`;
      
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
        errorMessage = `Invalid ${fieldType === 'email' ? 'email' : 'mobile number'} format`;
      } else if (error.response?.status === 409) {
        errorMessage = `${fieldType === 'email' ? 'Email' : 'Mobile number'} is already registered`;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      setValidationResults(prev => ({
        ...prev,
        [fieldType]: { 
          loading: false, 
          error: errorMessage, 
          isAvailable: false,
          isValidated: true
        }
      }));

      return false;
    }
  }, []);

  const resetValidation = useCallback((fieldType?: 'email' | 'mobile' | 'alternate') => {
    if (fieldType) {
      setValidationResults(prev => ({
        ...prev,
        [fieldType]: { 
          loading: false, 
          error: '', 
          isAvailable: null,
          isValidated: false 
        }
      }));
    } else {
      setValidationResults({
        email: { loading: false, error: '', isAvailable: null, isValidated: false },
        mobile: { loading: false, error: '', isAvailable: null, isValidated: false },
        alternate: { loading: false, error: '', isAvailable: null, isValidated: false },
      });
    }
  }, []);

  // Helper function to check if step 0 validations are complete
  const isStep0ValidationsComplete = useCallback(() => {
    // Check if email and mobile are not loading
    if (validationResults.email.loading || validationResults.mobile.loading) {
      return false;
    }
    
    // Check if email and mobile have been validated
    if (!validationResults.email.isValidated || !validationResults.mobile.isValidated) {
      return false;
    }
    
    // Check if email and mobile are available
    if (validationResults.email.isAvailable === false || validationResults.mobile.isAvailable === false) {
      return false;
    }
    
    return true;
  }, [validationResults]);

  return {
    validationResults,
    validateField,
    resetValidation,
    isStep0ValidationsComplete, // Add this new method
  };
};