import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useFundUtilizations } from "@/hooks/useWelfareFunds";
import { useWelfareT } from "@/lib/welfare/i18n";
import { cn } from "@/lib/utils";

export default function WelfareReportPage() {
  const { t, rtl } = useWelfareT();
  const { formatCurrency } = useCurrencyFormatter();
  const { data: rows = [] } = useFundUtilizations();

  const { byFund, depts, total, patients } = useMemo(() => {
    const byFund = new Map<string, { patients: Set<string>; total: number; dept: Map<string, number> }>();
    const depts = new Set<string>();
    const all = new Set<string>();
    let total = 0;
    rows.forEach(r => {
      const f = byFund.get(r.fund) ?? { patients: new Set(), total: 0, dept: new Map() };
      const d = r.department || "other";
      depts.add(d);
      if (r.patient_id) { f.patients.add(r.patient_id); all.add(r.patient_id); }
      f.total += Number(r.amount); total += Number(r.amount);
      f.dept.set(d, (f.dept.get(d) || 0) + Number(r.amount));
      byFund.set(r.fund, f);
    });
    return { byFund, depts: [...depts], total, patients: all.size };
  }, [rows]);

  return (
    <div className={cn("space-y-6", rtl && "text-end")}>
      <PageHeader title={t("welfareReport")} description={t("welfareReportDesc")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("patients")}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{patients}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("totalSpent")}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatCurrency(total)}</CardContent></Card>
      </div>
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t("fund")}</TableHead><TableHead>{t("patients")}</TableHead>
              {depts.map(d => <TableHead key={d} className="text-end">{t(d)}</TableHead>)}
              <TableHead className="text-end">{t("total")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {[...byFund.entries()].map(([fund, f]) => (
                <TableRow key={fund}>
                  <TableCell className="font-medium">{t(fund)}</TableCell><TableCell>{f.patients.size}</TableCell>
                  {depts.map(d => <TableCell key={d} className="text-end">{formatCurrency(f.dept.get(d) || 0)}</TableCell>)}
                  <TableCell className="text-end font-semibold">{formatCurrency(f.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
