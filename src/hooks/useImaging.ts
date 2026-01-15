import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export type ImagingModality = 'xray' | 'ultrasound' | 'ct_scan' | 'mri' | 'fluoroscopy' | 'mammography' | 'dexa' | 'ecg' | 'echo' | 'pet_ct' | 'other';
export type ImagingOrderStatus = 'ordered' | 'scheduled' | 'in_progress' | 'completed' | 'reported' | 'verified' | 'cancelled';
export type ImagingPriority = 'routine' | 'urgent' | 'stat';
export type ImagingFindingStatus = 'normal' | 'abnormal' | 'critical';

export interface ImagingModalityRecord {
  id: string;
  organization_id: string;
  branch_id: string;
  name: string;
  code: string;
  modality_type: ImagingModality;
  department?: string;
  preparation_instructions?: string;
  default_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImagingProcedure {
  id: string;
  organization_id: string;
  modality_id?: string;
  name: string;
  code: string;
  modality_type: ImagingModality;
  body_part?: string;
  default_views?: string;
  preparation?: string;
  estimated_duration_minutes: number;
  base_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  modality?: ImagingModalityRecord;
}

export interface ImagingOrder {
  id: string;
  organization_id: string;
  branch_id: string;
  order_number: string;
  patient_id: string;
  consultation_id?: string;
  admission_id?: string;
  er_registration_id?: string;
  procedure_id?: string;
  modality: ImagingModality;
  procedure_name: string;
  priority: ImagingPriority;
  clinical_indication?: string;
  clinical_history?: string;
  status: ImagingOrderStatus;
  ordered_by: string;
  ordered_at: string;
  scheduled_date?: string;
  scheduled_time?: string;
  technician_id?: string;
  performed_at?: string;
  radiologist_id?: string;
  reported_at?: string;
  verified_by?: string;
  verified_at?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ImagingOrderWithRelations extends ImagingOrder {
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    patient_number: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    blood_group?: string;
  };
  ordered_by_profile?: {
    id: string;
    full_name: string;
  };
  technician?: {
    full_name: string;
  };
  radiologist?: {
    id: string;
    employee?: {
      first_name: string;
      last_name: string;
    };
  };
  procedure?: ImagingProcedure;
  result?: ImagingResult[];
}

export interface ImagingResult {
  id: string;
  order_id: string;
  findings?: string;
  impression?: string;
  recommendations?: string;
  finding_status?: ImagingFindingStatus;
  images?: unknown[];
  structured_findings?: unknown;
  technique?: string;
  comparison?: string;
  report_template_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ImagingOrderFilters {
  status?: ImagingOrderStatus | ImagingOrderStatus[];
  modality?: ImagingModality;
  priority?: ImagingPriority;
  patientId?: string;
  scheduledDate?: string;
  technicianId?: string;
  radiologistId?: string;
}

// Constants
export const IMAGING_MODALITIES: { value: ImagingModality; label: string }[] = [
  { value: 'xray', label: 'X-Ray' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'ct_scan', label: 'CT Scan' },
  { value: 'mri', label: 'MRI' },
  { value: 'fluoroscopy', label: 'Fluoroscopy' },
  { value: 'mammography', label: 'Mammography' },
  { value: 'dexa', label: 'DEXA Scan' },
  { value: 'ecg', label: 'ECG' },
  { value: 'echo', label: 'Echocardiogram' },
  { value: 'pet_ct', label: 'PET-CT' },
  { value: 'other', label: 'Other' },
];

export const IMAGING_PRIORITIES: { value: ImagingPriority; label: string; color: string }[] = [
  { value: 'routine', label: 'Routine', color: 'bg-blue-100 text-blue-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-amber-100 text-amber-800' },
  { value: 'stat', label: 'STAT', color: 'bg-red-100 text-red-800' },
];

export const IMAGING_STATUSES: { value: ImagingOrderStatus; label: string; color: string }[] = [
  { value: 'ordered', label: 'Ordered', color: 'bg-slate-100 text-slate-800' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Completed', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'reported', label: 'Reported', color: 'bg-green-100 text-green-800' },
  { value: 'verified', label: 'Verified', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

// Hooks
export function useImagingModalities() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['imaging-modalities', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imaging_modalities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as ImagingModalityRecord[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useImagingProcedures(modalityType?: ImagingModality) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['imaging-procedures', profile?.organization_id, modalityType],
    queryFn: async () => {
      let query = supabase
        .from('imaging_procedures')
        .select('*, modality:imaging_modalities(*)')
        .eq('is_active', true)
        .order('name');

      if (modalityType) {
        query = query.eq('modality_type', modalityType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ImagingProcedure[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useImagingOrders(filters: ImagingOrderFilters = {}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['imaging-orders', profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from('imaging_orders')
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, date_of_birth, gender),
          ordered_by_profile:profiles!imaging_orders_ordered_by_fkey(id, full_name),
          technician:profiles!imaging_orders_technician_id_fkey(id, full_name),
          radiologist:doctors!imaging_orders_radiologist_id_fkey(id, employee:employees(first_name, last_name)),
          procedure:imaging_procedures(*)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters.modality) {
        query = query.eq('modality', filters.modality);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      if (filters.scheduledDate) {
        query = query.eq('scheduled_date', filters.scheduledDate);
      }

      if (filters.technicianId) {
        query = query.eq('technician_id', filters.technicianId);
      }

      if (filters.radiologistId) {
        query = query.eq('radiologist_id', filters.radiologistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ImagingOrderWithRelations[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useImagingOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['imaging-order', id],
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');

      const { data, error } = await supabase
        .from('imaging_orders')
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, date_of_birth, gender, phone, blood_group),
          ordered_by_profile:profiles!imaging_orders_ordered_by_fkey(id, full_name),
          technician:profiles!imaging_orders_technician_id_fkey(full_name),
          radiologist:doctors!imaging_orders_radiologist_id_fkey(id, employee:employees(first_name, last_name)),
          procedure:imaging_procedures(*),
          result:imaging_results(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as ImagingOrderWithRelations;
    },
    enabled: !!id,
  });
}

export function useCreateImagingOrder() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (order: Partial<ImagingOrder>) => {
      const insertData = {
        ...order,
        organization_id: profile?.organization_id,
        branch_id: profile?.branch_id,
        ordered_by: profile?.id,
        order_number: '', // Will be auto-generated by trigger
      };
      const { data, error } = await supabase
        .from('imaging_orders')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-orders'] });
      toast.success('Imaging order created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });
}

export function useUpdateImagingOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ImagingOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from('imaging_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['imaging-orders'] });
      queryClient.invalidateQueries({ queryKey: ['imaging-order', data.id] });
      toast.success('Imaging order updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order: ${error.message}`);
    },
  });
}

export function useImagingResult(orderId: string | undefined) {
  return useQuery({
    queryKey: ['imaging-result', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');

      const { data, error } = await supabase
        .from('imaging_results')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data as ImagingResult | null;
    },
    enabled: !!orderId,
  });
}

export function useSaveImagingResult() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ orderId, ...result }: Partial<ImagingResult> & { orderId: string }) => {
      // Check if result exists
      const { data: existing } = await supabase
        .from('imaging_results')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('imaging_results')
          .update(result as any)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert
        const insertData = {
          ...result,
          order_id: orderId,
          created_by: profile?.id,
        };
        const { data, error } = await supabase
          .from('imaging_results')
          .insert(insertData as any)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['imaging-result', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['imaging-order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['imaging-orders'] });
      toast.success('Report saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save report: ${error.message}`);
    },
  });
}

export function useImagingStats() {
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['imaging-stats', profile?.organization_id, today],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('imaging_orders')
        .select('status, priority')
        .gte('created_at', `${today}T00:00:00`);

      if (error) throw error;

      const stats = {
        totalToday: orders?.length || 0,
        pending: orders?.filter(o => ['ordered', 'scheduled'].includes(o.status)).length || 0,
        inProgress: orders?.filter(o => o.status === 'in_progress').length || 0,
        completed: orders?.filter(o => o.status === 'completed').length || 0,
        reported: orders?.filter(o => ['reported', 'verified'].includes(o.status)).length || 0,
        stat: orders?.filter(o => o.priority === 'stat').length || 0,
      };

      return stats;
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePatientImagingHistory(patientId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ['patient-imaging-history', patientId, limit],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID required');

      const { data, error } = await supabase
        .from('imaging_orders')
        .select(`
          *,
          procedure:imaging_procedures(name),
          result:imaging_results(finding_status, impression)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
}

// Modality CRUD
export function useCreateImagingModality() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (modality: Partial<ImagingModalityRecord>) => {
      const insertData = {
        ...modality,
        organization_id: profile?.organization_id,
        branch_id: profile?.branch_id,
      };
      const { data, error } = await supabase
        .from('imaging_modalities')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-modalities'] });
      toast.success('Modality created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create modality: ${error.message}`);
    },
  });
}

export function useUpdateImagingModality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ImagingModalityRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('imaging_modalities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-modalities'] });
      toast.success('Modality updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update modality: ${error.message}`);
    },
  });
}

// Procedure CRUD
export function useCreateImagingProcedure() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (procedure: Partial<ImagingProcedure>) => {
      const insertData = {
        ...procedure,
        organization_id: profile?.organization_id,
      };
      const { data, error } = await supabase
        .from('imaging_procedures')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-procedures'] });
      toast.success('Procedure created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create procedure: ${error.message}`);
    },
  });
}

export function useUpdateImagingProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ImagingProcedure> & { id: string }) => {
      const { data, error } = await supabase
        .from('imaging_procedures')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-procedures'] });
      toast.success('Procedure updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update procedure: ${error.message}`);
    },
  });
}

export function useTechnicianWorklist() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['technician-worklist', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imaging_orders')
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, date_of_birth, gender),
          procedure:imaging_procedures(name, body_part, estimated_duration_minutes)
        `)
        .in('status', ['ordered', 'scheduled', 'in_progress'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ImagingOrderWithRelations[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useReportingWorklist() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['reporting-worklist', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imaging_orders')
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, date_of_birth, gender),
          procedure:imaging_procedures(name, body_part),
          technician:profiles!imaging_orders_technician_id_fkey(full_name),
          result:imaging_results(*)
        `)
        .in('status', ['completed', 'reported'])
        .order('priority', { ascending: false })
        .order('performed_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as ImagingOrderWithRelations[];
    },
    enabled: !!profile?.organization_id,
  });
}
