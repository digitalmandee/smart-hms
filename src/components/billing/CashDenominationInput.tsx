import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { CashDenominations, calculateDenominationTotal } from "@/hooks/useBillingSessions";
import { Banknote, Coins } from "lucide-react";

interface CashDenominationInputProps {
  value?: CashDenominations;
  onChange: (denominations: CashDenominations, total: number) => void;
  showTotal?: boolean;
  expectedCash?: number;
  compact?: boolean;
}

interface Denomination {
  key: keyof CashDenominations;
  label: string;
  value: number;
  icon: typeof Banknote | typeof Coins;
  isCoins?: boolean;
}

const DENOMINATIONS: Denomination[] = [
  { key: 'note_5000', label: 'Rs. 5,000', value: 5000, icon: Banknote },
  { key: 'note_1000', label: 'Rs. 1,000', value: 1000, icon: Banknote },
  { key: 'note_500', label: 'Rs. 500', value: 500, icon: Banknote },
  { key: 'note_100', label: 'Rs. 100', value: 100, icon: Banknote },
  { key: 'note_50', label: 'Rs. 50', value: 50, icon: Banknote },
  { key: 'note_20', label: 'Rs. 20', value: 20, icon: Banknote },
  { key: 'note_10', label: 'Rs. 10', value: 10, icon: Banknote },
  { key: 'coins', label: 'Coins', value: 1, icon: Coins, isCoins: true },
];

export function CashDenominationInput({
  value = {},
  onChange,
  showTotal = true,
  expectedCash,
  compact = false,
}: CashDenominationInputProps) {
  const [denominations, setDenominations] = useState<CashDenominations>(value);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = calculateDenominationTotal(denominations);
    setTotal(newTotal);
    onChange(denominations, newTotal);
  }, [denominations]);

  const handleChange = (key: keyof CashDenominations, count: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: Math.max(0, count),
    }));
  };

  const difference = expectedCash !== undefined ? total - expectedCash : null;

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {DENOMINATIONS.map((denom) => (
            <div key={denom.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{denom.label}</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  value={denominations[denom.key as keyof CashDenominations] || ''}
                  onChange={(e) =>
                    handleChange(denom.key as keyof CashDenominations, parseInt(e.target.value) || 0)
                  }
                  className="h-8 text-sm"
                  placeholder="0"
                />
                {!denom.isCoins && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    = {formatCurrency((denominations[denom.key as keyof CashDenominations] || 0) * denom.value)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {showTotal && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-medium">Total Counted:</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="h-5 w-5" />
          Cash Denomination Count
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DENOMINATIONS.map((denom) => {
            const Icon = denom.icon;
            const count = denominations[denom.key as keyof CashDenominations] || 0;
            const subtotal = denom.isCoins ? count : count * denom.value;

            return (
              <div
                key={denom.key}
                className="flex flex-col p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">{denom.label}</Label>
                </div>
                <Input
                  type="number"
                  min="0"
                  value={count || ''}
                  onChange={(e) =>
                    handleChange(denom.key as keyof CashDenominations, parseInt(e.target.value) || 0)
                  }
                  className="text-center text-lg font-semibold"
                  placeholder="0"
                />
                <div className="text-xs text-muted-foreground text-center mt-1">
                  {denom.isCoins ? `Total: ${formatCurrency(subtotal)}` : `× ${denom.value} = ${formatCurrency(subtotal)}`}
                </div>
              </div>
            );
          })}
        </div>

        {showTotal && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Counted:</span>
              <span className="text-2xl font-bold">{formatCurrency(total)}</span>
            </div>

            {expectedCash !== undefined && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Expected Cash:</span>
                  <span>{formatCurrency(expectedCash)}</span>
                </div>
                <div
                  className={`flex justify-between items-center font-semibold ${
                    difference === 0
                      ? 'text-success'
                      : difference! > 0
                      ? 'text-warning'
                      : 'text-destructive'
                  }`}
                >
                  <span>Difference:</span>
                  <span>
                    {difference === 0
                      ? 'Exact Match ✓'
                      : difference! > 0
                      ? `+${formatCurrency(difference!)} (Excess)`
                      : `${formatCurrency(difference!)} (Short)`}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
