
## What’s actually happening (root cause)
The browser is blocking the request to `POST /functions/v1/ai-assistant` due to **CORS**.

Evidence from your logs:
- Request Origin is `https://0eeac695-...lovableproject.com`
- Your shared CORS allowlist (`supabase/functions/_shared/cors.ts`) only allows:
  - `https://smart-hms.lovable.app`
  - `https://*.lovable.app`
- Because `*.lovableproject.com` is **not** allowed, `getCorsHeaders()` returns:
  - `Access-Control-Allow-Origin: https://smart-hms.lovable.app`
  which does **not** match the request Origin, causing the browser to raise `TypeError: Load failed`.

So even though we improved DeepSeek timeout/error handling, the client still can’t read *any* response (success or error) until CORS is fixed.

## Plan (implementation)
### 1) Fix the shared CORS allowlist to include preview origins
**File:** `supabase/functions/_shared/cors.ts`

- Add allow patterns for Lovable preview origins that use `lovableproject.com`, e.g.:
  - `^https:\/\/.*\.lovableproject\.com$`
- Keep the existing `lovable.app` patterns (published + id-preview).

### 2) Add missing CORS response headers needed for preflight reliability
Still in `supabase/functions/_shared/cors.ts`:
- Add:
  - `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
  - `Access-Control-Max-Age: 86400`

(Preflight requests commonly expect `Allow-Methods`; missing it can also manifest as “Load failed” in some browsers.)

### 3) Ensure OPTIONS responses return a body (optional but robust)
**File:** `supabase/functions/ai-assistant/index.ts`

Current code returns `new Response(null, { headers: corsHeaders })` for OPTIONS.
- Adjust to return something like `new Response("ok", { headers: corsHeaders })` (or keep null if you prefer; the key fix is origin/methods).

### 4) Validate end-to-end in the preview
After the CORS fix:
- Retest on `/tabeebi/chat`
- Confirm the Network request shows an HTTP status (200/4xx/5xx) instead of “Load failed”
- Confirm streaming works (response `Content-Type: text/event-stream`) and the chat UI receives tokens.

## Files that will be changed
- `supabase/functions/_shared/cors.ts` (main fix)
- (Optional hardening) `supabase/functions/ai-assistant/index.ts` (OPTIONS response body)

## Expected outcome
- The edge function becomes callable from both:
  - Preview (`*.lovableproject.com`)
  - Published (`smart-hms.lovable.app` and `*.lovable.app`)
- The client stops throwing `TypeError: Load failed`
- If DeepSeek is down/slow, you’ll now see the *actual* JSON error response (502/504) instead of a silent browser-level failure.
