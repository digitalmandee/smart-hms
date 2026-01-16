import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Using any client to prevent deep type instantiation issues with complex queries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client: any = supabase;

interface QueuePatient {
  id: string;
  token_number: number | null;
  priority: number | null;
  status: string | null;
  patient: {
    first_name: string;
    last_name: string | null;
  } | null;
  doctor: {
    profile: {
      full_name: string;
    };
    specialization: string | null;
  } | null;
}

export function usePublicOPDQueue(organizationId: string | undefined) {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["public-opd-queue", organizationId, today],
    queryFn: async (): Promise<QueuePatient[]> => {
      if (!organizationId) return [];

      const { data, error } = await client
        .from("appointments")
        .select(`
          id,
          token_number,
          priority,
          status,
          patient:patients(first_name, last_name),
          doctor:doctors(specialization, profile:profiles(full_name))
        `)
        .eq("organization_id", organizationId)
        .eq("appointment_date", today)
        .in("status", ["checked_in", "in_progress"])
        .order("priority", { ascending: false })
        .order("token_number", { ascending: true });

      if (error) throw error;
      return (data || []) as QueuePatient[];
    },
    enabled: !!organizationId,
    refetchInterval: 5000,
  });
}

interface ERPatient {
  id: string;
  er_number: string;
  triage_level: string | null;
  status: string | null;
  assigned_zone: string | null;
  patient: {
    first_name: string;
    last_name: string | null;
  } | null;
  unknown_patient_details: { name?: string } | null;
}

export function usePublicERQueue(organizationId: string | undefined) {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["public-er-queue", organizationId, today],
    queryFn: async (): Promise<ERPatient[]> => {
      if (!organizationId) return [];

      const { data, error } = await client
        .from("emergency_registrations")
        .select(`
          id,
          er_number,
          triage_level,
          status,
          assigned_zone,
          unknown_patient_details,
          patient:patients(first_name, last_name)
        `)
        .eq("organization_id", organizationId)
        .gte("arrival_time", today)
        .in("status", ["waiting", "in_triage", "in_treatment"])
        .order("triage_level", { ascending: true })
        .order("arrival_time", { ascending: true });

      if (error) throw error;
      return (data || []) as ERPatient[];
    },
    enabled: !!organizationId,
    refetchInterval: 5000,
  });
}

interface AmbulanceAlert {
  id: string;
  eta_minutes: number | null;
  priority: number | null;
  condition_summary: string | null;
  status: string;
}

export function usePublicAmbulanceAlerts(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["public-ambulance-alerts", organizationId],
    queryFn: async (): Promise<AmbulanceAlert[]> => {
      if (!organizationId) return [];

      const { data, error } = await client
        .from("ambulance_alerts")
        .select("id, eta_minutes, priority, condition_summary, status")
        .eq("organization_id", organizationId)
        .eq("status", "incoming")
        .order("eta_minutes", { ascending: true });

      if (error) throw error;
      return (data || []) as AmbulanceAlert[];
    },
    enabled: !!organizationId,
    refetchInterval: 10000,
  });
}

interface PublicOrg {
  id: string;
  name: string;
  logo_url: string | null;
}

export function useOrganizationPublic(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["organization-public", organizationId],
    queryFn: async (): Promise<PublicOrg | null> => {
      if (!organizationId) return null;

      const { data, error } = await client
        .from("organizations")
        .select("id, name, logo_url")
        .eq("id", organizationId)
        .single();

      if (error) throw error;
      return data as PublicOrg;
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

interface PublicDoctor {
  id: string;
  specialization: string | null;
  profile: { full_name: string } | null;
}

export function usePublicDoctors(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["public-doctors", organizationId],
    queryFn: async (): Promise<PublicDoctor[]> => {
      if (!organizationId) return [];

      const { data, error } = await client
        .from("doctors")
        .select("id, specialization, profile:profiles(full_name)")
        .eq("organization_id", organizationId)
        .eq("is_active", true);

      if (error) throw error;
      return (data || []) as PublicDoctor[];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}
