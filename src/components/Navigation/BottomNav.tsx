import React, { useState } from "react";
import { Home, CalendarDays, User, PlusCircle, LayoutDashboard, Briefcase } from "lucide-react";
import { useLanguage } from "src/context/LanguageContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppUser } from "src/context/AppUserContext";
import {
  BOOKINGS,
  DASHBOARD,
  AGENT_DASHBOARD,
} from "src/Constants/pagesConstants";
import { isProviderNotificationSession } from "src/utils/spSession";

interface BottomNavProps {
  currentSelection: string | undefined;
  onNavigate: (page: string) => void;
  onRegisterUserClick: () => void;
  onRegisterProviderClick: () => void;
  onRegisterAgentClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({
  currentSelection,
  onNavigate,
  onRegisterUserClick,
  onRegisterProviderClick,
  onRegisterAgentClick,
}) => {
  const { t } = useLanguage();
  const { isAuthenticated, loginWithPopup } = useAuth0();
  const { appUser } = useAppUser();
  const [showJoinMenu, setShowJoinMenu] = useState(false);

  const isHome = currentSelection === undefined || currentSelection === "" || currentSelection === "HOME";
  const isBookings = currentSelection === BOOKINGS;
  
  const isProvider = isProviderNotificationSession(appUser as Record<string, unknown>);
  const isAgent = appUser?.role === "VENDOR";

  return (
    <>
      {/* Join Us Popup Menu overlay */}
      {showJoinMenu && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowJoinMenu(false)}
        >
          <div 
            className="absolute bottom-[4.5rem] left-0 right-0 m-4 mx-auto max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-900/5 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-sm font-semibold text-slate-900 px-2">Join Us</h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50"
                onClick={() => {
                  setShowJoinMenu(false);
                  onRegisterUserClick();
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t("registerAsUser") || "Register as User"}</div>
                  <div className="text-xs text-slate-500">Book services for your home</div>
                </div>
              </button>

              <button
                type="button"
                className="flex items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50"
                onClick={() => {
                  setShowJoinMenu(false);
                  onRegisterProviderClick();
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t("registerAsProvider") || "Register as Provider"}</div>
                  <div className="text-xs text-slate-500">Earn by providing services</div>
                </div>
              </button>

              <button
                type="button"
                className="flex items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50"
                onClick={() => {
                  setShowJoinMenu(false);
                  onRegisterAgentClick();
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t("registerAsAgent") || "Register as Agent"}</div>
                  <div className="text-xs text-slate-500">Manage multiple professionals</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[50] flex h-[4.5rem] items-center justify-around border-t border-slate-200 bg-white/90 pb-safe pt-1 backdrop-blur-md">
        
        <button
          type="button"
          onClick={() => onNavigate("")}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
            isHome ? "text-sky-600" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Home className={`h-6 w-6 ${isHome ? "fill-sky-100/50" : ""}`} strokeWidth={isHome ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t("home")}</span>
        </button>

        {(isAuthenticated && appUser?.role === "CUSTOMER") && (
          <button
            type="button"
            onClick={() => onNavigate(BOOKINGS)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
              isBookings ? "text-sky-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <CalendarDays className={`h-6 w-6 ${isBookings ? "fill-sky-100/50" : ""}`} strokeWidth={isBookings ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t("myBookings")}</span>
          </button>
        )}

        {isProvider && (
          <button
            type="button"
            onClick={() => onNavigate(DASHBOARD)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
              currentSelection === DASHBOARD ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="h-6 w-6" strokeWidth={currentSelection === DASHBOARD ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t("dashboard")}</span>
          </button>
        )}

        {isAgent && (
          <button
            type="button"
            onClick={() => onNavigate(AGENT_DASHBOARD)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
              currentSelection === AGENT_DASHBOARD ? "text-amber-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-6 w-6" strokeWidth={currentSelection === AGENT_DASHBOARD ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Agent</span>
          </button>
        )}

        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => setShowJoinMenu(!showJoinMenu)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
              showJoinMenu ? "text-sky-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <PlusCircle className={`h-6 w-6 ${showJoinMenu ? "fill-sky-100/50" : ""}`} strokeWidth={showJoinMenu ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Join Us</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              void loginWithPopup({
                authorizationParams: { prompt: "login" },
              }).catch(() => {});
            }
          }}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500 hover:text-slate-900"
        >
          <User className="h-6 w-6" strokeWidth={2} />
          <span className="text-[10px] font-medium">
            {isAuthenticated ? t("profile") : t("signIn")}
          </span>
        </button>

      </nav>
    </>
  );
};

export default BottomNav;
