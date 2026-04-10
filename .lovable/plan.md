

# Finance & Accounting Module — Gap Analysis & Fix Plan

## Identified Gaps

### Gap 1: Revenue Traceability (GL → Invoice → Doctor/Patient/Department)
**Problem**: When the GL shows "OPD Revenue: 100,000", there's no way to drill down to see which patient invoices, which doctors, and which service categories contributed. The `post_invoice_to_journal` trigger posts a single lump-sum entry per invoice with description "Invoice: INV-XXXXXX" but no line-item detail. The Detailed P&L drill-down shows journal lines but not the underlying invoice items.

**Fix**: Build a **Revenue Drill-Down Report** page that traces GL revenue entries back to their source invoices and further to invoice items (doctor, service type, patient). Also enhance the General Ledger to link journal entries to their source documents.

### Gap 2: Payroll Processing Missing Salary Components
**Problem**: The `ProcessPayrollPage` hardcodes `total_working_days: 26, present_days: 24, absent_days: 0, leave_days: 2` and only adds "Basic Salary" + commissions to earnings. It ignores the salary structure components (HRA, Transport, Medical allowances) and deductions (Income Tax, PF, EOBI) defined in `salary_components`. No per-employee adjustments (one-time bonus, appraisal increment, special allowance) can be added during payroll processing.

**Fix**: Refactor payroll processing to pull actual attendance data and apply all salary structure components. Add per-employee adjustment capability.

### Gap 3: No Salary Revision / Appraisal Module
**Problem**: While `PromotionsPage` records promotions with old/new salary, there's no dedicated salary revision or appraisal workflow. No way to give a specific employee a raise, bonus, or adjustment outside of the promotion flow.

**Fix**: Add a **Salary Revision** page where HR can adjust individual employee salaries with reason tracking (appraisal, increment, market adjustment).

### Gap 4: GL Entry → Source Document Navigation
**Problem**: General Ledger shows `reference_type` badge (invoice, payment, payroll) but clicking doesn't navigate to the source document. No clickable links from journal entries to invoices, payments, or payroll runs.

**Fix**: Add clickable links in GL and Journal Entry views to navigate to source documents.

### Gap 5: Payslip Missing Actual Attendance & Component Breakdown
**Problem**: Payslips show hardcoded working days and only basic salary + commission. Missing: actual attendance integration, tax calculations from tax slabs, all earnings/deduction components from salary structure.

**Fix**: Integrate attendance data into payroll and apply salary structure components.

---

## Implementation Plan

### 1. Revenue Drill-Down Report (New Page)
**New file**: `src/pages/app/accounts/RevenueDrillDownPage.tsx`
- Select a revenue account (OPD Revenue, Lab Revenue, etc.)
- Shows all journal entries for that account in the period
- Each journal entry links to its source invoice via `reference_id`
- Expands to show invoice items with: service name, doctor name, patient name, quantity, amount
- Filterable by doctor, department, service category
- Summary cards: top earning doctors, top services, patient count
- Export to CSV/PDF

**New hook**: `src/hooks/useRevenueDrillDown.ts`
- Fetches journal entries for revenue accounts
- Joins through `reference_id` → `invoices` → `invoice_items` → `service_types`, `doctors`, `patients`

**Route**: `/app/accounts/reports/revenue-drilldown`

### 2. GL & Journal Source Document Links
**Edit**: `src/pages/app/accounts/GeneralLedgerPage.tsx`
- Make `reference_type` badge clickable
- Navigate to: invoice → `/app/billing/invoices/{id}`, payment → `/app/billing/invoices/{id}`, payroll → `/app/hr/payroll/{id}`, expense → `/app/accounts/expenses`, vendor_payment → `/app/accounts/vendor-payments/{id}`

**Edit**: `src/pages/app/accounts/JournalEntryDetailPage.tsx`
- Add "View Source Document" button that navigates based on `reference_type` + `reference_id`

### 3. Payroll Processing with Actual Components
**Edit**: `src/pages/app/hr/payroll/ProcessPayrollPage.tsx`
- Fetch actual attendance data (present days, absent, late, overtime) from `attendance` table for the month
- Apply all salary structure components (earnings: HRA, Transport, etc. / deductions: Tax, PF, EOBI)
- Calculate tax using `tax_slabs` table
- Add per-employee "Adjustments" column with dialog to add one-time bonus, deduction, or special allowance
- Store adjustments in `payroll_entries.earnings` / `payroll_entries.deductions` JSONB

**New hook**: `src/hooks/usePayrollCalculation.ts`
- Centralized salary calculation logic: fetch structure components, apply formulas, calculate tax from slabs, integrate attendance

### 4. Salary Revision Page
**New file**: `src/pages/app/hr/payroll/SalaryRevisionsPage.tsx`
- List of all salary changes with history
- "New Revision" dialog: select employee, new basic salary, effective date, reason (appraisal, annual increment, market adjustment, promotion, other)
- Uses existing `useCreateEmployeeSalary` which already marks old salary as inactive
- Shows revision history per employee with % change calculation

**Route**: `/app/hr/payroll/salary-revisions`

### 5. Translations
**Edit**: `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts`
- Revenue drill-down labels, salary revision labels, payroll adjustment labels

---

## Summary

| Item | Type | Key Benefit |
|------|------|-------------|
| Revenue Drill-Down Report | New page + hook | Trace any GL revenue to doctor/patient/service |
| GL Source Document Links | 2 file edits | One-click from ledger to invoice/payment |
| Payroll with Components | Page refactor + new hook | Actual attendance, tax slabs, all allowances |
| Salary Revision Page | New page | Appraisals, increments, per-employee adjustments |
| Translations | 3 file edits | Trilingual support |

**Total: ~3 new files, ~7 file edits**

