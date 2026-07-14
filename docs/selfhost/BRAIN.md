# HealthOS 24 — BRAIN.md
### Architecture & Engineering Bible (Self-Host Edition)
Version 1.0 · Target stack: **Node.js (NestJS) + PostgreSQL + Prisma + Redis + MinIO**
Source stack (current): React 18 + Vite 5 + Tailwind + Supabase (Postgres + PostgREST + GoTrue + Storage + Edge Runtime)

---

## 0. How to read this document

This is the **engineering bible**. It describes *how HealthOS 24 thinks* — data model, triggers, RLS, auth, integrations, deployment — everything a backend team needs to reimplement the server side without depending on Supabase or Lovable.

Companion doc: `HEALTHOS.md` — describes *what HealthOS 24 does* module by module (product encyclopedia).

---

## 1. System Overview

HealthOS 24 is a **multi-tenant, multi-branch Hospital + Clinic Management System** targeting Saudi Arabia (KSA) first, with EN / AR / UR trilingual UI, Hijri + Gregorian calendars, and full compliance surface for NPHIES, ZATCA, Wasfaty, Tatmeen, Nafath, Sehhaty and HESN.

### Cardinal design tenets

| Tenet | Implementation |
|---|---|
| **Tenant isolation** | Every domain table carries `organization_id` (uuid). RLS enforces read/write scope. |
| **Branch isolation** | Most operational tables also carry `branch_id`. UI + policies scope by branch. |
| **Facility adaptivity** | `organizations.facility_type` (`hospital` \| `clinic` \| `polyclinic` \| `daycare`) rewires the sidebar, hides IPD/OT for clinics, adapts HR & Finance workflows. |
| **Role-based access** | `user_roles` table + `has_role(uuid, app_role)` SECURITY DEFINER function. Never store roles on `profiles`. |
| **DB-first business logic** | Financial posting, ZATCA hashing, doctor earnings, GRN → stock, requisition status sync, IPD daily charges are **Postgres triggers**, not app code. All are idempotent (`IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_id = NEW.id)`). |
| **Offline capable** | Frontend + Capacitor mobile use IndexedDB outbox + sync engine. |
| **i18n** | `src/lib/i18n/index.ts` — EN / AR / UR. RTL handled with `flex-row-reverse` + `text-end` (bypasses Radix `dir` bug). |
| **Realtime** | Supabase channels for queues, lab orders, invoice payment transitions, appointments. Will move to Postgres `LISTEN/NOTIFY` + Socket.IO on self-host. |

### High-level topology (current)

```text
 Browser / Capacitor (React SPA)
   │  https  (anon JWT)
   ▼
 Supabase Edge (Deno)      ◄── Secrets (Nafath, ZATCA, NPHIES, etc.)
   │                             
   ▼                             
 PostgREST  ── RLS ──►  PostgreSQL  ◄── Triggers (GL, ZATCA, earnings)
                          │
                          ├── GoTrue (auth.users)
                          ├── Storage (S3-compatible)
                          └── Realtime (WAL replication)
```

### High-level topology (target self-host)

```text
 Browser / Capacitor (React SPA — unchanged)
   │  https  (JWT signed by our API)
   ▼
 Nginx (TLS, rate-limit)
   │
   ▼
 NestJS API cluster (PM2 / Docker replicas)
   │        │              │
   ▼        ▼              ▼
 Redis    MinIO         PgBouncer
 (cache,  (S3 API)       │
  queues,                ▼
  sessions)          PostgreSQL 15
                       (RLS + triggers preserved)
```

---

## 2. Tech Stack Migration Map

| Layer | Supabase (current) | Self-host (target) |
|---|---|---|
| DB | Managed Postgres | PostgreSQL 15 on VPS (or managed RDS/DO) |
| API | PostgREST + Edge Functions (Deno) | NestJS 10 (Node 20) modules + controllers |
| ORM | `supabase-js` typed client | Prisma 5 (schema introspected from live DB) |
| Auth | GoTrue (`auth.users`, JWT) | Custom `users` table + `bcrypt` + `jsonwebtoken` (HS256 or RS256) |
| Row Security | Postgres RLS (`auth.uid()`, `auth.jwt()`) | **Preserved** via `SET LOCAL app.current_user`, `app.current_org`; helper functions `auth.uid()` / `auth.jwt()` redefined to read GUCs |
| Storage | Supabase Storage | MinIO (S3 API) + presigned URLs |
| Realtime | Supabase Realtime (WAL) | Postgres `LISTEN/NOTIFY` → Socket.IO fan-out |
| Cron | pg_cron | node-cron inside API or systemd timer |
| Edge secrets | Supabase Vault | `.env` per environment + Docker secrets |
| Frontend client | `@/integrations/supabase/client` | **Same import path** — replace with a compat shim that wraps `fetch` → REST calls (avoids rewriting ~700 hooks) |

