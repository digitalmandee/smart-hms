---
name: pharmacy-operations
description: Pharmacy POS, dispensing, returns, inventory intake, and reporting conventions. Auto-loads for any work on pharmacy_pos_sessions, dispensing flows, returns, GRN stock upsert, medicine_inventory, or pharmacy reports that may exceed the 1000-row Supabase limit.
---

# Pharmacy Operations

## 1. POS sessions — dedicated table

Pharmacy POS uses **`pharmacy_pos_sessions`**, not the generic `billing_sessions`. One open session per cashier per terminal per day.

- Open: insert with `status='open'`, `opening_cash`.
- Close: update with `closing_cash`, `status='closed'`, `closed_at`. Discrepancy = `closing_cash − (opening_cash + cash_sales − cash_refunds)`.
- Daily closing reconciliation is blocked while any pharmacy session is still open (same rule as `billing_sessions`).

## 2. Inventory stock intake — atomic GRN upsert

Stock arrives via GRN. The upsert merges on a **unique index `(branch_id, medicine_id, store_id, batch_number, expiry_date)`**:

```ts
await supabase.from("medicine_inventory").upsert(
  rows,
  { onConflict: "branch_id,medicine_id,store_id,batch_number,expiry_date" }
).select();
```

Never INSERT without the conflict target — duplicate batch rows break FIFO and COGS.

Pharmacy schema uses `unit_cost` + `created_at` (not `cost_price` + `inserted_at`). See `mem://finance/accounts-schema-conventions`.

## 3. Dispensing & returns — bulk lookup

`pharmacy_pos_items` lacks FK to `medicines` / `medicine_inventory`. When `selling_price` or `inventory_id` is missing on a line item, do a **bulk lookup** rather than per-row queries:

```ts
const ids = items.map(i => i.medicine_id);
const { data: inv } = await supabase.from("medicine_inventory")
  .select("id, medicine_id, selling_price, batch_number, expiry_date")
  .in("medicine_id", ids)
  .gt("quantity_on_hand", 0)
  .order("expiry_date", { ascending: true }); // FIFO by expiry

const invByMedicine = new Map();
inv?.forEach(r => { if (!invByMedicine.has(r.medicine_id)) invByMedicine.set(r.medicine_id, r); });
```

Returns: reverse the qty into `medicine_inventory` against the **same batch** the sale came from. Never return into a generic "stock" row.

## 4. Reporting — bypass the 1000-row limit

Pharmacy sales reports routinely exceed Supabase's 1000-row default. Use the recursive helper:

```ts
import { fetchAllRows } from "@/lib/supabase-fetch-all";

const sales = await fetchAllRows((from, to) =>
  supabase.from("pharmacy_pos_items")
    .select("*, pharmacy_pos_sales!inner(created_at, branch_id)")
    .gte("pharmacy_pos_sales.created_at", start)
    .range(from, to)
);
```

See `supabase-patterns` skill section 4.

## 5. GL posting — POS sales (don't write manually)

DB trigger auto-posts on POS sale completion:
```
Revenue: DR Cash/Card        CR Revenue – Pharmacy
COGS:    DR EXP-COGS-001     CR INV-001 (Inventory)
```
COGS basis = `medicine_inventory.unit_cost` of the batch consumed. See `finance-gl-posting`.

## 6. Wasfaty (KSA e-prescription)

KSA-only. Routed through the `wasfaty-gateway` edge function — never call MOH API from the client. Stored in `wasfaty_prescriptions`. See `ksa-compliance`.

## 7. Manual joins required

`pharmacy_pos_items` ↔ `medicines` / `medicine_inventory` has no FK. Use JS joins, never `select("*, medicines(*)")`. See `supabase-patterns` section 3.

## See also

- `supabase-patterns` — `.single()` ban, manual joins, fetchAllRows
- `finance-gl-posting` — pharmacy COGS posting
- `procurement-inventory` — GRN verification flow that feeds pharmacy stock
- `ksa-compliance` — Wasfaty, Tatmeen track-and-trace
