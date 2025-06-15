/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, TextField, Tooltip, Typography } from "@mui/material";
import moment from "moment";
import "./ProviderDetails.css"; 
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
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
import { EnhancedProviderDetails } from "../../types/ProviderDetailsType";

interface ProviderDetailsProps {
  housekeepingRole: string;
  selectedProvider: (provider: any) => void;
  serviceproviderId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;
  diet: string;
  language?: string;
  experience?: string;
  otherServices?: string;
  availableTimeSlots?: string[];
}

const ProviderDetails: React.FC<ProviderDetailsProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const hasCheckedRef = useRef(false);

  const dietImages = {
    VEG: "veg.png",
    NONVEG: "nonveg.png",
    BOTH: "nonveg.png",
  };

  const dispatch = useDispatch();
  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const user = useSelector((state: any) => state.user?.value);

  // Handle selection for morning or evening availability
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
        if (props.serviceproviderId === bookingType?.serviceproviderId) {
          setMatchedMorningSelection(bookingType?.morningSelection || null);
          setMatchedEveningSelection(bookingType?.eveningSelection || null);
        } else {
          setMatchedMorningSelection(null);
          setMatchedEveningSelection(null);
        }

        const response = await axiosInstance.get(
          `/api/serviceproviders/get/engagement/by/serviceProvider/${props.serviceproviderId}`
        );

        const engagementData = response.data.map((engagement: { id?: number; availableTimeSlots?: string[] }) => ({
          id: engagement.id ?? Math.random(),
          availableTimeSlots: engagement.availableTimeSlots || [],
        }));

        const fullTimeSlots: string[] = Array.from({ length: 24 }, (_, i) =>
          `${i.toString().padStart(2, "0")}:00`
        );

        const processedSlots = engagementData.map((entry: any) => {
          const uniqueAvailableTimeSlots = Array.from(new Set(entry.availableTimeSlots)).sort();
          const missingTimeSlots = fullTimeSlots.filter(slot => !uniqueAvailableTimeSlots.includes(slot));

          return {
            id: entry.id,
            uniqueAvailableTimeSlots,
            missingTimeSlots,
          };
        });

        const uniqueMissingSlots: string[] = Array.from(
          new Set(processedSlots.flatMap((slot: any) => slot.missingTimeSlots))
        ).sort() as string[];

        setUniqueMissingSlots(uniqueMissingSlots);
        setAvailableTimeSlots(processedSlots.map((entry: any) => entry.uniqueAvailableTimeSlots));
      } catch (error) {
        console.error("Error fetching engagement data:", error);
      }
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    return moment().diff(moment(dob), "years");
  };

  const handleBookNow = () => {
    let booking: Bookingtype;

    if (props.housekeepingRole !== "NANNY") {
      booking = {
        serviceproviderId: props.serviceproviderId,
        eveningSelection: eveningSelectionTime,
        morningSelection: morningSelectionTime,
        ...bookingType
      };
    } else {
      booking = {
        serviceproviderId: props.serviceproviderId,
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

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      setLoggedInUser(user);
    }
  }, [user]);

  if (!hasCheckedRef.current) {
    checkMissingTimeSlots();
    hasCheckedRef.current = true;
  }

  const dietImage = dietImages[props.diet as keyof typeof dietImages];
  const isBookNowEnabled = 
    (morningSelection !== null || eveningSelection !== null) || 
    (matchedMorningSelection !== null || matchedEveningSelection !== null);

  const providerDetailsData: EnhancedProviderDetails = {
    ...props,
    selectedMorningTime: morningSelection,
    selectedEveningTime: eveningSelection,
    matchedMorningSelection,
    matchedEveningSelection,
    startTime,
    endTime
  };

  return (
    <>
      <Paper elevation={3}>
        <div className="container-provider">
          <Button
            variant="outlined"
            className="expand-toggle"
            onClick={toggleExpand}
            sx={{ border: '1px solid #1976d2', color: '#1976d2', padding: '8px', fontSize: '24px', position: 'absolute', top: 10, right: 10 }}
          >
            {isExpanded ? <RemoveIcon /> : <AddIcon />}
          </Button>
          <Button
            variant="outlined"
            className="expand-toggle"
            onClick={handleLogin}
            sx={{ border: '1px solid #1976d2', color: '#1976d2', padding: '8px', fontSize: '14px', position: 'absolute', top: 10, right: 80 }}
          >
            Book Now
          </Button>

          <div className={`content ${isExpanded ? "expanded" : ""}`}>
            <div className="essentials">
              <Typography
                variant="subtitle1"
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.5px",
                  marginTop: "0.5px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                  {props.firstName} {props.middleName} {props.lastName}
                </span>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    marginLeft: "8px",
                  }}
                >
                  ({props.gender === "FEMALE" ? "F " : props.gender === "MALE" ? "M " : "O"}
                  {calculateAge(props.dob)})
                </span>
                <span style={{ display: "inline-block", marginLeft: "8px" }}>
                  <img
                    src={dietImage}
                    alt={props.diet}
                    style={{
                      width: "20px",
                      height: "20px",
                      verticalAlign: "middle",
                    }} />
                </span>
              </Typography>
            </div>

            {isExpanded && (
              <div>
                <Typography
                  variant="subtitle1"
                  style={{ fontWeight: "bold", marginBottom: "2px" }}
                >
                  Language:{" "}
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "1rem",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {props.language || "English"}
                  </span>
                </Typography>

                <Typography
                  variant="subtitle1"
                  style={{ fontWeight: "bold", marginBottom: "2px" }}
                >
                  Experience:{" "}
                  <span style={{ fontWeight: "normal", fontSize: "1rem" }}>
                    {props.experience || "1 year"}
                  </span>
                  , Other Services:{" "}
                  <span style={{ fontWeight: "normal", fontSize: "1.2rem", marginLeft: "8px" }}>
                    {props.otherServices || "N/A"}
                  </span>
                </Typography>
                
                <div style={{ float: 'right', display: 'flex' }}>
                  {warning && <p className="text-red-500">{warning}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </Paper>

      {props.housekeepingRole === "COOK" && 
        <CookServicesDialog 
          open={open} 
          handleClose={handleClose} 
          providerDetails={providerDetailsData} 
        />
      }
      
      {props.housekeepingRole === "MAID" && 
        <MaidServiceDialog 
          open={open} 
          handleClose={handleClose} 
          providerDetails={providerDetailsData} 
        />
      }
      
      {props.housekeepingRole === "NANNY" && 
        <NannyServicesDialog 
          open={open} 
          handleClose={handleClose} 
          providerDetails={providerDetailsData} 
        />
      }
    </>
  );
};

export default ProviderDetails;