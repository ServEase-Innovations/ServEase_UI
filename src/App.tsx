/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useEffect, useState } from "react";
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


function App() {
  const [selection, setSelection] = useState<string | undefined>(); 
  const [handleDropDownValue, setDropDownValue] = useState<string | undefined>(); 
  const [checkoutData, setCheckoutData] = useState<any>();
  const [selectedBookingType, setSelectedBookingType] = useState<string | undefined>();
  const [serviceProviderDetails, setServiceProvidersData] = useState<string | undefined>();
  const [currentSection, setCurrentSection] = useState<string>("HOME"); // Changed from 'page' to 'currentSection'
  const [notificationReceived, setNotificationReceived] = useState(false);
  const [activeToast, setActiveToast] = useState<any>(null);
  const [toastOpen, setToastOpen] = useState(false);

  
  const selectedBookingTypeValue = { selectedBookingType, setSelectedBookingType };
  const dispatch = useDispatch();

   const handleDataFromChild = (data: string, type?: 'section' | 'selection') => {
    console.log("Data received from child component:", data);
    
    if (type === 'section') {
      setCurrentSection(data);
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
      const res = await axios.patch(
        `https://payments-j5id.onrender.com/api/engagements/${engagementId}/accept`,
        { providerId: user?.serviceProviderId }
      );
      console.log("✅ Engagement accepted:", res.data);
    } catch (err) {
      console.error("❌ Failed to accept engagement", err);
    }
  };
  
  // handler for reject
  const handleReject = (engagementId: number) => {
    console.log("❌ Engagement rejected:", engagementId);
    // Optionally send a reject API call
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
  
  
// In your App component
const handleAboutClick = () => {
  setCurrentSection("ABOUT");
  setSelection(undefined); // Clear any service selection
};

const handleContactClick = () => {
  setCurrentSection("CONTACT");
  setSelection(undefined); // Clear any service selection
};

const handleBackToHome = () => {
  setCurrentSection("HOME");
  setSelection(undefined); // Clear any service selection
};

// Add this new function for logo click
const handleLogoClick = () => {
  setCurrentSection("HOME");
  setSelection(undefined); // Clear any service selection
};
  
  useEffect(() => {
    getPricingData();
  });

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    console.log("User data changed:", user);
    if (user?.role === "SERVICE_PROVIDER") {
      const newSocket = io("https://payments-j5id.onrender.com", {
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("✅ Connected to server:", newSocket.id);
        console.log("✅ Connected to join:", user);
        newSocket.emit("join", { providerId: user.serviceProviderId });
      });

      newSocket.on("new-engagement", (data) => {
        console.log("📩 New engagement:", data);
        setActiveToast(data.engagement);
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Disconnected");
      });

      newSocket.on("connect_error", (err) => {
        console.error("Connection error:", err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);


   const getPricingData = () => {
    axios.get('https://utils-ndt3.onrender.com/records').then(function (response) {
      console.log(response.data);
      dispatch(add(response.data));
    }).catch(function (error) { console.log(error) });
  };

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
      return <Booking />;
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

  return (
  <div className="bg-gray-50 text-gray-800">
    <Header
        sendDataToParent={(data) => handleDataFromChild(data)} // Only one argument
        onAboutClick={handleAboutClick}
        onContactClick={handleContactClick}
        onLogoClick={handleLogoClick} bookingType={""}    />

      {/* Render the current content */}
      {renderContent()}
      {/* Show footer only on HOME section without service selections */}
      {shouldShowFooter() && (
        <Footer 
          onAboutClick={handleAboutClick} 
          onContactClick={handleContactClick} 
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