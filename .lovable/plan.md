

# Fix: Pharmacy Requisition to PO Conversion Error

## Root Cause

Two bugs combine to break PO creation from pharmacy requisitions:

**Bug 1 — DB constraint**: `purchase_order_items.item_id` is `NOT NULL`, but medicine-based PO items have no `item_id`. The code in `usePurchaseOrders.ts` (line 224) correctly sets `item_id: null` for medicines, but the database rejects it.

**Bug 2 — Requisition pre-fill ignores medicines**: `POFormPage.tsx` (line 125-127) always maps requisition items as `item_type: "inventory"` with `item_id: reqItem.item_id || ""`, completely ignoring `medicine_id`. Pharmacy requisitions (which use `medicine_id`) get an empty string `item_id`, which then fails with `invalid input syntax for type uuid: ""`.

DB error logs confirm both:
- `null value in column "item_id" of relation "purchase_order_items" violates not-null constraint`
- `invalid input syntax for type uuid: ""`

## Fix

### 1. Database Migration
Make `item_id` nullable since medicine-based PO items don't have an inventory item:
```sql
ALTER TABLE public.purchase_order_items ALTER COLUMN item_id DROP NOT NULL;
```

### 2. Fix Requisition-to-PO Pre-fill
**File: `src/pages/app/inventory/POFormPage.tsx`** (lines 125-134)

Change the requisition items mapping to detect medicine items:
```typescript
const reqItems: PurchaseOrderItem[] = sourceRequisition.items.map((reqItem) => ({
  item_id: reqItem.item_id || "",
  medicine_id: reqItem.medicine_id || undefined,
  item_type: reqItem.medicine_id ? "medicine" as const : "inventory" as const,
  quantity: reqItem.quantity_approved || reqItem.quantity_requested,
  unit_price: 0,
  tax_percent: 0,
  discount_percent: 0,
  total_price: 0,
}));
```

### 3. Fix PR-to-PO Pre-fill (same issue)
**File: `src/pages/app/inventory/POFormPage.tsx`** (lines 101-109)

Same fix for the PR-based pre-fill — detect medicine items and set `item_type` accordingly.

## Files Changed
- 1 migration SQL — make `purchase_order_items.item_id` nullable
- `src/pages/app/inventory/POFormPage.tsx` — fix both pre-fill blocks to handle medicine items

