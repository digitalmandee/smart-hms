import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Doctor = Database['public']['Tables']['doctors']['Row'];
type DoctorCategory = 'surgeon' | 'consultant' | 'anesthesia' | 'radiologist' | 'pathologist';
type DoctorInsert = Database['public']['Tables']['doctors']['Insert'];

export interface DoctorWithProfile extends Doctor {
  profile: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
  branch?: {
    id: string;
    name: string;
  };
  employee?: {
    id: string;
    employee_number: string;
    first_name: string;
    last_name: string | null;
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
}

export function useDoctors(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['doctors', profile?.organization_id, branchId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles!doctors_profile_id_fkey(id, full_name, email, phone, avatar_url),
          branch:branches(id, name),
          employee:employees(
            id, 
            employee_number, 
            first_name, 
            last_name,
            department:department_id(id, name),
            designation:designation_id(id, name),
            category:category_id(id, name, color)
          )
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_available', true);

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;
      return data as DoctorWithProfile[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAllDoctors() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['doctors', 'all', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles!doctors_profile_id_fkey(id, full_name, email, phone, avatar_url),
          branch:branches(id, name),
          employee:employees(
            id, 
            employee_number, 
            first_name, 
            last_name,
            employment_status,
            department:department_id(id, name),
            designation:designation_id(id, name),
            category:category_id(id, name, color)
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DoctorWithProfile[];
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================================================
// CATEGORY-BASED DOCTOR QUERIES
// =====================================================

export interface DoctorWithCategory extends DoctorWithProfile {
  specialization_info?: {
    id: string;
    name: string;
    category: DoctorCategory | null;
  } | null;
}

/**
 * Get doctors filtered by specialization category
 * @param category - surgeon, consultant, anesthesia, radiologist, pathologist
 * @param branchId - optional branch filter
 */
export function useDoctorsByCategory(category: DoctorCategory, branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['doctors', 'by-category', category, profile?.organization_id, branchId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      // First get specializations with this category
      const { data: specs, error: specError } = await supabase
        .from('specializations')
        .select('id, name')
        .eq('organization_id', profile.organization_id)
        .eq('category', category);

      if (specError) throw specError;
      if (!specs || specs.length === 0) return [];

      const specNames = specs.map(s => s.name);

      // Now get doctors with these specializations
      let query = supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles!doctors_profile_id_fkey(id, full_name, email, phone, avatar_url),
          branch:branches(id, name),
          employee:employees(
            id, 
            employee_number, 
            first_name, 
            last_name,
            department:department_id(id, name),
            designation:designation_id(id, name),
            category:category_id(id, name, color)
          )
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_available', true)
        .in('specialization', specNames);

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;
      return data as DoctorWithProfile[];
    },
    enabled: !!profile?.organization_id,
  });
}

/**
 * Get surgeons only (specializations with category = 'surgeon')
 */
export function useSurgeons(branchId?: string) {
  return useDoctorsByCategory('surgeon', branchId);
}

/**
 * Get anesthesiologists only (specializations with category = 'anesthesia')
 */
export function useAnesthesiologists(branchId?: string) {
  return useDoctorsByCategory('anesthesia', branchId);
}

/**
 * Get consultants only (specializations with category = 'consultant')
 */
export function useConsultants(branchId?: string) {
  return useDoctorsByCategory('consultant', branchId);
}

/**
 * Get radiologists only (specializations with category = 'radiologist')
 */
export function useRadiologists(branchId?: string) {
  return useDoctorsByCategory('radiologist', branchId);
}

/**
 * Get pathologists only (specializations with category = 'pathologist')
 */
export function usePathologists(branchId?: string) {
  return useDoctorsByCategory('pathologist', branchId);
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles!doctors_profile_id_fkey(id, full_name, email, phone, avatar_url),
          branch:branches(id, name),
          employee:employees(
            id, 
            employee_number, 
            first_name, 
            last_name,
            employment_status,
            join_date,
            personal_phone,
            personal_email,
            department:department_id(id, name, code),
            designation:designation_id(id, name, code),
            category:category_id(id, name, color)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as DoctorWithProfile;
    },
    enabled: !!id,
  });
}

export function useDoctorByEmployeeId(employeeId: string) {
  return useQuery({
    queryKey: ['doctor', 'by-employee', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles!doctors_profile_id_fkey(id, full_name, email, phone, avatar_url),
          branch:branches(id, name)
        `)
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctor: DoctorInsert) => {
      const { data, error } = await supabase
        .from('doctors')
        .insert(doctor)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create doctor: ' + error.message);
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Doctor> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('doctors')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'by-employee'] });
      toast.success('Doctor updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update doctor: ' + error.message);
    },
  });
}

export function useLinkDoctorToEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doctorId, employeeId }: { doctorId: string; employeeId: string }) => {
      const { data, error } = await supabase
        .from('doctors')
        .update({ employee_id: employeeId })
        .eq('id', doctorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      toast.success('Doctor linked to employee successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to link doctor to employee: ' + error.message);
    },
  });
}

export function useCreateDoctorForEmployee() {
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
      consultationFee,
      isAvailable = true,
    }: {
      employeeId: string;
      profileId?: string;
      branchId?: string;
      specialization?: string;
      qualification?: string;
      licenseNumber?: string;
      consultationFee?: number;
      isAvailable?: boolean;
    }) => {
      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      // Check if doctor already exists for this employee
      const { data: existingDoctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (existingDoctor) {
        // Update existing doctor
        const { data, error } = await supabase
          .from('doctors')
          .update({
            specialization,
            qualification,
            license_number: licenseNumber,
            consultation_fee: consultationFee,
            is_available: isAvailable,
            branch_id: branchId,
          })
          .eq('id', existingDoctor.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Create new doctor
      const doctorData: DoctorInsert = {
        organization_id: profile.organization_id,
        employee_id: employeeId,
        profile_id: profileId || profile.id,
        branch_id: branchId,
        specialization,
        qualification,
        license_number: licenseNumber,
        consultation_fee: consultationFee,
        is_available: isAvailable,
      };

      const { data, error } = await supabase
        .from('doctors')
        .insert(doctorData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to save doctor details: ' + error.message);
    },
  });
}

export function useAvailableSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['available-slots', doctorId, date],
    queryFn: async () => {
      if (!doctorId || !date) return [];

      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = new Date(date).getDay();

      // Get doctor's schedule for this day
      const { data: schedules, error: scheduleError } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      if (scheduleError) throw scheduleError;
      if (!schedules || schedules.length === 0) return [];

      // Get existing appointments for this doctor on this date
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time, status')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .neq('status', 'cancelled');

      if (appointmentsError) throw appointmentsError;

      const bookedTimes = new Set(
        appointments?.map(a => a.appointment_time?.substring(0, 5)) || []
      );

      // Generate time slots
      const slots: { time: string; available: boolean }[] = [];

      for (const schedule of schedules) {
        const startTime = schedule.start_time;
        const endTime = schedule.end_time;
        const duration = schedule.slot_duration_minutes || 15;
        const maxPatients = schedule.max_patients_per_slot || 1;

        let currentTime = parseTime(startTime);
        const endTimeMinutes = parseTime(endTime);

        while (currentTime < endTimeMinutes) {
          const timeStr = formatTime(currentTime);
          const bookedCount = appointments?.filter(
            a => a.appointment_time?.substring(0, 5) === timeStr
          ).length || 0;

          slots.push({
            time: timeStr,
            available: bookedCount < maxPatients,
          });

          currentTime += duration;
        }
      }

      return slots;
    },
    enabled: !!doctorId && !!date,
  });
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
