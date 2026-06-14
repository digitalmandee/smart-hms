import { Link } from "react-router-dom";
import { format, startOfMonth } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useGlCoverageReport, useTrialBalanceHealth } from "@/hooks/useAccountingIntegrity";

/**
 * Compact dashboard banner. Renders only when there is something to act on,
 * or as a quiet "all clear" line if everything is healthy.
 */
export function AccountingIntegrityBanner() {
  const today = new Date();
  const start = format(startOfMonth(today), "yyyy-MM-dd");
  const end = format(today, "yyyy-MM-dd");

  const tb = useTrialBalanceHealth(start, end);
  const cov = useGlCoverageReport(start, end);

  if (tb.isLoading || cov.isLoading) return null;

  const unbalanced = (tb.data || []).filter(r => !r.is_balanced).length;
  const orphans = (cov.data || []).reduce((s, r) => s + Number(r.orphan_count || 0), 0);

  if (unbalanced === 0 && orphans === 0) {
    return (
      <Alert>
        <ShieldCheck className="h-4 w-4 text-success" />
        <AlertTitle>Accounting integrity: healthy</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Trial balance is balanced and every source row has a journal entry for this month.</span>
          <Button variant="link" size="sm" asChild>
            <Link to="/app/accounts/integrity">Open report <ArrowRight className="h-3 w-3 ml-1" /></Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Accounting integrity needs attention</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>
          {unbalanced > 0 && <>{unbalanced} unbalanced month{unbalanced > 1 ? "s" : ""}. </>}
          {orphans > 0 && <>{orphans} source row{orphans > 1 ? "s" : ""} missing a journal entry.</>}
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link to="/app/accounts/integrity">
            Investigate <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
