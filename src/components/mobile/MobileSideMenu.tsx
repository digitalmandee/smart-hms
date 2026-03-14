import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  ArrowDownToLine,
  MapPin,
  Map as MapIcon,
  Grid3x3,
  Truck,
  Webhook,
  Users2,
  LogOut,
  Moon,
  ChevronDown,
  CloudUpload,
  FileCheck,
  ScanBarcode,
  Smartphone,
  ShieldAlert,
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
import { filterSidebarByFacilityType } from "@/lib/facility-type-filter";
import { useMenuItems } from "@/hooks/useMenuItems";
import { cn } from "@/lib/utils";
import { SIDEBAR_NAME_TO_KEY } from "@/components/DynamicSidebar";
import type { TranslationKey } from "@/lib/i18n";

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
  ArrowDownToLine,
  MapPin,
  Map: MapIcon,
  Grid3x3,
  Truck,
  Webhook,
  Users2,
  CloudUpload,
  FileCheck,
  ScanBarcode,
  Smartphone,
  ShieldAlert,
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
  isRTL?: boolean;
}

function MobileMenuItem({ item, level = 0, onClose, isActive, isRTL = false }: MobileMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const haptics = useHaptics();
  const { t } = useTranslation();
  
  // Translate menu item name using the same map as DynamicSidebar
  const displayName = SIDEBAR_NAME_TO_KEY[item.name] 
    ? t(SIDEBAR_NAME_TO_KEY[item.name] as TranslationKey) 
    : item.name;
  
  const hasChildren = item.children && item.children.length > 0;
  const Icon = iconMap[item.icon] || LayoutDashboard;
  const paddingStart = level === 0 ? "ps-3" : level === 1 ? "ps-8" : "ps-12";
  
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
            "flex items-center justify-between py-3 pe-3 touch-manipulation active:bg-muted/50 rounded-lg transition-colors",
            paddingStart,
            isRTL && "flex-row-reverse"
          )}>
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm">{displayName}</span>
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
              isRTL={isRTL}
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
        "flex items-center gap-3 py-3 pe-3 touch-manipulation rounded-lg transition-colors",
        paddingStart,
        active 
          ? "bg-primary/10 text-primary" 
          : "active:bg-muted/50 text-foreground",
        isRTL && "flex-row-reverse"
      )}
    >
      <Icon className={cn(
        "h-5 w-5 shrink-0",
        active ? "text-primary" : "text-muted-foreground"
      )} />
      <span className={cn(
        "text-sm text-start flex-1",
        active ? "font-semibold" : "font-medium"
      )}>
        {displayName}
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
  const { t } = useTranslation();
  const isRTL = useIsRTL();

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

  // Fetch organization facility_type for sidebar filtering
  const { data: orgFacilityType } = useQuery({
    queryKey: ["org-facility-type", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      const { data } = await supabase
        .from("organizations")
        .select("facility_type")
        .eq("id", profile.organization_id)
        .single();
      return (data as any)?.facility_type as string | null;
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000,
  });

  // Get menu items from appropriate source, then filter by facility type
  const rawStaticItems = ROLE_SIDEBAR_CONFIG[primaryRole]?.items || ROLE_SIDEBAR_CONFIG.default?.items || [];
  const filteredStaticItems = orgFacilityType 
    ? filterSidebarByFacilityType(rawStaticItems, orgFacilityType) 
    : rawStaticItems;

  // Label overrides for DB menu items based on facility type
  const DB_LABEL_OVERRIDES: Record<string, Record<string, string>> = {
    warehouse: { inventory: "Warehouse" },
  };
  const applyMobileLabelOverrides = (items: typeof dbMenuItems): typeof dbMenuItems => {
    const overrides = orgFacilityType ? DB_LABEL_OVERRIDES[orgFacilityType] : null;
    if (!overrides) return items;
    return items.map(item => {
      const override = overrides[item.code?.toLowerCase() || ""];
      const newItem = override ? { ...item, name: override } : item;
      if (newItem.children && newItem.children.length > 0) {
        return { ...newItem, children: applyMobileLabelOverrides(newItem.children) };
      }
      return newItem;
    });
  };

  const menuItems = usesDatabaseMenus 
    ? applyMobileLabelOverrides(dbMenuItems).map(item => ({
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
    : filteredStaticItems;
  
  // Translate role label
  const ROLE_TO_TRANSLATION_KEY: Record<string, TranslationKey> = {
    super_admin: "role.superAdmin",
    org_admin: "role.orgAdmin",
    branch_admin: "role.branchAdmin",
    doctor: "role.doctor",
    surgeon: "role.surgeon",
    anesthetist: "role.anesthetist",
    nurse: "role.nurse",
    opd_nurse: "role.opdNurse",
    ipd_nurse: "role.ipdNurse",
    ot_nurse: "role.otNurse",
    receptionist: "role.receptionist",
    pharmacist: "role.pharmacist",
    ot_pharmacist: "role.otPharmacist",
    lab_technician: "role.labTechnician",
    radiologist: "role.radiologist",
    radiology_technician: "role.radiologyTechnician",
    blood_bank_technician: "role.bloodBankTechnician",
    accountant: "role.accountant",
    finance_manager: "role.financeManager",
    hr_manager: "role.hrManager",
    hr_officer: "role.hrOfficer",
    store_manager: "role.storeManager",
    ot_technician: "role.otTechnician",
  };
  const roleTranslationKey = primaryRole ? ROLE_TO_TRANSLATION_KEY[primaryRole] : undefined;
  const roleLabel = roleTranslationKey ? t(roleTranslationKey) : (primaryRole ? ROLE_LABELS[primaryRole as keyof typeof ROLE_LABELS] : "User");

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
        side={isRTL ? "right" : "left"}
        className="w-[300px] p-0 flex flex-col"
        hideCloseButton
        dir={isRTL ? "rtl" : "ltr"}
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
              <SheetTitle className="text-base font-semibold truncate text-start">
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
                isRTL={isRTL}
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
              <span className="font-medium text-sm">{t("common.darkMode")}</span>
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
            <LogOut className="h-4 w-4 me-2" />
            {t("common.signOut")}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            HealthOS 24 v2.0.0
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
