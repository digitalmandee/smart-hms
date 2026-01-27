import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Activity, 
  UserCheck, 
  Stethoscope, 
  Users, 
  RefreshCw,
  AlertTriangle,
  Search,
  Calendar,
  Clock,
  Hash,
  DollarSign
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useNursingQueue } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { PatientVitalsCard } from '@/components/nursing/PatientVitalsCard';
import { VitalsSummaryBadge } from '@/components/nursing/VitalsSummaryBadge';
import { QuickActionsPanel } from '@/components/nursing/QuickActionsPanel';
import { PaymentStatusBadge } from '@/components/radiology/PaymentStatusBadge';
import { generateVisitId } from '@/lib/visit-id';

const priorityLabels: Record<number, { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline' }> = {
  2: { label: 'Emergency', variant: 'destructive' },
  1: { label: 'Urgent', variant: 'default' },
  0: { label: 'Normal', variant: 'secondary' },
};

export default function NurseDashboard() {
  const navigate = useNavigate();
  const [patientSearch, setPatientSearch] = useState('');
  const { data: queue, isLoading, refetch } = useNursingQueue();
  const { data: patients, isLoading: patientsLoading } = usePatients(patientSearch);
  
  const showPatientResults = patientSearch.length >= 3;

  const awaitingVitals = queue?.awaitingVitals || [];
  const vitalsComplete = queue?.vitalsComplete || [];
  const inProgress = queue?.inProgress || [];
  const totalToday = awaitingVitals.length + vitalsComplete.length + inProgress.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nurse Station"
        description={`Today, ${format(new Date(), 'EEEE, MMMM d, yyyy')}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate('/app/appointments/queue')}>
              View Full Queue
            </Button>
          </div>
        }
      />

      {/* Quick Patient Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-5 w-5" />
            Quick Patient Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by MR#, name, or phone..." 
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {showPatientResults && (
            <div className="mt-3 border rounded-lg divide-y max-h-48 overflow-auto">
              {patientsLoading ? (
                <div className="p-3 text-center text-muted-foreground">Searching...</div>
              ) : patients && patients.length > 0 ? (
                patients.slice(0, 5).map((patient) => (
                  <div 
                    key={patient.id} 
                    className="p-3 flex items-center justify-between hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/app/patients/${patient.id}`)}
                  >
                    <div>
                      <p className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        MR# {patient.patient_number} • {patient.phone || 'No phone'}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/appointments/new?patientId=${patient.id}`);
                      }}
                    >
                      Book Appointment
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-muted-foreground">
                  No patients found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Awaiting Vitals"
          value={awaitingVitals.length}
          icon={Activity}
          variant="warning"
        />
        <StatsCard
          title="Vitals Complete"
          value={vitalsComplete.length}
          icon={UserCheck}
          variant="success"
        />
        <StatsCard
          title="In Consultation"
          value={inProgress.length}
          icon={Stethoscope}
          variant="info"
        />
        <StatsCard
          title="Total Today"
          value={totalToday}
          icon={Users}
          variant="default"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Awaiting Vitals */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Activity className="h-5 w-5" />
              Awaiting Vitals
              {awaitingVitals.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {awaitingVitals.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : awaitingVitals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <UserCheck className="h-8 w-8 mb-2" />
                  <p className="text-sm">All patients have vitals recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {awaitingVitals.map((appointment) => (
                    <PatientVitalsCard
                      key={appointment.id}
                      appointment={appointment}
                      onRecordVitals={() => navigate(`/app/appointments/${appointment.id}/check-in`)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Column 2: Vitals Complete */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-5 w-5" />
              Ready for Doctor
              {vitalsComplete.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {vitalsComplete.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : vitalsComplete.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2" />
                  <p className="text-sm">No patients ready yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vitalsComplete.map((appointment) => {
                    const visitId = generateVisitId({
                      appointment_date: appointment.appointment_date,
                      token_number: appointment.token_number,
                    });
                    
                    return (
                      <Card key={appointment.id} className="p-3 border-l-4 border-l-green-500">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">#{appointment.token_number}</span>
                              <Badge variant={priorityLabels[appointment.priority || 0]?.variant || 'secondary'}>
                                {priorityLabels[appointment.priority || 0]?.label || 'Normal'}
                              </Badge>
                            </div>
                            <p className="font-medium">
                              {appointment.patient?.first_name} {appointment.patient?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.patient?.patient_number}
                            </p>
                            {/* Visit ID */}
                          <div className="flex items-center gap-1 mt-1">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-mono text-muted-foreground">{visitId}</span>
                            {/* Payment Status for non-paid */}
                            {appointment.payment_status && appointment.payment_status !== 'paid' && (
                              <PaymentStatusBadge status={appointment.payment_status} compact showIcon={false} />
                            )}
                          </div>
                          </div>
                          <VitalsSummaryBadge vitals={appointment.check_in_vitals} />
                        </div>
                        {appointment.chief_complaint && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{appointment.chief_complaint}"
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Column 3: Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActionsPanel />
          </CardContent>
        </Card>
      </div>

      {/* Active Consultations Strip */}
      {inProgress.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Stethoscope className="h-5 w-5" />
              Active Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {inProgress.map((appointment) => (
                <Card key={appointment.id} className="min-w-[200px] p-4 bg-blue-50 dark:bg-blue-950 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="font-bold text-blue-600">#{appointment.token_number}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dr. {appointment.doctor?.profile?.full_name}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
