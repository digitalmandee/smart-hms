

# Security Hardening Plan

## Summary of Issues Found

| # | Issue | Severity | Category |
|---|-------|----------|----------|
| 1 | Patient data readable by `anon` role via published lab orders | HIGH | RLS |
| 2 | Lab order items readable by `anon` role via published flag | HIGH | RLS |
| 3 | `kiosk_sessions` UPDATE policy uses `USING (true)` | MEDIUM | RLS |
| 4 | `kiosk_token_logs` INSERT policy uses `WITH CHECK (true)` | MEDIUM | RLS |
| 5 | `notification_logs` INSERT policy uses `WITH CHECK (true)` | LOW | RLS |
| 6 | `update_item_vendor_mapping_timestamp` function has mutable search_path | LOW | DB Function |
| 7 | Leaked password protection disabled | MEDIUM | Auth |
| 8 | CORS wildcard `*` on all edge functions | MEDIUM | API |
| 9 | AI assistant uses `service_role` client for RAG -- no org scoping | MEDIUM | AI |
| 10 | AI assistant has no input length limit | LOW | AI |
| 11 | Demo password hardcoded as fallback in edge function | LOW | Config |
| 12 | `available_modules` table publicly readable | INFO | RLS |

---

## Phase 1: Database Fixes (SQL Migration)

### 1a. Tighten `patients` table anon access
The current policy `anon_view_patients_for_published_lab_orders` lets anonymous users see full patient records (name, CNIC, phone, email) when a lab order is published. This should be restricted to only return the patient's name (needed for the lab result page).

**Fix:** Replace the anon SELECT policy on `patients` to only expose `id` and `first_name`/`last_name` via a security definer view, OR remove the anon policy entirely and have the published lab result page use a dedicated edge function instead.

Recommended approach: Drop the anon policy on `patients` and create a security-definer function that returns only `id, first_name, last_name` for patients with published lab orders.

### 1b. Restrict anon access on `lab_order_items`
The `anon_view_published_lab_order_items` policy gives anonymous users access to all lab order item data when `is_published = true`. This is needed for patient lab result viewing but should be scoped.

**Fix:** Keep the policy but ensure the published lab results page uses a rate-limited edge function instead of direct anon access. For now, this is acceptable since `is_published` is an explicit opt-in by staff.

### 1c. Fix permissive RLS policies
- `kiosk_sessions` UPDATE `USING (true)` -- replace with `session_token = current_setting('request.headers')::json->>'x-session-token'` or scope to organization
- `kiosk_token_logs` INSERT `WITH CHECK (true)` -- replace with org-scoped check
- `notification_logs` INSERT `WITH CHECK (true)` -- replace with org-scoped check

### 1d. Fix mutable search_path
Add `SET search_path = 'public'` to `update_item_vendor_mapping_timestamp` function.

### 1e. Enable leaked password protection
This is a Supabase dashboard setting, not code. Will instruct user.

---

## Phase 2: Edge Function Hardening

### 2a. CORS restriction
Replace `Access-Control-Allow-Origin: '*'` with the actual app domain in all 15 edge functions:
```
'Access-Control-Allow-Origin': 'https://smart-hms.lovable.app'
```

However, since the preview URL also needs access during development, we'll use a helper that checks against an allowlist.

### 2b. AI Assistant -- scope RAG context to user's organization
Currently the `supabaseService` (service_role) client queries `medical_knowledge` without organization scoping. Since `medical_knowledge` is general medical content (not org-specific), this is actually acceptable. No change needed here -- it's a shared knowledge base, not patient data.

### 2c. AI Assistant -- add input length validation
Add a check that the user message doesn't exceed 5000 characters to prevent abuse.

### 2d. Demo password
The `setup-demo-users` function uses `Deno.env.get("DEMO_USER_PASSWORD") || "Demo@123"`. Since this function is only used for initial setup and requires service_role, this is low risk. Will add a note but no code change needed.

---

## Phase 3: Frontend Hardening

No `service_role` keys found in frontend code -- this is good. The anon key in the frontend is expected and safe.

---

## Files Modified

| File | Action |
|------|--------|
| SQL Migration | Fix RLS policies on `kiosk_sessions`, `kiosk_token_logs`, `notification_logs`; fix `update_item_vendor_mapping_timestamp` search_path; create secure view for anon patient access |
| `supabase/functions/ai-assistant/index.ts` | Add input length validation |
| All 15 edge function `index.ts` files | Replace CORS `*` with domain allowlist |

---

## Manual Steps (User Action Required)

1. **Enable Leaked Password Protection**: Go to Supabase Dashboard > Authentication > Settings > Enable "Leaked password protection"
2. **Verify** the `patients` anon policy change doesn't break the public lab results page

---

## What This Does NOT Change (Safe As-Is)

- `verify_jwt = false` in config.toml -- all functions validate auth in code, which is the recommended approach
- `available_modules` public read -- this is intentional for the landing page
- Demo user setup functions -- only callable with service_role, not exposed to end users
- `is_super_admin()` and `get_user_organization_id()` -- already `SECURITY DEFINER` with `search_path = public`
- All 278 tables have RLS enabled

