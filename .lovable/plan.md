

# Add store_id to Stock Movements and POS Transactions

## Problem
Three key tables/flows are missing warehouse (`store_id`) tracking:
1. `pharmacy_stock_movements` -- no `store_id` column, so movement history cannot be filtered by warehouse
2. `pharmacy_pos_transactions` -- no `store_id` column, so POS sales are not linked to a specific warehouse
3. Dashboard stats (`usePharmacyStats`) are not warehouse-aware

## What Will Be Done

### 1. Database Migrations
Add `store_id` column (nullable, FK to `stores`) to both `pharmacy_stock_movements` and `pharmacy_pos_transactions`. Update the `log_pos_sale_stock_movement()` trigger to propagate `store_id` from the inventory item being sold.

### 2. Update Stock Movement Hooks
- Add `storeId` to `StockMovementFilters` 
- Include `store_id` when creating manual adjustments (look up from inventory)
- Join `stores` table in the query to show warehouse name

### 3. Update Stock Movements Page
- Add a `StoreSelector` (pharmacy context) to the filters bar
- Add a "Warehouse" column to the movements table

### 4. Update POS Transaction Creation
- When creating a POS transaction, derive `store_id` from the first cart item's inventory record
- Pass `store_id` into the transaction insert

### 5. Update Dispensing Flow
- When logging stock movements from prescription dispensing, look up and include `store_id` from the inventory record

### 6. Update Dashboard Stats (Optional Enhancement)
- Make `usePharmacyStats` accept an optional `storeId` parameter to filter stats by warehouse

---

## Technical Details

### Database Migration

```sql
-- Add store_id to pharmacy_stock_movements
ALTER TABLE pharmacy_stock_movements 
  ADD COLUMN store_id UUID REFERENCES stores(id);

-- Add store_id to pharmacy_pos_transactions
ALTER TABLE pharmacy_pos_transactions 
  ADD COLUMN store_id UUID REFERENCES stores(id);

-- Update the trigger function to propagate store_id from inventory
CREATE OR REPLACE FUNCTION public.log_pos_sale_stock_movement()
  RETURNS trigger ...
  -- Add: look up v_inventory.store_id and include it in the INSERT
```

### Files to Modify

| File | Change |
|---|---|
| `src/hooks/useStockMovements.ts` | Add `storeId` to filters; join `store:stores(id, name)` in query; include `store_id` in adjustment inserts (from inventory lookup) |
| `src/pages/app/pharmacy/StockMovementsPage.tsx` | Add `StoreSelector` filter; add "Warehouse" column to table |
| `src/hooks/usePOS.ts` | Look up `store_id` from first item's inventory; pass into transaction insert |
| `src/hooks/usePharmacy.ts` | In `useDispensePrescription`, look up `store_id` from inventory and include in stock movement insert |
| DB trigger `log_pos_sale_stock_movement` | Propagate `store_id` from `medicine_inventory` to stock movement row |

### Hook Changes (useStockMovements.ts)

```text
StockMovementFilters:
  + storeId?: string

StockMovement interface:
  + store_id?: string | null
  + store?: { id: string; name: string } | null

useStockMovements query:
  + join: store:stores(id, name)
  + if storeId: .eq("store_id", storeId)

useCreateStockAdjustment:
  + lookup store_id from medicine_inventory when inventoryId provided
  + include store_id in insert
```

### Stock Movements Page Changes

Add `StoreSelector` (context="pharmacy") between date filters and movement type filter. Add "Warehouse" column after "Medicine" in the table.

### POS Transaction Changes (usePOS.ts)

Before inserting the transaction, query the first cart item's inventory to get its `store_id`, then include it in the transaction insert payload.

### Dispensing Flow Changes (usePharmacy.ts)

In `useDispensePrescription`, the inventory query already fetches the record. Add `store_id` to the select fields and include it in the stock movement insert.

### Trigger Update (log_pos_sale_stock_movement)

Update the function to read `v_inventory.store_id` (already fetched from `medicine_inventory`) and include it in the INSERT into `pharmacy_stock_movements`.

