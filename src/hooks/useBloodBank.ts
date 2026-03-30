import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Note: Blood Bank tables are new - using type assertions until types are regenerated
// After running `npx supabase gen types typescript`, update this file

// Helper to bypass type checking for new tables
const db = supabase as any;

// =============================================
// TYPES
// =============================================

export type BloodGroupType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type DonorStatus = 'active' | 'deferred' | 'permanently_deferred' | 'inactive';
export type DonationStatus = 'registered' | 'screening' | 'collecting' | 'collected' | 'processing' | 'completed' | 'rejected';
export type BloodComponentType = 'whole_blood' | 'packed_rbc' | 'fresh_frozen_plasma' | 'platelet_concentrate' | 'cryoprecipitate' | 'granulocytes';
export type BloodUnitStatus = 'quarantine' | 'available' | 'reserved' | 'cross_matched' | 'issued' | 'transfused' | 'expired' | 'discarded';
export type BloodRequestStatus = 'pending' | 'processing' | 'cross_matching' | 'ready' | 'issued' | 'completed' | 'cancelled';
export type BloodRequestPriority = 'routine' | 'urgent' | 'emergency';
export type CrossMatchResult = 'compatible' | 'incompatible' | 'pending';
export type TransfusionStatus = 'scheduled' | 'in_progress' | 'completed' | 'stopped' | 'cancelled';
export type ReactionSeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';

export interface BloodDonor {
  id: string;
  organization_id: string;
  branch_id: string;
  donor_number: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string;
  gender: string;
  blood_group: BloodGroupType;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  weight_kg: number | null;
  hemoglobin_level: number | null;
  status: DonorStatus;
  deferral_reason: string | null;
  deferral_until: string | null;
  last_donation_date: string | null;
  total_donations: number;
  consent_given: boolean;
  created_at: string;
  updated_at: string;
}

export interface BloodDonation {
  id: string;
  organization_id: string;
  branch_id: string;
  donation_number: string;
  donor_id: string;
  donation_date: string;
  donation_time: string | null;
  donation_type: string;
  hemoglobin_reading: number | null;
  screening_result: string | null;
  bag_number: string | null;
  volume_collected_ml: number | null;
  status: DonationStatus;
  testing_status: string;
  created_at: string;
  donor?: BloodDonor;
}

export interface BloodInventory {
  id: string;
  organization_id: string;
  branch_id: string;
  unit_number: string;
  bag_number: string | null;
  donation_id: string | null;
  blood_group: BloodGroupType;
  component_type: BloodComponentType;
  volume_ml: number;
  collection_date: string;
  expiry_date: string;
  storage_location: string | null;
  status: BloodUnitStatus;
  reserved_for_patient_id: string | null;
  created_at: string;
}

export interface BloodRequest {
  id: string;
  organization_id: string;
  branch_id: string;
  request_number: string;
  patient_id: string;
  admission_id: string | null;
  surgery_id: string | null;
  blood_group: BloodGroupType;
  component_type: BloodComponentType;
  units_requested: number;
  units_issued: number;
  indication: string | null;
  priority: BloodRequestPriority;
  required_by: string | null;
  requesting_department: string | null;
  requested_by: string;
  requested_at: string;
  status: BloodRequestStatus;
  created_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_number: string;
  };
}

export interface CrossMatchTest {
  id: string;
  organization_id: string;
  branch_id: string;
  request_id: string;
  blood_unit_id: string;
  patient_id: string;
  test_number: string | null;
  patient_blood_group: BloodGroupType;
  donor_blood_group: BloodGroupType;
  major_cross_match: CrossMatchResult;
  minor_cross_match: CrossMatchResult;
  overall_result: CrossMatchResult;
  valid_until: string | null;
  performed_by: string | null;
  performed_at: string | null;
  created_at: string;
  blood_unit?: BloodInventory;
  request?: BloodRequest;
}

export interface BloodTransfusion {
  id: string;
  organization_id: string;
  branch_id: string;
  transfusion_number: string;
  request_id: string | null;
  blood_unit_id: string;
  cross_match_id: string | null;
  patient_id: string;
  admission_id: string | null;
  status: TransfusionStatus;
  started_at: string | null;
  completed_at: string | null;
  volume_transfused_ml: number | null;
  created_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string | null;
  };
  blood_unit?: BloodInventory;
}

// =============================================
// BLOOD DONORS HOOKS
// =============================================

