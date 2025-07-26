import { Card, CardContent, CardHeader, CardTitle } from '../../components/Common/Card';
import { Badge } from "../../components/Common/Badge";
import { Button } from "../../components/Button";
import { Calendar, Clock, MapPin, Phone } from "lucide-react";

interface Booking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "in-progress" | "completed" | "cancelled";
  amount: string;
  contact: string;
}

interface BookingCardProps {
  booking: Booking;
  onContactClient?: (booking: Booking) => void;
}

export function BookingCard({ booking, onContactClient }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-primary text-primary-foreground";
      case "in-progress":
        return "bg-warning text-warning-foreground";
      case "completed":
        return "bg-success text-success-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{booking.clientName}</h3>
            <p className="text-muted-foreground font-medium">{booking.service}</p>
          </div>
          <div className="text-right">
            <Badge className={`${getStatusColor(booking.status)} mb-2`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
            <p className="text-lg font-bold text-foreground">{booking.amount}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{booking.date}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{booking.time}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{booking.location}</span>
          </div>
        </div>

        {booking.status === "upcoming" && onContactClient && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContactClient(booking)}
              className="w-full"
            >
              <Phone className="h-4 w-4 mr-2" />
              Contact Client
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}