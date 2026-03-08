
# HealthOS 24 — KSA Compliance Implementation

## Status: ✅ ALL 6 PHASES IMPLEMENTED

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

## Phase 1: Terminology Standards
- `medical_code_type` enum expanded: `achi`, `sbs`, `snomed`, `loinc`
- `MedicalCodeSearch` supports all 6 code types
- `ClaimFormPage` uses ACHI for KSA procedures, CPT for others

## Phase 2: HESN Public Health
- Edge function: `hesn-gateway` (FHIR Communication resources)
- `hesn_reports` table with RLS
- `HesnReportButton` for clinical encounters
- `HesnConfigPanel` in KSA compliance settings

## Phase 3: Tatmeen Drug Track & Trace
- Edge function: `tatmeen-gateway` (EPCIS events)
- `tatmeen_transactions` table with RLS
- `TatmeenScanButton` with GS1 DataMatrix barcode parser
- `TatmeenConfigPanel` in KSA compliance settings

## Phase 4: Nafath Identity Verification
- Edge function: `nafath-gateway` (MFA verification flow)
- Patient fields: `nafath_verified`, `nafath_verified_at`, `nafath_request_id`
- `NafathVerifyButton` with polling and random number display

## Phase 5: Sehhaty Patient Engagement
- Edge function: `sehhaty-gateway` (FHIR resources)
- `sehhaty_sync_log` table with RLS
- `SehhatyPushButton` for appointments, lab results, sick leave (e-Jaza)

## Phase 6: Advanced Features
- `patient_consents` table for PDPL compliance
- KSA Compliance Settings page updated with Tatmeen + HESN tabs

## API Keys Required (Add via Supabase Secrets)
- `HESN_API_KEY` / `HESN_API_URL` — MOH HESN platform
- `TATMEEN_API_KEY` / `TATMEEN_API_URL` — SFDA Tatmeen
- `NAFATH_API_KEY` / `NAFATH_APP_ID` / `NAFATH_API_URL` — Elm Nafath
- `SEHHATY_API_KEY` / `SEHHATY_API_URL` — Sehhaty platform

All integrations run in **sandbox mode** until API keys are configured.
