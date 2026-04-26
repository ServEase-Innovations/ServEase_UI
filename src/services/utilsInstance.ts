// src/utilsInstance.ts
import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { urls } from 'src/config/urls';

const utilsInstance = axios.create({
  baseURL: urls.utils,
});

utilsInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

utilsInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default utilsInstance;
