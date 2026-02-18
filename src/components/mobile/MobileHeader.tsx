import { useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useHaptics } from "@/hooks/useHaptics";
import { MobileSideMenu } from "./MobileSideMenu";
import { useIsRTL } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const { profile } = useAuth();
  const [notificationCount] = useState(3);
  const haptics = useHaptics();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const isRTL = useIsRTL();
  
  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';

  const handleAction = () => {
    haptics.light();
  };

  const handleOpenSideMenu = () => {
    haptics.light();
    setSideMenuOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 border-b border-border mobile-header">
        <div className={cn("flex items-center justify-between h-14 px-4", isRTL && "flex-row-reverse")}>
          {/* Left - Menu & Search */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl touch-manipulation active:scale-95 transition-transform"
              onClick={handleOpenSideMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/app/patients" onClick={handleAction}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl touch-manipulation active:scale-95 transition-transform"
              >
                <Search className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Centered Logo */}
          <Link 
            to="/app/dashboard" 
            className="absolute left-1/2 -translate-x-1/2 touch-manipulation active:scale-95 transition-transform"
            onClick={handleAction}
          >
            <HealthOS24Logo variant="icon" size="sm" />
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-1">

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
                    className={cn(
                      "absolute h-5 min-w-5 p-0 flex items-center justify-center text-[10px] font-bold rounded-full animate-pulse",
                      isRTL ? "-top-0.5 -left-0.5" : "-top-0.5 -right-0.5"
                    )}
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
              <div className="flex items-center gap-2 ps-1">
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

      {/* Side Menu */}
      <MobileSideMenu open={sideMenuOpen} onOpenChange={setSideMenuOpen} />
    </>
  );
}
