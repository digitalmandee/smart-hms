## INS-02 — Insurance `.single()` cleanup + real ERA payment reference

Close out Sprint 1 P0 by fixing the insurance hooks and the synthetic payment-reference posting flow.

### Problems today

1. **`.single()` everywhere in `useInsurance.ts`** (12 call sites) — any race condition, soft-delete, or RLS-filtered miss throws "JSON object requested, multiple (or no) rows returned" and the entire mutation rolls back with a cryptic error. Per project rule: never `.single()`, use `.maybeSingle()` for reads and `.select()` + `data?.[0]` for inserts/updates.
2. **`usePaymentReconciliation.ts` → `usePostToAccounts`** has two real bugs:
   - Fabricates a payment ref: `payment_reference: \`ERA-${Date.now()}\``. Operationally this means there's no link to the actual insurer remittance — reconciliation against bank statement and ERA file becomes impossible.
   - Reads `approved_amount` with `.single()` inside another mutation, and updates with no `.select()`. If the claim was just modified concurrently, this swallows the conflict.
3. **No payment row written** when posting an insurance settlement — only the claim row is stamped. The patient AR-Insurance balance never clears and the `payments` history doesn't show the insurer remittance, so the patient statement and outstanding-AR reports under-count receipts.

### Changes

#### 1. `src/hooks/useInsurance.ts`
Replace all 12 `.single()` calls:
- Read queries (`useInsuranceCompany`, `useInsurancePlan`, `useInsuranceClaim`) → `.maybeSingle()` and null-guard before mapping `attachments`/`covered_services`.
- Insert/update mutations (`useCreateInsuranceCompany`, `useUpdateInsuranceCompany`, `useCreateInsurancePlan`, `useUpdateInsurancePlan`, `useCreatePatientInsurance`, `useUpdatePatientInsurance`, `useCreateInsuranceClaim`, `useUpdateInsuranceClaim`, `useSubmitClaim`) → drop `.single()`, keep `.select()`, return `data?.[0]`.
- `useCreateInsuranceClaim` also maps any empty-string UUIDs (`invoice_id`) to `null` before insert.

#### 2. `src/hooks/usePaymentReconciliation.ts` — rewrite `usePostToAccounts`
New mutation signature:
```ts
usePostToAccounts.mutate({
  claimId,
  paymentReference,   // required, user-entered ERA/EFT/cheque #
  paymentDate,        // required
  paidAmount,         // defaults to approved_amount, but editable
  paymentMethodId,    // FK to payment_methods, defaults to "Insurance Settlement"
  notes,
})
```
Behavior:
- Validate `paymentReference` is non-empty (trim). Reject synthetic `ERA-<timestamp>` shaped strings.
- Pre-read claim with `.maybeSingle()` to get `approved_amount`, `invoice_id`, `organization_id`.
- Insert a row into `payments` linked to the underlying invoice (`invoice_id` from the claim) so the patient AR and the invoice's `paid_amount` get the standard trigger-driven updates. This is the path that posts the journal (`DR Cash/Bank, CR AR-Insurance`) via the existing payment trigger — no manual GL.
- Update the `insurance_claims` row: `status='paid'`, `paid_amount`, `payment_date`, `payment_reference`, with `.select()` + `data?.[0]`.
- Invalidate `["reconciliation-claims"]`, `["insurance-claims"]`, `["payments"]`, `["invoice", invoiceId]`, `["patient-balance"]`.

#### 3. `src/pages/app/billing/ClaimReconciliationPage.tsx` (the page that calls `usePostToAccounts`)
Replace the one-click "Post to accounts" button with a small dialog `PostClaimPaymentDialog`:
- ERA / EFT / Cheque reference (required text input)
- Payment date (defaults to today)
- Paid amount (defaults to `approved_amount`, editable, must be > 0 and ≤ approved_amount)
- Payment method dropdown (uses existing `PaymentMethodSelector`)
- Notes (optional)
- Submit calls the new mutation; closes on success.

Translation keys added to `en.ts`, `ar.ts`, `ur.ts`:
- `insurance.postPaymentTitle`, `insurance.eraReference`, `insurance.eraReferenceRequired`, `insurance.paidAmount`, `insurance.invalidPaymentRef`, `insurance.paymentPostedSuccess`.

### Out of scope (deferred to later sprints)
- ERA file ingestion (INS-01, Sprint 3) — this is the manual posting path; the bulk ERA path will reuse the same mutation.
- NPHIES auto-reconciliation webhook.

### Files touched
- `src/hooks/useInsurance.ts` (edit)
- `src/hooks/usePaymentReconciliation.ts` (edit)
- `src/pages/app/billing/ClaimReconciliationPage.tsx` (edit)
- `src/components/billing/PostClaimPaymentDialog.tsx` (new)
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` (edit)

### Verification
- Trigger the post-payment dialog with empty / fake `ERA-12345` ref → blocked.
- Post a real payment → `payments` row exists, invoice `paid_amount` updated by trigger, `journal_entries` shows DR Cash/Bank + CR AR-Insurance via the standard payment trigger, claim status flips to `paid`, settlement status returns `posted`.
- Patient statement (`usePatientStatement`) shows the insurer payment line.

After this lands, Sprint 1 P0 backlog is empty and we open Sprint 2 with BIL-02.