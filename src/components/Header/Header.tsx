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
  CircularProgress,
  Alert,
  Snackbar,
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
  DASHBOARD,
  DETAILS,
  LOGIN,
  PROFILE,
} from "../../Constants/pagesConstants";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Bell, ChevronDown, MapPin, ShoppingCart, User, X } from "lucide-react";
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";
import MapComponent from "../MapComponent/MapComponent";
import { get } from "http";
import { CartDialog } from "../AddToCart/CartDialog";
import { FaHome } from "react-icons/fa";
import { HiBuildingOffice } from "react-icons/hi2";
import { FaLocationArrow } from "react-icons/fa";
import { add } from "../../features/geoLocation/geoLocationSlice";
import { ClipLoader } from "react-spinners";
import AboutUs from "../AboutUs/AboutUs";
import BookingDialog from "../BookingDialog/BookingDialog";
import { Dayjs } from "dayjs";
import CookServicesDialog from "../ProviderDetails/CookServicesDialog";
import MaidServiceDialog from "../ProviderDetails/MaidServiceDialog";
import NannyServicesDialog from "../ProviderDetails/NannyServicesDialog";
import utilsInstance from "src/services/utilsInstance";
import { useAppUser } from "src/context/AppUserContext";
import { add as addBooking } from "../../features/bookingType/bookingTypeSlice";
import NotificationsDialog from "../Notifications/NotificationsPage";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
interface ChildComponentProps {
  sendDataToParent: (data: string, type?: string) => void; // Add optional type parameter
  bookingType: string;
  onAboutClick: () => void;
  onContactClick: () => void;
  onLogoClick: () => void;
}

