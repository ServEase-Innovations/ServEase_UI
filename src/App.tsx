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
import { ClipLoader } from 'react-spinners';

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
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  
  // Deep linking states
  const [deepLinkProcessed, setDeepLinkProcessed] = useState(false);
  const [processingDeepLink, setProcessingDeepLink] = useState(false);
  const [pendingDeepLink, setPendingDeepLink] = useState<{
    openBookings: string, 
    customerId: string | null,
    bookingId: string | null,
    action: string | null
  } | null>(null);

  console.log("Loaded ENV =", process.env.REACT_APP_API_URL, process.env.REACT_APP_ENV);
  console.log("UTILS BASE URL =", process.env.REACT_APP_UTLIS_URL , process.env.REACT_PROVIDER_URL);

  const selectedBookingTypeValue = { selectedBookingType, setSelectedBookingType };
  const dispatch = useDispatch();

  const { showMobileDialog } = useCustomerMobileCheck();

  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const { setAppUser } = useAppUser();
  const { appUser } = useAppUser();

  // ============= MODIFIED DEEP LINKING WITH AUTH0 =============

  // Process deep link after authentication
  const processDeepLink = (openBookings: string, customerId: string | null, bookingId: string | null, action: string | null = 'open') => {
    setProcessingDeepLink(true);
    
    // Store data in sessionStorage for the Booking component
    if (customerId) {
      sessionStorage.setItem('deepLinkCustomerId', customerId);
      console.log(`📦 Will show ALL bookings for customer #${customerId}`);
    }
    
    if (bookingId) {
      sessionStorage.setItem('deepLinkBookingId', bookingId);
      console.log(`📦 Will open specific booking #${bookingId}`);
    }
    
    sessionStorage.setItem('deepLinkTimestamp', Date.now().toString());
    
    // MODIFIED: Always set action to 'drawer' by default
    // This ensures that even without action=drawer parameter, the drawer will open
    sessionStorage.setItem('deepLinkAction', 'drawer');
    console.log(`📦 Default action set to 'drawer' for automatic drawer opening`);
    
    // Set the selection to BOOKINGS
    setSelection(BOOKINGS);
    setCurrentSection("HOME");
    
    // Mark as processed
    setDeepLinkProcessed(true);
    setPendingDeepLink(null);
    setProcessingDeepLink(false);
    
    // Clean up the URL (remove query parameters)
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    
    // Clean up session storage
    sessionStorage.removeItem('pendingDeepLinkCustomerId');
    sessionStorage.removeItem('pendingDeepLinkBookingId');
    sessionStorage.removeItem('pendingDeepLinkTimestamp');
    sessionStorage.removeItem('pendingDeepLinkAction');
    sessionStorage.removeItem('auth0ReturnTo');
    
    console.log('✅ Deep link processed successfully with automatic drawer opening');
  };

  // Check for deep link parameters on initial load
  useEffect(() => {
    const checkDeepLink = () => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const openBookings = params.get('openBookings');
      const customerId = params.get('customerId');      // For viewing all bookings of a customer
      const bookingId = params.get('bookingId');        // For viewing specific booking
      const action = params.get('action');              // 'open' or 'drawer'
      
      console.log('=== DEEP LINK CHECK ===');
      console.log('Current URL:', window.location.href);
      console.log('openBookings param:', openBookings);
      console.log('customerId param:', customerId);
      console.log('bookingId param:', bookingId);
      console.log('action param:', action);
      console.log('Is authenticated:', isAuthenticated);
      console.log('Auth loading:', isLoading);

      if (openBookings === 'true') {
        if (isAuthenticated) {
          // User is already logged in, process deep link immediately
          console.log('✅ User authenticated, processing deep link now');
          processDeepLink(openBookings, customerId, bookingId, action);
        } else if (!isLoading) {
          // User not logged in and auth not loading, store deep link for after login
          console.log('🔐 User not authenticated, storing deep link for after login');
          
          // Store in state
          setPendingDeepLink({
            openBookings: openBookings,
            customerId: customerId,
            bookingId: bookingId,
            action: action
          });
          
          // Also store in sessionStorage as backup
          if (customerId) {
            sessionStorage.setItem('pendingDeepLinkCustomerId', customerId);
          }
          if (bookingId) {
            sessionStorage.setItem('pendingDeepLinkBookingId', bookingId);
          }
          sessionStorage.setItem('pendingDeepLinkTimestamp', Date.now().toString());
          
          // MODIFIED: Store action as 'drawer' by default
          // If action parameter exists, use it; otherwise default to 'drawer'
          const actionToStore = action || 'drawer';
          sessionStorage.setItem('pendingDeepLinkAction', actionToStore);
          console.log(`📦 Stored pending action: ${actionToStore}`);
          
          console.log(`📦 Stored pending deep link data:`, {
            customerId: customerId || 'none',
            bookingId: bookingId || 'none',
            action: actionToStore
          });
          
          // Store the return URL to come back to after login
          sessionStorage.setItem('auth0ReturnTo', window.location.pathname + window.location.search);
          
          // Redirect to login via Auth0
          console.log('➡️ Redirecting to Auth0 login...');
          loginWithRedirect({
            appState: {
              returnTo: window.location.pathname + window.location.search
            }
          });
        }
      }
    };

    // Only check if not already processed and auth is not loading
    if (!deepLinkProcessed && !isLoading) {
      checkDeepLink();
    }
  }, [isAuthenticated, isLoading, deepLinkProcessed, loginWithRedirect]);

  // Handle post-login deep link processing
  useEffect(() => {
    if (isAuthenticated && !deepLinkProcessed && !isLoading) {
      // Check if we have a pending deep link in state
      if (pendingDeepLink) {
        console.log('🔄 User just logged in, processing pending deep link from state');
        processDeepLink(
          pendingDeepLink.openBookings, 
          pendingDeepLink.customerId, 
          pendingDeepLink.bookingId, 
          pendingDeepLink.action
        );
      } 
      // Also check sessionStorage as backup
      else {
        const pendingCustomerId = sessionStorage.getItem('pendingDeepLinkCustomerId');
        const pendingBookingId = sessionStorage.getItem('pendingDeepLinkBookingId');
        const pendingTimestamp = sessionStorage.getItem('pendingDeepLinkTimestamp');
        const pendingAction = sessionStorage.getItem('pendingDeepLinkAction');
        
        if ((pendingCustomerId || pendingBookingId) && pendingTimestamp) {
          const now = Date.now();
          const linkTime = parseInt(pendingTimestamp);
          const tenMinutes = 10 * 60 * 1000;
          
          if (now - linkTime < tenMinutes) {
            console.log('🔄 Found pending deep link in sessionStorage, processing...');
            processDeepLink('true', pendingCustomerId, pendingBookingId, pendingAction);
          } else {
            // Clear expired deep link
            sessionStorage.removeItem('pendingDeepLinkCustomerId');
            sessionStorage.removeItem('pendingDeepLinkBookingId');
            sessionStorage.removeItem('pendingDeepLinkTimestamp');
            sessionStorage.removeItem('pendingDeepLinkAction');
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, deepLinkProcessed, pendingDeepLink]);

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

  const [socket, setSocket] = useState<Socket | null>(null);

  // Effect for fetching pricing data
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

  // Effect for socket connection
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

  const shouldShowFooter = () => {
    const noFooterPages = [
      LOGIN, ADMIN, DASHBOARD,
      PROFILE, BOOKINGS, DETAILS, CONFIRMATION, CHECKOUT,
    ];
    return !noFooterPages.includes(selection as string) && currentSection === "HOME";
  };

  const renderContent = () => {
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
      {/* Deep linking loading overlay */}
      {processingDeepLink && (
        <div className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center" style={{ zIndex: 9999 }}>
          <ClipLoader color="#3b82f6" size={50} />
          <p className="mt-4 text-lg font-medium text-gray-700">Opening your booking...</p>
        </div>
      )}

      <Header
        sendDataToParent={(data) => handleDataFromChild(data)}
        bookingType={""}
        onAboutClick={handleAboutClick}
        onContactClick={handleContactClick}
        onLogoClick={handleLogoClick}
      />

      {renderContent()}

      {mobileDialogOpen && appUser?.customerid && (
        <MobileNumberDialog
          open={mobileDialogOpen}
          onClose={() => {
            setMobileDialogOpen(false);
          }}
          customerId={appUser.customerid}
          onSuccess={() => {
            console.log("Mobile number updated successfully!");
            dispatch(setHasMobileNumber(true));
            setMobileDialogOpen(false);
          }}
        />
      )}

      <ChatbotButton 
        open={chatbotOpen} 
        onToggle={() => setChatbotOpen(!chatbotOpen)} 
      />
      
      <Chatbot 
        open={chatbotOpen} 
        onClose={() => setChatbotOpen(false)} 
      />
      
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