import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBillingStats, useInvoices } from "@/hooks/useBilling";
import { useActiveSession } from "@/hooks/useBillingSessions";
import { useAuth } from "@/contexts/AuthContext";
import { ActiveSessionBanner } from "@/components/billing/ActiveSessionBanner";
import { NphiesDashboardCard } from "@/components/insurance/NphiesDashboardCard";
import { OpenSessionDialog } from "@/components/billing/OpenSessionDialog";
import {
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  CalendarCheck,
  Monitor,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export default function BillingDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { data: stats, isLoading: statsLoading } = useBillingStats(profile?.branch_id || undefined);
  const { data: invoices, isLoading: invoicesLoading } = useInvoices(profile?.branch_id || undefined);
  const { data: activeSession } = useActiveSession();
  const [showOpenSession, setShowOpenSession] = useState(false);

  const recentInvoices = invoices?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("billing.dashboard")}
        description={t("billing.dashboardSubtitle")}
        actions={
          <Button onClick={() => navigate("/app/billing/invoices/new")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("billing.createInvoice")}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <StatsCard
              title={t("billing.todayCollections")}
              value={formatCurrency(stats?.todayCollections || 0)}
              icon={DollarSign}
              className="bg-success/10 border-success/20"
            />
            <StatsCard
              title={t("billing.pendingInvoices")}
              value={stats?.pendingCount || 0}
              icon={Clock}
              onClick={() => navigate("/app/billing/invoices?status=pending")}
            />
            <StatsCard
              title={t("billing.outstandingAmount")}
              value={`Rs. ${stats?.pendingAmount?.toLocaleString() || 0}`}
              icon={TrendingUp}
              className="text-warning"
            />
            <StatsCard
              title={t("billing.invoicesToday")}
              value={stats?.invoicesToday || 0}
              icon={FileText}
            />
          </>
        )}
      </div>

      {/* Session Banner */}
      {activeSession && <ActiveSessionBanner />}

      {/* Quick Actions, NPHIES Widget & Recent Invoices */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("billing.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!activeSession ? (
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => setShowOpenSession(true)}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  {t("billing.openSession")}
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/app/billing/invoices/new")}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("billing.createNewInvoice")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/app/billing/invoices?status=pending")}
              >
                <Clock className="mr-2 h-4 w-4" />
                {t("billing.viewPendingInvoices")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/app/billing/daily-closing")}
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                {t("billing.dailyClosing")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/app/reports/day-end-summary")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {t("billing.dayEndSummary")}
              </Button>
            </CardContent>
          </Card>

          {/* NPHIES Dashboard Widget */}
          <NphiesDashboardCard />
        </div>

        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("billing.recentInvoices")}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/billing/invoices")}
            >
              {t("common.viewAll")}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : recentInvoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t("billing.noInvoicesYet")}
              </p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice: any) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/app/billing/invoices/${invoice.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {invoice.invoice_number}
                        </span>
                        <InvoiceStatusBadge status={invoice.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.patient?.first_name} {invoice.patient?.last_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        Rs. {Number(invoice.total_amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(invoice.created_at), "MMM dd")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Open Session Dialog */}
      <OpenSessionDialog
        open={showOpenSession}
        onOpenChange={setShowOpenSession}
        defaultCounterType="reception"
      />
    </div>
  );
}
