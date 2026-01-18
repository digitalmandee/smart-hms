import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctors } from "@/hooks/useDoctors";
import { exportToCSV, formatDate, formatDateTime } from "@/lib/exportUtils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Calendar, Users, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

const STATUS_COLORS: Record<string, string> = {
  completed: '#22c55e',
  checked_in: '#3b82f6',
  in_progress: '#f59e0b',
  scheduled: '#6b7280',
  cancelled: '#ef4444',
  no_show: '#dc2626',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  checked_in: 'Checked In',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export default function AppointmentReportsPage() {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: doctors } = useDoctors();

  // Fetch appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointment-reports', profile?.branch_id, dateRange],
    queryFn: async () => {
      if (!profile?.branch_id) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, token_number, appointment_date, appointment_time, status, 
          appointment_type, priority, check_in_at, created_at,
          doctor_id, patient_id,
          patients:patient_id (first_name, last_name, patient_number, phone),
          doctors:doctor_id (id, profile:profile_id (full_name), specialization)
        `)
        .eq('branch_id', profile.branch_id)
        .gte('appointment_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('appointment_date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.branch_id,
  });

  // Filter data
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(apt => {
      if (selectedDoctor !== 'all' && apt.doctor_id !== selectedDoctor) return false;
      if (selectedStatus !== 'all' && apt.status !== selectedStatus) return false;
      return true;
    });
  }, [appointments, selectedDoctor, selectedStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(a => a.status === 'completed').length;
    const noShows = filteredAppointments.filter(a => a.status === 'no_show').length;
    const cancelled = filteredAppointments.filter(a => a.status === 'cancelled').length;
    const walkIns = filteredAppointments.filter(a => a.appointment_type === 'walk_in').length;
    const scheduled = filteredAppointments.filter(a => a.appointment_type === 'scheduled').length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    return { total, completed, noShows, cancelled, walkIns, scheduled, completionRate };
  }, [filteredAppointments]);

  // Daily appointments chart
  const dailyData = useMemo(() => {
    if (!filteredAppointments.length) return [];
    
    const byDate: Record<string, { completed: number; noShow: number; other: number }> = {};
    filteredAppointments.forEach(apt => {
      const date = apt.appointment_date;
      if (!byDate[date]) byDate[date] = { completed: 0, noShow: 0, other: 0 };
      
      if (apt.status === 'completed') byDate[date].completed++;
      else if (apt.status === 'no_show') byDate[date].noShow++;
      else byDate[date].other++;
    });

    return Object.entries(byDate)
      .map(([date, data]) => ({ 
        date: format(parseISO(date), 'MMM dd'), 
        ...data,
        total: data.completed + data.noShow + data.other
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredAppointments]);

  // Status breakdown
  const statusData = useMemo(() => {
    if (!filteredAppointments.length) return [];
    
    const byStatus: Record<string, number> = {};
    filteredAppointments.forEach(apt => {
      const status = apt.status || 'scheduled';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    return Object.entries(byStatus).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || '#6b7280'
    }));
  }, [filteredAppointments]);

  // Appointment type breakdown
  const typeData = useMemo(() => {
    return [
      { name: 'Walk-in', value: stats.walkIns, color: '#3b82f6' },
      { name: 'Scheduled', value: stats.scheduled, color: '#22c55e' },
    ].filter(d => d.value > 0);
  }, [stats]);

  // No-show patients list
  const noShowPatients = useMemo(() => {
    return filteredAppointments
      .filter(a => a.status === 'no_show')
      .map(a => ({
        id: a.id,
        patient: `${(a.patients as any)?.first_name} ${(a.patients as any)?.last_name}`,
        phone: (a.patients as any)?.phone,
        doctor: `Dr. ${(a.doctors as any)?.profile?.full_name}`,
        date: a.appointment_date,
        time: a.appointment_time,
      }));
  }, [filteredAppointments]);

  const handleExportCSV = () => {
    const data = filteredAppointments.map(a => ({
      date: formatDate(a.appointment_date),
      time: a.appointment_time || 'Walk-in',
      token: a.token_number,
      patient: `${(a.patients as any)?.first_name} ${(a.patients as any)?.last_name}`,
      mrNumber: (a.patients as any)?.patient_number,
      doctor: `Dr. ${(a.doctors as any)?.profile?.full_name}`,
      type: a.appointment_type,
      status: a.status,
      checkInAt: a.check_in_at ? formatDateTime(a.check_in_at) : '-',
    }));

    exportToCSV(data, `appointments-${format(new Date(), 'yyyy-MM-dd')}`, [
      { key: 'date', header: 'Date' },
      { key: 'time', header: 'Time' },
      { key: 'token', header: 'Token' },
      { key: 'patient', header: 'Patient' },
      { key: 'mrNumber', header: 'MR#' },
      { key: 'doctor', header: 'Doctor' },
      { key: 'type', header: 'Type' },
      { key: 'status', header: 'Status' },
      { key: 'checkInAt', header: 'Check-in Time' },
    ]);
  };

  const doctorOptions = doctors?.map(d => ({
    value: d.id,
    label: `Dr. ${d.profile?.full_name || 'Unknown'}`
  })) || [];

  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  return (
    <div className="space-y-6" ref={printRef}>
      <PageHeader
        title="Appointment Reports"
        description="OPD appointments, no-shows, and trends"
        breadcrumbs={[
          { label: "Appointments", href: "/app/appointments" },
          { label: "Reports" }
        ]}
      />

      {/* Filters */}
      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showDoctorFilter
        doctors={doctorOptions}
        selectedDoctor={selectedDoctor}
        onDoctorChange={setSelectedDoctor}
        showStatusFilter
        statusOptions={statusOptions}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
        isLoading={isLoading}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">{stats.completionRate}% rate</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Shows</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-amber-600">{stats.noShows}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Walk-in vs Scheduled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-lg font-bold">{stats.walkIns} / {stats.scheduled}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Daily Trends</TabsTrigger>
          <TabsTrigger value="status">Status Breakdown</TabsTrigger>
          <TabsTrigger value="noshows">No-Show Report</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Trends</CardTitle>
              <CardDescription>Daily appointment volume and outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                    <Bar dataKey="noShow" stackId="a" fill="#f59e0b" name="No Show" />
                    <Bar dataKey="other" stackId="a" fill="#6b7280" name="Other" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No data for selected period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-12 text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Types</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : typeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-12 text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="noshows">
          <Card>
            <CardHeader>
              <CardTitle>No-Show Patients</CardTitle>
              <CardDescription>Patients who missed their appointments - follow up required</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : noShowPatients.length > 0 ? (
                <div className="space-y-2">
                  {noShowPatients.map(patient => (
                    <div key={patient.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{patient.patient}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.doctor} • {formatDate(patient.date)} {patient.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">No Show</Badge>
                        {patient.phone && (
                          <p className="text-sm text-muted-foreground mt-1">{patient.phone}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No no-shows in selected period 🎉</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
