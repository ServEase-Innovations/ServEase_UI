import React, { useEffect, useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import axiosInstance from '../../services/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/userStore';

type UserState = {
  value?: {
    role?: string;
    customerDetails?: {
      customerId: number;
      firstName: string;
      lastName: string;
      emailId: string;
    };
  } | null;
};

interface Booking {
  id: number;
  name: string;
  role: string;
  serviceProviderId: number;
  timeSlot: string;
  date: string;
  startDate: string;
  endDate: string;
  bookingType: string;
  monthlyAmount: number;
  paymentMode: string;
  address: string;
  customerName: string;
  serviceProviderName: string;
  taskStatus: string;
  bookingDate: string;
  engagements:string;
}

const Booking: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [futureBookings, setFutureBookings] = useState<Booking[]>([]);

  const user = useSelector((state: RootState) => state.user as UserState);
  const customerId = user?.value?.customerDetails?.customerId ?? null;

  console.log('Booking user details:', user);
  console.log('Customer ID:', customerId);

  useEffect(() => {
    if (customerId !== null) {
      const page = 0; // Default page
      const size = 100; // Default size
  
      axiosInstance
        .get(`api/serviceproviders/get-sp-booking-history?page=${page}&size=${size}`)
        .then((response) => {
          const { past = [], current = [], future = [] } = response.data || {};
          console.log('Past Bookings:', past);
          const mapBookingData = (data: any[]) =>
            Array.isArray(data)
              ? data
                  .filter((item) => item.customerId === customerId)
                  .map((item) => {
                    console.log("Service Provider ID:", item.serviceProviderId); 
  
                    return {
                      id: item.id, 
                      customerId: item.customerId, 
                      serviceProviderId: item.serviceProviderId, 
                      name: item.customerName,
                      role: item.serviceeType,
                      timeSlot: item.timeslot,
                      date: new Date(item.startDate).toLocaleDateString(),
                      startDate: item.startDate,
                      endDate: item.endDate,
                      bookingType: item.bookingType,
                      monthlyAmount: item.monthlyAmount,
                      paymentMode: item.paymentMode,
                      address: item.address,
                      customerName: item.customerName,
                      serviceProviderName: item.serviceProviderName,
                      taskStatus: item.taskStatus,
                      engagements:item.engagements,
                      bookingDate: item.bookingDate,
                    };
                  })
              : [];
  
          setPastBookings(mapBookingData(past));
          console.log('Past :', setPastBookings);
          setCurrentBookings(mapBookingData(current));
          setFutureBookings(mapBookingData(future));
        })
        .catch((error) => {
          console.error("Error fetching booking details:", error);
        });
    }
  }, [customerId]);
  

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const handleModifyBooking = (bookingId: number) => {
    console.log(`Modify booking with ID: ${bookingId}`);
    // Add logic for modifying the booking
  };
  
  const handleCancelBooking = async (booking: Booking) => {
    const updatedStatus = "CANCELLED";
  
    const updatePayload = {
      id: booking.id,
      serviceProviderId: booking.serviceProviderId,
      customerId: customerId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      engagements:booking.engagements, 
      timeslot: booking.timeSlot,
      bookingDate: booking.bookingDate,
      customerName: booking.customerName,
      serviceProviderName: booking.serviceProviderName,
      taskStatus: updatedStatus,
    };
  
    try {
      console.log(`Updating engagement with ID ${booking.id} to status ${updatedStatus}`);
      const response = await axiosInstance.put(
        `/api/serviceproviders/update/engagement/${booking.id}`,
        updatePayload
      );  
      console.log("Update Response:", response.data);

      //mail
      try {
        const emailResponse = await axiosInstance.post(
          "http://localhost:4000/send-cancel-email",
          {
            email: user?.value?.customerDetails?.emailId,
            userName: booking.customerName,
            serviceType: booking.role,
            spName: booking.serviceProviderName,
            dateTime: booking.bookingDate,
            phoneNumber: "+91 1234567890",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("email sent!");

      } catch (emailError) {
        console.error("Error sending cancellation email:", emailError);
      }

      // Update state to reflect the change
      setCurrentBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, taskStatus: updatedStatus } : b
        )
      );
      setFutureBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, taskStatus: updatedStatus } : b
        )
      );
    } catch (error: any) {
      console.error("Error updating task status:", error);
      if (error.response) {
        console.error("Full error response:", error.response.data);
      } else if (error.message) {
        console.error("Error message:", error.message);
      } else {
        console.error("Unknown error occurred");
      }
    }
  };
  
  const renderBookings = (bookings: Booking[]) => (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <Card key={booking.id} elevation={3} sx={{ width: '100%' }}>
            <CardContent>
            {booking.taskStatus === "CANCELLED" && (
  <Typography
    variant="body2"
    color="white"
    sx={{
      backgroundColor: "rgba(255, 0, 0, 0.5)", 
      color: "rgba(255, 255, 255, 0.9)", 
      padding: "8px 16px",
      borderRadius: "4px",
      fontWeight: "bold",
      marginBottom: "16px",
      textAlign: "center",  
    }}
    gutterBottom
  >
    Task Status: CANCELLED
  </Typography>
)}

            {/* <Typography variant="body2" color="textSecondary">
                Booking ID: {booking.id}
              </Typography>
              <Typography variant="body2" color="textSecondary">
  Service Provider ID: {booking.serviceProviderId}
</Typography> */}
              <Typography variant="h6" gutterBottom>
              Service Provider: {booking.serviceProviderName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Role: {booking.role}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Time Slot: {booking.timeSlot}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Start Date: {booking.startDate}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                End Date: {booking.endDate}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Booking Type: {booking.bookingType}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Monthly Amount: ₹{booking.monthlyAmount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Payment Mode: {booking.paymentMode}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Address: {booking.address}
              </Typography>
              {/* <Typography variant="body2" color="textSecondary">
                Customer: {booking.customerName}
              </Typography> */}
              {/* <Typography variant="body2" color="textSecondary">
                Service Provider: {booking.serviceProviderName}
              </Typography> */}
              <Typography variant="body2" color="textSecondary">
                Task Status: {booking.taskStatus}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Booking Date: {booking.bookingDate}
              </Typography>
               {/* Buttons Section */}
            <Box display="flex" justifyContent="space-between" marginTop={2}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleModifyBooking(booking.id)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",}}
              >
                Modify
              </Button>
                {/* Cancel Button */}
            {booking.taskStatus !== "CANCELLED" && (
                <button
                  onClick={() => handleCancelBooking(booking)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
            
            )}
            </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography textAlign="center" color="textSecondary">
          No bookings found.
        </Typography>
      )}
    </Box>
  );

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 800 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          My Bookings
        </Typography>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Current Bookings" />
          <Tab label="Past Bookings" />
          <Tab label="Future Bookings" />
        </Tabs>
        <Box sx={{ marginTop: 2 }}>
          {selectedTab === 0 && renderBookings(currentBookings)}
          {selectedTab === 1 && renderBookings(pastBookings)}
          {selectedTab === 2 && renderBookings(futureBookings)}
        </Box>
      </Paper>
    </Box>
  );
};

export default Booking;
