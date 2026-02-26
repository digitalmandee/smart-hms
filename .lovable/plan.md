

# Fix: Payment Collected at Reception Still Shows "Payment Pending"

## Problem

When the consultation fee is paid at reception (through the billing module or directly), the **`appointments.payment_status`** column stays `'pending'` because nothing updates it. The only place that updates it is `AppointmentPaymentDialog` (the check-in payment dialog), which directly writes to the appointment record after creating an invoice.

So if a receptionist collects payment through any other flow (e.g., creating an invoice from the billing dashboard), the CheckInPage still reads `payment_status === 'pending'` and shows the "Payment Required" dialog.

**Current data confirms this:** Today's appointments (Sannan) have `payment_status: 'pending'` and `invoice_id: null` even though payment was collected.

## Root Cause

There's no link between the `invoices`/`payments` tables and the `appointments.payment_status` field unless the payment goes through `AppointmentPaymentDialog`. The system needs a way to sync.

## Solution

### 1. Database Trigger: Auto-sync `appointments.payment_status` when invoice is paid
**New migration**

Create a trigger on the `invoices` table that, when an invoice's status changes to `'paid'`, checks if any appointment references that invoice (via `appointments.invoice_id`) and updates `payment_status` to `'paid'`.

Also create a trigger on `payments` that checks if the payment's invoice is linked to an appointment.

```sql
CREATE OR REPLACE FUNCTION sync_appointment_payment_status()
RETURNS trigger AS $$
BEGIN
  -- When invoice status changes to paid, update linked appointment
  IF NEW.status = 'paid' THEN
    UPDATE appointments 
    SET payment_status = 'paid'
    WHERE invoice_id = NEW.id 
      AND payment_status != 'paid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Fix CheckInPage: Also check if invoice exists with payments
**File: `src/pages/app/appointments/CheckInPage.tsx`**

Add a secondary check: if `payment_status` is `'pending'`, query `payments` table to see if a payment was already made for this appointment's patient + today's consultation fee. If found, auto-update the appointment's `payment_status` and skip the dialog.

Simpler approach: on CheckInPage load, if the appointment has an `invoice_id`, fetch that invoice's payment status and sync it. If no `invoice_id`, check if any invoice exists for this patient today with a consultation line item.

### 3. Also guard for nurse role (from previous approved plan)
**File: `src/pages/app/appointments/CheckInPage.tsx`**

Add `hasRole` check so nurses bypass the payment dialog entirely (nurses should not handle payment).

## Files to Create/Edit

| File | Change |
|------|--------|
| New SQL migration | Trigger `sync_appointment_payment_status` on `invoices` table |
| `src/pages/app/appointments/CheckInPage.tsx` | Add nurse role bypass + fallback payment status check on load |

## Technical Details

- The trigger fires on `UPDATE` of `invoices` when `status` changes to `'paid'`
- The CheckInPage will also do a runtime check: query `payments` joined to `invoices` for the appointment, and if total payments >= fee, treat as paid regardless of the stale `payment_status` column
- Nurse bypass: `const isNurse = hasRole('nurse') || hasRole('opd_nurse')` → skip payment dialog entirely

