/**
 * KSA gateway reliability helper (Phase 3).
 *
 * - Timeouts via AbortController
 * - Exponential-backoff retries (idempotent calls only)
 * - Idempotency keys via `gateway_idempotency` table
 * - Circuit breaker via `gateway_circuit_state` table
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const FAILURE_THRESHOLD = 5;
const OPEN_DURATION_MS = 60_000; // 1 minute open before half-open

type Gateway = "nphies" | "zatca" | "wasfaty" | "tatmeen" | "nafath" | "sehhaty" | "hesn";

export interface GatewayCallOptions {
  gateway: Gateway;
  organizationId?: string | null;
  /** Stable hash of (org + endpoint + canonical body). When set, response is deduplicated. */
  idempotencyHash?: string;
  timeoutMs?: number;
  retries?: number; // for safe (GET/status) calls only
}

export class CircuitOpenError extends Error {
  constructor(public readonly gateway: string, public readonly retryAt: Date) {
    super(`Circuit open for ${gateway} until ${retryAt.toISOString()}`);
  }
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export async function checkCircuit(gateway: Gateway): Promise<void> {
  const sb = admin();
  const { data } = await sb
    .from("gateway_circuit_state")
    .select("state, next_retry_at")
    .eq("gateway", gateway)
    .maybeSingle();
  if (!data) return;
  if (data.state === "open" && data.next_retry_at && new Date(data.next_retry_at) > new Date()) {
    throw new CircuitOpenError(gateway, new Date(data.next_retry_at));
  }
}

async function recordSuccess(gateway: Gateway): Promise<void> {
  const sb = admin();
  await sb.from("gateway_circuit_state").upsert({
    gateway,
    state: "closed",
    consecutive_failures: 0,
    next_retry_at: null,
    opened_at: null,
    updated_at: new Date().toISOString(),
  });
}

async function recordFailure(gateway: Gateway): Promise<void> {
  const sb = admin();
  const { data } = await sb
    .from("gateway_circuit_state")
    .select("consecutive_failures")
    .eq("gateway", gateway)
    .maybeSingle();
  const next = (data?.consecutive_failures ?? 0) + 1;
  const shouldOpen = next >= FAILURE_THRESHOLD;
  await sb.from("gateway_circuit_state").upsert({
    gateway,
    state: shouldOpen ? "open" : "closed",
    consecutive_failures: next,
    last_failure_at: new Date().toISOString(),
    opened_at: shouldOpen ? new Date().toISOString() : null,
    next_retry_at: shouldOpen ? new Date(Date.now() + OPEN_DURATION_MS).toISOString() : null,
    updated_at: new Date().toISOString(),
  });
}

export async function lookupIdempotent(
  gateway: Gateway,
  hash: string,
): Promise<{ status: number; body: unknown } | null> {
  const sb = admin();
  const { data } = await sb
    .from("gateway_idempotency")
    .select("response_status, response_body, expires_at")
    .eq("gateway", gateway)
    .eq("request_hash", hash)
    .maybeSingle();
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return { status: data.response_status ?? 200, body: data.response_body };
}

export async function storeIdempotent(
  gateway: Gateway,
  hash: string,
  organizationId: string | null | undefined,
  status: number,
  body: unknown,
): Promise<void> {
  const sb = admin();
  await sb.from("gateway_idempotency").upsert({
    gateway,
    request_hash: hash,
    organization_id: organizationId ?? null,
    response_status: status,
    response_body: body as never,
  });
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 10_000,
): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
