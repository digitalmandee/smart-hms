import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientConsultationHistory, Vitals } from "@/hooks/useConsultations";
import { usePatientPrescriptions } from "@/hooks/usePrescriptions";
import { History, FileText, Pill } from "lucide-react";
import { Link } from "react-router-dom";

interface PreviousVisitsProps {
  patientId: string;
  compact?: boolean;
  onCopyDiagnosis?: (diagnosis: string) => void;
  onCopyPrescription?: (items: any[]) => void;
}

export function PreviousVisits({
  patientId,
  compact = false,
  onCopyDiagnosis,
  onCopyPrescription,
}: PreviousVisitsProps) {
  const { data: consultations = [], isLoading: loadingConsultations } =
    usePatientConsultationHistory(patientId, compact ? 3 : 5);
  const { data: prescriptions = [], isLoading: loadingPrescriptions } =
    usePatientPrescriptions(patientId, compact ? 3 : 5);

  const isLoading = loadingConsultations || loadingPrescriptions;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Previous Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (consultations.length === 0) {
    return null;
  }

  // Compact sidebar version
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Previous Visits ({consultations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {consultations.map((consultation) => {
            const relatedPrescription = prescriptions.find(
              (p) => p.consultation_id === consultation.id
            );
            return (
              <Link
                key={consultation.id}
                to={`/app/opd/consultations/${consultation.id}`}
                className="block border rounded p-2 space-y-1 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">
                    {format(new Date(consultation.created_at), "MMM d, yyyy")}
                  </p>
                  {relatedPrescription && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      <Pill className="h-2.5 w-2.5 mr-0.5" />
                      {relatedPrescription.items?.length || 0}
                    </Badge>
                  )}
                </div>
                {consultation.diagnosis && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {consultation.diagnosis}
                  </p>
                )}
              </Link>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  // Full-width version
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Previous Visits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {consultations.map((consultation) => {
            const vitals = consultation.vitals as Vitals | null;
            const relatedPrescription = prescriptions.find(
              (p) => p.consultation_id === consultation.id
            );

            return (
              <Link
                key={consultation.id}
                to={`/app/opd/consultations/${consultation.id}`}
                className="block border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(consultation.created_at), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dr. {(consultation.doctor as any)?.profile?.full_name || "Unknown"}
                    </p>
                  </div>
                </div>

                {consultation.chief_complaint && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">CC:</span>{" "}
                    {consultation.chief_complaint}
                  </p>
                )}

                {consultation.diagnosis && (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs flex-1">
                      <span className="text-muted-foreground">Dx:</span>{" "}
                      {consultation.diagnosis}
                    </p>
                    {onCopyDiagnosis && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          onCopyDiagnosis(consultation.diagnosis!);
                        }}
                        className="h-5 px-1.5 text-[10px]"
                      >
                        Copy
                      </Button>
                    )}
                  </div>
                )}

                {vitals && (vitals.blood_pressure || vitals.pulse) && (
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {vitals.blood_pressure && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        BP: {vitals.blood_pressure.systolic}/{vitals.blood_pressure.diastolic}
                      </Badge>
                    )}
                    {vitals.pulse && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">P: {vitals.pulse}</Badge>
                    )}
                  </div>
                )}

                {relatedPrescription && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Pill className="h-3 w-3" />
                      {relatedPrescription.items?.length || 0} medicines
                    </div>
                    {onCopyPrescription && relatedPrescription.items && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          onCopyPrescription(relatedPrescription.items!);
                        }}
                        className="h-5 px-1.5 text-[10px]"
                      >
                        Copy Rx
                      </Button>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
