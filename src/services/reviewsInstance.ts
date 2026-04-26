/** `urls.reviews` (reviews service). No component imports this yet. */
import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { urls } from 'src/config/urls';

const reviewsInstance = axios.create({
  baseURL: urls.reviews,
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
