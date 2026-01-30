/* eslint-disable */
import { useState, useEffect } from "react";
import { Badge } from "../../components/Common/Badge";
import { Button } from "../../components/Button";
import { Calendar, MapPin, X, Phone, Clock, Loader2, CheckCircle } from "lucide-react";
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

// Helper function to convert epoch to formatted date and time
const formatEpochToDateTime = (epochSeconds: number) => {
  const date = new Date(epochSeconds * 1000);
  
  // Format date
  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  
  // Format time in 12-hour format with AM/PM
  const formattedTime = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  
  return { formattedDate, formattedTime, date };
};

// Function to format time string to AM/PM format
const formatTimeToAMPM = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
    const displayMinute = minute.toString().padStart(2, '0');
    
    return `${displayHour}:${displayMinute} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return original if parsing fails
  }
};

// Function to format time range from start and end time strings
const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTimeToAMPM(startTime)} - ${formatTimeToAMPM(endTime)}`;
};

export function AllBookingsDialog({
  bookings,
  serviceProviderId,
  trigger,
}: AllBookingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"ongoing" | "future" | "past">("ongoing");
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs()); // Set default to current month
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
  
  const mapApiBookingToBooking = (apiBooking: any): Booking => {
    // Use epoch time if available, otherwise fall back to date strings
    let date, timeRange;
    
    if (apiBooking.start_epoch && apiBooking.end_epoch) {
      // Convert epoch seconds to Date objects
      const startDate = new Date(apiBooking.start_epoch * 1000);
      const endDate = new Date(apiBooking.end_epoch * 1000);
      
      // Format date
      const formattedDate = startDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      
      // Format time range
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
      // Fallback to using date strings and time strings
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

    // Get client name - prioritize firstname + lastname, then email
    const clientName = apiBooking.firstname && apiBooking.lastname 
      ? `${apiBooking.firstname} ${apiBooking.lastname}`.trim()
      : apiBooking.firstname 
        ? apiBooking.firstname
        : apiBooking.email || "Client";

    // Get booking ID - use engagement_id
    const bookingId = apiBooking.engagement_id || apiBooking.id;

    // Get amount - use base_amount, format properly
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

  // Fetch data based on selected tab and month
  const fetchDataForTab = async (tab: "ongoing" | "future" | "past", monthDate: Dayjs) => {
    if (!serviceProviderId) return;

    try {
      setLoading(true);
      const month = monthDate.month() + 1;
      const year = monthDate.year();
      
      const apiResponse = await fetchBookingsByMonth(month, year);
      
      if (tab === "ongoing") {
        // For ongoing tab, show current bookings from current month
        const currentBookings = apiResponse.current || [];
        setData(currentBookings.map(mapApiBookingToBooking));
        setTotalBookings(currentBookings.length);
      } else if (tab === "future") {
        // For future tab, show upcoming bookings from selected month
        const upcomingBookings = apiResponse.upcoming || [];
        setData(upcomingBookings.map(mapApiBookingToBooking));
        setTotalBookings(upcomingBookings.length);
      } else if (tab === "past") {
        // For past tab, show past bookings from selected month
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

  // Add functions for task management
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

      // Refresh current month data after starting task
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
      
      // Refresh current month data after completing task
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

  // Initialize data when dialog opens
  useEffect(() => {
    if (!open) return;
    
    // Reset data when dialog opens
    setData([]);
    setTotalBookings(0);
    
    // Always set to current month when dialog opens
    setSelectedMonth(dayjs());
  }, [open]);

  // Fetch data when selectedMonth or tab changes
  useEffect(() => {
    if (!open || !selectedMonth) return;
    
    fetchDataForTab(tab, selectedMonth);
  }, [selectedMonth, tab, open]);

  const getMonthName = (date: Dayjs) => {
    return date.format("MMMM YYYY");
  };

  const handleContactClient = (booking: Booking) => {
    const contactInfo = booking.bookingData?.mobileno || booking.bookingData?.contact || "Contact info not available";
    
    toast({
      title: "Contact Information",
      description: `Call ${booking.clientName} at ${contactInfo}`,
    });
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
          onChange={(_, newValue) => setTab(newValue)} 
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
              views={["year", "month"]}
              label="Select Month"
              value={selectedMonth}
              onChange={handleMonthChange}
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
            <div className="space-y-4">
              {data.map((booking) => {
                // For ongoing tab only, check task status for today's service
                let showTaskActions = false;
                let todayServiceStatus = null;
                let isInProgress = false;
                let isCompleted = false;
                let isNotStarted = false;
                let canStart = false;
                
                if (tab === "ongoing") {
                  todayServiceStatus = booking.bookingData?.today_service?.status;
                  const taskStatusOriginal = booking.taskStatus?.toUpperCase();
                  
                  // Check if service is in progress
                  isInProgress = todayServiceStatus === 'IN_PROGRESS' || 
                                taskStatus[booking.id.toString()] === 'IN_PROGRESS' || 
                                taskStatusOriginal === 'IN_PROGRESS' || 
                                taskStatusOriginal === 'STARTED';
                  
                  isCompleted = todayServiceStatus === 'COMPLETED' || 
                               taskStatusOriginal === 'COMPLETED';
                  
                  isNotStarted = todayServiceStatus === 'SCHEDULED' || 
                                taskStatusOriginal === 'NOT_STARTED';

                  // Check if service can be started based on today_service
                  canStart = booking.bookingData?.today_service?.can_start === true;
                  
                  showTaskActions = true;
                }

                return (
                  <Card
                    key={booking.id}
                    className="shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-500">Booking ID: {booking.id}</p>
                          <div className="flex gap-2">
                            {getBookingTypeBadge(booking.booking_type)}
                            {getStatusBadge(booking.taskStatus)}
                          </div>
                        </div>
                        <CardTitle className="font-semibold text-gray-800 text-lg mb-1">
                          {booking.clientName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {getServiceTitle(booking.service)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-2">
                      {/* Date, Time and Amount */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                        <div className="text-right md:text-left">
                          <p className="text-sm font-medium text-gray-500 mb-1">Amount</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {booking.amount}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-sm mb-4 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{booking.location}</span>
                      </div>

                      {/* Responsibilities Section */}
                      <div className="mb-4">
                        <p className="font-medium text-sm text-gray-700 mb-2">Responsibilities:</p>
                        <div className="flex flex-wrap gap-2">
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

                      {/* Today's Service Status Badge - Only for ongoing tab */}
                      {tab === "ongoing" && todayServiceStatus && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Today's Service:</span>
                            <Badge 
                              variant="outline"
                              className={`
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

                      {/* Task Action Buttons - Only for ongoing tab */}
                      {showTaskActions && (
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium text-gray-500">
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
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </Button>
                            ) : isInProgress ? (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleStopTask(booking.id.toString(), booking.bookingData)}
                              >
                                Complete Task
                              </Button>
                            ) : isCompleted ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                disabled
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completed
                              </Button>
                            ) : isNotStarted && canStart ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleStartTask(booking.id.toString(), booking.bookingData)}
                              >
                                Start Task
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                disabled
                                className="bg-gray-50 text-gray-500 border-gray-200"
                              >
                                Cannot Start Yet
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        onClick={() => handleContactClient(booking)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Client
                      </Button>
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