---
name: clinical-workflow-conventions
description: HealthOS clinical module rules — OPD/IPD registration and billing gates, lab/imaging order-payment sync and lifecycle, radiology, dialysis, surgery OT, blood bank, dental 3D charting, ward medication billing, child/guardian registration, and consumable tracking policy. Load when editing any OPD, IPD, lab, imaging, radiology, dialysis, surgery, blood bank, dental, vitals, or ward medication code.
---

# Clinical Workflow Conventions

These rules are enforced by DB triggers and downstream billing. Breaking them creates orphan orders, missing invoices, or untracked stock.

## OPD

- **Walk-in registration** is a strict 4-step wizard. Upfront payment is mandatory — it generates the invoice and OPD token atomically. Don't allow skipping payment.
- **Roles**: only doctors run consultations. Nurses record vitals and bypass payment gates entirely (no invoice required for vitals).
- **Checkout billing**: fuzzy-match `service_type_id` when missing; invalidate cache after checkout. Pending unbilled lab/imaging/appointments auto-load into the invoice.
- **Token queue**: 1:2 layout split, auto-paginate when >12 tokens. URLs are dynamic per branch.
- **Walk-in integrity**: atomic inserts, UTC `invoice_date` to avoid timezone shifts.

## IPD

- **Admission** requires **Procedure** + **Attending Doctor** at registration. Do not make these optional.
- **Accounting is accrual**: `ipd_charges` is off-ledger during stay. The **discharge invoice** is what recognizes revenue. On discharge, explicitly set `is_billed = true` on every consumed charge.
- **Deposits** must link to `billing_session_id` for daily reconciliation. Split payments are stored as individual DB entries, not concatenated.
- **Ward medication**: administered IPD medication auto-creates an `ipd_charges` row (trigger). Don't insert charges manually.

## Lab & Imaging — order ↔ payment sync

Race condition risk is real here. **Always link `lab_orders.invoice_id` / `imaging_orders.invoice_id` BEFORE inserting the payment record.** Reverse order causes paid orders to appear unpaid.

- Realtime subscriptions refetch on `lab_orders` / `invoices` paid transitions.
- `imaging_orders` has **no FK** to `service_types` — manual JS join + fuzzy match required.

## Lab lifecycle

- States: **Save → Submit → Publish**. UI action buttons render dynamically per state.
- **Specimen ID format**: `{PREFIX}-{YYMMDD}-{SEQUENCE}`. Once status flips to `Collected`, lock specimen fields.
- **Result template matching priority**: `service_type_id` → exact `test_name` → substring. Don't reorder.

## Radiology

Lifecycle: **Pending → Reported → Verified → Delivered**. Only verified reports are deliverable.

## Dialysis

- Decoupled nurse/doctor workflow — don't gate one on the other.
- Session ID format: `DS-YYYYMMDD-XXX`.

## Surgery / OT

- Surgery completion auto-posts the journal AND deducts FIFO consumables. Never write the journal manually.
- See `finance-gl-posting` skill for trigger pattern.

## Blood Bank

- Default expiry: **35 days** from collection.
- Mandatory test panel before release. Integrates with OPD and Surgery requisitions.

## Dental

- 3D tooth chart via `@react-three/fiber`. Per-surface mapping (M/D/O/B/L) — preserve the surface model when editing.

## Patient registration

- Gender = **Child** enforces **mandatory guardian** details (name, relationship, contact). Don't allow submission without them.
- KSA: validate Saudi ID / Iqama (10 digits, starts with 1 or 2). See `ksa-compliance` skill.

## Consumable tracking policy (do not change)

- **No automated per-test consumable deduction.** Track profit margins via `cost_price` on service types instead. This is a deliberate constraint — multiple users have proposed auto-deduction and it has been rejected.

## See also

- `finance-gl-posting` — how clinical events post to GL
- `supabase-patterns` — `.single()` ban, manual joins, `__none__` Select
- `ksa-compliance` — Wasfaty, NPHIES, Nafath, dual calendar
