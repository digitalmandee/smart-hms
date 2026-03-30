import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDialysisPatients, useDialysisMachines, useCreateDialysisSession, useDialysisServicePrice, useDialysisSessions } from "@/hooks/useDialysis";
import { useTranslation } from "@/lib/i18n";
import { Monitor, CheckCircle2, XCircle } from "lucide-react";

export default function DialysisNewSessionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { data: patients } = useDialysisPatients();
  const { data: machines } = useDialysisMachines();
  const createSession = useCreateDialysisSession();
  const { data: servicePrice } = useDialysisServicePrice();

  const [form, setForm] = useState({
    dialysis_patient_id: searchParams.get("patient_id") || "",
    machine_id: "", session_date: new Date().toISOString().split("T")[0],
    shift: searchParams.get("shift") || "morning",
    target_uf_ml: "", duration_minutes: "240",
    dialyzer_type: "", blood_flow_rate: "", dialysate_flow_rate: "", heparin_dose: "",
  });

  // Fetch sessions for selected date to determine availability
  const { data: existingSessions } = useDialysisSessions(form.session_date);

  // Compute machine availability for selected date + shift
  const occupiedMachineIds = new Set(
    (existingSessions || [])
      .filter((s: any) => s.shift === form.shift && s.status !== "cancelled" && s.status !== "no_show")
      .map((s: any) => s.machine_id)
      .filter(Boolean)
  );

  const availableMachines = (machines || []).filter((m: any) => m.status === "available" && !occupiedMachineIds.has(m.id));
  const occupiedMachines = (machines || []).filter((m: any) => occupiedMachineIds.has(m.id));

  // Auto-fill chair from machine
  const selectedMachine = (machines || []).find((m: any) => m.id === form.machine_id);

  const handleSubmit = () => {
    if (!form.dialysis_patient_id || !form.session_date) return;
    createSession.mutate({
      dialysis_patient_id: form.dialysis_patient_id,
      machine_id: form.machine_id || undefined,
      session_date: form.session_date,
      shift: form.shift || undefined,
      chair_number: selectedMachine?.chair_number || undefined,
      target_uf_ml: form.target_uf_ml ? Number(form.target_uf_ml) : undefined,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
      dialyzer_type: form.dialyzer_type || undefined,
      blood_flow_rate: form.blood_flow_rate ? Number(form.blood_flow_rate) : undefined,
      dialysate_flow_rate: form.dialysate_flow_rate ? Number(form.dialysate_flow_rate) : undefined,
      heparin_dose: form.heparin_dose || undefined,
    }, {
      onSuccess: (data: any) => navigate(`/app/dialysis/sessions/${data.id}`),
    });
  };

  const selectedPatient = patients?.find((p: any) => p.id === form.dialysis_patient_id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dialysis.newSession")}
        description={t("dialysis.createSession", "Create a new hemodialysis session")}
        breadcrumbs={[{ label: t("dialysis.dashboard"), href: "/app/dialysis" }, { label: t("dialysis.sessions"), href: "/app/dialysis/sessions" }, { label: t("common.new", "New") }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t("dialysis.sessionDetails", "Session Details")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">{t("common.patient", "Patient")} *</Label>
                <Select value={form.dialysis_patient_id} onValueChange={v => setForm(f => ({ ...f, dialysis_patient_id: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder={t("dialysis.searchPatient")} /></SelectTrigger>
                  <SelectContent>
                    {(patients || []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.patients?.first_name} {p.patients?.last_name} — {p.patients?.patient_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPatient && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dialysis.dryWeight")}: {selectedPatient.dry_weight_kg ?? "–"} kg • {t("dialysis.vascularAccess")}: {selectedPatient.vascular_access_type || "–"} • {t("dialysis.schedulePattern")}: {selectedPatient.schedule_pattern?.toUpperCase() || "–"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("common.date")} *</Label>
                  <Input type="date" className="h-9" value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">{t("dialysis.shiftPreference", "Shift")}</Label>
                  <Select value={form.shift} onValueChange={v => setForm(f => ({ ...f, shift: v }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">{t("dialysis.morning")}</SelectItem>
                      <SelectItem value="afternoon">{t("dialysis.afternoon")}</SelectItem>
                      <SelectItem value="evening">{t("dialysis.evening")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("dialysis.machines", "Machine")}</Label>
                  <Select value={form.machine_id} onValueChange={v => setForm(f => ({ ...f, machine_id: v }))}>
                    <SelectTrigger className="h-9"><SelectValue placeholder={t("dialysis.selectMachine", "Select machine...")} /></SelectTrigger>
                    <SelectContent>
                      {availableMachines.map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>{m.machine_number} — {t("dialysis.chairNo", "Chair")} {m.chair_number || "–"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMachine && (
                    <p className="text-xs text-muted-foreground mt-1">{t("dialysis.chairNo")}: {selectedMachine.chair_number || "–"} • {selectedMachine.model || "–"}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t("dialysis.targetUF")}</Label>
                    <Input type="number" className="h-9" value={form.target_uf_ml} onChange={e => setForm(f => ({ ...f, target_uf_ml: e.target.value }))} placeholder="2000" />
                  </div>
                  <div>
                    <Label className="text-xs">{t("dialysis.duration")}</Label>
                    <Input type="number" className="h-9" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Prescription */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">{t("dialysis.prescription")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t("dialysis.dialyzerType")}</Label>
                    <Select value={form.dialyzer_type} onValueChange={v => setForm(f => ({ ...f, dialyzer_type: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder={t("dialysis.selectDialyzer", "Select dialyzer...")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="F6">F6 (Low Flux)</SelectItem>
                        <SelectItem value="F8">F8 (Low Flux)</SelectItem>
                        <SelectItem value="FX60">FX60 (High Flux)</SelectItem>
                        <SelectItem value="FX80">FX80 (High Flux)</SelectItem>
                        <SelectItem value="FX100">FX100 (High Flux)</SelectItem>
                        <SelectItem value="Polyflux_17R">Polyflux 17R</SelectItem>
                        <SelectItem value="Polyflux_21R">Polyflux 21R</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("dialysis.heparinDose")}</Label>
                    <Select value={form.heparin_dose} onValueChange={v => setForm(f => ({ ...f, heparin_dose: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder={t("dialysis.selectDose", "Select dose...")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Heparin-free)</SelectItem>
                        <SelectItem value="low">Low (1000-2000 IU)</SelectItem>
                        <SelectItem value="standard">Standard (3000-5000 IU)</SelectItem>
                        <SelectItem value="high">{"High (>5000 IU)"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("dialysis.bloodFlowRate")}</Label>
                    <Input type="number" className="h-9" value={form.blood_flow_rate} onChange={e => setForm(f => ({ ...f, blood_flow_rate: e.target.value }))} placeholder="250-400" />
                  </div>
                  <div>
                    <Label className="text-xs">{t("dialysis.dialysateFlowRate")}</Label>
                    <Input type="number" className="h-9" value={form.dialysate_flow_rate} onChange={e => setForm(f => ({ ...f, dialysate_flow_rate: e.target.value }))} placeholder="500-800" />
                  </div>
                </div>
              </div>

              {/* Charges Preview */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">{t("dialysis.chargesPreview", "Charges Preview")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{t("dialysis.sessionFee" as any, "Session Fee")}</p>
                    <p className="font-semibold">{servicePrice?.default_price?.toLocaleString() || "8,000"}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{t("dialysis.consumables", "Consumables (est.)")}</p>
                    <p className="font-semibold">{form.dialyzer_type ? "500" : "—"}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("dialysis.invoiceAutoGenerated", "Invoice will be auto-generated on session completion.")}</p>
              </div>

              <Button onClick={handleSubmit} disabled={createSession.isPending} className="w-full">
                {createSession.isPending ? t("common.loading") : t("dialysis.createSession", "Create Session")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Availability Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Monitor className="h-4 w-4" />
                {t("dialysis.machineAvailability", "Machine Availability")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {form.session_date} • {form.shift} {t("dialysis.shiftPreference", "shift")}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs mb-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {availableMachines.length} {t("dialysis.available")}
                </Badge>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  {occupiedMachines.length} {t("dialysis.occupied")}
                </Badge>
              </div>

              {/* Available Machines */}
              {availableMachines.map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => setForm(f => ({ ...f, machine_id: m.id }))}
                  className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-colors ${
                    form.machine_id === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs">{m.machine_number}</p>
                    <p className="text-xs text-muted-foreground">{t("dialysis.chairNo")}: {m.chair_number || "–"}</p>
                  </div>
                  {form.machine_id === m.id && <Badge variant="default" className="text-[10px] h-5">Selected</Badge>}
                </button>
              ))}

              {/* Occupied Machines */}
              {occupiedMachines.map((m: any) => (
                <div key={m.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-destructive/20 bg-destructive/5 text-sm opacity-60">
                  <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs">{m.machine_number}</p>
                    <p className="text-xs text-muted-foreground">{t("dialysis.chairNo")}: {m.chair_number || "–"}</p>
                  </div>
                  <Badge variant="destructive" className="text-[10px] h-5">{t("dialysis.occupied")}</Badge>
                </div>
              ))}

              {(machines || []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">{t("dialysis.noMachines", "No machines configured")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
