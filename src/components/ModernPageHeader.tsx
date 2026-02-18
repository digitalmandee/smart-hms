import { format } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { ChevronRight, Sun, Moon, Sunset, CloudSun, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useCountryConfig } from "@/contexts/CountryConfigContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "destructive";
}

export interface ModernPageHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  quickStats?: QuickStat[];
  showGreeting?: boolean;
  variant?: "default" | "gradient" | "subtle";
  icon?: LucideIcon;
  iconColor?: string;
}

function getTimeOfDay(goodMorning: string, goodAfternoon: string, goodEvening: string, goodNight: string): { greeting: string; icon: React.ReactNode } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: goodMorning, icon: <Sun className="h-5 w-5 text-warning" /> };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: goodAfternoon, icon: <CloudSun className="h-5 w-5 text-warning" /> };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: goodEvening, icon: <Sunset className="h-5 w-5 text-destructive" /> };
  } else {
    return { greeting: goodNight, icon: <Moon className="h-5 w-5 text-info" /> };
  }
}

const variantStyles = {
  default: "bg-card border-b",
  gradient: "bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-b border-primary/10",
  subtle: "bg-muted/30 border-b",
};

const statVariantStyles = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function ModernPageHeader({
  title,
  subtitle,
  userName,
  actions,
  breadcrumbs,
  quickStats,
  showGreeting = false,
  variant = "default",
  icon: HeaderIcon,
  iconColor = "text-primary",
}: ModernPageHeaderProps) {
  const { t } = useTranslation();
  const { default_language } = useCountryConfig();

  const dateLocale = default_language === "ar" || default_language === "ur" ? arLocale : enUS;
  const today = format(new Date(), "EEEE, MMMM d, yyyy", { locale: dateLocale });

  const { greeting, icon } = getTimeOfDay(
    t("dashboard.goodMorning"),
    t("dashboard.goodAfternoon"),
    t("dashboard.goodEvening"),
    t("dashboard.goodNight")
  );

  return (
    <div className={cn("mb-6 -mx-6 -mt-6 px-6 pt-6 pb-4", variantStyles[variant])}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              {item.href ? (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Main Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {/* Greeting */}
          {showGreeting && userName && (
            <div className="flex items-center gap-2 text-muted-foreground mb-1 animate-fade-in">
              {icon}
              <span className="text-sm font-medium">
                {greeting}, <span className="text-foreground">{userName}</span>
              </span>
            </div>
          )}

          {/* Title */}
          <div className="flex items-center gap-3">
            {HeaderIcon && (
              <div className={cn("p-2 rounded-xl bg-muted/50", iconColor)}>
                <HeaderIcon className="h-6 w-6" />
              </div>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          </div>

          {/* Subtitle or Date */}
          {subtitle ? (
            <p className="text-muted-foreground">{subtitle}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{today}</p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 animate-fade-in">{actions}</div>
        )}
      </div>

      {/* Quick Stats Bar */}
      {quickStats && quickStats.length > 0 && (
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("common.quickStats")}
          </span>
          <div className="flex items-center gap-6">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{stat.label}:</span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    statVariantStyles[stat.variant || "default"]
                  )}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
