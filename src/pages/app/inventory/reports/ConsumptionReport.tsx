import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { Search } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function ConsumptionReport() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 20;

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

  const filtered = requisitions?.filter(r =>
    r.requisition_number.toLowerCase().includes(search.toLowerCase()) ||
    (r.department?.name || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const deptData = (() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      const dept = r.department?.name || "Unassigned";
      map[dept] = (map[dept] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name: name.slice(0, 20), count })).sort((a, b) => b.count - a.count);
  })();

  const exportData = filtered.map(r => ({
    requisition_number: r.requisition_number,
    department: r.department?.name || "Unassigned",
    status: r.status,
    date: new Date(r.created_at).toLocaleDateString(),
  }));

  const exportColumns = [
    { key: "requisition_number", header: "Req #" },
    { key: "department", header: "Department" },
    { key: "status", header: "Status" },
    { key: "date", header: "Date" },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Consumption Report" description="Stock usage by department"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Consumption" }]}
        actions={
          <ReportExportButton data={exportData} columns={exportColumns} filename="consumption-report" title="Consumption Report" />
        }
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Consumption ({filtered.length} requisitions)</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Req #</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {paged.map((r) => (
                <TableRow key={r.requisition_number}>
                  <TableCell className="font-mono">{r.requisition_number}</TableCell>
                  <TableCell>{r.department?.name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!paged.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No data</TableCell></TableRow>}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
