# HealthOS 24 — HEALTHOS.md
### Product & Module Encyclopedia
Version 1.0 · Companion to `BRAIN.md`

For each module: **Purpose · Routes · Roles · Tables · Workflow · KSA specifics · Dependencies**.

---

## Table of Contents
0. Platform Shell & Cross-cutting
1. Patient Registration & Portal
2. OPD (Outpatient)
3. IPD (Inpatient)
4. Emergency / ER
5. Surgery / OT
6. Lab
7. Radiology / Imaging
8. Pharmacy
9. Warehouse / WMS / Procurement
10. Blood Bank
11. Dental
12. Dialysis
13. Ambulance & Mobile Units
14. Home Care
15. Telemedicine
16. Immunization / Vaccination
17. HR
18. Payroll
19. Finance & Accounting
20. Billing
21. Insurance & NPHIES
22. ZATCA E-invoicing
23. Assets & Maintenance
24. Housekeeping
25. Diet & Kitchen
26. Donations & Campaigns
27. Tabeebi AI
28. Kiosk & Public Queue
29. Notifications
30. Reports & Analytics
31. Super Admin / Multi-org
32. Mobile Apps (Doctor / Nurse / Patient / Staff)
33. Offline Sync
34. Compliance & HIPAA

---

## 0. Platform Shell & Cross-cutting

### Purpose
The shell that houses every module — org/branch scoping, i18n, theming, auth, navigation.

### Key surfaces
- `src/layouts/DashboardLayout.tsx` — main authenticated shell.
- `src/layouts/AuthLayout.tsx` — login/signup pages.
- `src/layouts/MobileLayout.tsx` — Capacitor mobile shell.
- `src/layouts/PortalLayout.tsx` — patient portal.
- `src/contexts/AuthContext.tsx` — auth + profile + roles.
- `src/contexts/CountryConfigContext.tsx` — KSA-aware defaults (currency SAR, Hijri toggle, phone format).
- `src/lib/i18n/index.ts` — EN / AR / UR dictionaries; RTL for AR/UR.
- `src/hooks/useOrganizationModules.ts` — per-org module toggles.

### Facility-type adaptivity
`organizations.facility_type` ∈ {`hospital`,`clinic`,`polyclinic`,`daycare`}:
- **Clinic** — hides IPD, OT, Blood Bank, Dialysis, Kitchen, Housekeeping. HR simplified. Finance keeps everything.
- **Polyclinic** — like clinic + multi-specialty OPD.
- **Daycare** — adds surgery but no bed management.
- **Hospital** — full surface.

Menu filtering: `src/lib/facility-type-filter.ts`.

### Trilingual rule (project-wide)
Every user-visible string must have EN / AR / UR translations. RTL layout for AR/UR uses `flex-row-reverse` + `text-end` (bypasses a Radix `dir` bug).

---

## 1. Patient Registration & Portal

### Purpose
Master patient record + self-service portal.

### Routes
`/app/patients/*`, `/portal/*`

### Roles
Reception, doctor, nurse, admin. Portal: patient.

### Tables
`patients`, `patient_medical_history`, `patient_consents`, `patient_insurance`, `patient_attendants`, `patient_deposits`, `patient_portal_accounts`, `patient_devices`, `custom_fields`, `custom_field_values`.

### Workflow
1. Reception opens **New Patient** wizard: identity → contact → insurance → consents.
2. Adult vs **Child + Guardian**: `gender = 'child'` enforces mandatory guardian fields.
3. Saudi ID validation (`src/lib/validations/saudiId.ts`): 10 digits starting `1` (citizen) or `2` (iqama).
4. MRN generated per branch prefix (`branch_settings.mrn_prefix`).
5. Portal invitation via WhatsApp/SMS/email; patient sets password.

### KSA specifics
- Nafath SSO available for portal login.
- Hijri DOB accepted; stored as Gregorian, displayed dual.
- Saudi ID / Iqama first-class identifier.

### Dependencies
Notifications, Insurance (NPHIES eligibility optional at registration).

---

## 2. OPD (Outpatient)

### Purpose
Walk-in registration, appointments, token queue, doctor consultation, prescription, checkout.

### Routes
`/app/opd/*`, `/app/appointments/*`, `/app/reception/*`

