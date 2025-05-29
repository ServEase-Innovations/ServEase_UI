import React, { useState } from "react";
import Registration from "../Registration/Registration";
import AgentRegistrationForm from "../Registration/AgentRegistrationForm";
import ServiceProviderRegistration from "../Registration/ServiceProviderRegistration";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import ForgotPassword from "./ForgotPassword";
import axiosInstance from "../../services/axiosInstance";
import { useDispatch } from "react-redux";
import { add } from "../../features/user/userSlice";
import { PROFILE } from "../../Constants/pagesConstants";

interface ChildComponentProps {
  sendDataToParent?: (data: string) => void;
  bookingPage?: (data: string | undefined) => void;
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
}) => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [isServiceRegistration, setServiceRegistration] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isAgentRegistration, setAgentRegistration] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const handleSignUpClick = () => {
    setIsRegistration(true);
  };

  const handleBackToLogin = () => {
    setIsRegistration(false);
    setIsForgotPassword(false);
    setServiceRegistration(false);
  };

  const handleSignUpClickServiceProvider = () => {
    setServiceRegistration(true);
  };
  const handleSignUpClickAgent = () => {
    setAgentRegistration(true);
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const handleSnackbarClose = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/api/user/login", {
        username: email,
        password: password,
      });

      console.log("Response Data:", response.data);

      if (response.status === 200 && response.data) {
        const { message, role, customerDetails } = response.data;
        const firstName = customerDetails?.firstName || "Unknown";

        dispatch(add(response.data));

        // Show success snackbar
        setSnackbarMessage(message || "Login successful!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);

        // Notification logic
        try {
          const notifyResponse = await fetch(
            "http://localhost:4000/send-notification",
            {
              method: "POST",
              body: JSON.stringify({
                title: "Login Successful",
                body: `Welcome back, ${firstName}!`,
                url: "http://localhost:3000",
              }),
              headers: { "Content-Type": "application/json" },
            }
          );

          if (notifyResponse.ok) {
            console.log("Notification triggered!");
            alert("Notification sent!");
          } else {
            console.error("Notification failed");
            alert("Failed to send notification");
          }
        } catch (error) {
          console.error("Error sending notification:", error);
          alert("Error sending notification");
        }

        // Handle redirection after login
        setTimeout(() => {
          if (role === "SERVICE_PROVIDER") {
            if (sendDataToParent) {
              sendDataToParent(PROFILE);
            } else if (bookingPage) {
              bookingPage(role);
            }
          } else {
            if (sendDataToParent) {
              sendDataToParent("");
            } else if (bookingPage) {
              bookingPage(role);
            }
          }
        }, 1000);
      } else {
        throw new Error(
          response.data?.message ||
            "Login failed. Please check your credentials."
        );
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setSnackbarMessage(
        error.response?.data?.message || "An error occurred during login."
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  if (isForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="h-full flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-0">
          <div className="border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-8 md:p-6 sm:p-4 p-2 m-0">
            {isRegistration ? (
              <Registration onBackToLogin={handleBackToLogin} />
            ) : isServiceRegistration ? (
              <ServiceProviderRegistration onBackToLogin={handleBackToLogin} />
            ) : isAgentRegistration ? (
              <AgentRegistrationForm onBackToLogin={handleBackToLogin} />
            ) : (
              <>
                <h1 className="font-bold dark:text-gray-400 text-4xl text-center cursor-default my-0">
                  Log in
                </h1>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 dark:text-gray-400 text-lg"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      className="border p-3 dark:bg-indigo-500 dark:text-gray-300 dark:border-gray-700 shadow-md placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="password"
                      className="mb-2 dark:text-gray-400 text-lg"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      className="border p-3 shadow-md dark:bg-indigo-500 dark:text-gray-300 dark:border-gray-700 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                   
                  </div>

                  <button
                    className="group text-blue-400 transition-all duration-100 ease-in-out cursor-pointer"
                    onClick={handleForgotPasswordClick}
                  >
                    <span className="bg-left-bottom bg-gradient-to-r text-sm from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                      Forget your password?
                    </span>
                  </button>
                  <button
                    className="bg-gradient-to-r dark:text-gray-300 from-blue-500 to-purple-500 shadow-lg mt-3 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out"
                    type="submit"
                  >
                    LOG IN
                  </button>
                </form>
                <div className="flex flex-col items-center justify-center text-sm mt-4">
                  <h3 className="dark:text-gray-300">Don't have an account?</h3>
                  <button
                    onClick={handleSignUpClick}
                    className="text-blue-400 ml-2 hover:underline"
                  >
                    Sign Up As User
                  </button>
                  <button
                    onClick={handleSignUpClickServiceProvider}
                    className="text-blue-400 ml-2 hover:underline"
                  >
                    Sign Up As Service Provider
                  </button>
                  <button
                    onClick={handleSignUpClickAgent}
                    className="text-blue-400 ml-2 hover:underline"
                  >
                    Sign Up As Agent
                  </button>
                </div>
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
