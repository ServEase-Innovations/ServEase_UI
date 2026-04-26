import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { urls } from 'src/config/urls';

const preferenceInstance = axios.create({
  baseURL: urls.preferences,
});

// Request Interceptor (same token logic as before)
preferenceInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (optional, same as original)
preferenceInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // handle unauthorized if needed
    }
    return Promise.reject(error);
  }
);

export default preferenceInstance;