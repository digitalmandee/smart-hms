import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  User, 
  HeartPulse,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { PostOpRecovery } from "@/hooks/useOT";

interface PACUPatientCardProps {
  recovery: PostOpRecovery;
  onViewDetails?: () => void;
  onDischarge?: () => void;
  onRecordVitals?: () => void;
}

export function PACUPatientCard({ 
  recovery, 
  onViewDetails,
  onDischarge,
  onRecordVitals 
}: PACUPatientCardProps) {
  const surgery = (recovery as any).surgery;
  const patient = surgery?.patient;
  const patientName = patient 
    ? `${patient.first_name} ${patient.last_name}`
    : 'Unknown Patient';

  const arrivalTime = new Date(recovery.pacu_arrival_time);
  const timeInPACU = formatDistanceToNow(arrivalTime, { addSuffix: false });

  // Get latest vitals
  const latestVitals = recovery.vitals_log && recovery.vitals_log.length > 0
    ? recovery.vitals_log[recovery.vitals_log.length - 1]
    : null;

  // Get latest Aldrete score
  const latestAldrete = recovery.aldrete_scores && recovery.aldrete_scores.length > 0
    ? recovery.aldrete_scores[recovery.aldrete_scores.length - 1]
    : null;

  // Check for complications
  const hasComplications = recovery.nausea_vomiting || recovery.shivering || recovery.emergence_delirium;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{patientName}</p>
              {patient?.mr_number && (
                <p className="text-xs text-muted-foreground">{patient.mr_number}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              In PACU
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Procedure */}
        {surgery && (
          <p className="text-sm line-clamp-1">{surgery.procedure_name}</p>
        )}

        {/* Time in PACU */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            Arrived: {format(arrivalTime, 'h:mm a')} ({timeInPACU})
          </span>
        </div>

        {/* Latest vitals */}
        {latestVitals && (
          <div className="flex items-center gap-4 text-sm bg-muted/50 p-2 rounded">
            <HeartPulse className="h-4 w-4 text-red-500" />
            <span>BP: {(latestVitals as any).bp || '-'}</span>
            <span>HR: {(latestVitals as any).hr || '-'}</span>
            <span>SpO2: {(latestVitals as any).spo2 || '-'}%</span>
          </div>
        )}

        {/* Aldrete Score */}
        {latestAldrete && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Aldrete Score:</span>
            <Badge 
              variant="outline"
              className={
                (latestAldrete as any).total >= 9 
                  ? "bg-green-50 text-green-700" 
                  : "bg-yellow-50 text-yellow-700"
              }
            >
              {(latestAldrete as any).total}/10
            </Badge>
          </div>
        )}

        {/* Complications */}
        {hasComplications && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {[
                recovery.nausea_vomiting && "N/V",
                recovery.shivering && "Shivering",
                recovery.emergence_delirium && "Delirium"
              ].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onRecordVitals && (
            <Button variant="outline" size="sm" onClick={onRecordVitals} className="flex-1">
              <HeartPulse className="h-4 w-4 mr-1" />
              Vitals
            </Button>
          )}
          {onDischarge && (
            <Button size="sm" onClick={onDischarge} className="flex-1">
              <ArrowRight className="h-4 w-4 mr-1" />
              Discharge
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
