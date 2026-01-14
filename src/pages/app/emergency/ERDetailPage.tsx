import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TriageBadge } from "@/components/emergency/TriageBadge";
import { TriageAssessmentForm } from "@/components/emergency/TriageAssessmentForm";
import { TreatmentTimeline } from "@/components/emergency/TreatmentTimeline";
import { TraumaAssessmentForm } from "@/components/emergency/TraumaAssessmentForm";
import { GCSCalculator } from "@/components/emergency/GCSCalculator";
import { PrintableERSlip } from "@/components/emergency/PrintableERSlip";
import { useEmergencyRegistration, useUpdateEmergencyRegistration, useTraumaAssessments, TRIAGE_LEVELS } from "@/hooks/useEmergency";
import { usePrint } from "@/hooks/usePrint";
import { format, differenceInMinutes } from "date-fns";
import {
  Siren,
  User,
  Clock,
  MapPin,
  Stethoscope,
  AlertTriangle,
  Shield,
  Printer,
  ArrowRight,
  Activity,
  FileText,
  Gauge,
  Brain,
  Loader2,
  CheckCircle,
  LogOut,
} from "lucide-react";

const ERDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: registration, isLoading } = useEmergencyRegistration(id);
  const { data: traumaAssessments } = useTraumaAssessments(id);
  const updateMutation = useUpdateEmergencyRegistration();
  const { printRef, handlePrint } = usePrint();

  const [showTriageDialog, setShowTriageDialog] = useState(false);
  const [showTraumaDialog, setShowTraumaDialog] = useState(false);
  const [showDischargeDialog, setShowDischargeDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!registration) {
    return <div>Registration not found</div>;
  }

  const triageInfo = TRIAGE_LEVELS.find(t => t.level === registration.triage_level);
  const waitMinutes = differenceInMinutes(new Date(), new Date(registration.arrival_time));
  const isCritical = registration.triage_level === "1" || registration.triage_level === "2";

  const patientName = registration.patient
    ? `${registration.patient.first_name} ${registration.patient.last_name}`
    : registration.unknown_patient_details
    ? `Unknown - ${registration.unknown_patient_details.estimated_age || "?"} ${registration.unknown_patient_details.gender || ""}`
    : "Unknown Patient";

  const handleDischarge = async () => {
    await updateMutation.mutateAsync({
      id: registration.id,
      status: "discharged",
      disposition_time: new Date().toISOString(),
    });
    setShowDischargeDialog(false);
    navigate("/app/emergency");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={registration.er_number}
        subtitle={patientName}
        icon={Siren}
        backUrl="/app/emergency"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Slip
            </Button>
            {registration.status === "in_treatment" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDischargeDialog(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Discharge
                </Button>
                <Button onClick={() => navigate(`/app/emergency/${id}/admit`)}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Admit to IPD
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Status Banner */}
      {isCritical && registration.status === "in_treatment" && (
        <div className="bg-red-500 text-white p-4 rounded-lg flex items-center gap-3 animate-pulse">
          <AlertTriangle className="h-6 w-6" />
          <span className="font-semibold">Critical Patient - Priority Treatment Required</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
                <Badge
                  variant={
                    registration.status === "in_treatment"
                      ? "default"
                      : registration.status === "admitted"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {registration.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                {registration.patient?.gender && (
                  <div>
                    <span className="text-sm text-muted-foreground">Gender</span>
                    <p className="font-medium capitalize">{registration.patient.gender}</p>
                  </div>
                )}
                {registration.patient?.phone && (
                  <div>
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <p className="font-medium">{registration.patient.phone}</p>
                  </div>
                )}
              </div>

              {/* Flags */}
              <div className="flex gap-2 mt-4">
                {registration.is_trauma && (
                  <Badge variant="outline" className="border-orange-500 text-orange-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Trauma
                  </Badge>
                )}
                {registration.is_mlc && (
                  <Badge variant="destructive">
                    <Shield className="h-3 w-3 mr-1" />
                    MLC
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              {registration.is_trauma && (
                <TabsTrigger value="trauma">Trauma</TabsTrigger>
              )}
              {registration.is_mlc && (
                <TabsTrigger value="mlc">MLC Details</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Chief Complaint */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Chief Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{registration.chief_complaint || "Not recorded"}</p>
                  {registration.mechanism_of_injury && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-sm text-muted-foreground">Mechanism of Injury:</span>
                      <p className="mt-1">{registration.mechanism_of_injury}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vitals */}
              {registration.vitals && Object.keys(registration.vitals).length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Initial Vitals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {registration.vitals.blood_pressure_systolic && (
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-xs text-muted-foreground">BP</div>
                          <div className="font-semibold">
                            {registration.vitals.blood_pressure_systolic}/
                            {registration.vitals.blood_pressure_diastolic}
                          </div>
                        </div>
                      )}
                      {registration.vitals.pulse && (
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-xs text-muted-foreground">Pulse</div>
                          <div className="font-semibold">{registration.vitals.pulse}</div>
                        </div>
                      )}
                      {registration.vitals.temperature && (
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-xs text-muted-foreground">Temp</div>
                          <div className="font-semibold">{registration.vitals.temperature}°F</div>
                        </div>
                      )}
                      {registration.vitals.respiratory_rate && (
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-xs text-muted-foreground">RR</div>
                          <div className="font-semibold">{registration.vitals.respiratory_rate}</div>
                        </div>
                      )}
                      {registration.vitals.spo2 && (
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-xs text-muted-foreground">SpO2</div>
                          <div className="font-semibold">{registration.vitals.spo2}%</div>
                        </div>
                      )}
                      {registration.vitals.gcs && (
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-xs text-muted-foreground">GCS</div>
                          <div className="font-semibold">{registration.vitals.gcs}/15</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="treatments" className="mt-4">
              <TreatmentTimeline erId={registration.id} />
            </TabsContent>

            {registration.is_trauma && (
              <TabsContent value="trauma" className="space-y-4 mt-4">
                <div className="flex justify-end">
                  <Button onClick={() => setShowTraumaDialog(true)}>
                    <Brain className="h-4 w-4 mr-2" />
                    New Trauma Assessment
                  </Button>
                </div>

                {traumaAssessments && traumaAssessments.length > 0 ? (
                  traumaAssessments.map((assessment) => (
                    <Card key={assessment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Assessment - {format(new Date(assessment.assessment_time), "dd MMM HH:mm")}
                          </CardTitle>
                          {assessment.gcs_total && (
                            <Badge variant="outline">GCS: {assessment.gcs_total}/15</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {assessment.mechanism && (
                          <div>
                            <span className="text-sm text-muted-foreground">Mechanism:</span>
                            <p>{assessment.mechanism}</p>
                          </div>
                        )}
                        {assessment.injuries && assessment.injuries.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Injuries:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {assessment.injuries.map((injury: any, i: number) => (
                                <Badge key={i} variant="secondary">
                                  {injury.body_part}: {injury.injury_type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {assessment.notes && (
                          <div>
                            <span className="text-sm text-muted-foreground">Notes:</span>
                            <p className="text-sm">{assessment.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No trauma assessments recorded yet
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {registration.is_mlc && (
              <TabsContent value="mlc" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      Medico-Legal Case Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Police Station</span>
                        <p className="font-medium">{registration.police_station || "Not recorded"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">FIR Number</span>
                        <p className="font-medium">{registration.fir_number || "Not recorded"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Triage Status */}
          <Card className={isCritical ? "border-red-500" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Triage Status</CardTitle>
                {!registration.triage_level && (
                  <Button size="sm" onClick={() => setShowTriageDialog(true)}>
                    <Gauge className="h-4 w-4 mr-1" />
                    Triage
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <TriageBadge level={registration.triage_level} size="lg" animate={isCritical} />
              </div>
              {triageInfo && (
                <p className="text-center text-sm text-muted-foreground">
                  {triageInfo.description}
                </p>
              )}
              {registration.triage_time && (
                <div className="text-center text-xs text-muted-foreground">
                  Triaged at {format(new Date(registration.triage_time), "HH:mm")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Arrival:</span>
                <span>{format(new Date(registration.arrival_time), "HH:mm")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time in ER:</span>
                <span className={waitMinutes > 60 ? "text-orange-500" : ""}>
                  {waitMinutes} min
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Arrival Mode:</span>
                <span className="capitalize">{registration.arrival_mode.replace("_", " ")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Zone & Doctor */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {registration.assigned_zone && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{registration.assigned_zone}</span>
                </div>
              )}
              {registration.assigned_doctor?.profile?.full_name && (
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span>Dr. {registration.assigned_doctor.profile.full_name}</span>
                </div>
              )}
              {!registration.assigned_zone && !registration.assigned_doctor && (
                <p className="text-sm text-muted-foreground">Not yet assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Brought By */}
          {registration.brought_by_name && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Brought By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{registration.brought_by_name}</p>
                {registration.brought_by_relation && (
                  <p className="text-muted-foreground">{registration.brought_by_relation}</p>
                )}
                {registration.brought_by_phone && (
                  <p>{registration.brought_by_phone}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Triage Dialog */}
      <Dialog open={showTriageDialog} onOpenChange={setShowTriageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Triage Assessment</DialogTitle>
          </DialogHeader>
          <TriageAssessmentForm
            registrationId={registration.id}
            initialData={{
              chief_complaint: registration.chief_complaint || undefined,
              vitals: registration.vitals || undefined,
            }}
            onSuccess={() => setShowTriageDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Trauma Dialog */}
      <Dialog open={showTraumaDialog} onOpenChange={setShowTraumaDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trauma Assessment</DialogTitle>
          </DialogHeader>
          <TraumaAssessmentForm
            erId={registration.id}
            onSuccess={() => setShowTraumaDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Discharge Confirmation */}
      <Dialog open={showDischargeDialog} onOpenChange={setShowDischargeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Discharge</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to discharge this patient from the Emergency Department?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDischargeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDischarge} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Discharge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Template */}
      <div className="hidden">
        <PrintableERSlip ref={printRef} registration={registration} />
      </div>
    </div>
  );
};

export default ERDetailPage;
