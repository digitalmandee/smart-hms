import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, User, Calendar, Pill, TestTube } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";
import { useTranslation } from "@/lib/i18n";

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { path: "/app/dashboard", labelKey: "nav.home", icon: Home },
  { path: "/app/appointments", labelKey: "nav.schedule", icon: Calendar },
  { path: "/app/opd/nursing", labelKey: "nav.tasks", icon: ClipboardList, roles: ["doctor", "nurse", "opd_nurse", "ipd_nurse", "ot_nurse"] },
  { path: "/app/pharmacy", labelKey: "nav.pharmacy", icon: Pill, roles: ["pharmacist", "ot_pharmacist"] },
  { path: "/app/lab", labelKey: "nav.lab", icon: TestTube, roles: ["lab_technician"] },
  { path: "/app/profile", labelKey: "nav.profile", icon: User },
];

// Role-aware home path: lab techs go to /app/lab, pharmacists to /app/pharmacy
const getHomePath = (roles: string[]): string => {
  if (roles.includes("lab_technician")) return "/app/lab";
  if (roles.includes("pharmacist") || roles.includes("ot_pharmacist")) return "/app/pharmacy";
  return "/app/dashboard";
};

export function BottomNavigation() {
  const location = useLocation();
  const { roles } = useAuth();
  const haptics = useHaptics();
  const { t } = useTranslation();

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => roles.includes(role as any));
  });

  const displayItems = filteredItems.slice(0, 5);

  const handleNavClick = () => {
    haptics.light();
  };

  const isPathActive = (itemPath: string) => {
    if (itemPath === "/app/dashboard") {
      return location.pathname === "/app/dashboard" || location.pathname === "/app";
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border mobile-bottom-nav">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {displayItems.map((item) => {
          const isActive = isPathActive(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-2 px-1",
                "transition-all duration-200 touch-manipulation",
                "active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
              )}
              
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
              </div>
              
              <span className={cn(
                "text-[10px] font-medium leading-none mt-0.5 transition-all duration-200",
                isActive && "font-semibold"
              )}>
                {t(item.labelKey as any)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
