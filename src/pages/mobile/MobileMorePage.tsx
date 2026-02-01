import { Link } from "react-router-dom";
import {
  Settings,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Shield,
  Info,
  Building2,
  CreditCard,
  Users,
  Wallet,
  Calendar,
  ClipboardList,
  Stethoscope,
  TestTube,
  Pill,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";
import { CLINICAL_ROLES, NURSING_ROLES } from "@/constants/roles";

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to?: string;
  onClick?: () => void;
  badge?: string;
  destructive?: boolean;
}

function MenuItem({ icon: Icon, label, to, onClick, badge, destructive }: MenuItemProps) {
  const haptics = useHaptics();

  const handleClick = () => {
    haptics.light();
    onClick?.();
  };

  const content = (
    <div
      className={cn(
        "flex items-center justify-between py-3 px-4 touch-manipulation active:bg-muted/50 transition-colors",
        destructive && "text-destructive"
      )}
      onClick={!to ? handleClick : undefined}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
}

export default function MobileMorePage() {
  const { roles, signOut, profile } = useAuth();
  const haptics = useHaptics();

  const hasClinicialRole = roles.some((role) => CLINICAL_ROLES.includes(role));
  const hasNursingRole = roles.some((role) => NURSING_ROLES.includes(role));
  const isPharmacist = roles.some((role) => ["pharmacist", "ot_pharmacist"].includes(role));
  const isLabTech = roles.includes("lab_technician" as any);

  const handleSignOut = () => {
    haptics.medium();
    signOut();
  };

  return (
    <div className="pb-6">
      {/* Profile Summary */}
      <div className="px-4 py-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {profile?.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{profile?.full_name || "User"}</h2>
            <p className="text-sm text-primary-foreground/80">
              {roles[0]?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Staff"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          <Link to="/mobile/appointments" className="touch-manipulation active:scale-95 transition-transform">
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-xs">Schedule</span>
            </div>
          </Link>
          {hasClinicialRole && (
            <Link to="/mobile/tasks" className="touch-manipulation active:scale-95 transition-transform">
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                <Stethoscope className="h-5 w-5 text-primary" />
                <span className="text-xs">Consult</span>
              </div>
            </Link>
          )}
          {hasNursingRole && (
            <Link to="/mobile/tasks" className="touch-manipulation active:scale-95 transition-transform">
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span className="text-xs">Tasks</span>
              </div>
            </Link>
          )}
          {isPharmacist && (
            <Link to="/mobile/pharmacy" className="touch-manipulation active:scale-95 transition-transform">
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                <Pill className="h-5 w-5 text-primary" />
                <span className="text-xs">Dispense</span>
              </div>
            </Link>
          )}
          {isLabTech && (
            <Link to="/mobile/lab" className="touch-manipulation active:scale-95 transition-transform">
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                <TestTube className="h-5 w-5 text-primary" />
                <span className="text-xs">Lab</span>
              </div>
            </Link>
          )}
          <div className="touch-manipulation active:scale-95 transition-transform">
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-xs">Wallet</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Menu Sections */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-muted-foreground px-4 mb-2">Account</h3>
        <Card className="mx-4 overflow-hidden">
          <CardContent className="p-0">
            <MenuItem icon={Settings} label="Settings" to="/mobile/settings" />
            <Separator className="mx-4" />
            <MenuItem icon={Bell} label="Notification Preferences" />
            <Separator className="mx-4" />
            <MenuItem icon={Shield} label="Privacy & Security" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-muted-foreground px-4 mb-2">Support</h3>
        <Card className="mx-4 overflow-hidden">
          <CardContent className="p-0">
            <MenuItem icon={HelpCircle} label="Help & FAQ" />
            <Separator className="mx-4" />
            <MenuItem icon={FileText} label="Terms of Service" />
            <Separator className="mx-4" />
            <MenuItem icon={Info} label="About HealthOS 24" badge="v2.0" />
          </CardContent>
        </Card>
      </div>

      {/* Appearance Toggle */}
      <div className="mt-4 mx-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5" />
                <span className="font-medium">Dark Mode</span>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sign Out */}
      <div className="mt-6 mx-4">
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* App Version */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">HealthOS 24 Mobile v2.0.0</p>
      </div>
    </div>
  );
}
