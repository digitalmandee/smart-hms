import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type SuggestionType = "diagnosis" | "prescription" | "lab_order" | "soap_note";

interface LogSuggestionParams {
  conversationId: string;
  type: SuggestionType;
  data: Record<string, unknown>;
  accepted: boolean;
}

export function useAISuggestion() {
  const { profile } = useAuth();

  const logSuggestion = useCallback(
    async ({ conversationId, type, data, accepted }: LogSuggestionParams) => {
      try {
        const { error } = await supabase.from("ai_suggestions_log").insert([
          {
            conversation_id: conversationId,
            suggestion_type: type,
            suggestion_data: JSON.parse(JSON.stringify(data)),
            accepted,
            accepted_by: accepted ? profile?.id ?? null : null,
          },
        ]);
        if (error) console.error("Failed to log suggestion:", error);
      } catch (err) {
        console.error("Error logging suggestion:", err);
      }
    },
    [profile?.id]
  );

  return { logSuggestion };
}
