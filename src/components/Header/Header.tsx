/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
  Badge,
  IconButton,
  TextField,
} from "@mui/material";
import React, { useState, useEffect, useReducer, useRef } from "react";
import axios from "axios";
import { keys } from "../../env/env";
import "./Header.css";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { remove } from "../../features/user/userSlice";
import { selectCartItemCount } from "../../features/addToCart/addToSlice";
import {
  ADMIN,
  BOOKINGS,
  CHECKOUT,
  DASHBOARD,
  LOGIN,
  PROFILE,
} from "../../Constants/pagesConstants";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { ChevronDown, MapPin, ShoppingCart, User } from "lucide-react";
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";
import MapComponent from "../MapComponent/MapComponent";
import { get } from "http";
import { CartDialog } from "../AddToCart/CartDialog";
import { FaHome } from "react-icons/fa";
import { HiBuildingOffice } from "react-icons/hi2";
import { FaLocationArrow } from "react-icons/fa";
import { add } from "../../features/geoLocation/geoLocationSlice";
import { ClipLoader } from 'react-spinners';
interface ChildComponentProps {
  sendDataToParent: (data: string) => void;
}

export const Header: React.FC<ChildComponentProps> = ({ sendDataToParent }) => {
  const handleClick = (e: any) => {
    if (e === "sign_out") {
      dispatch(remove());
      sendDataToParent("");
    } else {
      sendDataToParent(e);
    }
  };

  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const cart = useSelector((state: any) => state.cart?.value);
   const dropdownRef = useRef<HTMLDivElement>(null); 
  const [dropDownOpen, setdropDownOpen] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setdropDownOpen(false); // Close dropdown if clicked outside
    }
  };

  // Attach the listener when dropdown is open
  if (dropDownOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  // Clean up the listener
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [dropDownOpen]); // Only re-run if dropDownOpen changes

