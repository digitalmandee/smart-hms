import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { otLogger } from "@/lib/logger";

// =============================================================================
// TYPES
// =============================================================================

export type SurgeryStatus = 'requested' | 'booked' | 'on_hold' | 'confirmed' | 'rescheduled' | 'scheduled' | 'pre_op' | 'ready' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | 'failed' | 'expired';
export type OTRoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved';
export type SurgeryPriority = 'emergency' | 'urgent' | 'elective';
export type AnesthesiaType = 'general' | 'spinal' | 'epidural' | 'local' | 'regional' | 'sedation' | 'combined';
export type ASAClass = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type SurgeryTeamRole = 'lead_surgeon' | 'assistant_surgeon' | 'anesthetist' | 'scrub_nurse' | 'circulating_nurse' | 'technician';

export interface OTRoom {
  id: string;
  organization_id: string;
  branch_id: string;
  room_number: string;
  name: string;
  floor?: string;
  status: OTRoomStatus;
  room_type?: string;
  equipment?: any[];
  features?: Record<string, any>;
  capacity?: number;
  is_active?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  current_surgery?: Surgery | null;
}

export interface Surgery {
  id: string;
  organization_id: string;
  branch_id: string;
  surgery_number: string;
  patient_id: string;
  admission_id?: string;
  consultation_id?: string;
  ot_room_id?: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  estimated_duration_minutes?: number;
  actual_start_time?: string;
  actual_end_time?: string;
  procedure_name: string;
  procedure_code?: string;
  procedure_type?: string;
  diagnosis?: string;
  laterality?: string;
  lead_surgeon_id?: string;
  status: SurgeryStatus;
  priority: SurgeryPriority;
  cancellation_reason?: string;
  postponement_reason?: string;
  consent_signed?: boolean;
  consent_signed_at?: string;
  npo_from?: string;
  special_requirements?: string;
  equipment_needed?: any[];
  blood_reservation?: any;
  post_op_destination?: string;
  post_op_instructions?: string;
  estimated_cost?: number;
  is_billable?: boolean;
  invoice_id?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  
  // Confirmation tracking (new fields from database)
  booked_at?: string;
  surgeon_confirmed_at?: string;
  anesthesia_confirmed_at?: string;
  confirmed_at?: string;
  ready_at?: string;
  ready_by?: string;
  pre_op_medications_ordered?: boolean;
  pre_op_supplies_ready?: boolean;
  
  // Outcome tracking (new fields from database)
  outcome?: 'successful' | 'failed' | 'expired' | 'unknown' | null;
  outcome_notes?: string;
  outcome_recorded_at?: string;
  outcome_recorded_by?: string;
  
  // Joined data
  patient?: any;
  lead_surgeon?: any;
  ot_room?: OTRoom;
  team_members?: SurgeryTeamMember[];
  pre_op_assessment?: PreOpAssessment;
  anesthesia_record?: AnesthesiaRecord;
  intra_op_notes?: IntraOpNotes;
  safety_checklist?: SurgicalSafetyChecklist;
  post_op_recovery?: PostOpRecovery;
}

export interface SurgeryTeamMember {
  id: string;
  surgery_id: string;
  doctor_id?: string;
  nurse_id?: string;
  employee_id?: string;
  role: SurgeryTeamRole;
  is_confirmed?: boolean;
  confirmed_at?: string;
  notes?: string;
  created_at?: string;
  // Joined
  doctor?: any;
  nurse?: any;
  employee?: any;
}

