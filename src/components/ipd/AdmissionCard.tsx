import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Calendar, 
  Bed, 
  Building2, 
  Stethoscope,
  Eye,
  ClipboardList,
  LogOut
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface AdmissionCardProps {
  admission: {
    id: string;
    admission_number: string;
    admission_date: string;
    admission_time?: string;
    admission_type?: string;
    status?: string;
    chief_complaint?: string;
    expected_discharge_date?: string;
    patient?: {
      id: string;
      first_name: string;
      last_name: string;
      patient_number: string;
      gender?: string;
      phone?: string;
    };
    ward?: { id: string; name: string; code: string };
    bed?: { id: string; bed_number: string };
    attending_doctor?: {
      id: string;
      profile?: { full_name: string };
    };
  };
  onView?: (id: string) => void;
  onRounds?: (id: string) => void;
  onDischarge?: (id: string) => void;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  admitted: "bg-success/10 text-success border-success/20",
  discharged: "bg-muted text-muted-foreground",
  transferred: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  deceased: "bg-destructive/10 text-destructive border-destructive/20",
  absconded: "bg-warning/10 text-warning border-warning/20",
  lama: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export const AdmissionCard = ({
  admission,
  onView,
  onRounds,
  onDischarge,
  compact = false,
}: AdmissionCardProps) => {
  const patient = admission.patient;
  const daysAdmitted = differenceInDays(new Date(), new Date(admission.admission_date));
  const isOverdue = admission.expected_discharge_date && 
    new Date(admission.expected_discharge_date) < new Date();

  return (
    <Card className={cn("hover:shadow-md transition-shadow", compact && "p-3")}>
      {!compact && (
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {admission.admission_number}
              </Badge>
              {admission.admission_type && (
                <Badge variant="secondary" className="capitalize">
                  {admission.admission_type}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {admission.status === "pending" && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
              )}
              <Badge
                variant="outline"
                className={cn(
                  statusColors[admission.status || "admitted"]
                )}
              >
                {admission.status === "pending" ? "NEW" : (admission.status || "Admitted")}
              </Badge>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("space-y-3", compact && "p-0")}>
        {/* Patient Info */}
        {patient && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {patient.first_name} {patient.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {patient.patient_number}
                {patient.gender && ` • ${patient.gender}`}
              </p>
            </div>
            {compact && (
              <div className="flex items-center gap-1.5 shrink-0">
                {admission.status === "pending" && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    statusColors[admission.status || "admitted"]
                  )}
                >
                  {admission.status === "pending" ? "NEW" : (admission.status || "Admitted")}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(admission.admission_date), "dd MMM yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              Day {daysAdmitted + 1}
            </span>
          </div>
          {admission.ward && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{admission.ward.name}</span>
            </div>
          )}
          {admission.bed && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bed className="h-4 w-4" />
              <span>Bed {admission.bed.bed_number}</span>
            </div>
          )}
          {admission.attending_doctor?.profile && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Stethoscope className="h-4 w-4" />
              <span>Dr. {admission.attending_doctor.profile.full_name}</span>
            </div>
          )}
        </div>

        {/* Chief Complaint */}
        {admission.chief_complaint && !compact && (
          <div className="text-sm">
            <span className="text-muted-foreground">Chief Complaint: </span>
            <span className="line-clamp-2">{admission.chief_complaint}</span>
          </div>
        )}

        {/* Overdue Warning */}
        {isOverdue && (
          <div className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">
            Expected discharge was {format(new Date(admission.expected_discharge_date!), "dd MMM")}
          </div>
        )}

        {/* Actions */}
        {!compact && (onView || onRounds || onDischarge) && (
          <div className="flex gap-2 pt-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(admission.id)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
            {onRounds && admission.status === "admitted" && (
              <Button variant="outline" size="sm" onClick={() => onRounds(admission.id)}>
                <ClipboardList className="h-4 w-4 mr-1" />
                Rounds
              </Button>
            )}
            {onDischarge && admission.status === "admitted" && (
              <Button variant="outline" size="sm" onClick={() => onDischarge(admission.id)}>
                <LogOut className="h-4 w-4 mr-1" />
                Discharge
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
