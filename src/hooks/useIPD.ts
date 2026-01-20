import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ipdLogger } from "@/lib/logger";
import { formatErrorForLogging, getErrorMessage, categorizeError } from "@/lib/supabase-errors";

export const BED_TYPES = [
  "General",
  "Semi-Private",
  "Private",
  "ICU",
  "NICU",
  "PICU",
  "CCU",
  "Isolation",
  "Maternity",
  "Pediatric",
  "Emergency",
] as const;

// Ward types matching database enum exactly
export const WARD_TYPES = [
  "General",
  "Semi-Private",
  "Private",
  "Deluxe",
  "VIP",
  "ICU",
  "NICU",
  "PICU",
  "CCU",
  "Isolation",
  "Emergency",
  "Maternity",
  "Pediatric",
  "Surgical",
] as const;

// Wards
export const useWards = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["wards", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        ipdLogger.warn("useWards: No organization_id in profile", {
          userId: profile?.id,
          email: profile?.email,
        });
        return [];
      }

      ipdLogger.debug("Fetching wards", { 
        organizationId: profile.organization_id 
      });

      const { data, error } = await supabase
        .from("wards")
        .select(`
          *,
          branch:branches!wards_branch_id_fkey(id, name),
          nurse_in_charge:employees!wards_nurse_in_charge_id_fkey(id, first_name, last_name),
          beds(id, bed_number, status)
        `)
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("name");

      if (error) {
        const errorContext = formatErrorForLogging(error, {
          organizationId: profile.organization_id,
          hook: "useWards",
        });
        
        const category = categorizeError(error.code);
        
        if (category === 'relationship') {
          ipdLogger.error("useWards: Relationship query failed - check foreign key constraints", error, errorContext);
        } else if (category === 'permission') {
          ipdLogger.error("useWards: RLS policy denied access", error, errorContext);
        } else if (category === 'not_found') {
          ipdLogger.error("useWards: Table or column not found", error, errorContext);
        } else {
          ipdLogger.error("useWards: Query failed", error, errorContext);
        }
        
        throw new Error(`Failed to fetch wards: ${getErrorMessage(error)} (Code: ${error.code || 'unknown'})`);
      }
      
      ipdLogger.info("Wards fetched successfully", { 
        count: data?.length ?? 0,
        organizationId: profile.organization_id,
      });
      
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useWard = (wardId: string | undefined) => {
  return useQuery({
    queryKey: ["ward", wardId],
    queryFn: async () => {
      if (!wardId) {
        ipdLogger.debug("useWard: No wardId provided, returning null");
        return null;
      }

      ipdLogger.debug("Fetching single ward", { wardId });

      const { data, error } = await supabase
        .from("wards")
        .select(`
          *,
          branch:branches!wards_branch_id_fkey(id, name),
          nurse_in_charge:employees!wards_nurse_in_charge_id_fkey(id, first_name, last_name),
          beds(*)
        `)
        .eq("id", wardId)
        .maybeSingle();

      if (error) {
        const errorContext = formatErrorForLogging(error, { wardId, hook: "useWard" });
        ipdLogger.error("useWard: Failed to fetch ward", error, errorContext);
        throw new Error(`Failed to fetch ward: ${getErrorMessage(error)}`);
      }

      if (!data) {
        ipdLogger.warn("useWard: Ward not found", { wardId });
        return null;
      }

      ipdLogger.debug("Ward fetched", { wardId, wardName: data.name });
      return data;
    },
    enabled: !!wardId,
  });
};

