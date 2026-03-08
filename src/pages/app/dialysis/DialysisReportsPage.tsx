import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDialysisSessions, useDialysisPatients } from "@/hooks/useDialysis";
import { Activity, Droplets, BarChart3, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent-foreground))", "hsl(var(--muted-foreground))"];

export default function DialysisReportsPage() {
  const { data: sessions } = useDialysisSessions();
  const { data: patients } = useDialysisPatients();

  // Session completion stats
  const statusCounts = (sessions || []).reduce((acc: Record<string, number>, s: any) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  const completionData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Average UF by month
  const ufByMonth: Record<string, { total: number; count: number }> = {};
  (sessions || []).forEach((s: any) => {
    if (!s.actual_uf_ml) return;
    const month = s.session_date?.slice(0, 7);
    if (!month) return;
    if (!ufByMonth[month]) ufByMonth[month] = { total: 0, count: 0 };
    ufByMonth[month].total += s.actual_uf_ml;
    ufByMonth[month].count += 1;
  });
  const ufTrendData = Object.entries(ufByMonth).sort().map(([month, d]) => ({
    month, avg_uf: Math.round(d.total / d.count),
  }));

  // Vascular access distribution
  const accessCounts: Record<string, number> = {};
  (patients || []).forEach((p: any) => {
    const type = p.vascular_access_type || "unknown";
    accessCounts[type] = (accessCounts[type] || 0) + 1;
  });
  const accessData = Object.entries(accessCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dialysis Reports"
        description="Adequacy metrics, infection rates, and access statistics"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: "Reports" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{sessions?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Total Sessions</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{statusCounts["completed"] || 0}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{patients?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Active Patients</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{accessCounts["av_fistula"] || 0}</p>
          <p className="text-sm text-muted-foreground">AV Fistula Patients</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Session Status</CardTitle></CardHeader>
          <CardContent>
            {completionData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-muted-foreground">No data yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" />Vascular Access Distribution</CardTitle></CardHeader>
          <CardContent>
            {accessData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={accessData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {accessData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-muted-foreground">No data yet</p>}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Average UF Removal Trend (ml)</CardTitle></CardHeader>
          <CardContent>
            {ufTrendData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ufTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avg_uf" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-muted-foreground">No UF data yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
