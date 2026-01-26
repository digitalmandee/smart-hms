import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Department Employee Distribution
export function useDepartmentDistribution() {
  return useQuery({
    queryKey: ["department-employee-distribution"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("employees")
        .select(`
          id,
          department_id,
          departments!employees_department_id_fkey(id, name)
        `)
        .eq("is_active", true);

      if (error) throw error;

      // Group by department
      const deptCounts: Record<string, { name: string; count: number }> = {};
      data?.forEach((emp: any) => {
        const deptId = emp.department_id || "unassigned";
        const deptName = emp.departments?.name || "Unassigned";
        if (!deptCounts[deptId]) {
          deptCounts[deptId] = { name: deptName, count: 0 };
        }
        deptCounts[deptId].count++;
      });

      return Object.values(deptCounts).sort((a, b) => b.count - a.count);
    },
  });
}

// Attendance Trends (Monthly)
export function useAttendanceTrends(year: number) {
  return useQuery({
    queryKey: ["attendance-trends", year],
    queryFn: async () => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data, error } = await supabase
        .from("attendance_records")
        .select("attendance_date, status")
        .gte("attendance_date", startDate)
        .lte("attendance_date", endDate);

      if (error) throw error;

      // Group by month and status
      const monthlyData: Record<string, { present: number; absent: number; late: number; total: number }> = {};
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      months.forEach((month) => {
        monthlyData[month] = { present: 0, absent: 0, late: 0, total: 0 };
      });

      data?.forEach((record: any) => {
        const date = new Date(record.attendance_date);
        const monthIdx = date.getMonth();
        const month = months[monthIdx];
        
        monthlyData[month].total++;
        if (record.status === "present") {
          monthlyData[month].present++;
        } else if (record.status === "absent") {
          monthlyData[month].absent++;
        } else if (record.status === "late") {
          monthlyData[month].late++;
        }
      });

      // Convert to percentages
      return months.map((month) => {
        const data = monthlyData[month];
        const total = data.total || 1;
        return {
          month,
          present: Math.round((data.present / total) * 100),
          absent: Math.round((data.absent / total) * 100),
          late: Math.round((data.late / total) * 100),
        };
      });
    },
  });
}

// Leave Distribution
export function useLeaveDistribution(year: number) {
  return useQuery({
    queryKey: ["leave-distribution", year],
    queryFn: async () => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data, error } = await (supabase as any)
        .from("leave_applications")
        .select("leave_type, id")
        .eq("status", "approved")
        .gte("start_date", startDate)
        .lte("start_date", endDate);

      if (error) throw error;

      // Group by leave type
      const typeCounts: Record<string, number> = {};
      data?.forEach((leave: any) => {
        const type = leave.leave_type || "other";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const typeLabels: Record<string, string> = {
        annual: "Annual Leave",
        sick: "Sick Leave",
        casual: "Casual Leave",
        maternity: "Maternity Leave",
        paternity: "Paternity Leave",
        unpaid: "Unpaid Leave",
        other: "Other",
      };

      return Object.entries(typeCounts).map(([type, count]) => ({
        name: typeLabels[type] || type,
        value: count,
      }));
    },
  });
}

