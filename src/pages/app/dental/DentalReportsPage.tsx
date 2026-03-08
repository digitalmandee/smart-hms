import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDentalTreatments, useDentalProcedures } from "@/hooks/useDental";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent-foreground))", "hsl(var(--muted-foreground))", "#eab308"];

export default function DentalReportsPage() {
  const { data: treatments } = useDentalTreatments();

  // Status distribution
  const statusCounts = (treatments || []).reduce((acc: Record<string, number>, t: any) => {
    acc[t.status || "planned"] = (acc[t.status || "planned"] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Revenue by procedure
  const revenueByProc: Record<string, number> = {};
  (treatments || []).forEach((t: any) => {
    if (!t.cost) return;
    const name = t.dental_procedures?.name || t.procedure_name || "Other";
    revenueByProc[name] = (revenueByProc[name] || 0) + t.cost;
  });
  const revenueData = Object.entries(revenueByProc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, revenue]) => ({ name, revenue }));

  const totalRevenue = Object.values(revenueByProc).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dental Reports"
        description="Revenue, procedure analytics, and treatment completion"
        breadcrumbs={[{ label: "Dental", href: "/app/dental" }, { label: "Reports" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{treatments?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Total Treatments</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{statusCounts["completed"] || 0}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Treatment Funnel</CardTitle></CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-muted-foreground">No data yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Revenue by Procedure</CardTitle></CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-muted-foreground">No data yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
