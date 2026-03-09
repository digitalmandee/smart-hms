

# Fix: Lab Payment Status Not Updating + Lab Dashboard Showing Reception View

## Problems Found

### 1. Lab payment stays "unpaid" after OPD checkout
When the receptionist pays for lab tests via OPD Checkout, the code:
- Creates an invoice with lab charges
- Records the payment
- Links the invoice to the `appointments` table

But it **never links the invoice to the `lab_orders` table**. The database trigger `sync_department_order_payment_status` looks for `lab_orders.invoice_id = invoice.id` to update payment status — but since `invoice_id` was never set on the lab order, the trigger finds nothing. Lab order stays "Awaiting Payment" and the lab tech can't enter results.

### 2. Lab dashboard looks like reception
The bottom navigation "Home" button always goes to `/app/dashboard` (receptionist dashboard with session banner). For lab technicians, "Home" should go to `/app/lab` (lab dashboard).

## Plan

### Fix 1: Link invoice to lab_orders in OPD Checkout

In `src/pages/app/opd/OPDCheckoutPage.tsx`, after creating the invoice in both `handleGenerateInvoice` and `handlePayNow`, add code to update `lab_orders.invoice_id` for any lab charges included in the invoice. This allows the existing DB trigger to properly sync `payment_status` to `'paid'`.

```typescript
// After invoice is created, link it to lab orders
const labCharges = itemsToInvoice.filter(c => c.type === 'lab');
for (const charge of labCharges) {
  await supabase
    .from('lab_orders')
    .update({ invoice_id: invoiceData.id })
    .eq('id', charge.referenceId);
}
```

Similarly for imaging orders.

### Fix 2: Route lab_technician "Home" to lab dashboard

In `src/components/mobile/BottomNavigation.tsx`, make the Home nav item role-aware so lab technicians go to `/app/lab` instead of `/app/dashboard`.

### Files to modify
- `src/pages/app/opd/OPDCheckoutPage.tsx` — link invoice to lab_orders and imaging_orders after checkout
- `src/components/mobile/BottomNavigation.tsx` — route lab_technician Home to `/app/lab`

