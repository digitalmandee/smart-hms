import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation, getTranslatedString } from '@/lib/i18n';
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Scissors,
  Activity,
  Stethoscope,
  CheckCircle2,
  Loader2,
  User,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSurgery, useCompleteSurgery, useSaveIntraOpNotes, useAdmitToPACU } from "@/hooks/useOT";
import { usePostOpOrders } from "@/hooks/usePostOpOrders";
import { SurgeryTimer } from "@/components/ot/SurgeryTimer";
import { VitalsChart } from "@/components/ot/VitalsChart";
import { QuickActionPanel } from "@/components/ot/QuickActionPanel";
import { CompleteSurgeryModal } from "@/components/ot/CompleteSurgeryModal";
import { IntraOpNotesForm } from "@/components/ot/IntraOpNotesForm";
import { SurgeryOutcomeModal } from "@/components/ot/SurgeryOutcomeModal";
import { PostOpOrdersForm } from "@/components/ot/PostOpOrdersForm";

interface VitalEntry {
  time: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse?: number;
  spo2?: number;
  etco2?: number;
  notes?: string;
}

interface DrugEntry {
  time: string;
  drug_name: string;
  dose: string;
  route: string;
  notes?: string;
}

export default function LiveSurgeryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { profile, hasRole } = useAuth();
  
  const { data: surgery, isLoading, refetch } = useSurgery(id!);
  const completeSurgery = useCompleteSurgery();
  const saveIntraOpNotes = useSaveIntraOpNotes();
  const admitToPACU = useAdmitToPACU();
  const { data: postOpOrders } = usePostOpOrders(id);
  
  const [activeTab, setActiveTab] = useState("surgeon");
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [showPostOpOrders, setShowPostOpOrders] = useState(false);
  const [intraOpNotes, setIntraOpNotes] = useState<Record<string, unknown> | null>(null);
  const [vitals, setVitals] = useState<VitalEntry[]>([]);
  const [drugs, setDrugs] = useState<DrugEntry[]>([]);

  // Determine user's default tab based on role
  useEffect(() => {
    if (hasRole("surgeon") || hasRole("doctor")) {
      setActiveTab("surgeon");
    } else if (hasRole("anesthetist")) {
      setActiveTab("anesthesia");
    } else if (hasRole("ot_nurse") || hasRole("nurse")) {
      setActiveTab("nursing");
    }
  }, [hasRole]);

  // Load existing data
  useEffect(() => {
    if (surgery) {
      // Load intra-op notes (from joined data in hook)
      if (surgery.intra_op_notes) {
        setIntraOpNotes(surgery.intra_op_notes as unknown as Record<string, unknown>);
      }
      
      // Load vitals from anesthesia record
      if (surgery.anesthesia_record?.vitals_log) {
        setVitals(surgery.anesthesia_record.vitals_log as VitalEntry[]);
      }
    }
  }, [surgery]);

  // Real-time subscription for updates
  useEffect(() => {
    if (!id) return;
    
    const channel = supabase
      .channel(`live-surgery:${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "surgeries",
          filter: `id=eq.${id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetch]);

  // Quick action handlers
  const handleAddVital = async (vital: VitalEntry) => {
    const newVitals = [...vitals, vital];
    setVitals(newVitals);
    
    // Update anesthesia record if exists
    if (surgery?.anesthesia_record?.id) {
      const { error } = await supabase
        .from("anesthesia_records")
        .update({ vitals_log: newVitals as unknown as null })
        .eq("id", surgery.anesthesia_record.id);
      
      if (error) throw error;
      refetch();
    }
  };

  const handleAddDrug = async (drug: DrugEntry) => {
    const newDrugs = [...drugs, drug];
    setDrugs(newDrugs);
    
    // Update anesthesia record's other_medications
    if (surgery?.anesthesia_record?.id) {
      const existing = (surgery.anesthesia_record.other_medications as DrugEntry[]) || [];
      const updated = [...existing, drug];
      const { error } = await supabase
        .from("anesthesia_records")
        .update({ other_medications: updated as unknown as null })
        .eq("id", surgery.anesthesia_record.id);
      
      if (error) throw error;
      refetch();
    }
  };

  const handleAddSpecimen = async (specimen: { description: string; label: string; sendToPathology: boolean }) => {
    // Add specimen to local state - will be saved via IntraOpNotesForm
    const currentNotes = intraOpNotes || {};
    const existingSpecimens = (currentNotes.specimens as unknown[]) || [];
    const updatedNotes = {
      ...currentNotes,
      specimens: [...existingSpecimens, { ...specimen, id: crypto.randomUUID() }],
    };
    setIntraOpNotes(updatedNotes);
    toast.success("Specimen added - save notes to persist");
  };

  // FIXED: Actually persist notes to database using the hook
  const handleSaveNotes = async (data: Record<string, unknown>) => {
    try {
      await saveIntraOpNotes.mutateAsync({
        surgeryId: id!,
        ...data,
        documented_by: profile?.id || '',
      } as any);
      
      // Update local state
      const updatedNotes = { ...intraOpNotes, ...data };
      setIntraOpNotes(updatedNotes);
      
      // Refetch to get latest data
      await refetch();
    } catch (error) {
      // Error already handled by the hook
    }
  };

  // FIXED: Refresh data before opening complete modal to ensure validation uses latest data
  const handleOpenCompleteModal = async () => {
    await refetch();
    setCompleteModalOpen(true);
  };

  // FIXED: Persist override reason to database
  const handleCompleteSurgery = async (forceComplete?: boolean, overrideReason?: string) => {
    try {
      // If forcing complete, save the override reason to the database first
      if (forceComplete && overrideReason) {
        await saveIntraOpNotes.mutateAsync({
          surgeryId: id!,
          completion_override_reason: overrideReason,
        } as any);
      }
      
      await completeSurgery.mutateAsync(id!);
      setCompleteModalOpen(false);
      setShowOutcomeForm(true);
      toast.success(getTranslatedString('ot.surgeryCompleted'));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete surgery";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Helper function to admit patient to PACU
  const admitPatientToPACU = async () => {
    try {
      await admitToPACU.mutateAsync({
        surgeryId: id!,
        handoverNotes: `Surgery completed. Procedure: ${surgery?.procedure_name}. Outcome: ${surgery?.outcome || 'Pending review'}`,
      });
      toast.success("Patient admitted to PACU. Redirecting...");
      setTimeout(() => {
        navigate("/app/ot/pacu");
      }, 1500);
    } catch (error) {
      toast.error("Failed to admit to PACU. Please try again.");
    }
  };

  // FIXED: After outcome is recorded, check for post-op orders before PACU redirect
  const handleOutcomeRecorded = async () => {
    setShowOutcomeForm(false);
    
    // Check if post-op orders exist
    if (!postOpOrders) {
      setShowPostOpOrders(true);
      toast.info("Please create Post-Op Orders before transferring to PACU");
    } else {
      // Post-op orders exist, admit directly to PACU
      await admitPatientToPACU();
    }
  };

  // Handle post-op orders completion - now creates PACU admission
  const handlePostOpOrdersComplete = async () => {
    setShowPostOpOrders(false);
    await admitPatientToPACU();
  };

  // Computed values
  const surgeonName = surgery?.lead_surgeon?.profile?.full_name || "Unknown";
  const roomName = surgery?.ot_room?.name || surgery?.ot_room?.room_number || "Not assigned";
  const hasVitals = vitals.length > 0;
  const isCompleted = surgery?.status === "completed";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!surgery) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Surgery not found</p>
        </div>
      </div>
    );
  }

  // Redirect if surgery is not in progress
  if (surgery.status !== "in_progress" && surgery.status !== "completed") {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            This surgery is not currently in progress.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate(`/app/ot/surgeries/${id}`)}
          >
            View Surgery Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-semibold text-lg">
                  {surgery.surgery_number}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {surgery.patient?.full_name} • {surgery.procedure_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isCompleted ? "secondary" : "default"}
                className="text-sm"
              >
                {isCompleted ? "Completed" : "In Progress"}
              </Badge>
              {!isCompleted && (
                <Button onClick={handleOpenCompleteModal}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Surgery
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Surgery Timer */}
        {surgery.actual_start_time && (
          <SurgeryTimer
            startTime={surgery.actual_start_time}
            estimatedDurationMinutes={surgery.estimated_duration_minutes || 60}
            endTime={surgery.actual_end_time}
            procedureName={surgery.procedure_name}
            surgeonName={surgeonName}
            roomName={roomName}
          />
        )}

        {/* Quick Actions */}
        {!isCompleted && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActionPanel
                surgeryId={id!}
                onAddVital={handleAddVital}
                onAddDrug={handleAddDrug}
                onAddSpecimen={handleAddSpecimen}
              />
            </CardContent>
          </Card>
        )}

        {/* Role-Specific Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="surgeon" className="gap-2">
              <Scissors className="h-4 w-4" />
              <span className="hidden sm:inline">Surgeon Notes</span>
              <span className="sm:hidden">Surgeon</span>
            </TabsTrigger>
            <TabsTrigger value="anesthesia" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Anesthesia</span>
              <span className="sm:hidden">Anesth.</span>
            </TabsTrigger>
            <TabsTrigger value="nursing" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Nursing</span>
              <span className="sm:hidden">Nursing</span>
            </TabsTrigger>
            <TabsTrigger value="vitals" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Vitals Chart</span>
              <span className="sm:hidden">Vitals</span>
            </TabsTrigger>
          </TabsList>

          {/* Surgeon Notes Tab */}
          <TabsContent value="surgeon" className="mt-4">
            <IntraOpNotesForm
              surgeryId={id!}
              notes={surgery.intra_op_notes}
              procedureName={surgery.procedure_name}
              onSave={handleSaveNotes}
              isLoading={saveIntraOpNotes.isPending}
              documentedBy={profile?.full_name}
            />
          </TabsContent>

          {/* Anesthesia Tab */}
          <TabsContent value="anesthesia" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Anesthesia Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {surgery.anesthesia_record ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">
                          {surgery.anesthesia_record.anesthesia_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Airway</p>
                        <p className="font-medium">
                          {surgery.anesthesia_record.airway_device || "Not recorded"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Induction Time
                        </p>
                        <p className="font-medium">
                          {surgery.anesthesia_record.induction_time || "Not recorded"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Intubation Grade
                        </p>
                        <p className="font-medium">
                          {surgery.anesthesia_record.intubation_grade || "N/A"}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Drug Log</h4>
                      {drugs.length > 0 ? (
                        <div className="space-y-2">
                          {drugs.map((drug, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded"
                            >
                              <span className="font-medium">{drug.drug_name}</span>
                              <span className="text-sm">
                                {drug.dose} ({drug.route})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No drugs logged yet. Use Quick Actions to add.
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`/app/ot/surgeries/${id}/anesthesia`)
                      }
                    >
                      Open Full Anesthesia Record
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No anesthesia record found
                    </p>
                    <Button
                      onClick={() =>
                        navigate(`/app/ot/surgeries/${id}/anesthesia`)
                      }
                    >
                      Create Anesthesia Record
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nursing Tab */}
          <TabsContent value="nursing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Nursing Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Instrument Counts */}
                <div>
                  <h4 className="font-medium mb-3">Safety Counts</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Sponge Count</p>
                      <Badge
                        variant={
                          intraOpNotes?.sponge_count_correct
                            ? "default"
                            : "outline"
                        }
                        className="mt-2"
                      >
                        {intraOpNotes?.sponge_count_correct
                          ? "Verified ✓"
                          : "Pending"}
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        Instrument Count
                      </p>
                      <Badge
                        variant={
                          intraOpNotes?.instrument_count_correct
                            ? "default"
                            : "outline"
                        }
                        className="mt-2"
                      >
                        {intraOpNotes?.instrument_count_correct
                          ? "Verified ✓"
                          : "Pending"}
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Needle Count</p>
                      <Badge
                        variant={
                          intraOpNotes?.needle_count_correct
                            ? "default"
                            : "outline"
                        }
                        className="mt-2"
                      >
                        {intraOpNotes?.needle_count_correct
                          ? "Verified ✓"
                          : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Specimens */}
                <div>
                  <h4 className="font-medium mb-3">Specimens Collected</h4>
                  {(intraOpNotes?.specimens as unknown[])?.length > 0 ? (
                    <div className="space-y-2">
                      {(intraOpNotes?.specimens as Array<{ description: string; label?: string; sendToPathology?: boolean }>)?.map(
                        (specimen, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded"
                          >
                            <span>{specimen.description}</span>
                            <Badge variant="outline">
                              {specimen.sendToPathology ? "→ Pathology" : "Stored"}
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No specimens collected yet
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate(`/app/ot/instruments`)}
                >
                  Open Instrument Count Page
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vitals Chart Tab */}
          <TabsContent value="vitals" className="mt-4">
            <VitalsChart vitals={vitals} />
          </TabsContent>
        </Tabs>

        {/* Post-Op Orders Form (shown after outcome is recorded if no orders exist) */}
        {showPostOpOrders && (
          <Card className="max-w-4xl mx-auto mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Post-Op Orders Required
              </CardTitle>
              <CardDescription>
                Complete post-operative orders before transferring patient to PACU
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostOpOrdersForm 
                surgeryId={id!} 
                onSuccess={handlePostOpOrdersComplete} 
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Complete Surgery Modal */}
      <CompleteSurgeryModal
        open={completeModalOpen}
        onOpenChange={setCompleteModalOpen}
        onComplete={handleCompleteSurgery}
        intraOpNotes={surgery.intra_op_notes}
        hasVitals={hasVitals}
        hasAnesthesiaRecord={!!surgery.anesthesia_record}
        isLoading={completeSurgery.isPending}
        isBillable={surgery.is_billable}
        surgeryCharges={(surgery as any).surgery_charges as Record<string, number> | null}
      />

      {/* Outcome Recording Modal (shown immediately after completion) */}
      <SurgeryOutcomeModal
        open={showOutcomeForm}
        onOpenChange={setShowOutcomeForm}
        surgeryId={id!}
        surgeryNumber={surgery.surgery_number}
        currentOutcome={surgery.outcome}
        currentNotes={surgery.outcome_notes}
        onSuccess={handleOutcomeRecorded}
      />
    </div>
  );
}