### Roles
Reception, cashier, doctor, nurse.

### Tables
`appointments`, `consultations`, `opd_departments`, `opd_department_specializations`, `doctor_schedules`, `queue_display_configs`, `invoices` (`OPD-*` prefix), `prescriptions`, `prescription_items`.

### Workflow — Walk-in (4-step wizard, `OPDWalkInPage`)
1. **Patient** — pick existing or quick-create.
2. **Doctor & Service** — select department → doctor → service_type.
3. **Payment (mandatory)** — generates invoice + payment record in a single atomic transaction; token issued.
4. **Confirmation** — printable token, WhatsApp confirmation.

Doctor calls patient → **Consultation**: vitals (nurse-recorded), history, exam, diagnosis (ICD-10/11), Rx, orders (lab/imaging), follow-up.

Nurses can record vitals **before** payment; doctors are payment-gated.

### Token queue
- `OPD Token Display` (`/queue/*`) — public URL per branch, auto-paginated for >12 tokens, 1:2 layout split (current : upcoming).
- Realtime updates via `queue:{branch_id}` channel.

### Ordering
- Lab / imaging orders created from consultation link to the same `invoice_id` **before** payment to avoid race conditions.
- `useOutstandingInvoices` — patient sees unbilled orders in the checkout flow.

### KSA specifics
- Wasfaty pushes prescriptions for eligible drugs.
- Sehhaty sick leave issued from consultation → `sehhaty_sick_leaves`.

---

## 3. IPD (Inpatient)

### Purpose
Admission, ward/bed management, daily rounds, medications, transfers, discharge.

### Routes
`/app/ipd/*`

### Roles
Doctor, nurse, admin, cashier.

### Tables
`admissions`, `beds`, `wards`, `bed_transfers`, `ipd_bed_types`, `ipd_bed_features`, `ipd_ward_types`, `ipd_floors`, `ipd_charges`, `ipd_daily_charge_logs`, `ipd_medications`, `ipd_vitals`, `daily_rounds`, `discharge_summaries`, `discharge_checklist_items`, `nursing_notes`, `care_plans`, `medication_administration`, `patient_attendants`, `birth_records`, `death_records`.

### Workflow
1. **Admission** (`AdmissionFormPage`): patient → ward → bed → **attending doctor (mandatory)** → **procedure (mandatory)** → deposit.
2. Deposit posts to `LIA-DEP-001` (see BRAIN §5.2) and links `billing_session_id` for daily closing.
3. Daily:
   - `post-daily-room-charges` cron inserts bed + nursing + service into `ipd_charges` (off-ledger; `is_billed=false`).
   - Ward medication administration auto-creates `ipd_charges`.
   - Nurses record vitals & rounds; doctor writes `daily_rounds`.
4. **Bed transfer** — updates `admissions.bed_id`, creates `bed_transfers` audit row, syncs charge type.
5. **Discharge** (`DoctorDischargePage` → `DischargeFormPage`):
   - Doctor writes `discharge_summaries` + prescriptions.
   - Discharge checklist auto-populated from template.
   - Final invoice created → all pending `ipd_charges` flipped `is_billed=true` → journal entry recognizes revenue.
6. Birth / death recorded in the specialized tables; MOH notification.

### KSA specifics
- Ministry notifications for birth/death via HESN.
- Hijri discharge date printed on summary.

---

## 4. Emergency / ER

### Purpose
Triage-first ER intake, trauma, MLC.

### Routes
`/app/emergency/*`

### Tables
`emergency_registrations`, `er_treatments`, `trauma_assessments`, `mlc_records`, `config_triage_levels`, `config_er_zones`, `config_arrival_modes`.

### Workflow
1. Ambulance / walk-in arrival → triage (`config_triage_levels`: 1=resuscitation … 5=non-urgent).
2. Zone assignment (`config_er_zones`).
3. Trauma assessment if applicable; GCS, RTS scoring.
4. MLC: police intimation, chain-of-custody, statutory form generation.
5. Transitions: discharge home / admit to IPD / OT / death → death record.

### KSA specifics
- HESN reporting for notifiable presentations.
- Nafath ID capture on MLC.

---

## 5. Surgery / OT

