import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type LeaveType = Database["public"]["Tables"]["leave_types"]["Row"];
type LeaveTypeInsert = Database["public"]["Tables"]["leave_types"]["Insert"];
type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"];
type LeaveRequestInsert = Database["public"]["Tables"]["leave_requests"]["Insert"];
type LeaveBalance = Database["public"]["Tables"]["leave_balances"]["Row"];
type LeaveBalanceInsert = Database["public"]["Tables"]["leave_balances"]["Insert"];

// Helper: lookup department head's profile_id for an employee
async function getDepartmentHeadProfileId(employeeId: string): Promise<string | null> {
  // Get employee's department
  const { data: emp } = await supabase
    .from("employees")
    .select("department_id")
    .eq("id", employeeId)
    .single();

  if (!emp?.department_id) return null;

  // Get department head employee
  const { data: dept } = await supabase
    .from("departments")
    .select("head_employee_id")
    .eq("id", emp.department_id)
    .single();

  if (!dept?.head_employee_id) return null;

  // Don't assign self as approver
  if (dept.head_employee_id === employeeId) return null;

  // Get head's profile_id
  const { data: headEmp } = await supabase
    .from("employees")
    .select("profile_id")
    .eq("id", dept.head_employee_id)
    .single();

  return headEmp?.profile_id || null;
}

// Leave Types
export function useLeaveTypes() {
  return useQuery({
    queryKey: ["leave-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leaveType: LeaveTypeInsert) => {
      const { data, error } = await supabase
        .from("leave_types")
        .insert(leaveType)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      toast.success("Leave type created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create leave type: " + error.message);
    },
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<LeaveType> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("leave_types")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      toast.success("Leave type updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update leave type: " + error.message);
    },
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leave_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      toast.success("Leave type deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete leave type: " + error.message);
    },
  });
}

// Leave Requests
export function useLeaveRequests(filters?: {
  status?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["leave-requests", filters],
    queryFn: async () => {
      let query = supabase
        .from("leave_requests")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number, department:department_id(id, name)),
          leave_type:leave_type_id(id, name, code, color),
          approved_by_profile:approved_by(id, full_name),
          approver_1_profile:approver_1_id(id, full_name),
          approver_2_profile:approver_2_id(id, full_name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status as Database["public"]["Enums"]["leave_request_status"]);
      }
      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }
      if (filters?.startDate) {
        query = query.gte("start_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("end_date", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function usePendingLeaveRequests() {
  return useQuery({
    queryKey: ["leave-requests", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_requests")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number, department:department_id(id, name)),
          leave_type:leave_type_id(id, name, code, color)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: LeaveRequestInsert) => {
      // Auto-assign department head as approver_1
      const approver1Id = await getDepartmentHeadProfileId(request.employee_id);
      
      const { data, error } = await supabase
        .from("leave_requests")
        .insert({
          ...request,
          approver_1_id: approver1Id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-approval-requests"] });
      toast.success("Leave request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to submit leave request: " + error.message);
    },
  });
}

// Legacy direct approve (for super_admin/org_admin)
export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      id, 
      approved, 
      rejectionReason 
    }: { 
      id: string; 
      approved: boolean; 
      rejectionReason?: string 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("leave_requests")
        .update({
          status: approved ? "approved" : "rejected",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          // Also set both approver actions for completeness
          approver_1_action: approved ? "approved" : "rejected",
          approver_1_at: new Date().toISOString(),
          approver_2_action: approved ? "approved" : "rejected",
          approver_2_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["my-approval-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
      toast.success(`Leave request ${variables.approved ? "approved" : "rejected"}`);
    },
    onError: (error: Error) => {
      toast.error("Failed to process leave request: " + error.message);
    },
  });
}

// Level 1: Department Head approval
export function useLevel1ApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      approved,
      remarks,
    }: {
      id: string;
      approved: boolean;
      remarks?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: Record<string, any> = {
        approver_1_action: approved ? "approved" : "rejected",
        approver_1_at: new Date().toISOString(),
        approver_1_remarks: remarks || null,
      };

      // If rejected at Level 1, set overall status to rejected
      if (!approved) {
        updateData.status = "rejected";
        updateData.rejection_reason = remarks || "Rejected by Department Head";
      }

      const { data, error } = await supabase
        .from("leave_requests")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-approval-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-stats"] });
      toast.success(
        variables.approved
          ? "Approved — forwarded to HR Manager"
          : "Leave request rejected"
      );
    },
    onError: (error: Error) => {
      toast.error("Failed to process: " + error.message);
    },
  });
}

// Level 2: HR Manager approval
export function useLevel2ApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      approved,
      remarks,
    }: {
      id: string;
      approved: boolean;
      remarks?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: Record<string, any> = {
        approver_2_id: user?.id,
        approver_2_action: approved ? "approved" : "rejected",
        approver_2_at: new Date().toISOString(),
        approver_2_remarks: remarks || null,
        status: approved ? "approved" : "rejected",
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      };

      if (!approved) {
        updateData.rejection_reason = remarks || "Rejected by HR Manager";
      }

      const { data, error } = await supabase
        .from("leave_requests")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["my-approval-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-stats"] });
      toast.success(
        variables.approved ? "Leave request approved" : "Leave request rejected"
      );
    },
    onError: (error: Error) => {
      toast.error("Failed to process: " + error.message);
    },
  });
}

// Convenience wrappers for approve/reject
export function useApproveLeave() {
  const approveLeaveRequest = useApproveLeaveRequest();
  return {
    ...approveLeaveRequest,
    mutateAsync: (id: string) => approveLeaveRequest.mutateAsync({ id, approved: true }),
  };
}

