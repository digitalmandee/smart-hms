import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, parseISO, differenceInYears } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { exportToCSV, formatDate } from "@/lib/exportUtils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Users, UserPlus, TrendingUp, Calendar } from "lucide-react";

const COLORS = ['#3b82f6', '#ec4899', '#6b7280', '#22c55e', '#f59e0b', '#8b5cf6'];

export default function PatientReportsPage() {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch patients
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patient-reports', profile?.organization_id, dateRange],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, patient_number, phone, gender, date_of_birth, created_at, city, blood_group')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // New registrations in date range
  const newPatients = useMemo(() => {
    if (!patients) return [];
    return patients.filter(p => {
      const createdAt = new Date(p.created_at);
      return createdAt >= dateRange.from && createdAt <= dateRange.to;
    });
  }, [patients, dateRange]);

  // Stats
  const stats = useMemo(() => {
    const total = patients?.length || 0;
    const newCount = newPatients.length;
    const male = patients?.filter(p => p.gender === 'male').length || 0;
    const female = patients?.filter(p => p.gender === 'female').length || 0;

    return { total, newCount, male, female };
  }, [patients, newPatients]);

  // Daily registrations chart
  const dailyRegistrations = useMemo(() => {
    if (!newPatients.length) return [];
    
    const byDate: Record<string, number> = {};
    newPatients.forEach(p => {
      const date = format(new Date(p.created_at), 'yyyy-MM-dd');
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return Object.entries(byDate)
      .map(([date, count]) => ({ date: format(parseISO(date), 'MMM dd'), registrations: count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [newPatients]);

  // Gender distribution
  const genderData = useMemo(() => {
    if (!patients?.length) return [];
    return [
      { name: 'Male', value: stats.male, color: '#3b82f6' },
      { name: 'Female', value: stats.female, color: '#ec4899' },
      { name: 'Other', value: (patients?.length || 0) - stats.male - stats.female, color: '#6b7280' },
    ].filter(d => d.value > 0);
  }, [patients, stats]);

  // Age group distribution
  const ageGroupData = useMemo(() => {
    if (!patients?.length) return [];
    
    const groups: Record<string, number> = {
      '0-12': 0,
      '13-18': 0,
      '19-30': 0,
      '31-50': 0,
      '51-70': 0,
      '71+': 0,
    };

    patients.forEach(p => {
      if (!p.date_of_birth) return;
      const age = differenceInYears(new Date(), new Date(p.date_of_birth));
      
      if (age <= 12) groups['0-12']++;
      else if (age <= 18) groups['13-18']++;
      else if (age <= 30) groups['19-30']++;
      else if (age <= 50) groups['31-50']++;
      else if (age <= 70) groups['51-70']++;
      else groups['71+']++;
    });

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [patients]);

  // Blood group distribution
  const bloodGroupData = useMemo(() => {
    if (!patients?.length) return [];
    
    const groups: Record<string, number> = {};
    patients.forEach(p => {
      if (p.blood_group) {
        groups[p.blood_group] = (groups[p.blood_group] || 0) + 1;
      }
    });

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [patients]);

  // City distribution
  const cityData = useMemo(() => {
    if (!patients?.length) return [];
    
    const cities: Record<string, number> = {};
    patients.forEach(p => {
      const city = p.city || 'Unknown';
      cities[city] = (cities[city] || 0) + 1;
    });

    return Object.entries(cities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [patients]);

  const handleExportCSV = () => {
    const data = (patients || []).map(p => ({
      mrNumber: p.patient_number,
      name: `${p.first_name} ${p.last_name}`,
      phone: p.phone,
      gender: p.gender,
      dateOfBirth: formatDate(p.date_of_birth),
      city: p.city || '',
      bloodGroup: p.blood_group || '',
      registeredOn: formatDate(p.created_at),
    }));

    exportToCSV(data, `patients-${format(new Date(), 'yyyy-MM-dd')}`, [
      { key: 'mrNumber', header: 'MR#' },
      { key: 'name', header: 'Name' },
      { key: 'phone', header: 'Phone' },
      { key: 'gender', header: 'Gender' },
      { key: 'dateOfBirth', header: 'Date of Birth' },
      { key: 'city', header: 'City' },
      { key: 'bloodGroup', header: 'Blood Group' },
      { key: 'registeredOn', header: 'Registered On' },
    ]);
  };

  return (
    <div className="space-y-6" ref={printRef}>
      <PageHeader
        title="Patient Reports"
        description="Patient demographics and registration trends"
        breadcrumbs={[
          { label: "Patients", href: "/app/patients" },
          { label: "Reports" }
        ]}
      />

      {/* Filters */}
      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
        isLoading={isLoading}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.newCount}</div>
                <p className="text-xs text-muted-foreground">in selected period</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-blue-600">{stats.male.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Female Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-pink-600">{stats.female.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="registrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Daily Registrations</CardTitle>
              <CardDescription>New patient registrations per day</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : dailyRegistrations.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No new registrations in selected period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : genderData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {genderData.map((entry, index) => (
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
                <CardTitle>Age Groups</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : ageGroupData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={ageGroupData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={60} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-12 text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Blood Group Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : bloodGroupData.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    {bloodGroupData.map((group, index) => (
                      <div key={group.name} className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                          {group.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{group.value} patients</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No blood group data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Top Cities</CardTitle>
              <CardDescription>Patient distribution by city</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : cityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No location data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
