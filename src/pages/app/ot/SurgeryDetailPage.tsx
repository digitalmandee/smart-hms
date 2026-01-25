import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { OTStatusBadge } from "@/components/ot/OTStatusBadge";
import { PriorityBadge } from "@/components/ot/PriorityBadge";
import { SurgeryTeamList } from "@/components/ot/SurgeryTeamList";
import { SurgeryTimeline } from "@/components/ot/SurgeryTimeline";
import { TeamConfirmationStatus } from "@/components/ot/TeamConfirmationStatus";
import { SurgeryOutcomeForm } from "@/components/ot/SurgeryOutcomeForm";
import { WHOChecklistModal } from "@/components/ot/WHOChecklistModal";
import { ConsentFormModal } from "@/components/ot/ConsentFormModal";
import { OTMedicationPanel } from "@/components/ot/OTMedicationPanel";
import { ConsumablesPanel } from "@/components/ot/ConsumablesPanel";
import { PostOpOrdersForm } from "@/components/ot/PostOpOrdersForm";
import { PreOpReadinessCard } from "@/components/ot/PreOpReadinessCard";
import { UserConfirmationCard } from "@/components/ot/UserConfirmationCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  Play,
  CheckCircle2,
  XCircle,
  ClipboardList,
  HeartPulse,
  FileText,
  AlertTriangle,
  Printer,
  Pill,
  Package,
  ClipboardCheck,
  Trophy,
  Activity,
} from "lucide-react";
import { AddTeamMemberDialog } from "@/components/ot/AddTeamMemberDialog";
import { format, differenceInMinutes } from "date-fns";
import { 
  useSurgery, 
  useStartSurgery, 
  useCompleteSurgery, 
  useCancelSurgery,
  useAdmitToPACU
} from "@/hooks/useOT";
import { useSurgeryConsents } from "@/hooks/useConsentForms";
import { useSurgeryMedications } from "@/hooks/useOTMedications";
import { useAcceptSurgeryAssignment, useDeclineSurgeryAssignment } from "@/hooks/useSurgeryConfirmation";
import { useAuth } from "@/contexts/AuthContext";

