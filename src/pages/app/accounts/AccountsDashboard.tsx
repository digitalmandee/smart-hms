import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAccounts, useFiscalYears, useCurrentFiscalYear } from "@/hooks/useAccounts";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";

export default function AccountsDashboard() {
  const navigate = useNavigate();
  const { data: accounts } = useAccounts({ isActive: true });
  const { data: currentFiscalYear } = useCurrentFiscalYear();

  // Calculate summary figures from accounts
  const summary = accounts?.reduce(
    (acc, account) => {
      const category = account.account_type?.category;
      const balance = account.current_balance || 0;
      
      switch (category) {
        case "asset":
          acc.totalAssets += balance;
          break;
        case "liability":
          acc.totalLiabilities += balance;
          break;
        case "equity":
          acc.totalEquity += balance;
          break;
        case "revenue":
          acc.totalRevenue += balance;
          break;
        case "expense":
          acc.totalExpenses += balance;
          break;
      }
      return acc;
    },
    {
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalRevenue: 0,
      totalExpenses: 0,
    }
  ) || {
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    totalRevenue: 0,
    totalExpenses: 0,
  };

  const netIncome = summary.totalRevenue - summary.totalExpenses;

  const quickActions = [
    {
      title: "New Journal Entry",
      description: "Record a manual journal entry",
      icon: Plus,
      href: "/app/accounts/journal-entries/new",
      color: "text-blue-600",
    },
    {
      title: "Record Payment",
      description: "Record a vendor payment",
      icon: CreditCard,
      href: "/app/accounts/payables/payments/new",
      color: "text-green-600",
    },
    {
      title: "Bank Reconciliation",
      description: "Reconcile bank statements",
      icon: Building2,
      href: "/app/accounts/bank-accounts",
      color: "text-purple-600",
    },
    {
      title: "View Reports",
      description: "Financial statements & reports",
      icon: BarChart3,
      href: "/app/accounts/reports",
      color: "text-orange-600",
    },
  ];

  const moduleLinks = [
    {
      title: "Chart of Accounts",
      description: "Manage account structure",
      icon: BookOpen,
      href: "/app/accounts/chart-of-accounts",
      count: accounts?.length || 0,
    },
    {
      title: "Journal Entries",
      description: "View and create entries",
      icon: FileText,
      href: "/app/accounts/journal-entries",
    },
    {
      title: "General Ledger",
      description: "Account transaction history",
      icon: LayoutDashboard,
      href: "/app/accounts/general-ledger",
    },
    {
      title: "Accounts Receivable",
      description: "Track customer payments",
      icon: Receipt,
      href: "/app/accounts/receivables",
    },
    {
      title: "Accounts Payable",
      description: "Manage vendor payments",
      icon: CreditCard,
      href: "/app/accounts/payables",
    },
    {
      title: "Bank & Cash",
      description: "Bank account management",
      icon: Building2,
      href: "/app/accounts/bank-accounts",
    },
    {
      title: "Financial Reports",
      description: "Statements & analysis",
      icon: BarChart3,
      href: "/app/accounts/reports",
    },
    {
      title: "Budgets",
      description: "Budget planning & tracking",
      icon: PiggyBank,
      href: "/app/accounts/budgets",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts & Finance"
        description="Manage your organization's financial operations"
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
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  No Fiscal Year Configured
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Set up a fiscal year to start tracking financial periods
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/accounts/budgets")}>
              Set Up Fiscal Year
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.totalAssets)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Liabilities</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalLiabilities)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Equity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(summary.totalEquity)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (YTD)</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(netIncome)}
                </p>
              </div>
              {netIncome >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-200" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-200" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate(action.href)}
              >
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {moduleLinks.map((module) => (
          <Card
            key={module.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(module.href)}
          >
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
              {module.count !== undefined && (
                <p className="mt-3 text-2xl font-bold">{module.count}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
