import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  isLoading?: boolean;
}

const variantStyles = {
  default: "text-primary",
  success: "text-green-600",
  warning: "text-amber-600", 
  danger: "text-red-600",
  info: "text-blue-600",
};

const trendColors = {
  positive: "text-green-600 bg-green-50",
  negative: "text-red-600 bg-red-50",
  neutral: "text-gray-600 bg-gray-50",
};

export function ReportSummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  isLoading = false,
}: ReportSummaryCardProps) {
  const getTrendColor = () => {
    if (!trend) return trendColors.neutral;
    if (trend.value > 0) return trendColors.positive;
    if (trend.value < 0) return trendColors.negative;
    return trendColors.neutral;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse bg-muted rounded" />
            ) : (
              <p className={cn("text-2xl font-bold", variantStyles[variant])}>
                {value}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", getTrendColor())}>
                <span>{trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"}</span>
                <span>{Math.abs(trend.value)}% {trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn("p-2 rounded-lg bg-muted/50", variantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
