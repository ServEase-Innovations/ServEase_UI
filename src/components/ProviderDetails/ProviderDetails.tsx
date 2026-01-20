/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  IconButton, 
  Paper, 
  TextField, 
  Tooltip, 
  Typography, 
  Chip, 
  Box,
  Stack,
  Avatar,
  Rating,
  Divider,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { styled } from "@mui/material/styles";
import moment from "moment";
import "./ProviderDetails.css"; 
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Bookingtype } from "../../types/bookingTypeData";
import { useDispatch, useSelector } from "react-redux";
import { add, update } from "../../features/bookingType/bookingTypeSlice";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Login from "../Login/Login";
import axiosInstance from "../../services/axiosInstance";
import TimeRange from 'react-time-range';
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { FaTimes } from "react-icons/fa";
import { PlusIcon } from "lucide-react";
import MaidServiceDialog from "./MaidServiceDialog";
import NannyServicesDialog from "./NannyServicesDialog";
import CookServicesDialog from "./CookServicesDialog";
import { EnhancedProviderDetails, ServiceProviderDTO } from "../../types/ProviderDetailsType";
import { useAppUser } from "src/context/AppUserContext";
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Button } from "../Button/button";
import ProviderAvailabilityDrawer from "./ProviderAvailabilityDrawer";

interface ProviderDetailsProps extends ServiceProviderDTO  {
  selectedProvider: (provider: ServiceProviderDTO) => void;
  availableTimeSlots?: string[];
  sendDataToParent?: (data: string) => void;
}

// Styled components - KEEPING YOUR EXACT WEB VIEW STYLES
const PremiumBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  zIndex: 10,
  fontWeight: 700,
  fontSize: '0.7rem',
  backgroundColor: theme.palette.warning.main,
  color: theme.palette.warning.contrastText,
  boxShadow: theme.shadows[2],
  '& .MuiChip-icon': {
    color: theme.palette.warning.contrastText,
  },
}));

const ProviderCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'visible',
  transition: 'all 0.3s ease',
  border: '1px solid',
  borderColor: theme.palette.divider,
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.5),
  borderRadius: 12,
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
  minWidth: 80,
}));

const ProviderAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  fontSize: '1.5rem',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

// Best Match Ribbon Component
const BestMatchRibbon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(-0.5),
  left: theme.spacing(1),
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  backgroundColor: theme.palette.warning.main,
  color: theme.palette.warning.contrastText,
  padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  borderRadius: '4px',
  boxShadow: theme.shadows[2],
  fontWeight: 700,
  fontSize: '0.7rem',
}));

// Availability Info Chip Component
const AvailabilityChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.contrastText,
  fontWeight: 600,
  '&.partial': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  '&.limited': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
}));

