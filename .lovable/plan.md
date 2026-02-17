

# Fix OPD Checkout Flow: Doctor Commission and Invoice Gaps

## Problem Summary

The OPD checkout page creates invoices **without** `doctor_id` or `service_type_id` on invoice items. The `post_consultation_earning` database trigger requires BOTH to credit doctor commissions. This means doctors never get paid for consultations billed through checkout.

Additionally, the walk-in page passes `doctor_id` but also skips `service_type_id`, so the trigger's primary path (JOIN on `service_types.category = 'consultation'`) fails there too -- it only works via the fragile date-based fallback.

## Gaps Found

| Gap | Location | Severity |
|-----|----------|----------|
| No `doctor_id` on checkout invoice items | `OPDCheckoutPage.tsx` lines 212, 242 | HIGH - commission never posts |
| No `service_type_id` on checkout invoice items | `OPDCheckoutPage.tsx` lines 212, 242 | HIGH - trigger JOIN fails |
| No `service_type_id` on walk-in invoice items | `OPDWalkInPage.tsx` line 349 | HIGH - relies on fallback only |
| `handleGenerateInvoice` doesn't link invoice to appointment | `OPDCheckoutPage.tsx` line 201 | MEDIUM - allows duplicate invoicing |
| No consultation `service_type_id` stored in `ChargeItem` | `OPDCheckoutPage.tsx` line 32 | ROOT CAUSE of missing data |

## Plan

### 1. Extend `ChargeItem` interface to carry `doctorId` and `serviceTypeId`

Add optional fields to the `ChargeItem` interface so they flow from charge-building into invoice creation.

### 2. Attach `doctor_id` and `service_type_id` when building the consultation charge

When building the consultation charge item (line 132-143), fetch the first `service_types` record with `category = 'consultation'` for the org, and set both `doctorId` (from `appointment.doctor.id`) and `serviceTypeId`.

### 3. Fix `handleGenerateInvoice` and `handlePayNow` to pass these through

Map charge items to include `doctor_id` and `service_type_id` in the `items` array sent to `createInvoice`.

### 4. Link invoice to appointment in `handleGenerateInvoice`

After invoice creation in `handleGenerateInvoice`, update the appointment record with `invoice_id` (same as `handlePayNow` already does).

### 5. Fix walk-in page to also pass `service_type_id`

Add `service_type_id` to the walk-in invoice item so the trigger's primary path works instead of relying on the date-based fallback.

## Technical Details

### File: `src/pages/app/opd/OPDCheckoutPage.tsx`

**Change 1 - ChargeItem interface (line 32):**
```typescript
interface ChargeItem {
  id: string;
  type: "consultation" | "lab" | "prescription";
  description: string;
  amount: number;
  status: "pending" | "invoiced" | "paid";
  referenceId?: string;
  doctorId?: string;
  serviceTypeId?: string;
}
```

**Change 2 - Build consultation charge (lines 132-143):**
- Query `service_types` where `category = 'consultation'` to get a service type ID
- Set `doctorId: appointment.doctor?.id` and `serviceTypeId` on the charge item

**Change 3 - handleGenerateInvoice items mapping (line 212):**
```typescript
items: itemsToInvoice.map(item => ({
  description: item.description,
  quantity: 1,
  unit_price: item.amount,
  discount_percent: 0,
  total_price: item.amount,
  doctor_id: item.doctorId,
  service_type_id: item.serviceTypeId,
})),
```

**Change 4 - Link appointment after invoice in handleGenerateInvoice (after line 220):**
```typescript
await supabase
  .from("appointments")
  .update({ invoice_id: invoiceData.id })
  .eq("id", appointment.id);
```

**Change 5 - handlePayNow items mapping (line 242):**
Same `doctor_id` and `service_type_id` additions as Change 3.

### File: `src/pages/app/opd/OPDWalkInPage.tsx`

**Change 6 - Add service_type_id to walk-in invoice item (line 349):**
- Query `service_types` where `category = 'consultation'` and org matches
- Pass `service_type_id` alongside the existing `doctor_id`

### Fetch Strategy for Consultation Service Type

Add a React Query hook or inline query at the top of both pages to fetch the consultation service type:

```typescript
const { data: consultationServiceType } = useQuery({
  queryKey: ["consultation-service-type"],
  queryFn: async () => {
    const { data } = await supabase
      .from("service_types")
      .select("id")
      .eq("category", "consultation")
      .limit(1)
      .single();
    return data;
  },
});
```

This ID is then used when building charge items and invoice items.

## Expected Result

After these changes:
1. Doctor commissions auto-post via the trigger's primary path (direct `doctor_id` on invoice items with matching `service_type_id`)
2. No reliance on the fragile date-based fallback
3. No duplicate invoicing risk (appointment linked to invoice immediately)
4. Both walk-in and checkout paths produce identical, correct invoice data

