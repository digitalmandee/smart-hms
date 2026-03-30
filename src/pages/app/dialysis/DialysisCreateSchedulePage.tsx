import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDialysisPatients, useDialysisMachines, useCreateDialysisSchedule, useDialysisScheduleAvailability, useDialysisPatientByPatientId } from "@/hooks/useDialysis";
import { usePatients } from "@/hooks/usePatients";
import { useTranslation } from "@/lib/i18n";
import { AlertTriangle, CheckCircle, Info, UserPlus } from "lucide-react";

export default function DialysisCreateSchedulePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { data: dialysisPatients } = useDialysisPatients();
  const { data: machines } = useDialysisMachines();
  const createSchedule = useCreateDialysisSchedule();

  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(searchParams.get("patient_id") || undefined);

  const [form, setForm] = useState({
    dialysis_patient_id: "", pattern: "mwf", shift: "morning",
    start_date: new Date().toISOString().split("T")[0], machine_id: "", chair_number: "",
  });

  // Search general patients
  const { data: searchResults } = usePatients(patientSearch.length >= 2 ? patientSearch : undefined);

  // Check if selected patient is enrolled
  const { data: enrolledPatient, isLoading: checkingEnrollment } = useDialysisPatientByPatientId(selectedPatientId);

  // Check availability for selected pattern+shift
  const { data: availability } = useDialysisScheduleAvailability(form.pattern, form.shift);

  // Auto-populate dialysis_patient_id when enrolled patient is found
  const effectiveDialysisPatientId = enrolledPatient?.id || form.dialysis_patient_id;

  const handleSubmit = () => {
    const dpId = effectiveDialysisPatientId;
    if (!dpId || !form.pattern || !form.shift || !form.start_date) return;

    // Check for conflicts
    if (form.chair_number && availability?.occupiedChairs.includes(form.chair_number)) {
      return; // UI already shows warning
    }

    createSchedule.mutate({
      dialysis_patient_id: dpId,
      pattern: form.pattern,
      shift: form.shift,
      start_date: form.start_date,
      machine_id: form.machine_id || undefined,
      chair_number: form.chair_number || undefined,
    }, { onSuccess: () => navigate("/app/dialysis/schedule") });
  };

  const machineConflict = form.machine_id && availability?.occupied.some((s: any) => s.machine_id === form.machine_id);
  const chairConflict = form.chair_number && availability?.occupiedChairs.includes(form.chair_number);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dialysis.createSchedule" as any)}
        description={t("dialysis.assignSchedule" as any)}
        breadcrumbs={[{ label: t("dialysis.dashboard" as any), href: "/app/dialysis" }, { label: t("dialysis.schedule" as any), href: "/app/dialysis/schedule" }, { label: t("common.new" as any) || "New" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t("dialysis.scheduleDetails" as any) || "Schedule Details"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Search */}
            <div className="space-y-2">
              <Label>{t("dialysis.findPatient" as any)}</Label>
              <Input
                placeholder={t("dialysis.searchPatient" as any)}
                value={patientSearch}
                onChange={e => { setPatientSearch(e.target.value); setSelectedPatientId(undefined); }}
              />
              {patientSearch.length >= 2 && searchResults && searchResults.length > 0 && !selectedPatientId && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {searchResults.slice(0, 8).map(p => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex justify-between"
                      onClick={() => { setSelectedPatientId(p.id); setPatientSearch(`${p.first_name} ${p.last_name || ""} (${p.patient_number})`); }}
                    >
                      <span>{p.first_name} {p.last_name}</span>
                      <span className="text-muted-foreground">{p.patient_number}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enrollment Status */}
            {selectedPatientId && !checkingEnrollment && (
              enrolledPatient ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>{t("dialysis.alreadyEnrolled" as any)}</AlertTitle>
                  <AlertDescription>
                    {enrolledPatient.patients?.first_name} {enrolledPatient.patients?.last_name} — {enrolledPatient.patients?.patient_number}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("dialysis.notEnrolled" as any)}</AlertTitle>
                  <AlertDescription className="flex items-center gap-2">
                    {t("dialysis.enrollFirst" as any)}
                    <Button size="sm" variant="outline" onClick={() => navigate(`/app/dialysis/patients/enroll?patient_id=${selectedPatientId}&redirect=/app/dialysis/schedule/new`)}>
                      <UserPlus className="h-3 w-3 mr-1" /> {t("dialysis.enrollNow" as any)}
                    </Button>
                  </AlertDescription>
                </Alert>
              )
            )}

            {/* Fallback: select from already enrolled patients */}
            {!selectedPatientId && (
              <div>
                <Label>{t("dialysis.orSelectEnrolled" as any) || "Or select enrolled patient"}</Label>
                <Select value={form.dialysis_patient_id} onValueChange={v => setForm(f => ({ ...f, dialysis_patient_id: v }))}>
                  <SelectTrigger><SelectValue placeholder={t("dialysis.selectPatient" as any) || "Select patient..."} /></SelectTrigger>
                  <SelectContent>
                    {(dialysisPatients || []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.patients?.first_name} {p.patients?.last_name} — {p.patients?.patient_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("dialysis.schedulePattern" as any)} *</Label>
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
                <Label>{t("dialysis.shiftPreference" as any)} *</Label>
                <Select value={form.shift} onValueChange={v => setForm(f => ({ ...f, shift: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">{t("dialysis.morning" as any)}</SelectItem>
                    <SelectItem value="afternoon">{t("dialysis.afternoon" as any)}</SelectItem>
                    <SelectItem value="evening">{t("dialysis.evening" as any)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("dialysis.startDate" as any) || "Start Date"} *</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>{t("dialysis.machine" as any) || "Machine"}</Label>
                <Select value={form.machine_id} onValueChange={v => setForm(f => ({ ...f, machine_id: v }))}>
                  <SelectTrigger><SelectValue placeholder={t("dialysis.optional" as any) || "Optional..."} /></SelectTrigger>
                  <SelectContent>
                    {(availability?.availableMachines || machines || []).map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>{m.machine_number} {m.chair_number ? `(Chair ${m.chair_number})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {machineConflict && (
                  <p className="text-xs text-destructive mt-1">{t("dialysis.machineOccupied" as any)}</p>
                )}
              </div>
            </div>

            <div>
              <Label>{t("dialysis.chairNumber" as any) || "Chair Number"}</Label>
              <Input value={form.chair_number} onChange={e => setForm(f => ({ ...f, chair_number: e.target.value }))} />
              {chairConflict && (
                <p className="text-xs text-destructive mt-1">{t("dialysis.chairOccupied" as any)}</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createSchedule.isPending || (!effectiveDialysisPatientId) || !!machineConflict || !!chairConflict}
              className="w-full"
            >
              {createSchedule.isPending ? t("common.loading" as any) : t("dialysis.createScheduleBtn" as any) || "Create Schedule"}
            </Button>
          </CardContent>
        </Card>

        {/* Availability Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t("dialysis.slotAvailability" as any) || "Slot Availability"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{form.pattern.toUpperCase()}</span> — <span className="capitalize">{form.shift}</span>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">{t("dialysis.capacity" as any) || "Capacity"}: {availability?.totalCapacity || 0}</Badge>
              <Badge variant="default">{t("dialysis.used" as any) || "Used"}: {availability?.usedCount || 0}</Badge>
              <Badge variant="outline">{t("dialysis.available" as any) || "Available"}: {(availability?.totalCapacity || 0) - (availability?.usedCount || 0)}</Badge>
            </div>

            {/* Occupied slots */}
            {availability && availability.occupied.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t("dialysis.occupiedSlots" as any) || "Occupied"}</h4>
                <div className="space-y-1">
                  {availability.occupied.map((s: any) => (
                    <div key={s.id} className="text-xs flex justify-between p-2 bg-muted rounded">
                      <span>{s.dialysis_patients?.patients?.first_name} {s.dialysis_patients?.patients?.last_name}</span>
                      <span>{s.chair_number ? `Chair ${s.chair_number}` : s.dialysis_machines?.machine_number || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available machines */}
            {availability && availability.availableMachines.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t("dialysis.availableMachines" as any) || "Available Machines"}</h4>
                <div className="space-y-1">
                  {availability.availableMachines.map((m: any) => (
                    <div key={m.id} className="text-xs flex justify-between p-2 bg-primary/5 rounded">
                      <span>{m.machine_number}</span>
                      <span>{m.chair_number ? `Chair ${m.chair_number}` : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availability && availability.occupied.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("dialysis.allSlotsOpen" as any) || "All slots are open for this pattern/shift."}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
