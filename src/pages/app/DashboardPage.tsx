import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, Stethoscope, Receipt, AlertTriangle, RefreshCw, Loader2, Sun, Moon, Sunrise, Sunset, TrendingUp } from "lucide-react";
import { CollectionsWidget } from "@/components/billing/CollectionsWidget";
import { PharmacyAlertsWidget } from "@/components/pharmacy/PharmacyAlertsWidget";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

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
};

// Roles that should stay on the generic dashboard
const ADMIN_ROLES = ["super_admin", "org_admin", "branch_admin"];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return { text: "Good Night", icon: Moon };
  if (hour < 12) return { text: "Good Morning", icon: Sunrise };
  if (hour < 17) return { text: "Good Afternoon", icon: Sun };
  if (hour < 21) return { text: "Good Evening", icon: Sunset };
  return { text: "Good Night", icon: Moon };
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { profile, roles, permissions, isLoading: authLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [waitingForRoles, setWaitingForRoles] = useState(true);
  const { data: stats, isLoading, isError, refetch, isFetching } = useDashboardStats();

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

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
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const firstName = (() => {
    if (!profile?.full_name) return "User";
    const parts = profile.full_name.trim().split(" ");
    if (parts.length === 1) return profile.full_name;
    return parts[0];
  })();

  const quickActions = [
    { label: "New Patient", icon: Users, href: "/app/patients/new", color: "bg-primary/10 text-primary" },
    { label: "Schedule Appointment", icon: Calendar, href: "/app/appointments/new", color: "bg-info/10 text-info" },
    { label: "Today's Queue", icon: Stethoscope, href: "/app/appointments/queue", color: "bg-success/10 text-success" },
    { label: "Create Invoice", icon: Receipt, href: "/app/billing/invoices/new", color: "bg-accent/10 text-accent" },
  ];

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
                {greeting.text}, {firstName}!
              </h1>
              <p className="text-muted-foreground animate-fade-in">
                {format(new Date(), "EEEE, MMMM d, yyyy")} • Here's what's happening today
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
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Failed to load dashboard statistics</p>
              <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid with Modern Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          change={stats?.newPatientsToday ? `+${stats.newPatientsToday} today` : undefined}
          icon={Users}
          variant="primary"
          loading={isLoading}
          onClick={() => navigate("/app/patients")}
        />
        <ModernStatsCard
          title="Today's Appointments"
          value={stats?.todayAppointments || 0}
          change={stats?.pendingAppointments ? `${stats.pendingAppointments} pending` : undefined}
          icon={Calendar}
          variant="info"
          loading={isLoading}
          onClick={() => navigate("/app/appointments")}
        />
        <ModernStatsCard
          title="Active Consultations"
          value={stats?.activeConsultations || 0}
          change={stats?.queueCount ? `${stats.queueCount} in queue` : undefined}
          icon={Stethoscope}
          variant="success"
          loading={isLoading}
          onClick={() => navigate("/app/appointments/queue")}
        />
        <ModernStatsCard
          title="Today's Revenue"
          value={formatCurrency(stats?.todayRevenue || 0)}
          change="Live updates"
          icon={TrendingUp}
          variant="accent"
          loading={isLoading}
          onClick={() => navigate("/app/billing")}
        />
      </div>

      {/* Quick Actions & Collections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
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

        {/* Collections Widget */}
        <CollectionsWidget />
      </div>

      {/* Pharmacy Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PharmacyAlertsWidget />

        {/* Alerts */}
        <Card className="shadow-soft">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="text-lg">Alerts & Notifications</CardTitle>
            <CardDescription>Important updates requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="p-2 rounded-lg bg-success/10">
                  <AlertTriangle className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground">
                    No pending alerts at the moment
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User Access Card */}
      <Card className="shadow-soft overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-lg">Your Access</CardTitle>
          <CardDescription>Your current roles and permissions</CardDescription>
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