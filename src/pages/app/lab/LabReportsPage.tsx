import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInHours } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { exportToCSV, formatCurrency, formatDate } from "@/lib/exportUtils";
import { FlaskConical, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

type LabOrderStatus = 'cancelled' | 'collected' | 'completed' | 'ordered' | 'processing';

export default function LabReportsPage() {
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

  // Fetch lab orders
  const { data: labOrders = [], isLoading } = useQuery({
    queryKey: ['lab-orders-report', dateRange, selectedBranch, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('lab_orders')
        .select(`
          id,
          order_number,
          order_date,
          status,
          priority,
          total_amount,
          created_at,
          sample_collected_at,
          results_entered_at,
          verified_at,
          patient_id
        `)
        .gte('order_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('order_date', format(dateRange.to, 'yyyy-MM-dd'));

      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }
      if (selectedStatus) {
        query = query.eq('status', selectedStatus as LabOrderStatus);
      }

      const { data } = await query.order('order_date', { ascending: false });
      return (data || []) as Array<{
        id: string;
        order_number: string;
        order_date: string;
        status: string;
        priority: string;
        total_amount: number;
        created_at: string;
        sample_collected_at: string | null;
        results_entered_at: string | null;
        verified_at: string | null;
        patient_id: string;
      }>;
    }
  });

  // Fetch patients for lab orders
  const { data: patients = [] } = useQuery({
    queryKey: ['lab-patients', labOrders.map(o => o.patient_id)],
    queryFn: async () => {
      const patientIds = [...new Set(labOrders.map(o => o.patient_id))];
      if (patientIds.length === 0) return [];
      const { data } = await supabase.from('patients').select('id, first_name, last_name, mr_number').in('id', patientIds);
      return (data || []) as Array<{ id: string; first_name: string; last_name: string; mr_number: string }>;
    },
    enabled: labOrders.length > 0
  });

  // Fetch lab order items for test breakdown
  const { data: labOrderItems = [] } = useQuery({
    queryKey: ['lab-order-items-report', labOrders.map(o => o.id)],
    queryFn: async () => {
      const orderIds = labOrders.map(o => o.id);
      if (orderIds.length === 0) return [];

      const { data } = await supabase
        .from('lab_order_items')
        .select(`
          id,
          lab_order_id,
          price,
          lab_test_id
        `)
        .in('lab_order_id', orderIds);

      return (data || []) as Array<{ id: string; lab_order_id: string; price: number; lab_test_id: string }>;
    },
    enabled: labOrders.length > 0
  });

  // Fetch lab tests for category info
  const { data: labTests = [] } = useQuery({
    queryKey: ['lab-tests-report', labOrderItems.map(i => i.lab_test_id)],
    queryFn: async () => {
      const testIds = [...new Set(labOrderItems.map(i => i.lab_test_id))];
      if (testIds.length === 0) return [];
      const { data } = await supabase.from('lab_tests').select('id, name, category').in('id', testIds);
      return (data || []) as Array<{ id: string; name: string; category: string }>;
    },
    enabled: labOrderItems.length > 0
  });

  // Calculate order status breakdown
  const statusBreakdown = useMemo(() => {
    const statusMap = new Map<string, number>();
    labOrders.forEach((order) => {
      const status = order.status || 'pending';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    return Array.from(statusMap.entries()).map(([name, value]) => ({ 
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
      value 
    }));
  }, [labOrders]);

  // Calculate test category breakdown
  const categoryBreakdown = useMemo(() => {
    const categoryMap = new Map<string, { count: number; revenue: number }>();
    labOrderItems.forEach((item) => {
      const test = labTests.find(t => t.id === item.lab_test_id);
      const category = test?.category || 'Other';
      const existing = categoryMap.get(category) || { count: 0, revenue: 0 };
      existing.count++;
      existing.revenue += item.price || 0;
      categoryMap.set(category, existing);
    });
    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [labOrderItems, labTests]);

  // Daily trends
  const dailyTrends = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayOrders = labOrders.filter(o => o.order_date === dayStr);
      return {
        date: format(day, 'MMM dd'),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        completed: dayOrders.filter(o => o.status === 'completed').length
      };
    });
  }, [labOrders, dateRange]);

  // Turnaround time analysis
  const tatAnalysis = useMemo(() => {
    const completedOrders = labOrders.filter(o => 
      o.status === 'completed' && o.created_at && o.verified_at
    );

    if (completedOrders.length === 0) return { avg: 0, min: 0, max: 0 };

    const tatHours = completedOrders.map(o => 
      differenceInHours(new Date(o.verified_at!), new Date(o.created_at))
    );

    return {
      avg: Math.round(tatHours.reduce((a, b) => a + b, 0) / tatHours.length),
      min: Math.min(...tatHours),
      max: Math.max(...tatHours)
    };
  }, [labOrders]);

  // Pending orders
  const pendingOrders = labOrders.filter(o => 
    ['ordered', 'collected', 'processing'].includes(o.status)
  );

  // Summary stats
  const totalOrders = labOrders.length;
  const totalRevenue = labOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const urgentOrders = labOrders.filter(o => o.priority === 'urgent' || o.priority === 'stat').length;

  const handleExportCSV = () => {
    const exportData = labOrders.map(o => {
      const patient = patients.find(p => p.id === o.patient_id);
      return {
        ...o,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : '-'
      };
    });
    
    exportToCSV(exportData, `lab-report-${format(dateRange.from, 'yyyy-MM-dd')}`, [
      { key: 'order_number', header: 'Order #' },
      { key: 'order_date', header: 'Date', format: formatDate },
      { key: 'patient_name', header: 'Patient' },
      { key: 'status', header: 'Status' },
      { key: 'priority', header: 'Priority' },
      { key: 'total_amount', header: 'Amount', format: formatCurrency }
    ]);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Lab Reports</h1>
        <p className="text-muted-foreground">Test volumes, turnaround times, and revenue analysis</p>
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
          { value: 'ordered', label: 'Ordered' },
          { value: 'collected', label: 'Collected' },
          { value: 'processing', label: 'Processing' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
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
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
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
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg TAT</p>
                <p className="text-2xl font-bold">{tatAnalysis.avg}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgent Orders</p>
                <p className="text-2xl font-bold">{urgentOrders}</p>
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
            <CardTitle>Order Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" name="Total Orders" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusBreakdown.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Test Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Tests by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" name="Tests Count" />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (Rs.)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pending Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Orders ({pendingOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Order #</th>
                  <th className="text-left py-3 px-4 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.slice(0, 10).map((order) => {
                  const patient = patients.find(p => p.id === order.patient_id);
                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{order.order_number}</td>
                      <td className="py-3 px-4">
                        {patient ? `${patient.first_name} ${patient.last_name}` : '-'}
                      </td>
                      <td className="py-3 px-4">{formatDate(order.order_date)}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {order.status?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={order.priority === 'urgent' || order.priority === 'stat' ? 'destructive' : 'secondary'}>
                          {order.priority || 'Normal'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(order.total_amount)}</td>
                    </tr>
                  );
                })}
                {pendingOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No pending orders
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
