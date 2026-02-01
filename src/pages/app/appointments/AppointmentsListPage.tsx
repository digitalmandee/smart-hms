import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { StatsCard } from '@/components/StatsCard';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppointments, useAppointmentStats } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import { ColumnDef } from '@tanstack/react-table';
import { Database } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Capacitor } from '@capacitor/core';
import { MobileStatsCard } from '@/components/mobile/MobileStatsCard';
import { MobileAppointmentCard } from '@/components/mobile/MobileAppointmentCard';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { useQueryClient } from '@tanstack/react-query';

type AppointmentStatus = Database['public']['Enums']['appointment_status'];

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

export default function AppointmentsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');

  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  const { data: appointments, isLoading } = useAppointments({
    date: dateFilter || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    doctorId: doctorFilter !== 'all' ? doctorFilter : undefined,
  });

  const { data: stats } = useAppointmentStats();
  const { data: doctors } = useDoctors();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'token_number',
      header: 'Token',
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          #{row.original.token_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'patient',
      header: 'Patient',
      cell: ({ row }) => {
        const patient = row.original.patient;
        return (
          <div>
            <p className="font-medium">
              {patient?.first_name} {patient?.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {patient?.patient_number}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'appointment_time',
      header: 'Time',
      cell: ({ row }) => {
        const time = row.original.appointment_time;
        if (!time) return '--:--';
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
      },
    },
    {
      accessorKey: 'doctor',
      header: 'Doctor',
      cell: ({ row }) => {
        const doctor = row.original.doctor;
        return doctor ? (
          <div>
            <p className="font-medium">Dr. {doctor.profile?.full_name}</p>
            {doctor.specialization && (
              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
            )}
          </div>
        ) : '-';
      },
    },
    {
      accessorKey: 'appointment_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.appointment_type;
        const typeLabels: Record<string, string> = {
          walk_in: 'Walk-in',
          scheduled: 'Scheduled',
          follow_up: 'Follow-up',
        };
        return (
          <Badge variant="outline">
            {typeLabels[type] || type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || 'scheduled';
        return (
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'chief_complaint',
      header: 'Chief Complaint',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {row.original.chief_complaint || '-'}
        </span>
      ),
    },
  ];

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    await queryClient.invalidateQueries({ queryKey: ['appointment-stats'] });
  };

  // Mobile View
  if (showMobileUI) {
    return (
      <PullToRefresh onRefresh={handleRefresh} className="min-h-full bg-background">
        <div className="px-4 py-4 space-y-4 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Appointments</h1>
              <p className="text-sm text-muted-foreground">{format(new Date(dateFilter), 'EEEE, MMM d')}</p>
            </div>
            <Button size="sm" onClick={() => navigate('/app/appointments/new')}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>

          {/* Stats Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <MobileStatsCard
              title="Today"
              value={stats?.todayCount || 0}
              icon={<Calendar className="h-4 w-4" />}
            />
            <MobileStatsCard
              title="Waiting"
              value={stats?.scheduled || 0}
              icon={<Clock className="h-4 w-4" />}
            />
            <MobileStatsCard
              title="Completed"
              value={stats?.completed || 0}
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <MobileStatsCard
              title="Cancelled"
              value={stats?.cancelled || 0}
              icon={<XCircle className="h-4 w-4" />}
            />
          </div>

          {/* Quick Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {[
              { value: 'all', label: 'All' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'checked_in', label: 'Checked In' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ].map((filter) => (
              <Badge
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                className="whitespace-nowrap cursor-pointer touch-manipulation active:scale-95 transition-transform px-3 py-1.5"
                onClick={() => setStatusFilter(filter.value as any)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>

          {/* Appointment List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : appointments?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card border rounded-xl">
              <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments?.map((apt: any) => (
                <MobileAppointmentCard
                  key={apt.id}
                  id={apt.id}
                  patientName={`${apt.patient?.first_name || ''} ${apt.patient?.last_name || ''}`}
                  patientNumber={apt.patient?.patient_number}
                  time={apt.appointment_time || ''}
                  status={apt.status || 'scheduled'}
                  appointmentType={apt.appointment_type}
                  tokenNumber={apt.token_number}
                  chiefComplaint={apt.chief_complaint}
                  doctorName={apt.doctor?.profile?.full_name}
                  onClick={() => navigate(`/app/appointments/${apt.id}`)}
                />
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate('/app/appointments/queue')}
            >
              <Users className="h-4 w-4 mr-2" />
              View Queue
            </Button>
          </div>
        </div>
      </PullToRefresh>
    );
  }

  // Desktop View
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage patient appointments and scheduling"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Appointments' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/app/appointments/queue')}>
              <Users className="h-4 w-4 mr-2" />
              Queue
            </Button>
            <Button onClick={() => navigate('/app/appointments/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Today's Appointments"
          value={stats?.todayCount || 0}
          icon={Calendar}
        />
        <StatsCard
          title="Waiting"
          value={stats?.scheduled || 0}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Completed"
          value={stats?.completed || 0}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Cancelled"
          value={stats?.cancelled || 0}
          icon={XCircle}
          variant="warning"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-40">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger className="w-48">
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
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={appointments || []}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/app/appointments/${row.id}`)}
        searchKey="patient"
        searchPlaceholder="Search patients..."
      />
    </div>
  );
}
