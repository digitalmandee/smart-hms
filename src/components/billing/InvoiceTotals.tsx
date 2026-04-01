import { Input } from "@/components/ui/input";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useCountryConfig } from "@/contexts/CountryConfigContext";

interface InvoiceTotalsProps {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  paidAmount?: number;
  depositApplied?: number;
  depositAvailable?: number;
  remainingDeposit?: number;
  previousCashPayments?: number;
  thisPayment?: number;
  editable?: boolean;
  onTaxChange?: (value: number) => void;
  onDiscountChange?: (value: number) => void;
}

export function InvoiceTotals({
  subtotal,
  taxAmount,
  discountAmount,
  paidAmount = 0,
  depositApplied = 0,
  depositAvailable,
  remainingDeposit,
  previousCashPayments,
  thisPayment,
  editable = false,
  onTaxChange,
  onDiscountChange,
}: InvoiceTotalsProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const { tax_label } = useCountryConfig();
  const total = subtotal + taxAmount - discountAmount;

  // Calculate settlement
  const cashPayments = previousCashPayments ?? Math.max(paidAmount - depositApplied, 0);
  const totalSettled = depositApplied + cashPayments + (thisPayment || 0);
  const balanceDue = Math.max(total - totalSettled, 0);
  const refundDue = totalSettled > total ? totalSettled - total : 0;
  const isFullySettled = totalSettled > 0 && balanceDue === 0 && refundDue === 0;

  const showDepositSection = depositApplied > 0 || (depositAvailable !== undefined && depositAvailable > 0);

  return (
    <div className="space-y-4 text-sm">
      {/* Section 1: Invoice Totals */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{tax_label}</span>
          {editable ? (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={taxAmount}
              onChange={(e) => onTaxChange?.(parseFloat(e.target.value) || 0)}
              className="w-28 text-right h-8"
            />
          ) : (
            <span>{formatCurrency(taxAmount)}</span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Discount</span>
          {editable ? (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={discountAmount}
              onChange={(e) => onDiscountChange?.(parseFloat(e.target.value) || 0)}
              className="w-28 text-right h-8"
            />
          ) : (
            <span>- {formatCurrency(discountAmount)}</span>
          )}
        </div>

        <div className="border-t pt-2 flex justify-between font-semibold text-base">
          <span>Net Invoice Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Section 2: Deposit Utilization */}
      {showDepositSection && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deposit Utilization</p>
          {depositAvailable !== undefined && depositAvailable > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit Available</span>
              <span>{formatCurrency(depositAvailable)}</span>
            </div>
          )}
          {depositApplied > 0 && (
            <div className="flex justify-between text-success">
              <span>Deposit Applied</span>
              <span>- {formatCurrency(depositApplied)}</span>
            </div>
          )}
          {remainingDeposit !== undefined && remainingDeposit > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining Deposit</span>
              <span>{formatCurrency(remainingDeposit)}</span>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Settlement Details */}
      {(paidAmount > 0 || thisPayment) && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Settlement Details</p>
          {cashPayments > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Previous Cash Payments</span>
              <span>{formatCurrency(cashPayments)}</span>
            </div>
          )}
          {thisPayment !== undefined && thisPayment > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">This Payment</span>
              <span>{formatCurrency(thisPayment)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total Settled</span>
            <span>{formatCurrency(totalSettled)}</span>
          </div>

          {/* Balance / Refund / Fully Settled */}
          {refundDue > 0 ? (
            <div className="flex justify-between font-semibold text-lg">
              <span>Refund Due</span>
              <span className="text-info">{formatCurrency(refundDue)}</span>
            </div>
          ) : balanceDue > 0 ? (
            <div className="flex justify-between font-semibold text-lg">
              <span>Balance Due</span>
              <span className="text-destructive">{formatCurrency(balanceDue)}</span>
            </div>
          ) : isFullySettled ? (
            <div className="flex justify-between font-semibold text-lg">
              <span>Status</span>
              <span className="text-success">Fully Settled</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
