import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, ShieldCheck, ShieldAlert, Scale, ListChecks, RefreshCw } from "lucide-react";
import { useARReconciliation } from "@/hooks/useFinancialReports";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RevenueReconResult {
  invoiceTotal: number;
  invoiceTax: number;
  invoiceDiscount: number;
  invoiceCount: number;
  glNetRevenue: number;
  glCredits: number;
  glDebits: number;
  glAccountCount: number;
  variance: number;
  isMatched: boolean;
  accounts: { account_number: string; name: string; balance: number }[];
}

function useRevenueReconciliation() {
  const { profile } = useAuth();
  return useQuery<RevenueReconResult | null>({
    queryKey: ["revenue-reconciliation", profile?.organization_id],
    queryFn: async (): Promise<RevenueReconResult | null> => {
      if (!profile?.organization_id) return null;

      // 1. Get invoice totals by status (exclude cancelled)
      const { data: invoices, error: invErr } = await supabase
        .from("invoices")
        .select("id, total_amount, tax_amount, discount_amount, status")
        .eq("organization_id", profile.organization_id)
        .neq("status", "cancelled");
      if (invErr) throw invErr;

      const invoiceTotal = (invoices || []).reduce((s, inv) => s + Number(inv.total_amount || 0), 0);
      const invoiceTax = (invoices || []).reduce((s, inv) => s + Number(inv.tax_amount || 0), 0);
      const invoiceDiscount = (invoices || []).reduce((s, inv) => s + Number(inv.discount_amount || 0), 0);

      // 2. Get GL revenue account totals (credits - debits for revenue accounts)
      const { data: revenueAccounts, error: raErr } = await supabase
        .from("accounts")
        .select("id, account_number, name, current_balance, account_type:account_types!accounts_account_type_id_fkey(category)")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .eq("is_header", false);
      if (raErr) throw raErr;

      const revAccounts = (revenueAccounts || []).filter((a: any) => 
        a.account_type?.category?.toLowerCase() === "revenue"
      );

      const _glRevenueTotal = revAccounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);

      // 3. Get journal line totals for revenue accounts
      const revAccountIds = revAccounts.map(a => a.id);
      let glCredits = 0;
      let glDebits = 0;

      if (revAccountIds.length > 0) {
        for (let i = 0; i < revAccountIds.length; i += 500) {
          const batch = revAccountIds.slice(i, i + 500);
          const { data: lines } = await supabase
            .from("journal_entry_lines")
            .select("credit_amount, debit_amount, account_id, journal_entry:journal_entries!journal_entry_lines_journal_entry_id_fkey(is_posted)")
            .in("account_id", batch)
            .eq("journal_entry.is_posted", true);
          
          (lines || []).forEach((l: any) => {
            if (!l.journal_entry) return;
            glCredits += Number(l.credit_amount || 0);
            glDebits += Number(l.debit_amount || 0);
          });
        }
      }

      const glNetRevenue = glCredits - glDebits;
      const variance = Math.round((invoiceTotal - glNetRevenue) * 100) / 100;

      return {
        invoiceTotal: Math.round(invoiceTotal * 100) / 100,
        invoiceTax: Math.round(invoiceTax * 100) / 100,
        invoiceDiscount: Math.round(invoiceDiscount * 100) / 100,
        invoiceCount: (invoices || []).length,
        glNetRevenue: Math.round(glNetRevenue * 100) / 100,
        glCredits: Math.round(glCredits * 100) / 100,
        glDebits: Math.round(glDebits * 100) / 100,
        glAccountCount: revAccounts.length,
        variance,
        isMatched: Math.abs(variance) < 1,
        accounts: revAccounts.map(a => ({
          account_number: a.account_number,
          name: a.name,
          balance: Number(a.current_balance || 0),
        })),
      };
    },
    enabled: !!profile?.organization_id,
  });
}

