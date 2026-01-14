import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
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
  AlertCircle,
  Plus,
  ArrowRight
} from "lucide-react";
import { useIPDStats } from "@/hooks/useIPD";
import { useAdmissions } from "@/hooks/useAdmissions";
import { usePendingRounds } from "@/hooks/useDailyRounds";
import { usePendingDischarges } from "@/hooks/useDischarge";
import { AdmissionCard } from "@/components/ipd/AdmissionCard";
import { format } from "date-fns";

export default function IPDDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: loadingStats } = useIPDStats();
  const { data: recentAdmissions, isLoading: loadingAdmissions } = useAdmissions("admitted");
  const { data: pendingRounds, isLoading: loadingRounds } = usePendingRounds();
  const { data: pendingDischarges, isLoading: loadingDischarges } = usePendingDischarges();

  return (
    <div className="space-y-6">
      <PageHeader
        title="IPD Dashboard"
        description="Inpatient department overview and management"
        actions={
          <Button onClick={() => navigate("/app/ipd/admissions/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Admission
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Wards"
          value={stats?.totalWards || 0}
          icon={Building2}
          description="Active wards"
        />
        <StatsCard
          title="Bed Occupancy"
          value={`${stats?.occupiedBeds || 0}/${stats?.totalBeds || 0}`}
          icon={Bed}
          description={`${stats?.availableBeds || 0} available`}
        />
        <StatsCard
          title="Active Patients"
          value={stats?.activeAdmissions || 0}
          icon={Users}
          description="Currently admitted"
        />
        <StatsCard
          title="Today's Activity"
          value={`+${stats?.todayAdmissions || 0} / -${stats?.todayDischarges || 0}`}
          icon={UserPlus}
          description="Admissions / Discharges"
        />
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Rounds */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <LogOut className="h-5 w-5 text-warning" />
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
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate("/app/ipd/wards")}
        >
          <Building2 className="h-6 w-6" />
          <span>Wards</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate("/app/ipd/beds")}
        >
          <Bed className="h-6 w-6" />
          <span>Bed Map</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate("/app/ipd/admissions")}
        >
          <Users className="h-6 w-6" />
          <span>Admissions</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate("/app/ipd/nursing")}
        >
          <ClipboardList className="h-6 w-6" />
          <span>Nursing Station</span>
        </Button>
      </div>

      {/* Recent Admissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Admissions</CardTitle>
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
