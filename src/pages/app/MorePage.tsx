import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Bell,
  Shield,
  Info,
  Calendar,
  ClipboardList,
  Stethoscope,
  TestTube,
  Pill,
  Wallet,
  Users,
  Building2,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useHaptics } from "@/hooks/useHaptics";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
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

export default function MorePage() {
  const navigate = useNavigate();
  const { roles, signOut, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const haptics = useHaptics();
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  const hasClinicialRole = roles.some((role) => CLINICAL_ROLES.includes(role));
  const hasNursingRole = roles.some((role) => NURSING_ROLES.includes(role));
  const isPharmacist = roles.some((role) => ["pharmacist", "ot_pharmacist"].includes(role));
  const isLabTech = roles.includes("lab_technician" as any);

  const handleSignOut = () => {
    haptics.medium();
    signOut();
  };

  // Mobile Layout - Native app style
  if (showMobileUI) {
    return (
      <div className="px-4 py-4 pb-24 space-y-4">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-bold">Menu</h1>
          <p className="text-sm text-muted-foreground">Quick access & settings</p>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-2">
            <Link to="/app/appointments" className="touch-manipulation active:scale-95 transition-transform">
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-xs">Schedule</span>
              </div>
            </Link>
            {hasClinicialRole && (
              <Link to="/app/opd" className="touch-manipulation active:scale-95 transition-transform">
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <span className="text-xs">Consult</span>
                </div>
              </Link>
            )}
            {hasNursingRole && (
              <Link to="/app/opd/nursing" className="touch-manipulation active:scale-95 transition-transform">
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <span className="text-xs">Tasks</span>
                </div>
              </Link>
            )}
            {isPharmacist && (
              <Link to="/app/pharmacy" className="touch-manipulation active:scale-95 transition-transform">
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                  <Pill className="h-5 w-5 text-primary" />
                  <span className="text-xs">Dispense</span>
                </div>
              </Link>
            )}
            {isLabTech && (
              <Link to="/app/lab" className="touch-manipulation active:scale-95 transition-transform">
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                  <TestTube className="h-5 w-5 text-primary" />
                  <span className="text-xs">Lab</span>
                </div>
              </Link>
            )}
            <Link to="/app/my-wallet" className="touch-manipulation active:scale-95 transition-transform">
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-xs">Wallet</span>
              </div>
            </Link>
          </div>
        </div>

        <Separator />

        {/* Menu Sections */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Account</h3>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <MenuItem icon={Settings} label="Settings" to="/app/settings" />
              <Separator className="mx-4" />
              <MenuItem icon={Bell} label="Notification Preferences" to="/app/notifications" />
              <Separator className="mx-4" />
              <MenuItem icon={Shield} label="Privacy & Security" to="/app/settings" />
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Support</h3>
          <Card className="overflow-hidden">
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5" />
                <span className="font-medium">Dark Mode</span>
              </div>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => {
                  haptics.light();
                  setTheme(checked ? 'dark' : 'light');
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        {/* App Version */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">HealthOS 24 Mobile v2.0.0</p>
        </div>
      </div>
    );
  }

  // Desktop Layout - Redirect to settings or show settings hub
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Settings & More</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/app/settings')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Organization Settings
            </CardTitle>
            <CardDescription>
              Manage branches, users, and organization configuration
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/app/profile')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Profile
            </CardTitle>
            <CardDescription>
              View and edit your profile settings
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/app/notifications')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              View and manage your notifications
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/app/my-wallet')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              My Wallet
            </CardTitle>
            <CardDescription>
              View earnings and wallet balance
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8">
        <Button
          variant="outline"
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
