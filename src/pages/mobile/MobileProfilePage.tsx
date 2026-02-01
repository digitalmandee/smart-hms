import { useNavigate } from "react-router-dom";
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Moon,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROLE_LABELS } from "@/constants/roles";
import { useTheme } from "next-themes";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useHaptics } from "@/hooks/useHaptics";

export default function MobileProfilePage() {
  const navigate = useNavigate();
  const { profile, roles, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { hasPermission: hasPushPermission, requestPermissions } = usePushNotifications();
  const haptics = useHaptics();

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
    navigate('/mobile/login', { replace: true });
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
      path: '/mobile/profile/edit'
    },
    {
      icon: Bell,
      label: 'Notifications',
      path: '/mobile/notifications'
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      path: '/mobile/privacy'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      path: '/mobile/help'
    }
  ];

  return (
    <div className="px-4 py-6 space-y-6">
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

      {/* Settings */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Settings
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

      {/* Menu Items */}
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => {
                haptics.light();
                navigate(item.path);
              }}
              className="flex items-center justify-between w-full py-3 px-1 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      <Separator />

      {/* Sign Out */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleSignOut}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Sign Out
      </Button>

      {/* Version Info */}
      <p className="text-center text-xs text-muted-foreground pt-4">
        HealthOS v1.0.0 • Build 2026.02.01
      </p>
    </div>
  );
}
