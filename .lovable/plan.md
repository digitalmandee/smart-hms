## HealthOS 24 — MVP → Production Readiness Plan

CI/CD pipeline work is **explicitly skipped** as you requested. We focus on what actually blocks safely running real patients, real money, and real PHI.

The Supabase scan returned **131 security findings** and the DB linter **127 issues**. That's the single biggest blocker today, so it leads the plan.

---

## Phase 1 — Security hardening (the real blocker)

### 1.1 Lock down SECURITY DEFINER functions (≈124 of the 127 lints)
The DB has dozens of `SECURITY DEFINER` functions in the `public` schema that anon and authenticated users can `EXECUTE`. Each one is a potential privilege-escalation surface.

For every offender:
- Audit the function — is it intended as a user-callable RPC, or only as a trigger / internal helper?
- For internal-only helpers: `REVOKE EXECUTE ... FROM anon, authenticated, public;` (only `postgres`/`service_role` keep execute).
- For user-callable RPCs: keep `SECURITY DEFINER` only if it must bypass RLS, lock down with explicit auth checks (`if auth.uid() is null then raise exception ...`) and `SET search_path = public, pg_temp` on every function.
- Add `SET search_path` to any function still missing it (also flagged by the linter).

Single migration grouped by function family (auth helpers, GL triggers, GRN posting, payroll, etc.) so it's reviewable.

