import { useState, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle, ShieldCheck, ShieldAlert, Scale, ListChecks, RefreshCw } from "lucide-react";
import { useARReconciliation, ARReconciliationRow } from "@/hooks/useFinancialReports";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

export default function ARReconciliationPage() {
  const { data: rows, isLoading, refetch } = useARReconciliation();
  const [statusFilter, setStatusFilter] = useState<"all" | "matched" | "mismatched">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { formatCurrency } = useCurrencyFormatter();
  const { t } = useTranslation();

  const filteredRows = (rows || []).filter((r) => {
    if (statusFilter === "matched" && !r.is_matched) return false;
    if (statusFilter === "mismatched" && r.is_matched) return false;
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    return true;
  });

  const totalAccounts = (rows || []).length;
  const matched = (rows || []).filter((r) => r.is_matched).length;
  const mismatched = totalAccounts - matched;
  const totalVariance = (rows || []).reduce((s, r) => s + Math.abs(r.variance), 0);

  const categories = [...new Set((rows || []).map((r) => r.category))].sort();

  const exportColumns = [
    { key: "account_number", header: t("recon.accountNumber") },
    { key: "account_name", header: t("recon.accountName") },
    { key: "category", header: t("recon.category") },
    { key: "opening_balance", header: t("recon.openingBalance"), format: (v: number) => formatCurrency(v) },
    { key: "total_debits", header: t("recon.totalDebits"), format: (v: number) => formatCurrency(v) },
    { key: "total_credits", header: t("recon.totalCredits"), format: (v: number) => formatCurrency(v) },
    { key: "computed_balance", header: t("recon.computedBalance"), format: (v: number) => formatCurrency(v) },
    { key: "stored_balance", header: t("recon.storedBalance"), format: (v: number) => formatCurrency(v) },
    { key: "variance", header: t("recon.variance"), format: (v: number) => formatCurrency(v) },
    { key: "is_matched", header: t("recon.status"), format: (v: boolean) => v ? t("recon.matched") : t("recon.mismatched") },
  ];

  return (
    <div>
      <PageHeader
        title={t("recon.title")}
        description={t("recon.description")}
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Financial Reports", href: "/app/accounts/reports" },
          { label: t("recon.title") },
        ]}
      />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("recon.totalAccounts")}</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalAccounts}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("recon.matched")}</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-green-600">{matched}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("recon.mismatched")}</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-red-600">{mismatched}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("recon.totalVariance")}</CardTitle>
              <Scale className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className={cn("text-2xl font-bold", totalVariance > 0 ? "text-amber-600" : "text-green-600")}>
                  {formatCurrency(totalVariance)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All reconciled banner */}
        {!isLoading && mismatched === 0 && totalAccounts > 0 && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CardContent className="flex items-center gap-3 pt-6">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-400">{t("recon.allReconciled")}</p>
                <p className="text-sm text-green-600 dark:text-green-500">{t("recon.allReconciledDesc")}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters + Export */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="matched">{t("recon.matched")}</SelectItem>
              <SelectItem value="mismatched">{t("recon.mismatched")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")} Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("recon.refresh")}
          </Button>

          <div className="ml-auto">
            <ReportExportButton
              data={filteredRows}
              filename="ar-reconciliation"
              columns={exportColumns}
              title={t("recon.title")}
              pdfOptions={{
                title: t("recon.title"),
                subtitle: t("recon.description"),
                orientation: "landscape",
              }}
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("recon.accountNumber")}</TableHead>
                  <TableHead>{t("recon.accountName")}</TableHead>
                  <TableHead>{t("recon.category")}</TableHead>
                  <TableHead className="text-right">{t("recon.openingBalance")}</TableHead>
                  <TableHead className="text-right">{t("recon.totalDebits")}</TableHead>
                  <TableHead className="text-right">{t("recon.totalCredits")}</TableHead>
                  <TableHead className="text-right">{t("recon.computedBalance")}</TableHead>
                  <TableHead className="text-right">{t("recon.storedBalance")}</TableHead>
                  <TableHead className="text-right">{t("recon.variance")}</TableHead>
                  <TableHead className="text-center">{t("recon.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {t("tb.noAccounts")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow
                      key={row.account_id}
                      className={cn(!row.is_matched && "bg-red-50 dark:bg-red-950/20")}
                    >
                      <TableCell className="font-mono text-sm">{row.account_number}</TableCell>
                      <TableCell>{row.account_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(row.opening_balance)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.total_debits)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.total_credits)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(row.computed_balance)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(row.stored_balance)}</TableCell>
                      <TableCell className={cn("text-right font-bold", !row.is_matched && "text-red-600")}>
                        {row.variance !== 0 ? formatCurrency(row.variance) : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.is_matched ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
