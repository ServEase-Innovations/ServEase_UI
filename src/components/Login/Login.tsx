// Login.tsx
/* eslint-disable */
import React, { useState } from "react";
import Registration from "../Registration/Registration";
import AgentRegistrationForm from "../Registration/AgentRegistrationForm";
import ServiceProviderRegistration from "../Registration/ServiceProviderRegistration";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import ForgotPassword from "./ForgotPassword";
import axiosInstance from "../../services/axiosInstance";
import { useDispatch } from "react-redux";
import { add } from "../../features/user/userSlice";
import { PROFILE } from "../../Constants/pagesConstants";
import { useAppUser } from "src/context/AppUserContext";

interface ChildComponentProps {
  sendDataToParent?: (data: string) => void;
  bookingPage?: (data: string | undefined) => void;
  embedded?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const Login: React.FC<ChildComponentProps> = ({
  sendDataToParent,
  bookingPage,
  embedded = false,
}) => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [isServiceRegistration, setServiceRegistration] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isAgentRegistration, setAgentRegistration] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const dispatch = useDispatch();
  const { setAppUser } = useAppUser();

  const handleBackToLogin = () => {
    setIsRegistration(false);
    setIsForgotPassword(false);
    setServiceRegistration(false);
    setAgentRegistration(false); // Reset agent registration state
  };

  const handleSnackbarClose = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      if (otpSent) {
        handleVerifyOtp(event);
      } else {
        handleSendOtp(event);
      }
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedMobile = mobile.replace(/\D/g, "");
    if (!/^\d{10}$/.test(sanitizedMobile)) {
      setSnackbarMessage("Please enter a valid 10-digit mobile number.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      setSendingOtp(true);
      const response = await axiosInstance.post("/api/auth/otp/send", {
        mobile: sanitizedMobile,
      });
      setOtpSent(true);
      setResendIn(30);
      setSnackbarMessage(
        response?.data?.data?.devOtp
          ? `OTP sent. Dev OTP: ${response.data.data.devOtp}`
          : "OTP sent successfully."
      );
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error: any) {
      console.error("Send OTP error:", error);
      setSnackbarMessage(
        error.response?.data?.message || "Failed to send OTP."
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setSnackbarMessage("Please enter OTP.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      setVerifyingOtp(true);
      const response = await axiosInstance.post("/api/auth/otp/verify", {
        mobile: mobile.replace(/\D/g, ""),
        otp: otp.trim(),
      });

      const payload = response?.data?.data;
      const isCustomer = payload?.role === "CUSTOMER" && payload?.customer;
      const isProvider =
        payload?.role === "SERVICE_PROVIDER" && payload?.serviceProvider;
      if (!isCustomer && !isProvider) {
        throw new Error("Invalid response from OTP login.");
      }

      localStorage.setItem("token", payload.token);
      dispatch(add(payload));
      if (payload.role === "SERVICE_PROVIDER") {
        setAppUser({
          role: "SERVICE_PROVIDER",
          serviceProviderId:
            payload.serviceProviderId ??
            payload.serviceProvider?.serviceproviderid ??
            null,
          name: [
            payload.serviceProvider?.firstName,
            payload.serviceProvider?.lastName,
          ]
            .filter(Boolean)
            .join(" "),
          email: payload.serviceProvider?.emailId ?? null,
        });
      } else {
        setAppUser({
          role: "CUSTOMER",
          customerid: payload.customerId ?? payload.customer?.customerid ?? null,
          name: [
            payload.customer?.firstname,
            payload.customer?.lastname,
          ]
            .filter(Boolean)
            .join(" "),
          email: payload.customer?.emailid ?? null,
        });
      }
      setSnackbarMessage("Login successful!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      setTimeout(() => {
        if (payload.role === "SERVICE_PROVIDER") {
          if (sendDataToParent) {
            sendDataToParent(PROFILE);
          } else if (bookingPage) {
            bookingPage("SERVICE_PROVIDER");
          }
        } else {
          if (sendDataToParent) {
            sendDataToParent("");
          } else if (bookingPage) {
            bookingPage("CUSTOMER");
          }
        }
      }, 700);
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      setSnackbarMessage(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setVerifyingOtp(false);
    }
  };

  React.useEffect(() => {
    if (!otpSent || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [otpSent, resendIn]);

  if (isForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className={`h-full flex flex-col justify-center items-center ${embedded ? "p-1" : "p-4"}`}>
      <div className={`w-full ${embedded ? "max-w-2xl" : "max-w-lg"}`}>
        <div className={`${embedded ? "bg-transparent" : "bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-0"}`}>
          <div className={`${embedded ? "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm" : "border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-8 md:p-6 sm:p-4 p-2 "}`}>
            {isRegistration ? (
              <Registration
                onBackToLogin={handleBackToLogin}
              />
            ) : isServiceRegistration ? (
              <ServiceProviderRegistration onBackToLogin={handleBackToLogin} />
            ) : isAgentRegistration ? (
              <AgentRegistrationForm
                onBackToLogin={handleBackToLogin}
              />
            ) : (
              <>
                <h1 className={`font-bold text-center cursor-default my-0 ${embedded ? "text-2xl text-slate-900" : "dark:text-gray-400 text-4xl"}`}>
                  Mobile OTP Login
                </h1>
                <p className={`mt-2 text-center ${embedded ? "text-sm text-slate-500" : "text-sm text-slate-500 dark:text-slate-300"}`}>
                  Enter your mobile number to receive a one-time password.
                </p>
                <form className="space-y-4 mt-5" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                  <div>
                    <label
                      htmlFor="mobile"
                      className={`mb-2 block ${embedded ? "text-sm font-semibold text-slate-700" : "dark:text-gray-400 text-lg"}`}
                    >
                      Mobile Number
                    </label>
                    <input
                      id="mobile"
                      className={`w-full rounded-xl border px-3 py-3 outline-none transition ${
                        embedded
                          ? "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          : "dark:bg-indigo-500 dark:text-gray-300 dark:border-gray-700 shadow-md placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300"
                      }`}
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      onKeyDown={handleKeyPress}
                      required
                    />
                  </div>
                  {otpSent && (
                    <div className="relative">
                      <label
                        htmlFor="otp"
                        className={`mb-2 block ${embedded ? "text-sm font-semibold text-slate-700" : "dark:text-gray-400 text-lg"}`}
                      >
                        OTP
                      </label>
                      <input
                        id="otp"
                        className={`w-full rounded-xl border px-3 py-3 outline-none transition ${
                          embedded
                            ? "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            : "shadow-md dark:bg-indigo-500 dark:text-gray-300 dark:border-gray-700 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300"
                        }`}
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onKeyDown={handleKeyPress}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {!otpSent ? (
                    <button
                      className={`mt-3 w-full rounded-xl py-2.5 font-semibold text-white transition ${
                        embedded
                          ? "bg-sky-600 hover:bg-sky-700"
                          : "bg-gradient-to-r dark:text-gray-300 from-blue-500 to-purple-500 shadow-lg hover:scale-105 hover:from-purple-500 hover:to-blue-500 duration-300 ease-in-out"
                      }`}
                      type="submit"
                      disabled={sendingOtp}
                    >
                      {sendingOtp ? "SENDING OTP..." : "SEND OTP"}
                    </button>
                  ) : (
                    <>
                      <button
                        className={`mt-3 w-full rounded-xl py-2.5 font-semibold text-white transition ${
                          embedded
                            ? "bg-sky-600 hover:bg-sky-700"
                            : "bg-gradient-to-r dark:text-gray-300 from-blue-500 to-purple-500 shadow-lg hover:scale-105 hover:from-purple-500 hover:to-blue-500 duration-300 ease-in-out"
                        }`}
                        type="submit"
                        disabled={verifyingOtp}
                      >
                        {verifyingOtp ? "VERIFYING..." : "VERIFY OTP"}
                      </button>
                      <button
                        type="button"
                        className={`group text-sm transition-all duration-100 ease-in-out cursor-pointer ${
                          embedded ? "text-sky-600 font-medium" : "text-blue-400"
                        }`}
                        onClick={(evt) => {
                          if (resendIn > 0) return;
                          handleSendOtp(evt as unknown as React.FormEvent);
                        }}
                        disabled={resendIn > 0 || sendingOtp}
                      >
                        <span className="bg-left-bottom bg-gradient-to-r text-sm from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                          {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
                        </span>
                      </button>
                    </>
                  )}

                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ marginTop: "60px" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
