

# Fix: Purchase Orders Not Working

## Problems Found

### Problem 1: PO Items Fail to Insert (Main Issue)
Database shows 6 POs created today — all have `total_amount: 30` (items were added in UI) but **zero items** in `purchase_order_items`. The mutation creates the PO first, then tries to insert items. When items fail, the PO is left orphaned with no items.

The likely cause: when inventory-type items have `item_id` as empty string `""` (e.g., from pre-fill or edge cases), or when the mutation partially succeeds, the PO is created but items are rejected. The mutation does not wrap both operations in a transaction — if items fail, the PO remains.

**Fix in `src/hooks/usePurchaseOrders.ts`:**
- Sanitize `item_id`: if it's an empty string, set it to `null`
- If items insert fails, **delete the orphaned PO** to keep data clean
- Add better error messaging

```typescript
// In useCreatePurchaseOrder mutationFn:
const itemsToInsert = data.items.map(item => ({
  purchase_order_id: po.id,
  item_type: item.item_type || 'inventory',
  item_id: (item.item_type === 'medicine' || !item.item_id) ? null : item.item_id,
  medicine_id: item.item_type === 'medicine' ? (item.medicine_id || null) : null,
  quantity: item.quantity,
  unit_price: item.unit_price,
  tax_percent: item.tax_percent,
  discount_percent: item.discount_percent,
  total_price: item.total_price,
}));

const { error: itemsError } = await supabase
  .from("purchase_order_items")
  .insert(itemsToInsert);

if (itemsError) {
  // Cleanup orphaned PO
  await supabase.from("purchase_orders").delete().eq("id", po.id);
  throw itemsError;
}
```

Same fix applied in `useUpdatePurchaseOrder`.

### Problem 2: PO Detail Page Doesn't Show Medicine Items
`PODetailPage.tsx` line 277 only renders `item.item?.name` (inventory). For medicine-type PO items, the name, code, and unit show as empty/undefined.

**Fix in `src/pages/app/inventory/PODetailPage.tsx`:**
- Show `item.medicine?.name` when `item_type === 'medicine'`
- Show generic name and unit for medicine items

### Problem 3: Printable PO Same Issue
`PrintablePO.tsx` line 74 only shows `item.item?.name`. Same fix needed for medicine items in the print template.

### Problem 4: Cleanup Orphaned POs
Delete the 6 orphaned POs from today that have no items (data cleanup).

## Files Changed
- `src/hooks/usePurchaseOrders.ts` — sanitize item_id, cleanup on failure
- `src/pages/app/inventory/PODetailPage.tsx` — handle medicine item display
- `src/components/inventory/PrintablePO.tsx` — handle medicine item display
- Data cleanup: delete orphaned POs with no items

