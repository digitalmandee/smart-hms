import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =============================================================================
// TYPES
// =============================================================================

export type ConfirmationStatus = 'pending' | 'accepted' | 'declined' | 'rescheduled';

export interface TeamMemberConfirmation {
  id: string;
  surgery_id: string;
  doctor_id?: string;
  nurse_id?: string;
  employee_id?: string;
  staff_id?: string;
  role: string;
  is_confirmed?: boolean;
  confirmed_at?: string;
  confirmation_status: ConfirmationStatus;
  declined_reason?: string;
  proposed_reschedule_time?: string;
  reschedule_notes?: string;
  notes?: string;
  created_at?: string;
  // Joined
  doctor?: {
    id: string;
    profile?: { full_name: string };
    specialization?: string;
  };
}

export interface RescheduleRequest {
  id: string;
  surgery_id: string;
  requested_by: string;
  requested_by_role: string;
  original_date: string;
  original_time: string;
  proposed_date?: string;
  proposed_time?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  organization_id: string;
  // Joined
  requester?: { full_name: string };
  reviewer?: { full_name: string };
  surgery?: {
    surgery_number: string;
    procedure_name: string;
    patient?: { first_name: string; last_name: string };
  };
}

// =============================================================================
// PENDING CONFIRMATIONS HOOK
// =============================================================================

export function usePendingConfirmations() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['pending-confirmations', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // First, find doctor records linked to the current user's profile
      const { data: doctorRecords } = await supabase
        .from('doctors')
        .select('id')
        .eq('profile_id', profile.id);

      const doctorIds = doctorRecords?.map(d => d.id) || [];

      // If user has no doctor record, they won't have surgery assignments
      if (doctorIds.length === 0) {
        return [];
      }

      // Get all team member entries where current user's doctor is assigned and pending
      const { data, error } = await (supabase
        .from('surgery_team_members') as any)
        .select(`
          *,
          doctor:doctors(id, profile:profiles(full_name), specialization),
          surgery:surgeries(
            id,
            surgery_number,
            procedure_name,
            scheduled_date,
            scheduled_start_time,
            status,
            priority,
            patient:patients(first_name, last_name, patient_number),
            ot_room:ot_rooms(name)
          )
        `)
        .in('doctor_id', doctorIds)
        .eq('confirmation_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter to only surgeries that are 'booked' status (awaiting confirmation)
      return (data || []).filter((item: any) => 
        item.surgery?.status === 'booked'
      );
    },
    enabled: !!profile?.id,
  });
}

// =============================================================================
// ACCEPT SURGERY ASSIGNMENT
// =============================================================================

export function useAcceptSurgeryAssignment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ memberId, surgeryId }: { memberId: string; surgeryId: string }) => {
      const { error } = await (supabase
        .from('surgery_team_members') as any)
        .update({
          confirmation_status: 'accepted',
          is_confirmed: true,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: (_, { surgeryId }) => {
      toast.success('Surgery assignment accepted');
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['surgery', surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to accept assignment: ' + error.message);
    },
  });
}

// =============================================================================
// DECLINE SURGERY ASSIGNMENT
// =============================================================================

export function useDeclineSurgeryAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      memberId, 
      surgeryId, 
      reason 
    }: { 
      memberId: string; 
      surgeryId: string; 
      reason: string;
    }) => {
      const { error } = await (supabase as any)
        .from('surgery_team_members')
        .update({
          confirmation_status: 'declined',
          declined_reason: reason,
        })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: (_, { surgeryId }) => {
      toast.success('Surgery assignment declined');
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['surgery', surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to decline assignment: ' + error.message);
    },
  });
}

// =============================================================================
// REQUEST RESCHEDULE
// =============================================================================

export function useRequestReschedule() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      surgeryId,
      originalDate,
      originalTime,
      proposedDate,
      proposedTime,
      reason,
      role,
    }: {
      surgeryId: string;
      originalDate: string;
      originalTime: string;
      proposedDate?: string;
      proposedTime?: string;
      reason: string;
      role: string;
    }) => {
      const { error } = await (supabase as any)
        .from('surgery_reschedule_requests')
        .insert({
          surgery_id: surgeryId,
          requested_by: profile?.id!,
          requested_by_role: role,
          original_date: originalDate,
          original_time: originalTime,
          proposed_date: proposedDate,
          proposed_time: proposedTime,
          reason,
          organization_id: profile?.organization_id!,
        });

      if (error) throw error;
    },
    onSuccess: (_, { surgeryId }) => {
      toast.success('Reschedule request submitted');
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['reschedule-requests'] });
      queryClient.invalidateQueries({ queryKey: ['surgery', surgeryId] });
    },
    onError: (error: Error) => {
      toast.error('Failed to submit reschedule request: ' + error.message);
    },
  });
}

