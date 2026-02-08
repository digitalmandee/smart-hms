import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface OPDDepartment {
  id: string;
  organization_id: string;
  branch_id: string;
  name: string;
  code: string;
  description: string | null;
  location: string | null;
  rooms: string | null;
  color: string | null;
  is_active: boolean;
  display_order: number;
  head_doctor_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  head_doctor?: {
    id: string;
    profile: { full_name: string };
    specialization: string | null;
  };
  specializations?: {
    id: string;
    specialization_id: string;
    specialization: { id: string; name: string };
  }[];
}

export interface OPDDepartmentInsert {
  name: string;
  code: string;
  description?: string;
  location?: string;
  rooms?: string;
  color?: string;
  display_order?: number;
  head_doctor_id?: string;
  branch_id?: string;
}

// Fetch all active OPD departments for current branch
export function useOPDDepartments(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["opd-departments", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return [];

      const { data, error } = await supabase
        .from("opd_departments")
        .select(`
          *,
          head_doctor:doctors!opd_departments_head_doctor_id_fkey(
            id,
            specialization,
            profile:profiles(full_name)
          ),
          specializations:opd_department_specializations(
            id,
            specialization_id,
            specialization:specializations(id, name)
          )
        `)
        .eq("branch_id", targetBranchId)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as OPDDepartment[];
    },
    enabled: !!targetBranchId,
  });
}

// Fetch all OPD departments (including inactive) for management
export function useAllOPDDepartments(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["all-opd-departments", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return [];

      const { data, error } = await supabase
        .from("opd_departments")
        .select(`
          *,
          head_doctor:doctors!opd_departments_head_doctor_id_fkey(
            id,
            specialization,
            profile:profiles(full_name)
          ),
          specializations:opd_department_specializations(
            id,
            specialization_id,
            specialization:specializations(id, name)
          )
        `)
        .eq("branch_id", targetBranchId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as OPDDepartment[];
    },
    enabled: !!targetBranchId,
  });
}

