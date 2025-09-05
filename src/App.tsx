/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Header } from "./components/Header/Header";
import { Landingpage } from "./components/Landing_Page/Landingpage";
import { DetailsView } from "./components/DetailsView/DetailsView";
import Footer from "./components/Footer/Footer";
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

function App() {
  const [selection, setSelection] = useState<string | undefined>(); 
  const [handleDropDownValue, setDropDownValue] = useState<string | undefined>(); 
  const [checkoutData, setCheckoutData] = useState<any>();
  const [selectedBookingType, setSelectedBookingType] = useState<string | undefined>();
  const [serviceProviderDetails, setServiceProvidersData] = useState<string | undefined>();
  const selectedBookingTypeValue = { selectedBookingType, setSelectedBookingType };
  const dispatch = useDispatch();

  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

// Extract user data from Redux with correct type
// const user = useSelector((state: RootState) => state.user as UserState);
const [notificationReceived, setNotificationReceived] = useState(false);

// Ensure `value` is not null before accessing `role`
// const userRole = user?.value?.role ?? "No Role";
// console.log("Logged-in user role:", userRole);

// if (userRole === "CUSTOMER") {
//   console.log("User is a Customer");
// } else if (userRole === "SERVICE_PROVIDER") {
//   console.log("User is a Service Provider");
// } else {
//   console.log("User role is unknown");
// }

console.log("User data in App component:", user);

  const handleDataFromChild = (e: string) => {
    console.log("Data received from child component:", e);
    setSelection(e);
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
    setShowAboutPage(true);
  };

  const handleBackToHome = () => {
    setShowAboutPage(false);
  };  
  const [showAboutPage, setShowAboutPage] = useState(false);
  useEffect(() => {
    getPricingData();
  });

  useEffect(() => {
    console.log("user in useEffect -> ", user);
    if(user?.role === "SERVICE_PROVIDER") {
      const ws = new WebSocket("wss://utils-ndt3.onrender.com/");

    ws.onopen = () => {
      const serviceProviderId = user?.serviceProviderId; // Adjust field as needed
      if (serviceProviderId) {
        ws.send(JSON.stringify({ type: "IDENTIFY", id: serviceProviderId }));
      }
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      setNotificationReceived(true);
    };

    return () => ws.close();
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
    // Don't show footer on these pages
    const noFooterPages = [LOGIN, ADMIN, DASHBOARD, PROFILE, BOOKINGS];
    return !noFooterPages.includes(selection as string) && !showAboutPage;
  };
  const renderContent = () => {
      // If About page is shown, render it
    if (showAboutPage) {
      return <AboutPage onBack={handleBackToHome} />;
    }
    
    if (!selection) {
      return <ServiceProviderContext.Provider value={selectedBookingTypeValue}>
        <HomePage 
                sendDataToParent={handleDataFromChild} 
                bookingType={handleSelectedBookingType}
                onAboutClick={handleAboutClick} // Add this line
            />
      </ServiceProviderContext.Provider>;
    } else if (selection) {
      if (selection === DETAILS) {

        return <DetailsView selected={selectedBookingType} sendDataToParent={handleDataFromChild} selectedProvider={handleSelectedProvider}/>;
      } else if (selection === CONFIRMATION) {
        console.log("selected details -> ", serviceProviderDetails);
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
      }
      else if (selection === DASHBOARD) {
        return <Dashboard />;
      }
       else if (selection === PROFILE) {
        return <ProfileScreen/>
      } else if (selection === ADMIN) {
        console.log("I am in admin");
        return <Admin />;
      }
    }
  };
  

  return (
  <div className="bg-gray-50 text-gray-800">
    {/* Don't show header on About page */}
    {!showAboutPage && <Header sendDataToParent={handleDataFromChild} />}
    
    {notificationReceived && <NotificationClient />}
    
    <div className="bg-gray-50 text-gray-800">
      {renderContent()}
    </div>
    
    {/* Conditionally render footer - pass onAboutClick prop */}
    {/* {shouldShowFooter() && <Footer onAboutClick={handleAboutClick} />} */}
  </div>
);
}
export default App;