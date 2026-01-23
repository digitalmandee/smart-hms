import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdmissions } from "@/hooks/useAdmissions";
import { useDailyRounds, useIPDVitals } from "@/hooks/useDailyRounds";
import { useNursingNotes, useIPDMedications } from "@/hooks/useNursingCare";
import { useERByAdmissionId, TRIAGE_LEVELS } from "@/hooks/useEmergency";
import { BedTransferModal } from "@/components/ipd/BedTransferModal";
import { BedTransferHistory } from "@/components/ipd/BedTransferHistory";
import { PatientQuickInfo } from "@/components/consultation/PatientQuickInfo";
import { IPDVitalsForm } from "@/components/ipd/IPDVitalsForm";
import { NursingNotesForm } from "@/components/ipd/NursingNotesForm";
import { IPDMedicationOrderForm } from "@/components/ipd/IPDMedicationOrderForm";
import { CarePlansList } from "@/components/ipd/CarePlansList";
import { DietChartCard } from "@/components/ipd/DietChartCard";
import { TriageBadge } from "@/components/emergency/TriageBadge";
import { AdmissionFinancialSummary } from "@/components/ipd/AdmissionFinancialSummary";
import { AdmissionOTChargesCard } from "@/components/ipd/AdmissionOTChargesCard";
import {
  User,
  Bed,
  Stethoscope,
  ClipboardList,
  Activity,
  Pill,
  FileText,
  LogOut,
  ArrowRightLeft,
  History,
  Plus,
  UtensilsCrossed,
  Siren,
  ExternalLink,
  Droplets,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canViewBilling = hasPermission("billing.view") || hasPermission("ipd.billing");
  const { data: admissions, refetch: refetchAdmissions } = useAdmissions();
  const { data: rounds } = useDailyRounds(id);
  const { data: vitals, refetch: refetchVitals } = useIPDVitals(id);
  const { data: nursingNotes, refetch: refetchNotes } = useNursingNotes(id);
  const { data: medications = [] } = useIPDMedications(id);
  const { data: erRegistration } = useERByAdmissionId(id);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [medsDialogOpen, setMedsDialogOpen] = useState(false);

  const admission = admissions?.find((a) => a.id === id);

  if (!admission) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Admission not found</p>
      </div>
    );
  }

  const patient = admission.patient;
  const ward = admission.ward;
  const bed = admission.bed;
  const attendingDoctor = admission.attending_doctor;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "admitted":
        return "default";
      case "discharged":
        return "secondary";
      case "transferred":
        return "outline";
      case "deceased":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleTransferSuccess = () => {
    setTransferModalOpen(false);
    refetchAdmissions();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Admission: ${admission.admission_number} - ${patient?.first_name} ${patient?.last_name}`}
        breadcrumbs={[
          { label: "IPD", href: "/app/ipd" },
          { label: "Admissions", href: "/app/ipd/admissions" },
          { label: admission.admission_number },
        ]}
        actions={
          <div className="flex gap-2 flex-wrap">
            {admission.status === "admitted" && (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/app/blood-bank/request/new?patientId=${patient?.id}`)}
              >
                <Droplets className="h-4 w-4 mr-2" />
                Request Blood
              </Button>
            )}
            {admission.status === "admitted" && bed && (
              <Button variant="outline" onClick={() => setTransferModalOpen(true)}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Transfer Bed
              </Button>
            )}
            {admission.status === "admitted" && (
              <Button onClick={() => navigate(`/app/ipd/discharge/${id}`)}>
                <LogOut className="h-4 w-4 mr-2" />
                Initiate Discharge
              </Button>
            )}
          </div>
        }
      />

      {/* ER Origin Banner - for emergency admissions */}
      {erRegistration && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-red-500/10">
                  <Siren className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive" className="font-semibold">
                      Emergency Admission
                    </Badge>
                    <span className="font-mono text-sm font-semibold">
                      {erRegistration.er_number}
                    </span>
                    {erRegistration.triage_level && (
                      <TriageBadge level={erRegistration.triage_level} size="sm" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Arrived: {format(new Date(erRegistration.arrival_time), "dd MMM yyyy HH:mm")}
                    </span>
                    {erRegistration.chief_complaint && (
                      <span className="truncate max-w-xs">
                        Complaint: {erRegistration.chief_complaint}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link to={`/app/emergency/${erRegistration.id}`}>
                <Button variant="outline" size="sm">
                  View ER Details
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">
                  {patient?.first_name} {patient?.last_name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Bed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {ward?.name} - Bed {bed?.bed_number || "Unassigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attending Doctor</p>
                <p className="font-medium">
                  {attendingDoctor?.profile?.full_name || "Not assigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Badge variant={getStatusColor(admission.status || "admitted")}>
                {admission.status?.toUpperCase()}
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">Days Admitted</p>
                <p className="font-medium">
                  {Math.ceil(
                    (new Date().getTime() - new Date(admission.admission_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {canViewBilling && (
            <TabsTrigger value="billing">
              <Receipt className="h-4 w-4 mr-1" />
              Billing
            </TabsTrigger>
          )}
          <TabsTrigger value="rounds">Daily Rounds</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="nursing">Nursing Notes</TabsTrigger>
          <TabsTrigger value="orders">
            <Pill className="h-4 w-4 mr-1" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="careplans">
            <ClipboardList className="h-4 w-4 mr-1" />
            Care Plans
          </TabsTrigger>
          <TabsTrigger value="diet">
            <UtensilsCrossed className="h-4 w-4 mr-1" />
            Diet
          </TabsTrigger>
          <TabsTrigger value="transfers">
            <History className="h-4 w-4 mr-1" />
            Transfers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Patient Quick Info - Prominently displayed */}
            {patient && (
              <div className="lg:col-span-1">
                <PatientQuickInfo
                  patient={{
                    id: patient.id,
                    first_name: patient.first_name,
                    last_name: patient.last_name,
                    patient_number: patient.patient_number,
                    phone: patient.phone,
                    email: null,
                    date_of_birth: patient.date_of_birth,
                    gender: patient.gender,
                    blood_group: null,
                  }}
                />
              </div>
            )}
            
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Admission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Number</p>
                      <p className="font-medium">{admission.admission_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Type</p>
                      <p className="font-medium capitalize">{admission.admission_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Date</p>
                      <p className="font-medium">
                        {format(new Date(admission.admission_date), "PPP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Time</p>
                      <p className="font-medium">{admission.admission_time}</p>
                    </div>
                    {admission.expected_discharge_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Discharge</p>
                        <p className="font-medium">
                          {format(new Date(admission.expected_discharge_date), "PPP")}
                        </p>
                      </div>
                    )}
                    {admission.deposit_amount && (
                      <div>
                        <p className="text-sm text-muted-foreground">Deposit</p>
                        <p className="font-medium">Rs. {admission.deposit_amount.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Clinical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {admission.chief_complaint && (
                    <div>
                      <p className="text-sm text-muted-foreground">Chief Complaint</p>
                      <p>{admission.chief_complaint}</p>
                    </div>
                  )}
                  {admission.diagnosis_on_admission && (
                    <div>
                      <p className="text-sm text-muted-foreground">Diagnosis on Admission</p>
                      <p>{admission.diagnosis_on_admission}</p>
                    </div>
                  )}
                  {admission.history_of_present_illness && (
                    <div>
                      <p className="text-sm text-muted-foreground">History of Present Illness</p>
                      <p>{admission.history_of_present_illness}</p>
                    </div>
                  )}
                  {admission.clinical_notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Clinical Notes</p>
                      <p>{admission.clinical_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {canViewBilling && (
          <TabsContent value="billing" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AdmissionFinancialSummary admissionId={id!} />
              </div>
              <div>
                <AdmissionOTChargesCard admissionId={id!} patientId={patient?.id || ""} />
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="rounds" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daily Rounds</CardTitle>
              <Button size="sm" onClick={() => navigate(`/app/ipd/rounds?admissionId=${id}`)}>
                Add Round Notes
              </Button>
            </CardHeader>
            <CardContent>
              {rounds && rounds.length > 0 ? (
                <div className="space-y-4">
                  {rounds.map((round) => (
                    <div key={round.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {format(new Date(round.round_date), "PPP")} at {round.round_time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Dr. {round.doctor?.profile?.full_name}
                          </p>
                        </div>
                        {round.condition_status && (
                          <Badge>{round.condition_status}</Badge>
                        )}
                      </div>
                      {round.findings && (
                        <p className="text-sm mt-2">{round.findings}</p>
                      )}
                      {round.instructions && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Instructions: {round.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No rounds documented yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vital Signs
              </CardTitle>
              <Button size="sm" onClick={() => setVitalsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Record Vitals
              </Button>
            </CardHeader>
            <CardContent>
              {vitals && vitals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date/Time</th>
                        <th className="text-left p-2">Temp</th>
                        <th className="text-left p-2">BP</th>
                        <th className="text-left p-2">Pulse</th>
                        <th className="text-left p-2">RR</th>
                        <th className="text-left p-2">SpO2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitals.map((v) => (
                        <tr key={v.id} className="border-b">
                          <td className="p-2">
                            {format(new Date(v.recorded_at), "MMM d, HH:mm")}
                          </td>
                          <td className="p-2">{v.temperature}°F</td>
                          <td className="p-2">
                            {v.blood_pressure_systolic}/{v.blood_pressure_diastolic}
                          </td>
                          <td className="p-2">{v.pulse}</td>
                          <td className="p-2">{v.respiratory_rate}</td>
                          <td className="p-2">{v.oxygen_saturation}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No vitals recorded yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nursing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Nursing Notes</CardTitle>
              <Button size="sm" onClick={() => setNotesDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              {nursingNotes && nursingNotes.length > 0 ? (
                <div className="space-y-4">
                  {nursingNotes.map((note) => (
                    <div key={note.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {format(new Date(note.created_at || new Date()), "PPP HH:mm")}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {note.note_type}
                          </Badge>
                        </div>
                      </div>
                      {note.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">{note.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No nursing notes yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medication Orders
              </CardTitle>
              <Button size="sm" onClick={() => setMedsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New Order
              </Button>
            </CardHeader>
            <CardContent>
              {medications.length > 0 ? (
                <div className="space-y-3">
                  {medications.map((med: any) => (
                    <div key={med.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {med.medicine?.name || med.medicine_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {med.dosage} - {med.route} - {med.frequency}
                          </p>
                          {med.special_instructions && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {med.special_instructions}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={med.is_active ? "default" : "secondary"}>
                            {med.is_active ? "Active" : "Stopped"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(med.start_date), "MMM d")}
                            {med.end_date && <> - {format(new Date(med.end_date), "MMM d")}</>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No medication orders yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="careplans" className="space-y-4">
          <CarePlansList admissionId={id!} />
        </TabsContent>

        <TabsContent value="diet" className="space-y-4">
          <DietChartCard admissionId={id!} />
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <BedTransferHistory admissionId={id!} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={vitalsDialogOpen} onOpenChange={setVitalsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Vital Signs</DialogTitle>
          </DialogHeader>
          <IPDVitalsForm
            admissionId={id!}
            onSuccess={() => {
              setVitalsDialogOpen(false);
              refetchVitals();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Nursing Note</DialogTitle>
          </DialogHeader>
          <NursingNotesForm
            admissionId={id!}
            onSuccess={() => {
              setNotesDialogOpen(false);
              refetchNotes();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={medsDialogOpen} onOpenChange={setMedsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Medication Order</DialogTitle>
          </DialogHeader>
          <IPDMedicationOrderForm
            admissionId={id!}
            onSuccess={() => setMedsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      {bed && (
        <BedTransferModal
          open={transferModalOpen}
          onOpenChange={setTransferModalOpen}
          admission={{
            id: admission.id,
            admission_number: admission.admission_number,
            patient: patient,
            ward: ward,
            bed: bed,
          }}
          onSuccess={handleTransferSuccess}
        />
      )}
    </div>
  );
}
