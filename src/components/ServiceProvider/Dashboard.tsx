/* eslint-disable */
import { useState } from "react";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { BookingCard } from "./BookingCard";
import { PaymentHistory } from "./PaymentHistory";
import { PerformanceChart } from "./PerformanceChart";
import { Button } from "../../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Common/Card";
import { Badge } from "../../components/Common/Badge";
import { useToast } from "../hooks/use-toast";
import {
  IndianRupee,
  Calendar,
  Star,
  TrendingUp,
  Users,
  Clock,
  Home,
  Bell
} from "lucide-react";

// Mock data
const metrics = [
  {
    title: "Total Earnings",
    value: "₹24,580",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: IndianRupee,
    description: "This month"
  },
  {
    title: "Active Bookings",
    value: "8",
    change: "+3",
    changeType: "positive" as const,
    icon: Calendar,
    description: "Upcoming services"
  },
  {
    title: "Average Rating",
    value: "4.8",
    change: "+0.2",
    changeType: "positive" as const,
    icon: Star,
    description: "From 156 reviews"
  },
  {
    title: "Completion Rate",
    value: "98%",
    change: "+2%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Last 30 days"
  }
];

const recentBookings = [
  {
    id: "1",
    clientName: "Priya Sharma",
    service: "House Cleaning",
    date: "Dec 28, 2024",
    time: "10:00 AM",
    location: "Koramangala, Bangalore",
    status: "upcoming" as const,
    amount: "₹800",
    contact: "+91 98765 43210"
  },
  {
    id: "2",
    clientName: "Rajesh Kumar",
    service: "Cooking Service",
    date: "Dec 27, 2024",
    time: "6:00 PM",
    location: "Indiranagar, Bangalore",
    status: "completed" as const,
    amount: "₹1,200",
    contact: "+91 87654 32109"
  },
  {
    id: "3",
    clientName: "Anita Patel",
    service: "Elderly Care",
    date: "Dec 29, 2024",
    time: "2:00 PM",
    location: "Whitefield, Bangalore",
    status: "upcoming" as const,
    amount: "₹1,500",
    contact: "+91 76543 21098"
  }
];

const paymentHistory = [
  {
    id: "1",
    date: "Dec 25, 2024",
    description: "Cleaning Service - Priya S.",
    amount: "₹800",
    status: "completed" as const,
    type: "earning" as const
  },
  {
    id: "2",
    date: "Dec 24, 2024",
    description: "Cooking Service - Rajesh K.",
    amount: "₹1,200",
    status: "completed" as const,
    type: "earning" as const
  },
  {
    id: "3",
    date: "Dec 23, 2024",
    description: "Withdrawal to Bank",
    amount: "₹5,000",
    status: "completed" as const,
    type: "withdrawal" as const
  },
  {
    id: "4",
    date: "Dec 22, 2024",
    description: "Care Service - Anita P.",
    amount: "₹1,500",
    status: "pending" as const,
    type: "earning" as const
  }
];

export default function Dashboard() {
  const { toast } = useToast();

  const handleContactClient = (booking: any) => {
    toast({
      title: "Contact Information",
      description: `Call ${booking.clientName} at ${booking.contact}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Home className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">ServEase Provider</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-semibold text-foreground">Maya Patel</p>
                  <p className="text-sm text-muted-foreground">Cleaning Specialist</p>
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">MP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, Maya! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your services today.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <DashboardMetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">Recent Bookings</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {recentBookings.filter(b => b.status === "upcoming").length} upcoming
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onContactClient={handleContactClient}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="border-0 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  View All Bookings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Request Withdrawal
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Update Availability
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  View Reviews
                </Button>
              </CardContent>
            </Card>

            {/* Service Status */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Profile Status</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Verification</span>
                    <Badge className="bg-success text-success-foreground">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Availability</span>
                    <Badge className="bg-primary text-primary-foreground">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts and Payment History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PerformanceChart />
          <PaymentHistory payments={paymentHistory} />
        </div>
      </main>
    </div>
  );
}