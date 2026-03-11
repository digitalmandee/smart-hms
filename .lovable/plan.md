

## Incomplete Accountant Sidebar Menu

**Problem**: The `accountant` role sidebar in `src/config/role-sidebars.ts` (lines 1191-1223) is missing many menu items that should be available. Currently it only has:
- Dashboard
- Accounting (Journal Entries, General Ledger) — missing Chart of Accounts
- Banking (Bank Accounts only) — missing Budgets
- Reports (single link, no sub-items)
- My Work

The `finance_manager` role (lines 1118-1189) has a much more complete menu with Receivables, Payables, detailed Reports (Trial Balance, P&L, Balance Sheet, Cash Flow), and Setup sections.

**Fix**: Expand the `accountant` sidebar config to include all relevant accounting items — matching the finance_manager menu since accountants need access to the same financial modules.

**Changes** — single file: `src/config/role-sidebars.ts`

Update the `accountant` config (lines 1191-1223) to include:
- **Accounting**: Add Chart of Accounts alongside existing Journal Entries and General Ledger
- **Receivables**: Outstanding receivables
- **Payables**: Vendor Bills, Vendor Payments
- **Banking**: Add Budgets alongside Bank Accounts
- **Reports**: Expand to sub-menu with Financial Reports, Trial Balance, P&L, Balance Sheet, Cash Flow
- **Setup**: Account Types
- **My Work**: Keep as-is

