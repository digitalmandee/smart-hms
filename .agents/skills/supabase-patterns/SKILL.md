---
name: supabase-patterns
description: Supabase query, mutation, join, and migration conventions for this HealthOS HMS project — covers the .single() ban, empty-string UUID nulling, manual JS joins for tables without FKs (pharmacy_pos_items, expenses, goods_received_notes), the fetchAllRows 1000-row bypass, idempotent triggers, and migration discipline. Apply whenever reading or writing Supabase data, writing edge functions, or adding migrations.
---

# Supabase Patterns (HealthOS 24)

These rules are non-negotiable in this codebase. Violating them causes silent data loss, race conditions, or runtime crashes that are painful to debug.

## 1. NEVER use `.single()`

`.single()` throws if 0 or 2+ rows are returned. Both happen in production (race conditions, soft-deletes, multi-tenant filters).

```ts
// ❌ NEVER
const { data, error } = await supabase.from("invoices").select("*").eq("id", id).single();

// ✅ For "expected 0-1 row"
const { data, error } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();

// ✅ For inserts/updates returning a row
const { data, error } = await supabase.from("invoices").insert(payload).select();
const row = data?.[0];
```

After updates, ALWAYS chain `.select()` and read `data?.[0]`. Never assume the update returned the row.

## 2. Empty-string UUIDs → `null`

Form state often holds `""` for unselected dropdowns. Supabase rejects `""` for UUID columns with a cryptic error. Map explicitly before insert/update:

```ts
const payload = {
  ...form,
  doctor_id: form.doctor_id || null,
  referred_by: form.referred_by || null,
  service_type_id: form.service_type_id || null,
};
```

Combine with the Radix Select `__none__` pattern (see `arabic-rtl-translation` skill) — `__none__` in UI maps to `''` in form state, which maps to `null` at the DB boundary.

## 3. Manual JS joins for FK-less tables

Some tables intentionally lack foreign keys for performance or multi-tenant reasons. Supabase's PostgREST embed (`select("*, foo(*)")`) silently returns `null` for these joins. Do the join in JS instead.

Known tables that require manual joins:
- `pharmacy_pos_items` ↔ `medicines` / `medicine_inventory`
- `expenses` ↔ `accounts` / `vendors`
- `goods_received_notes` ↔ `purchase_orders` / `medicines`
- `imaging_orders` ↔ `service_types`

See `references/manual-joins.md` for the canonical pattern.

## 4. Bypass the 1000-row limit with `fetchAllRows`

Supabase caps query results at 1000 rows by default. Reporting queries silently truncate. Use the recursive helper:

```ts
import { fetchAllRows } from "@/lib/supabase-fetch-all"; // pharmacy/reporting helper

const allSales = await fetchAllRows((from, to) =>
  supabase.from("pharmacy_pos_items").select("*").range(from, to)
);
```

See `references/query-limits.md` for the helper implementation.

## 5. GL Posting — never manual journals in app code

Journals are posted by idempotent DB triggers (`IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_id = NEW.id)` guard). Application code never writes to `journal_entries` directly except for manual vouchers (CPV/CRV/BPV/BRV/JV).

If a GL entry is missing for an invoice/POS sale/GRN, the fix is at the **trigger level**, not by inserting a journal in the app. See the `finance-gl-posting` skill.

## 6. Migrations only — never edit `types.ts`

- All DDL goes through `supabase--migration` tool. The user approves automatically.
- `src/integrations/supabase/types.ts` is generated from the live DB schema. Never hand-edit it.
- Never include `ALTER DATABASE postgres` in a migration.
- Use validation triggers, not CHECK constraints, for any time-based rule (`expire_at > now()` etc.) — CHECK must be immutable.

## 7. Account category case sensitivity

`account_types.category` is stored lowercase. Always normalize in queries:

```ts
.eq("account_types.category", category.toLowerCase())
```

Reports break silently when this is missed.

## 8. Edge functions — secrets via env, never DB

- Frontend uses `VITE_SUPABASE_PUBLISHABLE_KEY` (anon). Never ship `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Edge functions read elevated keys via `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")`.
- Add new secrets with the `secrets--add_secret` tool.