export interface PreOpAssessment {
  id: string;
  surgery_id: string;
  assessed_by: string;
  assessment_date?: string;
  asa_class?: ASAClass;
  asa_notes?: string;
  medical_history_reviewed?: boolean;
  allergies?: string;
  current_medications?: any[];
  relevant_conditions?: any[];
  vitals?: any;
  investigations?: any[];
  investigations_cleared?: boolean;
  medical_clearance?: any;
  cardiac_clearance?: any;
  anesthesia_clearance?: any;
  other_clearances?: any[];
  airway_assessment?: any;
  cardiac_risk_score?: string;
  surgical_risk_notes?: string;
  pre_op_orders?: any[];
  fasting_confirmed?: boolean;
  consent_verified?: boolean;
  site_marked?: boolean;
  blood_arranged?: boolean;
  jewelry_removed?: boolean;
  dentures_removed?: boolean;
  is_cleared_for_surgery?: boolean;
  clearance_notes?: string;
  cleared_by?: string;
  cleared_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SurgicalSafetyChecklist {
  id: string;
  surgery_id: string;
  sign_in_completed?: boolean;
  sign_in_time?: string;
  sign_in_by?: string;
  sign_in_data?: any;
  time_out_completed?: boolean;
  time_out_time?: string;
  time_out_by?: string;
  time_out_data?: any;
  sign_out_completed?: boolean;
  sign_out_time?: string;
  sign_out_by?: string;
  sign_out_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AnesthesiaRecord {
  id: string;
  surgery_id: string;
  anesthetist_id: string;
  pre_anesthesia_assessment?: any;
  anesthesia_plan?: string;
  anesthesia_type: AnesthesiaType;
  anesthesia_start_time?: string;
  induction_time?: string;
  intubation_time?: string;
  extubation_time?: string;
  anesthesia_end_time?: string;
  airway_device?: string;
  airway_size?: string;
  intubation_grade?: string;
  intubation_attempts?: number;
  airway_complications?: string;
  induction_agents?: any[];
  maintenance_agents?: any[];
  muscle_relaxants?: any[];
  analgesics?: any[];
  reversal_agents?: any[];
  other_medications?: any[];
  iv_access?: any[];
  arterial_line?: any;
  central_line?: any;
  other_access?: any[];
  fluid_input?: any[];
  blood_products?: any[];
  total_input_ml?: number;
  urine_output_ml?: number;
  blood_loss_ml?: number;
  vitals_log?: any[];
  intra_op_events?: any[];
  complications?: string;
  recovery_score?: number;
  handover_notes?: string;
  created_at?: string;
  updated_at?: string;
  // Joined
  anesthetist?: any;
}

export interface IntraOpNotes {
  id: string;
  surgery_id: string;
  documented_by: string;
  procedure_performed: string;
  approach?: string;
  position?: string;
  skin_prep?: string;
  draping?: string;
  incision_type?: string;
  incision_time?: string;
  closure_time?: string;
  intra_op_findings?: string;
  pathology_findings?: string;
  procedure_steps?: any[];
  specimens?: any[];
  implants?: any[];
  sponge_count_correct?: boolean;
  instrument_count_correct?: boolean;
  needle_count_correct?: boolean;
  count_notes?: string;
  complications?: string;
  blood_loss_ml?: number;
  drains?: any[];
  catheters?: any[];
  closure_details?: string;
  dressing_type?: string;
  op_images?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface PostOpRecovery {
  id: string;
  surgery_id: string;
  pacu_arrival_time: string;
  pacu_nurse_id?: string;
  handover_from?: string;
  handover_notes?: string;
  vitals_log?: any[];
  pain_scores?: any[];
  pain_management?: any[];
  aldrete_scores?: any[];
  complications?: any[];
  nausea_vomiting?: boolean;
  shivering?: boolean;
  emergence_delirium?: boolean;
  fluid_intake_ml?: number;
  urine_output_ml?: number;
  drain_output_ml?: number;
  nursing_interventions?: any[];
  medications_given?: any[];
  discharge_criteria_met?: boolean;
  final_aldrete_score?: number;
  discharge_time?: string;
  discharged_by?: string;
  discharge_destination?: string;
  discharge_notes?: string;
  created_at?: string;
  updated_at?: string;
  // Joined
  pacu_nurse?: any;
}

export interface OTStats {
  todaySurgeries: number;
  inProgress: number;
  completed: number;
  availableRooms: number;
  totalRooms: number;
  pacuPatients: number;
  emergencyCases: number;
  scheduledThisWeek: number;
}

// =============================================================================
// OT ROOMS HOOKS
// =============================================================================

export function useOTRooms(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['ot-rooms', profile?.organization_id, branchId],
    queryFn: async () => {
      let query = supabase
        .from('ot_rooms')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .eq('is_active', true)
        .order('room_number');

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OTRoom[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useOTRoom(roomId: string) {
  return useQuery({
    queryKey: ['ot-room', roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ot_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      return data as OTRoom;
    },
    enabled: !!roomId,
  });
}

export function useCreateOTRoom() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (room: Partial<OTRoom>) => {
      const { data, error } = await supabase
        .from('ot_rooms')
        .insert({
          room_number: room.room_number!,
          name: room.name!,
          branch_id: room.branch_id!,
          organization_id: profile?.organization_id!,
          floor: room.floor,
          room_type: room.room_type,
          equipment: room.equipment as any,
          features: room.features as any,
          capacity: room.capacity,
          notes: room.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ot-rooms'] });
      toast.success('OT Room created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create OT room');
    },
  });
}

export function useUpdateOTRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OTRoom> & { id: string }) => {
      const { data, error } = await supabase
        .from('ot_rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ot-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['ot-room', variables.id] });
      toast.success('OT Room updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update OT room');
    },
  });
}

// =============================================================================
// SURGERIES HOOKS
// =============================================================================

interface SurgeryFilters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: SurgeryStatus | SurgeryStatus[];
  priority?: SurgeryPriority;
  surgeonId?: string;
  roomId?: string;
  branchId?: string;
  patientId?: string;
}

export function useSurgeries(filters: SurgeryFilters = {}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['surgeries', profile?.organization_id, filters],
    queryFn: async () => {
      otLogger.debug('useSurgeries: Fetching surgeries', { 
        filters, 
        organizationId: profile?.organization_id 
      });

      let query = supabase
        .from('surgeries')
        .select(`
          *,
          patient:patients(id, first_name, last_name, date_of_birth, gender, phone, patient_number),
          lead_surgeon:doctors!surgeries_lead_surgeon_id_fkey(id, profile:profiles(full_name), specialization),
          ot_room:ot_rooms(id, room_number, name),
          team_members:surgery_team_members(id, role, confirmation_status, doctor_id, staff_id)
        `)
        .eq('organization_id', profile?.organization_id!)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_start_time', { ascending: true });

      if (filters.date) {
        query = query.eq('scheduled_date', filters.date);
      }
      if (filters.dateFrom) {
        query = query.gte('scheduled_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('scheduled_date', filters.dateTo);
      }
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          // @ts-expect-error - Extended status enum includes values not yet in DB types
          query = query.in('status', filters.status);
        } else {
          // @ts-expect-error - Extended status enum includes values not yet in DB types
          query = query.eq('status', filters.status);
        }
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.surgeonId) {
        query = query.eq('lead_surgeon_id', filters.surgeonId);
      }
      if (filters.roomId) {
        query = query.eq('ot_room_id', filters.roomId);
      }
      if (filters.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      const { data, error } = await query;
      
      if (error) {
        otLogger.error('useSurgeries: Failed to fetch surgeries', error, { filters });
        throw error;
      }

      otLogger.info('useSurgeries: Fetched surgeries', { 
        count: data?.length || 0,
        filters,
        surgeryIds: data?.map(s => s.id).slice(0, 5) 
      });

      // Debug log each surgery's details for visibility debugging
      data?.forEach(s => {
        otLogger.debug('useSurgeries: Surgery details', {
          id: s.id,
          surgeryNumber: s.surgery_number,
          scheduledDate: s.scheduled_date,
          scheduledStartTime: s.scheduled_start_time,
          otRoomId: s.ot_room_id,
          status: s.status,
          branchId: s.branch_id,
        });
      });

      return (data || []) as unknown as Surgery[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useTodaySurgeries(branchId?: string) {
  const today = new Date().toISOString().split('T')[0];
  return useSurgeries({ 
    date: today, 
    branchId,
    status: ['scheduled', 'pre_op', 'in_progress', 'completed'] 
  });
}

// Fetch all scheduled surgeries without date filter (for reception views)
export function useAllScheduledSurgeries(branchId?: string) {
  return useSurgeries({ 
    branchId,
    status: ['scheduled', 'pre_op', 'in_progress', 'completed'] 
  });
}

export function useSurgeryQueue(branchId?: string) {
  const today = new Date().toISOString().split('T')[0];
  return useSurgeries({
    date: today, 
    branchId,
    status: ['scheduled', 'pre_op', 'in_progress'] 
  });
}

export function useSurgery(surgeryId: string) {
  return useQuery({
    queryKey: ['surgery', surgeryId],
    queryFn: async () => {
      const { data: surgery, error } = await supabase
        .from('surgeries')
        .select(`
          *,
          patient:patients(id, first_name, last_name, date_of_birth, gender, phone, patient_number, blood_group),
          lead_surgeon:doctors!surgeries_lead_surgeon_id_fkey(id, profile:profiles(full_name), specialization, qualification),
          ot_room:ot_rooms(id, room_number, name, floor)
        `)
        .eq('id', surgeryId)
        .single();

      if (error) throw error;

      // Fetch related records
      const [teamRes, preOpRes, checklistRes, anesthesiaRes, intraOpRes, postOpRes] = await Promise.all([
        supabase
          .from('surgery_team_members')
          .select(`
            *,
            doctor:doctors(id, profile:profiles(full_name), specialization),
            nurse:nurses(id, profile:profiles(full_name)),
            employee:employees(id, full_name)
          `)
          .eq('surgery_id', surgeryId),
        supabase
          .from('pre_op_assessments')
          .select('*')
          .eq('surgery_id', surgeryId)
          .maybeSingle(),
        supabase
          .from('surgical_safety_checklists')
          .select('*')
          .eq('surgery_id', surgeryId)
          .maybeSingle(),
        supabase
          .from('anesthesia_records')
          .select(`
            *,
            anesthetist:doctors(id, profile:profiles(full_name))
          `)
          .eq('surgery_id', surgeryId)
          .maybeSingle(),
        supabase
          .from('intra_op_notes')
          .select('*')
          .eq('surgery_id', surgeryId)
          .maybeSingle(),
        supabase
          .from('post_op_recovery')
          .select(`
            *,
            pacu_nurse:nurses(id, profile:profiles(full_name))
          `)
          .eq('surgery_id', surgeryId)
          .maybeSingle(),
      ]);

      return {
        ...surgery,
        team_members: teamRes.data || [],
        pre_op_assessment: preOpRes.data,
        safety_checklist: checklistRes.data,
        anesthesia_record: anesthesiaRes.data,
        intra_op_notes: intraOpRes.data,
        post_op_recovery: postOpRes.data,
      } as unknown as Surgery;
    },
    enabled: !!surgeryId,
  });
}

export function useCreateSurgery() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (surgery: Partial<Surgery> & { anesthetist_id?: string }) => {
      // Generate surgery number using RPC
      const { data: surgeryNumber } = await supabase
        .rpc('generate_surgery_number', { 
          org_id: profile?.organization_id,
          branch_id: surgery.branch_id 
        });

      // Build insert object - cast to any to handle auto-generated columns
      const insertData: any = {
        surgery_number: surgeryNumber || `SURG-${Date.now()}`,
        organization_id: profile?.organization_id!,
        branch_id: surgery.branch_id!,
        patient_id: surgery.patient_id!,
        procedure_name: surgery.procedure_name!,
        scheduled_date: surgery.scheduled_date!,
        scheduled_start_time: surgery.scheduled_start_time!,
        scheduled_end_time: surgery.scheduled_end_time,
        estimated_duration_minutes: surgery.estimated_duration_minutes,
        ot_room_id: surgery.ot_room_id,
        lead_surgeon_id: surgery.lead_surgeon_id,
        anesthetist_id: surgery.anesthetist_id,
        admission_id: surgery.admission_id,
        consultation_id: surgery.consultation_id,
        diagnosis: surgery.diagnosis,
        priority: surgery.priority || 'elective',
        status: 'booked', // New surgeries start as 'booked' awaiting team confirmation
        special_requirements: surgery.special_requirements,
        estimated_cost: surgery.estimated_cost,
        is_billable: surgery.is_billable,
        surgery_charges: (surgery as any).surgery_charges || null,
        fee_template_id: (surgery as any).fee_template_id || null,
        created_by: profile?.id,
      };

      const { data, error } = await supabase
        .from('surgeries')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Create surgery team members for lead surgeon and anesthetist
      const teamMembers: any[] = [];

      if (surgery.lead_surgeon_id) {
        teamMembers.push({
          surgery_id: data.id,
          doctor_id: surgery.lead_surgeon_id,
          role: 'lead_surgeon',
          confirmation_status: 'pending',
          is_confirmed: false,
        });
      }

      if (surgery.anesthetist_id) {
        teamMembers.push({
          surgery_id: data.id,
          doctor_id: surgery.anesthetist_id,
          role: 'anesthetist',
          confirmation_status: 'pending',
          is_confirmed: false,
        });
      }

      // Insert team members if any
      if (teamMembers.length > 0) {
        const { error: teamError } = await supabase
          .from('surgery_team_members')
          .insert(teamMembers);

        if (teamError) {
          otLogger.error('Failed to create surgery team members', teamError);
          // Don't fail the whole operation, just log the error
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      queryClient.invalidateQueries({ queryKey: ['ot-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['surgery-team-confirmations'] });
      toast.success('Surgery scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule surgery');
    },
  });
}

export function useUpdateSurgery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Surgery> & { id: string }) => {
      // Cast status to string for DB compatibility with extended enum
      const dbUpdates = { ...updates } as Record<string, unknown>;
      if (dbUpdates.status) {
        dbUpdates.status = dbUpdates.status as string;
      }
      
      const { data, error } = await supabase
        .from('surgeries')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['ot-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ot-rooms'] });
      toast.success('Surgery updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update surgery');
    },
  });
}

