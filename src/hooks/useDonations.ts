import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types (not in generated types yet, so define manually)
export interface FinancialDonor {
  id: string;
  organization_id: string;
  branch_id: string | null;
  donor_number: string;
  donor_type: string;
  name: string;
  name_ar: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  cnic_passport: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  is_active: boolean;
  total_donated: number;
  total_donations_count: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialDonation {
  id: string;
  organization_id: string;
  branch_id: string | null;
  donor_id: string;
  donation_number: string;
  amount: number;
  currency: string;
  donation_date: string;
  donation_type: string;
  payment_method: string;
  payment_reference: string | null;
  purpose: string;
  purpose_detail: string | null;
  receipt_number: string | null;
  receipt_issued: boolean;
  receipt_issued_at: string | null;
  notes: string | null;
  status: string;
  campaign_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  financial_donors?: FinancialDonor;
}

export interface DonationRecurringSchedule {
  id: string;
  organization_id: string;
  donor_id: string;
  amount: number;
  frequency: string;
  purpose: string | null;
  start_date: string;
  end_date: string | null;
  next_due_date: string;
  last_donation_id: string | null;
  is_active: boolean;
  reminder_days_before: number;
  total_collected: number;
  installments_paid: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  financial_donors?: FinancialDonor;
}

export interface DonationReminder {
  id: string;
  organization_id: string;
  schedule_id: string;
  donor_id: string;
  reminder_date: string;
  reminder_type: string;
  status: string;
  sent_at: string | null;
  notes: string | null;
  created_at: string;
}

// ─── Donors ───

export function useFinancialDonors() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["financial-donors", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_donors" as any)
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as FinancialDonor[];
    },
    enabled: !!orgId,
  });
}

export function useFinancialDonor(id: string) {
  return useQuery({
    queryKey: ["financial-donor", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_donors" as any)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as FinancialDonor;
    },
    enabled: !!id,
  });
}

export function useCreateDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (donor: Partial<FinancialDonor>) => {
      const { data, error } = await supabase
        .from("financial_donors" as any)
        .insert(donor as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as FinancialDonor;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial-donors"] });
      toast.success("Donor registered successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialDonor> & { id: string }) => {
      const { data, error } = await supabase
        .from("financial_donors" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as FinancialDonor;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["financial-donors"] });
      qc.invalidateQueries({ queryKey: ["financial-donor", d.id] });
      toast.success("Donor updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Donations ───

export function useFinancialDonations(donorId?: string) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["financial-donations", orgId, donorId],
    queryFn: async () => {
      let q = supabase
        .from("financial_donations" as any)
        .select("*, financial_donors(*)")
        .eq("organization_id", orgId)
        .order("donation_date", { ascending: false });
      if (donorId) q = q.eq("donor_id", donorId);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as FinancialDonation[];
    },
    enabled: !!orgId,
  });
}

export function useFinancialDonation(id: string) {
  return useQuery({
    queryKey: ["financial-donation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_donations" as any)
        .select("*, financial_donors(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as FinancialDonation;
    },
    enabled: !!id,
  });
}

export function useCreateDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (donation: Partial<FinancialDonation>) => {
      const { data, error } = await supabase
        .from("financial_donations" as any)
        .insert(donation as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as FinancialDonation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial-donations"] });
      qc.invalidateQueries({ queryKey: ["financial-donors"] });
      toast.success("Donation recorded successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialDonation> & { id: string }) => {
      const { data, error } = await supabase
        .from("financial_donations" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as FinancialDonation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial-donations"] });
      qc.invalidateQueries({ queryKey: ["financial-donors"] });
      toast.success("Donation updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Recurring Schedules ───

export function useRecurringSchedules() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["donation-recurring-schedules", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_recurring_schedules" as any)
        .select("*, financial_donors(*)")
        .eq("organization_id", orgId)
        .order("next_due_date", { ascending: true });
      if (error) throw error;
      return data as unknown as DonationRecurringSchedule[];
    },
    enabled: !!orgId,
  });
}

export function useCreateRecurringSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (schedule: Partial<DonationRecurringSchedule>) => {
      const { data, error } = await supabase
        .from("donation_recurring_schedules" as any)
        .insert(schedule as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["donation-recurring-schedules"] });
      toast.success("Recurring schedule created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateRecurringSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from("donation_recurring_schedules" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["donation-recurring-schedules"] });
      toast.success("Schedule updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Dashboard Stats ───

export function useDonationStats() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["donation-stats", orgId],
    queryFn: async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

      const [allDonations, monthDonations, pledged, recurringActive] = await Promise.all([
        supabase
          .from("financial_donations" as any)
          .select("amount, status")
          .eq("organization_id", orgId)
          .eq("status", "received"),
        supabase
          .from("financial_donations" as any)
          .select("amount")
          .eq("organization_id", orgId)
          .eq("status", "received")
          .gte("donation_date", monthStart),
        supabase
          .from("financial_donations" as any)
          .select("amount")
          .eq("organization_id", orgId)
          .eq("status", "pledged"),
        supabase
          .from("donation_recurring_schedules" as any)
          .select("id")
          .eq("organization_id", orgId)
          .eq("is_active", true),
      ]);

      const totalReceived = (allDonations.data as any[])?.reduce((s: number, d: any) => s + Number(d.amount), 0) || 0;
      const thisMonth = (monthDonations.data as any[])?.reduce((s: number, d: any) => s + Number(d.amount), 0) || 0;
      const pendingPledges = (pledged.data as any[])?.reduce((s: number, d: any) => s + Number(d.amount), 0) || 0;
      const activeRecurring = recurringActive.data?.length || 0;

      return { totalReceived, thisMonth, pendingPledges, activeRecurring };
    },
    enabled: !!orgId,
  });
}
