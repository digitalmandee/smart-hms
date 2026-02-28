

# Fix: Payment Shows Pending Even After Collection

## Root Cause
The appointments have `invoice_id = NULL` and `payment_status = 'pending'`, but paid invoices exist for the same patients today. The billing flow creates invoices independently without linking them back to the appointment record. The trigger only works when `invoice_id` is set on the appointment, so it never fires.

## Solution

### 1. Expand runtime check in `CheckInPage.tsx` (lines 136-173)
When `paymentStatus === 'pending'` AND `invoice_id` is null, do a **fallback query**: look for any paid invoice for the same patient on the same date. If found, link it to the appointment and mark as paid.

```typescript
// After the existing invoice_id check, add:
// No invoice linked — check if any paid invoice exists for this patient today
const { data: existingInvoice } = await supabase
  .from('invoices')
  .select('id')
  .eq('patient_id', patient.id)
  .eq('invoice_date', appointment.appointment_date)
  .eq('status', 'paid')
  .limit(1)
  .single();

if (existingInvoice) {
  await supabase
    .from('appointments')
    .update({ payment_status: 'paid', invoice_id: existingInvoice.id })
    .eq('id', id);
  await refetch();
  await performCheckIn();
  return;
}
```

### 2. Fix the payment alert banners to also do a live check
The banner at lines 340 and 603 shows based on cached `paymentStatus`. Add a state variable `verifiedPaymentStatus` that gets set on component mount after checking real invoice data, so the banner reflects truth immediately — not just on button click.

### 3. Fix existing stale data now
Run an UPDATE to link existing paid invoices to their appointments and set `payment_status = 'paid'`.

## Files to Edit

| File | Change |
|------|--------|
| `src/pages/app/appointments/CheckInPage.tsx` | Add fallback patient+date invoice lookup; add `useEffect` to verify payment on load |
| SQL data fix (via insert tool) | Link existing paid invoices to appointments and update payment_status |