// Fetch single OPD department
export function useOPDDepartment(id?: string) {
  return useQuery({
    queryKey: ["opd-department", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("opd_departments")
        .select(`
          *,
          head_doctor:doctors!opd_departments_head_doctor_id_fkey(
            id,
            specialization,
            profile:profiles(full_name)
          ),
          specializations:opd_department_specializations(
            id,
            specialization_id,
            specialization:specializations(id, name)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as OPDDepartment;
    },
    enabled: !!id,
  });
}

// Create OPD department
export function useCreateOPDDepartment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: OPDDepartmentInsert) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("User profile not loaded");
      }

      const { data: result, error } = await supabase
        .from("opd_departments")
        .insert({
          organization_id: profile.organization_id,
          branch_id: data.branch_id || profile.branch_id,
          name: data.name,
          code: data.code.toUpperCase(),
          description: data.description,
          location: data.location,
          rooms: data.rooms,
          color: data.color || "#3b82f6",
          display_order: data.display_order || 0,
          head_doctor_id: data.head_doctor_id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-departments"] });
      queryClient.invalidateQueries({ queryKey: ["all-opd-departments"] });
      toast.success("OPD Department created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create OPD department");
    },
  });
}

// Update OPD department
export function useUpdateOPDDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<OPDDepartmentInsert> & { id: string; is_active?: boolean }) => {
      const updates: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      if (data.code) {
        updates.code = data.code.toUpperCase();
      }

      const { data: result, error } = await supabase
        .from("opd_departments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["opd-departments"] });
      queryClient.invalidateQueries({ queryKey: ["all-opd-departments"] });
      queryClient.invalidateQueries({ queryKey: ["opd-department", variables.id] });
      toast.success("OPD Department updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update OPD department");
    },
  });
}

// Delete (soft) OPD department
export function useDeleteOPDDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("opd_departments")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-departments"] });
      queryClient.invalidateQueries({ queryKey: ["all-opd-departments"] });
      toast.success("OPD Department deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete OPD department");
    },
  });
}

// Assign specializations to OPD department
export function useAssignSpecializations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      opdDepartmentId,
      specializationIds,
    }: {
      opdDepartmentId: string;
      specializationIds: string[];
    }) => {
      // First, remove all existing specializations
      const { error: deleteError } = await supabase
        .from("opd_department_specializations")
        .delete()
        .eq("opd_department_id", opdDepartmentId);

      if (deleteError) throw deleteError;

      // Then, add new specializations
      if (specializationIds.length > 0) {
        const { error: insertError } = await supabase
          .from("opd_department_specializations")
          .insert(
            specializationIds.map((specId) => ({
              opd_department_id: opdDepartmentId,
              specialization_id: specId,
            }))
          );

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-departments"] });
      queryClient.invalidateQueries({ queryKey: ["all-opd-departments"] });
      queryClient.invalidateQueries({ queryKey: ["opd-department"] });
      toast.success("Specializations assigned successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign specializations");
    },
  });
}

// Find OPD department by doctor's specialization
export function useFindOPDDepartmentByDoctor() {
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      // Get doctor's specialization (text field)
      const { data: doctor, error: doctorError } = await supabase
        .from("doctors")
        .select("specialization")
        .eq("id", doctorId)
        .single();

      if (doctorError || !doctor?.specialization) return null;

      // Find specialization ID by name
      const { data: spec, error: specError } = await supabase
        .from("specializations")
        .select("id")
        .ilike("name", doctor.specialization)
        .limit(1)
        .maybeSingle();

      if (specError || !spec) return null;

      // Find OPD department containing this specialization
      const { data: deptSpec, error: deptError } = await supabase
        .from("opd_department_specializations")
        .select(`
          opd_department:opd_departments!inner(
            id,
            code,
            name,
            branch_id,
            is_active
          )
        `)
        .eq("specialization_id", spec.id)
        .eq("opd_department.branch_id", profile?.branch_id)
        .eq("opd_department.is_active", true)
        .limit(1)
        .maybeSingle();

      if (deptError || !deptSpec) return null;

      return (deptSpec as any).opd_department as { id: string; code: string; name: string };
    },
  });
}

// Generate token for OPD department
export function useGenerateOPDToken() {
  return useMutation({
    mutationFn: async ({
      opdDepartmentId,
      appointmentDate,
      branchId,
    }: {
      opdDepartmentId: string;
      appointmentDate: string;
      branchId: string;
    }) => {
      const { data, error } = await supabase.rpc("generate_opd_token", {
        p_opd_department_id: opdDepartmentId,
        p_appointment_date: appointmentDate,
        p_branch_id: branchId,
      });

      if (error) throw error;
      
      // RPC returns array, get first item
      const result = Array.isArray(data) ? data[0] : data;
      return result as { token_number: number; token_display: string };
    },
  });
}

// Get OPD department stats
export function useOPDDepartmentStats(branchId?: string, date?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;
  const targetDate = date || new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["opd-department-stats", targetBranchId, targetDate],
    queryFn: async () => {
      if (!targetBranchId) return [];

      // Get departments
      const { data: departments, error: deptError } = await supabase
        .from("opd_departments")
        .select("id, name, code, color")
        .eq("branch_id", targetBranchId)
        .eq("is_active", true);

      if (deptError) throw deptError;

      // Get appointment counts per department
      const { data: appointments, error: apptError } = await supabase
        .from("appointments")
        .select("opd_department_id, status")
        .eq("appointment_date", targetDate)
        .eq("branch_id", targetBranchId)
        .not("opd_department_id", "is", null);

      if (apptError) throw apptError;

      // Calculate stats per department
      return departments.map((dept) => {
        const deptAppointments = appointments.filter(
          (a) => a.opd_department_id === dept.id
        );
        return {
          ...dept,
          total: deptAppointments.length,
          waiting: deptAppointments.filter(
            (a) => a.status === "scheduled" || a.status === "checked_in"
          ).length,
          inProgress: deptAppointments.filter((a) => a.status === "in_progress")
            .length,
          completed: deptAppointments.filter((a) => a.status === "completed")
            .length,
        };
      });
    },
    enabled: !!targetBranchId,
  });
}