// =============================================================================
// RESCHEDULE REQUESTS QUEUE (For Reception)
// =============================================================================

export function useRescheduleRequests(status?: 'pending' | 'approved' | 'rejected') {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['reschedule-requests', profile?.organization_id, status],
    queryFn: async () => {
      let query = (supabase as any)
        .from('surgery_reschedule_requests')
        .select(`
          *,
          requester:profiles!surgery_reschedule_requests_requested_by_fkey(full_name),
          reviewer:profiles!surgery_reschedule_requests_reviewed_by_fkey(full_name),
          surgery:surgeries(
            surgery_number,
            procedure_name,
            patient:patients(first_name, last_name)
          )
        `)
        .eq('organization_id', profile?.organization_id!)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RescheduleRequest[];
    },
    enabled: !!profile?.organization_id,
  });
}

// =============================================================================
// APPROVE RESCHEDULE REQUEST
// =============================================================================

export function useApproveRescheduleRequest() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      requestId,
      surgeryId,
      newDate,
      newTime,
      notes,
    }: {
      requestId: string;
      surgeryId: string;
      newDate: string;
      newTime: string;
      notes?: string;
    }) => {
      // Update the reschedule request
      const { error: requestError } = await (supabase as any)
        .from('surgery_reschedule_requests')
        .update({
          status: 'approved',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes,
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update the surgery with new date/time and set status to rescheduled
      const { error: surgeryError } = await (supabase as any)
        .from('surgeries')
        .update({
          scheduled_date: newDate,
          scheduled_start_time: newTime,
          status: 'rescheduled',
        })
        .eq('id', surgeryId);

      if (surgeryError) throw surgeryError;

      // Reset all team member confirmations to pending
      const { error: teamError } = await (supabase as any)
        .from('surgery_team_members')
        .update({
          confirmation_status: 'pending',
          is_confirmed: false,
          confirmed_at: null,
        })
        .eq('surgery_id', surgeryId);

      if (teamError) throw teamError;
    },
    onSuccess: () => {
      toast.success('Reschedule approved and surgery updated');
      queryClient.invalidateQueries({ queryKey: ['reschedule-requests'] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to approve reschedule: ' + error.message);
    },
  });
}

// =============================================================================
// REJECT RESCHEDULE REQUEST
// =============================================================================

export function useRejectRescheduleRequest() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      requestId,
      notes,
    }: {
      requestId: string;
      notes?: string;
    }) => {
      const { error } = await (supabase as any)
        .from('surgery_reschedule_requests')
        .update({
          status: 'rejected',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Reschedule request rejected');
      queryClient.invalidateQueries({ queryKey: ['reschedule-requests'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to reject request: ' + error.message);
    },
  });
}

// =============================================================================
// RECORD SURGERY OUTCOME
// =============================================================================

export type SurgeryOutcome = 'successful' | 'failed' | 'expired' | 'unknown';

export function useRecordSurgeryOutcome() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      surgeryId,
      outcome,
      notes,
    }: {
      surgeryId: string;
      outcome: SurgeryOutcome;
      notes?: string;
    }) => {
      const { error } = await (supabase as any)
        .from('surgeries')
        .update({
          outcome,
          outcome_notes: notes,
          outcome_recorded_by: profile?.id,
          outcome_recorded_at: new Date().toISOString(),
        })
        .eq('id', surgeryId);

      if (error) throw error;
    },
    onSuccess: (_, { surgeryId }) => {
      toast.success('Surgery outcome recorded');
      queryClient.invalidateQueries({ queryKey: ['surgery', surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to record outcome: ' + error.message);
    },
  });
}

// =============================================================================
// GET SURGERY TEAM CONFIRMATIONS
// =============================================================================

export function useSurgeryTeamConfirmations(surgeryId?: string) {
  return useQuery({
    queryKey: ['surgery-team-confirmations', surgeryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('surgery_team_members')
        .select(`
          *,
          doctor:doctors(id, profile:profiles(full_name), specialization)
        `)
        .eq('surgery_id', surgeryId!)
        .order('role');

      if (error) throw error;
      return data as TeamMemberConfirmation[];
    },
    enabled: !!surgeryId,
  });
}
