// src/PaymentInstance.ts
import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { urls } from 'src/config/urls';
import { getAdminPushSecret, isAdminPaymentsRequest } from 'src/utils/adminApiSecret';
import { authApiErrorMessage } from 'src/utils/apiAuthError';

const PaymentInstance = axios.create({
  baseURL: urls.payments,
  
  // You can add payment-specific default config here
  timeout: 30000, // Longer timeout for payment processing
});

// Request Interceptor
PaymentInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token'); // Or however you manage tokens
    if (token) {
      // Ensure headers are correctly typed
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    config.headers['Content-Type'] = 'application/json';

    const adminSecret = getAdminPushSecret();
    const path = config.url || '';
    if (adminSecret && isAdminPaymentsRequest(path)) {
      config.headers['X-Admin-Push-Secret'] = adminSecret;
    }

    return config;
  },
  (error: AxiosError) => {
    // Handle request error specifically for payments
    console.error('Payment request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
PaymentInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can add payment-specific response handling here
    return response;
  },
  (error: AxiosError) => {
    // Handle payment-specific errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Payment API auth error:', authApiErrorMessage(error));
    } else if (error.response?.status === 402) {
      // Handle payment required errors
      console.error('Payment required or failed');
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout errors specifically for payments
      console.error('Payment request timeout');
    }
    
    return Promise.reject(error);
  }
);

export default PaymentInstance;