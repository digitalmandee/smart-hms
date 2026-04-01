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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  CreditCard,
  Clock,
  AlertTriangle,
  Loader2,
  Receipt,
  Plus,
  Trash2,
} from "lucide-react";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";
import { formatCurrency } from "@/lib/currency";

interface PaymentSplit {
  id: string;
  amount: string;
  paymentMethodId: string;
  referenceNumber: string;
}

interface AdmissionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  patientNumber: string;
  depositAmount: number;
  wardName?: string;
  bedNumber?: string;
  onPaymentComplete: (paymentData: {
    amount: number;
    paymentMethodId: string;
    referenceNumber?: string;
    notes?: string;
  }) => void;
  onPayLater: () => void;
  onSkipDeposit: () => void;
  isProcessing?: boolean;
}

export function AdmissionPaymentDialog({
  open,
  onOpenChange,
  patientName,
  patientNumber,
  depositAmount,
  wardName,
  bedNumber,
  onPaymentComplete,
  onPayLater,
  onSkipDeposit,
  isProcessing = false,
}: AdmissionPaymentDialogProps) {
  const [amount, setAmount] = useState(depositAmount.toString());
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [showPayLaterWarning, setShowPayLaterWarning] = useState(false);
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { id: "1", amount: "", paymentMethodId: "", referenceNumber: "" },
    { id: "2", amount: "", paymentMethodId: "", referenceNumber: "" },
  ]);

  const splitsTotal = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  const targetAmount = parseFloat(amount) || 0;
  const splitsDiff = targetAmount - splitsTotal;

  const addSplit = () => {
    setSplits([...splits, { id: Date.now().toString(), amount: "", paymentMethodId: "", referenceNumber: "" }]);
  };

  const removeSplit = (id: string) => {
    if (splits.length <= 2) return;
    setSplits(splits.filter(s => s.id !== id));
  };

  const updateSplit = (id: string, field: keyof PaymentSplit, value: string) => {
    setSplits(splits.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handlePayNow = () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return;

    if (isSplitPayment) {
      // For split, use the first method as primary (all splits handled via notes)
      const validSplits = splits.filter(s => parseFloat(s.amount) > 0 && s.paymentMethodId);
      if (validSplits.length === 0) return;
      if (Math.abs(splitsDiff) > 0.01) return;

      const splitDetails = validSplits.map(s => `${s.paymentMethodId}:${s.amount}${s.referenceNumber ? ` (Ref: ${s.referenceNumber})` : ""}`).join("; ");

      onPaymentComplete({
        amount: paymentAmount,
        paymentMethodId: validSplits[0].paymentMethodId,
        referenceNumber: validSplits[0].referenceNumber || undefined,
        notes: `Split Payment: ${splitDetails}${notes ? ` | ${notes}` : ""}`,
      });
    } else {
      if (!paymentMethodId) return;
      onPaymentComplete({
        amount: paymentAmount,
        paymentMethodId,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });
    }
  };

  const handlePayLater = () => {
    if (!showPayLaterWarning) {
      setShowPayLaterWarning(true);
      return;
    }
    onPayLater();
  };

  const isSplitValid = isSplitPayment
    ? splits.filter(s => parseFloat(s.amount) > 0 && s.paymentMethodId).length >= 2 && Math.abs(splitsDiff) < 0.01
    : !!paymentMethodId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Admission Deposit Payment
          </DialogTitle>
          <DialogDescription>
            Collect deposit payment before admitting the patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-lg">{patientName}</p>
                <p className="text-sm text-muted-foreground">{patientNumber}</p>
              </div>
              <Badge variant="outline">New Admission</Badge>
            </div>
            {(wardName || bedNumber) && (
              <p className="text-sm text-muted-foreground">
                {wardName && `Ward: ${wardName}`}
                {wardName && bedNumber && " • "}
                {bedNumber && `Bed: ${bedNumber}`}
              </p>
            )}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Required Deposit:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(depositAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={0}
                step={100}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(depositAmount.toString())}
                >
                  Full Amount
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount((depositAmount / 2).toString())}
                >
                  50%
                </Button>
              </div>
            </div>

            {/* Split Payment Toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="split-toggle" className="text-sm font-medium">Split Payment</Label>
                <p className="text-xs text-muted-foreground">Pay with multiple methods</p>
              </div>
              <Switch
                id="split-toggle"
                checked={isSplitPayment}
                onCheckedChange={setIsSplitPayment}
              />
            </div>

            {isSplitPayment ? (
              <div className="space-y-3">
                {splits.map((split, idx) => (
                  <div key={split.id} className="p-3 border rounded-lg space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Method {idx + 1}</span>
                      {splits.length > 2 && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSplit(split.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          value={split.amount}
                          onChange={(e) => updateSplit(split.id, "amount", e.target.value)}
                          min={0}
                          step={100}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Reference</Label>
                        <Input
                          value={split.referenceNumber}
                          onChange={(e) => updateSplit(split.id, "referenceNumber", e.target.value)}
                          placeholder="Optional"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Payment Method</Label>
                      <PaymentMethodSelector
                        value={split.paymentMethodId}
                        onValueChange={(v) => updateSplit(split.id, "paymentMethodId", v)}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSplit} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Method
                </Button>
                {targetAmount > 0 && (
                  <div className={`text-sm text-center font-medium ${Math.abs(splitsDiff) < 0.01 ? "text-green-600" : "text-destructive"}`}>
                    {Math.abs(splitsDiff) < 0.01
                      ? "✓ Splits match the total"
                      : `Remaining: ${formatCurrency(splitsDiff)}`}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <PaymentMethodSelector
                    value={paymentMethodId}
                    onValueChange={setPaymentMethodId}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reference">Reference Number (Optional)</Label>
                  <Input
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Transaction ID, Check number, etc."
                  />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>

          {/* Pay Later Warning */}
          {showPayLaterWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Are you sure?</p>
                <p className="text-sm">
                  The patient will be admitted without payment. The deposit of{" "}
                  {formatCurrency(depositAmount)} will remain pending.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onSkipDeposit}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Skip Deposit
          </Button>
          <Button
            variant="secondary"
            onClick={handlePayLater}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            <Clock className="h-4 w-4 mr-2" />
            {showPayLaterWarning ? "Confirm Pay Later" : "Pay Later"}
          </Button>
          <Button
            onClick={handlePayNow}
            disabled={isProcessing || !isSplitValid || targetAmount <= 0}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Collect Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
