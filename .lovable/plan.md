

# Warehouse Inventory Visibility - Add Warehouse Column and Per-Store Breakdown

## What's the Problem?

Right now, when you open Stock Levels or Items, all warehouse inventories are mixed together. You can't tell if 300 syringes are in Main Distribution Center or General Storage Area. The filter dropdown exists but the table doesn't show **which warehouse** each stock row belongs to.

## What Will Change

### 1. Stock Levels Page - Add Warehouse Column
The Stock Levels table will get a new "Warehouse" column between "Category" and "Current Stock". When "All Warehouses" is selected, you'll see **separate rows per warehouse** for the same item:

```text
| Item Code | Item Name         | Category | Warehouse               | Stock | Reorder | Status |
|-----------|-------------------|----------|-------------------------|-------|---------|--------|
| ITM-001   | Disposable Syringe| Medical  | Main Distribution Center| 300   | 100     | OK     |
| ITM-001   | Disposable Syringe| Medical  | General Storage Area    | 150   | 100     | OK     |
```

When a specific warehouse is selected, only that warehouse's rows appear.

### 2. Items List Page - Add Warehouse Column
Same treatment for the Items Catalog page - add a Warehouse column so you can see stock distribution across warehouses.

### 3. Data Layer Update
The `useInventoryItems` hook will be updated to fetch per-store stock records by joining `inventory_stock` with `stores` to get the store name. When no store filter is applied, it returns one row per item per warehouse instead of aggregating.

---

## Technical Details

| File | Change |
|------|--------|
| `src/hooks/useInventory.ts` | Update `useInventoryItems` to join `inventory_stock` with `stores` table to get store names. Return per-store rows when storeId filter is "all". Each row will include `store_name` and `store_id` fields. |
| `src/pages/app/inventory/StockLevelsPage.tsx` | Add "Warehouse" column header and cell showing `store_name`. Display between Category and Current Stock columns. |
| `src/pages/app/inventory/ItemsListPage.tsx` | Add "Warehouse" column showing which store holds the stock, same pattern as Stock Levels. |

### Data Flow
- `inventory_stock` already has a `store_id` column linking to `stores`
- Currently the hook aggregates all store quantities into `total_stock` via a computed field
- Updated approach: query `inventory_stock` directly with item details joined, grouped by store
- Each table row = one item in one warehouse (not aggregated across all warehouses)
