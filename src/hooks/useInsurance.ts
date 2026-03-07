import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types
export interface InsuranceCompany {
  id: string;
  organization_id: string;
  name: string;
  code: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  cchi_payer_code: string | null;
  nphies_payer_id: string | null;
}

export interface InsurancePlan {
  id: string;
  insurance_company_id: string;
  name: string;
  plan_code: string | null;
  plan_type: string | null;
  coverage_percentage: number;
  max_coverage_amount: number | null;
  copay_amount: number;
  copay_percentage: number;
  deductible_amount: number;
  annual_limit: number | null;
  waiting_period_days: number;
  pre_auth_required: boolean;
  covered_services: string[];
  excluded_services: string[];
  notes: string | null;
  is_active: boolean;
  created_at: string;
  insurance_company?: InsuranceCompany;
}

export interface PatientInsurance {
  id: string;
  patient_id: string;
  insurance_plan_id: string;
  policy_number: string;
  group_number: string | null;
  member_id: string | null;
  cchi_number: string | null;
  subscriber_name: string | null;
  subscriber_relationship: string | null;
  start_date: string;
  end_date: string | null;
  is_primary: boolean;
  is_active: boolean;
  verified_at: string | null;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  insurance_plan?: InsurancePlan;
}

export interface InsuranceClaim {
  id: string;
  organization_id: string;
  branch_id: string | null;
  patient_insurance_id: string;
  invoice_id: string | null;
  claim_number: string;
  claim_date: string;
  submission_date: string | null;
  total_amount: number;
  approved_amount: number;
  paid_amount: number;
  copay_amount: number;
  deductible_amount: number;
  patient_responsibility: number;
  status: string;
  pre_auth_number: string | null;
  pre_auth_date: string | null;
  pre_auth_status: string | null;
  drg_code: string | null;
  icd_codes: string[];
  approval_date: string | null;
  rejection_reason: string | null;
  appeal_notes: string | null;
  payment_reference: string | null;
  payment_date: string | null;
  notes: string | null;
  attachments: string[];
  nphies_claim_id: string | null;
  nphies_status: string | null;
  nphies_response: any | null;
  denial_reasons: any[] | null;
  resubmission_count: number;
  patient_insurance?: PatientInsurance & {
    insurance_plan?: InsurancePlan & {
      insurance_company?: InsuranceCompany;
    };
    patient?: {
      id: string;
      first_name: string;
      last_name: string;
      patient_number: string;
    };
  };
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
  };
}

export interface ClaimItem {
  id: string;
  claim_id: string;
  invoice_item_id: string | null;
  service_code: string | null;
  service_name: string;
  service_date: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  approved_amount: number;
  status: string;
  rejection_reason: string | null;
  notes: string | null;
}

// =====================
// Insurance Companies
// =====================

export function useInsuranceCompanies() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["insurance-companies", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_companies")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as InsuranceCompany[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAllInsuranceCompanies() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["all-insurance-companies", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_companies")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as InsuranceCompany[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useInsuranceCompany(id: string | undefined) {
  return useQuery({
    queryKey: ["insurance-company", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("insurance_companies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as InsuranceCompany;
    },
    enabled: !!id,
  });
}

export function useCreateInsuranceCompany() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<InsuranceCompany, "id" | "organization_id" | "created_at" | "is_active">) => {
      const { data: result, error } = await supabase
        .from("insurance_companies")
        .insert({
          ...data,
          organization_id: profile?.organization_id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-companies"] });
      queryClient.invalidateQueries({ queryKey: ["all-insurance-companies"] });
      toast.success("Insurance company created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create company: " + error.message);
    },
  });
}

export function useUpdateInsuranceCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsuranceCompany> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("insurance_companies")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-companies"] });
      queryClient.invalidateQueries({ queryKey: ["all-insurance-companies"] });
      toast.success("Insurance company updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update company: " + error.message);
    },
  });
}

// =====================
// Insurance Plans
// =====================

