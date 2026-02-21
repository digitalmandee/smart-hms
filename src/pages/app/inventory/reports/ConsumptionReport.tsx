import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function ConsumptionReport() {
  const { profile } = useAuth();

  const { data: requisitions } = useQuery({
    queryKey: ["consumption-report", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("stock_requisitions")
        .select("requisition_number, status, department:departments(name), created_at")
        .eq("organization_id", profile!.organization_id)
        .in("status", ["approved", "fulfilled", "completed"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Array<{
        requisition_number: string; status: string; department: { name: string } | null; created_at: string;
      }>;
    },
    enabled: !!profile?.organization_id,
  });

  const deptData = (() => {
    const map: Record<string, number> = {};
    requisitions?.forEach((r) => {
      const dept = r.department?.name || "Unassigned";
      map[dept] = (map[dept] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name: name.slice(0, 20), count })).sort((a, b) => b.count - a.count);
  })();

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Consumption Report" description="Stock usage by department"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Consumption" }]}
      />
      {deptData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Requisitions by Department</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis />
                <Tooltip /><Bar dataKey="count" fill="hsl(var(--primary))" name="Requisitions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Recent Consumption ({requisitions?.length || 0} requisitions)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Req #</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {requisitions?.slice(0, 30).map((r) => (
                <TableRow key={r.requisition_number}>
                  <TableCell className="font-mono">{r.requisition_number}</TableCell>
                  <TableCell>{r.department?.name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!requisitions?.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No data</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
