/* eslint-disable */
import { useState } from "react";
import Dashboard from "./Dashboard";
import Users from "./Users";
import ServiceProviders from "./ServiceProviders";
import Requests from "./Requests";
import Chats from "./Chats";
import Payments from "./Payments";
import Pricing from "./Pricing";
import UploadData from "./UploadData";
import Settings from "./Settings";
import { SidebarProvider, SidebarTrigger } from "src/components/Common/Sidebar/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search, User } from "lucide-react";
import { Input } from "src/components/Common/input";
import { Button } from "src/components/Common/button";
import Permissions from "./Permissions";

export function DashboardLayout ({ userRole }: { userRole: string })  {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderActiveSection = () => {
    if (userRole === "user") {
      return (
        <div className="text-center mt-10 text-lg font-medium text-gray-600">
          Please wait until your request is approved.
        </div>
      );
    }
  
    if (userRole.toLowerCase() === "admin") {
      switch (activeSection) {
        case "dashboard":
          return <Dashboard />;
        case "users":
          return <Users />;
        case "service-providers":
          return <ServiceProviders />;
        case "requests":
          return <Requests />;
        case "chats":
          return <Chats />;
        case "permissions":
          return <Permissions />;
        default:
          return <Dashboard />;
      }
    }
  
    // For superAdmin — show everything
    if (userRole.toLowerCase() === "superadmin") {
      switch (activeSection) {
        case "dashboard":
          return <Dashboard />;
        case "users":
          return <Users />;
        case "service-providers":
          return <ServiceProviders />;
        case "requests":
          return <Requests />;
        case "chats":
          return <Chats />;
        case "payments":
          return <Payments />;
        case "pricing":
          return <Pricing />;
        case "upload-data":
          return <UploadData />;
        case "settings":
          return <Settings />;
        case "permissions":
            return <Permissions />;
        default:
          return <Dashboard />;
      }
    }
  
    // Default fallback for unknown role
    return (
      <div className="text-center mt-10 text-lg font-medium text-red-500">
        Invalid role. Please contact support.
      </div>
    );
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}