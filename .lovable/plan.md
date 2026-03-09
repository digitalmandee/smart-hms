

# Fix: Lab Orders Still "Awaiting Payment" After OPD Checkout

## Root Cause

In `handlePayNow` (OPDCheckoutPage.tsx), the operations happen in this order:

1. Create invoice (status: draft/unpaid)
2. Record payment → **triggers `sync_department_order_payment_status`** (invoice becomes 'paid')
3. Link lab orders to invoice ← **TOO LATE, trigger already fired**

The DB trigger `trg_sync_payment_on_invoice_update` fires at step 2 when invoice status changes to 'paid'. But at that point, the lab orders don't have `invoice_id` yet (that happens at step 3). So the trigger's `WHERE invoice_id = NEW.id` matches zero rows.

Same issue exists in `handleGenerateInvoice` (line 300) — lab orders are linked but payment happens later, which should work. But `handlePayNow` has the race condition.

## Fix

**Move lab/imaging order linking BEFORE the payment recording call** in both `handlePayNow` and `handleGenerateInvoice`. Also, after linking + paying, explicitly update `payment_status = 'paid'` on the lab orders as a belt-and-suspenders approach (in case the trigger still misses).

### Changes in `OPDCheckoutPage.tsx`

**`handlePayNow`** — reorder to:
1. Create invoice
2. Link lab orders to invoice (move lines 402-424 here)
3. Link imaging orders to invoice
4. Record payment (trigger now finds linked orders)
5. Update appointment
6. Explicitly set `lab_orders.payment_status = 'paid'` and `imaging_orders.payment_status = 'paid'` for the linked orders

**`handleGenerateInvoice`** — already links before payment (payment happens later on invoice page), but add explicit payment_status update there too for safety.

### Files to modify
- `src/pages/app/opd/OPDCheckoutPage.tsx` — reorder operations + add explicit status update

