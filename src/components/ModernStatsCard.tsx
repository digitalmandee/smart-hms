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
    card: "bg-gradient-to-br from-card to-muted/30 border-border/50 hover:border-primary/30",
    icon: "bg-muted text-foreground",
    iconGlow: "shadow-md",
  },
  primary: {
    card: "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40",
    icon: "bg-primary text-primary-foreground",
    iconGlow: "shadow-lg shadow-primary/30",
  },
  success: {
    card: "bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20 hover:border-green-500/40",
    icon: "bg-green-500 text-white",
    iconGlow: "shadow-lg shadow-green-500/30",
  },
  warning: {
    card: "bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
    icon: "bg-amber-500 text-white",
    iconGlow: "shadow-lg shadow-amber-500/30",
  },
  info: {
    card: "bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
    icon: "bg-blue-500 text-white",
    iconGlow: "shadow-lg shadow-blue-500/30",
  },
  destructive: {
    card: "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20 hover:border-destructive/40",
    icon: "bg-destructive text-destructive-foreground",
    iconGlow: "shadow-lg shadow-destructive/30",
  },
  accent: {
    card: "bg-gradient-to-br from-accent/30 to-accent/50 border-accent/40 hover:border-accent/60",
    icon: "bg-accent text-accent-foreground",
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