useEffect(() => {
  const run = async () => {
    // Step 1: Get location first
    await getLocation();

    // Step 2: Auth checks
    if (!isAuthenticated || isLoading || !user?.email) return;

    try {
      // Step 3: Get token
      const token = await getAccessTokenSilently();
      console.log("Access Token:", token);
      console.log("User authenticated:", user);

      const email = user.email ?? "";

      // Step 4: Check email (this must finish before moving on)
      const response = await axios.get(
        `https://utils-ndt3.onrender.com/customer/check-email?email=${encodeURIComponent(email)}`
      );
      console.log("Email check response:", response.data);
      console.log("User role:", response.data.user_role);
      // Step 5: Conditional next steps
      if (!response.data.user_role) {
        await createUser(user);
        // await getCustomerPreferences(user.customerid);
      } else if (response.data.user_role === "SERVICE_PROVIDER") {
        user.role = "SERVICE_PROVIDER";
        user.serviceProviderId = response.data.id;
      } else if (response.data.user_role === "CUSTOMER") {
        user.role = "CUSTOMER";   
        user.customerid = response.data.id;
        await getCustomerPreferences(Number(response.data.id));
      }

      // Step 6: Anything else AFTER both API calls
      console.log("Updated user object with role:", user);
      console.log("Post-login steps complete ✅");

    } catch (error) {
      console.error("Error during post-login API call:", error);
    }
  };

  run();
}, [isAuthenticated, isLoading, user, getAccessTokenSilently]);



  const [userPreference, setUserPreference] = useState<any>([]);

  // const createUser = async (user: any) => {};
  const createUser = async (user: any) => {
  try {
 
    const userData = {
      firstName: user.given_name || user.name.split(' ')[0] || 'User', // Fallback to 'User' if no first name
      lastName: user.family_name || user.name.split(' ')[1] || '', // Empty string if no last name
      emailId: user.email,
      password: "password" 
    };

    console.log("Creating user with data:", userData);

    
    const response = await axios.post(
      "https://servease-be-5x7f.onrender.com/api/customer/add-customer-new",
      userData
    );

    console.log("User creation response:", response.data);

  
    if (response.data && response.data.id) {
      const customerId = Number(response.data.id);
      user.customerid = customerId;
      await getCustomerPreferences(customerId);
    } else {
      console.warn("Unexpected response format:", response.data);
    }
  } catch (error) {
    console.error("Error creating user:", error);
   
  }
};

  const getCustomerPreferences = async (customerId: number) => {
    try {
       setLoadingLocations(true);
      const response = await axios.get(`https://utils-ndt3.onrender.com/user-settings/${customerId}`);
      console.log("Response from user settings API:", response.data);
    
      if (response.status === 200) {
        console.log("Customer preferences fetched successfully:", response.data);

        setUserPreference(response.data);
        if (user) {
          user.customerid = customerId; // Update user object with customerId
        }

        console.log("Updated user object with customerId:", user);
        const baseSuggestions = [
          { name: "Detect Location", index: 1 },
          { name: "Add Address", index: 2 },
        ];
        const savedLocationSuggestions = response.data[0].savedLocations.map((loc, i) => ({
          name: loc.name,
          index: i + 3,
        }));
  
        setSuggestions([...baseSuggestions, ...savedLocationSuggestions]);
      }
    }  catch (error: any) {
    if (error.response?.status === 404) {
      createUserPreferences(customerId);
    } else {
      console.error("Unexpected error fetching user settings:", error);
    }
  } finally {
    setLoadingLocations(false); // End loading regardless of success/failure
  }
}

  const createUserPreferences = async (customerId: number) => {
    if (user) {
      user.customerid = customerId; // Ensure user object has customerId
    }
    try {
      const payload : any = {
        customerId,
        savedLocations: [],
      };

      console.log("Creating user preferences with payload:", payload);
    
      const response = await axios.post("https://utils-ndt3.onrender.com/user-settings", payload);
    
      // Optionally check response before setting state
      if (response.status === 200 || response.status === 201) {
        setUserPreference(payload);
      } else {
        console.warn("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
    
  }

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
        (error: any) => {
          console.log("Geolocation error: ", error.message);
          setError(error.message);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  // const user = useSelector((state : any) => state.user?.value);
  const dispatch = useDispatch();

  const [location, setLocation] = useState<any>("");
  const [locationAs, setLocationAs] = useState("");
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountEl, setAccountEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState();
  const [cartOpen, setCartOpen] = useState(false); 
  const [OpenSaveOptionForSave , setOpenSaveOptionForSave] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const handleCartOpen = () => setCartOpen(true);
  const handleCartClose = () => setCartOpen(false);
  const totalCartItems = useSelector(selectCartItemCount);
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
        (error: any) => {
          console.log("Geolocation error: ", error.message);
          setError(error.message);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  const [suggestions, setSuggestions] = useState([
    { name: "Detect Location", index: 1 },
    { name: "Add Address", index: 2 },
  ]);
  const [dataFromMap, setDataFromMap] = useState<{ formatted_address: string }[]>([]);

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

 

  const handleChange = (newValue: any) => {
    if (newValue === "Add Address") {
      setOpen(true);
    } else if (newValue === "Detect Location") {
      getLocation();
    } else {
      console.log("➡️ Selected Location:", newValue);
      console.log("🗂️ User Preferences:", JSON.stringify(userPreference, null, 2));
      const loc = userPreference[0]?.savedLocations.find(
  (location: any) =>
    location.name?.toLowerCase() === newValue.toLowerCase()
);
      if (loc?.location?.formatted_address) {
        console.log("Location from user preference: ", loc.location.formatted_address);
        setLocation(loc.location.formatted_address);
        dispatch(add(loc));
      } else {
        console.warn("No matching location found for:", newValue);
      }
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
    if (!dataFromMap) {
      console.error("No location data selected from map");
      return;
    } 
    setLocation(dataFromMap[0]?.formatted_address || "Location not found");
    setOpen(false);
    setOpenSaveOptionForSave(true);
  };

  const locationHandleSave = () => {
    console.log("Location saved as:", locationAs);
    console.log("user preference ", userPreference)

    updateUserSetting()

  }

  const updateUserSetting = async () => {
    if (!user || !locationAs || !dataFromMap ) {
      console.error("Missing required data to update user setting.");
      return;
    }
  
    const newLocation = {
      name: locationAs,
      location: dataFromMap[0],
    };
  
    // Safely extract existing savedLocations from state
    const existingLocations =
      Array.isArray(userPreference?.savedLocations) ? userPreference.savedLocations : [];
  
    const updatedLocations = [...existingLocations, newLocation];
  
    const payload = {
      customerId: user.customerid,
      savedLocations: updatedLocations,
    };
  
    try {
      const response = await axios.put(
        `https://utils-ndt3.onrender.com/user-settings/${user.customerid}`,
        payload
      );
  
      if (response.status === 200 || response.status === 201) {
        setUserPreference({ customerId: user.customerid, savedLocations: updatedLocations });
        setOpenSaveOptionForSave(false);
        setLocationAs("");
  
        const baseSuggestions = [
          { name: "Detect Location", index: 1 },
          { name: "Add Address", index: 2 },
        ];
        const savedLocationSuggestions = updatedLocations.map((loc, i) => ({
          name: loc.name,
          index: i + 3,
        }));
  
        setSuggestions([...baseSuggestions, ...savedLocationSuggestions]);
      } else {
        console.warn("Unexpected response while updating user settings:", response);
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
    }
  };
  
  
  const handleProceedToCheckout = () => {
    sendDataToParent(CHECKOUT);
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  function updateLocationFromMap(data: any): void {
    console.log("Location selected from map: ", data);
    console.log("Data from map: ", data[0].formatted_address);
    setDataFromMap(data);
  }

  const handleUserPreference = (preference? : string) => {

    if(!preference) {
      setShowInput(true) ;
      setLocationAs(locationAs);
    } else {
      setShowInput(false) ;
      setLocationAs(preference);
    } 
  }

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
<header
  className="fixed top-0 left-0 right-0 z-50 shadow-sm px-4 md:px-6 py-2 md:py-4 flex items-center justify-between bg-gradient-to-r from-[#0a2a66] to-[#004aad]"
  style={{ height: "10%" }}
>
  {/* Logo Section */}
  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleClick("")}>
    {/* Mobile logo */}
<img
  src="NewLogoDesing.png"
  alt="ServEase Logo"
  className="h-[7.5rem] w-auto md:hidden"
/>

    {/* Tablet logo */}
<img
  src="NewLogoDesing.png"
  alt="ServEase Logo"
  className="hidden md:block lg:hidden h-[9rem] w-auto max-w-[200px]"
/>
    {/* Desktop logo */}
    <img
      src="NewLogoDesing.png"
      alt="ServEase Logo"
      className="hidden lg:block h-48 w-auto max-w-[340px]"
      //className="hidden h-48 w-auto max-w-[340px]"
    />
  </div>

  {/* Right Side Content */}
  <div className="flex items-center gap-2 md:gap-4">
    {/* Location Bar */}
    <div className="flex items-center border rounded-xl px-2 md:px-3 py-1 md:py-2 bg-gray-100 w-[140px] sm:w-[180px] md:w-[240px] lg:w-64">
      <MapPin className="w-4 h-4 text-gray-500 mr-2" />
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onFocus={() => setShowDropdown(true)}
          onClick={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="bg-transparent outline-none text-xs md:text-sm w-full px-1"
        />
        {showDropdown && (
          <ul className="absolute z-50 bg-white border rounded shadow-md mt-1 w-full max-h-60 overflow-y-auto text-xs md:text-sm">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleChange("Detect Location");
                setShowDropdown(false);
              }}
            >
              Detect Location
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleChange("Add Address");
                setShowDropdown(false);
              }}
            >
              Add Address
            </li>
            {loadingLocations ? (
              <li className="px-4 py-2 text-gray-500 flex items-center justify-center gap-2">
                <ClipLoader size={15} color="#6b7280" />
                Loading...
              </li>
            ) : (
              suggestions
                .filter((s) => s.index > 2)
                .map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      handleChange(suggestion.name);
                      setShowDropdown(false);
                    }}
                  >
                    {suggestion.name}
                  </li>
                ))
            )}
          </ul>
        )}
      </div>
    </div>

    {/* Cart */}
    <Badge badgeContent={totalCartItems} color="primary">
      <Button variant="ghost" size="icon" className="bg-white rounded-full shadow" onClick={handleCartOpen}>
        <ShoppingCart className="w-5 h-5" />
      </Button>
    </Badge>

    {/* User / Auth */}
    {!isAuthenticated ? (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => loginWithRedirect()}
      >
        <User className="w-5 h-5" />
      </Button>
    ) : (
      <div className="relative inline-block text-left">
        <button
          onClick={() => setdropDownOpen((prev) => !prev)}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          <img
            src={user?.picture}
            alt={user?.name}
            className="w-6 h-6 md:w-8 md:h-8 rounded-full"
          />
          <span className="font-medium hidden sm:inline">{user?.name}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {dropDownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-40 md:w-48 bg-white border rounded-lg shadow-md z-10"
          >
            <ul className="py-2 text-sm">
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleClick(PROFILE)}
              >
                Profile
              </li>
              {user?.role === "CUSTOMER" && (
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleClick(BOOKINGS)}
                >
                  My Booking
                </li>
              )}
              {user?.role === "SERVICE_PROVIDER" && (
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleClick(DASHBOARD)}
                >
                  Dashboard
                </li>
              )}
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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

      <Dialog open={open} onClose={handleClose} >
        <DialogTitle>Set Location</DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            width: "600px",
          }}
        >
          <div style={{ height: "400px", width: "100%" }}>
            <MapComponent
              style={{ height: "100%", width: "100%" }}
              onLocationSelect={updateLocationFromMap}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ padding: "10px" }}>
          <Button color="primary" onClick={handleClose} className={undefined}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave} className={undefined}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={OpenSaveOptionForSave} onClose={handleClose} >
        <DialogTitle>Save As</DialogTitle>
        <DialogContent>
          <div >
            <div> 
              Save As : 
            </div>
            <Button startIcon={<FaHome />} className={undefined} onClick={() => {handleUserPreference("home") }}>
    Home
  </Button>
  <Button startIcon={<HiBuildingOffice />} className={undefined} onClick={() => {handleUserPreference("Office")}}>
    Office
  </Button>
  <Button startIcon={<FaLocationArrow />} className={undefined} onClick={() => {handleUserPreference()}}>
    Others
  </Button>

          </div>
          {showInput && (
            <TextField
              id="standard-basic"
              label="Enter Location Name"
              variant="standard"
              fullWidth
              onChange={(e) => setLocationAs(e.target.value)}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ padding: "10px" }}>
          <Button color="primary" onClick={handleClose} className={undefined}>
            Cancel
          </Button>
          <Button color="primary" onClick={locationHandleSave} className={undefined}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
       <CartDialog 
        open={cartOpen} 
        handleClose={handleCartClose}
        handleCheckout={() => {
          handleCartClose();
          sendDataToParent(CHECKOUT); // Only navigate on checkout button click
        }}
      />
    </>
  );
};