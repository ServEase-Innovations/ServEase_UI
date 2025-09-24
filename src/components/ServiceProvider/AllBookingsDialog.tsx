/* eslint-disable */
import { useState, useEffect } from "react";
import { Badge } from "../../components/Common/Badge";
import { Button } from "../../components/Button";
import { Calendar, MapPin, X } from "lucide-react";
import { Dialog, DialogContent, Tabs, Tab } from "@mui/material";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Common/Card";
import { getBookingTypeBadge, getServiceTitle, getStatusBadge } from "../Common/Booking/BookingUtils";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axiosInstance from "src/services/axiosInstance";
import { Booking, BookingHistoryResponse } from "./Dashboard";
import { SkeletonLoader } from "../Common/SkeletonLoader/SkeletonLoader";
import dayjs, { Dayjs } from "dayjs";
import PaymentInstance from "src/services/paymentInstance";

interface AllBookingsDialogProps {
  bookings: BookingHistoryResponse | null;
  serviceProviderId: number | null;
  trigger: React.ReactNode;
}

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
  
  const mapApiBookingToBooking = (apiBooking: any): Booking => {
    const responsibilities = apiBooking.responsibilities || {};
    const noOfPersons = apiBooking.responsibilities?.tasks?.[0]?.persons || null;

    return {
      id: Number(apiBooking.id),
      serviceProviderId: Number(apiBooking.serviceProviderId),
      customerId: Number(apiBooking.customerId),
      start_date: apiBooking.startDate,
      endDate: apiBooking.endDate,
      engagements: "",
      timeslot: apiBooking.startTime && apiBooking.endTime ? `${apiBooking.startTime} - ${apiBooking.endTime}` : "",
      monthlyAmount: Number(apiBooking.monthlyAmount || 0),
      paymentMode: "",
      booking_type: apiBooking.bookingType || "",
      service_type: apiBooking.serviceType || "",
      bookingDate: apiBooking.bookingDate,
      responsibilities, // Keep the full responsibilities object
      housekeepingRole: null,
      mealType: null,
      noOfPersons,
      experience: null,
      childAge: null,
      customerName: `${apiBooking.firstname || ""} ${apiBooking.lastname || ""}`.trim(),
      serviceProviderName: "",
      address: null,
      taskStatus: apiBooking.taskStatus || "",
      modifiedBy: "",
      modifiedDate: "",
      availableTimeSlots: null,
      customerHolidays: [],
      serviceProviderLeaves: [],
      active: true,
      clientName: `${apiBooking.firstname || ""} ${apiBooking.lastname || ""}`.trim(),
      service: apiBooking.serviceType || "",
      date: apiBooking.startDate?.split("T")[0] || "",
      time: apiBooking.startTime && apiBooking.endTime ? `${apiBooking.startTime} - ${apiBooking.endTime}` : "",
      location: "",
      status: apiBooking.taskStatus || "",
      amount: apiBooking.monthlyAmount || "0",
      bookingData: apiBooking
    };
  };

  const fetchBookingsByMonth = async (
    type: "future" | "past",
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

      // ✅ Fix: Use 'upcoming' instead of 'future'
      const list = type === "future" ? apiData.upcoming ?? [] : apiData.past ?? [];
      return list.map(mapApiBookingToBooking);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      return [];
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!bookings) {
      setData([]);
      setTotalBookings(0);
      setInitialLoad(false);
      return;
    }

    const mapData = (list: any[]) => list.map(mapApiBookingToBooking);

    const now = dayjs();

    if (tab === "ongoing") {
      setLoading(true);
      // Simulate loading for ongoing bookings too
      setTimeout(() => {
        const ongoingBookings = mapData(bookings.current ?? []);
        setData(ongoingBookings);
        setTotalBookings(ongoingBookings.length);
        setSelectedMonth(now);
        setLoading(false);
        setInitialLoad(false);
      }, 500);
    } else if (tab === "future") {
      setLoading(true);
      const nextMonth = dayjs().add(1, "month").startOf("month");
      setSelectedMonth(nextMonth);
      fetchBookingsByMonth("future", nextMonth.month() + 1, nextMonth.year()).then(
        (res) => {
          setData(res ?? []);
          setTotalBookings(res.length);
        }
      );
    } else if (tab === "past") {
      setLoading(true);
      const prevMonth = dayjs().subtract(1, "month").startOf("month");
      setSelectedMonth(prevMonth);
      fetchBookingsByMonth("past", prevMonth.month() + 1, prevMonth.year()).then(
        (res) => {
          setData(res ?? []);
          setTotalBookings(res.length);
        }
      );
    }
  }, [tab, bookings]);

  useEffect(() => {
    if (!selectedMonth || tab === "ongoing") return;

    setLoading(true);
    fetchBookingsByMonth(
      tab,
      selectedMonth.month() + 1,
      selectedMonth.year()
    ).then((res) => {
      setData(res ?? []);
      setTotalBookings(res.length);
    });
  }, [selectedMonth, tab]);

  const getMonthName = (date: Dayjs) => {
    return date.format("MMMM YYYY");
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
          },
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {tab === "ongoing" && "Ongoing Bookings"}
            {tab === "future" && "Future Bookings"}
            {tab === "past" && "Past Bookings"}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} centered>
          <Tab value="ongoing" label={`Ongoing (${bookings?.current?.length || 0})`} />
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
                    textField: { size: "small", fullWidth: true },
                  }}
                />
              </LocalizationProvider>
              <div className="ml-4 text-sm text-gray-600">
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

        <DialogContent className="p-4 max-h-[70vh] overflow-y-auto">
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
              <p>
                {tab === "ongoing" 
                  ? "No ongoing bookings found." 
                  : `No ${tab} bookings found for ${getMonthName(selectedMonth!)}.`
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
                    <div>
                      {/* Add Booking ID display */}
                      <p className="text-sm text-gray-500 mb-1">Booking ID: {booking.id}</p>
                      <CardTitle className="font-semibold text-gray-800 text-lg">
                        {booking.clientName}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {getServiceTitle(booking.service)}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {getBookingTypeBadge(booking.booking_type)}
                      {getStatusBadge(booking.taskStatus)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {booking.date} at {booking.time}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-800 text-right md:text-left">
                        {booking.amount}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm mb-4 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{booking.location}</span>
                    </div>

                    {/* Responsibilities Section */}
                    <div className="mt-2 mb-4">
                      <p className="font-medium text-sm mb-1">Responsibilities:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ...((booking.responsibilities?.tasks || []).map((task: any) => ({ task, isAddon: false }))),
                          ...((booking.responsibilities?.add_ons || []).map((task: any) => ({ task, isAddon: true }))),
                        ].map((item: any, index: number) => {
                          const { task, isAddon } = item;

                          // If task is an object, build label
                          const taskLabel =
                            typeof task === "object" && task !== null
                              ? Object.entries(task)
                                  .filter(([key]) => key !== "taskType")
                                  .map(([key, value]) => `${value} ${key}`)
                                  .join(", ")
                              : "";

                          // Display taskType if object, else task itself
                          const taskName = typeof task === "object" ? task.taskType : task;

                          return (
                            <Badge key={index} variant="outline" className="text-xs">
                              {isAddon ? "Add-ons - " : ""}
                              {taskName} {taskLabel && `- ${taskLabel}`}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
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