The **compatibility shim** is the key trick: `supabase.from("x").select("*").eq("id", id).maybeSingle()` becomes an HTTP call to `GET /rest/x?id=eq.<id>&limit=1`. NestJS exposes a `/rest/*` route that mirrors PostgREST semantics closely enough for existing hooks.

---

## 3. Data Model (Domain Inventory)

There are **≈300 tables** in the `public` schema. Full column detail lives in `src/integrations/supabase/types.ts` and Prisma schema (generated from `prisma db pull`). Grouped by domain:

### 3.1 Identity & Access
`profiles`, `user_roles`, `permissions`, `role_permissions`, `user_mfa_settings`, `user_mfa_recovery_codes`, `kiosk_configs`, `kiosk_sessions`, `kiosk_token_logs`, `patient_portal_accounts`, `patient_devices`, `push_device_tokens`

### 3.2 Tenancy
`organizations`, `organization_settings`, `organization_modules`, `branches`, `branch_settings`, `branch_modules`, `branch_role_restrictions`, `departments`, `designations`, `available_modules`

### 3.3 Patient master
`patients`, `patient_medical_history`, `patient_consents`, `patient_deposits`, `patient_insurance`, `patient_attendants`, `medical_history`, `custom_fields`, `custom_field_values`

### 3.4 OPD
`appointments`, `consultations`, `opd_departments`, `opd_department_specializations`, `emergency_registrations`, `er_treatments`, `trauma_assessments`, `mlc_records`, `queue_display_configs`

### 3.5 IPD
`admissions`, `beds`, `wards`, `bed_transfers`, `bed_issue_logs`, `ipd_bed_types`, `ipd_bed_features`, `ipd_ward_types`, `ipd_floors`, `ipd_charges`, `ipd_daily_charge_logs`, `ipd_medications`, `ipd_vitals`, `daily_rounds`, `discharge_summaries`, `discharge_checklist_items`, `nursing_notes`, `nursing_care_plans`, `care_plans`, `care_plan_items`, `medication_administration`, `patient_attendants`, `birth_records`, `death_records`

### 3.6 Surgery / OT
`surgeries`, `surgery_requests`, `surgery_team_members`, `surgery_consents`, `surgery_consumables`, `surgery_medications`, `surgery_reschedule_requests`, `surgical_safety_checklists`, `pre_op_assessments`, `pre_anesthesia_assessments`, `anesthesia_records`, `intra_op_notes`, `post_op_orders`, `post_op_recovery`, `ot_rooms`, `surgeon_fee_templates`

### 3.7 Lab
`lab_orders`, `lab_order_items`, `lab_test_templates`, `lab_test_panels`, `lab_test_categories`, `lab_settings`, `lab_analyzers`, `lab_analyzer_catalog`, `lab_analyzer_test_mappings`, `lab_result_imports`, `lab_critical_values`, `lab_critical_value_notifications`, `cross_match_tests`

### 3.8 Radiology / Imaging
`imaging_orders`, `imaging_results`, `imaging_modalities`, `imaging_procedures`, `imaging_report_templates`, `imaging_modality_pacs_mappings`, `pacs_servers`, `radiology_device_catalog`

### 3.9 Pharmacy
`medicines`, `medicine_categories`, `medicine_inventory`, `medicine_rack_assignments`, `medicine_safety_limits`, `drug_interactions`, `prescriptions`, `prescription_items`, `pharmacy_pos_sessions`, `pharmacy_pos_transactions`, `pharmacy_pos_items`, `pharmacy_pos_payments`, `pharmacy_pos_held_transactions`, `pharmacy_returns`, `pharmacy_return_items`, `pharmacy_patient_credits`, `pharmacy_stock_movements`, `pharmacy_settings`, `wasfaty_prescriptions`

### 3.10 Warehouse / Inventory / Procurement
`stores`, `store_racks`, `store_stock_transfers`, `store_stock_transfer_items`, `warehouse_zones`, `warehouse_bins`, `warehouse_orders`, `warehouse_order_items`, `inventory_items`, `inventory_categories`, `inventory_stock`, `inventory_bin_assignments`, `cycle_counts`, `cycle_count_items`, `dock_appointments`, `pick_lists`, `pick_list_items`, `packing_slips`, `packing_slip_items`, `shipments`, `shipment_tracking_events`, `putaway_tasks`, `stock_adjustments`, `stock_requisitions`, `requisition_items`, `purchase_requests`, `purchase_request_items`, `purchase_orders`, `purchase_order_items`, `goods_received_notes`, `grn_items`, `return_to_vendor`, `rtv_items`, `vendors`, `vendor_documents`, `vendor_payments`, `item_vendor_mapping`

