import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { urls } from "src/config/urls";

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
  (error: AxiosError) => Promise.reject(error)
);

export default providerInstance;