### Purpose
End-to-end surgical workflow: request → schedule → pre-op → intra-op → post-op → billing.

### Routes
`/app/ot/*`

### Tables
`surgery_requests`, `surgeries`, `surgery_team_members`, `surgery_consents`, `surgery_consumables`, `surgery_medications`, `surgery_reschedule_requests`, `surgical_safety_checklists`, `pre_op_assessments`, `pre_anesthesia_assessments`, `anesthesia_records`, `intra_op_notes`, `post_op_orders`, `post_op_recovery`, `ot_rooms`, `surgeon_fee_templates`, `config_asa_classes`, `config_airway_devices`, `config_surgical_procedures`, `config_surgical_positions`, `config_who_checklist_items`, `config_anesthesia_types`.

### Workflow
1. Doctor raises `surgery_request` → OT coordinator schedules.
2. Pre-op: assessment, anesthesia clearance, consent, WHO Sign-in.
3. Intra-op: WHO Time-out; anesthesia timeline; consumables logged (FIFO deduction on save).
4. WHO Sign-out; post-op recovery vitals until PACU discharge.
5. Post-op orders → IPD medications / IV / diet.
6. Completion trigger posts revenue + surgeon fee to `doctor_earnings` per `surgeon_fee_templates`.

### KSA specifics
- Consumables barcodes checked against Tatmeen where applicable.

---

## 6. Lab

### Purpose
Test catalog, ordering, specimen tracking, analyzer integration, result reporting.

### Routes
`/app/lab/*`

### Tables
`lab_orders`, `lab_order_items`, `lab_test_templates`, `lab_test_panels`, `lab_test_categories`, `lab_settings`, `lab_analyzers`, `lab_analyzer_catalog`, `lab_analyzer_test_mappings`, `lab_result_imports`, `lab_critical_values`, `lab_critical_value_notifications`.

### Workflow — Reporting Lifecycle
`Ordered → Specimen Collected → In Progress → Reported (Save) → Submitted → Published (Verified)`

- **Save** — draft result (tech).
- **Submit** — sent to pathologist for verification.
- **Publish** — released to doctor & patient; portal notification; critical values create `lab_critical_value_notifications` with call-back audit.

### Specimen
Format `{PREFIX}-{YYMMDD}-{SEQUENCE}`. On `Collected` status, patient/test fields lock.

### Analyzer integration
`lab-result-receiver` edge fn accepts HL7 v2 (ORU^R01) or ASTM E1381. HMAC signed per analyzer. Bidirectional: LIS pushes orders in ORM^O01 when analyzer supports.

### Templates
Match priority: `service_type_id` → exact `test_name` → substring.

### Realtime
`lab_orders:{branch_id}` triggers auto-refetch on doctor's screen.

---

## 7. Radiology / Imaging

### Purpose
Modality catalog, order → schedule → perform → PACS → report → deliver.

### Routes
`/app/radiology/*`

### Tables
`imaging_orders`, `imaging_results`, `imaging_modalities`, `imaging_procedures`, `imaging_report_templates`, `imaging_modality_pacs_mappings`, `pacs_servers`, `radiology_device_catalog`.

### Lifecycle
`Pending → Scheduled → In Progress → Performed → Reported → Verified → Delivered`

### PACS
- One or more `pacs_servers` per branch.
- `pacs-gateway` proxies WADO-RS / QIDO-RS / STOW-RS.
- DICOM viewer embedded (Cornerstone) reads via presigned URLs.

### Reporting
- Structured templates per modality/procedure.
- Voice-to-text via ElevenLabs → DeepSeek cleanup (Tabeebi assist).
- CD/DVD burn queue + WhatsApp delivery link.

### Note
`imaging_orders` has **no FK to `service_types`** — do JS joins.

---

## 8. Pharmacy

### Purpose
Retail POS, inpatient dispensing, inventory, warehouse mini-app, Wasfaty.

### Routes
`/app/pharmacy/*`

### Tables
`medicines`, `medicine_categories`, `medicine_inventory`, `medicine_rack_assignments`, `medicine_safety_limits`, `drug_interactions`, `prescriptions`, `prescription_items`, `pharmacy_pos_sessions`, `pharmacy_pos_transactions`, `pharmacy_pos_items`, `pharmacy_pos_payments`, `pharmacy_pos_held_transactions`, `pharmacy_returns`, `pharmacy_return_items`, `pharmacy_patient_credits`, `pharmacy_stock_movements`, `pharmacy_settings`, `wasfaty_prescriptions`, `stores`, `store_racks`, `store_stock_transfers`.

