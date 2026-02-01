import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MobileStatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  onClick?: () => void;
}

export function MobileStatsCard({
  title,
  value,
  icon,
  trend,
  className,
  onClick
}: MobileStatsCardProps) {
  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? "text-emerald-500"
      : trend.value < 0
        ? "text-destructive"
        : "text-muted-foreground"
    : "";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-border p-3",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform touch-manipulation",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-xl font-bold mt-0.5">{value}</p>
          
          {trend && (
            <div className={cn("flex items-center gap-1 mt-1", trendColor)}>
              {TrendIcon && <TrendIcon className="h-3 w-3" />}
              <span className="text-[10px] font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-[10px] text-muted-foreground ml-1">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
