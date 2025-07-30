/* eslint-disable */
import { 
    Settings, 
    CreditCard, 
    Users, 
    MessageSquare, 
    ClipboardList, 
    DollarSign, 
    Upload,
    UserCheck,
    LayoutDashboard
  } from "lucide-react";
  
  import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    useSidebar,
  } from "../../Common/Sidebar/sidebar";
import { title } from "process";
  
  const menuItems = [
    { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { title: "Users", id: "users", icon: Users },
    { title: "Service Providers", id: "service-providers", icon: UserCheck },
    { title: "Requests", id: "requests", icon: ClipboardList },
    { title: "Chats", id: "chats", icon: MessageSquare },
    { title: "Payments", id: "payments", icon: CreditCard },
    { title: "Pricing", id: "pricing", icon: DollarSign },
    { title: "Upload Data", id: "upload-data", icon: Upload },
    { title: "Settings", id: "settings", icon: Settings },
    {title : "Permissions", id: "permissions", icon: Settings } // Assuming Permissions is a settings-like section
  ];
  
  interface AdminSidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
  }
  
  export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
  
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">Admin Panel</h2>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </SidebarHeader>
  
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => onSectionChange(item.id)}
                        className={`w-full flex items-center space-x-2 p-2 rounded-md transition-colors ${
                          activeSection === item.id
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }