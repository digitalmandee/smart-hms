import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DrugInteractionMatch {
  id: string;
  drug_a: string;
  drug_b: string;
  severity: string; // 'minor' | 'moderate' | 'major' | 'contraindicated'
  description: string | null;
  source: string | null;
}

/**
 * Looks up known interactions for the given medicine names (case-insensitive).
 * Matches any pair of names present in `names`.
 */
export function useDrugInteractions(names: string[]) {
  const normalized = Array.from(
    new Set(names.map((n) => (n || "").trim().toLowerCase()).filter(Boolean))
  );

  return useQuery({
    queryKey: ["drug-interactions", normalized.sort().join("|")],
    enabled: normalized.length >= 2,
    queryFn: async (): Promise<DrugInteractionMatch[]> => {
      const { data, error } = await supabase
        .from("drug_interactions")
        .select("id, drug_a, drug_b, severity, description, source");

      if (error) throw error;
      if (!data) return [];

      const set = new Set(normalized);
      return (data as DrugInteractionMatch[]).filter((row) => {
        const a = (row.drug_a || "").trim().toLowerCase();
        const b = (row.drug_b || "").trim().toLowerCase();
        if (!a || !b) return false;
        // Match if both drugs appear (substring tolerant)
        const aHit = [...set].some((n) => n.includes(a) || a.includes(n));
        const bHit = [...set].some((n) => n.includes(b) || b.includes(n));
        return aHit && bHit;
      });
    },
    staleTime: 60_000,
  });
}
