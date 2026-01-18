import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInHours } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { exportToCSV, formatDate } from "@/lib/exportUtils";
import { FlaskConical, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

  // Fetch lab orders - use created_at instead of order_date
  const { data: labOrders = [], isLoading } = useQuery({
    queryKey: ['lab-orders-report', dateRange, selectedBranch, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('lab_orders')
        .select('id, order_number, created_at, status, priority, completed_at, patient_id, branch_id')
        .gte('created_at', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('created_at', format(dateRange.to, 'yyyy-MM-dd') + 'T23:59:59');

      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }
      // Skip status filter in query to avoid type issues - filter client-side
      
      const { data } = await query.order('created_at', { ascending: false });
      
      // Filter by status client-side if needed
      let filtered = data || [];
      if (selectedStatus) {
        filtered = filtered.filter(o => o.status === selectedStatus);
      }
      return filtered;
    }
  });

  // Fetch patients for lab orders - use patient_number instead of mr_number
  const { data: patients = [] } = useQuery({
    queryKey: ['lab-patients', labOrders.map(o => o.patient_id)],
    queryFn: async () => {
      const patientIds = [...new Set(labOrders.map(o => o.patient_id).filter(Boolean))];
      if (patientIds.length === 0) return [];
      const { data } = await supabase
        .from('patients')
        .select('id, first_name, last_name, patient_number')
        .in('id', patientIds);
      return data || [];
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
        .select('id, lab_order_id, test_name, test_category, status')
        .in('lab_order_id', orderIds);

      return data || [];
    },
    enabled: labOrders.length > 0
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
    const categoryMap = new Map<string, number>();
    labOrderItems.forEach((item) => {
      const category = item.test_category || 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [labOrderItems]);

  // Daily trends
  const dailyTrends = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayOrders = labOrders.filter(o => o.created_at?.startsWith(dayStr));
      return {
        date: format(day, 'MMM dd'),
        orders: dayOrders.length,
        completed: dayOrders.filter(o => o.status === 'completed').length
      };
    });
  }, [labOrders, dateRange]);

  // Turnaround time analysis
  const tatAnalysis = useMemo(() => {
    const completedOrders = labOrders.filter(o => 
      o.status === 'completed' && o.created_at && o.completed_at
    );

    if (completedOrders.length === 0) return { avg: 0, min: 0, max: 0 };

    const tatHours = completedOrders.map(o => 
      differenceInHours(new Date(o.completed_at!), new Date(o.created_at!))
    );

    return {
      avg: Math.round(tatHours.reduce((a, b) => a + b, 0) / tatHours.length),
      min: Math.min(...tatHours),
      max: Math.max(...tatHours)
    };
  }, [labOrders]);

  // Pending orders
  const pendingOrders = labOrders.filter(o => 
    ['ordered', 'collected', 'processing'].includes(o.status || '')
  );

  // Summary stats
  const totalOrders = labOrders.length;
  const urgentOrders = labOrders.filter(o => o.priority === 'urgent' || o.priority === 'stat').length;

  const handleExportCSV = () => {
    const exportData = labOrders.map(o => {
      const patient = patients.find(p => p.id === o.patient_id);
      return {
        order_number: o.order_number,
        created_at: o.created_at,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : '-',
        status: o.status,
        priority: o.priority
      };
    });
    
    exportToCSV(exportData, `lab-report-${format(dateRange.from, 'yyyy-MM-dd')}`, [
      { key: 'order_number', header: 'Order #' },
      { key: 'created_at', header: 'Date', format: formatDate },
      { key: 'patient_name', header: 'Patient' },
      { key: 'status', header: 'Status' },
      { key: 'priority', header: 'Priority' }
    ]);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Lab Reports</h1>
        <p className="text-muted-foreground">Test volumes, turnaround times, and analysis</p>
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
                <p className="text-sm text-muted-foreground">Tests Count</p>
                <p className="text-2xl font-bold">{labOrderItems.length}</p>
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
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Tests Count" />
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
                      <td className="py-3 px-4">{formatDate(order.created_at)}</td>
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
                    </tr>
                  );
                })}
                {pendingOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
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
