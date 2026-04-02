import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientBalance } from "@/hooks/useBilling";
import { useDepositBalance } from "@/hooks/usePatientDeposits";
import { AlertCircle, Wallet } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface PatientBalanceCardProps {
  patientId: string | undefined;
}

export function PatientBalanceCard({ patientId }: PatientBalanceCardProps) {
  const { data: outstandingData } = usePatientBalance(patientId);
  const { data: depositData } = useDepositBalance(patientId);
  const { formatCurrency } = useCurrencyFormatter();

  const hasOutstanding = patientId && outstandingData && outstandingData.outstanding > 0;
  const hasDeposit = patientId && depositData && depositData.balance > 0;

  if (!hasOutstanding && !hasDeposit) return null;

  return (
    <div className="space-y-3">
      {hasOutstanding && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-warning">
              <AlertCircle className="h-4 w-4" />
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(outstandingData.outstanding)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {outstandingData.invoices.length} pending invoice(s)
            </p>
          </CardContent>
        </Card>
      )}

      {hasDeposit && (
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-600">
              <Wallet className="h-4 w-4" />
              Available Deposit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(depositData.balance)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Available credit — apply during payment collection. Invoice total stays unchanged.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
