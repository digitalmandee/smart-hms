import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDialysisSessions, useUpdateDialysisSession, useDialysisVitals, useAddDialysisVitals } from "@/hooks/useDialysis";
import { AlertTriangle, Plus, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DialysisSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sessions } = useDialysisSessions();
  const session = sessions?.find((s: any) => s.id === id);
  const { data: vitals } = useDialysisVitals(id);
  const addVitals = useAddDialysisVitals();
  const updateSession = useUpdateDialysisSession();

  const [vitalsForm, setVitalsForm] = useState({
    minute_mark: 0, bp_systolic: "", bp_diastolic: "", pulse: "",
    blood_flow_rate: "", uf_rate: "", notes: "",
  });
  const [weightForm, setWeightForm] = useState({ pre_weight_kg: "", post_weight_kg: "" });
  const [nursingNotes, setNursingNotes] = useState("");
  const [complications, setComplications] = useState("");

  if (!session) return <div className="p-6 text-muted-foreground">Session not found or loading...</div>;

  const patient = session.dialysis_patients?.patients;
  const machine = session.dialysis_machines;

  // BP drop alert
  const bpAlert = (() => {
    if (!vitals || vitals.length < 2) return null;
    const sorted = [...vitals].sort((a: any, b: any) => a.minute_mark - b.minute_mark);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1] as any;
      const curr = sorted[i] as any;
      if (prev.bp_systolic && curr.bp_systolic && (prev.bp_systolic - curr.bp_systolic) > 20) {
        return `⚠ BP dropped ${prev.bp_systolic - curr.bp_systolic}mmHg between min ${prev.minute_mark} and ${curr.minute_mark}`;
      }
    }
    return null;
  })();

  const handleAddVitals = () => {
    if (!id) return;
    addVitals.mutate({
      session_id: id,
      minute_mark: vitalsForm.minute_mark,
      bp_systolic: vitalsForm.bp_systolic ? Number(vitalsForm.bp_systolic) : undefined,
      bp_diastolic: vitalsForm.bp_diastolic ? Number(vitalsForm.bp_diastolic) : undefined,
      pulse: vitalsForm.pulse ? Number(vitalsForm.pulse) : undefined,
      blood_flow_rate: vitalsForm.blood_flow_rate ? Number(vitalsForm.blood_flow_rate) : undefined,
      uf_rate: vitalsForm.uf_rate ? Number(vitalsForm.uf_rate) : undefined,
      notes: vitalsForm.notes || undefined,
    });
    setVitalsForm({ minute_mark: vitalsForm.minute_mark + 30, bp_systolic: "", bp_diastolic: "", pulse: "", blood_flow_rate: "", uf_rate: "", notes: "" });
  };

  const handleStatusChange = (status: string) => {
    const payload: any = { id: id!, status };
    if (status === "in_progress" && weightForm.pre_weight_kg) payload.pre_weight_kg = Number(weightForm.pre_weight_kg);
    if (status === "completed") {
      if (weightForm.post_weight_kg) payload.post_weight_kg = Number(weightForm.post_weight_kg);
      if (nursingNotes) payload.nursing_notes = nursingNotes;
      if (complications) payload.complications = complications;
    }
    updateSession.mutate(payload);
  };

  const vitalsChartData = (vitals || []).map((v: any) => ({
    minute: v.minute_mark,
    systolic: v.bp_systolic,
    diastolic: v.bp_diastolic,
    pulse: v.pulse,
    uf_rate: v.uf_rate,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Session: ${session.session_number || id?.slice(0, 8)}`}
        description={`${patient?.first_name} ${patient?.last_name} — ${session.session_date}`}
        breadcrumbs={[
          { label: "Dialysis", href: "/app/dialysis" },
          { label: "Sessions", href: "/app/dialysis/sessions" },
          { label: "Detail" },
        ]}
      />

      {/* BP Drop Alert */}
      {bpAlert && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="font-semibold text-sm">{bpAlert}</p>
        </div>
      )}

      {/* Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Patient</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">{patient?.first_name} {patient?.last_name}</p>
            <p className="text-sm text-muted-foreground">MRN: {patient?.mrn_number}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Machine / Chair</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">Machine: {machine?.machine_number || "–"}</p>
            <p className="text-sm text-muted-foreground">Chair: {session.chair_number || "–"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Status</CardTitle></CardHeader>
          <CardContent>
            <Badge className="text-lg" variant={session.status === "completed" ? "default" : session.status === "in_progress" ? "secondary" : "outline"}>
              {session.status}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">Target UF: {session.target_uf_ml || "–"} ml • Duration: {session.duration_minutes || "–"} min</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Workflow */}
      <Card>
        <CardHeader><CardTitle>Workflow</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Pre-Weight (kg)</Label>
              <Input type="number" step="0.1" value={weightForm.pre_weight_kg} onChange={e => setWeightForm(f => ({ ...f, pre_weight_kg: e.target.value }))} placeholder={session.pre_weight_kg?.toString() || "—"} />
            </div>
            <div>
              <Label>Post-Weight (kg)</Label>
              <Input type="number" step="0.1" value={weightForm.post_weight_kg} onChange={e => setWeightForm(f => ({ ...f, post_weight_kg: e.target.value }))} placeholder={session.post_weight_kg?.toString() || "—"} />
            </div>
          </div>
          <div>
            <Label>Complications</Label>
            <Textarea value={complications} onChange={e => setComplications(e.target.value)} placeholder={session.complications || "None"} />
          </div>
          <div>
            <Label>Nursing Notes</Label>
            <Textarea value={nursingNotes} onChange={e => setNursingNotes(e.target.value)} placeholder={session.nursing_notes || "Notes..."} />
          </div>
          <div className="flex gap-3">
            {session.status === "scheduled" && (
              <Button onClick={() => handleStatusChange("in_progress")}>Start Session</Button>
            )}
            {session.status === "in_progress" && (
              <Button onClick={() => handleStatusChange("completed")} variant="default">Complete Session</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vitals Chart */}
      {vitalsChartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Intra-Dialysis Vitals Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="minute" label={{ value: "Minute", position: "insideBottom", offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="systolic" stroke="hsl(var(--destructive))" name="Systolic" strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolic" stroke="hsl(var(--primary))" name="Diastolic" strokeWidth={2} />
                  <Line type="monotone" dataKey="pulse" stroke="hsl(var(--accent-foreground))" name="Pulse" />
                  <Line type="monotone" dataKey="uf_rate" stroke="hsl(var(--muted-foreground))" name="UF Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Vitals Form */}
      {session.status === "in_progress" && (
        <Card>
          <CardHeader><CardTitle>Record Vitals</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div><Label>Minute Mark</Label><Input type="number" value={vitalsForm.minute_mark} onChange={e => setVitalsForm(f => ({ ...f, minute_mark: Number(e.target.value) }))} /></div>
              <div><Label>BP Systolic</Label><Input type="number" value={vitalsForm.bp_systolic} onChange={e => setVitalsForm(f => ({ ...f, bp_systolic: e.target.value }))} /></div>
              <div><Label>BP Diastolic</Label><Input type="number" value={vitalsForm.bp_diastolic} onChange={e => setVitalsForm(f => ({ ...f, bp_diastolic: e.target.value }))} /></div>
              <div><Label>Pulse</Label><Input type="number" value={vitalsForm.pulse} onChange={e => setVitalsForm(f => ({ ...f, pulse: e.target.value }))} /></div>
              <div><Label>Blood Flow Rate</Label><Input type="number" value={vitalsForm.blood_flow_rate} onChange={e => setVitalsForm(f => ({ ...f, blood_flow_rate: e.target.value }))} /></div>
              <div><Label>UF Rate</Label><Input type="number" value={vitalsForm.uf_rate} onChange={e => setVitalsForm(f => ({ ...f, uf_rate: e.target.value }))} /></div>
              <div className="col-span-2"><Label>Notes</Label><Input value={vitalsForm.notes} onChange={e => setVitalsForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <Button onClick={handleAddVitals} disabled={addVitals.isPending}><Plus className="h-4 w-4 mr-2" />{addVitals.isPending ? "Saving..." : "Add Vitals"}</Button>
          </CardContent>
        </Card>
      )}

      {/* Vitals Table */}
      {(vitals || []).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Vitals Log</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Min</th>
                    <th className="text-left p-2">BP</th>
                    <th className="text-left p-2">Pulse</th>
                    <th className="text-left p-2">BFR</th>
                    <th className="text-left p-2">UF Rate</th>
                    <th className="text-left p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(vitals as any[]).map((v: any) => (
                    <tr key={v.id} className="border-b">
                      <td className="p-2 font-medium">{v.minute_mark}</td>
                      <td className="p-2">{v.bp_systolic || "–"}/{v.bp_diastolic || "–"}</td>
                      <td className="p-2">{v.pulse || "–"}</td>
                      <td className="p-2">{v.blood_flow_rate || "–"}</td>
                      <td className="p-2">{v.uf_rate || "–"}</td>
                      <td className="p-2 text-muted-foreground">{v.notes || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
