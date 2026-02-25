

# Cash Flow Statement -- Already Implemented

## Status: No Changes Needed

The Cash Flow Statement investing and financing sections were **already updated with real journal entry data** in the previous implementation round. Here is what is currently in place:

### Current Implementation (lines 484-513 of `useFinancialReports.ts`)

**Investing Activities** (lines 484-496):
- Filters journal entry lines where `account_type.category = 'asset'` AND type name includes "fixed" or "equipment"
- Calculates net debit minus credit as equipment purchases
- Renders as "Equipment & Fixed Asset Purchases" with negated amount
- Filters out zero-amount items

**Financing Activities** (lines 498-513):
- Filters journal entry lines where `account_type.category` is `'liability'` or `'equity'`
- Separates credit amounts as "Loan / Equity Receipts" (positive cash inflow)
- Separates debit amounts as "Loan / Liability Repayments" (negative cash outflow)
- Filters out zero-amount items

**Operating Activities** (lines 477-482):
- Collections from patients (from `payments` table)
- Payments to suppliers (from `vendor_payments` table)
- Salaries and wages (from `payroll_runs` table)
- Shipping costs (from journal entries with account `EXP-SHIP-001`)

**Security**: RLS policies on all queried tables (`journal_entry_lines`, `journal_entries`, `payments`, `vendor_payments`, `payroll_runs`) enforce organization-level isolation, so the missing `organization_id` filter in the query is not a bug.

### Conclusion

This task was completed in the previous batch of changes. The hardcoded zeros have been replaced with real data. If the sections appear empty in the UI, it means there are no fixed asset purchases or liability/equity journal entries in the selected date range -- which is the correct behavior.

No code changes required.

