import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClientErrorRow {
  id: string;
  organization_id: string | null;
  branch_id: string | null;
  user_id: string | null;
  user_role: string | null;
  route: string | null;
  message: string;
  stack_hash: string | null;
  stack_excerpt: string | null;
  user_agent: string | null;
  url: string | null;
  occurred_at: string;
  resolved_at: string | null;
}

export interface EdgeErrorRow {
  id: string;
  function_name: string;
  integration: string | null;
  organization_id: string | null;
  status_code: number | null;
  message: string;
  stack_excerpt: string | null;
  request_path: string | null;
  request_method: string | null;
  context: unknown;
  occurred_at: string;
}

export interface CircuitStateRow {
  gateway: string;
  state: "closed" | "open" | "half_open";
  consecutive_failures: number;
  last_failure_at: string | null;
  opened_at: string | null;
  next_retry_at: string | null;
}

const SINCE_HOURS = 24;

export function useRecentClientErrors() {
  return useQuery({
    queryKey: ["admin", "client-errors", SINCE_HOURS],
    queryFn: async (): Promise<ClientErrorRow[]> => {
      const since = new Date(Date.now() - SINCE_HOURS * 3600_000).toISOString();
      const { data, error } = await supabase
        .from("client_errors")
        .select("*")
        .gte("occurred_at", since)
        .order("occurred_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as ClientErrorRow[];
    },
  });
}

export function useRecentEdgeErrors() {
  return useQuery({
    queryKey: ["admin", "edge-errors", SINCE_HOURS],
    queryFn: async (): Promise<EdgeErrorRow[]> => {
      const since = new Date(Date.now() - SINCE_HOURS * 3600_000).toISOString();
      const { data, error } = await supabase
        .from("edge_errors")
        .select("*")
        .gte("occurred_at", since)
        .order("occurred_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as EdgeErrorRow[];
    },
  });
}

export function useGatewayCircuitStates() {
  return useQuery({
    queryKey: ["admin", "gateway-circuit"],
    queryFn: async (): Promise<CircuitStateRow[]> => {
      const { data, error } = await supabase
        .from("gateway_circuit_state")
        .select("*")
        .order("gateway");
      if (error) throw error;
      return (data ?? []) as CircuitStateRow[];
    },
    refetchInterval: 30_000,
  });
}
