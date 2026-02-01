import { format, differenceInYears } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Stethoscope, 
  Play, 
  Calendar, 
  FlaskConical,
  Search,
  ChevronRight
} from "lucide-react";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { MobileStatsCard } from "@/components/mobile/MobileStatsCard";
import { QuickActionCard } from "@/components/mobile/QuickActionCard";
import { AppointmentCard } from "@/components/mobile/AppointmentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface MobileDoctorViewProps {
  profile: any;
  stats: { completed?: number; pending?: number } | undefined;
  todayAppointments: any[];
  queuedPatients: any[];
  currentPatient: any | null;
  isLoading: boolean;
  onStartConsult: (appointmentId: string, status: string) => void;
  onRefresh: () => Promise<void>;
}

export function MobileDoctorView({
  profile,
  stats,
  todayAppointments,
  queuedPatients,
  currentPatient,
  isLoading,
  onStartConsult,
  onRefresh
}: MobileDoctorViewProps) {
  const navigate = useNavigate();
  const haptics = useHaptics();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    return differenceInYears(new Date(), new Date(dob));
  };

  const handleQuickAction = (action: string) => {
    haptics.light();
    switch (action) {
      case "consult":
        if (currentPatient) {
          navigate(`/app/opd/consultation/${currentPatient.id}`);
        } else if (queuedPatients.length > 0) {
          const next = queuedPatients.find(a => a.status === "checked_in");
          if (next) onStartConsult(next.id, next.status);
        }
        break;
      case "schedule":
        navigate("/app/appointments");
        break;
      case "lab":
        navigate("/app/laboratory/results");
        break;
    }
  };

  return (
    <PullToRefresh onRefresh={onRefresh} className="min-h-full bg-background">
      <div className="px-4 py-4 space-y-6 pb-24">
        {/* Greeting Header */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {
              profile?.full_name?.toLowerCase().startsWith("dr") 
                ? profile.full_name.split(" ").slice(0, 2).join(" ")
                : `Dr. ${profile?.full_name?.split(" ")[0] || "Doctor"}`
            }
          </h1>
        </div>

        {/* Stats Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatsCard
            title="Today's Patients"
            value={todayAppointments.length}
            icon={<Users className="h-5 w-5" />}
          />
          <MobileStatsCard
            title="Completed"
            value={stats?.completed || 0}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MobileStatsCard
            title="Pending"
            value={stats?.pending || 0}
            icon={<Clock className="h-5 w-5" />}
          />
          <MobileStatsCard
            title="In Queue"
            value={queuedPatients.length}
            icon={<Stethoscope className="h-5 w-5" />}
          />
        </div>

        {/* Quick Actions - 3 columns */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard
              icon={<Play className="h-6 w-6" />}
              label="Start Consult"
              onClick={() => handleQuickAction("consult")}
              variant="primary"
            />
            <QuickActionCard
              icon={<Calendar className="h-6 w-6" />}
              label="Schedule"
              onClick={() => handleQuickAction("schedule")}
            />
            <QuickActionCard
              icon={<FlaskConical className="h-6 w-6" />}
              label="Lab Results"
              onClick={() => handleQuickAction("lab")}
            />
          </div>
        </div>

        {/* Current Patient Card */}
        {currentPatient && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Current Patient</h2>
            <div 
              onClick={() => {
                haptics.light();
                navigate(`/app/opd/consultation/${currentPatient.id}`);
              }}
              className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4 active:scale-[0.98] transition-transform touch-manipulation cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-primary text-primary-foreground">In Progress</Badge>
                <Badge variant="outline">Token #{currentPatient.token_number}</Badge>
              </div>
              <h3 className="text-lg font-semibold">
                {(currentPatient.patient as any)?.first_name}{" "}
                {(currentPatient.patient as any)?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                MR# {(currentPatient.patient as any)?.patient_number}
              </p>
              {currentPatient.chief_complaint && (
                <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                  {currentPatient.chief_complaint}
                </p>
              )}
              <Button className="w-full mt-3" size="lg">
                Continue Consultation
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Patient Queue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Patient Queue ({queuedPatients.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => {
              haptics.light();
              navigate("/app/appointments/queue");
            }}>
              View All
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : queuedPatients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No patients in queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queuedPatients.slice(0, 5).map((apt) => {
                const patient = apt.patient as any;
                return (
                  <AppointmentCard
                    key={apt.id}
                    id={apt.id}
                    patientName={`${patient?.first_name || ""} ${patient?.last_name || ""}`}
                    time={apt.appointment_time || ""}
                    type={apt.appointment_type || "Consultation"}
                    status={apt.status as any}
                    priority={apt.priority}
                    tokenNumber={apt.token_number}
                    chiefComplaint={apt.chief_complaint}
                    onClick={() => onStartConsult(apt.id, apt.status || "")}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
