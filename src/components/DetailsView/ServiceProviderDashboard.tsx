import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, Avatar, IconButton, Rating, Tab, Tabs, Switch, CircularProgress, Badge, Chip, Tooltip, Snackbar, Alert } from "@mui/material";
import { styled } from "@mui/system";
import CallIcon from '@mui/icons-material/Call';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axiosInstance from '../../services/axiosInstance';
import EditProvider from "./EditProvider";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ToggleButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import EventIcon from '@mui/icons-material/Event'; // for Total Appointments
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // for Confirmed
import WarningIcon from '@mui/icons-material/Warning'; // for Pending
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { RootState } from "../../store/userStore";

const ProfileHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px',
  backgroundColor: '#ffffff',
  color: '#333',
  borderRadius: '10px',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
});

const DashboardCard = styled(Card)({
  minHeight: '180px',
  textAlign: 'center',
  borderRadius: '12px',
  transition: '0.3s',
  backgroundColor: '#f8f9fa',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
  },
});
type UserState = {
  value?: {
    role?: string;
    serviceProviderDetails?: any;
    // serviceProviderId?:any;
  } | null;
};

const ServiceProviderDashboard: React.FC = () => {

  
  const user = useSelector((state: RootState) => state.user as UserState);

  // Ensure `value` is not null before accessing properties
  const userRole = user?.value?.role ?? "No Role";
  const serviceProviderDetails = user?.value?.serviceProviderDetails ?? {};
  const serviceProviderIdd = user?.value?.serviceProviderDetails ?.serviceproviderId ?? "Not Available";
  const firstName=user?.value?.serviceProviderDetails ?. firstName;
  const lastName=user?.value?.serviceProviderDetails ?.lastName;
  // Log values
  console.log("User State DASHBOARD:", user);
  console.log("Role:", userRole);
  console.log("Service Provider Details:", serviceProviderDetails);
  console.log("Service Provider ID:", serviceProviderIdd);
  console.log("FIRST NAME:",firstName);
  console.log("lastname::",lastName);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0); 
  const [activeSwitch, setActiveSwitch] = useState<number | null>(null); 
  
  const initialAttendance: { [key: string]: string } = {};
  for (let day = 1; day <= 28; day++) {
    const dateKey = `2025-01-${day.toString().padStart(2, "0")}`; // e.g., "2025-01-01"
    initialAttendance[dateKey] = "Present";
  }

  const [attendanceData, setAttendanceData] = useState<{ [key: string]: string }>(initialAttendance);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateClick = (date: Date) => {
    const dateKey = dayjs(date).format("YYYY-MM-DD");

    // Selecting any date except Jan 1-28
    if (!initialAttendance[dateKey]) {
      setSelectedDate(date);
    }
  };

  const applyLeave = async () => {
    if (selectedDate) {
      const dateKey = dayjs(selectedDate).format("YYYY-MM-DD");
  
      // Update local state
      if (!attendanceData[dateKey]) {
        setAttendanceData((prev) => ({
          ...prev,
          [dateKey]: "Absent",
        }));
      }
  
      // Prepare leave data
      const leaveData = {
        serviceproviderId: serviceProviderIdd !== "Not Available" ? serviceProviderIdd : null,
        fromDate: dateKey,
        toDate: dateKey,
        leaveType: "PAID",
      };
      
  
      try {
        const response = await axiosInstance.post(
          "/api/serviceproviders/add-leave",
          leaveData
        );
        console.log("Leave applied successfully:", response.data);
      } catch (error) {
        console.error("Error applying leave:", error);
      }
    }
  };
  


  // const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
  //   setActiveSwitch(prevState => (prevState === id ? null : id)); // Toggle active switch
  // };
  // const serviceProviderId =  402;
  const [currentAndFutureBookings, setCurrentAndFutureBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const page = 0;
        const size = 100;
  
        const response = await axiosInstance.get(
          `/api/serviceproviders/get-sp-booking-history?page=${page}&size=${size}`
        );
  
        console.log("API Response:", response.data);
        console.log("ServiceProviderIdd:", serviceProviderIdd);
  
        if (response.data) {
          // Ensure we don't get undefined errors by using optional chaining (?.) and defaulting to empty arrays
          const currentBookings = response.data.current?.filter(booking => booking.serviceProviderId === serviceProviderIdd) || [];
          const futureBookings = response.data.future?.filter(booking => booking.serviceProviderId === serviceProviderIdd) || [];
          const pastBookings = response.data.past?.filter(booking => booking.serviceProviderId === serviceProviderIdd) || [];
  
          // Combine all filtered bookings
          const filteredBookings = [...currentBookings, ...futureBookings, ...pastBookings].map(booking => ({
            ...booking,
            engagementId: booking.id, // Set engagementId
          }));
  
          console.log("Filtered Bookings:", filteredBookings);
          setBookings(filteredBookings);
        } else {
          console.error("Error: Invalid API response structure");
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching booking history:", error);
        setBookings([]);
      }
    };
  
    if (serviceProviderIdd) {
      fetchBookingHistory();
    }
  }, [serviceProviderIdd]); // Dependency to re-run when ID changes  
  
  
   // The empty dependency array ensures this effect runs once on component mount
   const [snackbarOpen, setSnackbarOpen] = useState(false);
   const [snackbarMessage, setSnackbarMessage] = useState("");
   const [snackbarSeverity, setSnackbarSeverity] = useState("success");

