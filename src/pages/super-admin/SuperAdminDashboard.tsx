import { Building2, Users, GitBranch, UserPlus, Activity, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganizations, useOrganizationStats } from "@/hooks/useOrganizations";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useOrganizationStats();
  const { data: orgs, isLoading: orgsLoading } = useOrganizations();

  const recentOrgs = orgs?.slice(0, 5) || [];

  return (
    <div>
      <PageHeader
        title="Platform Dashboard"
        description="Overview of your Smart HMS platform"
        breadcrumbs={[{ label: "Super Admin" }, { label: "Dashboard" }]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Organizations"
              value={stats?.totalOrganizations || 0}
              icon={Building2}
              variant="primary"
              description={`${stats?.activeOrganizations || 0} active, ${stats?.trialOrganizations || 0} trial`}
            />
            <StatsCard
              title="Total Branches"
              value={stats?.totalBranches || 0}
              icon={GitBranch}
              variant="info"
            />
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={Users}
              variant="success"
            />
            <StatsCard
              title="Total Patients"
              value={stats?.totalPatients || 0}
              icon={UserPlus}
              variant="warning"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Organizations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Organizations</CardTitle>
            <Link to="/super-admin/organizations">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {orgsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : recentOrgs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No organizations yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrgs.map((org) => (
                  <Link
                    key={org.id}
                    to={`/super-admin/organizations/${org.id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">{org.email || org.phone || "No contact"}</p>
                    </div>
                    <StatusBadge status={org.subscription_status || "trial"} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/super-admin/organizations/new" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Building2 className="h-4 w-4" />
                Create New Organization
              </Button>
            </Link>
            <Link to="/super-admin/settings" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Activity className="h-4 w-4" />
                System Settings
              </Button>
            </Link>
            <Link to="/super-admin/users" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                View All Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats && stats.suspendedOrganizations > 0 ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium">Suspended Organizations</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.suspendedOrganizations} organization(s) are currently suspended
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No alerts at this time</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
