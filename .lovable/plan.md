

## Finance Module Comprehensive Audit & Enhancement Plan

### Current State Summary — What's Working

| Area | Status | Details |
|------|--------|---------|
| **Chart of Accounts** | Complete | 4-level hierarchy, account types, header/posting enforcement |
| **Journal Entries** | Complete | Manual + auto-generated, draft→posted→reversed lifecycle |
| **Auto Journal Triggers** | Complete | Payment→GL, Vendor Payment→GL, Payroll→GL, Expense→GL, Shipping→GL, Stock Write-off→GL, GRN→GL |
| **Billing & Invoicing** | Complete | Invoice CRUD, payment collection, session-based billing |
| **Daily Closing** | Complete | 4-step wizard (sessions→expenses→cash count→summary) |
| **Financial Reports** | Complete | Trial Balance, P&L, Balance Sheet, Cash Flow, Revenue by Source |
| **AR & AP** | Complete | Receivables with aging buckets, Payables with vendor tracking |
| **Bank Accounts** | Complete | Bank account management page exists |
| **Budgets & Fiscal Years** | Complete | Budget planning, fiscal year management |
| **Vendor Payments** | Complete | Payment form, approval, auto-journal posting |
| **Expense Management** | Complete | Expense recording with auto-journal |
| **Department Revenue** | Complete | Department-wise revenue report with drill-down |
| **ZATCA e-Invoicing** | Complete | UBL 2.1, QR codes, Phase 1 & 2 |
| **NPHIES Insurance** | Complete | Full RCM workflow |
| **Doctor Earnings** | Complete | Auto-calculated via trigger on payment |

### Journal Posting Strategy — Current Design

**Each payment immediately auto-posts to journal** via `post_payment_to_journal` trigger. This is the correct approach for a hospital because:
- Real-time GL accuracy (P&L and Balance Sheet always current)
- Each transaction is individually traceable in the audit trail
- Daily closing is a reconciliation/verification step, not a posting step

The daily closing does NOT batch-post journals — it reconciles physical cash against system totals. This is industry best practice.

### Gaps Identified — Missing for Best-in-Class HMIS Finance

| # | Gap | Priority | Why It Matters |
|---|-----|----------|----------------|
| 1 | **Credit Notes / Debit Notes** | High | No way to issue formal credit/debit notes for refunds, returns, or adjustments. Referenced in docs but not implemented. ZATCA requires CN/DN for compliance. |
| 2 | **Cost Center Tracking** | High | Mentioned in FAQ but no actual cost center table or assignment. Hospitals need department-level profitability analysis (OPD P&L vs IPD P&L vs Lab P&L). |
| 3 | **Fixed Asset Register & Depreciation** | High | No asset register page. Hospital equipment (MRI, CT, ventilators) needs depreciation tracking (straight-line, reducing balance) with auto-journal posting. |
| 4 | **Advance Deposits / Patient Wallet** | High | No patient advance/deposit tracking. Hospitals collect advance for IPD admissions — needs a wallet/deposit ledger with refund workflow. |
| 5 | **Multi-Branch Consolidated Reports** | Medium | No consolidated P&L or Balance Sheet across branches. Each branch reports independently — hospital groups need combined statements with inter-branch elimination. |
| 6 | **Financial Dashboard with KPIs** | Medium | The Accounts Dashboard shows quick actions and module links but lacks real-time financial KPIs (revenue trend chart, expense ratio, collection efficiency, DSO, cash position). |
| 7 | **Bank Reconciliation Workflow** | Medium | Bank accounts page exists but no statement import → auto-matching → manual reconciliation workflow. |
| 8 | **Payroll ↔ Finance Deep Integration** | Medium | Payroll auto-posts to journal (salary expense), but missing: department-wise salary allocation, provident fund/GOSI contributions tracking, end-of-service provision posting. |
| 9 | **VAT / Tax Reports** | Medium | ZATCA compliance exists for e-invoicing but no VAT return report (input tax vs output tax summary), VAT liability tracking, or tax filing preparation. |
| 10 | **Audit Log & Period Locking** | Low | Daily closing locks the day, but no formal fiscal period locking (monthly/quarterly). No dedicated financial audit log viewer. |

### Implementation Plan

**Phase 1 — High Priority (4 items)**

**1. Credit Notes & Debit Notes**
- New page: `src/pages/app/accounts/CreditNotesPage.tsx`
- New table: `credit_notes` (id, organization_id, invoice_id, credit_note_number, amount, reason, status, journal_entry_id)
- DB trigger: auto-post CN to journal (Debit Revenue, Credit AR)
- Link from InvoiceDetailPage: "Issue Credit Note" button
- ZATCA CN/DN type support (document type 381/383)

**2. Cost Center Module**
- New table: `cost_centers` (id, organization_id, name, code, department_id, is_active)
- Add `cost_center_id` column to `journal_entry_lines`
- New page: `src/pages/app/accounts/CostCentersPage.tsx` — manage cost centers
- New report: `src/pages/app/accounts/CostCenterPnLPage.tsx` — P&L filtered by cost center
- Auto-assign cost center based on department when creating journal entries

**3. Fixed Asset Register**
- New table: `fixed_assets` (id, organization_id, name, asset_code, purchase_date, purchase_cost, useful_life_months, depreciation_method, accumulated_depreciation, net_book_value, status)
- New page: `src/pages/app/accounts/FixedAssetsPage.tsx` — register, view, dispose assets
- Depreciation schedule calculation (straight-line + reducing balance)
- Monthly depreciation journal auto-posting
- Asset disposal with gain/loss journal entry

**4. Patient Advance Deposits**
- New table: `patient_deposits` (id, organization_id, patient_id, amount, type: deposit/refund, payment_method_id, invoice_id, billing_session_id, notes)
- New hook: `usePatientDeposits.ts`
- Integration with InvoiceFormPage: "Apply Deposit" option during payment
- Auto-journal: Debit Cash, Credit Patient Deposits (liability)
- Refund workflow with approval

**Phase 2 — Medium Priority (5 items)**

**5. Financial Dashboard Enhancement**
- Enhance `AccountsDashboard.tsx` with:
  - Revenue trend chart (last 12 months)
  - Expense ratio pie chart
  - Collection efficiency gauge (DSO — Days Sales Outstanding)
  - Cash position card (bank + cash balances)
  - Payroll as % of revenue
  - AR aging summary widget (0-30, 31-60, 61-90, 90+ days)

**6. Consolidated Multi-Branch Reports**
- New page: `src/pages/app/accounts/ConsolidatedPnLPage.tsx`
- Side-by-side branch comparison with combined totals
- Inter-branch transaction elimination
- Add to FinancialReportsPage as a new report card

**7. Bank Reconciliation Workflow**
- New page: `src/pages/app/accounts/BankReconciliationPage.tsx`
- CSV/Excel bank statement import
- Auto-matching by amount + date + reference
- Manual match/unmatch for unreconciled items
- Reconciliation summary with outstanding items

**8. Payroll-Finance Deep Link**
- Add department-wise salary breakdown in payroll journal entries
- GOSI/social insurance contribution tracking (new columns in `employee_salaries`)
- End-of-service provision auto-journal (monthly accrual)
- Provident fund deduction tracking with separate liability account

**9. VAT Return Report**
- New page: `src/pages/app/accounts/VatReturnPage.tsx`
- Output VAT (from sales invoices) vs Input VAT (from purchase invoices/GRN)
- Net VAT payable/refundable calculation
- Period selection (monthly/quarterly)
- Export-ready format for ZATCA filing

### Database Migrations Needed

```sql
-- credit_notes
CREATE TABLE credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  credit_note_number TEXT,
  invoice_id UUID REFERENCES invoices(id),
  patient_id UUID REFERENCES patients(id),
  amount NUMERIC(12,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'draft',
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- cost_centers
CREATE TABLE cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add cost_center_id to journal_entry_lines
ALTER TABLE journal_entry_lines ADD COLUMN cost_center_id UUID REFERENCES cost_centers(id);

-- fixed_assets
CREATE TABLE fixed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  asset_code TEXT,
  name TEXT NOT NULL,
  category TEXT,
  purchase_date DATE NOT NULL,
  purchase_cost NUMERIC(12,2) NOT NULL,
  useful_life_months INTEGER NOT NULL,
  depreciation_method TEXT DEFAULT 'straight_line',
  salvage_value NUMERIC(12,2) DEFAULT 0,
  accumulated_depreciation NUMERIC(12,2) DEFAULT 0,
  net_book_value NUMERIC(12,2),
  status TEXT DEFAULT 'active',
  disposed_date DATE,
  disposal_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- patient_deposits
CREATE TABLE patient_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'deposit',
  payment_method_id UUID REFERENCES payment_methods(id),
  billing_session_id UUID REFERENCES billing_sessions(id),
  invoice_id UUID REFERENCES invoices(id),
  reference_number TEXT,
  notes TEXT,
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Files to Create (Phase 1)
- `supabase/migrations/xxx_finance_enhancements.sql`
- `src/hooks/useCreditNotes.ts`
- `src/hooks/useCostCenters.ts`
- `src/hooks/useFixedAssets.ts`
- `src/hooks/usePatientDeposits.ts`
- `src/pages/app/accounts/CreditNotesPage.tsx`
- `src/pages/app/accounts/CostCentersPage.tsx`
- `src/pages/app/accounts/CostCenterPnLPage.tsx`
- `src/pages/app/accounts/FixedAssetsPage.tsx`
- `src/pages/app/accounts/PatientDepositsPage.tsx`

### Files to Modify
- `src/App.tsx` — Add routes
- `src/pages/app/accounts/AccountsDashboard.tsx` — Add KPI widgets
- `src/pages/app/accounts/FinancialReportsPage.tsx` — Add new report cards
- `src/pages/app/billing/InvoiceDetailPage.tsx` — Add "Issue Credit Note" and "Apply Deposit" buttons

### Key Design Decisions

1. **Journal posting: per-transaction (current) is correct** — no change needed. Daily closing remains a reconciliation step, not a posting step.
2. **Payroll is already linked** via `post_payroll_to_journal` trigger — enhancement adds department allocation.
3. **Cost centers are additive** — existing journal entries work without them; cost center is an optional dimension for drill-down reporting.

