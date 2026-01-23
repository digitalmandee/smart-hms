import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, format, differenceInDays, eachDayOfInterval, isWeekend } from "date-fns";

export interface EmployeePerformance {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  designation: string;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  attendanceRate: number;
  punctualityRate: number;
  performanceScore: number;
}

export interface PerformanceSummary {
  totalEmployees: number;
  avgAttendanceRate: number;
  perfectAttendance: number;
  highPerformers: number;
  totalLateArrivals: number;
  avgPerformanceScore: number;
}

interface UseEmployeePerformanceOptions {
  startDate?: Date;
  endDate?: Date;
  departmentId?: string;
  search?: string;
}

interface EmployeeRow {
  id: string;
  employee_number: string | null;
  first_name: string;
  last_name: string | null;
  department_id: string | null;
  designation_id: string | null;
}

export function useEmployeePerformance(options: UseEmployeePerformanceOptions = {}) {
  const { profile } = useAuth();
  const {
    startDate = startOfMonth(new Date()),
    endDate = endOfMonth(new Date()),
    departmentId,
    search,
  } = options;

  return useQuery({
    queryKey: [
      "employee-performance",
      profile?.organization_id,
      format(startDate, "yyyy-MM-dd"),
      format(endDate, "yyyy-MM-dd"),
      departmentId,
      search,
    ],
    queryFn: async (): Promise<{ employees: EmployeePerformance[]; summary: PerformanceSummary }> => {
      if (!profile?.organization_id) {
        return { employees: [], summary: getEmptySummary() };
      }

      // Calculate working days (excluding weekends)
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      const workingDays = allDays.filter(day => !isWeekend(day)).length;

      // Fetch employees - use employment_status instead of status
      let employeesQuery = supabase
        .from("employees")
        .select(`
          id,
          employee_number,
          first_name,
          last_name,
          department_id,
          designation_id
        `)
        .eq("organization_id", profile.organization_id)
        .eq("employment_status", "active");

      if (departmentId && departmentId !== "all") {
        employeesQuery = employeesQuery.eq("department_id", departmentId);
      }

      if (search) {
        employeesQuery = employeesQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,employee_number.ilike.%${search}%`);
      }

      const { data: employeesData, error: empError } = await employeesQuery;
      if (empError) throw empError;

      const employees = (employeesData || []) as EmployeeRow[];

      if (employees.length === 0) {
        return { employees: [], summary: getEmptySummary() };
      }

      const employeeIds = employees.map(e => e.id);
      const departmentIds = [...new Set(employees.map(e => e.department_id).filter(Boolean))] as string[];
      const designationIds = [...new Set(employees.map(e => e.designation_id).filter(Boolean))] as string[];

      // Fetch departments and designations
      const [deptResult, desigResult, attResult, leaveResult] = await Promise.all([
        departmentIds.length > 0 
          ? supabase.from("departments").select("id, name").in("id", departmentIds)
          : Promise.resolve({ data: [], error: null }),
        designationIds.length > 0
          ? supabase.from("designations").select("id, name").in("id", designationIds)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("attendance_records")
          .select("employee_id, status, attendance_date")
          .in("employee_id", employeeIds)
          .gte("attendance_date", format(startDate, "yyyy-MM-dd"))
          .lte("attendance_date", format(endDate, "yyyy-MM-dd")),
        supabase
          .from("leave_requests")
          .select("employee_id, start_date, end_date")
          .in("employee_id", employeeIds)
          .eq("status", "approved")
          .gte("end_date", format(startDate, "yyyy-MM-dd"))
          .lte("start_date", format(endDate, "yyyy-MM-dd")),
      ]);

      const departments = deptResult.data || [];
      const designations = desigResult.data || [];
      const attendance = attResult.data || [];
      const leaves = leaveResult.data || [];

      // Create lookup maps
      const deptMap = new Map(departments.map(d => [d.id, d.name]));
      const desigMap = new Map(designations.map(d => [d.id, d.name]));

      // Process performance data
      const performanceData: EmployeePerformance[] = employees.map(emp => {
        const empAttendance = attendance.filter(a => a.employee_id === emp.id);
        const empLeaves = leaves.filter(l => l.employee_id === emp.id);

        const presentDays = empAttendance.filter(a => a.status === "present" || a.status === "late").length;
        const lateDays = empAttendance.filter(a => a.status === "late").length;
        const absentDays = empAttendance.filter(a => a.status === "absent").length;
        
        // Calculate leave days within the period
        let leaveDays = 0;
        empLeaves.forEach(leave => {
          const leaveStart = new Date(leave.start_date) < startDate ? startDate : new Date(leave.start_date);
          const leaveEnd = new Date(leave.end_date) > endDate ? endDate : new Date(leave.end_date);
          leaveDays += differenceInDays(leaveEnd, leaveStart) + 1;
        });

        const attendanceRate = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;
        const punctualityRate = presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 100;
        
        // Performance score: weighted average of attendance (60%) and punctuality (40%)
        const performanceScore = Math.round(attendanceRate * 0.6 + punctualityRate * 0.4);

        return {
          id: emp.id,
          employeeCode: emp.employee_number || "",
          fullName: `${emp.first_name} ${emp.last_name || ""}`.trim(),
          department: emp.department_id ? deptMap.get(emp.department_id) || "Unassigned" : "Unassigned",
          designation: emp.designation_id ? desigMap.get(emp.designation_id) || "N/A" : "N/A",
          workingDays,
          presentDays,
          absentDays,
          lateDays,
          leaveDays,
          attendanceRate,
          punctualityRate,
          performanceScore,
        };
      });

      // Sort by performance score descending
      performanceData.sort((a, b) => b.performanceScore - a.performanceScore);

      // Calculate summary
      const summary: PerformanceSummary = {
        totalEmployees: performanceData.length,
        avgAttendanceRate: performanceData.length > 0
          ? Math.round(performanceData.reduce((sum, e) => sum + e.attendanceRate, 0) / performanceData.length)
          : 0,
        perfectAttendance: performanceData.filter(e => e.attendanceRate === 100 && e.lateDays === 0).length,
        highPerformers: performanceData.filter(e => e.performanceScore >= 90).length,
        totalLateArrivals: performanceData.reduce((sum, e) => sum + e.lateDays, 0),
        avgPerformanceScore: performanceData.length > 0
          ? Math.round(performanceData.reduce((sum, e) => sum + e.performanceScore, 0) / performanceData.length)
          : 0,
      };

      return { employees: performanceData, summary };
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000,
  });
}

function getEmptySummary(): PerformanceSummary {
  return {
    totalEmployees: 0,
    avgAttendanceRate: 0,
    perfectAttendance: 0,
    highPerformers: 0,
    totalLateArrivals: 0,
    avgPerformanceScore: 0,
  };
}
