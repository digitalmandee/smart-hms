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

export function useBloodDonors(filters?: { status?: DonorStatus; bloodGroup?: BloodGroupType; search?: string }) {
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

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BloodDonation> & { id: string }) => {
      const { data, error } = await db
        .from("blood_donations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-donations"] });
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

export function useBloodInventory(filters?: { 
  status?: BloodUnitStatus; 
  bloodGroup?: BloodGroupType; 
  componentType?: BloodComponentType;
  expiringWithinDays?: number;
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
