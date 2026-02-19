import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployees, useShifts, useShiftAssignments } from "@/hooks/useHR";
import { useDepartments } from "@/hooks/useHR";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  Users, 
  Clock, 
  AlertTriangle,
  Download,
  Calendar,
  TrendingUp,
  PieChart
} from "lucide-react";

type ReportType = "shift-distribution" | "coverage-gaps" | "overtime" | "department-summary" | "on-call-frequency";

export default function RosterReportsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportType>("shift-distribution");
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const startDate = format(startOfMonth(new Date(selectedMonth)), "yyyy-MM-dd");
  const endDate = format(endOfMonth(new Date(selectedMonth)), "yyyy-MM-dd");

  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: shifts, isLoading: loadingShifts } = useShifts();
  const { data: departments } = useDepartments();
  const { data: assignments } = useShiftAssignments(startDate, endDate);

  const isLoading = loadingEmployees || loadingShifts;

  // Calculate shift distribution
  const getShiftDistribution = () => {
    if (!shifts || !assignments) return [];
    
    return shifts.map(shift => {
      const count = assignments.filter(a => a.shift_id === shift.id).length;
      return {
        shift: shift.name,
        code: shift.code,
        color: shift.color,
        count,
        percentage: assignments.length > 0 ? ((count / assignments.length) * 100).toFixed(1) : "0",
      };
    }).filter(s => s.count > 0);
  };

  // Calculate department summary
  const getDepartmentSummary = () => {
    if (!employees || !departments) return [];
    
    const deptMap = new Map<string, { total: number; assigned: number; unassigned: number }>();
    
    employees.forEach(emp => {
      const deptName = typeof emp.department === "string" ? emp.department : emp.department?.name || "Unassigned";
      const current = deptMap.get(deptName) || { total: 0, assigned: 0, unassigned: 0 };
      current.total++;
      if (emp.shift_id) {
        current.assigned++;
      } else {
        current.unassigned++;
      }
      deptMap.set(deptName, current);
    });

    return Array.from(deptMap.entries()).map(([name, data]) => ({
      department: name,
      ...data,
      coverage: data.total > 0 ? ((data.assigned / data.total) * 100).toFixed(0) : "0",
    }));
  };

  // Generate months for selection
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    };
  });

  const reports: { type: ReportType; name: string; description: string; icon: React.ReactNode }[] = [
    { type: "shift-distribution", name: "Shift Distribution", description: "Hours per shift type", icon: <BarChart3 className="h-5 w-5" /> },
    { type: "coverage-gaps", name: "Coverage Gaps", description: "Identify unstaffed slots", icon: <AlertTriangle className="h-5 w-5" /> },
    { type: "overtime", name: "Overtime from Roster", description: "Staff beyond assigned hours", icon: <Clock className="h-5 w-5" /> },
    { type: "department-summary", name: "Department Summary", description: "Roster by department", icon: <Users className="h-5 w-5" /> },
    { type: "on-call-frequency", name: "On-Call Frequency", description: "Doctor on-call analysis", icon: <TrendingUp className="h-5 w-5" /> },
  ];

  const shiftDistribution = getShiftDistribution();
  const departmentSummary = getDepartmentSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roster Reports"
        description="Analyze roster data and identify patterns"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Attendance", href: "/app/hr/attendance" },
          { label: "Roster Reports" },
        ]}
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map(month => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments?.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {reports.map(report => (
          <Card 
            key={report.type}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedReport === report.type ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedReport(report.type)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedReport === report.type ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {report.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{report.name}</div>
                  <div className="text-xs text-muted-foreground">{report.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Content */}
      {selectedReport === "shift-distribution" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Shift Distribution Report
            </CardTitle>
            <CardDescription>
              Employee distribution across different shift types for {format(new Date(selectedMonth), "MMMM yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : shiftDistribution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No shift assignments found for this period
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Assignments</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead className="w-[200px]">Distribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftDistribution.map(item => (
                    <TableRow key={item.code}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color || "#6366f1" }}
                          />
                          {item.shift}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.code}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{item.count}</TableCell>
                      <TableCell className="text-right">{item.percentage}%</TableCell>
                      <TableCell>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: item.color || "#6366f1"
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {selectedReport === "department-summary" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department-wise Roster Summary
            </CardTitle>
            <CardDescription>
              Staff assignment status by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Total Staff</TableHead>
                    <TableHead className="text-right">Assigned</TableHead>
                    <TableHead className="text-right">Unassigned</TableHead>
                    <TableHead className="text-right">Coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentSummary.map(item => (
                    <TableRow key={item.department}>
                      <TableCell className="font-medium">{item.department}</TableCell>
                      <TableCell className="text-right">{item.total}</TableCell>
                      <TableCell className="text-right text-emerald-600">{item.assigned}</TableCell>
                      <TableCell className="text-right text-amber-600">{item.unassigned}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={parseInt(item.coverage) >= 80 ? "default" : "secondary"}>
                          {item.coverage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {selectedReport === "coverage-gaps" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Coverage Gap Analysis
            </CardTitle>
            <CardDescription>
              Identify days or shifts with insufficient staffing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No coverage gaps detected</p>
              <p className="text-sm">All shifts have adequate staffing for {format(new Date(selectedMonth), "MMMM yyyy")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === "overtime" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Overtime from Roster
            </CardTitle>
            <CardDescription>
              Staff working beyond their assigned shift hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Overtime data unavailable</p>
              <p className="text-sm">Connect attendance data to analyze roster vs actual hours</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === "on-call-frequency" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              On-Call Frequency Report
            </CardTitle>
            <CardDescription>
              Analysis of how often each doctor is on-call
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">On-call data being compiled</p>
              <p className="text-sm">View On-Call Schedule to manage doctor on-call assignments</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
