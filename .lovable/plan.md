

# Split Payment GL Routing — Audit Result

## Current Status: Working Correctly ✅

The `post_payment_to_journal` trigger already routes each payment to the correct GL account based on payment method:

```text
PAYMENT METHOD    LEDGER ACCOUNT         GL CODE    STATUS
────────────────  ─────────────────────  ─────────  ──────
Cash              Cash in Hand           CASH-001   ✅ Correct
Bank Transfer     Bank Account-Current   1010       ✅ Correct
Credit Card       Bank Account-Current   1010       ✅ Correct
EasyPaisa         Bank Account-Current   1010       ✅ Correct
JazzCash          Cash in Hand           CASH-001   ⚠️ Should be Bank?
```

**How it works**: Each split payment is recorded as a separate row in the `payments` table. The database trigger `post_payment_to_journal` fires per row, looks up `payment_methods.ledger_account_id`, and creates a journal entry:
- **DR**: The payment method's linked account (Cash or Bank)
- **CR**: AR-001 (Accounts Receivable)

So a split payment of Rs. 5,000 Cash + Rs. 10,000 Bank Transfer creates two journal entries — one hitting CASH-001 and one hitting 1010.

## One Fix Needed

**JazzCash** is currently mapped to `CASH-001` (Cash in Hand) instead of `1010` (Bank Account - Current). Since JazzCash is a digital wallet, it should hit the bank account like EasyPaisa does.

### Migration

Update `payment_methods.ledger_account_id` for JazzCash rows to point to the Bank Account for each organization:

```sql
-- Org b1: JazzCash → Bank Account - Current
UPDATE payment_methods 
SET ledger_account_id = '280997ad-4971-4e03-a032-cae3077106b0'
WHERE id = 'f2a22222-2222-2222-2222-222222222222';

-- Org b2: JazzCash → Bank Account - Current  
UPDATE payment_methods 
SET ledger_account_id = '84791e97-9491-437c-9b1f-3e142e780ef2'
WHERE id = 'f7a77777-7777-7777-7777-777777777777';
```

Wait — Org b2's bank account is `6ace12c8` (code 1010), but JazzCash currently points to `84791e97` (CASH-001). Let me correct:

```sql
UPDATE payment_methods 
SET ledger_account_id = '6ace12c8-15d0-4778-b38d-1ef4ff83fffd'
WHERE id = 'f7a77777-7777-7777-7777-777777777777';
```

### Files to Change
- **Migration only** — one SQL migration to fix JazzCash ledger mapping
- No code changes needed — the trigger and split payment logic are already correct

