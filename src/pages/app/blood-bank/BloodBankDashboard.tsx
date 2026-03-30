import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Heart, Package, FileText, Activity, AlertTriangle,
  Plus, ArrowRight, Droplets, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  useBloodBankStats, 
  useTodaysDonations, 
  usePendingRequests,
  useActiveTransfusions 
} from "@/hooks/useBloodBank";
import { BloodStockWidget } from "@/components/blood-bank/BloodStockWidget";
import { RequestCard } from "@/components/blood-bank/RequestCard";
import { DonationStatusBadge } from "@/components/blood-bank/DonationStatusBadge";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { ExpiryAlertBanner } from "@/components/blood-bank/ExpiryAlertBanner";

import { useTranslation } from "@/lib/i18n";

export default function BloodBankDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useBloodBankStats();
  const { data: todaysDonations, isLoading: donationsLoading } = useTodaysDonations();
  const { data: pendingRequests, isLoading: requestsLoading } = usePendingRequests();
  const { data: activeTransfusions, isLoading: transfusionsLoading } = useActiveTransfusions();

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("bloodBank.title" as any)}
        subtitle={t("bloodBank.subtitle" as any)}
        icon={Droplets}
        iconColor="text-destructive"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/app/blood-bank/donors/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("bloodBank.registerDonor" as any)}
            </Button>
            <Button onClick={() => navigate('/app/blood-bank/donations')} className="gap-2 bg-destructive hover:bg-destructive/90">
              <Heart className="h-4 w-4" />
              {t("bloodBank.startDonation" as any)}
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/blood-bank/analytics')} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("bloodBank.analytics" as any)}
            </Button>
          </div>
        }
      />

      {/* Expiry Alert Banner */}
      <ExpiryAlertBanner />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statsLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <ModernStatsCard
              title="Active Donors"
              value={stats?.totalDonors || 0}
              icon={Users}
              variant="primary"
              onClick={() => navigate('/app/blood-bank/donors')}
            />
            <ModernStatsCard
              title="Today's Donations"
              value={stats?.todaysDonations || 0}
              icon={Heart}
              variant="accent"
              onClick={() => navigate('/app/blood-bank/donations')}
            />
            <ModernStatsCard
              title="Available Units"
              value={stats?.availableUnits || 0}
              icon={Package}
              variant="success"
              onClick={() => navigate('/app/blood-bank/inventory')}
            />
            <ModernStatsCard
              title="Pending Requests"
              value={stats?.pendingRequests || 0}
              icon={FileText}
              variant="warning"
              onClick={() => navigate('/app/blood-bank/requests')}
            />
            <ModernStatsCard
              title="Active Transfusions"
              value={stats?.activeTransfusions || 0}
              icon={Activity}
              variant="info"
              onClick={() => navigate('/app/blood-bank/transfusions')}
            />
            <ModernStatsCard
              title="Expiring Soon"
              value={stats?.expiringUnits || 0}
              change="Within 7 days"
              icon={AlertTriangle}
              variant="warning"
              onClick={() => navigate('/app/blood-bank/inventory?expiring=true')}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Blood Stock Overview */}
        <BloodStockWidget />

        {/* Today's Donations */}
        <Card className="lg:col-span-2 shadow-soft overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-destructive/5 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-destructive/10">
                <Heart className="h-4 w-4 text-destructive" />
              </div>
              Today's Donation Queue
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/blood-bank/donations')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {donationsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : todaysDonations && todaysDonations.length > 0 ? (
              <div className="space-y-2">
                {todaysDonations.slice(0, 5).map((donation, idx) => (
                  <div 
                    key={donation.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <BloodGroupBadge 
                        group={(donation.donor as any)?.blood_group || 'O+'} 
                        size="md" 
                      />
                      <div>
                        <p className="font-medium">
                          {(donation.donor as any)?.first_name} {(donation.donor as any)?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {donation.donation_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DonationStatusBadge status={donation.status} />
                      {donation.donation_time && (
                        <span className="text-xs text-muted-foreground">
                          {donation.donation_time}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Heart className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">No donations scheduled</p>
                <p className="text-sm">Start a new donation to get started</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/app/blood-bank/donations')}
                >
                  Start New Donation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Requests */}
        <Card className="shadow-soft overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-warning/5 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning/10">
                <FileText className="h-4 w-4 text-warning" />
              </div>
              Pending Blood Requests
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/blood-bank/requests')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {requestsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : pendingRequests && pendingRequests.length > 0 ? (
              <div className="space-y-2">
                {pendingRequests.slice(0, 4).map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    compact
                    onView={() => navigate(`/app/blood-bank/requests/${request.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <FileText className="h-8 w-8 opacity-50" />
                </div>
                <p>No pending requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Transfusions */}
        <Card className="shadow-soft overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              Active Transfusions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/blood-bank/transfusions')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {transfusionsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : activeTransfusions && activeTransfusions.length > 0 ? (
              <div className="space-y-2">
                {activeTransfusions.slice(0, 4).map((transfusion, idx) => (
                  <div 
                    key={transfusion.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() => navigate(`/app/blood-bank/transfusions/${transfusion.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <BloodGroupBadge 
                        group={(transfusion.blood_unit as any)?.blood_group || 'O+'} 
                        size="md" 
                      />
                      <div>
                        <p className="font-medium">
                          {(transfusion.patient as any)?.first_name} {(transfusion.patient as any)?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transfusion.transfusion_number} • {(transfusion.blood_unit as any)?.unit_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                        <span className="text-xs font-medium text-primary">In Progress</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Activity className="h-8 w-8 opacity-50" />
                </div>
                <p>No active transfusions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}