import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { urls } from "src/config/urls";

const adminTicketsInstance = axios.create({
  baseURL: urls.tickets,
  timeout: 30000,
});

adminTicketsInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const secret =
      process.env.REACT_APP_ADMIN_TICKET_SECRET ||
      process.env.REACT_APP_ADMIN_PUSH_SECRET ||
      (process.env.NODE_ENV === "development" ? "serveaso-test-push-secret" : "") ||
      "";
    if (secret) {
      config.headers["x-admin-ticket-secret"] = secret;
    }
    const email =
      sessionStorage.getItem("adminUsername") ||
      process.env.REACT_APP_ADMIN_EMAIL ||
      "admin@serveaso.com";
    config.headers["x-admin-email"] = email;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

adminTicketsInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error)
);

export default adminTicketsInstance;
