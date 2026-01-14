import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AttendanceRecord = Database["public"]["Tables"]["attendance_records"]["Row"];
type AttendanceInsert = Database["public"]["Tables"]["attendance_records"]["Insert"];
type AttendanceCorrection = Database["public"]["Tables"]["attendance_corrections"]["Row"];
type AttendanceCorrectionInsert = Database["public"]["Tables"]["attendance_corrections"]["Insert"];
type BiometricDevice = Database["public"]["Tables"]["biometric_devices"]["Row"];
type BiometricDeviceInsert = Database["public"]["Tables"]["biometric_devices"]["Insert"];

// Attendance Records
export function useAttendanceRecords(filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  departmentId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["attendance-records", filters],
    queryFn: async () => {
      let query = supabase
        .from("attendance_records")
        .select(`
          *,
          employee:employee_id(
            id, 
            first_name, 
            last_name, 
            employee_number,
            department:department_id(id, name),
            designation:designation_id(id, name)
          )
        `)
        .order("attendance_date", { ascending: false });

      if (filters?.date) {
        query = query.eq("attendance_date", filters.date);
      }
      if (filters?.startDate) {
        query = query.gte("attendance_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("attendance_date", filters.endDate);
      }
      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status as Database["public"]["Enums"]["attendance_status"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAttendanceSheet(employeeId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["attendance-sheet", employeeId, month, year],
    queryFn: async () => {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("employee_id", employeeId)
        .gte("attendance_date", startDate)
        .lte("attendance_date", endDate)
        .order("attendance_date");
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: AttendanceInsert) => {
      const { data, error } = await supabase
        .from("attendance_records")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      toast.success("Attendance marked successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to mark attendance: " + error.message);
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AttendanceRecord> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("attendance_records")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      toast.success("Attendance updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update attendance: " + error.message);
    },
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (records: AttendanceInsert[]) => {
      const { data, error } = await supabase
        .from("attendance_records")
        .insert(records)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      toast.success("Attendance marked for all employees");
    },
    onError: (error: Error) => {
      toast.error("Failed to mark attendance: " + error.message);
    },
  });
}

// Attendance Corrections
export function useAttendanceCorrections(filters?: {
  status?: string;
  employeeId?: string;
}) {
  return useQuery({
    queryKey: ["attendance-corrections", filters],
    queryFn: async () => {
      let query = supabase
        .from("attendance_corrections")
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number),
          requested_by_profile:requested_by(id, full_name),
          approved_by_profile:approved_by(id, full_name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status as Database["public"]["Enums"]["leave_request_status"]);
      }
      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAttendanceCorrection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (correction: AttendanceCorrectionInsert) => {
      const { data, error } = await supabase
        .from("attendance_corrections")
        .insert(correction)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-corrections"] });
      toast.success("Correction request submitted");
    },
    onError: (error: Error) => {
      toast.error("Failed to submit correction: " + error.message);
    },
  });
}

export function useApproveAttendanceCorrection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean; rejectionReason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: Partial<AttendanceCorrection> = {
        status: approved ? "approved" : "rejected",
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("attendance_corrections")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;

      // If approved, update the original attendance record
      if (approved && data.attendance_id) {
        await supabase
          .from("attendance_records")
          .update({
            check_in: data.corrected_check_in,
            check_out: data.corrected_check_out,
            adjusted_by: user?.id,
            adjusted_at: new Date().toISOString(),
            adjustment_reason: data.reason,
          })
          .eq("id", data.attendance_id);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-corrections"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      toast.success(`Correction ${variables.approved ? "approved" : "rejected"}`);
    },
    onError: (error: Error) => {
      toast.error("Failed to process correction: " + error.message);
    },
  });
}

// Biometric Devices
export function useBiometricDevices() {
  return useQuery({
    queryKey: ["biometric-devices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("biometric_devices")
        .select("*, branch:branch_id(id, name)")
        .order("device_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBiometricDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (device: BiometricDeviceInsert) => {
      const { data, error } = await supabase
        .from("biometric_devices")
        .insert(device)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-devices"] });
      toast.success("Device registered successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to register device: " + error.message);
    },
  });
}

export function useUpdateBiometricDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BiometricDevice> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("biometric_devices")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-devices"] });
      toast.success("Device updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update device: " + error.message);
    },
  });
}

export function useDeleteBiometricDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("biometric_devices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-devices"] });
      toast.success("Device deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete device: " + error.message);
    },
  });
}

// Attendance Stats
export function useAttendanceStats(date: string) {
  return useQuery({
    queryKey: ["attendance-stats", date],
    queryFn: async () => {
      const { data: records, error } = await supabase
        .from("attendance_records")
        .select("status")
        .eq("attendance_date", date);
      
      if (error) throw error;
      
      const stats = {
        present: records?.filter(r => r.status === "present").length || 0,
        absent: records?.filter(r => r.status === "absent").length || 0,
        halfDay: records?.filter(r => r.status === "half_day").length || 0,
        late: records?.filter(r => r.status === "late").length || 0,
        onLeave: records?.filter(r => r.status === "on_leave").length || 0,
        weekOff: records?.filter(r => r.status === "weekend").length || 0,
        holiday: records?.filter(r => r.status === "holiday").length || 0,
      };
      
      return stats;
    },
  });
}

// Monthly Attendance Summary
export function useMonthlyAttendanceSummary(employeeId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["monthly-attendance-summary", employeeId, month, year],
    queryFn: async () => {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("attendance_records")
        .select("status, late_minutes, overtime_hours, working_hours")
        .eq("employee_id", employeeId)
        .gte("attendance_date", startDate)
        .lte("attendance_date", endDate);
      
      if (error) throw error;
      
      const summary = {
        totalDays: data?.length || 0,
        present: data?.filter(r => r.status === "present").length || 0,
        absent: data?.filter(r => r.status === "absent").length || 0,
        halfDay: data?.filter(r => r.status === "half_day").length || 0,
        late: data?.filter(r => r.status === "late").length || 0,
        onLeave: data?.filter(r => r.status === "on_leave").length || 0,
        totalLateMinutes: data?.reduce((sum, r) => sum + (r.late_minutes || 0), 0) || 0,
        totalOvertimeHours: data?.reduce((sum, r) => sum + (r.overtime_hours || 0), 0) || 0,
        totalWorkingHours: data?.reduce((sum, r) => sum + (r.working_hours || 0), 0) || 0,
      };
      
      return summary;
    },
    enabled: !!employeeId,
  });
}
