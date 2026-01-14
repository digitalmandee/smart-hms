import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type BedStatus = Database["public"]["Enums"]["bed_status"];

export const BED_STATUSES: BedStatus[] = [
  "available",
  "occupied",
  "reserved",
  "maintenance",
  "housekeeping",
];

export const BED_FEATURES = [
  "oxygen_supply",
  "suction",
  "cardiac_monitor",
  "ventilator_ready",
  "isolation_capable",
  "adjustable",
  "bariatric",
  "pediatric",
  "pressure_mattress",
  "side_rails",
] as const;

// Get single bed
export const useBed = (bedId: string | undefined) => {
  return useQuery({
    queryKey: ["bed", bedId],
    queryFn: async () => {
      if (!bedId) return null;

      const { data, error } = await supabase
        .from("beds")
        .select(`
          *,
          ward:wards(id, name, code, ward_type, organization_id),
          current_admission:admissions(
            id,
            admission_number,
            admission_date,
            patient:patients(id, first_name, last_name, patient_number, date_of_birth, gender)
          )
        `)
        .eq("id", bedId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bedId,
  });
};

// Delete bed
export const useDeleteBed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bedId: string) => {
      const { error } = await supabase
        .from("beds")
        .delete()
        .eq("id", bedId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast({ title: "Bed deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete bed", description: error.message, variant: "destructive" });
    },
  });
};

// Bulk create beds
export const useBulkCreateBeds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bedsData: Array<{
      ward_id: string;
      bed_number: string;
      bed_type?: string;
      position_row?: number;
      position_col?: number;
      notes?: string;
    }>) => {
      const { data, error } = await supabase
        .from("beds")
        .insert(bedsData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast({ title: `${data.length} beds created successfully` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create beds", description: error.message, variant: "destructive" });
    },
  });
};

// Update bed status (for housekeeping/maintenance workflows)
export const useUpdateBedStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bedId, 
      status, 
      notes 
    }: { 
      bedId: string; 
      status: BedStatus; 
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("beds")
        .update({ 
          status, 
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bedId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["bed", variables.bedId] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-stats"] });
      toast({ title: "Bed status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update bed status", description: error.message, variant: "destructive" });
    },
  });
};

// Reserve bed
export const useReserveBed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bedId, 
      notes 
    }: { 
      bedId: string; 
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("beds")
        .update({ 
          status: "reserved" as BedStatus, 
          notes: notes || "Reserved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bedId)
        .eq("status", "available")
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-stats"] });
      toast({ title: "Bed reserved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reserve bed", description: error.message, variant: "destructive" });
    },
  });
};

// Release reservation
export const useReleaseBed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bedId: string) => {
      const { data, error } = await supabase
        .from("beds")
        .update({ 
          status: "available" as BedStatus, 
          notes: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bedId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-stats"] });
      toast({ title: "Bed released" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to release bed", description: error.message, variant: "destructive" });
    },
  });
};

// Get bed transfer history
export const useBedTransfers = (admissionId?: string) => {
  return useQuery({
    queryKey: ["bed-transfers", admissionId],
    queryFn: async () => {
      if (!admissionId) return [];

      const { data, error } = await supabase
        .from("bed_transfers")
        .select(`
          *,
          from_bed:beds!bed_transfers_from_bed_id_fkey(id, bed_number),
          to_bed:beds!bed_transfers_to_bed_id_fkey(id, bed_number),
          from_ward:wards!bed_transfers_from_ward_id_fkey(id, name, code),
          to_ward:wards!bed_transfers_to_ward_id_fkey(id, name, code),
          ordered_by_profile:profiles!bed_transfers_ordered_by_fkey(full_name),
          transferred_by_profile:profiles!bed_transfers_transferred_by_fkey(full_name)
        `)
        .eq("admission_id", admissionId)
        .order("transferred_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
};

// Get beds needing housekeeping
export const useHousekeepingQueue = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["housekeeping-queue", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("beds")
        .select(`
          *,
          ward:wards!inner(id, name, code, organization_id)
        `)
        .eq("ward.organization_id", profile.organization_id)
        .eq("status", "housekeeping")
        .order("updated_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

// Get beds under maintenance
export const useMaintenanceQueue = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["maintenance-queue", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("beds")
        .select(`
          *,
          ward:wards!inner(id, name, code, organization_id)
        `)
        .eq("ward.organization_id", profile.organization_id)
        .eq("status", "maintenance")
        .order("updated_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};
