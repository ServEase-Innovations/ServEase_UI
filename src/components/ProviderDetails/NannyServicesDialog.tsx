/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from "axios";
import { EnhancedProviderDetails } from "../../types/ProviderDetailsType";
import { useDispatch, useSelector } from "react-redux";
import { BookingDetails } from "../../types/engagementRequest";
import { BOOKINGS } from "../../Constants/pagesConstants";
import {
  Dialog,
  DialogContent,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import Login from "../Login/Login";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axiosInstance from "../../services/axiosInstance";

interface NannyServicesDialogProps {
  open: boolean;
  handleClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
}

const NannyServicesDialog: React.FC<NannyServicesDialogProps> = ({
  open,
  handleClose,
  providerDetails,
  sendDataToParent,
}) => {
  const [activeTab, setActiveTab] = useState<"baby" | "elderly">("baby");
  const [babyPackages, setBabyPackages] = useState({
    day: { age: 3, selected: false },
    night: { age: 3, selected: false },
    fullTime: { age: 3, selected: false },
  });
  const [elderlyPackages, setElderlyPackages] = useState({
    day: { age: 65, selected: false },
    night: { age: 65, selected: false },
    fullTime: { age: 65, selected: false },
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const user = useSelector((state: any) => state.user?.value);
  const dispatch = useDispatch();
  const customerId = user?.customerDetails?.customerId || null;
  const currentLocation = user?.customerDetails?.currentLocation;
  const firstName = user?.customerDetails?.firstName;
  const lastName = user?.customerDetails?.lastName;
  const customerName = `${firstName} ${lastName}`;
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;

  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      setLoggedInUser(user);
    }
  }, [user]);

  const handleLogin = () => setLoginOpen(true);
  const handleLoginClose = () => setLoginOpen(false);
  const handleBookingPage = () => setLoginOpen(false);

  const handleBabyAgeChange = (packageType: string, value: number) => {
    setBabyPackages((prev) => ({
      ...prev,
      [packageType]: {
        ...prev[packageType as keyof typeof prev],
        age: Math.max(0, prev[packageType as keyof typeof prev].age + value),
      },
    }));
  };

  const handleElderlyAgeChange = (packageType: string, value: number) => {
    setElderlyPackages((prev) => ({
      ...prev,
      [packageType]: {
        ...prev[packageType as keyof typeof prev],
        age: Math.max(0, prev[packageType as keyof typeof prev].age + value),
      },
    }));
  };

  const togglePackageSelection = (packageType: string, isBaby: boolean) => {
    if (isBaby) {
      setBabyPackages((prev) => ({
        ...prev,
        [packageType]: {
          ...prev[packageType as keyof typeof prev],
          selected: !prev[packageType as keyof typeof prev].selected,
        },
      }));
    } else {
      setElderlyPackages((prev) => ({
        ...prev,
        [packageType]: {
          ...prev[packageType as keyof typeof prev],
          selected: !prev[packageType as keyof typeof prev].selected,
        },
      }));
    }
  };

  const calculateTotal = () => {
    let total = 0;
    if (activeTab === "baby") {
      if (babyPackages.day.selected) total += 16000;
      if (babyPackages.night.selected) total += 20000;
      if (babyPackages.fullTime.selected) total += 23000;
    } else {
      if (elderlyPackages.day.selected) total += 16000;
      if (elderlyPackages.night.selected) total += 20000;
      if (elderlyPackages.fullTime.selected) total += 23000;
    }
    return total;
  };

  const getSelectedPackagesCount = () => {
    if (activeTab === "baby") {
      return Object.values(babyPackages).filter((pkg) => pkg.selected).length;
    } else {
      return Object.values(elderlyPackages).filter((pkg) => pkg.selected)
        .length;
    }
  };

  const handleApplyVoucher = () => {
    // Voucher logic here
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const totalAmount = calculateTotal();
      if (totalAmount === 0) {
        throw new Error("Please select at least one service");
      }

      const bookingData: BookingDetails = {
        serviceProviderId: providerDetails?.serviceproviderId
          ? Number(providerDetails.serviceproviderId)
          : 0,
        serviceProviderName: providerFullName,
        customerId,
        customerName,
        address: currentLocation,
        startDate:
          bookingType?.startDate || new Date().toISOString().split("T")[0],
        endDate: bookingType?.endDate || "",
        engagements: getSelectedServicesDescription(),
        monthlyAmount: totalAmount,
        timeslot: bookingType?.timeRange || "",
        paymentMode: "UPI",
        bookingType: "NANNY_SERVICES",
        taskStatus: "NOT_STARTED",
        responsibilities: [],
      };

      // Try creating order through backend first
      try {
        const orderResponse = await createRazorpayOrder(totalAmount);
        await handlePaymentSuccess(orderResponse.data.orderId, bookingData);
      } catch (backendError) {
        console.warn(
          "Backend order creation failed, falling back to client-side",
          backendError
        );
        await createClientSideOrder(totalAmount, bookingData);
      }
    } catch (err: any) {
      handlePaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  const createRazorpayOrder = async (amount: number) => {
    return await axios.post(
      "https://utils-dmua.onrender.com/create-order",
      {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      }
    );
  };

  const createClientSideOrder = async (
    amount: number,
    bookingData: BookingDetails
  ) => {
    return new Promise((resolve, reject) => {
      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key: "rzp_test_lTdgjtSRlEwreA",
        amount: amount * 100,
        currency: "INR",
        name: "Serveaso",
        description: "Nanny Services Booking",
        handler: async (response: any) => {
          try {
            await handlePaymentSuccess(response.razorpay_order_id, bookingData);
            resolve(response);
          } catch (err) {
            reject(err);
          }
        },
        prefill: {
          name: customerName || "",
          email: user?.email || "",
          contact: user?.mobileNo || "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment closed by user"));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handlePaymentSuccess = async (
    orderId: string,
    bookingData: BookingDetails
  ) => {
    try {
      const bookingResponse = await axiosInstance.post(
        "/api/serviceproviders/engagement/add",
        {
          ...bookingData,
          paymentReference: orderId,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (bookingResponse.status === 201) {
        // Notification logic inserted here
        try {
          const notifyResponse = await fetch(
            "http://localhost:4000/send-notification",
            {
              method: "POST",
              body: JSON.stringify({
                title: "Hello from ServEaso!",
                body: `Your booking for ${bookingData.engagements} has been successfully confirmed!`,
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

        if (sendDataToParent) sendDataToParent(BOOKINGS);
        handleClose();
        alert("Booking successful! Payment ID: " + orderId);
      } else {
        throw new Error("Failed to save booking");
      }
    } catch (err) {
      console.error("Error saving booking:", err);
      throw new Error(
        "Payment succeeded but booking failed. Please contact support."
      );
    }
  };

  const handlePaymentError = (err: any) => {
    console.error("Payment error:", err);
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Payment failed. Please try again later.";
    setError(errorMessage);
  };

  const getSelectedServicesDescription = () => {
    const selectedPackages =
      activeTab === "baby"
        ? Object.entries(babyPackages).filter(([_, pkg]) => pkg.selected)
        : Object.entries(elderlyPackages).filter(([_, pkg]) => pkg.selected);

    return selectedPackages
      .map(
        ([pkgType, pkg]) =>
          `${
            activeTab === "baby" ? "Baby" : "Elderly"
          } care (${pkgType}) for age ≤${pkg.age}`
      )
      .join(", ");
  };
  return (
    <>
      <Dialog
        style={{ padding: "0px", borderRadius: "12px" }}
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: { width: "500px", borderRadius: "12px" },
        }}
      >
        <DialogContent style={{ padding: "0" }}>
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              maxWidth: "550px",
              width: "100%",
            }}
          >
            {/* Header */}
            <div style={{ padding: "20px", borderBottom: "1px solid #f0f0f0" }}>
              <h1
                style={{
                  color: "#2d3436",
                  margin: "0 0 15px 0",
                  fontSize: "24px",
                }}
              >
                NANNY SERVICES
              </h1>

              <div
                style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}
              >
                <button
                  onClick={() => setActiveTab("baby")}
                  style={{
                    flex: 1,
                    padding: "15px",
                    backgroundColor: "#fff",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: "#2d3436",
                  }}
                >
                  <div
                    style={{
                      borderBottom:
                        activeTab === "baby" ? "2px solid #e17055" : "none",
                      width: "50%",
                      margin: "0 auto",
                    }}
                  >
                    Baby Care
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("elderly")}
                  style={{
                    flex: 1,
                    padding: "15px",
                    backgroundColor: "#fff",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: "#2d3436",
                  }}
                >
                  <div
                    style={{
                      borderBottom:
                        activeTab === "elderly" ? "2px solid #e17055" : "none",
                      width: "50%",
                      margin: "0 auto",
                    }}
                  >
                    Elderly Care
                  </div>
                </button>
              </div>
            </div>

            {/* Package Sections */}
            <div style={{ padding: "20px" }}>
              {activeTab === "baby" ? (
                <>
                  {/* Baby Care - Day */}
                  <div
                    style={{
                      border: "1px solid #dfe6e9",
                      borderRadius: "10px",
                      padding: "15px",
                      marginBottom: "20px",
                      backgroundColor: babyPackages.day.selected
                        ? "#fff8f6"
                        : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h2 style={{ color: "#2d3436", margin: "0 0 5px 0" }}>
                          Baby Care - Day
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{ color: "#e17055", fontWeight: "bold" }}
                          >
                            4.8
                          </span>
                          <span
                            style={{
                              color: "#636e72",
                              fontSize: "14px",
                              marginLeft: "5px",
                            }}
                          >
                            (1.5M reviews)
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#e17055",
                            fontSize: "18px",
                          }}
                        >
                          ₹16,000 - ₹17,600
                        </div>
                        <div style={{ color: "#636e72", fontSize: "14px" }}>
                          Daytime care
                        </div>
                      </div>
                    </div>

                    {/* Age Selector */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "15px 0",
                      }}
                    >
                      <span style={{ marginRight: "15px", color: "#2d3436" }}>
                        Age:
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #dfe6e9",
                          borderRadius: "20px",
                        }}
                      >
                        <button
                          onClick={() => handleBabyAgeChange("day", -1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderRight: "1px solid #dfe6e9",
                            borderRadius: "20px 0 0 20px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{
                            padding: "5px 15px",
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          ≤{babyPackages.day.age}
                        </span>
                        <button
                          onClick={() => handleBabyAgeChange("day", 1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderLeft: "1px solid #dfe6e9",
                            borderRadius: "0 20px 20px 0",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ margin: "15px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Professional daytime baby care</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Age-appropriate activities</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Meal preparation and feeding</span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePackageSelection("day", true)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: babyPackages.day.selected
                          ? "#e17055"
                          : "#fff",
                        color: babyPackages.day.selected ? "white" : "#e17055",
                        border: "1px solid #e17055",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                    >
                      {babyPackages.day.selected
                        ? "SELECTED"
                        : "SELECT SERVICE"}
                    </button>
                  </div>

                  {/* Baby Care - Night */}
                  <div
                    style={{
                      border: "1px solid #dfe6e9",
                      borderRadius: "10px",
                      padding: "15px",
                      marginBottom: "20px",
                      backgroundColor: babyPackages.night.selected
                        ? "#fff8f6"
                        : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h2 style={{ color: "#2d3436", margin: "0 0 5px 0" }}>
                          Baby Care - Night
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{ color: "#00b894", fontWeight: "bold" }}
                          >
                            4.9
                          </span>
                          <span
                            style={{
                              color: "#636e72",
                              fontSize: "14px",
                              marginLeft: "5px",
                            }}
                          >
                            (1.2M reviews)
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#00b894",
                            fontSize: "18px",
                          }}
                        >
                          ₹20,000 - ₹22,000
                        </div>
                        <div style={{ color: "#636e72", fontSize: "14px" }}>
                          Overnight care
                        </div>
                      </div>
                    </div>

                    {/* Age Selector */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "15px 0",
                      }}
                    >
                      <span style={{ marginRight: "15px", color: "#2d3436" }}>
                        Age:
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #dfe6e9",
                          borderRadius: "20px",
                        }}
                      >
                        <button
                          onClick={() => handleBabyAgeChange("night", -1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderRight: "1px solid #dfe6e9",
                            borderRadius: "20px 0 0 20px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{
                            padding: "5px 15px",
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          ≤{babyPackages.night.age}
                        </span>
                        <button
                          onClick={() => handleBabyAgeChange("night", 1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderLeft: "1px solid #dfe6e9",
                            borderRadius: "0 20px 20px 0",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ margin: "15px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Professional overnight baby care</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Night feeding and diaper changes</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Sleep routine establishment</span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePackageSelection("night", true)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: babyPackages.night.selected
                          ? "#e17055"
                          : "#fff",
                        color: babyPackages.night.selected
                          ? "white"
                          : "#e17055",
                        border: "1px solid #e17055",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                    >
                      {babyPackages.night.selected
                        ? "SELECTED"
                        : "SELECT SERVICE"}
                    </button>
                  </div>

                  {/* 24 Hours In-House Care */}
                  <div
                    style={{
                      border: "1px solid #dfe6e9",
                      borderRadius: "10px",
                      padding: "15px",
                      backgroundColor: babyPackages.fullTime.selected
                        ? "#fff8f6"
                        : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h2 style={{ color: "#2d3436", margin: "0 0 5px 0" }}>
                          24 Hours In-House Care
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{ color: "#0984e3", fontWeight: "bold" }}
                          >
                            4.9
                          </span>
                          <span
                            style={{
                              color: "#636e72",
                              fontSize: "14px",
                              marginLeft: "5px",
                            }}
                          >
                            (980K reviews)
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#0984e3",
                            fontSize: "18px",
                          }}
                        >
                          ₹23,000 - ₹25,000
                        </div>
                        <div style={{ color: "#636e72", fontSize: "14px" }}>
                          Full-time care
                        </div>
                      </div>
                    </div>

                    {/* Age Selector */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "15px 0",
                      }}
                    >
                      <span style={{ marginRight: "15px", color: "#2d3436" }}>
                        Age:
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #dfe6e9",
                          borderRadius: "20px",
                        }}
                      >
                        <button
                          onClick={() => handleBabyAgeChange("fullTime", -1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderRight: "1px solid #dfe6e9",
                            borderRadius: "20px 0 0 20px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{
                            padding: "5px 15px",
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          ≤{babyPackages.fullTime.age}
                        </span>
                        <button
                          onClick={() => handleBabyAgeChange("fullTime", 1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderLeft: "1px solid #dfe6e9",
                            borderRadius: "0 20px 20px 0",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ margin: "15px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Round-the-clock professional care</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>All daily care activities included</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Live-in nanny service</span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePackageSelection("fullTime", true)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: babyPackages.fullTime.selected
                          ? "#e17055"
                          : "#fff",
                        color: babyPackages.fullTime.selected
                          ? "white"
                          : "#e17055",
                        border: "1px solid #e17055",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                    >
                      {babyPackages.fullTime.selected
                        ? "SELECTED"
                        : "SELECT SERVICE"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Elderly Care - Day */}
                  <div
                    style={{
                      border: "1px solid #dfe6e9",
                      borderRadius: "10px",
                      padding: "15px",
                      marginBottom: "20px",
                      backgroundColor: elderlyPackages.day.selected
                        ? "#fff8f6"
                        : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h2 style={{ color: "#2d3436", margin: "0 0 5px 0" }}>
                          Elderly Care - Day
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{ color: "#e17055", fontWeight: "bold" }}
                          >
                            4.7
                          </span>
                          <span
                            style={{
                              color: "#636e72",
                              fontSize: "14px",
                              marginLeft: "5px",
                            }}
                          >
                            (1.1M reviews)
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#e17055",
                            fontSize: "18px",
                          }}
                        >
                          ₹16,000 - ₹17,600
                        </div>
                        <div style={{ color: "#636e72", fontSize: "14px" }}>
                          Daytime care
                        </div>
                      </div>
                    </div>

                    {/* Age Selector */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "15px 0",
                      }}
                    >
                      <span style={{ marginRight: "15px", color: "#2d3436" }}>
                        Age:
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #dfe6e9",
                          borderRadius: "20px",
                        }}
                      >
                        <button
                          onClick={() => handleElderlyAgeChange("day", -1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderRight: "1px solid #dfe6e9",
                            borderRadius: "20px 0 0 20px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{
                            padding: "5px 15px",
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          ≤{elderlyPackages.day.age}
                        </span>
                        <button
                          onClick={() => handleElderlyAgeChange("day", 1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderLeft: "1px solid #dfe6e9",
                            borderRadius: "0 20px 20px 0",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ margin: "15px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Professional daytime elderly care</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Medication management</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Meal preparation and assistance</span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePackageSelection("day", false)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: elderlyPackages.day.selected
                          ? "#e17055"
                          : "#fff",
                        color: elderlyPackages.day.selected
                          ? "white"
                          : "#e17055",
                        border: "1px solid #e17055",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                    >
                      {elderlyPackages.day.selected
                        ? "SELECTED"
                        : "SELECT SERVICE"}
                    </button>
                  </div>

                  {/* Elderly Care - Night */}
                  <div
                    style={{
                      border: "1px solid #dfe6e9",
                      borderRadius: "10px",
                      padding: "15px",
                      marginBottom: "20px",
                      backgroundColor: elderlyPackages.night.selected
                        ? "#fff8f6"
                        : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h2 style={{ color: "#2d3436", margin: "0 0 5px 0" }}>
                          Elderly Care - Night
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{ color: "#00b894", fontWeight: "bold" }}
                          >
                            4.8
                          </span>
                          <span
                            style={{
                              color: "#636e72",
                              fontSize: "14px",
                              marginLeft: "5px",
                            }}
                          >
                            (950K reviews)
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#00b894",
                            fontSize: "18px",
                          }}
                        >
                          ₹20,000 - ₹22,000
                        </div>
                        <div style={{ color: "#636e72", fontSize: "14px" }}>
                          Overnight care
                        </div>
                      </div>
                    </div>

                    {/* Age Selector */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "15px 0",
                      }}
                    >
                      <span style={{ marginRight: "15px", color: "#2d3436" }}>
                        Age:
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #dfe6e9",
                          borderRadius: "20px",
                        }}
                      >
                        <button
                          onClick={() => handleElderlyAgeChange("night", -1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderRight: "1px solid #dfe6e9",
                            borderRadius: "20px 0 0 20px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{
                            padding: "5px 15px",
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          ≤{elderlyPackages.night.age}
                        </span>
                        <button
                          onClick={() => handleElderlyAgeChange("night", 1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderLeft: "1px solid #dfe6e9",
                            borderRadius: "0 20px 20px 0",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ margin: "15px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Professional overnight elderly care</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Night-time assistance and monitoring</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Sleep comfort and safety</span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePackageSelection("night", false)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: elderlyPackages.night.selected
                          ? "#e17055"
                          : "#fff",
                        color: elderlyPackages.night.selected
                          ? "white"
                          : "#e17055",
                        border: "1px solid #e17055",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                    >
                      {elderlyPackages.night.selected
                        ? "SELECTED"
                        : "SELECT SERVICE"}
                    </button>
                  </div>

                  {/* 24 Hours In-House Elderly Care */}
                  <div
                    style={{
                      border: "1px solid #dfe6e9",
                      borderRadius: "10px",
                      padding: "15px",
                      backgroundColor: elderlyPackages.fullTime.selected
                        ? "#fff8f6"
                        : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h2 style={{ color: "#2d3436", margin: "0 0 5px 0" }}>
                          24 Hours In-House Care
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{ color: "#0984e3", fontWeight: "bold" }}
                          >
                            4.9
                          </span>
                          <span
                            style={{
                              color: "#636e72",
                              fontSize: "14px",
                              marginLeft: "5px",
                            }}
                          >
                            (850K reviews)
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#0984e3",
                            fontSize: "18px",
                          }}
                        >
                          ₹23,000 - ₹25,000
                        </div>
                        <div style={{ color: "#636e72", fontSize: "14px" }}>
                          Full-time care
                        </div>
                      </div>
                    </div>

                    {/* Age Selector */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "15px 0",
                      }}
                    >
                      <span style={{ marginRight: "15px", color: "#2d3436" }}>
                        Age:
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #dfe6e9",
                          borderRadius: "20px",
                        }}
                      >
                        <button
                          onClick={() => handleElderlyAgeChange("fullTime", -1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderRight: "1px solid #dfe6e9",
                            borderRadius: "20px 0 0 20px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{
                            padding: "5px 15px",
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          ≤{elderlyPackages.fullTime.age}
                        </span>
                        <button
                          onClick={() => handleElderlyAgeChange("fullTime", 1)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f5f5f5",
                            border: "none",
                            borderLeft: "1px solid #dfe6e9",
                            borderRadius: "0",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ margin: "15px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Round-the-clock professional care</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>All daily care activities included</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px", color: "#2d3436" }}>
                          •
                        </span>
                        <span>Live-in caregiver service</span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePackageSelection("fullTime", false)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: elderlyPackages.fullTime.selected
                          ? "#e17055"
                          : "#fff",
                        color: elderlyPackages.fullTime.selected
                          ? "white"
                          : "#e17055",
                        border: "1px solid #e17055",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                    >
                      {elderlyPackages.fullTime.selected
                        ? "SELECTED"
                        : "SELECT SERVICE"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Voucher Section */}
            <div
              style={{
                padding: "15px 20px",
                borderTop: "1px solid #f0f0f0",
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: "#f8f9fa",
              }}
            >
              <h3
                style={{
                  color: "#2d3436",
                  margin: "0 0 10px 0",
                  fontSize: "16px",
                }}
              >
                Apply Voucher
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Enter voucher code"
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #dfe6e9",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
                <button
                  onClick={handleApplyVoucher}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#27ae60",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  APPLY
                </button>
              </div>
            </div>

            {/* Footer with Checkout */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "15px 20px",
                borderTop: "1px solid #f0f0f0",
                backgroundColor: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div>
                <div style={{ color: "#636e72", fontSize: "14px" }}>
                  Total for {getSelectedPackagesCount()} service
                  {getSelectedPackagesCount() !== 1 ? "s" : ""}
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "20px",
                    color: "#2d3436",
                  }}
                >
                  ₹{calculateTotal().toLocaleString()}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                {!loggedInUser && (
                  <>
                    <Tooltip title="You need to login to proceed with checkout">
                      <IconButton size="small" style={{ marginRight: "8px" }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        cursor: "pointer",
                        width: "fit-content",
                      }}
                      onClick={handleLogin}
                    >
                      LOGIN TO CONTINUE
                    </button>
                  </>
                )}

                {loggedInUser && (
                  <button
                    style={{
                      padding: "12px 25px",
                      backgroundColor:
                        calculateTotal() > 0 ? "#e17055" : "#bdc3c7",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: calculateTotal() > 0 ? "pointer" : "not-allowed",
                    }}
                    onClick={handleCheckout}
                    disabled={calculateTotal() === 0}
                  >
                    CHECKOUT
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog
        style={{ padding: "0px" }}
        open={loginOpen}
        onClose={handleLoginClose}
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
      >
        <DialogContent>
          <Login bookingPage={handleBookingPage} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NannyServicesDialog;
