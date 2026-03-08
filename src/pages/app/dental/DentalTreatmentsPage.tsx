import { useDentalTreatments } from "@/hooks/useDental";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  planned: "outline",
  in_progress: "secondary",
  completed: "default",
  cancelled: "destructive",
};

export default function DentalTreatmentsPage() {
  const { data: treatments, isLoading } = useDentalTreatments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dental Treatments"
        description="Treatment plans and records"
        breadcrumbs={[{ label: "Dental", href: "/app/dental" }, { label: "Treatments" }]}
        actions={<Button asChild><Link to="/app/dental/treatments/new"><Plus className="h-4 w-4 mr-2" />New Treatment</Link></Button>}
      />
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !treatments?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No treatments found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {treatments.map((t: any) => (
            <Card key={t.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{t.patients?.first_name} {t.patients?.last_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Tooth #{t.tooth_number || "–"} {t.surface ? `(${t.surface})` : ""} • {t.procedure_name || t.dental_procedures?.name || "–"}
                    </p>
                    {t.diagnosis && <p className="text-xs text-muted-foreground mt-1">{t.diagnosis}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {t.cost > 0 && <span className="font-medium text-sm">{t.cost} SAR</span>}
                    <Badge variant={statusVariants[t.status] || "outline"}>{t.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
