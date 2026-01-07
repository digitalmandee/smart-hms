import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Users, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTodayQueue } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';

const priorityColors: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: 'bg-green-500', text: 'text-green-500', label: 'Normal' },
  1: { bg: 'bg-yellow-500', text: 'text-yellow-500', label: 'Urgent' },
  2: { bg: 'bg-red-500', text: 'text-red-500', label: 'Emergency' },
};

export default function QueueDisplayPage() {
  const { data: queue, refetch } = useTodayQueue();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh queue every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(timer);
  }, [refetch]);

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
  
  // Get next up (first 5 waiting)
  const nextUp = waiting.slice(0, 5);

  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    window.history.back();
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">Patient Queue</h1>
          <p className="text-xl text-muted-foreground mt-2">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="text-right flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button variant="outline" onClick={enterFullscreen}>
            Fullscreen
          </Button>
          <Button variant="outline" onClick={handleExitFullscreen}>
            Exit Display
          </Button>
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <span className="text-4xl lg:text-5xl font-mono font-bold">
              {format(currentTime, 'HH:mm:ss')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Now Serving Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
            </span>
            <h2 className="text-2xl lg:text-3xl font-semibold">Now Serving</h2>
          </div>

          {nowServing.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                <p className="text-2xl">No patient currently being served</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {nowServing.map((appointment) => {
                const priority = (appointment as any).priority || 0;
                const priorityStyle = priorityColors[priority];
                const patient = appointment.patient;
                const doctor = appointment.doctor;
                
                return (
                  <Card key={appointment.id} className="border-4 border-primary bg-primary/5">
                    <CardContent className="py-8 px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold">
                            {appointment.token_number || '-'}
                          </div>
                          <div>
                            <p className="text-3xl font-semibold">
                              {patient?.first_name} {patient?.last_name}
                            </p>
                            {doctor && (
                              <p className="text-xl text-muted-foreground mt-1">
                                Dr. {(doctor as any).profile?.full_name}
                              </p>
                            )}
                          </div>
                        </div>
                        {priority > 0 && (
                          <Badge className={cn('text-lg px-4 py-2', priorityStyle.bg)}>
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
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl lg:text-3xl font-semibold">
              Next Up ({waiting.length} waiting)
            </h2>
          </div>

          {nextUp.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                <p className="text-2xl">No patients waiting</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {nextUp.map((appointment, index) => {
                const priority = (appointment as any).priority || 0;
                const priorityStyle = priorityColors[priority];
                const patient = appointment.patient;
                
                return (
                  <Card
                    key={appointment.id}
                    className={cn(
                      'transition-all',
                      index === 0 && 'border-2 border-primary/50'
                    )}
                  >
                    <CardContent className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold',
                          index === 0 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {appointment.token_number || '-'}
                        </div>
                        <div className="flex-1">
                          <p className="text-xl font-medium">
                            {patient?.first_name} {patient?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient?.patient_number}
                          </p>
                        </div>
                        {priority > 0 && (
                          <div className={cn('w-3 h-3 rounded-full', priorityStyle.bg)} 
                               title={priorityStyle.label} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {waiting.length > 5 && (
                <p className="text-center text-muted-foreground py-2">
                  +{waiting.length - 5} more waiting
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        {Object.entries(priorityColors).map(([level, style]) => (
          <div key={level} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', style.bg)} />
            <span>{style.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
