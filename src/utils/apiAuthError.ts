import { AxiosError } from "axios";

export function isAuthApiError(error: unknown): boolean {
  const status = (error as AxiosError)?.response?.status;
  return status === 401 || status === 403;
}

export function authApiErrorMessage(error: unknown): string {
  const status = (error as AxiosError)?.response?.status;
  if (status === 401) {
    return "Your session expired. Please log in again to continue.";
  }
  if (status === 403) {
    return "You do not have access to this resource.";
  }
  return "Something went wrong. Please try again.";
}