### POS
- Pharmacist opens `pharmacy_pos_sessions` (dedicated session table — separate from clinical `billing_sessions`).
- Scan / search medicine → cart → payment(s) (split supported).
- **Held transactions** — park & resume.
- Barcode → batch → FIFO layer selection.
- Auto COGS journal: DR `EXP-COGS-001`, CR `INV-001`; revenue DR cash/bank CR `REV-PHARM`.
- Returns: RTV or patient return; reverses stock + journal.
- **Patient credits**: `pharmacy_patient_credits` for overpayments.
- Sessions close daily → contributes to `daily_closings`.

### Inventory
- Multi-store (`stores`), rack-level assignment.
- Reorder alerts (`useReorderAlerts`).
- Safety limits per medicine (min stock, max dose, controlled flag).

### KSA specifics
- Wasfaty inbound prescriptions dispensed here; status synced.
- Tatmeen serialization at receipt & dispense.

### Sharp edges
- Do **manual JS joins** for `pharmacy_pos_items` ↔ `medicines`.
- Use `fetchAllRows` for reports (bypasses 1000-row cap).

---

## 9. Warehouse / WMS / Procurement

### Purpose
Standalone WMS for larger facilities: zones, bins, racks, put-away, picking, packing, shipping, cycle counts. Procurement chain PR → PO → GRN → payment.

### Routes
`/app/inventory/*`

### Tables
`warehouse_zones`, `warehouse_bins`, `warehouse_orders`, `warehouse_order_items`, `inventory_items`, `inventory_categories`, `inventory_stock`, `inventory_bin_assignments`, `dock_appointments`, `pick_lists`, `pick_list_items`, `packing_slips`, `packing_slip_items`, `shipments`, `shipment_tracking_events`, `putaway_tasks`, `stock_adjustments`, `cycle_counts`, `cycle_count_items`, `stock_requisitions`, `requisition_items`, `purchase_requests`, `purchase_request_items`, `purchase_orders`, `purchase_order_items`, `goods_received_notes`, `grn_items`, `return_to_vendor`, `rtv_items`, `vendors`, `vendor_documents`, `vendor_payments`, `item_vendor_mapping`.

### Procurement chain
1. Ward/dept raises **Stock Requisition**.
2. Warehouse issues from stock **or** raises **Purchase Request**.
3. Manager approves → **Purchase Order** to vendor.
4. Goods arrive → **GRN** (verify qty, batch, expiry) → atomic RPC upserts `medicine_inventory` and posts DR `INV-001` / CR `AP-001`.
5. GRN auto-transitions linked requisition to `issued`.
6. **RTV** if quality reject.
7. `vendor_payments` clears AP; posts DR `AP-001` / CR bank.

### WMS operations
- Dock appointment → receive → putaway task assigned to picker.
- Sales/transfer → pick list → pack slip → shipment (carrier tracking).
- Cycle counts vs full physical; variance → `stock_adjustments`.

### Note
Warehouse module **blocks clinical navigation paths** when the user is scoped to a warehouse role — intentional isolation.

---

## 10. Blood Bank

### Purpose
Donor → donation → screening → inventory → cross-match → transfusion → reaction.

### Routes
`/app/blood-bank/*`

### Tables
`blood_donors`, `blood_donations`, `blood_inventory`, `blood_requests`, `cross_match_tests`, `blood_transfusions`, `transfusion_reactions`, `donation_campaigns`, `donation_recurring_schedules`, `donation_reminders`, `cold_chain_logs`.

### Workflow
1. Donor registration + eligibility screening.
2. Donation → mandatory tests (HIV, HBsAg, HCV, syphilis, malaria) → 35-day default shelf life.
3. Request from OPD/IPD/Surgery matches by ABO/Rh + cross-match.
4. Issue → transfuse → observe → record any reaction.
5. Cold chain audit logs at each move.
6. Campaigns: recruit donors; reminder scheduler (`useDonorRecall`).

