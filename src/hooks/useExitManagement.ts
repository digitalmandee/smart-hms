import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ========================
// TYPES
// ========================

export interface Resignation {
  id: string;
  organization_id: string;
  employee_id: string;
  resignation_date: string;
  last_working_date: string;
  notice_period_days: number | null;
  notice_period_served: number | null;
  notice_period_shortage: number | null;
  reason_category: string | null;
  reason_details: string | null;
  is_notice_buyout: boolean;
  buyout_amount: number | null;
  status: 'submitted' | 'acknowledged' | 'accepted' | 'withdrawn' | 'on_hold' | 'completed';
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  resignation_letter_url: string | null;
  notes: string | null;
  created_at: string;
  employee?: {
    full_name: string;
    employee_number: string;
    department?: { name: string };
    designation?: { name: string };
  };
}

export interface EmployeeClearance {
  id: string;
  organization_id: string;
  resignation_id: string;
  department: string;
  item_description: string;
  is_cleared: boolean;
  cleared_by: string | null;
  cleared_at: string | null;
  remarks: string | null;
  pending_items: string | null;
  recovery_amount: number;
}

export interface FinalSettlement {
  id: string;
  organization_id: string;
  resignation_id: string;
  employee_id: string;
  basic_salary_days: number;
  basic_salary_amount: number;
  leave_encashment_days: number;
  leave_encashment_amount: number;
  bonus_amount: number;
  gratuity_amount: number;
  other_earnings: number;
  other_earnings_details: string | null;
  total_earnings: number;
  notice_period_shortage_amount: number;
  loan_recovery: number;
  advance_recovery: number;
  tax_deduction: number;
  other_deductions: number;
  other_deductions_details: string | null;
  total_deductions: number;
  net_payable: number;
  payment_date: string | null;
  payment_mode: string | null;
  payment_reference: string | null;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'on_hold';
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  resignation?: Resignation;
  employee?: {
    full_name: string;
    employee_number: string;
  };
}

export interface ExitInterview {
  id: string;
  organization_id: string;
  resignation_id: string;
  interview_date: string | null;
  interviewer_id: string | null;
  rating_management: number | null;
  rating_work_environment: number | null;
  rating_compensation: number | null;
  rating_growth_opportunities: number | null;
  rating_work_life_balance: number | null;
  primary_reason_leaving: string | null;
  what_liked_most: string | null;
  what_could_improve: string | null;
  would_recommend: boolean | null;
  would_rejoin: boolean | null;
  suggestions: string | null;
  additional_comments: string | null;
  status: 'pending' | 'scheduled' | 'completed' | 'declined';
  created_at: string;
}

// ========================
// RESIGNATIONS HOOKS
// ========================

