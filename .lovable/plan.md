

# Unify IPD Deposit System with Patient Deposits + Correct GL

## Problem
Currently, IPD admission deposits use a **wrong accounting path**:
- `useCreateDepositInvoice` creates an invoice → triggers `post_invoice_to_journal` → **DR AR, CR Revenue** (incorrect)
- No record created in `patient_deposits` table → deposit not visible as available credit
- The deposit is treated as revenue instead of a liability

**Correct accounting**: DR Cash/Bank, CR Patient Deposits Liability (`LIA-DEP-001`)

## Solution

### 1. Rewrite `useIPDDeposit.ts` — Stop creating invoices for deposits

Replace `useCreateDepositInvoice` with a new approach that:
- Creates a `patient_deposits` record (type: `deposit`) instead of an invoice
- Returns the deposit record so it can be linked to the admission

Replace `useRecordDepositPayment` with logic that:
- Updates the deposit record status to `completed`
- Posts the correct GL entry: **DR Cash/Bank, CR Patient Deposits Liability**

The GL posting will be done client-side by inserting into `journal_entries` + `journal_entry_lines` using `get_or_create_default_account` for the accounts (similar to how other modules post).

### 2. Update `AdmissionFormPage.tsx` — Use new deposit flow

**`handlePaymentComplete`** (line 215-257):
- Call `useCreatePatientDeposit` instead of `useCreateDepositInvoice`
- Pass `payment_method_id`, `reference_number`, `notes` directly
- No separate payment recording needed — the deposit IS the payment
- Link deposit to admission via notes/reference

**`handlePayLater`** (line 259-286):
- Create a `patient_deposits` record with `status: 'pending'` instead of an unpaid invoice
- No GL entry yet (cash not received)

**`handleSkipDeposit`** (line 288-296): No change needed.

### 3. Add GL posting function to `useIPDDeposit.ts`

New `usePostDepositToGL` mutation:
```ts
// DR Cash/Bank (CASH-001), CR Patient Deposits Liability (LIA-DEP-001)
// reference_type: 'patient_deposit', reference_id: deposit.id
```

Uses `get_or_create_default_account` DB function to ensure accounts exist.

### 4. Update `useLinkAdmissionInvoice` → `useLinkAdmissionDeposit`

Change from updating `admission_invoice_id` to storing the deposit reference. Since admissions table has `admission_invoice_id`, we'll keep using it for backward compatibility but also store deposit info in the admission's payment tracking.

## Files Changed
- `src/hooks/useIPDDeposit.ts` — rewrite to use `patient_deposits` + GL posting instead of invoices
- `src/pages/app/ipd/AdmissionFormPage.tsx` — update payment handlers to use new deposit flow
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — add labels for deposit receipt

## Accounting Flow After Fix

```text
Admission with deposit paid:
  1. patient_deposits INSERT (type: deposit, status: completed)
  2. journal_entries INSERT (reference_type: patient_deposit)
     - Line 1: DR CASH-001 (Cash in Hand)
     - Line 2: CR LIA-DEP-001 (Patient Deposits Liability)
  3. admissions INSERT (payment_status: paid)

Pay Later:
  1. patient_deposits INSERT (type: deposit, status: pending)
  2. No GL entry (no cash exchanged)
  3. admissions INSERT (payment_status: pay_later)
```

