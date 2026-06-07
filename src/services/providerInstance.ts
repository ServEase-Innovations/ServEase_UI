import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { urls } from "src/config/urls";
import { authApiErrorMessage } from "src/utils/apiAuthError";

const providerInstance = axios.create({
  baseURL: urls.providers,
  timeout: 30000,
});

providerInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

providerInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Provider API auth error:", authApiErrorMessage(error));
    }
    return Promise.reject(error);
  }
);

export default providerInstance;
