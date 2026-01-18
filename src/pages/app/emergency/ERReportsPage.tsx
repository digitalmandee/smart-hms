import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInMinutes } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { exportToCSV, formatDateTime } from "@/lib/exportUtils";
import { Siren, Clock, Users, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
const TRIAGE_COLORS: Record<number, string> = {
  1: '#ef4444', // Resuscitation - Red
  2: '#f97316', // Emergent - Orange
  3: '#eab308', // Urgent - Yellow
  4: '#22c55e', // Less Urgent - Green
  5: '#3b82f6', // Non-Urgent - Blue
};

type ERStatus = 'absconded' | 'admitted' | 'discharged' | 'expired' | 'in_treatment' | 'in_triage' | 'lama' | 'transferred' | 'waiting';

export default function ERReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Fetch branches for filter
  const { data: branches = [] } = useQuery({
    queryKey: ['branches-filter'],
    queryFn: async () => {
      const { data } = await supabase.from('branches').select('id, name').eq('is_active', true);
      return data || [];
    }
  });

  // Fetch ER registrations
  const { data: erCases = [], isLoading } = useQuery({
    queryKey: ['er-cases-report', dateRange, selectedBranch, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('emergency_registrations')
        .select(`
          id,
          er_number,
          registration_time,
          triage_level,
          triage_time,
          status,
          disposition,
          disposition_time,
          chief_complaint,
          arrival_mode,
          patient_id
        `)
        .gte('registration_time', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('registration_time', format(dateRange.to, 'yyyy-MM-dd') + 'T23:59:59');

      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }
      if (selectedStatus) {
        query = query.eq('status', selectedStatus as ERStatus);
      }

      const { data } = await query.order('registration_time', { ascending: false });
      return (data || []) as Array<{
        id: string;
        er_number: string;
        registration_time: string;
        triage_level: number | null;
        triage_time: string | null;
        status: string;
        disposition: string | null;
        disposition_time: string | null;
        chief_complaint: string | null;
        arrival_mode: string | null;
        patient_id: string;
      }>;
    }
  });

  // Fetch patients for ER cases
  const { data: patients = [] } = useQuery({
    queryKey: ['er-patients', erCases.map(c => c.patient_id)],
    queryFn: async () => {
      const patientIds = [...new Set(erCases.map(c => c.patient_id))];
      if (patientIds.length === 0) return [];
      const { data } = await supabase.from('patients').select('id, first_name, last_name, mr_number').in('id', patientIds);
      return (data || []) as Array<{ id: string; first_name: string; last_name: string; mr_number: string }>;
    },
    enabled: erCases.length > 0
  });

  // Triage level distribution
  const triageLevelDistribution = useMemo(() => {
    const triageLabels: Record<number, string> = {
      1: 'Resuscitation',
      2: 'Emergent',
      3: 'Urgent',
      4: 'Less Urgent',
      5: 'Non-Urgent'
    };

    const triageMap = new Map<number, number>();
    erCases.forEach((c) => {
      const level = c.triage_level || 5;
      triageMap.set(level, (triageMap.get(level) || 0) + 1);
    });

    return Array.from(triageMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([level, count]) => ({
        level,
        name: triageLabels[level] || `Level ${level}`,
        count,
        color: TRIAGE_COLORS[level] || '#gray'
      }));
  }, [erCases]);

  // Disposition breakdown
  const dispositionBreakdown = useMemo(() => {
    const dispositionLabels: Record<string, string> = {
      'discharged': 'Discharged',
      'admitted': 'Admitted',
      'transferred': 'Transferred',
      'left_ama': 'Left AMA',
      'deceased': 'Deceased',
      'observation': 'Observation'
    };

    const dispositionMap = new Map<string, number>();
    erCases.forEach((c) => {
      if (c.disposition) {
        dispositionMap.set(c.disposition, (dispositionMap.get(c.disposition) || 0) + 1);
      }
    });

    return Array.from(dispositionMap.entries())
      .map(([key, value]) => ({
        name: dispositionLabels[key] || key,
        value
      }))
      .sort((a, b) => b.value - a.value);
  }, [erCases]);

  // Daily trends
  const dailyTrends = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayCases = erCases.filter((c) => 
        c.registration_time?.startsWith(dayStr)
      );
      
      const criticalCases = dayCases.filter((c) => 
        c.triage_level === 1 || c.triage_level === 2
      );

      return {
        date: format(day, 'MMM dd'),
        total: dayCases.length,
        critical: criticalCases.length,
        admitted: dayCases.filter((c) => c.disposition === 'admitted').length
      };
    });
  }, [erCases, dateRange]);

  // Hourly distribution
  const hourlyDistribution = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      count: 0
    }));

    erCases.forEach((c) => {
      if (c.registration_time) {
        const hour = new Date(c.registration_time).getHours();
        hours[hour].count++;
      }
    });

    return hours;
  }, [erCases]);

  // Arrival mode breakdown
  const arrivalModeBreakdown = useMemo(() => {
    const modeMap = new Map<string, number>();
    erCases.forEach((c) => {
      const mode = c.arrival_mode || 'walk_in';
      modeMap.set(mode, (modeMap.get(mode) || 0) + 1);
    });

    return Array.from(modeMap.entries())
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
      }));
  }, [erCases]);

  // Wait time analysis (triage to disposition)
  const avgWaitTime = useMemo(() => {
    const completedCases = erCases.filter((c) => 
      c.triage_time && c.disposition_time
    );

    if (completedCases.length === 0) return 0;

    const totalMinutes = completedCases.reduce((sum: number, c) => {
      return sum + differenceInMinutes(
        new Date(c.disposition_time!),
        new Date(c.triage_time!)
      );
    }, 0);

    return Math.round(totalMinutes / completedCases.length);
  }, [erCases]);

  // Summary stats
  const totalCases = erCases.length;
  const criticalCases = erCases.filter((c) => c.triage_level === 1 || c.triage_level === 2).length;
  const admittedCases = erCases.filter((c) => c.disposition === 'admitted').length;
  const activeCases = erCases.filter((c) => 
    ['waiting', 'in_triage', 'in_treatment'].includes(c.status)
  ).length;

  const handleExportCSV = () => {
    const exportData = erCases.map(c => {
      const patient = patients.find(p => p.id === c.patient_id);
      return {
        ...c,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : '-'
      };
    });
    
    exportToCSV(exportData, `er-report-${format(dateRange.from, 'yyyy-MM-dd')}`, [
      { key: 'er_number', header: 'ER #' },
      { key: 'registration_time', header: 'Registration', format: formatDateTime },
      { key: 'patient_name', header: 'Patient' },
      { key: 'triage_level', header: 'Triage Level' },
      { key: 'chief_complaint', header: 'Chief Complaint' },
      { key: 'status', header: 'Status' },
      { key: 'disposition', header: 'Disposition' }
    ]);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Emergency Department Reports</h1>
        <p className="text-muted-foreground">ER visits, triage analysis, and disposition tracking</p>
      </div>

      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showBranchFilter
        branchOptions={branches.map(b => ({ value: b.id, label: b.name }))}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        showStatusFilter
        statusOptions={[
          { value: 'waiting', label: 'Waiting' },
          { value: 'in_triage', label: 'In Triage' },
          { value: 'in_treatment', label: 'In Treatment' },
          { value: 'discharged', label: 'Discharged' },
          { value: 'admitted', label: 'Admitted' }
        ]}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Siren className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total ER Visits</p>
                <p className="text-2xl font-bold">{totalCases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/10">
                <Activity className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Cases</p>
                <p className="text-2xl font-bold">{criticalCases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admitted</p>
                <p className="text-2xl font-bold">{admittedCases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Stay Time</p>
                <p className="text-2xl font-bold">{avgWaitTime}m</p>
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
            <CardTitle>ER Visit Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" fillOpacity={0.3} name="Total Visits" />
                <Area type="monotone" dataKey="critical" fill="#ef4444" stroke="#ef4444" fillOpacity={0.5} name="Critical" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Triage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Triage Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={triageLevelDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="Patients">
                  {triageLevelDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disposition Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Disposition Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dispositionBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dispositionBreakdown.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={10} interval={2} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Arrival Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Arrival Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={arrivalModeBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Cases ({activeCases})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">ER #</th>
                  <th className="text-left py-3 px-4 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 font-medium">Registration</th>
                  <th className="text-left py-3 px-4 font-medium">Triage</th>
                  <th className="text-left py-3 px-4 font-medium">Chief Complaint</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {erCases
                  .filter((c) => ['waiting', 'in_triage', 'in_treatment'].includes(c.status))
                  .slice(0, 10)
                  .map((erCase) => {
                    const patient = patients.find(p => p.id === erCase.patient_id);
                    return (
                      <tr key={erCase.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{erCase.er_number}</td>
                        <td className="py-3 px-4">
                          {patient ? `${patient.first_name} ${patient.last_name}` : '-'}
                        </td>
                        <td className="py-3 px-4">{formatDateTime(erCase.registration_time)}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            style={{ backgroundColor: TRIAGE_COLORS[erCase.triage_level || 5] || '#gray' }}
                            className="text-white"
                          >
                            Level {erCase.triage_level || '-'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 max-w-[200px] truncate">{erCase.chief_complaint || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {erCase.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                {activeCases === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No active cases
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
