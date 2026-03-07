

# Plan: Insurance Claim Flow Integration for OPD & IPD

## Problem
Currently, OPD Checkout and IPD Discharge pages have zero insurance awareness. When a patient has active insurance (especially NPHIES), the system should:
1. Show insurance details and verify eligibility
2. Calculate the insurance-covered portion vs patient copay/deductible
3. Split the bill accordingly (insurance claim + patient responsibility)
4. Prompt to create an insurance claim after invoicing
5. Follow KSA operational standard: verify first, bill split, claim auto-generate

## Current State
- **OPD Checkout**: Shows flat total, no insurance detection, no copay split, no claim prompt
- **IPD Admission**: Has `payment_mode: insurance` field + policy/auth number fields, but no NPHIES eligibility check
- **IPD Discharge**: Shows billing summary with balance due, no insurance split, no claim creation
- **InsurancePlan** model already has: `coverage_percentage`, `copay_percentage`, `copay_amount`, `deductible_amount`, `max_coverage_amount`, `annual_limit`
- `AppointmentInsuranceCheck` component exists but is not used in checkout/discharge
- `EligibilityCheckButton` exists with `onResult` callback returning copay/deductible

## Implementation

### 1. New Component: `InsuranceBillingSplit.tsx`
Reusable component for both OPD and IPD billing contexts:
- Props: `patientId`, `totalAmount`, `onSplitCalculated`
- Fetches patient's primary insurance via `usePatientInsurance`
- Shows insurance card (company, plan, policy, eligibility status)
- Inline `EligibilityCheckButton` for NPHIES verification
- Calculates split using plan rules:
  - `insuranceAmount = totalAmount * (coverage_percentage / 100)` capped at `max_coverage_amount`
  - `patientCopay = totalAmount * (copay_percentage / 100)` or flat `copay_amount`
  - `deductible` applied if not yet met
  - `patientResponsibility = totalAmount - insuranceAmount`
- Shows clear breakdown: Insurance Covers / Patient Pays / Deductible
- Toggle: "Bill as Self-Pay" override for when patient declines insurance

### 2. New Component: `InsuranceClaimPrompt.tsx`
Post-invoice prompt shown for insured patients:
- Props: `patientId`, `invoiceId`, `totalAmount`, `insuranceAmount`, `icdCodes?`, `preAuthNumber?`
- Shows summary: "Insurance claim of SAR X can be submitted"
- "Create Insurance Claim" button → navigates to `/app/insurance/claims/new?invoice={id}&patient={patientId}`
- "Skip" option

### 3. OPD Checkout Integration
Modify `OPDCheckoutPage.tsx`:
- After charges are selected, if patient has active insurance:
  - Show `InsuranceBillingSplit` in the Payment sidebar
  - Split total into insurance portion + patient copay
  - "Pay Now" only collects patient responsibility amount
  - "Generate Invoice" creates invoice for full amount with insurance metadata
- After invoice generation, show `InsuranceClaimPrompt`

### 4. IPD Admission Insurance Check
Modify `AdmissionFormPage.tsx`:
- When `payment_mode` is set to "insurance":
  - Show `AppointmentInsuranceCheck` component below insurance fields
  - Run NPHIES eligibility verification
  - Show coverage limits and pre-auth requirement warning
  - Block admission confirmation if not eligible (with override option)

### 5. IPD Discharge Insurance Integration
Modify `DischargeFormPage.tsx`:
- Add insurance awareness to the Billing tab:
  - If admission `payment_mode === "insurance"`, show `InsuranceBillingSplit`
  - Calculate insurance vs patient split for total charges
  - Show: "Insurance: SAR X | Patient: SAR Y | Deposit Paid: SAR Z"
  - Balance due = patient responsibility - deposit
- After invoice generation, show `InsuranceClaimPrompt` with auto-populated ICD codes from discharge summary

### 6. ClaimFormPage Auto-Fill Enhancement
Modify `ClaimFormPage.tsx`:
- Accept query params: `preauth`, `icd_codes`, `admission_id`
- Auto-populate pre-auth number and ICD codes when provided
- Auto-select patient insurance based on `patient` query param

### 7. Translations
Add EN/AR/UR keys for:
- Insurance billing split labels (coverage, copay, deductible, patient responsibility)
- Claim prompt messages
- Admission eligibility warnings

## Files

| File | Action |
|------|--------|
| `src/components/insurance/InsuranceBillingSplit.tsx` | **New** — copay/coverage split calculator with eligibility check |
| `src/components/insurance/InsuranceClaimPrompt.tsx` | **New** — post-invoice claim creation prompt |
| `src/pages/app/opd/OPDCheckoutPage.tsx` | Add insurance split to payment sidebar + claim prompt after invoice |
| `src/pages/app/ipd/AdmissionFormPage.tsx` | Add eligibility check when payment_mode=insurance |
| `src/pages/app/ipd/DischargeFormPage.tsx` | Add insurance split to billing tab + claim prompt |
| `src/pages/app/billing/ClaimFormPage.tsx` | Accept preauth/icd_codes/admission_id params for auto-fill |
| `src/lib/i18n/translations/{en,ar,ur}.ts` | Insurance billing flow translations |

## KSA Operational Flow (What This Enables)

```text
Patient Arrives → Check Insurance → Verify NPHIES Eligibility
       ↓
Treatment (OPD/IPD)
       ↓
Checkout/Discharge → System Shows:
  ┌──────────────────────────────┐
  │ Total Bill:      SAR 1,000   │
  │ Insurance Covers: SAR 800    │
  │ Patient Copay:    SAR 200    │
  │ Deductible:       SAR 0      │
  │ ─────────────────────────── │
  │ Patient Pays:     SAR 200    │
  └──────────────────────────────┘
       ↓
Patient pays copay → Invoice generated
       ↓
"Create Insurance Claim?" → Auto-filled claim → Submit to NPHIES
```

