

# Comprehensive NPHIES Revenue Cycle Gap Coverage Plan

## Workflow Assessment (15-Step Saudi HMIS Standard)

| # | Step | Current Status | Gap Level |
|---|------|---------------|-----------|
| 1 | Patient Registration | ✅ Done — demographics, national_id, insurance capture | None |
| 2 | Eligibility Check | ✅ Done — real-time NPHIES FHIR CoverageEligibilityRequest | None |
| 3 | Encounter Creation | ✅ Done — OPD/ER/IPD with encounter IDs | None |
| 4 | Pre-Authorization | ✅ Done — submit_preauth gateway action, tracking | None |
| 5 | Treatment/Clinical Docs | ✅ Done — EMR, diagnosis, procedures, labs, radiology | None |
| 6 | Charge Capture | ✅ Partial — IPD auto-charges exist, OPD checkout captures charges, but no auto-linking of all services to insurance claims | **LOW** |
| 7 | Medical Coding | ⚠️ Partial — ICD-10 field on claims, but no coding engine/lookup, no CPT codes, no DRG grouping | **HIGH** |
| 8 | Claim Scrubbing/Validation | ❌ Missing — no pre-submission validation, no duplicate detection, no coding checks | **HIGH** |
| 9 | Claim Generation | ✅ Done — ClaimFormPage with SBS-compatible FHIR bundles | None |
| 10 | NPHIES Submission | ✅ Done — real-time + claim response parsing | None |
| 11 | Payer Processing | ✅ Done — status polling, outcome tracking | None |
| 12 | Denial Management | ⚠️ Partial — rejection reasons displayed, resubmit button exists, but no structured denial tracking or denial analytics | **MEDIUM** |
| 13 | Payment & Remittance | ❌ Missing — no ERA/RemittanceAdvice handling | **HIGH** |
| 14 | Payment Posting | ❌ Missing — no auto-posting of insurance payments to financial ledger | **HIGH** |
| 15 | Financial Reporting | ⚠️ Partial — ClaimsReportPage exists but no AR aging, no insurance company performance, no revenue leakage analytics | **MEDIUM** |

**Additional infrastructure gaps:**
- No NPHIES transaction audit logs (compliance requirement)
- No Saudi ID (Iqama) format validation
- No batch claims submission
- No NPHIES attachment/CommunicationRequest support

---

## Implementation Plan (Priority Order)

### Phase 1: Transaction Audit Logs (Foundation)

**Database**: New `nphies_transaction_logs` table with columns: `id`, `organization_id`, `action`, `claim_id`, `patient_id`, `request_payload` (jsonb), `response_payload` (jsonb), `response_status`, `error_message`, `user_id`, `created_at`. RLS: org-scoped.

**Edge Function**: Wrap every action in `nphies-gateway/index.ts` with a log insert (request + response + status).

**UI**: New `NphiesTransactionLogsPage.tsx` — filterable table by action type, date range, status. Route: `/app/insurance/nphies/transaction-logs`. Add menu item.

### Phase 2: Claim Scrubbing / Validation Engine

**New component**: `src/components/insurance/ClaimScrubber.tsx`
- Pre-submission validation rules:
  - Required fields check (ICD codes, patient insurance, invoice)
  - ICD-10 format validation (letter + 2-7 characters)
  - Duplicate claim detection (same patient + same date + same insurance)
  - Missing documentation flags
  - Insurance rule validation (coverage dates, policy active)
- Shows validation results with severity (error/warning)
- Block submission on errors, allow with warnings

**Integration**: Add scrubber to `ClaimFormPage.tsx` before submission and to `ClaimDetailPage.tsx` before NPHIES submit.

### Phase 3: Medical Coding Support (ICD-10 + CPT Lookup)

**Database**: New `medical_codes` table: `id`, `code_type` (enum: icd10, cpt, drg), `code`, `description`, `description_ar`, `category`, `is_active`. Seed with common Saudi healthcare ICD-10 and CPT codes.

**New component**: `src/components/insurance/MedicalCodeSearch.tsx`
- Searchable dropdown for ICD-10 and CPT codes
- Search by code or description
- Shows code + description in results

