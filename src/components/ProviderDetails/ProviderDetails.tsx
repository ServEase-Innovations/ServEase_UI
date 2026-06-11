/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
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
import { Info } from "lucide-react";
import { Button } from "../Button/button";
import { styled } from "@mui/material/styles";
import moment from "moment";
import "./ProviderDetails.css"; 
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Bookingtype } from "../../types/bookingTypeData";
import { useDispatch, useSelector } from "react-redux";
import {
  add,
  update,
  openBookingDialog,
  closeBookingDialog,
} from "../../features/bookingType/bookingTypeSlice";
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
import {ServiceProviderDTO } from "../../types/ProviderDetailsType";
import { useAppUser } from "src/context/AppUserContext";
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ProviderAvailabilityDrawer from "./ProviderAvailabilityDrawer";
import { useLanguage } from "src/context/LanguageContext";
import HistoryIcon from '@mui/icons-material/History';
import { resolveEffectiveServiceRole, resolveProviderId } from "src/utils/providerId";
import {
  formatProviderDisplayName,
  providerInitials,
  trimNamePart,
} from "src/utils/providerDisplayName";

interface ProviderDetailsProps extends ServiceProviderDTO  {
  selectedProvider: (provider: ServiceProviderDTO) => void;
  availableTimeSlots?: string[];
  sendDataToParent?: (data: string) => void;
}

// Styled components
const BestMatchBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`,
  color: theme.palette.warning.contrastText,
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.25)}`,
  borderRadius: 999,
  boxShadow: '0 4px 12px -2px rgba(245, 158, 11, 0.45)',
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.02em',
  border: '1px solid rgba(255,255,255,0.25)',
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.spacing(0.35)} ${theme.spacing(1)}`,
    fontSize: '0.65rem',
  },
}));

const PreviouslyBookedBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`,
  color: theme.palette.info.contrastText,
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.25)}`,
  borderRadius: 999,
  boxShadow: '0 4px 12px -2px rgba(14, 165, 233, 0.35)',
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.02em',
  border: '1px solid rgba(255,255,255,0.2)',
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.spacing(0.35)} ${theme.spacing(1)}`,
    fontSize: '0.65rem',
  },
}));

const ProviderCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  borderRadius: 20,
  overflow: 'visible',
  transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.2s ease',
  border: '1px solid',
  borderColor: selected ? theme.palette.primary.main : 'rgba(15, 23, 42, 0.08)',
  position: 'relative',
  background: selected
    ? `linear-gradient(145deg, ${theme.palette.primary.light}18 0%, ${theme.palette.background.paper} 42%)`
    : theme.palette.background.paper,
  boxShadow: selected
    ? `0 12px 32px -10px ${theme.palette.primary.main}55`
    : '0 4px 20px -6px rgba(15, 23, 42, 0.1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 16px 36px -10px rgba(15, 23, 42, 0.14)',
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
  },
}));

const AvailabilityChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  borderRadius: 999,
  border: 'none',
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.dark,
  '&.partial': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  '&.limited': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
}));

