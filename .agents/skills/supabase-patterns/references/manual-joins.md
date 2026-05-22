# Manual JS Joins

When PostgREST embed returns `null` for a relationship, do a bulk lookup and merge in JS.

## Pattern

```ts
// 1. Fetch the parent rows
const { data: items = [] } = await supabase
  .from("pharmacy_pos_items")
  .select("*")
  .eq("session_id", sessionId);

// 2. Collect unique FK values (filter falsy)
const medicineIds = [...new Set(items.map(i => i.medicine_id).filter(Boolean))];

// 3. Bulk fetch the related rows in ONE query
const { data: medicines = [] } = await supabase
  .from("medicines")
  .select("id, name, generic_name, selling_price")
  .in("id", medicineIds);

// 4. Build a Map for O(1) lookup
const medMap = new Map(medicines.map(m => [m.id, m]));

// 5. Merge
const enriched = items.map(item => ({
  ...item,
  medicine: medMap.get(item.medicine_id) ?? null,
}));
```

## Why not `.select("*, medicine:medicine_id(*)")`?

Without a real FK constraint in the DB, PostgREST cannot infer the relationship. It silently returns `null` for the embed instead of erroring. This caused multiple "missing data" bugs in pharmacy reports and expense lists.

## Known tables requiring this pattern

| Parent | Related | Reason |
|---|---|---|
| `pharmacy_pos_items` | `medicines`, `medicine_inventory` | No FK (perf) |
| `expenses` | `accounts`, `vendors` | No FK |
| `goods_received_notes` | `purchase_orders`, `medicines` | No FK |
| `imaging_orders` | `service_types` | Documented constraint |
| `ipd_charges` | `service_types` | Often missing service_type_id |

## Bulk dispensing lookup (pharmacy)

When dispensing prescriptions, `selling_price` and `inventory_id` may be missing on the line item. Bulk-lookup against `medicine_inventory` keyed by `(branch_id, medicine_id, store_id)`:

```ts
const inv = await supabase
  .from("medicine_inventory")
  .select("id, medicine_id, selling_price, quantity_on_hand")
  .eq("branch_id", branchId)
  .in("medicine_id", missingIds);

const invMap = new Map(inv.data?.map(r => [r.medicine_id, r]) ?? []);
```
