import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, Bed, Users, UserPlus, LogOut, ClipboardList,
  Plus, ArrowRight, Wallet, RefreshCw, Activity, Beaker, Calendar
} from "lucide-react";
import { useIPDStats } from "@/hooks/useIPD";
import { useAdmissions } from "@/hooks/useAdmissions";
import { usePendingRounds } from "@/hooks/useDailyRounds";
import { usePendingDischarges } from "@/hooks/useDischarge";
import { usePostTodayRoomCharges } from "@/hooks/useRoomChargeSync";
import { useIPDDashboardEnhancedStats } from "@/hooks/useIPDDashboardStats";
import { AdmissionCard } from "@/components/ipd/AdmissionCard";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { canViewFinancials } from "@/lib/permissions";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
import { MobileIPDDashboard } from "@/components/mobile/MobileIPDDashboard";
import { useQueryClient } from "@tanstack/react-query";

export default function IPDDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const roles = (profile as any)?.roles || [];
  const showFinancials = canViewFinancials(roles);
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;
  const queryClient = useQueryClient();

  const { data: stats, isLoading: loadingStats } = useIPDStats();
  const { data: recentAdmissions, isLoading: loadingAdmissions } = useAdmissions("admitted");
  const { data: pendingRounds, isLoading: loadingRounds } = usePendingRounds();
  const { data: pendingDischarges, isLoading: loadingDischarges } = usePendingDischarges();
  const { postCharges, isPosting } = usePostTodayRoomCharges();
  const { data: enhanced } = useIPDDashboardEnhancedStats();

  const firstName = profile?.full_name?.split(" ")[0] || "Doctor";

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['ipd-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['admissions'] }),
      queryClient.invalidateQueries({ queryKey: ['pending-rounds'] }),
      queryClient.invalidateQueries({ queryKey: ['pending-discharges'] }),
    ]);
  };

  // Mobile UI
  if (showMobileUI) {
    return (
      <MobileIPDDashboard
        stats={stats}
        pendingRounds={pendingRounds || []}
        pendingDischarges={pendingDischarges || []}
        recentAdmissions={recentAdmissions || []}
        isLoading={loadingStats || loadingAdmissions}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="IPD Dashboard"
        subtitle="Inpatient department overview and management"
        userName={firstName}
        showGreeting
        variant="gradient"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => postCharges()}
              disabled={isPosting}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isPosting ? 'animate-spin' : ''}`} />
              Post Room Charges
            </Button>
            <Button onClick={() => navigate("/app/ipd/admissions/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Admission
            </Button>
          </div>
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

      {/* Ward-wise Occupancy */}
      {enhanced?.wardOccupancy && enhanced.wardOccupancy.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Ward-wise Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {enhanced.wardOccupancy.map(ward => (
                <div key={ward.wardId} className="p-3 rounded-lg border bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{ward.wardName}</span>
                    <Badge variant={ward.occupancyPercent > 80 ? "destructive" : ward.occupancyPercent > 50 ? "default" : "secondary"}>
                      {ward.occupancyPercent}%
                    </Badge>
                  </div>
                  <Progress value={ward.occupancyPercent} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">{ward.occupiedBeds}/{ward.totalBeds} beds occupied</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical KPIs & Financial Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{enhanced?.avgLengthOfStay || 0} days</p>
            <p className="text-sm text-muted-foreground">Avg Length of Stay</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{enhanced?.todayProcedures || 0}</p>
            <p className="text-sm text-muted-foreground">Today's Procedures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Beaker className="h-8 w-8 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">{enhanced?.pendingLabResults || 0}</p>
            <p className="text-sm text-muted-foreground">Pending Lab Results</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary (finance roles only) */}
      {showFinancials && enhanced?.financialSummary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Active Admissions Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-success/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-xl font-bold text-success">₨ {enhanced.financialSummary.totalDeposits.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Charges</p>
                <p className="text-xl font-bold text-warning">₨ {enhanced.financialSummary.totalCharges.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold text-destructive">₨ {Math.max(0, enhanced.financialSummary.outstandingBalance).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discharge Pipeline */}
      {enhanced?.dischargePipeline && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <LogOut className="h-4 w-4 text-primary" />
              Discharge Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {enhanced.dischargePipeline.map(stage => (
                <div key={stage.stage} className="flex-1 min-w-[120px] p-4 rounded-lg border bg-card text-center">
                  <p className="text-2xl font-bold">{stage.count}</p>
                  <p className="text-sm text-muted-foreground">{stage.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
