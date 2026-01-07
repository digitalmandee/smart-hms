import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBillingStats, useInvoices } from "@/hooks/useBilling";
import { useAuth } from "@/contexts/AuthContext";
import {
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useBillingStats(profile?.branch_id || undefined);
  const { data: invoices, isLoading: invoicesLoading } = useInvoices(profile?.branch_id || undefined);

  const recentInvoices = invoices?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Dashboard"
        description="Manage invoices, payments, and collections"
        actions={
          <Button onClick={() => navigate("/app/billing/invoices/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
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
              title="Today's Collections"
              value={`Rs. ${stats?.todayCollections?.toLocaleString() || 0}`}
              icon={DollarSign}
              className="bg-success/10 border-success/20"
            />
            <StatsCard
              title="Pending Invoices"
              value={stats?.pendingCount || 0}
              icon={Clock}
              onClick={() => navigate("/app/billing/invoices?status=pending")}
            />
            <StatsCard
              title="Outstanding Amount"
              value={`Rs. ${stats?.pendingAmount?.toLocaleString() || 0}`}
              icon={TrendingUp}
              className="text-warning"
            />
            <StatsCard
              title="Invoices Today"
              value={stats?.invoicesToday || 0}
              icon={FileText}
            />
          </>
        )}
      </div>

      {/* Quick Actions & Recent Invoices */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/app/billing/invoices/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Invoice
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/app/billing/invoices?status=pending")}
            >
              <Clock className="mr-2 h-4 w-4" />
              View Pending Invoices
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/app/billing/payments")}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Payment History
            </Button>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/billing/invoices")}
            >
              View All
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
                No invoices yet
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
    </div>
  );
}
