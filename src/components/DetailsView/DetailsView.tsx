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

  return (
    <>
      {loading ? (
        <Box sx={{ display: "flex" }}>
          <LoadingIndicator />
        </Box>
      ) : (
        <div className="details-view-container">
          {/* Material-UI Drawer */}
          <Drawer anchor="right" open={drawerOpen} onClose={() => toggleDrawer(false)}>
            <Box sx={{ width: 300, padding: 2, position: "relative" }}>
              {/* Close button styled to appear at the top-right corner */}
              <Button
                variant="outlined"
                onClick={() => toggleDrawer(false)}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                }}
              >
                Close
              </Button>
              <Search_form
                open={drawerOpen}
                selectedValue={selectedProviderType} // Pass the selectedProviderType here
                onClose={() => toggleDrawer(false)}
                onSearch={handleSearchResults}
              />
            </Box>
          </Drawer>

          {/* Main Content */}
          <div className="main-content">
            <>
              <header className="headers">
                <Button onClick={handleBackClick} variant="outlined">
                  Back
                </Button>
                <Button variant="outlined" onClick={() => toggleDrawer(true)}>
                  Search
                </Button>
              </header>

              <div className="providers-view">
                {(searchResults.length > 0 ? searchResults : ServiceProvidersData).map(
                  (provider) => (
                    <div className="views" key={provider.serviceproviderId}>
                      <ProviderDetails
                        {...provider}
                        selectedProvider={handleSelectedProvider}
                      />
                    </div>
                  )
                )}
              </div>
            </>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailsView;
