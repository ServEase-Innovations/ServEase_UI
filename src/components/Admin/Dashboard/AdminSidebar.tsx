import type { ComponentType } from "react";
import {
  Settings,
  CreditCard,
  Users,
  MessageSquare,
  ClipboardList,
  DollarSign,
  Upload,
  UserCheck,
  LayoutDashboard,
  Percent,
  Shield,
  BookOpen,
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
} from "src/components/Common/Sidebar/sidebar";
import { publicAsset } from "src/utils/publicAsset";
import { CHROME_BAR_GRADIENT, CHROME_BAR_SHADOW } from "src/Constants/chromeBar";
import { cn } from "../../utils";

type NavItem = {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  /** If true, only `superadmin` can see this item. */
  superadminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "users", title: "Users", icon: Users },
  { id: "service-providers", title: "Service providers", icon: UserCheck },
  { id: "requests", title: "Requests", icon: ClipboardList },
  { id: "chats", title: "Chats", icon: MessageSquare },
  { id: "permissions", title: "Permissions", icon: Shield },
  { id: "payments", title: "Payments", icon: CreditCard, superadminOnly: true },
  { id: "pricing", title: "Pricing", icon: DollarSign, superadminOnly: true },
  { id: "upload-data", title: "Upload data", icon: Upload, superadminOnly: true },
  { id: "coupons", title: "Coupons", icon: Percent, superadminOnly: true },
  { id: "settings", title: "Settings", icon: Settings, superadminOnly: true },
  { id: "ledger", title: "Ledger", icon: BookOpen, superadminOnly: true },
];

function itemsForRole(userRole: string): NavItem[] {
  const r = userRole.toLowerCase();
  if (r === "user") {
    return [];
  }
  if (r === "superadmin") {
    return NAV_ITEMS;
  }
  if (r === "admin") {
    return NAV_ITEMS.filter((i) => !i.superadminOnly);
  }
  return NAV_ITEMS.filter((i) => i.id === "dashboard");
}

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
}

export function AdminSidebar({ activeSection, onSectionChange, userRole }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const items = itemsForRole(userRole);
  const overview = items.filter((i) => i.id === "dashboard");
  const main = items.filter((i) =>
    ["users", "service-providers", "requests", "chats"].includes(i.id)
  );
  const operations = items.filter((i) =>
    ["payments", "pricing", "upload-data", "coupons", "ledger"].includes(i.id)
  );
  const system = items.filter((i) => ["settings", "permissions"].includes(i.id));

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-700/20">
      <SidebarHeader
        className={cn("border-b border-slate-700/25 p-3", CHROME_BAR_GRADIENT, CHROME_BAR_SHADOW)}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 pl-0.5">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-white/10 p-0.5 ring-1 ring-white/10">
              <img
                src={publicAsset("ServEaso_Logo.png")}
                alt="ServEase"
                className="h-full w-full object-contain"
                width={32}
                height={32}
              />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-extrabold text-white">ServEase</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-200/50">admin</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto h-8 w-8 overflow-hidden rounded-md bg-white/10 p-0.5 ring-1 ring-white/10">
            <img
              src={publicAsset("ServEaso_Logo.png")}
              alt=""
              className="h-full w-full object-contain"
              width={32}
              height={32}
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="gap-0 overflow-y-auto bg-slate-950/95 text-slate-100">
        {items.length === 0 ? (
          <p className="p-3 text-center text-xs text-slate-500">No navigation for your current role.</p>
        ) : (
          <>
            {overview.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-slate-500">Overview</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>{renderItems(overview, activeSection, onSectionChange, isCollapsed)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {main.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-slate-500">Directory</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>{renderItems(main, activeSection, onSectionChange, isCollapsed)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {operations.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-slate-500">Operations &amp; finance</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>{renderItems(operations, activeSection, onSectionChange, isCollapsed)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {system.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-slate-500">System</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>{renderItems(system, activeSection, onSectionChange, isCollapsed)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function renderItems(
  list: NavItem[],
  activeSection: string,
  onSectionChange: (id: string) => void,
  isCollapsed: boolean
) {
  return list.map((item) => {
    const active = activeSection === item.id;
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild>
          <button
            type="button"
            onClick={() => onSectionChange(item.id)}
            title={isCollapsed ? item.title : undefined}
            className={cn(
              "w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
              active
                ? "bg-sky-500/20 font-semibold text-sky-200 ring-1 ring-sky-500/30"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0 opacity-90" />
            {!isCollapsed && <span className="truncate">{item.title}</span>}
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });
}
