import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';
import { Users, RefreshCw, Monitor, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useTodayQueue,
  useCheckInAppointment,
  useStartConsultation,
  useCompleteAppointment,
  useCancelAppointment,
  useMarkNoShow,
} from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileQueueView } from '@/components/mobile/MobileQueueView';
import { useTranslation } from '@/lib/i18n';


export default function AppointmentQueuePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { roles, profile } = useAuth();
  const { t, language } = useTranslation();
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  
  // Mobile detection
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;
  
  // Check if user is a doctor (not admin)
  const isDoctor = roles.includes('doctor') && !roles.some(r => 
    ['org_admin', 'branch_admin', 'super_admin'].includes(r)
  );

  const { data: queue, isLoading, refetch } = useTodayQueue(
    undefined,
    selectedDoctor !== 'all' ? selectedDoctor : undefined
  );
  const { data: doctors } = useDoctors();

  const checkIn = useCheckInAppointment();
  const startConsultation = useStartConsultation();
  const complete = useCompleteAppointment();
  const cancel = useCancelAppointment();
  const noShow = useMarkNoShow();

  // Real-time subscription for instant queue updates
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const channel = supabase
      .channel('queue-management-updates')
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

  const handleAction = async (
    appointmentId: string,
    action: 'checkIn' | 'start' | 'complete' | 'cancel' | 'noShow'
  ) => {
    try {
      switch (action) {
        case 'checkIn':
          await checkIn.mutateAsync(appointmentId);
          toast({ title: 'Patient checked in' });
          break;
        case 'start':
          await startConsultation.mutateAsync(appointmentId);
          toast({ title: 'Consultation started' });
          break;
        case 'complete':
          await complete.mutateAsync(appointmentId);
          toast({ title: 'Appointment completed' });
          break;
        case 'cancel':
          await cancel.mutateAsync(appointmentId);
          toast({ title: 'Appointment cancelled' });
          break;
        case 'noShow':
          await noShow.mutateAsync(appointmentId);
          toast({ title: 'Marked as no show' });
          break;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handle refresh for mobile
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Sort queue by priority (high first) then token
  const sortedQueue = [...(queue || [])].sort((a, b) => {
    const priorityA = (a as any).priority || 0;
    const priorityB = (b as any).priority || 0;
    if (priorityB !== priorityA) return priorityB - priorityA;
    return (a.token_number || 0) - (b.token_number || 0);
  });

  // Group appointments by status
  const inProgress = sortedQueue.filter(a => a.status === 'in_progress');
  const checkedIn = sortedQueue.filter(a => a.status === 'checked_in');
  const scheduled = sortedQueue.filter(a => a.status === 'scheduled');

  // Count by priority
  const emergencyCount = checkedIn.filter(a => (a as any).priority === 2).length;
  const urgentCount = checkedIn.filter(a => (a as any).priority === 1).length;

  // Get current serving token per doctor
  const currentServing = inProgress.reduce((acc, appt) => {
    const doctorId = appt.doctor_id;
    if (doctorId && !acc[doctorId]) {
      acc[doctorId] = appt;
    }
    return acc;
  }, {} as Record<string, typeof inProgress[0]>);

  // Mobile UI
  if (showMobileUI) {
    return (
      <MobileQueueView
        queue={(queue || []).map(a => ({
          ...a,
          priority: (a as any).priority,
        }))}
        doctors={doctors}
        selectedDoctor={selectedDoctor}
        onDoctorChange={setSelectedDoctor}
        onRefresh={handleRefresh}
        onAction={handleAction}
        isDoctor={isDoctor}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's Queue"
        description={format(new Date(), 'EEEE, MMMM d, yyyy')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Appointments', href: '/app/appointments' },
          { label: 'Queue' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/appointments/display')}>
              <Monitor className="h-4 w-4 mr-2" />
              Display Mode
            </Button>
          </div>
        }
      />

      {/* Doctor Filter */}
      <div className="flex items-center gap-4">
        <Select key={`doctor-${language}`} value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t('apptCal.allDoctors')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('apptCal.allDoctors')}</SelectItem>
            {doctors?.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr. {doctor.profile?.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{queue?.length || 0} patients in queue</span>
          </div>
          {emergencyCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {emergencyCount} Emergency
            </Badge>
          )}
          {urgentCount > 0 && (
            <Badge className="bg-yellow-500 flex items-center gap-1">
              {urgentCount} Urgent
            </Badge>
          )}
        </div>
      </div>

      {/* Current Serving Section */}
      {inProgress.length > 0 && (
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Now Serving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  variant="queue"
                  onComplete={() => handleAction(appointment.id, 'complete')}
                  onClick={() => {
                    if (isDoctor) {
                      navigate(`/app/opd/consultation/${appointment.id}`);
                    } else {
                      navigate(`/app/appointments/${appointment.id}`);
                    }
                  }}
                  showConsultButton={isDoctor}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Checked In - Waiting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Checked In ({checkedIn.length})</span>
              <span className="text-sm font-normal text-muted-foreground">
                Ready for consultation
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : checkedIn.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No patients waiting
              </p>
            ) : (
              <div className="space-y-3">
                {checkedIn.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="queue"
                    onStart={() => handleAction(appointment.id, 'start')}
                    onNoShow={() => handleAction(appointment.id, 'noShow')}
                    onClick={() => {
                      // Doctors go directly to consultation, others go to appointment details
                      if (isDoctor) {
                        navigate(`/app/opd/consultation/${appointment.id}`);
                      } else {
                        navigate(`/app/appointments/${appointment.id}`);
                      }
                    }}
                    showConsultButton={isDoctor}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled - Not Yet Arrived */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Scheduled ({scheduled.length})</span>
              <span className="text-sm font-normal text-muted-foreground">
                Not yet arrived
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : scheduled.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No upcoming appointments
              </p>
            ) : (
              <div className="space-y-3">
                {scheduled.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="queue"
                    onCheckIn={() => navigate(`/app/appointments/${appointment.id}/check-in`)}
                    onCancel={() => handleAction(appointment.id, 'cancel')}
                    onNoShow={() => handleAction(appointment.id, 'noShow')}
                    onClick={() => navigate(`/app/appointments/${appointment.id}`)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
