import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Receipt,
  CreditCard,
  Building2,
  BarChart3,
  PiggyBank,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Wallet,
  AlertTriangle,
  Package,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAccounts, useCurrentFiscalYear } from "@/hooks/useAccounts";
import { format, subDays, startOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganizations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AccountsDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: accounts } = useAccounts({ isActive: true });
  const { data: currentFiscalYear } = useCurrentFiscalYear();
  const { profile } = useAuth();
  const { data: organization } = useOrganization(profile?.organization_id);
  const isWarehouse = organization?.facility_type === "warehouse";

  // Calculate summary figures from accounts
  const summary = accounts?.reduce(
    (acc, account) => {
      const category = account.account_type?.category;
      const balance = account.current_balance || 0;
      switch (category) {
        case "asset": acc.totalAssets += balance; break;
        case "liability": acc.totalLiabilities += balance; break;
        case "equity": acc.totalEquity += balance; break;
        case "revenue": acc.totalRevenue += balance; break;
        case "expense": acc.totalExpenses += balance; break;
      }
      return acc;
    },
    { totalAssets: 0, totalLiabilities: 0, totalEquity: 0, totalRevenue: 0, totalExpenses: 0 }
  ) || { totalAssets: 0, totalLiabilities: 0, totalEquity: 0, totalRevenue: 0, totalExpenses: 0 };

  const netIncome = summary.totalRevenue - summary.totalExpenses;

  // MTD Expenses query
  const monthStart = startOfMonth(new Date()).toISOString();
  const { data: mtdExpenses } = useQuery({
    queryKey: ["mtd-expenses", profile?.organization_id, monthStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select("debit_amount, journal_entry:journal_entries!inner(status, entry_date)")
        .eq("journal_entry.status", "posted")
        .gte("journal_entry.entry_date", monthStart.split("T")[0]);
      if (error) throw error;
      // Sum debit amounts for expense accounts — simplified: total debits in the period
      return (data || []).reduce((sum: number, l: any) => sum + (l.debit_amount || 0), 0);
    },
    enabled: !!profile?.organization_id,
  });

  // Overdue receivables (>30 days, pending/partially_paid)
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split("T")[0];
  const { data: overdueData } = useQuery({
    queryKey: ["overdue-receivables", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, total_amount, paid_amount")
        .in("status", ["pending", "partially_paid"])
        .lte("invoice_date", thirtyDaysAgo);
      if (error) throw error;
      const count = data?.length || 0;
      const total = (data || []).reduce((s: number, i: any) => s + ((i.total_amount || 0) - (i.paid_amount || 0)), 0);
      return { count, total };
    },
    enabled: !!profile?.organization_id,
  });

  // Pending vendor payments (unpaid GRNs)
  const { data: pendingVendorCount } = useQuery({
    queryKey: ["pending-vendor-payments", profile?.organization_id],
    queryFn: async () => {
      const { count, error } = await (supabase
        .from("goods_received_notes") as any)
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "unpaid");
      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.organization_id,
  });

  // Revenue trend (last 7 days) from invoices paid
  const sevenDaysAgo = subDays(new Date(), 7).toISOString().split("T")[0];
  const { data: revenueTrend } = useQuery({
    queryKey: ["revenue-trend-7d", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_date, paid_amount")
        .gte("invoice_date", sevenDaysAgo)
        .in("status", ["paid", "partially_paid"])
        .order("invoice_date", { ascending: true });
      if (error) throw error;
      // Group by date
      const grouped: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
        grouped[d] = 0;
      }
      (data || []).forEach((inv: any) => {
        const d = inv.invoice_date;
        if (grouped[d] !== undefined) grouped[d] += inv.paid_amount || 0;
      });
      return Object.entries(grouped).map(([date, amount]) => ({
        date: format(new Date(date), "dd MMM"),
        amount,
      }));
    },
    enabled: !!profile?.organization_id,
  });

  const quickActions = [
    { title: "New Journal Entry", description: "Record a manual journal entry", icon: Plus, href: "/app/accounts/journal-entries/new", color: "text-blue-600" },
    { title: "Record Payment", description: "Record a vendor payment", icon: CreditCard, href: "/app/accounts/vendor-payments/new", color: "text-green-600" },
    { title: "Bank Reconciliation", description: "Reconcile bank statements", icon: Building2, href: "/app/accounts/bank-accounts", color: "text-purple-600" },
    { title: "View Reports", description: "Financial statements & reports", icon: BarChart3, href: "/app/accounts/reports", color: "text-orange-600" },
  ];

  const moduleLinks = [
    { title: "Chart of Accounts", description: "Manage account structure", icon: BookOpen, href: "/app/accounts/chart-of-accounts", count: accounts?.filter(a => !a.is_header).length || 0 },
    { title: "Journal Entries", description: "View and create entries", icon: FileText, href: "/app/accounts/journal-entries" },
    { title: "General Ledger", description: "Account transaction history", icon: LayoutDashboard, href: "/app/accounts/ledger" },
    ...(!isWarehouse ? [{ title: "Accounts Receivable", description: "Track customer payments", icon: Receipt, href: "/app/accounts/receivables" }] : []),
    { title: "Accounts Payable", description: "Manage vendor payments", icon: CreditCard, href: "/app/accounts/payables" },
    { title: "Bank & Cash", description: "Bank account management", icon: Building2, href: "/app/accounts/bank-accounts" },
    { title: "Financial Reports", description: "Statements & analysis", icon: BarChart3, href: "/app/accounts/reports" },
    { title: "Budgets", description: "Budget planning & tracking", icon: PiggyBank, href: "/app/accounts/budgets" },
    { title: t("nav.expenseManagement" as any, "Expense Management"), description: t("nav.expenseManagementDesc" as any, "Track and manage expenses"), icon: Wallet, href: "/app/accounts/expenses" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts & Finance"
        description={isWarehouse ? "Track warehouse financial operations" : "Manage your organization's financial operations"}
        breadcrumbs={[{ label: "Accounts" }]}
      />

      {/* Fiscal Year Info */}
      {currentFiscalYear ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Current Fiscal Year: {currentFiscalYear.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(currentFiscalYear.start_date), "dd MMM yyyy")} -{" "}
                  {format(new Date(currentFiscalYear.end_date), "dd MMM yyyy")}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/accounts/budgets")}>
              Manage Fiscal Years
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">No Fiscal Year Configured</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Set up a fiscal year to start tracking financial periods</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/accounts/budgets")}>Set Up Fiscal Year</Button>
          </CardContent>
        </Card>
      )}

      {/* Overdue Receivables Alert */}
      {!isWarehouse && overdueData && overdueData.count > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">{t("accounts.overdueReceivables" as any, "Overdue Receivables")}</p>
                <p className="text-sm text-muted-foreground">
                  {overdueData.count} invoice(s) overdue &gt;30 days — {formatCurrency(overdueData.total)} outstanding
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/accounts/receivables")}>
              View
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.totalAssets)}</p>
              </div>
              <TrendingUp className="h-7 w-7 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Liabilities</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalLiabilities)}</p>
              </div>
              <TrendingDown className="h-7 w-7 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Equity</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(summary.totalEquity)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Revenue (YTD)</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className={`text-xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(netIncome)}</p>
              </div>
              {netIncome >= 0 ? <TrendingUp className="h-7 w-7 text-green-200" /> : <TrendingDown className="h-7 w-7 text-red-200" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("accounts.expensesMTD" as any, "Expenses (MTD)")}</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(mtdExpenses || 0)}</p>
              </div>
              <Wallet className="h-7 w-7 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend + Pending Vendor Payments row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("accounts.revenueTrend" as any, "Revenue Trend (Last 7 Days)")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend || []}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={60} />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("accounts.pendingVendorPayments" as any, "Pending Vendor Payments")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Package className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-4xl font-bold">{pendingVendorCount ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Unpaid GRNs</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/app/accounts/payables")}>
              View Payables
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button key={action.title} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate(action.href)}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <div className="text-center">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleLinks.map((module) => (
          <Card key={module.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(module.href)}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <module.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{module.title}</p>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              {module.count !== undefined && <p className="mt-3 text-2xl font-bold">{module.count}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
