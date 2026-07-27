
# LMDC-HMIS SoW vs HealthOS24 — Coverage Report

Read-only report. No development proposed.
Sources: `SoW_LMDC-HMIS_Med-Den_v0.2.xlsx` (675 line items across 20 functional areas + 221 named reports) mapped against the current HealthOS24 codebase (`src/pages/app/**`, 235 hooks in `src/hooks/**`, 32 edge functions, memory index).

Legend: ✅ Built · 🟡 Partial · ❌ Missing · ⏭ Low priority in SoW (P3 / no phase)

---

## Executive summary

| Bucket | SoW items | Built ✅ | Partial 🟡 | Missing ❌ |
|---|---:|---:|---:|---:|
| Outpatient | 90 | ~65 | ~15 | ~10 |
| Emergency | 19 | ~9 | 2 | ~8 |
| Clinical (EMR, PACS, RIS) | 124 | ~85 | ~25 | ~14 |
| Pharmacy/Services support | 54 | ~24 | ~10 | ~20 |
| ICU | 6 | 0 | 0 | 6 |
| Diagnostics (LIS, Blood Bank, Cath) | 61 | ~46 | ~3 | ~12 (Cath ⏭) |
| Inpatient / ADT | 38 | ~24 | ~7 | ~7 |
| OT & Auxiliary | 65 | ~30 | ~10 | ~25 |
| Analytics (1 line, 221 reports) | 1 | 6 dashboards | — | ~200 named reports not built individually |
| Patient/Doctor Portal & Mobile | 9 | 9 | — | — |
| Teleconsultation | 9 | 0 | — | 9 (⏭) |
| Chair Management (dental) | 10 | ~6 | ~4 | — |
| Dental (extended) | 62 | ~18 | ~10 | ~34 |
| Compliance & Integration | 5 | 3 | — | 2 (SAP/Odoo) |
| HR (SoW asks Employee Master only) | 5 | 5 | — | — |
| Finance / RCM / Share / Refund | 61 | ~30 | ~20 | ~11 |
| Building/Facility Structure | 21 | ~6 | ~5 | ~10 |
| User Management | 35 | ~25 | ~6 | ~4 |
| **Total (excl. reports)** | **675** | **~391 (58 %)** | **~117 (17 %)** | **~167 (25 %)** |

Headline: **~75 % of the SoW is either fully or partially met** by HealthOS24 today. The remaining ~25 % concentrates in ICU, CSSD, birth/newborn workflow, dental lab/implant, clinical pharmacy, nursing scoring, doctor-share depth, facility master, and the report catalog.

---

## 1. Outpatient (90)
- ✅ Information Desk basics, appointments, QMS token queue, OPD Pharmacy end-to-end, Warehouse (PR→PO→GRN, FEFO, sub-store, near-expiry, destruction).
- 🟡 Registration lacks PVC card print, wristband print, family/parent mapping, barcode label, referral-in from oladoc/avicenna. Info Desk lacks attendant pass, tariff/package public view, cost estimator.
- ❌ **Discount & Contract Approval** workflow (5 items) entirely absent.

## 2. Emergency (19)
- ✅ Triage (nurse+doctor), roster assignment, ER stock charging, unconscious-patient flow, postpaid billing.
- ❌ Crashcart register, **Code Blue** one-click + team notify + debrief, oxygen start/stop + flow-rate + consumption timer, observation timer, waiting-time calculation.

## 3. Clinical Services (124)
- **EMR – Physician (46)**: SOAP, ICD-10, prescriptions with drug-interaction & unavailability, referrals, discharge summary, dental 3D chart all ✅. Missing/thin: 6-point periodontal chart, BOP/CAL/mobility grades, cephalometric tracing (SNA/SNB/ANB), ortho bracket/aligner staging, ADR reporting, patient care plan (PCP), SOS/PRN + medication stop-date flags, clinical pathway (CP), controlled-antibiotic workflow.
- **EMR – Nursing (44)**: vitals, MAR, shift handovers, discharge notes ✅. Missing: MEWS/PEWS scoring engine, IPC bundles (CLABSI/VAP/SSI/HH), scoring panel (Pain/GCS/APGAR/Aldrete/Fall/Bed Sore), intake-output ledger, patient own-medications register, dead-body release, trolley management.
- **EMR Records (13)**: uploads ✅; physical file accession/tracing workflow missing.
- **PACS (7)** ✅  ·  **RIS (14)** ✅.

## 4. Pharmacy & Ward-side Services (54)
- ✅ Pharmacy IPD (ward-billing automation).
- 🟡 Pharmacy OT — consumables/FIFO exists, OT-specific issue/return needs verification.
- ❌ Clinical Pharmacy Services (interventions/TDM/DRP), Trolley Management, LAMA, Absconded, Death certificate (ICD-11) + body-release form.

## 5. ICU (6)
❌ Entire section missing: ventilator management (SBT reminder, weaning protocol, post-extubation timer), invasive line insertion + daily fee, ICU alarm escalation nurse→doctor.

## 6. Diagnostic Services (61)
- ✅ LIS mostly complete (specimen, machine interface, verification, addendum, critical alerts, kits).
- 🟡 Missing pieces: partial-panel rejection, rejection billing reversal, sample-rejection register.
- ✅ Blood Bank (memory: full capability incl. reactions, crossmatch, expiry alerts).
- ⏭ **Cath Lab (12)** — SoW priority 3, no phase; not built.

