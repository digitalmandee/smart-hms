import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
  LayoutDashboard, FileText, BookOpen, Receipt, CreditCard, Building2,
  BarChart3, PiggyBank, Plus, ArrowRight, TrendingUp, TrendingDown,
  Clock, AlertCircle, Wallet, AlertTriangle, Package, Target, DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAccounts, useCurrentFiscalYear } from "@/hooks/useAccounts";
import { format, subDays, startOfMonth, subMonths, differenceInDays } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganizations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(210, 70%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(45, 90%, 50%)",
];

export default function AccountsDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
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
        .select("debit_amount, journal_entry:journal_entries!inner(is_posted, entry_date)")
        .eq("journal_entry.is_posted", true)
        .gte("journal_entry.entry_date", monthStart.split("T")[0]);
      if (error) throw error;
      return (data || []).reduce((sum: number, l: any) => sum + (l.debit_amount || 0), 0);
    },
    enabled: !!profile?.organization_id,
  });

  // Overdue receivables (>30 days)
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

  // Pending vendor payments
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

  // Revenue trend (last 12 months)
  const twelveMonthsAgo = subMonths(new Date(), 12).toISOString().split("T")[0];
  const { data: revenueTrend12 } = useQuery({
    queryKey: ["revenue-trend-12m", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_date, paid_amount")
        .gte("invoice_date", twelveMonthsAgo)
        .in("status", ["paid", "partially_paid"])
        .order("invoice_date", { ascending: true });
      if (error) throw error;
      const grouped: Record<string, number> = {};
      for (let i = 11; i >= 0; i--) {
        const d = format(subMonths(new Date(), i), "yyyy-MM");
        grouped[d] = 0;
      }
      (data || []).forEach((inv: any) => {
        const m = inv.invoice_date?.substring(0, 7);
        if (m && grouped[m] !== undefined) grouped[m] += inv.paid_amount || 0;
      });
      return Object.entries(grouped).map(([month, amount]) => ({
        month: format(new Date(month + "-01"), "MMM yy"),
        amount,
      }));
    },
    enabled: !!profile?.organization_id,
  });

  // DSO (Days Sales Outstanding)
  const { data: dsoData } = useQuery({
    queryKey: ["dso", profile?.organization_id],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("invoice_date, total_amount, paid_amount, status")
        .in("status", ["pending", "partially_paid", "paid"])
        .gte("invoice_date", subMonths(new Date(), 3).toISOString().split("T")[0]);
      if (error) throw error;
      if (!invoices || invoices.length === 0) return { dso: 0, collectionRate: 0 };

      const totalRevenue = invoices.reduce((s: number, i: any) => s + (i.total_amount || 0), 0);
      const totalCollected = invoices.reduce((s: number, i: any) => s + (i.paid_amount || 0), 0);
      const totalOutstanding = totalRevenue - totalCollected;
      const avgDailyRevenue = totalRevenue / 90;
      const dso = avgDailyRevenue > 0 ? Math.round(totalOutstanding / avgDailyRevenue) : 0;
      const collectionRate = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;
      return { dso, collectionRate };
    },
    enabled: !!profile?.organization_id,
  });

  // AR Aging buckets
  const { data: arAging } = useQuery({
    queryKey: ["ar-aging-buckets", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_date, total_amount, paid_amount")
        .in("status", ["pending", "partially_paid"]);
      if (error) throw error;
      const buckets = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
      const today = new Date();
      (data || []).forEach((inv: any) => {
        const outstanding = (inv.total_amount || 0) - (inv.paid_amount || 0);
        const age = differenceInDays(today, new Date(inv.invoice_date));
        if (age <= 30) buckets.current += outstanding;
        else if (age <= 60) buckets.days30 += outstanding;
        else if (age <= 90) buckets.days60 += outstanding;
        else buckets.over90 += outstanding;
      });
      return [
        { name: "0-30", value: buckets.current },
        { name: "31-60", value: buckets.days30 },
        { name: "61-90", value: buckets.days60 },
        { name: "90+", value: buckets.over90 },
      ];
    },
    enabled: !!profile?.organization_id && !isWarehouse,
  });

  // Cash position (bank + cash accounts)
  const cashPosition = useMemo(() => {
    if (!accounts) return 0;
    return accounts
      .filter(a => !a.is_header && a.account_type?.category === "asset" && 
        (a.name.toLowerCase().includes("cash") || a.name.toLowerCase().includes("bank")))
      .reduce((s, a) => s + (a.current_balance || 0), 0);
  }, [accounts]);

  const quickActions = [
    { title: "New Journal Entry", description: "Record a manual journal entry", icon: Plus, href: "/app/accounts/journal-entries/new", color: "text-primary" },
    { title: "Record Payment", description: "Record a vendor payment", icon: CreditCard, href: "/app/accounts/vendor-payments/new", color: "text-primary" },
    { title: "Bank Reconciliation", description: "Reconcile bank statements", icon: Building2, href: "/app/accounts/bank-reconciliation", color: "text-primary" },
    { title: "View Reports", description: "Financial statements & reports", icon: BarChart3, href: "/app/accounts/reports", color: "text-primary" },
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
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium">No Fiscal Year Configured</p>
                <p className="text-sm text-muted-foreground">Set up a fiscal year to start tracking financial periods</p>
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
                <p className="font-medium text-destructive">Overdue Receivables</p>
                <p className="text-sm text-muted-foreground">
                  {overdueData.count} invoice(s) overdue &gt;30 days — {formatCurrency(overdueData.total)} outstanding
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/accounts/receivables")}>View</Button>
          </CardContent>
        </Card>
      )}

      {/* Financial KPIs — 8 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-xl font-bold">{formatCurrency(summary.totalAssets)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-xl font-bold">{formatCurrency(summary.totalLiabilities)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Revenue (YTD)</p>
            <p className="text-xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Net Income</p>
            <p className={`text-xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-destructive"}`}>{formatCurrency(netIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cash Position</p>
                <p className="text-xl font-bold">{formatCurrency(cashPosition)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">DSO (Days)</p>
                <p className="text-xl font-bold">{dsoData?.dso ?? "—"}</p>
              </div>
              <Target className="h-6 w-6 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Collection Rate</p>
            <p className="text-xl font-bold">{dsoData?.collectionRate ?? 0}%</p>
            <Progress value={dsoData?.collectionRate ?? 0} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expenses (MTD)</p>
                <p className="text-xl font-bold">{formatCurrency(mtdExpenses || 0)}</p>
              </div>
              <Wallet className="h-6 w-6 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend (12 months) + AR Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend12 || []}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {!isWarehouse && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">AR Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={arAging || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => value > 0 ? `${name}` : ""}>
                      {(arAging || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                {(arAging || []).map((b, i) => (
                  <div key={b.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{b.name}: {formatCurrency(b.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pending Vendor Payments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Package className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-4xl font-bold">{pendingVendorCount ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Unpaid GRNs</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/app/accounts/payables")}>
              View Payables
            </Button>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Button key={action.title} variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5" onClick={() => navigate(action.href)}>
                  <action.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
