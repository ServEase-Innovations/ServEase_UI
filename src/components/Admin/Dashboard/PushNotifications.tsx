import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Send, RefreshCw, Users } from "lucide-react";
import { Button } from "src/components/Common/button";
import { Input } from "src/components/Common/input";
import { SearchField } from "src/components/Common/SearchField";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/Common/Card";
import utilsInstance from "src/services/utilsInstance";
import { publicAsset } from "src/utils/publicAsset";

type Stats = {
  fcmReady: boolean;
  total: number;
  ios: number;
  android?: number;
  providers: number;
  customers: number;
};

type ConnectedDevice = {
  id: string;
  platform: string;
  email: string | null;
  role: string | null;
  deviceName: string | null;
  userId: string | null;
  lastSeenAt: string;
  tokenPreview: string;
};

type ConnectedPerson = {
  key: string;
  email: string | null;
  userId: string | null;
  role: string | null;
  deviceIds: string[];
  platforms: string[];
  deviceCount: number;
};

type Audience =
  | "all"
  | "providers"
  | "customers"
  | "ios"
  | "android"
  | "selected";

const DEV_PUSH_SECRET_HARDCODED = "serveaso-test-push-secret";

const PUSH_SECRET =
  process.env.REACT_APP_ADMIN_PUSH_SECRET?.trim() ||
  DEV_PUSH_SECRET_HARDCODED ||
  sessionStorage.getItem("admin_push_secret")?.trim() ||
  "";

function personLabel(p: ConnectedPerson): string {
  if (p.email) return p.email;
  if (p.userId) return `User #${p.userId}`;
  return "Unknown user";
}

function buildPeopleFromDevices(deviceList: ConnectedDevice[]): ConnectedPerson[] {
  const map = new Map<string, ConnectedPerson>();
  for (const d of deviceList) {
    const key = d.email || d.userId || d.id;
    if (!map.has(key)) {
      map.set(key, {
        key,
        email: d.email,
        userId: d.userId,
        role: d.role,
        deviceIds: [],
        platforms: [],
        deviceCount: 0,
      });
    }
    const p = map.get(key)!;
    p.deviceIds.push(d.id);
    if (d.platform && !p.platforms.includes(d.platform)) {
      p.platforms.push(d.platform);
    }
    p.deviceCount = p.deviceIds.length;
  }
  return Array.from(map.values());
}

