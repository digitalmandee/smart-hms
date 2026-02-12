import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  // HR icons
  UserCircle,
  Table2,
  Inbox,
  PlayCircle,
  BadgeCheck,
  Tag,
  CheckSquare,
  Fingerprint,
  Book,
  CalendarX,
  CalendarOff,
  Edit,
  ShieldCheck,
  Wallet,
  Syringe,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  // Added missing icons
  ArrowRightLeft,
  Banknote,
  BarChart,
  Bell,
  FileCode,
  FolderOpen,
  Footprints,
  HeartHandshake,
  Layers,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Network,
  PackagePlus,
  Radio,
  Server,
  Tv,
  ShoppingCart,
  RotateCcw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_SIDEBAR_CONFIG, getPrimaryRole } from "@/config/role-sidebars";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_ROLES = ["super_admin", "org_admin", "branch_admin"];

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
  // HR icons
  UserCircle,
  Table2,
  Inbox,
  PlayCircle,
  BadgeCheck,
  Tag,
  CheckSquare,
  Fingerprint,
  Book,
  CalendarX,
  CalendarOff,
  Edit,
  ShieldCheck,
  Wallet,
  Syringe,
  // Added missing icons
  ArrowRightLeft,
  Banknote,
  BarChart,
  Bell,
  FileCode,
  FolderOpen,
  Footprints,
  HeartHandshake,
  Layers,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Network,
  PackagePlus,
  Radio,
  Server,
  Tv,
  ShoppingCart,
  RotateCcw,
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
  badgeCounts?: Record<string, number>;
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
  badgeCounts = {},
}: RecursiveMenuItemProps) => {
  const IconComponent = item.icon ? iconMap[item.icon] : (level === 0 ? iconMap.LayoutDashboard : null);
  const hasChildren = item.children && item.children.length > 0;
  const menuCode = item.code || `menu-${level}-${index}`;
  const isOpen = openMenus.includes(menuCode);
  const itemIsActive = isActive(item.path);
  const badgeCount = item.path ? badgeCounts[item.path] : undefined;

  // Visual hierarchy based on level - using progressive indentation only
  const getLevelStyles = () => {
    const common = {
      iconSize: "h-4 w-4",
      textStyle: "font-medium text-sm",
      hoverBg: "hover:bg-sidebar-accent",
      activeBg: "bg-sidebar-accent",
    };

    switch (level) {
      case 0:
        return { ...common, padding: "pl-3" };
      case 1:
        return { ...common, padding: "pl-8" };
      case 2:
      default:
        return { ...common, padding: "pl-12" };
    }
  };

  const styles = getLevelStyles();

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
              "w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground",
              styles.hoverBg,
              styles.textStyle,
              isCollapsed && level === 0 && "justify-center px-2",
              styles.padding
            )}
            title={isCollapsed ? item.name : undefined}
          >
            {IconComponent && <IconComponent className={cn(styles.iconSize, "flex-shrink-0")} />}
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform opacity-60",
                    isOpen && "rotate-180"
                  )}
                />
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        {!isCollapsed && (
          <CollapsibleContent className="space-y-0.5 mt-0.5 relative z-10">
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
                badgeCounts={badgeCounts}
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
        "w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground relative z-10",
        styles.hoverBg,
        styles.textStyle,
        isCollapsed && level === 0 && "justify-center px-2",
        itemIsActive && cn(styles.activeBg, "text-sidebar-accent-foreground"),
        styles.padding
      )}
      title={isCollapsed ? item.name : undefined}
    >
      {IconComponent && <IconComponent className={cn(styles.iconSize, "flex-shrink-0")} />}
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left">{item.name}</span>
          {badgeCount !== undefined && badgeCount > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          )}
        </>
      )}
      {isCollapsed && badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
          {badgeCount > 9 ? "9+" : badgeCount}
        </span>
      )}
    </Button>
  );
};

export const DynamicSidebar = ({ isCollapsed = false, onToggle, showDesktopToggle = false }: DynamicSidebarProps) => {
  // Use database menu items for admin roles, static config for operational roles
  const { menuItems: dbMenuItems, isLoading: menuLoading } = useMenuItems();
  const { profile, roles, signOut, isSuperAdmin, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Determine role and sidebar type
  const primaryRole = getPrimaryRole(roles);
  
  // Super admin and org_admin use static configs; only branch_admin uses database menus
  const usesStaticSidebar = isSuperAdmin || primaryRole === 'super_admin' || primaryRole === 'org_admin';
  const usesDatabaseMenus = ADMIN_ROLES.includes(primaryRole) && !usesStaticSidebar;

  // Fetch pending admissions count for badge
  const { data: pendingAdmissionsCount = 0 } = useQuery({
    queryKey: ["pending-admissions-count", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return 0;
      const { count, error } = await supabase
        .from("admissions")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", profile.organization_id)
        .eq("status", "pending");
      if (error) return 0;
      return count || 0;
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Badge counts for specific menu paths
  const badgeCounts: Record<string, number> = {
    "/app/ipd/nursing": pendingAdmissionsCount,
  };

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
    // Use exact match to prevent multiple items highlighting
    return location.pathname === path;
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

  const isLoading = authLoading || (usesDatabaseMenus && menuLoading);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-sm font-bold text-sidebar-primary-foreground">24</span>
        </div>
        {!isCollapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground">HealthOS 24</span>
        )}
        
        {/* Mobile close button */}
        {onToggle && !showDesktopToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto text-white hover:bg-white/20 lg:hidden"
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
              "text-white hover:bg-white/20",
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
              badgeCounts={badgeCounts}
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