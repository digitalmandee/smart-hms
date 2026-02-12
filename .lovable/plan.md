

# POS Terminal Bug Fixes -- Bill Calculation, Exact Button, and Branding

## Issues Found

### 1. "Exact" Button Sets Wrong Amount
In `POSPaymentModal.tsx` (line 199), the "Exact" button does:
```
Math.ceil(total / 100) * 100
```
This rounds the total UP to the next multiple of 100 (e.g., Rs. 350 becomes Rs. 400). It should set the cash received to the exact total amount.

**Fix:** Change to just `total` so it sets the exact amount due.

### 2. Bill Calculation Mismatch (Display vs Saved)
The POS terminal page calculates the displayed subtotal using `item.selling_price` (line 189), but when the transaction is saved in `usePOS.ts`, it recalculates using `item.unit_price` (line 210). If `selling_price` and `unit_price` differ for a product, the customer sees one total on screen but a different amount gets recorded in the database.

**Fix:** Align both calculations to use `selling_price` consistently, since that's the actual price charged to customers. In the `useCreateTransaction` hook, replace `item.unit_price` references with `item.selling_price` in the totals calculation and item insertion.

### 3. "Smart HMS" Hardcoded in Receipt
The `POSReceiptPreview.tsx` component has "Smart HMS Pharmacy" as the default organization name (line 12) and "Powered by Smart HMS" in the footer (line 218). These should use the actual organization branding or a generic fallback.

**Fix:** Change default from "Smart HMS Pharmacy" to just "Pharmacy" and remove the "Powered by Smart HMS" footer line, or replace with a neutral message.

---

## Files Modified

| File | Change |
|---|---|
| `src/components/pharmacy/POSPaymentModal.tsx` | Fix "Exact" button: change `Math.ceil(total / 100) * 100` to `total` |
| `src/hooks/usePOS.ts` | Fix calculation: use `selling_price` instead of `unit_price` in totals and item records |
| `src/components/pharmacy/POSReceiptPreview.tsx` | Remove "Smart HMS" hardcoded branding; use neutral defaults |

