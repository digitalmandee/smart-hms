import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useFundBalances, useFundDonations, useFundUtilizations } from "@/hooks/useWelfareFunds";
import { useWelfareT } from "@/lib/welfare/i18n";
import { cn } from "@/lib/utils";

export default function FundBalancesPage() {
  const { t, rtl } = useWelfareT();
  const { formatCurrency } = useCurrencyFormatter();
  const { data: balances = [], isLoading } = useFundBalances();
  const [sel, setSel] = useState<string>("");
  const fund = sel || balances[0]?.fund || "";
  const { data: dons = [] } = useFundDonations(fund);
  const { data: uses = [] } = useFundUtilizations(fund || undefined);

  return (
    <div className={cn("space-y-6", rtl && "text-end")}>
      <PageHeader title={t("funds")} description={t("fundsDesc")} />
      {isLoading ? <Skeleton className="h-32" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {balances.map(b => (
            <Card key={b.fund} onClick={() => setSel(b.fund)}
              className={cn("cursor-pointer transition hover:border-primary", fund === b.fund && "border-primary ring-1 ring-primary")}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{t(b.fund)}</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("received")}</span><span>{formatCurrency(b.received)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("spent")}</span><span>{formatCurrency(b.spent)}</span></div>
                <div className="flex justify-between font-semibold"><span>{t("balance")}</span>
                  <span className={b.balance < 0 ? "text-destructive" : "text-primary"}>{formatCurrency(b.balance)}</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {fund && (
        <Card>
          <CardHeader><CardTitle>{t(fund)}</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="d">
              <TabsList><TabsTrigger value="d">{t("donations")}</TabsTrigger><TabsTrigger value="u">{t("utilizations")}</TabsTrigger></TabsList>
              <TabsContent value="d">
                <Table><TableHeader><TableRow><TableHead>{t("date")}</TableHead><TableHead>#</TableHead><TableHead>{t("donations")}</TableHead><TableHead className="text-end">{t("amount")}</TableHead></TableRow></TableHeader>
                  <TableBody>{dons.map(d => (
                    <TableRow key={d.id}><TableCell>{d.donation_date}</TableCell><TableCell>{d.donation_number}</TableCell>
                      <TableCell>{d.financial_donors?.name || "—"}</TableCell><TableCell className="text-end">{formatCurrency(d.amount)}</TableCell></TableRow>
                  ))}</TableBody></Table>
              </TabsContent>
              <TabsContent value="u">
                <Table><TableHeader><TableRow><TableHead>{t("date")}</TableHead><TableHead>{t("patient")}</TableHead><TableHead>{t("department")}</TableHead><TableHead>{t("invoice")}</TableHead><TableHead className="text-end">{t("amount")}</TableHead></TableRow></TableHeader>
                  <TableBody>{uses.map(u => (
                    <TableRow key={u.id}><TableCell>{u.created_at.slice(0, 10)}</TableCell><TableCell>{u.patient_name || "—"}</TableCell>
                      <TableCell>{u.department ? t(u.department) : "—"}</TableCell><TableCell>{u.invoice_number || "—"}</TableCell>
                      <TableCell className="text-end">{formatCurrency(u.amount)}</TableCell></TableRow>
                  ))}</TableBody></Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