export function useBloodDonors(filters?: { status?: DonorStatus; bloodGroup?: BloodGroupType; search?: string; patientId?: string }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-donors", profile?.organization_id, filters],
    queryFn: async () => {
      let query = db
        .from("blood_donors")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.bloodGroup) {
        query = query.eq("blood_group", filters.bloodGroup);
      }
      if (filters?.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,donor_number.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BloodDonor[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useBloodDonor(donorId: string) {
  return useQuery({
    queryKey: ["blood-donor", donorId],
    queryFn: async () => {
      const { data, error } = await db
        .from("blood_donors")
        .select("*")
        .eq("id", donorId)
        .maybeSingle();
      if (error) throw error;
      return data as BloodDonor | null;
    },
    enabled: !!donorId,
  });
}

export function useCreateDonor() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (donor: Partial<BloodDonor>) => {
      const { data, error } = await db
        .from("blood_donors")
        .insert({
          ...donor,
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id!,
          registered_by: profile!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-donors"] });
      toast.success("Donor registered successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to register donor: ${error.message}`);
    },
  });
}

export function useUpdateDonor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BloodDonor> & { id: string }) => {
      const { data, error } = await db
        .from("blood_donors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["blood-donors"] });
      queryClient.invalidateQueries({ queryKey: ["blood-donor", data.id] });
      toast.success("Donor updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update donor: ${error.message}`);
    },
  });
}

// =============================================
// BLOOD DONATIONS HOOKS
// =============================================

export function useBloodDonations(filters?: { status?: DonationStatus; donorId?: string; date?: string }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-donations", profile?.organization_id, filters],
    queryFn: async () => {
      let query = db
        .from("blood_donations")
        .select(`
          *,
          donor:blood_donors(id, first_name, last_name, blood_group, donor_number)
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("donation_date", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.donorId) {
        query = query.eq("donor_id", filters.donorId);
      }
      if (filters?.date) {
        query = query.eq("donation_date", filters.date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BloodDonation[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useTodaysDonations() {
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ["blood-donations", "today", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("blood_donations")
        .select(`
          *,
          donor:blood_donors(id, first_name, last_name, blood_group, donor_number, phone)
        `)
        .eq("organization_id", profile!.organization_id!)
        .eq("donation_date", today)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as BloodDonation[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (donation: Partial<BloodDonation>) => {
      const { data, error } = await db
        .from("blood_donations")
        .insert({
          ...donation,
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id!,
          created_by: profile!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-donations"] });
      toast.success("Donation registered successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to register donation: ${error.message}`);
    },
  });
}

export function useUpdateDonation() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BloodDonation> & { id: string }) => {
      const { data, error } = await db
        .from("blood_donations")
        .update(updates)
        .eq("id", id)
        .select(`*, donor:blood_donors(id, blood_group)`)
        .single();
      if (error) throw error;

      // Auto-create blood_inventory record when donation is completed
      if (updates.status === 'completed' && data?.donor?.blood_group) {
        const collectionDate = data.donation_date || new Date().toISOString().split('T')[0];
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + 35); // 35-day shelf life for whole blood

        const { error: invError } = await db
          .from("blood_inventory")
          .insert({
            organization_id: data.organization_id,
            branch_id: data.branch_id,
            donation_id: data.id,
            blood_group: data.donor.blood_group,
            component_type: 'whole_blood',
            volume_ml: data.volume_collected_ml || 450,
            collection_date: collectionDate,
            expiry_date: expiryDate.toISOString().split('T')[0],
            bag_number: data.bag_number,
            status: 'quarantine',
            created_by: profile?.id,
          });
        if (invError) {
          console.error('Failed to auto-create inventory unit:', invError);
          toast.error('Donation completed but failed to create inventory unit');
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-donations"] });
      queryClient.invalidateQueries({ queryKey: ["blood-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["blood-stock"] });
      toast.success("Donation updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update donation: ${error.message}`);
    },
  });
}

// =============================================
// BLOOD INVENTORY HOOKS
// =============================================

export function useExpiringUnits(withinDays: number = 3) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-inventory", "expiring", profile?.organization_id, withinDays],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + withinDays);

      const { data, error } = await db
        .from("blood_inventory")
        .select("id, unit_number, blood_group, expiry_date, component_type, volume_ml")
        .eq("organization_id", profile!.organization_id!)
        .eq("status", "available")
        .gte("expiry_date", new Date().toISOString().split("T")[0])
        .lte("expiry_date", futureDate.toISOString().split("T")[0])
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      return data as Array<{
        id: string;
        unit_number: string;
        blood_group: string;
        expiry_date: string;
        component_type: string;
        volume_ml: number;
      }>;
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });
}

