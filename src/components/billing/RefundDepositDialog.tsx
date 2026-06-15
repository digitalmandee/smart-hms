import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRefundPatientDeposit, useDepositBalance } from "@/hooks/usePatientDeposits";
import { usePaymentMethods } from "@/hooks/useBilling";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patientId: string;
  patientName?: string;
}

const NONE = "__none__";

export function RefundDepositDialog({ open, onOpenChange, patientId, patientName }: Props) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { data: balance } = useDepositBalance(patientId);
  const { data: methods } = usePaymentMethods();
  const refund = useRefundPatientDeposit();

  const available = balance?.balance ?? 0;

  const [amount, setAmount] = useState<string>("");
  const [methodId, setMethodId] = useState<string>(NONE);
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setAmount(available > 0 ? available.toFixed(2) : "");
      setMethodId(NONE);
      setReference("");
      setReason("");
      setNotes("");
    }
  }, [open, available]);

  const amt = parseFloat(amount) || 0;
  const postBalance = available - amt;
  const amountInvalid = amt <= 0 || amt > available;
  const reasonInvalid = !reason.trim();

  const handleSubmit = () => {
    refund.mutate(
      {
        patient_id: patientId,
        amount: amt,
        available_balance: available,
        payment_method_id: methodId === NONE ? undefined : methodId,
        reference_number: reference || undefined,
        reason,
        notes: notes || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deposits.refundTitle")}</DialogTitle>
          <DialogDescription>
            {patientName ? `${patientName} — ` : ""}
            {t("deposits.availableBalance")}: <span className="font-semibold">{formatCurrency(available)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t("deposits.refundAmount")}</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max={available}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            {amt > 0 && amt > available && (
              <p className="text-xs text-destructive mt-1">{t("deposits.amountExceedsBalance")}</p>
            )}
            {amt > 0 && amt <= available && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("deposits.balanceAfter")}: {formatCurrency(postBalance)}
              </p>
            )}
          </div>

          <div>
            <Label>{t("billing.paymentMethod")}</Label>
            <Select value={methodId} onValueChange={setMethodId}>
              <SelectTrigger><SelectValue placeholder={t("common.select") as string} /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("common.none")}</SelectItem>
                {(methods || []).map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("deposits.referenceNumber")}</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t("deposits.referencePlaceholder") as string}
            />
          </div>

          <div>
            <Label>
              {t("deposits.refundReason")} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("deposits.refundReasonPlaceholder") as string}
            />
            {reasonInvalid && reason !== "" && (
              <p className="text-xs text-destructive mt-1">{t("deposits.refundReasonRequired")}</p>
            )}
          </div>

          <div>
            <Label>{t("common.notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button
            onClick={handleSubmit}
            disabled={amountInvalid || reasonInvalid || refund.isPending}
          >
            {refund.isPending ? t("common.loading") : t("deposits.processRefund")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
