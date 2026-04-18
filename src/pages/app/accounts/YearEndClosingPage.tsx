import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, Lock } from "lucide-react";
import { useYearEndAccountTotals, usePostYearEndClosing } from "@/hooks/useYearEndClosing";
import { useFiscalYears, useLockFiscalYear } from "@/hooks/useFiscalYearLock";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";

export default function YearEndClosingPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear - 1));
  const [retainedEarningsId, setRetainedEarningsId] = useState("");

  const fiscalStart = `${selectedYear}-01-01`;
  const fiscalEnd = `${selectedYear}-12-31`;

  const { data: totals, isLoading } = useYearEndAccountTotals(fiscalStart, fiscalEnd);
  const postClosing = usePostYearEndClosing();
  const { data: fiscalYears } = useFiscalYears();
  const lockFY = useLockFiscalYear();

  // Find the fiscal year matching the selected year (by start_date year)
  const matchingFY = (fiscalYears || []).find(
    (fy: any) => new Date(fy.start_date).getFullYear() === parseInt(selectedYear)
  );

  // Get equity accounts for Retained Earnings selection
  const { data: equityAccounts } = useQuery({
    queryKey: ["equity-accounts", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("accounts")
        .select("id, account_number, name, account_type:account_types(category)")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_header", false)
        .eq("is_active", true);
      return (data || []).filter((a: any) => a.account_type?.category === "equity");
    },
    enabled: !!profile?.organization_id,
  });

  const handlePost = () => {
    if (!totals || !retainedEarningsId) return;
    postClosing.mutate({
      fiscalYearEnd: fiscalEnd,
      retainedEarningsAccountId: retainedEarningsId,
      revenueAccounts: totals.revenueAccounts,
      expenseAccounts: totals.expenseAccounts,
      netIncome: totals.netIncome,
    });
  };

  return (
    <div>
      <PageHeader
        title={t("finance.yearEndClosing")}
        description={t("finance.yearEndClosingDesc")}
        breadcrumbs={[
          { label: t("nav.accounts"), href: "/app/accounts" },
          { label: t("finance.yearEndClosing") },
        ]}
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t("finance.selectFiscalYear")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div>
                <Label>{t("finance.fiscalYear")}</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => currentYear - 1 - i).map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("finance.retainedEarningsAccount")}</Label>
                <Select value={retainedEarningsId} onValueChange={setRetainedEarningsId}>
                  <SelectTrigger className="w-72"><SelectValue placeholder={t("finance.selectAccount")} /></SelectTrigger>
                  <SelectContent>
                    {(equityAccounts || []).map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>{a.account_number} — {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : totals ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("finance.totalRevenue")}</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalRevenue)}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("finance.totalExpenses")}</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalExpenses)}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("finance.netIncome")}</CardTitle></CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totals.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(totals.netIncome)}
                  </div>
                  <Badge variant={totals.netIncome >= 0 ? "default" : "destructive"} className="mt-1">
                    {totals.netIncome >= 0 ? t("finance.profit") : t("finance.loss")}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>{t("finance.closingEntryPreview")}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("finance.account")}</TableHead>
                      <TableHead>{t("finance.category")}</TableHead>
                      <TableHead className="text-right">{t("finance.debit")}</TableHead>
                      <TableHead className="text-right">{t("finance.credit")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {totals.revenueAccounts.map(acc => (
                      <TableRow key={acc.account_id}>
                        <TableCell>{acc.account_number} — {acc.account_name}</TableCell>
                        <TableCell><Badge variant="outline">{t("finance.revenue")}</Badge></TableCell>
                        <TableCell className="text-right">{formatCurrency(acc.balance)}</TableCell>
                        <TableCell className="text-right">—</TableCell>
                      </TableRow>
                    ))}
                    {totals.expenseAccounts.map(acc => (
                      <TableRow key={acc.account_id}>
                        <TableCell>{acc.account_number} — {acc.account_name}</TableCell>
                        <TableCell><Badge variant="outline">{t("finance.expense")}</Badge></TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">{formatCurrency(acc.balance)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold border-t-2">
                      <TableCell colSpan={2}>{t("finance.retainedEarnings")}</TableCell>
                      <TableCell className="text-right">{totals.netIncome < 0 ? formatCurrency(Math.abs(totals.netIncome)) : "—"}</TableCell>
                      <TableCell className="text-right">{totals.netIncome >= 0 ? formatCurrency(totals.netIncome) : "—"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-6 gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    {t("finance.closingWarning")}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePost}
                      disabled={!retainedEarningsId || postClosing.isPending}
                      size="lg"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {postClosing.isPending ? t("common.loading") : t("finance.postClosingEntry")}
                    </Button>
                    {matchingFY && !matchingFY.is_closed && (
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => {
                          if (confirm(`Lock fiscal year ${matchingFY.name}? No further entries can be posted to this period.`)) {
                            lockFY.mutate(matchingFY.id);
                          }
                        }}
                        disabled={lockFY.isPending}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {lockFY.isPending ? t("common.loading") : `Lock FY ${selectedYear}`}
                      </Button>
                    )}
                    {matchingFY?.is_closed && (
                      <Badge variant="secondary" className="self-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked {matchingFY.closed_at ? format(new Date(matchingFY.closed_at), "dd MMM yyyy") : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
