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
        return "bg-emerald-100 text-emerald-800 border-emerald-200/80";
      case "negative":
        return "bg-rose-100 text-rose-800 border-rose-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200/80";
    }
  };

  return (
    <Card className="group h-full border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 shadow-sm transition-all duration-200 hover:border-slate-300/80 hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 sm:text-xs">
              {title}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
                {value}
              </p>
              {change && (
                <Badge
                  className={`border text-[10px] font-medium sm:text-xs ${getChangeColor()}`}
                >
                  {change}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-500">{description}</p>
            )}
          </div>
          <div className="shrink-0 rounded-xl bg-sky-100/90 p-2.5 text-sky-700 shadow-inner ring-1 ring-sky-200/50 transition group-hover:bg-sky-200/30">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}