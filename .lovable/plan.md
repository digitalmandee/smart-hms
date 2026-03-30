

# Fix: Invoice balance_amount Not Updated on Payment

## Root Cause

In `src/hooks/useBilling.ts` line 602-609, `useRecordPayment` updates the invoice's `paid_amount` and `status` but **does not update `balance_amount`**. This means `balance_amount` stays at whatever it was set to when the invoice was created (usually `total_amount`), even after full payment.

## Fix

### 1. File: `src/hooks/useBilling.ts` (line 602-609)

Add `balance_amount` to the update:

```typescript
.update({
  paid_amount: newPaidAmount,
  balance_amount: Math.max(0, totalAmount - newPaidAmount),
  status: newStatus,
})
```

### 2. Fix stale invoice data

Use the insert tool to run:
```sql
UPDATE invoices 
SET balance_amount = GREATEST(0, total_amount - COALESCE(paid_amount, 0))
WHERE balance_amount != GREATEST(0, total_amount - COALESCE(paid_amount, 0))
   OR (balance_amount IS NULL AND paid_amount > 0);
```

This corrects all existing invoices where `balance_amount` is wrong — not just the 3 identified earlier, but any that drifted.

## Files Changed
- `src/hooks/useBilling.ts` — add `balance_amount` to payment update (1 line)
- Data fix via insert tool — correct all stale invoices

