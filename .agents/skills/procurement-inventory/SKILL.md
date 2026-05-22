---
name: procurement-inventory
description: Procurement (PR → PO → GRN) and warehouse/inventory conventions — requisition status sync, atomic GRN verification with idempotency, auto-delete PO on item failure, GL auto-post, and standalone warehouse module isolation. Auto-loads for any work on purchase requisitions, purchase orders, goods received notes, vendors, or warehouse management.
---

# Procurement & Inventory

## 1. Document chain — PR → PO → GRN

Linked by `requisition_id` across all three. When creating a PO from a PR, always carry `requisition_id` onto every PO line. GRN inherits it from the PO.

`goods_received_notes` has **no FK** to `purchase_orders` — do manual JS joins (see `supabase-patterns`).

## 2. GRN verification — atomic RPC, idempotent

Verification is done through a single RPC, not multiple client-side calls:

```ts
await supabase.rpc("verify_grn", { grn_id, verified_lines });
```

The RPC uses a **unique index** as the idempotency guard — re-submitting the same GRN cannot double-post. Don't wrap multiple `.update()` / `.insert()` calls in JS as a substitute; concurrent verification breaks without the unique constraint.

## 3. Auto-delete PO when items fail

If GRN verification rejects all line items on a PO, the PO is **auto-deleted** (trigger). Don't try to "soft-cancel" from the app — the trigger handles it and downstream AP, budget, and requisition status all depend on the deletion.

Partial rejection: only the failed lines are removed; PO survives with surviving lines.

## 4. Requisition status auto-syncs

GRN verification trigger transitions the linked `purchase_requisitions.status` to `'issued'` when all PR lines are fully received. Don't update PR status from app code — race conditions with the trigger produce wrong states.

## 5. GL auto-post on GRN acceptance

```
DR INV-001 (Inventory)    CR AP-001 (Accounts Payable)
```

Posted by trigger with `IF EXISTS (SELECT 1 FROM journal_entries WHERE source_type='grn' AND source_id=NEW.id)` guard. Never insert this journal from app code. See `finance-gl-posting`.

Vendor payment later: `DR AP-001  CR Cash/Bank` — don't debit expense, the expense was recognized at GRN time.

## 6. Pharmacy stock intake (cross-link)

GRN-verified pharmacy items upsert into `medicine_inventory` with conflict target `(branch_id, medicine_id, store_id, batch_number, expiry_date)`. See `pharmacy-operations` section 2.

## 7. Warehouse module — standalone WMS

The warehouse module is **isolated** from clinical modules:
- Hierarchical menu (Zone → Aisle → Rack → Bin) instead of clinical sidebar.
- Routes under `/app/warehouse/*`.
- When tenant `facility_type = 'warehouse'`, clinical paths (OPD, IPD, lab, surgery) are **blocked** — the sidebar shouldn't render them and route guards reject navigation.

Don't try to share OPD/IPD components inside warehouse views.

## 8. Module isolation by facility_type

Inventory UI/workflows adapt by `facility_type`. Hospitals see clinical-linked inventory (medicines, consumables, OT trays). Warehouse-only tenants see pure WMS. Read from facility config; don't hardcode.

## 9. Manual joins

Tables without FKs that need JS joins:
- `goods_received_notes` ↔ `purchase_orders` / `medicines`
- `expenses` ↔ `accounts` / `vendors`

See `supabase-patterns` section 3.

## See also

- `finance-gl-posting` — procurement GL postings, vendor payment routing
- `pharmacy-operations` — pharmacy stock upsert path
- `supabase-patterns` — manual joins, atomic RPC patterns
