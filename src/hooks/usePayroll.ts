import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type SalaryComponent = Database["public"]["Tables"]["salary_components"]["Row"];
type SalaryComponentInsert = Database["public"]["Tables"]["salary_components"]["Insert"];
type SalaryStructure = Database["public"]["Tables"]["salary_structures"]["Row"];
type SalaryStructureInsert = Database["public"]["Tables"]["salary_structures"]["Insert"];
type EmployeeSalary = Database["public"]["Tables"]["employee_salaries"]["Row"];
type EmployeeSalaryInsert = Database["public"]["Tables"]["employee_salaries"]["Insert"];
type PayrollRun = Database["public"]["Tables"]["payroll_runs"]["Row"];
type PayrollRunInsert = Database["public"]["Tables"]["payroll_runs"]["Insert"];
type EmployeeLoan = Database["public"]["Tables"]["employee_loans"]["Row"];
type EmployeeLoanInsert = Database["public"]["Tables"]["employee_loans"]["Insert"];
type TaxSlab = Database["public"]["Tables"]["tax_slabs"]["Row"];
type TaxSlabInsert = Database["public"]["Tables"]["tax_slabs"]["Insert"];

// Salary Components
export function useSalaryComponents() {
  return useQuery({
    queryKey: ["salary-components"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_components")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSalaryComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (component: SalaryComponentInsert) => {
      const { data, error } = await supabase
        .from("salary_components")
        .insert(component)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-components"] });
      toast.success("Salary component created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create component: " + error.message);
    },
  });
}

export function useUpdateSalaryComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SalaryComponent> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("salary_components")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-components"] });
      toast.success("Component updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update component: " + error.message);
    },
  });
}

export function useDeleteSalaryComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("salary_components").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-components"] });
      toast.success("Component deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete component: " + error.message);
    },
  });
}

// Salary Structures
export function useSalaryStructures() {
  return useQuery({
    queryKey: ["salary-structures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_structures")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (structure: SalaryStructureInsert) => {
      const { data, error } = await supabase
        .from("salary_structures")
        .insert(structure)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      toast.success("Salary structure created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create structure: " + error.message);
    },
  });
}

export function useUpdateSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SalaryStructure> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("salary_structures")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      toast.success("Structure updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update structure: " + error.message);
    },
  });
}

export function useDeleteSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("salary_structures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      toast.success("Structure deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete structure: " + error.message);
    },
  });
}

