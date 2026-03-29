

# Fix: Radiology Pricing in OPD Checkout + Add 5% Test Share to All Doctors

## Problem 1: Radiology Shows as "Pricing Pending" (Unselectable)

The imaging order has `procedure_name: "Chest X-Ray (PA)"` but the radiology service types use names like `"X-Ray (Single View)"` and `"Chest X-Ray PA View"`. The current fuzzy match uses **exact case-insensitive comparison**, so it fails → amount = 0 → charge is grayed out and unselectable. The user sees this as "already paid" because it can't be interacted with.

**Root cause**: `imaging_orders.procedure_id` is `null` (no FK link to `imaging_procedures`), and the text-based fallback match is too strict.

**Fix in `OPDCheckoutPage.tsx`** (lines 274-298):
1. First, try to resolve price via `procedure_id → imaging_procedures → service_type_id → service_types.default_price` (proper FK chain)
2. If `procedure_id` is null, use **partial/contains matching** instead of exact: check if either name contains the other (e.g., "chest x-ray" matches "Chest X-Ray PA View")
3. Update the imaging orders query to join `imaging_procedures` and its linked `service_types`: `.select("*, imaging_procedure:imaging_procedures(base_price, service_type_id, service_types(id, default_price))")`

This way, imaging orders with a `procedure_id` get an accurate price from the linked service type, and legacy orders without `procedure_id` get a best-effort fuzzy match.

## Problem 2: Update All Doctors with 5% Radiology Share

Currently all `doctor_compensation_plans` have `radiology_referral_percent = 0`.

**Data update** (via insert tool):
```sql
UPDATE doctor_compensation_plans SET radiology_referral_percent = 5 WHERE radiology_referral_percent = 0;
```

Also set `lab_referral_percent = 5` if it's also 0, so both test shares work for testing.

## Files to Change

### 1. `src/pages/app/opd/OPDCheckoutPage.tsx`
- Update imaging orders query (line 173-184) to join `imaging_procedures(base_price, service_type_id, service_types(id, default_price))`
- Update imaging charge building (lines 274-298): first use joined `imaging_procedure.service_types.default_price`, then `imaging_procedure.base_price`, then fuzzy match against `radiologyServiceTypes` using **partial string matching** (`.includes()` instead of `===`)

### 2. Data update via insert tool
- Set `radiology_referral_percent = 5` and `lab_referral_percent = 5` on all doctor compensation plans

## Expected Result
- Imaging charges show correct price (e.g., ₨300 for Chest X-Ray) and are selectable for payment
- When paid, the doctor earnings trigger creates a `radiology_referral` earning at 5% of the imaging amount

