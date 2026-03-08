

# KSA Full Compliance Gap Analysis & Implementation Plan

## Current State vs. Requirements

### Already Implemented
| Requirement | Status | Notes |
|---|---|---|
| NPHIES (Eligibility, Claims, Pre-Auth) | Done | Full RCM workflow |
| ZATCA Phase 2 (UBL 2.1, QR, Clearance) | Done | Integrated with invoicing |
| Wasfaty E-Prescription | Done | Integrated with pharmacy |
| Hijri Calendar | Done | Dual-date display |
| ICD-10 / CPT Medical Codes | Done | Searchable DB table |
| Saudi ID / Iqama Validation | Done | 10-digit validation |
| Sick Leave Certificates | Done | Printable templates |
| HL7 Lab Integration | Done | HL7 v2.x + ASTM |

### Missing (Grouped by Priority)

**TIER 1 — Regulatory Mandatory**

| Integration | Gap | Effort |
|---|---|---|
| HESN (Public Health Reporting) | No communicable disease or immunization reporting | Medium |
| RSD / Tatmeen (Drug Track & Trace) | No GS1 barcode scanning or SFDA movement reporting | Medium |
| Nafath (National SSO) | No identity verification via national SSO | Medium |
| ACHI Procedure Codes | Only CPT exists; ACHI required for KSA claims | Small |
| SBS Billing Codes | Only referenced in denial messages; no code table | Small |
| SNOMED CT / LOINC | No clinical terminology or lab observation codes | Medium |

**TIER 2 — Patient Engagement**

| Integration | Gap | Effort |
|---|---|---|
| Sehhaty App | No push of appointments/results/e-Jaza to patient app | Medium |
| Mawid Referral Network | No MOH referral acceptance | Small |

**TIER 3 — Advanced / Competitive**

| Integration | Gap | Effort |
|---|---|---|
| Seha Virtual Hospital (Tele-consult) | No tele-consultation referral | Small |
| Insurance Card Tokenization | No digital token storage/refresh | Small |
| PDPL Compliance | No data sovereignty/consent management UI | Medium |

---

## Implementation Plan

### Phase 1: Terminology & Coding Standards (Foundation)

Expand `medical_code_type` enum to include `achi`, `sbs`, `snomed`, `loinc`. Seed reference data. Update `MedicalCodeSearch` component to support new code types. Update claim forms to use ACHI for procedures when country is SA.

**Files:**
- Migration: Add enum values, seed ACHI/SBS/SNOMED/LOINC starter codes
- `src/hooks/useMedicalCodes.ts` — support new types
- `src/components/insurance/MedicalCodeSearch.tsx` — add ACHI/SBS selectors
- `src/pages/app/billing/ClaimFormPage.tsx` — use ACHI for KSA procedures

### Phase 2: HESN Public Health Reporting

Create `hesn-gateway` edge function for MOH communicable disease and immunization reporting. Build a `HesnReportForm` component accessible from patient encounters. Add `hesn_reports` table for audit trail.

**Files:**
- Migration: `hesn_reports` table
- `supabase/functions/hesn-gateway/index.ts`
- `src/components/clinical/HesnReportButton.tsx`
- `src/pages/app/settings` — HESN config in KSA compliance settings

### Phase 3: RSD / Tatmeen Drug Track & Trace

Create `tatmeen-gateway` edge function for SFDA drug movement reporting. Add GS1 barcode fields to pharmacy inventory. Build `TatmeenScanButton` for pharmacy dispensing workflow.

**Files:**
- Migration: Add `gtin`, `serial_number`, `batch_number` to pharmacy items; `tatmeen_transactions` table
- `supabase/functions/tatmeen-gateway/index.ts`
- `src/components/pharmacy/TatmeenScanButton.tsx`
- `src/components/pharmacy/TatmeenConfigPanel.tsx` — mount in NphiesSettingsPage

### Phase 4: Nafath Identity Verification

Create `nafath-gateway` edge function for national identity verification. Add verification status to patient registration. Trigger during patient creation for KSA orgs.

**Files:**
- `supabase/functions/nafath-gateway/index.ts`
- `src/components/patients/NafathVerifyButton.tsx`
- Migration: Add `nafath_verified`, `nafath_verified_at` to patients table

### Phase 5: Sehhaty Patient Engagement

Create `sehhaty-gateway` edge function to push appointments, lab results, and sick leave (e-Jaza) to patient's Sehhaty app.

**Files:**
- `supabase/functions/sehhaty-gateway/index.ts`
- `src/components/clinical/SehhatyPushButton.tsx`
- Integration points in appointment confirmation, lab result release, sick leave certificate generation

### Phase 6: Advanced (Mawid, PDPL, Tokenization)

- Mawid: Accept MOH referrals via webhook
- PDPL: Consent management UI, data export/deletion for patients
- Insurance Tokenization: Store/refresh digital insurance tokens

---

## Summary

| Phase | Components | New Files | Priority |
|---|---|---|---|
| 1. Terminology (ACHI/SBS/SNOMED/LOINC) | Migration + UI updates | 1 migration, 2 modified | HIGH |
| 2. HESN Public Health | Edge fn + UI + table | 4 new | HIGH |
| 3. RSD/Tatmeen Drug Tracing | Edge fn + UI + table | 4 new | HIGH |
| 4. Nafath Identity | Edge fn + UI + migration | 3 new | MEDIUM |
| 5. Sehhaty Patient App | Edge fn + UI hooks | 3 new | MEDIUM |
| 6. Advanced | Mawid, PDPL, Tokenization | 5+ new | LOW |

**Total: ~20 new/modified files across 6 phases**

All new integrations follow the existing pattern: edge function + config panel in NphiesSettingsPage + action button in clinical workflow + conditional on `country_code === 'SA'`.

