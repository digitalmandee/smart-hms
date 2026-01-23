import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, CreditCard, Wallet, ArrowDownCircle } from "lucide-react";

export type RefundMethod = "cash_refund" | "add_credit" | "deduct_outstanding";

interface RefundMethodSelectorProps {
  value: RefundMethod;
  onChange: (method: RefundMethod) => void;
  refundAmount: number;
  patientName?: string;
  currentCreditBalance?: number; // Positive = patient has credit, Negative = patient owes money
  hasOutstandingCredit?: boolean;
  outstandingAmount?: number;
}

export function RefundMethodSelector({
  value,
  onChange,
  refundAmount,
  patientName,
  currentCreditBalance = 0,
  hasOutstandingCredit = false,
  outstandingAmount = 0,
}: RefundMethodSelectorProps) {
  const showPatientOptions = !!patientName;
  
  // Calculate resulting balances
  const newCreditIfAdded = currentCreditBalance + refundAmount;
  const newOutstandingIfDeducted = Math.max(0, outstandingAmount - refundAmount);
  const remainingToRefund = Math.max(0, refundAmount - outstandingAmount);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">How to process refund?</Label>
      
      <RadioGroup value={value} onValueChange={(v) => onChange(v as RefundMethod)}>
        {/* Cash Refund - Always available */}
        <Card className={`cursor-pointer transition-all ${value === "cash_refund" ? "ring-2 ring-primary" : "hover:border-primary/50"}`}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="cash_refund" id="cash_refund" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-green-600" />
                  <Label htmlFor="cash_refund" className="font-medium cursor-pointer">
                    Cash Refund to Customer
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pay Rs. {refundAmount.toLocaleString()} directly to customer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add to Patient Credit - Only if patient is linked */}
        {showPatientOptions && (
          <Card className={`cursor-pointer transition-all ${value === "add_credit" ? "ring-2 ring-primary" : "hover:border-primary/50"}`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <RadioGroupItem value="add_credit" id="add_credit" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    <Label htmlFor="add_credit" className="font-medium cursor-pointer">
                      Add to Patient Credit
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add Rs. {refundAmount.toLocaleString()} to {patientName}'s credit balance
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-muted-foreground">Current:</span>
                    <span className={currentCreditBalance >= 0 ? "text-green-600" : "text-red-600"}>
                      Rs. {Math.abs(currentCreditBalance).toLocaleString()}
                      {currentCreditBalance >= 0 ? " credit" : " owed"}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-green-600 font-medium">
                      Rs. {newCreditIfAdded.toLocaleString()} credit
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deduct from Outstanding - Only if patient has outstanding balance */}
        {showPatientOptions && hasOutstandingCredit && outstandingAmount > 0 && (
          <Card className={`cursor-pointer transition-all ${value === "deduct_outstanding" ? "ring-2 ring-primary" : "hover:border-primary/50"}`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <RadioGroupItem value="deduct_outstanding" id="deduct_outstanding" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-amber-600" />
                    <Label htmlFor="deduct_outstanding" className="font-medium cursor-pointer">
                      Deduct from Outstanding Balance
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Apply Rs. {Math.min(refundAmount, outstandingAmount).toLocaleString()} to {patientName}'s pending dues
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-muted-foreground">Outstanding:</span>
                    <span className="text-red-600">Rs. {outstandingAmount.toLocaleString()}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className={newOutstandingIfDeducted > 0 ? "text-amber-600" : "text-green-600"}>
                      Rs. {newOutstandingIfDeducted.toLocaleString()}
                      {newOutstandingIfDeducted === 0 && " (Cleared!)"}
                    </span>
                  </div>
                  {remainingToRefund > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      + Rs. {remainingToRefund.toLocaleString()} will be added to credit
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </RadioGroup>
    </div>
  );
}
