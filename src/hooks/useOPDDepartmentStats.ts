import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export interface OPDDepartmentStat {
  id: string;
  name: string;
  code: string;
  color: string | null;
  patientCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  revenue: number;
  avgWaitTime?: number;
}

export interface OPDDepartmentSummary {
  departments: OPDDepartmentStat[];
  totalPatients: number;
  totalCompleted: number;
  totalRevenue: number;
  period: { from: string; to: string };
}

type Period = "today" | "week" | "month" | "custom";

export function useOPDDepartmentStats(
  period: Period = "today",
  customDateFrom?: string,
  customDateTo?: string,
  branchId?: string
) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: [
      "opd-department-stats",
      profile?.organization_id,
      period,
      customDateFrom,
      customDateTo,
      branchId || profile?.branch_id,
    ],
    queryFn: async (): Promise<OPDDepartmentSummary> => {
      const orgId = profile!.organization_id!;
      const targetBranchId = branchId || profile?.branch_id;

      // Calculate date range
      const today = new Date();
      let dateFrom: string;
      let dateTo: string;

      switch (period) {
        case "week":
          dateFrom = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
          dateTo = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
          break;
        case "month":
          dateFrom = format(startOfMonth(today), "yyyy-MM-dd");
          dateTo = format(endOfMonth(today), "yyyy-MM-dd");
          break;
        case "custom":
          dateFrom = customDateFrom || format(today, "yyyy-MM-dd");
          dateTo = customDateTo || format(today, "yyyy-MM-dd");
          break;
        default: // today
          dateFrom = format(today, "yyyy-MM-dd");
          dateTo = format(today, "yyyy-MM-dd");
      }

      // Fetch OPD departments
      let deptQuery = supabase
        .from("opd_departments")
        .select("id, name, code, color")
        .eq("organization_id", orgId)
        .eq("is_active", true);

      if (targetBranchId) {
        deptQuery = deptQuery.eq("branch_id", targetBranchId);
      }

      const { data: departments, error: deptError } = await deptQuery;
      if (deptError) throw deptError;

      // Fetch appointments for the period
      let apptQuery = supabase
        .from("appointments")
        .select("id, status, opd_department_id, check_in_at, created_at")
        .eq("organization_id", orgId)
        .gte("appointment_date", dateFrom)
        .lte("appointment_date", dateTo);

      if (targetBranchId) {
        apptQuery = apptQuery.eq("branch_id", targetBranchId);
      }

      const { data: appointments, error: apptError } = await apptQuery;
      if (apptError) throw apptError;

      // Fetch invoices for revenue (simplified - assumes invoices linked to appointments)
      const { data: invoices, error: invError } = await supabase
        .from("invoices")
        .select("id, total_amount, paid_amount")
        .eq("organization_id", orgId)
        .gte("created_at", `${dateFrom}T00:00:00`)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (invError) throw invError;

      // Calculate stats per department
      const deptStats = new Map<string, OPDDepartmentStat>();

      departments?.forEach((dept) => {
        deptStats.set(dept.id, {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          color: dept.color,
          patientCount: 0,
          completedCount: 0,
          cancelledCount: 0,
          noShowCount: 0,
          revenue: 0,
        });
      });

      // Add an "Unassigned" category for appointments without OPD department
      deptStats.set("unassigned", {
        id: "unassigned",
        name: "Unassigned",
        code: "GEN",
        color: "#6b7280",
        patientCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        noShowCount: 0,
        revenue: 0,
      });

      // Count appointments per department
      appointments?.forEach((appt) => {
        const deptId = appt.opd_department_id || "unassigned";
        const stat = deptStats.get(deptId);
        if (stat) {
          stat.patientCount++;
          if (appt.status === "completed") stat.completedCount++;
          if (appt.status === "cancelled") stat.cancelledCount++;
          if (appt.status === "no_show") stat.noShowCount++;
        }
      });

      // Simple revenue distribution (equally among departments with patients)
      // In a real scenario, you'd link invoices to appointments and then to departments
      const totalRevenue = invoices?.reduce(
        (sum, inv) => sum + (Number(inv.paid_amount) || 0),
        0
      ) || 0;

      const deptsWithPatients = Array.from(deptStats.values()).filter(
        (d) => d.patientCount > 0
      );
      const totalPatients = deptsWithPatients.reduce((sum, d) => sum + d.patientCount, 0);

      // Distribute revenue proportionally
      deptsWithPatients.forEach((dept) => {
        dept.revenue = totalPatients > 0
          ? (dept.patientCount / totalPatients) * totalRevenue
          : 0;
      });

      const result = Array.from(deptStats.values()).filter(
        (d) => d.patientCount > 0 || d.id !== "unassigned"
      );

      return {
        departments: result.sort((a, b) => b.patientCount - a.patientCount),
        totalPatients,
        totalCompleted: result.reduce((sum, d) => sum + d.completedCount, 0),
        totalRevenue,
        period: { from: dateFrom, to: dateTo },
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// Get top OPD departments for dashboard widget
export function useTopOPDDepartments(limit: number = 5) {
  const { data, isLoading } = useOPDDepartmentStats("today");

  return {
    data: data?.departments.slice(0, limit) || [],
    isLoading,
    totalPatients: data?.totalPatients || 0,
  };
}
