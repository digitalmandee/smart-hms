import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  UserCheck, 
  Stethoscope, 
  Users, 
  RefreshCw,
  Clock,
  Plus,
  Search,
  ChevronRight
} from "lucide-react";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { MobileStatsCard } from "@/components/mobile/MobileStatsCard";
import { QuickActionCard } from "@/components/mobile/QuickActionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface NursingQueueData {
  awaitingVitals: any[];
  vitalsComplete: any[];
  inProgress: any[];
}

interface MobileNurseViewProps {
  queue: NursingQueueData | undefined;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

const priorityColors: Record<number, string> = {
  2: "border-l-destructive",
  1: "border-l-amber-500",
  0: "border-l-border",
};

export function MobileNurseView({
  queue,
  isLoading,
  onRefresh
}: MobileNurseViewProps) {
  const navigate = useNavigate();
  const haptics = useHaptics();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const awaitingVitals = queue?.awaitingVitals || [];
  const vitalsComplete = queue?.vitalsComplete || [];
  const inProgress = queue?.inProgress || [];
  const totalToday = awaitingVitals.length + vitalsComplete.length + inProgress.length;

  const handleQuickAction = (action: string) => {
    haptics.light();
    switch (action) {
      case "vitals":
        // Navigate to first awaiting vitals patient
        if (awaitingVitals.length > 0) {
          navigate(`/app/appointments/${awaitingVitals[0].id}/check-in`);
        }
        break;
      case "search":
        navigate("/app/patients");
        break;
      case "queue":
        navigate("/app/appointments/queue");
        break;
    }
  };

  return (
    <PullToRefresh onRefresh={onRefresh} className="min-h-full bg-background">
      <div className="px-4 py-4 space-y-6 pb-24">
        {/* Greeting Header */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="text-2xl font-bold">{getGreeting()}</h1>
        </div>

        {/* Stats Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatsCard
            title="Awaiting Vitals"
            value={awaitingVitals.length}
            icon={<Activity className="h-5 w-5" />}
            className={awaitingVitals.length > 0 ? "border-amber-500/50" : ""}
          />
          <MobileStatsCard
            title="Vitals Complete"
            value={vitalsComplete.length}
            icon={<UserCheck className="h-5 w-5" />}
          />
          <MobileStatsCard
            title="In Consultation"
            value={inProgress.length}
            icon={<Stethoscope className="h-5 w-5" />}
          />
          <MobileStatsCard
            title="Total Today"
            value={totalToday}
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        {/* Quick Actions - 3 columns */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard
              icon={<Activity className="h-6 w-6" />}
              label="Record Vitals"
              onClick={() => handleQuickAction("vitals")}
              variant="primary"
              disabled={awaitingVitals.length === 0}
            />
            <QuickActionCard
              icon={<Search className="h-6 w-6" />}
              label="Find Patient"
              onClick={() => handleQuickAction("search")}
            />
            <QuickActionCard
              icon={<Users className="h-6 w-6" />}
              label="Full Queue"
              onClick={() => handleQuickAction("queue")}
            />
          </div>
        </div>

        {/* Awaiting Vitals Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Awaiting Vitals ({awaitingVitals.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : awaitingVitals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card border rounded-xl">
              <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">All patients have vitals recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {awaitingVitals.slice(0, 4).map((apt) => (
                <VitalsTaskCard
                  key={apt.id}
                  appointment={apt}
                  onClick={() => {
                    haptics.light();
                    navigate(`/app/appointments/${apt.id}/check-in`);
                  }}
                />
              ))}
              {awaitingVitals.length > 4 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    haptics.light();
                    navigate("/app/appointments/queue");
                  }}
                >
                  View All ({awaitingVitals.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Ready for Doctor Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              Ready for Doctor ({vitalsComplete.length})
            </h2>
          </div>

          {vitalsComplete.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card border rounded-xl">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No patients ready yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vitalsComplete.slice(0, 3).map((apt) => (
                <ReadyPatientCard
                  key={apt.id}
                  appointment={apt}
                />
              ))}
            </div>
          )}
        </div>

        {/* Active Consultations */}
        {inProgress.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
              <Stethoscope className="h-4 w-4 text-blue-500" />
              Active Consultations ({inProgress.length})
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {inProgress.map((apt) => (
                <div 
                  key={apt.id} 
                  className="min-w-[180px] bg-blue-500/10 border border-blue-500/20 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                      #{apt.token_number}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">
                    {apt.patient?.first_name} {apt.patient?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dr. {apt.doctor?.profile?.full_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}

// Sub-component for vitals task card
function VitalsTaskCard({ appointment, onClick }: { appointment: any; onClick: () => void }) {
  const priority = appointment.priority || 0;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border rounded-xl p-4 border-l-4 active:scale-[0.98] transition-transform touch-manipulation cursor-pointer",
        priorityColors[priority] || priorityColors[0]
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-mono">
              #{appointment.token_number}
            </Badge>
            {priority === 2 && (
              <Badge variant="destructive" className="text-xs">Emergency</Badge>
            )}
            {priority === 1 && (
              <Badge className="text-xs bg-amber-500/20 text-amber-700 border-amber-500/30">Urgent</Badge>
            )}
          </div>
          <p className="font-medium">
            {appointment.patient?.first_name} {appointment.patient?.last_name}
          </p>
          <p className="text-xs text-muted-foreground">
            MR# {appointment.patient?.patient_number}
          </p>
        </div>
        <Button size="sm" className="h-10 px-4">
          <Activity className="h-4 w-4 mr-1" />
          Vitals
        </Button>
      </div>
    </div>
  );
}

// Sub-component for ready patient card
function ReadyPatientCard({ appointment }: { appointment: any }) {
  return (
    <div className="bg-card border rounded-xl p-4 border-l-4 border-l-emerald-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-mono">
              #{appointment.token_number}
            </Badge>
            <Badge className="text-xs bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
              <UserCheck className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </div>
          <p className="font-medium">
            {appointment.patient?.first_name} {appointment.patient?.last_name}
          </p>
          {appointment.chief_complaint && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {appointment.chief_complaint}
            </p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
}