export const Header: React.FC<ChildComponentProps> = ({
  sendDataToParent,
  bookingType,
  onAboutClick,
  onContactClick,
  onLogoClick,
}) => {
  const handleClick = (e: any) => {
    if (e === "sign_out") {
      dispatch(remove());
      sendDataToParent(""); // Only one argument
    } else if (e === "ABOUT") {
      onAboutClick();
    } else if (e === "CONTACT") {
      onContactClick();
    } else if (e === "") {
      onLogoClick();
    } else {
      sendDataToParent(e); // Only one argument
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

  const { setAppUser } = useAppUser();
   const { appUser } = useAppUser();

  const cart = useSelector((state: any) => state.cart?.value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropDownOpen, setdropDownOpen] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
        const response = await utilsInstance.get(
          `/customer/check-email?email=${encodeURIComponent(email)}`
        );
        console.log("Email check response:", response.data);
        console.log("User role:", response.data.user_role);
        // Step 5: Conditional next steps
        if (!response.data.user_role) {
          await createUser(user);
          // await getCustomerPreferences(user.customerid);
        } else if (response.data.user_role === "SERVICE_PROVIDER") {
          setAppUser({
            ...user,
            role: "SERVICE_PROVIDER",
            serviceProviderId: response.data.id,
          });
        } else if (response.data.user_role === "CUSTOMER") {
          setAppUser({
            ...user,
            role: "CUSTOMER",
            customerid: response.data.id,
          });
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
        firstName: user.given_name || user.name.split(" ")[0] || "User", // Fallback to 'User' if no first name
        lastName: user.family_name || user.name.split(" ")[1] || "", // Empty string if no last name
        emailId: user.email,
        password: "password",
      };

      console.log("Creating user with data:", userData);

      const response = await axios.post(
        "https://servease-be-5x7f.onrender.com/api/customer/add-customer-new",
        userData
      );

      console.log("User creation response:", response.data);

      if (response.data && response.data.id) {
        const customerId = Number(response.data.id);
        setAppUser({
          ...user,
          role: "CUSTOMER",
          customerid: response.data.id,
        });
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
      const response = await utilsInstance.get(`/user-settings/${customerId}`);
      console.log("✅ Response from user settings API:", response.data);

      if (response.status === 200) {
        console.log("✅ Customer preferences fetched successfully:", response.data);

        setUserPreference(response.data);
        if (user) {
          user.customerid = customerId; // Update user object with customerId
          setAppUser({
            ...user,
            role: "CUSTOMER",
            customerid: customerId,
          });
        }

        console.log("✅ Updated user object with customerId:", user);
        
        // Ensure response.data has the correct structure
        const baseSuggestions = [
          { name: "Detect Location", index: 1 },
          { name: "Add Address", index: 2 },
        ];
        
        // Check if response.data is an array and has savedLocations
        const savedLocations = Array.isArray(response.data) && response.data[0]?.savedLocations 
          ? response.data[0].savedLocations 
          : [];
        
        console.log("📌 Saved locations from API:", savedLocations);
        
        const savedLocationSuggestions = savedLocations.map((loc: any, i: number) => ({
          name: loc.name,
          index: i + 3,
        }));

        console.log("📌 Updated suggestions:", [...baseSuggestions, ...savedLocationSuggestions]);
        setSuggestions([...baseSuggestions, ...savedLocationSuggestions]);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log("🔄 Creating new user preferences...");
        createUserPreferences(customerId);
      } else {
        console.error("❌ Unexpected error fetching user settings:", error);
      }
    } finally {
      setLoadingLocations(false); // End loading regardless of success/failure
    }
  };

  const createUserPreferences = async (customerId: number) => {
    if (user) {
      // user.customerid = customerId; // Ensure user object has customerId
      setAppUser({
        ...user,
        role: "CUSTOMER",
        customerid: customerId,
      });
    }
    try {
      const payload: any = {
        customerId,
        savedLocations: [],
      };

      console.log("Creating user preferences with payload:", payload);

      const response = await utilsInstance.post("/user-settings", payload);

      // Optionally check response before setting state
      if (response.status === 200 || response.status === 201) {
        setUserPreference(payload);
        
        // Initialize suggestions with empty saved locations
        const baseSuggestions = [
          { name: "Detect Location", index: 1 },
          { name: "Add Address", index: 2 },
        ];
        setSuggestions(baseSuggestions);
      } else {
        console.warn("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  };

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
            dispatch(add(response.data.results[0]));
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
  const [OpenSaveOptionForSave, setOpenSaveOptionForSave] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [dialogOpenState, setDialogOpenState] = useState(false); // Changed variable name
  const [dialogServiceState, setDialogServiceState] = useState("");
  const [selectedOption, setSelectedOption] = useState("Date");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedRadioButtonValue, setSelectedRadioButtonValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // Ref to close dropdown when clicked outside
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
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
            dispatch(add(response.data.results[0]));
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
  const [dataFromMap, setDataFromMap] = useState<any>([]);

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

  const handleCheckout = () => {
    console.log("Checkout");
    handleCartClose();
  };

  // FIXED: Updated handleChange function
  const handleChange = (newValue: any) => {
    console.log("➡️ New Value Selected:", newValue);
    
    if (newValue === "Add Address") {
      setOpen(true);
    } else if (newValue === "Detect Location") {
      getLocation();
    } else {
      console.log("➡️ Selected Saved Location:", newValue);
      console.log("🗂️ User Preferences:", userPreference);
      
      // Check if userPreference has data
      if (!userPreference || userPreference.length === 0) {
        console.error("userPreference is empty or undefined");
        return;
      }
      
      // Check if savedLocations exists
      if (!userPreference[0]?.savedLocations || userPreference[0]?.savedLocations.length === 0) {
        console.error("No saved locations found in userPreference");
        return;
      }
      
      // Find the location - use exact match first, then case-insensitive
      const savedLocation = userPreference[0].savedLocations.find(
        (location: any) => location.name === newValue
      ) || userPreference[0].savedLocations.find(
        (location: any) => location.name?.toLowerCase() === newValue.toLowerCase()
      );
      
      if (savedLocation?.location?.address?.[0]?.formatted_address) {
        console.log("✅ Found location:", savedLocation.location.address[0].formatted_address);
        console.log("Full location data:", savedLocation.location);
        setLocation(savedLocation.location.address[0].formatted_address);
        dispatch(add(savedLocation.location));
      } else {
        console.warn("❌ No matching location found for:", newValue);
        console.log("Available saved locations:", userPreference[0].savedLocations);
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
    setOpenSaveOptionForSave(false);
  };
  const handleServiceClick = (service: string) => {
    // Map the service names to your internal types
    let serviceType = "";
    if (service === "Home Cook") serviceType = "COOK";
    if (service === "Cleaning Help") serviceType = "MAID";
    if (service === "Caregiver") serviceType = "NANNY";

    setSelectedType(serviceType);
    setDialogService(service);
    setDialogOpen(true);
  };

  const handleBookingSave = () => {
    let timeRange = "";
    let timeSlot = "";

    // Apply your new logic
    if (selectedRadioButtonValue === "Date") {
      // For "Date" → send startTime-endTime for both
      timeRange = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
      timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    } else if (selectedRadioButtonValue === "Short term") {
      // For "Short term" → timeRange = startTime only, but timeSlot = full range
      timeRange = startTime?.format("HH:mm") || "";
      timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    } else {
      // For "Monthly" → both are just startTime
      timeRange = startTime?.format("HH:mm") || "";
      timeSlot = startTime?.format("HH:mm") || "";
    }

    // Create booking object
    const booking = {
      startDate: startDate ? startDate.split("T")[0] : "",
      endDate: endDate
        ? endDate.split("T")[0]
        : startDate
        ? startDate.split("T")[0]
        : "",
      timeRange: timeRange,  
      bookingPreference: selectedRadioButtonValue,
      housekeepingRole: selectedType,

      // NEW → include these extra fields
      startTime: startTime?.format("HH:mm") || "",
      endTime: endTime?.format("HH:mm") || "",
      timeSlot: timeSlot
    };

    console.log("Booking details:", booking);

    // Dispatch
    dispatch(addBooking(booking));

    // Same condition check as in homepage
    if (selectedRadioButtonValue === "Date") {
      setOpenServiceDialog(true);
    } else {
      sendDataToParent(DETAILS);
    }

    setDialogOpen(false);
  };

  const handleSave = () => {
    if (!dataFromMap) {
      console.error("No location data selected from map");
      return;
    }
    console.log("dataFromMap ", dataFromMap);
    setLocation(
      dataFromMap?.address[0]?.formatted_address || "Location not found"
    );
    setOpen(false);
    setOpenSaveOptionForSave(true);
  };

  const locationHandleSave = async () => {
  console.log("Location saved as:", locationAs);
  console.log("user preference ", userPreference);
  console.log(location);
  
  setIsSaving(true);
  
  try {
    await updateUserSetting();
    
    // Show success snackbar
    setSnackbarMessage("Location saved successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    
    // Close dialog after a short delay
    setTimeout(() => {
      setOpenSaveOptionForSave(false);
      setLocationAs("");
      setIsSaving(false);
    }, 500);
    
  } catch (error) {
    console.error("Error saving location:", error);
    
    // Show error snackbar
    setSnackbarMessage("Failed to save location. Please try again.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    
    setIsSaving(false);
  }
};

// Updated updateUserSetting function to handle errors properly
const updateUserSetting = async () => {
  if (!user || !locationAs || !dataFromMap) {
    console.error("Missing required data to update user setting.");
    throw new Error("Missing required data");
  }

  const newLocation = {
    name: locationAs,
    location: dataFromMap,
  };

  console.log("➕ New location to add:", newLocation);

  try {
    const payload = {
      customerId: user.customerid,
      savedLocations: [
        ...(userPreference?.[0]?.savedLocations || []),
        newLocation
      ],
    };

    const response = await utilsInstance.put(
      `/user-settings/${user.customerid}`,
      payload
    );

    if (response.status === 200 || response.status === 201) {
      console.log("✅ User settings updated successfully");
      
      // Update local state
      const updatedUserPreference = [{
        ...userPreference?.[0],
        customerId: user.customerid,
        savedLocations: payload.savedLocations
      }];
      
      setUserPreference(updatedUserPreference);
      
      // Update suggestions
      const baseSuggestions = [
        { name: "Detect Location", index: 1 },
        { name: "Add Address", index: 2 },
      ];
      const savedLocationSuggestions = payload.savedLocations.map((loc: any, i: number) => ({
        name: loc.name,
        index: i + 3,
      }));
      
      setSuggestions([...baseSuggestions, ...savedLocationSuggestions]);
      
      return response.data; // Return data for chaining
    } else {
      throw new Error(`Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error updating user settings:", error);
    throw error; // Re-throw for error handling in locationHandleSave
  }
};

// Snackbar close handler
const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
  if (reason === 'clickaway') {
    return;
  }
  setSnackbarOpen(false);
};

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  function updateLocationFromMap(data: any): void {
    console.log("Location selected from map: ", data);
    console.log("Data from map: ", data);
    setDataFromMap(data);
  }

  const handleUserPreference = (preference?: string) => {
    console.log("User preference selected: ", preference);

    if (!preference) {
      setShowInput(true);
      setLocationAs(locationAs);
    } else {
      setShowInput(false);
      setLocationAs(preference);
    }
  };

  const [showDropdown, setShowDropdown] = useState(false);

  function setDialogService(service: string) {
    setDialogServiceState(service);
  }

  function setDialogOpen(isOpen: boolean) {
    setDialogOpenState(isOpen);
  }

  const isMobile = useMediaQuery("(max-width:768px)");

  // Add this useEffect for debugging
  useEffect(() => {
    console.log("🔄 userPreference state changed:", userPreference);
    console.log("🔄 suggestions state changed:", suggestions);
  }, [userPreference, suggestions]);

  // Add this useEffect to ensure suggestions are synced with userPreference
  useEffect(() => {
    if (userPreference && userPreference.length > 0 && userPreference[0]?.savedLocations) {
      const baseSuggestions = [
        { name: "Detect Location", index: 1 },
        { name: "Add Address", index: 2 },
      ];
      
      const savedLocations = userPreference[0].savedLocations || [];
      const savedLocationSuggestions = savedLocations.map((loc: any, i: number) => ({
        name: loc.name,
        index: i + 3,
      }));
      
      const newSuggestions = [...baseSuggestions, ...savedLocationSuggestions];
      
      // Only update if suggestions are different
      if (JSON.stringify(newSuggestions) !== JSON.stringify(suggestions)) {
        console.log("🔄 Syncing suggestions with userPreference");
        console.log("New suggestions:", newSuggestions);
        setSuggestions(newSuggestions);
      }
    }
  }, [userPreference]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 shadow-sm px-4 md:px-6 py-2 md:py-4 flex items-center justify-between bg-gradient-to-r from-[#0a2a66] to-[#004aad]"
        style={{ height: "10%" }}
      >
        {/* Logo Section - Updated to use onLogoClick */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={onLogoClick}
        >
          {/* Mobile logo */}
          <img
            src="ServEaso_Logo.png"
            alt="ServEase Logo"
            className="h-[7.5rem] w-auto md:hidden"
          />

          {/* Tablet logo */}
          <img
            src="ServEaso_Logo.png"
            alt="ServEase Logo"
            className="hidden md:block lg:hidden h-[9rem] w-auto max-w-[200px]"
          />
          {/* Desktop logo */}
          <img
            src="ServEaso_Logo.png"
            alt="ServEase Logo"
            className="hidden lg:block h-48 w-auto max-w-[340px]"
          />
        </div>

        {/* Navigation Links */}
     {!isMobile && (
  <nav className="flex items-center gap-6 text-white font-medium">
    {/* Home Tab */}
    <button
      onClick={() => handleClick("")}
      className="hover:text-gray-200 transition"
    >
      Home
    </button>

    {/* Services Dropdown */}
    <div className="relative" ref={serviceDropdownRef}>
      <button
        onClick={() => setServiceDropdownOpen((prev) => !prev)}
        className="flex items-center gap-1 hover:text-gray-200 transition"
      >
        Our Services
        <ChevronDown className="w-4 h-4" />
      </button>

      {serviceDropdownOpen && (
        <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-md text-gray-800 z-50">
          {["Home Cook", "Cleaning Help", "Caregiver"].map(
            (service, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedService(service);
                  setServiceDropdownOpen(false);
                  handleServiceClick(service);
                }}
              >
                {service}
              </li>
            )
          )}
        </ul>
      )}
    </div>

    {/* My Bookings Tab - Conditionally shown for authenticated CUSTOMER users */}
    {isAuthenticated && appUser?.role === "CUSTOMER" && (
      <button
        onClick={() => handleClick(BOOKINGS)}
        className="hover:text-gray-200 transition"
      >
        My Bookings
      </button>
    )}

    {/* Dashboard Tab - Conditionally shown for authenticated SERVICE_PROVIDER users */}
    {isAuthenticated && appUser?.role === "SERVICE_PROVIDER" && (
      <button
        onClick={() => handleClick(DASHBOARD)}
        className="hover:text-gray-200 transition"
      >
        Dashboard
      </button>
    )}

    <button
      onClick={() => handleClick("ABOUT")}
      className="hover:text-gray-200"
    >
      About Us
    </button>

    <button
      onClick={() => handleClick("CONTACT")}
      className="hover:text-gray-200"
    >
      Contact Us
    </button>
  </nav>
)}

        {/* Move these dialog components outside the navigation */}
        <BookingDialog
          open={dialogOpenState}
          onClose={() => setDialogOpen(false)}
          onSave={handleBookingSave}
          selectedOption={selectedRadioButtonValue}
          onOptionChange={setSelectedRadioButtonValue}
          startDate={startDate}
          endDate={endDate}
          startTime={startTime}
          endTime={endTime}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
        />

        {selectedType === "COOK" && (
          <CookServicesDialog
            open={openServiceDialog}
            handleClose={() => setOpenServiceDialog(false)}
            sendDataToParent={sendDataToParent}
          />
        )}
        {selectedType === "MAID" && (
          <MaidServiceDialog
            open={openServiceDialog}
            handleClose={() => setOpenServiceDialog(false)}
            sendDataToParent={sendDataToParent}
          />
        )}
        {selectedType === "NANNY" && (
          <NannyServicesDialog
            open={openServiceDialog}
            handleClose={() => setOpenServiceDialog(false)}
            sendDataToParent={sendDataToParent}
          />
        )}
        {/* Right Side Content */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Location Bar - UPDATED */}
          <div className="flex items-center border rounded-xl px-2 md:px-3 py-1 md:py-2 bg-gray-100 w-[140px] sm:w-[180px] md:w-[240px] lg:w-64 relative">
            <MapPin className="w-4 h-4 text-gray-500 mr-2" />
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Location"
                value={location}
                onFocus={() => setShowDropdown(true)}
                onClick={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="bg-transparent outline-none text-xs md:text-sm w-full px-1 cursor-pointer"
                readOnly
              />
              {showDropdown && (
                <ul className="absolute z-50 bg-white border rounded shadow-md mt-1 w-full max-h-60 overflow-y-auto text-xs md:text-sm">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      console.log("📍 Detect Location clicked");
                      handleChange("Detect Location");
                      setTimeout(() => {
                        setShowDropdown(false);
                      }, 100);
                    }}
                  >
                    Detect Location
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      console.log("🏠 Add Address clicked");
                      handleChange("Add Address");
                      setTimeout(() => {
                        setShowDropdown(false);
                      }, 100);
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
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            console.log(`📍 ${suggestion.name} clicked`);
                            console.log("📊 Current suggestions:", suggestions);
                            console.log("📊 Current userPreference:", userPreference);
                            // Call handleChange immediately
                            handleChange(suggestion.name);
                            // Close dropdown
                            setTimeout(() => {
                              setShowDropdown(false);
                            }, 100);
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
          {/* <Badge badgeContent={totalCartItems} color="primary">
    <Button variant="ghost" size="icon" className="bg-white rounded-full shadow" onClick={handleCartOpen}>
    <ShoppingCart className="w-5 h-5" />
    </Button>
    </Badge> */}
    <Button variant="ghost" size="icon" className="bg-white rounded-full shadow" onClick={handleNotificationClick} >
   <Bell className="w-5 h-5" />
    </Button>
          {/* User / Auth */}
        {!isAuthenticated ? (
  <Button
    variant="ghost"
    size="icon"
    className="bg-white rounded-full shadow"
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
        src={appUser?.picture}
        alt={appUser?.name}
        className="w-6 h-6 md:w-8 md:h-8 rounded-full"
      />
      <span className="font-medium hidden sm:inline">
        {user?.name}
      </span>
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
            onClick={() => {
              handleClick(PROFILE);
              setdropDownOpen(false);
            }}
          >
            Profile
          </li>
          {appUser?.role === "CUSTOMER" && (
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleClick(BOOKINGS);
                setdropDownOpen(false);
              }}
            >
              My Bookings
            </li>
          )}
          {appUser?.role === "SERVICE_PROVIDER" && (
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleClick(DASHBOARD);
                setdropDownOpen(false);
              }}
            >
              Dashboard
            </li>
          )}
          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              logout({
                logoutParams: { returnTo: window.location.origin },
              });
              setdropDownOpen(false);
            }}
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

      <Dialog open={open} onClose={handleClose}>
         <DialogHeader style={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'white',
                        zIndex: 1000,
                        padding: '16px 24px',
                        borderBottom: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <DialogTitle>Set Location</DialogTitle>
                        <IconButton
                          aria-label="close"
                          onClick={handleClose}
                          className="!absolute right-4  !text-white"
                        >
                          <X className="w-6 h-6" />
                        </IconButton></DialogHeader>
        
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
<Dialog open={OpenSaveOptionForSave} onClose={handleClose}>

   <DialogHeader style={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'white',
                        zIndex: 1000,
                        padding: '16px 24px',
                        borderBottom: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                         <DialogTitle>Save As</DialogTitle>
                        <IconButton
                          aria-label="close"
                          onClick={handleClose}
                          className="!absolute right-4  !text-white"
                        >
                          <X className="w-6 h-6" />
                        </IconButton></DialogHeader>
  <DialogContent>
    <div>
      <div>Save As :</div>
      <Button
        startIcon={<FaHome />}
        className={undefined}
        onClick={() => {
          handleUserPreference("Home");
        }}
        disabled={isSaving}
      >
        Home
      </Button>
      <Button
        startIcon={<HiBuildingOffice />}
        className={undefined}
        onClick={() => {
          handleUserPreference("Office");
        }}
        disabled={isSaving}
      >
        Office
      </Button>
      <Button
        startIcon={<FaLocationArrow />}
        className={undefined}
        onClick={() => {
          handleUserPreference();
        }}
        disabled={isSaving}
      >
        Others
      </Button>
    </div>
    {showInput && (
      <TextField
        id="standard-basic"
        label="Enter Location Name"
        variant="standard"
        fullWidth
        value={locationAs}
        onChange={(e) => setLocationAs(e.target.value)}
        disabled={isSaving}
      />
    )}
  </DialogContent>

  <DialogActions sx={{ padding: "10px" }}>
    <Button 
      color="primary" 
      onClick={handleClose} 
      className={undefined}
      disabled={isSaving}
    >
      Cancel
    </Button>
    <Button
      color="primary"
      onClick={locationHandleSave}
      className={undefined}
      disabled={isSaving || !locationAs}
      startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : undefined}
    >
      {isSaving ? "Saving..." : "Save"}
    </Button>
  </DialogActions>
</Dialog>

   <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
             onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{ marginTop: "60px" }}
            >
  <Alert 
    onClose={handleSnackbarClose} 
    severity={snackbarSeverity}
    sx={{ width: '100%' }}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>
      <NotificationsDialog 
        open={showNotifications} 
        onClose={handleCloseNotifications} 
      />
      {/* <CartDialog
    open={cartOpen}
    handleClose={handleCartClose}
    
    /> */}
    </>
  );
};