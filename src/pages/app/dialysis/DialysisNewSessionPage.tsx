import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDialysisPatients, useDialysisMachines, useCreateDialysisSession } from "@/hooks/useDialysis";

export default function DialysisNewSessionPage() {
  const navigate = useNavigate();
  const { data: patients } = useDialysisPatients();
  const { data: machines } = useDialysisMachines();
  const createSession = useCreateDialysisSession();

  const [form, setForm] = useState({
    dialysis_patient_id: "", machine_id: "", session_date: new Date().toISOString().split("T")[0],
    shift: "morning", chair_number: "", target_uf_ml: "", duration_minutes: "240",
  });

  const handleSubmit = () => {
    if (!form.dialysis_patient_id || !form.session_date) return;
    createSession.mutate({
      dialysis_patient_id: form.dialysis_patient_id,
      machine_id: form.machine_id || undefined,
      session_date: form.session_date,
      shift: form.shift || undefined,
      chair_number: form.chair_number || undefined,
      target_uf_ml: form.target_uf_ml ? Number(form.target_uf_ml) : undefined,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
    }, {
      onSuccess: (data: any) => navigate(`/app/dialysis/sessions/${data.id}`),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Dialysis Session"
        description="Create a new hemodialysis session"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: "Sessions", href: "/app/dialysis/sessions" }, { label: "New" }]}
      />
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Session Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Patient *</Label>
            <Select value={form.dialysis_patient_id} onValueChange={v => setForm(f => ({ ...f, dialysis_patient_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
              <SelectContent>
                {(patients || []).map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.patients?.first_name} {p.patients?.last_name} — MRN: {p.patients?.mrn_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input type="date" value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))} />
            </div>
            <div>
              <Label>Shift</Label>
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
            <div>
              <Label>Machine</Label>
              <Select value={form.machine_id} onValueChange={v => setForm(f => ({ ...f, machine_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Assign machine..." /></SelectTrigger>
                <SelectContent>
                  {(machines || []).filter((m: any) => m.status === "available").map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.machine_number} — Chair {m.chair_number || "–"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Chair Number</Label>
              <Input value={form.chair_number} onChange={e => setForm(f => ({ ...f, chair_number: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Target UF (ml)</Label><Input type="number" value={form.target_uf_ml} onChange={e => setForm(f => ({ ...f, target_uf_ml: e.target.value }))} placeholder="2000" /></div>
            <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} /></div>
          </div>
          <Button onClick={handleSubmit} disabled={createSession.isPending} className="w-full">
            {createSession.isPending ? "Creating..." : "Create Session"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