export function useBloodInventory(filters?: { 
  status?: BloodUnitStatus; 
  bloodGroup?: BloodGroupType; 
  componentType?: BloodComponentType;
  expiringWithinDays?: number;
  search?: string;
}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-inventory", profile?.organization_id, filters],
    queryFn: async () => {
      let query = db
        .from("blood_inventory")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("expiry_date", { ascending: true });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.bloodGroup) {
        query = query.eq("blood_group", filters.bloodGroup);
      }
      if (filters?.componentType) {
        query = query.eq("component_type", filters.componentType);
      }
      if (filters?.expiringWithinDays) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + filters.expiringWithinDays);
        query = query.lte("expiry_date", futureDate.toISOString().split('T')[0]);
      }
      if (filters?.search) {
        query = query.or(`unit_number.ilike.%${filters.search}%,bag_number.ilike.%${filters.search}%,storage_location.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BloodInventory[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAvailableBloodStock() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-stock", "available", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("blood_inventory")
        .select("blood_group, component_type")
        .eq("organization_id", profile!.organization_id!)
        .eq("status", "available")
        .gte("expiry_date", new Date().toISOString().split('T')[0]);
      
      if (error) throw error;

      // Aggregate counts
      const stockByGroup: Record<BloodGroupType, number> = {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 
        'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
      };

      (data as any[]).forEach((unit) => {
        stockByGroup[unit.blood_group as BloodGroupType]++;
      });

      return stockByGroup;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateBloodUnit() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (unit: Partial<BloodInventory>) => {
      const { data, error } = await db
        .from("blood_inventory")
        .insert({
          ...unit,
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id!,
          created_by: profile!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["blood-stock"] });
      toast.success("Blood unit added to inventory");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add blood unit: ${error.message}`);
    },
  });
}

export function useUpdateBloodUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BloodInventory> & { id: string }) => {
      const { data, error } = await db
        .from("blood_inventory")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["blood-stock"] });
      toast.success("Blood unit updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update blood unit: ${error.message}`);
    },
  });
}

// =============================================
// BLOOD REQUESTS HOOKS
// =============================================

export function useBloodRequests(filters?: { status?: BloodRequestStatus; priority?: BloodRequestPriority; patientId?: string }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-requests", profile?.organization_id, filters],
    queryFn: async () => {
      let query = db
        .from("blood_requests")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, blood_group)
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("requested_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters?.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BloodRequest[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePendingRequests() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-requests", "pending", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("blood_requests")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number)
        `)
        .eq("organization_id", profile!.organization_id!)
        .in("status", ["pending", "processing", "cross_matching"])
        .order("priority", { ascending: true })
        .order("requested_at", { ascending: true });
      if (error) throw error;
      return data as BloodRequest[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateBloodRequest() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (request: Partial<BloodRequest>) => {
      const { data, error } = await db
        .from("blood_requests")
        .insert({
          ...request,
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id!,
          requested_by: profile!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-requests"] });
      toast.success("Blood request submitted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit request: ${error.message}`);
    },
  });
}

export function useUpdateBloodRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BloodRequest> & { id: string }) => {
      const { data, error } = await db
        .from("blood_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-requests"] });
      toast.success("Request updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });
}

// =============================================
// CROSS MATCH HOOKS
// =============================================

export function useCrossMatchTests(filters?: { requestId?: string; result?: CrossMatchResult }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["cross-match-tests", profile?.organization_id, filters],
    queryFn: async () => {
      let query = db
        .from("cross_match_tests")
        .select(`
          *,
          blood_unit:blood_inventory(*),
          request:blood_requests(*, patient:patients(id, first_name, last_name))
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (filters?.requestId) {
        query = query.eq("request_id", filters.requestId);
      }
      if (filters?.result) {
        query = query.eq("overall_result", filters.result);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrossMatchTest[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateCrossMatch() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (test: Partial<CrossMatchTest>) => {
      const { data, error } = await db
        .from("cross_match_tests")
        .insert({
          ...test,
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id!,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cross-match-tests"] });
      queryClient.invalidateQueries({ queryKey: ["blood-requests"] });
      toast.success("Cross-match test recorded");
    },
    onError: (error: Error) => {
      toast.error(`Failed to record cross-match: ${error.message}`);
    },
  });
}

export function useUpdateCrossMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CrossMatchTest> & { id: string }) => {
      const { data, error } = await db
        .from("cross_match_tests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cross-match-tests"] });
      queryClient.invalidateQueries({ queryKey: ["blood-inventory"] });
      toast.success("Cross-match updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update cross-match: ${error.message}`);
    },
  });
}

