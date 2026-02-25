import { useEffect, useState, useRef } from "react";
import { useTodayQueue } from "@/hooks/useAppointments";
import { useOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { differenceInMinutes, format } from "date-fns";
import { Clock, Users, Volume2, VolumeX, RefreshCw, Stethoscope, Sun, Moon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTokenDisplay } from "@/lib/opd-token";
import { supabase } from "@/integrations/supabase/client";

interface QueuePatient {
  id: string;
  token_number: number;
  priority: number;
  status: string;
  appointment_time: string | null;
  check_in_at: string | null;
  updated_at?: string;
  opd_department?: {
    code: string;
    name: string;
    color: string | null;
  } | null;
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
  const { profile } = useAuth();
  const { data: queue, refetch } = useTodayQueue();
  const { data: organization } = useOrganization(profile?.organization_id ?? undefined);
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<QueuePatient[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevServingRef = useRef<string | null>(null);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time subscription for instant updates
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const channel = supabase
      .channel('kiosk-display-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `appointment_date=eq.${today}`,
      }, (payload) => {
        refetch();
        // Track recently completed
        if (payload.eventType === 'UPDATE' && (payload.new as any).status === 'completed') {
          const completed = payload.new as any;
          setRecentlyCompleted(prev => {
            const updated = [completed, ...prev.filter(p => p.id !== completed.id)].slice(0, 3);
            return updated;
          });
          // Auto-remove after 2 minutes
          setTimeout(() => {
            setRecentlyCompleted(prev => prev.filter(p => p.id !== completed.id));
          }, 120000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Filter and sort queue
  const activeQueue = (queue as QueuePatient[] | undefined)?.filter(
    (apt) => apt.status === "checked_in" || apt.status === "in_progress"
  ) || [];

  const sortedQueue = [...activeQueue].sort((a, b) => {
    if (a.status === "in_progress" && b.status !== "in_progress") return -1;
    if (b.status === "in_progress" && a.status !== "in_progress") return 1;
    if (a.priority !== b.priority) return b.priority - a.priority;
    return new Date(a.check_in_at || 0).getTime() - new Date(b.check_in_at || 0).getTime();
  });

  const nowServing = sortedQueue.filter((p) => p.status === "in_progress");
  const upNext = sortedQueue.filter((p) => p.status === "checked_in");

  // Play chime on token change
  useEffect(() => {
    const currentId = nowServing[0]?.id || null;
    if (prevServingRef.current && currentId && currentId !== prevServingRef.current && audioEnabled) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
      } catch { /* audio not supported */ }
    }
    prevServingRef.current = currentId;
  }, [nowServing, audioEnabled]);

  const getTokenStr = (patient: QueuePatient) => {
    return formatTokenDisplay(patient.token_number, patient.opd_department?.code);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2: return { bg: "bg-destructive", text: "text-destructive-foreground", label: t("opd.emergency" as any, "Emergency") };
      case 1: return { bg: "bg-warning", text: "text-warning-foreground", label: t("opd.urgent" as any, "Urgent") };
      default: return { bg: "bg-success", text: "text-success-foreground", label: "Normal" };
    }
  };

  return (
    <div className={cn(
      "min-h-screen p-6 overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-slate-900 text-white" : "bg-gradient-to-br from-background via-background to-muted/30 text-foreground"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {organization?.logo_url && (
            <img src={organization.logo_url} alt="" className="h-12 w-12 object-contain rounded-lg" />
          )}
          <div>
            <h1 className={cn(
              "text-3xl lg:text-4xl font-bold tracking-tight",
              isDarkMode ? "text-white" : "text-foreground"
            )}>{organization?.name || t("opd.tokenDisplay")}</h1>
            <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-muted-foreground")}>
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Badge className={cn(
            "text-lg px-3 py-1.5 ml-4",
            isDarkMode 
              ? "bg-slate-700 text-white border-slate-600" 
              : "bg-muted text-muted-foreground"
          )}>
            <Users className="h-4 w-4 mr-1.5" />
            {activeQueue.length} {t("opd.waiting")}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn("rounded-full", isDarkMode ? "text-white hover:bg-slate-800" : "")}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => refetch()}
            className={cn(isDarkMode ? "text-white hover:bg-slate-800" : "")}>
            <RefreshCw className="h-5 w-5" />
          </Button>
          <button onClick={() => setAudioEnabled(!audioEnabled)}
            className={cn("p-2.5 rounded-lg transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-muted")}>
            {audioEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6 opacity-50" />}
          </button>
          <div className={cn(
            "text-4xl lg:text-5xl font-mono font-bold tabular-nums",
            isDarkMode ? "text-white" : "text-primary"
          )}>
            {format(currentTime, "HH:mm:ss")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Now Serving - Large Section */}
        <div className="col-span-2 space-y-4">
          <div className={cn(
            "text-xl font-semibold flex items-center gap-3 uppercase tracking-wide",
            isDarkMode ? "text-emerald-400" : "text-success"
          )}>
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              isDarkMode ? "bg-emerald-400" : "bg-success"
            )} />
            {t("opd.nowServing")}
          </div>
          
          {nowServing.length === 0 ? (
            <div className={cn(
              "flex items-center justify-center h-64 rounded-2xl border-2 border-dashed",
              isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-card border-border"
            )}>
              <p className={cn("text-2xl", isDarkMode ? "text-slate-500" : "text-muted-foreground")}>
                {t("opd.noPatientServing")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {nowServing.map((patient) => {
                const deptColor = patient.opd_department?.color;
                return (
                  <div key={patient.id} className={cn(
                    "rounded-2xl border-2 p-6 lg:p-8 shadow-lg",
                    isDarkMode ? "bg-slate-800/80 border-emerald-500/60" : "bg-card"
                  )} style={{ borderColor: deptColor || undefined }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "min-w-[7rem] h-28 rounded-2xl flex items-center justify-center text-5xl font-bold font-mono shadow-md px-4"
                        )} style={{
                          backgroundColor: deptColor || 'hsl(var(--primary))',
                          color: 'white'
                        }}>
                          {getTokenStr(patient)}
                        </div>
                        <div>
                          <h2 className={cn(
                            "text-3xl lg:text-4xl font-bold mb-1",
                            isDarkMode ? "text-white" : "text-foreground"
                          )}>
                            {patient.patient?.first_name} {patient.patient?.last_name}
                          </h2>
                          <p className={cn("text-lg", isDarkMode ? "text-slate-400" : "text-muted-foreground")}>
                            MR# {patient.patient?.patient_number}
                          </p>
                          {patient.opd_department && (
                            <Badge variant="outline" className="mt-2 font-mono text-sm"
                              style={{ borderColor: deptColor || undefined, color: deptColor || undefined }}>
                              {patient.opd_department.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {patient.doctor && (
                          <div className={cn("flex items-center gap-2 text-xl", isDarkMode ? "text-slate-300" : "text-foreground")}>
                            <Stethoscope className="h-5 w-5" />
                            <span>Dr. {patient.doctor.profile?.full_name}</span>
                          </div>
                        )}
                        {patient.doctor?.specialization && (
                          <p className={cn("text-base mt-1", isDarkMode ? "text-slate-500" : "text-muted-foreground")}>
                            {patient.doctor.specialization}
                          </p>
                        )}
                        <Badge className="mt-2 bg-success text-success-foreground">{t("opd.inConsultation")}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recently Completed */}
          {recentlyCompleted.length > 0 && (
            <div className="mt-4">
              <div className={cn(
                "text-base font-semibold flex items-center gap-2 mb-3 uppercase tracking-wide",
                isDarkMode ? "text-blue-400" : "text-primary"
              )}>
                <CheckCircle2 className="h-4 w-4" />
                {t("opd.recentlyCompleted")}
              </div>
              <div className="flex gap-3">
                {recentlyCompleted.map((patient) => (
                  <div key={patient.id} className={cn(
                    "rounded-xl border px-4 py-3 flex items-center gap-3 animate-in fade-in duration-500",
                    isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-success/5 border-success/20"
                  )}>
                    <CheckCircle2 className={cn("h-5 w-5", isDarkMode ? "text-emerald-400" : "text-success")} />
                    <span className="font-mono font-bold text-lg">
                      {formatTokenDisplay(patient.token_number, (patient as any).opd_department?.code)}
                    </span>
                    <span className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-muted-foreground")}>
                      {t("opd.consultationComplete")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Up Next - Sidebar */}
        <div className="space-y-3">
          <div className={cn(
            "text-lg font-semibold flex items-center gap-2 uppercase tracking-wide",
            isDarkMode ? "text-blue-400" : "text-primary"
          )}>
            <Clock className="h-4 w-4" />
            {t("opd.nextUp")}
          </div>
          
          <div className={cn(
            "rounded-2xl border h-[calc(100%-36px)] overflow-hidden",
            isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-card border-border shadow-sm"
          )}>
            <div className={cn(
              "divide-y h-full overflow-y-auto",
              isDarkMode ? "divide-slate-700" : "divide-border"
            )}>
              {upNext.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className={cn("text-lg", isDarkMode ? "text-slate-500" : "text-muted-foreground")}>
                    {t("opd.noPatientsWaiting")}
                  </p>
                </div>
              ) : (
                upNext.slice(0, 10).map((patient, index) => {
                  const priority = getPriorityColor(patient.priority);
                  const waitMinutes = patient.check_in_at 
                    ? differenceInMinutes(new Date(), new Date(patient.check_in_at))
                    : 0;
                  const deptColor = patient.opd_department?.color;

                  return (
                    <div key={patient.id} className={cn(
                      "p-3.5 flex items-center gap-3 transition-colors",
                      index === 0 && (isDarkMode ? "bg-blue-900/20" : "bg-primary/5")
                    )}>
                      <div className={cn(
                        "min-w-[3.5rem] h-14 rounded-xl flex items-center justify-center text-lg font-bold font-mono px-2"
                      )} style={{
                        backgroundColor: deptColor || (patient.priority > 0 ? undefined : 'hsl(var(--muted))'),
                        color: deptColor ? 'white' : undefined,
                      }}>
                        <span className={patient.priority > 0 && !deptColor ? cn(priority.bg, priority.text, "w-full h-full rounded-xl flex items-center justify-center") : ""}>
                          {getTokenStr(patient)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-base font-medium truncate",
                          isDarkMode ? "text-white" : "text-foreground"
                        )}>
                          {patient.patient?.first_name} {patient.patient?.last_name}
                        </p>
                        <div className={cn("flex items-center gap-2 text-xs", isDarkMode ? "text-slate-400" : "text-muted-foreground")}>
                          <Clock className="h-3 w-3" />
                          <span className={cn(
                            waitMinutes > 30 && "text-warning",
                            waitMinutes > 60 && "text-destructive"
                          )}>
                            {waitMinutes}m
                          </span>
                          {patient.opd_department && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono"
                              style={{ borderColor: deptColor || undefined, color: deptColor || undefined }}>
                              {patient.opd_department.code}
                            </Badge>
                          )}
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

      {/* Footer */}
      <div className={cn(
        "absolute bottom-4 left-6 right-6 flex items-center justify-center gap-8 text-sm",
        isDarkMode ? "text-slate-500" : "text-muted-foreground"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-warning" />
          <span>{t("opd.urgent" as any, "Urgent")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-destructive" />
          <span>{t("opd.emergency" as any, "Emergency")}</span>
        </div>
      </div>

      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default TokenKioskPage;
