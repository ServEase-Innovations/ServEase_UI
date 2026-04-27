import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Badge } from "../../Common/Badge";
import { Switch } from "../../Common/switch";
import { Input } from "../../Common/input";
import { Label } from "../../Common/label";
import { Separator } from "../../Common/Separator";
import {
  Bell,
  Download,
  Globe,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Save,
  Server,
  Shield,
} from "lucide-react";
import { cn } from "../../utils";
import utilsInstance from "src/services/utilsInstance";

type PlatformFeatures = {
  userRegistration: boolean;
  providerVerification: boolean;
  autoApproveRequests: boolean;
};

type PlatformNotifications = {
  emailNotifications: boolean;
  newUserAlerts: boolean;
  paymentFailureAlerts: boolean;
  maintenanceNotifications: boolean;
};

type PlatformSecurity = {
  twoFactorRequired: boolean;
  passwordComplexity: boolean;
  sessionTimeout: boolean;
  sessionDurationMinutes: number;
};

export type PlatformSettings = {
  platformName: string;
  supportEmail: string;
  platformDescription: string;
  features: PlatformFeatures;
  notifications: PlatformNotifications;
  security: PlatformSecurity;
  updatedAt?: string | null;
  source?: string;
};

const EMPTY_FORM: PlatformSettings = {
  platformName: "ServEase",
  supportEmail: "",
  platformDescription: "",
  features: {
    userRegistration: true,
    providerVerification: true,
    autoApproveRequests: false,
  },
  notifications: {
    emailNotifications: true,
    newUserAlerts: true,
    paymentFailureAlerts: true,
    maintenanceNotifications: false,
  },
  security: {
    twoFactorRequired: false,
    passwordComplexity: true,
    sessionTimeout: true,
    sessionDurationMinutes: 30,
  },
};

type ServiceStatus = { id: string; label: string; status: string; detail: string };
type StatusPayload = {
  success: boolean;
  environment: string;
  appVersion: string;
  service: string;
  services: ServiceStatus[];
  serviceUrls?: Record<string, string | null>;
};

function statusBadgeClass(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "ok") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  if (s === "limited" || s === "degraded") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  if (s === "error") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }
  if (s === "skipped") {
    return "border-slate-200 bg-slate-100/80 text-slate-600";
  }
  return "border-slate-200 bg-slate-50 text-slate-800";
}

function statusLabel(s: string) {
  if (s === "ok") {
    return "Healthy";
  }
  if (s === "limited" || s === "degraded") {
    return "Partial";
  }
  if (s === "error") {
    return "Down";
  }
  if (s === "skipped") {
    return "N/A";
  }
  return s || "—";
}

