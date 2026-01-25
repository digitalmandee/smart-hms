import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// =============================================================================
// TYPES
// =============================================================================

export interface AvailabilityResult {
  available: boolean;
  conflicts?: ConflictInfo[];
}

export interface ConflictInfo {
  surgeryId: string;
  surgeryNumber: string;
  procedureName: string;
  startTime: string;
  endTime?: string;
  patientName?: string;
}

// =============================================================================
// CHECK OT ROOM AVAILABILITY
// =============================================================================

export function useCheckRoomAvailability(
  roomId: string | undefined,
  date: string | undefined,
  startTime: string | undefined,
  endTime: string | undefined,
  excludeSurgeryId?: string
) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['room-availability', roomId, date, startTime, endTime, excludeSurgeryId],
    queryFn: async (): Promise<AvailabilityResult> => {
      if (!roomId || !date || !startTime) {
        return { available: true };
      }

      // Calculate end time if not provided (default 2 hours)
      const effectiveEndTime = endTime || calculateEndTime(startTime, 120);

      // Query for conflicting surgeries
      const { data, error } = await supabase
        .from('surgeries')
        .select(`
          id,
          surgery_number,
          procedure_name,
          scheduled_start_time,
          scheduled_end_time,
          patient:patients(first_name, last_name)
        `)
        .eq('ot_room_id', roomId)
        .eq('scheduled_date', date)
        .not('status', 'in', '("cancelled","completed","failed","expired")')
        .neq('id', excludeSurgeryId || '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      // Check for overlaps
      const conflicts = (data || []).filter((surgery: any) => {
        const surgeryEnd = surgery.scheduled_end_time || calculateEndTime(surgery.scheduled_start_time, 120);
        return timeRangesOverlap(startTime, effectiveEndTime, surgery.scheduled_start_time, surgeryEnd);
      });

      return {
        available: conflicts.length === 0,
        conflicts: conflicts.map((s: any) => ({
          surgeryId: s.id,
          surgeryNumber: s.surgery_number,
          procedureName: s.procedure_name,
          startTime: s.scheduled_start_time,
          endTime: s.scheduled_end_time,
          patientName: s.patient ? `${s.patient.first_name} ${s.patient.last_name}` : undefined,
        })),
      };
    },
    enabled: !!roomId && !!date && !!startTime && !!profile?.organization_id,
    staleTime: 30000, // Consider fresh for 30 seconds
  });
}

// =============================================================================
// CHECK DOCTOR AVAILABILITY
// =============================================================================

export function useCheckDoctorAvailability(
  doctorId: string | undefined,
  date: string | undefined,
  startTime: string | undefined,
  endTime: string | undefined,
  excludeSurgeryId?: string
) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['doctor-availability', doctorId, date, startTime, endTime, excludeSurgeryId],
    queryFn: async (): Promise<AvailabilityResult> => {
      if (!doctorId || !date || !startTime) {
        return { available: true };
      }

      const effectiveEndTime = endTime || calculateEndTime(startTime, 120);

      // Check surgeries where doctor is lead surgeon or anesthetist
      const { data, error } = await supabase
        .from('surgeries')
        .select(`
          id,
          surgery_number,
          procedure_name,
          scheduled_start_time,
          scheduled_end_time,
          patient:patients(first_name, last_name)
        `)
        .eq('scheduled_date', date)
        .not('status', 'in', '("cancelled","completed","failed","expired")')
        .or(`lead_surgeon_id.eq.${doctorId},anesthetist_id.eq.${doctorId}`)
        .neq('id', excludeSurgeryId || '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      // Also check team members table
      const { data: teamData, error: teamError } = await supabase
        .from('surgery_team_members')
        .select(`
          surgery:surgeries(
            id,
            surgery_number,
            procedure_name,
            scheduled_date,
            scheduled_start_time,
            scheduled_end_time,
            status,
            patient:patients(first_name, last_name)
          )
        `)
        .eq('doctor_id', doctorId);

      if (teamError) throw teamError;

      // Combine and filter
      const allSurgeries = [...(data || [])];
      
      // Add surgeries from team members that match criteria
      (teamData || []).forEach((tm: any) => {
        if (
          tm.surgery &&
          tm.surgery.scheduled_date === date &&
          !['cancelled', 'completed', 'failed', 'expired'].includes(tm.surgery.status) &&
          tm.surgery.id !== excludeSurgeryId &&
          !allSurgeries.find(s => s.id === tm.surgery.id)
        ) {
          allSurgeries.push(tm.surgery);
        }
      });

      // Check for overlaps
      const conflicts = allSurgeries.filter((surgery: any) => {
        const surgeryEnd = surgery.scheduled_end_time || calculateEndTime(surgery.scheduled_start_time, 120);
        return timeRangesOverlap(startTime, effectiveEndTime, surgery.scheduled_start_time, surgeryEnd);
      });

      return {
        available: conflicts.length === 0,
        conflicts: conflicts.map((s: any) => ({
          surgeryId: s.id,
          surgeryNumber: s.surgery_number,
          procedureName: s.procedure_name,
          startTime: s.scheduled_start_time,
          endTime: s.scheduled_end_time,
          patientName: s.patient ? `${s.patient.first_name} ${s.patient.last_name}` : undefined,
        })),
      };
    },
    enabled: !!doctorId && !!date && !!startTime && !!profile?.organization_id,
    staleTime: 30000,
  });
}

// =============================================================================
// HELPERS
// =============================================================================

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMins = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
}

function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Convert to comparable format (minutes since midnight)
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  // Check if ranges overlap
  return s1 < e2 && e1 > s2;
}
