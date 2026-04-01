

# Fix: Route ALL Invoice Types to Correct GL Revenue Accounts

## Current State
- **IPD invoices** (`IPD-` prefix) → correctly hitting `4010` (IPD Revenue) ✓
- **OPD/Lab/Dialysis invoices** (`INV-` prefix) → all hitting `REV-001` (OPD Revenue)
- **Pharmacy POS** → correctly hitting `REV-PHARM-001` via separate trigger ✓
- **Emergency invoices** → no separate prefix exists yet

## Problem
Lab and Dialysis invoices use the same `INV-` prefix as OPD, so they all land in `REV-001` (OPD Revenue). There's also no emergency invoice flow with a distinct prefix. To properly route revenue, we need distinct prefixes.

## Changes

### 1. Update Invoice Prefixes in Frontend Hooks
Give each invoice source its own prefix so the trigger can route them:

| Source | File | Current Prefix | New Prefix |
|--------|------|---------------|------------|
| OPD Billing | `src/hooks/useBilling.ts` line 201 | `INV-` | `INV-` (unchanged) |
| IPD Discharge | `src/hooks/useDischarge.ts` line 479 | `IPD-` | `IPD-` (unchanged) |
| Lab Orders | `src/hooks/useLabOrders.ts` line 209 | `INV-` | `LAB-` |
| Dialysis | `src/hooks/useDialysis.ts` line 330 | `INV-` | `DLY-` |

### 2. Create Revenue Accounts + Update Trigger (Migration)
Update the `post_invoice_to_journal` trigger to handle all prefixes:

```text
Routing logic:
  IPD-  → '4010'  (IPD Revenue)
  LAB-  → '4030'  (Laboratory Revenue) — new account under 4140 Ancillary
  DLY-  → '4040'  (Dialysis Revenue)  — new account under 4140 Ancillary
  INV-  → 'REV-001' (OPD Revenue) — default
```

The migration will:
1. Update the trigger function with the expanded routing
2. Ensure new accounts `4030` and `4040` get created under `4140` (Ancillary Revenue) via `get_or_create_default_account`
3. Parent them under `4140` if the hierarchy exists

### 3. No Backfill Needed
Existing `INV-` prefixed invoices (mix of OPD/Lab/Dialysis) cannot be distinguished retroactively since they all share the same prefix. Going forward, new Lab and Dialysis invoices will use their distinct prefixes and route correctly.

## Result
- **OPD Revenue** (`REV-001`) — OPD consultation invoices only
- **IPD Revenue** (`4010`) — discharge invoices
- **Laboratory Revenue** (`4030`) — lab order invoices
- **Dialysis Revenue** (`4040`) — dialysis session invoices
- **Pharmacy Revenue** (`REV-PHARM-001`) — POS sales (already working)
- All roll up correctly under **Service Revenue** (`4100`) in GL

## Files Changed
- `src/hooks/useLabOrders.ts` — change prefix from `INV-` to `LAB-`
- `src/hooks/useDialysis.ts` — change prefix from `INV-` to `DLY-`
- `supabase/migrations/new.sql` — updated trigger with full routing + account creation

