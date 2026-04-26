import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Users, UserCheck, ClipboardList, DollarSign, ArrowUpRight, Calendar } from "lucide-react";

const stats = [
  {
    title: "Total users",
    value: "2,847",
    description: "vs last month",
    change: "+12%",
    positive: true,
    icon: Users,
    ring: "ring-sky-500/20",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600",
  },
  {
    title: "Service providers",
    value: "324",
    description: "active profiles",
    change: "+8%",
    positive: true,
    icon: UserCheck,
    ring: "ring-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    title: "Open requests",
    value: "156",
    description: "in pipeline",
    change: "+5%",
    positive: true,
    icon: ClipboardList,
    ring: "ring-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  {
    title: "Revenue (sample)",
    value: "$45,231",
    description: "illustrative total",
    change: "+15%",
    positive: true,
    icon: DollarSign,
    ring: "ring-violet-500/20",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
  },
];

const recentUsers = ["John Smith", "Sarah Johnson", "Mike Wilson", "Emily Davis"];
const recentServices = [
  "Home cleaning",
  "Plumbing repair",
  "Electrical install",
  "Garden maintenance",
];

type DashboardProps = { userRole?: string };

const Dashboard = ({ userRole = "" }: DashboardProps) => {
  const isSuper = userRole.toLowerCase() === "superadmin";
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Snapshot of platform activity. figures below are{" "}
            <span className="font-medium text-slate-800">placeholders</span> until real metrics are wired.
          </p>
        </div>
        {isSuper && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Super admin
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="overflow-hidden border-slate-200/90 shadow-sm transition hover:border-slate-300/90 hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="min-w-0 pr-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              </div>
              <div
                className={`shrink-0 rounded-xl p-2.5 ring-1 ${stat.ring} ${stat.iconBg}`}
              >
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums text-slate-900">{stat.value}</span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    stat.positive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.change}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg">Recent sign-ups</CardTitle>
                <CardDescription>Sample names for layout preview</CardDescription>
              </div>
              <div className="hidden rounded-md bg-slate-100 p-1.5 text-slate-400 sm:block" aria-hidden>
                <Users className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentUsers.map((name, i) => (
                <li
                  key={name}
                  className="flex items-center gap-3 rounded-lg border border-transparent py-0.5 transition hover:border-slate-200 hover:bg-slate-50/80"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-xs font-bold text-slate-600">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {i + 1} days ago
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg">Recent request activity</CardTitle>
                <CardDescription>Sample services for layout preview</CardDescription>
              </div>
              <div className="hidden rounded-md bg-slate-100 p-1.5 text-slate-400 sm:block" aria-hidden>
                <ClipboardList className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentServices.map((service, i) => (
                <li
                  key={service}
                  className="flex items-center gap-3 rounded-lg border border-transparent py-0.5 transition hover:border-slate-200 hover:bg-slate-50/80"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200/80">
                    <ClipboardList className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{service}</p>
                    <p className="text-xs text-slate-500">{i + 1}h ago</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