export default function PushNotifications() {
  const [title, setTitle] = useState("Serveaso");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<Audience>("all");
  const [stats, setStats] = useState<Stats | null>(null);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [people, setPeople] = useState<ConnectedPerson[]>([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [secretInput, setSecretInput] = useState(PUSH_SECRET);

  const headers = useCallback(() => {
    const secret = secretInput.trim();
    if (secret) sessionStorage.setItem("admin_push_secret", secret);
    return secret ? { "X-Admin-Push-Secret": secret } : {};
  }, [secretInput]);

  const loadStats = useCallback(async () => {
    try {
      const hdrs = headers();
      const [statsRes, devicesRes] = await Promise.all([
        utilsInstance.get<Stats>("/api/push/stats", { headers: hdrs }),
        utilsInstance.get<{ devices: ConnectedDevice[]; people: ConnectedPerson[] }>(
          "/api/push/devices",
          { headers: hdrs }
        ),
      ]);
      const deviceList = devicesRes.data.devices || [];
      const apiPeople = devicesRes.data.people || [];
      setStats(statsRes.data);
      setDevices(deviceList);
      setPeople(
        apiPeople.length > 0 ? apiPeople : buildPeopleFromDevices(deviceList)
      );
      setMessage(null);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } } };
      setStats(null);
      setDevices([]);
      setPeople([]);
      setMessage({
        type: "err",
        text: ex.response?.data?.error || "Could not load stats. Check push secret and utils URL.",
      });
    }
  }, [headers]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const filteredPeople = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => {
      const label = personLabel(p).toLowerCase();
      const role = (p.role || "").toLowerCase();
      const platforms = p.platforms.join(" ").toLowerCase();
      return label.includes(q) || role.includes(q) || platforms.includes(q);
    });
  }, [people, search]);

  const filteredDevices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter((d) => {
      return (
        (d.email || "").toLowerCase().includes(q) ||
        (d.role || "").toLowerCase().includes(q) ||
        (d.deviceName || "").toLowerCase().includes(q) ||
        (d.platform || "").toLowerCase().includes(q) ||
        (d.userId || "").toLowerCase().includes(q)
      );
    });
  }, [devices, search]);

  const toggleDevice = (id: string) => {
    setSelectedDeviceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setTarget("selected");
  };

  const togglePerson = (person: ConnectedPerson) => {
    setSelectedDeviceIds((prev) => {
      const next = new Set(prev);
      const allSelected = person.deviceIds.every((id) => next.has(id));
      for (const id of person.deviceIds) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
    setTarget("selected");
  };

  const selectAllVisible = () => {
    setSelectedDeviceIds(new Set(filteredDevices.map((d) => d.id)));
    setTarget("selected");
  };

  const clearSelection = () => {
    setSelectedDeviceIds(new Set());
    if (target === "selected") setTarget("all");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setMessage({ type: "err", text: "Title and message are required." });
      return;
    }
    if (!secretInput.trim()) {
      setMessage({
        type: "err",
        text: "Enter the admin push secret (same as ADMIN_PUSH_SECRET on utils).",
      });
      return;
    }

    if (target === "selected" && selectedDeviceIds.size === 0) {
      setMessage({
        type: "err",
        text: "Select at least one person or device below.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
      };

      if (target === "selected") {
        payload.target = "devices";
        payload.deviceIds = Array.from(selectedDeviceIds);
      } else if (target === "all") {
        payload.target = "all";
      } else if (target === "ios") {
        payload.target = "all";
        payload.platform = "ios";
      } else if (target === "android") {
        payload.target = "all";
        payload.platform = "android";
      } else if (target === "providers") {
        payload.target = "all";
        payload.role = "SERVICE_PROVIDER";
      } else {
        payload.target = "all";
        payload.role = "CUSTOMER";
      }

      const { data } = await utilsInstance.post("/api/push/send", payload, {
        headers: headers(),
      });
      const failures = (data as { failures?: { code?: string; message?: string }[] })
        .failures;
      const recipients = (data as { recipients?: { email?: string }[] }).recipients;
      const uniqueEmails = Array.from(
        new Set(
          (recipients || [])
            .map((r) => r.email)
            .filter((e): e is string => Boolean(e))
        )
      );
      const recipientHint =
        recipients?.length && uniqueEmails.length <= 5
          ? ` → ${uniqueEmails.join(", ")}`
          : recipients?.length
            ? ` → ${recipients.length} device(s)`
            : "";
      const failHint =
        data.failureCount > 0 && failures?.length
          ? ` — ${failures.map((f) => f.code || f.message).join("; ")}`
          : data.failureCount > 0
            ? " — check utils logs; iOS: APNs key in Firebase; Android: verify google-services.json"
            : "";
      const staleNote =
        (data as { staleDisabled?: number }).staleDisabled
          ? ` (${(data as { staleDisabled: number }).staleDisabled} invalid token(s) removed.)`
          : "";
      setMessage({
        type: data.failureCount > 0 && data.successCount === 0 ? "err" : "ok",
        text: `Sent to ${data.attempted} device(s): ${data.successCount} delivered, ${data.failureCount} failed.${recipientHint}${failHint}${staleNote}`,
      });
      void loadStats();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } } };
      setMessage({
        type: "err",
        text: ex.response?.data?.error || "Send failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = selectedDeviceIds.size;

  const connectedList = (
    <div className="space-y-4">
      <SearchField
        placeholder="Search by email, role, device…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search connected devices"
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={selectAllVisible}>
          Select all shown
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={clearSelection}>
          Clear selection
        </Button>
      </div>

      {devices.length === 0 ? (
        <p className="text-sm text-slate-500">
          No devices registered. Open the app, log in, and allow notifications, then click
          Refresh.
        </p>
      ) : filteredPeople.length === 0 && filteredDevices.length === 0 ? (
        <p className="text-sm text-slate-500">No matches for your search.</p>
      ) : (
        <>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-2">
            <p className="text-xs font-medium uppercase text-slate-500 sticky top-0 bg-white py-1">
              People ({filteredPeople.length})
            </p>
            {filteredPeople.map((person) => {
              const allSelected = person.deviceIds.every((id) =>
                selectedDeviceIds.has(id)
              );
              const someSelected =
                !allSelected &&
                person.deviceIds.some((id) => selectedDeviceIds.has(id));
              return (
                <label
                  key={person.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                    allSelected || someSelected
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-100 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 rounded border-slate-300"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={() => togglePerson(person)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">
                      {personLabel(person)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {person.role || "—"} · {person.deviceCount} device(s) ·{" "}
                      {person.platforms.join(", ")}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="w-8 px-2 py-2" />
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Platform</th>
                  <th className="px-2 py-2">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDevices.map((d) => (
                  <tr
                    key={d.id}
                    className={selectedDeviceIds.has(d.id) ? "bg-sky-50" : "bg-white"}
                  >
                    <td className="px-2 py-1.5">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={selectedDeviceIds.has(d.id)}
                        onChange={() => toggleDevice(d.id)}
                      />
                    </td>
                    <td className="px-2 py-1.5 max-w-[140px] truncate">
                      {d.email || d.userId || "—"}
                    </td>
                    <td className="px-2 py-1.5 capitalize text-xs">
                      {d.platform}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-slate-600 max-w-[120px] truncate">
                      {d.deviceName || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <img
            src={publicAsset("ServEaso_Logo.png")}
            alt="Serveaso"
            className="h-10 w-auto object-contain"
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Push notifications</h2>
            <p className="text-sm text-slate-600">
              See who is connected and send to everyone, a group, or selected people only.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void loadStats()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">FCM configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{stats?.fcmReady ? "Yes" : "No"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">Total devices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{stats?.total ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">People connected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-600" />
              {people.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">iOS / Android</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {stats?.ios ?? "—"} / {stats?.android ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-sky-700">{selectedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-sky-600" />
            Push notifications — send &amp; recipients
          </CardTitle>
          <p className="text-sm text-slate-600 font-normal">
            Select people on the right (or below on mobile), then send from the form.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 lg:grid-cols-2">
            <form onSubmit={handleSend} className="space-y-4 order-2 lg:order-1">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Admin push secret
              </label>
              <Input
                type="password"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="Matches ADMIN_PUSH_SECRET on utils"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={500}
                placeholder="Notification body shown on the device"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Send to</label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={target}
                onChange={(e) => setTarget(e.target.value as Audience)}
              >
                <option value="all">Everyone (all registered devices)</option>
                <option value="selected" disabled={selectedCount === 0}>
                  Selected only ({selectedCount} device{selectedCount !== 1 ? "s" : ""})
                </option>
                <option value="ios">All iOS devices</option>
                <option value="android">All Android devices</option>
                <option value="providers">All service providers</option>
                <option value="customers">All customers</option>
              </select>
              {selectedCount > 0 && target !== "selected" && (
                <p className="mt-1 text-xs text-amber-700">
                  Tip: choose &quot;Selected only&quot; to send to the {selectedCount} checkbox
                  selection.
                </p>
              )}
            </div>

            {message && (
              <p
                className={`text-sm ${message.type === "ok" ? "text-emerald-700" : "text-red-700"}`}
              >
                {message.text}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || (target === "selected" && selectedCount === 0)}
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Sending…" : "Send push"}
            </Button>
            </form>

            <div className="order-1 lg:order-2 border-t border-slate-200 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Users className="h-4 w-4 text-violet-600" />
                Connected now ({devices.length} device{devices.length !== 1 ? "s" : ""},{" "}
                {people.length} people)
              </h3>
              {connectedList}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
