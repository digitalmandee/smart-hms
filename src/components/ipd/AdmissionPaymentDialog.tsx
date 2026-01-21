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
import {
  CreditCard,
  Banknote,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Receipt,
} from "lucide-react";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";
import { formatCurrency } from "@/lib/currency";

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

  const handlePayNow = () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return;
    }
    if (!paymentMethodId) {
      return;
    }
    onPaymentComplete({
      amount: paymentAmount,
      paymentMethodId,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    });
  };

  const handlePayLater = () => {
    if (!showPayLaterWarning) {
      setShowPayLaterWarning(true);
      return;
    }
    onPayLater();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
            disabled={isProcessing || !paymentMethodId || parseFloat(amount) <= 0}
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