export default function SurgeryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, hasRole } = useAuth();
  
  const { data: surgery, isLoading, isError } = useSurgery(id!);
  const { data: consents } = useSurgeryConsents(id);
  const startSurgery = useStartSurgery();
  const completeSurgery = useCompleteSurgery();
  const cancelSurgery = useCancelSurgery();
  const admitToPACU = useAdmitToPACU();
  const acceptAssignment = useAcceptSurgeryAssignment();
  const declineAssignment = useDeclineSurgeryAssignment();

  const [showChecklist, setShowChecklist] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [isBeginningPreOp, setIsBeginningPreOp] = useState(false);

  // Check if any valid consent exists (fallback if surgery.consent_signed not updated)
  const hasValidConsent = consents?.some(c => c.is_valid) ?? false;

  // Role-based visibility checks
  const canCompleteChecklist = hasRole('surgeon') || hasRole('ot_nurse') || hasRole('branch_admin') || hasRole('super_admin');
  const canViewBilling = hasRole('receptionist') || hasRole('branch_admin') || hasRole('super_admin') || hasRole('accountant');
  const isAnesthetist = hasRole('anesthetist');
  const isSurgeon = hasRole('surgeon');
  const isNurse = hasRole('ot_nurse') || hasRole('nurse');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !surgery) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-lg font-medium">Surgery Not Found</h2>
        <p className="text-muted-foreground mb-4">The surgery record could not be found.</p>
        <Button onClick={() => navigate("/app/ot/schedule")}>
          Back to Schedule
        </Button>
      </div>
    );
  }

  const patientName = surgery.patient 
    ? `${surgery.patient.first_name} ${surgery.patient.last_name}`
    : 'Unknown Patient';

  const surgeonName = surgery.lead_surgeon?.profile?.full_name || 'Not Assigned';

  const handleBeginPreOp = async () => {
    setIsBeginningPreOp(true);
    try {
      const { error } = await (await import("@/integrations/supabase/client")).supabase
        .from('surgeries')
        .update({ status: 'pre_op' as any })
        .eq('id', surgery.id);
      
      if (error) throw error;
      
      // Refresh the surgery data
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to begin pre-op:', error);
    } finally {
      setIsBeginningPreOp(false);
    }
  };

  const handleStart = async () => {
    await startSurgery.mutateAsync(surgery.id);
    // Navigate to Live Surgery Dashboard
    navigate(`/app/ot/surgeries/${surgery.id}/live`);
  };

  const handleComplete = async () => {
    await completeSurgery.mutateAsync(surgery.id);
  };

  const handleCancel = async () => {
    await cancelSurgery.mutateAsync({ surgeryId: surgery.id, reason: cancelReason });
    setShowCancelDialog(false);
  };

  const handleAdmitToPACU = async () => {
    await admitToPACU.mutateAsync({ surgeryId: surgery.id });
    navigate("/app/ot/pacu");
  };

  // Calculate duration if surgery is in progress or completed
  const getDuration = () => {
    if (!surgery.actual_start_time) return null;
    const end = surgery.actual_end_time ? new Date(surgery.actual_end_time) : new Date();
    const start = new Date(surgery.actual_start_time);
    const mins = differenceInMinutes(end, start);
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{surgery.surgery_number}</h1>
              <OTStatusBadge 
                status={surgery.status} 
                scheduledDate={surgery.scheduled_date}
                scheduledTime={surgery.scheduled_start_time}
              />
              <PriorityBadge priority={surgery.priority} />
            </div>
            <p className="text-muted-foreground">{surgery.procedure_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {/* Booked status - awaiting team confirmation */}
          {surgery.status === 'booked' && (
            <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          {/* Scheduled/Confirmed - can begin pre-op process */}
          {(surgery.status === 'scheduled' || surgery.status === 'confirmed') && (
            <>
              <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleBeginPreOp} disabled={isBeginningPreOp}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Begin Pre-Op
              </Button>
            </>
          )}
          {/* Pre-Op status - awaiting readiness completion */}
          {surgery.status === 'pre_op' && (
            <>
              <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button variant="secondary" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Awaiting Pre-Op Completion
              </Button>
            </>
          )}
          {/* Ready status - NOW can start surgery */}
          {surgery.status === 'ready' && (
            <>
              <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleStart} disabled={startSurgery.isPending}>
                <Play className="h-4 w-4 mr-2" />
                Start Surgery
              </Button>
            </>
          )}
          {surgery.status === 'in_progress' && (
            <Button onClick={() => navigate(`/app/ot/surgeries/${surgery.id}/live`)}>
              <Activity className="h-4 w-4 mr-2" />
              Open Live Dashboard
            </Button>
          )}
          {surgery.status === 'completed' && !(surgery as any).outcome && (
            <Button onClick={() => setShowOutcomeForm(true)}>
              <Trophy className="h-4 w-4 mr-2" />
              Record Outcome
            </Button>
          )}
          {surgery.status === 'completed' && !surgery.post_op_recovery && (
            <Button onClick={handleAdmitToPACU} disabled={admitToPACU.isPending}>
              <HeartPulse className="h-4 w-4 mr-2" />
              Admit to PACU
            </Button>
          )}
        </div>
      </div>

      {/* Surgery Timeline - with detailed confirmations */}
      <SurgeryTimeline
        status={surgery.status}
        outcome={(surgery as any).outcome}
        showDetailedConfirmation={true}
        timestamps={{
          created_at: surgery.created_at,
          booked_at: (surgery as any).booked_at,
          surgeon_confirmed_at: (surgery as any).surgeon_confirmed_at,
          anesthesia_confirmed_at: (surgery as any).anesthesia_confirmed_at,
          confirmed_at: (surgery as any).confirmed_at,
          ready_at: (surgery as any).ready_at,
          actual_start_time: surgery.actual_start_time,
          actual_end_time: surgery.actual_end_time,
          outcome_recorded_at: (surgery as any).outcome_recorded_at,
        }}
      />

      {/* Pre-Op Status Alert */}
      {surgery.status === 'pre_op' && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Pre-Op In Progress</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Complete all readiness items (medications, supplies, consent, assessment) before the surgery can start.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient & Procedure Info */}
          <Card>
            <CardHeader>
              <CardTitle>Surgery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{patientName}</p>
                    {surgery.patient?.patient_number && (
                      <p className="text-sm text-muted-foreground">{surgery.patient.patient_number}</p>
                    )}
                    {surgery.patient?.blood_group && (
                      <Badge variant="outline" className="mt-1">
                        Blood: {surgery.patient.blood_group}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Surgeon</p>
                    <p className="font-medium">{surgeonName}</p>
                    {surgery.lead_surgeon?.specialization && (
                      <p className="text-sm text-muted-foreground">{surgery.lead_surgeon.specialization}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="font-medium">
                      {format(new Date(surgery.scheduled_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
                      {surgery.estimated_duration_minutes && (
                        <> (~{surgery.estimated_duration_minutes} min)</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">OT Room</p>
                    {surgery.ot_room ? (
                      <>
                        <p className="font-medium">{surgery.ot_room.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {surgery.ot_room.room_number}
                          {surgery.ot_room.floor && ` • Floor ${surgery.ot_room.floor}`}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Not assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actual Timing */}
              {surgery.actual_start_time && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Timing</p>
                      <p className="font-medium">
                        Started: {format(new Date(surgery.actual_start_time), 'h:mm a')}
                        {surgery.actual_end_time && (
                          <> — Ended: {format(new Date(surgery.actual_end_time), 'h:mm a')}</>
                        )}
                        {getDuration() && (
                          <Badge variant="outline" className="ml-2">
                            Duration: {getDuration()}
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              {surgery.diagnosis && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
                  <p>{surgery.diagnosis}</p>
                </div>
              )}

              {/* Special Requirements */}
              {surgery.special_requirements && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-1">Special Requirements</p>
                  <p>{surgery.special_requirements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for different sections */}
          <Tabs defaultValue="checklist">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="w-full inline-flex">
                <TabsTrigger value="checklist">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Checklist
                </TabsTrigger>
                <TabsTrigger value="consent">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Consent
                </TabsTrigger>
                <TabsTrigger value="medications">
                  <Pill className="h-4 w-4 mr-2" />
                  Meds
                </TabsTrigger>
                <TabsTrigger value="anesthesia">
                  <HeartPulse className="h-4 w-4 mr-2" />
                  Anesthesia
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="consumables">
                  <Package className="h-4 w-4 mr-2" />
                  Supplies
                </TabsTrigger>
                <TabsTrigger value="postop">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Post-Op
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <TabsContent value="checklist" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>WHO Surgical Safety Checklist</CardTitle>
                      <CardDescription>Mandatory safety verification before, during, and after surgery</CardDescription>
                    </div>
                    {canCompleteChecklist ? (
                      <Button onClick={() => setShowChecklist(true)}>
                        {surgery.safety_checklist?.sign_out_completed ? 'View Checklist' : 'Complete Checklist'}
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => setShowChecklist(true)}>
                        View Checklist
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        {surgery.safety_checklist?.sign_in_completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">Sign In</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Before induction</p>
                      {surgery.safety_checklist?.sign_in_time && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(surgery.safety_checklist.sign_in_time), 'h:mm a')}
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        {surgery.safety_checklist?.time_out_completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">Time Out</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Before incision</p>
                      {surgery.safety_checklist?.time_out_time && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(surgery.safety_checklist.time_out_time), 'h:mm a')}
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        {surgery.safety_checklist?.sign_out_completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">Sign Out</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Before leaving OR</p>
                      {surgery.safety_checklist?.sign_out_time && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(surgery.safety_checklist.sign_out_time), 'h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Consent Tab */}
            <TabsContent value="consent" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Consent Forms</CardTitle>
                      <CardDescription>Digital consent capture with patient and witness signatures</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed rounded-lg">
                    <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Manage all consent forms for this surgery
                    </p>
                    <ConsentFormModal
                      surgeryId={surgery.id}
                      patientName={patientName}
                      procedureName={surgery.procedure_name}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <OTMedicationPanel surgeryId={surgery.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anesthesia" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Anesthesia Record</CardTitle>
                    <Button 
                      variant={surgery.anesthesia_record ? "outline" : "default"}
                      onClick={() => navigate(`/app/ot/surgeries/${surgery.id}/anesthesia`)}
                    >
                      {surgery.anesthesia_record ? 'Edit Record' : 'Add Record'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {surgery.anesthesia_record ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{surgery.anesthesia_record.anesthesia_type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Anesthetist</p>
                          <p className="font-medium">{surgery.anesthesia_record.anesthetist?.profile?.full_name || 'Unknown'}</p>
                        </div>
                      </div>
                      {surgery.anesthesia_record.anesthesia_plan && (
                        <div>
                          <p className="text-sm text-muted-foreground">Plan</p>
                          <p>{surgery.anesthesia_record.anesthesia_plan}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No anesthesia record yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Operative Notes</CardTitle>
                    <Button 
                      variant={surgery.intra_op_notes ? "outline" : "default"}
                      onClick={() => navigate(`/app/ot/surgeries/${surgery.id}/op-notes`)}
                    >
                      {surgery.intra_op_notes ? 'Edit Notes' : 'Add Notes'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {surgery.intra_op_notes ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Procedure Performed</p>
                        <p>{surgery.intra_op_notes.procedure_performed}</p>
                      </div>
                      {surgery.intra_op_notes.intra_op_findings && (
                        <div>
                          <p className="text-sm text-muted-foreground">Findings</p>
                          <p>{surgery.intra_op_notes.intra_op_findings}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No operative notes yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Consumables Tab */}
            <TabsContent value="consumables" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ConsumablesPanel surgeryId={surgery.id} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Post-Op Orders Tab */}
            <TabsContent value="postop" className="mt-4">
              <div className="space-y-6">
                {/* Outcome Form - show when completed but no outcome recorded */}
                {surgery.status === 'completed' && !(surgery as any).outcome && (
                  <SurgeryOutcomeForm
                    surgeryId={surgery.id}
                    surgeryNumber={surgery.surgery_number}
                    onSuccess={() => setShowOutcomeForm(false)}
                  />
                )}
                
                {/* Show existing outcome if recorded */}
                {(surgery as any).outcome && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Surgery Outcome
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={(surgery as any).outcome === 'successfull' ? 'default' : 'destructive'}
                          className="text-sm"
                        >
                          {(surgery as any).outcome === 'successfull' ? '✓ Successful' : 
                           (surgery as any).outcome === 'failed' ? '✗ Failed' : 'Unknown'}
                        </Badge>
                        {(surgery as any).outcome_notes && (
                          <p className="text-sm text-muted-foreground">{(surgery as any).outcome_notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardContent className="pt-6">
                    <PostOpOrdersForm surgeryId={surgery.id} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User's own confirmation status - inline accept/decline */}
          <UserConfirmationCard surgeryId={surgery.id} />
          
          {/* Team Confirmation Status */}
          <TeamConfirmationStatus surgeryId={surgery.id} />
          
          {/* Surgical Team */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Surgical Team</CardTitle>
              {['scheduled', 'booked', 'confirmed', 'pre_op'].includes(surgery.status) && (
                <AddTeamMemberDialog surgeryId={surgery.id} />
              )}
            </CardHeader>
            <CardContent>
              <SurgeryTeamList 
                members={surgery.team_members || []} 
                editable={surgery.status === 'scheduled' || surgery.status === 'booked'}
              />
            </CardContent>
          </Card>

          {/* Pre-Op Readiness - Interactive checklist for nurses */}
          <PreOpReadinessCard
            surgeryId={surgery.id}
            surgeryStatus={surgery.status}
            medicationsOrdered={(surgery as any).pre_op_medications_ordered ?? false}
            suppliesReady={(surgery as any).pre_op_supplies_ready ?? false}
            consentSigned={surgery.consent_signed || hasValidConsent}
            preOpAssessmentCompleted={surgery.pre_op_assessment?.is_cleared_for_surgery ?? false}
            readyAt={(surgery as any).ready_at}
          />

          {/* Pre-Op Assessment Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Pre-Op Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {surgery.pre_op_assessment ? (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ASA Class</span>
                    <Badge variant="outline">{surgery.pre_op_assessment.asa_class || 'Not set'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cleared</span>
                    {surgery.pre_op_assessment.is_cleared_for_surgery ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-2">
                  No pre-op assessment yet
                </p>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/app/ot/surgeries/${surgery.id}/pre-op`)}
              >
                {surgery.pre_op_assessment ? 'View/Edit Pre-Op' : 'Complete Pre-Op Assessment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WHO Checklist Modal - readOnly for non-surgeons/nurses */}
      <WHOChecklistModal
        open={showChecklist}
        onOpenChange={setShowChecklist}
        surgeryId={surgery.id}
        checklist={surgery.safety_checklist}
        readOnly={!canCompleteChecklist}
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Surgery"
        description="Are you sure you want to cancel this surgery? This action cannot be undone."
        onConfirm={handleCancel}
      />
    </div>
  );
}
