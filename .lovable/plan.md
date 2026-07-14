## Goal

Produce two authoritative, self-contained documents that fully describe HealthOS 24 so a new engineering team can rebuild/self-host the backend on Node.js + Postgres without needing access to Supabase or the Lovable preview.

No files exist today named `brain.md` or `healthos.md`. I'll create both from scratch by mining:
- `src/pages/**` (all app routes and modules)
- `src/hooks/**` (200+ data hooks → domain surface)
- `supabase/functions/**` (edge functions → backend behavior)
- `supabase/migrations/**` (schema, triggers, RLS)
- `src/integrations/supabase/types.ts` (canonical table + enum list)
- Existing memory (module isolation, finance triggers, KSA integrations, etc.)

## Deliverables (written to `/mnt/documents/`)

### 1. `BRAIN.md` — Architecture & Engineering Bible (~40–60 pages)

Purpose: the "how it thinks" doc. Everything a backend engineer needs to reimplement in NestJS + Prisma + Postgres.

Sections:
1. **System Overview** — multi-tenant (org → branch), facility_type adaptive, role-based, KSA-first, EN/AR/UR i18n, offline-capable PWA + Capacitor.
2. **Tech Stack (current vs target)** — React/Vite/Tailwind frontend stays; backend moves from Supabase (Postgres + PostgREST + Auth + Storage + Edge) to Node.js (NestJS) + Postgres + Prisma + Redis + MinIO + custom JWT.
3. **Data Model** — all ~300 tables grouped by domain, with key columns, FKs, and enums. Sourced from `types.ts`.
4. **Row-Level Security** — every policy pattern (org-scoped, role-scoped, security-definer `has_role`, kiosk anon). Migration strategy: session GUCs (`app.current_org`, `app.current_user`) + Postgres RLS preserved on self-host.
5. **Triggers & Business Logic in DB** — the idempotent GL-posting triggers (invoices, POS, GRN, surgery, IPD discharge, doctor earnings, ZATCA chaining, requisition status sync). Each listed with source table → target effect.
6. **Auth & Roles** — `user_roles` + `has_role()` SECURITY DEFINER, MFA, recovery codes, kiosk sessions, patient portal accounts, Nafath. Migration: bcrypt hash export from `auth.users` → local `users` table; JWT signed locally.
7. **Edge Functions Inventory** — every function in `supabase/functions/` mapped to a Node service/controller with inputs, outputs, secrets required.
8. **Realtime** — channels used (queues, lab orders, invoices, appointments); replace with Postgres LISTEN/NOTIFY + Socket.IO.
9. **Storage** — buckets, path conventions, RLS. Replace with MinIO + presigned URLs.
10. **Integrations (KSA)** — NPHIES, ZATCA, Wasfaty, Tatmeen, Nafath, Sehhaty, HESN, WhatsApp, SMS, HeyGen, ElevenLabs, DeepSeek — endpoint, auth, secrets, request/response shape.
11. **Migration Runbook** — step-by-step: schema dump → Node scaffold (already delivered in v0 zip) → data cutover → cutover DNS.
12. **Deployment Topology** — VPS, Docker Compose (Postgres, PgBouncer, Redis, MinIO, NestJS API, Nginx), backups, monitoring.
13. **Security & Compliance** — HIPAA controls, PHI masking, audit logs, session timeouts, breach reporting.

### 2. `HEALTHOS.md` — Product & Module Encyclopedia (~40–60 pages)

Purpose: the "what it does" doc. Every module, every screen, every workflow.

Structure: one chapter per module. For each: purpose, key screens/routes, roles, tables, workflows, KSA specifics, dependencies.

Modules covered:
- **Patient Registration & Portal** (adult, child+guardian, walk-in, kiosk, QR)
- **OPD** (walk-in wizard, token queue, consultations, prescriptions, doctor workflow, nurse workflow)
- **IPD** (admission, beds/wards/floors, daily rounds, medications, transfers, discharge, deposits)
- **Emergency (ER)** (triage, trauma, MLC)
- **Surgery / OT** (scheduling, pre-op, intra-op, post-op, consumables/FIFO, WHO checklist, ERP integration)
- **Lab** (orders, panels, templates, specimens, analyzers, critical values, reporting lifecycle)
- **Radiology / Imaging** (PACS, DICOM, modalities, reporting, delivery)
- **Pharmacy** (POS, sessions, inventory, GRN, returns, credits, Wasfaty)
- **Warehouse / WMS** (bins, zones, racks, put-away, picking, packing, shipments, cycle counts)
- **Blood Bank** (donors, donations, inventory, cross-match, transfusions, reactions)
- **Dental** (3D tooth chart, procedures, treatments, images)
- **Dialysis** (machines, schedules, sessions, vitals)
- **Ambulance / Mobile Units** (routes, crew, visits, alerts)
- **HR & Payroll** (employees, contracts, licenses, attendance, leave, payroll two-pass engine, gratuity, exit, letters)
- **Finance** (COA 4-level, journals, vouchers, daily closing, deposits, fiscal years, budgets, fixed assets, depreciation)
- **Billing** (invoices, sessions, split payments, tax slabs, credit notes, PDC)
- **Insurance & NPHIES** (eligibility, pre-auth, claims, scrubbing, remittance)
- **ZATCA E-invoicing** (Phase 1 & 2, XML, hash chaining)
- **Procurement** (PR → PO → GRN → payment)
- **Assets & Maintenance**
- **Housekeeping**
- **Diet & Kitchen**
- **Immunization / Vaccination**
- **Home Visits**
- **Telemedicine**
- **Tabeebi AI** (voice, chat, suggestions, medical knowledge)
- **Donations / Campaigns**
- **HIPAA & Compliance** (breaches, training, BAA, PHI access log)
- **Kiosk & Public Queue Displays**
- **Notifications** (WhatsApp, SMS, email, push, in-app)
- **Reports & Analytics** (dashboards per role, CFO, OPD, IPD, Lab, Warehouse)
- **Super Admin / Multi-org**
- **Mobile Apps** (doctor, nurse, patient, staff personas)
- **Offline Sync** (outbox, conflicts, sync-engine)

## Approach

1. Enumerate routes from `src/App.tsx` / `src/pages/app/**`.
2. Enumerate hooks and edge functions.
3. Extract table list + enums from `types.ts`.
4. Cross-reference with memory files already indexed.
5. Write both docs to `/mnt/documents/BRAIN.md` and `/mnt/documents/HEALTHOS.md`.
6. Also emit a combined `HealthOS24_Architecture_Bundle.zip` containing both `.md` files + a rendered `BRAIN.pdf` + `HEALTHOS.pdf` for offline reading.

## Out of scope

- No code changes to the app.
- No new backend code this turn (the NestJS scaffold zip was already delivered previously; these docs are the companion spec).
- Documents are English-only (translation to AR/UR can be a follow-up if you want — the app UI is trilingual, but engineering docs are typically kept in one language).

Confirm and I'll generate both files.
