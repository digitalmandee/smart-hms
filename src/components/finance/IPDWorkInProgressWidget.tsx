import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Stethoscope, ArrowRight } from "lucide-react";
import { useIPDWorkInProgress } from "@/hooks/useFinancialReports";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

/**
 * IPD Work-In-Progress widget — surfaces unbilled ipd_charges as accrued (off-ledger)
 * revenue so management can see services rendered but not yet invoiced.
 *
 * Dashboard-only summary; click-through opens IPD admissions list to act on it.
 */
export function IPDWorkInProgressWidget() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrencyFormatter();
  const { data, isLoading } = useIPDWorkInProgress();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            IPD Work-In-Progress (Unbilled)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalUnbilled === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            IPD Work-In-Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No unbilled IPD charges. All services are invoiced.</p>
        </CardContent>
      </Card>
    );
  }

  const top = data.byAdmission.slice(0, 5);

  return (
    <Card className="border-amber-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-amber-600" />
              IPD Work-In-Progress (Unbilled Revenue)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Services rendered but not yet invoiced — accrued off-ledger
            </p>
          </div>
          <Badge variant="outline" className="border-amber-500/40 text-amber-700">Accrual</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Unbilled Total</p>
            <p className="text-xl font-bold text-amber-700">{formatCurrency(data.totalUnbilled)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Admissions</p>
            <p className="text-xl font-bold">{data.admissionCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Charge Lines</p>
            <p className="text-xl font-bold">{data.chargeCount}</p>
          </div>
        </div>

        {top.length > 0 && (
          <div className="border-t pt-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">Top accruing admissions</p>
            {top.map((a) => (
              <div key={a.admission} className="flex items-center justify-between text-sm">
                <div className="truncate">
                  <span className="font-mono text-xs text-muted-foreground">{a.admission}</span>
                  <span className="ml-2">{a.patient}</span>
                </div>
                <span className="font-mono">{formatCurrency(a.amount)}</span>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/app/ipd/admissions")}>
          Review IPD Admissions
          <ArrowRight className="ml-2 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
