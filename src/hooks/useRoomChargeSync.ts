import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SyncResult {
  chargesPosted: number;
  skipped: number;
  errors: number;
}

interface BackfillOptions {
  admissionId: string;
  admissionDate: string;
  bedType: string | null;
  bedNumber: string | null;
  wardChargePerDay?: number;
}

/**
 * Hook to sync/backfill room charges for a single admission
 * Posts charges for all missing days between admission date and today
 */
export function useBackfillRoomCharges() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: BackfillOptions): Promise<SyncResult> => {
      if (!profile?.organization_id) {
        throw new Error("No organization context");
      }

      const { admissionId, admissionDate, bedType, bedNumber, wardChargePerDay } = options;

      // Get bed type rate
      let dailyRate = wardChargePerDay || 0;
      let bedTypeName = "Standard";

      if (bedType) {
        const { data: bedTypeData } = await supabase
          .from("ipd_bed_types")
          .select("daily_rate, name")
          .eq("organization_id", profile.organization_id)
          .eq("code", bedType)
          .eq("is_active", true)
          .maybeSingle();

        if (bedTypeData?.daily_rate) {
          dailyRate = bedTypeData.daily_rate;
          bedTypeName = bedTypeData.name || bedType;
        }
      }

      if (dailyRate <= 0) {
        return { chargesPosted: 0, skipped: 0, errors: 0 };
      }

      // Get all existing room charges for this admission
      const { data: existingCharges } = await supabase
        .from("ipd_charges")
        .select("charge_date")
        .eq("admission_id", admissionId)
        .eq("charge_type", "room");

      const existingDates = new Set(
        (existingCharges || []).map((c) => c.charge_date)
      );

      // Calculate all dates from admission to today using consistent date strings
      const startDateStr = admissionDate.split('T')[0]; // Extract YYYY-MM-DD
      const todayStr = new Date().toISOString().split("T")[0]; // Today as YYYY-MM-DD

      const chargesToInsert: {
        admission_id: string;
        charge_date: string;
        charge_type: string;
        description: string;
        quantity: number;
        unit_price: number;
        total_amount: number;
        is_billed: boolean;
        added_by: string | null;
      }[] = [];

      let skipped = 0;
      
      // Parse dates for iteration but use string comparison
      const currentDate = new Date(startDateStr + 'T00:00:00Z');
      const endDate = new Date(todayStr + 'T00:00:00Z');

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];

        if (existingDates.has(dateStr)) {
          skipped++;
        } else {
          chargesToInsert.push({
            admission_id: admissionId,
            charge_date: dateStr,
            charge_type: "room",
            description: `Daily Room Charge - ${bedTypeName}${bedNumber ? ` (Bed ${bedNumber})` : ""}`,
            quantity: 1,
            unit_price: dailyRate,
            total_amount: dailyRate,
            is_billed: false,
            added_by: profile.id || null,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (chargesToInsert.length === 0) {
        return { chargesPosted: 0, skipped, errors: 0 };
      }

      // Insert all missing charges
      const { error } = await supabase
        .from("ipd_charges")
        .insert(chargesToInsert);

      if (error) {
        console.error("Failed to insert room charges:", error);
        throw error;
      }

      return {
        chargesPosted: chargesToInsert.length,
        skipped,
        errors: 0,
      };
    },
    onSuccess: (result, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["ipd-charges", variables.admissionId] });
      queryClient.invalidateQueries({ queryKey: ["admission-financials", variables.admissionId] });
      queryClient.invalidateQueries({ queryKey: ["admission-unbilled-charges", variables.admissionId] });

      if (result.chargesPosted > 0) {
        toast.success(`Posted ${result.chargesPosted} room charge(s)`);
      }
    },
    onError: (error) => {
      console.error("Room charge sync error:", error);
      toast.error("Failed to sync room charges");
    },
  });
}

/**
 * Hook to post today's room charges for all admitted patients via edge function
 */
export function usePostTodayRoomCharges() {
  const [isPosting, setIsPosting] = useState(false);
  const queryClient = useQueryClient();

  const postCharges = async () => {
    setIsPosting(true);
    try {
      const { data, error } = await supabase.functions.invoke("post-daily-room-charges");

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Failed to post room charges");
        return null;
      }

      // Invalidate all IPD-related queries
      queryClient.invalidateQueries({ queryKey: ["ipd-charges"] });
      queryClient.invalidateQueries({ queryKey: ["admission-financials"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-billing-stats"] });

      const result = data as {
        chargesPosted: number;
        skipped: number;
        errors: number;
      };

      if (result.chargesPosted > 0) {
        toast.success(`Posted ${result.chargesPosted} room charge(s) today`);
      } else if (result.skipped > 0) {
        toast.info("All room charges already posted for today");
      }

      return result;
    } catch (err) {
      console.error("Failed to post room charges:", err);
      toast.error("Failed to post room charges");
      return null;
    } finally {
      setIsPosting(false);
    }
  };

  return { postCharges, isPosting };
}