### KSA specifics
- Statutory reporting of adverse reactions.

---

## 11. Dental

### Purpose
Interactive 3D tooth chart, per-surface procedures, imaging.

### Routes
`/app/dental/*`

### Tables
`dental_charts`, `dental_procedures`, `dental_treatments`, `dental_images`.

### Notes
- 3D tooth chart via `@react-three/fiber` — per-surface mapping (MOD, buccal, lingual, etc.).
- Treatments link to `service_types` for billing.

---

## 12. Dialysis

### Purpose
Machine roster, patient schedule, session run.

### Routes
`/app/dialysis/*`

### Tables
`dialysis_machines`, `dialysis_patients`, `dialysis_schedules`, `dialysis_sessions`, `dialysis_vitals`.

### Workflow
- Decoupled nurse/doctor workflow.
- Session ID format `DS-YYYYMMDD-XXX`.
- Vitals every 30 min during run; alerts on out-of-range.

---

## 13. Ambulance & Mobile Units

### Purpose
Fleet + crew, route stops, en-route alerts, mobile clinic visits.

### Routes
`/app/mobile-units/*`

### Tables
`mobile_units`, `mobile_unit_crew`, `mobile_routes`, `mobile_route_stops`, `mobile_visits`, `ambulance_alerts`.

### Workflow
Dispatcher assigns unit; crew updates status en route; ER pre-notification via `ambulance_alerts`.

---

## 14. Home Care

### Routes
`/app/home-care/*`

### Tables
`home_visits`, `home_visit_tasks`.

Nurse task lists, geo check-in on arrival (Capacitor mobile).

---

## 15. Telemedicine

### Routes
`/app/telemedicine/*`

### Tables
`telemedicine_sessions`, `telemedicine_consents`.

Video via WebRTC (LiveKit or Daily.co); recording gated on `telemedicine_consents`. Session artifacts stored encrypted in MinIO.

---

## 16. Immunization / Vaccination

### Routes
`/app/immunizations/*`

### Tables
`immunizations`, `immunization_schedules`, `vaccine_lots`, `vaccination_records`.

Cold-chain enforced via `cold_chain_logs`. Sehhaty certificate issuance on completion of a series.

---

## 17. HR

### Purpose
Full employee lifecycle from job posting to exit.

### Routes
`/app/hr/*`

### Sub-modules & routes
- Recruitment: `/hr/recruitment/*` (job_openings, job_applications, interviews, offer_letters).
- Onboarding: `/hr/OnboardingPage` (`onboarding_templates`).
- Directory: `EmployeeDirectoryPage`, `EmployeeFormPage`, `EmployeeDetailPage`.
- Doctors / Nurses / Paramedical / Support / Visiting: specialized lists.
- Contracts, licenses, promotions, transfers, salary revisions, grievances, disciplinary actions.
- Attendance: `/hr/attendance/*` — biometric devices, corrections, overtime.
- Leaves: `/hr/leaves/*` — types, balances, requests, encashment, compensatory offs.
- Compliance: `/hr/compliance/*` — HIPAA training, medical fitness, licenses.
- Exit: `/hr/exit/*` — resignation → clearance → final settlement → interview.
- Letters: `hr_issued_letters` + templates (`hr_letter_templates`).
- Training: `training_programs`, `training_enrollments`.
- Safety: `safety_incidents`, `incident_reports`.
- Org chart, roster publish, shift assignments, on-call schedules, weekly offs, holidays.

### KSA specifics
- **Gratuity** (End-of-Service Benefit) auto-calc per Saudi labor law: <5y = ½ month × years, ≥5y = ½ month × first 5y + full month × subsequent years, on last basic salary.
- Iqama expiry alerts.
- GOSI contribution tracked.

### Sharp edges
- `payroll_runs` has **no `updated_at`** — omit in updates.
- Resignation auto-initiates clearance via `employee_clearance` rows from `clearance_template_items`.

---

## 18. Payroll

### Routes
`/app/hr/payroll/*`

### Tables
`payroll_runs`, `payroll_entries`, `salary_components`, `salary_structures`, `employee_salaries`, `loan_deductions`, `leave_encashments`, `final_settlements`, `tax_slabs`.

