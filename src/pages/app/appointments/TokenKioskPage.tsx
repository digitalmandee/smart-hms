import { useEffect, useState, useRef } from "react";
import { useTodayQueue } from "@/hooks/useAppointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { differenceInMinutes, format } from "date-fns";
import { Clock, Users, Volume2, VolumeX, RefreshCw, Stethoscope, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueuePatient {
  id: string;
  token_number: number;
  priority: number;
  status: string;
  appointment_time: string | null;
  check_in_at: string | null;
  patient: {
    first_name: string;
    last_name: string;
    patient_number: string;
  } | null;
  doctor: {
    profile: {
      full_name: string;
    } | null;
    specialization: string | null;
  } | null;
}

const TokenKioskPage = () => {
  const { data: queue, refetch } = useTodayQueue();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Filter and sort queue
  const activeQueue = (queue as QueuePatient[] | undefined)?.filter(
    (apt) => apt.status === "checked_in" || apt.status === "in_progress"
  ) || [];

  // Sort by priority (higher first), then by check-in time
  const sortedQueue = [...activeQueue].sort((a, b) => {
    if (a.status === "in_progress" && b.status !== "in_progress") return -1;
    if (b.status === "in_progress" && a.status !== "in_progress") return 1;
    if (a.priority !== b.priority) return b.priority - a.priority;
    return new Date(a.check_in_at || 0).getTime() - new Date(b.check_in_at || 0).getTime();
  });

  const nowServing = sortedQueue.filter((p) => p.status === "in_progress");
  const upNext = sortedQueue.filter((p) => p.status === "checked_in");

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2: return { bg: "bg-red-600", text: "text-white", label: "Emergency" };
      case 1: return { bg: "bg-amber-500", text: "text-white", label: "Urgent" };
      default: return { bg: "bg-emerald-600", text: "text-white", label: "Normal" };
    }
  };

  return (
    <div className={cn(
      "min-h-screen p-6 overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-slate-900 text-white" : "bg-gradient-to-br from-blue-50 via-white to-slate-50 text-slate-900"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <h1 className={cn(
            "text-4xl font-bold tracking-tight",
            isDarkMode ? "text-white" : "text-slate-800"
          )}>OPD Token Display</h1>
          <Badge className={cn(
            "text-xl px-4 py-2",
            isDarkMode 
              ? "bg-slate-700 text-white border-slate-600" 
              : "bg-blue-100 text-blue-800 border-blue-200"
          )}>
            <Users className="h-5 w-5 mr-2" />
            {activeQueue.length} Waiting
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "rounded-full",
              isDarkMode ? "text-white hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className={cn(
              isDarkMode ? "text-white hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <RefreshCw className="h-6 w-6" />
          </Button>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={cn(
              "p-3 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
            )}
          >
            {audioEnabled ? <Volume2 className="h-7 w-7" /> : <VolumeX className="h-7 w-7 opacity-50" />}
          </button>
          <div className={cn(
            "text-5xl font-mono font-bold",
            isDarkMode ? "text-white" : "text-blue-600"
          )}>
            {format(currentTime, "HH:mm:ss")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 h-[calc(100vh-160px)]">
        {/* Now Serving - Large Section */}
        <div className="col-span-2 space-y-6">
          <div className={cn(
            "text-2xl font-semibold flex items-center gap-3",
            isDarkMode ? "text-emerald-400" : "text-emerald-600"
          )}>
            <div className={cn(
              "w-4 h-4 rounded-full animate-pulse",
              isDarkMode ? "bg-emerald-400" : "bg-emerald-500"
            )} />
            NOW SERVING
          </div>
          
          {nowServing.length === 0 ? (
            <div className={cn(
              "flex items-center justify-center h-64 rounded-2xl border",
              isDarkMode 
                ? "bg-slate-800/50 border-slate-700" 
                : "bg-white/70 border-slate-200 shadow-lg"
            )}>
              <p className={cn(
                "text-3xl",
                isDarkMode ? "text-slate-500" : "text-slate-400"
              )}>No patient being served</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {nowServing.map((patient) => (
                <div
                  key={patient.id}
                  className={cn(
                    "rounded-2xl border-2 p-8",
                    isDarkMode 
                      ? "bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 border-emerald-500" 
                      : "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-400 shadow-xl"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className={cn(
                        "w-32 h-32 rounded-2xl flex items-center justify-center text-6xl font-bold shadow-lg",
                        isDarkMode 
                          ? "bg-emerald-500 text-emerald-950 shadow-emerald-500/30" 
                          : "bg-emerald-500 text-white shadow-emerald-500/40"
                      )}>
                        {patient.token_number}
                      </div>
                      <div>
                        <h2 className={cn(
                          "text-4xl font-bold mb-2",
                          isDarkMode ? "text-white" : "text-slate-800"
                        )}>
                          {patient.patient?.first_name} {patient.patient?.last_name}
                        </h2>
                        <p className={cn(
                          "text-xl",
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        )}>MR# {patient.patient?.patient_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {patient.doctor && (
                        <div className={cn(
                          "flex items-center gap-3 text-2xl",
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        )}>
                          <Stethoscope className="h-6 w-6" />
                          <span>Dr. {patient.doctor.profile?.full_name}</span>
                        </div>
                      )}
                      {patient.doctor?.specialization && (
                        <p className={cn(
                          "text-lg mt-1",
                          isDarkMode ? "text-slate-500" : "text-slate-400"
                        )}>{patient.doctor.specialization}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Up Next - Sidebar */}
        <div className="space-y-4">
          <div className={cn(
            "text-xl font-semibold flex items-center gap-3",
            isDarkMode ? "text-blue-400" : "text-blue-600"
          )}>
            <Clock className="h-5 w-5" />
            UP NEXT
          </div>
          
          <div className={cn(
            "rounded-2xl border h-[calc(100%-40px)] overflow-hidden",
            isDarkMode 
              ? "bg-slate-800/50 border-slate-700" 
              : "bg-white/70 border-slate-200 shadow-lg"
          )}>
            <div className={cn(
              "divide-y h-full overflow-y-auto",
              isDarkMode ? "divide-slate-700" : "divide-slate-100"
            )}>
              {upNext.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className={cn(
                    "text-xl",
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  )}>No patients waiting</p>
                </div>
              ) : (
                upNext.slice(0, 10).map((patient, index) => {
                  const priority = getPriorityColor(patient.priority);
                  const waitMinutes = patient.check_in_at 
                    ? differenceInMinutes(new Date(), new Date(patient.check_in_at))
                    : 0;

                  return (
                    <div
                      key={patient.id}
                      className={cn(
                        "p-4 flex items-center gap-4 transition-colors",
                        index === 0 && (isDarkMode ? "bg-blue-900/30" : "bg-blue-50")
                      )}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold",
                        priority.bg, priority.text
                      )}>
                        {patient.token_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-lg font-medium truncate",
                          isDarkMode ? "text-white" : "text-slate-800"
                        )}>
                          {patient.patient?.first_name} {patient.patient?.last_name}
                        </p>
                        <div className={cn(
                          "flex items-center gap-2 text-sm",
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        )}>
                          <Clock className="h-3 w-3" />
                          <span className={cn(
                            waitMinutes > 30 && "text-amber-500",
                            waitMinutes > 60 && "text-red-500"
                          )}>
                            {waitMinutes}m wait
                          </span>
                        </div>
                      </div>
                      {patient.priority > 0 && (
                        <Badge className={cn("text-xs", priority.bg, priority.text)}>
                          {priority.label}
                        </Badge>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Priority Legend */}
      <div className={cn(
        "absolute bottom-6 left-6 right-6 flex items-center justify-center gap-8 text-sm",
        isDarkMode ? "text-slate-400" : "text-slate-500"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning" />
          <span>Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive" />
          <span>Emergency</span>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default TokenKioskPage;