import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth } from "date-fns";

export interface DepartmentSummary {
  name: string;
  revenue: number;
  count: number;
}

export interface AlertItem {
  type: "warning" | "error" | "info";
  title: string;
  count: number;
}

export interface ExecutiveSummary {
  revenue: { total: number; collected: number; outstanding: number; trend: number };
  opd: { consultations: number; revenue: number; avgPerDoctor: number };
  ipd: { activeAdmissions: number; todayDischarges: number; occupancyRate: number; totalBeds: number; revenue: number };
  pharmacy: { todaySales: number; monthSales: number; inventoryValue: number; lowStockCount: number; expiringCount: number };
  lab: { ordersProcessed: number; pendingOrders: number; revenue: number; urgentPending: number };
  hr: { totalEmployees: number; presentToday: number; attendanceRate: number };
  financial: { totalRevenue: number; totalExpenses: number; netProfit: number; byDepartment: DepartmentSummary[] };
  alerts: AlertItem[];
  patientFootfall: number;
  beds: { total: number; occupied: number; free: number; maintenance: number; occupancyRate: number };
}

export function useExecutiveSummary(options: { startDate?: Date; endDate?: Date } = {}) {
  const { profile } = useAuth();
  const { startDate = startOfMonth(new Date()), endDate = endOfMonth(new Date()) } = options;
  const today = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["executive-summary", profile?.organization_id, format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
    queryFn: async (): Promise<ExecutiveSummary> => {
      if (!profile?.organization_id) return getEmptySummary();

      const orgId = profile.organization_id;
      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

      // Fetch all data in parallel with explicit typing to avoid deep instantiation
      const invoicesPromise = supabase.from("invoices").select("total_amount, paid_amount").eq("organization_id", orgId).gte("created_at", startStr).lte("created_at", endStr + "T23:59:59");
      const appointmentsPromise = supabase.from("appointments").select("id, doctor_id, status").eq("organization_id", orgId).gte("appointment_date", startStr).lte("appointment_date", endStr);
      const admissionsPromise = supabase.from("admissions").select("id, actual_discharge_date").eq("organization_id", orgId).eq("status", "admitted");
      const bedsPromise = supabase.from("beds").select("id, status");
      const pharmacyPromise = supabase.from("pharmacy_pos_transactions").select("total_amount, created_at").eq("organization_id", orgId).gte("created_at", startStr).lte("created_at", endStr + "T23:59:59");
      const labOrdersPromise = supabase.from("lab_orders").select("id, status, priority").gte("created_at", startStr).lte("created_at", endStr + "T23:59:59");
      const employeesPromise = supabase.from("employees").select("id", { count: "exact" }).eq("organization_id", orgId).eq("employment_status", "active");
      const attendancePromise = supabase.from("attendance_records").select("id, status").eq("organization_id", orgId).eq("attendance_date", today);
      const overdueInvPromise = supabase.from("invoices").select("id").eq("organization_id", orgId).eq("status", "pending").lt("due_date", today);
      const labRevenuePromise = supabase.from("invoice_items").select("total_price, service_type:service_types!inner(category)").eq("service_types.category", "lab").gte("created_at", startStr).lte("created_at", endStr + "T23:59:59");
      const expensesPromise = supabase.from("journal_entry_lines").select("debit_amount, account:accounts!inner(account_type:account_types!inner(category))").eq("accounts.account_types.category", "expense").gte("created_at", startStr).lte("created_at", endStr + "T23:59:59");

      const [invoices, appointments, admissions, beds, pharmacy, labOrders, employees, attendance, overdueInv, labRevenue, expenses] = await Promise.all([
        invoicesPromise, appointmentsPromise, admissionsPromise, bedsPromise, pharmacyPromise, labOrdersPromise, employeesPromise, attendancePromise, overdueInvPromise, labRevenuePromise, expensesPromise
      ]);

      const inv = invoices.data || [];
      const totalRevenue = inv.reduce((s, i) => s + (i.total_amount || 0), 0);
      const collected = inv.reduce((s, i) => s + (i.paid_amount || 0), 0);

      const appts = appointments.data || [];
      const completedAppts = appts.filter(a => ["completed", "checked_in", "in_progress"].includes(a.status || ""));
      const uniqueDoctors = new Set(appts.map(a => a.doctor_id).filter(Boolean));

      const adm = admissions.data || [];
      const bedsData = beds.data || [];
      const occupiedBeds = bedsData.filter(b => b.status === "occupied").length;
      const freeBeds = bedsData.filter(b => b.status === "available").length;
      const maintenanceBeds = bedsData.filter(b => b.status === "housekeeping" || b.status === "blocked").length;

      const pharmTx = pharmacy.data || [];
      const todayPharm = pharmTx.filter(p => p.created_at?.startsWith(today));
      const todaySales = todayPharm.reduce((s, p) => s + (p.total_amount || 0), 0);
      const monthSales = pharmTx.reduce((s, p) => s + (p.total_amount || 0), 0);

      const labs = labOrders.data || [];
      const completedLab = labs.filter((l: any) => l.status === "completed");
      const pendingLab = labs.filter((l: any) => l.status === "ordered" || l.status === "processing");
      const urgentPending = pendingLab.filter((l: any) => l.priority === "urgent" || l.priority === "stat").length;

      // Calculate lab revenue from invoice items
      const labRevenueTotal = (labRevenue.data || []).reduce((s: number, item: any) => s + (item.total_price || 0), 0);

      // Calculate total expenses
      const totalExpenses = (expenses.data || []).reduce((s: number, item: any) => s + (item.debit_amount || 0), 0);

      const totalEmps = employees.count || 0;
      const attRecords = attendance.data || [];
      const present = attRecords.filter(a => a.status === "present" || a.status === "late").length;

      const alerts: AlertItem[] = [];
      if ((overdueInv.data?.length || 0) > 0) alerts.push({ type: "error", title: "Overdue Invoices", count: overdueInv.data?.length || 0 });
      if (pendingLab.length > 0) alerts.push({ type: "info", title: "Pending Lab Orders", count: pendingLab.length });
      if (urgentPending > 0) alerts.push({ type: "warning", title: "Urgent Lab Orders", count: urgentPending });

      const netProfit = totalRevenue - totalExpenses;

      return {
        revenue: { total: totalRevenue, collected, outstanding: totalRevenue - collected, trend: 0 },
        opd: { consultations: completedAppts.length, revenue: 0, avgPerDoctor: uniqueDoctors.size > 0 ? Math.round(completedAppts.length / uniqueDoctors.size) : 0 },
        ipd: { activeAdmissions: adm.length, todayDischarges: adm.filter(a => a.actual_discharge_date === today).length, occupancyRate: bedsData.length > 0 ? Math.round((occupiedBeds / bedsData.length) * 100) : 0, totalBeds: bedsData.length, revenue: 0 },
        pharmacy: { todaySales, monthSales, inventoryValue: 0, lowStockCount: 0, expiringCount: 0 },
        lab: { ordersProcessed: completedLab.length, pendingOrders: pendingLab.length, revenue: labRevenueTotal, urgentPending },
        hr: { totalEmployees: totalEmps, presentToday: present, attendanceRate: totalEmps > 0 ? Math.round((present / totalEmps) * 100) : 0 },
        financial: { totalRevenue, totalExpenses, netProfit, byDepartment: [{ name: "OPD", revenue: 0, count: completedAppts.length }, { name: "Pharmacy", revenue: monthSales, count: pharmTx.length }, { name: "Lab", revenue: labRevenueTotal, count: completedLab.length }, { name: "IPD", revenue: 0, count: adm.length }] },
        alerts,
        patientFootfall: completedAppts.length + adm.length,
        beds: { total: bedsData.length, occupied: occupiedBeds, free: freeBeds, maintenance: maintenanceBeds, occupancyRate: bedsData.length > 0 ? Math.round((occupiedBeds / bedsData.length) * 100) : 0 },
      };
    },
    enabled: !!profile?.organization_id,
    staleTime: 2 * 60 * 1000,
  });
}

function getEmptySummary(): ExecutiveSummary {
  return { revenue: { total: 0, collected: 0, outstanding: 0, trend: 0 }, opd: { consultations: 0, revenue: 0, avgPerDoctor: 0 }, ipd: { activeAdmissions: 0, todayDischarges: 0, occupancyRate: 0, totalBeds: 0, revenue: 0 }, pharmacy: { todaySales: 0, monthSales: 0, inventoryValue: 0, lowStockCount: 0, expiringCount: 0 }, lab: { ordersProcessed: 0, pendingOrders: 0, revenue: 0, urgentPending: 0 }, hr: { totalEmployees: 0, presentToday: 0, attendanceRate: 0 }, financial: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, byDepartment: [] }, alerts: [], patientFootfall: 0, beds: { total: 0, occupied: 0, free: 0, maintenance: 0, occupancyRate: 0 } };
}
