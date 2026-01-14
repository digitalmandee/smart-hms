import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TriageBadge } from "@/components/emergency/TriageBadge";
import { BedPicker } from "@/components/ipd/BedPicker";
import { useEmergencyRegistration, useQuickAdmission, TRIAGE_LEVELS } from "@/hooks/useEmergency";
import { useWards } from "@/hooks/useIPD";
import { useDoctors } from "@/hooks/useDoctors";
import { ArrowRight, Loader2, AlertTriangle, User, Bed, Stethoscope } from "lucide-react";

const QuickAdmissionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: registration, isLoading: regLoading } = useEmergencyRegistration(id);
  const { data: wards } = useWards();
  const { data: doctors } = useDoctors();
  const admitMutation = useQuickAdmission();

  const [selectedWardId, setSelectedWardId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");

  if (regLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!registration) {
    return <div>Registration not found</div>;
  }

  if (!registration.patient_id) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quick Admission"
          description="Patient must be identified before admission"
          breadcrumbs={[
            { label: "Emergency", href: "/app/emergency" },
            { label: "Admission" },
          ]}
        />
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Patient Not Identified</h2>
            <p className="text-muted-foreground mb-4">
              The patient must be identified before admission. Please link this emergency
              registration to an existing patient or create a new patient record.
            </p>
            <Button onClick={() => navigate(`/app/emergency/${id}`)}>
              Return to ER Case
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const triageInfo = TRIAGE_LEVELS.find(t => t.level === registration.triage_level);
  const isCritical = registration.triage_level === "1" || registration.triage_level === "2";

  // Suggest ward based on triage level
  const suggestedWardType = isCritical ? "ICU" : "General";

  const handleSubmit = async () => {
    if (!selectedWardId || !selectedBedId || !selectedDoctorId) {
      return;
    }

    await admitMutation.mutateAsync({
      erRegistrationId: registration.id,
      wardId: selectedWardId,
      bedId: selectedBedId,
      attendingDoctorId: selectedDoctorId,
      chiefComplaint: registration.chief_complaint || undefined,
      clinicalNotes: clinicalNotes || undefined,
    });

    navigate("/app/ipd/admissions");
  };

  const patientName = registration.patient
    ? `${registration.patient.first_name} ${registration.patient.last_name}`
    : "Unknown Patient";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quick Admission to IPD"
        description={`Admit ${patientName} from Emergency Department`}
        breadcrumbs={[
          { label: "Emergency", href: "/app/emergency" },
          { label: registration.er_number, href: `/app/emergency/${id}` },
          { label: "Admission" },
        ]}
      />

      {isCritical && (
        <div className="bg-red-500 text-white p-4 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-6 w-6" />
          <span className="font-semibold">
            Critical Patient - Consider ICU or High Dependency Unit
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ward & Bed Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Select Ward & Bed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ward *</Label>
                <Select value={selectedWardId} onValueChange={(v) => {
                  setSelectedWardId(v);
                  setSelectedBedId("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards?.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.name}
                        {ward.ward_type?.toLowerCase().includes("icu") && (
                          <Badge variant="secondary" className="ml-2 text-xs">ICU</Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isCritical && (
                  <p className="text-xs text-orange-500 mt-1">
                    Recommended: {suggestedWardType} ward for Level {registration.triage_level} patients
                  </p>
                )}
              </div>

              {selectedWardId && (
                <div>
                  <Label>Bed *</Label>
                  <BedPicker
                    value={{ wardId: selectedWardId, bedId: selectedBedId }}
                    onChange={(val) => {
                      setSelectedWardId(val.wardId);
                      setSelectedBedId(val.bedId);
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Attending Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select attending doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      Dr. {doc.profile?.full_name}
                      {doc.specialization && (
                        <span className="text-muted-foreground ml-2">
                          ({doc.specialization})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Clinical Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Any additional clinical notes for the admission..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/app/emergency/${id}`)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedWardId || !selectedBedId || !selectedDoctorId || admitMutation.isPending}
              className="min-w-[150px]"
            >
              {admitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Admitting...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Admit Patient
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar - ER Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Name</span>
                <p className="font-medium">{patientName}</p>
              </div>
              {registration.patient?.patient_number && (
                <div>
                  <span className="text-sm text-muted-foreground">MRN</span>
                  <p className="font-medium">{registration.patient.patient_number}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">ER Number</span>
                <p className="font-mono font-medium">{registration.er_number}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={isCritical ? "border-red-500" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Triage Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-center">
                <TriageBadge level={registration.triage_level} size="lg" />
              </div>
              {triageInfo && (
                <p className="text-center text-sm text-muted-foreground">
                  {triageInfo.description}
                </p>
              )}
            </CardContent>
          </Card>

          {registration.chief_complaint && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Chief Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{registration.chief_complaint}</p>
              </CardContent>
            </Card>
          )}

          {registration.vitals && Object.keys(registration.vitals).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Last Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {registration.vitals.blood_pressure_systolic && (
                    <div>
                      <span className="text-muted-foreground">BP:</span>{" "}
                      {registration.vitals.blood_pressure_systolic}/{registration.vitals.blood_pressure_diastolic}
                    </div>
                  )}
                  {registration.vitals.pulse && (
                    <div>
                      <span className="text-muted-foreground">Pulse:</span>{" "}
                      {registration.vitals.pulse}
                    </div>
                  )}
                  {registration.vitals.spo2 && (
                    <div>
                      <span className="text-muted-foreground">SpO2:</span>{" "}
                      {registration.vitals.spo2}%
                    </div>
                  )}
                  {registration.vitals.gcs && (
                    <div>
                      <span className="text-muted-foreground">GCS:</span>{" "}
                      {registration.vitals.gcs}/15
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickAdmissionPage;
