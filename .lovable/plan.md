
# Security Hardening Plan — ✅ COMPLETED

## Summary of Fixes Applied

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Patient data readable by `anon` role via published lab orders | HIGH | ✅ Fixed — anon policy dropped, security-definer function created |
| 2 | Lab order items readable by `anon` role via published flag | HIGH | ⚠️ Acceptable — `is_published` is staff-controlled opt-in |
| 3 | `kiosk_sessions` UPDATE policy uses `USING (true)` | MEDIUM | ✅ Fixed — scoped to org members |
| 4 | `kiosk_token_logs` INSERT policy uses `WITH CHECK (true)` | MEDIUM | ✅ Fixed — scoped to org members |
| 5 | `notification_logs` INSERT policy uses `WITH CHECK (true)` | LOW | ✅ Fixed — scoped to org members |
| 6 | `update_item_vendor_mapping_timestamp` function has mutable search_path | LOW | ✅ Fixed — SET search_path = 'public' |
| 7 | Leaked password protection disabled | MEDIUM | 🔧 Manual — enable in Supabase Dashboard |
| 8 | CORS wildcard `*` on all edge functions | MEDIUM | ✅ Fixed — domain allowlist via shared cors.ts |
| 9 | AI assistant uses `service_role` client for RAG | MEDIUM | ℹ️ Acceptable — medical_knowledge is shared, not org-specific |
| 10 | AI assistant has no input length limit | LOW | ✅ Fixed — 5000 char limit added |
| 11 | Demo password hardcoded as fallback | LOW | ℹ️ Low risk — requires service_role access |
| 12 | `available_modules` table publicly readable | INFO | ℹ️ Intentional for landing page |

## Manual Steps Required

1. **Enable Leaked Password Protection**: Go to Supabase Dashboard > Authentication > Settings > Enable "Leaked password protection"
