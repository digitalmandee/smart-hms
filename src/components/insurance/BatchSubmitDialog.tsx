import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, RotateCcw, Send } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { InsuranceClaim } from "@/hooks/useInsurance";

interface BatchSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claims: InsuranceClaim[];
  onSubmit: (claimIds: string[]) => Promise<{ success: string[]; failed: { id: string; error: string }[] }>;
}

type ClaimStatus = "pending" | "submitting" | "success" | "failed";

export function BatchSubmitDialog({ open, onOpenChange, claims, onSubmit }: BatchSubmitDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, { status: ClaimStatus; error?: string }>>({});
  const [completed, setCompleted] = useState(false);

  const total = claims.length;
  const processed = Object.values(statuses).filter((s) => s.status === "success" || s.status === "failed").length;
  const successCount = Object.values(statuses).filter((s) => s.status === "success").length;
  const failedCount = Object.values(statuses).filter((s) => s.status === "failed").length;
  const progress = total > 0 ? (processed / total) * 100 : 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setCompleted(false);
    
    // Initialize all statuses
    const initialStatuses: Record<string, { status: ClaimStatus }> = {};
    claims.forEach((c) => (initialStatuses[c.id] = { status: "pending" }));
    setStatuses(initialStatuses);

    const result = await onSubmit(claims.map((c) => c.id));
    
    const finalStatuses: Record<string, { status: ClaimStatus; error?: string }> = {};
    result.success.forEach((id) => (finalStatuses[id] = { status: "success" }));
    result.failed.forEach(({ id, error }) => (finalStatuses[id] = { status: "failed", error }));
    
    setStatuses(finalStatuses);
    setIsSubmitting(false);
    setCompleted(true);
  };

  const handleRetryFailed = async () => {
    const failedIds = Object.entries(statuses)
      .filter(([_, s]) => s.status === "failed")
      .map(([id]) => id);
    
    if (failedIds.length === 0) return;
    
    setIsSubmitting(true);
    const result = await onSubmit(failedIds);
    
    const updatedStatuses = { ...statuses };
    result.success.forEach((id) => (updatedStatuses[id] = { status: "success" }));
    result.failed.forEach(({ id, error }) => (updatedStatuses[id] = { status: "failed", error }));
    
    setStatuses(updatedStatuses);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setStatuses({});
      setCompleted(false);
      onOpenChange(false);
    }
  };

  const statusIcon = (status: ClaimStatus) => {
    switch (status) {
      case "submitting": return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("batch.title" as any, "Batch NPHIES Submission")}</DialogTitle>
          <DialogDescription>
            {t("batch.description" as any, `Submit ${total} claim(s) to NPHIES`)}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        {(isSubmitting || completed) && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{processed} / {total} processed</span>
              <span>
                <span className="text-green-600">{successCount} ✓</span>
                {failedCount > 0 && <span className="text-destructive ms-2">{failedCount} ✗</span>}
              </span>
            </div>
          </div>
        )}

        {/* Claims list */}
        <div className="flex-1 overflow-auto space-y-1 max-h-[400px]">
          {claims.map((claim) => {
            const st = statuses[claim.id];
            return (
              <div key={claim.id} className="flex items-center gap-3 p-2 rounded border">
                {statusIcon(st?.status || "pending")}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{claim.claim_number}</span>
                  <span className="text-xs text-muted-foreground ms-2">
                    {claim.patient_insurance?.patient?.first_name} {claim.patient_insurance?.patient?.last_name}
                  </span>
                </div>
                {st?.status === "failed" && st.error && (
                  <Badge variant="destructive" className="text-xs truncate max-w-[150px]">
                    {st.error}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          {completed && failedCount > 0 && (
            <Button variant="outline" onClick={handleRetryFailed} disabled={isSubmitting}>
              <RotateCcw className="h-4 w-4 me-2" />
              {t("batch.retryFailed" as any, "Retry Failed")}
            </Button>
          )}
          {!completed && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <Send className="h-4 w-4 me-2" />
              )}
              {t("batch.submitAll" as any, "Submit All")}
            </Button>
          )}
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            {completed ? t("common.close") : t("common.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
