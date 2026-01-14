import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TriageBadge } from "./TriageBadge";
import { EmergencyRegistration, TRIAGE_LEVELS } from "@/hooks/useEmergency";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { Clock, User, MapPin, Stethoscope, AlertTriangle, ArrowRight, Printer, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ERPatientCardProps {
  registration: EmergencyRegistration;
  onTriage?: () => void;
  onTreat?: () => void;
  onAdmit?: () => void;
  onPrint?: () => void;
  onLinkPatient?: () => void;
  compact?: boolean;
}

export const ERPatientCard = ({
  registration,
  onTriage,
  onTreat,
  onAdmit,
  onPrint,
  onLinkPatient,
  compact = false,
}: ERPatientCardProps) => {
  const navigate = useNavigate();
  const waitMinutes = differenceInMinutes(new Date(), new Date(registration.arrival_time));
  const isCritical = registration.triage_level === "1" || registration.triage_level === "2";
  const triageInfo = TRIAGE_LEVELS.find(t => t.level === registration.triage_level);
  const isUnknownPatient = !registration.patient_id;

  const patientName = registration.patient
    ? `${registration.patient.first_name} ${registration.patient.last_name}`
    : registration.unknown_patient_details
    ? `Unknown - ${registration.unknown_patient_details.estimated_age || "?"} ${registration.unknown_patient_details.gender || ""}`
    : "Unknown Patient";

  const borderColor = triageInfo?.color
    ? {
        red: "border-l-red-500",
        orange: "border-l-orange-500",
        yellow: "border-l-yellow-400",
        green: "border-l-green-500",
        blue: "border-l-blue-500",
      }[triageInfo.color]
    : "border-l-muted";

  return (
    <Card
      className={cn(
        "border-l-4 transition-all hover:shadow-md cursor-pointer",
        borderColor,
        isCritical && "ring-2 ring-red-500/50 animate-pulse"
      )}
      onClick={() => navigate(`/app/emergency/${registration.id}`)}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-semibold text-primary">
                {registration.er_number}
              </span>
              <TriageBadge level={registration.triage_level} size="sm" animate={isCritical} />
              {registration.is_mlc && (
                <Badge variant="destructive" className="text-xs">MLC</Badge>
              )}
              {registration.is_trauma && (
                <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Trauma
                </Badge>
              )}
            </div>

            {/* Patient info */}
            <div className="flex items-center gap-2 text-sm">
              {isUnknownPatient ? (
                <UserX className="h-4 w-4 text-amber-500" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={cn("font-medium truncate", isUnknownPatient && "text-amber-600")}>
                {patientName}
              </span>
              {registration.patient?.patient_number && (
                <Badge variant="outline" className="text-xs font-mono">
                  {registration.patient.patient_number}
                </Badge>
              )}
              {isUnknownPatient && !compact && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                  Not Linked
                </Badge>
              )}
            </div>

            {/* Chief complaint */}
            {registration.chief_complaint && !compact && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {registration.chief_complaint}
              </p>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className={cn(waitMinutes > 30 && "text-orange-500", waitMinutes > 60 && "text-red-500")}>
                  {formatDistanceToNow(new Date(registration.arrival_time), { addSuffix: true })}
                </span>
              </span>
              {registration.assigned_zone && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {registration.assigned_zone}
                </span>
              )}
              {registration.assigned_doctor?.profile?.full_name && (
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {registration.assigned_doctor.profile.full_name}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {!compact && (
            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
              {onPrint && (
                <Button size="sm" variant="ghost" onClick={onPrint} title="Print Token">
                  <Printer className="h-4 w-4" />
                </Button>
              )}
              {isUnknownPatient && onLinkPatient && (
                <Button size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50" onClick={onLinkPatient}>
                  Link Patient
                </Button>
              )}
              {!registration.triage_level && onTriage && (
                <Button size="sm" variant="default" onClick={onTriage}>
                  Triage
                </Button>
              )}
              {registration.triage_level && registration.status === "in_treatment" && onAdmit && (
                <Button size="sm" variant="outline" onClick={onAdmit}>
                  Admit <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
