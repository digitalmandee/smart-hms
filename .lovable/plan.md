

# HealthOS 24 — Product Pitch Deck Overhaul (16 Slides)

## Direction
A **product-first pitch deck** that showcases HealthOS 24 in deep detail — every module, every AI touchpoint, insurance/NPHIES integration, the full patient journey — presented in a clean, modern, confidence-building way. No investor jargon, no TAM/SAM charts, no financial projections. This is the deck you hand someone to say: "Look at everything this platform does."

## New Slide Flow (16 slides)

| # | Slide | Status | Key Content |
|---|-------|--------|-------------|
| 1 | **Title / Hero** | UPDATE | Keep but refresh: bigger tagline "One Platform. Every Department. AI Inside.", remove "Confidential" badge, add "20+ Modules · 3 Languages · Built-in AI" |
| 2 | **About Us** | KEEP | Minor tweak: update slide number |
| 3 | **The Problem** | KEEP | Minor tweak: update slide number |
| 4 | **The Solution (Hub-Spoke)** | KEEP | Update slide number |
| 5 | **Module Map** | UPDATE | Add Insurance/NPHIES as 7th category with 4 modules (Eligibility, Claims, Pre-Auth, Reconciliation) |
| 6 | **AI Everywhere** | NEW | Grid showing AI is not just Tabeebi — it's woven into every department: AI Drug Alerts, AI Lab Flagging, AI Claim Scrubbing, AI ICD-10 Coding, AI Analytics, AI Scheduling, AI Inventory Forecasting, AI Pre-Screening |
| 7 | **Tabeebi AI Deep Dive** | KEEP | Update slide number |
| 8 | **Insurance & NPHIES** | NEW | Full RCM lifecycle visual: Eligibility → Pre-Auth → Claim → Scrubbing → Submission → ERA → Reconciliation. KSA NPHIES/FHIR compliance badge. Manual insurance for PK market. Denial management with AI auto-correction |
| 9 | **Clinical Workflows** | NEW | Deep dive into OPD/IPD/Emergency/Surgery/Nursing with mini flow diagrams and feature highlights per department |
| 10 | **Diagnostics & Pharmacy** | NEW | Lab (LIS), Radiology (RIS), Pathology, Pharmacy POS, dispensing workflow, barcode scanning, drug interaction checks |
| 11 | **Automation Engine** | KEEP | Update slide number |
| 12 | **Patient Journey** | KEEP | Update slide number |
| 13 | **Finance & Operations** | NEW | Billing, Chart of Accounts, HR & Payroll, Procurement, Inventory, Doctor Compensation — showing the back-office is fully covered |
| 14 | **Tech & Infrastructure** | KEEP | Update slide number |
| 15 | **Measurable Results (ROI)** | KEEP | Update slide number |
| 16 | **Why Us + CTA** | MERGE | Combine WhyUs and CTA into one powerful closing slide: 6 differentiators on left, contact/QR on right |

## New Files (5 slides)

### `ExecAIEverywhereSlide.tsx`
Central "AI Core" hub with 8 spokes showing AI in every department:
- AI Pre-Screening (Tabeebi)
- AI Drug Interaction Alerts (Pharmacy)
- AI Lab Result Flagging (Lab)
- AI Claim Scrubbing (Insurance)
- AI ICD-10 Medical Coding (Insurance)
- AI Analytics & Predictions (BI)
- AI Inventory Forecasting (Stores)
- AI Appointment Optimization (OPD)

Each spoke: icon + department name + one-line AI capability. Design: dark gradient background with glowing neon-style connections to center "AI" hub.

### `ExecInsuranceSlide.tsx`
Two sections:
- **Left**: NPHIES/KSA flow — 7-step horizontal pipeline: Eligibility → Pre-Auth → Claim Creation → AI Scrubbing → Batch Submission → ERA/Remittance → Reconciliation. Each step is a colored card with icon.
- **Right**: Manual Insurance (PK) — Company/Plan management, panel pricing, billing split, claim tracking.
- Bottom badges: "HL7 FHIR R4", "NPHIES Certified", "ICD-10 / CPT Lookup", "Auto Denial Management"

### `ExecClinicalSlide.tsx`
5-column grid showing clinical modules:
- OPD: CNIC auto-fill, queue tokens, vitals, consultation, e-prescriptions
- IPD: Bed management, admission workflow, nursing station, diet orders
- Emergency: Triage, casualty register, rapid admission
- Surgery/OT: OT scheduling, surgical notes, anesthesia records, post-op
- Nursing: Medication admin, vitals charting, shift handover, care plans

Each column: icon header, 4-5 bullet features.

### `ExecDiagnosticsSlide.tsx`
3 sections side by side:
- Lab (LIS): Sample collection, barcode tracking, result entry, auto-flagging, report generation
- Radiology (RIS): Order management, PACS integration, report templates
- Pharmacy: Dispensing workflow, POS, stock alerts, drug interaction AI, batch tracking

### `ExecFinanceOpsSlide.tsx`
6-card grid:
- Billing & Invoicing: Auto-billing, split billing, insurance vs cash
- Chart of Accounts: GL, journal entries, trial balance
- HR & Payroll: Biometric attendance, salary calc, leave management
- Procurement: Purchase orders, vendor management, GRN
- Inventory: Stock tracking, min-level alerts, multi-store
- Doctor Compensation: Fee sharing, commission tracking, payouts

## Files to Update

| File | Change |
|------|--------|
| `ExecutivePresentation.tsx` | New imports, new slide order (16 slides), update TOTAL_SLIDES |
| `ExecTitleSlide.tsx` | Remove "Confidential" badge, add "20+ Modules" subtitle line, refresh stats |
| `ExecModulesSlide.tsx` | Add Insurance/NPHIES as 7th category |
| `ExecCTASlide.tsx` | Merge with WhyUs content — 6 reasons on left, contact on right |

## Files to Remove
| File | Reason |
|------|--------|
| `ExecWhyUsSlide.tsx` | Content merged into updated CTA slide |

