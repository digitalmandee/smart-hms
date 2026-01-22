import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Department = Database["public"]["Tables"]["departments"]["Row"];
type DepartmentInsert = Database["public"]["Tables"]["departments"]["Insert"];
type Designation = Database["public"]["Tables"]["designations"]["Row"];
type DesignationInsert = Database["public"]["Tables"]["designations"]["Insert"];
type EmployeeCategory = Database["public"]["Tables"]["employee_categories"]["Row"];
type EmployeeCategoryInsert = Database["public"]["Tables"]["employee_categories"]["Insert"];
type Employee = Database["public"]["Tables"]["employees"]["Row"];
type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"];
type Shift = Database["public"]["Tables"]["shifts"]["Row"];
type ShiftInsert = Database["public"]["Tables"]["shifts"]["Insert"];
type Holiday = Database["public"]["Tables"]["holidays"]["Row"];
type HolidayInsert = Database["public"]["Tables"]["holidays"]["Insert"];

// Departments
export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*, parent_department:parent_department_id(*), head:head_employee_id(*)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (department: DepartmentInsert) => {
      const { data, error } = await supabase
        .from("departments")
        .insert(department)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create department: " + error.message);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Department> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("departments")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update department: " + error.message);
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete department: " + error.message);
    },
  });
}

// Designations
export function useDesignations() {
  return useQuery({
    queryKey: ["designations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("designations")
        .select("*, department:department_id(id, name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (designation: DesignationInsert) => {
      const { data, error } = await supabase
        .from("designations")
        .insert(designation)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      toast.success("Designation created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create designation: " + error.message);
    },
  });
}

export function useUpdateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Designation> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("designations")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      toast.success("Designation updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update designation: " + error.message);
    },
  });
}

export function useDeleteDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("designations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      toast.success("Designation deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete designation: " + error.message);
    },
  });
}

// Employee Categories
export function useEmployeeCategories() {
  return useQuery({
    queryKey: ["employee-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEmployeeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: EmployeeCategoryInsert) => {
      const { data, error } = await supabase
        .from("employee_categories")
        .insert(category)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-categories"] });
      toast.success("Employee category created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });
}

export function useUpdateEmployeeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmployeeCategory> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("employee_categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update category: " + error.message);
    },
  });
}

export function useDeleteEmployeeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete category: " + error.message);
    },
  });
}

// Employees
export function useEmployees(filters?: {
  departmentId?: string;
  categoryId?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: async () => {
      let query = supabase
        .from("employees")
        .select(`
          *,
          department:department_id(id, name),
          designation:designation_id(id, name),
          category:category_id(id, name, color),
          branch:branch_id(id, name)
        `)
        .order("first_name");

      if (filters?.departmentId) {
        query = query.eq("department_id", filters.departmentId);
      }
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters?.status) {
        query = query.eq("employment_status", filters.status as Database["public"]["Enums"]["employment_status"]);
      }
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,employee_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          department:department_id(id, name, code),
          designation:designation_id(id, name, code),
          category:category_id(id, name, color),
          branch:branch_id(id, name, code)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: EmployeeInsert) => {
      const { data, error } = await supabase
        .from("employees")
        .insert(employee)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create employee: " + error.message);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Employee> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("employees")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
      toast.success("Employee updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update employee: " + error.message);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete employee: " + error.message);
    },
  });
}

// Shifts
export function useShifts() {
  return useQuery({
    queryKey: ["shifts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shifts")
        .select("*, color")
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shift: ShiftInsert) => {
      const { data, error } = await supabase
        .from("shifts")
        .insert(shift)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create shift: " + error.message);
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Shift> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("shifts")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update shift: " + error.message);
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shifts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete shift: " + error.message);
    },
  });
}

