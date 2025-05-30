/* eslint-disable @typescript-eslint/no-unused-vars */

import { Button, Box, Drawer } from "@mui/material";
import { useEffect, useState } from "react";
import Search_form from "../Search-Form/Search_form";
import "./DetailsView.css";
import axiosInstance from "../../services/axiosInstance";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import { CONFIRMATION } from "../../Constants/pagesConstants";
import ProviderDetails from "../ProviderDetails/ProviderDetails";
import { useDispatch } from "react-redux";
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

  const handleCheckoutData = (data: any) => {
    console.log("Received checkout data:", data);

    if (checkoutItem) {
      checkoutItem(data); // Send data to the parent component
    }
  };

  useEffect(() => {
    console.log("Selected ...", selected);
    setSelectedProviderType(selected || ""); // Set a default empty string if `selected` is undefined

    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        if (selected) {
          response = await axiosInstance.get(
            "api/serviceproviders/role?role=" + selected.toUpperCase()
          );
        } else {
          response = await axiosInstance.get(
            "api/serviceproviders/serviceproviders/all"
          );
        }
        setServiceProvidersData(response?.data);
        dispatch(add(response?.data))

      } catch (err) {
        console.error("There was a problem with the fetch operation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selected]);

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
    performSearch(formData); // Call the method
  };


  const performSearch = async (formData) => {
    const timeSlotFormatted = `${formData.startTime}-${formData.endTime}`;
    const housekeepingRole = selected?.toUpperCase() || "";
  
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
      const { latitude, longitude } = await getCoordinates();
  
      console.log("Latitude:", latitude, "Longitude:", longitude);
  
      const params = {
        startDate: "2025-04-01",
        endDate: "2025-04-30",
        timeslot: timeSlotFormatted,
        housekeepingRole,
        latitude,
        longitude,
      };
  
      const response = await axiosInstance.get('/api/serviceproviders/search', { params });
      console.log('Response:', response.data);
      setServiceProviderData(response.data);
    } catch (error : any) {
      console.error('Geolocation or API error:', error.message || error);
    }
  };
  

  console.log("Service Providers Data:", ServiceProvidersData);
  console.log("Service Providers Data:", serviceProviderData);

  return (
    <div className="main-container">
      <div className="search">
      <HeaderSearch onSearch={handleSearch}/>
      <PreferenceSelection /> 
      </div>
      {Array.isArray(serviceProviderData) && serviceProviderData.length > 0 ? (
      serviceProviderData.map((provider, index) => (
        <ProviderDetails  {...provider}/>
      ))
    ) : (
      <div>No Data</div> // Optional: Display something when there's no data
    )} 
    </div>  
  );
};

export default DetailsView;
