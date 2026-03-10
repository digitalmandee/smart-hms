import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCostCenters } from "@/hooks/useCostCenters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart } from "lucide-react";

export default function CostCenterPnLPage() {
  const { data: costCenters } = useCostCenters();
  const [selectedCC, setSelectedCC] = useState<string>("all");
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();

  const { data: pnlData, isLoading } = useQuery({
    queryKey: ["cost-center-pnl", profile?.organization_id, selectedCC],
    queryFn: async () => {
      // Get journal entry lines with cost center, joined to accounts
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          debit_amount, credit_amount, cost_center_id,
          accounts!inner(name, account_number, account_types!inner(category)),
          journal_entries!inner(is_posted, organization_id)
        `)
        .eq("journal_entries.organization_id", profile!.organization_id!)
        .eq("journal_entries.is_posted", true);

      if (selectedCC !== "all") {
        query = query.eq("cost_center_id", selectedCC);
      } else {
        query = query.not("cost_center_id", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by category
      const revenue: Record<string, number> = {};
      const expenses: Record<string, number> = {};

      (data || []).forEach((line: any) => {
        const cat = line.accounts?.account_types?.category;
        const name = line.accounts?.name || "Unknown";
        const amount = Number(line.credit_amount) - Number(line.debit_amount);

        if (cat === "revenue") {
          revenue[name] = (revenue[name] || 0) + amount;
        } else if (cat === "expense") {
          expenses[name] = (expenses[name] || 0) + (Number(line.debit_amount) - Number(line.credit_amount));
        }
      });

      const totalRevenue = Object.values(revenue).reduce((s, v) => s + v, 0);
      const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0);

      return {
        revenue: Object.entries(revenue).map(([name, amount]) => ({ name, amount })),
        expenses: Object.entries(expenses).map(([name, amount]) => ({ name, amount })),
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
      };
    },
    enabled: !!profile?.organization_id,
  });

  return (
    <div>
      <PageHeader
        title="Cost Center P&L"
        description="Profit & Loss by cost center / department"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Reports", href: "/app/accounts/reports" },
          { label: "Cost Center P&L" },
        ]}
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Cost Center:</label>
              <Select value={selectedCC} onValueChange={setSelectedCC}>
                <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select cost center" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cost Centers</SelectItem>
                  {(costCenters || []).map((cc: any) => (
                    <SelectItem key={cc.id} value={cc.id}>{cc.code} — {cc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card><CardContent className="pt-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
        ) : pnlData ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(pnlData.totalRevenue)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Expenses</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(pnlData.totalExpenses)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Income</CardTitle></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${pnlData.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(pnlData.netIncome)}</div></CardContent>
            </Card>
          </div>
        ) : null}

        {pnlData && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-green-500" />Revenue</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {pnlData.revenue.map(r => (
                      <TableRow key={r.name}><TableCell>{r.name}</TableCell><TableCell className="text-right">{formatCurrency(r.amount)}</TableCell></TableRow>
                    ))}
                    <TableRow className="font-bold"><TableCell>Total</TableCell><TableCell className="text-right">{formatCurrency(pnlData.totalRevenue)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-red-500" />Expenses</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {pnlData.expenses.map(e => (
                      <TableRow key={e.name}><TableCell>{e.name}</TableCell><TableCell className="text-right">{formatCurrency(e.amount)}</TableCell></TableRow>
                    ))}
                    <TableRow className="font-bold"><TableCell>Total</TableCell><TableCell className="text-right">{formatCurrency(pnlData.totalExpenses)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
