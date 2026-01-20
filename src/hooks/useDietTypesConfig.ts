import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Default diet types (fallback when database is empty)
export const DEFAULT_DIET_TYPES = [
  { code: "normal", name: "Normal / Regular", description: "Standard balanced diet with no restrictions", icon: "Utensils", color: "bg-green-100 text-green-800" },
  { code: "soft", name: "Soft Diet", description: "Easy to chew and digest foods", icon: "Leaf", color: "bg-blue-100 text-blue-800" },
  { code: "liquid", name: "Full Liquid", description: "All liquids including milk, juices, and soups", icon: "Droplet", color: "bg-cyan-100 text-cyan-800" },
  { code: "clear_liquid", name: "Clear Liquid", description: "Clear fluids only - water, broth, clear juices", icon: "Droplet", color: "bg-sky-100 text-sky-800" },
  { code: "npo", name: "NPO (Nothing By Mouth)", description: "No oral intake - pre-surgery or specific conditions", icon: "Ban", color: "bg-red-100 text-red-800" },
  { code: "diabetic", name: "Diabetic Diet", description: "Controlled carbohydrate and sugar intake", icon: "AlertTriangle", color: "bg-orange-100 text-orange-800" },
  { code: "renal", name: "Renal Diet", description: "Low sodium, potassium, and phosphorus for kidney patients", icon: "FlaskConical", color: "bg-pink-100 text-pink-800" },
  { code: "cardiac", name: "Cardiac Diet", description: "Heart-healthy, low cholesterol and sodium", icon: "Heart", color: "bg-rose-100 text-rose-800" },
  { code: "low_sodium", name: "Low Sodium", description: "Restricted salt intake for hypertension", icon: "Sparkles", color: "bg-purple-100 text-purple-800" },
  { code: "high_protein", name: "High Protein", description: "Increased protein for healing and recovery", icon: "Beef", color: "bg-amber-100 text-amber-800" },
  { code: "low_fat", name: "Low Fat", description: "Reduced fat content for digestive health", icon: "Salad", color: "bg-lime-100 text-lime-800" },
  { code: "bland", name: "Bland Diet", description: "Non-irritating foods for GI conditions", icon: "Apple", color: "bg-stone-100 text-stone-800" },
  { code: "pureed", name: "Pureed", description: "Blended foods for swallowing difficulties", icon: "Pill", color: "bg-violet-100 text-violet-800" },
  { code: "tube_feeding", name: "Tube Feeding", description: "Enteral nutrition via feeding tube", icon: "Syringe", color: "bg-indigo-100 text-indigo-800" },
  { code: "custom", name: "Custom Diet", description: "Customized diet based on specific patient needs", icon: "Settings2", color: "bg-gray-100 text-gray-800" },
];

export interface DietTypeConfig {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
}

export const useDietTypesConfig = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-diet-types", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return DEFAULT_DIET_TYPES.map((dt, i) => ({ ...dt, id: `default-${i}`, sort_order: i, is_active: true }));
      }
      
      const { data, error } = await supabase
        .from("config_diet_types")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_DIET_TYPES.map((dt, i) => ({ ...dt, id: `default-${i}`, sort_order: i, is_active: true }));
      }
      return data as DietTypeConfig[];
    },
    enabled: true,
  });
};

// For backward compatibility - returns just the codes
export const useDietTypeCodes = () => {
  const { data: dietTypes } = useDietTypesConfig();
  return dietTypes?.map(dt => dt.code) || DEFAULT_DIET_TYPES.map(dt => dt.code);
};
