import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bed, User, Calendar, ArrowRightLeft, X, Clock, AlertTriangle } from "lucide-react";
import { BedStatusBadge } from "./BedStatusBadge";
import { format } from "date-fns";

interface BedDetailCardProps {
  bed: {
    id: string;
    bed_number: string;
    bed_type?: string;
    status: string;
    notes?: string;
    ward_id: string;
    ward?: {
      id: string;
      name: string;
      floor?: number;
    };
    current_admission?: {
      id: string;
      admission_date: string;
      patient?: {
        id: string;
        first_name: string;
        last_name: string;
        patient_number: string;
        date_of_birth?: string;
      };
    } | null;
  };
  onClose?: () => void;
  onTransfer?: () => void;
  onViewPatient?: (patientId: string) => void;
  onViewAdmission?: (admissionId: string) => void;
  onAdmitPatient?: (bedId: string, wardId: string) => void;
}

export const BedDetailCard = ({
  bed,
  onClose,
  onTransfer,
  onViewPatient,
  onViewAdmission,
  onAdmitPatient,
}: BedDetailCardProps) => {
  const patient = bed.current_admission?.patient;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Bed {bed.bed_number}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <BedStatusBadge status={bed.status} />
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bed Info */}
        <div className="space-y-2">
          {bed.ward && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ward</span>
              <span className="font-medium">{bed.ward.name} ({bed.ward.code})</span>
            </div>
          )}
          {bed.bed_type && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="outline">{bed.bed_type}</Badge>
            </div>
          )}
        </div>

        {/* Status-specific info */}
        {bed.status === "reserved" && bed.notes && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-warning">
              <Clock className="h-4 w-4" />
              Reserved
            </div>
            <p className="text-sm text-muted-foreground">{bed.notes}</p>
          </div>
        )}

        {bed.status === "maintenance" && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              Under Maintenance
            </div>
            {bed.notes && <p className="text-sm text-muted-foreground">{bed.notes}</p>}
          </div>
        )}

        {bed.status === "housekeeping" && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Clock className="h-4 w-4" />
              Awaiting Housekeeping
            </div>
            {bed.notes && <p className="text-sm text-muted-foreground">{bed.notes}</p>}
          </div>
        )}

        {/* General notes (for available beds) */}
        {bed.status === "available" && bed.notes && (
          <div className="text-sm">
            <span className="text-muted-foreground">Notes:</span>
            <p className="mt-1">{bed.notes}</p>
          </div>
        )}

        {/* Patient Info (if occupied) */}
        {bed.current_admission && patient && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Current Patient
              </div>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {patient.first_name} {patient.last_name}
                  </span>
                  <Badge variant="secondary">{patient.patient_number}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {patient.gender && <span>{patient.gender}</span>}
                  {patient.date_of_birth && (
                    <span>
                      DOB: {format(new Date(patient.date_of_birth), "dd MMM yyyy")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Admitted: {format(new Date(bed.current_admission.admission_date), "dd MMM yyyy")}
                </div>
                <div className="flex gap-2 pt-2">
                  {onViewPatient && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onViewPatient(patient.id)}
                    >
                      View Patient
                    </Button>
                  )}
                  {onViewAdmission && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onViewAdmission(bed.current_admission!.id)}
                    >
                      View Admission
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        {bed.status === "occupied" && onTransfer && (
          <Button variant="outline" className="w-full" onClick={onTransfer}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transfer Patient
          </Button>
        )}

        {bed.status === "available" && (
          <div className="text-center text-sm text-muted-foreground py-2">
            This bed is available for admission
          </div>
        )}
      </CardContent>
    </Card>
  );
};
