import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const db = supabase as any;

export type CampStatus = "planned" | "ongoing" | "closed" | "received";

export interface BloodCamp {
  id: string; camp_number: string | null; name: string; location: string | null; address: string | null;
  camp_date: string; start_time: string | null; end_time: string | null;
  organiser: string | null; contact_person: string | null; contact_phone: string | null; in_charge: string | null;
  target_bags: number | null; bags_sent: number | null; kits_notes: string | null;
  status: CampStatus; closing_notes: string | null; closed_at: string | null; received_at: string | null;
  created_at: string;
}

export function useBloodCamps() {
  return useQuery({
    queryKey: ["blood-camps"],
    queryFn: async () => {
      const { data, error } = await db.from("blood_camps").select("*").order("camp_date", { ascending: false });
      if (error) throw error;
      return (data || []) as BloodCamp[];
    },
  });
}

export function useBloodCamp(id?: string) {
  return useQuery({
    queryKey: ["blood-camp", id],
    enabled: !!id,
    queryFn: async () => {
      const [camp, staff, transport, donations, units] = await Promise.all([
        db.from("blood_camps").select("*").eq("id", id).maybeSingle(),
        db.from("blood_camp_staff").select("*").eq("camp_id", id).order("created_at"),
        db.from("blood_camp_transport").select("*").eq("camp_id", id).order("created_at"),
        db.from("blood_donations").select("*, donor:blood_donors(id, first_name, last_name, donor_number, blood_group, phone)").eq("camp_id", id).order("created_at"),
        db.from("blood_inventory").select("id, status, component_type, discard_reason").eq("camp_id", id),
      ]);
      for (const r of [camp, staff, transport, donations, units]) if (r.error) throw r.error;
      return {
        camp: camp.data as BloodCamp | null,
        staff: staff.data || [], transport: transport.data || [],
        donations: donations.data || [], units: units.data || [],
      };
    },
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => { qc.invalidateQueries({ queryKey: ["blood-camps"] }); qc.invalidateQueries({ queryKey: ["blood-camp"] }); qc.invalidateQueries({ queryKey: ["blood-donations"] }); };
}

export function useSaveCamp() {
  const inv = useInvalidate();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...v }: Partial<BloodCamp> & { id?: string }) => {
      const q = id
        ? db.from("blood_camps").update(v).eq("id", id).select()
        : db.from("blood_camps").insert({ ...v, organization_id: profile?.organization_id, branch_id: profile?.branch_id || null }).select();
      const { data, error } = await q;
      if (error) throw error;
      return data?.[0] as BloodCamp;
    },
    onSuccess: inv,
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCampRow(table: "blood_camp_staff" | "blood_camp_transport") {
  const inv = useInvalidate();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (v: any) => {
      const { error } = v._delete
        ? await db.from(table).delete().eq("id", v._delete)
        : await db.from(table).insert({ ...v, organization_id: profile?.organization_id }).select();
      if (error) throw error;
    },
    onSuccess: inv,
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReceiveCampBags() {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async (a: { campId: string; accepted: string[]; rejected: { id: string; reason: string }[] }) => {
      const { data, error } = await db.rpc("receive_camp_bags", { _camp_id: a.campId, _accepted: a.accepted, _rejected: a.rejected });
      if (error) throw error;
      return data as { accepted: number; rejected: number; pending: number };
    },
    onSuccess: inv,
    onError: (e: Error) => toast.error(e.message),
  });
}