### 3.11 Blood Bank
`blood_donors`, `blood_donations`, `blood_inventory`, `blood_requests`, `blood_transfusions`, `transfusion_reactions`, `donation_campaigns`, `donation_recurring_schedules`, `donation_reminders`, `cold_chain_logs`

### 3.12 Dental
`dental_charts`, `dental_procedures`, `dental_treatments`, `dental_images`

### 3.13 Dialysis
`dialysis_machines`, `dialysis_patients`, `dialysis_schedules`, `dialysis_sessions`, `dialysis_vitals`

### 3.14 Ambulance & Mobile
`ambulance_alerts`, `mobile_units`, `mobile_unit_crew`, `mobile_routes`, `mobile_route_stops`, `mobile_visits`, `home_visits`, `home_visit_tasks`

### 3.15 HR & Payroll
`employees`, `employee_categories`, `employee_dependents`, `employee_documents`, `employee_qualifications`, `employee_work_history`, `employee_contracts`, `employee_licenses`, `employee_salaries`, `employee_loans`, `employee_promotions`, `employee_transfers`, `employee_grievances`, `employee_clearance`, `employee_onboarding`, `doctors`, `nurses`, `doctor_schedules`, `doctor_fee_schedule`, `doctor_compensation_plans`, `doctor_earnings`, `doctor_settlements`, `qualifications`, `specializations`, `shifts`, `shift_assignments`, `shift_handovers`, `roster_publish_status`, `on_call_schedules`, `weekly_offs`, `holidays`, `attendance_records`, `attendance_corrections`, `biometric_devices`, `biometric_sync_logs`, `leave_types`, `leave_balances`, `leave_requests`, `leave_encashments`, `compensatory_offs`, `overtime_records`, `salary_components`, `salary_structures`, `payroll_runs`, `payroll_entries`, `loan_deductions`, `final_settlements`, `disciplinary_actions`, `exit_interviews`, `resignations`, `offer_letters`, `interviews`, `job_openings`, `job_applications`, `medical_fitness_records`, `hr_issued_letters`, `hr_letter_templates`, `onboarding_templates`, `onboarding_template_items`, `clearance_templates`, `clearance_template_items`, `training_programs`, `training_enrollments`, `safety_incidents`, `incident_reports`

### 3.16 Finance & Accounting
`account_types`, `accounts`, `journal_entries`, `journal_entry_lines`, `fiscal_years`, `budget_periods`, `budget_allocations`, `cost_centers`, `recurring_journal_templates`, `bank_accounts`, `bank_transactions`, `expenses`, `fixed_assets`, `assets`, `daily_closings`, `billing_sessions`, `billing_tax_slabs`, `tax_slabs`, `credit_notes`, `pdc_register`, `payment_methods`, `payments`, `payment_gateway_settings`, `payment_gateway_transactions`, `payment_gateway_refunds`, `service_categories`, `service_types`, `service_price_history`

### 3.17 Billing
`invoices`, `invoice_items`

### 3.18 Insurance / NPHIES
`insurance_companies`, `insurance_plans`, `insurance_claims`, `claim_items`, `claim_attachments`, `nphies_eligibility_logs`, `nphies_transaction_logs`, `medical_codes`

### 3.19 KSA Regulatory
`sehhaty_referrals`, `sehhaty_sick_leaves`, `sehhaty_vaccination_certificates`, `sehhaty_sync_log`, `tatmeen_transactions`, `hesn_reports`, `wasfaty_prescriptions`, `medical_certificates`

### 3.20 Compliance & Security
`audit_logs`, `client_errors`, `edge_errors`, `hipaa_breach_incidents`, `hipaa_training_records`, `business_associate_agreements`, `data_retention` (via edge function), `gateway_circuit_state`, `gateway_idempotency`

### 3.21 Communications & Notifications
`notification_logs`, `notification_preferences`, `notification_templates`, `whatsapp_message_log`, `push_device_tokens`

### 3.22 AI
`ai_conversations`, `ai_suggestions_log`, `medical_knowledge`, `clinical_alerts`, `drug_interactions`

### 3.23 FHIR
`fhir_clients`, `fhir_resource_cache`, `fhir_subscriptions`

### 3.24 Diet & Kitchen
`diet_charts`, `menu_items`

### 3.25 Immunization
`immunizations`, `immunization_schedules`, `vaccine_lots`, `vaccination_records`

### 3.26 Housekeeping / Facility / Assets
`housekeeping_tasks`, `housekeeping_inspections`, `maintenance_records`, `gate_logs`

