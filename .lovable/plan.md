

# Fix: Lab Tests Showing "Pricing Pending" at OPD Checkout

## Problem

When a doctor orders lab tests during consultation, the `LabOrderBuilder` component uses a **hardcoded list of common tests** (line 99-122 in `LabOrderBuilder.tsx`) with only `test_name` and `test_category` — no `service_type_id`. So when lab order items are saved to the database, `service_type_id` is null.

At checkout, the price is fetched via `item.service_type.default_price`. Since there's no linked service type, price = 0, and the item shows as "Pricing pending" — making it impossible to bill.

Meanwhile, the `service_types` table already has matching lab tests with proper pricing (e.g., "Random Blood Sugar (RBS)" at 200, "Complete Blood Count (CBC)" at 600, etc.).

## Solution

### 1. Update `LabOrderBuilder.tsx` — fetch service_types instead of hardcoded list

Replace the hardcoded `commonTests` array with a query to `service_types` where `category = 'lab'`. Each test will carry its `service_type_id` and show the price in the dropdown.

- Use `useServiceTypes()` hook (already exists in the project) filtered to `category === 'lab'`
- Map each service type to a `LabOrderItemInput` with `service_type_id`, `test_name`, and `test_category`
- Show price next to test name in the search dropdown
- Keep the "Add custom test" fallback (without service_type_id) for tests not in the system

### 2. Update `OPDCheckoutPage.tsx` — fallback price lookup

For lab order items that were created without a `service_type_id` (legacy data), attempt a fuzzy name match against `service_types` to find a price. This handles existing orders that were created before the fix.

### 3. Keep the existing `useConfigLabPanels` panels working

Lab panels already exist. When a panel is selected, map each panel test to the matching `service_type` entry by name to include the `service_type_id`.

## Files to modify

- `src/components/consultation/LabOrderBuilder.tsx` — replace hardcoded tests with service_types query, include `service_type_id` when adding items
- `src/pages/app/opd/OPDCheckoutPage.tsx` — add fallback price resolution for items missing `service_type_id`

