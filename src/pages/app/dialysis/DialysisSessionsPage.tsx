import { useDialysisSessions } from "@/hooks/useDialysis";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export default function DialysisSessionsPage() {
  const { data: sessions, isLoading } = useDialysisSessions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dialysis Sessions"
        description="All hemodialysis session records"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: "Sessions" }]}
        actions={<Button asChild><Link to="/app/dialysis/sessions/new"><Plus className="h-4 w-4 mr-2" />New Session</Link></Button>}
      />
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !sessions?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No sessions found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => (
            <Card key={s.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = `/app/dialysis/sessions/${s.id}`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {s.dialysis_patients?.patients?.first_name} {s.dialysis_patients?.patients?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(s as any).session_number} • {s.session_date} • Chair {s.chair_number || "–"} • Machine {s.dialysis_machines?.machine_number || "–"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pre: {s.pre_weight_kg ?? "–"}kg → Post: {s.post_weight_kg ?? "–"}kg • UF: {s.actual_uf_ml ?? s.target_uf_ml ?? "–"}ml • Duration: {s.duration_minutes ?? "–"}min
                    </p>
                  </div>
                  <Badge variant={s.status === "completed" ? "default" : s.status === "in_progress" ? "secondary" : "outline"}>
                    {s.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
