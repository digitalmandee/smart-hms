import { useEffect, useState, useRef } from "react";
import { useERQueue, useAmbulanceAlerts, ER_ZONES, TRIAGE_LEVELS, EmergencyRegistration } from "@/hooks/useEmergency";
import { TriageBadge } from "@/components/emergency/TriageBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { differenceInMinutes, format } from "date-fns";
import { Ambulance, Clock, AlertTriangle, Users, Volume2, VolumeX, Printer, RefreshCw, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReactToPrint } from "react-to-print";

// Printable ER Token Component
const PrintableERToken = ({ patient }: { patient: EmergencyRegistration }) => {
  return (
    <div className="p-8 bg-white text-black">
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-2xl font-bold">EMERGENCY DEPARTMENT</h1>
        <p className="text-sm text-gray-600">Token Slip</p>
      </div>
      <div className="text-center mb-6">
        <div className="text-6xl font-bold mb-2">{patient.er_number}</div>
        <div className="text-lg text-gray-600">ER Number</div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <span className="text-gray-500">Patient:</span>
          <p className="font-medium">
            {patient.patient 
              ? `${patient.patient.first_name} ${patient.patient.last_name}`
              : "Unknown Patient"
            }
          </p>
        </div>
        <div>
          <span className="text-gray-500">Triage Level:</span>
          <p className="font-medium">Level {patient.triage_level}</p>
        </div>
        <div>
          <span className="text-gray-500">Zone:</span>
          <p className="font-medium">{patient.assigned_zone || "Pending"}</p>
        </div>
        <div>
          <span className="text-gray-500">Arrival:</span>
          <p className="font-medium">{format(new Date(patient.arrival_time), "HH:mm")}</p>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 border-t pt-4">
        <p>Please keep this token with you</p>
        <p>Printed: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
      </div>
    </div>
  );
};

const ERQueueDisplayPage = () => {
  const { data: queue, refetch } = useERQueue();
  const { data: ambulanceAlerts } = useAmbulanceAlerts("incoming");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<EmergencyRegistration | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => refetch(), 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Group patients by zone
  const patientsByZone: Record<string, EmergencyRegistration[]> = Object.fromEntries(
    ER_ZONES.map(zone => [zone, []])
  );

  queue?.forEach((patient) => {
    if (patient.assigned_zone && patientsByZone[patient.assigned_zone]) {
      patientsByZone[patient.assigned_zone].push(patient);
    }
  });

  const incomingAmbulances = ambulanceAlerts?.filter(a => a.status === "incoming") || [];
  const criticalAmbulances = incomingAmbulances.filter(a => a.priority === 1);

  const zoneColors: Record<string, { bg: string; border: string; header: string }> = {
    "Resuscitation Bay": { bg: "bg-red-950", border: "border-red-500", header: "bg-red-500" },
    "Trauma Bay": { bg: "bg-orange-950", border: "border-orange-500", header: "bg-orange-500" },
    "Yellow Zone": { bg: "bg-yellow-950", border: "border-yellow-500", header: "bg-yellow-500 text-yellow-950" },
    "Green Zone": { bg: "bg-green-950", border: "border-green-500", header: "bg-green-500" },
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePrintToken = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedPatient?.er_number || "ER-Token",
  });

  const onPrintClick = (patient: EmergencyRegistration) => {
    setSelectedPatient(patient);
    setTimeout(() => handlePrintToken(), 100);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Emergency Department</h1>
          <Badge variant="outline" className="text-white border-white text-lg px-4 py-1">
            <Users className="h-4 w-4 mr-2" />
            {queue?.length || 0} Patients
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-gray-800"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-6 w-6" />
          </button>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 rounded hover:bg-gray-800"
          >
            {audioEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6 opacity-50" />}
          </button>
          <div className="text-4xl font-mono">
            {format(currentTime, "HH:mm:ss")}
          </div>
        </div>
      </div>

      {/* Incoming Ambulance Banner */}
      {incomingAmbulances.length > 0 && (
        <div className={cn(
          "mb-4 p-4 rounded-lg flex items-center justify-between",
          criticalAmbulances.length > 0 ? "bg-red-600 animate-pulse" : "bg-orange-600"
        )}>
          <div className="flex items-center gap-4">
            <Ambulance className="h-8 w-8" />
            <div>
              <div className="text-xl font-bold">
                {incomingAmbulances.length} Incoming Ambulance{incomingAmbulances.length > 1 ? "s" : ""}
              </div>
              <div className="text-sm opacity-90">
                {incomingAmbulances.map(a => a.condition_summary || "Unknown condition").join(" | ")}
              </div>
            </div>
          </div>
          <div className="text-right">
            {incomingAmbulances.map(a => (
              <div key={a.id} className="text-lg font-mono">
                ETA: {a.eta_minutes} min
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone Columns */}
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-200px)]">
        {ER_ZONES.map((zone) => {
          const patients = patientsByZone[zone];
          const colors = zoneColors[zone];
          const hasCritical = patients.some(p => p.triage_level === "1");

          return (
            <div
              key={zone}
              className={cn(
                "rounded-lg border-2 overflow-hidden flex flex-col",
                colors.border,
                colors.bg,
                hasCritical && "ring-4 ring-red-500 animate-pulse"
              )}
            >
              {/* Zone Header */}
              <div className={cn("p-3 text-center font-bold text-lg", colors.header)}>
                {zone}
                <span className="ml-2 opacity-75">({patients.length})</span>
              </div>

              {/* Patient List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {patients.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No patients</div>
                ) : (
                  patients.map((patient) => {
                    const waitMinutes = differenceInMinutes(new Date(), new Date(patient.arrival_time));
                    const isCritical = patient.triage_level === "1" || patient.triage_level === "2";

                    return (
                      <div
                        key={patient.id}
                        className={cn(
                          "p-3 rounded-lg bg-gray-800 border border-gray-700 group relative",
                          isCritical && "border-red-500 bg-red-900/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-lg">
                            {patient.er_number}
                          </span>
                          <div className="flex items-center gap-2">
                            <TriageBadge level={patient.triage_level} size="sm" />
                            <button
                              onClick={() => onPrintClick(patient)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-700 transition-opacity"
                              title="Print Token"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-300 truncate">
                          {patient.patient
                            ? `${patient.patient.first_name} ${patient.patient.last_name}`
                            : "Unknown Patient"}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className={cn(
                              waitMinutes > 60 && "text-red-400",
                              waitMinutes > 30 && waitMinutes <= 60 && "text-yellow-400"
                            )}>
                              {waitMinutes}m
                            </span>
                          </span>
                          {patient.assigned_doctor?.profile?.full_name && (
                            <span className="truncate max-w-[100px]">
                              Dr. {patient.assigned_doctor.profile.full_name.split(" ")[0]}
                            </span>
                          )}
                        </div>
                        {patient.is_trauma && (
                          <Badge variant="destructive" className="mt-2 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Trauma
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
        {TRIAGE_LEVELS.map((triage) => (
          <div key={triage.level} className="flex items-center gap-2">
            <TriageBadge level={triage.level} showLabel={false} size="sm" />
            <span>{triage.name}</span>
          </div>
        ))}
      </div>

      {/* Hidden Printable Token */}
      <div className="hidden">
        <div ref={printRef}>
          {selectedPatient && <PrintableERToken patient={selectedPatient} />}
        </div>
      </div>
    </div>
  );
};

export default ERQueueDisplayPage;
