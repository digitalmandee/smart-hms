import { useDialysisPatients } from "@/hooks/useDialysis";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const accessTypeLabels: Record<string, string> = {
  av_fistula: "AV Fistula",
  av_graft: "AV Graft",
  temporary_catheter: "Temp Catheter",
  permanent_catheter: "Perm Catheter",
};

export default function DialysisPatientsPage() {
  const { data: patients, isLoading } = useDialysisPatients();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dialysis Patients"
        description="Chronic dialysis patient registry"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: "Patients" }]}
        actions={<Button asChild><Link to="/app/dialysis/patients/enroll"><Plus className="h-4 w-4 mr-2" />Enroll Patient</Link></Button>}
      />
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !patients?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No dialysis patients enrolled yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {patients.map((dp: any) => (
            <Card key={dp.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{dp.patients?.first_name} {dp.patients?.last_name}</p>
                    <p className="text-sm text-muted-foreground">MRN: {dp.patients?.mrn_number} • Dry Weight: {dp.dry_weight_kg ?? "–"} kg</p>
                    <div className="flex gap-2 mt-1">
                      {dp.vascular_access_type && <Badge variant="outline">{accessTypeLabels[dp.vascular_access_type] || dp.vascular_access_type}</Badge>}
                      {dp.schedule_pattern && <Badge variant="secondary">{dp.schedule_pattern?.toUpperCase()}</Badge>}
                      {dp.shift_preference && <Badge variant="secondary">{dp.shift_preference}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={dp.hepatitis_b_status === "positive" ? "destructive" : "outline"}>HBV: {dp.hepatitis_b_status || "?"}</Badge>
                    <Badge variant={dp.hepatitis_c_status === "positive" ? "destructive" : "outline"}>HCV: {dp.hepatitis_c_status || "?"}</Badge>
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
