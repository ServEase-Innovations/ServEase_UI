import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { urls } from "src/config/urls";

const ticketsInstance = axios.create({
  baseURL: urls.tickets,
  timeout: 30000,
});

ticketsInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

ticketsInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error)
);

export default ticketsInstance;
