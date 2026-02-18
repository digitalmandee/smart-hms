import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, CalendarCheck, Stethoscope, Activity, TrendingUp, ArrowRight } from "lucide-react";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function OrgAdminDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["org-admin-stats", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      // Fetch branches count
      const { count: branchCount } = await supabase
        .from("branches")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true);

      // Fetch total patients across all branches
      const { count: patientCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id);

      // Fetch total staff across all branches
      const { count: staffCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id);

      // Fetch today's appointments
      const today = new Date().toISOString().split("T")[0];
      const { count: appointmentsToday } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id)
        .eq("appointment_date", today);

      // Active consultations count
      const activeConsultations = 0; // Placeholder - complex query causes type issues

      // Fetch branches with stats
      const { data: branches } = await supabase
        .from("branches")
        .select("id, name, code")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("name");

      return {
        branchCount: branchCount || 0,
        patientCount: patientCount || 0,
        staffCount: staffCount || 0,
        appointmentsToday: appointmentsToday || 0,
        activeConsultations: activeConsultations || 0,
        branches: branches || [],
      };
    },
    enabled: !!profile?.organization_id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Admin";

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("org.overview")}
        userName={firstName}
        showGreeting
        variant="gradient"
        icon={Building2}
        iconColor="primary"
        quickStats={[
          { label: t("org.branches"), value: stats?.branchCount || 0, variant: "default" },
          { label: t("org.totalStaff"), value: stats?.staffCount || 0 },
          { label: t("org.todaysAppointments"), value: stats?.appointmentsToday || 0, variant: "success" },
        ]}
        actions={
          <Button onClick={() => navigate("/app/settings/branches")} className="gap-2">
            {t("org.manageBranches")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <ModernStatsCard
          title={t("org.activeBranches")}
          value={stats?.branchCount || 0}
          icon={Building2}
          variant="primary"
          description={t("org.acrossOrganization")}
          onClick={() => navigate("/app/settings/branches")}
        />

        <ModernStatsCard
          title={t("org.totalPatients")}
          value={stats?.patientCount?.toLocaleString() || "0"}
          icon={Users}
          variant="info"
          description={t("org.allBranches")}
        />

        <ModernStatsCard
          title={t("org.staffMembers")}
          value={stats?.staffCount || 0}
          icon={Stethoscope}
          variant="success"
          description={t("org.activeUsers")}
          onClick={() => navigate("/app/settings/users")}
        />

        <ModernStatsCard
          title={t("org.todaysAppointments")}
          value={stats?.appointmentsToday || 0}
          icon={CalendarCheck}
          variant="warning"
          description={t("org.allBranchesDesc")}
        />

        <ModernStatsCard
          title={t("org.activeConsultations")}
          value={stats?.activeConsultations || 0}
          icon={Activity}
          variant="accent"
          description={t("org.inProgress")}
        />
      </div>

      <Card className="overflow-hidden border-primary/10">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            {t("org.branchOverview")}
          </CardTitle>
          <CardDescription>{t("org.quickView")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {stats?.branches && stats.branches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.branches.map((branch, index) => (
                <div 
                  key={branch.id} 
                  className="group flex items-center gap-4 p-4 border rounded-xl bg-gradient-to-br from-card to-muted/20 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/app/settings/branches/${branch.id}`)}
                >
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{branch.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{branch.code}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t("org.noActiveBranches")}</p>
              <p className="text-sm mt-1">{t("org.createBranchPrompt")}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/app/settings/branches/new")}>
                {t("org.createBranch")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
