import { offlineDB, getDeviceId } from "./db";
import type { OfflineEntityType, OfflineOperation, OutboxItem } from "./types";

export interface EnqueueParams {
  user_id: string;
  organization_id: string;
  entity_type: OfflineEntityType;
  operation: OfflineOperation;
  payload: Record<string, unknown>;
  /** Optional pre-existing client_uuid to update an already-queued item. */
  client_uuid?: string;
}

/**
 * Add a write to the offline outbox. Returns the client_uuid which the caller
 * should also write into the entity payload (so the server can dedupe on it).
 */
export async function enqueue(params: EnqueueParams): Promise<string> {
  const client_uuid = params.client_uuid ?? crypto.randomUUID();
  const item: OutboxItem = {
    client_uuid,
    device_id: getDeviceId(),
    user_id: params.user_id,
    organization_id: params.organization_id,
    entity_type: params.entity_type,
    operation: params.operation,
    payload: { ...params.payload, client_uuid },
    client_created_at: new Date().toISOString(),
    status: "pending",
    retries: 0,
    next_attempt_at: Date.now(),
  };
  await offlineDB.outbox.put(item);
  return client_uuid;
}

export async function getPending(limit = 25): Promise<OutboxItem[]> {
  const now = Date.now();
  return offlineDB.outbox
    .where("status")
    .equals("pending")
    .filter((it) => it.next_attempt_at <= now)
    .limit(limit)
    .toArray();
}

export async function markProcessing(uuids: string[]) {
  await offlineDB.outbox.where("client_uuid").anyOf(uuids).modify({ status: "processing" });
}

export async function markApplied(client_uuid: string, server_id?: string) {
  await offlineDB.outbox.update(client_uuid, {
    status: "applied",
    applied_record_id: server_id,
  });
}

export async function markConflict(client_uuid: string, error?: string) {
  await offlineDB.outbox.update(client_uuid, { status: "conflict", last_error: error });
}

export async function markFailed(client_uuid: string, error: string) {
  await offlineDB.outbox.update(client_uuid, { status: "failed", last_error: error });
}

const BACKOFF_MS = [5_000, 30_000, 120_000, 600_000];

export async function markRetry(client_uuid: string, error: string) {
  const item = await offlineDB.outbox.get(client_uuid);
  if (!item) return;
  const retries = item.retries + 1;
  const delay = BACKOFF_MS[Math.min(retries - 1, BACKOFF_MS.length - 1)];
  await offlineDB.outbox.update(client_uuid, {
    status: "pending",
    retries,
    last_error: error,
    next_attempt_at: Date.now() + delay,
  });
}

export async function counts() {
  const all = await offlineDB.outbox.toArray();
  return {
    pending: all.filter((i) => i.status === "pending" || i.status === "processing").length,
    failed: all.filter((i) => i.status === "failed").length,
    conflicts: all.filter((i) => i.status === "conflict").length,
    applied: all.filter((i) => i.status === "applied").length,
  };
}

export async function purgeApplied(olderThanMs = 7 * 24 * 60 * 60 * 1000) {
  const cutoff = new Date(Date.now() - olderThanMs).toISOString();
  await offlineDB.outbox
    .where("status")
    .equals("applied")
    .filter((i) => i.client_created_at < cutoff)
    .delete();
}

/** Used on logout — clears outbox for a specific user. */
export async function clearForUser(user_id: string) {
  await offlineDB.outbox.where("user_id").equals(user_id).delete();
}
