/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Snackbar,
  Alert,
  MenuItem,
} from '@mui/material';
import axiosInstance from '../../services/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/userStore';
import { update } from "../../features/bookingType/bookingTypeSlice";
import ProviderDetails from '../ProviderDetails/ProviderDetails';

type UserState = {
  value?: {
    serviceeType?: string;
    customerDetails?: {
      customerId: number;
      firstName: string;
      lastName: string;
    };
  } | null;
};

interface Booking {
  id: number;
  name: string;
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
  engagements: string;
  serviceeType: string;
  serviceType: string;
  childAge: string;
  experience: string;
  noOfPersons: string;
  mealType: string;
  responsibilities: string;
}

const Booking: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [futureBookings, setFutureBookings] = useState<Booking[]>([]);
  const user = useSelector((state: RootState) => state.user as UserState);
  const customerId = user?.value?.customerDetails?.customerId ?? null;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [uniqueMissingSlots, setUniqueMissingSlots] = useState<string[]>([]);

  // Fetch available time slots for a service provider
  const generateTimeSlots = async (serviceProviderId: number): Promise<string[]> => {
    try {
      const response = await axiosInstance.get(
        `/api/serviceproviders/get/engagement/by/serviceProvider/${serviceProviderId}`
      );

      const engagementData = response.data.map((engagement: { id?: number; availableTimeSlots?: string[] }) => ({
        id: engagement.id ?? Math.random(),
        availableTimeSlots: engagement.availableTimeSlots || [],
      }));

      const fullTimeSlots: string[] = Array.from({ length: 15 }, (_, i) =>
        `${(i + 6).toString().padStart(2, "0")}:00`
      );
      

      const processedSlots = engagementData.map(entry => {
        const uniqueAvailableTimeSlots = Array.from(new Set(entry.availableTimeSlots)).sort();
        const missingTimeSlots = fullTimeSlots.filter(slot => !uniqueAvailableTimeSlots.includes(slot));

        return {
          id: entry.id,
          uniqueAvailableTimeSlots,
          missingTimeSlots,
        };
      });

      const uniqueMissingSlots: string[] = Array.from(
        new Set(processedSlots.flatMap(slot => slot.missingTimeSlots))
      ).sort() as string[];

      setUniqueMissingSlots(uniqueMissingSlots);

      return fullTimeSlots.filter(slot => !uniqueMissingSlots.includes(slot));
    } catch (error) {
      console.error("Error fetching engagement data:", error);
      return [];
    }
  };

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
                      serviceeType: item.serviceeType,
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
                      engagements: item.engagements,
                      bookingDate: item.bookingDate,
                      serviceType: item.serviceType,
                      childAge: item.childAge,
                      experience: item.experience,
                      noOfPersons: item.noOfPersons,
                      mealType: item.mealType,
                      responsibilities: item.responsibilities,
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

  const handleModifyBooking = async (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedTimeSlot(booking.timeSlot);

    // Fetch available time slots for the service provider
    const availableSlots = await generateTimeSlots(booking.serviceProviderId);
    setTimeSlots(availableSlots);

    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  const handleTimeSlotChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedTimeSlot(event.target.value as string);
  };

  const handleSave = async () => {
    if (selectedBooking && selectedTimeSlot) {
      const updatePayload = {
        id: selectedBooking.id,
        serviceProviderId: selectedBooking.serviceProviderId,
        customerId: customerId,
        startDate: selectedBooking.startDate,
        endDate: selectedBooking.endDate,
        engagements: selectedBooking.engagements,
        timeslot: selectedTimeSlot, // Updated time slot
        monthlyAmount: selectedBooking.monthlyAmount,
        paymentMode: selectedBooking.paymentMode,
        bookingType: selectedBooking.bookingType,
        bookingDate: selectedBooking.bookingDate,
        responsibilities: selectedBooking.responsibilities,
        serviceType: selectedBooking.serviceType,
        mealType: selectedBooking.mealType,
        noOfPersons: selectedBooking.noOfPersons,
        experience: selectedBooking.experience,
        childAge: selectedBooking.childAge,
        serviceeType: selectedBooking.serviceeType,
        customerName: selectedBooking.customerName,
        serviceProviderName: selectedBooking.serviceProviderName,
        address: selectedBooking.address,
        taskStatus: selectedBooking.taskStatus,
      };

      try {
        const response = await axiosInstance.put(
          `/api/serviceproviders/update/engagement/${selectedBooking.id}`,
          updatePayload
        );

        console.log("Update Response:", response.data);

        // Update state to reflect the change
        setCurrentBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBooking.id ? { ...b, timeSlot: selectedTimeSlot } : b
          )
        );
        setFutureBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBooking.id ? { ...b, timeSlot: selectedTimeSlot } : b
          )
        );

        setOpenDialog(false);
        setSelectedBooking(null);
        setOpenSnackbar(true);
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
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    const updatedStatus = "CANCELLED";

    const updatePayload = {
      id: booking.id,
      serviceProviderId: booking.serviceProviderId,
      customerId: customerId, // Fixed: Use `booking.customerId` instead of `customerId`
      startDate: booking.startDate,
      endDate: booking.endDate,
      engagements: booking.engagements,
      timeslot: booking.timeSlot, // Fixed: Match field name (not timeSlot)
      monthlyAmount: booking.monthlyAmount,
      paymentMode: booking.paymentMode,
      bookingType: booking.bookingType,
      bookingDate: booking.bookingDate,
      responsibilities: booking.responsibilities,
      serviceType: booking.serviceType,
      mealType: booking.mealType,
      noOfPersons: booking.noOfPersons,
      experience: booking.experience,
      childAge: booking.childAge,
      serviceeType: booking.serviceeType, // Kept as it is since it exists in your JSON
      customerName: booking.customerName,
      serviceProviderName: booking.serviceProviderName,
      address: booking.address,
      taskStatus: updatedStatus, // Updated task status
    };

    try {
      console.log(`Updating engagement with ID ${booking.id} to status ${updatedStatus}`);
      const response = await axiosInstance.put(
        `/api/serviceproviders/update/engagement/${booking.id}`,
        updatePayload
      );

      console.log("Update Response:", response.data);

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
    setOpenSnackbar(true);
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

              <Typography variant="h6" gutterBottom>
                Service Provider: {booking.serviceProviderName}
              </Typography>

              <Typography variant="body2" color="textSecondary">
                Service Type: {booking.serviceeType}
              </Typography>

              <Typography variant="body2" color="textSecondary">
                Start Date: {booking.startDate}
              </Typography>

              <Typography variant="body2" color="textSecondary">
                End Date: {booking.endDate}
              </Typography>

              <Typography variant="body2" color="textSecondary">
                Payment Mode: {booking.paymentMode}
              </Typography>

              <Typography variant="body2" color="textSecondary">
                Booking Date: {booking.bookingDate}
              </Typography>

              {booking.taskStatus !== "CANCELLED" && (
                <>
                  <Typography variant="body2" color="textSecondary">
                    Time Slot: {booking.timeSlot}
                  </Typography>

                  <Typography variant="body2" color="textSecondary">
                    Booking Type: {booking.bookingType}
                  </Typography>

                  <Typography variant="body2" color="textSecondary">
                    Monthly Amount: ₹{booking.monthlyAmount}
                  </Typography>

                  <Typography variant="body2" color="textSecondary">
                    Address: {booking.address}
                  </Typography>

                  <Typography variant="body2" color="textSecondary">
                    Task Status: {booking.taskStatus}
                  </Typography>
                </>
              )}
              <Box display="flex" justifyContent="space-between" marginTop={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleModifyBooking(booking)}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Modify
                </Button>
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

      {/* Dialog for modifying bookings */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Modify Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Change the time slot for your booking:
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedTimeSlot}
            onChange={handleTimeSlotChange}
          >
            {timeSlots.map((slot) => (
              <MenuItem key={slot} value={slot}>
                {slot}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success">Booking updated successfully!</Alert>
      </Snackbar>
    </Box>
  );
};

export default Booking;