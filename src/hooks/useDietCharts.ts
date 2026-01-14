import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const DIET_TYPES = [
  "normal",
  "soft",
  "liquid",
  "clear_liquid",
  "npo",
  "diabetic",
  "renal",
  "cardiac",
  "low_sodium",
  "high_protein",
  "low_fat",
  "bland",
  "pureed",
  "tube_feeding",
  "custom",
] as const;

export const useDietCharts = (admissionId?: string) => {
  return useQuery({
    queryKey: ["diet-charts", admissionId],
    queryFn: async () => {
      if (!admissionId) return [];

      const { data, error } = await supabase
        .from("diet_charts")
        .select(`
          *,
          prescribed_by_profile:profiles!diet_charts_prescribed_by_fkey(id, full_name)
        `)
        .eq("admission_id", admissionId)
        .order("effective_from", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
};

export const useCreateDietChart = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (dietData: {
      admission_id: string;
      diet_type: string;
      custom_diet?: string;
      restrictions?: string;
      allergies?: string;
      preferences?: string;
      calories_target?: number;
      protein_target?: number;
      carbs_target?: number;
      fat_target?: number;
      fluid_restriction_ml?: number;
      special_instructions?: string;
      effective_from?: string;
      effective_to?: string;
      meal_timings?: Record<string, string>;
    }) => {
      if (!profile?.id) throw new Error("No profile");

      // Map diet_type to valid database enum values
      const validDietTypes = [
        "normal", "soft", "liquid", "clear_liquid", "npo", "diabetic",
        "renal", "cardiac", "low_salt", "high_protein", "low_fat",
        "parenteral", "tube_feeding"
      ];
      const mappedDietType = validDietTypes.includes(dietData.diet_type) 
        ? dietData.diet_type 
        : "normal";

      const { data, error } = await supabase
        .from("diet_charts")
        .insert({
          admission_id: dietData.admission_id,
          diet_type: mappedDietType as any,
          custom_diet: dietData.custom_diet,
          restrictions: dietData.restrictions,
          allergies: dietData.allergies,
          preferences: dietData.preferences,
          calories_target: dietData.calories_target,
          protein_target: dietData.protein_target,
          carbs_target: dietData.carbs_target,
          fat_target: dietData.fat_target,
          fluid_restriction_ml: dietData.fluid_restriction_ml,
          special_instructions: dietData.special_instructions,
          effective_from: dietData.effective_from,
          effective_to: dietData.effective_to,
          prescribed_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-charts"] });
      toast({ title: "Diet chart created" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create diet chart", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateDietChart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dietData }: { id: string } & Partial<{
      diet_type: string;
      custom_diet: string;
      restrictions: string;
      allergies: string;
      preferences: string;
      calories_target: number;
      protein_target: number;
      carbs_target: number;
      fat_target: number;
      fluid_restriction_ml: number;
      special_instructions: string;
      effective_to: string;
    }>) => {
      const updateData: Record<string, unknown> = { ...dietData };
      if (dietData.diet_type) {
        updateData.diet_type = dietData.diet_type as any;
      }
      
      const { data, error } = await supabase
        .from("diet_charts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-charts"] });
      toast({ title: "Diet chart updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update diet chart", description: error.message, variant: "destructive" });
    },
  });
};
