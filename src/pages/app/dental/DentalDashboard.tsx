import { useDentalTreatments } from "@/hooks/useDental";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Smile, ClipboardList, BookOpen, BarChart3, Plus } from "lucide-react";

export default function DentalDashboard() {
  const { data: treatments } = useDentalTreatments();

  const stats = {
    totalTreatments: treatments?.length ?? 0,
    planned: treatments?.filter((t: any) => t.status === "planned").length ?? 0,
    inProgress: treatments?.filter((t: any) => t.status === "in_progress").length ?? 0,
    completed: treatments?.filter((t: any) => t.status === "completed").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dental Department"
        description="Manage dental charts, treatments, and procedures"
        actions={
          <Button asChild><Link to="/app/dental/treatments/new"><Plus className="h-4 w-4 mr-2" />New Treatment</Link></Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><ClipboardList className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.totalTreatments}</p><p className="text-xs text-muted-foreground">Total Treatments</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-amber-500/10"><ClipboardList className="h-5 w-5 text-amber-500" /></div><div><p className="text-2xl font-bold">{stats.planned}</p><p className="text-xs text-muted-foreground">Planned</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><ClipboardList className="h-5 w-5 text-blue-500" /></div><div><p className="text-2xl font-bold">{stats.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><ClipboardList className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{stats.completed}</p><p className="text-xs text-muted-foreground">Completed</p></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-20 flex-col gap-1"><Link to="/app/dental/chart"><Smile className="h-5 w-5" />Tooth Chart</Link></Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1"><Link to="/app/dental/treatments"><ClipboardList className="h-5 w-5" />Treatments</Link></Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1"><Link to="/app/dental/procedures"><BookOpen className="h-5 w-5" />Procedures</Link></Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1"><Link to="/app/dental/reports"><BarChart3 className="h-5 w-5" />Reports</Link></Button>
      </div>

      {/* Recent Treatments */}
      <Card>
        <CardHeader><CardTitle>Recent Treatments</CardTitle></CardHeader>
        <CardContent>
          {!treatments?.length ? (
            <p className="text-muted-foreground text-sm">No treatments found.</p>
          ) : (
            <div className="space-y-2">
              {treatments.slice(0, 10).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{t.patients?.first_name} {t.patients?.last_name}</p>
                    <p className="text-xs text-muted-foreground">Tooth #{t.tooth_number || "–"} • {t.procedure_name || t.dental_procedures?.name || "–"}</p>
                  </div>
                  <span className="text-sm font-medium">{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
