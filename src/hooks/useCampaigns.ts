import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { FinancialDonation } from "./useDonations";

export interface DonationCampaign {
  id: string;
  organization_id: string;
  branch_id: string | null;
  campaign_number: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  goal_amount: number;
  collected_amount: number;
  donor_count: number;
  category: string;
  start_date: string;
  end_date: string | null;
  status: string;
  cover_image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useDonationCampaigns() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["donation-campaigns", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_campaigns" as any)
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as DonationCampaign[];
    },
    enabled: !!orgId,
  });
}

export function useDonationCampaign(id: string) {
  return useQuery({
    queryKey: ["donation-campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_campaigns" as any)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as DonationCampaign;
    },
    enabled: !!id,
  });
}

export function useCampaignDonations(campaignId: string) {
  return useQuery({
    queryKey: ["campaign-donations", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_donations" as any)
        .select("*, financial_donors(*)")
        .eq("campaign_id", campaignId)
        .order("donation_date", { ascending: false });
      if (error) throw error;
      return data as unknown as FinancialDonation[];
    },
    enabled: !!campaignId,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: Partial<DonationCampaign>) => {
      const { data, error } = await supabase
        .from("donation_campaigns" as any)
        .insert(campaign as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DonationCampaign;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["donation-campaigns"] });
      toast.success("Campaign created successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DonationCampaign> & { id: string }) => {
      const { data, error } = await supabase
        .from("donation_campaigns" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DonationCampaign;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["donation-campaigns"] });
      qc.invalidateQueries({ queryKey: ["donation-campaign", d.id] });
      toast.success("Campaign updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
