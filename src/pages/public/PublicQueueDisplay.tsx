import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { format } from "date-fns";
import {
  usePublicOPDDepartmentByCode,
  usePublicOPDQueue,
  useOrganizationPublic,
} from "@/hooks/usePublicQueue";
import { formatTokenDisplay } from "@/lib/opd-token";

const priorityConfig: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: "bg-green-500", text: "text-green-50", label: "Normal" },
  1: { bg: "bg-amber-500", text: "text-amber-50", label: "Urgent" },
  2: { bg: "bg-red-600", text: "text-red-50", label: "Emergency" },
};

export default function PublicQueueDisplay() {
  const { organizationId, deptCode } = useParams<{ organizationId: string; deptCode?: string }>();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [lastToken, setLastToken] = useState<number | null>(null);

  // Resolve deptCode to department
  const { data: department } = usePublicOPDDepartmentByCode(organizationId, deptCode);

  // Fetch org name
  const { data: org } = useOrganizationPublic(organizationId);

  // Use the shared hook — auto-polls every 5s, no manual interval needed
  const { data: queue = [], isLoading } = usePublicOPDQueue(
    organizationId,
    deptCode ? department?.id : undefined
  );

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio announcement on new in_progress token
  useEffect(() => {
    const inProgress = queue.find((q: any) => q.status === "in_progress");
    if (inProgress && audioEnabled && (inProgress as any).token_number !== lastToken) {
      speakToken((inProgress as any).token_number || 0);
      setLastToken((inProgress as any).token_number);
    }
  }, [queue, audioEnabled, lastToken]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const speakToken = (tokenNum: number) => {
    if ("speechSynthesis" in window) {
      const deptPrefix = department ? `${department.name}, ` : "";
      const utterance = new SpeechSynthesisUtterance(
        `${deptPrefix}Token number ${tokenNum}, please proceed to the counter`
      );
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getTokenStr = (patient: any) => {
    const code = patient.opd_department?.code || department?.code;
    return formatTokenDisplay(patient.token_number || 0, code);
  };

  const nowServing = queue.filter((q: any) => q.status === "in_progress");
  const waiting = queue.filter((q: any) => q.status === "checked_in").slice(0, 8);

  const deptColor = department?.color;
  const orgName = org?.name || "";
  const headerTitle = department
    ? `${orgName || "Hospital"} — ${department.name}`
    : orgName || "Hospital";

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
          <h1 className="text-3xl font-bold text-white">{headerTitle}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-400">OPD Queue Display</p>
            {department && (
              <Badge
                className="font-mono text-sm"
                style={{
                  backgroundColor: `${deptColor}20`,
                  color: deptColor || "#3b82f6",
                  borderColor: deptColor || "#3b82f6",
                }}
              >
                {department.code}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-4xl font-mono font-bold" style={{ color: deptColor || "#34d399" }}>
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
                <Volume2 className="h-5 w-5" style={{ color: deptColor || "#34d399" }} />
              ) : (
                <VolumeX className="h-5 w-5 text-slate-400" />
              )}
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
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3"
            style={{ color: deptColor || "#34d399" }}>
            <span className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: deptColor || "#10b981" }} />
            NOW SERVING
          </h2>

          {nowServing.length > 0 ? (
            <div className="space-y-6">
              {nowServing.map((patient: any) => {
                const priority = patient.priority || 0;
                const config = priorityConfig[priority] || priorityConfig[0];
                const patientDeptColor = patient.opd_department?.color || deptColor;

                return (
                  <div
                    key={patient.id}
                    className="rounded-xl p-6 border"
                    style={{
                      backgroundColor: `${patientDeptColor || "#10b981"}15`,
                      borderColor: `${patientDeptColor || "#10b981"}50`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-8xl font-bold font-mono mb-2"
                          style={{ color: patientDeptColor || "#34d399" }}>
                          {getTokenStr(patient)}
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
              {waiting.map((patient: any, index: number) => {
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
                      className={`text-3xl font-bold font-mono ${
                        index === 0 ? "text-amber-400" : "text-slate-300"
                      }`}
                    >
                      {getTokenStr(patient)}
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
