import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Users, RefreshCw, Monitor } from 'lucide-react';
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

export default function AppointmentQueuePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

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

  // Group appointments by status
  const inProgress = queue?.filter(a => a.status === 'in_progress') || [];
  const checkedIn = queue?.filter(a => a.status === 'checked_in') || [];
  const scheduled = queue?.filter(a => a.status === 'scheduled') || [];

  // Get current serving token per doctor
  const currentServing = inProgress.reduce((acc, appt) => {
    const doctorId = appt.doctor_id;
    if (doctorId && !acc[doctorId]) {
      acc[doctorId] = appt;
    }
    return acc;
  }, {} as Record<string, typeof inProgress[0]>);

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
        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Doctors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors?.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr. {doctor.profile?.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{queue?.length || 0} patients in queue</span>
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
                  onClick={() => navigate(`/app/appointments/${appointment.id}`)}
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
                    onClick={() => navigate(`/app/appointments/${appointment.id}`)}
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
                    onCheckIn={() => handleAction(appointment.id, 'checkIn')}
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
