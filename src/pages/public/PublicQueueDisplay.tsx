import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { format } from "date-fns";

interface QueuePatient {
  id: string;
  token_number: number | null;
  priority: number | null;
  status: string | null;
  patient: {
    first_name: string;
    last_name: string | null;
  } | null;
  doctor: {
    profile: {
      full_name: string;
    };
    specialization: string | null;
  } | null;
}

const priorityConfig: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: "bg-green-500", text: "text-green-50", label: "Normal" },
  1: { bg: "bg-amber-500", text: "text-amber-50", label: "Urgent" },
  2: { bg: "bg-red-600", text: "text-red-50", label: "Emergency" },
};

export default function PublicQueueDisplay() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [lastToken, setLastToken] = useState<number | null>(null);

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

  // Fetch queue data
  const fetchQueue = async () => {
    if (!organizationId) return;

    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        token_number,
        priority,
        status,
        patient:patients(first_name, last_name),
        doctor:doctors(specialization, profile:profiles(full_name))
      `)
      .eq("organization_id", organizationId)
      .eq("appointment_date", today)
      .in("status", ["checked_in", "in_progress"])
      .order("priority", { ascending: false })
      .order("token_number", { ascending: true });

    if (!error && data) {
      setQueue(data as QueuePatient[]);
      setIsLoading(false);

      // Audio announcement for new "in_progress" token
      const inProgress = data.find((d) => d.status === "in_progress");
      if (inProgress && audioEnabled && inProgress.token_number !== lastToken) {
        speakToken(inProgress.token_number || 0);
        setLastToken(inProgress.token_number);
      }
    }
  };

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchQueue();

    // Set up real-time subscription for instant updates
    const channel = supabase
      .channel("public-queue-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    // Fallback polling every 10 seconds
    const interval = setInterval(fetchQueue, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [organizationId]);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Text-to-speech for token
  const speakToken = (tokenNum: number) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Token number ${tokenNum}, please proceed to the counter`
      );
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const nowServing = queue.filter((q) => q.status === "in_progress");
  const waiting = queue.filter((q) => q.status === "checked_in").slice(0, 8);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading Queue...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{orgName || "Hospital"}</h1>
          <p className="text-slate-400">OPD Queue Display</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-4xl font-mono font-bold text-emerald-400">
              {format(currentTime, "HH:mm:ss")}
            </div>
            <div className="text-slate-400">{format(currentTime, "EEEE, MMMM d, yyyy")}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="border-slate-600 bg-slate-800 hover:bg-slate-700"
            >
              {audioEnabled ? (
                <Volume2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <VolumeX className="h-5 w-5 text-slate-400" />
              )}
            </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Now Serving - Large Left Panel */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-semibold text-emerald-400 mb-6 flex items-center gap-3">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            NOW SERVING
          </h2>

          {nowServing.length > 0 ? (
            <div className="space-y-6">
              {nowServing.map((patient) => {
                const priority = patient.priority || 0;
                const config = priorityConfig[priority] || priorityConfig[0];

                return (
                  <div
                    key={patient.id}
                    className="bg-gradient-to-r from-emerald-600/20 to-emerald-800/10 rounded-xl p-6 border border-emerald-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-8xl font-bold text-emerald-400 mb-2">
                          #{patient.token_number || "-"}
                        </div>
                        <div className="text-2xl text-white">
                          {patient.patient?.first_name} {patient.patient?.last_name || ""}
                        </div>
                        <div className="text-lg text-slate-400 mt-2">
                          Dr. {patient.doctor?.profile?.full_name || "—"} •{" "}
                          {patient.doctor?.specialization || "General"}
                        </div>
                      </div>
                      <Badge className={`${config.bg} ${config.text} text-lg px-4 py-2`}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <div className="text-6xl mb-4">👋</div>
              <p className="text-xl">Waiting for next patient...</p>
            </div>
          )}
        </div>

        {/* Up Next - Right Panel */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 overflow-hidden">
          <h2 className="text-xl font-semibold text-amber-400 mb-4">UP NEXT</h2>

          {waiting.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
              {waiting.map((patient, index) => {
                const priority = patient.priority || 0;
                const config = priorityConfig[priority] || priorityConfig[0];

                return (
                  <div
                    key={patient.id}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      index === 0 ? "bg-amber-500/20 border border-amber-500/30" : "bg-slate-700/30"
                    }`}
                  >
                    <div
                      className={`text-3xl font-bold ${
                        index === 0 ? "text-amber-400" : "text-slate-300"
                      }`}
                    >
                      #{patient.token_number || "-"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {patient.patient?.first_name} {patient.patient?.last_name?.[0] || ""}.
                      </div>
                      <div className="text-sm text-slate-400 truncate">
                        {patient.doctor?.profile?.full_name || "—"}
                      </div>
                    </div>
                    {priority > 0 && (
                      <div className={`w-3 h-3 rounded-full ${config.bg}`} title={config.label} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              <p>No patients waiting</p>
            </div>
          )}
        </div>
      </div>

      {/* Priority Legend */}
      <div className="mt-6 flex justify-center gap-6">
        {Object.entries(priorityConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2 text-sm text-slate-400">
            <div className={`w-4 h-4 rounded-full ${config.bg}`} />
            <span>{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
