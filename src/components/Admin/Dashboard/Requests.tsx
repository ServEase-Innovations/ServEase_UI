/* eslint-disable */
import { Card, CardContent, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Badge } from "../../Common/Badge";
import { MoreHorizontal, Search, Filter } from "lucide-react";
import { Input } from "../../Common/input";

const requests = [
  { 
    id: 1, 
    service: "Home Cleaning", 
    customer: "John Smith", 
    provider: "Clean Masters", 
    amount: "$120", 
    status: "In Progress", 
    date: "2024-01-15",
    priority: "Medium"
  },
  { 
    id: 2, 
    service: "Plumbing Repair", 
    customer: "Sarah Johnson", 
    provider: "Fix It Pro", 
    amount: "$85", 
    status: "Completed", 
    date: "2024-01-14",
    priority: "High"
  },
  { 
    id: 3, 
    service: "Garden Maintenance", 
    customer: "Mike Wilson", 
    provider: "Garden Experts", 
    amount: "$200", 
    status: "Pending", 
    date: "2024-01-13",
    priority: "Low"
  },
  { 
    id: 4, 
    service: "Electrical Installation", 
    customer: "Emily Davis", 
    provider: "Electric Solutions", 
    amount: "$350", 
    status: "In Progress", 
    date: "2024-01-12",
    priority: "High"
  },
];

const Requests = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "In Progress": return "secondary";
      case "Pending": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Requests</h1>
          <p className="text-muted-foreground">Track and manage all service requests</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">156</div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">89</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">45</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">22</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Requests</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search requests..." className="pl-10 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Service</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Provider</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-border">
                    <td className="p-4 font-medium">{request.service}</td>
                    <td className="p-4 text-muted-foreground">{request.customer}</td>
                    <td className="p-4 text-muted-foreground">{request.provider}</td>
                    <td className="p-4 font-medium">{request.amount}</td>
                    <td className="p-4">
                      <Badge variant={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{request.date}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
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

export default Requests;

