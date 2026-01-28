import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Wallet, CreditCard, Building2, Smartphone } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCreateSettlement } from "@/hooks/useDoctorSettlements";

interface DoctorBalance {
  doctorId: string;
  doctorName: string;
  employeeNumber: string;
  department: string | null;
  totalUnpaid: number;
  consultations: number;
  surgeries: number;
  procedures: number;
  other: number;
  earningIds: string[];
}

interface SettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: DoctorBalance;
  onSuccess: (settlementData: any) => void;
}

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "cheque", label: "Cheque", icon: CreditCard },
  { value: "jazzcash", label: "JazzCash", icon: Smartphone },
  { value: "easypaisa", label: "EasyPaisa", icon: Smartphone },
];

export function SettlementDialog({
  open,
  onOpenChange,
  balance,
  onSuccess,
}: SettlementDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  
  const createSettlement = useCreateSettlement();

  const requiresReference = paymentMethod !== "cash";

  const handleSubmit = async () => {
    const result = await createSettlement.mutateAsync({
      doctorId: balance.doctorId,
      earningIds: balance.earningIds,
      totalAmount: balance.totalUnpaid,
      paymentMethod: paymentMethods.find(m => m.value === paymentMethod)?.label || paymentMethod,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    });

    onSuccess({
      settlementNumber: result.settlement_number,
      doctorName: balance.doctorName,
      employeeNumber: balance.employeeNumber,
      totalAmount: balance.totalUnpaid,
      breakdown: {
        consultations: balance.consultations,
        surgeries: balance.surgeries,
        procedures: balance.procedures,
        other: balance.other,
      },
      paymentMethod: paymentMethods.find(m => m.value === paymentMethod)?.label || paymentMethod,
      referenceNumber,
      date: new Date(),
    });
    
    onOpenChange(false);
    setPaymentMethod("cash");
    setReferenceNumber("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settle Commission Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium">{balance.doctorName}</p>
            <p className="text-sm text-muted-foreground">{balance.employeeNumber}</p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">Earnings Breakdown:</p>
            {balance.consultations > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultations</span>
                <span>{formatCurrency(balance.consultations)}</span>
              </div>
            )}
            {balance.surgeries > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Surgeries</span>
                <span>{formatCurrency(balance.surgeries)}</span>
              </div>
            )}
            {balance.procedures > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Procedures</span>
                <span>{formatCurrency(balance.procedures)}</span>
              </div>
            )}
            {balance.other > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Other</span>
                <span>{formatCurrency(balance.other)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
            <span className="font-semibold">Total to Settle:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(balance.totalUnpaid)}
            </span>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {requiresReference && (
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Transaction/Cheque number"
                />
              </div>
            )}

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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createSettlement.isPending || (requiresReference && !referenceNumber)}
          >
            {createSettlement.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirm Settlement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
