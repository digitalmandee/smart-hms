

# Fix: Mark IPD Charges as Billed After Discharge Invoice

## Problem
In `useGenerateIPDInvoice` (src/hooks/useDischarge.ts), after creating the discharge invoice:
- Pharmacy credits are correctly marked as `status: "invoiced"` (line 583-589)
- **IPD charges are never marked as `is_billed = true`** — this means the same charges can be invoiced again

## Fix
Add a single update after the invoice items are inserted (after line 589), marking all fetched `ipd_charges` as billed:

```ts
// Mark IPD charges as billed
if (charges && charges.length > 0) {
  await supabase
    .from("ipd_charges")
    .update({ is_billed: true })
    .in("id", charges.map(c => c.id));
}
```

This goes right after the pharmacy credits update block (line 589), before the deposit payment logic.

## Files Changed
- `src/hooks/useDischarge.ts` — add `is_billed = true` update after invoice generation (~3 lines)

