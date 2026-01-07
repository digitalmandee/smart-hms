import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAppointment,
  useCheckInAppointment,
  useStartConsultation,
  useCompleteAppointment,
  useCancelAppointment,
  useMarkNoShow,
} from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useState } from 'react';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  checked_in: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  in_progress: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  no_show: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  checked_in: 'Checked In',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: appointment, isLoading } = useAppointment(id || '');
  const checkIn = useCheckInAppointment();
  const startConsultation = useStartConsultation();
  const complete = useCompleteAppointment();
  const cancel = useCancelAppointment();
  const noShow = useMarkNoShow();

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleAction = async (action: 'checkIn' | 'start' | 'complete' | 'noShow') => {
    if (!id) return;

    try {
      switch (action) {
        case 'checkIn':
          await checkIn.mutateAsync(id);
          toast({ title: 'Patient checked in successfully' });
          break;
        case 'start':
          await startConsultation.mutateAsync(id);
          toast({ title: 'Consultation started' });
          break;
        case 'complete':
          await complete.mutateAsync(id);
          toast({ title: 'Appointment completed' });
          break;
        case 'noShow':
          await noShow.mutateAsync(id);
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

  const handleCancel = async () => {
    if (!id) return;

    try {
      await cancel.mutateAsync(id);
      toast({ title: 'Appointment cancelled' });
      setCancelDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Appointment not found</h2>
        <Button className="mt-4" onClick={() => navigate('/app/appointments')}>
          Back to Appointments
        </Button>
      </div>
    );
  }

  const status = appointment.status || 'scheduled';
  const patient = appointment.patient;
  const doctor = appointment.doctor;
  const branch = appointment.branch;

  const renderActionButtons = () => {
    switch (status) {
      case 'scheduled':
        return (
          <>
            <Button onClick={() => handleAction('checkIn')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Check In
            </Button>
            <Button variant="outline" onClick={() => handleAction('noShow')}>
              <AlertCircle className="h-4 w-4 mr-2" />
              No Show
            </Button>
            <Button variant="destructive" onClick={() => setCancelDialogOpen(true)}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        );
      case 'checked_in':
        return (
          <>
            <Button onClick={() => handleAction('start')}>
              <Play className="h-4 w-4 mr-2" />
              Start Consultation
            </Button>
            <Button variant="outline" onClick={() => handleAction('noShow')}>
              <AlertCircle className="h-4 w-4 mr-2" />
              No Show
            </Button>
          </>
        );
      case 'in_progress':
        return (
          <Button onClick={() => handleAction('complete')}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Appointment #${appointment.token_number || '-'}`}
        description={`${format(new Date(appointment.appointment_date), 'MMMM d, yyyy')} at ${formatTime(appointment.appointment_time)}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Appointments', href: '/app/appointments' },
          { label: `#${appointment.token_number || id?.slice(0, 8)}` },
        ]}
        actions={
          <div className="flex gap-2">
            {status === 'scheduled' && (
              <Button variant="outline" onClick={() => navigate(`/app/appointments/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {renderActionButtons()}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {patient?.first_name} {patient?.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {patient?.patient_number}
                </p>
              </div>
            </div>

            <div className="grid gap-3 pt-4 border-t">
              {patient?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {patient.phone}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate(`/app/patients/${patient?.id}`)}
            >
              View Patient Profile
            </Button>
          </CardContent>
        </Card>

        {/* Appointment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Token Number</span>
              <span className="font-mono font-bold text-lg">
                #{appointment.token_number || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span>{format(new Date(appointment.appointment_date), 'MMMM d, yyyy')}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Time</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(appointment.appointment_time)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline">
                {appointment.appointment_type === 'walk_in'
                  ? 'Walk-in'
                  : appointment.appointment_type === 'follow_up'
                  ? 'Follow-up'
                  : 'Scheduled'}
              </Badge>
            </div>

            {doctor && (
              <div className="pt-4 border-t">
                <span className="text-sm text-muted-foreground">Doctor</span>
                <p className="font-medium mt-1">Dr. {doctor.profile?.full_name}</p>
                {doctor.specialization && (
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                )}
              </div>
            )}

            {branch && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {branch.name}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chief Complaint */}
        {appointment.chief_complaint && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Chief Complaint</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{appointment.chief_complaint}</p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {appointment.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{appointment.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Cancel Appointment"
        onConfirm={handleCancel}
        variant="destructive"
      />
    </div>
  );
}
