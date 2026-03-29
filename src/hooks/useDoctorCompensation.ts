import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface DoctorCompensationPlan {
  id: string;
  organization_id: string;
  doctor_id: string;
  plan_type: 'fixed_salary' | 'per_consultation' | 'per_procedure' | 'revenue_share' | 'hybrid';
  anesthesia_share_percent?: number;
  base_salary: number;
  consultation_share_percent: number;
  procedure_share_percent: number;
  surgery_share_percent: number;
  lab_referral_percent: number;
  radiology_referral_percent: number;
  minimum_guarantee: number;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  doctor?: {
    id: string;
    employee?: {
      full_name: string;
      employee_number: string;
    };
  };
}

export interface DoctorEarning {
  id: string;
  organization_id: string;
  doctor_id: string;
  compensation_plan_id: string | null;
  earning_date: string;
  source_type: 'consultation' | 'procedure' | 'surgery' | 'lab_referral' | 'radiology_referral' | 'pharmacy_referral' | 'ipd_visit' | 'other';
  source_id: string | null;
  source_reference: string | null;
  patient_id: string | null;
  gross_amount: number;
  doctor_share_percent: number;
  doctor_share_amount: number;
  hospital_share_amount: number;
  is_paid: boolean;
  paid_in_payroll_id: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  doctor?: {
    id: string;
    employee?: {
      full_name: string;
    };
  };
  patient?: {
    full_name: string;
    mr_number: string;
  };
}

// ========================
// COMPENSATION PLANS HOOKS
// ========================

export function useDoctorCompensationPlans() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["doctor-compensation-plans", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_compensation_plans")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useDoctorCompensationPlan(doctorId: string | undefined) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["doctor-compensation-plan", doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_compensation_plans")
        .select("*")
        .eq("doctor_id", doctorId!)
        .eq("is_active", true)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as DoctorCompensationPlan | null;
    },
    enabled: !!doctorId && !!profile?.organization_id,
  });
}

