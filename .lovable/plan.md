

# Fix: Deposit Application Missing GL Posting

## Problem Found
When an IPD discharge invoice is generated, the code inserts a `patient_deposits` record with `type = 'applied'` (useDischarge.ts line 614-628). However, the database trigger `post_patient_deposit_to_journal` only handles two types:
- `type = 'deposit'` → DR Cash, CR Patient Deposits Liability
- `type = 'refund'` → DR Patient Deposits Liability, CR Cash

**`type = 'applied'` is completely ignored** — no GL entry is created. This means:
- The deposit liability (LIA-DEP-001) is never cleared
- Accounts Receivable (AR-001) is never reduced by the applied deposit amount
- The GL is out of balance for every IPD discharge where deposit was applied

## Required GL Entry for Deposit Application
```text
DR  Patient Deposits Liability (LIA-DEP-001)   applied_amount
CR  Accounts Receivable (AR-001)                applied_amount
```
This clears the liability and reduces the receivable simultaneously.

## Fix

### Migration: Add `type = 'applied'` handling to the trigger

Update `post_patient_deposit_to_journal()` to add an `ELSIF` block for `type = 'applied'`:

```sql
ELSIF NEW.type = 'applied' AND COALESCE(NEW.amount, 0) > 0 THEN
  v_deposit_liability_account := get_or_create_default_account(
    NEW.organization_id, 'LIA-DEP-001', 'Patient Deposits', 'liability');
  v_ar_account := get_or_create_default_account(
    NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
  
  -- JE: DR LIA-DEP-001, CR AR-001
  entry_number = 'JE-DAPP-...'
  reference_type = 'deposit_application'
  
  UPDATE patient_deposits SET journal_entry_id = v_journal_id WHERE id = NEW.id;
```

This ensures every deposit application creates the correct double-entry journal posting.

### Backfill: Fix existing deposit applications that have no journal entry

A second SQL statement will create journal entries for any existing `type = 'applied'` records that were inserted without GL posting. This will correct the historical data.

## Files Changed
- `supabase/migrations/new.sql` — update trigger function + backfill existing records