export function useStartSurgery() {
  const updateSurgery = useUpdateSurgery();

  return useMutation({
    mutationFn: async (surgeryId: string) => {
      return updateSurgery.mutateAsync({
        id: surgeryId,
        status: 'in_progress',
        actual_start_time: new Date().toISOString(),
      });
    },
  });
}

export function useCompleteSurgery() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (surgeryId: string) => {
      // First update surgery status
      const { data: surgery, error: updateError } = await supabase
        .from('surgeries')
        .update({
          status: 'completed',
          actual_end_time: new Date().toISOString(),
        })
        .eq('id', surgeryId)
        .select(`
          *,
          patient:patients(first_name, last_name)
        `)
        .single();

      if (updateError) throw updateError;

      // If surgery is billable and linked to an admission, create IPD charge
      if (surgery.admission_id && surgery.is_billable) {
        const chargeDescription = `Surgery: ${surgery.procedure_name}`;
        const chargeAmount = surgery.estimated_cost || 0;

        const { error: chargeError } = await supabase
          .from('ipd_charges')
          .insert({
            admission_id: surgery.admission_id,
            charge_date: new Date().toISOString().split('T')[0],
            charge_type: 'procedure',
            description: chargeDescription,
            quantity: 1,
            unit_price: chargeAmount,
            total_amount: chargeAmount,
            is_billed: false,
            added_by: profile?.id,
            notes: `Surgery #${surgery.surgery_number}`,
          });

        if (chargeError) {
          console.error('Failed to create IPD charge for surgery:', chargeError);
          // Don't throw - surgery is still completed, just log the billing failure
        }

        // Invalidate IPD charges cache
        queryClient.invalidateQueries({ queryKey: ['ipd-charges', surgery.admission_id] });
        queryClient.invalidateQueries({ queryKey: ['ipd-billing-stats'] });
      }

      return surgery;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      queryClient.invalidateQueries({ queryKey: ['ot-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ot-rooms'] });
      toast.success('Surgery completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete surgery');
    },
  });
}

