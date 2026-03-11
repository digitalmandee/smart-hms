

## Sync Accountant Sidebar with Branch Admin

**Problem**: The accountant static sidebar is missing **Expense Management** which the branch_admin sees from the database menu. The accountant should have access to the same accounts & finance pages.

**Difference found**:
- Branch admin (database-driven) has: Dashboard, Chart of Accounts, Account Types, Journal Entries, General Ledger, Bank & Cash, Budgets & Fiscal Years, Financial Reports, **Expense Management**, Accounts Receivable, Vendor Payments, Accounts Payable
- Accountant (static config) is missing: **Expense Management** (`/app/accounts/expenses`)

**Fix** — single file: `src/config/role-sidebars.ts`

Add an **Expense Management** item to both the `accountant` and `finance_manager` sidebar configs, placed under a new "Expenses" section or within "Payables":

```
{ name: "Expense Management", path: "/app/accounts/expenses", icon: "Receipt" }
```

This will be added as a child under the **Payables** section (since expenses relate to outgoing money) for both `finance_manager` and `accountant` configs.

