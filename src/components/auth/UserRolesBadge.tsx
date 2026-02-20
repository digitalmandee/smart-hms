import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/constants/roles";
import { Database } from "@/integrations/supabase/types";
import { Shield, Crown, Building2, Stethoscope, Heart, UserCheck, Pill, FlaskConical, Scissors, Syringe, Users, Calculator, Warehouse, Droplets, ScanLine, Bed, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

type AppRole = Database["public"]["Enums"]["app_role"];

// Icon mapping for each role
const ROLE_ICONS: Record<AppRole, React.ComponentType<{ className?: string }>> = {
  super_admin: Crown,
  org_admin: Building2,
  branch_admin: Building2,
  doctor: Stethoscope,
  surgeon: Scissors,
  anesthetist: Syringe,
  nurse: Heart,
  opd_nurse: Heart,
  ipd_nurse: Bed,
  ot_nurse: HeartPulse,
  receptionist: UserCheck,
  pharmacist: Pill,
  ot_pharmacist: Pill,
  lab_technician: FlaskConical,
  radiologist: ScanLine,
  radiology_technician: ScanLine,
  blood_bank_technician: Droplets,
  accountant: Calculator,
  finance_manager: Calculator,
  hr_manager: Users,
  hr_officer: Users,
  store_manager: Warehouse,
  ot_technician: HeartPulse,
  warehouse_admin: Warehouse,
  warehouse_user: Warehouse,
};

// Color mapping for role categories
const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  org_admin: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  branch_admin: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  doctor: "bg-green-500/10 text-green-600 border-green-500/30",
  surgeon: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  anesthetist: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/30",
  nurse: "bg-pink-500/10 text-pink-600 border-pink-500/30",
  opd_nurse: "bg-pink-500/10 text-pink-600 border-pink-500/30",
  ipd_nurse: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  ot_nurse: "bg-lime-500/10 text-lime-600 border-lime-500/30",
  receptionist: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  pharmacist: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  ot_pharmacist: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  lab_technician: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  radiologist: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  radiology_technician: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  blood_bank_technician: "bg-red-500/10 text-red-600 border-red-500/30",
  accountant: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  finance_manager: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  hr_manager: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  hr_officer: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  store_manager: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  ot_technician: "bg-lime-500/10 text-lime-600 border-lime-500/30",
  warehouse_admin: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  warehouse_user: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

interface UserRolesBadgeProps {
  roles?: AppRole[];
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  maxVisible?: number;
}

export function UserRolesBadge({
  roles: propRoles,
  showIcon = true,
  size = "md",
  className,
  maxVisible = 3,
}: UserRolesBadgeProps) {
  const { roles: authRoles } = useAuth();
  const roles = propRoles || (authRoles as AppRole[]);

  if (!roles || roles.length === 0) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Shield className="h-3 w-3 mr-1" />
        No roles assigned
      </Badge>
    );
  }

  const visibleRoles = roles.slice(0, maxVisible);
  const hiddenCount = roles.length - maxVisible;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visibleRoles.map((role) => {
        const Icon = ROLE_ICONS[role] || Shield;
        const colorClass = ROLE_COLORS[role] || "bg-muted text-muted-foreground border-border";
        const label = ROLE_LABELS[role] || role.replace(/_/g, " ");

        return (
          <Badge
            key={role}
            variant="outline"
            className={cn(
              "font-medium border transition-all",
              sizeClasses[size],
              colorClass
            )}
          >
            {showIcon && <Icon className={cn(iconSizes[size], "mr-1")} />}
            {label}
          </Badge>
        );
      })}
      {hiddenCount > 0 && (
        <Badge
          variant="outline"
          className={cn(
            "font-medium bg-muted/50 text-muted-foreground",
            sizeClasses[size]
          )}
        >
          +{hiddenCount} more
        </Badge>
      )}
    </div>
  );
}

// Compact inline version for headers
export function UserRoleInline({ className }: { className?: string }) {
  const { roles } = useAuth();

  if (!roles || roles.length === 0) return null;

  const primaryRole = roles[0] as AppRole;
  const Icon = ROLE_ICONS[primaryRole] || Shield;
  const colorClass = ROLE_COLORS[primaryRole] || "text-muted-foreground";
  const label = ROLE_LABELS[primaryRole] || primaryRole.replace(/_/g, " ");

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", colorClass.split(" ")[1], className)}>
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
      {roles.length > 1 && (
        <span className="text-muted-foreground">+{roles.length - 1}</span>
      )}
    </div>
  );
}
