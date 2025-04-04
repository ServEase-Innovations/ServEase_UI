/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, TextField, Tooltip, Typography } from "@mui/material";
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
import axios from "axios";

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
  const bookingType = useSelector((state : any) => state.bookingType?.value);
  console.log(" store details :---- ",bookingType);
  // console.log("Morning details:", bookingType?.morningSelection);
  // console.log("Evening details:", bookingType?.eveningSelection);
  console.log("startDate:", bookingType?.startDate);
  console.log("serviceproviderId details:", bookingType?.serviceproviderId);
  const toggleExpand = async () => {
    setIsExpanded(!isExpanded);

   
};


  
  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return ""; // Handle cases where dob is not provided
    const age = moment().diff(moment(dob), "years"); // Get the age in years
    return age;
  };

  const handleBookNow = () => {
    setOpen(true);
  };

  // const handleBookNow = () => {
  //   let booking: Bookingtype;

  //     if (props.housekeepingRole !== "NANNY") {
  //         booking = {
  //             serviceproviderId: props.serviceproviderId,
  //             eveningSelection: eveningSelectionTime,
  //             morningSelection: morningSelectionTime,
  //             ...bookingType
  //         };
  //     } else {
  //         booking = {
  //             serviceproviderId: props.serviceproviderId,
  //             timeRange: `${startTime} - ${endTime}`,
  //             duration: getHoursDifference(startTime, endTime),
  //             ...bookingType
  //         };
  //     }
  
  //     console.log("Booking Data Before Dispatch:", booking);
  
  //     if (bookingType) {
  //         dispatch(update(booking));
  //     } else {
  //         dispatch(add(booking));
  //     }
  
  //     const providerDetails = {
  //     ...props, // Spread the provider details from props
  //     selectedMorningTime: morningSelection,
  //     selectedEveningTime: eveningSelection
  //   };
  //   props.selectedProvider(providerDetails); // Send selected provider back to parent
  // };

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
      // If either is null or empty, skip validation
      if (!start || !end) {
        setWarning("");
        return;
      }
    
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
    
  
    const [bookingDetails, setBookingDetails] = useState({
      serviceType: 'Regular',
      timeSlot: { startTime: '', endTime: '' }, // Store start & end time together
      date: '',
      serviceCategory: 'Breakfast',
      numberOfPersons: 1,
    });
    
  
    // Whenever bookingType changes, update the date field.
    useEffect(() => {
      if (bookingType?.startDate) {
        setBookingDetails((prevDetails) => ({
          ...prevDetails,
          date: bookingType.startDate,
        }));
      }
    }, [bookingType]);
  
    const handleChange = (field, value) => {
      if (field === 'startTime' || field === 'endTime') {
        setBookingDetails((prevDetails) => ({
          ...prevDetails,
          timeSlot: {
            ...prevDetails.timeSlot,
            [field]: value, // Update either startTime or endTime inside timeSlot
          },
        }));
      } else {
        setBookingDetails((prevDetails) => ({
          ...prevDetails,
          [field]: value,
        }));
      }
    };
    
    const handleSearch = async () => {
      const timeSlotFormatted = `${bookingDetails.timeSlot.startTime}-${bookingDetails.timeSlot.endTime}`;
      const params = {
        // startDate: bookingDetails.date,
        // endDate: bookingType.endDate, 
        // timeslot: timeSlotFormatted, 
        startDate: "2025-04-01",
        endDate: "2025-04-30", 
        timeslot: "9:00-10:00", 
        housekeepingRole:props.housekeepingRole ,
        latitude: 28.47672988933282,  
        longitude: 77.51833532306142, 
      };
    
      try {
        const response = await axiosInstance.get('/api/serviceproviders/search', { params });
        console.log('Response:', response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    const handleCheckout = async () => {
      try {
        const response = await axios.post(
          "http://13.127.47.159:3000/create-order",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.status != 200) {
          const { id: orderId, currency, amount } = response.data;
  
          const options = {
            key: "rzp_test_lTdgjtSRlEwreA",
            amount: amount,
            currency: currency,
            name: "Serveaso",
            description: "Booking Payment",
            order_id: orderId,
            handler: async function (razorpayResponse) {
              alert(
                `Payment successful! Payment ID: ${razorpayResponse.razorpay_payment_id}`
              );
  
              // Here, implement your post-payment logic (e.g., saving booking details)
              console.log("Booking Details Saved!");
            },
            prefill: {
              name: "Customer Name", // Replace with actual customer details
              email: "customer@example.com",
              contact: "9876543210",
            },
            theme: {
              color: "#3399cc",
            },
          };
  
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        }
      } catch (error) {
        console.error("Error while creating Razorpay order:", error);
        alert("Failed to initiate payment. Please try again.");
      }
    };
    
  return (
    <> <Paper elevation={3}>
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px',
        backgroundColor: '#e7f1ff',
        zIndex: 10,
        boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        height: '12%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '65px',
        gap: '9px',
      }}
    >
      <div className="fields">
        <div className="field">
          <div className="input-with-label">
            <span className="inline-label">Service Type</span>
            <select
              value={bookingDetails.serviceType}
              onChange={(e) => handleChange('serviceType', e.target.value)}
            >
              <option>Regular</option>
              <option>Premium</option>
            </select>
          </div>
        </div>

        <div className="field">
          <div className="input-with-label">
            <span className="inline-label">Start Time</span>
            <input
              type="time"
              value={bookingDetails.timeSlot.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="time-input"
            />
          </div>
        </div>

        <div className="field">
          <div className="input-with-label">
          <span className="inline-label">End Time</span>
            <input
              type="time"
              value={bookingDetails.timeSlot.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              className="time-input"
            />
          </div>
        </div>

        <button className="search-button" onClick={handleSearch}>
          SEARCH
        </button>
      </div>

      <div className="fare-type-container">
        <span className="fare-label">Meal Type:</span>
        <div className="fare-options">
          <label>
            <input
              type="radio"
              value="Breakfast"
              checked={bookingDetails.serviceCategory === 'Breakfast'}
              onChange={() => handleChange('serviceCategory', 'Breakfast')}
            />
            Breakfast
          </label>

          <label>
            <input
              type="radio"
              value="Lunch"
              checked={bookingDetails.serviceCategory === 'Lunch'}
              onChange={() => handleChange('serviceCategory', 'Lunch')}
            />
            Lunch
          </label>

          <label>
            <input
              type="radio"
              value="Dinner"
              checked={bookingDetails.serviceCategory === 'Dinner'}
              onChange={() => handleChange('serviceCategory', 'Dinner')}
            />
            Dinner
          </label>

          <div className="person-count">
            <span className="fare-label">No. of Persons :</span>
            <input
              type="number"
              min="1"
              value={bookingDetails.numberOfPersons}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                handleChange('numberOfPersons', isNaN(value) ? 1 : value);
              }}
              className="person-input"
            />
          </div>
        </div>
      </div>
    </Box>
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

<div style={{ float: "right", display: "flex" }}>
      {warning && <p className="text-red-500">{warning}</p>}

      <Button onClick={handleBookNow} variant="outlined">
        Book Now
      </Button>

      {/* Dialog Box */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <p>Are you ready to proceed to checkout?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCheckout} color="primary" variant="contained">
            Checkout
          </Button>
        </DialogActions>
      </Dialog>
    </div>


            </div>
          )}
        </div>
      </div>
    </Paper>
    {/* <Dialog 
    style={{padding:'0px'}}
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
        <DialogContent>
        <Login bookingPage={handleBookingPage}/>
        </DialogContent>
      </Dialog> */}
      </>
  );
};

export default ProviderDetails;