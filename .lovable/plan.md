

# Accounting System — Current State Audit & Remaining Shortcomings

## Live Database Findings

I queried the production database and found the following:

### What's Working Perfectly
- **Zero imbalanced journals**: All 418 journal entries across 10 reference types have DR = CR (zero imbalance)
- **100% invoice coverage**: 143/144 active invoices have journal entries (2 missing are zero-amount IPD invoices — correct to skip)
- **Account balances correct**: The `update_account_balance` trigger properly applies `opening_balance + normal-side GL activity`. All account `current_balance` values match their GL-computed balances
- **Full trigger coverage**: invoice, payment, expense, POS, GRN, vendor payment, deposit, credit note, donation, payroll, surgery — all auto-post to GL
- **Cancellation reversal**: Trigger exists and is active
- **Year-End Closing, Recurring Entries, PDC Register**: All implemented and routed

---

## Remaining Shortcomings (5 Issues Found)

### ISSUE 1 — CRITICAL: Active Invoice Trigger Checks for Invalid Status `issued`

The currently active `post_invoice_to_journal()` (Phase 4-5 version) filters:
```sql
IF NEW.status NOT IN ('issued', 'paid', 'partially_paid') THEN RETURN NEW;
```
But `issued` is NOT a valid invoice status. Valid statuses are: `pending`, `paid`, `partially_paid`, `cancelled`.

**Impact**: Invoices created with status `pending` get NO journal entry until they change to `paid`. This breaks accrual accounting — AR and revenue should be recognized at invoice creation.

**Fix**: Change `'issued'` to `'pending'` in the status check.

### ISSUE 2 — CRITICAL: Insurance AR Split is Dead Code

The trigger references `NEW.insurance_id` and `NEW.insurance_amount`, but these columns do NOT exist on the `invoices` table. Confirmed via schema query — only `discount_amount`, `subtotal`, `tax_amount` exist.

**Impact**: The entire insurance receivable split (DR AR-001 patient portion, DR AR-INS-001 insurance portion) never fires. All invoices post to AR-001 only.

**Fix**: Add `insurance_id` (FK to insurance_plans or patient_insurance) and `insurance_amount` columns to invoices. Populate during invoice creation for insured patients.

### ISSUE 3 — HIGH: Traceability Columns Not Backfilled

Database shows:
- **0/144** invoices have `doctor_id`
- **0/144** invoices have `department`  
- **0/144** invoices have `admission_id`
- **33/144** invoices have `appointment_id` (backfilled from appointments table)

The code changes to populate these only affect NEW invoices. All historical data has no traceability linkage.

**Fix**: Write a backfill migration that:
1. Populates `doctor_id` from `invoice_items.doctor_id` (first non-null)
2. Populates `admission_id` from linked IPD invoices (prefix `IPD-`)
3. Populates `department` from invoice prefix or service_type category

### ISSUE 4 — MEDIUM: Missing Default Accounts Not Pre-Created

`DISC-001` (Discounts Allowed), `AR-INS-001` (Insurance Receivables), and `BAD-DEBT-001` (Bad Debt Expense) are not pre-seeded. They rely on `get_or_create_default_account()` at trigger runtime, which works but means:
- No account exists until the first transaction that needs it
- Account type assignment depends on the fallback parameter which may not match the CoA structure

**Fix**: Pre-create these accounts in each organization's CoA via migration.

### ISSUE 5 — LOW: Historical Journals Lack Tax/Discount Granularity

All 143 existing invoice journals were posted as 2-line entries (DR AR, CR Revenue) under the old trigger. None have separate Tax Payable or Discount Allowed lines, even if tax/discount amounts existed.

**Fix**: Optional retroactive re-posting script that deletes old journal + lines and re-fires the trigger. Low priority since existing data appears to have zero tax/discount amounts.

---

## Implementation Plan

### Migration 1: Fix trigger + add insurance columns + backfill
1. Fix `post_invoice_to_journal()` — change `'issued'` to `'pending'`
2. Add `insurance_id UUID` and `insurance_amount NUMERIC` to invoices
3. Backfill `doctor_id` from invoice_items
4. Backfill `department` from invoice prefix mapping
5. Backfill `admission_id` from admissions table matching
6. Pre-create DISC-001, AR-INS-001, BAD-DEBT-001 accounts for all organizations

### Code Changes
1. Update `useBilling.ts` — populate `insurance_id` and `insurance_amount` during invoice creation when patient has insurance
2. Update invoice form to pass insurance details

## File Summary

| File | Change |
|------|--------|
| Migration (new) | Fix trigger status, add columns, backfill traceability, seed accounts |
| `src/hooks/useBilling.ts` | Populate insurance_id/insurance_amount on invoice creation |

**Total: 1 migration, 1 file edit**

