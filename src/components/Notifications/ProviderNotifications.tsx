/* eslint-disable */
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "../Common/Card";
import { Button } from "../Button/button";
import { Bell, CheckCircle } from "lucide-react";
import axios from "axios";
import PaymentInstance from "src/services/paymentInstance";

interface NotificationPayload {
  engagementId: number;
  serviceType: string;
  bookingType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  baseAmount: number;
  customerLocation?: { latitude: number; longitude: number };
}

export default function ProviderNotifications({ providerId }: { providerId: number }) {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!providerId) return;

    const newSocket = io(process.env.REACT_APP_SOCKET_URL || "https://payments-j5id.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Connected to WebSocket server as provider", providerId);
      newSocket.emit("join", { providerId });
    });

    newSocket.on("new-engagement", (data: any) => {
      console.log("📩 New engagement notification:", data);
      setNotifications((prev) => [data, ...prev]);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [providerId]);

  const handleAccept = async (engagementId: number) => {
    try {
      const res = await PaymentInstance.post(
        `/api/engagements/${engagementId}/accept`,
        { providerId }
      );
      alert(res.data.message || "Engagement accepted!");
      setNotifications((prev) => prev.filter((n) => n.engagementId !== engagementId));
    } catch (err) {
      console.error("Error accepting engagement:", err);
      alert("Failed to accept engagement");
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-500" /> Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No new notifications</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.engagementId}
                className="border rounded-lg p-4 flex flex-col gap-2"
              >
                <p className="font-medium">
                  New {n.bookingType} booking:{" "}
                  <span className="text-primary">{n.serviceType}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {n.startDate} ({n.startTime})
                </p>
                <p className="text-sm">Amount: ₹{n.baseAmount}</p>

                <Button
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleAccept(n.engagementId)}
                >
                  <CheckCircle className="w-4 h-4" /> Accept
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
