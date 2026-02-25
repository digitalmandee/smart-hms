

# 4-Level Chart of Accounts Hierarchy

## Current State
- 25 accounts per organization, ALL flat (`parent_account_id = NULL`)
- Existing code already supports parent-child tree building (`useAccountsTree`, `AccountTree`, `AccountFormPage` with parent picker)
- No `account_level` or `is_header` column exists -- need to add these to distinguish header/group accounts from posting accounts
- 4 organizations exist; 3 have identical 25-account structures, 1 has 2 accounts

## Database Changes

### Migration: Add `account_level` and `is_header` columns to `accounts`

```sql
ALTER TABLE accounts ADD COLUMN account_level INTEGER NOT NULL DEFAULT 4;
ALTER TABLE accounts ADD COLUMN is_header BOOLEAN NOT NULL DEFAULT false;
```

- `account_level`: 1 = Category header, 2 = Sub-group, 3 = Control account, 4 = Detail/posting account
- `is_header`: Header accounts cannot receive journal entries directly; only Level 4 accounts are posting accounts

### Data Migration: Create hierarchy for each organization

For each of the 3 main organizations, create new Level 1-3 header accounts and re-parent the existing 25 accounts as Level 4 children. The hierarchy:

```text
ASSETS (Level 1)
├── 1100 Current Assets (Level 2)
│   ├── 1110 Cash & Bank (Level 3)
│   │   ├── 1000 Cash in Hand (Level 4) ← existing
│   │   ├── CASH-001 Petty Cash (Level 4) ← existing
│   │   ├── 1010 Bank Account - Current (Level 4) ← existing
│   │   └── 1020 Bank Account - Savings (Level 4) ← existing
│   ├── 1120 Receivables (Level 3)
│   │   └── AR-001 Accounts Receivable (Level 4) ← existing
│   ├── 1130 Inventory (Level 3)
│   │   └── INV-001 Inventory - Medicines (Level 4) ← existing
│   └── 1140 Prepaid & Advances (Level 3)
│       └── 1300 Prepaid Expenses (Level 4) ← existing
├── 1200 Fixed Assets (Level 2)
│   └── 1210 Equipment & Machinery (Level 3)
│       └── 1400 Fixed Assets - Equipment (Level 4) ← existing

LIABILITIES (Level 1)
├── 2100 Current Liabilities (Level 2)
│   ├── 2110 Payables (Level 3)
│   │   ├── AP-001 Accounts Payable (Level 4) ← existing
│   │   └── 2300 Salaries Payable (Level 4) ← existing
│   └── 2120 Accruals & Taxes (Level 3)
│       ├── 2100-det Accrued Expenses (Level 4) ← existing (renumber)
│       └── 2200 Tax Payable (Level 4) ← existing

EQUITY (Level 1)
├── 3100 Owner's Equity (Level 2)
│   ├── 3110 Capital (Level 3)
│   │   └── 3000 Owner's Capital (Level 4) ← existing
│   └── 3120 Retained Earnings (Level 3)
│       └── 3100-det Retained Earnings (Level 4) ← existing (renumber)

REVENUE (Level 1)
├── 4100 Service Revenue (Level 2)
│   ├── 4110 OPD Revenue (Level 3)
│   │   └── REV-001 Service Revenue - OPD (Level 4) ← existing
│   ├── 4120 IPD Revenue (Level 3)
│   │   └── 4010 Service Revenue - IPD (Level 4) ← existing
│   ├── 4130 Emergency Revenue (Level 3)
│   │   └── 4020 Service Revenue - Emergency (Level 4) ← existing
│   └── 4140 Ancillary Revenue (Level 3)
│       ├── 4200 Laboratory Revenue (Level 4) ← existing
│       └── REV-PHARM-001 Pharmacy Sales Revenue (Level 4) ← existing

EXPENSES (Level 1)
├── 5100 Personnel Expenses (Level 2)
│   └── 5110 Salaries & Benefits (Level 3)
│       └── 5000 Salaries & Wages (Level 4) ← existing
├── 5200 Clinical Expenses (Level 2)
│   ├── 5210 Medicines & Drugs (Level 3)
│   │   └── 5100-det Cost of Medicines Sold (Level 4) ← existing (renumber)
│   └── 5220 Medical Supplies (Level 3)
│       └── 5400 Medical Supplies (Level 4) ← existing
├── 5300 Operating Expenses (Level 2)
│   ├── 5310 Utilities (Level 3)
│   │   └── 5200-det Utilities (Level 4) ← existing (renumber)
│   ├── 5320 Rent & Maintenance (Level 3)
│   │   └── 5300-det Rent & Maintenance (Level 4) ← existing (renumber)
│   └── 5330 Administration (Level 3)
│       └── 5500 Administrative Expenses (Level 4) ← existing
```

Note: Some existing accounts have conflicting numbers with proposed Level 2/3 headers (e.g., existing `2100 Accrued Expenses` conflicts with proposed `2100 Current Liabilities`). These will be renumbered to avoid conflicts (e.g., `2100` -> `2111`, `5100` -> `5111`, etc.).

The data migration will:
1. Create ~25 new header accounts (Level 1-3) per organization using a PL/pgSQL function
2. Update existing accounts' `parent_account_id` to point to the correct Level 3 parent
3. Renumber conflicting accounts
4. Set `account_level` and `is_header` appropriately
5. Run for all 3 main organizations

### Validation trigger
Add a trigger that prevents journal entry lines from being posted to header accounts (`is_header = true`).

## Frontend Changes

### 1. `src/hooks/useAccounts.ts`
- Update `Account` interface to include `account_level` and `is_header` fields

### 2. `src/components/accounts/AccountTree.tsx`
- Style header accounts (Level 1-3) differently: bold text, no balance display for headers, different icon (FolderTree for L1, Folder for L2-3)
- Show Level 1 accounts with category-colored background bars
- Show aggregate balance for header accounts (sum of children)

### 3. `src/pages/app/accounts/ChartOfAccountsPage.tsx`
- Add "Level" filter dropdown (All / Level 1 / Level 2 / Level 3 / Level 4)
- Update search to also filter children when a parent matches

### 4. `src/pages/app/accounts/AccountFormPage.tsx`
- Add `account_level` selector (1-4)
- Add `is_header` toggle (auto-set based on level: levels 1-3 default to header, level 4 defaults to posting)
- Filter parent account picker to only show accounts of a higher level (e.g., Level 3 can only parent under Level 2)

### 5. Translation keys (`en.ts`, `ur.ts`, `ar.ts`)
- `"accounts.level"`: "Level" / "سطح" / "المستوى"
- `"accounts.headerAccount"`: "Header Account" / "ہیڈر اکاؤنٹ" / "حساب رئيسي"
- `"accounts.postingAccount"`: "Posting Account" / "پوسٹنگ اکاؤنٹ" / "حساب ترحيل"
- `"accounts.level1"` through `"accounts.level4"` with appropriate labels

## Technical Details

- The `update_account_balance()` trigger only fires on `journal_entry_lines` and only affects the specific `account_id` in each line. Header accounts won't have journal lines, so their `current_balance` stays 0. The `AccountTree` component will compute aggregate balances client-side by summing children.
- The `get_or_create_default_account()` function creates system accounts at Level 4 by default. Updated to set `account_level = 4, is_header = false`.
- Existing journal entries remain untouched -- they already point to the correct Level 4 accounts.
- The hierarchy is enforced by `parent_account_id` foreign key (self-referential) which already exists on the `accounts` table.

