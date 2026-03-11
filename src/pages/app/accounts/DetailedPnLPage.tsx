import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useDetailedPnL, useMonthlyPnLTrend, DetailedPnLGroup } from "@/hooks/useFinancialReports";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Loader2, ChevronDown, ChevronRight, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, startOfYear, subMonths, subQuarters, startOfQuarter } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const DATE_PRESETS = [
  { label: "This Month", getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Last Month", getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "This Quarter", getRange: () => ({ from: startOfQuarter(new Date()), to: new Date() }) },
  { label: "Last Quarter", getRange: () => ({ from: startOfQuarter(subQuarters(new Date(), 1)), to: endOfMonth(subMonths(startOfQuarter(new Date()), 1)) }) },
  { label: "YTD", getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--destructive))", "#f59e0b", "#10b981",
  "#6366f1", "#ec4899", "#14b8a6", "#8b5cf6",
];

export default function DetailedPnLPage() {
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    return { from: format(startOfMonth(now), "yyyy-MM-dd"), to: format(now, "yyyy-MM-dd") };
  });
  const [activePreset, setActivePreset] = useState("This Month");

  const { data: pnl, isLoading } = useDetailedPnL(dateRange.from, dateRange.to);
  const { data: trend } = useMonthlyPnLTrend(dateRange.from, dateRange.to);
  const { formatCurrency } = useCurrencyFormatter();

  const handlePreset = (preset: typeof DATE_PRESETS[0]) => {
    const range = preset.getRange();
    setDateRange({ from: format(range.from, "yyyy-MM-dd"), to: format(range.to, "yyyy-MM-dd") });
    setActivePreset(preset.label);
  };

  // Flatten for export
  const exportData = useMemo(() => {
    if (!pnl) return [];
    const rows: Record<string, any>[] = [];
    const addGroups = (groups: DetailedPnLGroup[], section: string) => {
      for (const g of groups) {
        for (const a of g.accounts) {
          rows.push({ section, group: g.account_type_name, account: a.account_name, account_number: a.account_number, amount: a.amount });
        }
      }
    };
    addGroups(pnl.revenueGroups, "Revenue");
    addGroups(pnl.expenseGroups, "Expenses");
    return rows;
  }, [pnl]);

  const expensePieData = useMemo(() => {
    if (!pnl) return [];
    return pnl.expenseGroups.map(g => ({ name: g.account_type_name, value: g.total }));
  }, [pnl]);

  // All transaction lines for Transactions tab
  const allLines = useMemo(() => {
    if (!pnl) return [];
    const lines: any[] = [];
    const extract = (groups: DetailedPnLGroup[], section: string) => {
      for (const g of groups) {
        for (const a of g.accounts) {
          for (const l of a.journal_lines || []) {
            lines.push({ ...l, account_name: a.account_name, account_number: a.account_number, section, group: g.account_type_name });
          }
        }
      }
    };
    extract(pnl.revenueGroups, "Revenue");
    extract(pnl.expenseGroups, "Expenses");
    return lines.sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  }, [pnl]);

  const txColumns: Column<any>[] = [
    { key: "entry_date", header: "Date", sortable: true, cell: (r) => r.entry_date ? format(new Date(r.entry_date), "dd MMM yyyy") : "-" },
    { key: "reference_number", header: "Reference", sortable: true },
    { key: "account_name", header: "Account", sortable: true },
    { key: "group", header: "Type", sortable: true },
    { key: "section", header: "Section", sortable: true },
    { key: "description", header: "Description" },
    { key: "debit", header: "Debit", sortable: true, className: "text-right", cell: (r) => r.debit > 0 ? formatCurrency(r.debit) : "-" },
    { key: "credit", header: "Credit", sortable: true, className: "text-right", cell: (r) => r.credit > 0 ? formatCurrency(r.credit) : "-" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Detailed Profit & Loss"
        description="Comprehensive P&L with transaction drill-down and charts"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Reports", href: "/app/accounts/reports" },
          { label: "Detailed P&L" },
        ]}
        actions={
          <ReportExportButton
            data={exportData}
            filename={`detailed-pnl-${dateRange.from}-to-${dateRange.to}`}
            columns={[
              { key: "section", header: "Section" },
              { key: "group", header: "Group" },
              { key: "account_number", header: "Account #" },
              { key: "account", header: "Account" },
              { key: "amount", header: "Amount", format: (v) => String(v) },
            ]}
            pdfOptions={{
              title: "Detailed Profit & Loss Statement",
              subtitle: `${dateRange.from} to ${dateRange.to}`,
              orientation: "landscape",
            }}
          />
        }
      />

      <div className="space-y-6">
        {/* Date Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {DATE_PRESETS.map((p) => (
            <Button
              key={p.label}
              variant={activePreset === p.label ? "default" : "outline"}
              size="sm"
              onClick={() => handlePreset(p)}
            >
              {p.label}
            </Button>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {dateRange.from} → {dateRange.to}
          </span>
        </div>

        {/* Summary Cards */}
        {pnl && (
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard title="Total Revenue" value={formatCurrency(pnl.totalRevenue)} icon={TrendingUp} color="text-green-500" />
            <SummaryCard title="Total Expenses" value={formatCurrency(pnl.totalExpenses)} icon={TrendingDown} color="text-red-500" />
            <SummaryCard title="Gross Profit" value={formatCurrency(pnl.grossProfit)} icon={DollarSign} color="text-blue-500" />
            <SummaryCard
              title="Net Income"
              value={formatCurrency(pnl.netIncome)}
              icon={DollarSign}
              color={pnl.netIncome >= 0 ? "text-green-500" : "text-red-500"}
            />
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="statement">
          <TabsList>
            <TabsTrigger value="statement">Statement</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Statement Tab */}
          <TabsContent value="statement" className="space-y-4">
            {pnl && (
              <>
                <PnLSection title="Revenue" groups={pnl.revenueGroups} total={pnl.totalRevenue} formatCurrency={formatCurrency} />
                {pnl.cogsGroups.length > 0 && (
                  <>
                    <PnLSection title="Cost of Goods Sold" groups={pnl.cogsGroups} total={pnl.totalCOGS} formatCurrency={formatCurrency} />
                    <TotalLine label="Gross Profit" amount={pnl.grossProfit} formatCurrency={formatCurrency} isPositive={pnl.grossProfit >= 0} />
                  </>
                )}
                <PnLSection title="Expenses" groups={pnl.expenseGroups} total={pnl.totalExpenses} formatCurrency={formatCurrency} />
                <Card className="border-2">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Net Income</span>
                      <span className={pnl.netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(Math.abs(pnl.netIncome))}
                        {pnl.netIncome < 0 && " (Loss)"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            {trend && trend.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Revenue vs Expenses (Monthly)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                      <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            {expensePieData.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={expensePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {expensePieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <ReportTable
              data={allLines}
              columns={txColumns}
              searchable
              searchPlaceholder="Search transactions..."
              pageSize={20}
              emptyMessage="No transactions found for this period"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- Sub-components ---

function SummaryCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function PnLSection({ title, groups, total, formatCurrency }: { title: string; groups: DetailedPnLGroup[]; total: number; formatCurrency: (v: number) => string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {groups.map((group) => (
          <PnLGroupRow key={group.account_type_id} group={group} formatCurrency={formatCurrency} />
        ))}
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Total {title}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PnLGroupRow({ group, formatCurrency }: { group: DetailedPnLGroup; formatCurrency: (v: number) => string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-md">
      <button
        className="flex w-full items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors text-sm font-medium"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {group.account_type_name}
        </div>
        <span>{formatCurrency(group.total)}</span>
      </button>
      {open && (
        <div className="px-4 pb-2 space-y-1">
          {group.accounts.map((acc) => (
            <AccountDrillDown key={acc.account_id} account={acc} formatCurrency={formatCurrency} />
          ))}
        </div>
      )}
    </div>
  );
}

function AccountDrillDown({ account, formatCurrency }: { account: DetailedPnLGroup["accounts"][0]; formatCurrency: (v: number) => string }) {
  const [open, setOpen] = useState(false);
  const hasLines = (account.journal_lines?.length || 0) > 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-1.5 text-sm hover:bg-muted/30 rounded transition-colors">
        <div className="flex items-center gap-2">
          {hasLines && (open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)}
          {!hasLines && <span className="w-3" />}
          <span className="text-muted-foreground">{account.account_number}</span>
          <span>{account.account_name}</span>
        </div>
        <span>{formatCurrency(account.amount)}</span>
      </CollapsibleTrigger>
      {hasLines && (
        <CollapsibleContent>
          <div className="ml-8 mr-4 mb-2 border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Reference</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs text-right">Debit</TableHead>
                  <TableHead className="text-xs text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {account.journal_lines!.map((l) => (
                  <TableRow key={l.id} className="text-xs">
                    <TableCell>{l.entry_date ? format(new Date(l.entry_date), "dd MMM yyyy") : "-"}</TableCell>
                    <TableCell>{l.reference_number || "-"}</TableCell>
                    <TableCell>{l.description || "-"}</TableCell>
                    <TableCell className="text-right">{l.debit > 0 ? formatCurrency(l.debit) : "-"}</TableCell>
                    <TableCell className="text-right">{l.credit > 0 ? formatCurrency(l.credit) : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

function TotalLine({ label, amount, formatCurrency, isPositive }: { label: string; amount: number; formatCurrency: (v: number) => string; isPositive: boolean }) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="py-3">
        <div className="flex justify-between items-center font-semibold">
          <span>{label}</span>
          <span className={isPositive ? "text-green-600" : "text-red-600"}>{formatCurrency(amount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