export const useCreateWard = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (wardData: {
      name: string;
      code: string;
      ward_type: string;
      branch_id: string;
      building?: string;
      floor?: string;
      room_section?: string;
      total_beds?: number;
      description?: string;
      nurse_in_charge_id?: string;
      visiting_hours?: string;
      facilities?: string[];
      contact_extension?: string;
    }) => {
      if (!profile?.organization_id) {
        ipdLogger.error("useCreateWard: No organization_id", new Error("No organization"));
        throw new Error("No organization");
      }

      ipdLogger.debug("Creating ward", { 
        name: wardData.name, 
        code: wardData.code,
        organizationId: profile.organization_id,
      });

      const { data, error } = await supabase
        .from("wards")
        .insert({
          name: wardData.name,
          code: wardData.code,
          ward_type: wardData.ward_type as "general" | "private" | "semi_private" | "icu" | "nicu" | "picu" | "ccu" | "emergency" | "maternity" | "pediatric" | "surgical" | "isolation" | "deluxe" | "vip",
          branch_id: wardData.branch_id,
          organization_id: profile.organization_id,
          building: wardData.building,
          floor: wardData.floor,
          room_section: wardData.room_section,
          total_beds: wardData.total_beds,
          nurse_in_charge_id: wardData.nurse_in_charge_id,
          visiting_hours: wardData.visiting_hours,
          contact_extension: wardData.contact_extension,
        })
        .select()
        .single();

      if (error) {
        const errorContext = formatErrorForLogging(error, { wardData, hook: "useCreateWard" });
        ipdLogger.error("useCreateWard: Insert failed", error, errorContext);
        throw new Error(`Failed to create ward: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Ward created successfully", { wardId: data.id, name: data.name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast({ title: "Ward created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create ward", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateWard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...wardData }: { id: string } & Partial<{
      name: string;
      code: string;
      ward_type: string;
      building: string;
      floor: string;
      room_section: string;
      total_beds: number;
      description: string;
      nurse_in_charge_id: string;
      visiting_hours: string;
      facilities: string[];
      contact_extension: string;
      is_active: boolean;
    }>) => {
      ipdLogger.debug("Updating ward", { wardId: id, updates: Object.keys(wardData) });

      const updateData: Record<string, unknown> = {};
      if (wardData.name) updateData.name = wardData.name;
      if (wardData.code) updateData.code = wardData.code;
      if (wardData.ward_type) updateData.ward_type = wardData.ward_type as "general" | "icu";
      if (wardData.building !== undefined) updateData.building = wardData.building;
      if (wardData.floor !== undefined) updateData.floor = wardData.floor;
      if (wardData.room_section !== undefined) updateData.room_section = wardData.room_section;
      if (wardData.total_beds) updateData.total_beds = wardData.total_beds;
      if (wardData.description) updateData.description = wardData.description;
      if (wardData.nurse_in_charge_id) updateData.nurse_in_charge_id = wardData.nurse_in_charge_id;
      if (wardData.visiting_hours) updateData.visiting_hours = wardData.visiting_hours;
      if (wardData.contact_extension) updateData.contact_extension = wardData.contact_extension;
      if (typeof wardData.is_active === "boolean") updateData.is_active = wardData.is_active;

      const { data, error } = await supabase
        .from("wards")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        const errorContext = formatErrorForLogging(error, { wardId: id, updateData, hook: "useUpdateWard" });
        ipdLogger.error("useUpdateWard: Update failed", error, errorContext);
        throw new Error(`Failed to update ward: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Ward updated successfully", { wardId: id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ward"] });
      toast({ title: "Ward updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update ward", description: error.message, variant: "destructive" });
    },
  });
};

