import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ModernStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  change?: string;
  variant?: "default" | "primary" | "success" | "warning" | "info" | "destructive" | "accent";
  onClick?: () => void;
  className?: string;
  delay?: number;
  loading?: boolean;
}

const variantStyles = {
  default: {
    card: "bg-card hover:shadow-lg",
    icon: "bg-muted text-muted-foreground",
    iconGlow: "",
  },
  primary: {
    card: "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
    icon: "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
    iconGlow: "shadow-lg shadow-primary/30",
  },
  success: {
    card: "bg-gradient-to-br from-success/5 to-success/10 border-success/20 hover:border-success/40 hover:shadow-lg hover:shadow-success/10",
    icon: "bg-gradient-to-br from-success to-success/80 text-success-foreground",
    iconGlow: "shadow-lg shadow-success/30",
  },
  warning: {
    card: "bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20 hover:border-warning/40 hover:shadow-lg hover:shadow-warning/10",
    icon: "bg-gradient-to-br from-warning to-warning/80 text-warning-foreground",
    iconGlow: "shadow-lg shadow-warning/30",
  },
  info: {
    card: "bg-gradient-to-br from-info/5 to-info/10 border-info/20 hover:border-info/40 hover:shadow-lg hover:shadow-info/10",
    icon: "bg-gradient-to-br from-info to-info/80 text-info-foreground",
    iconGlow: "shadow-lg shadow-info/30",
  },
  destructive: {
    card: "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20 hover:border-destructive/40 hover:shadow-lg hover:shadow-destructive/10",
    icon: "bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground",
    iconGlow: "shadow-lg shadow-destructive/30",
  },
  accent: {
    card: "bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10",
    icon: "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground",
    iconGlow: "shadow-lg shadow-accent/30",
  },
};

export function ModernStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  change,
  variant = "default",
  onClick,
  className,
  delay = 0,
  loading = false,
}: ModernStatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        "transition-all duration-300 transform hover:-translate-y-1",
        styles.card,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold tracking-tight animate-fade-in">
                {value}
              </p>
              {trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                    trend.isPositive
                      ? "text-success bg-success/10"
                      : "text-destructive bg-destructive/10"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value}%
                </div>
              )}
            </div>
            {(description || change) && (
              <p className="text-xs text-muted-foreground">{description || change}</p>
            )}
          </div>
          <div
            className={cn(
              "rounded-xl p-3 transition-transform duration-300 group-hover:scale-110",
              styles.icon,
              styles.iconGlow
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
