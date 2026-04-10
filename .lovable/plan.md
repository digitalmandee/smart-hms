

# Finance & Accounting Gap Verification Report

## What's Working (Confirmed)

1. **Revenue Drill-Down Report** — Fully implemented at `/app/accounts/reports/revenue-drilldown`. Hook traces GL journal lines → invoices → invoice_items with doctor/patient/service breakdown. Linked from FinancialReportsPage.

2. **GL Source Document Links** — `GeneralLedgerPage.tsx` has `getSourceDocumentPath()` covering invoice, payment, payroll, expense, vendor_payment, grn, patient_deposit. Badge is clickable and navigates correctly.

3. **Journal Entry Source Links** — `JournalEntryDetailPage.tsx` has inline `pathMap` with "View Source →" button for all reference types.

4. **Payroll Calculation Engine** — `usePayrollCalculation.ts` fetches real salary components, tax slabs, and attendance. `ProcessPayrollPage.tsx` uses `calculateEmployeePayroll()` with real attendance, components, commissions, loan deductions, and per-employee adjustments.

5. **Routes** — Both `/app/accounts/reports/revenue-drilldown` and `/app/hr/payroll/salary-revisions` are registered in App.tsx.

---

## Remaining Gaps Found

### Gap A: Salary Revision — `reason` and `notes` not saved
The `SalaryRevisionsPage.tsx` dialog collects `reason` and `notes` fields but the `employee_salaries` table has no `reason` or `notes` columns. The `handleSubmit` function never includes them in the insert. Data is silently lost.

**Fix**: Add `revision_reason` and `revision_notes` columns to `employee_salaries` table via migration, then include them in the `createSalary.mutateAsync()` call.

### Gap B: Payroll — `percentage_of = 'gross'` not handled
In `calculateEmployeePayroll()`, line 169: `const base = comp.percentage_of === "basic" ? effectiveBasic : 0;` — if a component uses `percentage_of = "gross"`, the base is 0, so components like EOBI (percentage of gross) calculate to zero.

**Fix**: Add a two-pass calculation: first compute earnings from basic-based components, then compute gross, then apply gross-based components.

### Gap C: Salary Revision — change % calculation broken
`SalaryRevisionsPage.tsx` tries to find the previous salary by looking for `!s.is_current` with earlier `effective_from`, but the `useEmployeeSalaries({})` query may not return all historical records or may not be sorted correctly, resulting in "Initial" being shown for revisions that do have a predecessor.

**Fix**: Sort `allSalaries` by `employee_id` + `effective_from` descending and find the immediate predecessor per employee.

### Gap D: Revenue Drill-Down — date filters on nested relation
Lines 36-39 of `useRevenueDrillDown.ts` apply `.gte("journal_entry.entry_date", ...)` on a nested relation. PostgREST doesn't filter parent rows based on nested relation column filters — it only filters the nested object itself (returns null). The code compensates by filtering out null `journal_entry` rows (line 46), but this means ALL journal lines are fetched first, then filtered client-side. For large datasets this is inefficient and may hit the 1000-row limit.

**Fix**: Use a two-step query: first fetch journal_entry IDs matching the date range, then fetch journal_entry_lines for those IDs.

### Gap E: Revenue Drill-Down — missing doctor/department filter
The hook accepts `doctorId` and `departmentId` in its `RevenueDrillDownFilters` interface but never uses them. The UI doesn't expose these filters either.

**Fix**: Add doctor and department filter dropdowns to the page and apply them in the query (filter invoices by doctor_id, or filter client-side after fetching).

### Gap F: No CSV/PDF export on Revenue Drill-Down
The plan specified "Export to CSV/PDF" but it's not implemented.

**Fix**: Add export buttons that generate CSV from the drill-down data.

---

## Implementation Plan

### Migration: Add revision tracking columns
```sql
ALTER TABLE public.employee_salaries
  ADD COLUMN revision_reason text,
  ADD COLUMN revision_notes text;
```

### File Changes

| File | Change |
|------|--------|
| `SalaryRevisionsPage.tsx` | Pass `revision_reason` and `revision_notes` to `createSalary.mutateAsync()` |
| `usePayrollCalculation.ts` | Fix gross-based component calculation (two-pass); handle `percentage_of = 'gross'` |
| `useRevenueDrillDown.ts` | Fix date filtering (two-step query to avoid 1000-row limit); implement doctorId/departmentId filters |
| `RevenueDrillDownPage.tsx` | Add doctor/department filter dropdowns; add CSV export button |
| `SalaryRevisionsPage.tsx` | Fix change% calculation by sorting by employee + date |
| `en.ts`, `ar.ts`, `ur.ts` | Add missing translation keys for new filter labels and export |

**Total: 1 migration + 6 file edits**

