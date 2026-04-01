

# Verification Results + Fix Account Name

## Current State (Verified)

### ✓ What's Working
1. **Deposit Record**: Alii Raza Rs. 100,000 in `patient_deposits` — status `completed`, linked to billing session
2. **GL Entry**: `JE-DEP-260401-4985` — DR CASH-001 Rs. 100,000 / CR LIA-DEP-001 Rs. 100,000 — correctly posted
3. **Desktop Invoice List**: `useDepositRows` in `InvoicesListPage.tsx` queries `patient_deposits` and merges with invoices — deposit appears with "Deposit" badge
4. **Patient Profile**: `PatientBillingHistory.tsx` has "Deposits & Advances" section querying `usePatientDeposits(patientId)` — shows deposit correctly
5. **Payment Method Linking**: Cash payment method correctly mapped to `CASH-001` via `ledger_account_id`

### Issue: Account Named "Petty Cash"
The `CASH-001` account is displayed as **"Petty Cash"** in the GL. This is confusing because it's the main cash collection account, not a petty cash fund. Should be renamed to **"Cash in Hand"** for clarity.

## Fix

### Migration: Rename CASH-001 from "Petty Cash" to "Cash in Hand"

```sql
UPDATE public.accounts
SET name = 'Cash in Hand'
WHERE account_number = 'CASH-001'
  AND name = 'Petty Cash';
```

This ensures that when users view the GL, the deposit correctly shows as hitting **"Cash in Hand"** (CASH-001) — not the misleading "Petty Cash" label.

## Files Changed
- `supabase/migrations/new.sql` — rename CASH-001 to "Cash in Hand"

