

# Fix: Lab Tests & Imaging Orders Not Showing in OPD Checkout

## Root Cause

The OPD Checkout page has a **broken database join** for lab orders:

```
items:lab_order_items(*, test:lab_tests(name, price))
```

The table `lab_tests` **does not exist**. The actual tables are `lab_test_templates`, `lab_test_categories`, and `lab_test_panels`. Because this join fails, all lab order items come back with `null` test data, making `price = 0`. Since `pendingCharges` filters for `amount > 0`, lab charges are completely invisible.

Similarly, imaging orders are hardcoded to `amount: 0` because `imaging_orders` has no price column.

**Pricing data lives in `service_types.default_price`**, linked via `lab_order_items.service_type_id`.

## Plan

### 1. Fix lab order query in `OPDCheckoutPage.tsx`
Replace the broken `lab_tests` join with the correct `service_types` join:
```
items:lab_order_items(*, service_type:service_types(name, default_price))
```

Update the charge builder to use `item.service_type?.default_price` instead of `item.test?.price`, and `item.test_name` (which is stored directly) for the description.

### 2. Fix imaging order charges
Join imaging orders to `service_types` via `procedure_id` (FK exists on `imaging_orders`):
```
imaging_orders(*, procedure:service_types(name, default_price))
```

Use `procedure?.default_price` for the amount instead of hardcoded `0`.

### 3. Allow zero-amount items to still be visible
Change the charges display so items with `amount: 0` are shown (greyed out, marked "Pricing pending") but not selectable for payment. This way reception staff can see that lab/imaging orders exist even if pricing isn't configured yet.

### 4. Update charge description logic
- Lab: Use `item.test_name` (stored directly on `lab_order_items`) for descriptions
- Imaging: Use `order.procedure_name` with `order.modality`

## Files to modify
- `src/pages/app/opd/OPDCheckoutPage.tsx` — fix queries, charge building, and display logic

