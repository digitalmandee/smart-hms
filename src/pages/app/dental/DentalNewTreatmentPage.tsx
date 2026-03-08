import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDentalProcedures, useCreateDentalTreatment } from "@/hooks/useDental";
import ToothSurfaceSelector from "@/components/dental/ToothSurfaceSelector";
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function DentalNewTreatmentPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: procedures } = useDentalProcedures();
  const createTreatment = useCreateDentalTreatment();

  const { data: patients } = useQuery({
    queryKey: ["patients-list", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase.from("patients").select("id, first_name, last_name, patient_number") as any)
        .eq("organization_id", profile!.organization_id!).order("first_name").limit(500);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors-list", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("id, profiles(full_name)")
        .eq("organization_id", profile!.organization_id!).eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [rows, setRows] = useState<Array<{
    tooth_number: string; surfaces: string[]; procedure_id: string; diagnosis: string; cost: string; planned_date: string;
  }>>([{ tooth_number: "", surfaces: [], procedure_id: "", diagnosis: "", cost: "", planned_date: "" }]);

  const addRow = () => setRows(r => [...r, { tooth_number: "", surfaces: [], procedure_id: "", diagnosis: "", cost: "", planned_date: "" }]);
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: any) => setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  const toggleSurface = (i: number, s: string) => {
    setRows(r => r.map((row, idx) => {
      if (idx !== i) return row;
      const surfaces = row.surfaces.includes(s) ? row.surfaces.filter(x => x !== s) : [...row.surfaces, s];
      return { ...row, surfaces };
    }));
  };

  const handleSubmit = async () => {
    if (!patientId) return;
    for (const row of rows) {
      if (!row.procedure_id && !row.diagnosis) continue;
      const proc = procedures?.find((p: any) => p.id === row.procedure_id);
      await createTreatment.mutateAsync({
        patient_id: patientId,
        doctor_id: doctorId || undefined,
        tooth_number: row.tooth_number ? Number(row.tooth_number) : undefined,
        surface: row.surfaces.join(",") || undefined,
        procedure_id: row.procedure_id || undefined,
        procedure_name: proc?.name || undefined,
        diagnosis: row.diagnosis || undefined,
        cost: row.cost ? Number(row.cost) : proc?.default_cost || undefined,
        status: "planned",
        planned_date: row.planned_date || undefined,
      });
    }
    navigate("/app/dental/treatments");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Treatment Plan"
        description="Create multi-tooth treatment plan"
        breadcrumbs={[{ label: "Dental", href: "/app/dental" }, { label: "Treatments", href: "/app/dental/treatments" }, { label: "New" }]}
      />
      <Card>
        <CardHeader><CardTitle>Patient & Doctor</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Patient *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
              <SelectContent>
                {(patients || []).map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.mrn_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Dentist</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger><SelectValue placeholder="Assign dentist..." /></SelectTrigger>
              <SelectContent>
                {(doctors || []).map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{(d.profiles as any)?.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {rows.map((row, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Treatment Item #{i + 1}</CardTitle>
            {rows.length > 1 && <Button size="icon" variant="ghost" onClick={() => removeRow(i)}><Trash2 className="h-4 w-4" /></Button>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Tooth Number</Label>
                <Input type="number" min={11} max={48} value={row.tooth_number} onChange={e => updateRow(i, "tooth_number", e.target.value)} placeholder="e.g. 36" />
              </div>
              <div>
                <Label>Procedure</Label>
                <Select value={row.procedure_id} onValueChange={v => {
                  const proc = procedures?.find((p: any) => p.id === v);
                  updateRow(i, "procedure_id", v);
                  if (proc?.default_cost) updateRow(i, "cost", proc.default_cost.toString());
                }}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {(procedures || []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cost</Label>
                <Input type="number" value={row.cost} onChange={e => updateRow(i, "cost", e.target.value)} />
              </div>
            </div>
            {row.tooth_number && (
              <ToothSurfaceSelector toothNumber={Number(row.tooth_number)} selectedSurfaces={row.surfaces} onToggleSurface={s => toggleSurface(i, s)} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Diagnosis</Label><Textarea value={row.diagnosis} onChange={e => updateRow(i, "diagnosis", e.target.value)} rows={2} /></div>
              <div><Label>Planned Date</Label><Input type="date" value={row.planned_date} onChange={e => updateRow(i, "planned_date", e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3">
        <Button variant="outline" onClick={addRow}><Plus className="h-4 w-4 mr-2" />Add Tooth</Button>
        <Button onClick={handleSubmit} disabled={createTreatment.isPending}>
          {createTreatment.isPending ? "Saving..." : "Save Treatment Plan"}
        </Button>
      </div>
    </div>
  );
}
