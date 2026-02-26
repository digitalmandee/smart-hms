import { useEffect, useState, useRef, useMemo } from "react";
import { useTodayQueue } from "@/hooks/useAppointments";
import { useOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Clock, Users, Volume2, VolumeX, RefreshCw, Sun, Moon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTokenDisplay } from "@/lib/opd-token";
import { supabase } from "@/integrations/supabase/client";
import { OPDDepartmentSelector } from "@/components/opd/OPDDepartmentSelector";

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

const TOKENS_PER_PAGE = 12; // 4 cols x 3 rows

const TokenKioskPage = () => {
  const { profile } = useAuth();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  const { data: queue, refetch } = useTodayQueue(selectedDepartmentId);
  const { data: organization } = useOrganization(profile?.organization_id ?? undefined);
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<QueuePatient[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
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
      }, async (payload) => {
        refetch();
        // Track recently completed — re-fetch with joins for full data
        if (payload.eventType === 'UPDATE' && (payload.new as any).status === 'completed') {
          const completedId = (payload.new as any).id;
          try {
            const { data } = await supabase
              .from('appointments')
              .select(`
                id, token_number, priority, status, appointment_time, check_in_at,
                opd_department:opd_departments(code, name, color),
                patient:patients(first_name, last_name, patient_number),
                doctor:doctors(specialization, profile:profiles(full_name))
              `)
              .eq('id', completedId)
              .single();

            if (data) {
              setRecentlyCompleted(prev => {
                const updated = [data as any, ...prev.filter(p => p.id !== completedId)].slice(0, 3);
                return updated;
              });
              setTimeout(() => {
                setRecentlyCompleted(prev => prev.filter(p => p.id !== completedId));
              }, 120000);
            }
          } catch { /* ignore fetch errors */ }
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

  // Auto-pagination for Up Next grid
  const totalPages = Math.max(1, Math.ceil(upNext.length / TOKENS_PER_PAGE));

  // Reset page when queue changes
  useEffect(() => {
    setCurrentPage(0);
  }, [upNext.length]);

  // Auto-cycle pages every 8 seconds
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 8000);
    return () => clearInterval(interval);
  }, [totalPages]);

  const visibleUpNext = useMemo(() => {
    const start = currentPage * TOKENS_PER_PAGE;
    return upNext.slice(start, start + TOKENS_PER_PAGE);
  }, [upNext, currentPage]);

  const remainingCount = Math.max(0, upNext.length - (currentPage + 1) * TOKENS_PER_PAGE);

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
          <OPDDepartmentSelector
            value={selectedDepartmentId}
            onChange={setSelectedDepartmentId}
            showAllOption
            allOptionLabel={t("opd.allDepartments" as any, "All Departments")}
            placeholder={t("opd.allDepartments" as any, "All Departments")}
            showLabel={false}
            className="w-[180px]"
          />
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
        {/* Now Serving - Compact Left Column */}
        <div className="col-span-1 space-y-3 overflow-y-auto">
          <div className={cn(
            "text-lg font-semibold flex items-center gap-3 uppercase tracking-wide",
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
              "flex items-center justify-center h-40 rounded-2xl border-2 border-dashed",
              isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-card border-border"
            )}>
              <p className={cn("text-lg", isDarkMode ? "text-slate-500" : "text-muted-foreground")}>
                {t("opd.noPatientServing")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {nowServing.map((patient) => {
                const deptColor = patient.opd_department?.color;
                return (
                  <div key={patient.id} className={cn(
                    "rounded-2xl border-2 p-4 shadow-lg",
                    isDarkMode ? "bg-slate-800/80 border-emerald-500/60" : "bg-card"
                  )} style={{ borderColor: deptColor || undefined }}>
                    <div className={cn(
                      "w-full h-20 rounded-xl flex items-center justify-center text-4xl font-bold font-mono shadow-md mb-2"
                    )} style={{
                      backgroundColor: deptColor || 'hsl(var(--primary))',
                      color: 'white'
                    }}>
                      {getTokenStr(patient)}
                    </div>
                    {patient.doctor && (
                      <p className={cn(
                        "text-sm text-center truncate",
                        isDarkMode ? "text-slate-400" : "text-muted-foreground"
                      )}>
                        Dr. {patient.doctor.profile?.full_name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Recently Completed */}
          {recentlyCompleted.length > 0 && (
            <div className="mt-4">
              <div className={cn(
                "text-sm font-semibold flex items-center gap-2 mb-2 uppercase tracking-wide",
                isDarkMode ? "text-blue-400" : "text-primary"
              )}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("opd.recentlyCompleted")}
              </div>
              <div className="space-y-2">
                {recentlyCompleted.map((patient) => (
                  <div key={patient.id} className={cn(
                    "rounded-xl border px-3 py-2 flex items-center gap-2 animate-in fade-in duration-500",
                    isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-success/5 border-success/20"
                  )}>
                    <CheckCircle2 className={cn("h-4 w-4 shrink-0", isDarkMode ? "text-emerald-400" : "text-success")} />
                    <span className="font-mono font-bold text-base">
                      {formatTokenDisplay(patient.token_number, (patient as any).opd_department?.code)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Up Next - Large Right Panel (4-col grid) */}
        <div className="col-span-2 flex flex-col">
          <div className={cn(
            "text-lg font-semibold flex items-center gap-2 uppercase tracking-wide mb-3",
            isDarkMode ? "text-blue-400" : "text-primary"
          )}>
            <Clock className="h-4 w-4" />
            {t("opd.nextUp")}
            {upNext.length > 0 && (
              <span className={cn("text-sm font-normal ml-2", isDarkMode ? "text-slate-500" : "text-muted-foreground")}>
                ({upNext.length})
              </span>
            )}
          </div>
          
          <div className={cn(
            "rounded-2xl border flex-1 overflow-hidden flex flex-col",
            isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-card border-border shadow-sm"
          )}>
            {upNext.length === 0 ? (
              <div className="flex items-center justify-center flex-1">
                <p className={cn("text-lg", isDarkMode ? "text-slate-500" : "text-muted-foreground")}>
                  {t("opd.noPatientsWaiting")}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-3 p-4 flex-1 content-start">
                  {visibleUpNext.map((patient, index) => {
                    const deptColor = patient.opd_department?.color;
                    const isFirst = currentPage === 0 && index === 0;
                    return (
                      <div
                        key={patient.id}
                        className={cn(
                          "relative rounded-xl flex items-center justify-center h-20 transition-all",
                          isFirst
                            ? isDarkMode
                              ? "ring-2 ring-blue-400 shadow-lg"
                              : "ring-2 ring-primary shadow-lg"
                            : "",
                          isDarkMode ? "bg-slate-700/60" : "bg-muted/60"
                        )}
                        style={deptColor ? {
                          backgroundColor: `${deptColor}20`,
                          borderLeft: `4px solid ${deptColor}`,
                        } : undefined}
                      >
                        <span className={cn(
                          "text-2xl font-bold font-mono",
                          isDarkMode ? "text-white" : "text-foreground"
                        )}>
                          {getTokenStr(patient)}
                        </span>
                        {/* Priority dot */}
                        {patient.priority > 0 && (
                          <div className={cn(
                            "absolute top-1.5 right-1.5 w-3 h-3 rounded-full",
                            patient.priority >= 2 ? "bg-destructive" : "bg-warning"
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer: overflow count + page dots */}
                <div className={cn(
                  "px-4 py-3 border-t flex items-center justify-between",
                  isDarkMode ? "border-slate-700 bg-slate-800/80" : "border-border bg-muted/30"
                )}>
                  <div className={cn("text-sm font-medium", isDarkMode ? "text-slate-400" : "text-muted-foreground")}>
                    {remainingCount > 0 && (
                      <span>+{remainingCount} {t("opd.moreInQueue" as any, "more in queue")}</span>
                    )}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            i === currentPage
                              ? isDarkMode ? "bg-blue-400 w-4" : "bg-primary w-4"
                              : isDarkMode ? "bg-slate-600" : "bg-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer legend */}
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
