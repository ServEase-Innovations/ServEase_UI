import { useMemo, useState } from "react";
import Dashboard from "./Dashboard";
import Users from "./Users";
import ServiceProviders from "./ServiceProviders";
import Requests from "./Requests";
import Chats from "./Chats";
import Payments from "./Payments";
import Pricing from "./Pricing";
import UploadData from "./UploadData";
import Settings from "./Settings";
import Coupons from "./Coupons";
import { SidebarProvider, SidebarTrigger } from "src/components/Common/Sidebar/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search, LogOut, Sparkles } from "lucide-react";
import { Input } from "src/components/Common/input";
import { Button } from "src/components/Common/button";
import Permissions from "./Permissions";
import AdminLedgerGrid from "./AdminLedgerGrid";
import { CHROME_BAR_GRADIENT, CHROME_BAR_SHADOW } from "src/Constants/chromeBar";
import { cn } from "../../utils";

const SECTION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  "service-providers": "Service providers",
  requests: "Requests",
  chats: "Chats",
  permissions: "Permissions",
  payments: "Payments",
  pricing: "Pricing",
  "upload-data": "Upload data",
  settings: "Settings",
  coupons: "Coupons",
  ledger: "Ledger",
};

function roleLabel(role: string) {
  const r = role.toLowerCase();
  if (r === "superadmin") return { short: "Super admin", className: "bg-amber-500/15 text-amber-200 ring-amber-500/30" };
  if (r === "admin") return { short: "Admin", className: "bg-sky-500/15 text-sky-200 ring-sky-500/30" };
  if (r === "user") return { short: "Pending", className: "bg-slate-500/20 text-slate-200 ring-slate-500/30" };
  return { short: role || "—", className: "bg-slate-500/20 text-slate-200" };
}

export function DashboardLayout({ userRole }: { userRole: string }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const sectionTitle = SECTION_LABELS[activeSection] ?? "Dashboard";
  const role = useMemo(() => roleLabel(userRole), [userRole]);

  const renderActiveSection = () => {
    if (userRole === "user") {
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center shadow-sm">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/25"
            aria-hidden
          >
            <Sparkles className="h-7 w-7 text-amber-200" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Account pending</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            An administrator will review your request. You’ll be notified when your access is approved. If this takes a while,
            use the main app contact options.
          </p>
        </div>
      );
    }

    if (userRole.toLowerCase() === "admin") {
      switch (activeSection) {
        case "dashboard":
          return <Dashboard userRole={userRole} />;
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
          return <Dashboard userRole={userRole} />;
      }
    }

    if (userRole.toLowerCase() === "superadmin") {
      switch (activeSection) {
        case "dashboard":
          return <Dashboard userRole={userRole} />;
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
        case "ledger":
          return <AdminLedgerGrid />;
        case "coupons":
          return <Coupons />;
        default:
          return <Dashboard userRole={userRole} />;
      }
    }

    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive font-medium">Invalid role. Please sign out and contact support.</p>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/90">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} userRole={userRole} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={cn(
              "sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-800/20 px-4 sm:h-16 sm:px-6",
              CHROME_BAR_GRADIENT,
              CHROME_BAR_SHADOW
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="shrink-0 -ml-1">
                <SidebarTrigger
                  className="text-slate-100 hover:bg-white/10 hover:text-white"
                  title="Show or hide sidebar"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-slate-200/50 sm:text-[11px] sm:uppercase sm:tracking-wider">Admin</p>
                <h1 className="truncate text-sm font-bold text-white sm:text-lg" title={sectionTitle}>
                  {sectionTitle}
                </h1>
              </div>
            </div>

            <div className="hidden items-center sm:flex sm:max-w-xs md:max-w-md sm:flex-1 sm:pl-2">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-200/30" />
                <Input
                  type="search"
                  placeholder="Search in this view… (coming soon)"
                  className="h-9 border-slate-500/30 bg-slate-900/40 pl-9 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-500/40"
                  disabled
                  aria-label="Search (not yet available)"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={cn("hidden max-w-[8rem] truncate rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 sm:inline", role.className)}
                title={`Role: ${userRole}`}
              >
                {role.short}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-200/90 hover:bg-white/10 hover:text-white"
                title="Notifications (coming soon)"
                type="button"
                disabled
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-200/90 hover:bg-white/10 hover:text-white"
                title="Session"
                type="button"
                disabled
                aria-label="Session menu (coming soon)"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-x-auto p-4 sm:p-6">
            <div className="mx-auto max-w-7xl">{renderActiveSection()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
