import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, Bed, Users, UserPlus, LogOut, ClipboardList,
  Plus, ArrowRight, ArrowLeft, Wallet, RefreshCw, Activity, Beaker, Calendar
} from "lucide-react";
import { useIPDStats } from "@/hooks/useIPD";
import { useRecentAdmissions } from "@/hooks/useAdmissions";
import { usePendingRounds } from "@/hooks/useDailyRounds";
import { usePendingDischarges } from "@/hooks/useDischarge";
import { usePostTodayRoomCharges } from "@/hooks/useRoomChargeSync";
import { useIPDDashboardEnhancedStats } from "@/hooks/useIPDDashboardStats";
import { AdmissionCard } from "@/components/ipd/AdmissionCard";
import { format } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { canViewFinancials } from "@/lib/permissions";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
import { MobileIPDDashboard } from "@/components/mobile/MobileIPDDashboard";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";


export default function IPDDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const roles = (profile as any)?.roles || [];
  const showFinancials = canViewFinancials(roles);
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const { default_language } = useCountryConfig();
  const dateLocale = default_language === "ar" || default_language === "ur" ? arLocale : enUS;

  const { data: stats, isLoading: loadingStats } = useIPDStats();
  const { data: recentAdmissions, isLoading: loadingAdmissions } = useRecentAdmissions(6);
  const { data: pendingRounds, isLoading: loadingRounds } = usePendingRounds();
  const { data: pendingDischarges, isLoading: loadingDischarges } = usePendingDischarges();
  const { postCharges, isPosting } = usePostTodayRoomCharges();
  const { data: enhanced } = useIPDDashboardEnhancedStats();

  const firstName = profile?.full_name?.split(" ")[0] || "Doctor";

  // Realtime subscription for admissions
  useEffect(() => {
    if (!profile?.organization_id) return;

    const channel = supabase
      .channel('ipd-dashboard-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admissions',
        filter: `organization_id=eq.${profile.organization_id}`,
      }, (payload: any) => {
        // Show toast for new admission
        const newRecord = payload.new;
        sonnerToast.info(t("ipd.newAdmissionAlert"), {
          description: `${newRecord.admission_number}`,
        });
        queryClient.invalidateQueries({ queryKey: ['admissions'] });
        queryClient.invalidateQueries({ queryKey: ['ipd-stats'] });
        queryClient.invalidateQueries({ queryKey: ['pending-rounds'] });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'admissions',
        filter: `organization_id=eq.${profile.organization_id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['admissions'] });
        queryClient.invalidateQueries({ queryKey: ['ipd-stats'] });
        queryClient.invalidateQueries({ queryKey: ['pending-rounds'] });
        queryClient.invalidateQueries({ queryKey: ['pending-discharges'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id, queryClient, t]);

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
        title={t("ipd.dashboard")}
        subtitle={t("ipd.subtitle")}
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
              <RefreshCw className={`h-4 w-4 me-2 ${isPosting ? 'animate-spin' : ''}`} />
              {t("ipd.postRoomCharges")}
            </Button>
            <Button onClick={() => navigate("/app/ipd/admissions/new")}>
              <Plus className="h-4 w-4 me-2" />
              {t("ipd.newAdmission")}
            </Button>
          </div>
        }
        quickStats={[
          { label: t("common.active"), value: stats?.activeAdmissions || 0, variant: "success" },
          { label: t("ipd.pendingRounds"), value: pendingRounds?.length || 0, variant: "warning" },
          { label: t("ipd.discharge"), value: pendingDischarges?.length || 0 },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title={t("ipd.totalWards")}
          value={stats?.totalWards || 0}
          icon={Building2}
          description={t("ipd.activeWards")}
          variant="primary"
          delay={0}
        />
        <ModernStatsCard
          title={t("ipd.bedOccupancy")}
          value={`${stats?.occupiedBeds || 0}/${stats?.totalBeds || 0}`}
          icon={Bed}
          description={`${stats?.availableBeds || 0} ${t("ipd.available")}`}
          variant="info"
          delay={100}
        />
        <ModernStatsCard
          title={t("ipd.activePatients")}
          value={stats?.activeAdmissions || 0}
          icon={Users}
          description={t("ipd.currentlyAdmitted")}
          variant="success"
          delay={200}
        />
        <ModernStatsCard
          title={t("ipd.todayActivity")}
          value={`+${stats?.todayAdmissions || 0} / -${stats?.todayDischarges || 0}`}
          icon={UserPlus}
          description={t("ipd.admissionsDischarges")}
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
              {t("ipd.pendingRounds")}
            </CardTitle>
            <Badge variant="outline">{pendingRounds?.length || 0}</Badge>
          </CardHeader>
          <CardContent>
            {loadingRounds ? (
              <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
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
                      <span className="text-muted-foreground ms-2">
                        {t("ipd.bed")} {adm.bed?.bed_number}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/ipd/rounds/${adm.id}`)}
                    >
                      {t("ipd.start")}
                    </Button>
                  </div>
                ))}
                {pendingRounds.length > 5 && (
                  <Button
                    variant="link"
                    className="w-full"
                    onClick={() => navigate("/app/ipd/rounds")}
                  >
                    {t("ipd.viewAllPending")} ({pendingRounds.length})
                    {isRTL ? <ArrowLeft className="h-4 w-4 ms-1" /> : <ArrowRight className="h-4 w-4 ms-1" />}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                {t("ipd.allRoundsComplete")}
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
              {t("ipd.pendingDischarges")}
            </CardTitle>
            <Badge variant="outline" className="bg-warning/10 text-warning">
              {pendingDischarges?.length || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            {loadingDischarges ? (
              <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
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
                      <span className="text-muted-foreground ms-2">
                        {t("ipd.expected")}: {format(new Date(adm.expected_discharge_date), "dd MMM", { locale: dateLocale })}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/ipd/discharge/${adm.id}`)}
                    >
                      {t("ipd.discharge")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                {t("ipd.noPendingDischarges")}
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
              {t("ipd.wardOccupancy")}
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
                  <p className="text-xs text-muted-foreground">{ward.occupiedBeds}/{ward.totalBeds} {t("ipd.bedsOccupied")}</p>
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
            <p className="text-2xl font-bold">{enhanced?.avgLengthOfStay || 0} {t("ipd.days")}</p>
            <p className="text-sm text-muted-foreground">{t("ipd.avgLOS")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{enhanced?.todayProcedures || 0}</p>
            <p className="text-sm text-muted-foreground">{t("ipd.todayProcedures")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Beaker className="h-8 w-8 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">{enhanced?.pendingLabResults || 0}</p>
            <p className="text-sm text-muted-foreground">{t("ipd.pendingLabResults")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary (finance roles only) */}
      {showFinancials && enhanced?.financialSummary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              {t("ipd.financialSummary")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-success/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">{t("ipd.totalDeposits")}</p>
                <p className="text-xl font-bold text-success">₨ {enhanced.financialSummary.totalDeposits.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">{t("ipd.totalCharges")}</p>
                <p className="text-xl font-bold text-warning">₨ {enhanced.financialSummary.totalCharges.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">{t("ipd.outstandingBalance")}</p>
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
              {t("ipd.dischargePipeline")}
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
            <span className="font-medium">{t("ipd.wards")}</span>
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
            <span className="font-medium">{t("ipd.bedMap")}</span>
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
            <span className="font-medium">{t("ipd.admissions")}</span>
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
            <span className="font-medium">{t("ipd.ipdBilling")}</span>
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
            <span className="font-medium">{t("ipd.nursingStation")}</span>
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
            {t("ipd.recentAdmissions")}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/ipd/admissions")}>
            {t("common.viewAll")} {isRTL ? <ArrowLeft className="h-4 w-4 ms-1" /> : <ArrowRight className="h-4 w-4 ms-1" />}
          </Button>
        </CardHeader>
        <CardContent>
          {loadingAdmissions ? (
            <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
          ) : recentAdmissions && recentAdmissions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentAdmissions.slice(0, 6).map((admission: any) => (
                <AdmissionCard
                  key={admission.id}
                  admission={admission}
                  onView={(id) => navigate(`/app/ipd/admissions/${id}`)}
                  onRounds={(id) => navigate(`/app/ipd/rounds/${id}`)}
                  onDischarge={(id) => navigate(`/app/ipd/discharge/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.noData")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