// Leave Stats
export function useLeaveStats(year: number) {
  return useQuery({
    queryKey: ["leave-stats", year],
    queryFn: async () => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      const currentMonth = new Date().getMonth() + 1;
      const monthStart = `${year}-${String(currentMonth).padStart(2, "0")}-01`;
      const monthEnd = `${year}-${String(currentMonth).padStart(2, "0")}-31`;

      // Total approved leaves this year
      const { count: totalApproved } = await (supabase as any)
        .from("leave_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .gte("start_date", startDate)
        .lte("start_date", endDate);

      // Pending approvals
      const { count: pendingApprovals } = await (supabase as any)
        .from("leave_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Approved this month
      const { count: approvedThisMonth } = await (supabase as any)
        .from("leave_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .gte("start_date", monthStart)
        .lte("start_date", monthEnd);

      return {
        totalApproved: totalApproved || 0,
        pendingApprovals: pendingApprovals || 0,
        approvedThisMonth: approvedThisMonth || 0,
      };
    },
  });
}

// Employee Directory Report Data
export function useEmployeeDirectoryReport() {
  return useQuery({
    queryKey: ["employee-directory-report"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("employees")
        .select(`
          id,
          employee_number,
          first_name,
          last_name,
          phone,
          email,
          gender,
          date_of_birth,
          join_date,
          is_active,
          bank_name,
          account_number,
          emergency_contact_name,
          emergency_contact_phone,
          departments!employees_department_id_fkey(name),
          designations!employees_designation_id_fkey(name),
          branches!employees_branch_id_fkey(name)
        `)
        .order("first_name");

      if (error) throw error;
      return data;
    },
  });
}

// Headcount Report Data
export function useHeadcountReport(year: number) {
  return useQuery({
    queryKey: ["headcount-report", year],
    queryFn: async () => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      // Get all employees with join dates
      const { data: employees, error } = await (supabase as any)
        .from("employees")
        .select("id, join_date, termination_date, is_active")
        .gte("join_date", startDate)
        .lte("join_date", endDate);

      if (error) throw error;

      // Get terminations
      const { data: terminations, error: termError } = await (supabase as any)
        .from("employees")
        .select("id, termination_date")
        .not("termination_date", "is", null)
        .gte("termination_date", startDate)
        .lte("termination_date", endDate);

      if (termError) throw termError;

      // Group by month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyData = months.map((month, idx) => {
        const monthNum = idx + 1;
        const hires = employees?.filter((e: any) => {
          const joinMonth = new Date(e.join_date).getMonth() + 1;
          return joinMonth === monthNum;
        }).length || 0;
        
        const exits = terminations?.filter((e: any) => {
          const termMonth = new Date(e.termination_date).getMonth() + 1;
          return termMonth === monthNum;
        }).length || 0;

        return {
          month,
          hires,
          exits,
          netChange: hires - exits,
        };
      });

      // Total stats
      const totalHires = employees?.length || 0;
      const totalExits = terminations?.length || 0;

      return {
        monthlyData,
        totalHires,
        totalExits,
        netChange: totalHires - totalExits,
      };
    },
  });
}

// Salary Register Report Data
export function useSalaryRegisterReport() {
  return useQuery({
    queryKey: ["salary-register-report"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("employee_salaries")
        .select(`
          id,
          basic_salary,
          effective_from,
          is_current,
          employee:employee_id(
            id,
            employee_number,
            first_name,
            last_name,
            departments!employees_department_id_fkey(name),
            designations!employees_designation_id_fkey(name)
          ),
          salary_structure:salary_structure_id(name)
        `)
        .eq("is_current", true)
        .order("basic_salary", { ascending: false });

      if (error) throw error;

      // Group by department
      const departmentGroups: Record<string, { employees: any[]; total: number }> = {};
      data?.forEach((salary: any) => {
        const deptName = salary.employee?.departments?.name || "Unassigned";
        if (!departmentGroups[deptName]) {
          departmentGroups[deptName] = { employees: [], total: 0 };
        }
        departmentGroups[deptName].employees.push(salary);
        departmentGroups[deptName].total += salary.basic_salary || 0;
      });

      // Total payroll
      const totalPayroll = data?.reduce((sum: number, s: any) => sum + (s.basic_salary || 0), 0) || 0;

      // Salary bands
      const bands = [
        { label: "< Rs. 25,000", min: 0, max: 25000, count: 0 },
        { label: "Rs. 25,000 - 50,000", min: 25000, max: 50000, count: 0 },
        { label: "Rs. 50,000 - 100,000", min: 50000, max: 100000, count: 0 },
        { label: "Rs. 100,000 - 200,000", min: 100000, max: 200000, count: 0 },
        { label: "> Rs. 200,000", min: 200000, max: Infinity, count: 0 },
      ];

      data?.forEach((salary: any) => {
        const amount = salary.basic_salary || 0;
        for (const band of bands) {
          if (amount >= band.min && amount < band.max) {
            band.count++;
            break;
          }
        }
      });

      return {
        salaries: data || [],
        departmentGroups,
        totalPayroll,
        employeeCount: data?.length || 0,
        salaryBands: bands,
      };
    },
  });
}
