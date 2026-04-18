

# CFO-Grade Finance Audit — Critical Gaps in HMIS Accounting

I queried the live database (419 JE, 208 accounts, 145 invoices) and reviewed every accounts page. Here is what a CFO would flag.

## Severity Legend
- **P0 — Material Weakness**: Books may misstate, audit-blocking
- **P1 — Significant Deficiency**: Compliance/control gap
- **P2 — Operational Gap**: Missing best-practice feature

---

## P0 — Material Weaknesses (Fix First)

### 1. Fiscal-Year Isolation Broken
- **All 419 journal entries have `fiscal_year_id = NULL`**
- 14 entries are dated **before** the only fiscal year's start_date
- No FY validation trigger blocks back-dating into closed periods
- **Fix**: Auto-populate `fiscal_year_id` on JE insert via trigger; reject inserts where the period is closed; backfill existing 419 entries

### 2. Invoice Cancellation Reversal Not Firing
- Cancelled invoice `INV-20260401-950` (10,000) still has its journal entry with `is_reversed=false`
- Books overstate revenue and AR by the cancelled amount
- **Fix**: Bind/repair `post_invoice_cancellation_reversal` trigger; backfill reversals for existing cancelled invoices

### 3. Duplicate / Fragmented Chart of Accounts
- Account `1000 Cash in Hand` AND `CASH-001 Cash in Hand` both exist (one is **negative -107,800**, the other +2,247,104)
- Same duplication: `2400 Patient Deposits` vs `LIA-DEP-001`, `4010 Service Revenue – IPD` vs `REV-IPD-001`, `2200 Tax Payable` vs no GL counterpart for VAT report
- **Fix**: Merge duplicates (move balances, repoint GL lines, deactivate the orphan); enforce a single canonical CoA template per organization

### 4. IPD Work-In-Progress Not Accrued
- 49 unbilled `ipd_charges` worth **179,500** are sitting off-ledger for 21 active admissions
- P&L understates revenue (services rendered but not yet billed)
- **Fix**: Month-end accrual JV (DR Unbilled Revenue / CR IPD Revenue) reversed on first day of next month, OR a real-time WIP report visible to CFO

### 5. VAT Return Sources from Invoices, Not Tax Payable GL
- `VatReturnPage` queries `invoices.tax_amount` directly — bypasses Tax Payable account (`2200`)
- Filing risk: VAT return won't tie to the trial balance
- **Fix**: Source Output VAT from credits to Tax Payable account; Input VAT from debits; add a VAT control account reconciliation tab

---

## P1 — Significant Deficiencies

### 6. Bank Reconciliation Effectively Unused
- 8 bank transactions, **0 reconciled**
- No month-end "outstanding cheques / deposits in transit" report
- **Fix**: Add reconciliation completeness KPI to dashboard; force monthly bank rec sign-off before month close

### 7. Cash Flow Statement Uses Proxies, Not GL
- `useCashFlow` adds `payments + vendor_payments + payroll_runs` instead of analysing movements on cash & bank GL accounts (`CASH-001`, `1010`, `1020`)
- Will not reconcile to opening + net change = closing cash
- **Fix**: Rewrite as true direct-method statement: opening cash balance + categorized movements (operating/investing/financing) sourced exclusively from GL lines hitting cash/bank accounts

### 8. Cost Center Tagging Effectively Off
- Only **19 of 830 GL lines** carry `cost_center_id` (2.3%)
- Cost-center P&L drill-down is meaningless
- **Fix**: Make cost_center mandatory at line level for revenue/expense accounts; auto-derive from invoice `department` / expense `category`; backfill historical lines

### 9. Branch Segment Reporting Has Holes
- 44 of 419 journal entries have `branch_id = NULL`
- Branch P&L will silently undercount
- **Fix**: Enforce `branch_id NOT NULL` on JE insert (trigger); backfill nulls from source document

### 10. Year-End Closing Doesn't Roll P&L → Retained Earnings
- `YearEndClosingPage` exists but no automated closing entry is generated
- Revenue/expense accounts will not zero out; Retained Earnings won't update
- **Fix**: Closing routine creates: DR Revenue accounts / CR Income Summary; DR Income Summary / CR Expense accounts; DR/CR Income Summary / Retained Earnings (`3111`); locks the FY

