import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DailyClosingSummary as SummaryType } from "@/hooks/useDailyClosing";
import { formatCurrency } from "@/lib/currency";
import {
  DollarSign,
  CreditCard,
  Smartphone,
  Receipt,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface DailyClosingSummaryProps {
  summary: SummaryType;
  showDepartments?: boolean;
  showReconciliation?: boolean;
}

export function DailyClosingSummaryCard({
  summary,
  showDepartments = true,
  showReconciliation = true,
}: DailyClosingSummaryProps) {
  const hasOpenSessions = summary.sessions.open > 0;
  const hasCashDiscrepancy = summary.cashReconciliation.difference !== 0;

  return (
    <div className="space-y-4">
      {/* Warning for open sessions */}
      {hasOpenSessions && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning">
          <AlertTriangle className="h-5 w-5" />
          <span>
            <strong>{summary.sessions.open}</strong> session(s) still open. Close all
            sessions before finalizing daily closing.
          </span>
        </div>
      )}

      {/* Collection Totals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Today's Collections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 text-success">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Cash</span>
              </div>
              <p className="text-xl font-bold mt-1">
                {formatCurrency(summary.collections.cash)}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Card</span>
              </div>
              <p className="text-xl font-bold mt-1">
                {formatCurrency(summary.collections.card)}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-accent/30 border border-accent">
              <div className="flex items-center gap-2 text-accent-foreground">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm">UPI/Online</span>
              </div>
              <p className="text-xl font-bold mt-1">
                {formatCurrency(summary.collections.upi)}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-muted border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Total</span>
              </div>
              <p className="text-xl font-bold mt-1">
                {formatCurrency(summary.collections.total)}
              </p>
            </div>
          </div>

          {/* Expenses & Net Cash */}
          {summary.expenses && summary.expenses.total > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm">Expenses</span>
                </div>
                <p className="text-xl font-bold mt-1">
                  -{formatCurrency(summary.expenses.total)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Cash Expenses</span>
                </div>
                <p className="text-xl font-bold mt-1">
                  -{formatCurrency(summary.expenses.cash)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Net Cash</span>
                </div>
                <p className="text-xl font-bold mt-1">
                  {formatCurrency(summary.netCash)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <Badge variant="outline">{summary.sessions.total}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Open:</span>
              <Badge
                variant={summary.sessions.open > 0 ? 'destructive' : 'secondary'}
              >
                {summary.sessions.open}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Closed:</span>
              <Badge variant="secondary">{summary.sessions.closed}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      {showDepartments && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'OPD', value: summary.departments.opd },
                { label: 'IPD', value: summary.departments.ipd },
                { label: 'Pharmacy', value: summary.departments.pharmacy },
                { label: 'Lab', value: summary.departments.lab },
                { label: 'Radiology', value: summary.departments.radiology },
                { label: 'Emergency', value: summary.departments.er },
                { label: 'Other', value: summary.departments.other },
              ]
                .filter((d) => d.value > 0)
                .map((dept) => (
                  <div
                    key={dept.label}
                    className="flex justify-between items-center p-2 rounded bg-muted/50"
                  >
                    <span className="text-sm text-muted-foreground">{dept.label}</span>
                    <span className="font-medium">{formatCurrency(dept.value)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cash Reconciliation */}
      {showReconciliation && summary.sessions.closed > 0 && (
        <Card className={hasCashDiscrepancy ? 'border-warning' : 'border-success'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cash Reconciliation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Expected Cash:</span>
              <span>{formatCurrency(summary.cashReconciliation.expected)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Actual Cash:</span>
              <span>{formatCurrency(summary.cashReconciliation.actual)}</span>
            </div>
            <div
              className={`flex justify-between items-center font-semibold pt-2 border-t ${
                hasCashDiscrepancy ? 'text-warning' : 'text-success'
              }`}
            >
              <span>Difference:</span>
              <span>
                {summary.cashReconciliation.difference === 0
                  ? 'Exact Match ✓'
                  : summary.cashReconciliation.difference > 0
                  ? `+${formatCurrency(summary.cashReconciliation.difference)}`
                  : formatCurrency(summary.cashReconciliation.difference)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outstanding */}
      {summary.invoices.pendingAmount > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Outstanding Receivables:</span>
              <span className="text-lg font-bold text-destructive">
                {formatCurrency(summary.invoices.pendingAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.invoices.pending} pending invoice(s) from today
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
