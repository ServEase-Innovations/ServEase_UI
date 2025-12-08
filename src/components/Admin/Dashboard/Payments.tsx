/* eslint-disable */
import { Card, CardContent, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Badge } from "../../Common/Badge";
import { Search, Download, CreditCard, TrendingUp } from "lucide-react";
import { Input } from "../../Common/input";

const payments = [
  { 
    id: 1, 
    transaction: "TXN-001234", 
    customer: "John Smith", 
    provider: "Clean Masters", 
    amount: "Rs.120.00", 
    fee: "Rs.6.00",
    net: "Rs.114.00",
    status: "Completed", 
    date: "2024-01-15",
    method: "Credit Card"
  },
  { 
    id: 2, 
    transaction: "TXN-001235", 
    customer: "Sarah Johnson", 
    provider: "Fix It Pro", 
    amount: "Rs.85.00", 
    fee: "Rs.4.25",
    net: "Rs.80.75",
    status: "Completed", 
    date: "2024-01-14",
    method: "PayPal"
  },
  { 
    id: 3, 
    transaction: "TXN-001236", 
    customer: "Mike Wilson", 
    provider: "Garden Experts", 
    amount: "Rs.200.00", 
    fee: "Rs.10.00",
    net: "Rs.190.00",
    status: "Pending", 
    date: "2024-01-13",
    method: "Bank Transfer"
  },
  { 
    id: 4, 
    transaction: "TXN-001237", 
    customer: "Emily Davis", 
    provider: "Electric Solutions", 
    amount: "Rs.350.00", 
    fee: "Rs.17.50",
    net: "Rs.332.50",
    status: "Failed", 
    date: "2024-01-12",
    method: "Credit Card"
  },
];

const Payments = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "Pending": return "secondary";
      case "Failed": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Track and manage payment transactions</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">Rs.45,231</div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">Rs.2,156</div>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">1,247</div>
            <p className="text-sm text-muted-foreground">Successful Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">23</div>
            <p className="text-sm text-muted-foreground">Failed Payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search transactions..." className="pl-10 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Provider</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Platform Fee</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Net Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border">
                    <td className="p-4 font-mono text-sm">{payment.transaction}</td>
                    <td className="p-4 text-muted-foreground">{payment.customer}</td>
                    <td className="p-4 text-muted-foreground">{payment.provider}</td>
                    <td className="p-4 font-medium">{payment.amount}</td>
                    <td className="p-4 text-muted-foreground">{payment.fee}</td>
                    <td className="p-4 font-medium text-green-600">{payment.net}</td>
                    <td className="p-4 text-muted-foreground">{payment.method}</td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;