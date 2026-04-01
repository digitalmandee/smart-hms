

# Fix: GRN Journal Posting — Duplicate Entries + Organization ID Error

## Problems Found

### 1. Duplicate Journal Entries
GRN `GRN-20260401-0002` has **two** identical journal entries (`JE-GRN-260401-7496` and `JE-GRN-260401-1924`), both posting Rs. 1,000. This doubles the Inventory Asset and Accounts Payable balances. The trigger has no idempotency guard — if the status is set to `verified` more than once (or the row is updated again while already `verified`), it fires again.

### 2. Organization ID Error
The error "Couldn't find organization id inncache" likely comes from `get_or_create_default_account` when `organization_id` is NULL on the GRN row. This can happen if a GRN is created without a properly loaded user profile (e.g., profile still loading when the form submits). The trigger then passes `NULL` to `get_or_create_default_account`, which fails to find any matching account type.

## Fix (Single Migration)

### A. Add Idempotency Check to `post_grn_to_journal`
Before inserting, check if a journal entry already exists for this GRN:
```sql
IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_type = 'grn' AND reference_id = NEW.id) THEN
  RETURN NEW;
END IF;
```

### B. Guard Against NULL Organization ID
Add a NULL check before calling `get_or_create_default_account`:
```sql
IF NEW.organization_id IS NULL THEN
  RAISE WARNING 'GRN % has no organization_id, skipping journal posting', NEW.grn_number;
  RETURN NEW;
END IF;
```

### C. Clean Up Existing Duplicate
Delete the duplicate journal entry and its lines for GRN-0002, then recalculate balances for `INV-001` and `AP-001`.

## Technical Details

Migration will:
1. Delete duplicate journal entry `JE-GRN-260401-1924` (keep `JE-GRN-260401-7496`)
2. Recalculate `current_balance` for INV-001 and AP-001
3. Recreate `post_grn_to_journal` with idempotency + NULL guards
4. Recreate the trigger

## Files Changed
- `supabase/migrations/new.sql` — updated trigger function + data cleanup

