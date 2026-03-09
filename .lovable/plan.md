

## Problem

Three related issues:

1. **OPD Pending Checkout still shows paid appointments** — `PendingCheckoutPage.tsx` line 63 filters by `status = "completed"` but never excludes `payment_status = "paid"`, so paid patients stay in the list.

2. **Duplicate invoices on re-checkout** — `handlePayNow` and `handleGenerateInvoice` in `OPDCheckoutPage.tsx` don't check if the appointment already has `payment_status = "paid"`. A user can navigate back and checkout again, creating a second invoice for the same services.

3. **Lab order still shows "Awaiting Payment"** — The charge-building logic (line 215) skips lab orders where `invoice_id` is set (`if (!order.invoice_id)`), but the `LabOrderCard` "Collect Payment" button only checks `isPaid` (based on `payment_status`). If the DB trigger `sync_department_order_payment_status` doesn't fire (e.g., timing issue), the lab order keeps `payment_status = "pending"` even though it has an `invoice_id` linked to a paid invoice. Also, `LabPaymentDialog` receives hardcoded `totalAmount={0}` and `paidAmount={0}`, making the payment form useless.

## Plan

### Fix 1: Exclude paid appointments from Pending Checkout
**File:** `src/pages/app/opd/PendingCheckoutPage.tsx`
- Add `.neq("payment_status", "paid")` after line 63's `.eq("status", "completed")`

### Fix 2: Guard against duplicate checkout in OPD
**File:** `src/pages/app/opd/OPDCheckoutPage.tsx`
- At the top of both `handleGenerateInvoice` and `handlePayNow`, add:
  ```
  if (appointment.payment_status === "paid") {
    toast.info("This appointment has already been checked out");
    return;
  }
  ```
- Also hide the Pay Now / Generate Invoice buttons when `appointment.payment_status === "paid"` (show a "Already Paid" badge instead)

### Fix 3: Fix Lab payment status not syncing
**File:** `src/components/lab/LabOrderCard.tsx`
- Remove the hardcoded `totalAmount={0}` and `paidAmount={0}` — instead compute from `order.items` service prices or pass the invoice total
- Hide "Collect Payment" button when `order.invoice_id` is set (already linked to an invoice, payment should go through that invoice)

### Fix 4: Defensive lab payment_status update
The DB trigger `sync_department_order_payment_status` on invoices already handles this. But the OPD checkout also does an explicit update (lines 431-436). The issue is likely that the lab order's `payment_status` column isn't being refreshed in the UI after checkout. 
- In `useLabOrders` query, ensure `payment_status` is selected (it already is via `*`)
- The real fix is Fix 1 + Fix 2 — prevent re-checkout, and stop showing paid appointments

