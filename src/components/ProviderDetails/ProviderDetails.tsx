/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { 
  Button, 
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
  CardActions
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

interface ProviderDetailsProps extends ServiceProviderDTO  {
  selectedProvider: (provider: ServiceProviderDTO) => void;
  availableTimeSlots?: string[];
  sendDataToParent?: (data: string) => void;
}

// Styled components
const PremiumBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  zIndex: 1,
  fontWeight: 700,
  fontSize: '0.7rem',
  backgroundColor: theme.palette.warning.main,
  color: theme.palette.warning.contrastText,
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

  const hasCheckedRef = useRef(false);

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

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    return moment().diff(moment(dob), "years");
  };

  // Get age from props or calculate from DOB
  const getAge = () => {
    // If age is directly provided in props, use it
    if (props.age) {
      return props.age;
    }
    
    // Otherwise calculate from DOB
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
    // Changed from alert to just opening the dialog
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
    selectedMorningTime: morningSelection,
    selectedEveningTime: eveningSelection,
    matchedMorningSelection,
    matchedEveningSelection,
    startTime,
    endTime
  };

  // Format time for display (e.g., "05:00" -> "05:00 AM")
  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return "";
    return moment(timeString, "HH:mm").format("hh:mm A");
  };

  const age = getAge();
  const gender = props.gender === "MALE" ? "M" : "F";
  
  // Get initials for avatar
  const getInitials = () => {
    return `${props.firstname?.[0] || ''}${props.lastname?.[0] || ''}`.toUpperCase();
  };

  return (
    <>
      <ProviderCard>
        {props.bestMatch && (
          <PremiumBadge
            icon={<LocalFireDepartmentIcon />}
            label="Best Match"
            size="small"
          />
        )}
        
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={3} alignItems="flex-start">
            {/* Left Section - Avatar & Metrics */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ProviderAvatar>
                {getInitials()}
              </ProviderAvatar>
              
              <Stack spacing={1} mt={2} width="100%">
                <MetricBox>
                  <Typography variant="h6" color="primary" fontWeight={600}>
                    {props.distance_km || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    km away
                  </Typography>
                </MetricBox>
                
                <MetricBox>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <StarIcon fontSize="small" color="warning" />
                    <Typography variant="h6" fontWeight={600}>
                      {props.rating?.toFixed(1) || '5.0'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {props.rating  || 5} reviews
                  </Typography>
                </MetricBox>
                
                <MetricBox>
                  <Typography variant="h6" color="success.main" fontWeight={600}>
                    {props.experience || 12}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    yrs experience
                  </Typography>
                </MetricBox>
              </Stack>
            </Box>
            
            <Divider orientation="vertical" flexItem />
            
            {/* Center Section - Provider Details */}
            <Box flex={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" fontWeight={600}>
                      {props.firstname} {props.lastname}
                    </Typography>
                    <Chip 
                      label={`${gender}, ${age}`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  
                  <Stack direction="row" spacing={2} mt={1} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <RestaurantIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {props.diet}
                      </Typography>
                    </Stack>
                    
                    <Divider orientation="vertical" flexItem />
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LanguageIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {props.languageknown?.[0] || "English"}
                      </Typography>
                    </Stack>
                    
                    <Divider orientation="vertical" flexItem />
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {props.locality || "Nearby"}
                      </Typography>
                    </Stack>
                  </Stack>
                  
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Availability
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <AccessTimeIcon fontSize="small" color="primary" />
                      <Typography variant="body1" fontWeight={500}>
                        Available at {formatTimeForDisplay(props.monthlyAvailability?.preferredTime) || "08:00 AM"}
                      </Typography>
                      <Chip 
                        label="Monthly" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                  
                  {props.otherServices && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Additional Services
                      </Typography>
                      <Typography variant="body2">
                        {props.otherServices}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <IconButton 
                  onClick={toggleFavorite}
                  color={isFavorite ? "error" : "default"}
                  size="small"
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Stack>
            </Box>
            
            <Divider orientation="vertical" flexItem />
            
            {/* Right Section - Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 140 }}>
              <Button 
                variant="outlined" 
                size="medium"
                fullWidth
                startIcon={<InfoOutlinedIcon />}
                onClick={toggleExpand}
                sx={{ borderRadius: 2 }}
              >
                View Details
              </Button>
              
              {/* CHANGED: Book Monthly button to Book Now button */}
              <Button 
                variant="contained" 
                size="medium"
                fullWidth
                onClick={handleLogin}  // Changed from handleBookNow to handleLogin
                
                // sx={{ 
                //   borderRadius: 2,
                //   fontWeight: 600,
                //   boxShadow: 2,
                //   '&:hover': {
                //     boxShadow: 4,
                //   }
                // }}
              >
                Book Now 
              </Button>
              
              {props.housekeepingrole && (
                <Chip 
                  label={props.housekeepingrole}
                  color="primary"
                  variant="filled"
                  size="small"
                  sx={{ alignSelf: 'center' }}
                />
              )}
            </Box>
          </Stack>
        </CardContent>
      </ProviderCard>

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