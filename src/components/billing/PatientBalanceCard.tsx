import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientBalance } from "@/hooks/useBilling";
import { AlertCircle } from "lucide-react";

interface PatientBalanceCardProps {
  patientId: string | undefined;
}

export function PatientBalanceCard({ patientId }: PatientBalanceCardProps) {
  const { data } = usePatientBalance(patientId);

  if (!patientId || !data || data.outstanding === 0) return null;

  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-warning">
          <AlertCircle className="h-4 w-4" />
          Outstanding Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">Rs. {data.outstanding.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.invoices.length} pending invoice(s)
        </p>
      </CardContent>
    </Card>
  );
}
