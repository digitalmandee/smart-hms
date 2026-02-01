import { Bell, Search } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useHaptics } from "@/hooks/useHaptics";

export function MobileHeader() {
  const { profile, roles } = useAuth();
  const [notificationCount] = useState(3); // TODO: Connect to real notifications
  const haptics = useHaptics();
  
  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';

  const handleAction = () => {
    haptics.light();
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 border-b border-border mobile-header">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo on left */}
        <Link 
          to="/app/dashboard" 
          className="flex items-center touch-manipulation active:scale-95 transition-transform"
          onClick={handleAction}
        >
          <HealthOS24Logo variant="icon" size="sm" />
        </Link>

        {/* Spacer */}
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {/* Search */}
          <Link to="/app/patients" onClick={handleAction}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl touch-manipulation active:scale-95 transition-transform"
            >
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {/* Notifications */}
          <Link to="/app/notifications" onClick={handleAction}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-10 w-10 rounded-xl touch-manipulation active:scale-95 transition-transform"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-0.5 -right-0.5 h-5 min-w-5 p-0 flex items-center justify-center text-[10px] font-bold rounded-full animate-pulse"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Profile */}
          <Link 
            to="/app/profile" 
            onClick={handleAction}
            className="touch-manipulation active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2 pl-1">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
