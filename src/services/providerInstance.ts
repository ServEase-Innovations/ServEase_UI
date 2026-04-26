import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { urls } from "src/config/urls";

const providerInstance = axios.create({
  baseURL: urls.providers,
});

// Request Interceptor
providerInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token'); // Or however you manage tokens
    if (token) {
      // Ensure headers are correctly typed
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response Interceptor
providerInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
    }
    return Promise.reject(error);
  }
);

export default providerInstance;
