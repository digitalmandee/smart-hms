import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, Heart, Package, FileText, Activity, AlertTriangle,
  Plus, ArrowRight, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  useBloodBankStats, 
  useTodaysDonations, 
  usePendingRequests,
  useActiveTransfusions 
} from "@/hooks/useBloodBank";
import { BloodStockWidget } from "@/components/blood-bank/BloodStockWidget";
import { DonorCard } from "@/components/blood-bank/DonorCard";
import { RequestCard } from "@/components/blood-bank/RequestCard";
import { DonationStatusBadge } from "@/components/blood-bank/DonationStatusBadge";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { format } from "date-fns";

export default function BloodBankDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useBloodBankStats();
  const { data: todaysDonations, isLoading: donationsLoading } = useTodaysDonations();
  const { data: pendingRequests, isLoading: requestsLoading } = usePendingRequests();
  const { data: activeTransfusions, isLoading: transfusionsLoading } = useActiveTransfusions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Bank"
        description="Manage blood donations, inventory, and transfusions"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/app/blood-bank/donors/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Register Donor
            </Button>
            <Button onClick={() => navigate('/app/blood-bank/donations')}>
              <Heart className="h-4 w-4 mr-2" />
              Start Donation
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {statsLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatsCard
              title="Active Donors"
              value={stats?.totalDonors || 0}
              icon={Users}
              onClick={() => navigate('/app/blood-bank/donors')}
            />
            <StatsCard
              title="Today's Donations"
              value={stats?.todaysDonations || 0}
              icon={Heart}
              onClick={() => navigate('/app/blood-bank/donations')}
            />
            <StatsCard
              title="Available Units"
              value={stats?.availableUnits || 0}
              icon={Package}
              onClick={() => navigate('/app/blood-bank/inventory')}
            />
            <StatsCard
              title="Pending Requests"
              value={stats?.pendingRequests || 0}
              icon={FileText}
              trend={stats?.pendingRequests && stats.pendingRequests > 0 ? { value: stats.pendingRequests, isPositive: false } : undefined}
              onClick={() => navigate('/app/blood-bank/requests')}
            />
            <StatsCard
              title="Active Transfusions"
              value={stats?.activeTransfusions || 0}
              icon={Activity}
              onClick={() => navigate('/app/blood-bank/transfusions')}
            />
            <StatsCard
              title="Expiring Soon"
              value={stats?.expiringUnits || 0}
              icon={AlertTriangle}
              description="Within 7 days"
              onClick={() => navigate('/app/blood-bank/inventory?expiring=true')}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Blood Stock Overview */}
        <BloodStockWidget />

        {/* Today's Donations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              Today's Donation Queue
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/blood-bank/donations')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {donationsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : todaysDonations && todaysDonations.length > 0 ? (
              <div className="space-y-2">
                {todaysDonations.slice(0, 5).map((donation) => (
                  <div 
                    key={donation.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No donations scheduled for today</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => navigate('/app/blood-bank/donations')}
                >
                  Start a new donation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Pending Blood Requests
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/blood-bank/requests')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
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
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pending requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Transfusions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Active Transfusions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/blood-bank/transfusions')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {transfusionsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : activeTransfusions && activeTransfusions.length > 0 ? (
              <div className="space-y-2">
                {activeTransfusions.slice(0, 4).map((transfusion) => (
                  <div 
                    key={transfusion.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
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
                      <Activity className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-sm font-medium text-primary">In Progress</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active transfusions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
