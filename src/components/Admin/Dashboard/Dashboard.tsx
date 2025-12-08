/* eslint-disable */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Users, UserCheck, ClipboardList, DollarSign } from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    description: "+12% from last month",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    title: "Service Providers",
    value: "324",
    description: "+8% from last month",
    icon: UserCheck,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    title: "Active Requests",
    value: "156",
    description: "+5% from last month",
    icon: ClipboardList,
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    title: "Revenue",
    value: "$45,231",
    description: "+15% from last month",
    icon: DollarSign,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  }
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-md`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>New user registrations this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["John Smith", "Sarah Johnson", "Mike Wilson", "Emily Davis"].map((name, index) => (
                <div key={name} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{index + 1} days ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Latest service requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "Home Cleaning Service",
                "Plumbing Repair",
                "Electrical Installation",
                "Garden Maintenance"
              ].map((service, index) => (
                <div key={service} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-accent/50 rounded-full flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{service}</p>
                    <p className="text-xs text-muted-foreground">{index + 1}h ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;