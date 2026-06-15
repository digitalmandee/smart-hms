import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";
import { useTranslation } from "@/lib/i18n";
import { AlertCircle, BookOpen, Loader2 } from "lucide-react";
import {
  usePostToAccounts,
  isValidPaymentReference,
  type ReconciliationClaim,
} from "@/hooks/usePaymentReconciliation";

interface Props {
  claim: ReconciliationClaim | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostClaimPaymentDialog({ claim, open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const post = usePostToAccounts();

  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && claim) {
      setPaymentReference("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaidAmount(String(claim.approved_amount || 0));
      setPaymentMethodId("");
      setNotes("");
    }
  }, [open, claim]);

  if (!claim) return null;

  const amountNum = Number(paidAmount);
  const refOk = isValidPaymentReference(paymentReference);
  const amountOk = amountNum > 0 && amountNum <= Number(claim.approved_amount || 0);
  const canSubmit = refOk && amountOk && !!paymentMethodId && !post.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await post.mutateAsync({
      claimId: claim.id,
      paymentReference: paymentReference.trim(),
      paymentDate,
      paidAmount: amountNum,
      paymentMethodId,
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("insurance.postPaymentTitle" as any, "Post Insurance Payment")}
          </DialogTitle>
          <DialogDescription>
            {t("insurance.postPaymentDesc" as any, "Record the insurer remittance and clear the AR balance.")}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Claim</span><span className="font-medium">{claim.claim_number}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Approved</span><span className="font-medium">{Number(claim.approved_amount || 0).toFixed(2)}</span></div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("insurance.eraReference" as any, "ERA / EFT / Cheque #")} *</Label>
            <Input
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g. ERA-2026-001234"
            />
            {paymentReference && !refOk && (
              <p className="text-xs text-destructive">
                {t("insurance.invalidPaymentRef" as any, "Enter a real ERA / EFT / cheque reference (auto-generated values are not allowed).")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("insurance.paymentDate" as any, "Payment Date")} *</Label>
              <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("insurance.paidAmount" as any, "Paid Amount")} *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("billing.paymentMethod")} *</Label>
            <PaymentMethodSelector value={paymentMethodId} onValueChange={setPaymentMethodId} />
          </div>

          <div className="space-y-2">
            <Label>{t("common.notes")}</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {paidAmount && !amountOk && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("insurance.amountOutOfRange" as any, "Paid amount must be greater than zero and at most the approved amount.")}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {post.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t("insurance.postPayment" as any, "Post Payment")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
