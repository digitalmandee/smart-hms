export type OfflineEntityType =
  | "mobile_visits"
  | "home_visits"
  | "immunizations"
  | "payment_gateway_transactions";

export type OfflineOperation = "insert" | "update";

export type OutboxStatus = "pending" | "processing" | "applied" | "conflict" | "failed";

export interface OutboxItem {
  client_uuid: string;
  device_id: string;
  user_id: string;
  organization_id: string;
  entity_type: OfflineEntityType;
  operation: OfflineOperation;
  payload: Record<string, unknown>;
  client_created_at: string; // ISO
  status: OutboxStatus;
  retries: number;
  next_attempt_at: number; // epoch ms
  last_error?: string;
  applied_record_id?: string;
}

export interface SyncResult {
  client_uuid: string;
  status: "applied" | "conflict" | "failed";
  server_id?: string;
  error?: string;
}