**Integration**: Replace free-text ICD code input in `ClaimFormPage.tsx` with `MedicalCodeSearch`. Add CPT code field for procedures.

### Phase 4: Saudi ID Validation

**Patient forms**: In `PatientFormPage.tsx` and `QuickPatientModal.tsx`:
- When org country is SA: validate national_id is 10 digits, starts with 1 (Saudi) or 2 (Iqama)
- Show validation error message in all 3 languages

**FHIR**: In `nphies-gateway`, add proper identifier system URI: `http://nphies.sa/identifier/nationalid`

### Phase 5: Denial Management Enhancement

**Database**: Add columns to `insurance_claims`: `denial_reasons` (jsonb), `resubmission_count` (integer default 0).

**Edge Function**: Parse `ClaimResponse.error[]` codes and `adjudication[].reason` — store structured denial reasons.

**UI**: Enhance `ClaimDetailPage.tsx` with a `DenialManagementPanel` component showing:
- Structured denial codes with descriptions
- Suggested corrective actions per denial code
- Edit & resubmit workflow (increment resubmission_count)

**Analytics**: Add denial analytics to `NphiesAnalyticsPage` — top denial reasons, denial rate by insurance company.

### Phase 6: Payment Reconciliation & Posting

**Database**: New `nphies_remittance_records` table: `id`, `organization_id`, `claim_id` (FK), `remittance_number`, `payment_amount`, `payment_date`, `reconciliation_status` (matched/unmatched/partial), `nphies_response` (jsonb), `created_at`.

**Edge Function**: Add `poll_remittance` action — FHIR `poll-request` for `PaymentReconciliation`, parse and store results, update `insurance_claims.paid_amount`.

**Auto-posting**: Trigger that posts insurance payments to the journal via `get_or_create_default_account` (debit: Cash/Bank, credit: Insurance Receivable).

**UI**: New `RemittanceReconciliationPage.tsx` with reconciliation dashboard. Route: `/app/insurance/nphies/remittance`.

### Phase 7: Enhanced Financial Reporting

**Enhance** `ClaimsReportPage.tsx` with:
- AR Aging buckets (0-30, 31-60, 61-90, 90+ days)
- Insurance company performance (approval rate, avg payment time)
- Revenue leakage analysis (rejected amount, write-offs)
- Denial rate trends over time

### Phase 8: Batch Claims Submission

**Edge Function**: Add `batch_submit` action — accepts array of claim_ids, processes sequentially, logs each transaction.

**UI**: Add checkbox selection + "Submit Selected to NPHIES" button to `ClaimsListPage.tsx` with progress indicator.

### Phase 9: NPHIES Attachment Support

**Database**: New `nphies_attachments` table: `id`, `organization_id`, `claim_id`, `attachment_type`, `file_url`, `status`, `created_at`.

**Edge Function**: Add `send_communication` action — builds FHIR CommunicationRequest with base64 attachments.

**UI**: Add attachments section to `ClaimDetailPage.tsx` with upload + send to NPHIES.

---

## Files Summary

| Phase | New Tables | New/Modified Pages | Edge Function | Other |
|-------|-----------|-------------------|---------------|-------|
| 1 | `nphies_transaction_logs` | `NphiesTransactionLogsPage.tsx` (new) | Add logging wrapper | Route, menu, i18n |
| 2 | — | `ClaimScrubber.tsx` (new), modify `ClaimFormPage` | — | Validation logic |
| 3 | `medical_codes` | `MedicalCodeSearch.tsx` (new), modify `ClaimFormPage` | — | Seed data SQL |
| 4 | — | Modify patient forms | Add FHIR identifiers | Validation utils |
| 5 | `insurance_claims` +2 cols | `DenialManagementPanel.tsx` (new) | Parse error codes | Analytics |
| 6 | `nphies_remittance_records` | `RemittanceReconciliationPage.tsx` (new) | `poll_remittance` action | Journal trigger |
| 7 | — | Modify `ClaimsReportPage` | — | AR aging queries |
| 8 | — | Modify `ClaimsListPage` | `batch_submit` action | Progress UI |
| 9 | `nphies_attachments` | Modify `ClaimDetailPage` | `send_communication` action | Storage bucket |

All new pages and components will include EN, AR, UR translations.

