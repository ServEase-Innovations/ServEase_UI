/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Header } from "./components/Header/Header";
import { Landingpage } from "./components/Landing_Page/Landingpage";
import { DetailsView } from "./components/DetailsView/DetailsView";
import Admin from "./components/Admin/Admin";
import Login from "./components/Login/Login";
import Confirmationpage from "./components/ServiceProvidersDetails/Confirmationpage";
import Checkout from "./components/Checkout/Checkout";
import UserProfile from "./components/User-Profile/UserProfile";
import Booking from "./components/User-Profile/Bookings";
import { ADMIN, BOOKINGS, CHECKOUT, CONFIRMATION, DASHBOARD, DETAILS, LOGIN, PROFILE } from "./Constants/pagesConstants";
import { ServiceProviderContext } from "./context/ServiceProviderContext";
import AgentRegistrationForm from "./components/Registration/AgentRegistrationForm";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector
import { add } from "./features/pricing/pricingSlice";
import ServiceProviderDashboard from "./components/DetailsView/ServiceProviderDashboard";
import { RootState } from './store/userStore'; 
import NotificationButton from "./components/NotificationButton";
import HomePage from "./components/HomePage/HomePage";
import NotificationClient from "./components/NotificationClient/NotificationClient";
import Dashboard from "./components/ServiceProvider/Dashboard";
import ProfileScreen from "./components/User-Profile/ProfileScreen";
import { useAuth0 } from "@auth0/auth0-react";
import AboutPage from "./components/AboutUs/AboutUs";
import ContactUs from "./components/ContactUs/ContactUs";
import Footer from "./components/Footer/Footer";
import BookingRequestToast from "./components/Notifications/BookingRequestToast";
import { io, Socket } from "socket.io-client";
import PaymentInstance from "./services/paymentInstance";
import utilsInstance from "./services/utilsInstance";
import Chatbot from "./components/Chat/Chatbot";
import ChatbotButton from "./components/Chat/ChatbotButton";
import { useAppUser } from "./context/AppUserContext";
import PrivacyPolicy from "./TermsAndConditions/PrivacyPolicy";
import TnC from "./TermsAndConditions/TnC";
import axiosInstance from "./services/axiosInstance";
import MobileNumberDialog from "./components/User-Profile/MobileNumberDialog";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";

