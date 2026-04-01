import { Input } from "@/components/ui/input";

import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useCountryConfig } from "@/contexts/CountryConfigContext";

interface InvoiceTotalsProps {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  paidAmount?: number;
  depositApplied?: number;
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
  editable = false,
  onTaxChange,
  onDiscountChange,
}: InvoiceTotalsProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const { tax_label } = useCountryConfig();
  const total = subtotal + taxAmount - discountAmount;
  const cashCollected = Math.max(paidAmount - depositApplied, 0);
  const balance = total - paidAmount;
  const refundDue = paidAmount > total ? paidAmount - total : 0;

  return (
    <div className="space-y-3 text-sm">
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

      <div className="border-t pt-3 flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {/* Deposit + Cash breakdown when deposit was applied */}
      {depositApplied > 0 && (
        <>
          <div className="flex justify-between text-success">
            <span>Deposit Applied</span>
            <span>- {formatCurrency(depositApplied)}</span>
          </div>
          {cashCollected > 0 && (
            <div className="flex justify-between text-success">
              <span>Cash Collected</span>
              <span>- {formatCurrency(cashCollected)}</span>
            </div>
          )}
        </>
      )}

      {/* Fallback: show single Paid line when no deposit breakdown */}
      {depositApplied === 0 && paidAmount > 0 && (
        <div className="flex justify-between text-success">
          <span>Paid</span>
          <span>{formatCurrency(paidAmount)}</span>
        </div>
      )}

      {/* Balance / Refund / Fully Settled */}
      {refundDue > 0 ? (
        <div className="flex justify-between font-semibold text-lg">
          <span>Refund Due</span>
          <span className="text-info">{formatCurrency(refundDue)}</span>
        </div>
      ) : balance > 0 ? (
        <div className="flex justify-between font-semibold text-lg">
          <span>Balance Due</span>
          <span className="text-destructive">{formatCurrency(balance)}</span>
        </div>
      ) : paidAmount > 0 ? (
        <div className="flex justify-between font-semibold text-lg">
          <span>Status</span>
          <span className="text-success">Fully Settled</span>
        </div>
      ) : null}
    </div>
  );
}
