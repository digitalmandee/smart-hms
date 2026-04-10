import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PayrollComponentResult {
  name: string;
  code: string;
  amount: number;
  type: "earning" | "deduction";
  isTaxable: boolean;
}

export interface EmployeePayrollCalc {
  employeeId: string;
  basicSalary: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours: number;
  lateMinutes: number;
  earnings: PayrollComponentResult[];
  deductions: PayrollComponentResult[];
  grossSalary: number;
  totalDeductions: number;
  incomeTax: number;
  netSalary: number;
}

// Fetch active salary components for the org
export function useSalaryComponents() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["salary-components-active", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("salary_components")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

// Fetch tax slabs
export function useTaxSlabs() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["tax-slabs-active", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("tax_slabs")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("min_income");
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

// Fetch attendance summary for a month
export function useMonthlyAttendance(month: number, year: number, employeeIds: string[]) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["monthly-attendance", month, year, employeeIds, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || !employeeIds.length) return {};
      
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("attendance_records")
        .select("employee_id, status, working_hours, overtime_hours, late_minutes")
        .eq("organization_id", profile.organization_id)
        .gte("attendance_date", startDate)
        .lte("attendance_date", endDate)
        .in("employee_id", employeeIds);

      if (error) throw error;

      // Aggregate per employee
      const result: Record<string, {
        totalDays: number;
        presentDays: number;
        absentDays: number;
        leaveDays: number;
        overtimeHours: number;
        lateMinutes: number;
        totalWorkingHours: number;
      }> = {};

      (data || []).forEach((rec: any) => {
        if (!result[rec.employee_id]) {
          result[rec.employee_id] = {
            totalDays: 0, presentDays: 0, absentDays: 0,
            leaveDays: 0, overtimeHours: 0, lateMinutes: 0, totalWorkingHours: 0,
          };
        }
        const entry = result[rec.employee_id];
        entry.totalDays++;
        const status = (rec.status || "present").toLowerCase();
        if (status === "present" || status === "half_day") {
          entry.presentDays += status === "half_day" ? 0.5 : 1;
        } else if (status === "absent") {
          entry.absentDays++;
        } else if (status === "on_leave") {
          entry.leaveDays++;
        }
        entry.overtimeHours += Number(rec.overtime_hours || 0);
        entry.lateMinutes += Number(rec.late_minutes || 0);
        entry.totalWorkingHours += Number(rec.working_hours || 0);
      });

      return result;
    },
    enabled: !!profile?.organization_id && employeeIds.length > 0,
  });
}

// Calculate payroll for a single employee
export function calculateEmployeePayroll(
  basicSalary: number,
  components: any[],
  attendance: { presentDays: number; absentDays: number; leaveDays: number; overtimeHours: number; lateMinutes: number; totalDays: number },
  taxSlabs: any[],
  loanDeduction: number,
  commission: number,
  overrides?: Record<string, number>,
  adjustments?: { name: string; amount: number; type: "earning" | "deduction" }[]
): EmployeePayrollCalc {
  const totalWorkingDays = attendance.totalDays || 26;
  const presentDays = attendance.presentDays || totalWorkingDays;
  const absentDays = attendance.absentDays || 0;
  const leaveDays = attendance.leaveDays || 0;

  // Pro-rate basic salary for absences (excluding approved leaves)
  const effectiveBasic = absentDays > 0
    ? basicSalary * ((totalWorkingDays - absentDays) / totalWorkingDays)
    : basicSalary;

  const earnings: PayrollComponentResult[] = [
    { name: "Basic Salary", code: "BASIC", amount: Math.round(effectiveBasic), type: "earning", isTaxable: true },
  ];
  const deductions: PayrollComponentResult[] = [];

  // Apply salary components
  components.forEach((comp: any) => {
    if (overrides && overrides[comp.code] !== undefined) {
      const entry: PayrollComponentResult = {
        name: comp.name, code: comp.code, amount: overrides[comp.code],
        type: comp.component_type, isTaxable: comp.is_taxable,
      };
      comp.component_type === "earning" ? earnings.push(entry) : deductions.push(entry);
      return;
    }

    let amount = 0;
    if (comp.calculation_type === "percentage") {
      const base = comp.percentage_of === "basic" ? effectiveBasic : 0;
      amount = Math.round((base * (comp.percentage_value || 0)) / 100);
    } else if (comp.calculation_type === "fixed") {
      amount = comp.percentage_value || 0; // fixed amount stored in percentage_value for simplicity
    }

    if (amount > 0) {
      const entry: PayrollComponentResult = {
        name: comp.name, code: comp.code, amount,
        type: comp.component_type, isTaxable: comp.is_taxable,
      };
      comp.component_type === "earning" ? earnings.push(entry) : deductions.push(entry);
    }
  });

  // Add commission
  if (commission > 0) {
    earnings.push({ name: "Doctor Commission", code: "COMMISSION", amount: commission, type: "earning", isTaxable: true });
  }

  // Add overtime
  if (attendance.overtimeHours > 0) {
    const hourlyRate = basicSalary / (totalWorkingDays * 8);
    const otAmount = Math.round(attendance.overtimeHours * hourlyRate * 1.5);
    earnings.push({ name: "Overtime", code: "OT", amount: otAmount, type: "earning", isTaxable: true });
  }

  // Add custom adjustments
  if (adjustments) {
    adjustments.forEach((adj) => {
      const entry: PayrollComponentResult = { name: adj.name, code: "ADJ", amount: adj.amount, type: adj.type, isTaxable: false };
      adj.type === "earning" ? earnings.push(entry) : deductions.push(entry);
    });
  }

  const grossSalary = earnings.reduce((sum, e) => sum + e.amount, 0);

  // Calculate income tax from slabs (annualize, then divide by 12)
  const taxableAnnual = earnings.filter((e) => e.isTaxable).reduce((sum, e) => sum + e.amount, 0) * 12;
  let annualTax = 0;
  if (taxSlabs.length > 0) {
    for (const slab of taxSlabs) {
      if (taxableAnnual >= (slab.min_income || 0) && taxableAnnual <= (slab.max_income || Infinity)) {
        annualTax = (slab.fixed_tax || 0) + ((taxableAnnual - (slab.min_income || 0)) * (slab.tax_percentage || 0)) / 100;
        break;
      }
    }
  }
  const monthlyTax = Math.round(annualTax / 12);
  if (monthlyTax > 0) {
    deductions.push({ name: "Income Tax", code: "TAX", amount: monthlyTax, type: "deduction", isTaxable: false });
  }

  // Add loan deduction
  if (loanDeduction > 0) {
    deductions.push({ name: "Loan EMI", code: "LOAN", amount: loanDeduction, type: "deduction", isTaxable: false });
  }

  // Late penalty (deduct per 3 late occurrences)
  if (attendance.lateMinutes > 60) {
    const latePenalty = Math.round((basicSalary / totalWorkingDays) * Math.floor(attendance.lateMinutes / 180));
    if (latePenalty > 0) {
      deductions.push({ name: "Late Penalty", code: "LATE", amount: latePenalty, type: "deduction", isTaxable: false });
    }
  }

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const netSalary = grossSalary - totalDeductions;

  return {
    employeeId: "",
    basicSalary,
    totalWorkingDays,
    presentDays,
    absentDays,
    leaveDays,
    overtimeHours: attendance.overtimeHours || 0,
    lateMinutes: attendance.lateMinutes || 0,
    earnings,
    deductions,
    grossSalary,
    totalDeductions,
    incomeTax: monthlyTax,
    netSalary,
  };
}
