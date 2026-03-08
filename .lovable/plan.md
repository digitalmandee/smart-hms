
# HealthOS 24 — KSA Compliance + Full Module Implementation

## Status: ✅ ALL PHASES + DIALYSIS & DENTAL IMPLEMENTED

## Implemented Features

| Feature | Priority | Status | Files |
|---------|----------|--------|-------|
| **NPHIES Insurance** | HIGH | ✅ DONE | Full RCM workflow, eligibility, claims, pre-auth |
| **ZATCA Phase 2** | HIGH | ✅ DONE | `zatca-phase2/index.ts`, UBL 2.1, QR, clearance |
| **Wasfaty e-Prescription** | MEDIUM | ✅ DONE | `wasfaty-gateway/index.ts`, config panel, submit button |
| **Hijri Calendar** | LOW | ✅ DONE | `hijriCalendar.ts`, `HijriDateDisplay` component |
| **ACHI/SBS/SNOMED/LOINC Codes** | HIGH | ✅ DONE | Enum expanded, `MedicalCodeSearch` supports all types |
| **HESN Public Health Reporting** | HIGH | ✅ DONE | `hesn-gateway/index.ts`, `HesnReportButton`, `hesn_reports` table |
| **RSD/Tatmeen Drug Track & Trace** | HIGH | ✅ DONE | `tatmeen-gateway/index.ts`, `TatmeenScanButton`, GS1 parser |
| **Nafath Identity Verification** | MEDIUM | ✅ DONE | `nafath-gateway/index.ts`, `NafathVerifyButton`, patient fields |
| **Sehhaty Patient Engagement** | MEDIUM | ✅ DONE | `sehhaty-gateway/index.ts`, `SehhatyPushButton` |
| **PDPL Consent Management** | LOW | ✅ DONE | `patient_consents` table |
| **Vendor Payment Journal** | HIGH | ✅ DONE | `post_vendor_payment_to_journal` trigger |
| **Dialysis Module** | HIGH | ✅ DONE | 6 pages, 5 DB tables, full CRUD hooks |
| **Dental Module** | HIGH | ✅ DONE | 5 pages, 4 DB tables, interactive tooth chart |

## System Audit — Finance Journal Coverage

| Trigger | Status |
|---------|--------|
| Invoice → Journal (AR ↑, Revenue ↑) | ✅ |
| Payment → Journal (Cash ↑, AR ↓) | ✅ |
| POS Sale → Journal | ✅ |
| Payroll → Journal | ✅ |
| Expense → Journal | ✅ |
| Donation → Journal | ✅ |
| Shipping → Journal | ✅ |
| Stock Write-off → Journal | ✅ |
| **Vendor Payment → Journal** | ✅ FIXED |

## Dialysis Module
- **Tables**: `dialysis_patients`, `dialysis_sessions`, `dialysis_vitals`, `dialysis_machines`, `dialysis_schedules`
- **Pages**: Dashboard, Patients, Sessions, Schedule, Machines, Reports
- **Features**: FDI-mapped machine/chair tracking, intra-session vitals, recurring schedule (MWF/TTS), session number generator
- **Linkage**: OPD (appointment_id) + IPD (admission_id) hybrid

## Dental Module
- **Tables**: `dental_charts`, `dental_treatments`, `dental_procedures`, `dental_images`
- **Pages**: Dashboard, Tooth Chart (interactive FDI 32-tooth grid), Treatments, Procedures (CDT catalog), Reports
- **Features**: Per-tooth condition tracking with upsert, surface mapping, procedure catalog with pricing
- **Linkage**: OPD (appointment_id) + Invoice integration

## API Keys Required (Add via Supabase Secrets)
- `HESN_API_KEY` / `HESN_API_URL` — MOH HESN platform
- `TATMEEN_API_KEY` / `TATMEEN_API_URL` — SFDA Tatmeen
- `NAFATH_API_KEY` / `NAFATH_APP_ID` / `NAFATH_API_URL` — Elm Nafath
- `SEHHATY_API_KEY` / `SEHHATY_API_URL` — Sehhaty platform

All integrations run in **sandbox mode** until API keys are configured.
