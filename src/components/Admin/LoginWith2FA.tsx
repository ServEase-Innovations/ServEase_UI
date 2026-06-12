import React, { useEffect, useState } from "react";
import utilsInstance from "src/services/utilsInstance";
import { buildAdminLoginPayload, buildAdminRegisterPayload, sha256Hex } from "src/utils/adminAuthHashes";
import { saveAdminSession } from "src/utils/adminSession";
import { User, KeyRound, Loader2, Shield } from "lucide-react";
import { AdminPasswordField } from "./AdminPasswordField";

type LoginWith2FAProps = {
  onLoginSuccess: (role: string) => void;
  initialMessage?: string;
  initialUsername?: string;
  onInitialMessageShown?: () => void;
};

type Step = "login" | "2fa" | "forgot";

const LoginWith2FA: React.FC<LoginWith2FAProps> = ({
  onLoginSuccess,
  initialMessage,
  initialUsername,
  onInitialMessageShown,
}) => {
  const [step, setStep] = useState<Step>("login");
  const [username, setUsername] = useState(initialUsername ?? "");
  const [password, setPassword] = useState("");
  const [usernameHash, setUsernameHash] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  useEffect(() => {
    if (!initialMessage) return;
    setMessage(initialMessage);
    setStep("login");
    setMode("login");
    onInitialMessageShown?.();
  }, [initialMessage, onInitialMessageShown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = await buildAdminRegisterPayload(username, password);
      const res = await utilsInstance.post(`/api/register`, payload);
      if (res.data.qr) {
        setMessage("Registered. You can sign in below.");
        setMode("login");
        setUsername("");
        setPassword("");
        setUsernameHash("");
      } else {
        setMessage("Unexpected registration response.");
      }
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setMessage(ex?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = await buildAdminLoginPayload(username, password);
      const res = await utilsInstance.post(`/api/login`, payload);
      if (res.data.message === "2FA required") {
        setUsernameHash(payload.usernameHash);
        setPassword("");
        setMessage("Enter the 6-digit code from your authenticator app.");
        setStep("2fa");
      } else {
        setMessage("Unexpected response from server");
      }
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setMessage(ex?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await utilsInstance.post(`/api/verify-token`, {
        usernameHash,
        token: otpCode,
      });

      if (res.data.message === "2FA verified successfully") {
        setMessage("Signed in successfully. Loading dashboard…");
        saveAdminSession({
          role: res.data.role,
          userId: res.data.userId,
          usernameHash,
        });
        onLoginSuccess(res.data.role);
      } else {
        setMessage("Failed to verify 2FA");
      }
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setMessage(ex?.response?.data?.message || "2FA failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const normalizedUsername = username.trim().toLowerCase();
      const [userHash, newPasswordHash] = await Promise.all([
        sha256Hex(normalizedUsername),
        sha256Hex(newPassword),
      ]);

      const res = await utilsInstance.post(`/api/reset-password-2fa`, {
        usernameHash: userHash,
        token: otpCode.replace(/\s/g, ""),
        newPasswordHash,
      });

      setMessage(res.data.message || "Password reset successful. You can sign in with your new password.");
      setStep("login");
      setMode("login");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpCode("");
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setMessage(ex?.response?.data?.message || "Password reset failed. Check your username and authenticator code.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setMessage("");
    setUsername("");
    setPassword("");
    setUsernameHash("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("login");
  };

  const openForgotPassword = () => {
    setStep("forgot");
    setMessage("");
    setPassword("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const backToLogin = () => {
    setStep("login");
    setMode("login");
    setMessage("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const isSuccess =
    message.includes("✅") ||
    /signed in successfully|you can sign in|registered\.|password reset successful/i.test(message);

  const inputClass =
    "w-full rounded-xl border border-slate-600/60 bg-slate-900/60 py-3 pl-11 pr-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20";

  return (
    <div className="flex w-full min-h-0 flex-1 items-start justify-center px-4 py-10 sm:items-center sm:py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/20 bg-slate-900/40 p-0.5 shadow-2xl shadow-slate-950/50 ring-1 ring-white/5 backdrop-blur-sm sm:p-0.5">
          <div className="overflow-hidden rounded-[14px] border border-slate-700/30 bg-slate-950/80 p-6 sm:p-8">
            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {step === "2fa"
                  ? "Two-factor authentication"
                  : step === "forgot"
                    ? "Reset password"
                    : mode === "login"
                      ? "Sign in"
                      : "Create account"}
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">
                {step === "2fa"
                  ? "Use the code from Google Authenticator or your registered app."
                  : step === "forgot"
                    ? "Enter your username, authenticator code, and a new password."
                    : "ServEase admin console. Credentials are hashed in the browser before sending."}
              </p>
            </div>

            {message && (
              <div
                role="status"
                className={[
                  "mb-4 rounded-xl border px-3 py-2.5 text-sm",
                  isSuccess
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-200",
                ].join(" ")}
              >
                {message}
              </div>
            )}

            {step === "2fa" ? (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="flex justify-center py-2">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10"
                    aria-hidden
                  >
                    <Shield className="h-8 w-8 text-sky-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="admin-2fa" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Authenticator code
                  </label>
                  <div className="relative">
                    <KeyRound
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden
                    />
                    <input
                      id="admin-2fa"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\s/g, ""))}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify and continue"
                  )}
                </button>
              </form>
            ) : step === "forgot" ? (
              <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="on">
                <div>
                  <label htmlFor="forgot-user" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden
                    />
                    <input
                      id="forgot-user"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Your admin username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="forgot-2fa" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Authenticator code
                  </label>
                  <div className="relative">
                    <KeyRound
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden
                    />
                    <input
                      id="forgot-2fa"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\s/g, ""))}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <AdminPasswordField
                  id="forgot-new-pass"
                  name="new-password"
                  label="New password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                />
                <AdminPasswordField
                  id="forgot-confirm-pass"
                  name="confirm-password"
                  label="Confirm new password"
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    "Reset password"
                  )}
                </button>
                <p className="text-center text-sm text-slate-500">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={backToLogin}
                    className="font-semibold text-sky-400 hover:text-sky-300 focus:outline-none focus:underline"
                  >
                    Back to sign in
                  </button>
                </p>
              </form>
            ) : (
              <form
                onSubmit={mode === "login" ? handleLogin : handleRegister}
                className="space-y-4"
                autoComplete="on"
              >
                <div>
                  <label htmlFor="admin-user" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden
                    />
                    <input
                      id="admin-user"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Your admin username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <AdminPasswordField
                  id="admin-pass"
                  name="password"
                  label="Password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  footer={
                    mode === "login" ? (
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          onClick={openForgotPassword}
                          className="text-sm font-medium text-sky-400 hover:text-sky-300 focus:outline-none focus:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    ) : undefined
                  }
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Please wait…
                    </>
                  ) : mode === "login" ? (
                    "Sign in with password"
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>
            )}

            {step === "login" && (
              <p className="mt-6 text-center text-sm text-slate-500">
                {mode === "login" ? (
                  <>
                    No account?{" "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="font-semibold text-sky-400 hover:text-sky-300 focus:outline-none focus:underline"
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="font-semibold text-sky-400 hover:text-sky-300 focus:outline-none focus:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500 sm:text-left">Authorized personnel only. Activity may be logged.</p>
      </div>
    </div>
  );
};

export default LoginWith2FA;
