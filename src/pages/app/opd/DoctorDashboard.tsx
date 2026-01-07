import { Link } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointments } from "@/hooks/useAppointments";
import { useDoctors } from "@/hooks/useDoctors";
import { useTodayConsultationStats } from "@/hooks/useConsultations";
import { useAuth } from "@/contexts/AuthContext";
import { Users, CheckCircle, Clock, Play, Stethoscope } from "lucide-react";

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: doctors = [] } = useDoctors();
  const currentDoctor = doctors.find(d => d.profile?.id === profile?.id);

  const { data: todayAppointments = [], isLoading } = useAppointments({
    doctorId: currentDoctor?.id,
    date: today,
  });

  const { data: stats } = useTodayConsultationStats(currentDoctor?.id);

  const queuedPatients = todayAppointments.filter(
    a => a.status === "checked_in" || a.status === "in_progress"
  ).sort((a, b) => (a.token_number || 0) - (b.token_number || 0));

  const currentPatient = todayAppointments.find(a => a.status === "in_progress");
  const nextPatient = queuedPatients.find(a => a.status === "checked_in");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Dashboard"
        subtitle={`Welcome, Dr. ${profile?.full_name || "Doctor"}`}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Today's Patients"
          value={todayAppointments.length}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Completed"
          value={stats?.completed || 0}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Pending"
          value={stats?.pending || 0}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="In Queue"
          value={queuedPatients.length}
          icon={Stethoscope}
          variant="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Patient */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Current Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24" />
            ) : currentPatient ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {(currentPatient.patient as any)?.first_name}{" "}
                      {(currentPatient.patient as any)?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MR# {(currentPatient.patient as any)?.patient_number}
                    </p>
                  </div>
                  <Badge>Token #{currentPatient.token_number}</Badge>
                </div>
                {currentPatient.chief_complaint && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Chief Complaint:</span>{" "}
                    {currentPatient.chief_complaint}
                  </p>
                )}
                <Button asChild className="w-full">
                  <Link to={`/app/opd/consultation/${currentPatient.id}`}>
                    Continue Consultation
                  </Link>
                </Button>
              </div>
            ) : nextPatient ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">No patient in progress</p>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Next: {(nextPatient.patient as any)?.first_name}</p>
                  <p className="text-sm text-muted-foreground">Token #{nextPatient.token_number}</p>
                </div>
                <Button asChild className="w-full">
                  <Link to={`/app/opd/consultation/${nextPatient.id}`}>
                    Start Consultation
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No patients in queue
              </p>
            )}
          </CardContent>
        </Card>

        {/* Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Patient Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : queuedPatients.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No patients waiting
              </p>
            ) : (
              <div className="space-y-2">
                {queuedPatients.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={apt.status === "in_progress" ? "default" : "outline"}>
                        #{apt.token_number}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {(apt.patient as any)?.first_name} {(apt.patient as any)?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {apt.appointment_time || "Walk-in"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={apt.status === "in_progress" ? "default" : "secondary"}>
                      {apt.status === "in_progress" ? "In Progress" : "Waiting"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
