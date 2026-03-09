

## Problem

The appointment gets marked `payment_status = 'paid'` after the consultation fee is paid. When a doctor later orders lab tests for that same appointment, the appointment no longer appears in "Pending Checkout" (filtered out by `.neq("payment_status", "paid")`). The OPD Checkout page also auto-redirects away. Result: unpaid lab orders with no checkout path.

## Root Cause

The system assumes a single checkout per appointment. But in real workflow, doctors may order labs/imaging **after** consultation checkout. The `payment_status = 'paid'` on the appointment only reflects the consultation invoice, not all related orders.

## Fix

### 1. PendingCheckoutPage: Include paid appointments that have unpaid lab/imaging orders

**File:** `src/pages/app/opd/PendingCheckoutPage.tsx`

Change the query to fetch appointments that are EITHER:
- `payment_status != 'paid'` (current behavior), OR
- `payment_status = 'paid'` BUT have unpaid lab orders linked via consultation

Instead of filtering at the DB level, fetch all completed appointments for today, then filter client-side based on whether there are unpaid charges remaining.

Alternatively (simpler): remove `.neq("payment_status", "paid")` and instead add a client-side filter that hides appointments only when ALL linked orders (lab, imaging) are also paid. Show a "Additional charges" badge for already-paid appointments that have new unpaid orders.

### 2. OPDCheckoutPage: Don't auto-redirect if there are unpaid lab/imaging orders

**File:** `src/pages/app/opd/OPDCheckoutPage.tsx`

Update the redirect guard (line 124-133) to check for unpaid lab orders before redirecting:

```typescript
useEffect(() => {
  if (appointment && appointment.payment_status === "paid" && labOrders !== undefined && imagingOrders !== undefined) {
    const hasUnpaidLab = labOrders?.some(o => !o.invoice_id) || false;
    const hasUnpaidImaging = imagingOrders?.some((o: any) => !o.invoice_id) || false;
    
    if (!hasUnpaidLab && !hasUnpaidImaging) {
      toast.info("This appointment has already been checked out");
      if (appointment.invoice_id) {
        navigate(`/app/billing/invoices/${appointment.invoice_id}`, { replace: true });
      } else {
        navigate("/app/opd/pending-checkout", { replace: true });
      }
    }
  }
}, [appointment, labOrders, imagingOrders, navigate]);
```

### 3. OPDCheckoutPage: Show lab charges even when consultation is already paid

The consultation charge block (line 211) already checks `!appointment.invoice_id` — this correctly hides the consultation fee. Lab charges (line 228) check `!order.invoice_id` per lab order, which is also correct. So the charge-building logic is fine once the redirect is fixed.

### 4. Fix existing data: Reset Devmine's appointment for re-checkout

**Migration:** Update appointment `9dc2e6b3-...` to allow checkout of the unpaid lab order LO-260309-0008. Since the consultation is already paid, we don't need to reset payment_status — instead, the code fixes above will allow accessing checkout even when consultation is paid but lab orders are pending.

## Summary

Two code changes:
1. **PendingCheckoutPage** — show appointments with unpaid department orders even if consultation is paid
2. **OPDCheckoutPage** — don't redirect away if unpaid lab/imaging orders exist

No database migration needed — this is purely a UI logic fix.