const ProviderDetails: React.FC<ProviderDetailsProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [eveningSelection, setEveningSelection] = useState<number | null>(null);
  const [morningSelection, setMorningSelection] = useState<number | null>(null);
  const [eveningSelectionTime, setEveningSelectionTime] = useState<string | null>(null);
  const [morningSelectionTime, setMorningSelectionTime] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState();
  const [open, setOpen] = useState(false);
  const [engagementData, setEngagementData] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [missingTimeSlots, setMissingTimeSlots] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [warning, setWarning] = useState("");
  const [missingSlots, setMissingSlots] = useState<string[]>([]);
  const [uniqueMissingSlots, setUniqueMissingSlots] = useState<string[]>([]);
  const [matchedMorningSelection, setMatchedMorningSelection] = useState<string | null>(null);
  const [matchedEveningSelection, setMatchedEveningSelection] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasCheckedRef = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const dietImages = {
    VEG: "veg.png",
    NONVEG: "nonveg.png",
    BOTH: "nonveg.png",
  };

  const dispatch = useDispatch();
  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const user = useSelector((state: any) => state.user?.value);

  const handleSelection = (hour: number, isEvening: boolean, time: number) => {
    const startTime = moment({ hour: time, minute: 0 }).format("HH:mm");
    const endTime = moment({ hour: time + 1, minute: 0 }).format("HH:mm");
    const formattedTime = `${startTime}-${endTime}`;

    if (isEvening) {
      setEveningSelection(hour);
      setEveningSelectionTime(formattedTime);
      setMatchedEveningSelection(formattedTime);
      dispatch(update({ eveningSelection: formattedTime }));
    } else {
      setMorningSelection(hour);
      setMorningSelectionTime(formattedTime);
      setMatchedMorningSelection(formattedTime);
      dispatch(update({ morningSelection: formattedTime }));
    }
  };

  const clearSelection = (isEvening: boolean) => {
    if (isEvening) {
      setEveningSelection(null);
      setEveningSelectionTime(null);
      setMatchedEveningSelection(null);
      dispatch(update({ eveningSelection: null }));
    } else {
      setMorningSelection(null);
      setMorningSelectionTime(null);
      setMatchedMorningSelection(null);
      dispatch(update({ morningSelection: null }));
    }
  };

  const toggleFavorite = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsFavorite(!isFavorite);
    console.log("Favorite toggled for provider:", props.serviceproviderid, "New status:", !isFavorite);
  };

  const checkMissingTimeSlots = () => {
    const expectedTimeSlots = [
      "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
      "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];

    const missing = expectedTimeSlots.filter(slot => !props.availableTimeSlots?.includes(slot));
    setMissingSlots(missing);
  };

  const toggleExpand = async () => {
    setIsExpanded(!isExpanded);

    if (!isExpanded) {
      try {
        if (props.serviceproviderid === bookingType?.serviceproviderId) {
          setMatchedMorningSelection(bookingType?.morningSelection || null);
          setMatchedEveningSelection(bookingType?.eveningSelection || null);
        } else {
          setMatchedMorningSelection(null);
          setMatchedEveningSelection(null);
        }
      } catch (error) {
        console.error("Error fetching engagement data:", error);
      }
    }
  };

  const handleViewDetails = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    return moment().diff(moment(dob), "years");
  };

  const getAge = () => {
    if (props.age) {
      return props.age;
    }
    
    if (props.dob) {
      return calculateAge(props.dob);
    }
    
    return "";
  };

  const handleBookNow = () => {
    let booking: Bookingtype;

    if (props.housekeepingrole !== "NANNY") {
      booking = {
        serviceproviderId: props.serviceproviderid,
        eveningSelection: eveningSelectionTime,
        morningSelection: morningSelectionTime,
        ...bookingType
      };
    } else {
      booking = {
        serviceproviderId: props.serviceproviderid,
        timeRange: `${startTime} - ${endTime}`,
        duration: getHoursDifference(startTime, endTime),
        ...bookingType
      };
    }

    if (bookingType) {
      dispatch(update(booking));
    } else {
      dispatch(add(booking));
    }

    const providerDetails = {
      ...props,
      selectedMorningTime: morningSelection,
      selectedEveningTime: eveningSelection
    };
    props.selectedProvider(providerDetails);
  };

  const getHoursDifference = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return (endTotalMinutes - startTotalMinutes) / 60;
  };

  const handleLogin = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBookingPage = (e: string | undefined) => {
    setOpen(false);
  };

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    validateTimeRange(newStartTime, endTime);
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    validateTimeRange(startTime, newEndTime);
  };

  const validateTimeRange = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    if (endTotalMinutes - startTotalMinutes < 240) {
      setWarning("The time range must be at least 4 hours.");
    } else {
      setWarning("");
    }
  };
  
  // Fixed: Get availability status for the chip
  const getAvailabilityStatus = () => {
    if (!props.monthlyAvailability) return "Available";
    
    if (props.monthlyAvailability.fullyAvailable) {
      return "Fully Available";
    } else {
      const exceptions = props.monthlyAvailability.exceptions?.length || 0;
      if (exceptions > 0) {
        return `Partially Available (${exceptions} exception${exceptions > 1 ? 's' : ''})`;
      }
      // FIXED: Changed from "Available" to "Partially Available"
      return "Partially Available";
    }
  };

  // Fixed: Get availability chip class
  const getAvailabilityChipClass = () => {
    if (!props.monthlyAvailability) return "";
    
    if (props.monthlyAvailability.fullyAvailable) {
      return ""; // Default class for fully available
    } else {
      // Apply "partial" class for all non-fully available cases
      return "partial";
    }
  };

  // NEW: Helper function to get appropriate availability message
  const getAvailabilityMessage = () => {
    if (!props.monthlyAvailability) {
      return "Availability not specified";
    }
    
    if (props.monthlyAvailability.fullyAvailable) {
      return `Available at ${formatTimeForDisplay(props.monthlyAvailability.preferredTime)}`;
    }
    
    const exceptions = props.monthlyAvailability.exceptions?.length || 0;
    
    if (exceptions > 20) {
      return "Very limited availability";
    } else if (exceptions > 10) {
      return "Limited availability this month";
    } else if (exceptions > 0) {
      return `Usually available at ${formatTimeForDisplay(props.monthlyAvailability.preferredTime)}`;
    }
    
    return `Available at ${formatTimeForDisplay(props.monthlyAvailability.preferredTime)}`;
  };

  // NEW: Helper function to get time icon color based on availability
  const getTimeIconColor = () => {
    if (!props.monthlyAvailability) return "disabled";
    
    if (props.monthlyAvailability.fullyAvailable) {
      return "success";
    }
    
    const exceptions = props.monthlyAvailability.exceptions?.length || 0;
    
    if (exceptions > 10) {
      return "warning";
    } else if (exceptions > 0) {
      return "primary";
    }
    
    return "primary";
  };

  const { appUser } = useAppUser();

  useEffect(() => {
    if (appUser?.role === 'CUSTOMER') {
      setLoggedInUser(user);
    }
  }, [appUser]);

  if (!hasCheckedRef.current) {
    checkMissingTimeSlots();
    hasCheckedRef.current = true;
  }

  const dietImage = dietImages[props.diet as keyof typeof dietImages];
  const isBookNowEnabled = 
    (morningSelection !== null || eveningSelection !== null) || 
    (matchedMorningSelection !== null || matchedEveningSelection !== null);

  const providerDetailsData: any = {
    ...props,
    serviceproviderid: props.serviceproviderid,
    serviceproviderId: props.serviceproviderid,
    selectedMorningTime: morningSelection,
    selectedEveningTime: eveningSelection,
    matchedMorningSelection,
    matchedEveningSelection,
    startTime,
    endTime
  };

  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return "08:00 AM";
    return moment(timeString, "HH:mm").format("hh:mm A");
  };

  const age = getAge();
  const gender = props.gender === "MALE" ? "M" : "F";
  
  const getInitials = () => {
    return `${props.firstname?.[0] || ''}${props.lastname?.[0] || ''}`.toUpperCase();
  };

  return (
    <>
      <ProviderCard sx={{
        '@media (max-width: 900px)': {
          borderRadius: 12,
        },
        '@media (max-width: 600px)': {
          borderRadius: 10,
          marginTop: 2
        }
      }}>
        {props.bestMatch && (
          <BestMatchRibbon sx={{
            '@media (max-width: 900px)': {
              top: 8,
              left: 8,
              fontSize: '0.65rem',
              padding: '2px 8px',
            }
          }}>
            <LocalFireDepartmentIcon fontSize="small" />
            <span>Best Match</span>
          </BestMatchRibbon>
        )}
        
        <CardContent sx={{ 
          p: 3,
          '@media (max-width: 900px)': {
            p: 2,
          },
          '@media (max-width: 600px)': {
            p: 1.5,
          }
        }}>
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={isMobile ? 2 : 3} 
            alignItems="flex-start"
          >
            <Box flex={1} sx={{
              width: isMobile ? '100%' : 'auto'
            }}>
              <Stack 
                direction={isMobile ? "column" : "row"} 
                justifyContent="space-between" 
                alignItems={isMobile ? "flex-start" : "flex-start"}
                spacing={isMobile ? 2 : 0}
              >
                <Box sx={{
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={1} 
                    flexWrap="wrap"
                    sx={{
                      '@media (max-width: 600px)': {
                        mt: 2,
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} sx={{
                      '@media (max-width: 900px)': {
                        fontSize: '1.1rem',
                      },
                      '@media (max-width: 600px)': {
                        fontSize: '1rem',
                      }
                    }}>
                      {props.firstname} {props.lastname}
                    </Typography>
                    <Chip 
                      label={`${gender}, ${age}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.7rem',
                          height: 22,
                        }
                      }}
                    />
                  </Stack>
                  
                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={isMobile ? 1 : 2} 
                    mt={1} 
                    alignItems={isMobile ? "flex-start" : "center"}
                    flexWrap="wrap"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <RestaurantIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.8rem',
                        }
                      }}>
                        {props.diet}
                      </Typography>
                    </Stack>
                    
                    <Divider 
                      orientation="vertical" 
                      flexItem 
                      sx={{
                        display: isMobile ? 'none' : 'flex'
                      }} 
                    />
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LanguageIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.8rem',
                        }
                      }}>
                        {props.languageknown?.[0] || "English"}
                      </Typography>
                    </Stack>
                    
                    <Divider 
                      orientation="vertical" 
                      flexItem 
                      sx={{
                        display: isMobile ? 'none' : 'flex'
                      }} 
                    />
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.8rem',
                        }
                      }}>
                        {props.locality || "Nearby"}
                      </Typography>
                    </Stack>
                  </Stack>
              
                  <Box mt={2} sx={{
                    '@media (max-width: 600px)': {
                      mt: 1.5,
                    }
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.8rem',
                        }
                      }}>
                        Availability
                      </Typography>
                  
                    </Stack>
                    
                    {/* FIXED: Availability message section with proper logic */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{
                      '@media (max-width: 900px)': {
                        flexWrap: 'wrap',
                        gap: 1,
                      }
                    }}>
                      <AccessTimeIcon fontSize="small" color={getTimeIconColor()} />
                      <Typography variant="body1" fontWeight={500} sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.9rem',
                        }
                      }}>
                        {getAvailabilityMessage()}
                      </Typography>
                    <Chip 
  label={
    props.monthlyAvailability?.summary?.daysAtPreferredTime >= 30 
      ? "Monthly" 
      : "Short Term"
  } 
  size="small" 
  color="primary" 
  variant="outlined"
  sx={{
    '@media (max-width: 600px)': {
      fontSize: '0.7rem',
      height: 22,
    }
  }}
/>
                          <AvailabilityChip
                        label={getAvailabilityStatus()}
                        size="small"
                        className={getAvailabilityChipClass()}
                        sx={{
                          '@media (max-width: 600px)': {
                            fontSize: '0.65rem',
                            height: 20,
                          }
                        }}
                      />
                    </Stack>
                    
                    {/* Show exceptions count if any */}
                    {props.monthlyAvailability?.exceptions && props.monthlyAvailability.exceptions.length > 0 && (
                      <Typography 
                        variant="caption" 
                        color="warning.main"
                        sx={{ 
                          display: 'block', 
                          mt: 0.5,
                          fontWeight: 500,
                          '@media (max-width: 600px)': {
                            fontSize: '0.7rem',
                          }
                        }}
                      >
                        ⚠️ {props.monthlyAvailability.exceptions.length} schedule exception(s) this month
                      </Typography>
                    )}
                    
                    {/* Show fully available message */}
                    {props.monthlyAvailability?.fullyAvailable && (
                      <Typography 
                        variant="caption" 
                        color="success.main"
                        sx={{ 
                          display: 'block', 
                          mt: 0.5,
                          fontWeight: 500,
                          '@media (max-width: 600px)': {
                            fontSize: '0.7rem',
                          }
                        }}
                      >
                        ✓ Fully available all month
                      </Typography>
                    )}
                    
                    {/* Show partially available message (when not fully available but no exceptions) */}
                    {props.monthlyAvailability && !props.monthlyAvailability.fullyAvailable && 
                     (!props.monthlyAvailability.exceptions || props.monthlyAvailability.exceptions.length === 0) && (
                      <Typography 
                        variant="caption" 
                        color="warning.main"
                        sx={{ 
                          display: 'block', 
                          mt: 0.5,
                          fontWeight: 500,
                          '@media (max-width: 600px)': {
                            fontSize: '0.7rem',
                          }
                        }}
                      >
                        ⚠️ Partially available this month
                      </Typography>
                    )}
                  </Box>
                  
                  {props.otherServices && (
                    <Box mt={2} sx={{
                      '@media (max-width: 600px)': {
                        mt: 1.5,
                      }
                    }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.8rem',
                        }
                      }}>
                        Additional Services
                      </Typography>
                      <Typography variant="body2" sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.8rem',
                        }
                      }}>
                        {props.otherServices}
                      </Typography>
                    </Box>
                  )}
                </Box>
             
                <Divider 
                  orientation="vertical" 
                  flexItem 
                  sx={{ 
                    mr: -60,
                    display: isMobile ? 'none' : 'flex'
                  }} 
                />
                
                <Box mt={isMobile ? 2 : -0.5} sx={{
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    mt={isMobile ? 0 : 2}
                    width="100%"
                    justifyContent="space-between"
                    sx={{
                      '@media (max-width: 600px)': {
                        spacing: 1,
                        gap: 1,
                      }
                    }}
                  >
                    <MetricBox sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      minWidth: 'auto',
                      padding: '10px 12px',
                      mb: isMobile ? 0 : 0,
                    }}>
                      <Typography variant="h6" color="primary" fontWeight={600} sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '1rem',
                        }
                      }}>
                        {props.distance_km || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.7rem',
                          marginLeft: 'auto',
                        }
                      }}>
                        km away
                      </Typography>
                    </MetricBox>

                    <MetricBox sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      minWidth: 'auto',
                      padding: '10px 12px',
                      mb: isMobile ? 0 : 0,
                    }}>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{
                        flex: 1,
                      }}>
                        <StarIcon fontSize="small" color="warning" />
                        <Typography variant="h6" fontWeight={600} sx={{
                          '@media (max-width: 600px)': {
                            fontSize: '1rem',
                          }
                        }}>
                          {props.rating?.toFixed(1)}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.7rem',
                          marginLeft: 'auto',
                        }
                      }}>
                        {props.rating} reviews
                      </Typography>
                    </MetricBox>

                    <MetricBox sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      minWidth: 'auto',
                      padding: '10px 12px',
                      mb: isMobile ? 0 : 0,
                    }}>
                      <Typography variant="h6" color="success.main" fontWeight={600} sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '1rem',
                        }
                      }}>
                        {props.experience || 12}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{
                        '@media (max-width: 600px)': {
                          fontSize: '0.7rem',
                          marginLeft: 'auto',
                        }
                      }}>
                        yrs experience
                      </Typography>
                    </MetricBox>
                  </Stack>
                </Box>
              </Stack>
            </Box>
            
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{
                display: isMobile ? 'none' : 'flex'
              }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'row' : 'column', 
              gap: isMobile ? 1 : 2, 
              minWidth: isMobile ? '100%' : 140,
              justifyContent: isMobile ? 'space-between' : 'flex-start',
              alignItems: isMobile ? 'center' : 'stretch',
              ...(isMobile && {
                borderTop: '1px solid #e0e0e0',
                pt: 2,
                mt: 2,
              })
            }}>
              {props.housekeepingrole && (
                <Chip 
                  label={props.housekeepingrole}
                  color="primary"
                  variant="filled"
                  size="small"
                  sx={{ 
                    alignSelf: isMobile ? 'flex-start' : 'center',
                    '@media (max-width: 600px)': {
                      fontSize: '0.7rem',
                      height: 22,
                    }
                  }}
                />
              )}
              <Button 
                variant="outlined" 
                size="medium"
                fullWidth={!isMobile}
                startIcon={<InfoOutlinedIcon />}
                onClick={handleViewDetails}
                sx={{ 
                  borderRadius: 2,
                  ...(isMobile && {
                    minWidth: 'auto',
                    flex: 1,
                  }),
                  '@media (max-width: 600px)': {
                    fontSize: '0.85rem',
                    px: 1,
                    minHeight: 36,
                  }
                }}
              >
                {isMobile ? "Details" : "View Details"}
              </Button>
              
              <Button 
                variant="contained" 
                size="medium"
                fullWidth={!isMobile}
                onClick={handleLogin}
                sx={{ 
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: 2,
                  ...(isMobile && {
                    minWidth: 'auto',
                    flex: 1,
                  }),
                  '@media (max-width: 600px)': {
                    fontSize: '0.85rem',
                    px: 1,
                    minHeight: 36,
                  },
                  '&:hover': {
                    boxShadow: 4,
                  }
                }}
              >
                {isMobile ? "Book" : "Book Now"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </ProviderCard>

      <ProviderAvailabilityDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        provider={props}
      />

      {props.housekeepingrole === "COOK" && 
        <CookServicesDialog 
          open={open} 
          handleClose={handleClose} 
          providerDetails={providerDetailsData} 
          sendDataToParent={props.sendDataToParent} 
        />
      }
      
      {props.housekeepingrole === "MAID" && 
        <MaidServiceDialog 
          open={open} 
          handleClose={handleClose} 
          providerDetails={providerDetailsData} 
          sendDataToParent={props.sendDataToParent} 
        />
      }
      
      {props.housekeepingrole === "NANNY" && 
        <NannyServicesDialog 
          open={open} 
          handleClose={handleClose} 
          providerDetails={providerDetailsData} 
          sendDataToParent={props.sendDataToParent} 
        />
      }
    </>
  );
};

export default ProviderDetails;