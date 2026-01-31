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
  Stethoscope, 
  Clock, 
  TrendingUp, 
  Calendar,
  Activity,
  Loader2,
  Siren,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSurgeryStats, useOTRoomUtilization } from "@/hooks/useOTReports";
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

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const OTReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const { data: surgeryStats, isLoading: statsLoading } = useSurgeryStats(dateRange.start, dateRange.end);
  const { data: roomUtilization, isLoading: roomLoading } = useOTRoomUtilization(dateRange.start, dateRange.end);

  // Export columns
  const surgeonColumns = [
    { key: "surgeon_name", header: "Surgeon" },
    { key: "total_surgeries", header: "Total Surgeries" },
    { key: "completed", header: "Completed" },
    { key: "cancelled", header: "Cancelled" },
    { key: "total_revenue", header: "Revenue", format: (v: number) => formatCurrency(v) },
  ];

  const roomColumns = [
    { key: "room_name", header: "OT Room" },
    { key: "total_surgeries", header: "Surgeries" },
    { key: "total_hours", header: "Hours Used" },
    { key: "utilization_percent", header: "Utilization %", format: (v: number) => `${v}%` },
  ];

  const summary = surgeryStats?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="OT/Surgery Reports"
        description="Operating theater analytics and surgery performance metrics"
        actions={
          <ReportExportButton
            data={surgeryStats?.bySurgeon || []}
            filename={`ot-surgeon-report-${dateRange.start}-to-${dateRange.end}`}
            columns={surgeonColumns}
            title="Surgeon Performance Report"
            pdfOptions={{
              title: "OT Surgery Report",
              subtitle: "Surgeon-wise Performance Analysis",
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
              <Stethoscope className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Surgeries</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.totalSurgeries || 0}
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
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.completedSurgeries || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.cancelledSurgeries || 0}
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
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${summary?.avgDurationMinutes || 0} min`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Siren className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Emergency</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.emergencySurgeries || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="surgeon" className="space-y-4">
        <TabsList>
          <TabsTrigger value="surgeon">Surgeon Performance</TabsTrigger>
          <TabsTrigger value="room">OT Room Utilization</TabsTrigger>
          <TabsTrigger value="anesthesia">Anesthesia Types</TabsTrigger>
          <TabsTrigger value="trends">Surgery Trends</TabsTrigger>
        </TabsList>

        {/* Surgeon Performance Tab */}
        <TabsContent value="surgeon">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Surgeon-wise Performance</CardTitle>
                <CardDescription>Surgery count and revenue by surgeon</CardDescription>
              </div>
              <ReportExportButton
                data={surgeryStats?.bySurgeon || []}
                filename={`surgeon-performance-${dateRange.start}`}
                columns={surgeonColumns}
                title="Surgeon Performance"
                pdfOptions={{
                  title: "Surgeon Performance Report",
                  dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) },
                }}
              />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (surgeryStats?.bySurgeon?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No surgery data for the selected period
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={surgeryStats?.bySurgeon?.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="surgeon_name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total_surgeries" fill="hsl(var(--primary))" name="Surgeries" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Surgeon</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Completed</TableHead>
                        <TableHead className="text-right">Cancelled</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {surgeryStats?.bySurgeon?.map((surgeon) => (
                        <TableRow key={surgeon.surgeon_id}>
                          <TableCell className="font-medium">{surgeon.surgeon_name}</TableCell>
                          <TableCell className="text-right">{surgeon.total_surgeries}</TableCell>
                          <TableCell className="text-right text-green-600">{surgeon.completed}</TableCell>
                          <TableCell className="text-right text-red-600">{surgeon.cancelled}</TableCell>
                          <TableCell className="text-right">{formatCurrency(surgeon.total_revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OT Room Utilization Tab */}
        <TabsContent value="room">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>OT Room Utilization</CardTitle>
                <CardDescription>Usage statistics by operating theater</CardDescription>
              </div>
              <ReportExportButton
                data={roomUtilization || []}
                filename={`ot-room-utilization-${dateRange.start}`}
                columns={roomColumns}
                title="OT Room Utilization"
                pdfOptions={{
                  title: "OT Room Utilization Report",
                  dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) },
                }}
              />
            </CardHeader>
            <CardContent>
              {roomLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (roomUtilization?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No OT room data available
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roomUtilization} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="room_name" type="category" width={120} />
                        <Tooltip formatter={(value: number) => [`${value}%`, "Utilization"]} />
                        <Bar dataKey="utilization_percent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>OT Room</TableHead>
                        <TableHead className="text-right">Surgeries</TableHead>
                        <TableHead className="text-right">Hours Used</TableHead>
                        <TableHead className="text-right">Utilization</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roomUtilization?.map((room) => (
                        <TableRow key={room.room_id}>
                          <TableCell className="font-medium">{room.room_name}</TableCell>
                          <TableCell className="text-right">{room.surgery_count}</TableCell>
                          <TableCell className="text-right">{room.total_hours} hrs</TableCell>
                          <TableCell className="text-right font-semibold">{room.utilization_percent}%</TableCell>
                          <TableCell className="text-right capitalize">{room.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anesthesia Types Tab */}
        <TabsContent value="anesthesia">
          <Card>
            <CardHeader>
              <CardTitle>Anesthesia Type Distribution</CardTitle>
              <CardDescription>Breakdown of anesthesia methods used</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (surgeryStats?.byAnesthesia?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No anesthesia data available
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={surgeryStats?.byAnesthesia}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ type, percentage }) => `${type}: ${percentage}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {surgeryStats?.byAnesthesia?.map((_, index) => (
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
                        <TableHead>Anesthesia Type</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {surgeryStats?.byAnesthesia?.map((item, idx) => (
                        <TableRow key={item.type}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              {item.type}
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

        {/* Surgery Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Daily Surgery Trends</CardTitle>
              <CardDescription>Surgery volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (surgeryStats?.dailyTrend?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No trend data available
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={surgeryStats?.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                      <YAxis />
                      <Tooltip labelFormatter={(v) => format(new Date(v), "MMM dd, yyyy")} />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Total" />
                      <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} name="Completed" />
                      <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Cancelled" />
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

export default OTReportsPage;
