import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ROLE_SIDEBAR_CONFIG, ADMIN_ROLES, getPrimaryRole, SidebarMenuItem } from "@/config/role-sidebars";
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
  Ticket,
  PiggyBank,
  Folders,
  BedDouble,
  Scan,
  Landmark,
  PieChart,
  Search,
  UserCheck,
  Camera,
  Scale,
  ArrowLeftRight,
  ClipboardCheck,
  PanelLeftClose,
  PanelLeft,
  Briefcase,
  Gift,
  CalendarCheck,
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
  Ticket,
  PiggyBank,
  Folders,
  BedDouble,
  Scan,
  Landmark,
  PieChart,
  Search,
  UserCheck,
  Camera,
  Scale,
  ArrowLeftRight,
  ClipboardCheck,
  Briefcase,
  Gift,
  CalendarCheck,
};

interface DynamicSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  showDesktopToggle?: boolean;
}

export const DynamicSidebar = ({ isCollapsed = false, onToggle, showDesktopToggle = false }: DynamicSidebarProps) => {
  // Use database menu items for admin roles, static config for operational roles
  const { menuItems: dbMenuItems, isLoading: menuLoading } = useMenuItems();
  const { profile, roles, signOut, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Determine if user is an admin (uses dynamic database menus)
  const primaryRole = getPrimaryRole(roles);
  const isAdminRole = ADMIN_ROLES.includes(primaryRole) || isSuperAdmin;

  // Get sidebar config based on role
  const sidebarConfig = isAdminRole 
    ? null // Admin uses database menu items
    : (ROLE_SIDEBAR_CONFIG[primaryRole] || ROLE_SIDEBAR_CONFIG.default);

  // Convert static config to menu items format for rendering
  const menuItems = isAdminRole 
    ? dbMenuItems 
    : (sidebarConfig?.items.map((item, index) => ({
        id: `role-menu-${index}`,
        code: item.path || `menu-${index}`,
        name: item.name,
        icon: item.icon,
        path: item.path || null,
        children: item.children?.map((child, childIndex) => ({
          id: `role-menu-${index}-${childIndex}`,
          code: child.path,
          name: child.name,
          icon: child.icon,
          path: child.path,
          children: [],
        })) || [],
      })) || []);

  // Auto-expand parent menu based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const menusToOpen: string[] = [];
    
    menuItems.forEach((item, index) => {
      const menuCode = item.code || `menu-${index}`;
      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some(child => 
          child.path && (currentPath === child.path || currentPath.startsWith(child.path + "/"))
        );
        if (hasActiveChild) {
          menusToOpen.push(menuCode);
        }
      }
    });
    
    if (menusToOpen.length > 0) {
      setOpenMenus(prev => {
        const currentSet = new Set(prev);
        const hasNew = menusToOpen.some(code => !currentSet.has(code));
        if (!hasNew) return prev;
        return [...new Set([...prev, ...menusToOpen])];
      });
    }
  }, [location.pathname, menuItems]);

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

  const isLoading = isAdminRole && menuLoading;

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
        
        {/* Mobile close button */}
        {onToggle && !showDesktopToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        {/* Desktop collapse toggle */}
        {showDesktopToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent",
              isCollapsed ? "mx-auto" : "ml-auto"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {isLoading ? (
            <div className="space-y-2 px-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon ? iconMap[item.icon] : LayoutDashboard;
            const hasChildren = item.children && item.children.length > 0;
            const menuCode = item.code || `menu-${index}`;
            const isOpen = openMenus.includes(menuCode);
            const itemIsActive = isActive(item.path);

            if (hasChildren) {
              return (
                <Collapsible
                  key={item.id}
                  open={isOpen}
                  onOpenChange={() => toggleMenu(menuCode)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                      title={isCollapsed ? item.name : undefined}
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
                title={isCollapsed ? item.name : undefined}
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
        {/* Collapsed sign out */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
};