// =============================================
// TRANSFUSION HOOKS
// =============================================

export function useBloodTransfusions(filters?: { status?: TransfusionStatus; patientId?: string }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-transfusions", profile?.organization_id, filters],
    queryFn: async () => {
      let query = db
        .from("blood_transfusions")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number),
          blood_unit:blood_inventory(*)
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BloodTransfusion[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useActiveTransfusions() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-transfusions", "active", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("blood_transfusions")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number),
          blood_unit:blood_inventory(blood_group, component_type, unit_number)
        `)
        .eq("organization_id", profile!.organization_id!)
        .eq("status", "in_progress")
        .order("started_at", { ascending: true });
      if (error) throw error;
      return data as BloodTransfusion[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateTransfusion() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (transfusion: Partial<BloodTransfusion>) => {
      const { data, error } = await db
        .from("blood_transfusions")
        .insert({
          ...transfusion,
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id!,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-transfusions"] });
      queryClient.invalidateQueries({ queryKey: ["blood-inventory"] });
      toast.success("Transfusion scheduled");
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule transfusion: ${error.message}`);
    },
  });
}

export function useUpdateTransfusion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BloodTransfusion> & { id: string }) => {
      const { data, error } = await db
        .from("blood_transfusions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-transfusions"] });
      queryClient.invalidateQueries({ queryKey: ["blood-inventory"] });
      toast.success("Transfusion updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update transfusion: ${error.message}`);
    },
  });
}

// =============================================
// DASHBOARD STATS
// =============================================

