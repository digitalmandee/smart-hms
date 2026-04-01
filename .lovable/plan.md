

# End-to-End Accounting Audit: IPD, OPD & Inventory

## CRITICAL BUG: Double Balance Updates (Affects ALL Flows)

Every trigger that inserts `journal_entry_lines` causes **two** balance updates:

1. The `update_account_balance` trigger on `journal_entry_lines` (INSERT event) recalculates the full balance from all posted lines.
2. The trigger itself (e.g., `post_invoice_to_journal`) also does `UPDATE accounts SET current_balance = current_balance + amount`.

The `update_account_balance` trigger does a **full recalculation** (SUM of all debits/credits + opening_balance), so the manual `current_balance = current_balance + X` lines in other triggers are redundant and cause a race condition. In practice, because `update_account_balance` does a full recompute, the final value ends up correct — but only after a brief inconsistency window. The manual updates should be removed for cleanliness.

**Affected triggers with redundant manual balance updates:**
- `post_invoice_to_journal` (lines 53-54)
- `post_payment_to_journal` (lines 103-104)
- `post_pos_transaction_to_journal`

**Triggers that correctly rely only on `update_account_balance`:**
- `post_patient_deposit_to_journal` — correct, no manual balance update
- `post_grn_to_journal` (latest version) — correct
- `post_vendor_payment_to_journal` — correct
- `post_payroll_to_journal` — correct
- `post_stock_writeoff_to_journal` — correct

### Fix
Remove the manual `UPDATE accounts SET current_balance = ...` lines from `post_invoice_to_journal`, `post_payment_to_journal`, and `post_pos_transaction_to_journal`. The `update_account_balance` trigger handles it automatically.

---

## 1. IPD Flow Audit

### 1A. Admission Deposit
- **Trigger**: `post_patient_deposit_to_journal` (type = 'deposit')
- **GL**: DR Cash/Bank (CASH-001 or payment method ledger account) → CR Patient Deposits Liability (LIA-DEP-001)
- **Status**: CORRECT. Payment method resolution works. Journal reference_type = 'patient_deposit'.

### 1B. During Stay — Charges
- Charges accumulate in `ipd_charges` table (off-ledger). No GL posting during stay.
- **Status**: CORRECT by design (accrual at discharge).

### 1C. Discharge — Final Invoice
- **Trigger**: `post_invoice_to_journal` fires on invoice INSERT
- **GL**: DR AR-001 → CR 4010 (IPD Revenue) — routed via `IPD-` prefix
- **Status**: CORRECT. Revenue routing works for IPD prefix.

### 1D. Deposit Application at Discharge
- **Trigger**: `post_patient_deposit_to_journal` (type = 'applied')
- **GL**: DR LIA-DEP-001 → CR AR-001 — internal transfer clearing liability against receivable
- **Status**: CORRECT. Properly bypasses payments table.

### 1E. Remaining Balance Payment
- **Trigger**: `post_payment_to_journal` fires on payment INSERT
- **GL**: DR Cash/Bank → CR AR-001
- **Status**: CORRECT. Payment method resolution works.

### 1F. IPD Charges marked as billed
- `is_billed = true` set on all processed `ipd_charges` at discharge
- **Status**: CORRECT.

---

## 2. OPD Flow Audit

### 2A. Invoice Creation
- **Trigger**: `post_invoice_to_journal`
- **GL**: DR AR-001 → CR REV-001 (OPD/Service Revenue) — default for `INV-` prefix
- **Status**: CORRECT.

### 2B. Payment
- **Trigger**: `post_payment_to_journal`
- **GL**: DR Cash/Bank → CR AR-001
- **Status**: CORRECT.

### 2C. Lab Invoice
- Prefix: `LAB-` → CR 4030 (Laboratory Revenue)
- **Status**: CORRECT (new routing).

### 2D. Dialysis Invoice
- Prefix: `DLY-` → CR 4040 (Dialysis Revenue)
- **Status**: CORRECT (new routing).

### 2E. Pharmacy POS
- **Trigger**: `post_pos_transaction_to_journal`
- **GL**: DR CASH-001 → CR REV-PHARM-001
- **Status**: CORRECT. Separate trigger for POS.

---

## 3. Inventory & Procurement Flow Audit

### 3A. Purchase Order Creation
- No GL posting on PO creation — correct. POs are commitments, not transactions.
- **Status**: CORRECT.

### 3B. GRN (Goods Received)
- **Trigger**: `post_grn_to_journal` fires when GRN status → 'verified'
- **GL**: DR INV-001 (Inventory Asset) → CR AP-001 (Accounts Payable)
- Amount: Uses `invoice_amount` if set, otherwise SUM(quantity_accepted × unit_cost)
- **Status**: CORRECT.

### 3C. Vendor Payment
- **Trigger**: `post_vendor_payment_to_journal`
- **GL**: DR AP-001 → CR CASH-001
- **Status**: CORRECT. But note: always uses CASH-001, does not resolve payment method's ledger account. If vendor payments are made by bank transfer, they will still hit Cash in Hand.

### 3D. Stock Write-off / Damaged / Expired
- **Trigger**: `post_stock_writeoff_to_journal`
- **GL**: DR EXP-WO-001 (Inventory Write-off Expense) → CR INV-001 (Inventory Asset)
- **Status**: CORRECT.

### 3E. COGS (Cost of Goods Sold)
- **GAP**: There is NO trigger that posts COGS when pharmacy items are dispensed/sold. The `pharmacy_settings` table has a `cogs_account_id` column, but no trigger uses it. Pharmacy P&L calculates COGS on-the-fly in `usePharmacyReports.ts` using cost_price × quantity, but this is never posted to GL.
- **Impact**: P&L statement shows zero COGS. Inventory Asset (INV-001) balance never decreases when items are sold.

---

## 4. Gaps & Issues Summary

| # | Issue | Severity | Affected Area |
|---|-------|----------|---------------|
| 1 | **No COGS posting** when pharmacy items are sold — inventory asset never decreases, P&L has no cost-of-goods | HIGH | Inventory/P&L |
| 2 | Redundant manual balance updates in invoice/payment/POS triggers (race condition risk) | MEDIUM | All flows |
| 3 | Vendor payment always hits CASH-001, ignores payment method | LOW | Procurement |
| 4 | No Emergency invoice prefix routing (no `ER-` or `EMR-` prefix exists) | LOW | Emergency |

---

## Recommended Fix Plan

### Migration 1: Remove redundant balance updates
Strip the `UPDATE accounts SET current_balance = ...` lines from `post_invoice_to_journal` and `post_payment_to_journal`. The `update_account_balance` trigger on `journal_entry_lines` already handles this correctly.

### Migration 2: Add COGS posting to Pharmacy POS trigger
Update `post_pos_transaction_to_journal` to also post:
- DR COGS account (EXP-COGS-001) — total cost of items sold
- CR INV-001 (Inventory Asset) — reduce inventory

This requires calculating cost from `pharmacy_pos_items.cost_price × quantity` within the trigger.

### Migration 3: Add payment method resolution to vendor payments
Update `post_vendor_payment_to_journal` to check `payment_methods.ledger_account_id` like the patient payment trigger does.

### Frontend: No changes needed
All frontend hooks correctly generate the right prefixes and call the right tables. The fixes are purely database-level.

## Files Changed
- `supabase/migrations/new_1.sql` — clean up redundant balance updates in invoice/payment triggers
- `supabase/migrations/new_2.sql` — add COGS posting to POS trigger
- `supabase/migrations/new_3.sql` — vendor payment method resolution

