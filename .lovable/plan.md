

# Fix Missing `doctor_id` in Invoice Update

## Problem Identified
The `useUpdateInvoice` function in `useBilling.ts` does not preserve or include `doctor_id` when updating invoice items. This means editing an invoice will lose the doctor attribution, breaking wallet earnings.

## Fix Required

### File: `src/hooks/useBilling.ts`

Update the `useUpdateInvoice` mutation at approximately line 440-451 to include `doctor_id`:

```typescript
// Current (BROKEN):
const invoiceItems = items.map((item) => ({
  invoice_id: id,
  description: item.description,
  quantity: item.quantity,
  unit_price: item.unit_price,
  discount_percent: item.discount_percent || 0,
  total_price: item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100),
  service_type_id: item.service_type_id,
  medicine_inventory_id: item.medicine_inventory_id,
  // doctor_id is MISSING
}));

// Fixed:
const invoiceItems = items.map((item) => ({
  invoice_id: id,
  description: item.description,
  quantity: item.quantity,
  unit_price: item.unit_price,
  discount_percent: item.discount_percent || 0,
  total_price: item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100),
  service_type_id: item.service_type_id,
  medicine_inventory_id: item.medicine_inventory_id,
  doctor_id: item.doctor_id || null,  // ADD THIS LINE
}));
```

## Summary

| Component | Status |
|-----------|--------|
| Database Migration | OK |
| `useCreateInvoice` | OK (includes doctor_id) |
| `useUpdateInvoice` | NEEDS FIX (missing doctor_id) |
| OPDWalkInPage | OK |
| AppointmentPaymentDialog | OK |
| CheckInPage | OK |
| PaymentRequiredDialog | OK |
| FeeWaiverDialog | OK (already existed) |

## One-Line Fix
Add `doctor_id: item.doctor_id || null,` to the invoice items mapping in `useUpdateInvoice` function.

