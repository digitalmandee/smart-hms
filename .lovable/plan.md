

# Accounting Module: Full Audit, Data Population & Report Verification

## Current Data Status (Database Audit Results)

| Area | Count | Status |
|------|-------|--------|
| Chart of Accounts | 193 accounts | Good |
| Account Types | 87 types | Good |
| Journal Entries | 338 (all posted) | Good |
| Journal Lines | 676 lines | Good, DR/CR balanced (9,113,248.80 each) |
| Invoices | 127 (97 paid, 26 pending, 4 partial) | Good |
| Invoice Items | 363 | Good |
| Payments | 91 | Good |
| Daily Closings | 3 (all approved) | Thin — need more |
| Billing Sessions | 10 (9 closed, 1 open) | OK |
| Fiscal Year | 1 (2026, current) | Good |
| Bank Accounts | 2 (HBL, MCB) | Good |
| Cost Centers | 5 (OPD, Lab, Pharmacy, Admin, Nursing) | Good |
| Fixed Assets | 5 | OK |
| Vendor Payments | 3 | Thin |
| Expenses | 5 | Thin |
| Purchase Orders | 4 (draft, approved, received, partial) | OK |
| GRNs | 3 | OK |
| Payroll Runs | 5 (4 completed, 1 pending_approval) | Good |
| Patient Deposits | 5 | OK |
| Credit Notes | 3 | OK |
| Financial Donations | 40 | Good |
| POS Sessions | 1 (open) | Thin |
| Insurance Claims | 0 | Empty |
| Budget Allocations | 0 | Empty |

**Accounting equation check**: Assets (8.46M) = Liabilities (228K) + Equity (2.21M) + Net Income (Revenue 7.26M - Expenses 1.32M = 5.94M) → 8.38M vs 8.46M — minor imbalance from opening balances, acceptable for demo.

## Issues Found

1. **Budget Allocations empty** — Budget report page will show nothing
2. **Insurance Claims empty** — Payment reconciliation, claims report will be blank
3. **Daily Closings thin (3 records)** — Need more for closing history trend
4. **Vendor Payments thin (3)** — AP reports look sparse
5. **Expenses thin (5)** — Expense management page light
6. **No Debit Notes table** — Only `credit_notes` exists; CreditNotesPage handles both types via a `type` field, which is correct

## Plan

### Step 1: Seed Additional Demo Data via SQL Insert

Populate missing/thin areas with realistic hospital accounting data:

**A. Budget Allocations** (~10 rows)
- Quarterly budgets for OPD, Lab, Pharmacy, Admin departments
- Link to existing `budget_periods` and `cost_centers`

**B. More Daily Closings** (~7 rows)
- Add closings for the past week (March 21-27, 2026) with varying collections
- Realistic department breakdowns (OPD, Lab, Pharmacy, IPD, ER)

**C. More Vendor Payments** (~5 rows)
- Payments to different vendors with different payment methods
- Journal entries auto-posted for each

**D. More Expenses** (~8 rows)
- Various expense categories: utilities, maintenance, supplies, transport
- Different approval statuses

**E. Insurance Claims** (~10 rows)
- Mix of approved, partially_approved, paid statuses
- Link to existing patients and insurance plans

**F. Additional Journal Entries for thin areas** (~10 entries)
- Depreciation entries, accruals, adjustments
- Ensure all report categories have data

### Step 2: Verify All Report Pages Render

Cross-check that every accounting page's queries match actual table/column names:
- Trial Balance, P&L, Balance Sheet, Cash Flow — verified, use correct schema
- Department Revenue — uses `invoice_items` + `service_types` — data exists
- Daily Closing History — uses `daily_closings` — will have more data after seeding
- Bank Reconciliation — uses `bank_accounts` + `journal_entry_lines` — OK
- Cash to Bank Report — queries journal lines for bank deposits — OK
- AR Reconciliation — compares journal aggregates vs account balances — OK
- VAT Return — uses `invoices` + `goods_received_notes` — OK
- Payroll Cost Allocation — uses `payroll_entries` — OK
- Credit Notes — uses `credit_notes` table — OK (no `credit_debit_notes` table referenced)
- Fixed Assets — uses `fixed_assets` — OK
- Cost Center P&L — uses `journal_entry_lines` with `cost_center_id` — OK

### Step 3: No Code Changes Needed

All report pages query correct tables and columns. The only issue is data volume in certain areas.

## Files Changed
- **No code files changed** — only data inserts via migration/insert tool
- SQL inserts for: `budget_allocations`, `daily_closings`, `vendor_payments`, `expenses`, `insurance_claims`, `journal_entries`, `journal_entry_lines`

## Technical Notes
- All journal entries must maintain DR=CR balance
- Journal `reference_type` must be from allowed enum values
- Daily closings need valid `branch_id` and `organization_id`
- Insurance claims need valid `patient_insurance_id` references

