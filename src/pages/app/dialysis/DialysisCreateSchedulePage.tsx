import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDialysisPatients, useDialysisMachines, useCreateDialysisSchedule } from "@/hooks/useDialysis";

export default function DialysisCreateSchedulePage() {
  const navigate = useNavigate();
  const { data: patients } = useDialysisPatients();
  const { data: machines } = useDialysisMachines();
  const createSchedule = useCreateDialysisSchedule();

  const [form, setForm] = useState({
    dialysis_patient_id: "", pattern: "mwf", shift: "morning",
    start_date: new Date().toISOString().split("T")[0], machine_id: "", chair_number: "",
  });

  const handleSubmit = () => {
    if (!form.dialysis_patient_id || !form.pattern || !form.shift || !form.start_date) return;
    createSchedule.mutate({
      dialysis_patient_id: form.dialysis_patient_id,
      pattern: form.pattern,
      shift: form.shift,
      start_date: form.start_date,
      machine_id: form.machine_id || undefined,
      chair_number: form.chair_number || undefined,
    }, { onSuccess: () => navigate("/app/dialysis/schedule") });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Schedule"
        description="Assign recurring dialysis schedule"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: "Schedule", href: "/app/dialysis/schedule" }, { label: "New" }]}
      />
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Schedule Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Patient *</Label>
            <Select value={form.dialysis_patient_id} onValueChange={v => setForm(f => ({ ...f, dialysis_patient_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
              <SelectContent>
                {(patients || []).map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.patients?.first_name} {p.patients?.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pattern *</Label>
              <Select value={form.pattern} onValueChange={v => setForm(f => ({ ...f, pattern: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mwf">Mon / Wed / Fri</SelectItem>
                  <SelectItem value="tts">Tue / Thu / Sat</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Shift *</Label>
              <Select value={form.shift} onValueChange={v => setForm(f => ({ ...f, shift: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
            <div>
              <Label>Machine</Label>
              <Select value={form.machine_id} onValueChange={v => setForm(f => ({ ...f, machine_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Optional..." /></SelectTrigger>
                <SelectContent>
                  {(machines || []).map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.machine_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Chair Number</Label><Input value={form.chair_number} onChange={e => setForm(f => ({ ...f, chair_number: e.target.value }))} /></div>
          <Button onClick={handleSubmit} disabled={createSchedule.isPending} className="w-full">
            {createSchedule.isPending ? "Creating..." : "Create Schedule"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
