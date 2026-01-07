import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientConsultationHistory, Vitals } from "@/hooks/useConsultations";
import { usePatientPrescriptions } from "@/hooks/usePrescriptions";
import { History, FileText, ChevronRight, Pill } from "lucide-react";
import { Link } from "react-router-dom";

interface PreviousVisitsProps {
  patientId: string;
  onCopyDiagnosis?: (diagnosis: string) => void;
  onCopyPrescription?: (items: any[]) => void;
}

export function PreviousVisits({
  patientId,
  onCopyDiagnosis,
  onCopyPrescription,
}: PreviousVisitsProps) {
  const { data: consultations = [], isLoading: loadingConsultations } =
    usePatientConsultationHistory(patientId, 5);
  const { data: prescriptions = [], isLoading: loadingPrescriptions } =
    usePatientPrescriptions(patientId, 5);

  const isLoading = loadingConsultations || loadingPrescriptions;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Previous Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Previous Visits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {consultations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No previous visits</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((consultation) => {
                const vitals = consultation.vitals as Vitals | null;
                const relatedPrescription = prescriptions.find(
                  (p) => p.consultation_id === consultation.id
                );

                return (
                  <div
                    key={consultation.id}
                    className="border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors"
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
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/app/opd/consultations/${consultation.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    {/* Chief Complaint */}
                    {consultation.chief_complaint && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">CC:</span>{" "}
                        {consultation.chief_complaint}
                      </p>
                    )}

                    {/* Diagnosis */}
                    {consultation.diagnosis && (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm flex-1">
                          <span className="text-muted-foreground">Dx:</span>{" "}
                          {consultation.diagnosis}
                        </p>
                        {onCopyDiagnosis && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopyDiagnosis(consultation.diagnosis!)}
                            className="h-6 px-2 text-xs"
                          >
                            Copy
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Vitals Summary */}
                    {vitals && (vitals.blood_pressure || vitals.pulse) && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {vitals.blood_pressure && (
                          <Badge variant="outline">
                            BP: {vitals.blood_pressure.systolic}/{vitals.blood_pressure.diastolic}
                          </Badge>
                        )}
                        {vitals.pulse && (
                          <Badge variant="outline">Pulse: {vitals.pulse}</Badge>
                        )}
                        {vitals.temperature && (
                          <Badge variant="outline">
                            Temp: {vitals.temperature}°{vitals.temperature_unit || 'F'}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Prescription indicator */}
                    {relatedPrescription && (
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Pill className="h-3 w-3" />
                          {relatedPrescription.items?.length || 0} medicines prescribed
                        </div>
                        {onCopyPrescription && relatedPrescription.items && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopyPrescription(relatedPrescription.items!)}
                            className="h-6 px-2 text-xs"
                          >
                            Copy Rx
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
