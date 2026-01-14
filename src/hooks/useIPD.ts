import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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

export const WARD_TYPES = [
  "General",
  "Private",
  "Semi-Private",
  "ICU",
  "NICU",
  "PICU",
  "CCU",
  "Emergency",
  "Maternity",
  "Pediatric",
  "Surgical",
  "Medical",
  "Orthopedic",
  "Cardiac",
  "Oncology",
  "Psychiatric",
] as const;

// Wards
export const useWards = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["wards", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("wards")
        .select(`
          *,
          branch:branches(id, name),
          nurse_in_charge:profiles(id, full_name),
          beds(id, bed_number, status)
        `)
        .eq("organization_id", profile.organization_id)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useWard = (wardId: string | undefined) => {
  return useQuery({
    queryKey: ["ward", wardId],
    queryFn: async () => {
      if (!wardId) return null;

      const { data, error } = await supabase
        .from("wards")
        .select(`
          *,
          branch:branches(id, name),
          nurse_in_charge:profiles(id, full_name),
          beds(*)
        `)
        .eq("id", wardId)
        .single();

      if (error) throw error;
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
      floor?: string;
      total_beds?: number;
      description?: string;
      nurse_in_charge_id?: string;
      visiting_hours?: string;
      facilities?: string[];
      contact_extension?: string;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase
        .from("wards")
        .insert({
          name: wardData.name,
          code: wardData.code,
          ward_type: wardData.ward_type as "general" | "private" | "semi_private" | "icu" | "nicu" | "picu" | "ccu" | "emergency" | "maternity" | "pediatric" | "surgical" | "isolation" | "deluxe" | "vip",
          branch_id: wardData.branch_id,
          floor: wardData.floor,
          total_beds: wardData.total_beds,
          description: wardData.description,
          nurse_in_charge_id: wardData.nurse_in_charge_id,
          visiting_hours: wardData.visiting_hours,
          contact_extension: wardData.contact_extension,
        })
        .select()
        .single();

      if (error) throw error;
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
      floor: string;
      total_beds: number;
      description: string;
      nurse_in_charge_id: string;
      visiting_hours: string;
      facilities: string[];
      contact_extension: string;
      is_active: boolean;
    }>) => {
      const updateData: Record<string, unknown> = {};
      if (wardData.name) updateData.name = wardData.name;
      if (wardData.code) updateData.code = wardData.code;
      if (wardData.ward_type) updateData.ward_type = wardData.ward_type as "general" | "icu";
      if (wardData.floor) updateData.floor = wardData.floor;
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

      if (error) throw error;
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
      if (!profile?.organization_id) return [];

      let query = supabase
        .from("beds")
        .select(`
          *,
          ward:wards(id, name, code, ward_type),
          current_admission:admissions(
            id,
            admission_number,
            patient:patients(id, first_name, last_name, patient_number)
          )
        `)
        .eq("ward.organization_id", profile.organization_id)
        .order("bed_number");

      if (wardId) {
        query = query.eq("ward_id", wardId);
      }

      const { data, error } = await query;

      if (error) throw error;
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

      if (error) throw error;
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

      if (error) throw error;
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
        return { totalWards: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, activeAdmissions: 0, todayAdmissions: 0, todayDischarges: 0 };
      }

      const today = new Date().toISOString().split("T")[0];

      const [wardsRes, bedsRes, admissionsRes, todayAdmRes, todayDisRes] = await Promise.all([
        supabase
          .from("wards")
          .select("id", { count: "exact" })
          .eq("organization_id", profile.organization_id)
          .eq("is_active", true),
        supabase
          .from("beds")
          .select("id, status, ward:wards!inner(organization_id)")
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

      const beds = bedsRes.data || [];
      const occupiedBeds = beds.filter((b) => b.status === "occupied").length;
      const availableBeds = beds.filter((b) => b.status === "available").length;

      return {
        totalWards: wardsRes.count || 0,
        totalBeds: beds.length,
        occupiedBeds,
        availableBeds,
        activeAdmissions: admissionsRes.count || 0,
        todayAdmissions: todayAdmRes.count || 0,
        todayDischarges: todayDisRes.count || 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
};
