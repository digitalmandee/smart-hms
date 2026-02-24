// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://smart-hms.lovable.app",
  // Preview URLs follow this pattern
  /^https:\/\/.*\.lovable\.app$/,
];

/**
 * Returns CORS headers with origin validation.
 * If the request origin matches the allowlist, it's reflected back.
 * Otherwise, defaults to the published app URL.
 */
export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers?.get("origin") || "";

  const isAllowed = ALLOWED_ORIGINS.some((allowed) => {
    if (typeof allowed === "string") return allowed === origin;
    return allowed.test(origin);
  });

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://smart-hms.lovable.app",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-cron-secret, x-analyzer-id, x-api-key, x-session-token",
  };
}
