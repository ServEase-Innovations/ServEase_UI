
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Autocomplete,
  Avatar,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  DialogContent,
  DialogActions,
  Button,
  Dialog,
  DialogTitle,
  useMediaQuery,
  useTheme,
  InputAdornment,
  Badge,
  Chip,
  Stack,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Navbar from "react-bootstrap/Navbar";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { keys } from "../../env/env";
import "./Header.css";
import { Landingpage } from "../Landing_Page/Landingpage";
import SearchIcon from "@mui/icons-material/Search";
import MapComponent from "../MapComponent/MapComponent";
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux'
import { remove } from "../../features/user/userSlice";
import { ADMIN, BOOKINGS, CHECKOUT, DASHBOARD, LOGIN, PROFILE } from "../../Constants/pagesConstants";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DialogContentText from '@mui/material/DialogContentText';
import { FaHome } from "react-icons/fa";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { FaAddressBook } from "react-icons/fa";
import { addPreferences } from "../../features/userPreferences/userPreferencesSlice";


interface ChildComponentProps {
  sendDataToParent: (data: string) => void;
}

export const Header: React.FC<ChildComponentProps> = ({ sendDataToParent }) => {
  const handleClick = (e: any) => {
    if(e === 'sign_out'){
      dispatch(remove())
      sendDataToParent("");
    } else {
      sendDataToParent(e);
    }
  };

  const cart = useSelector((state : any) => state.cart?.value);

  const user = useSelector((state : any) => state.user?.value);
  const userPreferences = useSelector((state : any) => state.userPreference?.value);
  const dispatch = useDispatch();

  const [location, setLocation] = useState<any>();
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountEl, setAccountEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [openLocationSaved, setOpenLocationSaved] = useState(false);
  const [loggedInUser , setLoggedInUser] = useState<any>();

  useEffect(() => {
    setLoggedInUser(user);
  }, [user]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json`,
              {
                params: {
                  latlng: `${latitude},${longitude}`,
                  key: keys.api_key,
                },
              }
            );
            const address = response.data.results[0]?.formatted_address;
            setLocation(address || "Location not found");
          } catch (error) {
            console.log("Failed to fetch location: ", error);
          }
        },
        (error : any) => {
          console.log("Geolocation error: ", error.message);
          setError(error.message);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);
  

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [dataFromMap, setDataFromMap] = useState<any>();

  const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
  const PLACES_API_URL =
    "https://maps.googleapis.com/maps/api/place/autocomplete/json";

  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
      setError(null);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(CORS_PROXY + PLACES_API_URL, {
          params: {
            input: inputValue,
            key: keys.api_key,
            types: "geocode",
          },
        });

        if (response.data.status === "OK") {
          const sub = response.data.predictions.map((res) => res.description);
          setSuggestions(sub);
        } else {
          setError(response.data.error_message || "An error occurred");
          setSuggestions([]);
        }
      } catch (error) {
        console.log("Failed to fetch suggestions");
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [inputValue]);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (event: React.SyntheticEvent, newValue: string) => {
    setInputValue(newValue);
  };

  const handleChange = (event: any, newValue: any) => {
    if (newValue) {
      setLocation(newValue);
    }
  };

  const handleLocationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLocationMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountEl(null);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseForSaveLocation = () => { 
    setOpenLocationSaved(false);
  }

  const handleSaveLocation = async () => {
    const plainLocation = {
      lat: dataFromMap.geometry.location.lat(),
      lng: dataFromMap.geometry.location.lng(),
    };
  
    // Construct a safe object to store in Redux
    const cleanedData = {
      ...dataFromMap,
      savedName: name,
      geometry: {
        ...dataFromMap.geometry,
        location: plainLocation,
      }
    };
    const updatedAddress = [...(userPreferences?.savedLocations || []), cleanedData];
    
    // dispatch(addPreferences({
    //   ...userPreferences,
    //   savedLocations: updatedAddress
    // }));
    

    console.log("userPreferences " , userPreferences)



    // try {
    //   const response = await axios.put("https://utils-ndt3.onrender.com/user-settings/",{
    //     customerId : userPreferences.customerId,
    //     savedLocations: updatedAddress,
    //   }).then((response) => {
    //     dispatch(addPreferences({
    //       ...userPreferences,
    //       savedLocations: updatedAddress
    //     }));
    //   } , error => {
    //     if(error.response.message === "Record not found") {
    //       // createUserPreferences(customerId);
    //     }
    //   })
    // } catch (error) {}

    // console.log("Updated Address:", updatedAddress);
    // console.log("userpreferences", userPreferences);
  
    
  };
  

  const handleCloseLocationSaved = () => {
    setOpenLocationSaved(false);
  }

  const handleSave = () => {
    if(loggedInUser && loggedInUser.role === "CUSTOMER") {
      console.log("Location saved:", dataFromMap);
      setOpenLocationSaved(true);
    }
    setLocation(dataFromMap.formatted_address);
    setOpen(false);
  };

  const handleProceedToCheckout = () => {
   sendDataToParent(CHECKOUT);
  };
  
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  function updateLocationFromMap(data: any): void {
    setDataFromMap(data);
  }

  const [name, setName] = useState("");

  const homeclick = (eventName : string) => {
    setName(eventName)
  }

  const handleTextChange  = (event) => {
    setName(event.target.value);
  };

  return (
    <>
      <Navbar className="header" expand="lg">
        <div className="header-alignment">
          <div className="logo-container">
            <img
              src="../pic2.png"
              className="logo-style"
              alt="logo"
              onClick={() => handleClick("")}
              style={{ cursor: "pointer" }}
            />
            <div className="logo-text">
              <span className="servease-text">ServEaso</span>
            </div>
          </div>

          <div className="dropdowns-container">
          <div style={{
  position: 'relative',
  width: '50%',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'white',
  border: `1px solid ${location ? '#0d6efd' : '#ccc'}`,
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'border-color 0.3s ease',

}} onClick={handleClickOpen}>
  <LocationOnIcon style={{
    marginLeft: '8px',
    fontSize: '30px',
    color: '#0d6efd'
  }} />
  <input
    type="text"
    value={location}
    readOnly
    style={{
      width: '100%',
      border: 'none',
      outline: 'none',
      padding: '12px',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      color:  'inherit'
    }}
    placeholder="Select location"
  />
</div>
       <IconButton onClick={handleProceedToCheckout}>
  <Badge badgeContent={cart?.selecteditem?.length ? cart?.selecteditem?.length : 0} color="primary">
    <ShoppingCartIcon color="action" />
  </Badge>
</IconButton>
            <IconButton
  size="large"
  edge="end"
  aria-label="account"
  onClick={handleAccountMenuOpen}
  color="inherit"
  sx={{
    width: 40, // Size of the button
    height: 40,
    borderRadius: '50%', // Circular shape
    padding: 0, // Remove default padding
    overflow: 'hidden', // Ensure image stays within the circle
    display: 'flex', // Center image within the button
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Optional background color
  }}
>
  {/* Conditionally render profile picture or icon */}
  {user && (user.customerDetails?.profilePic || user.serviceProviderDetails?.profilePic) ? (
    <img
      src={user.customerDetails?.profilePic || user.serviceProviderDetails?.profilePic}
      alt="account"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover', // Ensures the image covers the entire button
      }}
    />
  ) : (
    <AccountCircle sx={{ fontSize: 30, color: "#0d6efd" }} />
  )}
</IconButton>


            <Menu
              id="menu-appbar"
              anchorEl={accountEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(accountEl)}
              onClose={handleAccountMenuClose}
            >
              {!user && (
    <MenuItem
      onClick={() => {
        handleClick(LOGIN);
        handleAccountMenuClose();
      }}
    >
      Login / Register
    </MenuItem>
  )}
  {!user && (
    <MenuItem
      onClick={() => {
        handleClick(LOGIN);
        handleAccountMenuClose();
      }}
    >
      Contact Us
    </MenuItem>
  )}
              {/* <MenuItem onClick={handleAccountMenuClose}>Privacy Policy</MenuItem>
              <MenuItem onClick={handleAccountMenuClose}>Notification</MenuItem> */}
              {user && ( <MenuItem
                onClick={() => {
                  handleClick(PROFILE);
                  handleAccountMenuClose();
                }}
              >
                Profile
              </MenuItem> )}
              {user?.role === "CUSTOMER" && ( 
             <MenuItem
              onClick={() => {
             handleClick(BOOKINGS);
             handleAccountMenuClose();
            }}
            >
            Bookings
            </MenuItem> 
            )}

              {user?.role==="SERVICE_PROVIDER"&& ( <MenuItem
                onClick={() => {
                  handleClick(DASHBOARD);
                  handleAccountMenuClose();
                }}
              >
                DASHBOARD
              </MenuItem> )}
              {user && ( <MenuItem
                onClick={() => {
                  handleClick("sign_out");
                  handleAccountMenuClose();
                }}
              >
                Sign Out
              </MenuItem> )}
              <MenuItem
                onClick={() => {
                  handleClick(ADMIN);
                  handleAccountMenuClose();
                }}
              >
                Admin - For Demo purpose Only
              </MenuItem>
            </Menu>
          </div>
        </div>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Set Location</DialogTitle>
          <DialogContent
            sx={{ p: 0, display: "flex", flexDirection: "column", width: "600px" }}
          >
            <div style={{ height: "400px", width: "100%" }}>
              <MapComponent
                style={{ height: "100%", width: "100%" }}
                onLocationSelect={updateLocationFromMap}
              />
            </div>
          </DialogContent>

          <DialogActions sx={{ padding: "10px" }}>
            <Button color="primary" onClick={handleClose}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSave}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
        
        <Dialog
        fullScreen={fullScreen}
        open={openLocationSaved}
        onClose={handleCloseLocationSaved}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Save Location ?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
          <Stack direction="row" spacing={1} display={'block'}>
           <div> Address : {dataFromMap?.formatted_address}</div> 
           <br/>
          <Chip icon={<FaHome />} label="Home" color="primary" variant="outlined" clickable onClick={e => homeclick("Home")}/>
          <Chip icon={<HiOutlineBuildingOffice />} label="Office" color="primary" variant="outlined" clickable onClick={e => homeclick("Office")}/>
          <Chip icon={<FaAddressBook />} label="Others" color="primary" variant="outlined" clickable onClick={e => homeclick("Others")}/>
          </Stack>
          <br/>
          <TextField id="standard-basic" label="Location Name" variant="outlined" value={name} onChange={handleTextChange}/>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseForSaveLocation}>
            Disagree
          </Button>
          <Button onClick={handleSaveLocation} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      </Navbar>
    </>
  );
};
