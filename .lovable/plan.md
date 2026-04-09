

# HIPAA Phase 4 — MFA Enrollment, Data Retention, Realtime RLS

## Overview
Raises HIPAA readiness from ~85% to ~92%.

---

## 1. MFA TOTP Enrollment UI

Supabase provides `supabase.auth.mfa.enroll()`, `challenge()`, `verify()`, `unenroll()`, and `getAuthenticatorAssuranceLevel()` APIs. We build enrollment + verification UI.

### New Files
- **`src/components/mfa/EnrollMFADialog.tsx`** — Modal dialog with:
  - QR code display from `mfa.enroll({ factorType: 'totp' })`
  - Manual secret key copy option
  - 6-digit OTP input using existing `InputOTP` component
  - Verify button calling `mfa.challengeAndVerify()`
  - Success/error states
- **`src/components/mfa/MFAVerifyPage.tsx`** — Standalone page shown after login when user has MFA enrolled but session is at AAL1 (needs step-up). Calls `mfa.challenge()` + `mfa.verify()` to elevate to AAL2.
- **`src/hooks/useMFA.ts`** — Hook wrapping:
  - `getAuthenticatorAssuranceLevel()` — check current AAL level + enrolled factors
  - `enroll()`, `challengeAndVerify()`, `unenroll()` — lifecycle methods
  - `isEnrolled`, `currentLevel`, `nextLevel` computed state

### Edited Files
- **`src/pages/app/ProfilePage.tsx`** — Add "Two-Factor Authentication" section with Enable/Disable toggle that opens `EnrollMFADialog` or calls `unenroll()`
- **`src/contexts/AuthContext.tsx`** — After sign-in, check AAL level. If user has MFA enrolled but session is AAL1, redirect to `/app/mfa-verify`
- **`src/App.tsx`** — Add `/app/mfa-verify` route pointing to `MFAVerifyPage`

### Flow
```text
Profile Page → "Enable 2FA" → EnrollMFADialog
  → Shows QR code → User scans → Enters 6-digit code
  → challengeAndVerify() → Success → Factor active

Next Login → Password OK → AAL1 session
  → AuthContext detects enrolled factor + AAL1
  → Redirect to /app/mfa-verify
  → User enters TOTP code → AAL2 → Proceed to app
```

---

## 2. Data Retention Policies with Automated Purge

Create a scheduled edge function that purges old non-essential data.

### Retention Rules
| Table | Retention | Action |
|---|---|---|
| `audit_logs` | 12 months | DELETE where `created_at < now() - interval '12 months'` |
| `kiosk_sessions` | 90 days | DELETE |
| `kiosk_token_logs` | 90 days | DELETE |
| `notification_logs` | 6 months | DELETE |
| `ai_conversations` | 6 months | DELETE (PHI in prompts) |
| `hipaa_training_records` | Keep all | No purge (compliance evidence) |
| `hipaa_breach_incidents` | Keep all | No purge (legal requirement) |

### New Files
- **`supabase/functions/data-retention-purge/index.ts`** — Edge function that:
  - Authenticates via service_role key
  - Runs parameterized DELETE queries per table with retention periods
  - Logs purge counts to `audit_logs` with action `data_retention_purge`
  - Returns summary JSON

### Configuration
- **`supabase/config.toml`** — Add `[functions.data-retention-purge]` with `verify_jwt = false`
- **Scheduled via pg_cron** — Run weekly (using `supabase--read_query` to insert cron job, not migration)

### New UI
- **`src/pages/app/settings/DataRetentionPage.tsx`** — Settings page showing:
  - Current retention policies (read-only display)
  - Last purge date and counts (from audit_logs)
  - Manual "Run Purge Now" button (calls edge function)
- **Route** added in `App.tsx`

---

## 3. Realtime Channel RLS Isolation

Supabase Realtime `postgres_changes` already respects RLS policies on the underlying tables. Since Phase 1 fixed RLS on key tables with `organization_id` scoping, Realtime is already filtered.

However, current channel subscriptions don't use Supabase's `filter` parameter to narrow down events, meaning the client receives change events for all rows the RLS allows (correct but noisy).

### Fixes
Add `filter` parameter to all Realtime subscriptions where `organization_id` is available:

- **`src/pages/app/ipd/IPDDashboard.tsx`** — Add `filter: 'organization_id=eq.${orgId}'`
- **`src/pages/app/ipd/NursingStationPage.tsx`** — Same filter
- **`src/pages/app/lab/LabQueuePage.tsx`** — Same filter
- **`src/components/mobile/MobileLabQueue.tsx`** — Same filter
- **`src/pages/app/appointments/QueueControlPage.tsx`** — Same filter
- **`src/pages/app/appointments/TokenKioskPage.tsx`** — Same filter
- **`src/hooks/useAppointmentNotifications.ts`** — Same filter

This ensures events are filtered at the server level, not just by RLS.

---

## 4. Trilingual Labels

Add translations for MFA, data retention, and related UI in `en.ts`, `ur.ts`, `ar.ts`:
- MFA enrollment prompts, verify page text, success/error messages
- Data retention policy labels and purge status
- "Two-Factor Authentication" section heading

---

## Summary

| Item | Files | HIPAA Rule |
|---|---|---|
| MFA enrollment UI + verify flow | 3 new + 3 edits | §164.312(d) |
| Data retention purge function | 1 edge fn + 1 page + config | §164.312(c)(1) |
| Realtime channel filters | 7 file edits | §164.312(a)(1) |
| Translations | 3 file edits | i18n |

**Total: ~4 new files, ~13 file edits, 1 edge function, 1 cron job.**

