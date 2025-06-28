
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { keys } from "../../env/env";
import "./Header.css";
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux'
import { remove } from "../../features/user/userSlice";
import { ADMIN, BOOKINGS, CHECKOUT, DASHBOARD, LOGIN, PROFILE } from "../../Constants/pagesConstants";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { ChevronDown, MapPin, ShoppingCart, User } from "lucide-react";
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";

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

  const { loginWithRedirect, logout, user, isAuthenticated, isLoading , getAccessTokenSilently } = useAuth0();

  const cart = useSelector((state : any) => state.cart?.value);

   const [dropDownOpen, setdropDownOpen] = useState(false);

   console.log("User: ", user);

   useEffect(() => {
    getLocation();
    if (!isAuthenticated || isLoading || !user?.email) return;

    const triggerPostLoginAPIs = async () => {
      try {
        const token = await getAccessTokenSilently();
        console.log("Access Token:", token);
        console.log("User authenticated:", user);
        const email = user.email ?? "";

        const response = await axios.get(
          `https://utils-ndt3.onrender.com/customer/check-email?email=${encodeURIComponent(email)}`
        );
        console.log("Email check response:", response.data);
        if(response.data.exists === false){
          createUser(user)
        }
      } catch (error) {
        console.error("Error during post-login API call:", error);
      }
    };

    triggerPostLoginAPIs();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently]);

  const createUser = async (user: any) => {}

  const getLocation = async () => {
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
            console.log("Location fetched: ", address);
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
  }

  // const user = useSelector((state : any) => state.user?.value);
  const dispatch = useDispatch();

  const [location, setLocation] = useState("");
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountEl, setAccountEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [loggedInUser , setLoggedInUser] = useState();

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
  const [dataFromMap, setDataFromMap] = useState("");

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-6 md:px-20 py-4 flex items-center justify-between" style={{ height: '10%' }}>
                <div className="flex items-center space-x-2">
                    <img
                        src="logo.png"
                        alt="ServEase Logo"
                        className="h-16 w-auto max-w-[160]"
                    />
                    <span className="text-xl font-semibold text-blue-600">ServEaso</span>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center border rounded-xl px-3 py-2 bg-gray-100">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            className="bg-transparent outline-none text-sm"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className={undefined}>
                        <ShoppingCart className="w-5 h-5" />
                    </Button>
                    {!isAuthenticated ? (
       <Button variant="ghost" size="icon" className={undefined} onClick={() => loginWithRedirect()}>
       <User className="w-5 h-5" />
   </Button>
      ) : (
        <div className="relative inline-block text-left">
      <button
        onClick={() => setdropDownOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
      >
        <img
          src={user?.picture}
          alt={user?.name}
          className="w-8 h-8 rounded-full"
        />
        <span className="font-medium">{user?.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {dropDownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md z-10">
          <ul className="py-2">
            <li className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
              Profile
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            >
              Logout
            </li>
          </ul>
        </div>
      )}
      
    </div>
      )}
                    
                </div>
            </header>
    </>
  );
};
