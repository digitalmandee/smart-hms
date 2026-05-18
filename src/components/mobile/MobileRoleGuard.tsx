import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { AppRole } from "@/constants/roles";

interface MobileRoleGuardProps {
  allow: AppRole[];
  children: ReactNode;
}

/**
 * Gate a mobile page by role. Super admins always pass through.
 * Shows a friendly "not available for your role" screen otherwise.
 */
export function MobileRoleGuard({ allow, children }: MobileRoleGuardProps) {
  const { roles, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userRoles = (roles as AppRole[]) ?? [];
  const allowed =
    userRoles.includes("super_admin") || allow.some(r => userRoles.includes(r));

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">
          {t("mobile.roleGuard.title" as any)}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {t("mobile.roleGuard.description" as any)}
        </p>
        <Button onClick={() => navigate("/mobile/dashboard", { replace: true })}>
          {t("mobile.roleGuard.back" as any)}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
