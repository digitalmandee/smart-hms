import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Save, Check, ArrowLeft, CalendarIcon } from "lucide-react";
import { useAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import { useConsultationByAppointment, useCreateConsultation, useUpdateConsultation, Vitals } from "@/hooks/useConsultations";
import { useCreatePrescription, PrescriptionItemInput } from "@/hooks/usePrescriptions";
import { useCreateLabOrder, LabOrderItemInput } from "@/hooks/useLabOrders";
import { useDoctors } from "@/hooks/useDoctors";
import { useAuth } from "@/contexts/AuthContext";
import { VitalsForm } from "@/components/consultation/VitalsForm";
import { SymptomsInput } from "@/components/consultation/SymptomsInput";
import { DiagnosisInput } from "@/components/consultation/DiagnosisInput";
import { PrescriptionBuilder } from "@/components/consultation/PrescriptionBuilder";
import { LabOrderBuilder } from "@/components/consultation/LabOrderBuilder";
import { PatientQuickInfo } from "@/components/consultation/PatientQuickInfo";
import { PreviousVisits } from "@/components/consultation/PreviousVisits";
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

  // Form state
  const [vitals, setVitals] = useState<Vitals>(existingConsultation?.vitals as Vitals || {});
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
        navigate("/app/opd");
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

  const handleComplete = async () => {
    setIsCompleting(true);
    await saveConsultation(true);
    setIsCompleting(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation"
        description={`${patient?.first_name} ${patient?.last_name || ""} - Token #${appointment.token_number || "N/A"}`}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chief Complaint */}
          <div className="space-y-2">
            <Label>Chief Complaint</Label>
            <Textarea
              placeholder="Patient's main complaint..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={2}
            />
          </div>

          <VitalsForm vitals={vitals} onChange={setVitals} />
          <SymptomsInput symptoms={symptoms} onChange={setSymptoms} />
          <DiagnosisInput
            diagnosis={diagnosis}
            onDiagnosisChange={setDiagnosis}
            clinicalNotes={clinicalNotes}
            onClinicalNotesChange={setClinicalNotes}
          />
          <PrescriptionBuilder
            items={prescriptionItems}
            onChange={setPrescriptionItems}
            notes={prescriptionNotes}
            onNotesChange={setPrescriptionNotes}
          />
          <LabOrderBuilder
            items={labOrderItems}
            onChange={setLabOrderItems}
            priority={labOrderPriority}
            onPriorityChange={setLabOrderPriority}
            notes={labOrderNotes}
            onNotesChange={setLabOrderNotes}
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
            <Button onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Complete Consultation
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {patient && <PatientQuickInfo patient={patient} />}
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
      </div>
    </div>
  );
}
