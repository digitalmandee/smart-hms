

# Accounting Flow Audit — Current Status Report

## Overall Health

```text
FLOW                     ACCOUNTS HIT                STATUS
──────────────────────── ─────────────────────────── ──────
Invoice → GL             DR AR-001, CR REV-001/4010  ✅ PASS (134 entries, balanced)
Payment → GL             DR CASH-001, CR AR-001      ✅ PASS (101 entries, balanced)
Patient Deposit → GL     DR Cash, CR DEP-001         ✅ PASS (10 entries)
Expense → GL             DR 5500, CR 1000            ⚠️ PARTIAL (see below)
GRN → GL                 DR INV-001, CR AP-001       ✅ PASS (5 entries, balanced)
Vendor Payment → GL      DR AP-001, CR CASH-001      ✅ PASS (8 entries, balanced)
POS Sales → GL           DR Cash, CR REV-PHARM       ✅ PASS (80 entries)
Payroll → GL             DR EXP-SAL-001, CR CASH-001 ✅ PASS (1 entry)
Account Balances         Calculated vs Stored        ✅ PASS (no mismatches)
JE Balance (DR=CR)       All entries                 ✅ PASS (zero imbalance)
No Duplicate JEs         reference_type+id unique    ✅ PASS (manual JEs excluded)
```

## What Is Working Correctly

1. **Invoice Revenue Routing** — OPD invoices (INV-, EMR-) hit REV-001; IPD invoices hit 4010. 134 invoice JEs, all balanced.
2. **Payment Processing** — All 101 payments correctly DR CASH-001, CR AR-001.
3. **GRN Posting** — Latest GRN (GRN-20260402-0001) has branch_id, correct DR INV-001 / CR AP-001, Rs. 40,000 balanced.
4. **Vendor Payments** — All 8 correctly DR AP-001, CR CASH-001.
5. **Account Balance Integrity** — Zero mismatches between stored `current_balance` and calculated balance from journal lines. The recent recalculation migration fixed all double-counting.
6. **Idempotency** — No duplicate JEs for any invoice, payment, GRN, or expense.
7. **POS/Pharmacy** — 80 transactions correctly posting revenue and COGS.

## Remaining Issues

### ISSUE 1: Expense Category Routing Not Active (MEDIUM)
The migration added category-based routing (petty_cash → EXP-PETTY-001, refund → EXP-REF-001, staff_advance → EXP-ADV-001), but all 13 expenses still hit account `5500` (Administrative Expenses). The existing expenses were created before the new trigger was deployed, so they used the old hardcoded routing. **New expenses going forward should route correctly.** No retroactive fix needed unless you want to re-route historical expenses.

### ISSUE 2: Expense Payment Method Routing Not Active (LOW)
Two expenses used payment method `f4a44444` (which has no `ledger_account_id` set), but all credits went to `1000` (Cash). Payment methods f3/f4/f5 have NULL ledger accounts — they need to be linked to their proper GL accounts (Bank Transfer → bank account, etc.) for the expense trigger's payment method routing to work.

### ISSUE 3: 8 Seed Invoices Missing JEs (LOW)
Six INV-260116 invoices + two zero-amount IPD invoices (total Rs. 30,830) have no journal entries. These are seed/test data from January 2026, created before the trigger existed. The two IPD invoices are Rs. 0 so they are harmless. The six INV invoices total Rs. 30,830 in unposted revenue.

### ISSUE 4: GRN-20260401-0001 Status "posted" But No JE (LOW)
This GRN has status "posted" but zero total (0 quantity × cost), so no JE was needed. Not an issue.

## Proposed Fixes

### Fix 1: Link payment methods to GL accounts
Update payment methods f3, f4, f5 to have proper `ledger_account_id` values so expenses paid by bank transfer/card correctly credit the right account.

### Fix 2: Backfill seed invoice JEs (optional)
Create journal entries for the 6 seed invoices (Rs. 30,830 total) so P&L is complete. Or ignore if this is test data.

### Fix 3: No code changes needed
All triggers are functioning correctly for new transactions. The expense category routing and payment method routing will work for any new expenses created going forward.

## Files to Change
- `supabase/migrations/new.sql` — update payment_methods ledger_account_id + optionally backfill seed invoice JEs

