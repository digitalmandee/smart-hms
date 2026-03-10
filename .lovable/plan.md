

## Finance Module Seed Data — QA Audit & Plan

### Current State

| Table | Row Count | Verdict |
|-------|-----------|---------|
| accounts | 189 | Has data — CoA fully seeded |
| journal_entries | 255 | Has data |
| invoices | 91 | Has data |
| payments | 59 | Has data |
| fiscal_years | 1 | Has data |
| employee_salaries | 11 | Has data |
| goods_received_notes | 3 | Has data |
| **credit_notes** | **0** | **Empty — new Phase 1 table** |
| **cost_centers** | **0** | **Empty — new Phase 1 table** |
| **fixed_assets** | **0** | **Empty — new Phase 1 table** |
| **patient_deposits** | **0** | **Empty — new Phase 1 table** |
| bank_accounts | 0 | Empty — existing table |
| bank_transactions | 0 | Empty — existing table |
| vendor_payments | 0 | Empty — existing table |
| expenses | 0 | Empty — existing table |
| daily_closings | 0 | Empty |
| insurance_claims | 0 | Empty |
| audit_logs | 0 | Empty |
| budget_periods | 1 | Minimal |

### Missing Accounts for New Modules

The Chart of Accounts lacks GL accounts needed by the new triggers:
- **2400 — Patient Deposits (Liability)** — needed by `post_patient_deposit_to_journal`
- **5600 — Depreciation Expense** — needed by fixed assets
- **1500 — Accumulated Depreciation (contra-asset)** — needed by fixed assets

### Seed Data Plan

One migration that inserts realistic demo data using `DO $$ ... $$` blocks with safe `ON CONFLICT` / `WHERE NOT EXISTS` guards. All data scoped to org `a0eebc99-...`.

**1. Missing GL Accounts (3 accounts)**
- `2400` Patient Deposits (liability)
- `5600` Depreciation Expense
- `1500` Accumulated Depreciation

**2. Cost Centers (5 records)**
- CC-OPD → OPD Department (linked to Medical dept)
- CC-LAB → Laboratory (linked to Laboratory dept)
- CC-PHRM → Pharmacy (linked to Pharmacy dept)
- CC-ADMIN → Administration (linked to Administration dept)
- CC-NUR → Nursing (linked to Nursing dept)

**3. Fixed Assets (5 records)**
- MRI Machine — 2,500,000 SAR, 120 months, straight-line
- CT Scanner — 1,800,000 SAR, 96 months, straight-line
- Ultrasound Machine — 350,000 SAR, 60 months, reducing balance
- Ventilator x10 — 500,000 SAR, 84 months, straight-line
- Pharmacy Dispensing System — 120,000 SAR, 60 months, straight-line

**4. Patient Deposits (5 records)**
- 3 deposits (advance payments for IPD)
- 1 applied (used against invoice)
- 1 refund

**5. Credit Notes (3 records)**
- 1 draft, 1 approved, 1 voided — linked to existing paid invoices

**6. Bank Accounts (2 records)**
- Main Operating Account — SAR 725,000
- Payroll Account — SAR 150,000

**7. Bank Transactions (8 records)**
- Mix of deposits, withdrawals, and transfers over last 30 days

**8. Vendor Payments (3 records)**
- Linked to existing GRNs where possible

**9. Expenses (5 records)**
- Utilities, office supplies, maintenance, travel, misc

**10. Budget Periods (3 more records)**
- Q1, Q2, Q3 2026 under existing fiscal year

### Files to Create/Modify
- **New migration**: `supabase/migrations/xxx_finance_seed_data.sql` — all seed data in one idempotent migration

### Scope
- All inserts use `ON CONFLICT DO NOTHING` or `WHERE NOT EXISTS` for idempotency
- All amounts in SAR with realistic hospital values
- Dates spread across last 60 days for realistic dashboard charts
- Patient deposits linked to real patient IDs from existing data
- Credit notes linked to real paid invoice IDs

