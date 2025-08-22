/* eslint-disable */
import { useState } from "react";
import { Badge } from "../../components/Common/Badge";
import { Button } from "../../components/Button";
import { Calendar, MapPin, X } from "lucide-react";
import { Dialog, DialogContent } from "@mui/material";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Common/Card";
import { getBookingTypeBadge, getServiceTitle, getStatusBadge } from "../Common/Booking/BookingUtils";

interface Booking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: string;
  amount: string;
  bookingData: any;
}

interface AllBookingsDialogProps {
  bookings: Booking[];
  trigger: React.ReactNode;
}

export function AllBookingsDialog({ bookings, trigger }: AllBookingsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <div onClick={() => setOpen(true)}>{trigger}</div>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* Custom header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">All Bookings ({bookings.length})</h2>
          <button 
            onClick={() => setOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <DialogContent className="p-4 max-h-[70vh] overflow-y-auto">
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No bookings found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
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
                      {getBookingTypeBadge(booking.bookingData.bookingType)}
                      {getStatusBadge(booking.bookingData.taskStatus)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{booking.date} at {booking.time}</span>
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