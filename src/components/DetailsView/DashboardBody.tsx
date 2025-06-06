/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from "react";
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  IconButton, 
  Chip, 
  CircularProgress,
  Alert,
  Snackbar,
  Switch,
  styled,
   Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from "@mui/material";
import CallIcon from '@mui/icons-material/Call';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from "dayjs";
const DashboardCard = styled(Card)(({ theme }) => ({
  // Fixed dimensions for desktop (md and up)
  [theme.breakpoints.up('md')]: {
    width: '350px',
    height: '450px',
  },
  // Responsive dimensions for tablet (sm)
  [theme.breakpoints.between('sm', 'md')]: {
    width: '650px',
    height: '420px',
  },
  // Responsive dimensions for mobile (xs)
  [theme.breakpoints.down('sm')]: {
     // This moves the card up by 20px
    transform: 'translateY(-20px)', // Alternative approach
    width: '350px',
    height: '435px',
  },
  marginTop:'1rem',
  marginBottom:'1rem', 
  textAlign: 'center',
  borderRadius: '12px',
  transition: '0.3s',
  backgroundColor: '#f8f9fa',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
  },
}));


interface DashboardBodyProps {
  selectedTab: number;
  bookings: any[];
  activeSwitch: number | null;
  attendanceData: { [key: string]: string };
  selectedDate: Date | null;
  handleDateClick: (date: Date) => void;
  handleSwitchChange: (event: any, index: number) => void;
  handleCancelBooking: (index: number) => void;
  applyLeave: (description: string) => void;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: "success" | "error" | "warning" | "info";
  handleSnackbarClose: () => void;
}

const DashboardBody: React.FC<DashboardBodyProps> = ({
  selectedTab,
  bookings,
  activeSwitch,
  attendanceData,
  selectedDate,
  handleDateClick,
  handleSwitchChange,
  handleCancelBooking,
  applyLeave,
  snackbarOpen,
  snackbarMessage,
  snackbarSeverity,
  handleSnackbarClose
}) => {
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
const [leaveDescription, setLeaveDescription] = useState<string>("");
const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);

// Add these handler functions
const handleLeaveDialogOpen = () => {
  console.log("Dialog opening"); // Check if this fires multiple times
  if (selectedDate) {
    setTempSelectedDate(selectedDate);
    setLeaveDialogOpen(true);
    setLeaveDescription(""); // Reset when opening
  }
};

const handleLeaveDialogClose = () => {
  setLeaveDialogOpen(false);
  setLeaveDescription("");
};


const handleLeaveDescriptionChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  console.log("Current value:", event.target.value); // Verify in console
  setLeaveDescription(event.target.value);
};

const handleLeaveSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // Add this if form submission refreshes
  if (tempSelectedDate && leaveDescription) {
    await applyLeave(leaveDescription);
    handleLeaveDialogClose();
  }
};
  
  return (
    <div style={{ display: 'grid' }}>
      {/* Show Profile Section if Profile Tab is Selected */}
      {selectedTab === 0 && (
        <Box sx={{ marginTop: '20px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid container spacing={3} justifyContent="center">
                {bookings
                  .filter((booking) => booking.taskStatus !== "CANCELLED")
                  .map((booking, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <DashboardCard>
                        <CardContent>
                          {/* Task Status */}
                          <Box sx={{ display: "flex", justifyContent: "center",marginTop:".5rem" }}>
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
                                disabled={booking.taskStatus === "CANCELLED"}
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
          <Typography variant="h6" sx={{ color: '#555', marginBottom: '15px' }}>
            Past Services
          </Typography>

          <Grid container spacing={2} sx={{ width: '100%' }}>
            {bookings
              .filter((booking) => new Date(booking.endDate) < new Date())
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

                    <Chip 
                      label={history.taskStatus}
                      sx={{
                        backgroundColor: 
                          history.taskStatus === 'COMPLETED' ? '#4caf50' :
                          history.taskStatus === 'NOT_STARTED' ? '#9e9e9e' :
                          history.taskStatus === 'STARTED' ? '#ffa726' :
                          history.taskStatus === 'IN_PROGRESS' ? '#1976d2' :
                          history.taskStatus === 'CANCELLED' ? '#d32f2f' :
                          '#9e9e9e',
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
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: "#f5f5f5",
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
          onClick={handleLeaveDialogOpen}
          disabled={!selectedDate || attendanceData[dayjs(selectedDate).format("YYYY-MM-DD")] === "Present"}
          sx={{
            padding: "10px 20px",
            fontWeight: "bold",
            backgroundColor: "#f57c00",
            color: "white",
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          Apply Leave
        </Button>
      </Box>

      {/* Leave Application Dialog */}
    <Dialog open={leaveDialogOpen} onClose={handleLeaveDialogClose}>
  <form onSubmit={handleLeaveSubmit}>
    <DialogTitle>Apply for Leave</DialogTitle>
    <DialogContent>
      <DialogContentText>
        You're applying for leave on {tempSelectedDate && dayjs(tempSelectedDate).format("MMMM D, YYYY")}
      </DialogContentText>
    <input
  autoFocus
  id="leaveDescription"
  placeholder="Leave Description"
  type="text"
  required
  value={leaveDescription}
  onChange={handleLeaveDescriptionChange}
  style={{
    width: "100%",
    padding: "10px",
    border: "2px solid #1976d2",
    borderRadius: "4px",
    fontSize: "16px",
    color: "#000",
  }}
/>

    </DialogContent>
    <DialogActions>
      <Button onClick={handleLeaveDialogClose}>Cancel</Button>
      <Button 
        type="submit" // Changed to submit type
        disabled={!leaveDescription}
        color="primary"
        variant="contained"
      >
        Submit
      </Button>
    </DialogActions>
  </form>
</Dialog>

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
  </Box>
)}
      {selectedTab === 3 && (
        <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              maxWidth: '1200px',
              width: '100%',
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#444" align="center">Earnings Summary</Typography>

            <Box sx={{ marginTop: '20px' }}>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      padding: '25px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                      minHeight: '250px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
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

                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      backgroundColor: '#fff3e0',
                      padding: '25px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                      minHeight: '250px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
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

                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      backgroundColor: '#e3f2fd',
                      padding: '25px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                      minHeight: '250px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ marginTop: '60px' }} 
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DashboardBody;