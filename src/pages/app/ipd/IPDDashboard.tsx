import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Bed, 
  Users, 
  UserPlus, 
  LogOut,
  ClipboardList,
  Plus,
  ArrowRight,
  Wallet
} from "lucide-react";
import { useIPDStats } from "@/hooks/useIPD";
import { useAdmissions } from "@/hooks/useAdmissions";
import { usePendingRounds } from "@/hooks/useDailyRounds";
import { usePendingDischarges } from "@/hooks/useDischarge";
import { AdmissionCard } from "@/components/ipd/AdmissionCard";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function IPDDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading: loadingStats } = useIPDStats();
  const { data: recentAdmissions, isLoading: loadingAdmissions } = useAdmissions("admitted");
  const { data: pendingRounds, isLoading: loadingRounds } = usePendingRounds();
  const { data: pendingDischarges, isLoading: loadingDischarges } = usePendingDischarges();

  const firstName = profile?.full_name?.split(" ")[0] || "Doctor";

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="IPD Dashboard"
        subtitle="Inpatient department overview and management"
        userName={firstName}
        showGreeting
        variant="gradient"
        actions={
          <Button onClick={() => navigate("/app/ipd/admissions/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Admission
          </Button>
        }
        quickStats={[
          { label: "Active", value: stats?.activeAdmissions || 0, variant: "success" },
          { label: "Pending Rounds", value: pendingRounds?.length || 0, variant: "warning" },
          { label: "Discharges", value: pendingDischarges?.length || 0 },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title="Total Wards"
          value={stats?.totalWards || 0}
          icon={Building2}
          description="Active wards"
          variant="primary"
          delay={0}
        />
        <ModernStatsCard
          title="Bed Occupancy"
          value={`${stats?.occupiedBeds || 0}/${stats?.totalBeds || 0}`}
          icon={Bed}
          description={`${stats?.availableBeds || 0} available`}
          variant="info"
          delay={100}
        />
        <ModernStatsCard
          title="Active Patients"
          value={stats?.activeAdmissions || 0}
          icon={Users}
          description="Currently admitted"
          variant="success"
          delay={200}
        />
        <ModernStatsCard
          title="Today's Activity"
          value={`+${stats?.todayAdmissions || 0} / -${stats?.todayDischarges || 0}`}
          icon={UserPlus}
          description="Admissions / Discharges"
          variant="warning"
          delay={300}
        />
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Rounds */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              Pending Rounds
            </CardTitle>
            <Badge variant="outline">{pendingRounds?.length || 0}</Badge>
          </CardHeader>
          <CardContent>
            {loadingRounds ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : pendingRounds && pendingRounds.length > 0 ? (
              <div className="space-y-2">
                {pendingRounds.slice(0, 5).map((adm: any) => (
                  <div
                    key={adm.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {adm.patient?.first_name} {adm.patient?.last_name}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        Bed {adm.bed?.bed_number}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/ipd/rounds/${adm.id}`)}
                    >
                      Start
                    </Button>
                  </div>
                ))}
                {pendingRounds.length > 5 && (
                  <Button
                    variant="link"
                    className="w-full"
                    onClick={() => navigate("/app/ipd/rounds")}
                  >
                    View all {pendingRounds.length} pending
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                All rounds completed for today
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Discharges */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <LogOut className="h-4 w-4 text-warning" />
              </div>
              Pending Discharges
            </CardTitle>
            <Badge variant="outline" className="bg-warning/10 text-warning">
              {pendingDischarges?.length || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            {loadingDischarges ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : pendingDischarges && pendingDischarges.length > 0 ? (
              <div className="space-y-2">
                {pendingDischarges.slice(0, 5).map((adm: any) => (
                  <div
                    key={adm.id}
                    className="flex items-center justify-between p-2 bg-warning/5 rounded-lg text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {adm.patient?.first_name} {adm.patient?.last_name}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        Expected: {format(new Date(adm.expected_discharge_date), "dd MMM")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/ipd/discharge/${adm.id}`)}
                    >
                      Discharge
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No pending discharges
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
          onClick={() => navigate("/app/ipd/wards")}
        >
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="font-medium">Wards</span>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
          onClick={() => navigate("/app/ipd/beds")}
        >
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-info to-info/80 text-info-foreground shadow-lg shadow-info/30 group-hover:scale-110 transition-transform">
              <Bed className="h-6 w-6" />
            </div>
            <span className="font-medium">Bed Map</span>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
          onClick={() => navigate("/app/ipd/admissions")}
        >
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-lg shadow-success/30 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <span className="font-medium">Admissions</span>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
          onClick={() => navigate("/app/ipd/billing")}
        >
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-lg shadow-success/30 group-hover:scale-110 transition-transform">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="font-medium">IPD Billing</span>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
          onClick={() => navigate("/app/ipd/nursing")}
        >
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning to-warning/80 text-warning-foreground shadow-lg shadow-warning/30 group-hover:scale-110 transition-transform">
              <ClipboardList className="h-6 w-6" />
            </div>
            <span className="font-medium">Nursing Station</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admissions */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <UserPlus className="h-4 w-4 text-success" />
            </div>
            Recent Admissions
          </CardTitle>
          <Button variant="link" onClick={() => navigate("/app/ipd/admissions")}>
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingAdmissions ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : recentAdmissions && recentAdmissions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentAdmissions.slice(0, 6).map((admission: any) => (
                <AdmissionCard
                  key={admission.id}
                  admission={admission}
                  compact
                  onView={(id) => navigate(`/app/ipd/admissions/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No active admissions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
