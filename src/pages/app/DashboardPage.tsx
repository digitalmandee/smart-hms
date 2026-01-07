import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Stethoscope, Receipt, TrendingUp, Activity, Clock, AlertTriangle } from "lucide-react";

export const DashboardPage = () => {
  const { profile, roles } = useAuth();

  const stats = [
    {
      title: "Total Patients",
      value: "0",
      change: "+0 today",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Today's Appointments",
      value: "0",
      change: "0 pending",
      icon: Calendar,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Active Consultations",
      value: "0",
      change: "0 in queue",
      icon: Stethoscope,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Today's Revenue",
      value: "PKR 0",
      change: "+0% from yesterday",
      icon: Receipt,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const quickActions = [
    { label: "New Patient", icon: Users, href: "/app/patients/new" },
    { label: "Schedule Appointment", icon: Calendar, href: "/app/appointments/schedule" },
    { label: "Today's Queue", icon: Clock, href: "/app/appointments/queue" },
    { label: "Create Invoice", icon: Receipt, href: "/app/billing/new" },
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
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Alerts */}
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
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-md bg-primary/10">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

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

      {/* Role Info (for testing) */}
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
