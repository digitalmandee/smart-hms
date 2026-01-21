import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
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
  Siren,
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
      <ModernPageHeader
        title="Emergency Department"
        subtitle="Real-time emergency patient management"
        icon={Siren}
        iconColor="text-destructive"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => navigate("/app/emergency/register")} className="gap-2">
              <UserPlus className="h-4 w-4" />
              New Registration
            </Button>
            <Button variant="outline" onClick={() => navigate("/app/emergency/ambulance-alerts")} className="gap-2">
              <Ambulance className="h-4 w-4" />
              Ambulance Alert
            </Button>
            <Button variant="secondary" onClick={() => navigate("/app/emergency/display")} className="gap-2">
              <Monitor className="h-4 w-4" />
              Queue Display
            </Button>
          </div>
        }
      />

      {/* Critical Alerts Banner */}
      {criticalPatients && criticalPatients.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-destructive to-destructive/80 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 animate-pulse">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <span className="font-semibold">
              {criticalPatients.length} Critical Patient{criticalPatients.length > 1 ? "s" : ""} Require Immediate Attention
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/app/emergency/triage")}
            className="relative"
          >
            View Now
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <ModernStatsCard
          title="Today's Patients"
          value={stats?.total || 0}
          change="Total ER visits"
          icon={Users}
          variant="primary"
        />
        <ModernStatsCard
          title="Active Patients"
          value={stats?.activePatients || 0}
          change="Currently in ER"
          icon={Activity}
          variant="info"
        />
        <ModernStatsCard
          title="Waiting Triage"
          value={stats?.byTriage.unTriaged || 0}
          change="Need assessment"
          icon={Gauge}
          variant="warning"
        />
        <ModernStatsCard
          title="Level 1 (Critical)"
          value={stats?.byTriage["1"] || 0}
          change="Resuscitation"
          icon={AlertTriangle}
          variant="accent"
          className="border-l-4 border-l-destructive"
        />
        <ModernStatsCard
          title="Level 2 (Emergent)"
          value={stats?.byTriage["2"] || 0}
          change="Trauma Bay"
          icon={AlertTriangle}
          variant="warning"
          className="border-l-4 border-l-orange-500"
        />
        <ModernStatsCard
          title="Admitted"
          value={stats?.byStatus.admitted || 0}
          change="Moved to IPD"
          icon={ArrowRight}
          variant="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Incoming Ambulances */}
        <div className="lg:col-span-1 space-y-4">
          <IncomingAmbulancePanel />

          {/* Quick Actions */}
          <Card className="shadow-soft overflow-hidden">
            <CardHeader className="pb-2 bg-gradient-to-r from-muted/50 to-transparent">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 pt-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => navigate("/app/emergency/register")}
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">Walk-in</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:border-warning/30 hover:bg-warning/5 transition-all"
                onClick={() => navigate("/app/emergency/triage")}
              >
                <div className="p-2 rounded-lg bg-warning/10">
                  <Gauge className="h-5 w-5 text-warning" />
                </div>
                <span className="text-xs font-medium">Triage</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:border-info/30 hover:bg-info/5 transition-all"
                onClick={() => navigate("/app/emergency/queue")}
              >
                <div className="p-2 rounded-lg bg-info/10">
                  <Users className="h-5 w-5 text-info" />
                </div>
                <span className="text-xs font-medium">Queue</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 transition-all"
                onClick={() => navigate("/app/emergency/ambulance-alerts")}
              >
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Ambulance className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">Alert</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Waiting for Triage */}
        <div className="lg:col-span-2">
          <Card className="shadow-soft overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-warning/5 to-transparent">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-warning/10">
                  <Gauge className="h-4 w-4 text-warning" />
                </div>
                <CardTitle className="text-lg">Waiting for Triage</CardTitle>
                {waitingForTriage && waitingForTriage.length > 0 && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                    {waitingForTriage.length}
                  </Badge>
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
            <CardContent className="pt-4">
              {!waitingForTriage || waitingForTriage.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="p-4 rounded-full bg-success/10 w-fit mx-auto mb-3">
                    <Gauge className="h-12 w-12 text-success opacity-50" />
                  </div>
                  <p className="font-medium text-success">All patients have been triaged</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitingForTriage.slice(0, 5).map((registration, idx) => (
                    <div key={registration.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                      <ERPatientCard
                        registration={registration}
                        onTriage={() => navigate(`/app/emergency/${registration.id}`)}
                      />
                    </div>
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
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            Treatment Zones
          </h2>
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