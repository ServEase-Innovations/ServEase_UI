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
import { ADMIN, BOOKINGS, CHECKOUT, CONFIRMATION, DETAILS, LOGIN, PROFILE } from "./Constants/pagesConstants";
import { ServiceProviderContext } from "./context/ServiceProviderContext";
import AddToCart from "./components/add/AddToCart";
import New from "./components/add/New";
import AgentRegistrationForm from "./components/Registration/AgentRegistrationForm";
import axios from "axios";
import { useDispatch } from "react-redux";
import { add } from "./features/pricing/pricingSlice";
import { NotificationContainer } from 'react-notifications';


function App() {
  const [selection, setSelection] = useState<string | undefined>(); // State to manage selections
  const [handleDropDownValue, setDropDownValue] = useState<
    string | undefined
  >(); // Fixed typo
  const [checkoutData, setCheckoutData] = useState<any>();
  const [selectedBookingType, setSelectedBookingType] = useState<
    string | undefined
  >(); // Fixed typo
  const [serviceProviderDetails , setServiceProvidersData ] = useState<string | undefined>();
  const selectedBookingTypeValue = {selectedBookingType, setSelectedBookingType};

  const dispatch = useDispatch();

  // Function to handle child component communication
  const handleDataFromChild = (e: string) => {
    console.log("data from child ==> ", e)
    setSelection(e); // Update selection based on child component's input
  };

  const handleCheckoutItems = (item: any) => {
    console.log("checkout Item => ", item);
    setCheckoutData(item); // Save the checkout data
  };

  const getSelectedFromDropDown = (e: string) => {
    setSelection(undefined);
    setCheckoutData(undefined); // Reset selection on dropdown change
    setDropDownValue(e);
  };

  const handleSelectedBookingType = (e: string) => {
    console.log("Selected booking type:", e);
    setSelectedBookingType(e); // Update selected booking type
  };

  const handleSelectedProvider = (e : any) =>{
    console.log(e)
    setServiceProvidersData(e);
  }

  useEffect(() =>{
    getPricingData();
  })

  
  const getPricingData = () =>{
    axios.get('http://3.110.168.35:3000/records').then(function (response) {
      console.log(response.data)
      dispatch(add(response.data))
    }).catch(function (error) {console.log(error)})

  }

  // Render content based on different conditions
  const renderContent = () => {
    if(!selection){
      return <ServiceProviderContext.Provider  value={selectedBookingTypeValue}>
      <Landingpage
        sendDataToParent={handleDataFromChild}
        bookingType={handleSelectedBookingType}
      />
      </ServiceProviderContext.Provider>
    } else if(selection){
      if(selection === DETAILS){
        return <DetailsView
          selected={selectedBookingType}
          sendDataToParent={handleDataFromChild}
          selectedProvider={handleSelectedProvider}
      />
      }else if(selection === CONFIRMATION){
        console.log("seleced details -> ",serviceProviderDetails )
        return <Confirmationpage role={selectedBookingType} providerDetails={serviceProviderDetails} sendDataToParent={handleDataFromChild}/>
      } else if(selection === CHECKOUT){
        return <Checkout providerDetails={serviceProviderDetails}/>
      }else if(selection === LOGIN){
          return (
        <div className="w-full max-w-4xl h-[75%]">
          <Login sendDataToParent={handleDataFromChild}/>
        </div>
      );
      } else if (selection === BOOKINGS) {
          return <Booking />;
        }else if(selection === PROFILE){
      return <UserProfile goBack={function (): void {
        throw new Error("Function not implemented.");
      } }/>
    }
    else if (selection === ADMIN) {
      console.log("i am in admin")
      return <Admin />;
    }
    }
    
  };

  return (
    <div className="App">
      <div className="header-class">
        <Header sendDataToParent={handleDataFromChild} />
      </div>
{/* 
      <AddToCart/> */}
      {/* <New/> */}
      <section className="flex-grow flex justify-center items-center px-4 py-6 relative">
        {renderContent()}
      </section>
      {/* <Checkout /> */}
      {/* <AgentRegistrationForm /> */}
      {/* <footer className="footer-container">
        <Footer />
      </footer>  */}
      <NotificationContainer />
    </div>
  );
}

export default App;


