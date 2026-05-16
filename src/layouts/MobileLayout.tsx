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

  // Auth pages need a natural-flow scrollable layout so the soft keyboard
  // can resize the viewport without clipping the form.
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <MobileHeader />
      <main className={cn(
        "flex-1 overflow-y-auto overscroll-contain scroll-container native-scroll",
        "pb-[calc(5rem+var(--safe-bottom))]"
      )}>
        <div className="min-h-full mobile-page-content">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};
