import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, User, Menu, Calendar, Pill, TestTube } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { path: "/mobile/dashboard", label: "Home", icon: Home },
  { path: "/mobile/appointments", label: "Schedule", icon: Calendar },
  { path: "/mobile/tasks", label: "Tasks", icon: ClipboardList, roles: ["doctor", "nurse", "opd_nurse", "ipd_nurse", "ot_nurse"] },
  { path: "/mobile/pharmacy", label: "Pharmacy", icon: Pill, roles: ["pharmacist", "ot_pharmacist"] },
  { path: "/mobile/lab", label: "Lab", icon: TestTube, roles: ["lab_technician"] },
  { path: "/mobile/profile", label: "Profile", icon: User },
  { path: "/mobile/more", label: "More", icon: Menu },
];

export function BottomNavigation() {
  const location = useLocation();
  const { roles } = useAuth();
  const haptics = useHaptics();

  // Filter nav items based on user roles
  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => roles.includes(role as any));
  });

  // Limit to 5 items max for bottom nav
  const displayItems = filteredItems.slice(0, 5);

  const handleNavClick = () => {
    haptics.light();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {displayItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/mobile/dashboard" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 px-1 transition-colors",
                "active:bg-muted/50 touch-manipulation",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className={cn(
                "text-[10px] font-medium leading-none",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
