import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { Users, Clock, RefreshCw, Maximize, Minimize, ArrowLeft, AlertTriangle, Volume2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTodayQueue } from '@/hooks/useAppointments';
import { useOrganization } from '@/hooks/useOrganizations';
import { useOPDDepartments } from '@/hooks/useOPDDepartments';
import { OPDDepartmentSelector } from '@/components/opd/OPDDepartmentSelector';
import { OPDTokenBadge } from '@/components/opd/OPDDepartmentBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { formatTokenDisplay } from '@/lib/opd-token';

const priorityConfig: Record<number, { bg: string; text: string; label: string; borderColor: string }> = {
  0: { bg: 'bg-success/10', text: 'text-success', label: 'Normal', borderColor: 'border-success/30' },
  1: { bg: 'bg-warning/10', text: 'text-warning', label: 'Urgent', borderColor: 'border-warning/50' },
  2: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Emergency', borderColor: 'border-destructive/50' },
};

export default function QueueDisplayPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  const { data: queue, refetch } = useTodayQueue(undefined, undefined, selectedDepartmentId);
  const { data: organization } = useOrganization(profile?.organization_id ?? undefined);
  const { data: departments } = useOPDDepartments();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const prevServingRef = useRef<string | null>(null);
  const [tokenChanged, setTokenChanged] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<any[]>([]);

  // Get selected department info
  const selectedDepartment = departments?.find(d => d.id === selectedDepartmentId);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time subscription for instant queue updates
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const channel = supabase
      .channel('queue-display-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `appointment_date=eq.${today}`,
      }, async (payload) => {
        refetch();
        // Track recently completed with full joins
        if (payload.eventType === 'UPDATE' && (payload.new as any).status === 'completed') {
          const completedId = (payload.new as any).id;
          try {
            const { data } = await supabase
              .from('appointments')
              .select(`
                id, token_number, status,
                opd_department:opd_departments(code, name, color),
                patient:patients(first_name, last_name, patient_number),
                doctor:doctors(specialization, profile:profiles(full_name))
              `)
              .eq('id', completedId)
              .single();

            if (data) {
              setRecentlyCompleted(prev => {
                const updated = [data as any, ...prev.filter((p: any) => p.id !== completedId)].slice(0, 3);
                return updated;
              });
              setTimeout(() => {
                setRecentlyCompleted(prev => prev.filter((p: any) => p.id !== completedId));
              }, 120000);
            }
          } catch { /* ignore */ }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Sort queue by priority (high first) then token number
  const sortedQueue = [...(queue || [])].sort((a, b) => {
    const priorityA = (a as any).priority || 0;
    const priorityB = (b as any).priority || 0;
    if (priorityB !== priorityA) return priorityB - priorityA;
    return (a.token_number || 0) - (b.token_number || 0);
  });

  // Get current serving (in_progress)
  const nowServing = sortedQueue.filter(a => a.status === 'in_progress');

  // Detect token change and play chime
  useEffect(() => {
    const currentServingId = nowServing[0]?.id || null;
    if (prevServingRef.current && currentServingId && currentServingId !== prevServingRef.current) {
      setTokenChanged(true);
      // Play chime sound
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
      setTimeout(() => setTokenChanged(false), 2000);
    }
    prevServingRef.current = currentServingId;
  }, [nowServing]);
  
  // Get waiting patients (checked_in), sorted by priority
  const waiting = sortedQueue.filter(a => a.status === 'checked_in');
  
  // Get emergency patients
  const emergencies = waiting.filter(a => (a as any).priority === 2);
  
  // Get next up (first 5 waiting, excluding emergencies shown separately)
  const nextUp = waiting.filter(a => (a as any).priority !== 2).slice(0, 5);

  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    window.history.back();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  };

  // Get token display with department code
  const getTokenDisplay = (appointment: any) => {
    const dept = appointment.opd_department;
    if (dept?.code) {
      return `${dept.code}-${String(appointment.token_number || 0).padStart(3, '0')}`;
    }
    return String(appointment.token_number || '-');
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-foreground">
            {selectedDepartment ? selectedDepartment.name : organization?.name || 'Patient Queue'}
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Department Filter */}
          {departments && departments.length > 0 && (
            <OPDDepartmentSelector
              value={selectedDepartmentId}
              onChange={setSelectedDepartmentId}
              showAllOption
              allOptionLabel="All OPD"
              showLabel={false}
              className="w-[180px]"
            />
          )}
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
          <Button variant="outline" onClick={handleExitFullscreen}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit
          </Button>
          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-3xl lg:text-4xl font-mono font-bold tabular-nums">
              {format(currentTime, 'HH:mm:ss')}
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Alert - Always at top if any */}
      {emergencies.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
            <h2 className="text-xl font-semibold text-destructive">{t("opd.emergencyPatients" as any, "Emergency Patients")}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {emergencies.map((appointment) => {
              const patient = appointment.patient;
              return (
                <Card key={appointment.id} className="border-2 border-destructive bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="min-w-[4rem] w-16 h-16 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center text-base font-bold font-mono animate-pulse px-1.5">
                        {getTokenDisplay(appointment)}
                      </div>
                      <div>
                        <p className="text-xl font-bold">
                          {patient?.first_name} {patient?.last_name}
                        </p>
                        <Badge variant="destructive" className="mt-1">EMERGENCY</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Now Serving Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
            </span>
            <h2 className="text-xl lg:text-2xl font-semibold">{t("opd.nowServing")}</h2>
          </div>

          {nowServing.length === 0 ? (
            <Card className="border-2 border-dashed border-muted">
              <CardContent className="py-12 lg:py-16 text-center">
                <div className="text-muted-foreground">
                  <Volume2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg lg:text-xl">No patient currently being served</p>
                  <p className="text-sm mt-1">Waiting for next patient...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {nowServing.map((appointment) => {
                const priority = (appointment as any).priority || 0;
                const priorityStyle = priorityConfig[priority];
                const patient = appointment.patient;
                const doctor = appointment.doctor;
                const dept = appointment.opd_department;
                
                return (
                  <Card 
                    key={appointment.id} 
                    className={cn(
                      "border-4 shadow-lg transition-all",
                      priorityStyle.bg
                    )}
                    style={{ borderColor: dept?.color || 'hsl(var(--primary))' }}
                  >
                    <CardContent className="py-6 lg:py-8 px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 lg:gap-6">
                          <div 
                            className={cn(
                              "min-w-[5rem] w-20 h-20 lg:min-w-[6rem] lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center text-xl lg:text-2xl font-bold font-mono shadow-md transition-transform px-2",
                              tokenChanged && "animate-pulse scale-110"
                            )}
                            style={{ 
                              backgroundColor: dept?.color || 'hsl(var(--primary))',
                              color: 'white'
                            }}
                          >
                            {getTokenDisplay(appointment)}
                          </div>
                          <div>
                            <p className="text-2xl lg:text-3xl font-bold">
                              {patient?.first_name} {patient?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {patient?.patient_number}
                            </p>
                            {doctor && (
                              <p className="text-lg text-muted-foreground mt-1">
                                Dr. {(doctor as any).profile?.full_name}
                              </p>
                            )}
                            {dept && (
                              <Badge 
                                variant="outline" 
                                className="mt-2 font-mono"
                                style={{ borderColor: dept.color || undefined, color: dept.color || undefined }}
                              >
                                {dept.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {priority > 0 && (
                          <Badge 
                            className={cn(
                              'text-base px-4 py-2',
                              priority === 2 ? 'bg-destructive' : 'bg-warning'
                            )}
                          >
                            {priority === 2 && <AlertTriangle className="h-4 w-4 mr-1" />}
                            {priorityStyle.label}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recently Completed */}
        {recentlyCompleted.length > 0 && (
          <div className="lg:col-span-2 mt-2">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {t("opd.recentlyCompleted")}
            </div>
            <div className="flex gap-3">
              {recentlyCompleted.map((patient: any) => (
                <div key={patient.id} className="rounded-xl border bg-success/5 border-success/20 px-4 py-3 flex items-center gap-3 animate-in fade-in duration-500">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="font-mono font-bold text-lg">
                    {formatTokenDisplay(patient.token_number, patient.opd_department?.code)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t("opd.consultationComplete")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl lg:text-2xl font-semibold">{t("opd.nextUp")}</h2>
            </div>
            <Badge variant="secondary" className="text-base">
              {waiting.length} {t("opd.waiting")}
            </Badge>
          </div>

          {nextUp.length === 0 ? (
            <Card className="border-2 border-dashed border-muted">
              <CardContent className="py-12 lg:py-16 text-center">
                <div className="text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg lg:text-xl">{t("opd.noPatientsWaitingQueue" as any, "No patients waiting")}</p>
                  <p className="text-sm mt-1">{t("opd.queueIsClear" as any, "Queue is clear")}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {nextUp.map((appointment, index) => {
                const priority = (appointment as any).priority || 0;
                const priorityStyle = priorityConfig[priority];
                const patient = appointment.patient;
                const dept = appointment.opd_department;
                
                return (
                  <Card
                    key={appointment.id}
                    className={cn(
                      'transition-all hover:shadow-md',
                      index === 0 && 'border-2 shadow-sm',
                      priority > 0 && priorityStyle.borderColor
                    )}
                    style={index === 0 ? { borderColor: dept?.color || 'hsl(var(--primary) / 0.5)' } : undefined}
                  >
                    <CardContent className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <div 
                          className={cn(
                            'min-w-[3.5rem] w-14 h-14 lg:min-w-[4rem] lg:w-16 lg:h-16 rounded-xl flex items-center justify-center text-base lg:text-lg font-bold font-mono transition-all px-1.5',
                            index === 0 ? 'scale-105' : ''
                          )}
                          style={{
                            backgroundColor: index === 0 
                              ? (dept?.color || 'hsl(var(--primary))') 
                              : 'hsl(var(--muted))',
                            color: index === 0 ? 'white' : 'hsl(var(--muted-foreground))'
                          }}
                        >
                          {getTokenDisplay(appointment)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg lg:text-xl font-semibold truncate">
                            {patient?.first_name} {patient?.last_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {patient?.patient_number}
                            </p>
                            {dept && !selectedDepartmentId && (
                              <Badge 
                                variant="outline" 
                                className="text-xs font-mono"
                                style={{ borderColor: dept.color || undefined, color: dept.color || undefined }}
                              >
                                {dept.code}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {priority > 0 && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'shrink-0',
                              priorityStyle.text,
                              priorityStyle.bg
                            )}
                          >
                            {priorityStyle.label}
                          </Badge>
                        )}
                        {index === 0 && (
                          <Badge variant="default" className="shrink-0">
                            {t("common.next")}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {waiting.length > 5 && (
                <div className="text-center py-3">
                  <Badge variant="outline" className="text-base px-4 py-1">
                    +{waiting.length - 5} {t("opd.moreInQueue" as any, "more in queue")}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-sm text-muted-foreground">
        {Object.entries(priorityConfig).map(([level, style]) => (
          <div key={level} className="flex items-center gap-2">
            <div className={cn(
              'w-4 h-4 rounded-full',
              level === '0' ? 'bg-success' : level === '1' ? 'bg-warning' : 'bg-destructive'
            )} />
            <span>{style.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