## 7. Inpatient (38)
- ✅ ADT admission with mandatory procedure+doctor, discharge, deposits.
- 🟡 Missing: discharge-Rx auto-continuation link, revisit schedule, patient-ID label print, bed FIFO waitlist with acuity, QR cleaning timer, bed-assignment escalation.
- ❌ IPD oxygen therapy tracker, nursing call system.
- ✅ Ambulance charging.

## 8. OT & Auxiliary (65)
- ✅ OR scheduling, WHO checklist, surgery notes, consumable FIFO, ERP posting.
- ❌ **CSSD (14)** entirely — ultrasonic clean, cycle logging, spore test, batch ID, sterile issue/return.
- ❌ **OT / Labor Room Birth (8)** — APGAR, newborn-mother suffix link, provisional→final birth certificate, NICU flag, 24 h verification, discharge block.
- ✅ Dietary/Catering module present; cafe POS + cash-closing denominator needs verification.
- 🟡 Pre-Anesthesia (ASA/airway) missing, Intraoperative sponge/instrument count mismatch alert missing, PACU Aldrete score & unstable-return-to-OT missing, OT cancellation sliding-scale penalty missing.

## 9. Analytics & Reports
- ✅ CFO, OPD, IPD, Lab, Warehouse dashboards.
- ❌ Of **221 named reports** on the Reports sheet, most are not implemented as discrete reports. A separate catalog pass is needed to mark each as (a) covered by an existing dashboard/query, (b) trivial new query, or (c) requires new logic.

## 10. Patient/Doctor Portal & Mobile (9)
✅ All present — portal, doctor mobile, nurse mobile, patient mobile, messaging surface.

## 11. Teleconsultation (9)
⏭ SoW priority 3. Tabeebi covers voice/chat. Full video-consult scheduling suite not built.

## 12. Chair Management (10)
✅ Scheduling & doctor mapping ✅. 🟡 Chair census, chair maintenance, chair enquiry, doctor standing-instruction templates need verification.

## 13. Dental Extended (62)
✅ 3D tooth chart with per-surface mapping.
❌ Large gap: Dental Lab (Ceramic) case tracking, external/internal lab case management (crown/bridge/denture/implant/ortho workflow, shade/material selection, QC checklist, digital signature), oral lesion mapping + biopsy integration, prosthesis/appliance tracking, **serialized implant inventory** + abutment/healing/consignment loaner tracking, dental insurance/payer, procedure bundling, patient payment plans, comprehensive treatment plan sign-off, orthodontic archwire/elastic/IPR tracking, automated recall SMS, post-op instruction templates + acknowledgment, STL/PLY intraoral scan import + 3D viewer, CBCT DICOM viewer + implant planning + bone density.

## 14. Compliance & Integration (5)
✅ HIPAA, audit trail, RBAC.
❌ **SAP / Odoo bridge**, house-surgeon→faculty approval on clinical worklog.

## 15. HR (5) — SoW asks Employee Master only
✅ HealthOS24 far exceeds this — contracts, licenses, attendance, payroll two-pass, gratuity, exit, letters, biometric.

## 16. Finance (61)
- ✅ RCM: charge master, COA, agreements, eligibility, OPD/IPD/Lab billing, day closing, AR, counter-wise collection.
- ✅ Patient reg & billing, triage, pharmacy, OT billing.
- 🟡 **Doctor / Staff Share (26 items)**: base doctor-earnings trigger ✅, but missing depth — slab-based share, department pool, group-practice split, min-guarantee vs share, package/bundled share, on-call share, insurance-claim share, retainer vs share, withholding-tax deduction, settlement schedule, share voucher, statement, dashboard.
- 🟡 **Refund (7)**: basic refunds ✅. Missing sliding-scale cancellation, medication-return refund flow, unique refund voucher, shift-closure net calc.

## 17. Building / Facility Structure (21)
- 🟡 Org → branch → department hierarchy exists.
- ❌ Missing formal Facility Master: building/block/floor/room/chair/corridor/zone hierarchy tree, space-utilization reports, service→location mapping, doctor→room schedule mapping, facility utilization dashboard.

## 18. User Management (35)
- ✅ Auth, MFA, roles (`user_roles` + `has_role()`), RLS, audit logs, session timeout, kiosk.
- 🟡 Verify: generic multi-stage approval workflow module, formal user-lifecycle wizard (onboarding→offboarding), user-activity dashboard tile, dedicated user reports.

---

## Top Phase-1A "Must" items that are missing

1. Discount & Contract Approval workflow
2. Code Blue + Crashcart + Oxygen timers (ER & IPD)
3. ICU: ventilator, invasive lines, alarm escalation
4. CSSD end-to-end
5. OT / Labor Room Birth (APGAR, newborn link, birth-cert lifecycle)
6. Clinical Pharmacy Services (interventions, TDM)
7. Trolley Management
8. LAMA / Absconded workflows
9. Nursing scoring engines (MEWS, PEWS, GCS, APGAR, Aldrete, Fall, Pain, Bed Sore)
10. Dental Lab Case Management + Serialized Implant Inventory + CBCT viewer
11. Doctor/Staff Share deep extension
12. Facility Master hierarchy (Building→Block→Floor→Room→Chair)
13. Cephalometric + Orthodontic progress tracking
14. ~200 named reports on the Reports tab

## Deferred (low priority in SoW itself)

- Cath Lab (P3, no phase)
- Full Teleconsultation video suite (P3) — Tabeebi covers voice/chat today
- SAP / Odoo bridge

---

**Report only — nothing has been changed.** Approve or say the word if you want me to (a) expand any section, (b) turn the 221 required reports into a per-line coverage checklist, or (c) move on to build.