// Hook to fetch surgeries linked to an admission
export function useAdmissionSurgeries(admissionId?: string) {
  return useQuery({
    queryKey: ['admission-surgeries', admissionId],
    queryFn: async () => {
      if (!admissionId) return [];

      const { data, error } = await supabase
        .from('surgeries')
        .select(`
          id,
          surgery_number,
          procedure_name,
          estimated_cost,
          status,
          actual_start_time,
          actual_end_time,
          is_billable,
          lead_surgeon:doctors!surgeries_lead_surgeon_id_fkey(
            id,
            profile:profiles(full_name)
          )
        `)
        .eq('admission_id', admissionId)
        .in('status', ['completed', 'in_progress'])
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
}

// Hook to link an invoice to a surgery
export function useUpdateSurgeryInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surgeryId, invoiceId }: { surgeryId: string; invoiceId: string }) => {
      const { data, error } = await supabase
        .from('surgeries')
        .update({ invoice_id: invoiceId })
        .eq('id', surgeryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      toast.success('Invoice linked to surgery');
    },
    onError: (error: any) => {
      console.error('Failed to link invoice to surgery:', error);
      // Don't show error toast - invoice was still created
    },
  });
}

export function useCancelSurgery() {
  const updateSurgery = useUpdateSurgery();

  return useMutation({
    mutationFn: async ({ surgeryId, reason }: { surgeryId: string; reason: string }) => {
      return updateSurgery.mutateAsync({
        id: surgeryId,
        status: 'cancelled',
        cancellation_reason: reason,
      });
    },
  });
}

