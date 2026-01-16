import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize, RefreshCw, AlertTriangle, Ambulance } from "lucide-react";
import { format } from "date-fns";

interface ERPatient {
  id: string;
  er_number: string;
  triage_level: string | null;
  status: string | null;
  assigned_zone: string | null;
  patient: {
    first_name: string;
    last_name: string | null;
  } | null;
  unknown_patient_details: { name?: string } | null;
}

interface AmbulanceAlert {
  id: string;
  eta_minutes: number | null;
  priority: number | null;
  condition_summary: string | null;
  status: string;
}

const triageConfig: Record<string, { bg: string; text: string; label: string; zone: string }> = {
  "1": { bg: "bg-red-600", text: "text-white", label: "Resuscitation", zone: "RED" },
  "2": { bg: "bg-orange-500", text: "text-white", label: "Emergent", zone: "ORANGE" },
  "3": { bg: "bg-yellow-500", text: "text-black", label: "Urgent", zone: "YELLOW" },
  "4": { bg: "bg-green-500", text: "text-white", label: "Less Urgent", zone: "GREEN" },
  "5": { bg: "bg-blue-500", text: "text-white", label: "Non-Urgent", zone: "BLUE" },
};

export default function PublicERDisplay() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [patients, setPatients] = useState<ERPatient[]>([]);
  const [ambulances, setAmbulances] = useState<AmbulanceAlert[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch organization name
  useEffect(() => {
    if (!organizationId) return;

    const fetchOrg = async () => {
      const { data } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .single();
      
      if (data) setOrgName(data.name);
    };

    fetchOrg();
  }, [organizationId]);

  // Fetch ER queue
  const fetchQueue = async () => {
    if (!organizationId) return;

    const today = new Date().toISOString().split("T")[0];
    
    // Fetch ER registrations
    const { data: erData } = await supabase
      .from("emergency_registrations")
      .select(`
        id,
        er_number,
        triage_level,
        status,
        assigned_zone,
        unknown_patient_details,
        patient:patients(first_name, last_name)
      `)
      .eq("organization_id", organizationId)
      .gte("arrival_time", today)
      .in("status", ["waiting", "in_triage", "in_treatment"])
      .order("triage_level", { ascending: true })
      .order("arrival_time", { ascending: true });

    if (erData) {
      setPatients(erData as ERPatient[]);
    }

    // Fetch incoming ambulances
    const { data: ambData } = await supabase
      .from("ambulance_alerts")
      .select("id, eta_minutes, priority, condition_summary, status")
      .eq("organization_id", organizationId)
      .eq("status", "incoming")
      .order("eta_minutes", { ascending: true });

    if (ambData) {
      setAmbulances(ambData);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [organizationId]);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Get patient name
  const getPatientName = (p: ERPatient) => {
    if (p.patient) {
      return p.patient.first_name;
    }
    if (p.unknown_patient_details?.name) {
      return p.unknown_patient_details.name.split(" ")[0];
    }
    return "Unknown";
  };

  // Group by triage level zone
  const patientsByZone = patients.reduce((acc, p) => {
    const level = p.triage_level || "5";
    const zone = triageConfig[level]?.zone || "BLUE";
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(p);
    return acc;
  }, {} as Record<string, ERPatient[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading ER Queue...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-slate-900 text-white p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">{orgName || "Hospital"}</h1>
            <p className="text-red-400 font-medium">EMERGENCY DEPARTMENT</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-4xl font-mono font-bold text-red-400">
              {format(currentTime, "HH:mm:ss")}
            </div>
            <div className="text-slate-400">{format(currentTime, "EEEE, MMMM d, yyyy")}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchQueue}
              className="border-slate-600 bg-slate-800 hover:bg-slate-700"
            >
              <RefreshCw className="h-5 w-5 text-slate-400" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="border-slate-600 bg-slate-800 hover:bg-slate-700"
            >
              <Maximize className="h-5 w-5 text-slate-400" />
            </Button>
          </div>
        </div>
      </header>

      {/* Ambulance Alerts */}
      {ambulances.length > 0 && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <Ambulance className="h-6 w-6 text-red-400" />
            <h2 className="text-lg font-bold text-red-400">INCOMING AMBULANCES</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto">
            {ambulances.map((amb) => (
              <div
                key={amb.id}
                className="flex-shrink-0 bg-red-800/50 px-4 py-2 rounded-lg border border-red-500/30"
              >
                <div className="text-2xl font-bold text-red-300">
                  ETA: {amb.eta_minutes || "?"} min
                </div>
                <div className="text-sm text-red-200">{amb.condition_summary || "Unknown condition"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone-based Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Object.entries(triageConfig).map(([level, config]) => {
          const zonePatients = patientsByZone[config.zone] || [];
          
          return (
            <div
              key={level}
              className={`rounded-xl border-2 overflow-hidden ${
                zonePatients.length > 0 ? "border-opacity-100" : "border-opacity-30"
              }`}
              style={{ borderColor: config.bg.replace("bg-", "").includes("-") ? undefined : config.bg }}
            >
              <div className={`${config.bg} ${config.text} px-4 py-3 text-center`}>
                <div className="text-lg font-bold">{config.zone} ZONE</div>
                <div className="text-sm opacity-90">{config.label}</div>
              </div>
              
              <div className="bg-slate-800/50 p-3 min-h-[200px]">
                {zonePatients.length > 0 ? (
                  <div className="space-y-2">
                    {zonePatients.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                      >
                        <div className="font-bold text-lg text-white">{p.er_number}</div>
                        <div className="text-sm text-slate-300 truncate">
                          {getPatientName(p)}
                        </div>
                        <Badge
                          variant="outline"
                          className={`mt-1 text-xs ${
                            p.status === "in_treatment"
                              ? "border-emerald-500 text-emerald-400"
                              : "border-slate-500 text-slate-400"
                          }`}
                        >
                          {p.status === "in_treatment" ? "In Treatment" : "Waiting"}
                        </Badge>
                      </div>
                    ))}
                    {zonePatients.length > 6 && (
                      <div className="text-center text-slate-500 text-sm">
                        +{zonePatients.length - 6} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                    No patients
                  </div>
                )}
              </div>
              
              <div className={`${config.bg} ${config.text} px-4 py-2 text-center`}>
                <span className="text-2xl font-bold">{zonePatients.length}</span>
                <span className="ml-2 text-sm opacity-90">patients</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 flex justify-center gap-8 text-slate-400">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{patients.length}</div>
          <div className="text-sm">Total Patients</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-400">
            {patients.filter((p) => p.status === "in_treatment").length}
          </div>
          <div className="text-sm">In Treatment</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-400">
            {patients.filter((p) => p.status !== "in_treatment").length}
          </div>
          <div className="text-sm">Waiting</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400">{ambulances.length}</div>
          <div className="text-sm">Incoming</div>
        </div>
      </div>
    </div>
  );
}
