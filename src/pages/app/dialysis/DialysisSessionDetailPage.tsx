import { useState, useEffect, useRef } from "react";
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
import { AlertTriangle, Plus, Activity, XCircle, Ban, Play, CheckCircle2, User, Stethoscope, Heart, Receipt, Monitor } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

const WORKFLOW_STEPS = ["scheduled", "in_progress", "completed"] as const;

function WorkflowStepper({ currentStatus }: { currentStatus: string }) {
  const { t } = useTranslation();
  const labels: Record<string, string> = {
    scheduled: t("dialysis.scheduled", "Scheduled"),
    in_progress: t("dialysis.inProgress", "In Progress"),
    completed: t("dialysis.completed", "Completed"),
  };
  const isTerminal = currentStatus === "cancelled" || currentStatus === "no_show";
  const currentIdx = WORKFLOW_STEPS.indexOf(currentStatus as any);

  return (
    <div className="flex items-center gap-1">
      {WORKFLOW_STEPS.map((step, idx) => {
        const done = !isTerminal && idx <= currentIdx;
        const active = !isTerminal && idx === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              active ? "bg-primary text-primary-foreground" :
              done ? "bg-primary/20 text-primary" :
              "bg-muted text-muted-foreground"
            }`}>
              {done && idx < currentIdx ? <CheckCircle2 className="h-3 w-3" /> : null}
              {labels[step]}
            </div>
            {idx < WORKFLOW_STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${done && idx < currentIdx ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
      {isTerminal && (
        <Badge variant="destructive" className="ml-2">{currentStatus.replace("_", " ").toUpperCase()}</Badge>
      )}
    </div>
  );
}

export default function DialysisSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, roles } = useAuth();
  const { data: session } = useDialysisSession(id);
  const { data: vitals } = useDialysisVitals(id);
  const addVitals = useAddDialysisVitals();
  const updateSession = useUpdateDialysisSession();
  const { data: servicePrice } = useDialysisServicePrice();
  const generateInvoice = useGenerateDialysisInvoice();
  const autoAssignedRef = useRef(false);

  const isNurseRole = roles.some(r => ["nurse", "opd_nurse", "ipd_nurse", "ot_nurse"].includes(r));
  const isDoctorRole = roles.some(r => ["doctor", "surgeon", "anesthetist"].includes(r));
  const isAdminRole = roles.some(r => ["super_admin", "org_admin", "branch_admin"].includes(r));
  const canRecordVitals = isNurseRole || isAdminRole;
  const canWriteDoctorNotes = isDoctorRole || isAdminRole;
  const canAssignStaff = isDoctorRole || isAdminRole;
  const canStartComplete = isNurseRole || isDoctorRole || isAdminRole;

  const { data: doctors } = useQuery({
    queryKey: ["doctors-list", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, profiles(full_name)")
        .eq("organization_id", profile!.organization_id!);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Find the current user's doctor record for auto-assign
  const { data: myDoctorRecord } = useQuery({
    queryKey: ["my-doctor-record", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", profile!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && isDoctorRole,
  });

  // Auto-assign logged-in doctor as attending
  useEffect(() => {
    if (
      isDoctorRole &&
      myDoctorRecord?.id &&
      session &&
      !(session as any).attended_by &&
      session.status === "scheduled" &&
      !autoAssignedRef.current
    ) {
      autoAssignedRef.current = true;
      updateSession.mutate(
        { id: id!, attended_by: myDoctorRecord.id },
        { onSuccess: () => toast.info(t("dialysis.youAreAttending" as any)) }
      );
    }
  }, [isDoctorRole, myDoctorRecord, session, id, updateSession, t]);

  const [vitalsForm, setVitalsForm] = useState({
    minute_mark: 0, bp_systolic: "", bp_diastolic: "", pulse: "",
    blood_flow_rate: "", uf_rate: "", notes: "",
  });
  const [preForm, setPreForm] = useState({
    pre_weight_kg: "", pre_bp_systolic: "", pre_bp_diastolic: "",
    pre_pulse: "", pre_temperature: "",
  });
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

  // Nurse: save pre-assessment without starting
  const handleSavePreAssessment = () => {
    if (!preForm.pre_weight_kg) {
      toast.error(t("dialysis.preWeightRequired"));
      return;
    }
    const payload: any = { id: id!, pre_weight_kg: Number(preForm.pre_weight_kg) };
    if (preForm.pre_bp_systolic) payload.pre_bp_systolic = Number(preForm.pre_bp_systolic);
    if (preForm.pre_bp_diastolic) payload.pre_bp_diastolic = Number(preForm.pre_bp_diastolic);
    if (preForm.pre_pulse) payload.pre_pulse = Number(preForm.pre_pulse);
    if (preForm.pre_temperature) payload.pre_temperature = Number(preForm.pre_temperature);
    updateSession.mutate(payload, {
      onSuccess: () => toast.success(t("dialysis.preAssessmentSaved" as any)),
    });
  };

  const handleStartSession = () => {
    // Nurses must fill pre-weight; Doctors can start without it
    if (isNurseRole && !preForm.pre_weight_kg && !session?.pre_weight_kg) {
      toast.error(t("dialysis.preWeightRequired"));
      return;
    }
    const payload: any = {
      id: id!,
      status: "in_progress",
      actual_start_time: new Date().toISOString(),
    };
    // Include pre-weight if provided (nurse flow)
    if (preForm.pre_weight_kg) payload.pre_weight_kg = Number(preForm.pre_weight_kg);
    if (preForm.pre_bp_systolic) payload.pre_bp_systolic = Number(preForm.pre_bp_systolic);
    if (preForm.pre_bp_diastolic) payload.pre_bp_diastolic = Number(preForm.pre_bp_diastolic);
    if (preForm.pre_pulse) payload.pre_pulse = Number(preForm.pre_pulse);
    if (preForm.pre_temperature) payload.pre_temperature = Number(preForm.pre_temperature);
    updateSession.mutate(payload);
  };

  const handleCompleteSession = () => {
    if (!postForm.post_weight_kg) {
      toast.error(t("dialysis.postWeightRequired"));
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
    updateSession.mutate(payload, {
      onSuccess: () => {
        const fee = servicePrice?.default_price || 8000;
        const consumables: { description: string; amount: number }[] = [];
        if ((session as any).dialyzer_type) {
          consumables.push({ description: `Dialyzer: ${(session as any).dialyzer_type}`, amount: 500 });
        }
        generateInvoice.mutate({
          sessionId: id!,
          patientId: session.dialysis_patients?.patient_id,
          sessionNumber: session.session_number,
          sessionFee: fee,
          consumablesCharges: consumables,
        });
      },
    });
  };

  const handleGenerateInvoiceRetro = () => {
    const fee = servicePrice?.default_price || 8000;
    const consumables: { description: string; amount: number }[] = [];
    if ((session as any).dialyzer_type) {
      consumables.push({ description: `Dialyzer: ${(session as any).dialyzer_type}`, amount: 500 });
    }
    generateInvoice.mutate({
      sessionId: id!,
      patientId: session.dialysis_patients?.patient_id,
      sessionNumber: session.session_number,
      sessionFee: fee,
      consumablesCharges: consumables,
    });
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
    <div className="space-y-4">
      <PageHeader
        title={`${t("dialysis.sessions")}: ${session.session_number || id?.slice(0, 8)}`}
        breadcrumbs={[
          { label: t("dialysis.dashboard"), href: "/app/dialysis" },
          { label: t("dialysis.sessions"), href: "/app/dialysis/sessions" },
          { label: t("dialysis.sessionDetail") },
        ]}
      />

      {/* Compact Header: Patient + Doctor + Status — single row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{patient?.first_name} {patient?.last_name}</h2>
            <p className="text-sm text-muted-foreground">MRN: {patient?.patient_number} • {session.session_date} • {session.shift || "–"}</p>
          </div>
          {/* Attending doctor info */}
          {(() => {
            const attendingDoc = (session as any).attended_by && doctors?.find((d: any) => d.id === (session as any).attended_by);
            if (!attendingDoc) return null;
            const isMe = isDoctorRole && myDoctorRecord?.id === attendingDoc.id;
            return (
              <div className="flex items-center gap-1.5 ml-2 pl-3 border-l">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{(attendingDoc.profiles as any)?.full_name}</span>
                {isMe && <Badge variant="secondary" className="text-xs">{t("dialysis.youAreAttending" as any)}</Badge>}
              </div>
            );
          })()}
        </div>
        <WorkflowStepper currentStatus={session.status || "scheduled"} />
      </div>

      {/* BP Drop Alert */}
      {bpAlert && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="font-medium">{bpAlert}</p>
        </div>
      )}

      {/* Action Buttons — prominent at top for scheduled/in_progress */}
      {!isTerminal && (
        <div className="flex items-center gap-2 flex-wrap">
          {session.status === "scheduled" && canStartComplete && (
            <Button onClick={handleStartSession} disabled={updateSession.isPending} className="gap-2">
              <Play className="h-4 w-4" />{t("dialysis.startSession")}
            </Button>
          )}
          {session.status === "in_progress" && canStartComplete && (
            <Button onClick={handleCompleteSession} disabled={updateSession.isPending} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />{t("dialysis.completeSession")}
            </Button>
          )}
          {canStartComplete && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowCancelDialog(true)} className="gap-1.5">
                <XCircle className="h-3.5 w-3.5" />{t("dialysis.cancelSession")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleCancelOrNoShow("no_show")} className="gap-1.5">
                <Ban className="h-3.5 w-3.5" />{t("dialysis.noShow")}
              </Button>
            </>
          )}
        </div>
      )}

      {/* 2-Column Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Machine & Chair */}
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5"><Monitor className="h-4 w-4 text-muted-foreground" />{t("dialysis.machines")}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">{t("dialysis.machineNo", "Machine")}:</span> <span className="font-medium">{machine?.machine_number || "–"}</span></div>
            <div><span className="text-muted-foreground">{t("dialysis.chairNo", "Chair")}:</span> <span className="font-medium">{machine?.chair_number || session.chair_number || "–"}</span></div>
            <div><span className="text-muted-foreground">{t("dialysis.targetUF")}:</span> <span className="font-medium">{session.target_uf_ml || "–"} ml</span></div>
            <div><span className="text-muted-foreground">{t("dialysis.duration")}:</span> <span className="font-medium">{session.duration_minutes || "–"} min</span></div>
          </div>
        </div>

        {/* Prescription */}
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="text-sm font-semibold">{t("dialysis.prescription")}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">{t("dialysis.dialyzerType")}:</span> <span className="font-medium">{(session as any).dialyzer_type || "–"}</span></div>
            <div><span className="text-muted-foreground">{t("dialysis.heparinDose")}:</span> <span className="font-medium">{(session as any).heparin_dose || "–"}</span></div>
            <div><span className="text-muted-foreground">BFR:</span> <span className="font-medium">{(session as any).blood_flow_rate || "–"} ml/min</span></div>
            <div><span className="text-muted-foreground">DFR:</span> <span className="font-medium">{(session as any).dialysate_flow_rate || "–"} ml/min</span></div>
          </div>
        </div>
      </div>

      {/* Staff Assignment — inline */}
      {!isTerminal && canAssignStaff && (
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5"><Stethoscope className="h-4 w-4 text-muted-foreground" />{t("dialysis.staffAssignment")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">{t("dialysis.attendingDoctor")}</Label>
              <Select value={(session as any).attended_by || ""} onValueChange={v => handleStaffAssignment("attended_by", v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder={t("dialysis.selectDoctor")} /></SelectTrigger>
                <SelectContent>
                  {(doctors || []).map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.profiles?.first_name} {d.profiles?.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("dialysis.assignedNurse")}</Label>
              <Input
                className="h-9"
                placeholder={t("dialysis.nurseId")}
                defaultValue={(session as any).nurse_id || ""}
                onBlur={e => { if (e.target.value !== ((session as any).nurse_id || "")) handleStaffAssignment("nurse_id", e.target.value); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pre-Dialysis Assessment — inline below actions when scheduled */}
      {session.status === "scheduled" && canStartComplete && (
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5"><Heart className="h-4 w-4 text-destructive" />{t("dialysis.preAssessment")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs">{t("dialysis.preWeight")} *</Label>
              <Input type="number" step="0.1" className="h-9" value={preForm.pre_weight_kg} onChange={e => setPreForm(f => ({ ...f, pre_weight_kg: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">{t("dialysis.preBpSystolic")}</Label>
              <Input type="number" className="h-9" value={preForm.pre_bp_systolic} onChange={e => setPreForm(f => ({ ...f, pre_bp_systolic: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">{t("dialysis.preBpDiastolic")}</Label>
              <Input type="number" className="h-9" value={preForm.pre_bp_diastolic} onChange={e => setPreForm(f => ({ ...f, pre_bp_diastolic: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">{t("dialysis.prePulse")}</Label>
              <Input type="number" className="h-9" value={preForm.pre_pulse} onChange={e => setPreForm(f => ({ ...f, pre_pulse: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">{t("dialysis.preTemperature")}</Label>
              <Input type="number" step="0.1" className="h-9" value={preForm.pre_temperature} onChange={e => setPreForm(f => ({ ...f, pre_temperature: e.target.value }))} />
            </div>
          </div>
        </div>
      )}

      {/* Scheduled — Doctor view */}
      {session.status === "scheduled" && isDoctorRole && !isAdminRole && !isNurseRole && (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">{t("dialysis.doctorScheduledNote")}</p>
        </div>
      )}

      {/* In-Progress: Post-Assessment / Completion */}
      {session.status === "in_progress" && (
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-sm font-semibold">{t("dialysis.postAssessment")}</h3>
          {canStartComplete && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs">{t("dialysis.postWeight")} *</Label>
                <Input type="number" step="0.1" className="h-9" value={postForm.post_weight_kg} onChange={e => setPostForm(f => ({ ...f, post_weight_kg: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">{t("dialysis.postBpSystolic")}</Label>
                <Input type="number" className="h-9" value={postForm.post_bp_systolic} onChange={e => setPostForm(f => ({ ...f, post_bp_systolic: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">{t("dialysis.postBpDiastolic")}</Label>
                <Input type="number" className="h-9" value={postForm.post_bp_diastolic} onChange={e => setPostForm(f => ({ ...f, post_bp_diastolic: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">{t("dialysis.postPulse")}</Label>
                <Input type="number" className="h-9" value={postForm.post_pulse} onChange={e => setPostForm(f => ({ ...f, post_pulse: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">{t("dialysis.actualUF")}</Label>
                <Input type="number" className="h-9" value={postForm.actual_uf_ml} onChange={e => setPostForm(f => ({ ...f, actual_uf_ml: e.target.value }))} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {canRecordVitals && (
              <>
                <div>
                  <Label className="text-xs">{t("dialysis.complications")}</Label>
                  <Textarea className="min-h-[60px]" value={postForm.complications} onChange={e => setPostForm(f => ({ ...f, complications: e.target.value }))} placeholder={session.complications || t("common.none")} />
                </div>
                <div>
                  <Label className="text-xs">{t("dialysis.nursingNotes")}</Label>
                  <Textarea className="min-h-[60px]" value={postForm.nursing_notes} onChange={e => setPostForm(f => ({ ...f, nursing_notes: e.target.value }))} />
                </div>
              </>
            )}
          </div>
          {canWriteDoctorNotes && (
            <div>
              <Label className="text-xs">{t("dialysis.doctorNotes")}</Label>
              <Textarea className="min-h-[60px]" value={postForm.doctor_notes} onChange={e => setPostForm(f => ({ ...f, doctor_notes: e.target.value }))} placeholder={t("dialysis.doctorNotesPlaceholder")} />
            </div>
          )}
          {isDoctorRole && !isAdminRole && (
            <Button variant="outline" onClick={() => {
              if (postForm.doctor_notes) {
                updateSession.mutate({ id: id!, doctor_notes: postForm.doctor_notes }, {
                  onSuccess: () => toast.success(t("dialysis.doctorNotesSaved")),
                });
              }
            }} disabled={updateSession.isPending} className="gap-1.5">
              <Stethoscope className="h-4 w-4" />{t("dialysis.signOff")}
            </Button>
          )}
        </div>
      )}

      {/* Cancel Reason Dialog */}
      {showCancelDialog && (
        <div className="rounded-lg border p-4 space-y-3">
          <Label>{t("dialysis.cancelReason")}</Label>
          <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder={t("dialysis.cancelReason")} />
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => handleCancelOrNoShow("cancelled")} disabled={!cancelReason.trim()}>{t("dialysis.confirmCancel")}</Button>
            <Button variant="outline" size="sm" onClick={() => setShowCancelDialog(false)}>{t("common.close")}</Button>
          </div>
        </div>
      )}

      {/* Treatment Outcome Summary */}
      {isTerminal && (
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-sm font-semibold">{t("dialysis.treatmentOutcome")}</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">{t("dialysis.preWeight")}</p>
              <p className="font-semibold">{session.pre_weight_kg ?? "–"} kg</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">{t("dialysis.postWeight")}</p>
              <p className="font-semibold">{session.post_weight_kg ?? "–"} kg</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10">
              <p className="text-muted-foreground text-xs">{t("dialysis.weightLoss")}</p>
              <p className="font-semibold text-primary">
                {session.pre_weight_kg && session.post_weight_kg ? `${(session.pre_weight_kg - session.post_weight_kg).toFixed(1)} kg` : "–"}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">{t("dialysis.preBP")}</p>
              <p className="font-semibold">{(session as any).pre_bp_systolic ?? "–"}/{(session as any).pre_bp_diastolic ?? "–"}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">{t("dialysis.postBP")}</p>
              <p className="font-semibold">{(session as any).post_bp_systolic ?? "–"}/{(session as any).post_bp_diastolic ?? "–"}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">{t("dialysis.treatmentDuration")}</p>
              <p className="font-semibold">{getDuration() || `${session.duration_minutes || "–"} min`}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-muted-foreground">{t("dialysis.targetUF")}:</span> <span className="font-medium">{session.target_uf_ml ?? "–"} ml</span></div>
            <div><span className="text-muted-foreground">{t("dialysis.actualUF")}:</span> <span className="font-medium">{session.actual_uf_ml ?? "–"} ml</span></div>
            <div><span className="text-muted-foreground">{t("dialysis.prePulse")}:</span> <span className="font-medium">{(session as any).pre_pulse ?? "–"} bpm</span></div>
            <div><span className="text-muted-foreground">{t("dialysis.postPulse")}:</span> <span className="font-medium">{(session as any).post_pulse ?? "–"} bpm</span></div>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs font-medium mb-1.5">{t("dialysis.prescription")}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
              <p>{t("dialysis.dialyzerType")}: {(session as any).dialyzer_type || "–"}</p>
              <p>BFR: {(session as any).blood_flow_rate || "–"} ml/min</p>
              <p>DFR: {(session as any).dialysate_flow_rate || "–"} ml/min</p>
              <p>{t("dialysis.heparinDose")}: {(session as any).heparin_dose || "–"}</p>
            </div>
          </div>

          {session.complications && (
            <div className="border-t pt-3">
              <p className="text-xs font-medium">{t("dialysis.complications")}:</p>
              <p className="text-sm text-destructive">{session.complications}</p>
            </div>
          )}
          {session.nursing_notes && (
            <div>
              <p className="text-xs font-medium">{t("dialysis.nursingNotes")}:</p>
              <p className="text-sm">{session.nursing_notes}</p>
            </div>
          )}
          {(session as any).doctor_notes && (
            <div>
              <p className="text-xs font-medium">{t("dialysis.doctorNotes")}:</p>
              <p className="text-sm">{(session as any).doctor_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Billing Status */}
      {session.status === "completed" && (
        <div className="rounded-lg border p-4 flex items-center gap-3 flex-wrap">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          {(session as any).invoice_id ? (
            <>
              <Badge variant="default" className="bg-success text-success-foreground">{t("dialysis.invoiceGenerated" as any)}</Badge>
              <Button variant="link" size="sm" onClick={() => navigate(`/app/billing/invoices/${(session as any).invoice_id}`)}>
                {t("dialysis.viewInvoice" as any)} →
              </Button>
            </>
          ) : (
            <>
              <Badge variant="outline">{t("dialysis.noInvoice" as any)}</Badge>
              <Button size="sm" onClick={handleGenerateInvoiceRetro} disabled={generateInvoice.isPending} className="gap-1.5">
                <Receipt className="h-3.5 w-3.5" />{generateInvoice.isPending ? t("common.loading") : t("dialysis.generateInvoice" as any)}
              </Button>
              <span className="text-xs text-muted-foreground">{t("dialysis.sessionFee" as any)}: {servicePrice?.default_price || 8000}</span>
            </>
          )}
        </div>
      )}

      {/* Vitals Chart */}
      {vitalsChartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" />{t("dialysis.vitalsTrend")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
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
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-semibold">{t("dialysis.recordVitals")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><Label className="text-xs">{t("dialysis.minuteMark")}</Label><Input type="number" className="h-9" value={vitalsForm.minute_mark} onChange={e => setVitalsForm(f => ({ ...f, minute_mark: Number(e.target.value) }))} /></div>
            <div><Label className="text-xs">{t("dialysis.bpSystolic")}</Label><Input type="number" className="h-9" value={vitalsForm.bp_systolic} onChange={e => setVitalsForm(f => ({ ...f, bp_systolic: e.target.value }))} /></div>
            <div><Label className="text-xs">{t("dialysis.bpDiastolic")}</Label><Input type="number" className="h-9" value={vitalsForm.bp_diastolic} onChange={e => setVitalsForm(f => ({ ...f, bp_diastolic: e.target.value }))} /></div>
            <div><Label className="text-xs">{t("dialysis.pulse")}</Label><Input type="number" className="h-9" value={vitalsForm.pulse} onChange={e => setVitalsForm(f => ({ ...f, pulse: e.target.value }))} /></div>
            <div><Label className="text-xs">{t("dialysis.bloodFlowRate")}</Label><Input type="number" className="h-9" value={vitalsForm.blood_flow_rate} onChange={e => setVitalsForm(f => ({ ...f, blood_flow_rate: e.target.value }))} /></div>
            <div><Label className="text-xs">{t("dialysis.ufRate")}</Label><Input type="number" className="h-9" value={vitalsForm.uf_rate} onChange={e => setVitalsForm(f => ({ ...f, uf_rate: e.target.value }))} /></div>
            <div className="col-span-2"><Label className="text-xs">{t("common.notes")}</Label><Input className="h-9" value={vitalsForm.notes} onChange={e => setVitalsForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <Button size="sm" onClick={handleAddVitals} disabled={addVitals.isPending} className="gap-1.5"><Plus className="h-3.5 w-3.5" />{addVitals.isPending ? t("common.loading") : t("dialysis.recordVitals")}</Button>
        </div>
      )}

      {/* Vitals Table */}
      {(vitals || []).length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <div className="p-3 border-b bg-muted/30">
            <h3 className="text-sm font-semibold">{t("dialysis.vitalsLog")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left p-2 text-xs font-medium">Min</th>
                  <th className="text-left p-2 text-xs font-medium">BP</th>
                  <th className="text-left p-2 text-xs font-medium">{t("dialysis.pulse")}</th>
                  <th className="text-left p-2 text-xs font-medium">BFR</th>
                  <th className="text-left p-2 text-xs font-medium">{t("dialysis.ufRate")}</th>
                  <th className="text-left p-2 text-xs font-medium">{t("common.notes")}</th>
                </tr>
              </thead>
              <tbody>
                {(vitals as any[]).map((v: any) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/10">
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
        </div>
      )}
    </div>
  );
}
