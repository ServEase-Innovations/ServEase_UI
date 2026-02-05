/* eslint-disable */
import { useState, useEffect } from "react";
import { Badge } from "../../components/Common/Badge";
import { Button } from "../../components/Button";
import { Calendar, MapPin, X, Phone, Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, Tabs, Tab } from "@mui/material";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Common/Card";
import { getBookingTypeBadge, getServiceTitle, getStatusBadge } from "../Common/Booking/BookingUtils";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Booking, BookingHistoryResponse } from "./Dashboard";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import dayjs, { Dayjs } from "dayjs";
import PaymentInstance from "src/services/paymentInstance";
import { useToast } from "../hooks/use-toast";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import axios from "axios";
import { OtpVerificationDialog } from "./OtpVerificationDialog";

interface AllBookingsDialogProps {
  bookings: BookingHistoryResponse | null;
  serviceProviderId: number | null;
  trigger: React.ReactNode;
}

// Function to format time string to AM/PM format
const formatTimeToAMPM = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    
    return `${displayHour}:${displayMinute} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

// Function to format time range from start and end time strings
const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTimeToAMPM(startTime)} - ${formatTimeToAMPM(endTime)}`;
};

// Function to handle calling customer
const handleCallCustomer = (phoneNumber: string, clientName: string, toast: any) => {
  if (!phoneNumber || phoneNumber === "Contact info not available") {
    toast({
      title: "No Contact Info",
      description: "Customer contact information is not available.",
      variant: "destructive",
    });
    return;
  }
  
  const telLink = `tel:${phoneNumber}`;
  window.open(telLink, '_blank');
  
  toast({
    title: "Calling Customer",
    description: `Calling ${clientName} at ${phoneNumber}`,
  });
};

// Function to handle tracking address
const handleTrackAddress = (address: string, toast: any) => {
  if (!address || address === "Address not provided") {
    toast({
      title: "No Address",
      description: "Address is not provided for this booking.",
      variant: "destructive",
    });
    return;
  }
  
  const encodedAddress = encodeURIComponent(address);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  
  window.open(googleMapsUrl, '_blank');
  
  toast({
    title: "Opening Maps",
    description: "Opening address in Google Maps for tracking.",
  });
};