// =============================================================================
// SURGERY TEAM HOOKS
// =============================================================================

export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: Partial<SurgeryTeamMember>) => {
      const { data, error } = await supabase
        .from('surgery_team_members')
        .insert({
          surgery_id: member.surgery_id!,
          role: member.role!,
          doctor_id: member.doctor_id,
          nurse_id: member.nurse_id,
          employee_id: member.employee_id,
          notes: member.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgery_id] });
      toast.success('Team member added');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add team member');
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, surgeryId }: { memberId: string; surgeryId: string }) => {
      const { error } = await supabase
        .from('surgery_team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      return surgeryId;
    },
    onSuccess: (surgeryId) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', surgeryId] });
      toast.success('Team member removed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove team member');
    },
  });
}

// =============================================================================
// PRE-OP ASSESSMENT HOOKS
// =============================================================================

export function useCreatePreOpAssessment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (assessment: Partial<PreOpAssessment>) => {
      const { data, error } = await supabase
        .from('pre_op_assessments')
        .insert({
          surgery_id: assessment.surgery_id!,
          assessed_by: profile?.id!,
          asa_class: assessment.asa_class,
          asa_notes: assessment.asa_notes,
          allergies: assessment.allergies,
          vitals: assessment.vitals as any,
          fasting_confirmed: assessment.fasting_confirmed,
          consent_verified: assessment.consent_verified,
          site_marked: assessment.site_marked,
          is_cleared_for_surgery: assessment.is_cleared_for_surgery,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgery_id] });
      toast.success('Pre-op assessment saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save pre-op assessment');
    },
  });
}

