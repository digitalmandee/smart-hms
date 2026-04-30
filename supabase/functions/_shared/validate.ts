/**
 * Lightweight input-validation helper for edge functions (Phase 1.3).
 * Uses Zod via npm: specifier (works in Deno/edge-runtime).
 */

import { z, ZodSchema } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "./cors.ts";

export { z };

export interface ValidOk<T> {
  ok: true;
  data: T;
}
export interface ValidErr {
  ok: false;
  response: Response;
}

export async function validateBody<T>(
  req: Request,
  schema: ZodSchema<T>,
): Promise<ValidOk<T> | ValidErr> {
  const cors = getCorsHeaders(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      }),
    };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}
