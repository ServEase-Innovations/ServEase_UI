import React, { useState } from "react";
import { UserPlus, LogIn } from "lucide-react";
import RegisterWith2FA from "./RegisterWith2FA";
import LoginWith2FA from "./LoginWith2FA";
import { DashboardLayout } from "./Dashboard/DashboardLayout";
import { publicAsset } from "src/utils/publicAsset";
import { CHROME_BAR_GRADIENT } from "src/Constants/chromeBar";

function Admin() {
  const [view, setView] = useState<"register" | "login" | "dashboard">("register");
  const [role, setRole] = useState("");

  const handleLoginSuccess = (userRole: string) => {
    setRole(userRole);
    setView("dashboard");
  };

  if (view === "dashboard") {
    return <DashboardLayout userRole={role} />;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      {/* Branded top bar */}
      <header
        className={`shrink-0 w-full z-20 border-b border-slate-700/30 shadow-lg ${CHROME_BAR_GRADIENT}`}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center justify-center gap-2.5 sm:justify-start sm:pl-0">
            <div className="h-8 w-auto max-w-[2rem] sm:max-w-[2.5rem]">
              <img
                className="h-8 max-h-8 w-auto object-contain object-left"
                height={32}
                width={32}
                src={publicAsset("ServEaso_Logo.png")}
                alt="ServEase"
              />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white/95 sm:text-base">ServEase</p>
              <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-200/50 sm:text-left">
                Admin
              </p>
            </div>
          </div>
          <nav
            className="flex w-full sm:w-auto justify-center gap-1.5 p-0.5 sm:pr-0"
            aria-label="Admin sign-in options"
          >
            <button
              type="button"
              onClick={() => setView("register")}
              className={[
                "inline-flex w-full min-w-0 sm:w-auto flex-1 sm:flex-initial sm:shrink-0 sm:min-w-[5rem] items-center justify-center gap-2 rounded-2xl px-4 sm:shrink sm:px-2 sm:pl-0 sm:pr-0 py-2.5 sm:py-1.5 text-sm font-extrabold min-h-[2.5rem] sm:min-h-0 transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/80 focus-visible:outline-offset-0",
                view === "register"
                  ? "bg-sky-500/90 text-slate-950 shadow"
                  : "text-slate-100/80 hover:text-white",
              ].join(" ")}
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
              <span>Register</span>
            </button>
            <button
              type="button"
              onClick={() => setView("login")}
              className={[
                "inline-flex w-full min-w-0 sm:w-auto flex-1 sm:flex-initial sm:shrink-0 sm:min-w-[4rem] items-center justify-center gap-2 rounded-2xl px-3 sm:px-2 sm:pl-0 sm:pr-0 py-2.5 sm:py-1.5 text-sm font-extrabold min-h-[2.5rem] sm:min-h-0 transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/80 focus-visible:outline-offset-0",
                view === "login"
                  ? "bg-sky-500/90 text-slate-950 shadow"
                  : "text-slate-100/80 hover:text-white",
              ].join(" ")}
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden />
              <span>Login</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex w-full min-h-0 flex-1">
        {view === "register" && <RegisterWith2FA />}
        {view === "login" && <LoginWith2FA onLoginSuccess={handleLoginSuccess} />}
      </main>
    </div>
  );
}

export default Admin;
