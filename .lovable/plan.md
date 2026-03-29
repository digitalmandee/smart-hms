

# OPD Flow Testing — Issues Found & Fixes Required

## Investigation Summary

I traced the full OPD workflow: Billing Session → Walk-in → Consultation → Lab/Imaging Orders → Checkout → Invoices → Daily Closing → Journal Entries. Here are the findings:

---

## Issue 1: Radiology Orders NOT Showing in OPD Checkout (BUG — Critical)

**Root cause**: The checkout page queries imaging orders with a JOIN that does not exist:

```
.select("*, procedure:service_types(name, default_price)")
```

The `imaging_orders` table has **no foreign key to `service_types`**. It has `procedure_id → imaging_procedures` but the query aliases `procedure` to `service_types`, which fails silently (returns null for the join) or throws a 400 error. This means:
- Imaging orders load but `procedure.default_price` is always null → amount = 0
- They may not appear at all if the query errors out

**Fix**: Change the checkout imaging query to:
1. Remove the broken `procedure:service_types` join
2. Instead, fetch imaging orders with their raw columns (`procedure_name`, `modality`)
3. For pricing, do a fuzzy name-match against `service_types` (same fallback pattern used for lab orders) OR use `imaging_procedures` table which may have pricing

## Issue 2: PendingCheckoutPage Does NOT Query Imaging Orders (BUG — Moderate)

The `PendingCheckoutPage` only queries `lab_orders` and `prescriptions` to show pending badges. It completely **ignores imaging orders**. A patient with unpaid radiology but paid consultation + labs would not show "Additional Charges" badge.

**Fix**: Add imaging orders query alongside lab orders in the pending orders fetch, and include imaging count in the badge display.

## Issue 3: Consultation Records — Are They Properly in Patient Profile? (VERIFIED — Working)

The `PatientDetailPage` includes:
- `PatientOPDVisits` — shows OPD visit history
- `PatientVisitsHistory` — general visits
- `PatientLabHistory` — lab order history
- `PatientPrescriptionsHistory` — prescription history
- `PatientBillingHistory` — invoice/payment history

Consultations are linked via `appointments → consultations` and show in these tabs. **This is working correctly** — consultation data is persisted and visible on the patient profile.

## Issue 4: Do Invoices Hit Accounts Immediately or Only When Billing Session Closes? (VERIFIED — Immediate)

The database has **triggers that auto-post to journal immediately**:
- `post_invoice_to_journal` — fires on invoice INSERT → creates DR Accounts Receivable / CR Revenue
- `post_payment_to_journal` — fires on payment INSERT → creates DR Cash/Bank / CR Accounts Receivable

**Invoices and payments hit the general ledger immediately upon creation**, not when the billing session closes. The Daily Closing is purely a **reconciliation step** — it compares physical cash vs system totals. It does NOT batch-post transactions.

So: Every walk-in payment, lab payment, etc. already has a journal entry the moment it's recorded. Daily Closing just verifies the totals match.

---

## Implementation Plan

### Step 1: Fix Imaging Orders in OPD Checkout (Critical)
**File**: `src/pages/app/opd/OPDCheckoutPage.tsx` (lines 157-170)
- Change the imaging query from `procedure:service_types(...)` to just `*`
- Add a separate service_types lookup for radiology pricing (fuzzy match by `procedure_name` against `service_types` where `category = 'radiology'`)
- If no service_type match, fall back to 0 amount with a warning badge

### Step 2: Add Imaging Orders to PendingCheckoutPage
**File**: `src/pages/app/opd/PendingCheckoutPage.tsx` (lines 72-113)
- Add query for `imaging_orders` where `invoice_id IS NULL` for the patient IDs
- Include `imagingOrders` count in `ordersByPatient` data structure
- Show imaging count in the checkout badge alongside lab orders

### Step 3: Add Radiology Service Types Fallback Query
**File**: `src/pages/app/opd/OPDCheckoutPage.tsx`
- Add `radiologyServiceTypes` query (same pattern as existing `labServiceTypes` at line 88) filtering `category = 'radiology'`
- Use this for fuzzy name matching when resolving imaging prices

### No Changes Needed For:
- Consultation records in patient profile — already working
- Journal posting — already immediate via triggers
- Daily closing — correctly aggregates all invoices/payments for the day regardless of session state