export default function ARReconciliationPage() {
  const { data: rows, isLoading, refetch } = useARReconciliation();
  const { data: revenueRecon, isLoading: revLoading } = useRevenueReconciliation();
  const [activeTab, setActiveTab] = useState("balance");
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

        {/* Tabs: Balance Reconciliation + Revenue Reconciliation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="balance">{t("recon.title")}</TabsTrigger>
            <TabsTrigger value="revenue">{t("recon.revenueRecon" as any, "Revenue Reconciliation")}</TabsTrigger>
          </TabsList>

          {/* Balance Reconciliation Tab */}
          <TabsContent value="balance" className="space-y-4">
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
          </TabsContent>

          {/* Revenue Reconciliation Tab */}
          <TabsContent value="revenue" className="space-y-4">
            {revLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : revenueRecon ? (
              <>
                {/* Revenue Recon Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t("recon.invoiceTotal" as any, "Invoice Total")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(revenueRecon.invoiceTotal)}</div>
                      <p className="text-xs text-muted-foreground">{revenueRecon.invoiceCount} invoices</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t("recon.glTotal" as any, "GL Revenue Total")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(revenueRecon.glNetRevenue)}</div>
                      <p className="text-xs text-muted-foreground">{revenueRecon.glAccountCount} revenue accounts</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t("recon.revenueVariance" as any, "Variance")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={cn("text-2xl font-bold", revenueRecon.isMatched ? "text-green-600" : "text-red-600")}>
                        {formatCurrency(revenueRecon.variance)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {revenueRecon.isMatched ? "Reconciled ✓" : "Discrepancy detected"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t("recon.status")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {revenueRecon.isMatched ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <span className="text-lg font-semibold text-green-600">{t("recon.matched")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                          <span className="text-lg font-semibold text-red-600">{t("recon.mismatched")}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Explanation card if variance */}
                {!revenueRecon.isMatched && (
                  <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="text-sm space-y-1">
                          <p className="font-medium text-amber-800 dark:text-amber-400">Possible causes for revenue variance:</p>
                          <ul className="list-disc ml-4 text-amber-700 dark:text-amber-500">
                            <li>Invoice trigger failed to post journal entry for some invoices</li>
                            <li>Manual journal entries affecting revenue accounts</li>
                            <li>Tax/discount amounts included in invoice totals but posted to separate GL accounts</li>
                            <li>Credit notes or reversals adjusting GL but not invoice status</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Revenue Accounts Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revenue Account Balances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account #</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenueRecon.accounts.map((acc) => (
                          <TableRow key={acc.account_number}>
                            <TableCell className="font-mono text-sm">{acc.account_number}</TableCell>
                            <TableCell>{acc.name}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(acc.balance)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={2}>Total GL Revenue</TableCell>
                          <TableCell className="text-right">{formatCurrency(revenueRecon.glNetRevenue)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Detail breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Invoice vs GL Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 max-w-md">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Invoice Gross Total</span>
                        <span className="font-medium">{formatCurrency(revenueRecon.invoiceTotal)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Invoice Tax</span>
                        <span className="font-medium">{formatCurrency(revenueRecon.invoiceTax)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Invoice Discount</span>
                        <span className="font-medium">{formatCurrency(revenueRecon.invoiceDiscount)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">GL Credits (Revenue)</span>
                        <span className="font-medium">{formatCurrency(revenueRecon.glCredits)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">GL Debits (Reversals)</span>
                        <span className="font-medium">{formatCurrency(revenueRecon.glDebits)}</span>
                      </div>
                      <div className="flex justify-between py-1 font-bold">
                        <span>GL Net Revenue</span>
                        <span>{formatCurrency(revenueRecon.glNetRevenue)}</span>
                      </div>
                      <div className={cn("flex justify-between py-1 font-bold", !revenueRecon.isMatched && "text-red-600")}>
                        <span>Variance</span>
                        <span>{formatCurrency(revenueRecon.variance)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
