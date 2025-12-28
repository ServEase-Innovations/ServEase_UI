/* eslint-disable */
import { useState, useEffect } from "react";
import { Badge } from "../../components/Common/Badge";
import { Button } from "../../components/Button";
import { Calendar, MapPin, X, Phone, Clock } from "lucide-react";
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
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalBookings, setTotalBookings] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const { toast } = useToast();
  
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

    // Get client name - using email since name fields are empty
    const clientName = apiBooking.firstname || 
                      apiBooking.customerName || 
                      apiBooking.email || 
                      "Client";

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
        contact: apiBooking.mobileno || "Contact info not available"
      }
    };
  };

  const fetchBookingsByMonth = async (
    type: "ongoing" | "future" | "past",
    month: number,
    year: number
  ) => {
    if (!serviceProviderId) return [];

    try {
      setLoading(true);
      const formatted = `${year}-${String(month).padStart(2, "0")}`;
      const res = await PaymentInstance.get(
        `/api/service-providers/${serviceProviderId}/engagements?month=${formatted}`
      );

      const apiData: BookingHistoryResponse = res.data;
      
      let list: any[] = [];
      
      if (type === "ongoing") {
        // For ongoing tab, get current bookings for the current month
        list = apiData.current ?? [];
      } else if (type === "future") {
        list = apiData.upcoming ?? [];
      } else if (type === "past") {
        list = apiData.past ?? [];
      }
      
      return list.map(mapApiBookingToBooking);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      return [];
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const fetchOngoingBookings = async () => {
    if (!serviceProviderId) return [];
    
    try {
      setLoading(true);
      const now = dayjs();
      const currentMonth = now.month() + 1;
      const currentYear = now.year();
      
      const bookings = await fetchBookingsByMonth("ongoing", currentMonth, currentYear);
      
      // Filter to get today's bookings or active ongoing bookings
      const today = dayjs().format("YYYY-MM-DD");
      const ongoingBookings = bookings.filter((booking) => {
        const bookingDate = dayjs(booking.start_date).format("YYYY-MM-DD");
        return bookingDate === today || booking.taskStatus === "IN_PROGRESS";
      });
      
      return ongoingBookings;
    } catch (err) {
      console.error("Error fetching ongoing bookings:", err);
      return [];
    }
  };

  useEffect(() => {
    if (!open) return;
    
    // Reset data when dialog opens
    setData([]);
    setTotalBookings(0);
    
    if (!serviceProviderId) {
      // Fallback to using props if no serviceProviderId
      if (bookings) {
        const mapData = (list: any[]) => list.map(mapApiBookingToBooking);
        
        if (tab === "ongoing") {
          const ongoingBookings = mapData(bookings.current ?? []);
          setData(ongoingBookings);
          setTotalBookings(ongoingBookings.length);
          setSelectedMonth(dayjs());
        } else if (tab === "future") {
          const nextMonth = dayjs().add(1, "month").startOf("month");
          setSelectedMonth(nextMonth);
          const futureBookings = mapData(bookings.upcoming ?? []);
          setData(futureBookings);
          setTotalBookings(futureBookings.length);
        } else if (tab === "past") {
          const prevMonth = dayjs().subtract(1, "month").startOf("month");
          setSelectedMonth(prevMonth);
          const pastBookings = mapData(bookings.past ?? []);
          setData(pastBookings);
          setTotalBookings(pastBookings.length);
        }
      }
      setInitialLoad(false);
      return;
    }
    
    // Fetch data from API based on tab
    if (tab === "ongoing") {
      fetchOngoingBookings().then((res) => {
        setData(res);
        setTotalBookings(res.length);
        setSelectedMonth(dayjs());
      });
    } else if (tab === "future") {
      const nextMonth = dayjs().add(1, "month").startOf("month");
      setSelectedMonth(nextMonth);
      fetchBookingsByMonth("future", nextMonth.month() + 1, nextMonth.year()).then(
        (res) => {
          setData(res ?? []);
          setTotalBookings(res.length);
        }
      );
    } else if (tab === "past") {
      const prevMonth = dayjs().subtract(1, "month").startOf("month");
      setSelectedMonth(prevMonth);
      fetchBookingsByMonth("past", prevMonth.month() + 1, prevMonth.year()).then(
        (res) => {
          setData(res ?? []);
          setTotalBookings(res.length);
        }
      );
    }
  }, [tab, open]);

  useEffect(() => {
    if (!open || !selectedMonth || tab === "ongoing") return;

    setLoading(true);
    fetchBookingsByMonth(
      tab,
      selectedMonth.month() + 1,
      selectedMonth.year()
    ).then((res) => {
      setData(res ?? []);
      setTotalBookings(res.length);
    });
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
          <Tab value="ongoing" label={`Ongoing (${data.length})`} />
          <Tab value="future" label="Future" />
          <Tab value="past" label="Past" />
        </Tabs>

        <div className="px-4 pt-3 flex justify-between items-center">
          {(tab === "future" || tab === "past") ? (
            <>
              <LocalizationProvider dateAdapter={AdapterDayjs}>   
                <DatePicker
                  views={["year", "month"]}
                  label="Select Month"
                  value={selectedMonth}
                  onChange={(newValue) => {
                    if (newValue) {
                      setSelectedMonth(newValue);
                    }
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
            </>
          ) : (
            <div className="text-sm text-gray-600">
              {loading ? (
                <SkeletonLoader width={120} height={16} />
              ) : (
                `${totalBookings} ongoing booking${totalBookings !== 1 ? 's' : ''}`
              )}
            </div>
          )}
        </div>

        <DialogContent className="p-4 overflow-y-auto">
          {loading ? (
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
                  ? "No ongoing bookings found" 
                  : `No ${tab} bookings found`
                }
              </p>
              <p className="text-sm text-gray-500">
                {tab === "ongoing" 
                  ? "All your current bookings will appear here." 
                  : `Try selecting a different month to view ${tab} bookings.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((booking) => (
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
                        </div>
                      </div>
                      <CardTitle className="font-semibold text-gray-800 text-lg mb-1">
                        {booking.clientName}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {getServiceTitle(booking.service)}
                        </span>
                        <span className="text-gray-300">•</span>
                        {getStatusBadge(booking.taskStatus)}
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
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}