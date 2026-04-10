import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { calculateDepreciation } from "@/hooks/useFixedAssets";

export function useDepreciationPosting() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      month,
      year,
      depreciationExpenseAccountId,
      accumulatedDepAccountId,
    }: {
      month: number; // 1-12
      year: number;
      depreciationExpenseAccountId: string;
      accumulatedDepAccountId: string;
    }) => {
      const orgId = profile!.organization_id!;
      const periodKey = `${year}-${String(month).padStart(2, "0")}`;

      // Check idempotency — don't double-post for the same month
      const { data: existing } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("organization_id", orgId)
        .eq("reference_type", "depreciation" as any)
        .eq("reference_number", periodKey)
        .limit(1);

      if (existing && existing.length > 0) {
        throw new Error(`Depreciation already posted for ${periodKey}`);
      }

      // Get all active fixed assets
      const { data: assets, error: aErr } = await supabase
        .from("fixed_assets")
        .select("*")
        .eq("organization_id", orgId)
        .eq("status", "active");
      if (aErr) throw aErr;
      if (!assets || assets.length === 0) throw new Error("No active assets to depreciate");

      // Calculate monthly depreciation for each asset
      const depEntries: { assetId: string; assetName: string; monthlyDep: number }[] = [];
      const targetDate = new Date(year, month - 1, 1);

      for (const asset of assets) {
        const schedule = calculateDepreciation({
          purchase_cost: Number(asset.purchase_cost),
          salvage_value: Number(asset.salvage_value || 0),
          useful_life_months: asset.useful_life_months,
          depreciation_method: asset.depreciation_method || "straight_line",
          purchase_date: asset.purchase_date,
        });

        const purchaseDate = new Date(asset.purchase_date);
        const monthsElapsed =
          (targetDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
          (targetDate.getMonth() - purchaseDate.getMonth());

        if (monthsElapsed >= 1 && monthsElapsed <= schedule.length) {
          const entry = schedule[monthsElapsed - 1];
          if (entry && entry.expense > 0) {
            depEntries.push({
              assetId: asset.id,
              assetName: asset.name,
              monthlyDep: entry.expense,
            });
          }
        }
      }

      if (depEntries.length === 0) {
        throw new Error("No depreciation to post for this period");
      }

      const totalDep = depEntries.reduce((s, e) => s + e.monthlyDep, 0);
      const entryDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

      // Create journal entry
      const { data: je, error: jeErr } = await supabase
        .from("journal_entries")
        .insert({
          organization_id: orgId,
          branch_id: profile!.branch_id,
          entry_date: entryDate,
          posting_date: entryDate,
          entry_number: "",
          reference_type: "depreciation" as any,
          reference_number: periodKey,
          description: `Monthly Depreciation for ${periodKey} (${depEntries.length} assets)`,
          total_debit: totalDep,
          total_credit: totalDep,
          is_posted: true,
          posted_at: new Date().toISOString(),
          posted_by: profile!.id,
          created_by: profile!.id,
        })
        .select();
      if (jeErr) throw jeErr;
      const journalId = je?.[0]?.id;

      // Create lines: DR Depreciation Expense, CR Accumulated Depreciation
      const lines = [
        {
          journal_entry_id: journalId,
          account_id: depreciationExpenseAccountId,
          debit_amount: Math.round(totalDep * 100) / 100,
          credit_amount: 0,
          description: `Depreciation expense ${periodKey}: ${depEntries.map(e => e.assetName).join(", ")}`,
        },
        {
          journal_entry_id: journalId,
          account_id: accumulatedDepAccountId,
          debit_amount: 0,
          credit_amount: Math.round(totalDep * 100) / 100,
          description: `Accumulated depreciation ${periodKey}`,
        },
      ];

      const { error: lErr } = await supabase.from("journal_entry_lines").insert(lines);
      if (lErr) throw lErr;

      // Update each asset's accumulated_depreciation and net_book_value
      for (const entry of depEntries) {
        const asset = assets.find(a => a.id === entry.assetId)!;
        const newAccum = Number(asset.accumulated_depreciation || 0) + entry.monthlyDep;
        const newNBV = Number(asset.purchase_cost) - newAccum;
        await supabase
          .from("fixed_assets")
          .update({
            accumulated_depreciation: Math.round(newAccum * 100) / 100,
            net_book_value: Math.round(Math.max(newNBV, Number(asset.salvage_value || 0)) * 100) / 100,
            last_depreciation_date: entryDate,
          })
          .eq("id", entry.assetId);
      }

      return { journalId, assetsProcessed: depEntries.length, totalDep };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["fixed-assets"] });
      qc.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success(`Depreciation posted: ${result.assetsProcessed} assets, total ${result.totalDep.toFixed(2)}`);
    },
    onError: (e: any) => toast.error(e.message),
  });
}
