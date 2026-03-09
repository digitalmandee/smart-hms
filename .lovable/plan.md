

# Fix: OPD Checkout Currency Mismatch & Already-Paid Consultation Fee

## Issues Found (from screenshot)

1. **Currency mismatch**: The Pending Charges list uses hardcoded `Rs.` (line 547), while the Payment Summary uses hardcoded `SAR` (lines 609-624). Both should use the dynamic currency from `useCurrencyFormatter`.

2. **Consultation fee already paid still showing**: The walk-in flow correctly sets `payment_status: "paid"` and links `invoice_id`. However, the checkout page only checks `payment_status` — it does **not** check whether an `invoice_id` already exists for the consultation. If for any reason the appointment reaches checkout with `payment_status` not exactly `"paid"` (e.g., race condition, manual status change, or scheduled appointment paid at check-in), the fee reappears. The fix should also exclude consultation charges when `invoice_id` is already set on the appointment (meaning it was already invoiced during walk-in/check-in).

## Plan

### 1. Fix hardcoded currencies in `OPDCheckoutPage.tsx`

- Import and use `useCurrencyFormatter` hook (already available in the project)
- **Line 547**: Replace `Rs. {charge.amount.toLocaleString()}` → `{formatCurrency(charge.amount)}`
- **Lines 609, 613, 618, 623, 624**: Replace all `SAR {amount.toLocaleString()}` → `{formatCurrency(amount)}`

### 2. Fix consultation fee appearing when already invoiced

- **Line 180**: Add `!appointment.invoice_id` to the condition, so consultation fee is excluded when an invoice already exists for this appointment:
```typescript
if (appointment && !appointment.invoice_id && 
    appointment.payment_status !== "paid" && 
    appointment.payment_status !== "waived") {
```

### 3. Fix hardcoded `Rs.` in `PatientAdmissionHistory.tsx`

- **Line 159**: Replace `Rs. {unbilledData.total.toLocaleString()}` with dynamic currency formatting.

## Files to modify
- `src/pages/app/opd/OPDCheckoutPage.tsx` — fix currency + consultation fee logic
- `src/components/patients/PatientAdmissionHistory.tsx` — fix hardcoded `Rs.`

