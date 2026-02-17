import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Check, ArrowLeft, CalendarIcon, Scissors, Stethoscope, Pill, TestTube } from "lucide-react";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { useAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import { useConsultationByAppointment, useCreateConsultation, useUpdateConsultation, Vitals } from "@/hooks/useConsultations";
import { useCreatePrescription, PrescriptionItemInput } from "@/hooks/usePrescriptions";
import { useCreateLabOrder, LabOrderItemInput } from "@/hooks/useLabOrders";
import { useDoctors } from "@/hooks/useDoctors";
import { useAuth } from "@/contexts/AuthContext";
import { CompactVitals } from "@/components/consultation/CompactVitals";
import { SymptomsInput } from "@/components/consultation/SymptomsInput";
import { DiagnosisInput } from "@/components/consultation/DiagnosisInput";
import { PrescriptionBuilder } from "@/components/consultation/PrescriptionBuilder";
import { LabOrderBuilder } from "@/components/consultation/LabOrderBuilder";
import { PatientQuickInfo } from "@/components/consultation/PatientQuickInfo";
import { PreviousVisits } from "@/components/consultation/PreviousVisits";
import { VisitSummaryDialog } from "@/components/consultation/VisitSummaryDialog";
import { RecommendSurgeryDialog } from "@/components/ot/RecommendSurgeryDialog";
import { DoctorAIPanel } from "@/components/ai/DoctorAIPanel";
import { usePatientSurgeryRequests } from "@/hooks/useSurgeryRequests";
import { generateVisitId } from "@/lib/visit-id";
import { cn } from "@/lib/utils";

export default function ConsultationPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: appointment, isLoading: loadingAppointment } = useAppointment(appointmentId);
  const { data: existingConsultation } = useConsultationByAppointment(appointmentId);
  const { data: doctors = [] } = useDoctors();

  const createConsultation = useCreateConsultation();
  const updateConsultation = useUpdateConsultation();
  const updateAppointment = useUpdateAppointment();
  const createPrescription = useCreatePrescription();
  const createLabOrder = useCreateLabOrder();

  // Find current doctor
  const currentDoctor = doctors.find(d => d.profile?.id === profile?.id);

  // Pre-fill vitals from nurse check-in if available
  const nurseVitals = appointment?.check_in_vitals as Vitals | undefined;
  const initialVitals = existingConsultation?.vitals as Vitals || nurseVitals || {};
  
  // Form state
  const [vitals, setVitals] = useState<Vitals>(initialVitals);
  const [symptoms, setSymptoms] = useState<string[]>(
    existingConsultation?.symptoms?.split(", ") || []
  );
  const [chiefComplaint, setChiefComplaint] = useState(
    existingConsultation?.chief_complaint || appointment?.chief_complaint || ""
  );
  const [diagnosis, setDiagnosis] = useState(existingConsultation?.diagnosis || "");
  const [clinicalNotes, setClinicalNotes] = useState(existingConsultation?.clinical_notes || "");
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemInput[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [labOrderItems, setLabOrderItems] = useState<LabOrderItemInput[]>([]);
  const [labOrderPriority, setLabOrderPriority] = useState<"routine" | "urgent" | "stat">("routine");
  const [labOrderNotes, setLabOrderNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(
    existingConsultation?.follow_up_date ? new Date(existingConsultation.follow_up_date) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showVisitSummary, setShowVisitSummary] = useState(false);
  const [showRecommendSurgery, setShowRecommendSurgery] = useState(false);

  // Fetch patient's surgery requests (use appointment's patient id)
  const patientId = (appointment?.patient as any)?.id;
  const { data: patientSurgeryRequests } = usePatientSurgeryRequests(patientId);

  // Generate Visit ID for display
  const visitId = appointment ? generateVisitId({
    appointment_date: appointment.appointment_date,
    token_number: appointment.token_number,
  }) : "";

  // Auto-update status to 'in_progress' when doctor opens consultation
  useEffect(() => {
    if (appointment?.status === 'checked_in' && currentDoctor) {
      updateAppointment.mutate({
        id: appointmentId!,
        status: 'in_progress',
      });
    }
  }, [appointment?.status, appointmentId, currentDoctor]);

  if (loadingAppointment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Appointment not found</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const patient = appointment.patient as any;

  const saveConsultation = async (complete = false) => {
    if (!currentDoctor || !patient) return;

    const consultationData = {
      chief_complaint: chiefComplaint,
      symptoms: symptoms.join(", "),
      diagnosis,
      clinical_notes: clinicalNotes,
      vitals: vitals as any,
      follow_up_date: followUpDate ? format(followUpDate, "yyyy-MM-dd") : null,
    };

    try {
      let consultationId = existingConsultation?.id;

      if (existingConsultation) {
        await updateConsultation.mutateAsync({
          id: existingConsultation.id,
          ...consultationData,
        });
      } else {
        const newConsultation = await createConsultation.mutateAsync({
          appointment_id: appointmentId!,
          patient_id: patient.id,
          doctor_id: currentDoctor.id,
          branch_id: appointment.branch_id,
          ...consultationData,
        });
        consultationId = newConsultation.id;
      }

      // Create prescription if items exist
      if (complete && prescriptionItems.length > 0 && consultationId) {
        await createPrescription.mutateAsync({
          prescription: {
            consultation_id: consultationId,
            patient_id: patient.id,
            doctor_id: currentDoctor.id,
            branch_id: appointment.branch_id,
            notes: prescriptionNotes,
          },
          items: prescriptionItems,
        });
      }

      // Create lab order if items exist
      if (complete && labOrderItems.length > 0 && consultationId) {
        await createLabOrder.mutateAsync({
          labOrder: {
            consultation_id: consultationId,
            patient_id: patient.id,
            doctor_id: currentDoctor.id,
            branch_id: appointment.branch_id,
            priority: labOrderPriority,
            clinical_notes: labOrderNotes,
          },
          items: labOrderItems,
        });
      }

      // Update appointment status
      if (complete) {
        await updateAppointment.mutateAsync({
          id: appointmentId!,
          status: "completed",
        });
        
        // Navigate to checkout if there are pending orders, otherwise back to OPD
        const hasPendingOrders = prescriptionItems.length > 0 || labOrderItems.length > 0;
        if (hasPendingOrders) {
          navigate(`/app/opd/checkout?appointmentId=${appointmentId}`);
        } else {
          navigate("/app/opd");
        }
      }
    } catch (error) {
      console.error("Error saving consultation:", error);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    await saveConsultation(false);
    setIsSaving(false);
  };

  const handleComplete = () => {
    setShowVisitSummary(true);
  };

  const handleConfirmComplete = async () => {
    setIsCompleting(true);
    await saveConsultation(true);
    setIsCompleting(false);
    setShowVisitSummary(false);
  };

  const patientContext = {
    patient_name: `${patient?.first_name} ${patient?.last_name || ""}`,
    chief_complaint: chiefComplaint,
    symptoms,
    vitals,
    diagnosis,
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Consultation"
        description={`${patient?.first_name} ${patient?.last_name || ""} - Visit: ${visitId}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr_280px]">
        {/* Left Sidebar - Patient Info */}
        <div className="space-y-4">
          {patient && <PatientQuickInfo patient={patient} vitals={nurseVitals} />}

          {/* Active Surgery Requests */}
          {patientSurgeryRequests && patientSurgeryRequests.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-warning" />
                  Surgery Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patientSurgeryRequests.map(req => (
                  <div key={req.id} className="p-2 rounded border bg-muted/50 text-sm">
                    <p className="font-medium">{req.procedure_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={req.priority === 'emergency' ? 'destructive' : req.priority === 'urgent' ? 'outline' : 'secondary'} className="text-xs">
                        {req.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {req.request_status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {patient && (
            <PreviousVisits
              patientId={patient.id}
              onCopyDiagnosis={setDiagnosis}
              onCopyPrescription={(items) => setPrescriptionItems(items.map(i => ({
                medicine_name: i.medicine_name,
                dosage: i.dosage,
                frequency: i.frequency,
                duration: i.duration,
                quantity: i.quantity,
                instructions: i.instructions,
              })))}
            />
          )}
        </div>

        {/* Center - Main Tabbed Interface */}
        <div className="space-y-4">
          <Tabs defaultValue="clinical" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="clinical" className="text-xs gap-1">
                <Stethoscope className="h-3.5 w-3.5" />
                Clinical
              </TabsTrigger>
              <TabsTrigger value="prescription" className="text-xs gap-1">
                <Pill className="h-3.5 w-3.5" />
                Prescription
              </TabsTrigger>
              <TabsTrigger value="labs" className="text-xs gap-1">
                <TestTube className="h-3.5 w-3.5" />
                Labs
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs gap-1">
                <DoctorAvatar size="xs" className="scale-50 -m-2" />
                Tabeebi
              </TabsTrigger>
            </TabsList>

            {/* Clinical Tab */}
            <TabsContent value="clinical" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Chief Complaint</Label>
                <Textarea
                  placeholder="Patient's main complaint..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  rows={2}
                />
              </div>

              <SymptomsInput symptoms={symptoms} onChange={setSymptoms} />
              
              <DiagnosisInput
                diagnosis={diagnosis}
                onDiagnosisChange={setDiagnosis}
                clinicalNotes={clinicalNotes}
                onClinicalNotesChange={setClinicalNotes}
              />

              {/* Follow-up */}
              <div className="space-y-2">
                <Label>Follow-up Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !followUpDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {followUpDate ? format(followUpDate, "PPP") : "Select follow-up date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={followUpDate} onSelect={setFollowUpDate} disabled={(date) => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            {/* Prescription Tab */}
            <TabsContent value="prescription" className="space-y-4 mt-4">
              <PrescriptionBuilder
                items={prescriptionItems}
                onChange={setPrescriptionItems}
                notes={prescriptionNotes}
                onNotesChange={setPrescriptionNotes}
              />
            </TabsContent>

            {/* Labs Tab */}
            <TabsContent value="labs" className="space-y-4 mt-4">
              <LabOrderBuilder
                items={labOrderItems}
                onChange={setLabOrderItems}
                priority={labOrderPriority}
                onPriorityChange={setLabOrderPriority}
                notes={labOrderNotes}
                onNotesChange={setLabOrderNotes}
              />
            </TabsContent>

            {/* Tabeebi Tab */}
            <TabsContent value="ai" className="mt-4">
              <DoctorAIPanel
                standalone
                patientContext={patientContext}
                onSuggestDiagnosis={setDiagnosis}
                onSuggestNotes={setClinicalNotes}
                onAddMedicineToPrescription={(name) => {
                  setPrescriptionItems(prev => [...prev, {
                    medicine_name: name,
                    dosage: "",
                    frequency: "",
                    duration: "",
                    quantity: 1,
                    instructions: "",
                  }]);
                }}
              />
            </TabsContent>
          </Tabs>

          {/* Actions - Always visible */}
          <div className="flex gap-3 pt-2 flex-wrap border-t">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
            <Button variant="secondary" onClick={() => setShowRecommendSurgery(true)}>
              <Scissors className="h-4 w-4 mr-2" />
              Recommend Surgery
            </Button>
            <Button onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Complete Consultation
            </Button>
          </div>
        </div>

        {/* Right Sidebar - Vitals */}
        <div className="space-y-4">
          <CompactVitals
            vitals={vitals}
            nurseVitals={nurseVitals}
            onChange={setVitals}
          />
        </div>
      </div>

      {/* Visit Summary Dialog */}
      {patient && (
        <VisitSummaryDialog
          open={showVisitSummary}
          onOpenChange={setShowVisitSummary}
          appointment={{
            id: appointment.id,
            appointment_date: appointment.appointment_date,
            token_number: appointment.token_number,
            patient: {
              first_name: patient.first_name,
              last_name: patient.last_name,
              patient_number: patient.patient_number,
            },
          }}
          consultation={{
            chiefComplaint,
            symptoms,
            diagnosis,
            clinicalNotes,
            vitals,
            followUpDate,
          }}
          prescriptionItems={prescriptionItems}
          labOrderItems={labOrderItems}
          onConfirm={handleConfirmComplete}
          isCompleting={isCompleting}
        />
      )}

      {/* Recommend Surgery Dialog */}
      {patient && (
        <RecommendSurgeryDialog
          open={showRecommendSurgery}
          onOpenChange={setShowRecommendSurgery}
          patientId={patient.id}
          patientName={`${patient.first_name} ${patient.last_name || ''}`}
          consultationId={existingConsultation?.id}
        />
      )}
    </div>
  );
}
