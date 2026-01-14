import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ERPatientCard } from "./ERPatientCard";
import { TriageBadge } from "./TriageBadge";
import { useERQueue, ER_ZONES, TRIAGE_LEVELS, EmergencyRegistration } from "@/hooks/useEmergency";
import { Loader2, Users, Clock, AlertTriangle } from "lucide-react";
import { differenceInMinutes } from "date-fns";

interface ERQueueBoardProps {
  onTriagePatient?: (id: string) => void;
  onAdmitPatient?: (id: string) => void;
}

export const ERQueueBoard = ({ onTriagePatient, onAdmitPatient }: ERQueueBoardProps) => {
  const { data: queue, isLoading } = useERQueue();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group patients by zone
  const patientsByZone: Record<string, EmergencyRegistration[]> = {
    "Waiting for Triage": [],
    ...Object.fromEntries(ER_ZONES.map(zone => [zone, []])),
  };

  queue?.forEach((patient) => {
    if (!patient.triage_level) {
      patientsByZone["Waiting for Triage"].push(patient);
    } else if (patient.assigned_zone && patientsByZone[patient.assigned_zone]) {
      patientsByZone[patient.assigned_zone].push(patient);
    }
  });

  const zoneColors: Record<string, string> = {
    "Waiting for Triage": "border-t-muted-foreground",
    "Resuscitation Bay": "border-t-red-500",
    "Trauma Bay": "border-t-orange-500",
    "Yellow Zone": "border-t-yellow-500",
    "Green Zone": "border-t-green-500",
  };

  const getAverageWaitTime = (patients: EmergencyRegistration[]) => {
    if (patients.length === 0) return 0;
    const totalMinutes = patients.reduce(
      (acc, p) => acc + differenceInMinutes(new Date(), new Date(p.arrival_time)),
      0
    );
    return Math.round(totalMinutes / patients.length);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {Object.entries(patientsByZone).map(([zone, patients]) => {
        const avgWait = getAverageWaitTime(patients);
        const hasCritical = patients.some(p => p.triage_level === "1" || p.triage_level === "2");

        return (
          <Card
            key={zone}
            className={`border-t-4 ${zoneColors[zone] || "border-t-primary"} ${
              hasCritical ? "ring-2 ring-red-500/50" : ""
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{zone}</CardTitle>
                {hasCritical && (
                  <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {patients.length}
                </span>
                {patients.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{avgWait}m avg
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-2">
                  {patients.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      No patients
                    </p>
                  ) : (
                    patients.map((patient) => (
                      <ERPatientCard
                        key={patient.id}
                        registration={patient}
                        compact
                        onTriage={
                          !patient.triage_level
                            ? () => onTriagePatient?.(patient.id)
                            : undefined
                        }
                        onAdmit={
                          patient.triage_level
                            ? () => onAdmitPatient?.(patient.id)
                            : undefined
                        }
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
