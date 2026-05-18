import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, User, Calendar, Pill, TestTube } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";
import { useTranslation } from "@/lib/i18n";
import {
  CLINICAL_ROLES,
  NURSING_ROLES,
  PHARMACY_ROLES,
  LAB_ROLES,
  PATIENT_ROLES,
  ADMIN_ROLES,
  AppRole,
} from "@/constants/roles";

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  allow?: AppRole[]; // visible only if user has at least one of these roles
  hideFor?: AppRole[]; // hidden if user has any of these (e.g. patients)
}

const navItems: NavItem[] = [
  { path: "/mobile/dashboard", labelKey: "nav.home", icon: Home },
  { path: "/mobile/appointments", labelKey: "nav.schedule", icon: Calendar },
  {
    path: "/mobile/tasks",
    labelKey: "nav.tasks",
    icon: ClipboardList,
    allow: [...ADMIN_ROLES, ...CLINICAL_ROLES, ...NURSING_ROLES],
  },
  {
    path: "/mobile/pharmacy",
    labelKey: "nav.pharmacy",
    icon: Pill,
    allow: [...ADMIN_ROLES, ...PHARMACY_ROLES],
  },
  {
    path: "/mobile/lab",
    labelKey: "nav.lab",
    icon: TestTube,
    allow: [...ADMIN_ROLES, ...LAB_ROLES, ...CLINICAL_ROLES],
  },
  { path: "/mobile/profile", labelKey: "nav.profile", icon: User },
];

const isSuperAdmin = (roles: AppRole[]) => roles.includes("super_admin");
const isPatientOnly = (roles: AppRole[]) =>
  roles.length === 0 ||
  (roles.length > 0 && roles.every(r => PATIENT_ROLES.includes(r)));

export function BottomNavigation() {
  const location = useLocation();
  const { roles: authRoles } = useAuth();
  const haptics = useHaptics();
  const { t } = useTranslation();

  const roles = (authRoles as AppRole[]) ?? [];

  const filteredItems = navItems.filter(item => {
    if (item.hideFor?.some(r => roles.includes(r))) return false;
    if (!item.allow) return true;
    if (isSuperAdmin(roles)) return true;
    return item.allow.some(r => roles.includes(r));
  });

  // Patients only need Home / Schedule / Profile
  const displayItems = (isPatientOnly(roles)
    ? filteredItems.filter(i =>
        ["/mobile/dashboard", "/mobile/appointments", "/mobile/profile"].includes(i.path)
      )
    : filteredItems
  ).slice(0, 5);

  const handleNavClick = () => {
    haptics.light();
  };

  const isPathActive = (itemPath: string) => {
    if (itemPath === "/mobile/dashboard") {
      return (
        location.pathname === "/mobile" ||
        location.pathname === "/mobile/" ||
        location.pathname === "/mobile/dashboard"
      );
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border mobile-bottom-nav safe-area-bottom safe-area-x keyboard-hide">
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
