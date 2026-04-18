import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Per-asset depreciation posting — uses each asset's own GL accounts
 * (account_id + depreciation_account_id) instead of asking the user to pick
 * accounts. Server-side function handles idempotency, asset roll-forward,
 * and skipping ineligible assets.
 */
export function usePostPerAssetDepreciation() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const { data, error } = await (supabase as any).rpc("post_monthly_depreciation_per_asset", {
        _organization_id: profile!.organization_id!,
        _month: month,
        _year: year,
      });
      if (error) throw error;
      return data as {
        status: string;
        journal_id?: string;
        period?: string;
        assets_processed?: number;
        skipped?: number;
        no_account?: number;
        total_depreciation?: number;
        reason?: string;
      };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["fixed-assets"] });
      qc.invalidateQueries({ queryKey: ["journal-entries"] });
      if (result.status === "no_op") {
        toast.warning(
          `No depreciation posted: ${result.reason}. ${result.no_account ?? 0} asset(s) missing GL accounts.`
        );
      } else {
        toast.success(
          `Depreciation posted: ${result.assets_processed} asset(s), total ${Number(
            result.total_depreciation || 0
          ).toFixed(2)}${result.no_account ? ` (${result.no_account} skipped — no GL accounts)` : ""}`
        );
      }
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/** Update per-asset GL accounts (asset cost / accumulated dep + depreciation expense) */
export function useUpdateAssetAccounts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      account_id,
      depreciation_account_id,
    }: {
      id: string;
      account_id: string | null;
      depreciation_account_id: string | null;
    }) => {
      const { error } = await supabase
        .from("fixed_assets")
        .update({ account_id, depreciation_account_id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixed-assets"] });
      toast.success("Asset GL accounts updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
