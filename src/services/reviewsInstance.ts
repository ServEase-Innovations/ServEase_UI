// src/reviewsAxiosInstance.ts
import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

const reviewsInstance = axios.create({
  baseURL:
    process.env.REACT_APP_REVIEWS_URL ||
    'https://reviews-19oo.onrender.com',
  // 'http://localhost:8080',
});

// Request Interceptor
reviewsInstance.interceptors.request.use(
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

// Response Interceptor
reviewsInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // handle unauthorized access (optional)
    }
    return Promise.reject(error);
  }
);

export default reviewsInstance;
