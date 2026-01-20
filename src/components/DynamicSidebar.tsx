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
  Apple,
  Sparkles,
  History,
  DoorOpen,
  GitBranch,
  Puzzle,
  ScrollText,
  Headphones,
  List,
  Percent,
  Award,
  GraduationCap,
  UtensilsCrossed,
  Plus,
  Settings2,
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
  Apple,
  Sparkles,
  History,
  GitBranch,
  Puzzle,
  ScrollText,
  Headphones,
  List,
  Percent,
  Award,
  GraduationCap,
  DoorOpen,
  UtensilsCrossed,
  Plus,
  Settings2,
};

interface DynamicSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  showDesktopToggle?: boolean;
}

// Recursive menu item component for 3-level nesting support
interface RecursiveMenuItemProps {
  item: {
    id: string;
    code: string;
    name: string;
    icon?: string;
    path: string | null;
    children?: RecursiveMenuItemProps['item'][];
  };
  level: number;
  index: number;
  isCollapsed: boolean;
  openMenus: string[];
  toggleMenu: (code: string) => void;
  isActive: (path: string | null) => boolean;
  handleNavigation: (path: string | null) => void;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
}

const RecursiveMenuItem = ({
  item,
  level,
  index,
  isCollapsed,
  openMenus,
  toggleMenu,
  isActive,
  handleNavigation,
  iconMap,
}: RecursiveMenuItemProps) => {
  const IconComponent = item.icon ? iconMap[item.icon] : (level === 0 ? iconMap.LayoutDashboard : null);
  const hasChildren = item.children && item.children.length > 0;
  const menuCode = item.code || `menu-${level}-${index}`;
  const isOpen = openMenus.includes(menuCode);
  const itemIsActive = isActive(item.path);

  // Indentation based on level
  const paddingLeft = level === 0 ? "" : level === 1 ? "pl-4" : "pl-8";
  const iconSize = level === 0 ? "h-5 w-5" : "h-4 w-4";

  if (hasChildren) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={() => toggleMenu(menuCode)}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed && level === 0 && "justify-center px-2",
              paddingLeft
            )}
            title={isCollapsed ? item.name : undefined}
          >
            {IconComponent && <IconComponent className={cn(iconSize, "flex-shrink-0")} />}
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
          <CollapsibleContent className="space-y-1 mt-1">
            {item.children?.map((child, childIndex) => (
              <RecursiveMenuItem
                key={child.id}
                item={child}
                level={level + 1}
                index={childIndex}
                isCollapsed={isCollapsed}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
                isActive={isActive}
                handleNavigation={handleNavigation}
                iconMap={iconMap}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={() => handleNavigation(item.path)}
      className={cn(
        "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isCollapsed && level === 0 && "justify-center px-2",
        itemIsActive && "bg-sidebar-accent text-sidebar-accent-foreground",
        paddingLeft
      )}
      title={isCollapsed ? item.name : undefined}
    >
      {IconComponent && <IconComponent className={cn(iconSize, "flex-shrink-0")} />}
      {!isCollapsed && <span>{item.name}</span>}
    </Button>
  );
};

export const DynamicSidebar = ({ isCollapsed = false, onToggle, showDesktopToggle = false }: DynamicSidebarProps) => {
  // Use database menu items for admin roles, static config for operational roles
  const { menuItems: dbMenuItems, isLoading: menuLoading } = useMenuItems();
  const { profile, roles, signOut, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Determine role and sidebar type
  const primaryRole = getPrimaryRole(roles);
  
  // Super admin and org_admin use static configs; only branch_admin uses database menus
  const usesStaticSidebar = isSuperAdmin || primaryRole === 'super_admin' || primaryRole === 'org_admin';
  const usesDatabaseMenus = ADMIN_ROLES.includes(primaryRole) && !usesStaticSidebar;

  // Get sidebar config based on role
  const sidebarConfig = usesDatabaseMenus 
    ? null // Only branch_admin uses database menu items
    : (ROLE_SIDEBAR_CONFIG[primaryRole] || ROLE_SIDEBAR_CONFIG.default);

  // Convert static config to menu items format for rendering
  const menuItems = usesDatabaseMenus 
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

  // Recursively find all parent menus that should be expanded for current route
  const findMenusToExpand = (items: typeof menuItems, currentPath: string): string[] => {
    const menusToOpen: string[] = [];
    
    const checkItem = (item: typeof menuItems[0], parentCodes: string[] = []): boolean => {
      const itemCode = item.code || item.id;
      
      // Check if this item matches current path
      if (item.path && (currentPath === item.path || currentPath.startsWith(item.path + "/"))) {
        menusToOpen.push(...parentCodes);
        return true;
      }
      
      // Check children recursively
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          if (checkItem(child, [...parentCodes, itemCode])) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    items.forEach(item => checkItem(item));
    return menusToOpen;
  };

  // Auto-expand parent menus based on current route
  useEffect(() => {
    const menusToOpen = findMenusToExpand(menuItems, location.pathname);
    
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

  const isLoading = usesDatabaseMenus && menuLoading;

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
          {menuItems.map((item, index) => (
            <RecursiveMenuItem
              key={item.id}
              item={item}
              level={0}
              index={index}
              isCollapsed={isCollapsed}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              isActive={isActive}
              handleNavigation={handleNavigation}
              iconMap={iconMap}
            />
          ))}
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