export function useBloodBankStats() {
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ["blood-bank-stats", profile?.organization_id],
    queryFn: async () => {
      const [
        donorsResult,
        donationsResult,
        inventoryResult,
        requestsResult,
        transfusionsResult,
        expiringResult,
      ] = await Promise.all([
        db.from("blood_donors").select("*", { count: "exact", head: true }).eq("organization_id", profile!.organization_id!).eq("status", "active"),
        db.from("blood_donations").select("*", { count: "exact", head: true }).eq("organization_id", profile!.organization_id!).eq("donation_date", today),
        db.from("blood_inventory").select("*", { count: "exact", head: true }).eq("organization_id", profile!.organization_id!).eq("status", "available"),
        db.from("blood_requests").select("*", { count: "exact", head: true }).eq("organization_id", profile!.organization_id!).in("status", ["pending", "processing"]),
        db.from("blood_transfusions").select("*", { count: "exact", head: true }).eq("organization_id", profile!.organization_id!).eq("status", "in_progress"),
        db.from("blood_inventory").select("*", { count: "exact", head: true }).eq("organization_id", profile!.organization_id!).eq("status", "available").lte("expiry_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      ]);

      return {
        totalDonors: donorsResult.count || 0,
        todaysDonations: donationsResult.count || 0,
        availableUnits: inventoryResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        activeTransfusions: transfusionsResult.count || 0,
        expiringUnits: expiringResult.count || 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =============================================
// BLOOD BANK ANALYTICS HOOK
// =============================================

export interface BloodBankAnalyticsData {
  monthly: { month: string; collected: number; consumed: number }[];
  bloodGroups: { name: string; value: number; color: string }[];
  trends: { month: string; completed: number; rejected: number }[];
  components: { name: string; volume: number }[];
  stats: {
    totalCollections: number;
    totalConsumed: number;
    collectionTrend: number;
    wastageRate: number;
  };
}

const BLOOD_GROUP_COLORS: Record<string, string> = {
  "O+": "hsl(0, 72%, 51%)",
  "A+": "hsl(217, 91%, 60%)",
  "B+": "hsl(142, 71%, 45%)",
  "AB+": "hsl(270, 70%, 60%)",
  "O-": "hsl(0, 84%, 60%)",
  "A-": "hsl(217, 70%, 50%)",
  "B-": "hsl(142, 50%, 40%)",
  "AB-": "hsl(270, 50%, 50%)",
};

const COMPONENT_LABELS: Record<string, string> = {
  whole_blood: "Whole Blood",
  packed_rbc: "Packed RBC",
  fresh_frozen_plasma: "FFP",
  platelet_concentrate: "Platelets",
  cryoprecipitate: "Cryo",
  granulocytes: "Granulocytes",
};

export function useBloodBankAnalytics() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["blood-bank-analytics", profile?.organization_id],
    queryFn: async (): Promise<BloodBankAnalyticsData> => {
      const orgId = profile!.organization_id!;

      // Fetch all needed data in parallel
      const [donationsRes, inventoryRes] = await Promise.all([
        db.from("blood_donations").select("donation_date, status").eq("organization_id", orgId),
        db.from("blood_inventory").select("blood_group, component_type, status, collection_date").eq("organization_id", orgId),
      ]);

      if (donationsRes.error) throw donationsRes.error;
      if (inventoryRes.error) throw inventoryRes.error;

      const donations = donationsRes.data as { donation_date: string; status: string }[];
      const inventoryItems = inventoryRes.data as { blood_group: string; component_type: string; status: string; collection_date: string }[];

      // Build month labels for last 12 months
      const monthLabels: string[] = [];
      const monthKeys: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        monthLabels.push(d.toLocaleString("en", { month: "short" }));
        monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }

      // Monthly collection vs consumption
      const monthlyCollected: Record<string, number> = {};
      const monthlyConsumed: Record<string, number> = {};
      monthKeys.forEach((k) => { monthlyCollected[k] = 0; monthlyConsumed[k] = 0; });

      donations.forEach((d) => {
        if (d.status === "completed") {
          const key = d.donation_date.substring(0, 7);
          if (monthlyCollected[key] !== undefined) monthlyCollected[key]++;
        }
      });

      inventoryItems.forEach((u) => {
        if (u.status === "issued" || u.status === "transfused") {
          const key = u.collection_date.substring(0, 7);
          if (monthlyConsumed[key] !== undefined) monthlyConsumed[key]++;
        }
      });

      const monthly = monthKeys.map((k, i) => ({
        month: monthLabels[i],
        collected: monthlyCollected[k],
        consumed: monthlyConsumed[k],
      }));

      // Blood group distribution
      const bgCounts: Record<string, number> = {};
      inventoryItems.forEach((u) => {
        bgCounts[u.blood_group] = (bgCounts[u.blood_group] || 0) + 1;
      });
      const bloodGroups = Object.entries(bgCounts)
        .map(([name, value]) => ({ name, value, color: BLOOD_GROUP_COLORS[name] || "hsl(0,0%,50%)" }))
        .sort((a, b) => b.value - a.value);

      // Donation trends (completed vs rejected by month)
      const monthlyCompleted: Record<string, number> = {};
      const monthlyRejected: Record<string, number> = {};
      monthKeys.forEach((k) => { monthlyCompleted[k] = 0; monthlyRejected[k] = 0; });

      donations.forEach((d) => {
        const key = d.donation_date.substring(0, 7);
        if (d.status === "completed" && monthlyCompleted[key] !== undefined) monthlyCompleted[key]++;
        if (d.status === "rejected" && monthlyRejected[key] !== undefined) monthlyRejected[key]++;
      });

      const trends = monthKeys.map((k, i) => ({
        month: monthLabels[i],
        completed: monthlyCompleted[k],
        rejected: monthlyRejected[k],
      }));

      // Component breakdown
      const compCounts: Record<string, number> = {};
      inventoryItems.forEach((u) => {
        compCounts[u.component_type] = (compCounts[u.component_type] || 0) + 1;
      });
      const components = Object.entries(compCounts)
        .map(([key, volume]) => ({ name: COMPONENT_LABELS[key] || key, volume }))
        .sort((a, b) => b.volume - a.volume);

      // Summary stats
      const currentMonthKey = monthKeys[monthKeys.length - 1];
      const prevMonthKey = monthKeys[monthKeys.length - 2];
      const totalCollections = monthlyCollected[currentMonthKey] || 0;
      const totalConsumed = monthlyConsumed[currentMonthKey] || 0;
      const prevCollections = monthlyCollected[prevMonthKey] || 0;
      const collectionTrend = prevCollections > 0
        ? Math.round(((totalCollections - prevCollections) / prevCollections) * 100)
        : 0;
      const expiredCount = inventoryItems.filter((u) => u.status === "expired" || u.status === "discarded").length;
      const totalUnits = inventoryItems.length;
      const wastageRate = totalUnits > 0 ? +((expiredCount / totalUnits) * 100).toFixed(1) : 0;

      return { monthly, bloodGroups, trends, components, stats: { totalCollections, totalConsumed, collectionTrend, wastageRate } };
    },
    enabled: !!profile?.organization_id,
  });
}