### Engine
Two-pass:
1. Compute basic-based components (HRA, transport, etc.).
2. Compute gross → gross-based deductions (tax, GOSI, PF).

### Workflow
Draft → Approved → Posted (immutable). Posting triggers journal DR payroll expense CR bank + statutory liabilities.

---

## 19. Finance & Accounting

### Purpose
CFO-grade GL, financial reports, vouchers, banks, budgets, fiscal control.

### Routes
`/app/accounts/*`

### Chart of Accounts (4-level)
Type (Asset / Liability / Equity / Revenue / Expense) → Group → Sub-group → Account. Only level 4 receives journal lines.

### Sub-features
- Journal entries + lines (level-4 only; `entry_number` empty on insert, trigger assigns).
- Vouchers: CPV, CRV, BPV, BRV, JV — Posted status immutable.
- Bank accounts + transactions + reconciliation.
- Expense management (routing rules: petty_cash / refund / staff_advance dynamically; else `5500`).
- Fixed assets & depreciation (`useDepreciationPostingV2` monthly).
- Cost centers + department P&L + consolidated P&L.
- Fiscal years (lock prevents post to closed period).
- Budgets + variance.
- PDC register (post-dated cheques).
- Patient deposits ledger.
- AR / AP + aging.
- Recurring journal templates.
- Reports: P&L (detailed / consolidated / cost-center / dept), Balance Sheet, Cash Flow, Trial Balance, GL, VAT Return.

### Sharp edges
- `account_types.category` **lowercase**; queries must `.toLowerCase()`.
- Daily closing blocked if any open `billing_sessions`.
- Digital wallets (JazzCash, EasyPaisa, STC Pay) → Bank `1010`, not cash.
- Doctor earnings unified via `trg_unified_doctor_earnings`.

---

## 20. Billing

### Routes
`/app/billing/*`

### Tables
`invoices`, `invoice_items`, `billing_sessions`, `billing_tax_slabs`, `credit_notes`, `payments`, `payment_methods`, `payment_gateway_transactions`.

### Concepts
- **Billing sessions** — strict concurrency: one open session per (user, counter). Enforced by unique partial index.
- **Split payments** — supported at OPD & IPD; each `payment_methods` row = one journal line.
- **Total Settled** = Deposit Applied + Previous Cash + Current Payment.
- **Pending charges** — invoices auto-load unbilled lab/imaging/appointments for the patient.
- **Credit notes** — reverse invoice; auto-journal.
- Tax slabs: HR uses `tax_slabs`, invoicing uses `billing_tax_slabs` (KSA VAT 15%).

### Payment gateways
HyperPay, Tap, STC Pay. Idempotent via `gateway_idempotency`. Circuit breaker via `gateway_circuit_state`.

---

## 21. Insurance & NPHIES

### Routes
`/app/insurance/*`

### Tables
`insurance_companies`, `insurance_plans`, `patient_insurance`, `insurance_claims`, `claim_items`, `claim_attachments`, `nphies_eligibility_logs`, `nphies_transaction_logs`, `medical_codes`.

### Workflow
1. Attach insurance at registration.
2. Optional pre-visit eligibility (`nphies-gateway`).
3. Service delivery → claim scrubber (client-side) → NPHIES submission.
4. Pre-auth for high-cost items.
5. Remittance parse → apply to invoice → variance to write-off/adjustment.

### KSA specifics
- ICD-10-AM + SBS coding via `medical_codes`.
- Mandatory IPD eligibility check before admission.

---

## 22. ZATCA E-invoicing

### Phase 1 (Simplified)
Every invoice generates TLV QR + SHA-256 hash on insert. Embedded in printable PDF.

### Phase 2 (Integration)
- UBL 2.1 XML signed with device CSID cert.
- Two submission modes: **Standard** (clearance before customer, B2B) and **Simplified** (report within 24 h, B2C).
- Mandatory **hash chaining**: each invoice hash includes previous hash. Gaps break audit.
- Cert lifecycle: onboarding (compliance cert) → CSID → PCSID renewed yearly.

### Tables
Extensions on `invoices`: `zatca_qr`, `zatca_hash`, `zatca_previous_hash`, `zatca_uuid`, `zatca_status`, `zatca_cleared_xml`.

