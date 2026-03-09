

## Problem

Line 745 in `OPDCheckoutPage.tsx` checks `appointment?.payment_status === "paid"` to show "Already Paid" and hide the payment form. But when the appointment's consultation was already paid and the user returns for lab charges, the appointment is still `payment_status = "paid"` — so the payment UI is hidden and "Already Paid" is shown instead.

## Fix

**File:** `src/pages/app/opd/OPDCheckoutPage.tsx` (line 745-749)

Change the "Already Paid" condition to only show when the appointment is paid **AND** there are no selectable pending charges:

```tsx
{appointment?.payment_status === "paid" && selectableCharges.length === 0 ? (
  <div className="flex items-center justify-center gap-2 py-4">
    <CheckCircle2 className="h-5 w-5 text-green-600" />
    <span className="font-medium text-green-600">Already Paid</span>
  </div>
) : selectedCharges.length > 0 && (
```

This ensures:
- If consultation is paid but lab charges exist → payment form is shown
- If everything is paid → "Already Paid" is shown

Single line change, no other files affected.

