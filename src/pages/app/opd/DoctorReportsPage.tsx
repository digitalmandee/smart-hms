import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { exportToCSV, formatCurrency } from "@/lib/exportUtils";
import { Stethoscope, Users, Clock, TrendingUp } from "lucide-react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444'];

export default function DoctorReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");

  // Fetch branches for filter
  const { data: branches = [] } = useQuery({
    queryKey: ['branches-filter'],
    queryFn: async () => {
      const { data } = await supabase.from('branches').select('id, name').eq('is_active', true);
      return data || [];
    }
  });

  // Fetch doctors with profiles for names
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors-filter-with-profiles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('doctors')
        .select('id, specialization, consultation_fee, profile_id')
        .eq('is_available', true);
      
      if (!data || data.length === 0) return [];
      
      // Fetch profiles for doctor names
      const profileIds = data.map(d => d.profile_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', profileIds);
      
      return data.map(d => ({
        ...d,
        name: profiles?.find(p => p.id === d.profile_id)?.full_name || 'Unknown Doctor'
      }));
    }
  });

  // Fetch consultations data
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['doctor-consultations-report', dateRange, selectedBranch, selectedDoctor],
    queryFn: async () => {
      let query = supabase
        .from('consultations')
        .select('id, created_at, doctor_id, branch_id')
        .gte('created_at', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('created_at', format(dateRange.to, 'yyyy-MM-dd') + 'T23:59:59');

      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }
      if (selectedDoctor) {
        query = query.eq('doctor_id', selectedDoctor);
      }

      const { data } = await query;
      return data || [];
    }
  });

  // Calculate doctor performance metrics
  const doctorPerformance = useMemo(() => {
    const doctorMap = new Map<string, {
      name: string;
      specialty: string;
      patients: number;
      revenue: number;
    }>();

    consultations.forEach((c) => {
      const doctor = doctors.find(d => d.id === c.doctor_id);
      if (!doctor) return;
      
      const existing = doctorMap.get(c.doctor_id) || {
        name: `Dr. ${doctor.name}`,
        specialty: doctor.specialization || 'General',
        patients: 0,
        revenue: 0
      };

      existing.patients++;
      existing.revenue += doctor.consultation_fee || 0;

      doctorMap.set(c.doctor_id, existing);
    });

    return Array.from(doctorMap.values()).sort((a, b) => b.patients - a.patients);
  }, [consultations, doctors]);

  // Revenue by doctor for pie chart
  const revenueByDoctor = useMemo(() => {
    return doctorPerformance.map(d => ({
      name: d.name,
      value: d.revenue
    }));
  }, [doctorPerformance]);

  // Daily consultation trends
  const dailyTrends = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayConsultations = consultations.filter((c) => 
        c.created_at?.startsWith(dayStr)
      );
      
      // Calculate revenue based on doctor fees
      let revenue = 0;
      dayConsultations.forEach(c => {
        const doctor = doctors.find(d => d.id === c.doctor_id);
        revenue += doctor?.consultation_fee || 0;
      });
      
      return {
        date: format(day, 'MMM dd'),
        consultations: dayConsultations.length,
        revenue
      };
    });
  }, [consultations, dateRange, doctors]);

  // Specialty distribution
  const specialtyDistribution = useMemo(() => {
    const specialtyMap = new Map<string, number>();
    consultations.forEach((c) => {
      const doctor = doctors.find(d => d.id === c.doctor_id);
      const specialty = doctor?.specialization || 'General';
      specialtyMap.set(specialty, (specialtyMap.get(specialty) || 0) + 1);
    });
    return Array.from(specialtyMap.entries()).map(([name, value]) => ({ name, value }));
  }, [consultations, doctors]);

  // Summary stats
  const totalPatients = consultations.length;
  const totalRevenue = doctorPerformance.reduce((sum, d) => sum + d.revenue, 0);
  const activeDoctors = doctorPerformance.length;
  const avgPatientsPerDoctor = activeDoctors > 0 ? Math.round(totalPatients / activeDoctors) : 0;

  const handleExportCSV = () => {
    exportToCSV(doctorPerformance, `doctor-report-${format(dateRange.from, 'yyyy-MM-dd')}`, [
      { key: 'name', header: 'Doctor' },
      { key: 'specialty', header: 'Specialty' },
      { key: 'patients', header: 'Patients Seen' },
      { key: 'revenue', header: 'Revenue', format: formatCurrency }
    ]);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Doctor Reports</h1>
        <p className="text-muted-foreground">Performance analysis and workload distribution</p>
      </div>

      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showBranchFilter
        branchOptions={branches.map(b => ({ value: b.id, label: b.name }))}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        showDoctorFilter
        doctorOptions={doctors.map(d => ({ value: d.id, label: `Dr. ${d.name}` }))}
        selectedDoctor={selectedDoctor}
        onDoctorChange={setSelectedDoctor}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Stethoscope className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Doctors</p>
                <p className="text-2xl font-bold">{activeDoctors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Patients/Doctor</p>
                <p className="text-2xl font-bold">{avgPatientsPerDoctor}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Consultation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="consultations" stroke="hsl(var(--primary))" name="Consultations" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue (Rs.)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Doctor */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByDoctor}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ').pop()} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueByDoctor.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Doctor Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Doctor</th>
                  <th className="text-left py-3 px-4 font-medium">Specialty</th>
                  <th className="text-right py-3 px-4 font-medium">Patients</th>
                  <th className="text-right py-3 px-4 font-medium">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium">Avg/Patient</th>
                </tr>
              </thead>
              <tbody>
                {doctorPerformance.map((doctor, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{doctor.name}</td>
                    <td className="py-3 px-4">{doctor.specialty}</td>
                    <td className="py-3 px-4 text-right">{doctor.patients}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(doctor.revenue)}</td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(doctor.patients > 0 ? doctor.revenue / doctor.patients : 0)}
                    </td>
                  </tr>
                ))}
                {doctorPerformance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No data available for selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Specialty Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Consultations by Specialty</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={specialtyDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" width={120} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" name="Consultations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
