import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  Printer,
  FileText,
  Pill,
  TestTubes,
  Calendar,
  Stethoscope,
  Activity,
  Loader2,
  Receipt,
  Scan,
} from "lucide-react";
import { generateVisitId } from "@/lib/visit-id";
import { Vitals } from "@/hooks/useConsultations";
import { PrescriptionItemInput } from "@/hooks/usePrescriptions";
import { LabOrderItemInput } from "@/hooks/useLabOrders";
import { type ImagingOrderItemInput } from "@/components/consultation/RadiologyOrderBuilder";
import { IMAGING_MODALITIES } from "@/hooks/useImaging";

interface VisitSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    appointment_date: string;
    token_number: number | null;
    patient: {
      first_name: string;
      last_name?: string;
      patient_number: string;
    };
  };
  consultation: {
    chiefComplaint: string;
    symptoms: string[];
    diagnosis: string;
    clinicalNotes: string;
    vitals: Vitals;
    followUpDate?: Date;
  };
  prescriptionItems: PrescriptionItemInput[];
  labOrderItems: LabOrderItemInput[];
  imagingOrderItems?: ImagingOrderItemInput[];
  onConfirm: () => void;
  onPrintPrescription?: () => void;
  onPrintSummary?: () => void;
  isCompleting: boolean;
  hasPendingCharges?: boolean;
  consultationFee?: number;
}

export function VisitSummaryDialog({
  open,
  onOpenChange,
  appointment,
  consultation,
  prescriptionItems,
  labOrderItems,
  imagingOrderItems = [],
  onConfirm,
  onPrintPrescription,
  onPrintSummary,
  isCompleting,
}: VisitSummaryDialogProps) {
  const visitId = generateVisitId({
    appointment_date: appointment.appointment_date,
    token_number: appointment.token_number,
  });

  const patient = appointment.patient;
  const hasVitals = Object.values(consultation.vitals).some((v) => v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Visit Summary
          </DialogTitle>
          <DialogDescription>
            Review the consultation details before completing the visit
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Visit Info */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Visit ID</p>
                <p className="font-mono font-bold">{visitId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">
                  {patient.first_name} {patient.last_name || ""}
                </p>
                <p className="text-xs text-muted-foreground">{patient.patient_number}</p>
              </div>
            </div>

            {/* Chief Complaint & Diagnosis */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Clinical Details
              </h4>
              <div className="grid gap-2 text-sm">
                {consultation.chiefComplaint && (
                  <div>
                    <span className="text-muted-foreground">Chief Complaint:</span>{" "}
                    {consultation.chiefComplaint}
                  </div>
                )}
                {consultation.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-muted-foreground">Symptoms:</span>
                    {consultation.symptoms.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
                {consultation.diagnosis && (
                  <div>
                    <span className="text-muted-foreground">Diagnosis:</span>{" "}
                    <span className="font-medium">{consultation.diagnosis}</span>
                  </div>
                )}
                {consultation.clinicalNotes && (
                  <div>
                    <span className="text-muted-foreground">Notes:</span>{" "}
                    {consultation.clinicalNotes}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Vitals */}
            {hasVitals && (
              <>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Vitals Recorded
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {consultation.vitals.blood_pressure?.systolic && consultation.vitals.blood_pressure?.diastolic && (
                      <Badge variant="secondary">
                        BP: {consultation.vitals.blood_pressure.systolic}/{consultation.vitals.blood_pressure.diastolic} mmHg
                      </Badge>
                    )}
                    {consultation.vitals.pulse && (
                      <Badge variant="secondary">Pulse: {consultation.vitals.pulse} bpm</Badge>
                    )}
                    {consultation.vitals.temperature && (
                      <Badge variant="secondary">Temp: {consultation.vitals.temperature}°F</Badge>
                    )}
                    {consultation.vitals.spo2 && (
                      <Badge variant="secondary">SpO2: {consultation.vitals.spo2}%</Badge>
                    )}
                    {consultation.vitals.weight && (
                      <Badge variant="secondary">Weight: {consultation.vitals.weight} kg</Badge>
                    )}
                    {consultation.vitals.height && (
                      <Badge variant="secondary">Height: {consultation.vitals.height} cm</Badge>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Prescription */}
            {prescriptionItems.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Prescription ({prescriptionItems.length} medicine{prescriptionItems.length > 1 ? "s" : ""})
                  </h4>
                  <div className="space-y-2">
                    {prescriptionItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                        <span className="font-medium">{item.medicine_name}</span>
                        <span className="text-muted-foreground">
                          {item.dosage} • {item.frequency} • {item.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Lab Orders */}
            {labOrderItems.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TestTubes className="h-4 w-4" />
                    Lab Orders ({labOrderItems.length} test{labOrderItems.length > 1 ? "s" : ""})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {labOrderItems.map((item, i) => (
                      <Badge key={i} variant="outline">
                        {item.test_name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Imaging Orders */}
            {imagingOrderItems.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Scan className="h-4 w-4" />
                    Imaging Orders ({imagingOrderItems.length} stud{imagingOrderItems.length > 1 ? "ies" : "y"})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {imagingOrderItems.map((item, i) => (
                      <Badge key={i} variant="outline">
                        {item.procedure_name}
                        <span className="ml-1 text-muted-foreground text-xs">
                          ({IMAGING_MODALITIES.find(m => m.value === item.modality)?.label || item.modality})
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Follow-up */}
            {consultation.followUpDate && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Follow-up Scheduled</p>
                  <p className="font-medium">{format(consultation.followUpDate, "MMMM d, yyyy")}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />
        
        {/* Pending Checkout Notice */}
        {(prescriptionItems.length > 0 || labOrderItems.length > 0 || imagingOrderItems.length > 0) && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning-foreground text-sm">
            <Receipt className="h-4 w-4" />
            <span>Patient has pending orders and will be directed to checkout after completion.</span>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 mr-auto">
            {onPrintPrescription && prescriptionItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={onPrintPrescription}>
                <Printer className="h-4 w-4 mr-2" />
                Print Rx
              </Button>
            )}
            {onPrintSummary && (
              <Button variant="outline" size="sm" onClick={onPrintSummary}>
                <FileText className="h-4 w-4 mr-2" />
                Print Summary
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCompleting}>
            Continue Editing
          </Button>
          <Button onClick={onConfirm} disabled={isCompleting}>
            {isCompleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {prescriptionItems.length > 0 || labOrderItems.length > 0 || imagingOrderItems.length > 0
              ? "Complete & Send to Checkout" 
              : "Complete Visit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
