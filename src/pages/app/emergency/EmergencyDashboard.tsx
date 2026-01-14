import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IncomingAmbulancePanel } from "@/components/emergency/IncomingAmbulancePanel";
import { ERQueueBoard } from "@/components/emergency/ERQueueBoard";
import { ERPatientCard } from "@/components/emergency/ERPatientCard";
import { useERStats, useERQueue } from "@/hooks/useEmergency";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Ambulance,
  Monitor,
  Gauge,
  Users,
  AlertTriangle,
  Activity,
  ArrowRight,
} from "lucide-react";

const EmergencyDashboard = () => {
  const navigate = useNavigate();
  const { data: stats } = useERStats();
  const { data: queue } = useERQueue();

  const criticalPatients = queue?.filter(
    (p) => p.triage_level === "1" || p.triage_level === "2"
  );
  const waitingForTriage = queue?.filter((p) => !p.triage_level);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Department"
        description="Real-time emergency patient management"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => navigate("/app/emergency/register")}>
              <UserPlus className="h-4 w-4 mr-2" />
              New Registration
            </Button>
            <Button variant="outline" onClick={() => navigate("/app/emergency/ambulance-alerts")}>
              <Ambulance className="h-4 w-4 mr-2" />
              Ambulance Alert
            </Button>
            <Button variant="secondary" onClick={() => navigate("/app/emergency/display")}>
              <Monitor className="h-4 w-4 mr-2" />
              Queue Display
            </Button>
          </div>
        }
      />

      {/* Critical Alerts Banner */}
      {criticalPatients && criticalPatients.length > 0 && (
        <div className="bg-red-500 text-white p-4 rounded-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6" />
            <span className="font-semibold">
              {criticalPatients.length} Critical Patient{criticalPatients.length > 1 ? "s" : ""} Require Immediate Attention
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/app/emergency/triage")}
          >
            View Now
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Today's Patients"
          value={stats?.total || 0}
          icon={Users}
          description="Total ER visits today"
        />
        <StatsCard
          title="Active Patients"
          value={stats?.activePatients || 0}
          icon={Activity}
          description="Currently in ER"
          className={stats?.activePatients && stats.activePatients > 0 ? "border-primary" : ""}
        />
        <StatsCard
          title="Waiting for Triage"
          value={stats?.byTriage.unTriaged || 0}
          icon={Gauge}
          description="Need assessment"
          className={stats?.byTriage.unTriaged && stats.byTriage.unTriaged > 0 ? "border-orange-500" : ""}
        />
        <StatsCard
          title="Level 1 (Critical)"
          value={stats?.byTriage["1"] || 0}
          icon={AlertTriangle}
          description="Resuscitation"
          className="border-l-4 border-l-red-500"
        />
        <StatsCard
          title="Level 2 (Emergent)"
          value={stats?.byTriage["2"] || 0}
          icon={AlertTriangle}
          description="Trauma Bay"
          className="border-l-4 border-l-orange-500"
        />
        <StatsCard
          title="Admitted"
          value={stats?.byStatus.admitted || 0}
          icon={ArrowRight}
          description="Moved to IPD"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Incoming Ambulances */}
        <div className="lg:col-span-1 space-y-4">
          <IncomingAmbulancePanel />

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/app/emergency/register")}
              >
                <UserPlus className="h-5 w-5" />
                <span className="text-xs">Walk-in</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/app/emergency/triage")}
              >
                <Gauge className="h-5 w-5" />
                <span className="text-xs">Triage</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/app/emergency/queue")}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Queue</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => navigate("/app/emergency/ambulance-alerts")}
              >
                <Ambulance className="h-5 w-5" />
                <span className="text-xs">Alert</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Waiting for Triage */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Waiting for Triage</CardTitle>
                {waitingForTriage && waitingForTriage.length > 0 && (
                  <Badge variant="secondary">{waitingForTriage.length}</Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/app/emergency/triage")}
              >
                Open Triage Station
              </Button>
            </CardHeader>
            <CardContent>
              {!waitingForTriage || waitingForTriage.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gauge className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>All patients have been triaged</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitingForTriage.slice(0, 5).map((registration) => (
                    <ERPatientCard
                      key={registration.id}
                      registration={registration}
                      onTriage={() => navigate(`/app/emergency/${registration.id}`)}
                    />
                  ))}
                  {waitingForTriage.length > 5 && (
                    <Button
                      variant="link"
                      className="w-full"
                      onClick={() => navigate("/app/emergency/triage")}
                    >
                      View all {waitingForTriage.length} patients
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zone-based Queue Board */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Treatment Zones</h2>
          <Button variant="outline" onClick={() => navigate("/app/emergency/queue")}>
            Full Queue View
          </Button>
        </div>
        <ERQueueBoard
          onTriagePatient={(id) => navigate(`/app/emergency/${id}`)}
          onAdmitPatient={(id) => navigate(`/app/emergency/${id}/admit`)}
        />
      </div>
    </div>
  );
};

export default EmergencyDashboard;
