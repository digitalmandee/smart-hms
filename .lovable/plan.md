## Wave 1 status recap

Done so far (Chunks 1–10, plus refinements):
- **Chunk 1** Offline-Sync Engine (IndexedDB outbox, `cow-sync`, AuthContext wiring, OfflineIndicator)
- **Chunk 2** KSA Payments (HyperPay, Tap, STC Pay scaffolded — credentials pending)
- **Chunk 3** Clinic on Wheels (`/app/mobile-units/*`)
- **Chunk 4** Home Healthcare (`/app/home-care/*`, offline-wired)
- **Chunk 5** Immunizations + vaccine_lots trigger (`/app/immunizations`)
- **Chunk 6** Telemedicine (`/app/telemedicine`, consent + duration)
- **Chunk 7** Patient Portal (`/portal/*`, RLS + portal layout)
- **Chunk 8** Capacitor mobile shell (native wrappers + push + device registration)
- **Chunk 9** Nafath SSO + WhatsApp dispatch (`whatsapp-dispatch` edge fn + log table)
- **Chunk 10** FHIR R4 server (`fhir-server` edge fn, SMART config, client credentials)
- **Chunk 11** Sehhaty bidirectional sync (`sehhaty-sync` edge fn, pull tables, health dashboard)
- Side track: SEO blog (20 posts), sitemap, GSC verification

Remaining from the original 6-month Wave 1 (Months 5–6):
- Patient Portal (web)
- Patient Mobile App (Capacitor) + push + in-app payments
- Nafath SSO + WhatsApp Business API
- FHIR R4 server endpoints (SMART-on-FHIR)
- Sehhaty / NPHIES bidirectional sync
- Hardening: load test, pen-test, RLS audit, WCAG 2.1 AA, pilot playbook

---

## Chunks 7–12 (remaining)

### Chunk 7 — Patient Portal (web)
Public-facing portal at `/portal/*` with its own minimal layout (not `DashboardLayout`).
- Routes: `/portal/login`, `/portal/dashboard`, `/portal/appointments`, `/portal/lab-results`, `/portal/prescriptions`, `/portal/invoices`, `/portal/profile`.
- Reuses `patient_portal_accounts` table (already created in Wave 1 foundation).
- RLS: patient can only read their own MRN-linked rows. Adds `has_portal_access(_user_id, _patient_id)` security-definer helper.
- Auth: Supabase email/OTP + (Chunk 9) Nafath SSO.
- i18n: EN/AR/UR, RTL layout for AR.
- ~80 translation keys.

### Chunk 8 — Patient Mobile App (Capacitor shell)
Wraps the `/portal/*` routes into a native iOS/Android shell.
- `capacitor.config.ts`, native projects under `ios/` and `android/` scaffolded but kept out of preview build.
- Plugins: Push Notifications (FCM/APNs), Geolocation (visit ETA), Camera (upload reports), Biometric (Face ID/Touch ID unlock).
- Build script `scripts/build-mobile.ts` runs `vite build` → `npx cap sync`.
- README section on running locally via Android Studio / Xcode (sandbox can't run native builds — user runs locally after export).
- In-app payments: reuses Chunk 2 `payment-create` + GatewayCheckoutDialog inside Capacitor `Browser` plugin.

### Chunk 9 — Nafath SSO + WhatsApp Business API
- Edge function `nafath-auth`: KSA national-ID OAuth via Elm/Absher Nafath sandbox; returns a Supabase session via custom JWT.
- Edge function `whatsapp-dispatch`: outbound templates (appointment reminders, OTP, lab-result-ready) via Meta WhatsApp Business Cloud API.
- New table `whatsapp_message_log` (status, template_name, recipient, payload_hash). RLS: org-scoped.
- Settings page `/app/settings/integrations` to paste sandbox credentials (stored as Lovable secrets).
- Triggers added so that `lab_orders.status → 'reported'`, `appointments` insert (T-24h), and `immunizations` insert auto-enqueue WhatsApp messages via a `pg_net` call to the edge function.

### Chunk 10 — FHIR R4 server (SMART-on-FHIR)
- Edge function `fhir-server` exposes read-only `Patient`, `Encounter`, `Observation`, `MedicationRequest`, `Immunization`, `DiagnosticReport` endpoints.
- SMART scopes: `patient/*.read`, `user/*.read`, `system/*.read`. Token issued by `nafath-auth` (patient scope) or org service account (system scope).
- New table `fhir_resource_cache` (already created in Wave 1) populated on-demand; cache key = `(resource_type, source_id, updated_at)`.
- Capability statement at `/.well-known/smart-configuration` + `/fhir/metadata`.
- Conformance: JSON Bundle paging, `_since`, `_count`, `OperationOutcome` errors.

### Chunk 11 — Sehhaty + NPHIES bidirectional sync
- Edge function `sehhaty-sync`:
  - Pull: vaccination certificates, sick leaves, referrals → upsert into local tables.
  - Push: immunization records (from Chunk 5) → Sehhaty registry. Reuses `vaccine-certificate` function for PDF + QR.
- NPHIES (extending existing infrastructure):
  - Eligibility-check on appointment creation (FHIR CoverageEligibilityRequest).
  - Pre-authorization for IPD admission > SAR threshold.
  - Claim submission on invoice paid (already partially in place — finalize the loop).
- Retry/backoff via `sync_outbox` (reusing Chunk 1 infra).
- Admin dashboard `/app/integrations/health-network` showing pull/push health, last-success timestamps, error log.

### Chunk 12 — Hardening + pilot rollout
- **Security**: full RLS audit (`security--run_security_scan`), kill remaining SECURITY DEFINER where avoidable, rotate any leaked test keys, edge-function allowlist review.
- **PHI masking**: extend the existing masking helpers to all new modules (telemedicine notes, home_visits, immunizations).
- **Load test**: k6 script in `scripts/loadtest/` simulating 50 concurrent CoW vans + 200 portal users. Target: p95 < 800ms on critical reads.
- **WCAG 2.1 AA**: contrast pass, focus rings, ARIA labels on new modules (portal, telemed room, CoW). Add `eslint-plugin-jsx-a11y` to CI.
- **Pen-test prep**: rate limiting on `payment-webhook`, `nafath-auth`, `whatsapp-dispatch`. CSRF tokens on portal mutations.
- **Pilot playbook** at `docs/pilot-rollout.md`: 1 hospital + 5 vans onboarding checklist, training videos list, support escalation matrix.

---

## Execution order

Recommended sequence (each = one chunk = one user "next chunk" reply):

```text
Chunk 7  → Patient Portal (web)              [~M5 start]
Chunk 8  → Capacitor mobile shell + push      [M5]
Chunk 9  → Nafath SSO + WhatsApp              [M5 end]
Chunk 10 → FHIR R4 server                     [M6]
Chunk 11 → Sehhaty + NPHIES bidirectional     [M6]
Chunk 12 → Hardening + pilot playbook         [M6 end]
```

## i18n rule (project memory)
Every chunk ships EN/AR/UR translations and respects the existing RTL bypass pattern (`flex-row-reverse`, `text-end`).

## Out of scope (still deferred to Wave 2)
ICU/NICU charting, JCI/CBAHI workflows, Oncology, denial-management, FHIR write-bus to external EHRs beyond Sehhaty/NPHIES.

## Approval
Approve this plan to start with **Chunk 7 — Patient Portal (web)**. After it lands, reply "next chunk" to roll through 8 → 12.
