import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Triggers server-side auto-posting of all recurring journal templates whose
 * next_run_date is today or earlier. Posts each as a balanced journal entry
 * and advances next_run_date based on frequency.
 */
export function useAutoPostRecurring() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any).rpc("auto_post_due_recurring_templates", {
        _organization_id: profile!.organization_id!,
      });
      if (error) throw error;
      return data as { status: string; posted_count: number; details: any[] };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["recurring-templates"] });
      qc.invalidateQueries({ queryKey: ["journal-entries"] });
      if (result.posted_count === 0) {
        toast.info("No recurring templates were due");
      } else {
        toast.success(`Auto-posted ${result.posted_count} recurring entr${result.posted_count === 1 ? "y" : "ies"}`);
      }
    },
    onError: (e: any) => toast.error(e.message),
  });
}
