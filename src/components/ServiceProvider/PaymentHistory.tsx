/* eslint-disable */
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Common/Card";
import { Badge } from "../../components/Common/Badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Payment {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  type: "earning" | "withdrawal";
}

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "failed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  payment.type === "earning" 
                    ? "bg-success/10 text-success" 
                    : "bg-primary/10 text-primary"
                }`}>
                  {payment.type === "earning" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{payment.description}</p>
                  <p className="text-sm text-muted-foreground">{payment.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  payment.type === "earning" ? "text-success" : "text-foreground"
                }`}>
                  {payment.type === "earning" ? "+" : "-"}{payment.amount}
                </p>
                <Badge className={`${getStatusColor(payment.status)} text-xs mt-1`}>
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}