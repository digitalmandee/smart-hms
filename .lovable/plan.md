

# Fix OPD Consultation → Checkout Flow

## Problems Identified

1. **Doctor blocked by "Session Required"**: After completing a consultation, the doctor is redirected to `/app/opd/checkout?appointmentId=...`. The checkout page requires a **reception** billing session (`useRequireSession("reception")`). Doctors don't have reception sessions — they see "Session not started" and cannot proceed.

2. **Imaging orders missing from checkout charges**: The checkout page collects charges from consultation fees, lab orders, and prescriptions — but **imaging/radiology orders** added during consultation are completely absent from the charge list.

## Plan

### 1. Fix the consultation completion navigation (ConsultationPage.tsx)
The doctor should **not** be sent to checkout. Checkout is a reception/cashier workflow. Instead:
- When consultation completes with pending orders (Rx, labs, imaging), navigate back to `/app/opd` with a success toast explaining that orders have been sent to the respective departments and the patient should proceed to the billing counter.
- Remove the conditional checkout redirect for doctors entirely. The checkout page is accessed separately by reception staff.

**File:** `src/pages/app/opd/ConsultationPage.tsx` (lines 207-219)
- Change: always `navigate("/app/opd")` after completion, regardless of pending orders.
- Add a descriptive toast summarizing what was created (e.g., "Consultation completed. 2 lab tests and 1 imaging order sent.").

### 2. Add imaging order charges to OPD Checkout (OPDCheckoutPage.tsx)
When reception staff opens checkout for a completed appointment:
- **Add a query** to fetch `imaging_orders` by `consultation_id` (similar to `lab_orders` query on line 117).
- **Add imaging charges** to the `charges` array with type `"imaging"`, pulling `procedure_name` and a price if available.
- **Add the Scan icon** to the charge type icon mapping (line 455).

**File:** `src/pages/app/opd/OPDCheckoutPage.tsx`
- Add `imaging_orders` query (after line 131).
- Add imaging charges to the charges builder (after line 189).
- Add `Scan` icon import and mapping.

### 3. Update charge type definition
- Add `"imaging"` to the `ChargeItem.type` union (line 36).

## Files to modify
- `src/pages/app/opd/ConsultationPage.tsx` — fix post-completion navigation
- `src/pages/app/opd/OPDCheckoutPage.tsx` — add imaging orders to charges, fix icon mapping

