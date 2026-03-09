

# Fix: Walk-in Payment Not Persisting to Appointment

## Root Cause

The walk-in flow at `OPDWalkInPage.tsx` creates the appointment with `payment_status: "paid"` in the insert, but the database column has a **default of `'pending'`**. The insert appears to not be persisting the `payment_status` value, and the subsequent `invoice_id` update (line 406-409) doesn't include `payment_status` either, has no error handling, and may be silently failing.

**Evidence from the database:**
- Invoice `INV-20260309-062` exists, is paid (Rs. 2,000) — created at 17:34:35
- Appointment `4aabf621` has `payment_status: "pending"` and `invoice_id: null` — created at 17:34:38
- The invoice is orphaned (not linked to any appointment)

## Fix

### In `src/pages/app/opd/OPDWalkInPage.tsx` (lines 405-409)

Merge the `invoice_id` linking with an explicit `payment_status: "paid"` update, and add error handling:

```typescript
// Link invoice to appointment AND ensure payment_status is set
const { error: linkError } = await supabase
  .from('appointments')
  .update({ 
    invoice_id: invoice.id,
    payment_status: 'paid'
  })
  .eq('id', appointment.id);

if (linkError) {
  console.error('Failed to link invoice to appointment:', linkError);
}
```

This ensures that even if the insert doesn't persist `payment_status`, the explicit update after creation will set both `invoice_id` and `payment_status: "paid"` correctly.

### Also fix the hardcoded `Rs.` on line 351

Replace `Rs. ${receivedAmount}` and `Rs. ${selectedDoctor.fee}` with `formatCurrency()`.

## Files to modify
- `src/pages/app/opd/OPDWalkInPage.tsx` — fix invoice linking + payment_status update + error handling + currency formatting

