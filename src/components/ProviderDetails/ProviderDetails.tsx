/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, TextField, Tooltip, Typography } from "@mui/material";
import moment from "moment";
import "./ProviderDetails.css"; 
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Bookingtype } from "../../types/bookingTypeData";
import { useDispatch, useSelector } from "react-redux";
import { add } from "../../features/bookingType/bookingTypeSlice";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Login from "../Login/Login";
import axiosInstance from "../../services/axiosInstance";
import TimeRange from 'react-time-range';
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { FaTimes } from "react-icons/fa";

const ProviderDetails = (props) => {
const [isExpanded, setIsExpanded] = useState(false);
  const [eveningSelection, setEveningSelection] = useState<number | null>(null);
  const [morningSelection, setMorningSelection] = useState<number | null>(null);
  const [eveningSelectionTime, setEveningSelectionTime] = useState<string | null>(null);
  const [morningSelectionTime, setMorningSelectionTime] = useState<string | null>(null);
  const [loggedInUser , setLoggedInUser ] = useState();
  const [open, setOpen] = useState(false);
  const [engagementData, setEngagementData] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [missingTimeSlots, setMissingTimeSlots] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [warning, setWarning] = useState("");
  

  const dietImages = {
    VEG: "veg.png",
    NONVEG: "nonveg.png",
    BOTH: "nonveg.png",
  };

  const dispatch = useDispatch();
  const bookingType = useSelector((state : any) => state.bookingType?.value)

// Handle selection for morning or evening availability
const handleSelection = (hour: number, isEvening: boolean, time: number) => {
  // Format the start and end times in HH:mm format (without seconds)
  const startTime = moment({ hour: time, minute: 0 }).format("HH:mm");
  const endTime = moment({ hour: time + 1, minute: 0 }).format("HH:mm");

  const formattedTime = `${startTime}-${endTime}`;
  console.log(`Start Time: ${startTime}, End Time: ${endTime}`); // Should show "06:00-07:00"

  // For morning or evening availability selection
  if (isEvening) {
    setEveningSelection(hour);
    setEveningSelectionTime(formattedTime); // Store "06:00-07:00"
  } else {
    setMorningSelection(hour);
    setMorningSelectionTime(formattedTime); // Store "06:00-07:00"
  }

  // Ensure you are sending the formatted data to the payload correctly.
  const payload = {
    timeslot: `${startTime}-${endTime}`, // Make sure the payload uses the correctly formatted time
  };
  console.log("Payload being sent:", payload); // Check if this logs the correct format without seconds
};

const clearSelection = (isEvening: boolean) => {
  if (isEvening) {
    setEveningSelection(null);
    setEveningSelectionTime(null);
  } else {
    setMorningSelection(null);
    setMorningSelectionTime(null);
  }
};
const [missingSlots, setMissingSlots] = useState<string[]>([]);
const hasCheckedRef = useRef(false); // Track if the function has been called
console.log("Service data: ", props);
// Call this function to check missing time slots
const checkMissingTimeSlots = () => {
  // console.log("Service Provider Data: ", props.availableTimeSlots);

  const expectedTimeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  // Get missing time slots
  const missing = expectedTimeSlots.filter(slot => !props.availableTimeSlots.includes(slot));

  // Set the missing slots to state
  setMissingSlots(missing);

  // Log the missing time slots
  if (missing.length > 0) {
    console.log("Missing time slots:", missing);
  } else {
    console.log("All expected time slots are available.");
  }
};

// Run this function only once on initial render
if (!hasCheckedRef.current) {
  checkMissingTimeSlots(); 
  hasCheckedRef.current = true;
}

  // Toggle expanded content
  const [uniqueMissingSlots, setUniqueMissingSlots] = useState<string[]>([]);

  const toggleExpand = async () => {
      setIsExpanded(!isExpanded);
  
      if (!isExpanded) {
          try {
              console.log("Service Provider Details:", props);
              console.log("Service serviceproviderId:", props.serviceproviderId);
  
              const response = await axiosInstance.get(
                  `/api/serviceproviders/get/engagement/by/serviceProvider/${props.serviceproviderId}`
              );
  
              const engagementData = response.data.map((engagement: { id?: number; availableTimeSlots?: string[] }) => ({
                  id: engagement.id ?? Math.random(),
                  availableTimeSlots: engagement.availableTimeSlots || [],
              }));
  
              console.log("Raw Engagement Data:", engagementData);
  
              const fullTimeSlots: string[] = Array.from({ length: 24 }, (_, i) =>
                  `${i.toString().padStart(2, "0")}:00`
              );
  
              console.log("Full Time Slots:", fullTimeSlots);
  
              const processedSlots = engagementData.map(entry => {
                  const uniqueAvailableTimeSlots = Array.from(new Set(entry.availableTimeSlots)).sort();
                  const missingTimeSlots = fullTimeSlots.filter(slot => !uniqueAvailableTimeSlots.includes(slot));
  
                  return {
                      id: entry.id,
                      uniqueAvailableTimeSlots,
                      missingTimeSlots,
                  };
              });
  
              console.log("Processed Slots with Missing Time Slots:", processedSlots);
              console.log("All Missing Time Slots:", processedSlots.map(slot => slot.missingTimeSlots));
  
              //  Ensure TypeScript correctly identifies it as string[]
              const uniqueMissingSlots: string[] = Array.from(
                  new Set(processedSlots.flatMap(slot => slot.missingTimeSlots))
              ).sort() as string[];
  
              console.log("Unique Missing Time Slots:", uniqueMissingSlots);
  
              // Store unique missing slots in state
              setUniqueMissingSlots(uniqueMissingSlots);
  
              setAvailableTimeSlots(processedSlots.map(entry => entry.uniqueAvailableTimeSlots));
              setMissingTimeSlots(processedSlots.map(entry => ({ id: entry.id, missingSlots: entry.missingTimeSlots })));
  
          } catch (error) {
              console.error("Error fetching engagement data:", error);
          }
      }
  };
  

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return ""; // Handle cases where dob is not provided
    const age = moment().diff(moment(dob), "years"); // Get the age in years
    return age;
  };

  const handleBookNow = () => {
    let booking : Bookingtype;
    if(props.housekeepingRole !== "NANNY"){
       booking = {
        eveningSelection : eveningSelectionTime,
        morningSelection : morningSelectionTime,
        ...bookingType
        
    }
    } else {
      booking = {
        timeRange: `${startTime} - ${endTime}`,
        duration: getHoursDifference(startTime, endTime),
        ...bookingType
    };
     
    }

    

    dispatch(add(booking)) 

    const providerDetails = {
      ...props, // Spread the provider details from props
      selectedMorningTime: morningSelection,
      selectedEveningTime: eveningSelection
    };
    props.selectedProvider(providerDetails); // Send selected provider back to parent
  };

  const getHoursDifference = (start, end) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return (endTotalMinutes - startTotalMinutes) / 60; // Convert minutes to hours
};

  const handleLogin = () =>{
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false);
  };

  

  const dietImage = dietImages[props.diet];

  // Enable the Book Now button if any time is selected
  const isBookNowEnabled = (morningSelection !== null || eveningSelection !== null) && loggedInUser;

  const user = useSelector((state : any) => state.user?.value);

  useEffect(() => {
   
      if(user?.role=== 'CUSTOMER'){
        setLoggedInUser(user);
      }
    }, [user]);

    const handleBookingPage = (e : string | undefined) =>{
      setOpen(false)
    }

    const handleStartTimeChange = (newStartTime) => {
      setStartTime(newStartTime);
      validateTimeRange(newStartTime, endTime);
    };
  
    const handleEndTimeChange = (newEndTime) => {
      setEndTime(newEndTime);
      validateTimeRange(startTime, newEndTime);
    };
  
    const validateTimeRange = (start, end) => {
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
  


  return (
    <><Paper elevation={3}>
      <div className="container-provider">
        {/* This button toggles expansion and collapse */}
        <Button
          variant="outlined" // Ensures outlined style is applied
          className="expand-toggle"
          onClick={toggleExpand}
          sx={{ border: '1px solid #1976d2', color: '#1976d2', padding: '8px', fontSize: '24px', position: 'absolute', top: 10, right: 10 }} // Override if necessary
        >
          {isExpanded ? <RemoveIcon /> : <AddIcon />}
        </Button>

        <div className={`content ${isExpanded ? "expanded" : ""}`}>
          <div className="essentials">
            <Typography
              variant="subtitle1"
              style={{
                fontWeight: "bold",
                marginBottom: "0.5px",
                marginTop: "0.5px",
                display: "flex", // Using flexbox to align items horizontally
                alignItems: "center", // Vertically align items in the center
              }}
            >
              {/* Name */}
              <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                {props.firstName} {props.middleName} {props.lastName}
              </span>

              {/* Gender and Age */}
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  marginLeft: "8px", // Adding space between name and other details
                }}
              >
                ({props.gender === "FEMALE" ? "F " : props.gender === "MALE" ? "M " : "O"}
                {calculateAge(props.dob)})
              </span>

              {/* Diet Image */}
              <span style={{ display: "inline-block", marginLeft: "8px" }}>
                <img
                  src={dietImage}
                  alt={props.diet}
                  style={{
                    width: "20px",
                    height: "20px",
                    verticalAlign: "middle", // Keeps the image aligned with the text
                  }} />
              </span>
            </Typography>
          </div>

          {/* Conditionally render extra content if expanded */}
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

              {props.housekeepingRole !== "NANNY" && (

              <div className="availability-section">
  <div className="availability-header">
    <Typography variant="subtitle1" className="section-title">
      Morning Availability (6 AM - 12 PM)
    </Typography>

    {/* Morning Availability Buttons */}
    <div className="time-slot-container">
  {missingSlots
    .filter((missingSlot) =>
      [6, 7, 8, 9, 10, 11].some(
        (hour) => moment({ hour }).format("HH:mm") === missingSlot
      )
    )
    .map((missingSlot, index) => {
      const hour = parseInt(moment(missingSlot, "HH:mm").format("H"), 10); // Extract hour
      const startTime = moment({ hour }).format("HH:mm");
      const endTime = moment({ hour: hour + 1 }).format("HH:mm");
      const timeRange = `${startTime}-${endTime}`;

      // ✅ Use uniqueMissingSlots for disabling
      const isDisabled = uniqueMissingSlots.includes(startTime);

      return (
        <div key={index}>
          <button
            className={`availability-button ${morningSelection === index ? "selected" : ""}`}
            onClick={() => handleSelection(index, false, hour)}
            disabled={isDisabled} // Disable if it's in uniqueMissingSlots
            style={{
              backgroundColor: isDisabled ? '#bdbdbd' : '',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.6 : 1,
            }}
          >
            {timeRange}
          </button>
        </div>
      );
    })}
</div>

  </div>

  <div className="availability-header">
    <Typography variant="subtitle1" className="section-title">
      Evening Availability (12 PM - 8 PM)
    </Typography>

    <div className="time-slot-container">
    {missingSlots
    .filter((missingSlot) =>
      [12, 13, 14, 15, 16, 17, 18, 19].some(
        (hour) => moment({ hour }).format("HH:mm") === missingSlot
      )
    )
    .map((missingSlot, index) => {
      const hour = parseInt(moment(missingSlot, "HH:mm").format("H"), 10); // Extract hour
      const startTime = moment({ hour }).format("HH:mm");
      const endTime = moment({ hour: hour + 1 }).format("HH:mm");
      const timeRange = `${startTime}-${endTime}`;

      // Check if this time slot should be disabled based on unique missing slots
      const isDisabled = uniqueMissingSlots.includes(startTime);

      return (
        <div key={index}>
          <button
            className={`availability-button ${eveningSelection === index ? "selected" : ""}`}
            onClick={() => handleSelection(index, true, hour)}
            disabled={isDisabled} // Disable if it's in uniqueMissingSlots
            style={{
              backgroundColor: isDisabled ? '#bdbdbd' : '',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.6 : 1,
            }}
          >
            {timeRange}
          </button>
        </div>
      );
    })}
</div>
{morningSelectionTime && (
  <div
    style={{
      marginTop: "10px",
      padding: "10px",
      backgroundColor: "#f0f0f0",
      borderRadius: "5px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "16px",
    }}
  >
    <span style={{ fontWeight: "bold" }}>Morning selected time:</span>
    <span>{morningSelectionTime}</span>
    <FaTimes
      onClick={() => clearSelection(false)}
      style={{
        color: "red",
        cursor: "pointer",
        fontSize: "18px",
      }}
    />
  </div>
)}

{eveningSelectionTime && (
  <div
    style={{
      marginTop: "10px",
      padding: "10px",
      backgroundColor: "#f0f0f0",
      borderRadius: "5px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "16px",
    }}
  >
    <span style={{ fontWeight: "bold" }}>Evening selected time:</span>
    <span>{eveningSelectionTime}</span>
    <FaTimes
      onClick={() => clearSelection(true)}
      style={{
        color: "red",
        cursor: "pointer",
        fontSize: "18px",
      }}
    />
  </div>
)}


  </div>
</div>
)}
{props.housekeepingRole === "NANNY" && (
 <div className="flex flex-col items-center gap-4 p-4 bg-gray-100 rounded-lg shadow-md w-80" style={{width:'100%'}}>
 <h2 className="text-xl font-semibold">Select Time Range</h2>
 <div className="flex items-center gap-2">
   <label className="text-gray-700">Start:</label>
   <TimePicker
     onChange={handleStartTimeChange}
     value={startTime}
     disableClock
     format="HH:mm"
     className="border p-2 rounded"
   />
 </div>
 <div className="flex items-center gap-2">
   <label className="text-gray-700">End:</label>
   <TimePicker
     value={endTime}
     onChange={handleEndTimeChange}
     disableClock
     format="HH:mm"
     className="border p-2 rounded"
   />
 </div>
 <p className="text-gray-600">Selected Time: {startTime} - {endTime}</p>
</div>

)}
<div>
  
 
</div>

              <div style={{ float: 'right', display: 'flex' }}>
                {/* {!loggedInUser && <Button onClick={handleLogin} variant="outlined">Login</Button>} */}
                {/* <Tooltip
                  style={{ display: isBookNowEnabled ? 'none' : 'block' }}
                  title="You need to login and select your timings to continue booking"
                >
                  <IconButton>
                    <InfoOutlinedIcon />
                  </IconButton>
                </Tooltip> */}
                {warning && <p className="text-red-500">{warning}</p>}
                {!warning && <Button onClick={handleBookNow}  variant="outlined">Book Now</Button>}
              </div>

            </div>
          )}
        </div>

        {/* Book Now button */}
        {/* { isBookNowEnabled && } */}

        {/* {isBookNowEnabled && (
      <Button
        variant="contained"
        color="primary"
        className="book-now-button"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          padding: '10px 20px',
          fontSize: '16px',
          display: 'flex',
        }}
        onClick={handleBookNow}
      >
        Book Now
      </Button>
    )} */}
        {/* <Button disabled={!isBookNowEnabled} variant="outlined">Book Now</Button> */}
      </div>
    </Paper>
    <Dialog 
    style={{padding:'0px'}}
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
        <DialogContent>
        <Login bookingPage={handleBookingPage}/>
        </DialogContent>
      </Dialog></>
  );
};

export default ProviderDetails;