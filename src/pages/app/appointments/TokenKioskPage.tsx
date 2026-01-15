import { useEffect, useState, useRef } from "react";
import { useTodayQueue } from "@/hooks/useAppointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { differenceInMinutes, format } from "date-fns";
import { Clock, Users, Volume2, VolumeX, Printer, RefreshCw, Stethoscope } from "lucide-react";
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
      case 2: return { bg: "bg-destructive", text: "text-destructive-foreground", label: "Emergency" };
      case 1: return { bg: "bg-warning", text: "text-warning-foreground", label: "Urgent" };
      default: return { bg: "bg-success", text: "text-success-foreground", label: "Normal" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-bold tracking-tight">OPD Token Display</h1>
          <Badge variant="outline" className="text-white border-white text-xl px-4 py-2">
            <Users className="h-5 w-5 mr-2" />
            {activeQueue.length} Waiting
          </Badge>
        </div>
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-6 w-6" />
          </Button>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {audioEnabled ? <Volume2 className="h-7 w-7" /> : <VolumeX className="h-7 w-7 opacity-50" />}
          </button>
          <div className="text-5xl font-mono font-bold">
            {format(currentTime, "HH:mm:ss")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 h-[calc(100vh-160px)]">
        {/* Now Serving - Large Section */}
        <div className="col-span-2 space-y-6">
          <div className="text-2xl font-semibold text-green-400 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse" />
            NOW SERVING
          </div>
          
          {nowServing.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-2xl border border-gray-700">
              <p className="text-3xl text-gray-500">No patient being served</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {nowServing.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-gradient-to-r from-green-900/50 to-green-800/30 rounded-2xl border-2 border-green-500 p-8 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="w-32 h-32 rounded-2xl bg-green-500 text-green-950 flex items-center justify-center text-6xl font-bold shadow-lg shadow-green-500/30">
                        {patient.token_number}
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold mb-2">
                          {patient.patient?.first_name} {patient.patient?.last_name}
                        </h2>
                        <p className="text-xl text-gray-400">MR# {patient.patient?.patient_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {patient.doctor && (
                        <div className="flex items-center gap-3 text-2xl text-gray-300">
                          <Stethoscope className="h-6 w-6" />
                          <span>Dr. {patient.doctor.profile?.full_name}</span>
                        </div>
                      )}
                      {patient.doctor?.specialization && (
                        <p className="text-lg text-gray-500 mt-1">{patient.doctor.specialization}</p>
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
          <div className="text-xl font-semibold text-blue-400 flex items-center gap-3">
            <Clock className="h-5 w-5" />
            UP NEXT
          </div>
          
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 h-[calc(100%-40px)] overflow-hidden">
            <div className="divide-y divide-gray-700 h-full overflow-y-auto">
              {upNext.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xl text-gray-500">No patients waiting</p>
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
                        index === 0 && "bg-blue-900/30"
                      )}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold",
                        priority.bg, priority.text
                      )}>
                        {patient.token_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium truncate">
                          {patient.patient?.first_name} {patient.patient?.last_name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span className={cn(
                            waitMinutes > 30 && "text-yellow-400",
                            waitMinutes > 60 && "text-red-400"
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
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-8 text-sm text-gray-400">
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