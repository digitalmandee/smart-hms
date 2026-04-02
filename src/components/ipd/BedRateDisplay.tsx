import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Banknote, Calendar, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { BedTypeRate, getBedDailyRate, calculateSuggestedDeposit } from "@/hooks/useIPDBedTypeRates";
import { differenceInDays } from "date-fns";

interface BedRateDisplayProps {
  bedType: string | null | undefined;
  bedNumber?: string;
  wardName?: string;
  bedTypeRates?: BedTypeRate[];
  expectedDischargeDate?: Date | null;
  admissionDate?: Date;
  procedureCharge?: number;
  procedureName?: string;
  onSuggestedDepositChange?: (amount: number) => void;
}

export function BedRateDisplay({
  bedType,
  bedNumber,
  wardName,
  bedTypeRates,
  expectedDischargeDate,
  admissionDate = new Date(),
  onSuggestedDepositChange,
}: BedRateDisplayProps) {
  const dailyRate = getBedDailyRate(bedType, bedTypeRates);
  
  const expectedDays = expectedDischargeDate
    ? Math.max(1, differenceInDays(expectedDischargeDate, admissionDate) + 1)
    : null;

  const estimatedRoomCost = expectedDays ? expectedDays * dailyRate : null;
  const suggestedDeposit = expectedDays 
    ? calculateSuggestedDeposit(expectedDays, dailyRate)
    : null;

  // Notify parent of suggested deposit
  if (onSuggestedDepositChange && suggestedDeposit) {
    onSuggestedDepositChange(suggestedDeposit);
  }

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="p-4 space-y-3">
        {/* Bed Info */}
        <div className="flex items-center gap-2">
          <Bed className="h-4 w-4 text-primary" />
          <span className="font-medium">
            {bedNumber ? `Bed ${bedNumber}` : "Selected Bed"}
          </span>
          {bedType && (
            <Badge variant="secondary" className="text-xs">
              {bedType}
            </Badge>
          )}
        </div>

        {wardName && (
          <p className="text-sm text-muted-foreground">
            Ward: {wardName}
          </p>
        )}

        {/* Daily Rate */}
        <div className="flex items-center justify-between py-2 border-t border-dashed">
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <span>Daily Rate:</span>
          </div>
          <span className="font-semibold text-primary">
            {formatCurrency(dailyRate)}/day
          </span>
        </div>

        {/* Expected Stay & Estimated Cost */}
        {expectedDays && (
          <>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Expected Stay:</span>
              </div>
              <span className="font-medium">
                {expectedDays} {expectedDays === 1 ? "day" : "days"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span>Est. Room Cost:</span>
              </div>
              <span className="font-semibold">
                {formatCurrency(estimatedRoomCost!)}
              </span>
            </div>

            {suggestedDeposit && (
              <div className="flex items-center justify-between py-2 bg-primary/10 rounded-md px-3 -mx-1">
                <span className="text-sm font-medium">Suggested Deposit (60%):</span>
                <span className="font-bold text-primary">
                  {formatCurrency(suggestedDeposit)}
                </span>
              </div>
            )}
          </>
        )}

        {!expectedDays && (
          <p className="text-xs text-muted-foreground italic">
            Set expected discharge date to see cost estimate
          </p>
        )}
      </CardContent>
    </Card>
  );
}
