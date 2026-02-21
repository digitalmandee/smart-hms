import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, Stethoscope, Receipt, AlertTriangle, RefreshCw, Loader2, Sun, Moon, Sunrise, Sunset, TrendingUp, Package, PackageCheck, ArrowLeftRight, Warehouse, ClipboardPen, BarChart3, FileInput, Truck } from "lucide-react";
import { CollectionsWidget } from "@/components/billing/CollectionsWidget";
import { PharmacyAlertsWidget } from "@/components/pharmacy/PharmacyAlertsWidget";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useInventoryDashboardStats } from "@/hooks/useInventory";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import { canViewFinancials } from "@/lib/permissions";
import { Database } from "@/integrations/supabase/types";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Role-based dashboard redirect mapping
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  doctor: "/app/opd",
  nurse: "/app/opd/nursing",
  receptionist: "/app/reception",
  pharmacist: "/app/pharmacy",
  lab_technician: "/app/lab",
  accountant: "/app/accounts",
  store_manager: "/app/inventory",
  hr_manager: "/app/hr",
  hr_officer: "/app/hr",
  finance_manager: "/app/accounts",
  blood_bank_technician: "/app/blood-bank",
  radiologist: "/app/radiology",
  radiology_technician: "/app/radiology/worklist",
  ipd_nurse: "/app/ipd/nursing",
  ot_technician: "/app/ot",
  warehouse_admin: "/app/inventory",
  warehouse_user: "/app/inventory",
};

// Roles that should stay on the generic dashboard
const ADMIN_ROLES = ["super_admin", "org_admin", "branch_admin"];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return { key: "dashboard.goodNight" as const, icon: Moon };
  if (hour < 12) return { key: "dashboard.goodMorning" as const, icon: Sunrise };
  if (hour < 17) return { key: "dashboard.goodAfternoon" as const, icon: Sun };
  if (hour < 21) return { key: "dashboard.goodEvening" as const, icon: Sunset };
  return { key: "dashboard.goodNight" as const, icon: Moon };
};

// Facility-specific quick actions
const warehouseQuickActions = [
  { label: "New GRN", icon: PackageCheck, href: "/app/inventory/grn/new", color: "bg-primary/10 text-primary" },
  { label: "Stock Levels", icon: Package, href: "/app/inventory/items", color: "bg-info/10 text-info" },
  { label: "Put-Away Tasks", icon: FileInput, href: "/app/inventory/putaway", color: "bg-success/10 text-success" },
  { label: "Shipping", icon: Truck, href: "/app/inventory/shipping", color: "bg-accent/10 text-accent" },
];

