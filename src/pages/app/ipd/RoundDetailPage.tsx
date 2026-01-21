import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft,
  User,
  Bed,
  Building2,
  Activity,
  Pill,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmission } from "@/hooks/useAdmissions";
import { useIPDVitals, useDailyRounds } from "@/hooks/useDailyRounds";
import { useIPDMedications } from "@/hooks/useNursingCare";
import { useAuth } from "@/contexts/AuthContext";
import { RoundNotesForm } from "@/components/ipd/RoundNotesForm";
import { IPDMedicationOrderForm } from "@/components/ipd/IPDMedicationOrderForm";

// Hook to get doctor_id from profile
const useDoctorId = (profileId?: string) => {
  return useQuery({
    queryKey: ["doctor-by-profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const { data } = await supabase
        .from("doctors")
        .select("id")
        .eq("profile_id", profileId)
        .maybeSingle();
      return data?.id || null;
    },
    enabled: !!profileId,
  });
};

export default function RoundDetailPage() {
  const { admissionId } = useParams<{ admissionId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [medicationsOpen, setMedicationsOpen] = useState(false);
  const [addMedicationOpen, setAddMedicationOpen] = useState(false);

  const { data: admission, isLoading: loadingAdmission } = useAdmission(admissionId);
  const { data: vitals = [] } = useIPDVitals(admissionId);
  const { data: medications = [] } = useIPDMedications(admissionId);
  const { data: previousRounds = [] } = useDailyRounds(admissionId);
  const { data: doctorId } = useDoctorId(profile?.id);

  const latestVitals = vitals[0];

  const handleRoundSuccess = () => {
    navigate("/app/ipd/rounds");
  };

  if (loadingAdmission) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Admission not found</p>
        <Button variant="outline" onClick={() => navigate("/app/ipd/rounds")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rounds
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/ipd/rounds")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Round: ${admission.patient?.first_name} ${admission.patient?.last_name}`}
          description={`Admission #${admission.admission_number} • ${admission.patient?.patient_number}`}
        />
      </div>

      {/* Patient Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Patient Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  {admission.patient?.first_name} {admission.patient?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {admission.patient?.gender} • {admission.patient?.date_of_birth && 
                    `${new Date().getFullYear() - new Date(admission.patient.date_of_birth).getFullYear()} yrs`}
                </p>
              </div>
            </div>
            <div className="pt-2 space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {admission.ward?.name}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bed className="h-4 w-4" />
                Bed {admission.bed?.bed_number}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Admitted: {format(new Date(admission.admission_date), "dd MMM yyyy")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Vitals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Latest Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestVitals ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {latestVitals.blood_pressure_systolic && latestVitals.blood_pressure_diastolic && (
                  <div>
                    <span className="text-muted-foreground">BP:</span>{" "}
                    <span className="font-medium">
                      {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
                    </span>
                  </div>
                )}
                {latestVitals.pulse && (
                  <div>
                    <span className="text-muted-foreground">Pulse:</span>{" "}
                    <span className="font-medium">{latestVitals.pulse} bpm</span>
                  </div>
                )}
                {latestVitals.temperature && (
                  <div>
                    <span className="text-muted-foreground">Temp:</span>{" "}
                    <span className="font-medium">{latestVitals.temperature}°F</span>
                  </div>
                )}
                {latestVitals.oxygen_saturation && (
                  <div>
                    <span className="text-muted-foreground">SpO2:</span>{" "}
                    <span className="font-medium">{latestVitals.oxygen_saturation}%</span>
                  </div>
                )}
                {latestVitals.respiratory_rate && (
                  <div>
                    <span className="text-muted-foreground">RR:</span>{" "}
                    <span className="font-medium">{latestVitals.respiratory_rate}/min</span>
                  </div>
                )}
                <div className="col-span-2 text-xs text-muted-foreground pt-1">
                  Recorded: {format(new Date(latestVitals.recorded_at), "dd MMM, HH:mm")}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vitals recorded yet</p>
            )}
          </CardContent>
        </Card>

        {/* Clinical Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Clinical Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {admission.diagnosis_on_admission && (
              <div>
                <span className="text-muted-foreground">Diagnosis:</span>{" "}
                <span>{admission.diagnosis_on_admission}</span>
              </div>
            )}
            {admission.chief_complaint && (
              <div>
                <span className="text-muted-foreground">Chief Complaint:</span>{" "}
                <span>{admission.chief_complaint}</span>
              </div>
            )}
            {admission.attending_doctor?.profile && (
              <div>
                <span className="text-muted-foreground">Attending:</span>{" "}
                <span>Dr. {admission.attending_doctor.profile.full_name}</span>
              </div>
            )}
            {previousRounds.length > 0 && (
              <div className="pt-1">
                <Badge variant="outline" className="text-xs">
                  <ClipboardList className="h-3 w-3 mr-1" />
                  {previousRounds.length} Previous Round{previousRounds.length > 1 ? "s" : ""}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Medications Section */}
      <Collapsible open={medicationsOpen} onOpenChange={setMedicationsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Active Medications ({medications.length})
                </CardTitle>
                {medicationsOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {medications.length > 0 ? (
                <div className="space-y-2">
                  {medications.map((med: any) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {med.medicine?.name || med.medicine_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} • {med.route} • {med.frequency}
                        </p>
                      </div>
                      {med.is_prn && (
                        <Badge variant="secondary">PRN</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active medications</p>
              )}
              
              <Collapsible open={addMedicationOpen} onOpenChange={setAddMedicationOpen} className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Pill className="h-4 w-4 mr-2" />
                    {addMedicationOpen ? "Cancel" : "Add Medication Order"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <IPDMedicationOrderForm
                    admissionId={admissionId!}
                    onSuccess={() => setAddMedicationOpen(false)}
                  />
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Round Notes Form */}
      {doctorId ? (
        <RoundNotesForm
          admissionId={admissionId!}
          doctorId={doctorId}
          onSuccess={handleRoundSuccess}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              You need to be registered as a doctor to document rounds.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(`/app/ipd/admissions/${admissionId}`)}
              className="mt-4"
            >
              View Full Admission Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Previous Rounds Summary */}
      {previousRounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Previous Rounds (Last 3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {previousRounds.slice(0, 3).map((round: any) => (
                <div key={round.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {format(new Date(round.round_date), "dd MMM yyyy")} at {round.round_time}
                    </span>
                    {round.condition_status && (
                      <Badge variant="outline">{round.condition_status}</Badge>
                    )}
                  </div>
                  {round.findings && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {round.findings}
                    </p>
                  )}
                  {round.doctor?.profile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      By Dr. {round.doctor.profile.full_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
