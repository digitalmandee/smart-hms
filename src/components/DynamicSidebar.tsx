import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  Receipt,
  BarChart3,
  Settings,
  Shield,
  UserPlus,
  CalendarDays,
  ClipboardList,
  ListOrdered,
  Package,
  AlertTriangle,
  FileText,
  FilePlus,
  CreditCard,
  DollarSign,
  Activity,
  UserCog,
  Building2,
  Palette,
  Building,
  Cog,
  TrendingUp,
  ChevronDown,
  LogOut,
  Heart,
  Menu,
  X,
  ConciergeBell,
  CalendarClock,
  CalendarPlus,
  HeartPulse,
  TestTube,
  FlaskConical,
  ListChecks,
  FileInput,
  FileSpreadsheet,
  Siren,
  Ambulance,
  Gauge,
  Monitor,
  Bed,
  Droplet,
  Scissors,
  TestTubes,
  Box,
  FolderTree,
  PackageCheck,
  Boxes,
  FileEdit,
  Warehouse,
  Store,
  Clock,
  Tags,
  Calculator,
  ListTree,
  BookOpen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  Receipt,
  BarChart3,
  Settings,
  Shield,
  UserPlus,
  CalendarDays,
  ClipboardList,
  ListOrdered,
  Package,
  AlertTriangle,
  FileText,
  FilePlus,
  CreditCard,
  DollarSign,
  Activity,
  UserCog,
  Building2,
  Palette,
  Building,
  Cog,
  TrendingUp,
  ConciergeBell,
  CalendarClock,
  CalendarPlus,
  HeartPulse,
  TestTube,
  FlaskConical,
  ListChecks,
  FileInput,
  FileSpreadsheet,
  Siren,
  Ambulance,
  Gauge,
  Monitor,
  Bed,
  Droplet,
  Scissors,
  TestTubes,
  Heart,
  Box,
  FolderTree,
  PackageCheck,
  Boxes,
  FileEdit,
  Warehouse,
  Store,
  Clock,
  Tags,
  Calculator,
  ListTree,
  BookOpen,
};

interface DynamicSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const DynamicSidebar = ({ isCollapsed = false, onToggle }: DynamicSidebarProps) => {
  const { menuItems, isLoading: menuLoading } = useMenuItems();
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (code: string) => {
    setOpenMenus((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const isActive = (path: string | null) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleNavigation = (path: string | null) => {
    if (path) {
      navigate(path);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground">HealthOS</span>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {menuLoading ? (
            <div className="space-y-2 px-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <>
          {menuItems.map((item) => {
            const IconComponent = item.icon ? iconMap[item.icon] : LayoutDashboard;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus.includes(item.code);
            const itemIsActive = isActive(item.path);

            if (hasChildren) {
              return (
                <Collapsible
                  key={item.id}
                  open={isOpen}
                  onOpenChange={() => toggleMenu(item.code)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isOpen && "rotate-180"
                            )}
                          />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  {!isCollapsed && (
                    <CollapsibleContent className="pl-4 space-y-1 mt-1">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon ? iconMap[child.icon] : null;
                        const childIsActive = isActive(child.path);

                        return (
                          <Button
                            key={child.id}
                            variant="ghost"
                            onClick={() => handleNavigation(child.path)}
                            className={cn(
                              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              childIsActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                          >
                            {ChildIcon && <ChildIcon className="h-4 w-4 flex-shrink-0" />}
                            <span>{child.name}</span>
                          </Button>
                        );
                      })}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            }

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center px-2",
                  itemIsActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
                {!isCollapsed && <span>{item.name}</span>}
              </Button>
            );
          })}
          </>
          )}
        </nav>
      </ScrollArea>

      {/* User Menu */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}
        >
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
              {profile?.full_name ? getInitials(profile.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profile?.email || ""}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};
