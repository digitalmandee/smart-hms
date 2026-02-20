import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function StockMovementReport() {
  const { profile } = useAuth();
  const [from, setFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: grns } = useQuery({
    queryKey: ["movement-grns", profile?.organization_id, from, to],
    queryFn: async () => {
      const { data, error } = await queryTable("goods_received_notes")
        .select("grn_number, received_date, invoice_amount")
        .eq("organization_id", profile!.organization_id)
        .gte("received_date", from).lte("received_date", to)
        .order("received_date");
      if (error) throw error;
      return data as Array<{ grn_number: string; received_date: string; invoice_amount: number | null }>;
    },
    enabled: !!profile?.organization_id,
  });

  const { data: requisitions } = useQuery({
    queryKey: ["movement-reqs", profile?.organization_id, from, to],
    queryFn: async () => {
      const { data, error } = await queryTable("stock_requisitions")
        .select("requisition_number, created_at, status")
        .eq("organization_id", profile!.organization_id)
        .gte("created_at", from).lte("created_at", to + "T23:59:59")
        .order("created_at");
      if (error) throw error;
      return data as Array<{ requisition_number: string; created_at: string; status: string }>;
    },
    enabled: !!profile?.organization_id,
  });

  const chartData = (() => {
    const map: Record<string, { date: string; stockIn: number; stockOut: number }> = {};
    grns?.forEach((g) => {
      const d = g.received_date;
      if (!map[d]) map[d] = { date: d, stockIn: 0, stockOut: 0 };
      map[d].stockIn += 1;
    });
    requisitions?.forEach((r) => {
      const d = r.created_at.split("T")[0];
      if (!map[d]) map[d] = { date: d, stockIn: 0, stockOut: 0 };
      map[d].stockOut += 1;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  })();

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Stock Movement Report" description="Track stock ins and outs over time"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Movement" }]}
      />
      <Card>
        <CardContent className="pt-6 flex gap-4 flex-wrap">
          <div className="space-y-1"><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-44" /></div>
          <div className="space-y-1"><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-44" /></div>
        </CardContent>
      </Card>
      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Movement Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stockIn" fill="hsl(var(--primary))" name="Stock In (GRN)" />
                <Bar dataKey="stockOut" fill="hsl(var(--destructive))" name="Stock Out (Req)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Stock In (GRNs): {grns?.length || 0}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>GRN #</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {grns?.slice(0, 20).map((g) => (
                  <TableRow key={g.grn_number}><TableCell className="font-mono">{g.grn_number}</TableCell><TableCell>{g.received_date}</TableCell><TableCell className="text-right">Rs. {(g.invoice_amount || 0).toLocaleString()}</TableCell></TableRow>
                ))}
                {!grns?.length && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No GRNs</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Stock Out (Requisitions): {requisitions?.length || 0}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Req #</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {requisitions?.slice(0, 20).map((r) => (
                  <TableRow key={r.requisition_number}><TableCell className="font-mono">{r.requisition_number}</TableCell><TableCell>{r.created_at.split("T")[0]}</TableCell><TableCell><Badge variant="outline">{r.status}</Badge></TableCell></TableRow>
                ))}
                {!requisitions?.length && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No requisitions</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
