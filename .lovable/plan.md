

# Report Backtracking & Ledger Audit — Current State

## What's Working (Full Backtrack Chain)

| Report | Source | Drill-Down Path | Backtrack |
|--------|--------|-----------------|-----------|
| **P&L Statement** | GL | Account row → General Ledger (filtered by account+dates) → Reference badge → Source document (Invoice/Expense/GRN/etc.) | Full |
| **Balance Sheet** | GL | Account row → General Ledger → Reference badge → Source document | Full |
| **General Ledger** | GL | Clickable reference badges route to: Invoice, Payment, Payroll, Expense, Vendor Payment, GRN, Patient Deposit, Donation | Full |
| **Trial Balance** | GL | Account-level balances with date range | Partial (no click-to-GL) |
| **Revenue Drill-Down** | GL | Account → GL lines → Invoice → Invoice items (expandable) | Full |
| **Department P&L** | GL | Department → Transaction list with search | Full |
| **Department Revenue** | GL | Department → Invoice list (batched up to 500) | Full |
| **Revenue by Category** | GL | Pie chart slices → Department Revenue filtered | Full |
| **AR Reconciliation** | GL+Invoices | Revenue recon tab compares GL vs invoice totals | Full |
| **Receivables/Aging** | Invoices | Invoice rows with Pay/Write-off actions | Full |

## Remaining Shortcomings (4 Issues)

### Issue 1 — MEDIUM: `useTopServices` Still Sources from `invoice_items`
The "Top Services" widget in `BillingReportsPage` queries `invoice_items` directly (line 1262 of `useBilling.ts`), not the GL. This is an operational report (service volume/count), so GL sourcing isn't strictly required — but for consistency, it should at least cross-reference GL-posted invoices only.

### Issue 2 — MEDIUM: `useExecutiveSummary` Lab Revenue Sources from `invoice_items`
Line 57 of `useExecutiveSummary.ts` queries `invoice_items` with `service_types.category = 'lab'` for the dashboard "Lab Revenue" KPI. Should source from GL revenue accounts matching lab (e.g., `REV-LAB-001` / `4030`).

### Issue 3 — MEDIUM: GL Reference Badge Missing Routes for `pharmacy_pos`, `credit_note`, `surgery`
The `getSourceDocumentPath()` function (GeneralLedgerPage.tsx line 44-56) handles: invoice, payment, payroll, expense, vendor_payment, grn, patient_deposit, donation. But triggers also post journals for `pharmacy_pos`, `credit_note`, and `surgery` — these reference types have no clickable route, so the badge shows but doesn't navigate.

### Issue 4 — LOW: Trial Balance Has No Click-to-GL
Unlike P&L and Balance Sheet (which navigate to GL on row click), the Trial Balance page shows flat account balances with no clickable navigation to the General Ledger.

---

## Fix Plan

### Fix 1: Migrate `useTopServices` to filter GL-posted invoices only
- Edit `useBilling.ts` — add an inner join filter to only include items from invoices that have a matching journal entry (status posted)

### Fix 2: Migrate Executive Summary Lab Revenue to GL
- Edit `useExecutiveSummary.ts` — replace `invoice_items` query with `journal_entry_lines` filtered by lab revenue accounts

### Fix 3: Add missing GL reference routes
- Edit `GeneralLedgerPage.tsx` `getSourceDocumentPath()` — add:
  - `pharmacy_pos` → `/app/pharmacy/pos`
  - `credit_note` → `/app/accounts/credit-notes`
  - `surgery` → `/app/clinical/surgeries/${referenceId}`

### Fix 4: Add Trial Balance click-to-GL
- Edit Trial Balance rendering in `FinancialReportsPage.tsx` — make account rows clickable → navigate to `/app/accounts/general-ledger?accountId={id}&from=&to=`

## File Summary

| File | Change |
|------|--------|
| `src/hooks/useBilling.ts` | Filter `useTopServices` to GL-posted invoices |
| `src/hooks/useExecutiveSummary.ts` | Lab revenue from GL instead of `invoice_items` |
| `src/pages/app/accounts/GeneralLedgerPage.tsx` | Add pharmacy_pos, credit_note, surgery routes |
| `src/pages/app/accounts/FinancialReportsPage.tsx` | Make Trial Balance rows clickable → GL |

**Total: 0 migrations, 0 new files, 4 file edits**

