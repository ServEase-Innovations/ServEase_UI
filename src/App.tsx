/* eslint-disable @typescript-eslint/no-unused-vars */

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
import AddToCart from "./components/add/AddToCart";
import New from "./components/add/New";
import AgentRegistrationForm from "./components/Registration/AgentRegistrationForm";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector
import { add } from "./features/pricing/pricingSlice";
import ServiceProviderDashboard from "./components/DetailsView/ServiceProviderDashboard";
import { RootState } from './store/userStore'; 
import NotificationButton from "./components/NotificationButton";

function App() {
  const [selection, setSelection] = useState<string | undefined>(); 
  const [handleDropDownValue, setDropDownValue] = useState<string | undefined>(); 
  const [checkoutData, setCheckoutData] = useState<any>();
  const [selectedBookingType, setSelectedBookingType] = useState<string | undefined>();
  const [serviceProviderDetails, setServiceProvidersData] = useState<string | undefined>();
  const selectedBookingTypeValue = { selectedBookingType, setSelectedBookingType };
  const dispatch = useDispatch();

type UserState = {
  value?: {
    role?: string;
    customerDetails?: any;
  } | null;
};

// Extract user data from Redux with correct type
const user = useSelector((state: RootState) => state.user as UserState);

// Ensure `value` is not null before accessing `role`
const userRole = user?.value?.role ?? "No Role";
console.log("Logged-in user role:", userRole);

if (userRole === "CUSTOMER") {
  console.log("User is a Customer");
} else if (userRole === "SERVICE_PROVIDER") {
  console.log("User is a Service Provider");
} else {
  console.log("User role is unknown");
}

  const handleDataFromChild = (e: string) => {
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

  useEffect(() => {
    getPricingData();
  });

  const getPricingData = () => {
    axios.get('http://localhost:3000/records').then(function (response) {
      console.log(response.data);
      dispatch(add(response.data));
    }).catch(function (error) { console.log(error) });
  };

  const renderContent = () => {
    
    if (!selection) {
      return <ServiceProviderContext.Provider value={selectedBookingTypeValue}>
        <Landingpage sendDataToParent={handleDataFromChild} bookingType={handleSelectedBookingType} />
      </ServiceProviderContext.Provider>;
    } else if (selection) {
      if (selection === DETAILS) {
        return <DetailsView selected={selectedBookingType} sendDataToParent={handleDataFromChild} selectedProvider={handleSelectedProvider} />;
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
        return <ServiceProviderDashboard />;
      }
       else if (selection === PROFILE) {
        return <UserProfile goBack={() => { throw new Error("Function not implemented."); }} />;
      } else if (selection === ADMIN) {
        console.log("I am in admin");
        return <Admin />;
      }
    }
  };
  

  return (
    <div className="App">
      <div className="header-class">
        <Header sendDataToParent={handleDataFromChild} />
      </div>
     {/* <ServiceProviderDashboard />  */}
       <section className="flex-grow flex justify-center items-center py-6 relative">
        {renderContent()}
        {/* <NotificationButton /> */}
      </section>
      <footer className="footer-container">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