// Holidays
export function useHolidays(year?: number) {
  return useQuery({
    queryKey: ["holidays", year],
    queryFn: async () => {
      let query = supabase.from("holidays").select("*").order("holiday_date");
      
      if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        query = query.gte("holiday_date", startDate).lte("holiday_date", endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (holiday: HolidayInsert) => {
      const { data, error } = await supabase
        .from("holidays")
        .insert(holiday)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create holiday: " + error.message);
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Holiday> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("holidays")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update holiday: " + error.message);
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("holidays").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete holiday: " + error.message);
    },
  });
}

// Shift Assignments
type ShiftAssignmentInsert = Database["public"]["Tables"]["shift_assignments"]["Insert"];

export function useShiftAssignments(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["shift-assignments", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("shift_assignments")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number),
          shift:shift_id(id, name, code, start_time, end_time, is_active, is_night_shift)
        `)
        .eq("is_current", true);
      
      if (startDate) {
        query = query.lte("effective_from", endDate || startDate);
      }
      if (endDate) {
        query = query.or(`effective_to.is.null,effective_to.gte.${startDate}`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateShiftAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignment: ShiftAssignmentInsert) => {
      // First, set all existing assignments for this employee to not current
      await supabase
        .from("shift_assignments")
        .update({ is_current: false, effective_to: assignment.effective_from })
        .eq("employee_id", assignment.employee_id)
        .eq("is_current", true);
      
      // Create the new assignment
      const { data, error } = await supabase
        .from("shift_assignments")
        .insert({ ...assignment, is_current: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-assignments"] });
      toast.success("Shift assignment created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create shift assignment: " + error.message);
    },
  });
}

export function useDeleteShiftAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shift_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-assignments"] });
      toast.success("Shift assignment removed");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove shift assignment: " + error.message);
    },
  });
}

// On-Call Schedules
type OnCallSchedule = Database["public"]["Tables"]["on_call_schedules"]["Row"];
type OnCallScheduleInsert = Database["public"]["Tables"]["on_call_schedules"]["Insert"];

export function useOnCallSchedules(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["on-call-schedules", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("on_call_schedules")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number, profile_photo_url),
          department:department_id(id, name)
        `)
        .order("schedule_date");
      
      if (startDate) {
        query = query.gte("schedule_date", startDate);
      }
      if (endDate) {
        query = query.lte("schedule_date", endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!startDate,
  });
}

export function useCreateOnCallSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schedule: OnCallScheduleInsert) => {
      const { data, error } = await supabase
        .from("on_call_schedules")
        .insert(schedule)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["on-call-schedules"] });
      toast.success("On-call schedule created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create on-call schedule: " + error.message);
    },
  });
}

export function useUpdateOnCallSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<OnCallSchedule> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("on_call_schedules")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["on-call-schedules"] });
      toast.success("On-call schedule updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update on-call schedule: " + error.message);
    },
  });
}

export function useDeleteOnCallSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("on_call_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["on-call-schedules"] });
      toast.success("On-call schedule deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete on-call schedule: " + error.message);
    },
  });
}

// Employee Stats for Dashboard
export function useEmployeeStats() {
  return useQuery({
    queryKey: ["employee-stats"],
    queryFn: async () => {
      const { data: employees, error } = await supabase
        .from("employees")
        .select("id, employment_status, join_date, date_of_birth");
      
      if (error) throw error;
      
      const today = new Date();
      const thisMonth = today.getMonth();
      
      const stats = {
        total: employees?.length || 0,
        active: employees?.filter(e => e.employment_status === "active").length || 0,
        onProbation: 0, // probation status not in enum, will count separately if needed
        recentJoiners: employees?.filter(e => {
          if (!e.join_date) return false;
          const joinDate = new Date(e.join_date);
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return joinDate >= thirtyDaysAgo;
        }).length || 0,
        birthdaysThisMonth: employees?.filter(e => {
          if (!e.date_of_birth) return false;
          const dob = new Date(e.date_of_birth);
          return dob.getMonth() === thisMonth;
        }).length || 0,
      };
      
      return stats;
    },
  });
}
