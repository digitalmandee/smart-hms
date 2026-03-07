import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MedicalCode {
  id: string;
  code: string;
  code_type: string;
  description: string;
  description_ar: string | null;
  category: string | null;
}

export function useSearchMedicalCodes(
  query: string,
  codeType: "icd10" | "cpt" | "drg"
) {
  const [results, setResults] = useState<MedicalCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchTerm = `%${query}%`;
        const { data, error } = await supabase
          .from("medical_codes")
          .select("id, code, code_type, description, description_ar, category")
          .eq("code_type", codeType)
          .eq("is_active", true)
          .or(`code.ilike.${searchTerm},description.ilike.${searchTerm},description_ar.ilike.${searchTerm}`)
          .limit(20);

        if (error) throw error;
        setResults((data as MedicalCode[]) || []);
      } catch (err) {
        console.error("Error searching medical codes:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, codeType]);

  return { results, isLoading };
}
