

# Fix: "Appointment not found" on OPD Checkout

## Problem
When the user navigates to `/app/opd/checkout` without an `appointmentId` (e.g., from a sidebar nav link), the page shows "Appointment not found" because `appointmentId` is `null`. The `PendingCheckoutPage` at `/app/opd/pending-checkout` already lists completed appointments for checkout selection, but the checkout page doesn't redirect to it.

## Plan

### Redirect to Pending Checkout when no appointmentId (`OPDCheckoutPage.tsx`)
At the top of the component, if `appointmentId` is falsy (no route param, no query param), redirect to `/app/opd/pending-checkout` instead of showing "Appointment not found".

Add early redirect:
```tsx
if (!appointmentId) {
  navigate("/app/opd/pending-checkout", { replace: true });
  return null;
}
```

This is a single change in `src/pages/app/opd/OPDCheckoutPage.tsx`, adding a `useEffect` or early return before the queries run.

## File to modify
- `src/pages/app/opd/OPDCheckoutPage.tsx` — add redirect when appointmentId is missing