export function useInsurancePlans(companyId?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["insurance-plans", profile?.organization_id, companyId],
    queryFn: async () => {
      let query = supabase
        .from("insurance_plans")
        .select(`
          *,
          insurance_company:insurance_companies(*)
        `)
        .eq("is_active", true)
        .order("name");

      if (companyId) {
        query = query.eq("insurance_company_id", companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(plan => ({
        ...plan,
        covered_services: (plan.covered_services as unknown as string[]) || [],
        excluded_services: (plan.excluded_services as unknown as string[]) || [],
      })) as InsurancePlan[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useInsurancePlan(id: string | undefined) {
  return useQuery({
    queryKey: ["insurance-plan", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("insurance_plans")
        .select(`
          *,
          insurance_company:insurance_companies(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return {
        ...data,
        covered_services: (data.covered_services as unknown as string[]) || [],
        excluded_services: (data.excluded_services as unknown as string[]) || [],
      } as InsurancePlan;
    },
    enabled: !!id,
  });
}

export function useCreateInsurancePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<InsurancePlan, "id" | "created_at" | "is_active" | "insurance_company">) => {
      const { data: result, error } = await supabase
        .from("insurance_plans")
        .insert({
          ...data,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-plans"] });
      toast.success("Insurance plan created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create plan: " + error.message);
    },
  });
}

export function useUpdateInsurancePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsurancePlan> & { id: string }) => {
      const { insurance_company, ...updateData } = data;
      const { data: result, error } = await supabase
        .from("insurance_plans")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-plans"] });
      toast.success("Insurance plan updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update plan: " + error.message);
    },
  });
}

// =====================
// Patient Insurance
// =====================

export function usePatientInsurance(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient-insurance", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from("patient_insurance")
        .select(`
          *,
          insurance_plan:insurance_plans(
            *,
            insurance_company:insurance_companies(*)
          )
        `)
        .eq("patient_id", patientId)
        .eq("is_active", true)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      return data as PatientInsurance[];
    },
    enabled: !!patientId,
  });
}

export function useCreatePatientInsurance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<PatientInsurance, "id" | "created_at" | "is_active" | "verified_at" | "verified_by" | "insurance_plan">) => {
      const { data: result, error } = await supabase
        .from("patient_insurance")
        .insert({
          ...data,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patient-insurance", variables.patient_id] });
      toast.success("Insurance added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add insurance: " + error.message);
    },
  });
}

export function useUpdatePatientInsurance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patient_id, ...data }: Partial<PatientInsurance> & { id: string; patient_id: string }) => {
      const { insurance_plan, ...updateData } = data;
      const { data: result, error } = await supabase
        .from("patient_insurance")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...result, patient_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["patient-insurance", result.patient_id] });
      toast.success("Insurance updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update insurance: " + error.message);
    },
  });
}

// =====================
// Insurance Claims
// =====================

export function useInsuranceClaims(filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["insurance-claims", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("insurance_claims")
        .select(`
          *,
          patient_insurance:patient_insurance(
            *,
            insurance_plan:insurance_plans(
              *,
              insurance_company:insurance_companies(*)
            ),
            patient:patients(id, first_name, last_name, patient_number)
          ),
          invoice:invoices(id, invoice_number, total_amount)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte("claim_date", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("claim_date", filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(claim => ({
        ...claim,
        attachments: (claim.attachments as unknown as string[]) || [],
      })) as InsuranceClaim[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useInsuranceClaim(id: string | undefined) {
  return useQuery({
    queryKey: ["insurance-claim", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("insurance_claims")
        .select(`
          *,
          patient_insurance:patient_insurance(
            *,
            insurance_plan:insurance_plans(
              *,
              insurance_company:insurance_companies(*)
            ),
            patient:patients(id, first_name, last_name, patient_number, phone, email)
          ),
          invoice:invoices(id, invoice_number, total_amount, status)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return {
        ...data,
        attachments: (data.attachments as unknown as string[]) || [],
      } as InsuranceClaim;
    },
    enabled: !!id,
  });
}

export function useClaimItems(claimId: string | undefined) {
  return useQuery({
    queryKey: ["claim-items", claimId],
    queryFn: async () => {
      if (!claimId) return [];
      
      const { data, error } = await supabase
        .from("claim_items")
        .select("*")
        .eq("claim_id", claimId)
        .order("created_at");

      if (error) throw error;
      return data as ClaimItem[];
    },
    enabled: !!claimId,
  });
}

export function useCreateInsuranceClaim() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      patient_insurance_id: string;
      invoice_id?: string;
      total_amount: number;
      items: Omit<ClaimItem, "id" | "claim_id" | "created_at">[];
      notes?: string;
    }) => {
      // Generate claim number
      const claimNumber = `CLM-${Date.now().toString(36).toUpperCase()}`;
      
      const { data: claim, error: claimError } = await supabase
        .from("insurance_claims")
        .insert({
          organization_id: profile?.organization_id,
          patient_insurance_id: data.patient_insurance_id,
          invoice_id: data.invoice_id,
          claim_number: claimNumber,
          claim_date: new Date().toISOString().split('T')[0],
          total_amount: data.total_amount,
          notes: data.notes,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Insert claim items
      if (data.items.length > 0) {
        const { error: itemsError } = await supabase
          .from("claim_items")
          .insert(
            data.items.map(item => ({
              ...item,
              claim_id: claim.id,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return claim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      toast.success("Claim created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create claim: " + error.message);
    },
  });
}

export function useUpdateInsuranceClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsuranceClaim> & { id: string }) => {
      const { patient_insurance, invoice, attachments, ...updateData } = data;
      const { data: result, error } = await supabase
        .from("insurance_claims")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-claim"] });
      toast.success("Claim updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update claim: " + error.message);
    },
  });
}

export function useSubmitClaim() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("insurance_claims")
        .update({
          status: "submitted",
          submission_date: new Date().toISOString().split('T')[0],
          submitted_by: profile?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-claim"] });
      toast.success("Claim submitted successfully");
    },
    onError: (error) => {
      toast.error("Failed to submit claim: " + error.message);
    },
  });
}

// =====================
// Stats
// =====================

export function useInsuranceStats() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["insurance-stats", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_claims")
        .select("status, total_amount, approved_amount, paid_amount");

      if (error) throw error;

      const stats = {
        total_claims: data.length,
        pending_claims: data.filter(c => ["draft", "submitted", "in_review"].includes(c.status)).length,
        approved_claims: data.filter(c => ["approved", "partially_approved"].includes(c.status)).length,
        paid_claims: data.filter(c => c.status === "paid").length,
        rejected_claims: data.filter(c => c.status === "rejected").length,
        total_amount: data.reduce((sum, c) => sum + Number(c.total_amount), 0),
        approved_amount: data.reduce((sum, c) => sum + Number(c.approved_amount), 0),
        paid_amount: data.reduce((sum, c) => sum + Number(c.paid_amount), 0),
      };

      return stats;
    },
    enabled: !!profile?.organization_id,
  });
}
