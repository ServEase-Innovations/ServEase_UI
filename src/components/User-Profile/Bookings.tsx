/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Phone, MessageCircle, Star, CheckCircle, XCircle, AlertCircle, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Common/Card';

import { Button } from '@/components/Button/button';
import { Badge } from '@/components/Common/Badge/Badge';
import { Separator } from '@/components/Common/Separator/Separator';
import axiosInstance from '../../services/axiosInstance';
import { useAuth0 } from '@auth0/auth0-react';
import UserHoliday from './UserHoliday';


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

const getServiceIcon = (type: string) => {
  const iconClass = "h-5 w-5";
  switch (type) {
    case 'maid':
      return <span className={`{iconClass} text-orange-500`}>👩‍🍳</span>;
    case 'cleaning':
      return <span className={`{iconClass} text-pink-500`}>🧹</span>;
    case 'nanny':
      return <span className={`{iconClass} text-red-500`}>❤️</span>;
    default:
      return <span className={iconClass}>🔧</span>;
  }
};

const getStatusBadge = (status: string) => {
  console.log("Status:", status);
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
        <AlertCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>;
    case 'COMPLETED':
      return <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </Badge>;
    case 'CANCELLED':
      return <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
        <XCircle className="h-3 w-3 mr-1" />
        Cancelled
      </Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground border-secondary">
        <Clock className="h-3 w-3 mr-1" />
        In Progress
      </Badge>;
      case 'NOT_STARTED':
        return <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground border-secondary">
          <Clock className="h-3 w-3 mr-1" />
          NOT_STARTED
        </Badge>;
    default:
      return null;
  }
};

const getServiceTitle = (type: string) => {
  switch (type) {
    case 'cook':
      return 'Home Cook';
    case 'maid':
      return 'Maid Service';
    case 'nanny':
      return 'Caregiver Service';
    default:
      return 'Home Service';
  }
};

