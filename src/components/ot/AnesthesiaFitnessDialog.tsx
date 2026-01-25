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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AnesthesiaFitnessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surgeryId: string;
  originalDate: string;
  originalTime: string;
  onSubmit: (data: {
    reasonCategory: string;
    reason: string;
    proposedDate?: Date;
    postponeDays?: number;
  }) => Promise<void>;
  isPending?: boolean;
}

const NOT_FIT_REASONS = [
  { value: 'npo_violation', label: 'NPO Violation' },
  { value: 'uncontrolled_bp', label: 'Uncontrolled Blood Pressure' },
  { value: 'cardiac_workup', label: 'Cardiac Workup Needed' },
  { value: 'respiratory_infection', label: 'Active Respiratory Infection' },
  { value: 'labs_not_optimized', label: 'Lab Values Not Optimized' },
  { value: 'medication_adjustment', label: 'Medication Adjustment Needed' },
  { value: 'airway_concerns', label: 'Airway Concerns' },
  { value: 'patient_condition', label: 'Patient Condition Changed' },
  { value: 'other', label: 'Other' },
];

const POSTPONE_OPTIONS = [
  { value: 1, label: '1 Day' },
  { value: 2, label: '2 Days' },
  { value: 3, label: '3 Days' },
  { value: 7, label: '1 Week' },
  { value: 14, label: '2 Weeks' },
  { value: 30, label: '1 Month' },
];

export function AnesthesiaFitnessDialog({
  open,
  onOpenChange,
  surgeryId,
  originalDate,
  originalTime,
  onSubmit,
  isPending = false,
}: AnesthesiaFitnessDialogProps) {
  const [reasonCategory, setReasonCategory] = useState("");
  const [reason, setReason] = useState("");
  const [proposedDate, setProposedDate] = useState<Date>();
  const [postponeDays, setPostponeDays] = useState<number>();

  const handleSubmit = async () => {
    if (!reasonCategory) return;
    
    await onSubmit({
      reasonCategory,
      reason: reason || NOT_FIT_REASONS.find(r => r.value === reasonCategory)?.label || '',
      proposedDate,
      postponeDays,
    });
    
    // Reset form
    setReasonCategory("");
    setReason("");
    setProposedDate(undefined);
    setPostponeDays(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Patient Not Fit for Surgery</DialogTitle>
          <DialogDescription>
            Provide the reason for deeming the patient unfit. This will create a reschedule 
            request that requires surgeon approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason for Postponement *</Label>
            <Select value={reasonCategory} onValueChange={setReasonCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {NOT_FIT_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Details</Label>
            <Textarea
              placeholder="Provide specific clinical details..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Recommended Postponement</Label>
            <Select 
              value={postponeDays?.toString() || ""} 
              onValueChange={(v) => setPostponeDays(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {POSTPONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proposed New Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !proposedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {proposedDate ? format(proposedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={proposedDate}
                  onSelect={setProposedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p><strong>Original Date:</strong> {format(new Date(originalDate), 'PPP')}</p>
            <p><strong>Original Time:</strong> {originalTime}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reasonCategory || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Reschedule Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
