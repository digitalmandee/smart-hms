import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDialysisSession, useUpdateDialysisSession, useDialysisVitals, useAddDialysisVitals, useDialysisServicePrice, useGenerateDialysisInvoice } from "@/hooks/useDialysis";
import { AlertTriangle, Plus, Activity, XCircle, Ban, Clock, User, Stethoscope, Heart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function DialysisSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, roles } = useAuth();
  const { data: session } = useDialysisSession(id);
  const { data: vitals } = useDialysisVitals(id);
  const addVitals = useAddDialysisVitals();
  const updateSession = useUpdateDialysisSession();

  // Role checks
  const isNurseRole = roles.some(r => ["nurse", "opd_nurse", "ipd_nurse", "ot_nurse"].includes(r));
  const isDoctorRole = roles.some(r => ["doctor", "surgeon", "anesthetist"].includes(r));
  const isAdminRole = roles.some(r => ["super_admin", "org_admin", "branch_admin"].includes(r));
  const canRecordVitals = isNurseRole || isAdminRole;
  const canWriteDoctorNotes = isDoctorRole || isAdminRole;
  const canAssignStaff = isDoctorRole || isAdminRole;
  const canStartComplete = isNurseRole || isAdminRole;

  // Fetch doctors for assignment
  const { data: doctors } = useQuery({
    queryKey: ["doctors-list", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, profiles(first_name, last_name)")
        .eq("organization_id", profile!.organization_id!);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const [vitalsForm, setVitalsForm] = useState({
    minute_mark: 0, bp_systolic: "", bp_diastolic: "", pulse: "",
    blood_flow_rate: "", uf_rate: "", notes: "",
  });

  // Pre-dialysis assessment form
  const [preForm, setPreForm] = useState({
    pre_weight_kg: "", pre_bp_systolic: "", pre_bp_diastolic: "",
    pre_pulse: "", pre_temperature: "",
  });

  // Completion form
  const [postForm, setPostForm] = useState({
    post_weight_kg: "", post_bp_systolic: "", post_bp_diastolic: "",
    post_pulse: "", actual_uf_ml: "", doctor_notes: "",
    nursing_notes: "", complications: "",
  });

  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  if (!session) return <div className="p-6 text-muted-foreground">{t("common.loading")}</div>;

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

  const handleStartSession = () => {
    if (!preForm.pre_weight_kg) {
      toast.error(t("dialysis.preWeightRequired", "Pre-weight is required"));
      return;
    }
    const payload: any = {
      id: id!,
      status: "in_progress",
      pre_weight_kg: Number(preForm.pre_weight_kg),
      actual_start_time: new Date().toISOString(),
    };
    if (preForm.pre_bp_systolic) payload.pre_bp_systolic = Number(preForm.pre_bp_systolic);
    if (preForm.pre_bp_diastolic) payload.pre_bp_diastolic = Number(preForm.pre_bp_diastolic);
    if (preForm.pre_pulse) payload.pre_pulse = Number(preForm.pre_pulse);
    if (preForm.pre_temperature) payload.pre_temperature = Number(preForm.pre_temperature);
    updateSession.mutate(payload);
  };

  const handleCompleteSession = () => {
    if (!postForm.post_weight_kg) {
      toast.error(t("dialysis.postWeightRequired", "Post-weight is required"));
      return;
    }
    const payload: any = {
      id: id!,
      status: "completed",
      post_weight_kg: Number(postForm.post_weight_kg),
      actual_end_time: new Date().toISOString(),
    };
    if (postForm.post_bp_systolic) payload.post_bp_systolic = Number(postForm.post_bp_systolic);
    if (postForm.post_bp_diastolic) payload.post_bp_diastolic = Number(postForm.post_bp_diastolic);
    if (postForm.post_pulse) payload.post_pulse = Number(postForm.post_pulse);
    if (postForm.actual_uf_ml) payload.actual_uf_ml = Number(postForm.actual_uf_ml);
    if (postForm.doctor_notes) payload.doctor_notes = postForm.doctor_notes;
    if (postForm.nursing_notes) payload.nursing_notes = postForm.nursing_notes;
    if (postForm.complications) payload.complications = postForm.complications;
    updateSession.mutate(payload);
  };

  const handleCancelOrNoShow = (status: "cancelled" | "no_show") => {
    updateSession.mutate({
      id: id!,
      status,
      nursing_notes: `[${status.toUpperCase()}] ${cancelReason}`,
    }, {
      onSuccess: () => {
        toast.success(`Session marked as ${status.replace("_", " ")}`);
        setShowCancelDialog(false);
      },
    });
  };

  const handleStaffAssignment = (field: "attended_by" | "nurse_id", value: string) => {
    updateSession.mutate({ id: id!, [field]: value });
  };

  const vitalsChartData = (vitals || []).map((v: any) => ({
    minute: v.minute_mark,
    systolic: v.bp_systolic,
    diastolic: v.bp_diastolic,
    pulse: v.pulse,
    uf_rate: v.uf_rate,
  }));

  const isTerminal = session.status === "completed" || session.status === "cancelled" || session.status === "no_show";

  // Duration calculation
  const getDuration = () => {
    if (!(session as any).actual_start_time || !(session as any).actual_end_time) return null;
    const start = new Date((session as any).actual_start_time);
    const end = new Date((session as any).actual_end_time);
    const mins = Math.round((end.getTime() - start.getTime()) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t("dialysis.sessions", "Session")}: ${session.session_number || id?.slice(0, 8)}`}
        description={`${patient?.first_name} ${patient?.last_name} — ${session.session_date}`}
        breadcrumbs={[
          { label: t("dialysis.dashboard"), href: "/app/dialysis" },
          { label: t("dialysis.sessions"), href: "/app/dialysis/sessions" },
          { label: t("dialysis.sessionDetail", "Detail") },
        ]}
      />

      {/* BP Drop Alert */}
      {bpAlert && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="font-semibold text-sm">{bpAlert}</p>
        </div>
      )}

      {/* Session Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-1"><User className="h-4 w-4" />{t("common.name", "Patient")}</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">{patient?.first_name} {patient?.last_name}</p>
            <p className="text-sm text-muted-foreground">MRN: {patient?.patient_number}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("dialysis.machines", "Machine / Chair")}</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">Machine: {machine?.machine_number || "–"}</p>
            <p className="text-sm text-muted-foreground">Chair: {session.chair_number || "–"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("common.status")}</CardTitle></CardHeader>
          <CardContent>
            <Badge className="text-lg" variant={session.status === "completed" ? "default" : session.status === "in_progress" ? "secondary" : session.status === "cancelled" || session.status === "no_show" ? "destructive" : "outline"}>
              {session.status?.replace("_", " ")}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">{t("dialysis.targetUF")}: {session.target_uf_ml || "–"} ml • {t("dialysis.duration")}: {session.duration_minutes || "–"} min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("dialysis.prescription")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">{t("dialysis.dialyzerType")}: {(session as any).dialyzer_type || "–"}</p>
            <p className="text-sm">BFR: {(session as any).blood_flow_rate || "–"} ml/min</p>
            <p className="text-sm">DFR: {(session as any).dialysate_flow_rate || "–"} ml/min</p>
            <p className="text-sm">{t("dialysis.heparinDose")}: {(session as any).heparin_dose || "–"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Assignment — doctors and admins only */}
      {!isTerminal && canAssignStaff && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-1"><Stethoscope className="h-4 w-4" />{t("dialysis.staffAssignment", "Staff Assignment")}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("dialysis.attendingDoctor", "Attending Doctor")}</Label>
                <Select value={(session as any).attended_by || ""} onValueChange={v => handleStaffAssignment("attended_by", v)}>
                  <SelectTrigger><SelectValue placeholder={t("dialysis.selectDoctor", "Select doctor...")} /></SelectTrigger>
                  <SelectContent>
                    {(doctors || []).map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.profiles?.first_name} {d.profiles?.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("dialysis.assignedNurse", "Assigned Nurse")}</Label>
                <Input
                  placeholder={t("dialysis.nurseId", "Nurse ID (manual)")}
                  defaultValue={(session as any).nurse_id || ""}
                  onBlur={e => { if (e.target.value !== ((session as any).nurse_id || "")) handleStaffAssignment("nurse_id", e.target.value); }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-Dialysis Assessment — nurses and admins can start */}
      {session.status === "scheduled" && canStartComplete && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-destructive" />{t("dialysis.preAssessment", "Pre-Dialysis Assessment")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>{t("dialysis.preWeight")} *</Label>
                <Input type="number" step="0.1" value={preForm.pre_weight_kg} onChange={e => setPreForm(f => ({ ...f, pre_weight_kg: e.target.value }))} />
              </div>
              <div>
                <Label>{t("dialysis.preBpSystolic", "Pre-BP Systolic")}</Label>
                <Input type="number" value={preForm.pre_bp_systolic} onChange={e => setPreForm(f => ({ ...f, pre_bp_systolic: e.target.value }))} />
              </div>
              <div>
                <Label>{t("dialysis.preBpDiastolic", "Pre-BP Diastolic")}</Label>
                <Input type="number" value={preForm.pre_bp_diastolic} onChange={e => setPreForm(f => ({ ...f, pre_bp_diastolic: e.target.value }))} />
              </div>
              <div>
                <Label>{t("dialysis.prePulse", "Pre-Pulse")}</Label>
                <Input type="number" value={preForm.pre_pulse} onChange={e => setPreForm(f => ({ ...f, pre_pulse: e.target.value }))} />
              </div>
              <div>
                <Label>{t("dialysis.preTemperature", "Pre-Temp (°C)")}</Label>
                <Input type="number" step="0.1" value={preForm.pre_temperature} onChange={e => setPreForm(f => ({ ...f, pre_temperature: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={handleStartSession} disabled={updateSession.isPending}>
                <Clock className="h-4 w-4 mr-2" />{t("dialysis.startSession")}
              </Button>
              <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                <XCircle className="h-4 w-4 mr-2" />{t("dialysis.cancelSession")}
              </Button>
              <Button variant="outline" onClick={() => handleCancelOrNoShow("no_show")}>
                <Ban className="h-4 w-4 mr-2" />{t("dialysis.noShow")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled — Doctor view (read-only, can assign self) */}
      {session.status === "scheduled" && isDoctorRole && !isAdminRole && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t("dialysis.doctorScheduledNote", "Session is scheduled. Nurse will perform pre-assessment and start the session.")}</p>
          </CardContent>
        </Card>
      )}

      {/* In-Progress: Completion Form — role-aware */}
      {session.status === "in_progress" && (
        <Card>
          <CardHeader><CardTitle>{t("dialysis.postAssessment", "Post-Dialysis Assessment & Completion")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Post vitals — nurses and admins */}
            {canStartComplete && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label>{t("dialysis.postWeight")} *</Label>
                  <Input type="number" step="0.1" value={postForm.post_weight_kg} onChange={e => setPostForm(f => ({ ...f, post_weight_kg: e.target.value }))} />
                </div>
                <div>
                  <Label>{t("dialysis.postBpSystolic", "Post-BP Systolic")}</Label>
                  <Input type="number" value={postForm.post_bp_systolic} onChange={e => setPostForm(f => ({ ...f, post_bp_systolic: e.target.value }))} />
                </div>
                <div>
                  <Label>{t("dialysis.postBpDiastolic", "Post-BP Diastolic")}</Label>
                  <Input type="number" value={postForm.post_bp_diastolic} onChange={e => setPostForm(f => ({ ...f, post_bp_diastolic: e.target.value }))} />
                </div>
                <div>
                  <Label>{t("dialysis.postPulse", "Post-Pulse")}</Label>
                  <Input type="number" value={postForm.post_pulse} onChange={e => setPostForm(f => ({ ...f, post_pulse: e.target.value }))} />
                </div>
                <div>
                  <Label>{t("dialysis.actualUF", "Actual UF (ml)")}</Label>
                  <Input type="number" value={postForm.actual_uf_ml} onChange={e => setPostForm(f => ({ ...f, actual_uf_ml: e.target.value }))} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Complications & Nursing Notes — nurses and admins */}
              {canRecordVitals && (
                <>
                  <div>
                    <Label>{t("dialysis.complications")}</Label>
                    <Textarea value={postForm.complications} onChange={e => setPostForm(f => ({ ...f, complications: e.target.value }))} placeholder={session.complications || t("common.none", "None")} />
                  </div>
                  <div>
                    <Label>{t("dialysis.nursingNotes")}</Label>
                    <Textarea value={postForm.nursing_notes} onChange={e => setPostForm(f => ({ ...f, nursing_notes: e.target.value }))} />
                  </div>
                </>
              )}
            </div>
            {/* Doctor Notes — doctors and admins only */}
            {canWriteDoctorNotes && (
              <div>
                <Label>{t("dialysis.doctorNotes", "Doctor Notes")}</Label>
                <Textarea value={postForm.doctor_notes} onChange={e => setPostForm(f => ({ ...f, doctor_notes: e.target.value }))} placeholder={t("dialysis.doctorNotesPlaceholder", "Clinical observations, instructions...")} />
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              {canStartComplete && (
                <Button onClick={handleCompleteSession} disabled={updateSession.isPending}>
                  {t("dialysis.completeSession")}
                </Button>
              )}
              {canStartComplete && (
                <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                  <XCircle className="h-4 w-4 mr-2" />{t("dialysis.cancelSession")}
                </Button>
              )}
              {/* Doctor sign-off: save doctor notes only */}
              {isDoctorRole && !isAdminRole && (
                <Button onClick={() => {
                  if (postForm.doctor_notes) {
                    updateSession.mutate({ id: id!, doctor_notes: postForm.doctor_notes }, {
                      onSuccess: () => toast.success(t("dialysis.doctorNotesSaved", "Doctor notes saved")),
                    });
                  }
                }} disabled={updateSession.isPending}>
                  <Stethoscope className="h-4 w-4 mr-2" />{t("dialysis.signOff", "Sign Off")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Reason Dialog */}
      {showCancelDialog && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Label>{t("dialysis.cancelReason")}</Label>
            <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder={t("dialysis.cancelReason")} />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => handleCancelOrNoShow("cancelled")} disabled={!cancelReason.trim()}>{t("dialysis.confirmCancel")}</Button>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>{t("common.close")}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed/Terminal: Treatment Outcome Summary */}
      {isTerminal && (
        <Card>
          <CardHeader><CardTitle>{t("dialysis.treatmentOutcome", "Treatment Outcome")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Vitals Comparison */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-xs">{t("dialysis.preWeight")}</p>
                <p className="font-semibold text-lg">{session.pre_weight_kg ?? "–"} kg</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-xs">{t("dialysis.postWeight")}</p>
                <p className="font-semibold text-lg">{session.post_weight_kg ?? "–"} kg</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <p className="text-muted-foreground text-xs">{t("dialysis.weightLoss")}</p>
                <p className="font-semibold text-lg text-primary">
                  {session.pre_weight_kg && session.post_weight_kg ? `${(session.pre_weight_kg - session.post_weight_kg).toFixed(1)} kg` : "–"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-xs">{t("dialysis.preBP", "Pre-BP")}</p>
                <p className="font-semibold">{(session as any).pre_bp_systolic ?? "–"}/{(session as any).pre_bp_diastolic ?? "–"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-xs">{t("dialysis.postBP", "Post-BP")}</p>
                <p className="font-semibold">{(session as any).post_bp_systolic ?? "–"}/{(session as any).post_bp_diastolic ?? "–"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-xs">{t("dialysis.treatmentDuration", "Duration")}</p>
                <p className="font-semibold">{getDuration() || `${session.duration_minutes || "–"} min`}</p>
              </div>
            </div>

            {/* UF Comparison */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t("dialysis.targetUF")}:</span>{" "}
                <span className="font-medium">{session.target_uf_ml ?? "–"} ml</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("dialysis.actualUF", "Actual UF")}:</span>{" "}
                <span className="font-medium">{session.actual_uf_ml ?? "–"} ml</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("dialysis.prePulse", "Pre-Pulse")}:</span>{" "}
                <span className="font-medium">{(session as any).pre_pulse ?? "–"} bpm</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("dialysis.postPulse", "Post-Pulse")}:</span>{" "}
                <span className="font-medium">{(session as any).post_pulse ?? "–"} bpm</span>
              </div>
            </div>

            {/* Prescription Recap */}
            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">{t("dialysis.prescription")}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                <p>{t("dialysis.dialyzerType")}: {(session as any).dialyzer_type || "–"}</p>
                <p>BFR: {(session as any).blood_flow_rate || "–"} ml/min</p>
                <p>DFR: {(session as any).dialysate_flow_rate || "–"} ml/min</p>
                <p>{t("dialysis.heparinDose")}: {(session as any).heparin_dose || "–"}</p>
              </div>
            </div>

            {/* Notes */}
            {session.complications && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium">{t("dialysis.complications")}:</p>
                <p className="text-sm text-destructive">{session.complications}</p>
              </div>
            )}
            {session.nursing_notes && (
              <div>
                <p className="text-sm font-medium">{t("dialysis.nursingNotes")}:</p>
                <p className="text-sm">{session.nursing_notes}</p>
              </div>
            )}
            {(session as any).doctor_notes && (
              <div>
                <p className="text-sm font-medium">{t("dialysis.doctorNotes", "Doctor Notes")}:</p>
                <p className="text-sm">{(session as any).doctor_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vitals Chart */}
      {vitalsChartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />{t("dialysis.vitalsTrend")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="minute" label={{ value: t("dialysis.minuteMark"), position: "insideBottom", offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="systolic" stroke="hsl(var(--destructive))" name={t("dialysis.bpSystolic")} strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolic" stroke="hsl(var(--primary))" name={t("dialysis.bpDiastolic")} strokeWidth={2} />
                  <Line type="monotone" dataKey="pulse" stroke="hsl(var(--accent-foreground))" name={t("dialysis.pulse")} />
                  <Line type="monotone" dataKey="uf_rate" stroke="hsl(var(--muted-foreground))" name={t("dialysis.ufRate")} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Vitals Form */}
      {session.status === "in_progress" && canRecordVitals && (
        <Card>
          <CardHeader><CardTitle>{t("dialysis.recordVitals")}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div><Label>{t("dialysis.minuteMark")}</Label><Input type="number" value={vitalsForm.minute_mark} onChange={e => setVitalsForm(f => ({ ...f, minute_mark: Number(e.target.value) }))} /></div>
              <div><Label>{t("dialysis.bpSystolic")}</Label><Input type="number" value={vitalsForm.bp_systolic} onChange={e => setVitalsForm(f => ({ ...f, bp_systolic: e.target.value }))} /></div>
              <div><Label>{t("dialysis.bpDiastolic")}</Label><Input type="number" value={vitalsForm.bp_diastolic} onChange={e => setVitalsForm(f => ({ ...f, bp_diastolic: e.target.value }))} /></div>
              <div><Label>{t("dialysis.pulse")}</Label><Input type="number" value={vitalsForm.pulse} onChange={e => setVitalsForm(f => ({ ...f, pulse: e.target.value }))} /></div>
              <div><Label>{t("dialysis.bloodFlowRate")}</Label><Input type="number" value={vitalsForm.blood_flow_rate} onChange={e => setVitalsForm(f => ({ ...f, blood_flow_rate: e.target.value }))} /></div>
              <div><Label>{t("dialysis.ufRate")}</Label><Input type="number" value={vitalsForm.uf_rate} onChange={e => setVitalsForm(f => ({ ...f, uf_rate: e.target.value }))} /></div>
              <div className="col-span-2"><Label>{t("common.notes")}</Label><Input value={vitalsForm.notes} onChange={e => setVitalsForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <Button onClick={handleAddVitals} disabled={addVitals.isPending}><Plus className="h-4 w-4 mr-2" />{addVitals.isPending ? t("common.loading") : t("dialysis.recordVitals")}</Button>
          </CardContent>
        </Card>
      )}

      {/* Vitals Table */}
      {(vitals || []).length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t("dialysis.vitalsLog")}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Min</th>
                    <th className="text-left p-2">BP</th>
                    <th className="text-left p-2">{t("dialysis.pulse")}</th>
                    <th className="text-left p-2">BFR</th>
                    <th className="text-left p-2">{t("dialysis.ufRate")}</th>
                    <th className="text-left p-2">{t("common.notes")}</th>
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
