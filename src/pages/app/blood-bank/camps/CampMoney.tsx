import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useCampRow } from "@/hooks/useBloodCamps";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

const EXPENSE_TYPES = ["transport", "staff", "refreshments", "bags", "venue", "publicity", "other"];

export function CampMoney({ campId, locked, expenses, income, collected, usable, issued, tc, rtl }: {
  campId: string; locked: boolean; expenses: { id: string; category: string; amount: number; notes: string | null }[];
  income: number; collected: number; usable: number; issued: number; tc: (k: string) => string; rtl: boolean;
}) {
  const { formatCurrency } = useCurrencyFormatter();
  const m = useCampRow("blood_camp_expenses");
  const [ex, setEx] = useState({ category: "transport", amount: "", notes: "" });
  const end = rtl ? "text-end" : ""; const row = rtl ? "flex-row-reverse" : "";
  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const profit = income - total;
  const per = (v: number, n: number) => (n > 0 ? formatCurrency(v / n) : "–");
  const byType = EXPENSE_TYPES.map((t) => [t, expenses.filter((e) => e.category === t).reduce((s, e) => s + Number(e.amount || 0), 0)] as const).filter(([, v]) => v > 0);
  const card = (label: string, v: string, tone?: "pos" | "neg") => (
    <Card><CardContent className={`p-4 ${end}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold ${tone === "pos" ? "text-primary" : tone === "neg" ? "text-destructive" : ""}`}>{v}</p>
    </CardContent></Card>
  );
  const add = async () => {
    const amount = Number(ex.amount);
    if (!(amount > 0)) return;
    await m.mutateAsync({ camp_id: campId, category: ex.category, amount, notes: ex.notes || null });
    setEx({ ...ex, amount: "", notes: "" });
  };
  return (
    <>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {card(tc("totalExpenses"), formatCurrency(total))}
        {card(tc("costPerCollected"), per(total, collected))}
        {card(tc("costPerUsable"), per(total, usable))}
        {card(tc("income"), formatCurrency(income))}
        {card(tc("profit"), formatCurrency(profit), profit >= 0 ? "pos" : "neg")}
        {card(tc("profitPerIssued"), per(profit, issued), issued > 0 ? (profit >= 0 ? "pos" : "neg") : undefined)}
      </div>
      <Card>
        <CardHeader><CardTitle className={end}>{tc("expenses")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {locked ? <p className={`text-sm text-muted-foreground ${end}`}>{tc("lockedNote")}</p> : (
            <div className={`flex flex-wrap gap-2 items-end ${row}`}>
              <div className="space-y-1 w-48"><Label className={`block ${end}`}>{tc("category")}</Label>
                <Select value={ex.category} onValueChange={(v) => setEx({ ...ex, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPENSE_TYPES.map((t) => <SelectItem key={t} value={t}>{tc(`ex_${t}`)}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="space-y-1 w-32"><Label className={`block ${end}`}>{tc("amount")}</Label>
                <Input type="number" min="0" value={ex.amount} onChange={(e) => setEx({ ...ex, amount: e.target.value })} /></div>
              <div className="space-y-1 flex-1 min-w-40"><Label className={`block ${end}`}>{tc("notes")}</Label>
                <Input value={ex.notes} onChange={(e) => setEx({ ...ex, notes: e.target.value })} /></div>
              <Button onClick={add} disabled={m.isPending || !(Number(ex.amount) > 0)}>{tc("addExpense")}</Button>
            </div>
          )}
          {expenses.length > 0 && (
            <Table>
              <TableHeader><TableRow>
                <TableHead className={end}>{tc("category")}</TableHead><TableHead className={end}>{tc("amount")}</TableHead><TableHead className={end}>{tc("notes")}</TableHead><TableHead />
              </TableRow></TableHeader>
              <TableBody>{expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className={end}>{tc(`ex_${e.category}`)}</TableCell>
                  <TableCell className={end}>{formatCurrency(Number(e.amount))}</TableCell>
                  <TableCell className={end}>{e.notes || "-"}</TableCell>
                  <TableCell>{!locked && <Button size="icon" variant="ghost" onClick={() => m.mutate({ _delete: e.id })}><Trash2 className="h-4 w-4" /></Button>}</TableCell>
                </TableRow>))}
              </TableBody>
            </Table>
          )}
          {byType.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${row}`}>
              <span className="text-sm text-muted-foreground">{tc("byType")}:</span>
              {byType.map(([t, v]) => <Badge key={t} variant="outline">{tc(`ex_${t}`)}: {formatCurrency(v)}</Badge>)}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
