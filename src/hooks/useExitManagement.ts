import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateResignation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: {
      employee_id: string;
      resignation_date: string;
      last_working_date: string;
      notice_period_days?: number;
      reason_category?: string;
      reason_details?: string;
      resignation_letter_url?: string;
      notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("resignations")
        .insert({
          employee_id: record.employee_id,
          resignation_date: record.resignation_date,
          last_working_date: record.last_working_date,
          notice_period_days: record.notice_period_days,
          reason_category: record.reason_category,
          reason_details: record.reason_details,
          resignation_letter_url: record.resignation_letter_url,
          notes: record.notes,
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
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status, acknowledged_by, approved_by, ...rest }: {
      id: string;
      status?: string;
      acknowledged_by?: string;
      approved_by?: string;
      notes?: string;
    }) => {
      const updateData: Record<string, unknown> = { 
        ...rest,
        updated_at: new Date().toISOString() 
      };

      if (status) updateData.status = status;
      if (status === 'acknowledged') {
        updateData.acknowledged_by = profile!.id;
        updateData.acknowledged_at = new Date().toISOString();
      }
      if (status === 'accepted') {
        updateData.approved_by = profile!.id;
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("resignations")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Auto-create clearance items when resignation is accepted
      if (status === 'accepted') {
        // Get the resignation to find employee_id
        const { data: resignation } = await supabase
          .from("resignations")
          .select("employee_id")
          .eq("id", id)
          .single();

        if (resignation && profile?.organization_id) {
          const defaultDepartments = [
            { department: "IT", item_description: "Return laptop, access cards, and revoke system access" },
            { department: "Finance", item_description: "Clear pending advances and loan balances" },
            { department: "HR", item_description: "Return ID card, submit final documents" },
            { department: "Admin", item_description: "Return keys, parking card, office equipment" },
            { department: "Department Head", item_description: "Knowledge transfer and handover completion" },
          ];

          // Check if clearance items already exist
          const { data: existing } = await supabase
            .from("employee_clearance")
            .select("id")
            .eq("resignation_id", id)
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase
              .from("employee_clearance")
              .insert(
                defaultDepartments.map(item => ({
                  department: item.department,
                  item_description: item.item_description,
                  resignation_id: id,
                  organization_id: profile.organization_id!,
                }))
              );
          }
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
      queryClient.invalidateQueries({ queryKey: ["employee-clearance"] });
      const msg = variables.status === 'accepted' 
        ? "Resignation accepted. Clearance checklist auto-created." 
        : "Resignation updated successfully";
      toast({ title: "Success", description: msg });
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
      return data;
    },
    enabled: !!resignationId,
  });
}

export function useCreateClearanceItems() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { 
      resignationId: string; 
      items: Array<{ department: string; item_description: string }> 
    }) => {
      const { error } = await supabase
        .from("employee_clearance")
        .insert(
          data.items.map(item => ({
            department: item.department,
            item_description: item.item_description,
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
    mutationFn: async ({ id, is_cleared, remarks, recovery_amount }: {
      id: string;
      is_cleared?: boolean;
      remarks?: string;
      recovery_amount?: number;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (is_cleared !== undefined) {
        updateData.is_cleared = is_cleared;
        if (is_cleared) {
          updateData.cleared_by = profile!.id;
          updateData.cleared_at = new Date().toISOString();
        }
      }
      if (remarks !== undefined) updateData.remarks = remarks;
      if (recovery_amount !== undefined) updateData.recovery_amount = recovery_amount;

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
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
      return data;
    },
    enabled: !!resignationId,
  });
}

export function useCreateFinalSettlement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: {
      resignation_id: string;
      employee_id: string;
      basic_salary_days?: number;
      basic_salary_amount?: number;
      leave_encashment_days?: number;
      leave_encashment_amount?: number;
      bonus_amount?: number;
      gratuity_amount?: number;
      other_earnings?: number;
      other_earnings_details?: string;
      notice_period_shortage_amount?: number;
      loan_recovery?: number;
      advance_recovery?: number;
      tax_deduction?: number;
      other_deductions?: number;
      other_deductions_details?: string;
      notes?: string;
    }) => {
      const totalEarnings = (record.basic_salary_amount || 0) + 
        (record.leave_encashment_amount || 0) + 
        (record.bonus_amount || 0) + 
        (record.gratuity_amount || 0) + 
        (record.other_earnings || 0);
      
      const totalDeductions = (record.notice_period_shortage_amount || 0) + 
        (record.loan_recovery || 0) + 
        (record.advance_recovery || 0) + 
        (record.tax_deduction || 0) + 
        (record.other_deductions || 0);

      const { data: result, error } = await supabase
        .from("final_settlements")
        .insert({
          resignation_id: record.resignation_id,
          employee_id: record.employee_id,
          basic_salary_days: record.basic_salary_days,
          basic_salary_amount: record.basic_salary_amount,
          leave_encashment_days: record.leave_encashment_days,
          leave_encashment_amount: record.leave_encashment_amount,
          bonus_amount: record.bonus_amount,
          gratuity_amount: record.gratuity_amount,
          other_earnings: record.other_earnings,
          other_earnings_details: record.other_earnings_details,
          total_earnings: totalEarnings,
          notice_period_shortage_amount: record.notice_period_shortage_amount,
          loan_recovery: record.loan_recovery,
          advance_recovery: record.advance_recovery,
          tax_deduction: record.tax_deduction,
          other_deductions: record.other_deductions,
          other_deductions_details: record.other_deductions_details,
          total_deductions: totalDeductions,
          net_payable: totalEarnings - totalDeductions,
          notes: record.notes,
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
    mutationFn: async ({ id, status, payment_date, payment_mode, payment_reference }: {
      id: string;
      status?: string;
      payment_date?: string;
      payment_mode?: string;
      payment_reference?: string;
    }) => {
      const updateData: Record<string, unknown> = { 
        updated_at: new Date().toISOString() 
      };
      
      if (status) updateData.status = status;
      if (status === 'approved') {
        updateData.approved_by = profile!.id;
        updateData.approved_at = new Date().toISOString();
      }
      if (payment_date) updateData.payment_date = payment_date;
      if (payment_mode) updateData.payment_mode = payment_mode;
      if (payment_reference) updateData.payment_reference = payment_reference;

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
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
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
      return data;
    },
    enabled: !!resignationId,
  });
}

export function useCreateExitInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: {
      resignation_id: string;
      interview_date?: string;
      interviewer_id?: string;
      rating_management?: number;
      rating_work_environment?: number;
      rating_compensation?: number;
      rating_growth_opportunities?: number;
      rating_work_life_balance?: number;
      primary_reason_leaving?: string;
      what_liked_most?: string;
      what_could_improve?: string;
      would_recommend?: boolean;
      would_rejoin?: boolean;
      suggestions?: string;
      additional_comments?: string;
      status?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("exit_interviews")
        .insert({
          resignation_id: record.resignation_id,
          interview_date: record.interview_date,
          interviewer_id: record.interviewer_id,
          rating_management: record.rating_management,
          rating_work_environment: record.rating_work_environment,
          rating_compensation: record.rating_compensation,
          rating_growth_opportunities: record.rating_growth_opportunities,
          rating_work_life_balance: record.rating_work_life_balance,
          primary_reason_leaving: record.primary_reason_leaving,
          what_liked_most: record.what_liked_most,
          what_could_improve: record.what_could_improve,
          would_recommend: record.would_recommend,
          would_rejoin: record.would_rejoin,
          suggestions: record.suggestions,
          additional_comments: record.additional_comments,
          status: record.status,
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
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
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
