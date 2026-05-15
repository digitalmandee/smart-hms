import { supabase } from "@/integrations/supabase/client";
import { getPending, markApplied, markConflict, markFailed, markProcessing, markRetry, purgeApplied } from "./outbox";
import type { SyncResult } from "./types";

let timer: ReturnType<typeof setInterval> | null = null;
let running = false;
let lastSyncedAt: number | null = null;
const listeners = new Set<() => void>();

const POLL_MS = 15_000;

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn();
}

export function getLastSyncedAt(): number | null {
  return lastSyncedAt;
}

export async function tick(): Promise<{ processed: number }> {
  if (running) return { processed: 0 };
  if (typeof navigator !== "undefined" && navigator.onLine === false) return { processed: 0 };

  running = true;
  try {
    const items = await getPending(25);
    if (items.length === 0) return { processed: 0 };

    await markProcessing(items.map((i) => i.client_uuid));

    const { data, error } = await supabase.functions.invoke("cow-sync", {
      body: {
        items: items.map((i) => ({
          client_uuid: i.client_uuid,
          device_id: i.device_id,
          organization_id: i.organization_id,
          entity_type: i.entity_type,
          operation: i.operation,
          payload: i.payload,
          client_created_at: i.client_created_at,
        })),
      },
    });

    if (error) {
      // network/transient — schedule a retry on every item
      for (const item of items) {
        await markRetry(item.client_uuid, error.message ?? "network_error");
      }
      return { processed: 0 };
    }

    const results: SyncResult[] = data?.results ?? [];
    for (const r of results) {
      if (r.status === "applied") {
        await markApplied(r.client_uuid, r.server_id);
      } else if (r.status === "conflict") {
        await markConflict(r.client_uuid, r.error);
      } else {
        await markFailed(r.client_uuid, r.error ?? "unknown_error");
      }
    }

    lastSyncedAt = Date.now();
    await purgeApplied();
    return { processed: results.length };
  } finally {
    running = false;
    notify();
  }
}

export function start() {
  if (timer) return;
  // Kick once immediately, then poll.
  void tick();
  timer = setInterval(() => void tick(), POLL_MS);
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => void tick());
  }
}

export function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

/** Manual trigger from the UI. */
export async function forceSync() {
  return tick();
}
