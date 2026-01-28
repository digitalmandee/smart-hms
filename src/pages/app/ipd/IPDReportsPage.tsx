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
  Bed, 
  Users, 
  TrendingUp, 
  Calendar,
  Clock,
  Activity,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { useIPDStats } from "@/hooks/useIPD";
import {
  useBedOccupancyReport,
  useAdmissionStatistics,
  useWardCensus,
  useAverageLOS,
  useDailyMovement,
} from "@/hooks/useIPDReports";
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
} from "recharts";

const OCCUPANCY_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

const IPDReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: stats, isLoading: statsLoading } = useIPDStats();
  const { data: bedOccupancy, isLoading: occupancyLoading } = useBedOccupancyReport();
  const { data: admissionStats, isLoading: admissionLoading } = useAdmissionStatistics(
    dateRange.start,
    dateRange.end
  );
  const { data: wardCensus, isLoading: censusLoading } = useWardCensus();
  const { data: losData, isLoading: losLoading } = useAverageLOS(dateRange.start, dateRange.end);
  const { data: dailyMovement, isLoading: movementLoading } = useDailyMovement(selectedDate);

  // Prepare export data for bed occupancy
  const occupancyExportData = bedOccupancy?.byWard || [];
  const occupancyColumns = [
    { key: "ward_name", header: "Ward" },
    { key: "total_beds", header: "Total Beds" },
    { key: "occupied_beds", header: "Occupied" },
    { key: "available_beds", header: "Available" },
    { key: "occupancy_rate", header: "Occupancy %", format: (v: number) => `${v}%` },
  ];

  // Prepare export data for LOS
  const losExportData = losData?.byDepartment || [];
  const losColumns = [
    { key: "department", header: "Department" },
    { key: "avg_los", header: "Avg LOS (Days)" },
    { key: "min_los", header: "Min LOS" },
    { key: "max_los", header: "Max LOS" },
    { key: "patient_count", header: "Patients" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="IPD Reports"
        description="Inpatient department analytics and reports"
        actions={
          <ReportExportButton
            data={occupancyExportData}
            filename={`ipd-bed-occupancy-${format(new Date(), "yyyy-MM-dd")}`}
            columns={occupancyColumns}
            title="Bed Occupancy Report"
            pdfOptions={{
              title: "IPD Bed Occupancy Report",
              subtitle: "Current bed status by ward",
            }}
            summaryRow={bedOccupancy?.totals ? {
              ward_name: "TOTAL",
              total_beds: bedOccupancy.totals.total_beds,
              occupied_beds: bedOccupancy.totals.occupied_beds,
              available_beds: bedOccupancy.totals.available_beds,
              occupancy_rate: bedOccupancy.totals.occupancy_rate,
            } : undefined}
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
            <div className="space-y-2">
              <Label>Daily Movement Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bed className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Beds</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.totalBeds || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.occupiedBeds || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.totalBeds 
                    ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Length of Stay</p>
                <p className="text-2xl font-bold">
                  {losLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${losData?.overall?.avg_los || 0} days`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="occupancy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="occupancy">Bed Occupancy</TabsTrigger>
          <TabsTrigger value="admissions">Admission Trends</TabsTrigger>
          <TabsTrigger value="census">Ward Census</TabsTrigger>
          <TabsTrigger value="los">Length of Stay</TabsTrigger>
          <TabsTrigger value="movement">Daily Movement</TabsTrigger>
        </TabsList>

        {/* Bed Occupancy Tab */}
        <TabsContent value="occupancy">
          <Card>
            <CardHeader>
              <CardTitle>Bed Occupancy by Ward</CardTitle>
              <CardDescription>Current occupancy status across all wards</CardDescription>
            </CardHeader>
            <CardContent>
              {occupancyLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={occupancyExportData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="ward_name" type="category" width={120} />
                        <Tooltip formatter={(value: number) => [`${value}%`, "Occupancy"]} />
                        <Bar dataKey="occupancy_rate" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ward</TableHead>
                        <TableHead className="text-right">Total Beds</TableHead>
                        <TableHead className="text-right">Occupied</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                        <TableHead className="text-right">Occupancy %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {occupancyExportData.map((ward) => (
                        <TableRow key={ward.ward_id}>
                          <TableCell className="font-medium">{ward.ward_name}</TableCell>
                          <TableCell className="text-right">{ward.total_beds}</TableCell>
                          <TableCell className="text-right">{ward.occupied_beds}</TableCell>
                          <TableCell className="text-right text-green-600">{ward.available_beds}</TableCell>
                          <TableCell className="text-right font-semibold">{ward.occupancy_rate}%</TableCell>
                        </TableRow>
                      ))}
                      {bedOccupancy?.totals && (
                        <TableRow className="bg-muted font-semibold">
                          <TableCell>TOTAL</TableCell>
                          <TableCell className="text-right">{bedOccupancy.totals.total_beds}</TableCell>
                          <TableCell className="text-right">{bedOccupancy.totals.occupied_beds}</TableCell>
                          <TableCell className="text-right text-green-600">{bedOccupancy.totals.available_beds}</TableCell>
                          <TableCell className="text-right">{bedOccupancy.totals.occupancy_rate}%</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admission Trends Tab */}
        <TabsContent value="admissions">
          <Card>
            <CardHeader>
              <CardTitle>Admission & Discharge Trends</CardTitle>
              <CardDescription>Daily admission and discharge patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {admissionLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (admissionStats?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No admission data for the selected period
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={admissionStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                      <YAxis />
                      <Tooltip labelFormatter={(v) => format(new Date(v), "MMM dd, yyyy")} />
                      <Line type="monotone" dataKey="admissions" stroke="#22c55e" strokeWidth={2} name="Admissions" />
                      <Line type="monotone" dataKey="discharges" stroke="#ef4444" strokeWidth={2} name="Discharges" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ward Census Tab */}
        <TabsContent value="census">
          <Card>
            <CardHeader>
              <CardTitle>Current Ward Census</CardTitle>
              <CardDescription>Current patient distribution by ward</CardDescription>
            </CardHeader>
            <CardContent>
              {censusLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {wardCensus?.map((ward) => (
                    <Card key={ward.ward_id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{ward.ward_name}</CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {ward.occupied}/{ward.total_beds} beds ({ward.total_beds > 0 ? Math.round((ward.occupied / ward.total_beds) * 100) : 0}%)
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {ward.patients.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No patients currently admitted</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Bed</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Admission Date</TableHead>
                                <TableHead>Attending Doctor</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ward.patients.map((patient, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{patient.bed_number}</TableCell>
                                  <TableCell>{patient.patient_name}</TableCell>
                                  <TableCell>{patient.admission_date ? format(new Date(patient.admission_date), "MMM dd, yyyy") : "-"}</TableCell>
                                  <TableCell>{patient.doctor_name}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Length of Stay Tab */}
        <TabsContent value="los">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Average Length of Stay</CardTitle>
                <CardDescription>LOS analysis by ward/department</CardDescription>
              </div>
              <ReportExportButton
                data={losExportData}
                filename={`ipd-los-report-${dateRange.start}-to-${dateRange.end}`}
                columns={losColumns}
                title="Length of Stay Report"
                pdfOptions={{
                  title: "Average Length of Stay Report",
                  dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) },
                }}
              />
            </CardHeader>
            <CardContent>
              {losLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : losExportData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No discharge data for LOS calculation
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Overall Average</p>
                        <p className="text-3xl font-bold">{losData?.overall?.avg_los || 0} days</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Total Discharges</p>
                        <p className="text-3xl font-bold">{losData?.overall?.total_patients || 0}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Total Bed Days</p>
                        <p className="text-3xl font-bold">{losData?.overall?.total_bed_days || 0}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department/Ward</TableHead>
                        <TableHead className="text-right">Avg LOS</TableHead>
                        <TableHead className="text-right">Min</TableHead>
                        <TableHead className="text-right">Max</TableHead>
                        <TableHead className="text-right">Patients</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {losExportData.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell className="text-right font-semibold">{dept.avg_los} days</TableCell>
                          <TableCell className="text-right">{dept.min_los}</TableCell>
                          <TableCell className="text-right">{dept.max_los}</TableCell>
                          <TableCell className="text-right">{dept.patient_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Movement Tab */}
        <TabsContent value="movement">
          <Card>
            <CardHeader>
              <CardTitle>Daily Movement - {format(new Date(selectedDate), "MMMM dd, yyyy")}</CardTitle>
              <CardDescription>Admissions, discharges, and transfers for the selected day</CardDescription>
            </CardHeader>
            <CardContent>
              {movementLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4 flex items-center gap-3">
                        <ArrowUp className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Admissions</p>
                          <p className="text-2xl font-bold">{dailyMovement?.summary?.total_admissions || 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 flex items-center gap-3">
                        <ArrowDown className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Discharges</p>
                          <p className="text-2xl font-bold">{dailyMovement?.summary?.total_discharges || 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 flex items-center gap-3">
                        <Activity className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Transfers</p>
                          <p className="text-2xl font-bold">{dailyMovement?.summary?.total_transfers || 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 flex items-center gap-3">
                        <Minus className="h-8 w-8 text-purple-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Net Change</p>
                          <p className={`text-2xl font-bold ${(dailyMovement?.summary?.net_change || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {(dailyMovement?.summary?.net_change || 0) >= 0 ? "+" : ""}{dailyMovement?.summary?.net_change || 0}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Admissions List */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-600">Admissions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dailyMovement?.admissions?.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No admissions</p>
                        ) : (
                          <ul className="space-y-2">
                            {dailyMovement?.admissions?.map((a, i) => (
                              <li key={i} className="text-sm border-b pb-2">
                                <p className="font-medium">{a.patient_name}</p>
                                <p className="text-muted-foreground">{a.ward} • {a.type}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>

                    {/* Discharges List */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-600">Discharges</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dailyMovement?.discharges?.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No discharges</p>
                        ) : (
                          <ul className="space-y-2">
                            {dailyMovement?.discharges?.map((d, i) => (
                              <li key={i} className="text-sm border-b pb-2">
                                <p className="font-medium">{d.patient_name}</p>
                                <p className="text-muted-foreground">{d.ward} • {d.type}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>

                    {/* Transfers List */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-600">Transfers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dailyMovement?.transfers?.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No transfers</p>
                        ) : (
                          <ul className="space-y-2">
                            {dailyMovement?.transfers?.map((t, i) => (
                              <li key={i} className="text-sm border-b pb-2">
                                <p className="font-medium">{t.patient_name}</p>
                                <p className="text-muted-foreground">{t.from_ward} → {t.to_ward}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IPDReportsPage;