function downloadJson(data: object, name: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function comparableSettings(f: PlatformSettings) {
  return JSON.stringify({
    platformName: f.platformName,
    supportEmail: f.supportEmail,
    platformDescription: f.platformDescription,
    features: f.features,
    notifications: f.notifications,
    security: f.security,
  });
}

const Settings = () => {
  const [form, setForm] = useState<PlatformSettings>(EMPTY_FORM);
  const [lastSaved, setLastSaved] = useState<PlatformSettings | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoadError(null);
    setSaveOk(false);
    setLoading(true);
    const applyBaseline = (p: PlatformSettings) => {
      setForm(p);
      setLastSaved({
        ...p,
        features: { ...p.features },
        notifications: { ...p.notifications },
        security: { ...p.security },
      });
    };
    const emptyBaseline = {
      ...EMPTY_FORM,
      features: { ...EMPTY_FORM.features },
      notifications: { ...EMPTY_FORM.notifications },
      security: { ...EMPTY_FORM.security },
    };
    try {
      const res = await utilsInstance.get<{ success?: boolean; settings?: PlatformSettings; error?: string }>(
        "/api/platform-settings"
      );
      if (res.data?.settings) {
        const s = res.data.settings;
        const merged: PlatformSettings = {
          ...EMPTY_FORM,
          ...s,
          features: { ...EMPTY_FORM.features, ...s.features },
          notifications: { ...EMPTY_FORM.notifications, ...s.notifications },
          security: { ...EMPTY_FORM.security, ...s.security },
        };
        applyBaseline(merged);
        return;
      }
      if (res.data && (res.data as { success?: boolean }).success === false) {
        setLoadError((res.data as { error?: string }).error || "Could not load settings");
      } else {
        setLoadError("Could not load settings (empty response).");
      }
      applyBaseline(emptyBaseline);
    } catch (e) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setLoadError(
        err?.response?.data?.error ||
          err?.message ||
          "Settings API unavailable. Is the utils service running (REACT_APP_UTILS_URL / localhost:3030)?"
      );
      applyBaseline(emptyBaseline);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    setStatusError(null);
    setStatusLoading(true);
    try {
      const res = await utilsInstance.get<StatusPayload>("/api/platform-status");
      if (res.data?.success) {
        setStatus(res.data);
        return;
      }
      setStatusError("Status response was invalid.");
    } catch (e) {
      const err = e as { message?: string };
      setStatusError(err?.message || "Could not load platform status");
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadStatus();
  }, [loadSettings, loadStatus]);

  const isDirtyWorkaround = useMemo(() => {
    if (loading || !lastSaved) {
      return false;
    }
    return comparableSettings(form) !== comparableSettings(lastSaved);
  }, [form, lastSaved, loading]);

  const onSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      const payload = {
        platformName: form.platformName,
        supportEmail: form.supportEmail,
        platformDescription: form.platformDescription,
        features: form.features,
        notifications: form.notifications,
        security: form.security,
      };
      const res = await utilsInstance.put<{ success?: boolean; settings?: PlatformSettings; error?: string }>(
        "/api/platform-settings",
        payload
      );
      if (res.data?.success && res.data?.settings) {
        const s = res.data.settings;
        const merged: PlatformSettings = {
          ...EMPTY_FORM,
          ...s,
          features: { ...EMPTY_FORM.features, ...s.features },
          notifications: { ...EMPTY_FORM.notifications, ...s.notifications },
          security: { ...EMPTY_FORM.security, ...s.security },
        };
        setForm(merged);
        setLastSaved({
          ...merged,
          features: { ...merged.features },
          notifications: { ...merged.notifications },
          security: { ...merged.security },
        });
        setSaveOk(true);
        window.setTimeout(() => setSaveOk(false), 4000);
        return;
      }
      setSaveError((res.data as { error?: string })?.error || "Save failed");
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setSaveError(err?.response?.data?.error || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }, [form]);

  const onReset = useCallback(() => {
    if (lastSaved) {
      setForm((prev) => ({
        ...prev,
        ...lastSaved,
        features: { ...lastSaved.features },
        notifications: { ...lastSaved.notifications },
        security: { ...lastSaved.security },
      }));
    }
  }, [lastSaved]);

  const fmtUpdated = (iso: string | null | undefined) => {
    if (!iso) {
      return "—";
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  if (!ready) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-600">
        <Loader2 className="h-9 w-9 animate-spin text-sky-600" />
        <p className="text-sm font-medium">Loading platform settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Settings</h1>
          <p className="mt-0.5 max-w-2xl text-sm text-slate-600 sm:text-base">
            Platform copy, feature flags, and notification defaults stored in the utils service (Mongo). Status checks run
            against this host and {`configured dependencies`}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void loadSettings();
              void loadStatus();
            }}
            disabled={loading || saving}
          >
            {loading || statusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1.5">Reload all</span>
          </Button>
          <Button type="button" size="sm" onClick={() => void onSave()} disabled={saving || !isDirtyWorkaround}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-1.5">{saving ? "Saving…" : "Save changes"}</span>
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900" role="alert">
          <strong className="font-semibold">Settings unavailable. </strong>
          {loadError}
        </div>
      )}

      {saveError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
          {saveError}
        </div>
      )}

      {saveOk && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader>
              <CardTitle className="!text-lg flex items-center gap-2 text-slate-900">
                <Globe className="h-5 w-5 text-slate-500" />
                General
              </CardTitle>
              <CardDescription>Shown in the product when you surface a platform name or help contact.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform name</Label>
                  <Input
                    id="platform-name"
                    value={form.platformName}
                    onChange={(e) => setForm((f) => ({ ...f, platformName: e.target.value }))}
                    className="border-slate-200"
                    autoComplete="organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
                    className="border-slate-200"
                    autoComplete="email"
                    placeholder="team@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-description">Short description</Label>
                <Input
                  id="platform-description"
                  value={form.platformDescription}
                  onChange={(e) => setForm((f) => ({ ...f, platformDescription: e.target.value }))}
                  className="border-slate-200"
                />
              </div>
              <Separator className="bg-slate-200" />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-900">Platform features (defaults / policy)</h4>
                {(
                  [
                    {
                      k: "userRegistration" as const,
                      label: "Allow user registration",
                      sub: "Let new customers create accounts in the public flow (when the app enforces it).",
                    },
                    {
                      k: "providerVerification" as const,
                      label: "Provider verification",
                      sub: "Expect providers to complete verification before going live in discovery.",
                    },
                    {
                      k: "autoApproveRequests" as const,
                      label: "Auto-approve service requests",
                      sub: "When the booking pipeline supports it, auto-match without manual review.",
                    },
                  ] as const
                ).map((row) => (
                  <div key={row.k} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{row.label}</p>
                      <p className="text-xs text-slate-500">{row.sub}</p>
                    </div>
                    <Switch
                      checked={form.features[row.k]}
                      onCheckedChange={(v) =>
                        setForm((f) => ({ ...f, features: { ...f.features, [row.k]: Boolean(v) } }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader>
              <CardTitle className="!text-lg flex items-center gap-2 text-slate-900">
                <Bell className="h-5 w-5 text-slate-500" />
                Admin notifications
              </CardTitle>
              <CardDescription>Preferences for operational alerts. Delivery still depends on email being configured in utils.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  {
                    k: "emailNotifications" as const,
                    label: "Email notifications to admins",
                    sub: "Master switch for email-based admin notices.",
                  },
                  {
                    k: "newUserAlerts" as const,
                    label: "New user sign-ups",
                    sub: "Get notified when customers register.",
                  },
                  {
                    k: "paymentFailureAlerts" as const,
                    label: "Payment failures",
                    sub: "Alert on failed or stuck payments in monitoring flows.",
                  },
                  {
                    k: "maintenanceNotifications" as const,
                    label: "Maintenance & incidents",
                    sub: "Planned work or incident banners in customer surfaces.",
                  },
                ] as const
              ).map((row) => (
                <div
                  key={row.k}
                  className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="text-xs text-slate-500">{row.sub}</p>
                  </div>
                  <Switch
                    checked={form.notifications[row.k]}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, notifications: { ...f.notifications, [row.k]: Boolean(v) } }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader>
              <CardTitle className="!text-lg flex items-center gap-2 text-slate-900">
                <Shield className="h-5 w-5 text-slate-500" />
                Security policy (reference)
              </CardTitle>
              <CardDescription>
                Stored for your ops runbooks. Actual enforcement of 2FA and session length is configured in your identity
                layer (e.g. Auth0), not by this form alone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  {
                    k: "twoFactorRequired" as const,
                    label: "2FA for admin / staff (policy)",
                    sub: "Document the expectation; configure MFA in your IdP.",
                  },
                  {
                    k: "passwordComplexity" as const,
                    label: "Password complexity (policy)",
                    sub: "Communicate to users; rules are in Auth0 / your provider.",
                  },
                  {
                    k: "sessionTimeout" as const,
                    label: "Idle session timeout (policy)",
                    sub: "Pair with IdP and app session configuration.",
                  },
                ] as const
              ).map((row) => (
                <div
                  key={row.k}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="text-xs text-slate-500">{row.sub}</p>
                  </div>
                  <Switch
                    checked={form.security[row.k]}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, security: { ...f.security, [row.k]: Boolean(v) } }))
                    }
                  />
                </div>
              ))}
              <Separator className="bg-slate-200" />
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="session-duration">Session reference duration (minutes)</Label>
                <Input
                  id="session-duration"
                  type="number"
                  min={5}
                  max={10080}
                  value={form.security.sessionDurationMinutes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      security: {
                        ...f.security,
                        sessionDurationMinutes: Math.min(10080, Math.max(5, parseInt(e.target.value, 10) || 30)),
                      },
                    }))
                  }
                  className="w-full border-slate-200"
                />
              </div>
            </CardContent>
          </Card>

          {isDirtyWorkaround && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700">
              <span>You have unsaved changes.</span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onReset} disabled={saving}>
                  Discard
                </Button>
                <Button type="button" size="sm" onClick={() => void onSave()} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="!text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-500" />
                Service status
              </CardTitle>
              <CardDescription>
                Databases, this utils process, and HTTP probes to other services (defaults follow monorepo local ports). Set
                URLs in the utils service env on the server.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {statusError && <p className="text-rose-700">{statusError}</p>}
              {statusLoading && !status && <Loader2 className="h-5 w-5 animate-spin text-sky-600" />}
              {status?.serviceUrls && Object.keys(status.serviceUrls).length > 0 && (
                <details className="rounded-lg border border-slate-200/80 bg-slate-50/50 px-2 py-1.5 text-xs text-slate-600">
                  <summary className="cursor-pointer font-medium text-slate-700">Probed base URLs</summary>
                  <ul className="mt-2 space-y-0.5 pl-1 font-mono text-[11px] leading-relaxed text-slate-600">
                    {Object.entries(status.serviceUrls).map(([k, v]) => (
                      <li key={k}>
                        <span className="text-slate-500">{k}:</span> {v || "—"}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {status?.services?.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{s.label}</p>
                    <p className="truncate text-xs text-slate-500" title={s.detail}>
                      {s.detail}
                    </p>
                  </div>
                  <Badge
                    className={cn("shrink-0 border", statusBadgeClass(s.status))}
                    variant="outline"
                  >
                    {statusLabel(s.status)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="!text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  downloadJson(
                    {
                      ...form,
                      updatedAt: form.updatedAt,
                      source: form.source,
                    },
                    "platform-settings.json"
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download settings JSON
              </Button>
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => void loadStatus()}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Refresh service status
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="!text-base">This deployment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm text-slate-600">
              <div className="flex justify-between gap-2">
                <span>Utils / settings API</span>
                <span className="text-right font-medium text-slate-800">{status?.appVersion || "—"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Environment</span>
                <span className="text-right font-medium text-slate-800">{status?.environment || "—"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Last settings save</span>
                <span className="text-right font-medium text-slate-800" title={form.updatedAt || ""}>
                  {fmtUpdated(form.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
