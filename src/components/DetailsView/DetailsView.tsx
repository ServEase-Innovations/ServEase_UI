import { CircularProgress, Button, Box } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import ServiceProvidersDetails from "../ServiceProvidersDetails/ServiceProvidersDetails";
import Search_form from "../Search-Form/Search_form";
import "./DetailsView.css";


import CloseIcon from '@mui/icons-material/Close'; 

interface ChildComponentProps {
  sendDataToParent: (data: string) => void;
}

export const DetailsView: React.FC<ChildComponentProps> = ({
  sendDataToParent,
}) => {
  const [ServiceProvidersData, setServiceProvidersData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar

  const handleBackClick = () => {
    sendDataToParent("");
  };

  const handleSearchClick = () => {
    setSidebarOpen(true); // Open sidebar when Search is clicked
  };

  const handleClose = () => {
    setOpen(false);
    setSidebarOpen(false); // Close sidebar when search form closes
  };
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); 
        const response = await fetch("http://localhost:8080/api/serviceproviders/serviceproviders/all");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setServiceProvidersData(data);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchData();
  }, []);

  return (
    <>
    {
      loading && <Box sx={{ display: 'flex' }}>
        <CircularProgress />
      </Box>
    }
    {!loading && 
    <div className="details-view">
      {/* Sidebar with conditional class for open/closed state */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      
          <Button style={{float : 'right'}} variant="outlined" onClick={() => setSidebarOpen(false)}  startIcon={<CloseIcon /> }>
        Close
      </Button>
        <Search_form open={open} selectedValue={""} onClose={handleClose} />
      </div>

      {/* Main body content */}
      <div className={`body-parser ${sidebarOpen ? 'hidden' : ''}`}>
        <header className="headers">
          <Button onClick={handleBackClick} variant="outlined">
            Back
          </Button>
          <Button variant="outlined" onClick={handleSearchClick}>
            Search
          </Button>
        </header>

        {/* List of Service Providers */}
        <div className="providers-view">
          {ServiceProvidersData.map((serviceProvider) => (
            <div className="views" key={serviceProvider.serviceproviderId}>
              <ServiceProvidersDetails {...serviceProvider} />
            </div>
          ))}
        </div>
      </div>
    </div>}
    </>
  );
};