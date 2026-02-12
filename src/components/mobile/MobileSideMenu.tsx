import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Send,
  LogOut,
  Moon,
  ChevronDown,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useHaptics } from "@/hooks/useHaptics";
import { ROLE_LABELS } from "@/constants/roles";
import { ROLE_SIDEBAR_CONFIG, ADMIN_ROLES, getPrimaryRole, type SidebarMenuItem } from "@/config/role-sidebars";
import { useMenuItems } from "@/hooks/useMenuItems";
import { cn } from "@/lib/utils";

// Icon map matching DynamicSidebar
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
  Send,
};

interface MobileSideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MobileMenuItemProps {
  item: SidebarMenuItem;
  level?: number;
  onClose: () => void;
  isActive: (path: string) => boolean;
}

function MobileMenuItem({ item, level = 0, onClose, isActive }: MobileMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const haptics = useHaptics();
  
  const hasChildren = item.children && item.children.length > 0;
  const Icon = iconMap[item.icon] || LayoutDashboard;
  const paddingLeft = level === 0 ? "pl-3" : level === 1 ? "pl-8" : "pl-12";
  
  const handleClick = () => {
    haptics.light();
    if (!hasChildren) {
      onClose();
    }
  };

  const handleToggle = (open: boolean) => {
    haptics.light();
    setIsOpen(open);
  };

  // Parent item with children - collapsible
  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={handleToggle}>
        <CollapsibleTrigger className="w-full">
          <div className={cn(
            "flex items-center justify-between py-3 pr-3 touch-manipulation active:bg-muted/50 rounded-lg transition-colors",
            paddingLeft
          )}>
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm">{item.name}</span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5">
          {item.children!.map((child) => (
            <MobileMenuItem
              key={child.path || child.name}
              item={child}
              level={level + 1}
              onClose={onClose}
              isActive={isActive}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Leaf item - navigates directly
  const active = item.path ? isActive(item.path) : false;

  return (
    <Link 
      to={item.path || "#"} 
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 py-3 pr-3 touch-manipulation rounded-lg transition-colors",
        paddingLeft,
        active 
          ? "bg-primary/10 text-primary" 
          : "active:bg-muted/50 text-foreground"
      )}
    >
      <Icon className={cn(
        "h-5 w-5 shrink-0",
        active ? "text-primary" : "text-muted-foreground"
      )} />
      <span className={cn(
        "text-sm",
        active ? "font-semibold" : "font-medium"
      )}>
        {item.name}
      </span>
    </Link>
  );
}

export function MobileSideMenu({ open, onOpenChange }: MobileSideMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, roles, signOut, isSuperAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const haptics = useHaptics();

  // Database-driven menus for admin roles
  const { menuItems: dbMenuItems, isLoading: menuLoading } = useMenuItems();

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "U";

  // Determine role and sidebar type (mirrors DynamicSidebar logic)
  const primaryRole = getPrimaryRole(roles);
  
  // Super admin and org_admin use static configs; only branch_admin uses database menus
  const usesStaticSidebar = isSuperAdmin || primaryRole === 'super_admin' || primaryRole === 'org_admin';
  const usesDatabaseMenus = ADMIN_ROLES.includes(primaryRole) && !usesStaticSidebar;

  // Get menu items from appropriate source
  const menuItems = usesDatabaseMenus 
    ? dbMenuItems.map(item => ({
        name: item.name,
        path: item.path || '',
        icon: item.icon || 'LayoutDashboard',
        children: item.children?.map(child => ({
          name: child.name,
          path: child.path || '',
          icon: child.icon || 'List',
          children: child.children?.map(subChild => ({
            name: subChild.name,
            path: subChild.path || '',
            icon: subChild.icon || 'List',
          })),
        })),
      }))
    : (ROLE_SIDEBAR_CONFIG[primaryRole]?.items || ROLE_SIDEBAR_CONFIG.default?.items || []);
  
  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole as keyof typeof ROLE_LABELS] : "User";

  const isActive = (path: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleSignOut = async () => {
    haptics.medium();
    onOpenChange(false);
    await signOut();
    navigate("/auth/login", { replace: true });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleToggleDarkMode = (checked: boolean) => {
    haptics.light();
    setTheme(checked ? "dark" : "light");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[300px] p-0 flex flex-col"
        hideCloseButton
      >
        {/* Profile Header */}
        <SheetHeader className="p-4 pb-3 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={profile?.full_name || "User"}
              />
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold truncate text-left">
                {profile?.full_name || "User"}
              </SheetTitle>
              <p className="text-sm text-muted-foreground truncate">
                {roleLabel}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Dynamic Role-Based Menu */}
        <ScrollArea className="flex-1 px-2 py-3">
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <MobileMenuItem
                key={item.path || item.name}
                item={item}
                onClose={handleClose}
                isActive={isActive}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Footer - Dark Mode, Sign Out & Version */}
        <div className="border-t p-3 space-y-3">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm">Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={handleToggleDarkMode}
            />
          </div>

          <Separator />

          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            HealthOS 24 v2.0.0
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
