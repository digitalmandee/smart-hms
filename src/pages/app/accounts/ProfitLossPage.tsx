import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Printer, Download, TrendingUp, TrendingDown, Calendar, GitCompare } from "lucide-react";
import { useProfitLoss } from "@/hooks/useFinancialReports";
import { format, subMonths, differenceInDays } from "date-fns";
import { exportToCSV, formatCurrency as exportFormatCurrency } from "@/lib/exportUtils";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export default function ProfitLossPage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [compareMode, setCompareMode] = useState(false);
  const [hideZero, setHideZero] = useState(true);

  const { data: rawData, isLoading } = useProfitLoss(startDate, endDate);

  // Apply hide-zero filter (default ON to declutter)
  const data = useMemo(() => {
    if (!rawData || !hideZero) return rawData;
    return {
      ...rawData,
      revenue: { ...rawData.revenue, items: rawData.revenue.items.filter((i) => Math.abs(i.amount) > 0.01) },
      cogs: rawData.cogs ? { ...rawData.cogs, items: rawData.cogs.items.filter((i) => Math.abs(i.amount) > 0.01) } : rawData.cogs,
      expenses: { ...rawData.expenses, items: rawData.expenses.items.filter((i) => Math.abs(i.amount) > 0.01) },
    };
  }, [rawData, hideZero]);

  // Calculate previous period dates for comparison
  const periodDays = differenceInDays(new Date(endDate), new Date(startDate));
  const prevEndDate = format(subMonths(new Date(startDate), 0), "yyyy-MM-dd");
  const prevStartStr = format(new Date(new Date(startDate).getTime() - (periodDays + 1) * 86400000), "yyyy-MM-dd");
  const prevEndStr = format(new Date(new Date(startDate).getTime() - 86400000), "yyyy-MM-dd");

  const { data: prevData } = useProfitLoss(
    compareMode ? prevStartStr : undefined,
    compareMode ? prevEndStr : undefined
  );

  const { formatCurrency } = useCurrencyFormatter();

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    if (!data) return;
    const rows = [
      ...data.revenue.items.map(i => ({ section: "Revenue", account: i.account_name, amount: i.amount })),
      { section: "Revenue", account: "TOTAL REVENUE", amount: data.revenue.total },
      ...(data.cogs?.items || []).map(i => ({ section: "COGS", account: i.account_name, amount: i.amount })),
      ...(data.cogs && data.cogs.total > 0 ? [{ section: "COGS", account: "TOTAL COGS", amount: data.cogs.total }] : []),
      ...(data.grossProfit !== data.revenue.total ? [{ section: "Gross", account: "GROSS PROFIT", amount: data.grossProfit }] : []),
      ...data.expenses.items.map(i => ({ section: "Expense", account: i.account_name, amount: i.amount })),
      { section: "Expense", account: "TOTAL EXPENSES", amount: data.expenses.total },
      { section: "Net", account: data.isProfit ? "NET INCOME" : "NET LOSS", amount: Math.abs(data.netIncome) },
    ];
    exportToCSV(rows, `profit-loss-${startDate}-to-${endDate}`, [
      { key: "section", header: "Section" },
      { key: "account", header: "Account" },
      { key: "amount", header: "Amount", format: (v: number) => exportFormatCurrency(v) },
    ]);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Profit & Loss Statement" breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Financial Reports", href: "/app/accounts/reports" },
          { label: "Profit & Loss" },
        ]} />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profit & Loss Statement"
        description="Income statement showing revenue and expenses"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Financial Reports", href: "/app/accounts/reports" },
          { label: "Profit & Loss" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Date Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Report Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Switch checked={compareMode} onCheckedChange={setCompareMode} />
                <Label className="flex items-center gap-1">
                  <GitCompare className="h-4 w-4" /> Compare Previous Period
                </Label>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Switch checked={hideZero} onCheckedChange={setHideZero} />
                <Label className="cursor-pointer">Hide zero-balance accounts</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* P&L Statement */}
        <Card>
          <CardHeader>
            <CardTitle>Income Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" /> Revenue
              </h3>
              <div className="space-y-2 pl-4">
                {compareMode && (
                  <div className="flex justify-between py-1 text-xs text-muted-foreground font-medium">
                    <span>Account</span>
                    <div className="flex gap-8">
                      <span>Current</span>
                      <span>Previous</span>
                      <span>Change</span>
                    </div>
                  </div>
                )}
                {data?.revenue.items.map((item) => {
                  const prevItem = prevData?.revenue.items.find(p => p.account_id === item.account_id);
                  const change = prevItem ? getChangePercent(item.amount, prevItem.amount) : 0;
                  return (
                    <div
                      key={item.account_id}
                      className="flex justify-between py-1 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2"
                      onClick={() => navigate(`/app/accounts/general-ledger?accountId=${item.account_id}&from=${startDate}&to=${endDate}`)}
                    >
                      <span className="hover:text-primary">{item.account_name}</span>
                      <div className="flex gap-8 items-center">
                        <span className="font-mono">{formatCurrency(item.amount)}</span>
                        {compareMode && (
                          <>
                            <span className="font-mono text-muted-foreground">{formatCurrency(prevItem?.amount || 0)}</span>
                            <span className={`text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {data?.revenue.items.length === 0 && (
                  <div className="text-muted-foreground">No revenue accounts</div>
                )}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Revenue</span>
                <div className="flex gap-8 items-center">
                  <span className="font-mono text-green-600">{formatCurrency(data?.revenue.total || 0)}</span>
                  {compareMode && prevData && (
                    <>
                      <span className="font-mono text-muted-foreground">{formatCurrency(prevData.revenue.total)}</span>
                      <span className={`text-sm ${getChangePercent(data?.revenue.total || 0, prevData.revenue.total) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {getChangePercent(data?.revenue.total || 0, prevData.revenue.total) >= 0 ? "+" : ""}
                        {getChangePercent(data?.revenue.total || 0, prevData.revenue.total).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* COGS Section — only if there are COGS items */}
            {data?.cogs && data.cogs.items.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" /> Cost of Goods Sold
                </h3>
                <div className="space-y-2 pl-4">
                  {data.cogs.items.map((item) => {
                    const prevItem = prevData?.cogs?.items.find(p => p.account_id === item.account_id);
                    const change = prevItem ? getChangePercent(item.amount, prevItem.amount) : 0;
                    return (
                      <div
                        key={item.account_id}
                        className="flex justify-between py-1 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2"
                        onClick={() => navigate(`/app/accounts/general-ledger?accountId=${item.account_id}&from=${startDate}&to=${endDate}`)}
                      >
                        <span className="hover:text-primary">{item.account_name}</span>
                        <div className="flex gap-8 items-center">
                          <span className="font-mono">{formatCurrency(item.amount)}</span>
                          {compareMode && (
                            <>
                              <span className="font-mono text-muted-foreground">{formatCurrency(prevItem?.amount || 0)}</span>
                              <span className={`text-sm font-medium ${change <= 0 ? "text-green-600" : "text-red-600"}`}>
                                {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total COGS</span>
                  <span className="font-mono text-orange-600">{formatCurrency(data.cogs.total)}</span>
                </div>
              </div>
            )}

            {/* Gross Profit — only show if COGS exists */}
            {data?.cogs && data.cogs.items.length > 0 && (
              <>
                <Separator />
                <div className="flex justify-between font-semibold text-lg p-3 rounded-lg bg-muted/50">
                  <span>Gross Profit</span>
                  <span className={`font-mono ${(data?.grossProfit || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {formatCurrency(data?.grossProfit || 0)}
                  </span>
                </div>
              </>
            )}

            {/* Expenses Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" /> Expenses
              </h3>
              <div className="space-y-2 pl-4">
                {data?.expenses.items.map((item) => {
                  const prevItem = prevData?.expenses.items.find(p => p.account_id === item.account_id);
                  const change = prevItem ? getChangePercent(item.amount, prevItem.amount) : 0;
                  return (
                    <div
                      key={item.account_id}
                      className="flex justify-between py-1 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2"
                      onClick={() => navigate(`/app/accounts/general-ledger?accountId=${item.account_id}&from=${startDate}&to=${endDate}`)}
                    >
                      <span className="hover:text-primary">{item.account_name}</span>
                      <div className="flex gap-8 items-center">
                        <span className="font-mono">{formatCurrency(item.amount)}</span>
                        {compareMode && (
                          <>
                            <span className="font-mono text-muted-foreground">{formatCurrency(prevItem?.amount || 0)}</span>
                            <span className={`text-sm font-medium ${change <= 0 ? "text-green-600" : "text-red-600"}`}>
                              {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {data?.expenses.items.length === 0 && (
                  <div className="text-muted-foreground">No expense accounts</div>
                )}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Expenses</span>
                <div className="flex gap-8 items-center">
                  <span className="font-mono text-red-600">{formatCurrency(data?.expenses.total || 0)}</span>
                  {compareMode && prevData && (
                    <>
                      <span className="font-mono text-muted-foreground">{formatCurrency(prevData.expenses.total)}</span>
                      <span className={`text-sm ${getChangePercent(data?.expenses.total || 0, prevData.expenses.total) <= 0 ? "text-green-600" : "text-red-600"}`}>
                        {getChangePercent(data?.expenses.total || 0, prevData.expenses.total) >= 0 ? "+" : ""}
                        {getChangePercent(data?.expenses.total || 0, prevData.expenses.total).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Net Income */}
            <Separator />
            <div className={`flex justify-between text-xl font-bold p-4 rounded-lg ${
              data?.isProfit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              <span>Net {data?.isProfit ? "Income" : "Loss"}</span>
              <div className="flex gap-8 items-center">
                <span className="font-mono">{formatCurrency(Math.abs(data?.netIncome || 0))}</span>
                {compareMode && prevData && (
                  <span className="text-sm font-medium">
                    vs {formatCurrency(Math.abs(prevData.netIncome))}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
