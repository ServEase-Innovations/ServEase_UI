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
        return "bg-success text-success-foreground";
      case "negative":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {change && (
                <Badge className={`text-xs px-2 py-1 ${getChangeColor()}`}>
                  {change}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="p-3 bg-accent rounded-lg">
            <Icon className="h-6 w-6 text-accent-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}