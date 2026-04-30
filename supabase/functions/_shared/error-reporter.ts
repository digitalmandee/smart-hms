/**
 * Edge-side error reporter — writes failures to the `edge_errors` table
 * using the service role key. Used by all edge functions (Phase 2).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const PII_PATTERNS: Array<[RegExp, string]> = [
  [/\b\d{10,15}\b/g, "[phone]"],
  [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email]"],
  [/\bMRN[-:\s]*[A-Z0-9-]+/gi, "[mrn]"],
];

function redact(s: string | undefined | null, max = 1500): string {
  if (!s) return "";
  let out = s.slice(0, max);
  for (const [p, r] of PII_PATTERNS) out = out.replace(p, r);
  return out;
}

interface EdgeErrorInput {
  functionName: string;
  integration?: string;
  organizationId?: string | null;
  branchId?: string | null;
  userId?: string | null;
  statusCode?: number;
  message: string;
  stack?: string;
  requestPath?: string;
  requestMethod?: string;
  context?: Record<string, unknown>;
}

export async function reportEdgeError(input: EdgeErrorInput): Promise<void> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    const sb = createClient(url, key);
    await sb.from("edge_errors").insert({
      function_name: input.functionName,
      integration: input.integration ?? null,
      organization_id: input.organizationId ?? null,
      branch_id: input.branchId ?? null,
      user_id: input.userId ?? null,
      status_code: input.statusCode ?? null,
      message: redact(input.message, 500),
      stack_excerpt: redact(input.stack, 1500),
      request_path: input.requestPath ?? null,
      request_method: input.requestMethod ?? null,
      context: input.context ?? null,
    });
  } catch {
    // Never let reporter errors propagate
  }
}
