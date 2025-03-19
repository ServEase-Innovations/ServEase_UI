
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

  console.log("Cart in header ... ", cart)

  const user = useSelector((state : any) => state.user?.value);
  const dispatch = useDispatch();

  const [location, setLocation] = useState("");
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountEl, setAccountEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [loggedInUser , setLoggedInUser] = useState();

  useEffect(() => {
    setLoggedInUser(user);
    console.log("User role is:", user?.role); 
  }, [user]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `http://13.126.203.209:3000/maps/api/geocode/json`,
              {
                params: {
                  latlng: `${latitude},${longitude}`,
                  key: keys.api_key,
                },
              }
            );
            const address = response.data.results[0]?.formatted_address;
            setLocation(address);
          } catch (error) {
            console.log("Failed to fetch location");
          }
        },
        (error) => {
          console.log(error.message);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [dataFromMap, setDataFromMap] = useState("");

  const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
  const PLACES_API_URL =
    "http://13.126.203.209:3000/maps/api/place/autocomplete/json";

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

  const handleSave = () => {
    setLocation(dataFromMap);
    setOpen(false);
  };

  const handleProceedToCheckout = () => {
   sendDataToParent(CHECKOUT);
  };
  
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  function updateLocationFromMap(data: string): void {
    setDataFromMap(data);
  }

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
            <TextField
              variant="outlined"
              fullWidth
              value={location}
              onClick={handleClickOpen}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon
                      sx={{ fontSize: 30, color: "#0d6efd", cursor: "pointer" }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                width: "50%",
                "&:hover": {
                  cursor: "pointer",
                },
                cursor: "pointer",
              }}
            />
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
      </Navbar>
    </>
  );
};
