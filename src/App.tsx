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
import { useDispatch, useSelector } from "react-redux";
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
import { useCustomerMobileCheck } from "./components/hooks/useCustomerMobileCheck";
import { setHasMobileNumber } from "./features/customer/customerSlice";

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
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // LOCAL STATE FOR DIALOG - ADD THIS
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);

  console.log("Loaded ENV =", process.env.REACT_APP_API_URL, process.env.REACT_APP_ENV);
  console.log("UTILS BASE URL =", process.env.REACT_APP_UTLIS_URL , process.env.REACT_PROVIDER_URL);

  const selectedBookingTypeValue = { selectedBookingType, setSelectedBookingType };
  const dispatch = useDispatch();

  // USE THE CUSTOM HOOK
  const { showMobileDialog } = useCustomerMobileCheck();

  // CONTROL DIALOG BASED ON REDUX STATE - ADD THIS EFFECT
  useEffect(() => {
    if (showMobileDialog) {
      setMobileDialogOpen(true);
    }
  }, [showMobileDialog]);

 const handleDataFromChild = (data: string, type?: 'section' | 'selection') => {
  console.log("Data received from child component:", data);
  
  if (data === DETAILS || data === BOOKINGS || data === PROFILE || data === DASHBOARD) {
    setSelection(data);
    setCurrentSection("HOME");
  } else if (type === 'section') {
    setCurrentSection(data);
    setSelection(undefined);
  } else {
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
  }, [dispatch]);

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
      return <PrivacyPolicy onBack={handleBackToHome} />;
    }
    
    if (currentSection === "TERMS_CONDITIONS") {
      return <TnC onBack={handleBackToHome} />;
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

      {/* Mobile Number Dialog - CONTROLLED BY LOCAL STATE */}
      {mobileDialogOpen && appUser?.customerid && (
       <MobileNumberDialog
  open={mobileDialogOpen}
  onClose={() => {
    setMobileDialogOpen(false);
  }}
  customerId={appUser.customerid}
  onSuccess={() => {
    console.log("Mobile number updated successfully!");
    
    // ADD THIS LINE - Tell checklist "YES, now has mobile"
    dispatch(setHasMobileNumber(true));  // ← ADD THIS!
    
    setMobileDialogOpen(false);
  }}
/>
      )}

       <ChatbotButton 
        open={chatbotOpen} 
        onToggle={() => setChatbotOpen(!chatbotOpen)} 
      />
      
      {/* Chatbot Window - Only visible when open */}
      <Chatbot 
        open={chatbotOpen} 
        onClose={() => setChatbotOpen(false)} 
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