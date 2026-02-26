import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PatientCurrentVisit as CurrentVisitType } from "@/hooks/usePatientCurrentVisit";
import { useAuth } from "@/contexts/AuthContext";
import {
  Ticket,
  Stethoscope,
  Clock,
  Play,
  Activity,
  AlertCircle,
  Eye,
} from "lucide-react";

interface PatientCurrentVisitProps {
  visit: CurrentVisitType;
}

export function PatientCurrentVisit({ visit }: PatientCurrentVisitProps) {
  const { hasRole } = useAuth();
  const isDoctor = hasRole('doctor') || hasRole('surgeon');
  const doctorName = visit.doctor?.profile?.full_name || "Unknown Doctor";
  const specialization = visit.doctor?.specialization;

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ElementType }> = {
    scheduled: { label: "Scheduled", variant: "outline", icon: Clock },
    checked_in: { label: "Waiting", variant: "secondary", icon: Clock },
    in_progress: { label: "In Progress", variant: "default", icon: Play },
  };

  const status = statusConfig[visit.status || "scheduled"] || statusConfig.scheduled;
  const StatusIcon = status.icon;

  // Parse vitals from check_in_vitals if available
  const vitals = visit.check_in_vitals;

  return (
    <Alert className="border-primary/50 bg-primary/5 mb-6">
      <Ticket className="h-5 w-5 text-primary" />
      <AlertTitle className="flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-2">
          Current Visit - Token #{visit.token_number || "N/A"}
          <Badge variant={status.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </span>
        {visit.check_in_at && (
          <span className="text-sm font-normal text-muted-foreground">
            Check-in: {format(new Date(visit.check_in_at), "h:mm a")}
          </span>
        )}
      </AlertTitle>
      <AlertDescription className="mt-3">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            {/* Doctor Info */}
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Dr. {doctorName}</span>
              {specialization && (
                <Badge variant="outline" className="text-xs">
                  {specialization}
                </Badge>
              )}
            </div>

            {/* Chief Complaint */}
            {visit.chief_complaint && (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Chief Complaint:</span>{" "}
                  {visit.chief_complaint}
                </span>
              </div>
            )}

            {/* Vitals Summary */}
            {vitals && Object.keys(vitals).length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Vitals:</span>
                {vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic && (
                  <Badge variant="outline" className="text-xs">
                    BP: {vitals.blood_pressure_systolic}/{vitals.blood_pressure_diastolic}
                  </Badge>
                )}
                {vitals.pulse && (
                  <Badge variant="outline" className="text-xs">
                    Pulse: {vitals.pulse}
                  </Badge>
                )}
                {vitals.temperature && (
                  <Badge variant="outline" className="text-xs">
                    Temp: {vitals.temperature}°F
                  </Badge>
                )}
                {vitals.spo2 && (
                  <Badge variant="outline" className="text-xs">
                    SpO2: {vitals.spo2}%
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {visit.status === "in_progress" ? (
              isDoctor ? (
                <Button asChild>
                  <Link to={`/app/opd/consultation/${visit.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Continue Consultation
                  </Link>
                </Button>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Eye className="h-3 w-3" />
                  In Consultation
                </Badge>
              )
            ) : visit.status === "checked_in" ? (
              isDoctor ? (
                <Button asChild>
                  <Link to={`/app/opd/consultation/${visit.id}`}>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Start Consultation
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to={`/app/opd/vitals?appointmentId=${visit.id}`}>
                    <Activity className="h-4 w-4 mr-2" />
                    Record Vitals
                  </Link>
                </Button>
              )
            ) : (
              <Button variant="outline" asChild>
                <Link to={`/app/opd/vitals?appointmentId=${visit.id}`}>
                  <Activity className="h-4 w-4 mr-2" />
                  Record Vitals
                </Link>
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
