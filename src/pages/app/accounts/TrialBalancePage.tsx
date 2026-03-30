import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Printer, Download, CheckCircle, XCircle, Calendar, Search, ChevronDown, ChevronRight, BookOpen, TrendingUp, Hash } from "lucide-react";
import { useTrialBalance, TrialBalanceRow } from "@/hooks/useFinancialReports";
import { exportToCSV, formatCurrency as exportFmtCurrency } from "@/lib/exportUtils";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { format, startOfMonth, startOfYear, subMonths, subYears, endOfMonth } from "date-fns";

const CATEGORY_ORDER = ["asset", "liability", "equity", "revenue", "expense"];
const CATEGORY_LABELS: Record<string, string> = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  revenue: "Revenue",
  expense: "Expenses",
};

type DatePreset = "thisMonth" | "lastMonth" | "lastQuarter" | "ytd" | "lastYear";

function getPresetDates(preset: DatePreset): { start: string; end: string } {
  const now = new Date();
  switch (preset) {
    case "thisMonth":
      return { start: format(startOfMonth(now), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") };
    case "lastMonth": {
      const lm = subMonths(now, 1);
      return { start: format(startOfMonth(lm), "yyyy-MM-dd"), end: format(endOfMonth(lm), "yyyy-MM-dd") };
    }
    case "lastQuarter": {
      const q = subMonths(now, 3);
      return { start: format(startOfMonth(q), "yyyy-MM-dd"), end: format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd") };
    }
    case "ytd":
      return { start: format(startOfYear(now), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") };
    case "lastYear": {
      const ly = subYears(now, 1);
      return { start: format(startOfYear(ly), "yyyy-MM-dd"), end: format(new Date(ly.getFullYear(), 11, 31), "yyyy-MM-dd") };
    }
  }
}

export default function TrialBalancePage() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(
    format(startOfYear(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchQuery, setSearchQuery] = useState("");
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useTrialBalance(startDate, endDate);
  const { formatCurrency } = useCurrencyFormatter();

  const applyPreset = (preset: DatePreset) => {
    const { start, end } = getPresetDates(preset);
    setStartDate(start);
    setEndDate(end);
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Filter and group
  const { groupedRows, categoryTotals, filteredRows } = useMemo(() => {
    if (!data) return { groupedRows: {} as Record<string, TrialBalanceRow[]>, categoryTotals: {} as Record<string, { openingDr: number; openingCr: number; moveDr: number; moveCr: number; closeDr: number; closeCr: number }>, filteredRows: [] as TrialBalanceRow[] };

    let rows = data.rows;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(r =>
        r.account_name.toLowerCase().includes(q) ||
        r.account_number.toLowerCase().includes(q)
      );
    }

    // Zero balance filter
    if (!showZeroBalances) {
      rows = rows.filter(r =>
        r.closingDebit !== 0 || r.closingCredit !== 0 ||
        r.movementDebit !== 0 || r.movementCredit !== 0
      );
    }

    // Group by category
    const grouped: Record<string, TrialBalanceRow[]> = {};
    const totals: Record<string, { openingDr: number; openingCr: number; moveDr: number; moveCr: number; closeDr: number; closeCr: number }> = {};

    for (const cat of CATEGORY_ORDER) {
      const catRows = rows.filter(r => r.category === cat);
      if (catRows.length > 0) {
        grouped[cat] = catRows;
        totals[cat] = catRows.reduce((acc, r) => ({
          openingDr: acc.openingDr + r.openingDebit,
          openingCr: acc.openingCr + r.openingCredit,
          moveDr: acc.moveDr + r.movementDebit,
          moveCr: acc.moveCr + r.movementCredit,
          closeDr: acc.closeDr + r.closingDebit,
          closeCr: acc.closeCr + r.closingCredit,
        }), { openingDr: 0, openingCr: 0, moveDr: 0, moveCr: 0, closeDr: 0, closeCr: 0 });
      }
    }

    // Uncategorized
    const uncategorized = rows.filter(r => !CATEGORY_ORDER.includes(r.category));
    if (uncategorized.length > 0) {
      grouped["other"] = uncategorized;
      totals["other"] = uncategorized.reduce((acc, r) => ({
        openingDr: acc.openingDr + r.openingDebit,
        openingCr: acc.openingCr + r.openingCredit,
        moveDr: acc.moveDr + r.movementDebit,
        moveCr: acc.moveCr + r.movementCredit,
        closeDr: acc.closeDr + r.closingDebit,
        closeCr: acc.closeCr + r.closingCredit,
      }), { openingDr: 0, openingCr: 0, moveDr: 0, moveCr: 0, closeDr: 0, closeCr: 0 });
    }

    return { groupedRows: grouped, categoryTotals: totals, filteredRows: rows };
  }, [data, searchQuery, showZeroBalances]);

  // Grand totals from filtered rows
  const grandTotals = useMemo(() => {
    return filteredRows.reduce((acc, r) => ({
      openingDr: acc.openingDr + r.openingDebit,
      openingCr: acc.openingCr + r.openingCredit,
      moveDr: acc.moveDr + r.movementDebit,
      moveCr: acc.moveCr + r.movementCredit,
      closeDr: acc.closeDr + r.closingDebit,
      closeCr: acc.closeCr + r.closingCredit,
    }), { openingDr: 0, openingCr: 0, moveDr: 0, moveCr: 0, closeDr: 0, closeCr: 0 });
  }, [filteredRows]);

  const handlePrint = () => window.print();

  const handleExport = () => {
    if (!data) return;
    exportToCSV(filteredRows, `trial-balance-${startDate}-to-${endDate}`, [
      { key: "account_number", header: "Account #" },
      { key: "account_name", header: "Account Name" },
      { key: "account_type", header: "Type" },
      { key: "category", header: "Category" },
      { key: "openingDebit", header: "Opening DR", format: (v: number) => exportFmtCurrency(v) },
      { key: "openingCredit", header: "Opening CR", format: (v: number) => exportFmtCurrency(v) },
      { key: "movementDebit", header: "Movement DR", format: (v: number) => exportFmtCurrency(v) },
      { key: "movementCredit", header: "Movement CR", format: (v: number) => exportFmtCurrency(v) },
      { key: "closingDebit", header: "Closing DR", format: (v: number) => exportFmtCurrency(v) },
      { key: "closingCredit", header: "Closing CR", format: (v: number) => exportFmtCurrency(v) },
    ]);
  };

  const fmtVal = (v: number) => (v > 0 ? formatCurrency(v) : "-");

  return (
    <div>
      <PageHeader
        title={t("tb.title")}
        description={t("tb.description")}
        breadcrumbs={[
          { label: t("nav.accounts"), href: "/app/accounts" },
          { label: t("nav.financialReports"), href: "/app/accounts/reports" },
          { label: t("tb.title") },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              {t("common.print")}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t("common.export")}
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Date Filters + Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("tb.reportPeriod")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {([
                ["thisMonth", t("tb.thisMonth")] as const,
                ["lastMonth", t("tb.lastMonth")] as const,
                ["lastQuarter", t("tb.lastQuarter")] as const,
                ["ytd", t("tb.ytd")] as const,
                ["lastYear", t("tb.lastYear")] as const,
              ]).map(([key, label]) => (
                <Button key={key} variant="outline" size="sm" onClick={() => applyPreset(key)}>
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label>{t("tb.startDate")}</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("tb.endDate")}</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  {data.isBalanced ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">{t("tb.balanceStatus")}</p>
                    <p className="font-semibold">
                      {data.isBalanced ? t("tb.balanced") : t("tb.notBalanced")}
                    </p>
                  </div>
                </div>
                {!data.isBalanced && (
                  <Badge variant="destructive" className="mt-2">
                    {t("tb.difference")}: {formatCurrency(Math.abs(data.totalDebits - data.totalCredits))}
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-2">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("tb.totalAccounts")}</p>
                  <p className="text-2xl font-bold">{data.totalAccounts}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("tb.withActivity")}</p>
                  <p className="text-2xl font-bold">{data.accountsWithActivity}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("tb.zeroBalance")}</p>
                  <p className="text-2xl font-bold">{data.zeroBalanceCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("tb.searchAccounts")}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showZeroBalances} onCheckedChange={setShowZeroBalances} />
            <Label className="cursor-pointer">{t("tb.showZeroBalances")}</Label>
          </div>
        </div>

        {/* Trial Balance Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead rowSpan={2} className="align-bottom border-r">{t("tb.accountNumber")}</TableHead>
                      <TableHead rowSpan={2} className="align-bottom border-r">{t("tb.accountName")}</TableHead>
                      <TableHead colSpan={2} className="text-center border-b border-r">{t("tb.openingBalance")}</TableHead>
                      <TableHead colSpan={2} className="text-center border-b border-r">{t("tb.periodMovement")}</TableHead>
                      <TableHead colSpan={2} className="text-center border-b">{t("tb.closingBalance")}</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="text-right">{t("tb.debit")}</TableHead>
                      <TableHead className="text-right border-r">{t("tb.credit")}</TableHead>
                      <TableHead className="text-right">{t("tb.debit")}</TableHead>
                      <TableHead className="text-right border-r">{t("tb.credit")}</TableHead>
                      <TableHead className="text-right">{t("tb.debit")}</TableHead>
                      <TableHead className="text-right">{t("tb.credit")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(groupedRows).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {t("tb.noAccounts")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      Object.entries(groupedRows).map(([category, rows]) => {
                        const isCollapsed = collapsedCategories[category];
                        const totals = categoryTotals[category];
                        const label = CATEGORY_LABELS[category] || category;

                        return (
                          <Collapsible key={category} open={!isCollapsed} asChild>
                            <>
                              <CollapsibleTrigger asChild>
                                <TableRow
                                  className="bg-muted/30 cursor-pointer hover:bg-muted/50 font-semibold"
                                  onClick={() => toggleCategory(category)}
                                >
                                  <TableCell colSpan={2} className="border-r">
                                    <div className="flex items-center gap-2">
                                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                      {label}
                                      <Badge variant="secondary" className="text-xs">{rows.length}</Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{fmtVal(totals.openingDr)}</TableCell>
                                  <TableCell className="text-right border-r">{fmtVal(totals.openingCr)}</TableCell>
                                  <TableCell className="text-right">{fmtVal(totals.moveDr)}</TableCell>
                                  <TableCell className="text-right border-r">{fmtVal(totals.moveCr)}</TableCell>
                                  <TableCell className="text-right">{fmtVal(totals.closeDr)}</TableCell>
                                  <TableCell className="text-right">{fmtVal(totals.closeCr)}</TableCell>
                                </TableRow>
                              </CollapsibleTrigger>
                              <CollapsibleContent asChild>
                                <>
                                  {rows.map((row) => (
                                    <TableRow key={row.account_id}>
                                      <TableCell className="font-mono pl-8 border-r">{row.account_number}</TableCell>
                                      <TableCell className="border-r">{row.account_name}</TableCell>
                                      <TableCell className="text-right">{fmtVal(row.openingDebit)}</TableCell>
                                      <TableCell className="text-right border-r">{fmtVal(row.openingCredit)}</TableCell>
                                      <TableCell className="text-right">{fmtVal(row.movementDebit)}</TableCell>
                                      <TableCell className="text-right border-r">{fmtVal(row.movementCredit)}</TableCell>
                                      <TableCell className="text-right">{fmtVal(row.closingDebit)}</TableCell>
                                      <TableCell className="text-right">{fmtVal(row.closingCredit)}</TableCell>
                                    </TableRow>
                                  ))}
                                </>
                              </CollapsibleContent>
                            </>
                          </Collapsible>
                        );
                      })
                    )}
                  </TableBody>
                  {data && (
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className="font-bold border-r">{t("common.total")}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(grandTotals.openingDr)}</TableCell>
                        <TableCell className="text-right font-bold border-r">{formatCurrency(grandTotals.openingCr)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(grandTotals.moveDr)}</TableCell>
                        <TableCell className="text-right font-bold border-r">{formatCurrency(grandTotals.moveCr)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(grandTotals.closeDr)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(grandTotals.closeCr)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
