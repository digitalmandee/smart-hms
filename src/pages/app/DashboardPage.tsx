import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Stethoscope, Receipt, AlertTriangle, Loader2 } from "lucide-react";
import { CollectionsWidget } from "@/components/billing/CollectionsWidget";
import { PharmacyAlertsWidget } from "@/components/pharmacy/PharmacyAlertsWidget";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const { profile, roles } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statsConfig = [
    {
      title: "Total Patients",
      value: isLoading ? "-" : stats?.totalPatients.toLocaleString() || "0",
      change: isLoading ? "" : `+${stats?.newPatientsToday || 0} today`,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Today's Appointments",
      value: isLoading ? "-" : stats?.todayAppointments.toLocaleString() || "0",
      change: isLoading ? "" : `${stats?.pendingAppointments || 0} pending`,
      icon: Calendar,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Active Consultations",
      value: isLoading ? "-" : stats?.activeConsultations.toLocaleString() || "0",
      change: isLoading ? "" : `${stats?.queueCount || 0} in queue`,
      icon: Stethoscope,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Today's Revenue",
      value: isLoading ? "-" : formatCurrency(stats?.todayRevenue || 0),
      change: isLoading ? "" : "Live updates",
      icon: Receipt,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const quickActions = [
    { label: "New Patient", icon: Users, href: "/app/patients/new" },
    { label: "Schedule Appointment", icon: Calendar, href: "/app/appointments/new" },
    { label: "Today's Queue", icon: Stethoscope, href: "/app/appointments/queue" },
    { label: "Create Invoice", icon: Receipt, href: "/app/billing/invoices/new" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your clinic today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.title} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                {isLoading ? (
                  <Loader2 className={`h-4 w-4 ${stat.color} animate-spin`} />
                ) : (
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Collections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-md bg-primary/10">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
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
          <CardHeader>
            <CardTitle className="text-lg">Alerts & Notifications</CardTitle>
            <CardDescription>Important updates requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-md bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">No alerts</p>
                  <p className="text-xs text-muted-foreground">
                    You're all caught up!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Your Access</CardTitle>
          <CardDescription>Your current roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary font-medium"
                >
                  {role.replace("_", " ")}
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
