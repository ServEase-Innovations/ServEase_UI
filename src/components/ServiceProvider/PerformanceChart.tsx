import { Card, CardContent, CardHeader, CardTitle } from "../../components/Common/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { month: "Jan", earnings: 2400, bookings: 12 },
  { month: "Feb", earnings: 1398, bookings: 8 },
  { month: "Mar", earnings: 9800, bookings: 18 },
  { month: "Apr", earnings: 3908, bookings: 15 },
  { month: "May", earnings: 4800, bookings: 22 },
  { month: "Jun", earnings: 3800, bookings: 19 },
];

export function PerformanceChart() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 6 }}
                activeDot={{ r: 8, fill: "hsl(var(--primary))" }}
              />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="hsl(var(--success))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--success))", r: 6 }}
                activeDot={{ r: 8, fill: "hsl(var(--success))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}