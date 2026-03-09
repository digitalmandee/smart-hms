

# Fix: Walk-in Payment Status Not Persisting + Remove Pay Later

## Root Cause

The walk-in flow creates the invoice and payment FIRST (steps 1-2), then creates the appointment (step 3), then tries to link them with a separate `.update()` call (step 4). This update is silently failing — no error is returned but 0 rows are modified.

**Database proof**: Invoice `INV-20260309-298` is `status: paid`, `paid_amount: 2000`. Appointment `55d991f7` has `payment_status: pending`, `invoice_id: null`.

The separate `.update()` after insert is unreliable. The fix is to eliminate it entirely by passing `invoice_id` directly in the appointment insert.

## Fix 1: Pass invoice_id directly in appointment creation

In `OPDWalkInPage.tsx`, instead of creating the appointment and then updating it, pass `invoice_id: invoice.id` directly in the `createAppointment.mutateAsync()` call. This ensures the appointment is created with both `payment_status: 'paid'` and `invoice_id` in a single atomic insert — no second update needed.

```
Before:
  1. Create invoice → invoice.id
  2. Record payment
  3. Create appointment (no invoice_id)
  4. Update appointment with invoice_id ← FAILING SILENTLY

After:
  1. Create invoice → invoice.id
  2. Record payment
  3. Create appointment WITH invoice_id ← single atomic insert
```

Remove the separate `.update()` call (lines 407-415) since it's no longer needed.

## Fix 2: Remove Pay Later and Waive Fee from walk-in

The screenshot confirms these options exist in the UI (lines 873-900). Per user's requirement, walk-in always requires payment. Remove:
- The "Alternative Options" section (Pay Later + Waive Fee buttons) from the payment step UI
- The `handlePayLater` function (lines 232-277)
- The `handleWaiverConfirm` function and waiver dialog references (lines 280-330)
- The `FeeWaiverDialog` import and component

## Fix 3: Hardcoded Rs. on line 898

Replace `Rs. {selectedDoctor.fee.toLocaleString()}` with `formatCurrency(selectedDoctor.fee)`.

## Files to modify
- `src/pages/app/opd/OPDWalkInPage.tsx` — all three fixes

