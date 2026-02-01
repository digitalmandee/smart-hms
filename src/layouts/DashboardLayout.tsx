import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DynamicSidebar } from "@/components/DynamicSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
import { MobileProvider } from "@/contexts/MobileContext";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { cn } from "@/lib/utils";

export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  
  // Detect if we should show mobile UI
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  // Mobile/Native Layout - Same routes, native feel
  if (showMobileUI) {
    return (
      <MobileProvider>
        <div className="flex flex-col h-screen bg-background overflow-hidden">
          {/* Mobile Header with safe area */}
          <MobileHeader />
          
          {/* Main Content - scrollable area */}
          <main className={cn(
            "flex-1 overflow-y-auto overscroll-contain scroll-container",
            "pb-20" // Space for bottom navigation
          )}>
            <div className="min-h-full mobile-page-content">
              <Outlet />
            </div>
          </main>
          
          {/* Bottom Navigation - fixed at bottom */}
          <BottomNavigation />
        </div>
      </MobileProvider>
    );
  }

  // Desktop Layout - Existing sidebar layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block relative">
        <DynamicSidebar 
          isCollapsed={isDesktopCollapsed} 
          onToggle={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          showDesktopToggle
        />
      </div>

      {/* Mobile Sidebar (for tablet/small desktop) */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64" hideCloseButton>
          <DynamicSidebar onToggle={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
