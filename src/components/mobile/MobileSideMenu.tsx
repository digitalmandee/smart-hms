import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Settings,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  Info,
  Calendar,
  Stethoscope,
  ClipboardList,
  Pill,
  TestTube,
  Wallet,
  LogOut,
  Moon,
  ChevronRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useHaptics } from "@/hooks/useHaptics";
import { ROLE_LABELS, CLINICAL_ROLES, NURSING_ROLES } from "@/constants/roles";
import { cn } from "@/lib/utils";

interface MobileSideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to?: string;
  onClick?: () => void;
  onClose: () => void;
}

function MenuItem({ icon: Icon, label, to, onClick, onClose }: MenuItemProps) {
  const haptics = useHaptics();

  const handleClick = () => {
    haptics.light();
    onClick?.();
    onClose();
  };

  const content = (
    <div className="flex items-center justify-between py-3 px-2 touch-manipulation active:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <button className="w-full text-left" onClick={handleClick}>
      {content}
    </button>
  );
}

export function MobileSideMenu({ open, onOpenChange }: MobileSideMenuProps) {
  const navigate = useNavigate();
  const { profile, roles, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const haptics = useHaptics();

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "U";

  const primaryRole = roles[0];
  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] : "User";

  const hasClinicialRole = roles.some((role) => CLINICAL_ROLES.includes(role));
  const hasNursingRole = roles.some((role) => NURSING_ROLES.includes(role));
  const isPharmacist = roles.some((role) =>
    ["pharmacist", "ot_pharmacist"].includes(role)
  );
  const isLabTech = roles.includes("lab_technician" as any);

  const handleSignOut = async () => {
    haptics.medium();
    onOpenChange(false);
    await signOut();
    navigate("/auth/login", { replace: true });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleToggleDarkMode = (checked: boolean) => {
    haptics.light();
    setTheme(checked ? "dark" : "light");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[300px] p-0 flex flex-col"
        hideCloseButton
      >
        {/* Profile Header */}
        <SheetHeader className="p-4 pb-2 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={profile?.full_name || "User"}
              />
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold truncate text-left">
                {profile?.full_name || "User"}
              </SheetTitle>
              <p className="text-sm text-muted-foreground truncate">
                {roleLabel}
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-3 py-4">
          {/* Quick Actions */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
              Quick Actions
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <Link
                to="/app/appointments"
                onClick={handleClose}
                className="touch-manipulation active:scale-95 transition-transform"
              >
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-[10px] text-center">Schedule</span>
                </div>
              </Link>
              {hasClinicialRole && (
                <Link
                  to="/app/opd"
                  onClick={handleClose}
                  className="touch-manipulation active:scale-95 transition-transform"
                >
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <span className="text-[10px] text-center">Consult</span>
                  </div>
                </Link>
              )}
              {hasNursingRole && (
                <Link
                  to="/app/opd/nursing"
                  onClick={handleClose}
                  className="touch-manipulation active:scale-95 transition-transform"
                >
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <span className="text-[10px] text-center">Tasks</span>
                  </div>
                </Link>
              )}
              {isPharmacist && (
                <Link
                  to="/app/pharmacy"
                  onClick={handleClose}
                  className="touch-manipulation active:scale-95 transition-transform"
                >
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted">
                    <Pill className="h-5 w-5 text-primary" />
                    <span className="text-[10px] text-center">Dispense</span>
                  </div>
                </Link>
              )}
              {isLabTech && (
                <Link
                  to="/app/lab"
                  onClick={handleClose}
                  className="touch-manipulation active:scale-95 transition-transform"
                >
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted">
                    <TestTube className="h-5 w-5 text-primary" />
                    <span className="text-[10px] text-center">Lab</span>
                  </div>
                </Link>
              )}
              <Link
                to="/app/my-wallet"
                onClick={handleClose}
                className="touch-manipulation active:scale-95 transition-transform"
              >
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span className="text-[10px] text-center">Wallet</span>
                </div>
              </Link>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Account Section */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-2">
              Account
            </h3>
            <div className="space-y-0.5">
              <MenuItem
                icon={Settings}
                label="Settings"
                to="/app/settings"
                onClose={handleClose}
              />
              <MenuItem
                icon={Bell}
                label="Notifications"
                to="/app/notifications"
                onClose={handleClose}
              />
              <MenuItem
                icon={Shield}
                label="Privacy & Security"
                to="/app/settings"
                onClose={handleClose}
              />
            </div>
          </div>

          <Separator className="my-3" />

          {/* Support Section */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-2">
              Support
            </h3>
            <div className="space-y-0.5">
              <MenuItem
                icon={HelpCircle}
                label="Help & FAQ"
                onClose={handleClose}
              />
              <MenuItem
                icon={FileText}
                label="Terms of Service"
                onClose={handleClose}
              />
              <MenuItem
                icon={Info}
                label="About HealthOS 24"
                onClose={handleClose}
              />
            </div>
          </div>

          <Separator className="my-3" />

          {/* Appearance Toggle */}
          <div className="px-2 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Dark Mode</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleToggleDarkMode}
              />
            </div>
          </div>
        </ScrollArea>

        {/* Footer - Sign Out & Version */}
        <div className="p-4 border-t space-y-3">
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            HealthOS 24 v2.0.0
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
