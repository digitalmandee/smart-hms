import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfMonth, endOfMonth, parseISO } from "date-fns";

interface DailyTrendData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

interface DepartmentAttendance {
  departmentId: string;
  departmentName: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  attendanceRate: number;
}

interface TopLateArrival {
  employeeId: string;
  name: string;
  department: string;
  lateCount: number;
  avgLateMinutes: number;
}

interface DayOfWeekPattern {
  day: string;
  attendance: number;
}

export function useAttendanceReportData(dateRange: string, departmentId?: string) {
  const { profile } = useAuth();

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "today":
        return { start: format(now, "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") };
      case "this-week":
        return { start: format(subDays(now, 6), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") };
      case "this-month":
        return { start: format(startOfMonth(now), "yyyy-MM-dd"), end: format(endOfMonth(now), "yyyy-MM-dd") };
      case "last-month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return { start: format(startOfMonth(lastMonth), "yyyy-MM-dd"), end: format(endOfMonth(lastMonth), "yyyy-MM-dd") };
      case "this-year":
        return { start: format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") };
      default:
        return { start: format(startOfMonth(now), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") };
    }
  };

  const { start, end } = getDateRange();

  // Daily trend data query
  const dailyTrendQuery = useQuery({
    queryKey: ["attendance-daily-trend", profile?.organization_id, start, end, departmentId],
    queryFn: async (): Promise<DailyTrendData[]> => {
      // Get last 7 days of data
      const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"));
      
      let query = supabase
        .from("attendance_records")
        .select(`
          attendance_date,
          status,
          employee:employee_id(department_id)
        `)
        .eq("organization_id", profile!.organization_id)
        .gte("attendance_date", last7Days[0])
        .lte("attendance_date", last7Days[6]);

      if (departmentId && departmentId !== "all") {
        query = query.eq("employee.department_id", departmentId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by date
      const grouped = last7Days.map(date => {
        const dayRecords = data?.filter(r => r.attendance_date === date) || [];
        return {
          date: format(parseISO(date), "EEE"),
          present: dayRecords.filter(r => r.status === "present").length,
          absent: dayRecords.filter(r => r.status === "absent").length,
          late: dayRecords.filter(r => r.status === "late").length,
        };
      });

      return grouped;
    },
    enabled: !!profile?.organization_id,
  });

  // Department-wise attendance query
  const departmentQuery = useQuery({
    queryKey: ["attendance-by-department", profile?.organization_id, start, end],
    queryFn: async (): Promise<DepartmentAttendance[]> => {
      const { data: records, error } = await supabase
        .from("attendance_records")
        .select(`
          status,
          employee:employee_id(
            department:department_id(id, name)
          )
        `)
        .eq("organization_id", profile!.organization_id)
        .gte("attendance_date", start)
        .lte("attendance_date", end);

      if (error) throw error;

      // Group by department
      const deptMap = new Map<string, DepartmentAttendance>();
      
      records?.forEach(record => {
        const deptId = (record.employee as any)?.department?.id;
        const deptName = (record.employee as any)?.department?.name || "Unassigned";
        
        if (!deptId) return;
        
        if (!deptMap.has(deptId)) {
          deptMap.set(deptId, {
            departmentId: deptId,
            departmentName: deptName,
            present: 0,
            absent: 0,
            late: 0,
            total: 0,
            attendanceRate: 0,
          });
        }
        
        const dept = deptMap.get(deptId)!;
        dept.total++;
        if (record.status === "present") dept.present++;
        else if (record.status === "absent") dept.absent++;
        else if (record.status === "late") dept.late++;
      });

      // Calculate attendance rate and convert to array
      return Array.from(deptMap.values())
        .map(dept => ({
          ...dept,
          attendanceRate: dept.total > 0 ? Math.round((dept.present / dept.total) * 100) : 0,
        }))
        .slice(0, 5); // Top 5 departments
    },
    enabled: !!profile?.organization_id,
  });

  // Top late arrivals query
  const topLateQuery = useQuery({
    queryKey: ["top-late-arrivals", profile?.organization_id, start, end],
    queryFn: async (): Promise<TopLateArrival[]> => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select(`
          late_minutes,
          employee:employee_id(
            id,
            first_name,
            last_name,
            department:department_id(name)
          )
        `)
        .eq("organization_id", profile!.organization_id)
        .eq("status", "late")
        .gte("attendance_date", start)
        .lte("attendance_date", end)
        .gt("late_minutes", 0);

      if (error) throw error;

      // Group by employee and count late occurrences
      const employeeMap = new Map<string, { 
        id: string; 
        name: string; 
        department: string; 
        count: number; 
        totalMinutes: number 
      }>();
      
      data?.forEach(record => {
        const emp = record.employee as any;
        if (!emp?.id) return;
        
        const key = emp.id;
        if (!employeeMap.has(key)) {
          employeeMap.set(key, {
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department?.name || "N/A",
            count: 0,
            totalMinutes: 0,
          });
        }
        
        const entry = employeeMap.get(key)!;
        entry.count++;
        entry.totalMinutes += record.late_minutes || 0;
      });

      // Convert to array and sort by count
      return Array.from(employeeMap.values())
        .map(emp => ({
          employeeId: emp.id,
          name: emp.name,
          department: emp.department,
          lateCount: emp.count,
          avgLateMinutes: emp.count > 0 ? Math.round(emp.totalMinutes / emp.count) : 0,
        }))
        .sort((a, b) => b.lateCount - a.lateCount)
        .slice(0, 5); // Top 5
    },
    enabled: !!profile?.organization_id,
  });

  // Day of week pattern query
  const dayOfWeekQuery = useQuery({
    queryKey: ["attendance-day-of-week", profile?.organization_id, start, end],
    queryFn: async (): Promise<DayOfWeekPattern[]> => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("attendance_date, status")
        .eq("organization_id", profile!.organization_id)
        .gte("attendance_date", start)
        .lte("attendance_date", end);

      if (error) throw error;

      // Group by day of week
      const dayMap = new Map<number, { total: number; present: number }>();
      
      data?.forEach(record => {
        const date = parseISO(record.attendance_date);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        if (!dayMap.has(dayOfWeek)) {
          dayMap.set(dayOfWeek, { total: 0, present: 0 });
        }
        
        const day = dayMap.get(dayOfWeek)!;
        day.total++;
        if (record.status === "present" || record.status === "late") {
          day.present++;
        }
      });

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      // Return Mon-Sat (skip Sunday if hospital operates 6 days)
      return [1, 2, 3, 4, 5, 6].map(dayIndex => {
        const dayData = dayMap.get(dayIndex) || { total: 0, present: 0 };
        return {
          day: dayNames[dayIndex],
          attendance: dayData.total > 0 ? Math.round((dayData.present / dayData.total) * 100) : 0,
        };
      });
    },
    enabled: !!profile?.organization_id,
  });

  return {
    dailyTrend: dailyTrendQuery.data || [],
    departmentData: departmentQuery.data || [],
    topLateArrivals: topLateQuery.data || [],
    dayOfWeekPattern: dayOfWeekQuery.data || [],
    isLoading: dailyTrendQuery.isLoading || departmentQuery.isLoading || topLateQuery.isLoading || dayOfWeekQuery.isLoading,
  };
}
