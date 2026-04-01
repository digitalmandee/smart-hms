

# Deposit-to-Settlement GL Flow: Analysis & Gap Fix

## Current Flow (What Works)

```text
STEP 1: Patient Deposit Collected
  ┌──────────────────────────────────────────────────────┐
  │ INSERT patient_deposits (type: 'deposit', amount: X) │
  │ DB Trigger: post_patient_deposit_to_journal          │
  │   DR  CASH-001 (Cash in Hand)         X              │
  │   CR  LIA-DEP-001 (Patient Deposits)  X              │
  └──────────────────────────────────────────────────────┘

STEP 2: Invoice Created (services/procedures added)
  ┌──────────────────────────────────────────────────────┐
  │ INSERT invoices (total_amount: Y)                     │
  │ DB Trigger: post_invoice_to_journal                  │
  │   DR  AR-001 (Accounts Receivable)    Y              │
  │   CR  REV-001 (Service Revenue)       Y              │
  └──────────────────────────────────────────────────────┘

STEP 3: Payment Collected (cash/card against invoice)
  ┌──────────────────────────────────────────────────────┐
  │ INSERT payments (amount: Z)                           │
  │ DB Trigger: post_payment_to_journal                  │
  │   DR  CASH-001 (or payment method)    Z              │
  │   CR  AR-001 (Accounts Receivable)    Z              │
  └──────────────────────────────────────────────────────┘

STEP 4: Deposit Applied to Invoice
  ┌──────────────────────────────────────────────────────┐
  │ INSERT patient_deposits (type: 'applied', amount: A) │
  │ + INSERT payments (amount: A against invoice)        │
  │                                                       │
  │ Payment trigger fires:                                │
  │   DR  CASH-001    A  ← WRONG! Cash wasn't received   │
  │   CR  AR-001      A  ← Correct, AR is reduced        │
  │                                                       │
  │ Deposit trigger: NOTHING (only handles deposit/refund)│
  │   ⚠ LIA-DEP-001 is NEVER debited                     │
  └──────────────────────────────────────────────────────┘

STEP 5: Deposit Refund (excess returned)
  ┌──────────────────────────────────────────────────────┐
  │ INSERT patient_deposits (type: 'refund', amount: R)  │
  │ DB Trigger fires:                                     │
  │   DR  LIA-DEP-001    R  ← Correct                    │
  │   CR  CASH-001       R  ← Correct                    │
  └──────────────────────────────────────────────────────┘
```

## Critical Bug Found

**When deposit is applied to an invoice (Step 4), two problems occur:**

1. The **payment trigger** posts `DR CASH / CR AR` — but no cash was received; the deposit (already in the system as a liability) should be consumed instead.
2. The **deposit trigger** ignores `type = 'applied'` — so `LIA-DEP-001` is never debited.

**Net effect**: Cash account is inflated (double-counted), and Patient Deposits Liability is never cleared.

### Correct GL for "Apply Deposit":
```text
DR  LIA-DEP-001 (Patient Deposits)     A   ← Liability decreases
CR  AR-001 (Accounts Receivable)        A   ← AR decreases
```
No cash movement — it's an internal transfer from liability to clear receivable.

## Fix Plan

### 1. Update DB trigger `post_patient_deposit_to_journal` to handle `type = 'applied'`

Add an `ELSIF` block for `type = 'applied'`:
```sql
ELSIF NEW.type = 'applied' AND COALESCE(NEW.amount, 0) > 0 THEN
  -- DR Patient Deposits Liability (clear the advance)
  -- CR Accounts Receivable (reduce what patient owes)
  v_deposit_liability_account := get_or_create_default_account(org, 'LIA-DEP-001', ...);
  v_ar_account := get_or_create_default_account(org, 'AR-001', ...);
  
  DR LIA-DEP-001  amount
  CR AR-001       amount
```

### 2. Remove the redundant payment record when applying deposit

In `InvoiceDetailPage.tsx` `handleApplyDeposit`:
- **Keep** the `patient_deposits` INSERT with `type: 'applied'` (this triggers the correct GL)
- **Keep** the payment record INSERT (needed to update `invoice.paid_amount` and status)
- But the payment trigger will also fire GL — so we need to **prevent double GL**

**Solution**: Either:
- (A) Skip the payment INSERT entirely and instead directly update `invoices.paid_amount` and `status` — avoids the payment trigger's wrong GL entry
- (B) Add a flag/convention (e.g., `reference_number = 'DEPOSIT_APPLICATION'`) and have the payment trigger skip GL when it sees this marker

**Recommended: Option A** — Update invoice paid_amount directly instead of creating a payment, since no actual payment occurred. The deposit application GL is handled by the deposit trigger.

### 3. Same fix for `PaymentCollectionPage.tsx`

The "Apply Deposit" button there also needs the same treatment — currently it just pre-fills the payment form amount, which creates a normal payment (DR Cash / CR AR). Should instead create `patient_deposits` type='applied' + direct invoice update.

## Files Changed

- **`supabase/migrations/new.sql`** — Add `ELSIF type = 'applied'` to `post_patient_deposit_to_journal` trigger (DR LIA-DEP-001, CR AR-001)
- **`src/pages/app/billing/InvoiceDetailPage.tsx`** — Fix `handleApplyDeposit` to skip payment INSERT, directly update invoice `paid_amount` and `status`
- **`src/pages/app/billing/PaymentCollectionPage.tsx`** — Fix "Apply Deposit" to use `patient_deposits` type='applied' + direct invoice update instead of payment form

## Result After Fix

```text
Deposit Collected (Rs. 100,000):
  DR CASH-001        100,000
  CR LIA-DEP-001     100,000

Invoice Created (Rs. 80,000):
  DR AR-001           80,000
  CR REV-001          80,000

Deposit Applied to Invoice (Rs. 80,000):
  DR LIA-DEP-001      80,000   ← Liability cleared
  CR AR-001            80,000   ← AR cleared
  (Invoice marked as paid, no cash movement)

Remaining Deposit Balance: Rs. 20,000 (still in LIA-DEP-001)

Refund of excess (Rs. 20,000):
  DR LIA-DEP-001      20,000
  CR CASH-001          20,000
```

All accounts balanced. No double-counting.

