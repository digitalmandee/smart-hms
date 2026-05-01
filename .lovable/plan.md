# Admin-Driven MFA Enrollment & Recovery Codes

## Constraint (important)
Supabase Auth only lets a user enroll their own TOTP factor — admins cannot scan a QR on someone else's behalf. So "admin-driven" here means: **admins mandate MFA per user, monitor enrollment status, force enrollment on next login, and issue/regenerate one-time recovery codes**. The user still completes the QR step themselves on first login after being marked required.

## What gets built

### 1. Database (new migration)
- `user_mfa_settings` table
  - `user_id uuid PK → auth.users`
  - `organization_id uuid` (for org-scoped admin RLS)
  - `is_required boolean default false`
  - `enrolled_at timestamptz`, `last_verified_at timestamptz`
  - `required_by uuid` (admin who set it), `required_at timestamptz`
  - `grace_period_ends_at timestamptz` (optional soft-enforce window)
- `user_mfa_recovery_codes` table
  - `id`, `user_id`, `code_hash text` (SHA-256, never plaintext), `used_at timestamptz`, `created_at`
  - Unique `(user_id, code_hash)`
- RLS: users read/update own row; org admins/super_admin read/write all rows in their org via `has_role()`
- Trigger: when a user verifies a TOTP factor (detected via edge function callback), set `enrolled_at = now()`

### 2. Edge functions
- `mfa-admin-set-required` — admin marks a user as MFA-required (with optional grace period). Validates caller is `admin`/`super_admin` in the same org.
- `mfa-generate-recovery-codes` — generates 10 single-use codes, stores SHA-256 hashes, returns plaintext **once** to the caller (admin or user themselves).
- `mfa-redeem-recovery-code` — verifies a code, marks it used, issues a short-lived AAL2 grant via admin API (or unenrolls the lost factor so the user can re-enroll).
- `mfa-sync-status` — invoked by client after successful enroll/verify; updates `enrolled_at`/`last_verified_at` server-side.

All functions: JWT-verified, audit-logged via existing `errorReporter`/audit pattern, JSON i18n error keys.

### 3. Frontend — Security Setup page (replace the static "MFA enforcement" card)
New section: **MFA Enrollment Roster** (admins/super_admin only, gated by `hasRole`).

Per-user table with columns:
- User (name, email, role badges)
- MFA status: `Not required` / `Required – pending` / `Enrolled` / `Grace period (Xd left)`
- Last verified
- Recovery codes: `0/10 used`
- Actions: `Require MFA`, `Remove requirement`, `Generate recovery codes`, `Reset (unenroll)`

Filters: org-scoped automatically; search by name/email; status filter.

Bulk actions: "Require MFA for all admins", "Require MFA for all users".

Recovery codes dialog:
- Shows the 10 codes once with copy-all + download .txt
- Clear warning: "These will not be shown again"
- Regenerate invalidates previous unused codes

### 4. Frontend — User-facing flows
- **Profile → Security**: when `is_required && !enrolled_at`, show a persistent banner "Your administrator requires you to enable MFA" + auto-open `EnrollMFADialog`. After enroll, prompt to generate recovery codes.
- **Login flow** (`MFAVerifyPage`): add "Use a recovery code instead" link → small form → calls `mfa-redeem-recovery-code` → on success either signs the AAL2 grant or unenrolls + reroutes to enrollment.
- **AuthContext**: after sign-in, if `is_required && !enrolled_at && grace_period_ends_at < now()`, redirect to `/app/profile/security?enroll=1` and block other routes.

### 5. i18n
Add ~25 keys under `security.mfa_admin.*` and `mfa.recovery.*` to `en.ts`, `ar.ts`, `ur.ts` (project rule: 3-language parity).

### 6. Audit & telemetry
Every admin action (`require`, `unrequire`, `regenerate codes`, `reset factor`) logs to existing audit table with `actor_id`, `target_user_id`, `action`, `metadata`.

## File map
```text
supabase/migrations/<ts>_user_mfa_admin.sql        new
supabase/functions/mfa-admin-set-required/         new
supabase/functions/mfa-generate-recovery-codes/    new
supabase/functions/mfa-redeem-recovery-code/       new
supabase/functions/mfa-sync-status/                new
src/hooks/useMfaAdmin.ts                           new
src/hooks/useMFA.ts                                edit (add recovery + sync)
src/components/mfa/MfaRosterTable.tsx              new
src/components/mfa/RecoveryCodesDialog.tsx        new
src/components/mfa/RecoveryCodeInput.tsx           new
src/components/mfa/MFAVerifyPage.tsx               edit (recovery link)
src/components/mfa/EnrollMFADialog.tsx             edit (post-enroll → codes)
src/pages/app/admin/SecuritySetupPage.tsx          edit (mount roster)
src/pages/app/ProfilePage.tsx                      edit (required banner)
src/contexts/AuthContext.tsx                       edit (enforce redirect)
src/lib/i18n/translations/{en,ar,ur}.ts            edit (~25 keys × 3)
```

## Out of scope
- SMS/WebAuthn factors (TOTP only, matches current stack)
- Cross-org MFA policy (each org admin manages their own org)
- Hardware security keys

## Acceptance criteria
- Org admin can mark any user in their org as MFA-required and see live status
- Required user is forced to enroll on next login after grace period
- Recovery codes are shown exactly once, stored only as hashes, single-use
- User can sign in with a recovery code if they lose their authenticator
- All admin mutations are audit-logged
- All new UI strings present in en/ar/ur with RTL layout
- Supabase linter shows no new findings; RLS denies cross-org reads
