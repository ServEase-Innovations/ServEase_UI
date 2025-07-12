/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */



import { useEffect, useState } from "react";
import "./DetailsView.css";
import axiosInstance from "../../services/axiosInstance";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import { CONFIRMATION } from "../../Constants/pagesConstants";
import ProviderDetails from "../ProviderDetails/ProviderDetails";
import { useDispatch, useSelector } from "react-redux";
import { add } from "../../features/detailsData/detailsDataSlice";
import HeaderSearch from "../HeaderSearch/HeaderSearch";
import PreferenceSelection from "../PreferenceSelection/PreferenceSelection";
import axios from "axios";
import { keys } from "../../env/env";

interface DetailsViewProps {
  sendDataToParent: (data: string) => void;
  selected?: string; // Define the prop type
  checkoutItem?: (data: any) => void;
  selectedProvider?: (data: any) => void; // Optional callback
}

export const DetailsView: React.FC<DetailsViewProps> = ({
  sendDataToParent,
  selected,
  checkoutItem,
  selectedProvider,
}) => {
  const [ServiceProvidersData, setServiceProvidersData] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProviderType, setSelectedProviderType] = useState("");

  const dispatch = useDispatch();

  const location = useSelector((state: any) => {
    return state?.geoLocation?.value;
  });
  


  // console.log("Location from Redux:", location);

  console.log("HIKKERS", selectedProviderType);

  const handleCheckoutData = (data: any) => {
    console.log("Received checkout data:", data);

    if (checkoutItem) {
      checkoutItem(data); // Send data to the parent component
    }
  };

  useEffect(() => {
    performSearch();
  }, [selectedProviderType , location]);

  // useEffect(() => {
  //   console.log("Selected ...", selected);
  //   setSelectedProviderType(selected || ""); // Set a default empty string if `selected` is undefined

  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       let response;
  //       if (selected) {
  //         response = await axiosInstance.get(
  //           "api/serviceproviders/role?role=" + selected.toUpperCase()
  //         );
  //       } else {
  //         response = await axiosInstance.get(
  //           "api/serviceproviders/serviceproviders/all"
  //         );
  //       }
  //       setServiceProvidersData(response?.data);
  //       dispatch(add(response?.data))

  //     } catch (err) {
  //       console.error("There was a problem with the fetch operation:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, [selected]);

  // useEffect(() => {

  // }, [state])
  const handleBackClick = () => {
    sendDataToParent("");
  };

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const handleSearchResults = (data: any[]) => {
    setSearchResults(data);
    toggleDrawer(false); // Close the drawer after receiving results
  };

  const handleSelectedProvider = (provider: any) => {
    if (selectedProvider) {
      selectedProvider(provider); // Ensure selectedProvider is defined before calling it
    }
    sendDataToParent(CONFIRMATION);
  };

  const [searchData, setSearchData] = useState<any>();
  const [serviceProviderData, setServiceProviderData] = useState<any>();


  const handleSearch = (formData: { serviceType: string; startTime: string; endTime: string }) => {
    console.log("Search data received in MainComponent:", formData);
    setSearchData(formData); // Save data in state
    // performSearch(formData); // Call the method
  };

 
  

  const performSearch = async () => {
    // const timeSlotFormatted = `${formData.startTime}-${formData.endTime}`;
    const housekeepingRole = selected?.toUpperCase() || "cook";
  
    // Wrap geolocation in a promise
    const getCoordinates = (): Promise<{ latitude: number; longitude: number }> =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser."));
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => reject(error)
          );
        }
      });
    
  
    try {
      let latitude = 0;
let longitude = 0;

if (!location) {
  ({ latitude, longitude } = await getCoordinates());
} else {
  // console.log("Location from Redux:", JSON.stringify(location));
  latitude = location.lat;
  longitude = location.lng;
}

      
  
      console.log("Latitude:", latitude, "Longitude:", longitude);
  
      const params = {
        startDate: "2025-04-01",
        endDate: "2025-04-30",
        // timeslot: timeSlotFormatted,
        housekeepingRole,
        latitude,
        longitude,
      };
      

      const response = await axiosInstance.get(`/api/serviceproviders/search?startDate=2025-04-01&endDate=2025-04-30&timeslot=16:37-16:37&housekeepingRole=COOK&latitude=${latitude}&longitude=${longitude}`);
      console.log('Response:', response.data);
      if(response.data.length === 0) {
        setLoading(true);
      } else {
        setLoading(false);
      setServiceProviderData(response.data);
      }
    } catch (error : any) {
      console.error('Geolocation or API error:', error.message || error);
    }
  };
  

  // performSearch();



  console.log("Service Providers Data:", ServiceProvidersData);
  console.log("Service Providers Data:", serviceProviderData);

  return (
    <main className="main-container" pt-16>
      {Array.isArray(serviceProviderData) && serviceProviderData.length > 0 ? (
      serviceProviderData.map((provider, index) => (
        <div style={{paddingTop:'1%'}}>
        <ProviderDetails  {...provider}/>
        </div>
      ))
    ) : (
      <div style={{width: "100%", display: "grid", justifyContent: "center", alignItems: "center" , position:"absolute", top: "40%"}}>
        <img src="search.gif" alt="No Data" />
        <p> Search providers near you</p>
      </div> 
    )} 


      
    </main>  
  );
};

export default DetailsView;
