import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ERPatientCard } from "@/components/emergency/ERPatientCard";
import { TriageAssessmentForm } from "@/components/emergency/TriageAssessmentForm";
import { useERQueue, EmergencyRegistration } from "@/hooks/useEmergency";
import { Gauge, Users, Clock, ArrowRight } from "lucide-react";
import { differenceInMinutes } from "date-fns";

const TriagePage = () => {
  const { data: queue, isLoading } = useERQueue();
  const [selectedPatient, setSelectedPatient] = useState<EmergencyRegistration | null>(null);

  const waitingForTriage = queue?.filter((p) => !p.triage_level) || [];
  const sortedByWait = [...waitingForTriage].sort(
    (a, b) => new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime()
  );

  const getWaitTimeClass = (arrivalTime: string) => {
    const minutes = differenceInMinutes(new Date(), new Date(arrivalTime));
    if (minutes > 60) return "text-red-500 font-bold";
    if (minutes > 30) return "text-orange-500";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Triage Station"
        subtitle="Assess and prioritize incoming patients"
        icon={Gauge}
        backUrl="/app/emergency"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Queue */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Waiting for Triage</CardTitle>
                <Badge variant="secondary">{waitingForTriage.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {waitingForTriage.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Gauge className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">All Clear!</p>
                  <p>No patients waiting for triage</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3 pr-4">
                    {sortedByWait.map((registration, index) => (
                      <div key={registration.id} className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-muted-foreground w-8">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <ERPatientCard
                            registration={registration}
                            onTriage={() => setSelectedPatient(registration)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Wait Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedByWait.length === 0 ? (
                <p className="text-muted-foreground text-sm">No waiting patients</p>
              ) : (
                sortedByWait.slice(0, 5).map((reg) => {
                  const minutes = differenceInMinutes(new Date(), new Date(reg.arrival_time));
                  return (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded"
                    >
                      <span className="font-mono text-sm">{reg.er_number}</span>
                      <span className={getWaitTimeClass(reg.arrival_time)}>
                        {minutes} min
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Triage Guidelines</h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  Level 1: Immediate life threat
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500" />
                  Level 2: Emergent, urgent care needed
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400" />
                  Level 3: Urgent, can wait briefly
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  Level 4: Less urgent
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  Level 5: Non-urgent
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Triage Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Triage Assessment - {selectedPatient?.er_number}
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Patient:</span>
                    <p className="font-medium">
                      {selectedPatient.patient
                        ? `${selectedPatient.patient.first_name} ${selectedPatient.patient.last_name}`
                        : "Unknown Patient"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Arrival:</span>
                    <p className="font-medium">
                      {differenceInMinutes(new Date(), new Date(selectedPatient.arrival_time))} min ago
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mode:</span>
                    <p className="font-medium capitalize">
                      {selectedPatient.arrival_mode.replace("_", " ")}
                    </p>
                  </div>
                  {selectedPatient.is_trauma && (
                    <div>
                      <Badge variant="destructive">Trauma Case</Badge>
                    </div>
                  )}
                </div>
                {selectedPatient.chief_complaint && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-muted-foreground text-sm">Chief Complaint:</span>
                    <p className="font-medium">{selectedPatient.chief_complaint}</p>
                  </div>
                )}
              </div>

              <TriageAssessmentForm
                registrationId={selectedPatient.id}
                initialData={{
                  chief_complaint: selectedPatient.chief_complaint || undefined,
                  vitals: selectedPatient.vitals || undefined,
                }}
                onSuccess={() => setSelectedPatient(null)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TriagePage;
