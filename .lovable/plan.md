

# Fix: Duplicate GL Posting for IPD Deposits + Verify Ali Raza's Data

## Problem Found
Ali Raza's IPD admission deposit of **Rs. 100,000** is correctly recorded in `patient_deposits` and shows in the patient billing history. However, the GL has **two journal entries** for the same deposit:

1. `JE-DEP-260401-4985` — posted by the **database trigger** `post_patient_deposit_journal` (fires on INSERT into `patient_deposits`)
2. `JE-20260401-0006` — posted by **client-side code** in `useIPDDeposit.ts` (lines 54-121)

This means Rs. 200,000 is hitting Cash and Liability accounts instead of Rs. 100,000.

The admission itself has no `admission_invoice_id` (correct — deposits are no longer invoices), and the deposit shows correctly in the patient's billing tab.

## Solution

### 1. Remove duplicate GL posting from `useIPDDeposit.ts`
Delete the entire GL posting block (lines 54-121) from `useCreateIPDDeposit`. The DB trigger `post_patient_deposit_to_journal` already handles this correctly and automatically.

Keep only:
- Patient deposit record creation (lines 33-51)
- Return the deposit

### 2. Fix the duplicate journal entry for Ali Raza
Create a migration to delete the extra client-side journal entry (`JE-20260401-0006`) and its lines, so the GL is accurate.

### 3. Verify IPD Billing Dashboard shows deposit
The `useIPDBillingStats` hook already queries `patient_deposits` for active admissions (updated in the previous fix). Ali Raza's Rs. 100,000 should show as the deposit amount.

## Files Changed
- `src/hooks/useIPDDeposit.ts` — remove client-side GL posting (the DB trigger handles it)
- `supabase/migrations/new.sql` — delete the duplicate journal entry for Ali Raza

## Summary
- **Deposit record**: Working correctly in `patient_deposits`
- **Patient profile billing tab**: Shows deposit correctly
- **IPD Billing Dashboard**: Shows deposit via `patient_deposits` query
- **GL**: Fix double-posting by removing redundant client-side code
- **No invoice created**: Correct — deposits are no longer invoices (by design)

