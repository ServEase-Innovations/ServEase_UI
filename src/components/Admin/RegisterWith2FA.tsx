import React, { useState } from "react";
import utilsInstance from "src/services/utilsInstance";
import { User, Lock, Loader2, QrCode, CheckCircle2 } from "lucide-react";

const RegisterWith2FA = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"register" | "verify">("register");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await utilsInstance.post(`/api/register`, { username, password });
      setQrCode(res.data.qr);
      setUsername(res.data.username);
      setStep("verify");
      setMessage("Scan the QR in Google Authenticator, then enter the 6-digit code below.");
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setMessage(ex?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await utilsInstance.post(`/api/verify`, { username, token: otp });
      setMessage("2FA setup complete. Open the Login tab to sign in.");
      setStep("register");
      setQrCode("");
      setOtp("");
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setMessage(ex?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.toLowerCase().includes("complete") || message.toLowerCase().includes("success");

  return (
    <div className="flex w-full min-h-0 flex-1 items-start justify-center px-4 py-10 sm:items-center sm:py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/20 bg-slate-900/40 p-0.5 shadow-2xl shadow-slate-950/50 ring-1 ring-white/5 backdrop-blur-sm sm:p-0.5">
          <div className="overflow-hidden rounded-[14px] border border-slate-700/30 bg-slate-950/80 p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-center text-xl font-bold tracking-tight text-white sm:text-2xl">
                Register & set up 2FA
              </h1>
              <p className="mt-1.5 text-center text-sm text-slate-400">
                Create an admin account, then link Google Authenticator (or compatible) using the QR code.
              </p>
            </div>

            {message && (
              <div
                role="status"
                className={[
                  "mb-4 flex gap-2 rounded-xl border px-3 py-2.5 text-sm",
                  isSuccess
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-100",
                ].join(" ")}
              >
                {isSuccess ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : null}
                <span>{message}</span>
              </div>
            )}

            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
                <div>
                  <label htmlFor="reg-user" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden
                    />
                    <input
                      id="reg-user"
                      type="text"
                      autoComplete="username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-600/60 bg-slate-900/60 py-3 pl-11 pr-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-pass" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden
                    />
                    <input
                      id="reg-pass"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-600/60 bg-slate-900/60 py-3 pl-11 pr-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
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
                      Creating account…
                    </>
                  ) : (
                    "Continue to QR"
                  )}
                </button>
              </form>
            )}

            {step === "verify" && (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-slate-600/50 bg-white p-4 text-center">
                  {qrCode ? (
                    <img
                      src={qrCode}
                      alt="Scan with authenticator"
                      className="mx-auto max-w-[200px] rounded-lg"
                    />
                  ) : (
                    <div
                      className="mx-auto flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-slate-100"
                      role="img"
                      aria-label="Loading QR"
                    >
                      <QrCode className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-600">Add this key in your authenticator app, then enter the code.</p>
                </div>
                <form onSubmit={handleVerify} className="space-y-3">
                  <div>
                    <label htmlFor="reg-otp" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      One-time code
                    </label>
                    <input
                      id="reg-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6 digits"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\s/g, ""))}
                      required
                      className="w-full rounded-xl border border-slate-600/60 bg-slate-900/60 py-3 px-3 text-center text-lg tracking-[0.3em] text-slate-100 placeholder:text-slate-500 placeholder:tracking-normal outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
                    />
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
                      "Confirm 2FA"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500 sm:text-left">Store backup codes in a safe place. Only trusted admins should register.</p>
      </div>
    </div>
  );
};

export default RegisterWith2FA;
