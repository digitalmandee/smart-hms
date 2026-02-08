import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Users, Clock, RefreshCw, Maximize, Minimize, ArrowLeft, AlertTriangle, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTodayQueue } from '@/hooks/useAppointments';
import { useOrganization } from '@/hooks/useOrganizations';
import { useOPDDepartments } from '@/hooks/useOPDDepartments';
import { OPDDepartmentSelector } from '@/components/opd/OPDDepartmentSelector';
import { OPDTokenBadge } from '@/components/opd/OPDDepartmentBadge';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const priorityConfig: Record<number, { bg: string; text: string; label: string; borderColor: string }> = {
  0: { bg: 'bg-success/10', text: 'text-success', label: 'Normal', borderColor: 'border-success/30' },
  1: { bg: 'bg-warning/10', text: 'text-warning', label: 'Urgent', borderColor: 'border-warning/50' },
  2: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Emergency', borderColor: 'border-destructive/50' },
};

export default function QueueDisplayPage() {
  const { profile } = useAuth();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  const { data: queue, refetch } = useTodayQueue(undefined, undefined, selectedDepartmentId);
  const { data: organization } = useOrganization(profile?.organization_id ?? undefined);
  const { data: departments } = useOPDDepartments();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        event: 'UPDATE',
        schema: 'public',
        table: 'appointments',
        filter: `appointment_date=eq.${today}`,
      }, () => {
        refetch();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'appointments',
        filter: `appointment_date=eq.${today}`,
      }, () => {
        refetch();
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
            <h2 className="text-xl font-semibold text-destructive">Emergency Patients</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {emergencies.map((appointment) => {
              const patient = appointment.patient;
              return (
                <Card key={appointment.id} className="border-2 border-destructive bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xl font-bold font-mono animate-pulse">
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
            <h2 className="text-xl lg:text-2xl font-semibold">Now Serving</h2>
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
                            className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-bold font-mono shadow-md"
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

        {/* Next Up Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl lg:text-2xl font-semibold">Next Up</h2>
            </div>
            <Badge variant="secondary" className="text-base">
              {waiting.length} waiting
            </Badge>
          </div>

          {nextUp.length === 0 ? (
            <Card className="border-2 border-dashed border-muted">
              <CardContent className="py-12 lg:py-16 text-center">
                <div className="text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg lg:text-xl">No patients waiting</p>
                  <p className="text-sm mt-1">Queue is clear</p>
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
                            'w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-lg lg:text-xl font-bold font-mono transition-all',
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
                            Next
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
                    +{waiting.length - 5} more in queue
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