export function useCreateCompensationPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: Partial<DoctorCompensationPlan>) => {
      const { error } = await supabase
        .from("doctor_compensation_plans")
        .insert({
          doctor_id: record.doctor_id!,
          plan_type: record.plan_type!,
          base_salary: record.base_salary,
          consultation_share_percent: record.consultation_share_percent,
          procedure_share_percent: record.procedure_share_percent,
          surgery_share_percent: record.surgery_share_percent,
          lab_referral_percent: record.lab_referral_percent,
          radiology_referral_percent: record.radiology_referral_percent,
          minimum_guarantee: record.minimum_guarantee,
          effective_from: record.effective_from!,
          effective_to: record.effective_to,
          is_active: record.is_active,
          notes: record.notes,
          organization_id: profile!.organization_id!,
          created_by: profile!.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-compensation-plans"] });
      toast({ title: "Success", description: "Compensation plan created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateCompensationPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<DoctorCompensationPlan> & { id: string }) => {
      const { error } = await supabase
        .from("doctor_compensation_plans")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-compensation-plans"] });
      toast({ title: "Success", description: "Compensation plan updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// DOCTOR EARNINGS HOOKS
// ========================

export function useDoctorEarnings(filters?: {
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  isPaid?: boolean;
  sourceType?: string;
}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["doctor-earnings", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("doctor_earnings")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("earning_date", { ascending: false });

      if (filters?.doctorId) {
        query = query.eq("doctor_id", filters.doctorId);
      }
      if (filters?.startDate) {
        query = query.gte("earning_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("earning_date", filters.endDate);
      }
      if (filters?.isPaid !== undefined) {
        query = query.eq("is_paid", filters.isPaid);
      }
      if (filters?.sourceType) {
        query = query.eq("source_type", filters.sourceType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useDoctorEarningsSummary(doctorId: string | undefined, month?: string, year?: number) {
  const { profile } = useAuth();
  const currentDate = new Date();
  const targetMonth = month || String(currentDate.getMonth() + 1).padStart(2, '0');
  const targetYear = year || currentDate.getFullYear();

  return useQuery({
    queryKey: ["doctor-earnings-summary", doctorId, targetMonth, targetYear],
    queryFn: async () => {
      const startDate = `${targetYear}-${targetMonth}-01`;
      const endDate = new Date(targetYear, parseInt(targetMonth), 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("doctor_earnings")
        .select("source_type, doctor_share_amount, is_paid")
        .eq("doctor_id", doctorId!)
        .gte("earning_date", startDate)
        .lte("earning_date", endDate);

      if (error) throw error;

      const summary = {
        total: 0,
        paid: 0,
        unpaid: 0,
        bySource: {} as Record<string, number>,
      };

      data.forEach((earning) => {
        summary.total += Number(earning.doctor_share_amount);
        if (earning.is_paid) {
          summary.paid += Number(earning.doctor_share_amount);
        } else {
          summary.unpaid += Number(earning.doctor_share_amount);
        }
        summary.bySource[earning.source_type] = 
          (summary.bySource[earning.source_type] || 0) + Number(earning.doctor_share_amount);
      });

      return summary;
    },
    enabled: !!doctorId && !!profile?.organization_id,
  });
}

export function useCreateDoctorEarning() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: Partial<DoctorEarning>) => {
      const { error } = await supabase
        .from("doctor_earnings")
        .insert({
          doctor_id: record.doctor_id!,
          compensation_plan_id: record.compensation_plan_id,
          earning_date: record.earning_date!,
          source_type: record.source_type!,
          source_id: record.source_id,
          source_reference: record.source_reference,
          patient_id: record.patient_id,
          gross_amount: record.gross_amount!,
          doctor_share_percent: record.doctor_share_percent!,
          doctor_share_amount: record.doctor_share_amount!,
          hospital_share_amount: record.hospital_share_amount!,
          notes: record.notes,
          organization_id: profile!.organization_id!,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-earnings"] });
      toast({ title: "Success", description: "Doctor earning recorded" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useMarkEarningsAsPaid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (earningIds: string[]) => {
      const { error } = await supabase
        .from("doctor_earnings")
        .update({ 
          is_paid: true, 
          paid_at: new Date().toISOString() 
        })
        .in("id", earningIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-earnings"] });
      toast({ title: "Success", description: "Earnings marked as paid" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// SELF-SERVICE WALLET HOOKS
// ========================

export function useMyWalletSummary(month?: string, year?: number) {
  const { profile } = useAuth();
  const currentDate = new Date();
  const targetMonth = month || String(currentDate.getMonth() + 1).padStart(2, '0');
  const targetYear = year || currentDate.getFullYear();

  return useQuery({
    queryKey: ["my-wallet-summary", profile?.id, targetMonth, targetYear],
    queryFn: async () => {
      // First find the doctor record for this profile
      const { data: doctorRecord, error: docError } = await supabase
        .from("doctors")
        .select("id")
        .eq("profile_id", profile!.id)
        .maybeSingle();

      if (docError) throw docError;
      if (!doctorRecord) return { total: 0, paid: 0, unpaid: 0, bySource: {} };

      const startDate = `${targetYear}-${targetMonth}-01`;
      const endDate = new Date(targetYear, parseInt(targetMonth), 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("doctor_earnings")
        .select("source_type, doctor_share_amount, is_paid")
        .eq("doctor_id", doctorRecord.id)
        .gte("earning_date", startDate)
        .lte("earning_date", endDate);

      if (error) throw error;

      const summary = {
        total: 0,
        paid: 0,
        unpaid: 0,
        bySource: {} as Record<string, number>,
      };

      data.forEach((earning) => {
        const amount = Number(earning.doctor_share_amount);
        summary.total += amount;
        if (earning.is_paid) {
          summary.paid += amount;
        } else {
          summary.unpaid += amount;
        }
        summary.bySource[earning.source_type] = 
          (summary.bySource[earning.source_type] || 0) + amount;
      });

      return summary;
    },
    enabled: !!profile?.id,
  });
}

export function useMyEarnings(filters?: {
  month?: string;
  year?: number;
  isPaid?: boolean;
}) {
  const { profile } = useAuth();
  const currentDate = new Date();
  const targetMonth = filters?.month || String(currentDate.getMonth() + 1).padStart(2, '0');
  const targetYear = filters?.year || currentDate.getFullYear();

  return useQuery({
    queryKey: ["my-earnings", profile?.id, targetMonth, targetYear, filters?.isPaid],
    queryFn: async () => {
      // First find the doctor record for this profile
      const { data: doctorRecord, error: docError } = await supabase
        .from("doctors")
        .select("id")
        .eq("profile_id", profile!.id)
        .maybeSingle();

      if (docError) throw docError;
      if (!doctorRecord) return [];

      const startDate = `${targetYear}-${targetMonth}-01`;
      const endDate = new Date(targetYear, parseInt(targetMonth), 0).toISOString().split('T')[0];

      let query = supabase
        .from("doctor_earnings")
        .select("*")
        .eq("doctor_id", doctorRecord.id)
        .gte("earning_date", startDate)
        .lte("earning_date", endDate)
        .order("earning_date", { ascending: false });

      if (filters?.isPaid !== undefined) {
        query = query.eq("is_paid", filters.isPaid);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
}

export function useSettleWalletEarnings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ doctorId, payrollRunId }: { doctorId: string; payrollRunId: string }) => {
      const { error } = await supabase
        .from("doctor_earnings")
        .update({ 
          is_paid: true, 
          paid_in_payroll_id: payrollRunId,
          paid_at: new Date().toISOString() 
        })
        .eq("doctor_id", doctorId)
        .eq("is_paid", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["my-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["my-wallet-summary"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUnpaidEarningsForEmployee(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["unpaid-earnings-employee", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;

      // Get doctor record for this employee
      const { data: doctor, error: docError } = await supabase
        .from("doctors")
        .select("id")
        .eq("employee_id", employeeId)
        .maybeSingle();

      if (docError) throw docError;
      if (!doctor) return null;

      // Get unpaid earnings
      const { data, error } = await supabase
        .from("doctor_earnings")
        .select("id, source_type, doctor_share_amount")
        .eq("doctor_id", doctor.id)
        .eq("is_paid", false);

      if (error) throw error;

      const total = data.reduce((sum, e) => sum + Number(e.doctor_share_amount), 0);
      const bySource: Record<string, number> = {};
      data.forEach(e => {
        bySource[e.source_type] = (bySource[e.source_type] || 0) + Number(e.doctor_share_amount);
      });

      return { doctorId: doctor.id, total, bySource, earningIds: data.map(e => e.id) };
    },
    enabled: !!employeeId,
  });
}
