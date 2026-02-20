import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export interface Shipment {
  id: string;
  organization_id: string;
  store_id: string;
  shipment_number: string;
  packing_slip_id: string | null;
  transfer_id: string | null;
  destination_type: string;
  destination_id: string | null;
  destination_address: Record<string, unknown> | null;
  carrier_name: string | null;
  tracking_number: string | null;
  shipping_method: string;
  status: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  total_weight: number | null;
  total_boxes: number | null;
  shipping_cost: number | null;
  dispatched_by: string | null;
  dispatched_at: string | null;
  received_by_name: string | null;
  received_at: string | null;
  proof_of_delivery: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  event_type: string;
  event_description: string | null;
  location: string | null;
  event_time: string;
  created_by: string | null;
  created_at: string;
}

export function useShipments(storeId?: string, status?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["shipments", storeId, status],
    queryFn: async () => {
      let query = queryTable("shipments")
        .select("*")
        .eq("organization_id", profile!.organization_id)
        .order("created_at", { ascending: false });
      if (storeId && storeId !== "all") query = query.eq("store_id", storeId);
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data as Shipment[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useShipment(id?: string) {
  return useQuery({
    queryKey: ["shipment", id],
    queryFn: async () => {
      const { data, error } = await queryTable("shipments").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Shipment;
    },
    enabled: !!id,
  });
}

export function useTrackingEvents(shipmentId?: string) {
  return useQuery({
    queryKey: ["tracking-events", shipmentId],
    queryFn: async () => {
      const { data, error } = await queryTable("shipment_tracking_events")
        .select("*")
        .eq("shipment_id", shipmentId!)
        .order("event_time", { ascending: false });
      if (error) throw error;
      return data as TrackingEvent[];
    },
    enabled: !!shipmentId,
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (data: Partial<Shipment>) => {
      const { data: shipment, error } = await queryTable("shipments")
        .insert({ ...data, organization_id: profile!.organization_id })
        .select().single();
      if (error) throw error;
      return shipment;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shipments"] }); toast.success("Shipment created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Shipment>) => {
      const { data: shipment, error } = await queryTable("shipments").update(data).eq("id", id).select().single();
      if (error) throw error;
      return shipment;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shipments"] }); qc.invalidateQueries({ queryKey: ["shipment"] }); toast.success("Shipment updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAddTrackingEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { shipment_id: string; event_type: string; event_description?: string; location?: string; event_time?: string }) => {
      const { data: event, error } = await queryTable("shipment_tracking_events")
        .insert({ ...data, event_time: data.event_time || new Date().toISOString() })
        .select().single();
      if (error) throw error;
      return event;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tracking-events"] }); toast.success("Tracking event added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
