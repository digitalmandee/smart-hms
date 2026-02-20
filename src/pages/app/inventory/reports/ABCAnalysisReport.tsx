import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function ABCAnalysisReport() {
  const { profile } = useAuth();

  const { data: stocks } = useQuery({
    queryKey: ["abc-analysis", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("store_stock")
        .select("quantity, unit_cost, total_value, item:inventory_items(name, item_code)")
        .eq("organization_id", profile!.organization_id)
        .gt("quantity", 0)
        .order("total_value", { ascending: false });
      if (error) throw error;
      return data as Array<{
        quantity: number; unit_cost: number; total_value: number;
        item: { name: string; item_code: string } | null;
      }>;
    },
    enabled: !!profile?.organization_id,
  });

  const analysis = (() => {
    if (!stocks?.length) return { items: [], chartData: [], summary: { A: 0, B: 0, C: 0 } };
    const totalValue = stocks.reduce((sum, s) => sum + (s.total_value || s.quantity * (s.unit_cost || 0)), 0);
    let cumulative = 0;
    const items = stocks.map((s) => {
      const value = s.total_value || s.quantity * (s.unit_cost || 0);
      cumulative += value;
      const pct = totalValue > 0 ? (cumulative / totalValue) * 100 : 0;
      const category = pct <= 80 ? "A" : pct <= 95 ? "B" : "C";
      return { ...s, value, cumulativePct: Math.round(pct), category };
    });

    const summary = { A: items.filter((i) => i.category === "A").length, B: items.filter((i) => i.category === "B").length, C: items.filter((i) => i.category === "C").length };

    const chartData = items.slice(0, 30).map((i) => ({
      name: (i.item?.item_code || "").slice(0, 10),
      value: Math.round(i.value),
      cumulative: i.cumulativePct,
    }));

    return { items, chartData, summary };
  })();

  const getCategoryColor = (cat: string) => {
    if (cat === "A") return "destructive" as const;
    if (cat === "B") return "default" as const;
    return "outline" as const;
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="ABC Analysis Report" description="Classify items by value contribution (Pareto analysis)"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "ABC Analysis" }]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Category A (80% value)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{analysis.summary.A} items</div></CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Category B (15% value)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{analysis.summary.B} items</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Category C (5% value)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-muted-foreground">{analysis.summary.C} items</div></CardContent>
        </Card>
      </div>
      {analysis.chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Pareto Chart (Top 30 items)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analysis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" /><YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
                <Tooltip /><Bar yAxisId="left" dataKey="value" fill="hsl(var(--primary))" name="Value (Rs.)" />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="hsl(var(--destructive))" name="Cumulative %" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Item Classification</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Item</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Value</TableHead><TableHead className="text-right">Cum %</TableHead><TableHead>Category</TableHead></TableRow></TableHeader>
            <TableBody>
              {analysis.items.slice(0, 50).map((i, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono">{i.item?.item_code || "—"}</TableCell>
                  <TableCell>{i.item?.name || "—"}</TableCell>
                  <TableCell className="text-right">{i.quantity}</TableCell>
                  <TableCell className="text-right">Rs. {i.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{i.cumulativePct}%</TableCell>
                  <TableCell><Badge variant={getCategoryColor(i.category)}>{i.category}</Badge></TableCell>
                </TableRow>
              ))}
              {!analysis.items.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No data</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
