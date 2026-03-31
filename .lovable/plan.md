

# Billing & Accounts Module: CFO Demo Readiness Audit

## Problems Found

### 1. Broken Sidebar Paths (org_admin)
The org_admin sidebar has wrong Accounts paths that lead to 404:
- `/app/accounts/chart` → should be `/app/accounts/chart-of-accounts`
- `/app/accounts/journal` → should be `/app/accounts/journal-entries`
- `/app/accounts/payable` → should be `/app/accounts/payables`

### 2. Finance Manager & Accountant Sidebars Missing Critical Links
Both `finance_manager` and `accountant` sidebars are missing **15+ pages** that exist and work:
- **Billing section entirely missing**: Daily Closing, Billing Sessions, Closing History, Invoices, Payments
- **Reports missing**: Detailed P&L, Consolidated P&L, Cost Center P&L, Revenue by Source, VAT Return, Payroll Cost Allocation, AR Reconciliation, Day-End Summary, Department Revenue
- **Banking missing**: Bank Reconciliation, Cash to Bank Deposits
- **Modules missing**: Credit/Debit Notes, Fixed Assets, Patient Deposits, Fiscal Period Management, Financial Audit Log, Cost Centers

### 3. org_admin Missing Key Accounting/Billing Links
- No Billing Sessions, Daily Closing, Closing History
- No Bank Reconciliation, Vendor Payments, Expense Management
- Reports section only has 4 items; missing Department Revenue, Shift-Wise Collections, Executive Dashboard

### 4. No Department Revenue or Day-End links for finance roles
These critical CFO-demo reports (`/app/reports/department-revenue`, `/app/reports/day-end-summary`) are not accessible from finance sidebars.

---

## Plan

### File 1: `src/config/role-sidebars.ts`

**A. Fix org_admin Accounts paths:**
```
/app/accounts/chart → /app/accounts/chart-of-accounts
/app/accounts/journal → /app/accounts/journal-entries
/app/accounts/payable → /app/accounts/payables
```

**B. Add missing items to org_admin Billing section:**
- Billing Sessions, Daily Closing, Closing History, Day-End Summary

**C. Add missing items to org_admin Accounts section:**
- Vendor Payments, Expense Management, Bank Reconciliation

**D. Add missing items to org_admin Reports section:**
- Department Revenue, Shift-Wise Collections, Executive Dashboard

**E. Expand finance_manager sidebar — add:**
- Billing group: Billing Sessions, Invoices, Payments, Daily Closing, Closing History
- Reports group: add Detailed P&L, Consolidated P&L, Cost Center P&L, Revenue by Source, VAT Return, Payroll Cost, AR Reconciliation, Department Revenue, Day-End Summary
- Banking group: add Bank Reconciliation, Cash to Bank Deposits
- Add new "Finance Modules" group: Credit/Debit Notes, Fixed Assets, Patient Deposits, Cost Centers, Fiscal Period Management, Financial Audit Log

**F. Expand accountant sidebar — mirror finance_manager** (same additions)

### File 2: Translations (`en.ts`, `ar.ts`, `ur.ts`)
Add sidebar label keys for new items: `dailyClosing`, `closingHistory`, `billingSessions`, `bankReconciliation`, `cashToBank`, `creditNotes`, `fixedAssets`, `patientDeposits`, `costCenters`, `periodManagement`, `auditLog`, `departmentRevenue`, `dayEndSummary`, `detailedPnl`, `consolidatedPnl`, `costCenterPnl`, `revenueBySource`, `vatReturn`, `payrollCost`, `arReconciliation`, `shiftWiseCollection`, `executiveDashboard`

---

## Impact
- CFO logging in as `org_admin` or `finance_manager` will see **all 40+ accounting pages** properly linked in sidebar
- No broken navigation during demo
- Every report (P&L, Balance Sheet, Cash Flow, Department Revenue, Daily Closing, Trial Balance, etc.) accessible in 1 click
- No code logic changes — purely sidebar navigation fixes

## Files Changed
- `src/config/role-sidebars.ts` — fix paths + add ~30 missing sidebar links across 3 roles
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new nav keys

