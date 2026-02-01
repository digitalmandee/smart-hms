import { Outlet, useLocation } from "react-router-dom";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const MobileLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Don't show navigation on auth pages
  const isAuthPage = location.pathname.startsWith('/auth') || location.pathname.startsWith('/mobile/login');
  
  if (!user && !isAuthPage) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Mobile Header */}
      {!isAuthPage && <MobileHeader />}
      
      {/* Main Content - scrollable area */}
      <main className={cn(
        "flex-1 overflow-y-auto overscroll-contain",
        !isAuthPage && "pb-20" // Space for bottom navigation
      )}>
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
      
      {/* Bottom Navigation - fixed at bottom */}
      {!isAuthPage && <BottomNavigation />}
    </div>
  );
};