export function useRejectLeave() {
  const approveLeaveRequest = useApproveLeaveRequest();
  return {
    ...approveLeaveRequest,
    mutateAsync: ({ id, reason }: { id: string; reason?: string }) => 
      approveLeaveRequest.mutateAsync({ id, approved: false, rejectionReason: reason }),
  };
}

export function useCancelLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leave_requests")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
      toast.success("Leave request cancelled");
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel leave request: " + error.message);
    },
  });
}

// Leave Balances
export function useLeaveBalances(filters?: {
  employeeId?: string;
  year?: number;
}) {
  return useQuery({
    queryKey: ["leave-balances", filters],
    queryFn: async () => {
      let query = supabase
        .from("leave_balances")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number),
          leave_type:leave_type_id(id, name, code, color)
        `)
        .order("year", { ascending: false });

      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }
      if (filters?.year) {
        query = query.eq("year", filters.year);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useEmployeeLeaveBalance(employeeId: string, year?: number) {
  const currentYear = year || new Date().getFullYear();
  return useQuery({
    queryKey: ["leave-balance", employeeId, currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_balances")
        .select(`
          *,
          leave_type:leave_type_id(id, name, code, color, is_paid)
        `)
        .eq("employee_id", employeeId)
        .eq("year", currentYear);
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useCreateLeaveBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (balance: LeaveBalanceInsert) => {
      const { data, error } = await supabase
        .from("leave_balances")
        .insert(balance)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      toast.success("Leave balance created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create leave balance: " + error.message);
    },
  });
}

export function useUpdateLeaveBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<LeaveBalance> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("leave_balances")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      toast.success("Leave balance updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update leave balance: " + error.message);
    },
  });
}

export function useInitializeLeaveBalances() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, year }: { employeeId: string; year: number }) => {
      const { data: leaveTypes, error: ltError } = await supabase
        .from("leave_types")
        .select("id, annual_quota")
        .eq("is_active", true);
      
      if (ltError) throw ltError;

      const balances = leaveTypes?.map(lt => ({
        employee_id: employeeId,
        leave_type_id: lt.id,
        year,
        entitled_days: lt.annual_quota || 0,
        used_days: 0,
        carried_forward: 0,
      })) || [];

      const { data, error } = await supabase
        .from("leave_balances")
        .insert(balances)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      toast.success("Leave balances initialized");
    },
    onError: (error: Error) => {
      toast.error("Failed to initialize balances: " + error.message);
    },
  });
}

// Leave Stats
export function useLeaveStats() {
  return useQuery({
    queryKey: ["leave-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      const { data: pending, error: pendingError } = await supabase
        .from("leave_requests")
        .select("id", { count: "exact" })
        .eq("status", "pending");
      
      if (pendingError) throw pendingError;
      
      const { data: onLeaveToday, error: todayError } = await supabase
        .from("leave_requests")
        .select("id", { count: "exact" })
        .eq("status", "approved")
        .lte("start_date", today)
        .gte("end_date", today);
      
      if (todayError) throw todayError;
      
      return {
        pendingRequests: pending?.length || 0,
        onLeaveToday: onLeaveToday?.length || 0,
      };
    },
  });
}

// Leave Calendar Data
export function useLeaveCalendar(month: number, year: number) {
  return useQuery({
    queryKey: ["leave-calendar", month, year],
    queryFn: async () => {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("leave_requests")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name),
          leave_type:leave_type_id(id, name, color)
        `)
        .eq("status", "approved")
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);
      
      if (error) throw error;
      return data;
    },
  });
}

// My Approval Queue - requests where current user is approver_1 or approver_2
export function useMyApprovalRequests() {
  return useQuery({
    queryKey: ["my-approval-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("leave_requests")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number, department:department_id(id, name)),
          leave_type:leave_type_id(id, name, code, color),
          approver_1_profile:approver_1_id(id, full_name),
          approver_2_profile:approver_2_id(id, full_name)
        `)
        .eq("status", "pending")
        .or(`approver_1_id.eq.${user.id},approver_2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

// Helper to determine approval stage
export function getApprovalStage(request: any): {
  stage: "awaiting_dept_head" | "awaiting_hr" | "approved" | "rejected" | "cancelled";
  label: string;
  labelAr: string;
  labelUr: string;
} {
  if (request.status === "approved") {
    return { stage: "approved", label: "Approved", labelAr: "موافق عليه", labelUr: "منظور شدہ" };
  }
  if (request.status === "rejected") {
    return { stage: "rejected", label: "Rejected", labelAr: "مرفوض", labelUr: "مسترد" };
  }
  if (request.status === "cancelled") {
    return { stage: "cancelled", label: "Cancelled", labelAr: "ملغى", labelUr: "منسوخ" };
  }
  
  // Pending — check which level
  if (!request.approver_1_action || request.approver_1_action === "pending") {
    return { stage: "awaiting_dept_head", label: "Awaiting Dept Head", labelAr: "بانتظار رئيس القسم", labelUr: "شعبہ سربراہ کی منظوری" };
  }
  if (request.approver_1_action === "approved" && (!request.approver_2_action || request.approver_2_action === "pending")) {
    return { stage: "awaiting_hr", label: "Awaiting HR Manager", labelAr: "بانتظار مدير الموارد البشرية", labelUr: "ایچ آر مینیجر کی منظوری" };
  }
  
  return { stage: "awaiting_dept_head", label: "Pending", labelAr: "قيد الانتظار", labelUr: "زیر التوا" };
}