

# Fix: Deposit GL Should Use Payment Method's Ledger Account, Not Hardcoded Petty Cash

## Problem
The `post_patient_deposit_to_journal` trigger always debits `CASH-001` (Petty Cash) for deposits and credits it for refunds — regardless of which payment method was actually used (card, bank transfer, etc.).

The payment trigger (`post_payment_to_journal`) already does this correctly:
```sql
SELECT ledger_account_id INTO v_payment_method_account 
FROM public.payment_methods WHERE id = NEW.payment_method_id;
```

The deposit trigger ignores `payment_method_id` entirely.

## Fix

Update the `post_patient_deposit_to_journal` function to:

1. **Check `NEW.payment_method_id`** — if set, look up `payment_methods.ledger_account_id`
2. **Use that account** as the debit target for deposits and credit target for refunds
3. **Fall back to `CASH-001`** only when no payment method is specified (same pattern as the payment trigger)

### Changes in the trigger (deposit type):
```sql
-- Before creating journal lines:
IF NEW.payment_method_id IS NOT NULL THEN
  SELECT ledger_account_id INTO v_payment_method_account 
  FROM public.payment_methods WHERE id = NEW.payment_method_id;
END IF;

IF v_payment_method_account IS NOT NULL THEN
  v_cash_account := v_payment_method_account;
ELSE
  v_cash_account := get_or_create_default_account(org, 'CASH-001', 'Cash in Hand', 'asset');
END IF;
```

Same logic applied to the **refund** type block.

The **applied** type block is unaffected (it uses LIA-DEP-001 and AR-001, no cash movement).

## Files Changed
- `supabase/migrations/new.sql` — Update `post_patient_deposit_to_journal` to resolve the correct account from `payment_method_id`

