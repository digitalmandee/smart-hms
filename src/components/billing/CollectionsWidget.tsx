import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, AlertTriangle, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { useDashboardBilling } from "@/hooks/useBilling";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";

export function CollectionsWidget() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardBilling();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const {
    todayPending = [],
    overdueInvoices = [],
    todayCollected = 0,
  } = data || {};

  const totalPendingAmount = todayPending.reduce((sum, inv) => {
    const due = (inv.total_amount || 0) - (inv.paid_amount || 0);
    return sum + due;
  }, 0);

  const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => {
    const due = (inv.total_amount || 0) - (inv.paid_amount || 0);
    return sum + due;
  }, 0);

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t("dashboard.collectionsOverview")}
            </CardTitle>
            <CardDescription>{t("dashboard.todaysPendingOverdue")}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/billing/reports")}>
            {t("dashboard.viewReports")}
            <ArrowRight className="ms-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 text-success mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">{t("dashboard.collectedToday")}</span>
            </div>
            <p className="text-lg font-bold">{formatCurrency(todayCollected)}</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 text-warning mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">{t("dashboard.pendingToday")}</span>
            </div>
            <p className="text-lg font-bold">{formatCurrency(totalPendingAmount)}</p>
          </div>
        </div>

        {/* Today's Pending Invoices */}
        {todayPending.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {t("dashboard.todaysPending")} ({todayPending.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {todayPending.slice(0, 3).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/billing/invoices/${invoice.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{invoice.invoice_number}</span>
                    <span className="text-xs text-muted-foreground">
                      {(invoice as any).patients?.first_name} {(invoice as any).patients?.last_name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-warning border-warning">
                    {formatCurrency((invoice.total_amount || 0) - (invoice.paid_amount || 0))}
                  </Badge>
                </div>
              ))}
              {todayPending.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate("/app/billing/invoices?status=pending")}
                >
                  {t("dashboard.viewAllPending")} ({todayPending.length})
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Overdue Invoices */}
        {overdueInvoices.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              {t("dashboard.overdue")} ({overdueInvoices.length})
              <Badge variant="destructive" className="ms-auto">
                {formatCurrency(totalOverdueAmount)}
              </Badge>
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {overdueInvoices.slice(0, 3).map((invoice) => {
                const daysOverdue = Math.floor(
                  (Date.now() - new Date(invoice.invoice_date || invoice.created_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-2 rounded-md bg-destructive/5 hover:bg-destructive/10 cursor-pointer transition-colors border border-destructive/20"
                    onClick={() => navigate(`/app/billing/invoices/${invoice.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{invoice.invoice_number}</span>
                      <span className="text-xs text-destructive">{daysOverdue}{t("dashboard.daysOverdue")}</span>
                    </div>
                    <span className="text-sm font-medium text-destructive">
                      {formatCurrency((invoice.total_amount || 0) - (invoice.paid_amount || 0))}
                    </span>
                  </div>
                );
              })}
              {overdueInvoices.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-destructive hover:text-destructive"
                  onClick={() => navigate("/app/billing/reports")}
                >
                  {t("dashboard.viewAllOverdue")} ({overdueInvoices.length})
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="p-2 rounded-md bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-success">{t("dashboard.noOverdueInvoices")}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.allPaymentsOnTrack")}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
