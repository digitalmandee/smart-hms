import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DynamicSidebar } from "@/components/DynamicSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Loader2 } from "lucide-react";
import { useMobileRedirect } from "@/hooks/useMobileRedirect";

export const DashboardLayout = () => {
  const { checked } = useMobileRedirect();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Show loading while checking if should redirect to mobile
  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

      {/* Mobile Sidebar */}
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