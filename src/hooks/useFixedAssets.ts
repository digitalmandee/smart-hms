import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFixedAssets() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["fixed-assets", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixed_assets")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateFixedAsset() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: {
      name: string;
      category?: string;
      description?: string;
      location?: string;
      purchase_date: string;
      purchase_cost: number;
      useful_life_months: number;
      depreciation_method?: string;
      salvage_value?: number;
    }) => {
      const nbv = values.purchase_cost - (values.salvage_value || 0);
      const { data, error } = await supabase
        .from("fixed_assets")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id,
          ...values,
          net_book_value: nbv,
          created_by: profile!.id,
        })
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixed-assets"] });
      toast.success("Fixed asset registered");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDisposeFixedAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, disposal_amount, disposed_date }: { id: string; disposal_amount: number; disposed_date: string }) => {
      const { error } = await supabase
        .from("fixed_assets")
        .update({ status: "disposed", disposal_amount, disposed_date })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixed-assets"] });
      toast.success("Asset disposed");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/** Calculate depreciation schedule for an asset */
export function calculateDepreciation(asset: {
  purchase_cost: number;
  salvage_value: number;
  useful_life_months: number;
  depreciation_method: string;
  purchase_date: string;
}) {
  const depreciableAmount = asset.purchase_cost - (asset.salvage_value || 0);
  const months = asset.useful_life_months;
  const schedule: { month: number; date: string; expense: number; accumulated: number; nbv: number }[] = [];

  if (asset.depreciation_method === "reducing_balance") {
    const rate = 1 - Math.pow((asset.salvage_value || 1) / asset.purchase_cost, 1 / (months / 12));
    let nbv = asset.purchase_cost;
    for (let i = 1; i <= months; i++) {
      const annual = nbv * rate;
      const monthly = annual / 12;
      const accumulated = asset.purchase_cost - nbv + monthly;
      nbv -= monthly;
      const d = new Date(asset.purchase_date);
      d.setMonth(d.getMonth() + i);
      schedule.push({ month: i, date: d.toISOString().slice(0, 10), expense: Math.round(monthly * 100) / 100, accumulated: Math.round(accumulated * 100) / 100, nbv: Math.round(Math.max(nbv, asset.salvage_value || 0) * 100) / 100 });
    }
  } else {
    // Straight-line
    const monthlyDep = depreciableAmount / months;
    for (let i = 1; i <= months; i++) {
      const accumulated = monthlyDep * i;
      const nbv = asset.purchase_cost - accumulated;
      const d = new Date(asset.purchase_date);
      d.setMonth(d.getMonth() + i);
      schedule.push({ month: i, date: d.toISOString().slice(0, 10), expense: Math.round(monthlyDep * 100) / 100, accumulated: Math.round(accumulated * 100) / 100, nbv: Math.round(Math.max(nbv, asset.salvage_value || 0) * 100) / 100 });
    }
  }
  return schedule;
}
