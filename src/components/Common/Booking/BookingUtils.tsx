/* eslint-disable */

import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "../Badge";

// ✅ Function to get status badge for service provider dashboard
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground border-secondary">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    case "NOT_STARTED":
      return (
        <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground border-secondary">
          <Clock className="h-3 w-3 mr-1" />
          Not Started
        </Badge>
      );
    default:
      return null;
  }
};

// ✅ Function to get booking type badge
export const getBookingTypeBadge = (type: string) => {
  switch (type) {
    case "ON_DEMAND":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          On Demand
        </Badge>
      );
    case "MONTHLY":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          Monthly
        </Badge>
      );
    case "SHORT_TERM":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          Short Term
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          {type}
        </Badge>
      );
  }
};

// ✅ Function to get service title
export const getServiceTitle = (type: string) => {
  switch (type?.toLowerCase()) {
    case "cook":
      return "Home Cook";
    case "maid":
      return "Maid Service";
    case "nanny":
      return "Caregiver Service";
    case "cleaning":
      return "Cleaning Service";
    default:
      return "Home Service";
  }
};
