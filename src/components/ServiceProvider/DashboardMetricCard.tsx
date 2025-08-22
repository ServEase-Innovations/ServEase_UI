/* eslint-disable */
import { Card, CardContent } from "../../components/Common/Card";
import { Badge } from "../../components/Common/Badge";
import { LucideIcon } from "lucide-react";

interface DashboardMetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
}

export function DashboardMetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description
}: DashboardMetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white border border-blue-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-700">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-blue-900">{value}</p>
              {change && (
                <Badge className={`text-xs px-2 py-1 ${getChangeColor()}`}>
                  {change}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-blue-600">{description}</p>
            )}
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}