export function AllBookingsDialog({
  bookings,
  serviceProviderId,
  trigger,
}: AllBookingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"ongoing" | "future" | "past">("ongoing");
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalBookings, setTotalBookings] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const { toast } = useToast();
  
  // Add states for task management
  const [taskStatus, setTaskStatus] = useState<Record<string, "IN_PROGRESS" | "COMPLETED" | undefined>>({});
  const [taskStatusUpdating, setTaskStatusUpdating] = useState<Record<string, boolean>>({});
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  // Function to get default month for each tab
  const getDefaultMonthForTab = (tabType: "ongoing" | "future" | "past"): Dayjs => {
    return dayjs().startOf('month');
  };

  const mapApiBookingToBooking = (apiBooking: any): Booking => {
    let date, timeRange;
    
    if (apiBooking.start_epoch && apiBooking.end_epoch) {
      const startDate = new Date(apiBooking.start_epoch * 1000);
      const endDate = new Date(apiBooking.end_epoch * 1000);
      
      const formattedDate = startDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      
      timeRange = `${startDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })} - ${endDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })}`;
      
      date = formattedDate;
    } else {
      const startDateRaw = apiBooking.startDate || apiBooking.start_date;
      const startTimeStr = apiBooking.startTime || "00:00";
      const endTimeStr = apiBooking.endTime || "00:00";

      const startDate = new Date(startDateRaw);
      const endDate = new Date(startDateRaw);

      const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
      const [endHours, endMinutes] = endTimeStr.split(":").map(Number);

      startDate.setHours(startHours, startMinutes);
      endDate.setHours(endHours, endMinutes);

      timeRange = formatTimeRange(apiBooking.startTime, apiBooking.endTime);
      
      date = startDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    }

    const clientName = apiBooking.firstname && apiBooking.lastname 
      ? `${apiBooking.firstname} ${apiBooking.lastname}`.trim()
      : apiBooking.firstname 
        ? apiBooking.firstname
        : apiBooking.email || "Client";

    const bookingId = apiBooking.engagement_id || apiBooking.id;

    const amount = apiBooking.base_amount ? 
      `₹${parseFloat(apiBooking.base_amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
      "₹0";

    const responsibilities = apiBooking.responsibilities || {};

    return {
      id: Number(apiBooking.engagement_id || apiBooking.id),
      serviceProviderId: Number(apiBooking.serviceproviderid || apiBooking.serviceProviderId),
      customerId: Number(apiBooking.customerid || apiBooking.customerId),
      start_date: apiBooking.start_date || apiBooking.startDate,
      endDate: apiBooking.end_date || apiBooking.endDate,
      engagements: "",
      timeslot: apiBooking.startTime && apiBooking.endTime ? 
                `${formatTimeToAMPM(apiBooking.startTime)} - ${formatTimeToAMPM(apiBooking.endTime)}` : 
                "",
      monthlyAmount: Number(apiBooking.base_amount || apiBooking.monthlyAmount || 0),
      paymentMode: "",
      booking_type: apiBooking.booking_type || apiBooking.bookingType || "",
      service_type: apiBooking.service_type || apiBooking.serviceType || "",
      bookingDate: apiBooking.created_at || apiBooking.bookingDate,
      responsibilities,
      housekeepingRole: null,
      mealType: null,
      noOfPersons: responsibilities.tasks?.[0]?.persons || null,
      experience: null,
      childAge: null,
      customerName: clientName,
      serviceProviderName: "",
      address: apiBooking.address || "",
      taskStatus: apiBooking.task_status || apiBooking.taskStatus || "",
      modifiedBy: "",
      modifiedDate: "",
      availableTimeSlots: null,
      customerHolidays: [],
      serviceProviderLeaves: [],
      active: true,
      clientName: clientName,
      service: apiBooking.service_type || apiBooking.serviceType || "",
      date: date,
      time: timeRange,
      location: apiBooking.address || "Address not provided",
      status: apiBooking.task_status || apiBooking.taskStatus || "",
      amount: amount,
      bookingData: {
        ...apiBooking,
        mobileno: apiBooking.mobileno || "",
        contact: apiBooking.mobileno || "Contact info not available",
        today_service: apiBooking.today_service || null
      }
    };
  };

  const fetchBookingsByMonth = async (
    month: number,
    year: number
  ): Promise<BookingHistoryResponse> => {
    if (!serviceProviderId) {
      return { current: [], upcoming: [], past: [] };
    }

    try {
      setLoading(true);
      const formattedMonth = `${year}-${String(month).padStart(2, "0")}`;
      const res = await PaymentInstance.get(
        `/api/service-providers/${serviceProviderId}/engagements?month=${formattedMonth}`
      );

      return res.data;
    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
      return { current: [], upcoming: [], past: [] };
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const fetchDataForTab = async (tab: "ongoing" | "future" | "past", monthDate: Dayjs) => {
    if (!serviceProviderId) return;

    try {
      setLoading(true);
      const month = monthDate.month() + 1;
      const year = monthDate.year();
      
      const apiResponse = await fetchBookingsByMonth(month, year);
      
      if (tab === "ongoing") {
        const currentBookings = apiResponse.current || [];
        setData(currentBookings.map(mapApiBookingToBooking));
        setTotalBookings(currentBookings.length);
      } else if (tab === "future") {
        const upcomingBookings = apiResponse.upcoming || [];
        setData(upcomingBookings.map(mapApiBookingToBooking));
        setTotalBookings(upcomingBookings.length);
      } else if (tab === "past") {
        const pastBookings = apiResponse.past || [];
        setData(pastBookings.map(mapApiBookingToBooking));
        setTotalBookings(pastBookings.length);
      }
    } catch (error) {
      console.error("Error fetching data for tab:", error);
      setData([]);
      setTotalBookings(0);
    }
  };

  const handleStartTask = async (bookingId: string, bookingData: any) => {
    if (!bookingId || !bookingData) return;

    const serviceDayId = bookingData.today_service?.service_day_id;
    if (!serviceDayId) {
      toast({
        title: "Error",
        description: "Service day ID not found. Cannot start service.",
        variant: "destructive",
      });
      return;
    }

    const previousStatus = taskStatus[bookingId];

    setTaskStatus(prev => ({ ...prev, [bookingId]: "IN_PROGRESS" }));
    setTaskStatusUpdating(prev => ({ ...prev, [bookingId]: true }));

    try {
      await PaymentInstance.post(
        `api/engagement-service/service-days/${serviceDayId}/start`,
        {},
        { 
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          } 
        }
      );

      toast({
        title: "Service Started",
        description: "You have successfully started the service. Task is now IN_PROGRESS",
        variant: "default",
      });

      await fetchDataForTab(tab, selectedMonth || dayjs());
    } catch (err) {
      setTaskStatus(prev => ({ ...prev, [bookingId]: previousStatus }));
      
      let errorMessage = "Failed to start service";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTaskStatusUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleStopTask = async (bookingId: string, bookingData: any) => {
    setCurrentBooking({ bookingId, bookingData });
    setOtpDialogOpen(true);
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!currentBooking) return;

    const serviceDayId = currentBooking.bookingData.today_service?.service_day_id;
    if (!serviceDayId) {
      toast({
        title: "Error",
        description: "Service day ID not found",
        variant: "destructive",
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      await PaymentInstance.post(
        `api/engagement-service/service-days/${serviceDayId}/complete`,
        { otp },
        { 
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          } 
        }
      );

      toast({
        title: "Success",
        description: "Service completed successfully! Earnings credited to your account.",
        variant: "default",
      });

      setTaskStatus(prev => ({ ...prev, [currentBooking.bookingId]: "COMPLETED" }));
      
      await fetchDataForTab(tab, selectedMonth || dayjs());
      
      return Promise.resolve();
    } catch (err) {
      let errorMessage = "Failed to complete service";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return Promise.reject(err);
    } finally {
      setVerifyingOtp(false);
      setOtpDialogOpen(false);
    }
  };

  // Handle tab change with month reset
  const handleTabChange = (_: React.SyntheticEvent, newValue: "ongoing" | "future" | "past") => {
    // Reset month to default for the new tab
    const defaultMonth = getDefaultMonthForTab(newValue);
    setSelectedMonth(defaultMonth);
    setTab(newValue);
  };

  useEffect(() => {
    if (!open) return;
    
    setData([]);
    setTotalBookings(0);
    // Set initial month based on current tab
    setSelectedMonth(getDefaultMonthForTab(tab));
  }, [open]);

  useEffect(() => {
    if (!open || !selectedMonth) return;
    
    fetchDataForTab(tab, selectedMonth);
  }, [selectedMonth, tab, open]);

  const getMonthName = (date: Dayjs) => {
    return date.format("MMMM YYYY");
  };

  const handleMonthChange = (newDate: Dayjs | null) => {
    if (newDate) {
      setSelectedMonth(newDate);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogHeader>
          <div className="flex justify-between items-center w-full">
            <span className="text-xl font-bold text-white-800">
             View all Bookings 
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-gray-200 text-2xl font-light focus:outline-none"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>

        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          centered
          sx={{
            "& .MuiTab-root": {
              textTransform: 'none',
              fontWeight: 500,
            }
          }}
        >
          <Tab value="ongoing" label={`Current (${tab === 'ongoing' ? totalBookings : '0'})`} />
          <Tab value="future" label={`Upcoming (${tab === 'future' ? totalBookings : '0'})`} />
          <Tab value="past" label={`Past (${tab === 'past' ? totalBookings : '0'})`} />
        </Tabs>

        <div className="px-4 pt-3 flex justify-between items-center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>   
            <DatePicker
              views={["month", "year"]}
              openTo="month"
              label="Select Month"
              value={selectedMonth}
              onChange={handleMonthChange}
              shouldDisableMonth={(date) => {
                const currentMonth = dayjs().startOf('month');
                const targetMonth = date.startOf('month');
                
                if (tab === "future") {
                  // For upcoming tab: disable past months
                  return targetMonth.isBefore(currentMonth, 'month');
                } else if (tab === "past") {
                  // For past tab: disable future months
                  return targetMonth.isAfter(currentMonth, 'month');
                }
                // For ongoing tab: all months enabled
                return false;
              }}
              slotProps={{
                textField: { 
                  size: "small", 
                  fullWidth: true,
                  sx: { maxWidth: 200 }
                },
              }}
            />
          </LocalizationProvider>
          <div className="ml-4 text-sm text-gray-600 min-w-[180px] text-right">
            {loading ? (
              <SkeletonLoader width={120} height={16} />
            ) : (
              `${totalBookings} booking${totalBookings !== 1 ? 's' : ''} in ${getMonthName(selectedMonth!)}`
            )}
          </div>
        </div>

        <DialogContent className="p-4 overflow-y-auto">
          {loading && initialLoad ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-gray-200 rounded-lg">
                  <CardHeader>
                    <SkeletonLoader height={24} width="60%" className="mb-2" />
                    <SkeletonLoader height={16} width="40%" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <SkeletonLoader height={16} width="80%" />
                      <SkeletonLoader height={16} width="60%" />
                    </div>
                    <SkeletonLoader height={16} width="90%" className="mb-4" />
                    <SkeletonLoader height={36} width="100%" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">
                <Calendar className="h-12 w-12 mx-auto text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">
                {tab === "ongoing" 
                  ? "No current bookings found" 
                  : tab === "future"
                    ? "No upcoming bookings found"
                    : "No past bookings found"
                } in {getMonthName(selectedMonth!)}
              </p>
              <p className="text-sm text-gray-500">
                {tab === "ongoing" 
                  ? "All your current bookings for this month will appear here." 
                  : tab === "future"
                    ? "All your upcoming bookings for this month will appear here."
                    : "All your past bookings for this month will appear here."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((booking) => {
                // Use the EXACT SAME LOGIC as in Dashboard
                const todayServiceStatus = booking.bookingData?.today_service?.status;
                const taskStatusOriginal = booking.taskStatus?.toUpperCase();
                
                const isInProgress = todayServiceStatus === 'IN_PROGRESS' || 
                                     taskStatus[booking.id.toString()] === 'IN_PROGRESS' || 
                                     taskStatusOriginal === 'IN_PROGRESS' || 
                                     taskStatusOriginal === 'STARTED';
                
                const isCompleted = todayServiceStatus === 'COMPLETED' || 
                                   taskStatusOriginal === 'COMPLETED';
                
                const isNotStarted = todayServiceStatus === 'SCHEDULED' || 
                                     taskStatusOriginal === 'NOT_STARTED';

                const canStart = booking.bookingData?.today_service?.can_start === true;
                
                const showStartButton = isNotStarted && canStart;
                const showCompleteButton = isInProgress;
                const showCompletedButton = isCompleted;

                return (
                  <Card
                    key={booking.id}
                    className="shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow mb-3"
                  >
                    <CardHeader className="flex flex-row items-start justify-between py-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-500">Booking ID: {booking.id}</p>
                          <div className="flex gap-2">
                            {getBookingTypeBadge(booking.booking_type)}
                            {getStatusBadge(booking.taskStatus)}
                          </div>
                        </div>
                        <CardTitle className="font-semibold text-gray-800 text-base mb-1">
                          {booking.clientName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {getServiceTitle(booking.service)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-1">
                      {/* Date, Time and Amount with Phone Icon */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Date & Time</p>
                          <p className="text-xs text-gray-600">
                            {booking.date} at {booking.time}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Amount</p>
                            <p className="text-xs font-semibold text-gray-800">
                              {booking.amount}
                            </p>
                          </div>
                          {booking.bookingData?.mobileno && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handleCallCustomer(booking.bookingData.mobileno, booking.clientName, toast)}
                              title={`Call ${booking.clientName}`}
                            >
                              <Phone className="h-3 w-3 text-gray-600" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Responsibilities Section */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Responsibilities</p>
                        <div className="flex flex-wrap gap-1">
                          {booking.responsibilities?.tasks?.map((task: any, index: number) => {
                            const taskLabel = task.persons ? `${task.persons} persons` : "";
                            return (
                              <Badge key={index} variant="outline" className="text-xs">
                                {task.taskType} {taskLabel}
                              </Badge>
                            );
                          })}
                          {booking.responsibilities?.add_ons?.map((addon: any, index: number) => (
                            <Badge key={`addon-${index}`} variant="outline" className="text-xs bg-blue-50">
                              Add-on: {typeof addon === 'object' ? JSON.stringify(addon) : addon}
                            </Badge>
                          ))}
                          {(!booking.responsibilities?.tasks?.length && !booking.responsibilities?.add_ons?.length) && (
                            <span className="text-xs text-gray-500">No responsibilities listed</span>
                          )}
                        </div>
                      </div>

                      {/* Location with Track Address Button */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-gray-500">Address</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleTrackAddress(booking.location, toast)}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Track Address
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">
                          {booking.location || "Address not provided"}
                        </p>
                      </div>

                      {/* Today's Service Status Badge - Only show if we have today_service */}
                      {todayServiceStatus && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">Today's Service:</span>
                            <Badge 
                              variant="outline"
                              className={`
                                text-xs
                                ${todayServiceStatus === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                ${todayServiceStatus === 'IN_PROGRESS' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                ${todayServiceStatus === 'COMPLETED' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                              `}
                            >
                              {todayServiceStatus}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Task Action Buttons - EXACT SAME LOGIC AS DASHBOARD */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500">
                          {isInProgress 
                            ? "Task In Progress" 
                            : isCompleted 
                              ? 'Task Completed' 
                              : isNotStarted
                                ? 'Not Started' 
                                : 'Upcoming'
                          }
                        </p>
                        <div className="flex gap-2">
                          {taskStatusUpdating[booking.id.toString()] ? (
                            <Button variant="ghost" size="sm" disabled>
                              <Loader2 className="h-3 w-3 animate-spin" />
                            </Button>
                          ) : showCompleteButton ? (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => handleStopTask(booking.id.toString(), booking.bookingData)}
                            >
                              Complete Task
                            </Button>
                          ) : showCompletedButton ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-7 text-xs px-2 bg-green-50 text-green-700 border-green-200"
                              disabled
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Button>
                          ) : showStartButton ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => handleStartTask(booking.id.toString(), booking.bookingData)}
                            >
                              Start Task
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-7 text-xs px-2 bg-gray-50 text-gray-500 border-gray-200"
                              disabled
                            >
                              Cannot Start Yet
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <OtpVerificationDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        onVerify={handleVerifyOtp}
        verifying={verifyingOtp}
        bookingInfo={currentBooking ? {
          clientName: currentBooking.bookingData?.firstname || currentBooking.bookingData?.customerName,
          service: getServiceTitle(currentBooking.bookingData?.service_type || currentBooking.bookingData?.serviceType),
          bookingId: currentBooking.bookingData?.engagement_id || currentBooking.bookingData?.id,
        } : undefined}
      />
    </>
  );
}