## Wave 1 — Mobile Health & Outreach (KSA-compliant, enterprise-ready, 6 months)

Builds on the existing HMIS (OPD, IPD, Lab, Pharmacy, Finance, NPHIES, Wasfaty, ZATCA, Tabeebi AI, multi-tenant RLS, EN/UR/AR, Hijri). No rewrites of existing modules — new modules plug into the same chart of accounts, patient master, RLS roles, and trigger-based GL posting.

### Modules in scope

1. Clinic on Wheels (mobile units)
2. Telemedicine (video, e-Rx, billing)
3. Home Healthcare (visits, nursing, sample collection)
4. Vaccination / Immunization Registry (EPI + KSA schedule)
5. Patient Portal (web)
6. Patient Mobile App (Capacitor — iOS + Android)
7. Shared Offline-Sync engine + Route planning
8. Payment gateway layer (Mada / STC Pay / HyperPay / Tap)
9. FHIR R4 server endpoints (NPHIES + Sehhaty interop)

### Phasing (6 months)

```text
Month 1 ── Foundations
  • Offline-sync engine (IndexedDB + outbox + conflict resolution)
  • Payments abstraction + Mada/STC Pay/HyperPay/Tap adapters
  • FHIR R4 server scaffolding (Patient, Encounter, Observation, Immunization)
  • Patient identity unification (MRN ↔ Iqama/National ID ↔ Sehhaty ID)
  • i18n EN/UR/AR + Hijri audit across new screens

Month 2 ── Clinic on Wheels v1
  • Vehicle / unit / crew master
  • Route planner (geo, schedule, capacity)
  • Offline OPD-lite (registration, vitals, consult, e-Rx, dispense, invoice)
  • Sync to central HMIS on reconnect; conflict log
  • ZATCA Phase-2 invoice generation offline-capable
  • CoW dashboard (units, routes, revenue per van)

Month 3 ── Telemedicine
  • Appointment slots (in-person / video / home visit)
  • WebRTC video room (Daily.co or LiveKit), waiting room, consent
  • In-call vitals capture, e-Rx (Wasfaty), lab/imaging orders
  • Pre-paid checkout via payment gateways
  • Nafath login for KSA patients
  • Recording + retention policy (consent-gated)

Month 4 ── Home Healthcare + Vaccination Registry
  • Home Healthcare: visit orders, nurse roster, geo check-in/out,
    sample collection link to Lab module, recurring care plans
  • Vaccination registry: KSA EPI schedule, dose lifecycle,
    due-list, certificates (Sehhaty-aligned), batch/lot recall,
    cold-chain log integration with Pharmacy inventory

Month 5 ── Patient Portal + Mobile App
  • Web portal: appointments, results, invoices, deposits,
    prescriptions, family members, teleconsult join
  • Capacitor app (iOS/Android): same surface + push
    notifications + biometric login + Nafath SSO
  • In-app payments + receipts (ZATCA QR)
  • WhatsApp Business API channel for reminders

Month 6 ── KSA hardening, interop, performance
  • FHIR R4 server: expose Patient/Encounter/Observation/
    Immunization/MedicationRequest with SMART-on-FHIR auth
  • Sehhaty / NPHIES bidirectional sync hardening
  • Load test (1k concurrent, 50 vans offline-then-sync)
  • Pen-test fixes, RLS audit, accessibility (WCAG 2.1 AA)
  • Pilot rollout playbook (1 hospital + 5 vans)
```

### Cross-cutting (every module, day one)

- **KSA compliance**: NPHIES claim hooks, ZATCA Phase-2 invoice chaining, Wasfaty e-Rx, Nafath SSO, Tatmeen drug serialization, HESN reportable conditions.
- **i18n**: EN/UR/AR strings + RTL via existing `flex-row-reverse` + Hijri dual-calendar.
- **Security**: RLS per facility/role, PHI masking, audit logs, security-definer RPCs, consent management.
- **GL**: revenue routes through existing prefix-based router (new prefixes `COW-`, `TELE-`, `HOME-`, `VAC-`) into the existing 4-level CoA via DB triggers — no app-side journals.
- **Doctor earnings**: reuse `trg_unified_doctor_earnings`.
- **Patient balance**: keep the Outstanding + Available Deposit display contract.

### Technical sections

**New tables (high-level, RLS on all)**
- `mobile_units`, `mobile_unit_crew`, `mobile_routes`, `mobile_route_stops`, `mobile_visits`
- `telemedicine_sessions`, `telemedicine_recordings`, `telemedicine_consents`
- `home_visits`, `home_visit_tasks`, `care_plans`, `care_plan_items`
- `immunizations`, `immunization_schedules`, `vaccine_lots`, `cold_chain_logs`
- `patient_portal_accounts`, `patient_devices`, `push_subscriptions`
- `payment_gateway_transactions`, `payment_gateway_refunds`
- `fhir_resource_cache`, `fhir_subscriptions`
- `sync_outbox`, `sync_conflicts` (offline engine)

**New edge functions**
- `payments-mada`, `payments-stcpay`, `payments-hyperpay`, `payments-tap` (init, webhook, refund)
- `nafath-auth` (OIDC-style)
- `whatsapp-dispatch`
- `fhir-server` (resource read/search/create with SMART scopes)
- `sehhaty-sync`
- `cow-sync` (bulk outbox apply with idempotency keys)
- `webrtc-token` (LiveKit/Daily JWT minting)
- `vaccine-certificate` (signed PDF)

**Frontend additions**
- Routes: `/app/mobile-units/*`, `/app/telemedicine/*`, `/app/home-healthcare/*`, `/app/vaccination/*`
- Public portal: `/portal/*` (separate layout, patient role)
- Capacitor app shell reusing portal routes; offline shell for CoW staff at `/app/mobile-units/field`

**Reuse & non-goals**
- Reuse: patient master, lab, pharmacy, billing sessions, invoices, ZATCA, Wasfaty, NPHIES claims, RBAC, Tabeebi AI.
- Out of scope this wave: ICU/NICU charting, JCI/CBAHI quality module, Oncology, FHIR write-bus to external EHRs beyond Sehhaty/NPHIES, denial-management workbench (separate Wave 2).

### Deliverables per module
For each module: schema + RLS, edge functions, UI in EN/UR/AR, Hijri-aware dates, ZATCA-compliant invoices, NPHIES claim hook where applicable, audit logs, unit + integration tests, seed data, admin docs.

### Milestones / exit criteria
- M2 end: a van can run a full day offline and reconcile cleanly.
- M3 end: paid video consult → e-Rx at Wasfaty → invoice with ZATCA QR.
- M4 end: home nurse visit billed; child vaccination certificate downloadable.
- M5 end: patient books, pays, joins teleconsult, and views results from mobile app.
- M6 end: external system can read patient history via FHIR R4 with SMART scopes; pilot-ready for 1 hospital + 5 vans.

Confirm and I'll start with Month 1 foundations (offline-sync engine + payments abstraction + FHIR scaffolding).
