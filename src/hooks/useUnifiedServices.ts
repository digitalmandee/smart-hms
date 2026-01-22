import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

export type ServiceCategory = Database["public"]["Enums"]["service_category"];

export interface UnifiedService {
  id: string;
  name: string;
  category: ServiceCategory | null; // Legacy ENUM (for display compatibility)
  category_id: string | null; // New FK to service_categories
  category_info?: {
    id: string;
    code: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  default_price: number | null;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  price_updated_at: string | null;
  // Linked data
  linked_imaging_procedure?: {
    id: string;
    modality_type: string;
    body_part: string | null;
    code: string | null;
    preparation: string | null;
    estimated_duration_minutes: number | null;
  } | null;
  linked_bed_type?: {
    id: string;
    code: string | null;
    description: string | null;
    sort_order: number;
  } | null;
  linked_lab_template?: {
    id: string;
    test_category: string | null;
    fields: any;
  } | null;
}

export interface ServicePriceHistory {
  id: string;
  service_type_id: string;
  old_price: number | null;
  new_price: number;
  changed_by: string | null;
  changed_at: string;
  reason: string | null;
}

// Fetch all services with linked data
export function useUnifiedServices(category?: ServiceCategory | "all") {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["unified-services", profile?.organization_id, category],
    queryFn: async () => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Fetch base service types with joined category
      let query = supabase
        .from("service_types")
        .select(`
          *,
          category_info:service_categories(id, code, name, icon, color)
        `)
        .eq("organization_id", profile.organization_id)
        .order("name");

      if (category && category !== "all") {
        // Filter by category code using joined table
        query = query.eq("service_categories.code", category);
      }

      const { data: services, error } = await query;
      if (error) throw error;
      
      // Filter out services that don't match category if filtering
      const filteredServices = category && category !== "all"
        ? services?.filter(s => (s.category_info as any)?.code === category || s.category === category)
        : services;

      // Fetch linked imaging procedures
      const { data: imagingProcedures } = await supabase
        .from("imaging_procedures")
        .select("id, service_type_id, modality_type, body_part, code, preparation, estimated_duration_minutes")
        .eq("organization_id", profile.organization_id)
        .not("service_type_id", "is", null);

      // Fetch linked bed types
      const { data: bedTypes } = await supabase
        .from("ipd_bed_types")
        .select("id, service_type_id, code, description, sort_order")
        .eq("organization_id", profile.organization_id)
        .not("service_type_id", "is", null);

      // Fetch linked lab templates
      const { data: labTemplates } = await supabase
        .from("lab_test_templates")
        .select("id, service_type_id, test_category, fields")
        .eq("organization_id", profile.organization_id)
        .not("service_type_id", "is", null);

      // Map linked data to services
      const imagingMap = new Map(imagingProcedures?.map(ip => [ip.service_type_id, ip]) || []);
      const bedMap = new Map(bedTypes?.map(bt => [bt.service_type_id, bt]) || []);
      const labMap = new Map(labTemplates?.map(lt => [lt.service_type_id, lt]) || []);

      return (filteredServices || []).map(service => ({
        ...service,
        category_info: service.category_info as UnifiedService['category_info'],
        linked_imaging_procedure: imagingMap.get(service.id) || null,
        linked_bed_type: bedMap.get(service.id) || null,
        linked_lab_template: labMap.get(service.id) || null,
      })) as UnifiedService[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Create a new service
export function useCreateUnifiedService() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (values: {
      name: string;
      category_id: string; // Now uses UUID
      default_price?: number;
      is_active?: boolean;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase
        .from("service_types")
        .insert({
          name: values.name,
          category_id: values.category_id,
          default_price: values.default_price ?? 0,
          is_active: values.is_active ?? true,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-services"] });
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["all-service-types"] });
      toast.success("Service created");
    },
    onError: (error) => {
      toast.error("Failed to create service: " + error.message);
    },
  });
}

// Update service (including price with history tracking)
export function useUpdateUnifiedService() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (values: {
      id: string;
      name?: string;
      category_id?: string; // Now uses UUID
      default_price?: number;
      is_active?: boolean;
      price_change_reason?: string;
    }) => {
      const { id, price_change_reason, ...updateData } = values;

      // Get current price if we're updating price
      if (updateData.default_price !== undefined) {
        const { data: current } = await supabase
          .from("service_types")
          .select("default_price")
          .eq("id", id)
          .single();

        // Record price history if price changed
        if (current && current.default_price !== updateData.default_price) {
          await supabase.from("service_price_history").insert({
            service_type_id: id,
            old_price: current.default_price,
            new_price: updateData.default_price,
            changed_by: profile?.id,
            reason: price_change_reason || null,
          });

          // Also update the price_updated_at timestamp
          (updateData as any).price_updated_at = new Date().toISOString();
          (updateData as any).price_updated_by = profile?.id;
        }
      }

      const { data, error } = await supabase
        .from("service_types")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["unified-services"] });
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["all-service-types"] });
      queryClient.invalidateQueries({ queryKey: ["service-type", variables.id] });
      toast.success("Service updated");
    },
    onError: (error) => {
      toast.error("Failed to update service: " + error.message);
    },
  });
}

// Toggle service active status
export function useToggleUnifiedServiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await supabase
        .from("service_types")
        .select("is_active")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("service_types")
        .update({ is_active: !current?.is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-services"] });
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["all-service-types"] });
    },
    onError: (error) => {
      toast.error("Failed to toggle status: " + error.message);
    },
  });
}

// Fetch price history for a service
export function useServicePriceHistory(serviceId: string | undefined) {
  return useQuery({
    queryKey: ["service-price-history", serviceId],
    queryFn: async () => {
      if (!serviceId) return [];

      const { data, error } = await supabase
        .from("service_price_history")
        .select(`
          *,
          changed_by_profile:profiles!service_price_history_changed_by_fkey(full_name)
        `)
        .eq("service_type_id", serviceId)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return data as (ServicePriceHistory & { changed_by_profile: { full_name: string } | null })[];
    },
    enabled: !!serviceId,
  });
}

// Get service category statistics
export function useServiceCategoryStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["service-category-stats", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase
        .from("service_types")
        .select("category, is_active")
        .eq("organization_id", profile.organization_id);

      if (error) throw error;

      const stats: Record<string, { total: number; active: number }> = {
        all: { total: 0, active: 0 },
        consultation: { total: 0, active: 0 },
        procedure: { total: 0, active: 0 },
        lab: { total: 0, active: 0 },
        radiology: { total: 0, active: 0 },
        pharmacy: { total: 0, active: 0 },
        room: { total: 0, active: 0 },
        other: { total: 0, active: 0 },
      };

      data?.forEach(service => {
        const cat = service.category || "other";
        stats.all.total++;
        stats[cat].total++;
        if (service.is_active) {
          stats.all.active++;
          stats[cat].active++;
        }
      });

      return stats;
    },
    enabled: !!profile?.organization_id,
  });
}
