// src/axiosInstance.ts
import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL:'http://43.205.212.94:8080' ,
   //  'http://localhost:8080' ,
   // 'http://43.205.212.94:8080',
  // 'http://43.205.212.94:8080'
  //  // Change to your API's base URL
});

// Request Interceptor
axiosInstance.interceptors.request.use(
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
axiosInstance.interceptors.response.use(
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

export default axiosInstance;
