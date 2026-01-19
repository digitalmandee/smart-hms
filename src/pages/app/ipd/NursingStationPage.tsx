import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Building2, 
  Users, 
  Pill, 
  ClipboardList, 
  Heart,
  User,
  Bed,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWards } from "@/hooks/useIPD";
import { useAdmissions } from "@/hooks/useAdmissions";
import { useIPDVitals } from "@/hooks/useDailyRounds";
import { useNursingNotes, useIPDMedications } from "@/hooks/useNursingCare";
import { IPDVitalsForm } from "@/components/ipd/IPDVitalsForm";
import { NursingNotesForm } from "@/components/ipd/NursingNotesForm";

export default function NursingStationPage() {
  const navigate = useNavigate();
  const { profile, isLoading: authLoading } = useAuth();
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("patients");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  const { data: wards, isLoading: loadingWards } = useWards();
  const { data: admissions, isLoading: loadingAdmissions } = useAdmissions("admitted");

  // Auto-select first ward when wards load
  useEffect(() => {
    if (wards && wards.length > 0 && !selectedWardId) {
      setSelectedWardId(wards[0].id);
    }
  }, [wards, selectedWardId]);

  const selectedWard = wards?.find((w: any) => w.id === selectedWardId);

  // Filter admissions by ward
  const wardPatients = selectedWardId
    ? (admissions || []).filter((adm: any) => adm.ward?.id === selectedWardId)
    : [];

  // Get all admission IDs for bulk fetching
  const admissionIds = wardPatients.map((adm: any) => adm.id);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error if no organization
  if (!profile?.organization_id) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Nursing Station"
          description="Manage patient care, medications, and nursing documentation"
        />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">Your profile is not associated with an organization.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no wards exist
  if (!loadingWards && (!wards || wards.length === 0)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Nursing Station"
          description="Manage patient care, medications, and nursing documentation"
        />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No wards have been created for your organization yet.</p>
            <p className="text-sm mt-2 mb-4">
              Please create wards in IPD → Wards
            </p>
            <Button onClick={() => navigate("/app/ipd/wards")}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Ward
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nursing Station"
        description="Manage patient care, medications, and nursing documentation"
      />

      {/* Ward Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Select Ward:</span>
        </div>
        <Select value={selectedWardId} onValueChange={setSelectedWardId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Choose a ward" />
          </SelectTrigger>
          <SelectContent>
            {loadingWards ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
              (wards || []).map((ward: any) => (
                <SelectItem key={ward.id} value={ward.id}>
                  {ward.name} ({ward.code})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {selectedWardId && (
          <Badge variant="outline" className="ml-auto">
            <Users className="h-3 w-3 mr-1" />
            {wardPatients.length} Patients
          </Badge>
        )}
      </div>

      {/* Content */}
      {selectedWardId ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="vitals" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Vitals
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="mt-4">
            {loadingAdmissions ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : wardPatients.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {wardPatients.map((adm: any) => (
                  <Card key={adm.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {adm.patient?.first_name} {adm.patient?.last_name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              Bed {adm.bed?.bed_number}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{adm.admission_number}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Admitted: {format(new Date(adm.admission_date), "dd MMM yyyy")}
                      </div>
                      {adm.chief_complaint && (
                        <div className="text-sm line-clamp-2">
                          <span className="text-muted-foreground">CC: </span>
                          {adm.chief_complaint}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/app/ipd/admissions/${adm.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPatientId(adm.id);
                            setVitalsDialogOpen(true);
                          }}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Vitals
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No patients in this ward
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medication Administration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wardPatients.length > 0 ? (
                  <div className="space-y-4">
                    {wardPatients.map((adm: any) => (
                      <MedicationRow key={adm.id} admission={adm} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No patients in this ward
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Vitals Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wardPatients.length > 0 ? (
                  <div className="space-y-4">
                    {wardPatients.map((adm: any) => (
                      <VitalsRow 
                        key={adm.id} 
                        admission={adm} 
                        onRecordVitals={() => {
                          setSelectedPatientId(adm.id);
                          setVitalsDialogOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No patients in this ward
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Nursing Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wardPatients.length > 0 ? (
                  <div className="space-y-4">
                    {wardPatients.map((adm: any) => (
                      <NotesRow 
                        key={adm.id} 
                        admission={adm}
                        onAddNote={() => {
                          setSelectedPatientId(adm.id);
                          setNotesDialogOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No patients in this ward
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a ward to view nursing station</p>
          </CardContent>
        </Card>
      )}

      {/* Vitals Dialog */}
      <Dialog open={vitalsDialogOpen} onOpenChange={setVitalsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Vital Signs</DialogTitle>
          </DialogHeader>
          {selectedPatientId && (
            <IPDVitalsForm
              admissionId={selectedPatientId}
              onSuccess={() => {
                setVitalsDialogOpen(false);
                setSelectedPatientId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Nursing Note</DialogTitle>
          </DialogHeader>
          {selectedPatientId && (
            <NursingNotesForm
              admissionId={selectedPatientId}
              onSuccess={() => {
                setNotesDialogOpen(false);
                setSelectedPatientId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-components for each tab row
function MedicationRow({ admission }: { admission: any }) {
  const { data: medications = [] } = useIPDMedications(admission.id);
  const activeMeds = medications.filter((m: any) => m.is_active);

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              {admission.patient?.first_name} {admission.patient?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Bed {admission.bed?.bed_number}
            </p>
          </div>
        </div>
        <Badge variant="outline">{activeMeds.length} Active Meds</Badge>
      </div>
      {activeMeds.length > 0 ? (
        <div className="grid gap-2 md:grid-cols-2">
          {activeMeds.slice(0, 4).map((med: any) => (
            <div key={med.id} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
              <Pill className="h-4 w-4 text-muted-foreground" />
              <span>{med.medicine?.name || med.medicine_name}</span>
              <span className="text-muted-foreground">({med.frequency})</span>
            </div>
          ))}
          {activeMeds.length > 4 && (
            <p className="text-sm text-muted-foreground">
              +{activeMeds.length - 4} more medications
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No active medications</p>
      )}
    </div>
  );
}

function VitalsRow({ admission, onRecordVitals }: { admission: any; onRecordVitals: () => void }) {
  const { data: vitals = [] } = useIPDVitals(admission.id);
  const latestVitals = vitals[0];

  const getVitalStatus = (vital: any) => {
    if (!vital) return null;
    // Simple status check - can be expanded
    const issues = [];
    if (vital.blood_pressure_systolic > 140 || vital.blood_pressure_diastolic > 90) {
      issues.push("High BP");
    }
    if (vital.temperature > 100.4) {
      issues.push("Fever");
    }
    if (vital.oxygen_saturation < 95) {
      issues.push("Low SpO2");
    }
    return issues;
  };

  const issues = latestVitals ? getVitalStatus(latestVitals) : null;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              {admission.patient?.first_name} {admission.patient?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Bed {admission.bed?.bed_number}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onRecordVitals}>
          <Plus className="h-4 w-4 mr-1" />
          Record
        </Button>
      </div>
      {latestVitals ? (
        <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
          <div className="p-2 bg-muted rounded text-center">
            <p className="text-xs text-muted-foreground">Temp</p>
            <p className={latestVitals.temperature > 100.4 ? "text-destructive font-medium" : ""}>
              {latestVitals.temperature}°F
            </p>
          </div>
          <div className="p-2 bg-muted rounded text-center">
            <p className="text-xs text-muted-foreground">BP</p>
            <p className={latestVitals.blood_pressure_systolic > 140 ? "text-destructive font-medium" : ""}>
              {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
            </p>
          </div>
          <div className="p-2 bg-muted rounded text-center">
            <p className="text-xs text-muted-foreground">Pulse</p>
            <p>{latestVitals.pulse}</p>
          </div>
          <div className="p-2 bg-muted rounded text-center">
            <p className="text-xs text-muted-foreground">RR</p>
            <p>{latestVitals.respiratory_rate}</p>
          </div>
          <div className="p-2 bg-muted rounded text-center">
            <p className="text-xs text-muted-foreground">SpO2</p>
            <p className={latestVitals.oxygen_saturation < 95 ? "text-destructive font-medium" : ""}>
              {latestVitals.oxygen_saturation}%
            </p>
          </div>
          <div className="p-2 bg-muted rounded text-center">
            <p className="text-xs text-muted-foreground">Time</p>
            <p>{format(new Date(latestVitals.recorded_at), "HH:mm")}</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="h-4 w-4" />
          No vitals recorded
        </p>
      )}
      {issues && issues.length > 0 && (
        <div className="mt-2 flex gap-1">
          {issues.map((issue, i) => (
            <Badge key={i} variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              {issue}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesRow({ admission, onAddNote }: { admission: any; onAddNote: () => void }) {
  const { data: notes = [] } = useNursingNotes(admission.id);
  const todayNotes = notes.filter((n: any) => {
    const noteDate = new Date(n.created_at).toDateString();
    return noteDate === new Date().toDateString();
  });

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              {admission.patient?.first_name} {admission.patient?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Bed {admission.bed?.bed_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {todayNotes.length} notes today
          </Badge>
          <Button size="sm" variant="outline" onClick={onAddNote}>
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        </div>
      </div>
      {todayNotes.length > 0 ? (
        <div className="mt-3 space-y-2">
          {todayNotes.slice(0, 2).map((note: any) => (
            <div key={note.id} className="text-sm p-2 bg-muted rounded">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">{note.note_type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.created_at), "HH:mm")}
                </span>
              </div>
              <p className="line-clamp-2">{note.notes}</p>
            </div>
          ))}
          {todayNotes.length > 2 && (
            <p className="text-sm text-muted-foreground">
              +{todayNotes.length - 2} more notes
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1">
          <ClipboardList className="h-4 w-4" />
          No notes recorded today
        </p>
      )}
    </div>
  );
}