### 3.27 Telemedicine
`telemedicine_sessions`, `telemedicine_consents`

### 3.28 Donations (financial + campaigns)
`donation_campaigns`, `donation_recurring_schedules`, `donation_reminders`, `financial_donations`, `financial_donors`

### 3.29 Sync (offline)
`sync_outbox`, `sync_conflicts`

### 3.30 System
`system_settings`, `report_templates`, `holidays`

Every table in `public.*` **must** carry:
- `id uuid PK default gen_random_uuid()`
- `organization_id uuid NOT NULL` (except a handful of platform-level tables — `available_modules`, `medical_codes`, `drug_interactions`, `medical_knowledge`, `edge_errors`, `gateway_*`)
- `branch_id uuid` where operationally relevant
- `created_at`, `updated_at timestamptz` with a trigger `update_updated_at_column`

---

## 4. Row-Level Security (RLS) — the whole model in one page

Every operational table has RLS enabled and **at least one** policy of the form:

```sql
CREATE POLICY "org_scope_select" ON public.<table>
  FOR SELECT TO authenticated
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "org_scope_write" ON public.<table>
  FOR ALL TO authenticated
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

Role-guarded tables layer `public.has_role(auth.uid(), 'admin')` (SECURITY DEFINER, `SET search_path = public`). Kiosk / QR / public queue paths have an explicit `to anon` policy scoped by a token column and expiry.

### Self-host migration

Supabase's `auth.uid()` and `auth.jwt()` are helper SQL functions that pull from JWT claims. On self-host we re-define them:

```sql
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.current_user', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.current_jwt', true), '')::jsonb;
$$;
```

Every NestJS request opens a transaction and issues:

```sql
SET LOCAL app.current_user = '<user uuid>';
SET LOCAL app.current_jwt  = '<jsonb blob incl. organization_id, role>';
```

All existing ~700 RLS policies keep working **unchanged**.

### The role helper

```sql
CREATE TYPE public.app_role AS ENUM (
  'super_admin','admin','doctor','nurse','pharmacist','lab_tech','radiologist',
  'reception','cashier','accountant','hr','warehouse','housekeeping','patient','kiosk'
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
```

On self-host, `auth.users` becomes `public.users`; keep the FK path but point it at the new users table.

---

## 5. Triggers — where business logic actually lives

This is the **single most important section** for anyone re-implementing the backend. Do NOT re-implement any of the following in Node — port the trigger SQL as-is.

### 5.1 Idempotency pattern (used by every posting trigger)

```sql
IF EXISTS (SELECT 1 FROM public.journal_entries WHERE reference_id = NEW.id AND reference_type = '<domain>') THEN
  RETURN NEW;
END IF;
```

Prevents double-posting on retries, replays, and idempotent restore.

### 5.2 The posting matrix (canonical)

| Source event | Fires on | DR (debit) | CR (credit) | Notes |
|---|---|---|---|---|
| OPD invoice paid | `invoices` UPDATE (`payment_status → 'paid'`) | Cash `1000` / Bank `1010` / AR `AR-001` | Revenue routed by prefix: `OPD-` → `REV-OPD`, `LAB-` → `REV-LAB`, `IMG-` → `REV-IMG`, `DLY-` → `REV-DLY`, `IPD-` → `REV-IPD-BED`, etc. | Multi-line split payment supported. |
| Pharmacy POS sale | `pharmacy_pos_transactions` UPDATE status → `completed` | Cash / Bank / Wallet (JazzCash & EasyPaisa map to Bank `1010`, **not** cash) | `REV-PHARM` + **COGS**: DR `EXP-COGS-001`, CR `INV-001` | Auto-decrements `medicine_inventory` FIFO via `pharmacy_stock_movements`. |
| GRN verified | `goods_received_notes` UPDATE `status → 'accepted'` | `INV-001` (inventory asset) | `AP-001` (accounts payable) | Also upserts `medicine_inventory` on `(branch_id, medicine_id, store_id)` unique index; auto-transitions linked requisition to `issued`. |
| Vendor payment | `vendor_payments` INSERT | `AP-001` | Cash / Bank (resolved by payment method) | |
| Patient deposit | `patient_deposits` INSERT | Cash / Bank | `LIA-DEP-001` | On invoice apply: DR `LIA-DEP-001` CR `AR-001`. |
| IPD discharge invoice | `invoices` INSERT where `admission_id IS NOT NULL` | AR-001 | Revenue split by `ipd_charges.charge_type` prefix | Marks `ipd_charges.is_billed = true`. |
| Surgery completed | `surgeries` UPDATE `status → 'completed'` | AR-001 | `REV-SURG` + surgeon-fee CR to doctor payable | FIFO consumable deduction. |
| Doctor earnings | `invoices` (unified `trg_unified_doctor_earnings`) | Doctor payable | Doctor earnings expense | Uses `doctor_compensation_plans`. |
| ZATCA chaining | `invoices` BEFORE INSERT | — | — | Computes SHA-256 hash chained with previous invoice's hash; stores `zatca_hash`, `zatca_uuid`. |
| Payroll posted | `payroll_runs` UPDATE `status → 'posted'` | Payroll expense (`5100-*`) | Cash/Bank + statutory liabilities | |
| Depreciation | `useDepreciationPostingV2` monthly | Depreciation exp | Accumulated depreciation | |
| Requisition sync | `grn_items` INSERT | — | — | Updates `stock_requisitions.status` when all items received. |
| Daily room charges | `post-daily-room-charges` edge fn (cron) | — | Inserts into `ipd_charges` per active admission per day | Off-ledger until discharge. |

### 5.3 Constraints

- `journal_entries.transaction_source` is CHECK-restricted to a fixed set (`invoice`, `pos`, `grn`, `vendor_payment`, `patient_deposit`, `payroll`, `depreciation`, `manual_voucher`, `credit_note`, `surgery`, `ipd_discharge`, …).
- Only **level-4 accounts** in the 4-level COA hierarchy can receive journal lines.
- Manual vouchers (CPV / CRV / BPV / BRV / JV) use `entry_number` empty string on insert; a trigger assigns the next sequence.
- `daily_closings` is blocked if any `billing_sessions.status = 'open'` for that branch/day.
- `payroll_runs` has no `updated_at`; omit it in updates.
- `account_types.category` is stored **lowercase**; all app queries must `.toLowerCase()`.

---

## 6. Auth & Roles

### 6.1 Current (Supabase)

- `auth.users` (managed) — email, encrypted password (bcrypt), phone, metadata.
- `public.profiles` — mirrors `auth.users.id`, adds `full_name`, `organization_id`, `branch_id`, `preferred_language`, `avatar_url`, etc.
- `public.user_roles` — user ↔ role N:N.
- **MFA**: TOTP via `user_mfa_settings`; recovery codes in `user_mfa_recovery_codes` (bcrypt-hashed, one-time). Admin can force-enable via `mfa-admin-set-required` edge fn.
- **Kiosk auth**: anonymous JWT with `kiosk_id` claim; `kiosk_sessions` bounds session, `kiosk_token_logs` audits.
- **Patient portal**: `patient_portal_accounts` stores its own bcrypt hash + patient link.
- **Nafath (KSA national ID)**: OAuth-like flow through `nafath-gateway` edge fn.

### 6.2 Self-host

1. Export Supabase users:
   ```sql
   SELECT id, email, encrypted_password, phone, raw_user_meta_data, created_at
   FROM auth.users;
   ```
   `encrypted_password` is bcrypt with `$2a$` prefix — directly usable by `bcryptjs`.
2. Create `public.users` mirroring the fields, drop the `auth.` schema references, repoint FKs.
3. Issue JWTs from NestJS `AuthModule`:
   ```json
   {
     "sub": "<user uuid>",
     "email": "...",
     "organization_id": "...",
     "branch_id": "...",
     "role": ["doctor","admin"],
     "aud": "authenticated",
     "iss": "healthos24",
     "exp": ...
   }
   ```
   `role` and `aud` mirror what RLS reads via `auth.jwt() ->> 'role'` so nothing breaks.
4. Refresh tokens: rotating, httpOnly cookie, 30-day sliding.
5. MFA: `otplib` for TOTP, keep recovery-code shape identical.

---

## 7. Edge Functions Inventory (→ Node services)

| Edge fn (Deno) | Purpose | Target NestJS location | Secrets needed |
|---|---|---|---|
| `ai-assistant` | Router for Tabeebi AI chat, calls DeepSeek | `AiModule` → `POST /ai/chat` | `DEEPSEEK_API_KEY`, `OPENAI_API_KEY` |
| `check-overdue-invoices` | Cron: mark invoices overdue, WhatsApp reminder | `BillingModule.overdueCron` (node-cron daily 09:00 org-TZ) | — |
| `cow-sync` | Council of Ministers directive sync (KSA regulatory) | `RegulatoryModule.cowSync` | `COW_API_KEY` |
| `create-staff-user` | Admin creates staff account + role assignment | `AdminModule.createStaff` | — |
| `data-retention-purge` | GDPR/HIPAA retention purge | `ComplianceModule.retentionCron` (weekly) | — |
| `fhir-server` | FHIR R4 REST endpoints (Patient, Observation, Encounter…) | `FhirModule` → `/fhir/*` | — |
| `health` | Liveness probe | `HealthModule` → `/health` | — |
| `hesn-gateway` | KSA HESN reportable-diseases push | `KsaModule.hesn` | `HESN_CLIENT_ID/SECRET` |
| `heygen-token` | HeyGen avatar session token mint | `AiModule.heygenToken` | `HEYGEN_API_KEY` |
| `lab-result-receiver` | Analyzer HL7/ASTM ingest | `LabModule.receiveResult` | HMAC secret per analyzer |
| `mfa-*` (4 fns) | MFA lifecycle | `AuthModule.mfa*` | — |
| `nafath-gateway` | Saudi Nafath ID verification | `KsaModule.nafath` | `NAFATH_CLIENT_ID/SECRET`, cert |
| `nphies-gateway` | NPHIES eligibility, pre-auth, claim | `InsuranceModule.nphies*` | `NPHIES_CERT`, `NPHIES_KEY`, `NPHIES_ENV` |
| `pacs-gateway` | DICOM proxy to PACS server | `RadiologyModule.pacs` | Per-server creds |
| `pacs-settings` | CRUD for `pacs_servers` | `RadiologyModule.pacsSettings` | — |
| `payment-create` | HyperPay/Tap/STCPay checkout session | `PaymentsModule.create` | Provider keys |
| `payment-status` | Poll gateway status | `PaymentsModule.status` | Provider keys |
| `payment-webhook` | Gateway callbacks | `PaymentsModule.webhook` | Signing secrets |
| `post-daily-room-charges` | Cron: insert IPD daily charges | `IpdModule.dailyChargesCron` (daily 00:15) | — |
| `sehhaty-*` (2 fns) | KSA Sehhaty sync | `KsaModule.sehhaty*` | `SEHHATY_KEY` |
| `send-appointment-reminders` | Cron reminders | `NotificationsModule.reminderCron` | Twilio / WhatsApp |
| `send-push-notification` | FCM/APNs push | `NotificationsModule.push` | FCM key |
| `send-sms` | SMS relay | `NotificationsModule.sms` | Twilio / Unifonic |
| `setup-demo-users`, `setup-warehouse-demo`, `seed-blood-bank` | Seed jobs | `SeedModule` (CLI) | — |
| `tatmeen-gateway` | KSA drug track-and-trace | `KsaModule.tatmeen` | `TATMEEN_KEY`, cert |
| `test-email-config` | SMTP smoke test | `AdminModule.testEmail` | SMTP creds |
| `wasfaty-gateway` | KSA MOH e-prescription | `KsaModule.wasfaty` | `WASFATY_KEY` |
| `whatsapp-dispatch` | WhatsApp Business Cloud API | `NotificationsModule.whatsapp` | `WA_TOKEN`, `WA_PHONE_ID` |
| `zatca-einvoice` | ZATCA Phase 1 simplified | `ZatcaModule.phase1` | KSA VAT + private key |
| `zatca-phase2` | ZATCA Phase 2 clearance/reporting | `ZatcaModule.phase2` | Same |

**Shared code** (`supabase/functions/_shared/*.ts`) ports to `src/common/` in the Nest project: `cors`, `auth`, `validate`, `error-reporter`, `logger`, `payment-gateways`, `gateway-helper`.

---

## 8. Realtime

Channels currently in use (search: `.channel(`):
- `queue:{branch_id}` — OPD token board
- `lab_orders:{branch_id}` — result publication
- `invoices:{organization_id}` — payment transitions (triggers refetch)
- `appointments:{doctor_id}` — schedule changes
- `ipd_alerts:{branch_id}` — critical vitals, code-blue

Self-host replacement:
1. Add `LISTEN`/`NOTIFY` on triggers: `PERFORM pg_notify('queue', json_build_object(...)::text);`
2. NestJS gateway (`@nestjs/websockets` + Socket.IO) subscribes to `pg_notify` via a dedicated `pg` client, fans out to rooms named identically.
3. Frontend `supabase.channel(...)` compat shim wraps `socket.io-client`.

---

## 9. Storage

Supabase buckets (search: `.storage.from(`):
- `patient-documents` (private)
- `patient-avatars` (public read)
- `organization-logos` (public)
- `employee-documents` (private)
- `radiology-images` (private, large)
- `lab-attachments` (private)
- `signatures` (private)
- `zatca-invoices` (private, WORM-like)
- `nphies-attachments` (private)

MinIO plan:
- Bucket-per-tenant policy: `org-<org_uuid>` with sub-prefixes per bucket name.
- Presigned URLs with 15-min TTL for downloads; direct-to-MinIO uploads via presigned PUT.
- Server-side encryption at rest (SSE-S3).

---

## 10. KSA Integrations — the compliance surface

### 10.1 NPHIES (National Platform for Health Information Exchange Services)
FHIR R4 over HTTPS with mTLS. Bundle profiles: `Coverage`, `CoverageEligibilityRequest/Response`, `Claim`, `ClaimResponse`, `PreAuthorization`.

Flow:
1. Front-desk clicks "Check eligibility" → `nphies-gateway` posts `CoverageEligibilityRequest` → logs to `nphies_eligibility_logs`.
2. Pre-auth: `insurance_claims.pre_auth_status` cycles pending → approved/denied.
3. Claim: `insurance_claims` + `claim_items` bundled to `Claim`; response parsed into remittance.
4. Client-side scrubber (`src/lib/claimScrubber.ts`) catches obvious rejections before submit.

### 10.2 ZATCA (Fatoora)
- **Phase 1** (Simplified e-invoicing): every `invoices` INSERT generates QR TLV + SHA-256 hash; embedded in PDF & the `invoices.zatca_qr` field.
- **Phase 2** (Integration): batch clearance API. Signed XML (UBL 2.1) with device CSID cert. Hash chain: `previous_invoice_hash → invoice_hash → next`. Mandatory chaining means gaps break audit.
- Cert lifecycle: onboarding → CSID → PCSID renewal every 12 months.

### 10.3 Wasfaty
Government e-prescription. `wasfaty-gateway` posts prescription; `wasfaty_prescriptions` mirrors status. Only Wasfaty-registered doctors can dispense controlled items.

### 10.4 Tatmeen / RSD
Drug serialization track-and-trace. GTIN + serial + batch + expiry on every pharmacy inbound/outbound event → `tatmeen_transactions`.

### 10.5 Nafath
National single sign-on. Patient portal + staff optional MFA. TOTP-style push with 60s window; response JWT verified against Nafath public JWKS.

### 10.6 Sehhaty
Citizen app integration: referrals, sick leaves, vaccination certificates flow both ways. `sehhaty_sync_log` audits.

### 10.7 HESN
Notifiable-disease reporting (measles, TB, COVID, meningitis…). Triggered from lab result confirmation or ER diagnosis code.

### 10.8 Communications
- **WhatsApp Business Cloud API** — templated messages (appointment, reminder, invoice, result-ready).
- **SMS** — Unifonic primary, Twilio fallback.
- **Push** — FCM (Android) + APNs (iOS) via `send-push-notification`.
- **Email** — SMTP configurable per org (`organization_settings.smtp_*`).

---

## 11. Migration Runbook (Supabase → Self-Host)

### Phase A — Environment
1. Provision VPS (recommended: 8 vCPU / 32 GB RAM / 500 GB NVMe for small hospital; scale linearly).
2. Install Docker + Docker Compose.
3. Boot the stack from `healthos-api.zip` scaffold (already delivered):
   - `postgres:15` + `pgbouncer`
   - `redis:7`
   - `minio` + `mc`
   - `api` (NestJS)
   - `nginx` (TLS via Certbot)

### Phase B — Schema
1. `pg_dump --schema-only --no-owner --no-privileges` from Supabase → `schema.sql`.
2. Strip Supabase-specific bits: `auth.*` schema, `storage.*`, `realtime.*`, `supabase_functions.*`, `vault.*`, `pgsodium`, `graphql`.
3. Prepend `000_supabase_compat.sql` (provided) that recreates `auth.uid()` / `auth.jwt()` reading GUCs.
4. `psql < schema.sql` on the new DB.

### Phase C — Data
1. `pg_dump --data-only --schema=public` → `data.sql`.
2. Export `auth.users` separately: `\copy (select id,email,encrypted_password,phone,raw_user_meta_data,created_at,updated_at from auth.users) to 'users.csv' csv header`.
3. Load `data.sql` first, then insert users into `public.users`.
4. Migrate storage: `mc mirror supabase/<bucket> local/<org>/<bucket>`.

### Phase D — App cutover
1. Update `src/integrations/supabase/client.ts` → point at the compat shim's base URL.
2. Frontend deployment unchanged (Vite build, static hosting or via Nginx).
3. DNS cutover with 5-min TTL rollback plan.

### Phase E — Validation
Run smoke suite from `tests/e2e/critical-path/*.spec.ts`:
- OPD walk-in to bill
- IPD admit to discharge
- Lab order to result
- Pharmacy POS checkout
- GRN to stock
- Daily closing
- NPHIES claim
- ZATCA invoice
- Payroll run to post

Every one of these exercises trigger-based posting; if any fails, the trigger set didn't port correctly.

---

## 12. Deployment Topology (recommended)

```yaml
# docker-compose.yml (abridged)
services:
  postgres:
    image: postgres:15-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: pg_isready
  pgbouncer:
    image: edoburu/pgbouncer
    depends_on: [postgres]
  redis:
    image: redis:7-alpine
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    volumes: [miniodata:/data]
  api:
    build: ./api
    env_file: .env
    depends_on: [pgbouncer, redis, minio]
    deploy: {replicas: 2}
  nginx:
    image: nginx:alpine
    ports: ["80:80","443:443"]
    volumes: [./nginx.conf:/etc/nginx/nginx.conf, certbot-etc:/etc/letsencrypt]
```

Backups:
- `pg_dump` nightly → S3-compatible cold storage (encrypted with age).
- MinIO versioning + weekly `mc mirror` off-site.
- Retain 30 daily + 12 weekly + 12 monthly.

Observability:
- Prometheus + Grafana (Postgres exporter, Node exporter, Nest metrics via `@willsoto/nestjs-prometheus`).
- Loki for logs; OpenTelemetry traces to Tempo.
- Alerts: DB replication lag, disk >80 %, 5xx rate, failed NPHIES/ZATCA calls, circuit-breaker open (`gateway_circuit_state`).

---

## 13. Security & Compliance

### 13.1 HIPAA controls
- **Access control** — RLS + `has_role` + department scoping.
- **PHI masking** — `src/lib/phiMasking.ts` (last-4 of national ID, name initials for cross-org viewers).
- **Audit** — every PHI read logged to `audit_logs` and (for portal patients) `phi_access_log`.
- **Session timeouts** — `useIdleTimeout` 15 min default, configurable per org.
- **Breach reporting** — `hipaa_breach_incidents` workflow with 60-day notification clock.
- **Training** — `hipaa_training_records` per employee, blocks module access if expired.
- **BAA** — `business_associate_agreements` for vendors.

### 13.2 Application security
- CSP + HSTS + X-Frame-Options at Nginx.
- CSRF via double-submit cookie for cookie-auth endpoints.
- Rate limits: 60 rpm anon, 600 rpm authed, 5/min for auth endpoints.
- DOMPurify on all user-generated HTML (report templates, letters).
- Circuit breakers around every KSA integration (`gateway_circuit_state`) — open on 5 consecutive 5xx, half-open after 60s.
- Idempotency keys for money-moving edge functions (`gateway_idempotency`).

### 13.3 Data lifecycle
- Soft-delete with `deleted_at` on patient-facing tables.
- Hard-purge scheduler (`data-retention-purge`) per org retention policy (default 10 y clinical, 7 y financial).
- Right-to-erasure workflow for portal patients (excludes legally-retained clinical records).

---

## 14. Known Sharp Edges (don't repeat these bugs)

1. **Never `.single()`** — use `.maybeSingle()` or `data?.[0]`.
2. **Empty-string UUIDs** — map `""` → `null` before insert/update.
3. **Manual JS joins** for `pharmacy_pos_items`, `expenses`, `goods_received_notes`, `imaging_orders` (no FK).
4. **1000-row cap** — use `fetchAllRows` recursive helper for reports.
5. **Account category case** — always `.toLowerCase()`.
6. **`payroll_runs` has no `updated_at`** — omit in updates.
7. **CHECK constraints must be immutable** — use validation triggers for time-based rules.
8. **Do not touch `types.ts`** — regenerated from live schema.
9. **JazzCash/EasyPaisa** post to Bank `1010`, not cash `1000`.
10. **Fiscal year lock** — no journal insert allowed if `fiscal_years.is_locked = true` covers the entry date.

---

## 15. Glossary

- **COA** — Chart of Accounts (4-level: Type → Group → Sub-group → Account).
- **CPV/CRV/BPV/BRV/JV** — Cash-Payment/Cash-Receipt/Bank-Payment/Bank-Receipt/Journal Voucher.
- **NPHIES** — Saudi FHIR-based insurance clearinghouse.
- **ZATCA** — Zakat, Tax & Customs Authority (Saudi VAT + e-invoicing).
- **Wasfaty** — Saudi MOH e-prescription platform.
- **Tatmeen / RSD** — Saudi drug track-and-trace.
- **Nafath** — Saudi digital identity SSO.
- **Sehhaty** — Saudi citizen health app.
- **HESN** — Saudi notifiable-disease reporting.
- **MLC** — Medico-Legal Case.
- **PACS** — Picture Archiving and Communication System (DICOM).
- **FIFO** — First-In-First-Out inventory valuation.
- **RLS** — Row-Level Security (Postgres).
- **PHI** — Protected Health Information.

---

*End of BRAIN.md — see HEALTHOS.md for the module-by-module product encyclopedia.*
