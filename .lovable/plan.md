

# NPHIES Module QA Audit — Findings & Fixes

## Audit Scope
Reviewed all NPHIES/Insurance modules: Claims CRUD, Claim Scrubbing, Batch Submission, Payment Reconciliation, Eligibility, Pre-Auth, Transaction Logs, Denial Management, Attachments, NPHIES Settings/Analytics, Medical Coding, and the nphies-gateway edge function.

---

## Issues Found

### 1. ClaimAttachments NOT wired into ClaimDetailPage (BUG)
`ClaimAttachments.tsx` component exists and is fully built, but it is **never imported or rendered** in `ClaimDetailPage.tsx`. Attachments are invisible to users.

**Fix:** Import `ClaimAttachments` in `ClaimDetailPage.tsx` and add an Attachments card section after the Insurance Information card.

---

### 2. ClaimFormPage scrub validation does NOT block submission (BUG)
The `onSubmit` handler in `ClaimFormPage.tsx` runs scrub but the form's `handleSubmit` still calls `onSubmit` regardless of errors. The scrub runs via a separate "Validate" button only — pressing "Create Claim" bypasses validation entirely.

**Fix:** Run `scrubClaim()` inside `onSubmit`. If `hasErrors(results)` is true, show results and return early (block submission). Allow submission only when no errors exist.

---

### 3. ClaimDetailPage scrub validation does NOT block NPHIES submission
The "Run Validation" button and "Submit to NPHIES" button are independent — a user can click Submit to NPHIES without running validation first.

**Fix:** Run `scrubClaim()` inside `handleSubmitToNphies`. If errors exist, show results and block. Allow override for warnings only.

---

### 4. BatchSubmitDialog — `patient_insurance` relationship may be undefined
The dialog accesses `claim.patient_insurance?.patient?.first_name` but the `InsuranceClaim` type from `useInsuranceClaims` may not always include the nested join. Need to verify the claims passed to the dialog include the relationship.

**Fix:** Verify `useInsuranceClaims` includes the `patient_insurance` join (it does based on the hook). No code change needed — just defensive rendering already in place with `?.`.

---

### 5. Payment Reconciliation — missing `patient_insurance_id` in query join syntax
The query uses `patient_insurance:patient_insurance(...)` but the FK column is `patient_insurance_id`. PostgREST may fail if the relationship alias doesn't match.

**Fix:** Verify the query works or change to `patient_insurance:patient_insurances!patient_insurance_id(...)` if needed.

---

### 6. ClaimAttachments uses `as any` cast for `claim_attachments` table
The component casts `supabase.from("claim_attachments" as any)` because the table was added via migration but `types.ts` is auto-generated and may not include it yet. This is expected behavior — no fix needed, just noting it.

---

## Summary of Required Fixes

| # | Issue | File | Severity |
|---|-------|------|----------|
| 1 | ClaimAttachments not rendered | `ClaimDetailPage.tsx` | High |
| 2 | Claim form doesn't block on scrub errors | `ClaimFormPage.tsx` | High |
| 3 | NPHIES submit doesn't auto-validate | `ClaimDetailPage.tsx` | Medium |
| 4 | Batch dialog defensive rendering | Already handled | None |
| 5 | Reconciliation query join syntax | `usePaymentReconciliation.ts` | Low (verify) |

---

## Implementation Plan

### File: `src/pages/app/billing/ClaimDetailPage.tsx`
- Import `ClaimAttachments` from `@/components/insurance/ClaimAttachments`
- Add an Attachments section after the Notes card (line ~611), rendering `<ClaimAttachments claimId={claim.id} readOnly={claim.status === 'paid'} />`
- Modify `handleSubmitToNphies` to run `scrubClaim()` first; if `hasErrors()`, set scrub results and return early with a toast warning

### File: `src/pages/app/billing/ClaimFormPage.tsx`
- Modify `onSubmit` to run `scrubClaim()` before creating the claim; if `hasErrors()`, show results and return early (do not call `createClaim`)

All changes are small (5-15 lines each), no new files needed.

