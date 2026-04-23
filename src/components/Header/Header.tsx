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
  AGENT_DASHBOARD,
} from "../../Constants/pagesConstants";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Bell, ChevronDown, MapPin, Menu, ShoppingCart, User, X, Globe } from "lucide-react";
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
import { useLanguage, Language } from "src/context/LanguageContext";
import providerInstance from "src/services/providerInstance";
import preferenceInstance from "src/services/preferenceInstance";
import { publicAsset } from "src/utils/publicAsset";

interface ChildComponentProps {
  sendDataToParent: (data: string, type?: string) => void;
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
  // Use the language hook
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
 const handleClick = (e: any) => {
  if (e === "sign_out") {
    dispatch(remove());
    sendDataToParent("");
  } else if (e === "ABOUT") {
    onAboutClick();
  } else if (e === "CONTACT") {
    onContactClick();
  } else if (e === "") {
    onLogoClick();
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

  const { setAppUser } = useAppUser();
  const { appUser } = useAppUser();

  const cart = useSelector((state: any) => state.cart?.value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropDownOpen, setdropDownOpen] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get available languages
  const languages: Language[] = ['en', 'hi', 'kn', 'bn'];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  const closeMobileNav = () => setMobileNavOpen(false);

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
        setdropDownOpen(false);
      }
    };

