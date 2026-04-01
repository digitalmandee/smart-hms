import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PatientSearch } from "@/components/appointments/PatientSearch";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";
import { useCreatePatientDeposit } from "@/hooks/usePatientDeposits";
import { useRequireSession } from "@/hooks/useRequireSession";
import { useTranslation } from "@/lib/i18n";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RecordDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordDepositDialog({ open, onOpenChange }: RecordDepositDialogProps) {
  const { t } = useTranslation();
  const createDeposit = useCreatePatientDeposit();
  const { hasActiveSession, sessionId } = useRequireSession();

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setSelectedPatient(null);
    setAmount("");
    setPaymentMethodId("");
    setReferenceNumber("");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !amount || Number(amount) <= 0) return;

    await createDeposit.mutateAsync({
      patient_id: selectedPatient.id,
      amount: Number(amount),
      payment_method_id: paymentMethodId || undefined,
      reference_number: referenceNumber || undefined,
      notes: notes || undefined,
      billing_session_id: sessionId || undefined,
    } as any);

    resetForm();
    onOpenChange(false);
  };

  const canSubmit = !!selectedPatient && Number(amount) > 0 && !createDeposit.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t("invoices.recordDeposit")}
          </DialogTitle>
          <DialogDescription>{t("invoices.recordDepositDesc")}</DialogDescription>
        </DialogHeader>

        {!hasActiveSession && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t("billing.noActiveSession")}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("invoices.patient")}</Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm font-medium">
                  {selectedPatient.first_name} {selectedPatient.last_name} ({selectedPatient.patient_number})
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                  ✕
                </Button>
              </div>
            ) : (
              <PatientSearch onSelect={(p) => setSelectedPatient(p)} />
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("invoices.depositAmount")}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("billing.paymentMethod")}</Label>
            <PaymentMethodSelector value={paymentMethodId} onValueChange={setPaymentMethodId} />
          </div>

          <div className="space-y-2">
            <Label>{t("billing.referenceNumber")}</Label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={t("billing.referenceNumber")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("common.notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t("common.notes")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {createDeposit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("invoices.recordDeposit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
