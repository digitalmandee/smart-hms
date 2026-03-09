// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://smart-hms.lovable.app",
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/,
];

/**
 * Returns CORS headers with origin validation.
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
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}
