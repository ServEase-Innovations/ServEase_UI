import { useCallback, useEffect, useState } from "react";
import { Clock, Loader2, LogOut, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import utilsInstance from "src/services/utilsInstance";
import { loadAdminSession, saveAdminSession } from "src/utils/adminSession";
import { isActiveAdminRole } from "src/utils/adminRole";
import { publicAsset } from "src/utils/publicAsset";
import { CHROME_BAR_GRADIENT, CHROME_BAR_SHADOW } from "src/Constants/chromeBar";

type AdminPendingApprovalProps = {
  onLogout?: () => void;
  onRoleAssigned: (role: string) => void;
};

export function AdminPendingApproval({ onLogout, onRoleAssigned }: AdminPendingApprovalProps) {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"info" | "success">("info");

  const checkRoleStatus = useCallback(async () => {
    const session = loadAdminSession();
    if (!session?.userId || !session.usernameHash) {
      setStatusTone("info");
      setStatusMessage("Session expired. Please sign in again.");
      return;
    }

    setChecking(true);
    setStatusMessage(null);
    try {
      const { data } = await utilsInstance.post<{ role: string; message?: string }>(
        "/api/admin/role-status",
        {
          userId: session.userId,
          usernameHash: session.usernameHash,
        }
      );

      const role = String(data?.role ?? "");
      if (isActiveAdminRole(role)) {
        saveAdminSession({ ...session, role });
        setStatusTone("success");
        setStatusMessage("Your access has been approved. Loading the admin portal…");
        onRoleAssigned(role);
        return;
      }

      setStatusTone("info");
      setStatusMessage("Your account is still pending role assignment. Please check again later.");
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } }; message?: string };
      setStatusTone("info");
      setStatusMessage(
        ex?.response?.data?.message || ex?.message || "Could not check status. Try again in a moment."
      );
    } finally {
      setChecking(false);
    }
  }, [onRoleAssigned]);

  useEffect(() => {
    void checkRoleStatus();
    const interval = window.setInterval(() => {
      void checkRoleStatus();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [checkRoleStatus]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      <header
        className={`shrink-0 border-b border-white/10 px-4 py-3 sm:px-6 ${CHROME_BAR_GRADIENT} ${CHROME_BAR_SHADOW}`}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={publicAsset("ServEaso_Logo.png")}
              alt="ServEase"
              className="h-9 w-auto object-contain sm:h-10"
            />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.14em] text-white/50 sm:inline">
              Admin Portal
            </span>
          </div>
          <button
            type="button"
            onClick={() => onLogout?.()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-slate-200/15 bg-slate-900/50 p-0.5 shadow-2xl shadow-slate-950/50 ring-1 ring-white/5">
            <div className="rounded-[14px] border border-slate-700/30 bg-slate-950/85 p-8 sm:p-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
                <Clock className="h-8 w-8 text-amber-300" strokeWidth={1.75} aria-hidden />
              </div>

              <div className="mb-2 flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/90">
                  Account created
                </p>
              </div>

              <h1 className="text-center text-xl font-bold tracking-tight text-white sm:text-2xl">
                Awaiting role assignment
              </h1>

              <p className="mt-4 text-center text-sm leading-relaxed text-slate-400">
                Your account has been created successfully. Access is currently pending role assignment by a
                Super Admin. You will be able to use the portal once the required role has been assigned.
              </p>

              {statusMessage && (
                <div
                  role="status"
                  className={[
                    "mt-5 rounded-xl border px-3 py-2.5 text-sm",
                    statusTone === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-sky-500/25 bg-sky-500/10 text-sky-100",
                  ].join(" ")}
                >
                  {statusMessage}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => void checkRoleStatus()}
                  disabled={checking}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Checking…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" aria-hidden />
                      Check status
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onLogout?.()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600/60 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Sign out
                </button>
              </div>

              <div className="mt-8 rounded-xl border border-slate-700/40 bg-slate-900/40 px-4 py-3 text-center">
                <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Need help?{" "}
                  <Link to="/" className="font-medium text-sky-400 hover:text-sky-300 hover:underline">
                    Contact support
                  </Link>{" "}
                  via the main ServEase site.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Status is checked automatically every minute while this page is open.
          </p>
        </div>
      </main>
    </div>
  );
}
