/* eslint-disable */
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { Card, CardContent, CardHeader, CardTitle } from "../Common/Card";
import { Button } from "../Button/button";
import { XCircle, CheckCircle, Bell, Trash2, Filter, X } from "lucide-react";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";

interface Engagement {
  engagement_id: number;
  service_type: string;
  booking_type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  base_amount: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
}

interface NotificationItemProps {
  engagement: Engagement;
  onAccept: (engagementId: number) => void;
  onReject: (engagementId: number) => void;
  onDelete: (engagementId: number) => void;
}

interface NotificationsDialogProps {
  open: boolean;
  onClose: () => void;
}

function NotificationItem({
  engagement,
  onAccept,
  onReject,
  onDelete,
}: NotificationItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-600 bg-yellow-50";
      case "accepted": return "text-green-600 bg-green-50";
      case "rejected": return "text-red-600 bg-red-50";
      case "completed": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return "⏳";
      case "accepted": return "✅";
      case "rejected": return "❌";
      case "completed": return "🎉";
      default: return "🔔";
    }
  };

  return (
    <Card className="w-full mb-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon(engagement.status)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(engagement.status)}`}>
              {engagement.status.charAt(0).toUpperCase() + engagement.status.slice(1)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(engagement.engagement_id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-gray-800 font-medium mb-2">
          {engagement.booking_type} booking for{" "}
          <span className="font-semibold text-primary">{engagement.service_type}</span>
        </p>
        
        <div className="text-sm text-gray-600 space-y-1 mb-3">
          <p>📅 {engagement.start_date} ({engagement.start_time} – {engagement.end_time})</p>
          <p className="font-bold text-lg text-primary">₹{engagement.base_amount}</p>
          <p className="text-xs text-gray-500">Received: {new Date(engagement.created_at).toLocaleString()}</p>
        </div>

        {engagement.status === "pending" && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50 flex-1"
              onClick={() => onReject(engagement.engagement_id)}
            >
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 flex-1"
              onClick={() => onAccept(engagement.engagement_id)}
            >
              <CheckCircle className="w-4 h-4" /> Accept
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function NotificationsDialog({ open, onClose }: NotificationsDialogProps) {
  const [notifications, setNotifications] = useState<Engagement[]>([
    {
      engagement_id: 1,
      service_type: "Home Cook",
      booking_type: "Regular",
      start_date: "2024-01-15",
      end_date: "2024-01-15",
      start_time: "10:00 AM",
      end_time: "12:00 PM",
      base_amount: 1200,
      status: "pending",
      created_at: "2024-01-14T10:30:00Z"
    },
    {
      engagement_id: 2,
      service_type: "Cleaning Help",
      booking_type: "One-time",
      start_date: "2024-01-16",
      end_date: "2024-01-16",
      start_time: "2:00 PM",
      end_time: "4:00 PM",
      base_amount: 800,
      status: "accepted",
      created_at: "2024-01-14T09:15:00Z"
    },
    {
      engagement_id: 3,
      service_type: "Caregiver",
      booking_type: "Long-term",
      start_date: "2024-01-17",
      end_date: "2024-01-20",
      start_time: "9:00 AM",
      end_time: "5:00 PM",
      base_amount: 3500,
      status: "rejected",
      created_at: "2024-01-13T14:20:00Z"
    },
    {
      engagement_id: 4,
      service_type: "Home Cook",
      booking_type: "Short-term",
      start_date: "2024-01-18",
      end_date: "2024-01-18",
      start_time: "6:00 PM",
      end_time: "8:00 PM",
      base_amount: 1500,
      status: "completed",
      created_at: "2024-01-12T16:45:00Z"
    }
  ]);

  const [filter, setFilter] = useState<string>("all");

  const handleAccept = (engagementId: number) => {
    setNotifications(notifications.map(notif => 
      notif.engagement_id === engagementId 
        ? { ...notif, status: "accepted" as const }
        : notif
    ));
    console.log(`Accepted engagement: ${engagementId}`);
  };

  const handleReject = (engagementId: number) => {
    setNotifications(notifications.map(notif => 
      notif.engagement_id === engagementId 
        ? { ...notif, status: "rejected" as const }
        : notif
    ));
    console.log(`Rejected engagement: ${engagementId}`);
  };

  const handleDelete = (engagementId: number) => {
    setNotifications(notifications.filter(notif => notif.engagement_id !== engagementId));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === "all" ? true : notif.status === filter
  );

  const getNotificationCount = (status: string) => {
    return notifications.filter(notif => notif.status === status).length;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '90vh'
        }
      }}
    >
      {/* Dialog Header */}
      <DialogHeader className="flex justify-between items-center border-b border-gray-700 p-6 bg-[#0a2a66]">
  <div className="flex items-center gap-3">
    <div className="p-2 bg-white/20 rounded-lg">
      <Bell className="w-6 h-6 text-white" />
    </div>
    <div>
<h3 className="text-2xl font-bold text-white mt-3">Notifications</h3>

      <p className="text-white/80">Manage your booking requests and updates</p>
    </div>
  </div>

  <Button
    variant="ghost"
    size="icon"
    onClick={onClose}
    className="rounded-full hover:bg-white/20 text-white"
  >
    <X className="w-5 h-5 text-white" />
  </Button>
</DialogHeader>


      <DialogContent className="p-6">
        {/* Stats and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getNotificationCount("pending")}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getNotificationCount("accepted")}</div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{notifications.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Notifications</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clear All Button */}
        {notifications.length > 0 && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {notifications.length === 0 
                    ? "You don't have any notifications yet." 
                    : `No ${filter === "all" ? "" : filter + " "}notifications found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.engagement_id}
                  engagement={notification}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}