export function useUpdatePreOpAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, surgeryId, ...updates }: Partial<PreOpAssessment> & { id: string; surgeryId: string }) => {
      const { data, error } = await supabase
        .from('pre_op_assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', result.surgeryId] });
      toast.success('Pre-op assessment updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update pre-op assessment');
    },
  });
}

// =============================================================================
// SURGICAL SAFETY CHECKLIST HOOKS
// =============================================================================

export function useSaveChecklist() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ surgeryId, phase, data }: { 
      surgeryId: string; 
      phase: 'sign_in' | 'time_out' | 'sign_out'; 
      data: any 
    }) => {
      const updates: any = {
        [`${phase}_completed`]: true,
        [`${phase}_time`]: new Date().toISOString(),
        [`${phase}_by`]: profile?.id,
        [`${phase}_data`]: data,
      };

      // Try to update first
      const { data: existing } = await supabase
        .from('surgical_safety_checklists')
        .select('id')
        .eq('surgery_id', surgeryId)
        .maybeSingle();

      if (existing) {
        const { data: result, error } = await supabase
          .from('surgical_safety_checklists')
          .update(updates)
          .eq('surgery_id', surgeryId)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('surgical_safety_checklists')
          .insert({ surgery_id: surgeryId, ...updates })
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgeryId] });
      toast.success(`${variables.phase.replace('_', ' ').toUpperCase()} completed`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save checklist');
    },
  });
}

// =============================================================================
// ANESTHESIA RECORD HOOKS
// =============================================================================

export function useSaveAnesthesiaRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surgeryId, ...record }: Partial<AnesthesiaRecord> & { surgeryId: string }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('anesthesia_records')
        .select('id')
        .eq('surgery_id', surgeryId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('anesthesia_records')
          .update(record)
          .eq('surgery_id', surgeryId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('anesthesia_records')
          .insert({ 
            surgery_id: surgeryId, 
            anesthetist_id: record.anesthetist_id!,
            anesthesia_type: record.anesthesia_type!,
            anesthesia_plan: record.anesthesia_plan,
            vitals_log: record.vitals_log as any,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgeryId] });
      toast.success('Anesthesia record saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save anesthesia record');
    },
  });
}

// =============================================================================
// INTRA-OP NOTES HOOKS
// =============================================================================

export function useSaveIntraOpNotes() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ surgeryId, ...notes }: Partial<IntraOpNotes> & { surgeryId: string }) => {
      // Check if notes exist
      const { data: existing } = await supabase
        .from('intra_op_notes')
        .select('id')
        .eq('surgery_id', surgeryId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('intra_op_notes')
          .update(notes)
          .eq('surgery_id', surgeryId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('intra_op_notes')
          .insert({ 
            surgery_id: surgeryId, 
            documented_by: profile?.id!,
            procedure_performed: notes.procedure_performed!,
            approach: notes.approach,
            position: notes.position,
            intra_op_findings: notes.intra_op_findings,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgeryId] });
      toast.success('Intra-op notes saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save intra-op notes');
    },
  });
}

