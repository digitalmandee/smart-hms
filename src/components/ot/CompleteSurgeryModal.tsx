import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
  Scissors,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntraOpNotes } from "@/hooks/useOT";

interface CompleteSurgeryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (forceComplete?: boolean, notes?: string) => Promise<void>;
  intraOpNotes?: IntraOpNotes | null;
  hasVitals?: boolean;
  isLoading?: boolean;
}

interface ValidationItem {
  id: string;
  label: string;
  icon: typeof CheckCircle2;
  isComplete: boolean;
  isCritical: boolean;
}

export function CompleteSurgeryModal({
  open,
  onOpenChange,
  onComplete,
  intraOpNotes,
  hasVitals = false,
  isLoading,
}: CompleteSurgeryModalProps) {
  const [forceComplete, setForceComplete] = useState(false);
  const [forceReason, setForceReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validationItems = useMemo<ValidationItem[]>(() => {
    const notes = (intraOpNotes as unknown) as Record<string, unknown> | null;
    
    return [
      {
        id: "sponge",
        label: "Sponge count verified",
        icon: Package,
        isComplete: notes?.sponge_count_correct === true,
        isCritical: true,
      },
      {
        id: "instrument",
        label: "Instrument count verified",
        icon: Scissors,
        isComplete: notes?.instrument_count_correct === true,
        isCritical: true,
      },
      {
        id: "needle",
        label: "Needle count verified",
        icon: Scissors,
        isComplete: notes?.needle_count_correct === true,
        isCritical: true,
      },
      {
        id: "vitals",
        label: "At least one vital recorded",
        icon: CheckCircle2,
        isComplete: hasVitals,
        isCritical: false,
      },
      {
        id: "closure",
        label: "Closure details documented",
        icon: FileText,
        isComplete: !!notes?.closure_details,
        isCritical: false,
      },
    ];
  }, [intraOpNotes, hasVitals]);

  const criticalIncomplete = validationItems.filter(
    (item) => item.isCritical && !item.isComplete
  );
  const nonCriticalIncomplete = validationItems.filter(
    (item) => !item.isCritical && !item.isComplete
  );
  const allComplete = validationItems.every((item) => item.isComplete);
  const hasCriticalIncomplete = criticalIncomplete.length > 0;

  const handleComplete = async () => {
    try {
      setSubmitting(true);
      await onComplete(forceComplete, forceComplete ? forceReason : undefined);
      onOpenChange(false);
    } catch (error) {
      // Error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  const canComplete = allComplete || (forceComplete && forceReason.trim().length > 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {allComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            Complete Surgery
          </DialogTitle>
          <DialogDescription>
            Verify all required documentation before completing the surgery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Validation Checklist */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              {validationItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md",
                    item.isComplete ? "bg-green-50" : "bg-red-50"
                  )}
                >
                  {item.isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      "flex-1",
                      item.isComplete ? "text-green-800" : "text-red-800"
                    )}
                  >
                    {item.label}
                  </span>
                  {item.isCritical && !item.isComplete && (
                    <Badge variant="destructive" className="text-xs">
                      Critical
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status Summary */}
          {allComplete ? (
            <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-300 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                All checks passed. Ready to complete surgery.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {hasCriticalIncomplete && (
                <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-red-800">
                    <p className="font-medium">
                      {criticalIncomplete.length} critical item(s) incomplete:
                    </p>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {criticalIncomplete.map((item) => (
                        <li key={item.id}>{item.label}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Force Complete Option */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="force-complete"
                    checked={forceComplete}
                    onCheckedChange={(checked) =>
                      setForceComplete(checked as boolean)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="force-complete"
                      className="font-medium cursor-pointer"
                    >
                      Complete anyway (override warnings)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use only if there's a valid reason to skip verification.
                    </p>
                  </div>
                </div>

                {forceComplete && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-red-700">
                      Reason for override (required, min 10 characters) *
                    </Label>
                    <Textarea
                      placeholder="Explain why verification cannot be completed..."
                      value={forceReason}
                      onChange={(e) => setForceReason(e.target.value)}
                      className="border-red-300 focus:border-red-500"
                      rows={3}
                    />
                    {forceReason.length > 0 && forceReason.length < 10 && (
                      <p className="text-xs text-red-500">
                        Please provide more detail ({10 - forceReason.length} more
                        characters needed)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!canComplete || submitting || isLoading}
            variant={hasCriticalIncomplete && forceComplete ? "destructive" : "default"}
          >
            {submitting || isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {forceComplete ? "Complete Anyway" : "Complete Surgery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
