# Plan — Seed Mobile QA Test Users

Provision four reusable test accounts attached to **Shifa Medical Center → Main Branch - Gulberg** so we can exercise every mobile dashboard variant (`/mobile/*`) end-to-end.

## Credentials

Shared password: **`Devmine@098`**

| Email | Role(s) | Lands on |
|---|---|---|
| `mobile.doctor@healthos24.test` | `doctor` | `DoctorMobileDashboard` |
| `mobile.nurse@healthos24.test` | `nurse` | `NurseMobileDashboard` |
| `mobile.staff@healthos24.test` | `receptionist` | `StaffMobileDashboard` |
| `mobile.patient@healthos24.test` | `patient` | `PatientMobileDashboard` / portal |

Org: `b1111111-1111-1111-1111-111111111111`  
Branch: `c1111111-1111-1111-1111-111111111111`

## What the migration does

Single idempotent SQL migration (`ON CONFLICT DO NOTHING`) that:

1. **`auth.users`** — inserts 4 users with bcrypted password (`crypt('Devmine@098', gen_salt('bf'))`), `email_confirmed_at = now()`, deterministic UUIDs so re-runs are safe.
2. **`auth.identities`** — matching email identity rows for password login.
3. **`public.profiles`** — `id`, `email`, `full_name`, `organization_id`, `branch_id`, `is_active = true`.
4. **`public.user_roles`** — one row per user with the role above (enum `app_role`).
5. **Doctor extras** — `public.doctors` row (specialization, license, consultation_fee 500) so OPD/appointment screens have a valid provider record.
6. **Nurse extras** — `public.nurses` row (license, designation).
7. **Staff extras** — `public.employees` row (designation = Receptionist).
8. **Patient extras** — `public.patients` row (MRN auto-gen, gender M, DOB, phone) linked back to the auth user via `user_id` so the patient portal/mobile dashboard resolves.
9. **Optional** — register fake `device_registrations` entries so push-token UI has visible state (skipped unless you want it).

## Verification after migration

- Login each account on the web preview → should redirect into the correct mobile dashboard when viewport is mobile.
- Confirm `useAuth().roles` resolves the assigned role.
- On the APK, walk `scripts/qa-mobile-checklist.md` per persona.

## Files touched

- **New migration** (auto-named by the tool) — all inserts above.
- No app code changes.

## Notes / caveats

- Test emails use `.test` TLD so they will never deliver real mail and won't collide with production users.
- Re-running the migration is safe (ON CONFLICT on every table).
- If you later want to remove them: `DELETE FROM auth.users WHERE email LIKE 'mobile.%@healthos24.test'` cascades through `profiles`, `user_roles`, `doctors`, `nurses`, `employees`, `patients` (all have ON DELETE CASCADE on `user_id` / `id`).

Approve to run the migration.