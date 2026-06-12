import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import {
  Users,
  UserCheck,
  ClipboardList,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Loader2,
  RefreshCw,
  Ticket,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../../utils";
import {
  fetchAdminDashboard,
  type AdminDashboardSnapshot,
} from "src/services/adminDashboardService";
import { getAdminPushSecret } from "src/utils/adminApiSecret";

dayjs.extend(relativeTime);

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

function pctLabel(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

function initials(first: string, last: string): string {
  const a = (first || "").trim()[0] || "";
  const b = (last || "").trim()[0] || "";
  return (a + b).toUpperCase() || "?";
}

type DashboardProps = { userRole?: string };

const Dashboard = ({ userRole = "" }: DashboardProps) => {
  const isSuper = userRole.toLowerCase() === "superadmin";
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!getAdminPushSecret()) {
      setError(
        "REACT_APP_ADMIN_PUSH_SECRET is not set. Dashboard metrics require the admin API secret (same as payments ADMIN_PUSH_SECRET)."
      );
      setSnapshot(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchAdminDashboard(14);
      setSnapshot(data);
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Failed to load dashboard");
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const d = snapshot?.dashboard;
  const tickets = snapshot?.tickets;

  const statCards = useMemo(() => {
    if (!d) return [];
    const cards = [
      {
        title: "Total customers",
        value: formatCount(d.counts.customers.total),
        description: `${formatCount(d.counts.customers.active)} active · ${formatCount(d.counts.customers.last_30_days)} new (30d)`,
        change: d.changes.customers_pct,
        icon: Users,
        ring: "ring-sky-500/20",
        iconBg: "bg-sky-500/10",
        iconColor: "text-sky-600",
      },
      {
        title: "Service providers",
        value: formatCount(d.counts.providers.total),
        description: `${formatCount(d.counts.providers.active)} active · ${formatCount(d.counts.providers.last_30_days)} new (30d)`,
        change: d.changes.providers_pct,
        icon: UserCheck,
        ring: "ring-emerald-500/20",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-600",
      },
      {
        title: "Unassigned bookings",
        value: formatCount(d.counts.engagements.unassigned),
        description: `${formatCount(d.counts.engagements.active)} active engagements · ${formatCount(d.counts.engagements.last_30_days)} created (30d)`,
        change: d.changes.engagements_pct,
        icon: ClipboardList,
        ring: "ring-amber-500/20",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-600",
      },
    ];

    if (isSuper) {
      cards.push({
        title: "Revenue collected",
        value: formatInr(d.counts.payments.total_collected),
        description: `${formatCount(d.counts.payments.success_count)} successful payments`,
        change: d.changes.revenue_pct,
        icon: DollarSign,
        ring: "ring-violet-500/20",
        iconBg: "bg-violet-500/10",
        iconColor: "text-violet-600",
      });
    } else {
      cards.push({
        title: "Open support tickets",
        value: formatCount(tickets?.open ?? 0),
        description: tickets
          ? `${formatCount(tickets.overdue)} overdue · ${formatCount(tickets.high_priority_open)} high priority`
          : "Tickets service unavailable",
        change: 0,
        icon: Ticket,
        ring: "ring-rose-500/20",
        iconBg: "bg-rose-500/10",
        iconColor: "text-rose-600",
      });
    }

    return cards;
  }, [d, isSuper, tickets]);

  const bookingsChart = useMemo(() => {
    if (!d?.charts.bookings_by_day.length) return null;
    const labels = d.charts.bookings_by_day.map((p) => dayjs(p.date).format("MMM D"));
    return {
      labels,
      datasets: [
        {
          label: "New bookings",
          data: d.charts.bookings_by_day.map((p) => p.count),
          backgroundColor: "rgba(14, 165, 233, 0.65)",
          borderRadius: 4,
        },
      ],
    };
  }, [d]);

  const revenueChart = useMemo(() => {
    if (!d?.charts.revenue_by_day.length) return null;
    const labels = d.charts.revenue_by_day.map((p) => dayjs(p.date).format("MMM D"));
    return {
      labels,
      datasets: [
        {
          label: "Revenue (₹)",
          data: d.charts.revenue_by_day.map((p) => p.amount),
          backgroundColor: "rgba(139, 92, 246, 0.65)",
          borderRadius: 4,
        },
      ],
    };
  }, [d]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  const revenueChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => {
            const n = Number(value);
            if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
            if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
            return `₹${n}`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Live platform metrics from payments and support services.
            {d?.generated_at ? (
              <span className="block text-xs text-slate-500 mt-1">
                Updated {dayjs(d.generated_at).fromNow()}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSuper && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Super admin
            </span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <strong className="font-semibold">Could not load dashboard.</strong> {error}
        </div>
      )}

      {loading && !d ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          <p className="text-sm">Loading platform metrics…</p>
        </div>
      ) : d ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <Card
                key={stat.title}
                className="overflow-hidden border-slate-200/90 shadow-sm transition hover:border-slate-300/90 hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="min-w-0 pr-2">
                    <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                  </div>
                  <div className={`shrink-0 rounded-xl p-2.5 ring-1 ${stat.ring} ${stat.iconBg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums text-slate-900">{stat.value}</span>
                    {stat.change !== 0 && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-semibold",
                          stat.change >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}
                      >
                        {stat.change >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {pctLabel(stat.change)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {tickets && (
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-slate-500" />
                  Support tickets
                </CardTitle>
                <CardDescription>From the tickets service — updates on refresh</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {[
                    { label: "Open", value: tickets.open },
                    { label: "In progress", value: tickets.in_progress },
                    { label: "Waiting customer", value: tickets.waiting_customer },
                    { label: "Overdue", value: tickets.overdue, warn: true },
                    { label: "High priority", value: tickets.high_priority_open, warn: true },
                    { label: "Resolved", value: tickets.resolved },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "rounded-lg border px-3 py-2",
                        item.warn && item.value > 0
                          ? "border-amber-200 bg-amber-50/80"
                          : "border-slate-200 bg-slate-50/50"
                      )}
                    >
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p
                        className={cn(
                          "text-lg font-bold tabular-nums",
                          item.warn && item.value > 0 ? "text-amber-900" : "text-slate-900"
                        )}
                      >
                        {formatCount(item.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className={cn("grid grid-cols-1 gap-4", isSuper ? "lg:grid-cols-2" : "")}>
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Bookings ({d.period_days} days)</CardTitle>
                <CardDescription>New engagements created per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  {bookingsChart ? (
                    <Bar data={bookingsChart} options={chartOptions} />
                  ) : (
                    <p className="text-sm text-slate-500 py-8 text-center">No booking data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {isSuper && (
              <Card className="border-slate-200/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Revenue ({d.period_days} days)</CardTitle>
                  <CardDescription>Successful payment totals per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    {revenueChart ? (
                      <Bar data={revenueChart} options={revenueChartOptions} />
                    ) : (
                      <p className="text-sm text-slate-500 py-8 text-center">No revenue data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">Recent sign-ups</CardTitle>
                    <CardDescription>Latest customers by enrollment date</CardDescription>
                  </div>
                  <div className="hidden rounded-md bg-slate-100 p-1.5 text-slate-400 sm:block" aria-hidden>
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {d.recent.customers.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No customers yet</p>
                ) : (
                  <ul className="space-y-3">
                    {d.recent.customers.map((row) => {
                      const name = [row.firstname, row.lastname].filter(Boolean).join(" ").trim() || "Customer";
                      return (
                        <li
                          key={row.customerid}
                          className="flex items-center gap-3 rounded-lg border border-transparent py-0.5 transition hover:border-slate-200 hover:bg-slate-50/80"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-xs font-bold text-slate-600">
                            {initials(row.firstname, row.lastname)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">{name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {row.enrolleddate
                                ? dayjs(row.enrolleddate).format("MMM D, YYYY · h:mm A")
                                : "Date unknown"}
                              {row.enrolleddate ? ` · ${dayjs(row.enrolleddate).fromNow()}` : ""}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">Recent booking activity</CardTitle>
                    <CardDescription>Latest engagements created on the platform</CardDescription>
                  </div>
                  <div className="hidden rounded-md bg-slate-100 p-1.5 text-slate-400 sm:block" aria-hidden>
                    <ClipboardList className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {d.recent.engagements.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No engagements yet</p>
                ) : (
                  <ul className="space-y-3">
                    {d.recent.engagements.map((row) => {
                      const unassigned =
                        String(row.assignment_status || "").toUpperCase() === "UNASSIGNED";
                      return (
                        <li
                          key={row.engagement_id}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border py-1 px-1 transition",
                            unassigned
                              ? "border-amber-200/80 bg-amber-50/40"
                              : "border-transparent hover:border-slate-200 hover:bg-slate-50/80"
                          )}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200/80">
                            {unassigned ? (
                              <AlertTriangle className="h-4 w-4 text-amber-700" />
                            ) : (
                              <ClipboardList className="h-4 w-4 text-slate-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              #{row.engagement_id} · {row.service_type || "Service"}
                              {row.booking_type ? ` · ${row.booking_type}` : ""}
                            </p>
                            <p className="text-xs text-slate-500">
                              {row.customer_name || "Unknown customer"}
                              {row.created_at ? ` · ${dayjs(row.created_at).fromNow()}` : ""}
                              {unassigned ? " · Unassigned" : ""}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
