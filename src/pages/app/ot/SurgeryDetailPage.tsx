import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OTStatusBadge } from "@/components/ot/OTStatusBadge";
import { PriorityBadge } from "@/components/ot/PriorityBadge";
import { SurgeryTeamList } from "@/components/ot/SurgeryTeamList";
import { WHOChecklistModal } from "@/components/ot/WHOChecklistModal";
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
  Printer
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { 
  useSurgery, 
  useStartSurgery, 
  useCompleteSurgery, 
  useCancelSurgery,
  useAdmitToPACU
} from "@/hooks/useOT";

export default function SurgeryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: surgery, isLoading, isError } = useSurgery(id!);
  const startSurgery = useStartSurgery();
  const completeSurgery = useCompleteSurgery();
  const cancelSurgery = useCancelSurgery();
  const admitToPACU = useAdmitToPACU();

  const [showChecklist, setShowChecklist] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

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

  const handleStart = async () => {
    await startSurgery.mutateAsync(surgery.id);
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
              <OTStatusBadge status={surgery.status} />
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
          {surgery.status === 'scheduled' && (
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
            <Button onClick={handleComplete} disabled={completeSurgery.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Surgery
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
                    {surgery.patient?.mr_number && (
                      <p className="text-sm text-muted-foreground">{surgery.patient.mr_number}</p>
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
            <TabsList className="w-full">
              <TabsTrigger value="checklist" className="flex-1">
                <ClipboardList className="h-4 w-4 mr-2" />
                Safety Checklist
              </TabsTrigger>
              <TabsTrigger value="anesthesia" className="flex-1">
                <HeartPulse className="h-4 w-4 mr-2" />
                Anesthesia
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Op Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checklist" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>WHO Surgical Safety Checklist</CardTitle>
                      <CardDescription>Mandatory safety verification before, during, and after surgery</CardDescription>
                    </div>
                    <Button onClick={() => setShowChecklist(true)}>
                      {surgery.safety_checklist?.sign_out_completed ? 'View Checklist' : 'Complete Checklist'}
                    </Button>
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

            <TabsContent value="anesthesia" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Anesthesia Record</CardTitle>
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
                  <CardTitle>Operative Notes</CardTitle>
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
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Surgical Team */}
          <Card>
            <CardHeader>
              <CardTitle>Surgical Team</CardTitle>
            </CardHeader>
            <CardContent>
              <SurgeryTeamList 
                members={surgery.team_members || []} 
                editable={surgery.status === 'scheduled'}
              />
            </CardContent>
          </Card>

          {/* Pre-op Status */}
          <Card>
            <CardHeader>
              <CardTitle>Pre-Op Status</CardTitle>
            </CardHeader>
            <CardContent>
              {surgery.pre_op_assessment ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ASA Class</span>
                    <Badge variant="outline">{surgery.pre_op_assessment.asa_class || 'Not set'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cleared for Surgery</span>
                    {surgery.pre_op_assessment.is_cleared_for_surgery ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Consent Signed</span>
                    {surgery.consent_signed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No pre-op assessment yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WHO Checklist Modal */}
      <WHOChecklistModal
        open={showChecklist}
        onOpenChange={setShowChecklist}
        surgeryId={surgery.id}
        checklist={surgery.safety_checklist}
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
    </div>
  );
}
