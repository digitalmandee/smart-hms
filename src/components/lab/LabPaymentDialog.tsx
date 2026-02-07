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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecordPayment, usePaymentMethods } from "@/hooks/useBilling";
import { useRequireSession } from "@/hooks/useRequireSession";
import { useUpdateLabOrderPayment } from "@/hooks/useLabOrders";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, CreditCard, Banknote, Smartphone, AlertCircle } from "lucide-react";

interface LabPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  invoiceId: string;
  totalAmount: number;
  paidAmount: number;
  patientName: string;
  testNames: string[];
  onSuccess?: () => void;
}

export function LabPaymentDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  invoiceId,
  totalAmount,
  paidAmount,
  patientName,
  testNames,
  onSuccess,
}: LabPaymentDialogProps) {
  const { profile } = useAuth();
  const balance = totalAmount - paidAmount;
  
  const [amount, setAmount] = useState(balance.toString());
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  
  // Session requirement for payment
  const { hasActiveSession, session } = useRequireSession("reception");
  
  const { data: paymentMethods = [] } = usePaymentMethods();
  const recordPayment = useRecordPayment();
  const updateLabOrderPayment = useUpdateLabOrderPayment();

  const handleSubmit = async () => {
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

    if (paymentAmount > balance) {
      toast.error("Amount cannot exceed balance");
      return;
    }

    if (!paymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      // Record the payment with session link
      await recordPayment.mutateAsync({
        invoiceId,
        amount: paymentAmount,
        paymentMethodId,
        billingSessionId: session?.id,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });

      // Determine new payment status
      const newPaidAmount = paidAmount + paymentAmount;
      const newPaymentStatus = newPaidAmount >= totalAmount ? "paid" : "partial";

      // Update lab order payment status
      await updateLabOrderPayment.mutateAsync({
        orderId,
        paymentStatus: newPaymentStatus,
      });

      toast.success("Payment recorded successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    }
  };

  const getPaymentMethodIcon = (code: string) => {
    if (code.includes("card")) return <CreditCard className="h-4 w-4" />;
    if (code.includes("jazz") || code.includes("easy") || code.includes("mobile")) 
      return <Smartphone className="h-4 w-4" />;
    return <Banknote className="h-4 w-4" />;
  };

  const isPending = recordPayment.isPending || updateLabOrderPayment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>
            Record payment for lab order {orderNumber}
          </DialogDescription>
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
          <div className="space-y-4 py-4">
            {/* Order Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium">{patientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tests</span>
                <span className="font-medium">{testNames.length} test(s)</span>
              </div>
              {testNames.length <= 3 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {testNames.map((name, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Amount Details */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Amount</span>
                <span className="font-medium">Rs. {totalAmount.toLocaleString()}</span>
              </div>
              {paidAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Paid</span>
                  <span>Rs. {paidAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold border-t pt-2">
                <span>Balance Due</span>
                <span className="text-primary">Rs. {balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={balance}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(method.code)}
                          {method.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reference Number (Optional)</Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Transaction ID, Receipt #, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          {hasActiveSession && (
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay Rs. ${parseFloat(amount || "0").toLocaleString()}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