const pharmacyQuickActions = [
  { label: "POS Terminal", icon: Receipt, href: "/app/pharmacy/pos", color: "bg-primary/10 text-primary" },
  { label: "Stock Alerts", icon: AlertTriangle, href: "/app/pharmacy/alerts", color: "bg-info/10 text-info" },
  { label: "Purchase Orders", icon: ClipboardPen, href: "/app/inventory/purchase-orders", color: "bg-success/10 text-success" },
  { label: "Stock Transfers", icon: ArrowLeftRight, href: "/app/inventory/transfers", color: "bg-accent/10 text-accent" },
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { profile, roles, permissions, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [waitingForRoles, setWaitingForRoles] = useState(true);
  const { data: stats, isLoading, isError, refetch, isFetching } = useDashboardStats();

  // Fetch facility type for admin roles
  const { data: facilityType } = useQuery({
    queryKey: ["org-facility-type-dashboard", profile?.organization_id],
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
  });

  const isWarehouse = facilityType === "warehouse";
  const isPharmacyFacility = facilityType === "pharmacy";
  const isClinical = !isWarehouse && !isPharmacyFacility;

  // Inventory stats for warehouse/pharmacy dashboards
  const { data: inventoryStats, isLoading: invLoading } = useInventoryDashboardStats(undefined);

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const greetingText = t(greeting.key);
  
  // Check if user can view financial data
  type AppRole = Database["public"]["Enums"]["app_role"];
  const showFinancials = canViewFinancials(roles as AppRole[]);

  // Wait for BOTH roles AND permissions to be loaded before making redirect decisions
  useEffect(() => {
    if (!authLoading) {
      if (roles.length > 0 && permissions.length > 0) {
        setWaitingForRoles(false);
      } else if (profile && roles.length === 0) {
        const timeout = setTimeout(() => setWaitingForRoles(false), 500);
        return () => clearTimeout(timeout);
      } else if (profile && roles.length > 0 && permissions.length === 0) {
        const timeout = setTimeout(() => setWaitingForRoles(false), 800);
        return () => clearTimeout(timeout);
      }
    }
  }, [authLoading, roles, permissions, profile]);

  // Role-based redirect logic
  useEffect(() => {
    if (waitingForRoles || roles.length === 0) return;

    const hasAdminRole = roles.some(role => ADMIN_ROLES.includes(role));
    if (hasAdminRole) return;

    for (const role of roles) {
      const redirectPath = ROLE_DASHBOARD_MAP[role];
      if (redirectPath) {
        setIsRedirecting(true);
        navigate(redirectPath, { replace: true });
        return;
      }
    }
  }, [waitingForRoles, roles, navigate]);

  if (authLoading || waitingForRoles || isRedirecting) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Dashboard refreshed");
    } catch {
      toast.error("Failed to refresh dashboard");
    }
  };
  
  // Use centralized currency formatting
  const formatAmount = (amount: number) => formatCurrency(amount);

  const firstName = (() => {
    if (!profile?.full_name) return "User";
    const parts = profile.full_name.trim().split(" ");
    if (parts.length === 1) return profile.full_name;
    return parts[0];
  })();

  const clinicalQuickActions = [
    { label: t("dashboard.newPatient"), icon: Users, href: "/app/patients/new", color: "bg-primary/10 text-primary" },
    { label: t("dashboard.scheduleAppointment"), icon: Calendar, href: "/app/appointments/new", color: "bg-info/10 text-info" },
    { label: t("dashboard.todaysQueue"), icon: Stethoscope, href: "/app/appointments/queue", color: "bg-success/10 text-success" },
    { label: t("dashboard.createInvoice"), icon: Receipt, href: "/app/billing/invoices/new", color: "bg-accent/10 text-accent" },
  ];

  const quickActions = isWarehouse ? warehouseQuickActions : isPharmacyFacility ? pharmacyQuickActions : clinicalQuickActions;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 animate-fade-in">
              <GreetingIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground animate-fade-in">
                {greetingText}, {firstName}!
              </h1>
              <p className="text-muted-foreground animate-fade-in">
                {format(new Date(), "EEEE, MMMM d, yyyy")} • {t("dashboard.hereToday")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="gap-2 bg-background/50 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {t("dashboard.refresh")}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{t("dashboard.failedLoad")}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.tryRefreshing")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t("dashboard.retry")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid - Facility-type aware */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isWarehouse ? (
          <>
            <ModernStatsCard title="Total Items" value={inventoryStats?.totalItems || 0} icon={Package} variant="primary" loading={invLoading} onClick={() => navigate("/app/inventory/items")} />
            <ModernStatsCard title="Low Stock" value={inventoryStats?.lowStockCount || 0} icon={AlertTriangle} variant="info" loading={invLoading} onClick={() => navigate("/app/inventory/items")} />
            <ModernStatsCard title="Pending POs" value={inventoryStats?.pendingPOs || 0} icon={ClipboardPen} variant="success" loading={invLoading} onClick={() => navigate("/app/inventory/purchase-orders")} />
            <ModernStatsCard title="Stock Value" value={formatAmount(inventoryStats?.totalValue || 0)} icon={BarChart3} variant="accent" loading={invLoading} onClick={() => navigate("/app/inventory/reports")} />
          </>
        ) : isPharmacyFacility ? (
          <>
            <ModernStatsCard title="Total Items" value={inventoryStats?.totalItems || 0} icon={Package} variant="primary" loading={invLoading} onClick={() => navigate("/app/inventory/items")} />
            <ModernStatsCard title="Low Stock" value={inventoryStats?.lowStockCount || 0} icon={AlertTriangle} variant="info" loading={invLoading} onClick={() => navigate("/app/pharmacy/alerts")} />
            <ModernStatsCard title="Pending POs" value={inventoryStats?.pendingPOs || 0} icon={ClipboardPen} variant="success" loading={invLoading} onClick={() => navigate("/app/inventory/purchase-orders")} />
            <ModernStatsCard title="Stock Value" value={formatAmount(inventoryStats?.totalValue || 0)} icon={BarChart3} variant="accent" loading={invLoading} onClick={() => navigate("/app/inventory/reports")} />
          </>
        ) : (
          <>
            <ModernStatsCard
              title={t("dashboard.totalPatients")}
              value={stats?.totalPatients || 0}
              change={stats?.newPatientsToday ? `+${stats.newPatientsToday} ${t("common.newToday")}` : undefined}
              icon={Users}
              variant="primary"
              loading={isLoading}
              onClick={() => navigate("/app/patients")}
            />
            <ModernStatsCard
              title={t("dashboard.todayAppointments")}
              value={stats?.todayAppointments || 0}
              change={stats?.pendingAppointments ? `${stats.pendingAppointments} ${t("common.pending")}` : undefined}
              icon={Calendar}
              variant="info"
              loading={isLoading}
              onClick={() => navigate("/app/appointments")}
            />
            <ModernStatsCard
              title={t("dashboard.activeConsultations")}
              value={stats?.activeConsultations || 0}
              change={stats?.queueCount ? `${stats.queueCount} ${t("common.inQueue")}` : undefined}
              icon={Stethoscope}
              variant="success"
              loading={isLoading}
              onClick={() => navigate("/app/appointments/queue")}
            />
            {showFinancials && (
              <ModernStatsCard
                title={t("dashboard.todayRevenue")}
                value={formatAmount(stats?.todayRevenue || 0)}
                change={t("dashboard.liveUpdates")}
                icon={TrendingUp}
                variant="accent"
                loading={isLoading}
                onClick={() => navigate("/app/billing")}
              />
            )}
          </>
        )}
      </div>

      {/* Quick Actions & Collections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="text-lg">{t("dashboard.quickActions")}</CardTitle>
            <CardDescription>{isWarehouse ? "Warehouse operations" : isPharmacyFacility ? "Pharmacy operations" : t("dashboard.commonTasks")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`p-2.5 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-sm">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collections Widget - Only for clinical facility types */}
        {isClinical && showFinancials ? (
          <CollectionsWidget />
        ) : isClinical ? (
          <Card className="shadow-soft">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
              <CardTitle className="text-lg">{t("dashboard.clinicalSummary")}</CardTitle>
              <CardDescription>{t("dashboard.clinicalActivity")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Stethoscope className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("dashboard.focusPatientCare")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("dashboard.viewAppointments")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-soft">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
              <CardTitle className="text-lg">{isWarehouse ? "Warehouse Overview" : "Store Overview"}</CardTitle>
              <CardDescription>{isWarehouse ? "Logistics & fulfillment status" : "Retail & inventory status"}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Active Vendors</span>
                  </div>
                  <span className="text-sm font-semibold">{inventoryStats?.vendorCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2">
                    <FileInput className="h-4 w-4 text-info" />
                    <span className="text-sm font-medium">Pending Requisitions</span>
                  </div>
                  <span className="text-sm font-semibold">{inventoryStats?.pendingRequisitions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pharmacy Alerts - Only for clinical/pharmacy facility types */}
      {isClinical && (
        <div className="grid gap-6 lg:grid-cols-2">
          <PharmacyAlertsWidget />
          <Card className="shadow-soft">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
              <CardTitle className="text-lg">{t("dashboard.alertsNotifications")}</CardTitle>
              <CardDescription>{t("dashboard.importantUpdates")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="p-2 rounded-lg bg-success/10">
                    <AlertTriangle className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t("dashboard.allCaughtUp")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.noPendingAlerts")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* User Access Card */}
      <Card className="shadow-soft overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-lg">{t("dashboard.yourAccess")}</CardTitle>
          <CardDescription>{t("dashboard.yourRoles")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((role, idx) => (
                <span
                  key={role}
                  className="px-4 py-1.5 text-sm rounded-full bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-medium border border-primary/20 animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {role.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">
                No roles assigned yet. Contact your administrator.
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};