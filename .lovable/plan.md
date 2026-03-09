

## Root Cause Analysis

Two separate issues are causing the "Awaiting Payment" to persist:

### Issue 1: RLS blocks billing users from updating lab orders

The `lab_orders` UPDATE policy requires `laboratory.orders`, `laboratory.results`, or `consultations.edit` permission. The user performing OPD checkout (billing role) does **not** have these permissions, so the explicit updates at checkout silently fail:
- `update({ invoice_id: invoiceData.id })` -- silently blocked
- `update({ payment_status: 'paid' })` -- silently blocked

**Proof**: All 3 recent lab orders (LO-260309-0005/0006/0007) have `invoice_id = null` and `payment_status = pending` in the DB, even though their invoices include the lab charges and are paid.

### Issue 2: Realtime not enabled for lab_orders

The `lab_orders` table is **not** in the `supabase_realtime` publication. The realtime subscription in `LabQueuePage.tsx` silently receives no events.

## Fix Plan

### Migration 1: Fix RLS policy + enable Realtime
- Update the `lab_orders` UPDATE RLS policy to also allow users with `billing.invoices` or `billing.create` permission (so OPD checkout can link invoices and update payment status)
- Add `lab_orders` and `invoices` to `supabase_realtime` publication

### Migration 2: Fix existing data
- Update the 3 orphaned lab orders to link them to their correct invoices and set `payment_status = 'paid'`

### Code: Add invoices realtime listener
**File:** `src/pages/app/lab/LabQueuePage.tsx`
- Add a second realtime channel for `invoices` table changes, so when an invoice status changes to "paid", the lab queue auto-refreshes

