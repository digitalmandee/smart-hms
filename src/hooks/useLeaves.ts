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
          approved_by_profile:approved_by(id, full_name)
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
      const { data, error } = await supabase
        .from("leave_requests")
        .insert(request)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast.success("Leave request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to submit leave request: " + error.message);
    },
  });
}

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
      toast.success(`Leave request ${variables.approved ? "approved" : "rejected"}`);
    },
    onError: (error: Error) => {
      toast.error("Failed to process leave request: " + error.message);
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
      // Get all leave types
      const { data: leaveTypes, error: ltError } = await supabase
        .from("leave_types")
        .select("id, annual_quota")
        .eq("is_active", true);
      
      if (ltError) throw ltError;

      // Create balance for each leave type
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
