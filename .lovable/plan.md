

## Problem

The OPD Checkout page still allows viewing and re-processing charges for an already-paid appointment. While the Pending Checkout list now correctly filters out paid appointments (`.neq("payment_status", "paid")` is in place), the Checkout page itself doesn't redirect away when the appointment is already fully paid. Users can navigate to it via direct URL or stale links.

Additionally, after payment the `opd-checkout-appointment` query cache isn't invalidated, so the UI can show stale `payment_status` data.

## Fix

### 1. Auto-redirect on OPDCheckoutPage when appointment is already paid
**File:** `src/pages/app/opd/OPDCheckoutPage.tsx`

After the appointment query loads (around line 119), add an effect that redirects to the invoice page if `appointment.payment_status === "paid"` and `appointment.invoice_id` is set:

```tsx
useEffect(() => {
  if (appointment && appointment.payment_status === "paid") {
    toast.info("This appointment has already been checked out");
    if (appointment.invoice_id) {
      navigate(`/app/billing/invoices/${appointment.invoice_id}`, { replace: true });
    } else {
      navigate("/app/opd/pending-checkout", { replace: true });
    }
  }
}, [appointment, navigate]);
```

### 2. Invalidate pending-checkout query after payment
**File:** `src/pages/app/opd/OPDCheckoutPage.tsx`

After the payment succeeds (around line 452), add query invalidation:

```tsx
import { useQueryClient } from "@tanstack/react-query";
// ...
const queryClient = useQueryClient();
// After payment success:
queryClient.invalidateQueries({ queryKey: ["pending-checkout"] });
queryClient.invalidateQueries({ queryKey: ["opd-checkout-appointment"] });
```

### 3. Prevent duplicate consultation charges
The charge-building logic at line 197 checks `!appointment.invoice_id` — but this only checks for ONE linked invoice. If the consultation was paid via invoice A, then a lab invoice B gets linked to the appointment, the `invoice_id` changes to B and the consultation check would still work (it sees an invoice_id). However, to be safe, also check if there are any existing paid invoices for this appointment:

Add a query to check for existing paid invoices for this appointment, and skip any charge types that are already covered.

These 3 changes ensure that once checkout is complete, the appointment cannot be re-processed.