export function useResignations(status?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["resignations", profile?.organization_id, status],
    queryFn: async () => {
      let query = supabase
        .from("resignations")
        .select(`
          *,
          employee:employees(
            full_name,
            employee_number,
            department:departments(name),
            designation:designations(name)
          )
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Resignation[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useResignation(id: string | undefined) {
  return useQuery({
    queryKey: ["resignation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resignations")
        .select(`
          *,
          employee:employees(
            full_name,
            employee_number,
            department:departments(name),
            designation:designations(name)
          )
        `)
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as Resignation;
    },
    enabled: !!id,
  });
}

export function useCreateResignation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Resignation>) => {
      const { data: result, error } = await supabase
        .from("resignations")
        .insert({
          ...data,
          organization_id: profile!.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
      toast({ title: "Success", description: "Resignation submitted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateResignation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Resignation> & { id: string }) => {
      const { error } = await supabase
        .from("resignations")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
      toast({ title: "Success", description: "Resignation updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// CLEARANCE HOOKS
// ========================

export function useEmployeeClearance(resignationId: string | undefined) {
  return useQuery({
    queryKey: ["employee-clearance", resignationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_clearance")
        .select("*")
        .eq("resignation_id", resignationId!)
        .order("department");

      if (error) throw error;
      return data as EmployeeClearance[];
    },
    enabled: !!resignationId,
  });
}

export function useCreateClearanceItems() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { resignationId: string; items: Partial<EmployeeClearance>[] }) => {
      const { error } = await supabase
        .from("employee_clearance")
        .insert(
          data.items.map(item => ({
            ...item,
            resignation_id: data.resignationId,
            organization_id: profile!.organization_id!,
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-clearance"] });
      toast({ title: "Success", description: "Clearance items created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateClearanceItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmployeeClearance> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.is_cleared) {
        updateData.cleared_by = profile!.id;
        updateData.cleared_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("employee_clearance")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-clearance"] });
      toast({ title: "Success", description: "Clearance item updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// FINAL SETTLEMENT HOOKS
// ========================

export function useFinalSettlements(status?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["final-settlements", profile?.organization_id, status],
    queryFn: async () => {
      let query = supabase
        .from("final_settlements")
        .select(`
          *,
          resignation:resignations(
            resignation_date,
            last_working_date,
            employee:employees(full_name, employee_number)
          )
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FinalSettlement[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useFinalSettlement(resignationId: string | undefined) {
  return useQuery({
    queryKey: ["final-settlement", resignationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("final_settlements")
        .select("*")
        .eq("resignation_id", resignationId!)
        .maybeSingle();

      if (error) throw error;
      return data as FinalSettlement | null;
    },
    enabled: !!resignationId,
  });
}

export function useCreateFinalSettlement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<FinalSettlement>) => {
      const { data: result, error } = await supabase
        .from("final_settlements")
        .insert({
          ...data,
          organization_id: profile!.organization_id!,
          created_by: profile!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["final-settlements"] });
      toast({ title: "Success", description: "Final settlement created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateFinalSettlement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FinalSettlement> & { id: string }) => {
      const updateData: Record<string, unknown> = { 
        ...data, 
        updated_at: new Date().toISOString() 
      };
      
      if (data.status === 'approved') {
        updateData.approved_by = profile!.id;
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("final_settlements")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["final-settlements"] });
      toast({ title: "Success", description: "Final settlement updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// EXIT INTERVIEW HOOKS
// ========================

export function useExitInterviews() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["exit-interviews", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exit_interviews")
        .select(`
          *,
          resignation:resignations(
            employee:employees(full_name, employee_number)
          )
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ExitInterview[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useExitInterview(resignationId: string | undefined) {
  return useQuery({
    queryKey: ["exit-interview", resignationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exit_interviews")
        .select("*")
        .eq("resignation_id", resignationId!)
        .maybeSingle();

      if (error) throw error;
      return data as ExitInterview | null;
    },
    enabled: !!resignationId,
  });
}

export function useCreateExitInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<ExitInterview>) => {
      const { data: result, error } = await supabase
        .from("exit_interviews")
        .insert({
          ...data,
          organization_id: profile!.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-interviews"] });
      toast({ title: "Success", description: "Exit interview created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateExitInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ExitInterview> & { id: string }) => {
      const { error } = await supabase
        .from("exit_interviews")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-interviews"] });
      toast({ title: "Success", description: "Exit interview updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// EXIT MANAGEMENT STATS
// ========================

export function useExitStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["exit-stats", profile?.organization_id],
    queryFn: async () => {
      const { data: resignations } = await supabase
        .from("resignations")
        .select("id, status, created_at")
        .eq("organization_id", profile!.organization_id!);

      const { data: settlements } = await supabase
        .from("final_settlements")
        .select("id, status, net_payable")
        .eq("organization_id", profile!.organization_id!);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      return {
        pendingResignations: resignations?.filter(r => ['submitted', 'acknowledged'].includes(r.status)).length || 0,
        activeExits: resignations?.filter(r => r.status === 'accepted').length || 0,
        completedThisMonth: resignations?.filter(r => 
          r.status === 'completed' && new Date(r.created_at) >= thisMonth
        ).length || 0,
        pendingSettlements: settlements?.filter(s => ['draft', 'pending_approval'].includes(s.status)).length || 0,
        totalSettlementsDue: settlements?.filter(s => s.status === 'approved')
          .reduce((sum, s) => sum + Number(s.net_payable), 0) || 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}
