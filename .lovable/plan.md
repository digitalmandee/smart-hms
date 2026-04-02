

# Department-Wise P&L Report + Pharmacy Profit Visibility

## What Exists Today

| Report | What It Shows | Gap |
|--------|--------------|-----|
| Detailed P&L | Revenue, COGS, Expenses, Net Income (GL-based) | No department breakdown |
| Department Revenue | Revenue by OPD/IPD/Lab/Pharmacy | Revenue only — no expenses or profit |
| Cost Center P&L | P&L by cost center | Requires `cost_center_id` on journal lines (mostly empty) |
| Pharmacy Medicine List | Cost price, selling price, margin per medicine | Not connected to P&L |

## What the CFO Needs

A single **Department-Wise P&L** report showing per department:
- Revenue (from invoice prefix routing: OPD, IPD, Lab, Pharmacy, etc.)
- Expenses (allocated by journal entry reference or account mapping)
- COGS (Pharmacy specifically)
- Gross Profit and Net Profit per department
- Pharmacy cost/selling/margin breakdown

## Plan

### 1. New page: Department P&L Report (`/app/accounts/reports/department-pnl`)

A new comprehensive report page with:
- **Date range picker** with presets (This Month, Last Month, YTD, etc.)
- **Branch filter**
- **Summary cards**: Total Revenue, Total Expenses, Net Income
- **Department table** showing per-department: Revenue, COGS, Expenses, Gross Profit, Net Profit, Margin %
- **Department detail drill-down**: Click a department row to see individual transactions
- **Charts tab**: Stacked bar chart (Revenue vs Expenses by department), Pie chart (profit contribution)
- **Pharmacy section**: Shows top medicines by profit, cost vs selling price, margin %
- **Export**: PDF and Excel

### 2. New hook: `useDepartmentPnL`

Queries journal entries grouped by department. Department mapping strategy:

**Revenue** — Already routed by invoice prefix in the trigger:
- `REV-001` → OPD
- `4010` → IPD  
- `4030` → Laboratory
- `4040` → Dialysis
- `REV-PHARM` / Pharmacy revenue accounts → Pharmacy

**COGS** — `EXP-COGS-001` → Pharmacy (only pharmacy has COGS currently)

**Expenses** — Map by reference_type + journal description:
- Salary/Payroll → allocated proportionally or shown as "General"
- Administrative expenses → "General/Admin"
- Stock write-offs → "Pharmacy"
- Shipping → "Pharmacy"

The hook will:
1. Fetch all revenue accounts with their journal lines in the date range
2. Map each revenue account to a department by account_number
3. Fetch all expense accounts with journal lines
4. Map expenses to departments where possible (COGS→Pharmacy, write-offs→Pharmacy)
5. Unallocated expenses go to "General/Admin" bucket
6. Calculate per-department: Revenue, COGS, Gross Profit, Operating Expenses, Net Profit

### 3. Pharmacy Profit Section

Query `pharmacy_pos_items` joined with `medicines` to show:
- Top 10 medicines by profit (selling_price - cost_price) × quantity sold
- Overall pharmacy margin percentage
- Cost vs Revenue comparison

### 4. Navigation + Translations

- Add "Department P&L" to the sidebar under Financial Reports
- Add translations in en.ts, ur.ts, ar.ts for all new labels

## Technical Details

### Department mapping (account_number → department)

```text
ACCOUNT              DEPARTMENT
REV-001              OPD
4010                 IPD
4020                 Emergency
4030                 Laboratory
4040                 Dialysis
4050                 Imaging/Radiology
REV-PHARM*           Pharmacy
EXP-COGS*            Pharmacy
EXP-WO*              Pharmacy (write-offs)
EXP-SHIP*            Pharmacy (shipping)
EXP-SAL*             General (payroll)
5500, EXP-PETTY*     General (admin)
All others           General
```

### Files to create/modify

- **New**: `src/pages/app/accounts/DepartmentPnLPage.tsx` — main report page
- **New**: `src/hooks/useDepartmentPnL.ts` — data hook with department mapping
- **Edit**: `src/App.tsx` — add route
- **Edit**: `src/config/role-sidebars.ts` — add sidebar link
- **Edit**: `src/pages/app/accounts/FinancialReportsPage.tsx` — add card
- **Edit**: `src/lib/i18n/translations/en.ts` — English labels
- **Edit**: `src/lib/i18n/translations/ur.ts` — Urdu labels
- **Edit**: `src/lib/i18n/translations/ar.ts` — Arabic labels

No database migration needed — all data already exists in journal_entries/journal_entry_lines with the right account mappings.

