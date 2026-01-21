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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecordCreditPayment } from "@/hooks/usePharmacyCredits";
import { Banknote, CreditCard, Smartphone, Loader2 } from "lucide-react";

interface PharmacyCreditPaymentModalProps {
  open: boolean;
  onClose: () => void;
  credit: {
    id: string;
    amount: number;
    paid_amount: number;
    notes?: string | null;
  } | null;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "jazzcash", label: "JazzCash", icon: Smartphone },
  { value: "easypaisa", label: "EasyPaisa", icon: Smartphone },
];

export function PharmacyCreditPaymentModal({
  open,
  onClose,
  credit,
}: PharmacyCreditPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  
  const recordPayment = useRecordCreditPayment();

  if (!credit) return null;

  const outstanding = credit.amount - credit.paid_amount;
  const paymentAmount = parseFloat(amount) || 0;
  const isValid = paymentAmount > 0 && paymentAmount <= outstanding;

  const handleConfirm = async () => {
    if (!isValid) return;

    await recordPayment.mutateAsync({
      creditId: credit.id,
      amount: paymentAmount,
      paymentMethod,
      referenceNumber: reference || undefined,
      notes: `Payment collected - ${paymentMethod}${reference ? ` (Ref: ${reference})` : ""}`,
    });

    // Reset and close
    setAmount("");
    setReference("");
    setPaymentMethod("cash");
    onClose();
  };

  const handleClose = () => {
    setAmount("");
    setReference("");
    setPaymentMethod("cash");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>
            Outstanding: Rs. {outstanding.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="grid grid-cols-4 w-full">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="text-xs">
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {["card", "jazzcash", "easypaisa"].includes(paymentMethod) && (
              <TabsContent value={paymentMethod} className="mt-4">
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    placeholder="Enter reference number"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>

          <div className="space-y-2">
            <Label>Amount (Rs.)</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={outstanding}
            />
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(outstanding.toString())}
              >
                Full Amount
              </Button>
              {outstanding >= 100 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(Math.floor(outstanding / 2).toString())}
                >
                  Half
                </Button>
              )}
            </div>
          </div>

          {credit.notes && (
            <p className="text-sm text-muted-foreground">
              Note: {credit.notes}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || recordPayment.isPending}
          >
            {recordPayment.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Collect Rs. {paymentAmount.toLocaleString()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