const Booking: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [futureBookings, setFutureBookings] = useState<Booking[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [uniqueMissingSlots, setUniqueMissingSlots] = useState<string[]>([]);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [selectedBookingForLeave, setSelectedBookingForLeave] = useState<Booking | null>(null);
  const { user: auth0User, isAuthenticated } = useAuth0();
  const [customerId, setCustomerId] = useState<number | null>(null);

  // const generateTimeSlots = () => {
  //   const slots = [];
  //   for (let i = 6; i <= 20; i++) {
  //     slots.push(`{i.toString().padStart(2, '0')}:00`);
  //   }
  //   return slots;
  // };

useEffect(() => {
  if (isAuthenticated && auth0User) {
    setCustomerId(auth0User.customerid); // Use this directly
  }
}, [isAuthenticated, auth0User]);
  // Fetch available time slots for a service provider
  const generateTimeSlots = async (serviceProviderId: number): Promise<string[]> => {
    try {
      const response = await axiosInstance.get(
        `/api/serviceproviders/get/engagement/by/serviceProvider/{serviceProviderId}`
      );

      const engagementData = response.data.map((engagement: { id?: number; availableTimeSlots?: string[] }) => ({
        id: engagement.id ?? Math.random(),
        availableTimeSlots: engagement.availableTimeSlots || [],
      }));

      const fullTimeSlots: string[] = Array.from({ length: 15 }, (_, i) =>
        `{(i + 6).toString().padStart(2, "0")}:00`
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
        .get(`api/serviceproviders/get-sp-booking-history?page=0&size=100`)
        .then((response) => {
          const { past = [], current = [], future = [] } = response.data || {};
          console.log('Past Bookings:', past);
          const mapBookingData = (data: any[]) =>
            Array.isArray(data)
              ? data
                  // .filter((item) => item.customerId === customerId)
                  .map((item) => {
                    console.log("Service Provider ID:", item.serviceProviderId);

                    return {
                      id: item.id,
    customerId: item.customerId,
    serviceProviderId: item.serviceProviderId,
    name: item.customerName,
    serviceeType: item.serviceeType,
    timeSlot: item.timeslot,
    date: item.startDate,
    startDate: item.startDate,
    endDate: item.endDate,
    bookingType: item.bookingType,
    monthlyAmount: item.monthlyAmount,
    paymentMode: item.paymentMode,
    address: item.address || 'No address specified',
    customerName: item.customerName,
    serviceProviderName: item.serviceProviderName === "undefined undefined" ? "Not Assigned" : item.serviceProviderName,
    taskStatus: item.taskStatus,
    engagements: item.engagements,
    bookingDate: item.bookingDate,
    serviceType: item.serviceType?.toLowerCase() || 'other',
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
          `/api/serviceproviders/update/engagement/{selectedBooking.id}`,
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

  // Create base payload without service provider info
  const updatePayload: any = {
    id: booking.id,
    customerId: customerId,
    startDate: booking.startDate,
    endDate: booking.endDate,
    engagements: booking.engagements,
    timeslot: booking.timeSlot,
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
    serviceeType: booking.serviceeType,
    customerName: booking.customerName,
    address: booking.address,
    taskStatus: updatedStatus,
  };

  // Only include service provider info if not ON_DEMAND
  if (booking.bookingType !== "ON_DEMAND") {
    updatePayload.serviceProviderId = booking.serviceProviderId;
    updatePayload.serviceProviderName = booking.serviceProviderName;
  }

  try {
    console.log(`Updating engagement with ID {booking.id} to status {updatedStatus}`);
    const response = await axiosInstance.put(
      `/api/serviceproviders/update/engagement/{booking.id}`,
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
 const handleLeaveSubmit = async (startDate: string, endDate: string): Promise<void> => {
  if (!selectedBookingForLeave || !customerId) {
    throw new Error("Missing required information for leave application");
  }

  try {
    await axiosInstance.post(
      '/api/customer/add-customer-holiday',
      {
        customerId: customerId,
        startDate: startDate,
        endDate: endDate
      }
    );
    setOpenSnackbar(true);
  } catch (error) {
    console.error("Error applying leave:", error);
    throw error;
  }
};

const handleApplyLeaveClick = (booking: Booking) => {
  setSelectedBookingForLeave(booking);
  setHolidayDialogOpen(true);
};



    return (
      <div className="min-h-screen bg-background" style={{marginTop: '5%'}}>
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-primary-foreground/80 mt-2">Manage your household service appointments</p>
          </div>
        </div>
  
        <div className="container mx-auto px-4 py-8">
          {/* Upcoming Bookings */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-l-4 border-primary">
              <AlertCircle className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-card-foreground">Upcoming Bookings</h2>
                <p className="text-sm text-muted-foreground">
                  {currentBookings.length} {currentBookings.length === 1 ? 'booking' : 'bookings'} scheduled
                </p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {currentBookings.length}
              </Badge>
            </div>
            {currentBookings.length > 0 ? (
              <div className="grid gap-4">
                {currentBookings.map((booking) => (
                  <Card key={booking.id} className="shadow-card hover:shadow-hover transition-all duration-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getServiceIcon(booking.serviceType)}
                          <div>
                            <CardTitle className="text-lg">{getServiceTitle(booking.serviceType)}</CardTitle>
                            <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                          </div>
                        </div>
                        {getStatusBadge(booking['status'] || booking.taskStatus)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking['time']} ({booking['duration']})</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.address}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium">{booking.serviceProviderName}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-muted-foreground">{booking['providerRating'] || 4.5}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{booking.monthlyAmount}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2 flex-wrap">
                        {booking.address && (
                          <Button variant="outline" size="sm" className="flex-1 min-w-0">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Provider
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex-1 min-w-0">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1 min-w-0">
                          Cancel Booking
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No Upcoming Bookings</h3>
                  <p className="text-muted-foreground mb-4">Ready to book your next service?</p>
                  <Button>Book a Service</Button>
                </CardContent>
              </Card>
            )}
          </section>
  
          {/* Past Bookings */}
          <section>
            <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-muted/30 to-transparent rounded-lg border-l-4 border-muted-foreground/30">
              <History className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-card-foreground">Past Bookings</h2>
                <p className="text-sm text-muted-foreground">
                  {pastBookings.length} {pastBookings.length === 1 ? 'booking' : 'bookings'} in history
                </p>
              </div>
              <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                {pastBookings.length}
              </Badge>
            </div>
            {pastBookings.length > 0 ? (
              <div className="grid gap-4">
                {pastBookings.map((booking) => (
                  <Card key={booking.id} className="shadow-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getServiceIcon(booking.serviceType)}
                          <div>
                            <CardTitle className="text-lg">{getServiceTitle(booking.serviceType)}</CardTitle>
                            <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                          </div>
                        </div>
                        {getStatusBadge(booking.taskStatus)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.startDate} ({booking.endDate})</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.address}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium">{booking.serviceProviderName}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-muted-foreground">{booking['providerRating'] || 4.5}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{booking.monthlyAmount}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2 flex-wrap">
                        {booking.taskStatus === 'completed' && (
                          <Button variant="outline" size="sm" className="flex-1 min-w-0">
                            <Star className="h-4 w-4 mr-2" />
                            Rate Service
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex-1 min-w-0">
                          Book Again
                        </Button>
                        {booking.taskStatus === 'completed' && (
                          <Button variant="outline" size="sm" className="flex-1 min-w-0">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No Past Bookings</h3>
                  <p className="text-muted-foreground">Your completed and cancelled bookings will appear here.</p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    );
};

export default Booking;