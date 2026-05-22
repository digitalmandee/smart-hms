---
name: security-hipaa
description: Security hardening and HIPAA compliance patterns — edge function allowlists, RLS via security-definer, PHI masking, storage bucket policies, DOMPurify for user HTML, kiosk/QR SECURITY DEFINER grants that are intentional, and secrets handling. Auto-loads for any auth, RLS, edge function, PHI display, file upload, or security-scan work.
---

# Security & HIPAA

## 1. Secrets — never in the database, never in the browser

- Frontend uses `VITE_SUPABASE_PUBLISHABLE_KEY` (anon). **Never ship `SUPABASE_SERVICE_ROLE_KEY` to the browser** or pass it as a caller token.
- Edge functions read elevated keys via `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")`.
- API keys, third-party tokens: add via `secrets--add_secret`. Never store in tables. If a user insists, push back and require explicit acknowledgement.

## 2. RLS on PHI tables — use security-definer helpers

Patient data RLS goes through `SECURITY DEFINER` helper functions (e.g. `current_user_branch_ids()`, `user_has_role()`) to avoid recursive policy evaluation and `auth.users` access. Pattern:

```sql
CREATE POLICY "branch staff read patients"
ON public.patients FOR SELECT
USING (branch_id = ANY (public.current_user_branch_ids()));
```

Never put role checks directly on a profiles/users table — see the user-roles instruction (separate `user_roles` table + `has_role()` SECURITY DEFINER).

## 3. Intentional DEFINER grants (do NOT flag)

These anon-callable SECURITY DEFINER functions are intentional after the Phase-1.1 audit:
- Kiosk check-in functions (QR code lookups for token kiosks).
- Public QR landing endpoints (patient self-service).
- Authenticated utility helpers (date formatting, branch resolution).

The linter will flag them; ignore those specific findings. New DEFINER functions need an allowlist entry — see `mem://security/intentional-definer-grants` before adding.

## 4. Edge function allowlist

Edge functions that accept unauthenticated calls (Wasfaty webhook, ZATCA callback, kiosk endpoints) must validate against an explicit allowlist of origins/IPs/HMAC. Default to **deny**.

Always:
- Include CORS headers in **every** response (including errors).
- Validate request body with Zod and return 400 on failure.
- Verify JWT in code for authenticated functions (`verify_jwt = false` is the deployment default).

## 5. PHI masking in list views

Lists of patients/labs/invoices mask:
- National ID / Iqama → last 4 digits visible.
- Phone → last 3 digits visible.
- DOB → year only.

Full PHI is shown only on the detail view, gated by row-level access. Don't render unmasked PHI in tables or exports without checking.

## 6. Storage buckets — RLS required

All buckets (patient documents, lab attachments, radiology images) have RLS. Path convention: `{branch_id}/{patient_id}/{filename}`. Policies check `auth.uid()` membership against the branch.

Never make a PHI bucket public.

## 7. User HTML → DOMPurify

Any string that could contain user-provided HTML (rich-text notes, prescription instructions, lab comments) must be sanitized:

```ts
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

Never render raw user HTML.

## 8. Session timeouts & kiosk security

- Idle timeout enforced via session middleware (HIPAA).
- Kiosk endpoints use SECURITY DEFINER with explicit allowlists; tokens are short-lived and single-use.

## 9. Audit & immutability

- Posted journals/vouchers are immutable — corrections are reversing entries.
- Patient record edits are tracked in audit tables; don't bypass with raw SQL.

## See also

- `supabase-patterns` — secrets handling, edge function patterns
- `ksa-compliance` — Nafath identity verification
- `mem://security/hardening-policy`, `mem://security/hipaa-compliance-status`, `mem://security/intentional-definer-grants`