// =============================================================================
// POST-OP RECOVERY HOOKS
// =============================================================================

export function usePACUPatients(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['pacu-patients', profile?.organization_id, branchId],
    queryFn: async () => {
      let query = supabase
        .from('post_op_recovery')
        .select(`
          *,
          surgery:surgeries(
            id, surgery_number, procedure_name, patient_id,
            patient:patients(id, first_name, last_name, patient_number, date_of_birth),
            lead_surgeon:doctors(profile:profiles(full_name))
          ),
          pacu_nurse:nurses(id, profile:profiles(full_name))
        `)
        .is('discharge_time', null)
        .order('pacu_arrival_time', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data as PostOpRecovery[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAdmitToPACU() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surgeryId, nurseId, handoverNotes }: { 
      surgeryId: string; 
      nurseId?: string;
      handoverNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from('post_op_recovery')
        .insert({
          surgery_id: surgeryId,
          pacu_arrival_time: new Date().toISOString(),
          pacu_nurse_id: nurseId,
          handover_notes: handoverNotes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['pacu-patients'] });
      queryClient.invalidateQueries({ queryKey: ['ot-stats'] });
      toast.success('Patient admitted to PACU');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to admit to PACU');
    },
  });
}

export function useUpdatePostOpRecovery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, surgeryId, ...updates }: Partial<PostOpRecovery> & { id: string; surgeryId: string }) => {
      const { data, error } = await supabase
        .from('post_op_recovery')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', result.surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['pacu-patients'] });
      toast.success('Recovery record updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update recovery record');
    },
  });
}

export function useDischargeFromPACU() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, surgeryId, destination, notes }: { 
      id: string; 
      surgeryId: string;
      destination: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('post_op_recovery')
        .update({
          discharge_time: new Date().toISOString(),
          discharged_by: profile?.id,
          discharge_destination: destination,
          discharge_notes: notes,
          discharge_criteria_met: true,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery', result.surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['pacu-patients'] });
      queryClient.invalidateQueries({ queryKey: ['ot-stats'] });
      toast.success('Patient discharged from PACU');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to discharge from PACU');
    },
  });
}

// =============================================================================
// OT STATISTICS HOOKS
// =============================================================================

export function useOTStats(branchId?: string) {
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['ot-stats', profile?.organization_id, branchId, today],
    queryFn: async () => {
      const orgId = profile?.organization_id!;

      // Build base query conditions
      let surgeryQuery = supabase
        .from('surgeries')
        .select('id, status, priority, scheduled_date', { count: 'exact' })
        .eq('organization_id', orgId);

      let roomQuery = supabase
        .from('ot_rooms')
        .select('id, status', { count: 'exact' })
        .eq('organization_id', orgId)
        .eq('is_active', true);

      if (branchId) {
        surgeryQuery = surgeryQuery.eq('branch_id', branchId);
        roomQuery = roomQuery.eq('branch_id', branchId);
      }

      // Get today's surgeries
      const todaySurgeriesQuery = surgeryQuery.eq('scheduled_date', today);

      const [
        { data: todaySurgeries },
        { data: rooms },
        { data: pacuPatients },
        { data: weekSurgeries },
      ] = await Promise.all([
        todaySurgeriesQuery,
        roomQuery,
        supabase
          .from('post_op_recovery')
          .select('id')
          .is('discharge_time', null),
        supabase
          .from('surgeries')
          .select('id')
          .eq('organization_id', orgId)
          .gte('scheduled_date', today)
          .lte('scheduled_date', weekFromNow)
          .eq('status', 'scheduled'),
      ]);

      const stats: OTStats = {
        todaySurgeries: todaySurgeries?.length || 0,
        inProgress: todaySurgeries?.filter(s => s.status === 'in_progress').length || 0,
        completed: todaySurgeries?.filter(s => s.status === 'completed').length || 0,
        availableRooms: rooms?.filter(r => r.status === 'available').length || 0,
        totalRooms: rooms?.length || 0,
        pacuPatients: pacuPatients?.length || 0,
        emergencyCases: todaySurgeries?.filter(s => s.priority === 'emergency').length || 0,
        scheduledThisWeek: weekSurgeries?.length || 0,
      };

      return stats;
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
