import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { useFiscalYears, useCurrentFiscalYear } from "@/hooks/useAccounts";
import { useBudgetVariance } from "@/hooks/useBudgetVariance";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { cn } from "@/lib/utils";

export default function BudgetVariancePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { data: fiscalYears } = useFiscalYears();
  const { data: currentFY } = useCurrentFiscalYear();
  const [selectedFY, setSelectedFY] = useState<string>("");
  const [hideOnTrack, setHideOnTrack] = useState(false);

  const fyId = selectedFY || currentFY?.id || "";
  const { data, isLoading } = useBudgetVariance(fyId);

  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    if (hideOnTrack) return data.rows.filter(r => r.status !== "on_track");
    return data.rows;
  }, [data, hideOnTrack]);

  const exportColumns = [
    { key: "account_number", header: t("accounts.accountNumber" as any, "Account #") },
    { key: "account_name", header: t("accounts.accountName" as any, "Account") },
    { key: "category", header: t("common.category" as any, "Category") },
    { key: "budgeted", header: t("accounts.budgeted" as any, "Budgeted"), format: (v: number) => v.toFixed(2) },
    { key: "actual", header: t("accounts.actual" as any, "Actual"), format: (v: number) => v.toFixed(2) },
    { key: "variance", header: t("accounts.variance" as any, "Variance"), format: (v: number) => v.toFixed(2) },
    { key: "variance_pct", header: t("accounts.variancePct" as any, "Variance %"), format: (v: number) => `${v}%` },
    { key: "status", header: t("common.status" as any, "Status") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("accounts.budgetVariance" as any, "Budget vs Actual Variance")}
        description={t("accounts.budgetVarianceDesc" as any, "Compare budgeted amounts against actual GL postings")}
        breadcrumbs={[
          { label: t("nav.accounts" as any, "Accounts"), href: "/app/accounts" },
          { label: t("accounts.budgetVariance" as any, "Budget Variance") },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back" as any, "Back")}
            </Button>
            <ReportExportButton
              data={filteredRows}
              filename={`budget-variance-${fyId}`}
              columns={exportColumns}
              title={t("accounts.budgetVariance" as any, "Budget vs Actual Variance")}
              disabled={filteredRows.length === 0}
            />
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label>{t("accounts.fiscalYear" as any, "Fiscal Year")}</Label>
              <Select value={fyId} onValueChange={setSelectedFY}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder={t("accounts.selectFiscalYear" as any, "Select fiscal year")} />
                </SelectTrigger>
                <SelectContent>
                  {(fiscalYears || []).map((fy: any) => (
                    <SelectItem key={fy.id} value={fy.id}>
                      {fy.name} {fy.is_current && "(Current)"} {fy.is_closed && "(Closed)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="hide-on-track" checked={hideOnTrack} onCheckedChange={setHideOnTrack} />
              <Label htmlFor="hide-on-track" className="cursor-pointer text-sm">
                {t("accounts.hideOnTrack" as any, "Hide on-track items")}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {data && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("accounts.totalBudgeted" as any, "Total Budgeted")}</p>
              <p className="text-2xl font-bold">{formatCurrency(data.totalBudget)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("accounts.totalActual" as any, "Total Actual")}</p>
              <p className="text-2xl font-bold">{formatCurrency(data.totalActual)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("accounts.totalVariance" as any, "Total Variance")}</p>
              <p className={cn(
                "text-2xl font-bold",
                data.totalVariance >= 0 ? "text-green-600" : "text-destructive"
              )}>
                {formatCurrency(Math.abs(data.totalVariance))}
                <span className="text-sm font-normal ml-1">
                  {data.totalVariance >= 0 ? "favorable" : "unfavorable"}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("accounts.utilization" as any, "Utilization")}</p>
              <p className="text-2xl font-bold">
                {data.totalBudget > 0 ? Math.round((data.totalActual / data.totalBudget) * 100) : 0}%
              </p>
              <Progress
                value={data.totalBudget > 0 ? Math.min(100, (data.totalActual / data.totalBudget) * 100) : 0}
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Variance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("accounts.varianceByAccount" as any, "Variance by Account")}
            {data && <Badge variant="secondary">{filteredRows.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {data && data.rows.length === 0
                ? t("accounts.noBudgetData" as any, "No budget allocations found for this fiscal year. Set up budgets first.")
                : t("accounts.allOnTrack" as any, "All items are on track. Toggle off to see all.")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("accounts.account" as any, "Account")}</TableHead>
                  <TableHead>{t("common.category" as any, "Category")}</TableHead>
                  <TableHead className="text-right">{t("accounts.budgeted" as any, "Budgeted")}</TableHead>
                  <TableHead className="text-right">{t("accounts.actual" as any, "Actual")}</TableHead>
                  <TableHead className="text-right">{t("accounts.variance" as any, "Variance")}</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead>{t("common.status" as any, "Status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map(row => {
                  const utilization = row.budgeted > 0 ? (row.actual / row.budgeted) * 100 : 0;
                  return (
                    <TableRow key={row.account_id}>
                      <TableCell>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto font-medium"
                          onClick={() => navigate(`/app/accounts/ledger?accountId=${row.account_id}`)}
                        >
                          {row.account_number} — {row.account_name}
                        </Button>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{row.category}</Badge></TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(row.budgeted)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(row.actual)}
                        <Progress value={Math.min(100, utilization)} className="mt-1 h-1" />
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-mono font-medium",
                        row.variance >= 0 ? "text-green-600" : "text-destructive"
                      )}>
                        {row.variance >= 0 ? "+" : "-"}{formatCurrency(Math.abs(row.variance))}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.variance_pct >= 0 ? "+" : ""}{row.variance_pct}%
                      </TableCell>
                      <TableCell>
                        {row.status === "favorable" && (
                          <Badge className="bg-green-100 text-green-800 gap-1">
                            <TrendingUp className="h-3 w-3" /> Favorable
                          </Badge>
                        )}
                        {row.status === "unfavorable" && (
                          <Badge className="bg-red-100 text-red-800 gap-1">
                            <AlertTriangle className="h-3 w-3" /> Unfavorable
                          </Badge>
                        )}
                        {row.status === "on_track" && (
                          <Badge variant="outline">On Track</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
