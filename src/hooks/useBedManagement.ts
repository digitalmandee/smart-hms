import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ipdLogger } from "@/lib/logger";
import { formatErrorForLogging, getErrorMessage, categorizeError } from "@/lib/supabase-errors";
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
      if (!bedId) {
        ipdLogger.debug("useBed: No bedId provided, returning null");
        return null;
      }

      ipdLogger.debug("Fetching single bed", { bedId });

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
        .maybeSingle();

      if (error) {
        const errorContext = formatErrorForLogging(error, { bedId, hook: "useBed" });
        ipdLogger.error("useBed: Query failed", error, errorContext);
        throw new Error(`Failed to fetch bed: ${getErrorMessage(error)}`);
      }

      if (!data) {
        ipdLogger.warn("useBed: Bed not found", { bedId });
        return null;
      }

      ipdLogger.debug("Bed fetched", { bedId, bedNumber: data.bed_number });
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
      ipdLogger.debug("Deleting bed", { bedId });

      const { error } = await supabase
        .from("beds")
        .delete()
        .eq("id", bedId);

      if (error) {
        const errorContext = formatErrorForLogging(error, { bedId, hook: "useDeleteBed" });
        ipdLogger.error("useDeleteBed: Delete failed", error, errorContext);
        throw new Error(`Failed to delete bed: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Bed deleted successfully", { bedId });
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
      ipdLogger.debug("Bulk creating beds", { count: bedsData.length, wardId: bedsData[0]?.ward_id });

      const { data, error } = await supabase
        .from("beds")
        .insert(bedsData)
        .select();

      if (error) {
        const errorContext = formatErrorForLogging(error, { 
          count: bedsData.length, 
          wardId: bedsData[0]?.ward_id,
          hook: "useBulkCreateBeds",
        });
        ipdLogger.error("useBulkCreateBeds: Bulk insert failed", error, errorContext);
        throw new Error(`Failed to create beds: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Beds created successfully", { count: data.length });
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
      ipdLogger.debug("Updating bed status", { bedId, status, notes });

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

      if (error) {
        const errorContext = formatErrorForLogging(error, { bedId, status, hook: "useUpdateBedStatus" });
        ipdLogger.error("useUpdateBedStatus: Update failed", error, errorContext);
        throw new Error(`Failed to update bed status: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Bed status updated", { bedId, newStatus: status });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["bed", variables.bedId] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-stats"] });
      queryClient.invalidateQueries({ queryKey: ["housekeeping-queue"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-queue"] });
      ipdLogger.debug("Bed status cache invalidated", { bedId: variables.bedId });
      toast({ title: "Bed status updated" });
    },
    onError: (error: Error, variables) => {
      ipdLogger.error("Bed status update failed", error, { 
        bedId: variables.bedId, 
        attemptedStatus: variables.status,
      });
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
      ipdLogger.debug("Reserving bed", { bedId, notes });

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

      if (error) {
        const errorContext = formatErrorForLogging(error, { bedId, hook: "useReserveBed" });
        
        // Check if it's a "no rows returned" error (bed not available)
        if (categorizeError(error.code) === 'not_found') {
          ipdLogger.warn("useReserveBed: Bed not available for reservation", { bedId });
          throw new Error("Bed is not available for reservation - it may already be occupied or reserved");
        }
        
        ipdLogger.error("useReserveBed: Reserve failed", error, errorContext);
        throw new Error(`Failed to reserve bed: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Bed reserved successfully", { bedId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-stats"] });
      toast({ title: "Bed reserved successfully" });
    },
    onError: (error: Error, variables) => {
      ipdLogger.error("Bed reservation failed", error, { bedId: variables.bedId });
      toast({ title: "Failed to reserve bed", description: error.message, variant: "destructive" });
    },
  });
};

// Release reservation
export const useReleaseBed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bedId: string) => {
      ipdLogger.debug("Releasing bed", { bedId });

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

      if (error) {
        const errorContext = formatErrorForLogging(error, { bedId, hook: "useReleaseBed" });
        ipdLogger.error("useReleaseBed: Release failed", error, errorContext);
        throw new Error(`Failed to release bed: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Bed released successfully", { bedId });
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
      if (!admissionId) {
        ipdLogger.debug("useBedTransfers: No admissionId provided");
        return [];
      }

      ipdLogger.debug("Fetching bed transfers", { admissionId });

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

      if (error) {
        const errorContext = formatErrorForLogging(error, { admissionId, hook: "useBedTransfers" });
        ipdLogger.error("useBedTransfers: Query failed", error, errorContext);
        throw new Error(`Failed to fetch bed transfers: ${getErrorMessage(error)}`);
      }

      ipdLogger.debug("Bed transfers fetched", { admissionId, count: data?.length ?? 0 });
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
      if (!profile?.organization_id) {
        ipdLogger.warn("useHousekeepingQueue: No organization_id");
        return [];
      }

      ipdLogger.debug("Fetching housekeeping queue", { 
        organizationId: profile.organization_id 
      });

      const { data, error } = await supabase
        .from("beds")
        .select(`
          *,
          ward:wards!inner(id, name, code, organization_id)
        `)
        .eq("ward.organization_id", profile.organization_id)
        .eq("status", "housekeeping")
        .order("updated_at", { ascending: true });

      if (error) {
        const errorContext = formatErrorForLogging(error, {
          organizationId: profile.organization_id,
          hook: "useHousekeepingQueue",
        });
        
        if (categorizeError(error.code) === 'relationship') {
          ipdLogger.error("useHousekeepingQueue: Relationship query failed - check beds->wards FK", error, errorContext);
        } else {
          ipdLogger.error("useHousekeepingQueue: Query failed", error, errorContext);
        }
        
        throw new Error(`Failed to fetch housekeeping queue: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Housekeeping queue fetched", { count: data?.length ?? 0 });
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
      if (!profile?.organization_id) {
        ipdLogger.warn("useMaintenanceQueue: No organization_id");
        return [];
      }

      ipdLogger.debug("Fetching maintenance queue", { 
        organizationId: profile.organization_id 
      });

      const { data, error } = await supabase
        .from("beds")
        .select(`
          *,
          ward:wards!inner(id, name, code, organization_id)
        `)
        .eq("ward.organization_id", profile.organization_id)
        .eq("status", "maintenance")
        .order("updated_at", { ascending: true });

      if (error) {
        const errorContext = formatErrorForLogging(error, {
          organizationId: profile.organization_id,
          hook: "useMaintenanceQueue",
        });
        
        if (categorizeError(error.code) === 'relationship') {
          ipdLogger.error("useMaintenanceQueue: Relationship query failed - check beds->wards FK", error, errorContext);
        } else {
          ipdLogger.error("useMaintenanceQueue: Query failed", error, errorContext);
        }
        
        throw new Error(`Failed to fetch maintenance queue: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Maintenance queue fetched", { count: data?.length ?? 0 });
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};
