import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, FileSpreadsheet, PieChart, 
  TrendingUp, ArrowRight, DollarSign, Scale,
  FileText, Building2, Package, Wallet, Receipt, Landmark
} from "lucide-react";
import { useFinancialSummary } from "@/hooks/useFinancialReports";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinancialReportsPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useFinancialSummary();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const reports = [
    {
      title: "Trial Balance",
      description: "View all account balances with debits and credits",
      icon: Scale,
      path: "/app/accounts/reports/trial-balance",
      color: "text-blue-500",
    },
    {
      title: "Profit & Loss Statement",
      description: "Revenue, expenses, and net income analysis",
      icon: TrendingUp,
      path: "/app/accounts/reports/profit-loss",
      color: "text-green-500",
    },
    {
      title: "Balance Sheet",
      description: "Assets, liabilities, and equity snapshot",
      icon: FileSpreadsheet,
      path: "/app/accounts/reports/balance-sheet",
      color: "text-purple-500",
    },
    {
      title: "Cash Flow Statement",
      description: "Operating, investing, and financing activities",
      icon: DollarSign,
      path: "/app/accounts/reports/cash-flow",
      color: "text-orange-500",
    },
    {
      title: "Revenue by Source",
      description: "Breakdown of revenue streams and sources",
      icon: PieChart,
      path: "/app/accounts/reports/revenue-by-source",
      color: "text-cyan-500",
    },
    {
      title: "Cost Center P&L",
      description: "Profit & Loss by department / cost center",
      icon: Building2,
      path: "/app/accounts/reports/cost-center-pnl",
      color: "text-indigo-500",
    },
  ];

  const modules = [
    {
      title: "Credit & Debit Notes",
      description: "Issue credit notes for refunds, returns, adjustments",
      icon: FileText,
      path: "/app/accounts/credit-notes",
      color: "text-rose-500",
    },
    {
      title: "Cost Centers",
      description: "Manage cost centers for departmental tracking",
      icon: Building2,
      path: "/app/accounts/cost-centers",
      color: "text-indigo-500",
    },
    {
      title: "Fixed Asset Register",
      description: "Equipment depreciation and asset lifecycle",
      icon: Package,
      path: "/app/accounts/fixed-assets",
      color: "text-amber-500",
    },
    {
      title: "Patient Deposits",
      description: "Advance deposits, wallet, and refund management",
      icon: Wallet,
      path: "/app/accounts/patient-deposits",
      color: "text-teal-500",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        description="Generate and view financial statements"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Financial Reports" },
        ]}
      />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary?.totalRevenue || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary?.totalCollected || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary?.totalOutstanding || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                  <PieChart className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(summary?.collectionRate || 0).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Report Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.path} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(report.path)}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${report.color}`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Finance Modules */}
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((mod) => (
            <Card key={mod.path} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(mod.path)}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${mod.color}`}>
                    <mod.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{mod.title}</CardTitle>
                    <CardDescription>{mod.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>


        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common financial operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => navigate("/app/accounts/journal-entries")}>
                Journal Entries
              </Button>
              <Button variant="outline" onClick={() => navigate("/app/accounts/ledger")}>
                General Ledger
              </Button>
              <Button variant="outline" onClick={() => navigate("/app/accounts/chart-of-accounts")}>
                Chart of Accounts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