// Beds
export const useBeds = (wardId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["beds", profile?.organization_id, wardId],
    queryFn: async () => {
      if (!profile?.organization_id) {
        ipdLogger.warn("useBeds: No organization_id in profile");
        return [];
      }

      ipdLogger.debug("Fetching beds", { 
        organizationId: profile.organization_id,
        wardId: wardId || "all",
      });

      let query = supabase
        .from("beds")
        .select(`
          *,
          ward:wards!beds_ward_id_fkey!inner(id, name, code, ward_type, organization_id),
          current_admission:admissions!beds_current_admission_id_fkey(
            id,
            admission_number,
            patient:patients!admissions_patient_id_fkey(id, first_name, last_name, patient_number)
          )
        `)
        .eq("ward.organization_id", profile.organization_id)
        .order("bed_number");

      if (wardId) {
        query = query.eq("ward_id", wardId);
      }

      const { data, error } = await query;

      if (error) {
        const errorContext = formatErrorForLogging(error, {
          organizationId: profile.organization_id,
          wardId,
          hook: "useBeds",
        });
        
        const category = categorizeError(error.code);
        
        if (category === 'relationship') {
          ipdLogger.error("useBeds: Relationship query failed - check FK constraints on beds/wards/admissions", error, errorContext);
        } else if (category === 'permission') {
          ipdLogger.error("useBeds: RLS policy denied access", error, errorContext);
        } else {
          ipdLogger.error("useBeds: Query failed", error, errorContext);
        }
        
        throw new Error(`Failed to fetch beds: ${getErrorMessage(error)} (Code: ${error.code || 'unknown'})`);
      }

      ipdLogger.info("Beds fetched successfully", { 
        count: data?.length ?? 0,
        wardId: wardId || "all",
      });
      
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateBed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bedData: {
      ward_id: string;
      bed_number: string;
      bed_type?: string;
      position_row?: number;
      position_col?: number;
      features?: Record<string, unknown>;
      notes?: string;
    }) => {
      ipdLogger.debug("Creating bed", { 
        wardId: bedData.ward_id, 
        bedNumber: bedData.bed_number,
      });

      const { data, error } = await supabase
        .from("beds")
        .insert({
          ward_id: bedData.ward_id,
          bed_number: bedData.bed_number,
          bed_type: bedData.bed_type,
          position_row: bedData.position_row,
          position_col: bedData.position_col,
          notes: bedData.notes,
        })
        .select()
        .single();

      if (error) {
        const errorContext = formatErrorForLogging(error, { bedData, hook: "useCreateBed" });
        ipdLogger.error("useCreateBed: Insert failed", error, errorContext);
        throw new Error(`Failed to create bed: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Bed created successfully", { bedId: data.id, bedNumber: data.bed_number });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast({ title: "Bed created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create bed", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateBed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...bedData }: { id: string } & Partial<{
      bed_number: string;
      bed_type: string;
      status: string;
      position_row: number;
      position_col: number;
      features: Record<string, unknown>;
      notes: string;
      is_active: boolean;
    }>) => {
      ipdLogger.debug("Updating bed", { bedId: id, updates: Object.keys(bedData) });

      const updateData: Record<string, unknown> = {};
      if (bedData.bed_number) updateData.bed_number = bedData.bed_number;
      if (bedData.bed_type) updateData.bed_type = bedData.bed_type;
      if (bedData.status) updateData.status = bedData.status as "available" | "occupied";
      if (bedData.position_row) updateData.position_row = bedData.position_row;
      if (bedData.position_col) updateData.position_col = bedData.position_col;
      if (bedData.notes) updateData.notes = bedData.notes;
      if (typeof bedData.is_active === "boolean") updateData.is_active = bedData.is_active;

      const { data, error } = await supabase
        .from("beds")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        const errorContext = formatErrorForLogging(error, { bedId: id, updateData, hook: "useUpdateBed" });
        ipdLogger.error("useUpdateBed: Update failed", error, errorContext);
        throw new Error(`Failed to update bed: ${getErrorMessage(error)}`);
      }

      ipdLogger.info("Bed updated successfully", { bedId: id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast({ title: "Bed updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update bed", description: error.message, variant: "destructive" });
    },
  });
};

// IPD Stats
export const useIPDStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ipd-stats", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        ipdLogger.debug("useIPDStats: No organization_id, returning defaults");
        return { totalWards: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, activeAdmissions: 0, todayAdmissions: 0, todayDischarges: 0 };
      }

      ipdLogger.debug("Fetching IPD stats", { organizationId: profile.organization_id });

      const today = new Date().toISOString().split("T")[0];

      try {
        const [wardsRes, bedsRes, admissionsRes, todayAdmRes, todayDisRes] = await Promise.all([
          supabase
            .from("wards")
            .select("id", { count: "exact" })
            .eq("organization_id", profile.organization_id)
            .eq("is_active", true),
          supabase
            .from("beds")
            .select("id, status, ward:wards!beds_ward_id_fkey!inner(organization_id)")
            .eq("ward.organization_id", profile.organization_id)
            .eq("is_active", true),
          supabase
            .from("admissions")
            .select("id", { count: "exact" })
            .eq("organization_id", profile.organization_id)
            .eq("status", "admitted"),
          supabase
            .from("admissions")
            .select("id", { count: "exact" })
            .eq("organization_id", profile.organization_id)
            .eq("admission_date", today),
          supabase
            .from("admissions")
            .select("id", { count: "exact" })
            .eq("organization_id", profile.organization_id)
            .eq("actual_discharge_date", today),
        ]);

        // Check for errors in any query
        if (wardsRes.error) {
          ipdLogger.warn("useIPDStats: Wards query failed", { error: wardsRes.error });
        }
        if (bedsRes.error) {
          ipdLogger.warn("useIPDStats: Beds query failed", { error: bedsRes.error });
        }

        const beds = bedsRes.data || [];
        const occupiedBeds = beds.filter((b) => b.status === "occupied").length;
        const availableBeds = beds.filter((b) => b.status === "available").length;

        const stats = {
          totalWards: wardsRes.count || 0,
          totalBeds: beds.length,
          occupiedBeds,
          availableBeds,
          activeAdmissions: admissionsRes.count || 0,
          todayAdmissions: todayAdmRes.count || 0,
          todayDischarges: todayDisRes.count || 0,
        };

        ipdLogger.info("IPD stats fetched", stats);
        return stats;
      } catch (error) {
        ipdLogger.error("useIPDStats: Failed to fetch stats", error as Error);
        throw error;
      }
    },
    enabled: !!profile?.organization_id,
  });
};
