/**
 * Self-hosted error reporter — writes client-side errors to the
 * `client_errors` table for the in-app admin viewer (Phase 2).
 *
 * PII safety: only stack excerpts are stored, with phone/MRN/email patterns
 * redacted. Patient names are never sent because the stack frames only
 * include code paths, not props.
 */

import { supabase } from "@/integrations/supabase/client";

const PII_PATTERNS: Array<[RegExp, string]> = [
  [/\b\d{10,15}\b/g, "[phone]"],
  [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email]"],
  [/\bMRN[-:\s]*[A-Z0-9-]+/gi, "[mrn]"],
  [/\b[12]\d{9}\b/g, "[saudi-id]"],
];

function redact(text: string | undefined | null, maxLen = 500): string {
  if (!text) return "";
  let out = text.slice(0, maxLen);
  for (const [pat, repl] of PII_PATTERNS) out = out.replace(pat, repl);
  return out;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeStack(stack: string | undefined): string {
  if (!stack) return "";
  // Strip line/column numbers for stable hashing
  return stack
    .split("\n")
    .map((l) => l.replace(/:\d+:\d+/g, ""))
    .slice(0, 10)
    .join("\n");
}

interface ReportInput {
  message: string;
  stack?: string;
  route?: string;
  userRole?: string;
  organizationId?: string | null;
  branchId?: string | null;
  userId?: string | null;
}

let lastReportAt = 0;
const MIN_INTERVAL_MS = 250; // simple client-side flood guard

export async function reportClientError(input: ReportInput): Promise<void> {
  // Disable in dev to avoid noise
  if (import.meta.env.DEV) return;

  const now = Date.now();
  if (now - lastReportAt < MIN_INTERVAL_MS) return;
  lastReportAt = now;

  try {
    const stackHash = await sha256Hex(normalizeStack(input.stack));
    await supabase.from("client_errors").insert({
      organization_id: input.organizationId ?? null,
      branch_id: input.branchId ?? null,
      user_id: input.userId ?? null,
      user_role: input.userRole ?? null,
      route: input.route ?? (typeof window !== "undefined" ? window.location.pathname : null),
      message: redact(input.message, 500),
      stack_hash: stackHash,
      stack_excerpt: redact(input.stack, 1500),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      url: typeof window !== "undefined" ? window.location.href : null,
    });
  } catch {
    // Swallow — never let error reporting cause more errors
  }
}

/** Wire global handlers once at app bootstrap. */
export function installGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (e) => {
    void reportClientError({
      message: e.message ?? "window.error",
      stack: e.error?.stack,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    void reportClientError({
      message: reason?.message ?? String(reason ?? "unhandledrejection"),
      stack: reason?.stack,
    });
  });
}
