import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { BedTransferModal } from "@/components/ipd/BedTransferModal";
import { BedTransferHistory } from "@/components/ipd/BedTransferHistory";
import { PatientQuickInfo } from "@/components/consultation/PatientQuickInfo";
import { IPDVitalsForm } from "@/components/ipd/IPDVitalsForm";
import { NursingNotesForm } from "@/components/ipd/NursingNotesForm";
import { IPDMedicationOrderForm } from "@/components/ipd/IPDMedicationOrderForm";
import { CarePlansList } from "@/components/ipd/CarePlansList";
import { DietChartCard } from "@/components/ipd/DietChartCard";
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
} from "lucide-react";

export default function AdmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: admissions, refetch: refetchAdmissions } = useAdmissions();
  const { data: rounds } = useDailyRounds(id);
  const { data: vitals, refetch: refetchVitals } = useIPDVitals(id);
  const { data: nursingNotes, refetch: refetchNotes } = useNursingNotes(id);
  const { data: medications = [] } = useIPDMedications(id);
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
          <div className="flex gap-2">
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
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rounds">Daily Rounds</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="nursing">Nursing Notes</TabsTrigger>
          <TabsTrigger value="transfers">
            <History className="h-4 w-4 mr-1" />
            Transfers
          </TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
        </TabsContent>

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
              <Button size="sm">Record Vitals</Button>
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
              <Button size="sm">Add Note</Button>
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

        <TabsContent value="transfers" className="space-y-4">
          <BedTransferHistory admissionId={id!} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medication Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Medication orders will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
