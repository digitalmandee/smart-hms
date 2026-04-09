import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Moon,
  Smartphone,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/constants/roles";
import { useTheme } from "next-themes";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useHaptics } from "@/hooks/useHaptics";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
import { useMFA } from "@/hooks/useMFA";
import { EnrollMFADialog } from "@/components/mfa/EnrollMFADialog";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, roles, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { hasPermission: hasPushPermission, requestPermissions } = usePushNotifications();
  const haptics = useHaptics();
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;
  const { isEnrolled, factorId, unenroll } = useMFA();
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const { t } = useTranslation();

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';

  const primaryRole = roles[0];
  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] : 'User';

  const handleSignOut = async () => {
    haptics.medium();
    await signOut();
    navigate('/auth/login', { replace: true });
  };

  const handleToggleDarkMode = (checked: boolean) => {
    haptics.light();
    setTheme(checked ? 'dark' : 'light');
  };

  const handleToggleNotifications = async (checked: boolean) => {
    if (checked) {
      await requestPermissions();
    }
    haptics.light();
  };

  const menuItems = [
    {
      icon: User,
      label: 'Edit Profile',
      path: '/app/settings/users'
    },
    {
      icon: Bell,
      label: 'Notifications',
      path: '/app/notifications'
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      path: '/app/settings'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      path: '/app/settings'
    }
  ];

  // Mobile Layout - Simplified, personal info only
  if (showMobileUI) {
    return (
      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">{profile?.full_name || 'User'}</h1>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
          <span className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {roleLabel}
          </span>
        </div>

        <Separator />

        {/* Personal Preferences */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Preferences
          </h2>
          
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <span>Dark Mode</span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={handleToggleDarkMode}
            />
          </div>

          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <span>Push Notifications</span>
            </div>
            <Switch
              checked={hasPushPermission}
              onCheckedChange={handleToggleNotifications}
            />
          </div>
        </div>

        <Separator />

        {/* Two-Factor Authentication */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("mfa.two_factor")}
          </h2>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <span>{t("mfa.two_factor")}</span>
                <Badge variant={isEnrolled ? "default" : "secondary"} className="ml-2">
                  {isEnrolled ? t("mfa.enabled_badge") : t("mfa.disabled_badge")}
                </Badge>
              </div>
            </div>
            <Button
              variant={isEnrolled ? "destructive" : "default"}
              size="sm"
              onClick={async () => {
                if (isEnrolled && factorId) {
                  await unenroll(factorId);
                  toast.success(t("mfa.disabled_badge"));
                } else {
                  setShowEnrollDialog(true);
                }
              }}
            >
              {isEnrolled ? t("mfa.disable") : t("mfa.enable")}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Edit Profile Button */}
        <Button
          variant="outline"
          className="w-full touch-target"
          onClick={() => {
            haptics.light();
            navigate('/app/settings/users');
          }}
        >
          <User className="h-5 w-5 mr-2" />
          Edit Profile
        </Button>

        {/* Version Info */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          HealthOS v2.0.0 • Build 2026.02.01
        </p>
        <EnrollMFADialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog} />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{profile?.full_name || 'User'}</h2>
            <p className="text-muted-foreground">{profile?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {roleLabel}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <span>Dark Mode</span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={handleToggleDarkMode}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span>Push Notifications</span>
            </div>
            <Switch
              checked={hasPushPermission}
              onCheckedChange={handleToggleNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {t("mfa.two_factor")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("mfa.two_factor_desc")}</p>
              <Badge variant={isEnrolled ? "default" : "secondary"} className="mt-2">
                {isEnrolled ? t("mfa.enabled_badge") : t("mfa.disabled_badge")}
              </Badge>
            </div>
            <Button
              variant={isEnrolled ? "destructive" : "default"}
              onClick={async () => {
                if (isEnrolled && factorId) {
                  await unenroll(factorId);
                  toast.success(t("mfa.disabled_badge"));
                } else {
                  setShowEnrollDialog(true);
                }
              }}
            >
              {isEnrolled ? t("mfa.disable") : t("mfa.enable")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <EnrollMFADialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog} />
    </div>
  );
}
