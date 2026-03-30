import { useDialysisSessions, useDialysisMachines, useDialysisPatients } from "@/hooks/useDialysis";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Users, Monitor, Calendar, Plus, ClipboardList } from "lucide-react";
import { format } from "date-fns";

const today = format(new Date(), "yyyy-MM-dd");

export default function DialysisDashboard() {
  const navigate = useNavigate();
  const { data: sessions, isLoading: loadingSessions } = useDialysisSessions(today);
  const { data: machines } = useDialysisMachines();
  const { data: patients } = useDialysisPatients();

  const stats = {
    totalPatients: patients?.length ?? 0,
    totalMachines: machines?.length ?? 0,
    availableMachines: machines?.filter(m => m.status === "available").length ?? 0,
    todaySessions: sessions?.length ?? 0,
    inProgress: sessions?.filter(s => s.status === "in_progress").length ?? 0,
    completed: sessions?.filter(s => s.status === "completed").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dialysis Unit"
        description="Manage hemodialysis sessions, machines, and patient schedules"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/app/dialysis/schedule"><Calendar className="h-4 w-4 mr-2" />Schedule</Link></Button>
            <Button asChild><Link to="/app/dialysis/sessions/new"><Plus className="h-4 w-4 mr-2" />New Session</Link></Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{stats.totalPatients}</p><p className="text-xs text-muted-foreground">Enrolled Patients</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Monitor className="h-5 w-5 text-blue-500" /></div>
              <div><p className="text-2xl font-bold">{stats.availableMachines}/{stats.totalMachines}</p><p className="text-xs text-muted-foreground">Machines Available</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><ClipboardList className="h-5 w-5 text-amber-500" /></div>
              <div><p className="text-2xl font-bold">{stats.todaySessions}</p><p className="text-xs text-muted-foreground">Today's Sessions</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><Activity className="h-5 w-5 text-green-500" /></div>
              <div><p className="text-2xl font-bold">{stats.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Sessions</CardTitle>
          <Button asChild variant="outline" size="sm"><Link to="/app/dialysis/sessions">View All</Link></Button>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !sessions?.length ? (
            <p className="text-muted-foreground text-sm">No sessions scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {s.dialysis_patients?.patients?.first_name} {s.dialysis_patients?.patients?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.session_number} • Chair {s.chair_number || s.dialysis_machines?.chair_number || "–"} • {s.shift || "–"}
                    </p>
                  </div>
                  <Badge variant={s.status === "completed" ? "default" : s.status === "in_progress" ? "secondary" : "outline"}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-20 flex-col gap-1">
          <Link to="/app/dialysis/patients"><Users className="h-5 w-5" />Patients</Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1">
          <Link to="/app/dialysis/machines"><Monitor className="h-5 w-5" />Machines</Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1">
          <Link to="/app/dialysis/schedule"><Calendar className="h-5 w-5" />Schedule</Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1">
          <Link to="/app/dialysis/reports"><Activity className="h-5 w-5" />Reports</Link>
        </Button>
      </div>
    </div>
  );
}