function App() {
  const [selection, setSelection] = useState<string | undefined>(); 
  const [handleDropDownValue, setDropDownValue] = useState<string | undefined>(); 
  const [checkoutData, setCheckoutData] = useState<any>();
  const [selectedBookingType, setSelectedBookingType] = useState<string | undefined>();
  const [serviceProviderDetails, setServiceProvidersData] = useState<string | undefined>();
  const [currentSection, setCurrentSection] = useState<string>("HOME");
  const [notificationReceived, setNotificationReceived] = useState(false);
  const [activeToast, setActiveToast] = useState<any>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [showMobileDialog, setShowMobileDialog] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Ref to track if mobile number check has been done
  const hasCheckedMobileRef = useRef(false);

  console.log("Loaded ENV =", process.env.REACT_APP_API_URL, process.env.REACT_APP_ENV);
  console.log("UTILS BASE URL =", process.env.REACT_APP_UTLIS_URL);

  const selectedBookingTypeValue = { selectedBookingType, setSelectedBookingType };
  const dispatch = useDispatch();

 const handleDataFromChild = (data: string, type?: 'section' | 'selection') => {
  console.log("Data received from child component:", data);
  
  // If it's a service selection (like DETAILS), set the selection
  if (data === DETAILS || data === BOOKINGS || data === PROFILE || data === DASHBOARD) {
    setSelection(data);
    // Clear any section state when navigating to service pages
    setCurrentSection("HOME");
  } else if (type === 'section') {
    // If it's a section change (like ABOUT, CONTACT)
    setCurrentSection(data);
    // Clear selection when going to about/contact
    setSelection(undefined);
  } else {
    // For other cases
    setSelection(data);
  }
};

  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const handleAccept = async (engagementId: number) => {
    try {
      const payload = {
        serviceproviderid: appUser?.serviceProviderId,
      };

      const res = await PaymentInstance.post(
        `/api/engagements/${engagementId}/accept`,
        payload
      );

      console.log("✅ Engagement accepted:", res.data);
    } catch (err) {
      console.error("❌ Failed to accept engagement", err);
    }
  };

  const handleReject = (engagementId: number) => {
    console.log("❌ Engagement rejected:", engagementId);
  };

  const handleCheckoutItems = (item: any) => {
    setCheckoutData(item);
  };

  const getSelectedFromDropDown = (e: string) => {
    setSelection(undefined);
    setCheckoutData(undefined);
    setDropDownValue(e);
  };

  const handleSelectedBookingType = (e: string) => {
    console.log("Selected booking type:", e);
    setSelectedBookingType(e);
  };

  const handleSelectedProvider = (e: any) => {
    console.log(e);
    setServiceProvidersData(e);
  };

  const handleAboutClick = () => {
    setCurrentSection("ABOUT");
    setSelection(undefined);
  };

  const handleContactClick = () => {
    setCurrentSection("CONTACT");
    setSelection(undefined);
  };

  const handlePrivacyPolicyClick = () => {
    setCurrentSection("PRIVACY_POLICY");
    setSelection(undefined);
  };

  const handleTermsClick = () => {
    setCurrentSection("TERMS_CONDITIONS");
  };

  const handleBackToHome = () => {
    setCurrentSection("HOME");
    setSelection(undefined);
  };

  const handleLogoClick = () => {
    setCurrentSection("HOME");
    setSelection(undefined);
  };

  const { appUser } = useAppUser();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Effect for fetching pricing data (runs only once on mount)
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const response = await utilsInstance.get('/records');
        dispatch(add(response.data));
        setIsAppLoading(false);
      } catch (error) {
        console.error("Failed to fetch pricing data:", error);
        setIsAppLoading(false);
      }
    };

    fetchPricingData();
  }, [dispatch]); // Empty dependency array means this runs once on mount

  // Effect for checking customer mobile number (runs when appUser changes)
  useEffect(() => {
    // Skip if not a customer or already checked
    if (!appUser || 
        appUser?.role?.toUpperCase() !== "CUSTOMER" || 
        hasCheckedMobileRef.current) {
      return;
    }

    const fetchCustomerDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/customer/get-customer-by-id/${appUser.customerid}`
        );
        const customer = response.data;

        if (!customer?.mobileNo) {
          setShowMobileDialog(true);
        }
        
        // Mark as checked to prevent future calls
        hasCheckedMobileRef.current = true;
      } catch (error) {
        console.error("Failed to fetch customer details:", error);
        hasCheckedMobileRef.current = true;
      }
    };

    fetchCustomerDetails();
  }, [appUser]);

  // Effect for socket connection (runs when isAuthenticated or appUser changes)
  useEffect(() => {
    if (!isAuthenticated || !appUser) {
      console.log("⏳ Waiting for user authentication...");
      return;
    }

    console.log("🔎 Full user object:", appUser);

    if (appUser?.role?.toUpperCase() === "SERVICE_PROVIDER") {
      console.log("++++++++++++++ CONNECTING TO SOCKET ++++++++++++++");

      const socketUrl =
        process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

      const newSocket = io(socketUrl, {
        transports: ["websocket"],
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        console.log("✅ Connected to server:", newSocket.id);
        newSocket.emit("join", { providerId: appUser.serviceProviderId });
      });

      newSocket.on("new-engagement", (data) => {
        console.log("📩 New engagement received:", data);
        setActiveToast(data.engagement);
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Disconnected from server");
      });

      newSocket.on("connect_error", (err) => {
        console.error("❌ Connection error:", err.message);
      });

      setSocket(newSocket);

      return () => {
        console.log("🔌 Closing socket connection...");
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, appUser]);

  // Determine if footer should be shown
  const shouldShowFooter = () => {
    const noFooterPages = [
      LOGIN, ADMIN, DASHBOARD,
      PROFILE, BOOKINGS, DETAILS, CONFIRMATION, CHECKOUT,
    ];
    return !noFooterPages.includes(selection as string) && currentSection === "HOME";
  };

  const renderContent = () => {
    // Render About and Contact as sections within the main page
    if (currentSection === "ABOUT") {
      return <AboutPage onBack={handleBackToHome} />;
    }
    
    if (currentSection === "CONTACT") {
      return <ContactUs onBack={handleBackToHome} />;
    }
    
    if (currentSection === "PRIVACY_POLICY") {
      return <PrivacyPolicy />;
    }
    
    if (currentSection === "TERMS_CONDITIONS") {
      return <TnC />;
    }

    // Render service-related pages when selection exists
    if (selection === DETAILS) {
      return <DetailsView selected={selectedBookingType} sendDataToParent={handleDataFromChild} selectedProvider={handleSelectedProvider}/>;
    } else if (selection === CONFIRMATION) {
      return <Confirmationpage role={selectedBookingType} providerDetails={serviceProviderDetails} sendDataToParent={handleDataFromChild} />;
    } else if (selection === CHECKOUT) {
      return <Checkout providerDetails={serviceProviderDetails} sendDataToParent={handleDataFromChild}/>;
    } else if (selection === LOGIN) {
      return (
        <div className="w-full max-w-4xl h-[75%]">
          <Login sendDataToParent={handleDataFromChild} />
        </div>
      );
    } else if (selection === BOOKINGS) {
      return <Booking handleDataFromChild={handleDataFromChild} />;
    } else if (selection === DASHBOARD) {
      return <Dashboard />;
    } else if (selection === PROFILE) {
      return <ProfileScreen/>;
    } else if (selection === ADMIN) {
      return <Admin />;
    }

    // Default: Show HomePage when no selection and currentSection is HOME
    return (
      <ServiceProviderContext.Provider value={selectedBookingTypeValue}>
        <HomePage
          sendDataToParent={(data) => handleDataFromChild(data, 'selection')}
          bookingType={handleSelectedBookingType}
          onAboutClick={handleAboutClick}
          onContactClick={handleContactClick}
        />
      </ServiceProviderContext.Provider>
    );
  };

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-gray-50 text-gray-800">
         <Header

  sendDataToParent={(data) => handleDataFromChild(data)}
  onAboutClick={handleAboutClick}
  onContactClick={handleContactClick}
  onLogoClick={handleLogoClick} 
  bookingType={""}
/>

      {/* Render the current content */}
      {renderContent()}

      {showMobileDialog && appUser?.customerid && (
        <MobileNumberDialog
          open={showMobileDialog}
          onClose={() => setShowMobileDialog(false)}
          customerId={appUser.customerid}
          onSuccess={() => {
            console.log("Mobile number updated successfully!");
            setShowMobileDialog(false);
          }}
        />
      )}

      <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />
      <ChatbotButton 
        open={chatOpen} 
        onToggle={() => setChatOpen(prev => !prev)} 
      />

      {/* Show footer only on HOME section without service selections */}
      {shouldShowFooter() && (
        <Footer 
          onAboutClick={handleAboutClick} 
          onContactClick={handleContactClick} 
          onPrivacyPolicyClick={handlePrivacyPolicyClick}
          onTermsClick={handleTermsClick}
        />
      )}

      {activeToast && (
        <BookingRequestToast
          engagement={activeToast}
          onAccept={handleAccept}
          onReject={handleReject}
          onClose={() => setActiveToast(null)}
        />
      )}
    </div>
  );
}

export default App;