### Edge fns
`zatca-einvoice` (Phase 1), `zatca-phase2` (Phase 2 clearance/reporting).

---

## 23. Assets & Maintenance

### Routes
`/app/assets/*`

### Tables
`assets`, `fixed_assets`, `maintenance_records`.

Depreciation posts monthly (straight-line or WDV per asset).

---

## 24. Housekeeping

### Routes
`/app/housekeeping/*`

### Tables
`housekeeping_tasks`, `housekeeping_inspections`, `bed_issue_logs`.

Auto-tasks on IPD discharge; inspection sign-off releases bed to available pool.

---

## 25. Diet & Kitchen

### Routes
`/app/kitchen/*`, `/app/ipd/DietManagementPage`

### Tables
`diet_charts`, `menu_items`, `config_diet_types`.

Per-patient diet chart driven by dietician; kitchen prints tray labels per meal window.

---

## 26. Donations & Campaigns

### Routes
`/app/donations/*`

### Tables
`donation_campaigns`, `donation_recurring_schedules`, `donation_reminders`, `financial_donations`, `financial_donors`, plus blood-bank donations above.

Public campaign pages (`/public/campaigns/*`) support one-off + recurring financial donations via payment gateways.

---

## 27. Tabeebi AI

### Purpose
Clinical assistant: voice consultation transcript, note drafting, drug-interaction warnings, ICD suggestion.

### Routes
`/app/ai/*`

### Tables
`ai_conversations`, `ai_suggestions_log`, `medical_knowledge`, `clinical_alerts`, `drug_interactions`.

### Stack
- **Voice**: ElevenLabs WebRTC (front-end).
- **LLM**: DeepSeek (primary), OpenAI (fallback), routed via `ai-assistant` edge fn.
- **Avatar**: HeyGen streaming (token via `heygen-token`).
- **RAG**: `medical_knowledge` (embeddings via pgvector when self-hosted).

Safety: drug interaction check runs on every prescription save; hard-blocks Category X.

---

## 28. Kiosk & Public Queue

### Purpose
Self-service check-in, token display.

### Tables
`kiosk_configs`, `kiosk_sessions`, `kiosk_token_logs`, `queue_display_configs`.

### Auth
Anonymous JWT with `kiosk_id` claim; RLS policies allow `anon` reads scoped to that kiosk.

### Displays
Public queue URL per branch — auto-refresh via realtime channel, 1:2 layout, TTS call-out (optional).

---

## 29. Notifications

### Channels
- WhatsApp (Business Cloud API) — templates for appointment, reminder, invoice, result-ready.
- SMS (Unifonic primary, Twilio fallback).
- Push (FCM + APNs).
- Email (per-org SMTP).
- In-app (`notification_logs`, badge counts).

### Tables
`notification_logs`, `notification_preferences`, `notification_templates`, `whatsapp_message_log`, `push_device_tokens`.

Users manage per-channel preferences per event type.

---

## 30. Reports & Analytics

### Routes
`/app/reports/*` + per-module Reports pages.

### Dashboards
- Org admin (`OrgAdminDashboardPage`) — global KPIs.
- CFO (`useCFOMetrics`) — revenue, EBITDA, cash position.
- OPD (`useOPDDashboardStats`, `useOPDDepartmentStats`).
- IPD (`useIPDDashboardStats`).
- Lab (`useLabDashboardStats`).
- Warehouse (`useWarehouseExecutiveSummary`).
- NPHIES analytics (`useNphiesAnalytics`).

Reporting queries **must** use `fetchAllRows` to bypass the 1000-row cap.

### Report templates
`report_templates` — DOCX/HTML with tokens; used for discharge summaries, letters, custom reports.

---

## 31. Super Admin / Multi-org

### Routes
`/super-admin/*`

### Tables
`organizations`, `organization_modules`, `organization_settings`, `available_modules`.

Enable/disable modules per org, seed demo data, view all users across orgs, platform-wide error logs.

---

## 32. Mobile Apps (Capacitor)

### Personas → resolved via `resolveMobilePersona(roles)`
- **Doctor** (`DoctorMobileDashboard`) — schedule, rounds, quick Rx, imaging viewer.
- **Nurse** (`NurseMobileDashboard`) — vitals, medication administration, tasks.
- **Patient** (`PatientMobileDashboard`) — appointments, reports, prescriptions, invoices, portal chat.
- **Staff** (`StaffMobileDashboard`) — reception/cashier/lab/pharmacist fallback.