    if (dropDownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropDownOpen]);

  useEffect(() => {
    const run = async () => {
      await getLocation();

      if (!isAuthenticated || isLoading || !user?.email) return;

      try {
        const token = await getAccessTokenSilently();
        console.log("Access Token:", token);
        console.log("User authenticated:", user);

        const email = user.email ?? "";

        const response = await utilsInstance.get(
          `/customer/check-email?email=${encodeURIComponent(email)}`
        );
        console.log("Email check response:", response.data);
        console.log("User role:", response.data.user_role);
        
        if (!response.data.user_role) {
          await createUser(user);
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
        } else if (response.data.user_role === "VENDOR") {
          setAppUser({
            ...user,
            role: "VENDOR",
            vendorId: response.data.id,
          });
        }

        console.log("Updated user object with role:", user);
        console.log("Post-login steps completed ✅");
      } catch (error) {
        console.error("Error during post-login API call:", error);
      }
    };

    run();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently]);

  const [userPreference, setUserPreference] = useState<any>([]);

  const createUser = async (user: any) => {
    try {
      const userData = {
        firstname: user.given_name || user.name.split(" ")[0] || "User",
        lastname: user.family_name || user.name.split(" ")[1] || "",
        emailid: user.email,
      };

      console.log("Creating user with data:", userData);

      const response = await providerInstance.post(
        "/api/customer",
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
  const response = await preferenceInstance.get(
  `/api/user-settings/${customerId}`
);
      console.log("✅ Response from user settings API:", response.data);

      if (response.status === 200) {
        console.log("✅ Customer preferences fetched successfully:", response.data);

        setUserPreference(response.data);
        if (user) {
          user.customerid = customerId;
          setAppUser({
            ...user,
            role: "CUSTOMER",
            customerid: customerId,
          });
        }

        console.log("✅ Updated user object with customerId:", user);
        
        const baseSuggestions = [
          { name: t('detectLocation'), index: 1 },
          { name: t('addAddress'), index: 2 },
        ];
        
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
      setLoadingLocations(false);
    }
  };

  const createUserPreferences = async (customerId: number) => {
    if (user) {
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

    const response = await preferenceInstance.post(
  "/api/user-settings",
  payload
);

      if (response.status === 200 || response.status === 201) {
        setUserPreference(payload);
        
        const baseSuggestions = [
          { name: t('detectLocation'), index: 1 },
          { name: t('addAddress'), index: 2 },
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
            setLocation(address || t('locationNotFound'));
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
  const [dialogOpenState, setDialogOpenState] = useState(false);
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
  const [selectedSaveOption, setSelectedSaveOption] = useState<string | null>(null);

  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close services dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target as Node)
      ) {
        setServiceDropdownOpen(false);
      }
    };

    if (serviceDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [serviceDropdownOpen]);

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
            setLocation(address || t('locationNotFound'));
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
    { name: t('detectLocation'), index: 1 },
    { name: t('addAddress'), index: 2 },
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

  const handleChange = (newValue: any) => {
    console.log("➡️ New Value Selected:", newValue);
    
    if (newValue === t('addAddress')) {
      setOpen(true);
    } else if (newValue === t('detectLocation')) {
      getLocation();
    } else {
      console.log("➡️ Selected Saved Location:", newValue);
      console.log("🗂️ User Preferences:", userPreference);
      
      if (!userPreference || userPreference.length === 0) {
        console.error("userPreference is empty or undefined");
        return;
      }
      
      if (!userPreference[0]?.savedLocations || userPreference[0]?.savedLocations.length === 0) {
        console.error("No saved locations found in userPreference");
        return;
      }
      
      const savedLocation = userPreference[0].savedLocations.find(
        (location: any) => location.name === newValue
      ) || userPreference[0].savedLocations.find(
        (location: any) => location.name?.toLowerCase() === newValue.toLowerCase()
      );
      
      if (savedLocation) {
        console.log("✅ Found location:", savedLocation);
        
        let displayAddress = "Location found";
        
        if (savedLocation.location?.address && Array.isArray(savedLocation.location.address)) {
          console.log("📌 Using complex location format");
          if (savedLocation.location.address[0]?.formatted_address) {
            displayAddress = savedLocation.location.address[0].formatted_address;
          }
        } 
        else if (savedLocation.location?.formatted_address) {
          console.log("📌 Using simple location format");
          displayAddress = savedLocation.location.formatted_address;
        }
        else if (savedLocation.location?.lat && savedLocation.location?.lng) {
          console.log("📌 Location has lat/lng coordinates");
          displayAddress = `${savedLocation.name} location`;
        }
        
        setLocation(displayAddress);
        dispatch(add(savedLocation.location));
        
        console.log("Full location data:", savedLocation.location);
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
    setSelectedSaveOption(null);
    setShowInput(false);
  };
  
  const handleServiceClick = (service: string) => {
    let serviceType = "";
    if (service === t('homeCook')) serviceType = "COOK";
    if (service === t('cleaningHelp')) serviceType = "MAID";
    if (service === t('caregiver')) serviceType = "NANNY";

    setSelectedType(serviceType);
    setDialogService(service);
    setDialogOpen(true);
  };

  const handleBookingSave = () => {
    let timeRange = "";
    let timeSlot = "";

    if (selectedRadioButtonValue === "Date") {
      timeRange = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
      timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    } else if (selectedRadioButtonValue === "Short term") {
      timeRange = startTime?.format("HH:mm") || "";
      timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    } else {
      timeRange = startTime?.format("HH:mm") || "";
      timeSlot = startTime?.format("HH:mm") || "";
    }

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
      startTime: startTime?.format("HH:mm") || "",
      endTime: endTime?.format("HH:mm") || "",
      timeSlot: timeSlot
    };

    console.log("Booking details:", booking);

    dispatch(addBooking(booking));

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
      dataFromMap?.address[0]?.formatted_address || t('locationNotFound')
    );
    
    let displayAddress = "Location not found";
    if (dataFromMap?.address && Array.isArray(dataFromMap.address)) {
      displayAddress = dataFromMap.address[0]?.formatted_address || "Location not found";
    } else if (dataFromMap?.formatted_address) {
      displayAddress = dataFromMap.formatted_address;
    }
    
    setLocation(displayAddress);

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
    
    setSnackbarMessage(t('locationSavedSuccess'));
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    
    setTimeout(() => {
      setOpenSaveOptionForSave(false);
      setLocationAs("");
      setIsSaving(false);
    }, 500);
    
  } catch (error) {
    console.error("Error saving location:", error);
    
    setSnackbarMessage(t('locationSaveError'));
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    
    setIsSaving(false);
  }
};

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

   const response = await preferenceInstance.put(
  `/api/user-settings/${appUser.customerid}`,
  payload
);

    if (response.status === 200 || response.status === 201) {
      console.log("✅ User settings updated successfully");
      
      const updatedUserPreference = [{
        ...userPreference?.[0],
        customerId: user.customerid,
        savedLocations: payload.savedLocations
      }];
      
      setUserPreference(updatedUserPreference);
      
      const baseSuggestions = [
        { name: t('detectLocation'), index: 1 },
        { name: t('addAddress'), index: 2 },
      ];
      const savedLocationSuggestions = payload.savedLocations.map((loc: any, i: number) => ({
        name: loc.name,
        index: i + 3,
      }));
      
      setSuggestions([...baseSuggestions, ...savedLocationSuggestions]);
      
      return response.data;
    } else {
      throw new Error(`Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error updating user settings:", error);
    throw error;
  }
};

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
      setSelectedSaveOption('Others');
      setShowInput(true);
      setLocationAs('');
    } else {
      setSelectedSaveOption(preference);
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

  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    console.log("🔄 userPreference state changed:", userPreference);
    console.log("🔄 suggestions state changed:", suggestions);
  }, [userPreference, suggestions]);

  useEffect(() => {
    if (userPreference && userPreference.length > 0 && userPreference[0]?.savedLocations) {
      const baseSuggestions = [
        { name: t('detectLocation'), index: 1 },
        { name: t('addAddress'), index: 2 },
      ];
      
      const savedLocations = userPreference[0].savedLocations || [];
      const savedLocationSuggestions = savedLocations.map((loc: any, i: number) => ({
        name: loc.name,
        index: i + 3,
      }));
      
      const newSuggestions = [...baseSuggestions, ...savedLocationSuggestions];
      
      if (JSON.stringify(newSuggestions) !== JSON.stringify(suggestions)) {
        console.log("🔄 Syncing suggestions with userPreference");
        console.log("New suggestions:", newSuggestions);
        setSuggestions(newSuggestions);
      }
    }
  }, [userPreference]);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 overflow-visible border-b border-white/10 bg-gradient-to-r from-slate-950 via-[#0b2a5c] to-sky-950 pt-[env(safe-area-inset-top,0px)] shadow-[0_6px_24px_-6px_rgba(0,0,0,0.4)]">
        <div className="relative mx-auto flex h-11 max-w-[90rem] items-center justify-between gap-1.5 overflow-visible px-2 py-0 sm:h-12 sm:gap-2 sm:px-3 md:h-14 md:gap-3 md:px-5 lg:px-7">
        <div className="relative flex h-full shrink-0 items-center gap-1 sm:gap-1.5">
          {isMobile && (
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:h-8 sm:w-8"
            >
              <Menu className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" strokeWidth={2} />
            </button>
          )}
          <div className="relative h-full min-w-[9.25rem] w-[10.25rem] sm:min-w-[10.75rem] sm:w-[11.75rem] md:min-w-[13.5rem] md:w-[15rem] lg:min-w-[15.5rem] lg:w-[17.25rem] xl:min-w-[17.5rem] xl:w-[19.25rem]">
            <button
              type="button"
              onClick={() => {
                onLogoClick();
                closeMobileNav();
              }}
              className="group absolute left-0 top-1/2 z-20 flex -translate-y-1/2 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950"
              aria-label="ServEaso home"
            >
              <img
                src={publicAsset("ServEaso_Logo.png")}
                alt=""
                className="h-16 w-auto max-w-[12rem] object-contain object-left opacity-95 transition group-hover:opacity-100 sm:h-[4.75rem] sm:max-w-[14rem] md:h-24 md:max-w-[17rem] lg:h-28 lg:max-w-[19rem] xl:h-32 xl:max-w-[21rem]"
              />
            </button>
          </div>
        </div>

        {!isMobile && (
  <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 lg:gap-2" aria-label="Main">
    <button
      type="button"
      onClick={() => handleClick("")}
      className="rounded-md px-2.5 py-1 text-sm font-medium text-white/90 transition-colors hover:bg-white/12 hover:text-white md:px-3"
    >
      {t('home')}
    </button>

    {!(isAuthenticated && appUser?.role === "SERVICE_PROVIDER") && (
      <div className="relative" ref={serviceDropdownRef}>
        <button
          type="button"
          onClick={() => setServiceDropdownOpen((prev) => !prev)}
          className="flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium text-white/90 transition-colors hover:bg-white/12 hover:text-white md:px-3"
          aria-expanded={serviceDropdownOpen}
        >
          {t('ourServices')}
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${serviceDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {serviceDropdownOpen && (
          <ul className="absolute left-0 z-[100] mt-2 w-56 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1.5 text-slate-800 shadow-2xl shadow-slate-900/25 ring-1 ring-black/5">
            {[t('homeCook'), t('cleaningHelp'), t('caregiver')].map(
              (service, idx) => (
                <li
                  key={idx}
                  className="cursor-pointer px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-950"
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
    )}

    {isAuthenticated && appUser?.role === "CUSTOMER" && (
      <button
        type="button"
        onClick={() => handleClick(BOOKINGS)}
        className="rounded-md px-2.5 py-1 text-sm font-medium text-white/90 transition-colors hover:bg-white/12 hover:text-white md:px-3"
      >
        {t('myBookings')}
      </button>
    )}

    {isAuthenticated && appUser?.role === "SERVICE_PROVIDER" && (
      <button
        type="button"
        onClick={() => handleClick(DASHBOARD)}
        className="rounded-md px-2.5 py-1 text-sm font-medium text-white/90 transition-colors hover:bg-white/12 hover:text-white md:px-3"
      >
        {t('dashboard')}
      </button>
    )}

    {isAuthenticated && appUser?.role === "VENDOR" && (
      <button
        type="button"
        onClick={() => handleClick(AGENT_DASHBOARD)}
        className="rounded-md px-2.5 py-1 text-sm font-medium text-white/90 transition-colors hover:bg-white/12 hover:text-white md:px-3"
      >
        Agent Dashboard
      </button>
    )}

    <button
      type="button"
      onClick={() => handleClick("ABOUT")}
      className="rounded-md px-2.5 py-1 text-sm font-medium text-white/90 transition-colors hover:bg-white/12 hover:text-white md:px-3"
    >
      {t('aboutUs')}
    </button>

    <button
      type="button"
      onClick={() => handleClick("CONTACT")}
      className="rounded-md px-2.5 py-1 text-sm font-medium text-white/90 transition-colors hover:bg-white/12 hover:text-white md:px-3"
    >
      {t('contactUs')}
    </button>
  </nav>
        )}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <div className="relative flex h-8 min-w-0 max-w-[6.75rem] items-center gap-1 rounded-md border border-white/25 bg-white/10 px-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md sm:h-9 sm:max-w-[10rem] sm:px-2 md:max-w-[13rem] lg:max-w-[16rem]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-200 sm:h-4 sm:w-4" aria-hidden />
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                placeholder={t('location')}
                value={location}
                onFocus={() => setShowDropdown(true)}
                onClick={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full cursor-pointer truncate bg-transparent text-[10px] text-white outline-none placeholder:text-white/45 sm:text-xs md:text-sm"
                readOnly
              />
              {showDropdown && (
              <ul className="absolute right-0 z-[100] mt-2 max-h-60 min-w-[14rem] max-w-[min(90vw,18rem)] overflow-y-auto rounded-xl border border-slate-200/90 bg-white py-1 text-xs text-slate-800 shadow-2xl ring-1 ring-black/5 sm:left-auto sm:right-0 sm:text-sm md:min-w-[16rem]">
                  <li
                    className="cursor-pointer px-4 py-2.5 transition-colors hover:bg-slate-50"
                    onClick={() => {
                      console.log("📍 Detect Location clicked");
                      handleChange(t('detectLocation'));
                      setTimeout(() => {
                        setShowDropdown(false);
                      }, 100);
                    }}
                  >
                    {t('detectLocation')}
                  </li>
                  {/* Show "Add Address" only for authenticated CUSTOMER users */}
                  {isAuthenticated && appUser?.role === "CUSTOMER" && (
                    <li
                      className="cursor-pointer px-4 py-2.5 transition-colors hover:bg-slate-50"
                      onClick={() => {
                        console.log("🏠 Add Address clicked");
                        handleChange(t('addAddress'));
                        setTimeout(() => {
                          setShowDropdown(false);
                        }, 100);
                      }}
                    >
                      {t('addAddress')}
                    </li>
                  )}
                  {loadingLocations ? (
                    <li className="flex items-center justify-center gap-2 px-4 py-2.5 text-slate-500">
                      <ClipLoader size={15} color="#64748b" />
                      {t('loading')}...
                    </li>
                  ) : (
                    suggestions
                      .filter((s) => s.index > 2)
                      .map((suggestion, index) => (
                        <li
                          key={index}
                          className="cursor-pointer px-4 py-2.5 transition-colors hover:bg-slate-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`📍 ${suggestion.name} clicked`);
                            console.log("📊 Current suggestions:", suggestions);
                            console.log("📊 Current userPreference:", userPreference);
                            handleChange(suggestion.name);
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

          <div className="relative">
          <button
            type="button"
            onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            className="flex h-8 items-center gap-1 rounded-md border border-white/25 bg-white/10 px-2 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-white/18 sm:h-9 sm:px-2.5 sm:text-xs md:px-3"
            aria-expanded={isLanguageMenuOpen}
          >
            <Globe className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            <span className="tabular-nums">{currentLanguage.toUpperCase()}</span>
            <ChevronDown
              className={`h-3 w-3 shrink-0 transition-transform sm:h-3.5 sm:w-3.5 ${
                isLanguageMenuOpen ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </button>

            {isLanguageMenuOpen && (
              <div className="absolute right-0 top-full z-[100] mt-2 min-w-[10.5rem] overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-2xl ring-1 ring-black/5">
                <div className="py-0.5">
                  {languages.map((lang) => (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        currentLanguage === lang ? "bg-sky-50 font-medium text-sky-800" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {t(lang)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:h-8 sm:w-8"
            onClick={handleNotificationClick}
            aria-label="Notifications"
          >
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          </button>

          {!isAuthenticated ? (
            <button
              type="button"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:h-8 sm:w-8"
              onClick={() => loginWithRedirect()}
              aria-label="Sign in"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </button>
          ) : (
            <div className="relative text-left">
              <button
                type="button"
                onClick={() => setdropDownOpen((prev) => !prev)}
                className="flex h-8 max-w-[10rem] items-center gap-1.5 rounded-md border border-white/25 bg-white/10 py-0 pl-1 pr-2 text-white transition hover:bg-white/18 sm:h-9 sm:max-w-[12rem] md:gap-2 md:pl-1.5 md:pr-3"
                aria-expanded={dropDownOpen}
              >
                <img
                  src={appUser?.picture}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full ring-2 ring-white/35 md:h-8 md:w-8"
                />
                <span className="hidden max-w-[6rem] truncate text-sm font-medium text-white/95 sm:inline md:max-w-[9rem]">
                  {user?.name}
                </span>
                <ChevronDown className={`hidden h-4 w-4 shrink-0 sm:block ${dropDownOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>

              {dropDownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 z-[100] mt-2 w-52 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-2xl ring-1 ring-black/5 md:w-56"
                >
                  <ul className="py-1 text-sm text-slate-800">
                    <li
                      className="cursor-pointer px-4 py-2.5 transition-colors hover:bg-slate-50"
                      onClick={() => {
                        handleClick(PROFILE);
                        setdropDownOpen(false);
                      }}
                    >
                      {t('profile')}
                    </li>
                    
                    {/* Customer Menu Items */}
                    {appUser?.role === "CUSTOMER" && (
                      <li
                        className="cursor-pointer px-4 py-2.5 transition-colors hover:bg-slate-50"
                        onClick={() => {
                          handleClick(BOOKINGS);
                          setdropDownOpen(false);
                        }}
                      >
                        {t('myBookings')}
                      </li>
                    )}

                    {appUser?.role === "SERVICE_PROVIDER" && (
                      <li
                        className="cursor-pointer px-4 py-2.5 transition-colors hover:bg-slate-50"
                        onClick={() => {
                          handleClick(DASHBOARD);
                          setdropDownOpen(false);
                        }}
                      >
                        {t('dashboard')}
                      </li>
                    )}

                    {appUser?.role === "VENDOR" && (
                      <li
                        className="cursor-pointer px-4 py-2.5 transition-colors hover:bg-slate-50"
                        onClick={() => {
                          handleClick(AGENT_DASHBOARD);
                          setdropDownOpen(false);
                        }}
                      >
                        Agent Dashboard
                      </li>
                    )}

                    <li
                      className="cursor-pointer px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-50"
                      onClick={() => {
                        logout({
                          logoutParams: { returnTo: window.location.origin },
                        });
                        setdropDownOpen(false);
                      }}
                    >
                      {t('logout')}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </header>

      {mobileNavOpen && isMobile && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm"
            onClick={closeMobileNav}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 left-0 z-[70] flex w-[min(100vw-2rem,19.5rem)] flex-col border-r border-slate-200/90 bg-white shadow-2xl"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <span className="text-sm font-semibold tracking-tight text-slate-900">ServEaso</span>
              <button
                type="button"
                onClick={closeMobileNav}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Main">
              <button
                type="button"
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-sky-50"
                onClick={() => {
                  handleClick("");
                  closeMobileNav();
                }}
              >
                {t("home")}
              </button>
              {!(isAuthenticated && appUser?.role === "SERVICE_PROVIDER") && (
                <div className="mt-1 border-t border-slate-100 pt-2">
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {t("ourServices")}
                  </p>
                  {[t("homeCook"), t("cleaningHelp"), t("caregiver")].map((service, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-950"
                      onClick={() => {
                        setSelectedService(service);
                        setServiceDropdownOpen(false);
                        handleServiceClick(service);
                        closeMobileNav();
                      }}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              )}
              {isAuthenticated && appUser?.role === "CUSTOMER" && (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-sky-50"
                  onClick={() => {
                    handleClick(BOOKINGS);
                    closeMobileNav();
                  }}
                >
                  {t("myBookings")}
                </button>
              )}
              {isAuthenticated && appUser?.role === "SERVICE_PROVIDER" && (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-sky-50"
                  onClick={() => {
                    handleClick(DASHBOARD);
                    closeMobileNav();
                  }}
                >
                  {t("dashboard")}
                </button>
              )}
              {isAuthenticated && appUser?.role === "VENDOR" && (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-sky-50"
                  onClick={() => {
                    handleClick(AGENT_DASHBOARD);
                    closeMobileNav();
                  }}
                >
                  Agent Dashboard
                </button>
              )}
              <div className="my-2 border-t border-slate-100" />
              <button
                type="button"
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-sky-50"
                onClick={() => {
                  handleClick("ABOUT");
                  closeMobileNav();
                }}
              >
                {t("aboutUs")}
              </button>
              <button
                type="button"
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-sky-50"
                onClick={() => {
                  handleClick("CONTACT");
                  closeMobileNav();
                }}
              >
                {t("contactUs")}
              </button>
            </nav>
          </aside>
        </>
      )}

      {/* Location Selection Dialog */}
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
          <DialogTitle>{t('setLocation')}</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            className="!absolute right-4 !text-white"
          >
            <X className="w-6 h-6" />
          </IconButton>
        </DialogHeader>
        
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
            {t('cancel')}
          </Button>
          <Button color="primary" onClick={handleSave} className={undefined}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Location Dialog */}
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
          <DialogTitle>{t('saveAs')}</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            className="!absolute right-4 !text-white"
          >
            <X className="w-6 h-6" />
          </IconButton>
        </DialogHeader>
        
        <DialogContent>
          <div>
            <div>{t('saveAs')} :</div>
            <Button
              startIcon={<FaHome />}
              className={undefined}
              style={{
                backgroundColor: selectedSaveOption === 'Home' ? '#bbdefb' : 'transparent',
                border: selectedSaveOption === 'Home' ? '2px solid #1976d2' : 'none',
                marginRight: '8px'
              }}
              onClick={() => {
                handleUserPreference("Home");
              }}
              disabled={isSaving}
            >
              {t('home')}
            </Button>
            <Button
              startIcon={<HiBuildingOffice />}
              className={undefined}
              style={{
                backgroundColor: selectedSaveOption === 'Office' ? '#bbdefb' : 'transparent',
                border: selectedSaveOption === 'Office' ? '2px solid #1976d2' : 'none',
                marginRight: '8px'
              }}
              onClick={() => {
                handleUserPreference("Office");
              }}
              disabled={isSaving}
            >
              {t('office')}
            </Button>
            <Button
              startIcon={<FaLocationArrow />}
              className={undefined}
              style={{
                backgroundColor: selectedSaveOption === 'Others' ? '#bbdefb' : 'transparent',
                border: selectedSaveOption === 'Others' ? '2px solid #1976d2' : 'none'
              }}
              onClick={() => {
                handleUserPreference();
              }}
              disabled={isSaving}
            >
              {t('others')}
            </Button>
          </div>
          {showInput && (
            <TextField
              id="standard-basic"
              label={t('enterLocationName')}
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
            {t('cancel')}
          </Button>
          <Button
            color="primary"
            onClick={locationHandleSave}
            className={undefined}
            disabled={isSaving || !locationAs}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isSaving ? t('saving') : t('save')}
          </Button>
        </DialogActions>
      </Dialog>
 {/* Dialog components */}
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
      {/* Snackbar for notifications */}
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

      {/* Notifications Dialog */}
      <NotificationsDialog 
        open={showNotifications} 
        onClose={handleCloseNotifications} 
      />
    </>
  );
};