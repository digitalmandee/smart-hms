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
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const REJECTION_REASONS = [
  "hemolyzed",
  "clotted",
  "insufficient_volume",
  "wrong_container",
  "mislabeled",
  "contaminated",
  "other",
] as const;

interface SampleRejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  onReject: (reason: string, notes: string) => Promise<void>;
  isRejecting?: boolean;
}

export function SampleRejectionDialog({
  open,
  onOpenChange,
  orderNumber,
  onReject,
  isRejecting,
}: SampleRejectionDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleReject = async () => {
    if (!reason) return;
    await onReject(reason, notes);
    setReason("");
    setNotes("");
  };

  const reasonLabels: Record<string, string> = {
    hemolyzed: t("lab.rejectionHemolyzed" as any),
    clotted: t("lab.rejectionClotted" as any),
    insufficient_volume: t("lab.rejectionInsufficientVolume" as any),
    wrong_container: t("lab.rejectionWrongContainer" as any),
    mislabeled: t("lab.rejectionMislabeled" as any),
    contaminated: t("lab.rejectionContaminated" as any),
    other: t("common.other" as any),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t("lab.rejectSample" as any)}
          </DialogTitle>
          <DialogDescription>
            {t("lab.rejectSampleDesc" as any)} — {orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("lab.rejectionReason" as any)} *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={t("lab.selectRejectionReason" as any)} />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {reasonLabels[r] || r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("common.notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("lab.rejectionNotes" as any)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!reason || isRejecting}
          >
            {isRejecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("lab.rejecting" as any)}
              </>
            ) : (
              t("lab.rejectSample" as any)
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
