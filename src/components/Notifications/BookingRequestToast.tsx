/* eslint-disable */
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../Common/Card";
import { Button } from "../Button/button";
import { XCircle, CheckCircle } from "lucide-react";

interface Engagement {
  engagement_id: number;
  service_type: string;
  booking_type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  base_amount: number;
}

interface BookingRequestToastProps {
  engagement: Engagement;
  onAccept: (engagementId: number) => void;
  onReject: (engagementId: number) => void;
  onClose: () => void;
}

export default function BookingRequestToast({
  engagement,
  onAccept,
  onReject,
  onClose,
}: BookingRequestToastProps) {
  // Auto close after 1 min
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 60_000); // 60 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40">
      <Card className="w-[420px] animate-fade-in-up shadow-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            🚨 New Booking Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            {engagement.booking_type} booking for{" "}
            <span className="font-semibold">{engagement.service_type}</span>
          </p>
          <p className="text-center text-sm text-gray-500">
            {engagement.start_date} ({engagement.start_time} – {engagement.end_time})
          </p>
          <p className="text-center font-bold text-lg text-primary">
            ₹{engagement.base_amount}
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => {
                onReject(engagement.engagement_id);
                onClose();
              }}
            >
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            <Button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => {
                onAccept(engagement.engagement_id);
                onClose();
              }}
            >
              <CheckCircle className="w-4 h-4" /> Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
