import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Scan, 
  Clock, 
  TrendingUp, 
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useImagingStats, useModalityPerformance } from "@/hooks/useRadiologyReports";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const RadiologyReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const { data: imagingStats, isLoading: statsLoading } = useImagingStats(dateRange.start, dateRange.end);
  const { data: modalityPerf, isLoading: modalityLoading } = useModalityPerformance(dateRange.start, dateRange.end);

  // Export columns
  const modalityColumns = [
    { key: "modality_name", header: "Modality" },
    { key: "modality_code", header: "Code" },
    { key: "total_orders", header: "Total Orders" },
    { key: "completed", header: "Completed" },
    { key: "pending", header: "Pending" },
    { key: "revenue", header: "Revenue", format: (v: number) => formatCurrency(v) },
  ];

  const technicianColumns = [
    { key: "technician_name", header: "Technician" },
    { key: "total_performed", header: "Exams Performed" },
    { key: "avg_tat_hours", header: "Avg TAT (hrs)" },
  ];

  const summary = imagingStats?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Radiology Reports"
        description="Imaging department analytics and performance metrics"
        actions={
          <ReportExportButton
            data={imagingStats?.byModality || []}
            filename={`radiology-report-${dateRange.start}-to-${dateRange.end}`}
            columns={modalityColumns}
            title="Radiology Performance Report"
            pdfOptions={{
              title: "Radiology Analytics Report",
              subtitle: "Modality-wise Performance Analysis",
              dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) },
            }}
          />
        }
      />

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Scan className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.totalOrders || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.completedOrders || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.pendingReports || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg TAT</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${summary?.avgTATHours || 0} hrs`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCurrency(summary?.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="modality" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modality">By Modality</TabsTrigger>
          <TabsTrigger value="technician">Technician Performance</TabsTrigger>
          <TabsTrigger value="priority">Priority Analysis</TabsTrigger>
          <TabsTrigger value="trends">Volume Trends</TabsTrigger>
        </TabsList>

        {/* Modality Tab */}
        <TabsContent value="modality">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Orders by Modality</CardTitle>
                <CardDescription>Imaging volume and revenue by modality type</CardDescription>
              </div>
              <ReportExportButton
                data={imagingStats?.byModality || []}
                filename={`modality-report-${dateRange.start}`}
                columns={modalityColumns}
                title="Modality Report"
                pdfOptions={{
                  title: "Modality Performance Report",
                  dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) },
                }}
              />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (imagingStats?.byModality?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No imaging data for the selected period
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={imagingStats?.byModality}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ modality_name, total_orders }) => `${modality_name}: ${total_orders}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="total_orders"
                          >
                            {imagingStats?.byModality?.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={imagingStats?.byModality}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="modality_code" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="total_orders" fill="hsl(var(--primary))" name="Orders" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modality</TableHead>
                        <TableHead className="text-right">Total Orders</TableHead>
                        <TableHead className="text-right">Completed</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {imagingStats?.byModality?.map((modality) => (
                        <TableRow key={modality.modality_id}>
                          <TableCell className="font-medium">
                            {modality.modality_name} ({modality.modality_code})
                          </TableCell>
                          <TableCell className="text-right">{modality.total_orders}</TableCell>
                          <TableCell className="text-right text-green-600">{modality.completed}</TableCell>
                          <TableCell className="text-right text-orange-600">{modality.pending}</TableCell>
                          <TableCell className="text-right">{formatCurrency(modality.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technician Performance Tab */}
        <TabsContent value="technician">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Technician Performance</CardTitle>
                <CardDescription>Productivity metrics by technician</CardDescription>
              </div>
              <ReportExportButton
                data={imagingStats?.byTechnician || []}
                filename={`technician-performance-${dateRange.start}`}
                columns={technicianColumns}
                title="Technician Performance"
                pdfOptions={{
                  title: "Technician Performance Report",
                  dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) },
                }}
              />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (imagingStats?.byTechnician?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No technician data available
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={imagingStats?.byTechnician?.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="technician_name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total_performed" fill="#22c55e" name="Exams Performed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Technician</TableHead>
                        <TableHead className="text-right">Exams Performed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {imagingStats?.byTechnician?.map((tech) => (
                        <TableRow key={tech.technician_id}>
                          <TableCell className="font-medium">{tech.technician_name}</TableCell>
                          <TableCell className="text-right">{tech.total_performed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Priority Analysis Tab */}
        <TabsContent value="priority">
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Orders by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (imagingStats?.byPriority?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No priority data available
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={imagingStats?.byPriority}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ priority, percentage }) => `${priority}: ${percentage}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {imagingStats?.byPriority?.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {imagingStats?.byPriority?.map((item, idx) => (
                        <TableRow key={item.priority}>
                          <TableCell className="font-medium capitalize">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              {item.priority}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right">{item.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volume Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Daily Volume Trends</CardTitle>
              <CardDescription>Imaging orders over time</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (imagingStats?.dailyTrend?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No trend data available
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={imagingStats?.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                      <YAxis />
                      <Tooltip labelFormatter={(v) => format(new Date(v), "MMM dd, yyyy")} />
                      <Legend />
                      <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Total Orders" />
                      <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} name="Completed" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RadiologyReportsPage;
