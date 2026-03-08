import { useDialysisSchedules } from "@/hooks/useDialysis";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const patternLabels: Record<string, string> = { mwf: "Mon / Wed / Fri", tts: "Tue / Thu / Sat", custom: "Custom" };
const shiftLabels: Record<string, string> = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };

export default function DialysisSchedulePage() {
  const { data: schedules, isLoading } = useDialysisSchedules();

  const grouped = (schedules || []).reduce((acc: Record<string, any[]>, s: any) => {
    const key = `${s.pattern}-${s.shift}`;
    (acc[key] = acc[key] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dialysis Schedule"
        description="Recurring patient-chair-shift assignments"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: "Schedule" }]}
        actions={<Button asChild><Link to="/app/dialysis/schedule/new"><Plus className="h-4 w-4 mr-2" />New Schedule</Link></Button>}
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !Object.keys(grouped).length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No schedules configured yet.</CardContent></Card>
      ) : (
        Object.entries(grouped).map(([key, items]) => {
          const [pattern, shift] = key.split("-");
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg flex gap-2">
                  <Badge variant="secondary">{patternLabels[pattern] || pattern}</Badge>
                  <Badge variant="outline">{shiftLabels[shift] || shift}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(items as any[]).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{s.dialysis_patients?.patients?.first_name} {s.dialysis_patients?.patients?.last_name}</span>
                      <span className="text-sm text-muted-foreground">Chair {s.chair_number || "–"} • Machine {s.dialysis_machines?.machine_number || "–"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