const ProviderDetails: React.FC<ProviderDetailsProps> = (props) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);
  const [eveningSelection, setEveningSelection] = useState<number | null>(null);
  const [morningSelection, setMorningSelection] = useState<number | null>(null);
  const [eveningSelectionTime, setEveningSelectionTime] = useState<string | null>(null);
  const [morningSelectionTime, setMorningSelectionTime] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState();
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
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const hasCheckedRef = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const dispatch = useDispatch();
  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const activeBookingDialogProviderId = useSelector(
    (state: { bookingType?: { activeBookingDialogProviderId?: string | null } }) =>
      state.bookingType?.activeBookingDialogProviderId ?? null
  );
  const user = useSelector((state: any) => state.user?.value);

  const resolvedProviderId = resolveProviderId(
    props as unknown as Record<string, unknown>
  );
  const resolvedProviderIdStr = resolvedProviderId ?? null;
  const open =
    resolvedProviderIdStr != null &&
    activeBookingDialogProviderId === resolvedProviderIdStr;

  const effectiveServiceRole = resolveEffectiveServiceRole(
    bookingType?.housekeepingRole,
    props
  );

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
        if (resolvedProviderIdStr === String(bookingType?.serviceproviderId ?? "")) {
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

  const handleViewDetails = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Set the selected card ID to this provider's ID
    setSelectedCardId(resolvedProviderIdStr);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Clear the selected card when drawer closes
    setSelectedCardId(null);
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

  const syncProviderIntoBookingStore = () => {
    let booking: Bookingtype;

    if (effectiveServiceRole !== "NANNY") {
      booking = {
        serviceproviderId: resolvedProviderId,
        eveningSelection: eveningSelectionTime,
        morningSelection: morningSelectionTime,
        ...bookingType,
      };
    } else {
      booking = {
        serviceproviderId: resolvedProviderId,
        timeRange: `${startTime} - ${endTime}`,
        duration: getHoursDifference(startTime, endTime),
        ...bookingType,
      };
    }

    if (bookingType) {
      dispatch(update(booking));
    } else {
      dispatch(add(booking));
    }
  };

  const getHoursDifference = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return (endTotalMinutes - startTotalMinutes) / 60;
  };

  const handleBookNow = () => {
    if (!resolvedProviderIdStr) {
      alert(
        "We could not load this provider's profile. Please go back and try another provider."
      );
      return;
    }
    syncProviderIntoBookingStore();
    const payload = {
      ...providerDetailsData,
      housekeepingRole: effectiveServiceRole,
    };
    props.selectedProvider(payload);

    if (
      effectiveServiceRole === "MAID" ||
      effectiveServiceRole === "COOK" ||
      effectiveServiceRole === "NANNY"
    ) {
      dispatch(openBookingDialog(resolvedProviderIdStr));
    }
  };

  const handleClose = () => {
    dispatch(closeBookingDialog());
  };

  const handleBookingPage = (e: string | undefined) => {
    dispatch(closeBookingDialog());
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
      setWarning(t('timeRangeWarning'));
    } else {
      setWarning("");
    }
  };
  
  const getAvailabilityStatus = () => {
    if (!props.monthlyAvailability) return t('available');
    
    if (props.monthlyAvailability.fullyAvailable) {
      return t('fullyAvailable');
    }
    return t('partiallyAvailable');
  };

  const getAvailabilityChipClass = () => {
    if (!props.monthlyAvailability) return "";
    
    if (props.monthlyAvailability.fullyAvailable) {
      return "";
    } else {
      return "partial";
    }
  };

  const getAvailabilityMessage = () => {
    if (!props.monthlyAvailability) {
      return t('availabilityNotSpecified');
    }
    
    if (props.monthlyAvailability.fullyAvailable) {
      return `${t('availableAt')} ${formatTimeForDisplay(props.monthlyAvailability.preferredTime)}`;
    }
    
    const exceptions = props.monthlyAvailability.exceptions?.length || 0;
    
    if (exceptions > 20) {
      return t('veryLimitedAvailability');
    } else if (exceptions > 10) {
      return t('limitedAvailability');
    } else if (exceptions > 0) {
      return `${t('usuallyAvailableAt')} ${formatTimeForDisplay(props.monthlyAvailability.preferredTime)}`;
    }
    
    return `${t('availableAt')} ${formatTimeForDisplay(props.monthlyAvailability.preferredTime)}`;
  };

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

  const isBookNowEnabled = 
    (morningSelection !== null || eveningSelection !== null) || 
    (matchedMorningSelection !== null || matchedEveningSelection !== null);

  const providerDetailsData: any = {
    ...props,
    serviceproviderid: resolvedProviderId,
    serviceProviderId: resolvedProviderId,
    serviceproviderId: resolvedProviderId,
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
  
  const displayName = formatProviderDisplayName(props);
  const avatarInitials = providerInitials(props);
  const avatarImage =
    typeof props.profilePic === "string" && props.profilePic.trim()
      ? props.profilePic.trim()
      : null;

  // Helper function to get all languages as array
  const getAllLanguages = (): string[] => {
    const languages = props.languageknown;
    if (!languages) return [];
    
    if (Array.isArray(languages)) {
      return languages;
    }
    
    if (typeof languages === 'string') {
      return languages.split(',').map(lang => lang.trim());
    }
    
    return [];
  };

  // Helper function to format rating display
  const formatRating = () => {
    if (!props.rating || props.rating === 0) {
      return "0.0";
    }
    return props.rating.toFixed(1);
  };

  // Helper function to get rating value
  const getRatingValue = () => {
    if (!props.rating || props.rating === 0) {
      return 0;
    }
    return props.rating;
  };

  const allLanguages = getAllLanguages();
  const hasLanguages = allLanguages.length > 0;
  const hasBadges = Boolean(props.bestMatch || props.previouslyBooked);

  return (
    <>
      <ProviderCard 
        selected={selectedCardId === resolvedProviderIdStr}
        sx={{
          '@media (max-width: 900px)': {
            borderRadius: 12,
          },
          '@media (max-width: 600px)': {
            borderRadius: 10,
            marginTop: 2
          }
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } },
            background: theme.palette.background.paper,
          }}
        >
          <Stack spacing={2.25}>
            {hasBadges && (
              <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                {props.bestMatch && (
                  <BestMatchBadge>
                    <LocalFireDepartmentIcon sx={{ fontSize: 18 }} />
                    <span>{t('bestMatch')}</span>
                  </BestMatchBadge>
                )}
                {props.previouslyBooked && (
                  <PreviouslyBookedBadge>
                    <HistoryIcon sx={{ fontSize: 18 }} />
                    <span>{t('previouslyBooked')}</span>
                  </PreviouslyBookedBadge>
                )}
              </Stack>
            )}

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', md: 'flex-start' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="flex-start" flex={1} minWidth={0}>
                <Avatar
                  src={avatarImage ?? undefined}
                  alt={displayName || "Service provider"}
                  sx={{
                    width: { xs: 52, md: 56 },
                    height: { xs: 52, md: 56 },
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px -4px rgba(14, 165, 233, 0.45)',
                  }}
                >
                  {avatarInitials}
                </Avatar>
                <Box flex={1} minWidth={0}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    flexWrap="wrap"
                    columnGap={1.5}
                    rowGap={0.75}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{
                        letterSpacing: '-0.02em',
                        fontSize: { xs: '1.05rem', md: '1.2rem' },
                      }}
                    >
                      {displayName || `${trimNamePart(props.firstName)} ${trimNamePart(props.lastName)}`.trim()}
                    </Typography>
                    <Chip
                      label={`${gender}, ${age}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 999,
                        fontWeight: 600,
                        borderColor: 'rgba(15, 23, 42, 0.12)',
                        bgcolor: 'action.hover',
                      }}
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    flexWrap="wrap"
                    columnGap={1.5}
                    rowGap={1}
                    mt={1.25}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <RestaurantIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {props.diet}
                      </Typography>
                    </Stack>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: 'text.disabled', display: { xs: 'none', sm: 'inline' } }}
                    >
                      ·
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap gap={0.5}>
                      <LanguageIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      {hasLanguages ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {allLanguages.map((language, index) => (
                            <Chip
                              key={index}
                              label={language}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 24,
                                fontSize: '0.75rem',
                                borderRadius: 999,
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {t('notSpecified')}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </Stack>

              {props?.housekeepingRoles && props.housekeepingRoles.length > 0 && (
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  useFlexGap
                  gap={1}
                  justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                  sx={{ flexShrink: 0, maxWidth: { md: 320 } }}
                >
                  {props.housekeepingRoles.map((role, index) => (
                    <Chip
                      key={`${role}-${index}`}
                      label={role}
                      color="primary"
                      variant="filled"
                      size="small"
                      sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                bgcolor: 'grey.50',
              }}
            >
              <Box
                sx={{
                  py: 1.5,
                  px: 1,
                  textAlign: 'center',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" color="primary" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  {props.distance_km ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.35, display: 'block' }}>
                  {t('kmAway')}
                </Typography>
              </Box>
              <Box
                sx={{
                  py: 1.5,
                  px: 1,
                  textAlign: 'center',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  <StarIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {formatRating()}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.35, display: 'block' }}>
                  {getRatingValue() === 0 ? t('Ratings') : t('reviews')}
                </Typography>
              </Box>
              <Box sx={{ py: 1.5, px: 1, textAlign: 'center' }}>
                <Typography variant="h6" color="success.main" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  {props.experience ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.35, display: 'block' }}>
                  {t('yrsExperience')}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderLeftWidth: 4,
                borderLeftColor: 'primary.main',
                bgcolor: 'rgba(248, 250, 252, 0.92)',
                p: { xs: 1.75, sm: 2 },
              }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: '0.08em', display: 'block', mb: 1 }}
              >
                {t('availability')}
              </Typography>
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.25}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  flexWrap="wrap"
                  useFlexGap
                  gap={1}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start" flex={1} minWidth={0}>
                    <AccessTimeIcon fontSize="small" color={getTimeIconColor()} sx={{ mt: 0.2 }} />
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {getAvailabilityMessage()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                    {props.monthlyAvailability && (
                      <Chip
                        label={
                          props.monthlyAvailability.summary?.totalDays >= 30
                            ? t('monthly')
                            : t('shortTerm')
                        }
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    <AvailabilityChip
                      label={getAvailabilityStatus()}
                      size="small"
                      className={getAvailabilityChipClass()}
                    />
                  </Stack>
                </Stack>

                {props.monthlyAvailability?.exceptions &&
                  props.monthlyAvailability.exceptions.length > 0 && (
                    <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500, display: 'block' }}>
                      ⚠️ {props.monthlyAvailability.exceptions.length} {t('scheduleExceptionsCount')}
                    </Typography>
                  )}

                {props.monthlyAvailability?.fullyAvailable && (
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 500, display: 'block' }}>
                    ✓ {t('fullyAvailableAllMonth')}
                  </Typography>
                )}

                {props.monthlyAvailability &&
                  !props.monthlyAvailability.fullyAvailable &&
                  (!props.monthlyAvailability.exceptions ||
                    props.monthlyAvailability.exceptions.length === 0) && (
                    <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500, display: 'block' }}>
                      ⚠️ {t('partiallyAvailableMonth')}
                    </Typography>
                  )}
              </Stack>
            </Box>

            {props.otherServices && (
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.06em' }}>
                  {t('additionalServices')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75 }}>
                  {props.otherServices}
                </Typography>
              </Box>
            )}

            <Divider sx={{ borderColor: 'rgba(15, 23, 42, 0.08)' }} />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.25}
              justifyContent="flex-end"
              alignItems="stretch"
            >
              <Button
                variant="outline"
                fullWidth={isMobile}
                startIcon={<Info className="h-4 w-4" />}
                onClick={handleViewDetails}
                className="min-h-[42px] sm:min-w-[168px] font-semibold"
              >
                {isMobile ? t('details') : t('viewDetails')}
              </Button>

              <Button
                variant="cta"
                fullWidth={isMobile}
                onClick={handleBookNow}
                className="min-h-[42px] sm:min-w-[168px]"
              >
                {isMobile ? t('book') : t('bookNow')}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </ProviderCard>

      <ProviderAvailabilityDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        provider={props}
      />

      {effectiveServiceRole === "COOK" && (
        <CookServicesDialog
          open={open}
          handleClose={handleClose}
          providerDetails={{
            ...providerDetailsData,
            housekeepingRole: effectiveServiceRole,
          }}
          sendDataToParent={props.sendDataToParent}
        />
      )}

      {effectiveServiceRole === "MAID" && (
        <MaidServiceDialog
          open={open}
          handleClose={handleClose}
          providerDetails={{
            ...providerDetailsData,
            housekeepingRole: effectiveServiceRole,
          }}
          sendDataToParent={props.sendDataToParent}
        />
      )}

      {effectiveServiceRole === "NANNY" && (
        <NannyServicesDialog
          open={open}
          handleClose={handleClose}
          providerDetails={{
            ...providerDetailsData,
            housekeepingRole: effectiveServiceRole,
          }}
          sendDataToParent={props.sendDataToParent}
        />
      )}
    </>
  );
};

export default ProviderDetails;