const handleSnackbarClose = () => {
  setSnackbarOpen(false);
};

const handleSwitchChange = async (event, index) => {
  let updatedStatus = "";

  setBookings(prevBookings =>
    prevBookings.map((booking, i) => {
      if (i === index) {
        updatedStatus =
          booking.taskStatus === "NOT_STARTED" ? "STARTED" :
          booking.taskStatus === "STARTED" ? "COMPLETED" : "STARTED";

        console.log(`Booking ID ${booking.id}: Task Status changed to ${updatedStatus}`);
        return { ...booking, taskStatus: updatedStatus };
      }
      return booking;
    })
  );

  setActiveSwitch(index);

  const booking = bookings[index];

  if (!booking) {
    console.error("Error: Booking not found!");
    setSnackbarMessage("Error: Booking not found!");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    return;
  }

  const { id, serviceProviderId, customerId, startDate, endDate, engagements, timeslot, bookingDate, customerName, serviceProviderName } = booking;

  const updatePayload = {
    id,
    serviceProviderId,
    customerId,
    startDate,
    endDate,
    engagements,
    timeslot,
    bookingDate,
    customerName,
    serviceProviderName,
    taskStatus: updatedStatus, 
   
  };

  try {
    console.log(`Updating engagement with ID ${id} and status ${updatedStatus}`);
    const response = await axiosInstance.put(
      `/api/serviceproviders/update/engagement/${id}`, 
      updatePayload
    );

    console.log("Update Response:", response.data);
    
    setSnackbarMessage(`Task Status updated to ${updatedStatus}`);
    setSnackbarSeverity("success");
  } catch (error) {
    console.error("Error updating task status:", error);

    setSnackbarMessage("Failed to update task status. Please try again.");
    setSnackbarSeverity("error");
  }

  setSnackbarOpen(true);
};

