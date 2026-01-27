import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/currency";

const WAIVER_REASONS = [
  { value: "staff_benefit", label: "Staff/Employee Benefit" },
  { value: "hospital_charity", label: "Hospital Charity Case" },
  { value: "doctor_request", label: "Doctor's Request" },
  { value: "management_approval", label: "Management Approval" },
  { value: "follow_up_free", label: "Follow-up Visit (No Charge)" },
  { value: "other", label: "Other (specify below)" },
];

interface FeeWaiverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: {
    name: string;
    mrNumber?: string;
  };
  doctor?: {
    name: string;
  };
  fee: number;
  onConfirm: (reason: string, notes: string) => Promise<void>;
  isProcessing?: boolean;
}

export function FeeWaiverDialog({
  open,
  onOpenChange,
  patient,
  doctor,
  fee,
  onConfirm,
  isProcessing = false,
}: FeeWaiverDialogProps) {
  const { profile } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleConfirm = async () => {
    if (!selectedReason) return;
    
    const reasonLabel = WAIVER_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;
    const fullReason = selectedReason === "other" 
      ? `${reasonLabel}: ${additionalNotes}` 
      : reasonLabel;
    
    await onConfirm(fullReason, additionalNotes);
    
    // Reset form
    setSelectedReason("");
    setAdditionalNotes("");
  };

  const handleClose = () => {
    setSelectedReason("");
    setAdditionalNotes("");
    onOpenChange(false);
  };

  const isValid = selectedReason && (selectedReason !== "other" || additionalNotes.trim());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-warning" />
            Waive Consultation Fee
          </DialogTitle>
          <DialogDescription>
            This action will waive the consultation fee and be logged for audit purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Patient & Fee Info */}
          <div className="rounded-lg border p-3 bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Patient:</span>
              <span className="font-medium">{patient.name}</span>
            </div>
            {patient.mrNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">MR#:</span>
                <span className="font-mono">{patient.mrNumber}</span>
              </div>
            )}
            {doctor && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Doctor:</span>
                <span>{doctor.name}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Fee to Waive:</span>
              <Badge variant="destructive">{formatCurrency(fee)}</Badge>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label>Reason for Waiver *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {WAIVER_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          {(selectedReason === "other" || selectedReason) && (
            <div className="space-y-2">
              <Label>
                {selectedReason === "other" ? "Please specify *" : "Additional Notes (Optional)"}
              </Label>
              <Textarea
                placeholder={selectedReason === "other" 
                  ? "Explain the reason for waiver..." 
                  : "Any additional notes..."}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Authorized By */}
          <div className="flex items-center justify-between text-sm rounded-lg border p-3 bg-primary/5">
            <span className="text-muted-foreground">Authorized By:</span>
            <span className="font-medium">{profile?.full_name || "Current User"}</span>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>This action will be logged for audit purposes and cannot be undone.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!isValid || isProcessing}
            variant="default"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Waiver"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