// Employee Salaries
export function useEmployeeSalaries(filters?: { employeeId?: string; isCurrent?: boolean }) {
  return useQuery({
    queryKey: ["employee-salaries", filters],
    queryFn: async () => {
      let query = supabase
        .from("employee_salaries")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number),
          salary_structure:salary_structure_id(id, name)
        `)
        .order("effective_from", { ascending: false });

      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }
      if (filters?.isCurrent) {
        query = query.eq("is_current", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useEmployeeCurrentSalary(employeeId: string) {
  return useQuery({
    queryKey: ["employee-salary", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_salaries")
        .select(`
          *,
          salary_structure:salary_structure_id(*)
        `)
        .eq("employee_id", employeeId)
        .eq("is_current", true)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useCreateEmployeeSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (salary: EmployeeSalaryInsert) => {
      // First, mark existing salary as not current
      if (salary.is_current) {
        await supabase
          .from("employee_salaries")
          .update({ is_current: false, effective_to: salary.effective_from })
          .eq("employee_id", salary.employee_id)
          .eq("is_current", true);
      }

      const { data, error } = await supabase
        .from("employee_salaries")
        .insert(salary)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-salaries"] });
      queryClient.invalidateQueries({ queryKey: ["employee-salary"] });
      toast.success("Salary assigned successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to assign salary: " + error.message);
    },
  });
}

// Payroll Runs
export function usePayrollRuns() {
  return useQuery({
    queryKey: ["payroll-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select(`
          *,
          processed_by_profile:processed_by(id, full_name),
          approved_by_profile:approved_by(id, full_name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function usePayrollRun(id: string) {
  return useQuery({
    queryKey: ["payroll-run", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function usePayrollDetails(payrollRunId: string) {
  return useQuery({
    queryKey: ["payroll-details", payrollRunId],
    queryFn: async () => {
      if (!payrollRunId) return [];
      
      const { data, error } = await supabase
        .from("payroll_entries")
        .select(`
          *,
          employee:employees!payroll_entries_employee_id_fkey(
            id, first_name, last_name, employee_number,
            department:departments(name),
            designation:designations(name)
          )
        `)
        .eq("payroll_run_id", payrollRunId);
      
      if (error) {
        console.error("Payroll details error:", error);
        throw error;
      }
      console.log(`Loaded ${data?.length || 0} payroll entries for run ${payrollRunId}`);
      return data || [];
    },
    enabled: !!payrollRunId && payrollRunId.length > 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

// Employee Payslips (for employee profile view)
export function useEmployeePayslips(employeeId: string) {
  return useQuery({
    queryKey: ["employee-payslips", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_entries")
        .select(`
          *,
          payroll_run:payroll_runs(id, month, year, pay_date, status)
        `)
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
}

// My Payslips (for self-service - uses profile_id to find employee)
export function useMyPayslips() {
  return useQuery({
    queryKey: ["my-payslips"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // First, find the employee by profile_id
      const { data: employee, error: empError } = await supabase
        .from("employees")
        .select("id")
        .eq("profile_id", user.id)
        .single();
      
      if (empError || !employee) {
        return [];
      }
      
      // Then fetch their payslips
      const { data, error } = await supabase
        .from("payroll_entries")
        .select(`
          *,
          payroll_run:payroll_runs(id, month, year, pay_date, status)
        `)
        .eq("employee_id", employee.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payrollRun: PayrollRunInsert) => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .insert(payrollRun)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create payroll run: " + error.message);
    },
  });
}

// Create payroll entries for each employee in a payroll run
export function useCreatePayrollEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entries: Array<{
      payroll_run_id: string;
      employee_id: string;
      basic_salary: number;
      gross_salary: number;
      net_salary: number;
      total_deductions: number;
      total_working_days?: number;
      present_days?: number;
      absent_days?: number;
      leave_days?: number;
      earnings?: any;
      deductions?: any;
      bank_name?: string | null;
      account_number?: string | null;
    }>) => {
      const { error } = await supabase
        .from("payroll_entries")
        .insert(entries);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-details"] });
      queryClient.invalidateQueries({ queryKey: ["employee-payslips"] });
      queryClient.invalidateQueries({ queryKey: ["my-payslips"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create payroll entries: " + error.message);
    },
  });
}

export function useUpdatePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<PayrollRun> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("payroll_runs")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-run", variables.id] });
      toast.success("Payroll run updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update payroll run: " + error.message);
    },
  });
}

// Employee Loans
export function useEmployeeLoans(filters?: { employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: ["employee-loans", filters],
    queryFn: async () => {
      let query = supabase
        .from("employee_loans")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number),
          approved_by_profile:approved_by(id, full_name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status as Database["public"]["Enums"]["loan_status"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEmployeeLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (loan: EmployeeLoanInsert) => {
      const { data, error } = await supabase
        .from("employee_loans")
        .insert({
          ...loan,
          remaining_amount: loan.loan_amount,
          paid_installments: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-loans"] });
      toast.success("Loan application submitted");
    },
    onError: (error: Error) => {
      toast.error("Failed to submit loan: " + error.message);
    },
  });
}

export function useApproveLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("employee_loans")
        .update({
          status: approved ? "active" : "cancelled",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employee-loans"] });
      toast.success(`Loan ${variables.approved ? "approved" : "rejected"}`);
    },
    onError: (error: Error) => {
      toast.error("Failed to process loan: " + error.message);
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmployeeLoan> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("employee_loans")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-loans"] });
      toast.success("Loan updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update loan: " + error.message);
    },
  });
}

// Tax Slabs
export function useTaxSlabs(fiscalYear?: string) {
  return useQuery({
    queryKey: ["tax-slabs", fiscalYear],
    queryFn: async () => {
      let query = supabase
        .from("tax_slabs")
        .select("*")
        .order("min_income");

      if (fiscalYear) {
        query = query.eq("fiscal_year", fiscalYear);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTaxSlab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slab: TaxSlabInsert) => {
      const { data, error } = await supabase
        .from("tax_slabs")
        .insert(slab)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-slabs"] });
      toast.success("Tax slab created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create tax slab: " + error.message);
    },
  });
}

export function useUpdateTaxSlab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<TaxSlab> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("tax_slabs")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-slabs"] });
      toast.success("Tax slab updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update tax slab: " + error.message);
    },
  });
}

export function useDeleteTaxSlab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tax_slabs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-slabs"] });
      toast.success("Tax slab deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete tax slab: " + error.message);
    },
  });
}

// Payroll Stats
export function usePayrollStats() {
  return useQuery({
    queryKey: ["payroll-stats"],
    queryFn: async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data: currentPayroll, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      
      const { data: activeLoans } = await supabase
        .from("employee_loans")
        .select("remaining_amount")
        .eq("status", "active");
      
      return {
        currentPayrollStatus: currentPayroll?.status || "not_started",
        pendingLoanApprovals: 0,
        totalActiveLoanAmount: activeLoans?.reduce((sum, l) => sum + (l.remaining_amount || 0), 0) || 0,
      };
    },
  });
}
