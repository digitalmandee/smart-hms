

# Link Pharmacy Inventory to Warehouses + Add Missing Store Filter

## Problem

The pharmacy inventory system (`medicine_inventory` table) already has a `store_id` column, but:
1. The **Inventory Page** has no warehouse filter -- users cannot filter stock by warehouse
2. The **Inventory query** (`useInventory`) does not accept or use `store_id` for filtering
3. The **Pharmacy Dashboard** stats (low stock, expiring) are not warehouse-aware
4. The **Inventory Adjustment Modal** does not show which warehouse the stock belongs to
5. The **Warehouse Detail Page** does not show actual inventory/stock summary for that warehouse
6. The **POS product search** does not filter by warehouse

## What Will Be Done

### 1. Add Warehouse Filter to Inventory Page
Add a `StoreSelector` dropdown (filtered to `context = "pharmacy"`) to the inventory page filters bar. When a warehouse is selected, only stock from that warehouse is shown.

### 2. Update `useInventory` Hook to Support `store_id` Filtering
Add `storeId` to the `InventoryFilters` interface and apply `.eq("store_id", storeId)` in the query when provided.

### 3. Enhance Warehouse Detail Page with Stock Summary
On the warehouse detail page, query `medicine_inventory` filtered by `store_id` to show:
- Total stock items count
- Total stock value
- Low stock items count
- A quick stock table showing medicines in that warehouse

### 4. Show Warehouse Name in Inventory Table
Add a "Warehouse" column to the inventory table that displays the store name from the `store_id` FK relationship. Update the inventory query to join with `stores` table.

### 5. Update Inventory Adjustment Modal
Show which warehouse the stock item belongs to in the modal header for context.

---

## Technical Details

### Files to Modify

| File | Change |
|---|---|
| `src/hooks/usePharmacy.ts` | Add `storeId` to `InventoryFilters`; join `store:stores(id, name)` in inventory query; apply `.eq("store_id", storeId)` when provided |
| `src/pages/app/pharmacy/InventoryPage.tsx` | Add `StoreSelector` to filter bar; pass selected `storeId` to `useInventory`; add "Warehouse" column to table |
| `src/pages/app/pharmacy/WarehouseDetailPage.tsx` | Query `medicine_inventory` by `store_id` to show stock summary cards (total items, total value, low stock count) and a compact stock list |
| `src/components/pharmacy/InventoryAdjustmentModal.tsx` | Show warehouse name in the modal if inventory has a `store` relation |

### Hook Changes (usePharmacy.ts)

```text
InventoryFilters:
  + storeId?: string

useInventory query:
  + join: store:stores(id, name)
  + if storeId: .eq("store_id", storeId)

InventoryWithMedicine interface:
  + store?: { id: string; name: string } | null
```

### Inventory Page Changes

Add a `StoreSelector` between the search input and category filter:
- Default: "All Warehouses" (no store_id filter)
- When selected: filters inventory to that warehouse only
- Uses `context="pharmacy"` prop to show only pharmacy warehouses

Add a "Warehouse" column after "Supplier" that displays `row.original.store?.name || "Unassigned"`.

### Warehouse Detail Page Changes

Add two new summary cards:
- **Stock Items**: Count of `medicine_inventory` rows where `store_id = warehouse.id`
- **Low Stock**: Count where quantity <= reorder_level

Add a compact table below the racks list showing top medicines stored in this warehouse (limit 10), with link to full filtered inventory view.

### Adjustment Modal Changes

Display `inventory.store?.name` as a subtitle badge in the modal header when available.

