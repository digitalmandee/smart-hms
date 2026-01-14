import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface NurseWithDetails {
  id: string;
  organization_id: string;
  employee_id: string | null;
  profile_id: string | null;
  branch_id: string | null;
  license_number: string | null;
  license_expiry: string | null;
  qualification: string | null;
  specialization: string | null;
  assigned_ward_id: string | null;
  is_charge_nurse: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    employee_number: string;
    first_name: string;
    last_name: string | null;
    personal_phone: string | null;
    personal_email: string | null;
    employment_status: string | null;
    profile_photo_url: string | null;
    department?: {
      id: string;
      name: string;
    };
    designation?: {
      id: string;
      name: string;
    };
    category?: {
      id: string;
      name: string;
      color: string | null;
    };
  } | null;
  branch?: {
    id: string;
    name: string;
  };
  assigned_ward?: {
    id: string;
    name: string;
    ward_type: string | null;
  };
}

export function useNurses(filters?: { wardId?: string; available?: boolean }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['nurses', profile?.organization_id, filters],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('nurses')
        .select(`
          *,
          employee:employees(
            id, 
            employee_number, 
            first_name, 
            last_name,
            personal_phone,
            personal_email,
            employment_status,
            profile_photo_url,
            department:department_id(id, name),
            designation:designation_id(id, name),
            category:category_id(id, name, color)
          ),
          branch:branches(id, name),
          assigned_ward:wards(id, name, ward_type)
        `)
        .eq('organization_id', profile.organization_id);

      if (filters?.wardId) {
        query = query.eq('assigned_ward_id', filters.wardId);
      }
      if (filters?.available !== undefined) {
        query = query.eq('is_available', filters.available);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;
      return data as NurseWithDetails[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useNurse(id: string) {
  return useQuery({
    queryKey: ['nurse', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nurses')
        .select(`
          *,
          employee:employees(
            id, 
            employee_number, 
            first_name, 
            last_name,
            personal_phone,
            personal_email,
            employment_status,
            profile_photo_url,
            join_date,
            department:department_id(id, name, code),
            designation:designation_id(id, name, code),
            category:category_id(id, name, color)
          ),
          branch:branches(id, name),
          assigned_ward:wards(id, name, ward_type)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as NurseWithDetails;
    },
    enabled: !!id,
  });
}

export function useNurseByEmployeeId(employeeId: string) {
  return useQuery({
    queryKey: ['nurse', 'by-employee', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('nurses')
        .select(`
          *,
          branch:branches(id, name),
          assigned_ward:wards(id, name, ward_type)
        `)
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useCreateNurseForEmployee() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      employeeId,
      profileId,
      branchId,
      specialization,
      qualification,
      licenseNumber,
      licenseExpiry,
      assignedWardId,
      isChargeNurse = false,
      isAvailable = true,
    }: {
      employeeId: string;
      profileId?: string;
      branchId?: string;
      specialization?: string;
      qualification?: string;
      licenseNumber?: string;
      licenseExpiry?: string;
      assignedWardId?: string;
      isChargeNurse?: boolean;
      isAvailable?: boolean;
    }) => {
      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      // Check if nurse already exists for this employee
      const { data: existingNurse } = await supabase
        .from('nurses')
        .select('id')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (existingNurse) {
        // Update existing nurse
        const { data, error } = await supabase
          .from('nurses')
          .update({
            specialization,
            qualification,
            license_number: licenseNumber,
            license_expiry: licenseExpiry,
            assigned_ward_id: assignedWardId,
            is_charge_nurse: isChargeNurse,
            is_available: isAvailable,
            branch_id: branchId,
          })
          .eq('id', existingNurse.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Create new nurse
      const nurseData = {
        organization_id: profile.organization_id,
        employee_id: employeeId,
        profile_id: profileId || profile.id,
        branch_id: branchId,
        specialization,
        qualification,
        license_number: licenseNumber,
        license_expiry: licenseExpiry,
        assigned_ward_id: assignedWardId,
        is_charge_nurse: isChargeNurse,
        is_available: isAvailable,
      };

      const { data, error } = await supabase
        .from('nurses')
        .insert(nurseData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
      queryClient.invalidateQueries({ queryKey: ['nurse'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to save nurse details: ' + error.message);
    },
  });
}

export function useUpdateNurse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result, error } = await supabase
        .from('nurses')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
      queryClient.invalidateQueries({ queryKey: ['nurse', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['nurse', 'by-employee'] });
      toast.success('Nurse updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update nurse: ' + error.message);
    },
  });
}

export function useNurseStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['nurse-stats', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from('nurses')
        .select('id, is_available, is_charge_nurse, assigned_ward_id')
        .eq('organization_id', profile.organization_id);

      if (error) throw error;

      const total = data?.length || 0;
      const available = data?.filter(n => n.is_available).length || 0;
      const chargeNurses = data?.filter(n => n.is_charge_nurse).length || 0;
      const assignedToWards = data?.filter(n => n.assigned_ward_id).length || 0;

      return { total, available, chargeNurses, assignedToWards };
    },
    enabled: !!profile?.organization_id,
  });
}

// Nurse specializations
export const NURSE_SPECIALIZATIONS = [
  { value: 'general', label: 'General Nursing' },
  { value: 'icu', label: 'ICU/Critical Care' },
  { value: 'nicu', label: 'NICU (Neonatal)' },
  { value: 'picu', label: 'PICU (Pediatric ICU)' },
  { value: 'ot', label: 'Operation Theatre' },
  { value: 'emergency', label: 'Emergency/Trauma' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'geriatric', label: 'Geriatric' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'cardiac', label: 'Cardiac Care' },
  { value: 'dialysis', label: 'Dialysis' },
  { value: 'midwife', label: 'Midwifery' },
  { value: 'psychiatric', label: 'Psychiatric' },
];