### 11. Depreciation Posting is Manual & Not Per-Asset
- User selects expense + accumulated dep account each month
- Should be configured **on the asset itself** (already has `account_id` and `depreciation_account_id` columns — unused)
- No automated monthly schedule; relies on user remembering to click
- **Fix**: Use per-asset accounts; add monthly cron / first-of-month auto-post; depreciation schedule report per asset

### 12. No Budget vs Actual Variance Reporting
- 8 budget periods + 10 budget allocations exist
- No page shows budget vs actual with variance % and drill-down
- **Fix**: New "Budget Variance Report" — actuals from GL, budget from `budget_allocations`, variance highlights >10% in red

---

## P2 — Operational Gaps

### 13. Recurring Journal Templates: 0 used
- Page exists, table is empty — no rent/insurance/lease accruals automated
- **Fix**: Seed common templates (rent, depreciation, prepaid expense amortization); add cron to auto-post

### 14. Cluttered CoA — 76 of 98 Posting Accounts Have Zero Activity
- Reports show empty rows; users get confused
- **Fix**: Add "Hide zero-balance accounts" toggle on Trial Balance / P&L / Balance Sheet (default ON)

### 15. No Patient Statement / SOA from CFO Lens
- Patient ledger exists but no aged AR statement per patient/insurer for collections
- **Fix**: "Customer Statement" PDF (last 90 days transactions, opening + closing balance) downloadable from patient profile and AR aging

### 16. No Vendor Statement Reconciliation
- Vendor payments exist but no vendor SOA showing PO → GRN → AP → Payment chain
- **Fix**: Vendor statement page mirroring patient statement

### 17. No FX / Multi-currency Support Despite `currency` & `exchange_rate` Columns
- Single-org assumption; international donors / insurance in USD won't revalue
- **Fix (when needed)**: Month-end FX revaluation routine for non-base-currency monetary accounts

### 18. Headers/index.md doesn't track "Days Sales Outstanding (DSO)" or "Cash Conversion Cycle"
- **Fix**: Add CFO KPI widgets to dashboard: DSO, DPO, Current Ratio, Quick Ratio, Gross Margin %, Cash Runway (months)

---

## Proposed Implementation (Phased)

### Phase 1 — Material Fixes (1 migration + code)
- Auto-populate `fiscal_year_id` + period-lock trigger; backfill 419 JEs
- Repair invoice cancellation reversal trigger; backfill cancelled invoices
- CoA cleanup migration: merge duplicate accounts (1000→CASH-001, 2400→LIA-DEP-001, 4010→REV-IPD-001, 2200→TAX-VAT-001)
- Enforce `branch_id NOT NULL` on JE; backfill 44 nulls

### Phase 2 — Reporting Integrity (code only)
- Rewrite `useCashFlow` to true GL-sourced direct method
- Rewrite `VatReturnPage` to source from Tax Payable GL (with reconciliation tab)
- Add IPD WIP / Unbilled Revenue dashboard widget + month-end accrual button
- Add "Hide zero-balance" toggle on TB / P&L / BS

### Phase 3 — Year-End & Automation
- Year-End Closing: generate closing entries to Retained Earnings, lock FY
- Move depreciation accounts to per-asset config; add auto-post on month start
- Seed recurring journal templates; add scheduler

### Phase 4 — CFO Dashboards & Statements
- Budget vs Actual variance report with drill-down
- DSO / DPO / Liquidity / Margin KPI cards on Accounts Dashboard
- Patient & Vendor statement PDFs (3-language)
- Bank rec completeness gating month close

### Files Touched (estimate)
| Phase | Migrations | Code files |
|-------|-----------|------------|
| 1 | 1 | 0 |
| 2 | 0 | 4 (useCashFlow, VatReturnPage, useFinancialReports, AccountsDashboard) |
| 3 | 1 | 3 (YearEndClosingPage, FixedAssetsPage, RecurringEntriesPage) |
| 4 | 0 | 6 (new variance page, dashboard KPIs, statement components, i18n keys) |

All UI strings will be added to `en.ts`, `ar.ts`, `ur.ts` per project rule.

**Recommendation**: Approve **Phase 1 first** — these are audit-blocking. Phases 2–4 can follow.

