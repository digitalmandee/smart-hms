import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bed, 
  Calendar, 
  Clock, 
  Stethoscope,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useConfirmAdmission } from "@/hooks/useAdmissions";

interface AdmissionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admission: {
    id: string;
    admission_number: string;
    admission_date: string;
    admission_time?: string;
    chief_complaint?: string;
    patient?: {
      first_name: string;
      last_name: string;
      patient_number: string;
      gender?: string;
    };
    ward?: { name: string; code: string };
    bed?: { bed_number: string };
    attending_doctor?: {
      profile?: { full_name: string };
    };
  };
}

export function AdmissionConfirmationDialog({
  open,
  onOpenChange,
  admission,
}: AdmissionConfirmationDialogProps) {
  const [notes, setNotes] = useState("");
  const confirmAdmission = useConfirmAdmission();

  const handleConfirm = async () => {
    await confirmAdmission.mutateAsync({
      admissionId: admission.id,
      notes: notes || "Patient admitted and settled to bed.",
    });
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Confirm Patient Admission
          </DialogTitle>
          <DialogDescription>
            Confirm that the patient has arrived and been settled to their bed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Details */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {admission.patient?.first_name} {admission.patient?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {admission.patient?.patient_number}
                  {admission.patient?.gender && ` • ${admission.patient.gender}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(admission.admission_date), "dd MMM yyyy")}</span>
              </div>
              {admission.admission_time && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{admission.admission_time}</span>
                </div>
              )}
              {admission.ward && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge variant="outline">{admission.ward.name}</Badge>
                </div>
              )}
              {admission.bed && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bed className="h-4 w-4" />
                  <span>Bed {admission.bed.bed_number}</span>
                </div>
              )}
            </div>

            {admission.attending_doctor?.profile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Stethoscope className="h-4 w-4" />
                <span>Dr. {admission.attending_doctor.profile.full_name}</span>
              </div>
            )}

            {admission.chief_complaint && (
              <div className="text-sm">
                <span className="text-muted-foreground">Chief Complaint: </span>
                <span>{admission.chief_complaint}</span>
              </div>
            )}
          </div>

          {/* Admission Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Admission Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the patient's arrival, initial condition, or bed setup..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={confirmAdmission.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={confirmAdmission.isPending}
          >
            {confirmAdmission.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Admission
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
