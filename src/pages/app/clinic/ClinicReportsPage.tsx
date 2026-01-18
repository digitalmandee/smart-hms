import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, parseISO, startOfDay, endOfDay } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctors } from "@/hooks/useDoctors";
import { usePaymentMethods } from "@/hooks/useBilling";
import { exportToCSV, formatCurrency, formatDate } from "@/lib/exportUtils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Ticket, DollarSign, Users, Clock, TrendingUp, CreditCard } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ClinicReportsPage() {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: doctors } = useDoctors();
  const { data: paymentMethods } = usePaymentMethods();

  // Fetch appointments data for tokens
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['clinic-appointments', profile?.branch_id, dateRange],
    queryFn: async () => {
      if (!profile?.branch_id) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, token_number, appointment_date, appointment_time, status, priority,
          doctor_id, patient_id, created_at,
          patients:patient_id (first_name, last_name, patient_number),
          doctors:doctor_id (id, profile:profile_id (full_name), specialization)
        `)
        .eq('branch_id', profile.branch_id)
        .gte('appointment_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('appointment_date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('appointment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.branch_id,
  });

  // Fetch payments/invoices data
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['clinic-payments', profile?.branch_id, dateRange],
    queryFn: async () => {
      if (!profile?.branch_id) return [];
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id, amount, payment_date, payment_method_id, reference_number,
          invoice_id (
            id, invoice_number, total_amount, patient_id,
            patients:patient_id (first_name, last_name)
          ),
          payment_methods:payment_method_id (name, code)
        `)
        .eq('branch_id', profile.branch_id)
        .gte('payment_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('payment_date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.branch_id,
  });

  // Filter data based on selections
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(apt => {
      if (selectedDoctor !== 'all' && apt.doctor_id !== selectedDoctor) return false;
      return true;
    });
  }, [appointments, selectedDoctor]);

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return payments.filter(pmt => {
      if (selectedPaymentMethod !== 'all' && pmt.payment_method_id !== selectedPaymentMethod) return false;
      return true;
    });
  }, [payments, selectedPaymentMethod]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalTokens = filteredAppointments.length;
    const completedTokens = filteredAppointments.filter(a => a.status === 'completed').length;
    const totalCollections = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const avgPerToken = totalTokens > 0 ? totalCollections / totalTokens : 0;

    return { totalTokens, completedTokens, totalCollections, avgPerToken };
  }, [filteredAppointments, filteredPayments]);

  // Daily token data for chart
  const dailyTokenData = useMemo(() => {
    if (!filteredAppointments.length) return [];
    
    const byDate: Record<string, number> = {};
    filteredAppointments.forEach(apt => {
      const date = apt.appointment_date;
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return Object.entries(byDate)
      .map(([date, count]) => ({ date: format(parseISO(date), 'MMM dd'), tokens: count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredAppointments]);

  // Payment method breakdown
  const paymentMethodData = useMemo(() => {
    if (!filteredPayments.length) return [];
    
    const byMethod: Record<string, number> = {};
    filteredPayments.forEach(pmt => {
      const method = (pmt.payment_methods as any)?.name || 'Unknown';
      byMethod[method] = (byMethod[method] || 0) + Number(pmt.amount);
    });

    return Object.entries(byMethod).map(([name, value]) => ({ name, value }));
  }, [filteredPayments]);

  // Doctor earnings data
  const doctorEarningsData = useMemo(() => {
    if (!filteredAppointments.length || !filteredPayments.length) return [];
    
    // Group appointments by doctor
    const byDoctor: Record<string, { name: string; tokens: number; earnings: number }> = {};
    
    filteredAppointments.forEach(apt => {
      const doctorId = apt.doctor_id;
      const doctorName = (apt.doctors as any)?.profile?.full_name || 'Unknown';
      
      if (!byDoctor[doctorId]) {
        byDoctor[doctorId] = { name: `Dr. ${doctorName}`, tokens: 0, earnings: 0 };
      }
      byDoctor[doctorId].tokens++;
    });

    // For simplicity, distribute collections proportionally by token count
    const totalTokens = Object.values(byDoctor).reduce((sum, d) => sum + d.tokens, 0);
    Object.values(byDoctor).forEach(doc => {
      doc.earnings = totalTokens > 0 ? (doc.tokens / totalTokens) * stats.totalCollections : 0;
    });

    return Object.values(byDoctor).sort((a, b) => b.earnings - a.earnings);
  }, [filteredAppointments, filteredPayments, stats.totalCollections]);

  // Peak hours analysis
  const peakHoursData = useMemo(() => {
    if (!filteredAppointments.length) return [];
    
    const byHour: Record<number, number> = {};
    filteredAppointments.forEach(apt => {
      if (apt.appointment_time) {
        const hour = parseInt(apt.appointment_time.split(':')[0]);
        byHour[hour] = (byHour[hour] || 0) + 1;
      }
    });

    return Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // 8 AM to 8 PM
      return {
        hour: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`,
        tokens: byHour[hour] || 0
      };
    });
  }, [filteredAppointments]);

  const handleExportCSV = () => {
    const data = filteredPayments.map(p => ({
      date: formatDate(p.payment_date),
      invoice: (p.invoices as any)?.invoice_number || '',
      patient: `${(p.invoices as any)?.patients?.first_name || ''} ${(p.invoices as any)?.patients?.last_name || ''}`,
      amount: Number(p.amount),
      method: (p.payment_methods as any)?.name || '',
      reference: p.reference_number || ''
    }));

    exportToCSV(data, `clinic-collections-${format(new Date(), 'yyyy-MM-dd')}`, [
      { key: 'date', header: 'Date' },
      { key: 'invoice', header: 'Invoice #' },
      { key: 'patient', header: 'Patient' },
      { key: 'amount', header: 'Amount', format: (v) => formatCurrency(v) },
      { key: 'method', header: 'Payment Method' },
      { key: 'reference', header: 'Reference' },
    ]);
  };

  const handlePrint = () => {
    window.print();
  };

  const doctorOptions = doctors?.map(d => ({
    value: d.id,
    label: `Dr. ${d.profile?.full_name || 'Unknown'}`
  })) || [];

  const paymentMethodOptions = paymentMethods?.map(m => ({
    value: m.id,
    label: m.name
  })) || [];

  const isLoading = appointmentsLoading || paymentsLoading;

  return (
    <div className="space-y-6" ref={printRef}>
      <PageHeader
        title="Clinic Reports"
        description="Token summary, collections, and analytics"
      />

      {/* Filters */}
      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showDoctorFilter
        doctors={doctorOptions}
        selectedDoctor={selectedDoctor}
        onDoctorChange={setSelectedDoctor}
        showPaymentMethodFilter
        paymentMethods={paymentMethodOptions}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
        isLoading={isLoading}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalTokens}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats.completedTokens} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCollections)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Per Token</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(stats.avgPerToken)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{doctorEarningsData.length}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Tokens</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Earnings</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="peak">Peak Hours</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Token Summary</CardTitle>
              <CardDescription>Number of tokens issued per day</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : dailyTokenData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyTokenData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No data for selected period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Earnings</CardTitle>
              <CardDescription>Revenue contribution by doctor</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : doctorEarningsData.length > 0 ? (
                <div className="space-y-4">
                  {doctorEarningsData.map((doc, index) => (
                    <div key={doc.name} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.tokens} tokens</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(doc.earnings)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No data for selected period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Breakdown</CardTitle>
              <CardDescription>Collections by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : paymentMethodData.length > 0 ? (
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {paymentMethodData.map((method, index) => (
                      <div key={method.name} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="flex-1">{method.name}</span>
                        <span className="font-medium">{formatCurrency(method.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No data for selected period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>Token distribution by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : peakHoursData.some(d => d.tokens > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="tokens" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No data for selected period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Collections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Collections</CardTitle>
          <CardDescription>Latest payments received</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="space-y-2">
              {filteredPayments.slice(0, 10).map(payment => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">
                      {(payment.invoices as any)?.patients?.first_name} {(payment.invoices as any)?.patients?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(payment.invoices as any)?.invoice_number} • {formatDate(payment.payment_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(Number(payment.amount))}</p>
                    <Badge variant="outline">{(payment.payment_methods as any)?.name}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No payments in selected period</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
