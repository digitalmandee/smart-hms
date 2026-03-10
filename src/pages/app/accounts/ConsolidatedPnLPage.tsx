import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export default function ConsolidatedPnLPage() {
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const [period, setPeriod] = useState("current");

  const dateRange = (() => {
    const now = new Date();
    if (period === "current") return { start: startOfMonth(now), end: endOfMonth(now) };
    if (period === "last") return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    if (period === "q") return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
    return { start: startOfMonth(subMonths(now, 11)), end: endOfMonth(now) };
  })();

  // Fetch branches
  const { data: branches } = useQuery({
    queryKey: ["branches", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch journal data per branch
  const { data: branchData, isLoading } = useQuery({
    queryKey: ["consolidated-pnl", profile?.organization_id, period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          debit_amount, credit_amount,
          accounts!inner(name, account_types!inner(category)),
          journal_entries!inner(is_posted, entry_date, branch_id, organization_id)
        `)
        .eq("journal_entries.organization_id", profile!.organization_id!)
        .eq("journal_entries.is_posted", true)
        .gte("journal_entries.entry_date", format(dateRange.start, "yyyy-MM-dd"))
        .lte("journal_entries.entry_date", format(dateRange.end, "yyyy-MM-dd"));
      if (error) throw error;

      // Group by branch
      const byBranch: Record<string, { revenue: number; expenses: number }> = {};
      (data || []).forEach((line: any) => {
        const branchId = line.journal_entries?.branch_id || "unassigned";
        const cat = line.accounts?.account_types?.category;
        if (!byBranch[branchId]) byBranch[branchId] = { revenue: 0, expenses: 0 };
        if (cat === "revenue") byBranch[branchId].revenue += Number(line.credit_amount) - Number(line.debit_amount);
        else if (cat === "expense") byBranch[branchId].expenses += Number(line.debit_amount) - Number(line.credit_amount);
      });
      return byBranch;
    },
    enabled: !!profile?.organization_id,
  });

  const branchMap = (branches || []).reduce((m: Record<string, string>, b: any) => { m[b.id] = b.name; return m; }, {});
  const entries = Object.entries(branchData || {});
  const totalRevenue = entries.reduce((s, [, v]) => s + v.revenue, 0);
  const totalExpenses = entries.reduce((s, [, v]) => s + v.expenses, 0);
  const totalNet = totalRevenue - totalExpenses;

  return (
    <div>
      <PageHeader
        title="Consolidated P&L"
        description="Multi-branch profit & loss comparison"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Reports", href: "/app/accounts/reports" },
          { label: "Consolidated P&L" },
        ]}
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <label className="text-sm font-medium">Period:</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
                <SelectItem value="q">Last 3 Months</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {format(dateRange.start, "dd MMM yyyy")} — {format(dateRange.end, "dd MMM yyyy")}
            </span>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Expenses</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Income</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${totalNet >= 0 ? "" : "text-destructive"}`}>{formatCurrency(totalNet)}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Branch Comparison</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Net Income</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map(([branchId, vals]) => {
                    const net = vals.revenue - vals.expenses;
                    const margin = vals.revenue > 0 ? ((net / vals.revenue) * 100).toFixed(1) : "0.0";
                    return (
                      <TableRow key={branchId}>
                        <TableCell className="font-medium">{branchMap[branchId] || "Unassigned"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(vals.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(vals.expenses)}</TableCell>
                        <TableCell className={`text-right font-medium ${net >= 0 ? "" : "text-destructive"}`}>{formatCurrency(net)}</TableCell>
                        <TableCell className="text-right"><Badge variant={Number(margin) >= 0 ? "default" : "destructive"}>{margin}%</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                  {entries.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No data for selected period</TableCell></TableRow>
                  )}
                  {entries.length > 0 && (
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalExpenses)}</TableCell>
                      <TableCell className={`text-right ${totalNet >= 0 ? "" : "text-destructive"}`}>{formatCurrency(totalNet)}</TableCell>
                      <TableCell className="text-right">{totalRevenue > 0 ? ((totalNet / totalRevenue) * 100).toFixed(1) : "0.0"}%</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
