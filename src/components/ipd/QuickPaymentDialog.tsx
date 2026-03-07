import { useState } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";
import { useRecordPayment } from "@/hooks/useBilling";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

interface QuickPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  balanceAmount: number;
  onSuccess?: () => void;
}

export function QuickPaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  balanceAmount,
  onSuccess,
}: QuickPaymentDialogProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const [amount, setAmount] = useState(balanceAmount.toString());
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Session requirement for payment
  const { hasActiveSession, session } = useRequireSession("reception");
  const { mutateAsync: recordPayment, isPending } = useRecordPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for active session
    if (!hasActiveSession) {
      toast.error("Please open a billing session first to collect payments");
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!paymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    if (paymentAmount > balanceAmount) {
      toast.error("Payment amount cannot exceed balance");
      return;
    }

    try {
      await recordPayment({
        invoiceId,
        amount: paymentAmount,
        paymentMethodId,
        billingSessionId: session?.id,
        referenceNumber: referenceNumber || undefined,
        notes: notes || `Payment for ${invoiceNumber}`,
      });

      toast.success(`Payment of ${formatCurrency(paymentAmount)} recorded successfully`);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
    }
  };

  const handleQuickAmount = (percentage: number) => {
    setAmount((balanceAmount * percentage / 100).toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Record Payment
          </DialogTitle>
        </DialogHeader>

        {!hasActiveSession ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
            <p className="font-medium mb-2">Session Required</p>
            <p className="text-sm text-muted-foreground">
              Please open a billing session from the Billing Dashboard before collecting payments.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground">Invoice: {invoiceNumber}</p>
              <p className="font-semibold">Balance Due: {formatCurrency(balanceAmount)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={balanceAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(100)}
                >
                  Full
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(50)}
                >
                  50%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(25)}
                >
                  25%
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <PaymentMethodSelector
                value={paymentMethodId}
                onValueChange={setPaymentMethodId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number (Optional)</Label>
              <Input
                id="reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Transaction ID, cheque number, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Record Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
