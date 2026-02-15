import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useCountryConfig } from "@/contexts/CountryConfigContext";

interface InvoiceTotalsProps {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  paidAmount?: number;
  editable?: boolean;
  onTaxChange?: (value: number) => void;
  onDiscountChange?: (value: number) => void;
}

export function InvoiceTotals({
  subtotal,
  taxAmount,
  discountAmount,
  paidAmount = 0,
  editable = false,
  onTaxChange,
  onDiscountChange,
}: InvoiceTotalsProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const { tax_label } = useCountryConfig();
  const total = subtotal + taxAmount - discountAmount;
  const balance = total - paidAmount;

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

      {paidAmount > 0 && (
        <>
          <div className="flex justify-between text-success">
            <span>Paid</span>
            <span>{formatCurrency(paidAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Balance Due</span>
            <span className={balance > 0 ? "text-destructive" : "text-success"}>
              {formatCurrency(balance)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