### Native
- Biometric login (`src/lib/native/biometric.ts`).
- Deep links (`src/lib/native/deep-links.ts`).
- Offline outbox with sync engine (`src/lib/offline-sync/*`).

---

## 33. Offline Sync

### Purpose
Full-feature offline for mobile/tablet during connectivity gaps (rural clinics, ambulances).

### Tables
`sync_outbox`, `sync_conflicts`.

### Mechanism
- IndexedDB store (`db.ts`).
- Outbox queues writes with client-generated UUIDs.
- On reconnect, `sync-engine.ts` replays with idempotency keys.
- Conflicts (last-write-wins by default; some entities require manual resolve → `sync_conflicts`).

---

## 34. Compliance & HIPAA

### Tables
`audit_logs`, `hipaa_breach_incidents`, `hipaa_training_records`, `business_associate_agreements`, `client_errors`, `edge_errors`.

### Controls
- Access control via RLS + `has_role`.
- PHI masking utilities (`phiMasking.ts`).
- Session timeout (`useIdleTimeout`).
- Audit every PHI read + admin action.
- 60-day breach notification workflow.
- Training expiry blocks module access.
- BAA management for vendors.
- Storage RLS ensures files scoped per patient/org.

---

## Appendix A — Module Map (route → primary tables)

| Route prefix | Module | Primary tables |
|---|---|---|
| `/app/patients` | Patients | patients, patient_* |
| `/app/appointments` | Appointments | appointments |
| `/app/opd` | OPD | consultations, opd_* |
| `/app/reception` | Reception | appointments, invoices |
| `/app/ipd` | IPD | admissions, beds, wards, ipd_* |
| `/app/emergency` | ER | emergency_registrations, mlc_records |
| `/app/ot` | OT | surgeries, surgery_* |
| `/app/lab` | Lab | lab_orders, lab_* |
| `/app/radiology` | Radiology | imaging_* |
| `/app/pharmacy` | Pharmacy | medicines, medicine_*, pharmacy_* |
| `/app/inventory` | Warehouse | stores, warehouse_*, purchase_*, goods_received_notes |
| `/app/blood-bank` | Blood Bank | blood_* |
| `/app/dental` | Dental | dental_* |
| `/app/dialysis` | Dialysis | dialysis_* |
| `/app/mobile-units` | Ambulance | mobile_*, ambulance_alerts |
| `/app/home-care` | Home Care | home_visits |
| `/app/telemedicine` | Telemedicine | telemedicine_* |
| `/app/immunizations` | Immunization | immunizations, vaccine_lots |
| `/app/hr` | HR & Payroll | employees, payroll_*, leave_*, attendance_* |
| `/app/accounts` | Finance | accounts, journal_entries, invoices |
| `/app/billing` | Billing | invoices, billing_sessions, payments |
| `/app/insurance` | Insurance / NPHIES | insurance_*, nphies_* |
| `/app/assets` | Assets | assets, fixed_assets, maintenance_records |
| `/app/housekeeping` | Housekeeping | housekeeping_* |
| `/app/kitchen` | Kitchen | diet_charts, menu_items |
| `/app/donations` | Donations | donation_*, financial_donations |
| `/app/ai` | Tabeebi AI | ai_conversations, medical_knowledge |
| `/app/reports` | Reports | (cross-cutting) |
| `/app/settings` | Settings | organization_*, branch_*, system_settings |
| `/app/integrations` | Integrations | fhir_*, gateway_* |
| `/app/certificates` | Certificates | medical_certificates |
| `/app/services` | Services | service_types, service_categories |
| `/app/sync` | Sync | sync_outbox, sync_conflicts |
| `/portal` | Patient Portal | patient_portal_accounts |
| `/super-admin` | Super Admin | organizations, available_modules |
| `/kiosk` | Kiosk | kiosk_configs, kiosk_sessions |
| `/queue` | Queue Display | queue_display_configs |

---

*End of HEALTHOS.md — pair with BRAIN.md for a complete self-host implementation reference.*
