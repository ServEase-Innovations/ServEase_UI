/* eslint-disable */
import { useState, useEffect } from "react";
import { Badge } from "../../components/Common/Badge";
import { Button } from "../../components/Button";
import { Calendar, MapPin, X } from "lucide-react";
import { Dialog, DialogContent, Tabs, Tab } from "@mui/material";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Common/Card";
import { getBookingTypeBadge, getServiceTitle, getStatusBadge } from "../Common/Booking/BookingUtils";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axiosInstance from "src/services/axiosInstance";
import { Booking, BookingHistoryResponse } from "./Dashboard";

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
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [data, setData] = useState<Booking[]>([]);

  const mapApiBookingToBooking = (apiBooking: any): Booking => {
    const responsibilities = apiBooking.responsibilities?.tasks?.map((t: any) => t.taskType) || [];
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
      responsibilities,
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
      const formatted = `${year}-${String(month).padStart(2, "0")}`;
      const res = await axiosInstance.get(
        `https://payments-j5id.onrender.com/api/service-providers/${serviceProviderId}/engagements?month=${formatted}`
      );

      const apiData: BookingHistoryResponse = res.data;

      // ✅ Fix: Use 'upcoming' instead of 'future'
      const list = type === "future" ? apiData.upcoming ?? [] : apiData.past ?? [];
      return list.map(mapApiBookingToBooking);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      return [];
    }
  };

  useEffect(() => {
    if (!bookings) {
      setData([]);
      return;
    }

    const now = new Date();
    const mapData = (list: any[]) => list.map(mapApiBookingToBooking);

    if (tab === "ongoing") {
      setData(mapData(bookings.current ?? []));
      setSelectedMonth(now);
    } else if (tab === "future") {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      setSelectedMonth(nextMonth);
      fetchBookingsByMonth("future", nextMonth.getMonth() + 1, nextMonth.getFullYear()).then(
        (res) => setData(res ?? [])
      );
    } else if (tab === "past") {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      setSelectedMonth(prevMonth);
      fetchBookingsByMonth("past", prevMonth.getMonth() + 1, prevMonth.getFullYear()).then(
        (res) => setData(res ?? [])
      );
    }
  }, [tab, bookings]);

  useEffect(() => {
    if (!selectedMonth || tab === "ongoing") return;

    fetchBookingsByMonth(
      tab,
      selectedMonth.getMonth() + 1,
      selectedMonth.getFullYear()
    ).then((res) => setData(res ?? []));
  }, [selectedMonth, tab]);

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
          <Tab value="ongoing" label="Ongoing Booking" />
          <Tab value="future" label="Future Booking" />
          <Tab value="past" label="Past Booking" />
        </Tabs>

        {(tab === "future" || tab === "past") && (
          <div className="px-4 pt-3">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                views={["year", "month"]}
                label="Select Month"
                value={selectedMonth}
                onChange={(newValue) => setSelectedMonth(newValue)}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </div>
        )}

        <DialogContent className="p-4 max-h-[70vh] overflow-y-auto">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No bookings found.</p>
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