### 1.2 Auth hardening (3 remaining lints)
- Enable **Leaked Password Protection** in Supabase Auth (linter warning #127).
- Reduce **OTP expiry** to ≤ 1 hour.
- Confirm **MFA enforcement** for `super_admin`, `org_admin`, `branch_admin`, `accountant`, `finance_manager` roles using existing `useMFA` hook.

### 1.3 Edge function authentication & input validation
25 edge functions; **all** are currently `verify_jwt = false` in `supabase/config.toml`. Public-by-default is wrong for most of them.

Categorize and fix:
- **Truly public** (keep `verify_jwt = false`, but require signature/secret + Zod validation): `lab-result-receiver` (HMAC from analyzer), `check-overdue-invoices`, `send-appointment-reminders`, `post-daily-room-charges`, `data-retention-purge` (cron secret), `setup-demo-users`, `seed-blood-bank`, `setup-warehouse-demo` (gate behind `DEMO_MODE` env in production).
- **Authenticated** (validate JWT in code with `getClaims()` + role check): `create-staff-user`, `ai-assistant`, `heygen-token`, `send-push-notification`, `send-sms`, `pacs-gateway`, `pacs-settings`.
- **Authenticated + KSA gateway role check**: `nphies-gateway`, `wasfaty-gateway`, `tatmeen-gateway`, `nafath-gateway`, `sehhaty-gateway`, `hesn-gateway`, `zatca-einvoice`, `zatca-phase2` — verify caller is on the same org/branch as the patient/invoice they're acting on.

For every function: add Zod input schema, return 400 on validation failure, ensure CORS uses the allowlist already in `_shared/cors.ts` (good — keep it), strip stack traces from error responses, log structured errors via `_shared/logger.ts`.

### 1.4 Storage RLS audit
Walk every Supabase storage bucket (patient docs, prescriptions, lab reports, IDs). Confirm RLS policies require auth + same-org membership. No public buckets for any PHI.

### 1.5 Re-run scan and resolve to zero `error` + zero unjustified `warn`
Re-run `security--run_security_scan` and `supabase--linter` after each migration. Each remaining warn must be either fixed or formally ignored with a written justification stored in `@security-memory`.

---

## Phase 2 — Observability & error reporting

Today the app has a logger and `ErrorBoundary` but **no production telemetry**. If a clinician sees a crash at 2am, you'll never know.

- Add **Sentry** (browser SDK) — capture React errors, unhandled promise rejections, tag with `org_id`, `branch_id`, `role`, route. Wire from `ErrorBoundary.componentDidCatch`. PII scrubbing rules to strip patient names, MRNs, phone numbers from breadcrumbs.
- Add Sentry to **edge functions** (Deno SDK) — capture errors with the same tags, tag KSA gateway calls with the integration name.
- Wire `_shared/logger.ts` to a structured sink so edge logs are queryable via the `supabase--analytics_query` we already have.
- Add a tiny `/health` edge function returning `{ db: ok, time: ... }` for external uptime monitors (UptimeRobot / Better Stack — user provides which).
- Add an **in-app admin "Integration Health" page** showing the last 24h of edge function failures per KSA gateway, pulled via `supabase--analytics_query` style query — clinic IT can self-serve.

---

## Phase 3 — Edge function reliability

Apply across all KSA gateway functions:
- **Timeouts**: 10s default, 30s for ZATCA submission. Abort with `AbortController`.
- **Retries with exponential backoff** for idempotent calls (status checks, lookups). Never retry POST submissions without an idempotency key.
- **Idempotency keys** for ZATCA, NPHIES claim submission, Wasfaty prescription dispatch — store in a `gateway_idempotency` table keyed on `(gateway, request_hash)` to deduplicate retries.
- **Per-gateway circuit breaker** state stored in a small `gateway_circuit_state` table; trip after N consecutive failures, surface in the Integration Health page above.
- (Skipping app-level rate limiting per platform guidance.)

---

## Phase 4 — Data safety nets

- **Backups**: confirm Supabase PITR is enabled on the project's plan; if not, document required upgrade. Add a weekly **restore drill** runbook (restore latest backup to a scratch project, run smoke checks).
- **Data retention**: review existing `data-retention-purge` function — confirm it respects KSA medical-record minimums (typically 10y adult, longer for minors). Make retention windows configurable per `organization_id`.
- **Soft-delete audit**: list every table that has a `deleted_at` column vs hard delete. PHI tables (patients, encounters, lab_orders, prescriptions, invoices, ipd_admissions) must be soft-delete only.
- **PHI access log**: extend existing `usePhiAccessLog` to be enforced via DB triggers on `patients`, `medical_history`, `lab_results`, so it cannot be bypassed by skipping the hook.

---

## Phase 5 — Clinical safety hardening

These require sign-off from a real clinician but the system can enforce the guardrails:
- **Allergy hard-stop**: at prescription/POS dispense time, block if active allergy in `medical_history` matches medicine class. Override requires reason + role check (doctor/pharmacist), logged.
- **Dose ceiling check**: per-medicine `max_daily_dose` field consulted at prescribe and at IPD administration.
- **Critical lab value escalation**: when a lab result is published and falls outside critical bounds, auto-create a notification to the ordering doctor + on-duty nurse, and surface a banner on the patient chart until acknowledged.
- **Blood bank cross-match enforcement**: cannot mark unit as issued until cross-match passed (already partially in `BloodBank` memory; verify enforced at DB-trigger level, not just UI).
- **Drug-drug interaction warning**: at prescribe time, lookup against an interactions table (seed minimal high-severity set first; expand later).

---

## Phase 6 — Critical-path automated tests

Today there are ~10 Playwright e2e specs. Expand to cover the flows where a regression would cause real harm:

```text
tests/e2e/
├── opd-walkin-to-invoice.spec.ts        (registration -> token -> invoice -> payment)
├── ipd-admit-to-discharge.spec.ts       (admission -> charges -> discharge invoice -> GL)
├── pharmacy-grn-to-pos.spec.ts          (PR -> PO -> GRN -> stock -> POS sale -> COGS)
├── lab-order-to-publish.spec.ts         (order -> sample -> result -> publish -> realtime)
├── invoice-payment-deposit.spec.ts      (deposit apply, split tender, refund)
├── ksa-zatca-phase2.spec.ts             (mocked clearance + chained hash)
├── ksa-nphies-claim.spec.ts             (mocked submission + scrubber)
├── role-rls-isolation.spec.ts           (cross-org/branch data leak attempts)
└── auth-mfa-enforcement.spec.ts         (admin must MFA)
```

Each spec runs against the demo seed, asserts both UI state **and** the resulting DB rows / GL entries.

---

## Phase 7 — Go-live operations (docs, no CI/CD)

Produce these as living docs in the repo (also surfaced as in-app pages under `/app/admin/runbooks` so on-call staff can read them on a phone):

1. **Incident response runbook** — severity levels, escalation chain, communication template, postmortem template.
2. **Backup & restore runbook** — how to PITR-restore to a point in time, how to extract a single org's data.
3. **KSA integration onboarding** — step-by-step for each: NPHIES, Wasfaty, Tatmeen, Nafath, Sehhaty, ZATCA Phase-2, including required certificates and where they're stored as secrets.
4. **New facility onboarding playbook** — CoA seed, services, formulary import, price lists, users + roles, branch settings, working hours, receipt template.
5. **Legal pack checklist** — Terms, Privacy, DPA, BAA per jurisdiction (KSA PDPL, PK), data residency confirmation (Supabase region), consent forms language packs.
6. **Pilot exit criteria** — signed clinical UAT per module, zero `error` security findings open, 7-day uptime ≥ 99.5%, restore drill passed, backup verified, on-call rotation defined.

---

## Technical notes

- All DB changes ship as **one migration per phase section** (e.g. `phase1_lockdown_security_definer.sql`) so they're reviewable and rollback-able.
- All new edge function changes use the existing `_shared/cors.ts` allowlist and `_shared/logger.ts` — no new patterns.
- Sentry DSN added via `add_secret` (browser SDK uses public DSN — fine to ship in client code; server uses a separate DSN as secret).
- The Integration Health admin page reuses `DataTable` + existing analytics query helpers; no new infra.
- All new UI strings flow through the existing i18n system (EN/AR/UR) per project standard.
- No changes to Lovable's auto-deploy flow are needed — we're not touching CI/CD.

---

## Suggested execution order

If you want to do this in a single sweep I'd run it in roughly this order, because each phase de-risks the next:

```text
Phase 1  (Security)          ── biggest blocker, do first
Phase 2  (Observability)     ── so we can see what breaks in Phase 3+
Phase 3  (Edge reliability)
Phase 4  (Data safety)
Phase 5  (Clinical safety)
Phase 6  (Tests)             ── locks in everything above
Phase 7  (Runbooks)          ── final go-live pack
```

After Phase 1 + 2 you're already meaningfully safer than today; after Phase 4 you're pilot-ready; after Phase 7 you're production-ready.

---

## Out of scope (per your instruction)

- CI/CD pipeline (GitHub Actions, deploy gates, automated rollouts)
- App-level rate limiting (platform doesn't have primitives yet — will be revisited)
- New feature work; this is purely hardening