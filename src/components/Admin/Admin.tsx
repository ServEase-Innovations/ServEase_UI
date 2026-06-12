import React, { useCallback, useEffect, useState } from "react";
import RegisterWith2FA from "./RegisterWith2FA";
import LoginWith2FA from "./LoginWith2FA";
import { DashboardLayout } from "./Dashboard/DashboardLayout";
import { AdminPortalHeader } from "./AdminPortalHeader";
import { LanguageProvider } from "src/context/LanguageContext";
import {
  clearAdminSession,
  loadAdminSession,
  touchAdminSession,
} from "src/utils/adminSession";

function readInitialAdminState(): { view: "register" | "login" | "dashboard"; role: string } {
  const session = loadAdminSession();
  if (session) {
    return { view: "dashboard", role: session.role };
  }
  return { view: "register", role: "" };
}

function Admin() {
  const initial = readInitialAdminState();
  const [view, setView] = useState<"register" | "login" | "dashboard">(initial.view);
  const [role, setRole] = useState(initial.role);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);
  const [loginPrefillUsername, setLoginPrefillUsername] = useState("");

  useEffect(() => {
    const session = loadAdminSession();
    if (session) {
      setRole(session.role);
      setView("dashboard");
    }
  }, []);

  useEffect(() => {
    if (view !== "dashboard") {
      return undefined;
    }
    touchAdminSession();
    const interval = window.setInterval(() => {
      const session = loadAdminSession();
      if (!session) {
        setRole("");
        setView("login");
        return;
      }
      touchAdminSession();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [view]);

  const handleLoginSuccess = useCallback((userRole: string) => {
    setRole(userRole);
    setView("dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    clearAdminSession();
    setRole("");
    setView("login");
  }, []);

  const handleRegistrationComplete = useCallback(({ username }: { username: string }) => {
    setLoginPrefillUsername(username);
    setLoginSuccessMessage(
      "Registration and 2FA setup completed successfully. Sign in with your new account."
    );
    setView("login");
  }, []);

  const handleLoginViewChange = useCallback((next: "register" | "login") => {
    if (next === "register") {
      setLoginSuccessMessage(null);
      setLoginPrefillUsername("");
    }
    setView(next);
  }, []);

  if (view === "dashboard") {
    return (
      <DashboardLayout
        userRole={role}
        onLogout={handleLogout}
        onRoleAssigned={(nextRole) => setRole(nextRole)}
      />
    );
  }

  return (
    <LanguageProvider>
      <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <AdminPortalHeader view={view} onViewChange={handleLoginViewChange} />

        <main className="flex w-full min-h-0 flex-1 pt-11 sm:pt-12 md:pt-14">
          {view === "register" && (
            <RegisterWith2FA onRegistrationComplete={handleRegistrationComplete} />
          )}
          {view === "login" && (
            <LoginWith2FA
              onLoginSuccess={handleLoginSuccess}
              initialMessage={loginSuccessMessage ?? undefined}
              initialUsername={loginPrefillUsername || undefined}
              onInitialMessageShown={() => setLoginSuccessMessage(null)}
            />
          )}
        </main>
      </div>
    </LanguageProvider>
  );
}

export default Admin;