// ✅ Cancel Booking Function
const handleCancelBooking = async (index) => {
  const booking = bookings[index];
  const updatedStatus = "CANCELLED"; 

  const updatePayload = {
    id: booking.id,
    serviceProviderId: booking.serviceProviderId,
    customerId: booking.customerId,
    startDate: booking.startDate,
    endDate: booking.endDate,
    engagements: booking.engagements,
    timeslot: booking.timeslot,
    bookingDate: booking.bookingDate,
    customerName: booking.customerName,
    serviceProviderName: booking.serviceProviderName,
    taskStatus: updatedStatus,
    
  };

  try {
    console.log(`Cancelling booking with ID ${booking.id}`);
    const response = await axiosInstance.put(
      `/api/serviceproviders/update/engagement/${booking.id}`,
      updatePayload
    );

    console.log("Cancel Response:", response.data);

    const updatedBookings = [...bookings];
    updatedBookings[index].taskStatus = updatedStatus;
    setBookings(updatedBookings);

    setSnackbarMessage("Booking successfully cancelled!");
    setSnackbarSeverity("success");
  } catch (error) {
    console.error("Error cancelling booking:", error);
    setSnackbarMessage("Failed to cancel booking. Please try again.");
    setSnackbarSeverity("error");
  }

  setSnackbarOpen(true);
};
  
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return isEditing ? (
    <EditProvider goBack={() => setIsEditing(false)} />
  ) : (
    <div style={{display:'grid'}} >
     <ProfileHeader>
   {/* Profile Section: Avatar, Name & Icons */}
   <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Avatar sx={{ width: 60, height: 60, bgcolor: '#0056b3', color: 'white' }}>
        <AccountCircleIcon fontSize="large" />
      </Avatar>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
  {`${firstName } ${lastName }`}
</Typography>


      {/* Icons beside name */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <Tooltip title="Total Bookings">
    <Badge badgeContent={bookings.length} color="primary">
      <EventIcon fontSize="medium" sx={{ color: '#1976d2' }} />
    </Badge>
  </Tooltip>

  <Tooltip title="Confirmed Bookings">
    <Badge badgeContent={bookings.filter((b) => b.status === 'Confirmed').length} color="primary">
      <CheckCircleIcon fontSize="medium" sx={{ color: '#388e3c' }} />
    </Badge>
  </Tooltip>

  <Tooltip title="Pending Bookings">
    <Badge badgeContent={bookings.filter((b) => b.status === 'Pending').length} color="secondary">
      <WarningIcon fontSize="medium" sx={{ color: '#f57c00' }} />
    </Badge>
  </Tooltip>
</Box>

    </Box>

 
   <Box sx={{ marginTop: '20px' }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="service recap tabs" centered>
          <Tab label="Profile" />
          <Tab label="Service Recap" />
          <Tab label="Attendance Calender" />
          <Tab label="Earnings Summary" />
        </Tabs>
      </Box>
        {/* Add the Rating component beside the profile name */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating value={4} precision={0.5} readOnly sx={{ marginRight: '10px' }} /> {/* Example rating */}
          {/* <Button variant="outlined" sx={{ color: '#0056b3', fontWeight: 'bold' }} onClick={handleEditClick}>
            Edit
          </Button> */}
        </Box>
      </ProfileHeader>

      {/* Tabs to toggle between Profile and Service Recap */}
      {/* <Box sx={{ marginTop: '20px' }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="service recap tabs" centered>
          <Tab label="Profile" />
          <Tab label="Service Recap" />
        </Tabs>
      </Box> */}

      {/* Show Profile Section if Profile Tab is Selected */}


      {selectedTab === 0 && (
  <Box sx={{ marginTop: '20px' }}>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={3} justifyContent="center">
          {bookings
            .filter(
              (booking) =>
                booking.taskStatus !== "CANCELLED" // Optionally exclude cancelled ones
            )
            .map((booking, index) => (
              <Grid item xs={12} md={4} key={index}>
                <DashboardCard>
                  <CardContent>
                    {/* Task Status */}
                    <Box sx={{ display: "flex", justifyContent: "center", marginY: "16px" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          textAlign: "center",
                          textTransform: "uppercase",
                          backgroundColor:
                            booking.taskStatus === "NOT_STARTED"
                              ? "rgba(200, 200, 200, 0.3)"
                              : booking.taskStatus === "STARTED"
                              ? "rgba(255, 215, 0, 0.3)"
                              : booking.taskStatus === "IN_PROGRESS"
                              ? "rgba(30, 144, 255, 0.3)"
                              : booking.taskStatus === "CANCELLED"
                              ? "rgba(255, 0, 0, 0.5)"
                              : booking.taskStatus === "COMPLETED"
                              ? "rgba(50, 205, 50, 0.5)"
                              : "#ccc",
                          color:
                            booking.taskStatus === "NOT_STARTED"
                              ? "#555"
                              : booking.taskStatus === "STARTED"
                              ? "#8B6508"
                              : booking.taskStatus === "IN_PROGRESS"
                              ? "#007BFF"
                              : booking.taskStatus === "CANCELLED"
                              ? "#fff"
                              : booking.taskStatus === "COMPLETED"
                              ? "#fff"
                              : "#000",
                          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        Task Status: {booking.taskStatus}
                      </Typography>
                    </Box>

                    {/* Booking Details */}
                    <Typography variant="subtitle1" color="#555">Customer</Typography>
                    <Typography variant="h5" color="#0056b3">{booking.customerName}</Typography>

                    <Typography variant="subtitle1" color="#555">Time Slot</Typography>
                    <Typography variant="h6" color="#2a7f62">{booking.timeslot}</Typography>

                    <Typography variant="subtitle1" color="#555">Booking Start Date</Typography>
                    <Typography variant="h6" color="#2a7f62">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </Typography>

                    {booking.endDate && (
                      <>
                        <Typography variant="subtitle1" color="#555">Booking End Date</Typography>
                        <Typography variant="h6" color="#2a7f62">
                          {new Date(booking.endDate).toLocaleDateString()}
                        </Typography>
                      </>
                    )}

                    <Typography variant="subtitle1" color="#555">Address</Typography>
                    <Typography variant="body2" color="#555">{booking.address}</Typography>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <IconButton color="primary" href={`tel:${booking.phone}`} sx={{ fontSize: 26 }}>
                        <CallIcon />
                      </IconButton>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant={booking.status === 'Pending' ? 'outlined' : 'contained'}
                          sx={{
                            color: booking.status === 'Pending' ? 'orange' : 'white',
                            backgroundColor: booking.status === 'Pending' ? 'transparent' : 'green',
                            borderColor: booking.status === 'Pending' ? 'orange' : 'green',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            padding: '6px 16px',
                            fontSize: '14px',
                            boxShadow: booking.status !== 'Pending' ? '0px 4px 10px rgba(0, 128, 0, 0.3)' : 'none',
                            transition: '0.3s ease-in-out',
                            '&:hover': {
                              backgroundColor: booking.status === 'Pending' ? 'orange' : 'darkgreen',
                              color: 'white',
                              borderColor: 'darkgreen',
                            },
                          }}
                        >
                          {booking.status === 'Pending' ? 'Confirm Booking' : 'Confirmed'}
                        </Button>

                        <Button
                          variant="outlined"
                          sx={{
                            color: 'red',
                            borderColor: 'red',
                            fontWeight: 'bold',
                            borderRadius: '5px',
                            transition: '0.3s',
                            '&:hover': {
                              backgroundColor: 'red',
                              color: 'white',
                            },
                          }}
                          onClick={() => handleCancelBooking(index)}
                          disabled={["STARTED", "IN_PROGRESS", "COMPLETED"].includes(booking.taskStatus)}
                        >
                          Cancel
                        </Button>
                      </Box>

                      <Box>
                        <Switch
                          checked={booking.taskStatus === "STARTED"}
                          onChange={(e) => handleSwitchChange(e, index)}
                          disabled={booking.taskStatus === "CANCELLED"} // Disable switch when task is cancelled
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </DashboardCard>
              </Grid>
            ))}
        </Grid>
      </Grid>
    </Grid>
  </Box>
)}




      {/* Show Service Recap Section if Service Recap Tab is Selected */}
      {selectedTab === 1 && (
  <Box sx={{ marginTop: '20px', padding: '20px' }}>
    {/* Past Service History Title */}
    <Typography variant="h6" sx={{ color: '#555', marginBottom: '15px' }}>
      Past Services
    </Typography>

    <Grid container spacing={2} sx={{ width: '100%' }}>
      {bookings
        .filter((booking) => new Date(booking.endDate) < new Date()) // Filter past bookings
        .map((history, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              padding: '15px', 
              borderRadius: '10px', 
              backgroundColor: '#f0f0f0', 
              opacity: 0.8, 
              boxShadow: '2px 2px 10px rgba(0,0,0,0.1)'
            }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>{history.customerName}</Typography>
        <Typography variant="body2" color="green"><strong>Time Slot:</strong> {history.timeslot}</Typography>
        <Typography variant="body2" color="#777"><strong>Address:</strong> {history.address}</Typography>
        <Typography variant="body2" color="#555"><strong>Monthly Amount:</strong> {history.monthlyAmount ? `₹${history.monthlyAmount}` : 'N/A'}</Typography>
        <Typography variant="body2" color="#555"><strong>Start Date:</strong> {history.startDate ? new Date(history.startDate).toLocaleDateString() : 'N/A'}</Typography>
        <Typography variant="body2" color="#555"><strong>End Date:</strong> {history.endDate ? new Date(history.endDate).toLocaleDateString() : 'N/A'}</Typography>
        <Typography variant="body2" color="#555"><strong>Service Type:</strong> {history.serviceType || 'N/A'}</Typography>
        <Typography variant="body2" color="#555"><strong>Booking Type:</strong> {history.bookingType || 'N/A'}</Typography>

              {/* Status Indicator */}
              <Chip 
  label={history.taskStatus}  // Show exact taskStatus from backend
  sx={{
    backgroundColor: 
      history.taskStatus === 'COMPLETED' ? '#4caf50' :      // Green
      history.taskStatus === 'NOT_STARTED' ? '#9e9e9e' :    // Grey
      history.taskStatus === 'STARTED' ? '#ffa726' :        // Orange
      history.taskStatus === 'IN_PROGRESS' ? '#1976d2' :    // Blue
      history.taskStatus === 'CANCELLED' ? '#d32f2f' :      // Red
      '#9e9e9e', // Default to grey if status is unknown
    color: 'white',
    fontWeight: 'bold',
    padding: '5px 10px',
    borderRadius: '5px',
    marginTop: '10px'
  }} 
/>


            </Card>
          </Grid>
      ))}
    </Grid>
  </Box>
)}

 {selectedTab === 2 && (
         <Box
         sx={{
          //  height: "100vh",
           display: "flex",
           justifyContent: "center",
           alignItems: "center",
           backgroundColor: "#f5f5f5",
         }}
       >
         <Box
           sx={{
             display: "flex",
             flexDirection: "column",
             alignItems: "center",
             padding: "20px",
             boxShadow: 3,
             borderRadius: "8px",
             backgroundColor: "#fff",
           }}
         >
           <Typography variant="h5" color="#333" fontWeight="bold">
             Attendance Calendar
           </Typography>
   
           <Box sx={{ marginTop: "10px", width: "100%" }}>
             <Calendar
               onClickDay={handleDateClick}
               tileClassName={({ date }) => {
                 const dateKey = dayjs(date).format("YYYY-MM-DD");
   
                 return attendanceData[dateKey] === "Absent"
                   ? "absent-day"
                   : attendanceData[dateKey] === "Present"
                   ? "present-day"
                   : "";
               }}
             />
           </Box>
   
           <Box sx={{ marginTop: "20px" }}>
             <Button
               variant="contained"
               onClick={applyLeave}
               sx={{
                 padding: "10px 20px",
                 fontWeight: "bold",
                 backgroundColor: "#f57c00",
                 color: "white",
               }}
             >
               Apply Leave
             </Button>
           </Box>
         </Box>
   
         {/* Custom Styles */}
         <style>
           {`
             .react-calendar {
               background: #f8f9fa;
               border-radius: 8px;
               box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
             }
             .react-calendar__tile {
               padding: 10px;
               text-align: center;
               font-weight: bold;
               border-radius: 50%;
               transition: 0.3s;
             }
             .present-day {
               background-color: rgba(144, 238, 144, 0.6);
               border: 2px solid #4CAF50;
               color: #2c662d;
               border-radius: 50%;
               width: 35px;
               height: 35px;
               display: flex;
               align-items: center;
               justify-content: center;
             }
             .absent-day {
               background-color: rgba(255, 99, 71, 0.6);
               border: 2px solid #FF5733;
               color: #900;
               border-radius: 50%;
               width: 35px;
               height: 35px;
               display: flex;
               align-items: center;
               justify-content: center;
             }
             .react-calendar__tile:hover {
               background-color: rgba(255, 215, 0, 0.6);
               border-radius: 50%;
               transition: 0.3s;
             }
           `}
         </style>
       </Box>
      )}

{selectedTab === 3 && (
  <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
    <Box
      sx={{
        maxWidth: '1200px', // Max width for the content
        width: '100%', // Make it take full width up to maxWidth
        padding: '20px',
        backgroundColor: '#fff', // White background to contrast with content
        borderRadius: '10px',
        boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.1)', // Larger box shadow for depth
      }}
    >
      <Typography variant="h6" fontWeight="bold" color="#444" align="center">Earnings Summary</Typography>

      <Box sx={{ marginTop: '20px' }}>
        <Grid container spacing={3} justifyContent="center">

          {/* Monthly Earnings with Progress Indicator */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                backgroundColor: '#f5f5f5', // Light grey background
                padding: '25px',
                borderRadius: '10px',
                textAlign: 'center',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                minHeight: '250px', // Defined minimum height for consistency
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center', // Center the content vertically
              }}
            >
              <Typography variant="subtitle1" color="#555">Earning in Month</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                <CircularProgress variant="determinate" value={75} size={80} thickness={6} color="success" />
                <Typography variant="h5" sx={{ position: 'absolute' }}>75%</Typography>
              </Box>
              <Typography variant="body2" color="#777" sx={{ marginTop: '10px' }}>Deposits: $300 | Expenses: $50 | Payable: $250</Typography>
            </Box>
          </Grid>

          {/* Monthly Sales */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                backgroundColor: '#fff3e0', // Light orange background
                padding: '25px',
                borderRadius: '10px',
                textAlign: 'center',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                minHeight: '250px', // Defined minimum height for consistency
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center', // Center the content vertically
              }}
            >
              <Typography variant="subtitle1" color="#555">Monthly </Typography>
              <Typography variant="h4" color="#ff9800" fontWeight="bold">20,541</Typography>
              <Typography variant="body2" color="#777">Today Income</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                <ArrowUpwardIcon sx={{ color: '#ff9800', fontSize: 24 }} />
                <Typography variant="body2" color="#ff9800">75%</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Yearly Sales */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                backgroundColor: '#e3f2fd', // Light blue background
                padding: '25px',
                borderRadius: '10px',
                textAlign: 'center',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                minHeight: '250px', // Defined minimum height for consistency
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center', // Center the content vertically
              }}
            >
              <Typography variant="subtitle1" color="#555">Yearly </Typography>
              <Typography variant="h4" color="#388e3c" fontWeight="bold">20,54,125</Typography>
              <Typography variant="body2" color="#777">Today Income</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                <ArrowUpwardIcon sx={{ color: '#388e3c', fontSize: 24 }} />
                <Typography variant="body2" color="#388e3c">75%</Typography>
              </Box>
            </Box>
          </Grid>

        </Grid>
      </Box>
    </Box>
  </Box>
)}
{/* Snackbar Component */}
<Snackbar
  open={snackbarOpen}
  autoHideDuration={4000}
  onClose={handleSnackbarClose}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}
  sx={{ marginTop: '60px' }} 
>
  <Alert onClose={handleSnackbarClose}  sx={{ width: '100%' }}>
    {snackbarMessage}
  </Alert>
</Snackbar>
       {/* <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // Snackbar disappears after 3 seconds
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
        sx={{ marginTop: '60px' }} 
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Booking successfully canceled!
        </Alert>
      </Snackbar> */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        {/* <Button variant="contained" sx={{ padding: '10px 20px', fontWeight: 'bold', backgroundColor: '#f57c00', color: 'white' }}>
          Cashout
        </Button> */}
      </Box>
    </div>
  );
};

export default ServiceProviderDashboard;