
Fix the Department P&L page by correcting the broken journal query, restoring summary totals, and hardening the department mapping.

What I confirmed
- The page is not empty because of the cards UI.
- The main data request is failing in the browser with:
  `column journal_entries_1.journal_number does not exist`
- In this project the journal table uses `entry_number`, not `journal_number`.
- Because `useDepartmentPnL` throws on that failed query, the whole report returns no data, so the top cards, table, charts, and transactions all stay at zero/empty.
- There is also a React warning from `ReportExportButton`, but that is separate from the zero-data issue.

Files to update

1. `src/hooks/useDepartmentPnL.ts`
- Change the journal line select from `journal_number` to `entry_number`
- Rename the returned transaction field usage accordingly, or map `entry_number` into the existing `journal_number` UI field
- Keep the lowercase category checks already added
- Make the department mapping match actual account codes used in this project:
  - Lab revenue is `4200` in seeded accounts, while newer trigger logic uses `4030`
  - Support both `4200` and `4030` for Laboratory
  - Keep existing mappings for OPD, IPD, Dialysis, Imaging, Emergency, Pharmacy
- Review transaction description fallback after the field rename so exports and table rows still show proper references

2. `src/pages/app/accounts/DepartmentPnLPage.tsx`
- No major layout rewrite needed; summary cards already exist
- If needed, adjust the transaction table/export columns to keep showing “Journal #” while sourcing from `entry_number`
- Preserve all 3-language labels already added

3. `src/components/reports/ReportExportButton.tsx`
- Fix the ref warning by ensuring the trigger child supports refs cleanly
- Most likely solution: verify the button component is ref-forwarding correctly or wrap the trigger with a native element compatible with Radix `asChild`
- This is not the cause of zero data, but should be cleaned up in the same pass

Implementation approach
1. Repair the failing Supabase query in `useDepartmentPnL`
2. Normalize journal reference handling to use `entry_number`
3. Expand department revenue mapping so older and newer account codes both roll into the correct department
4. Recheck totals logic so:
   - top cards show revenue / COGS / expenses / net income
   - department rows populate
   - transactions tab lists journal lines
   - charts render from populated departments
5. Fix the export-button ref warning

Expected result after fix
- Recent posted transactions will appear immediately
- Top summary cards will show totals again
- Department rows will no longer be all zeros
- Transactions export/table will show journal references correctly
- Older lab revenue accounts and newer lab revenue accounts will both appear under Laboratory

Technical details
```text
Current failure:
DepartmentPnLPage
  -> useDepartmentPnL()
     -> journal_entry_lines select journal_entries(... journal_number ...)
     -> Supabase 400: column does not exist
     -> hook throws
     -> page renders no data / zeros

Required schema-aligned field:
journal_entries.entry_number
```

```text
Department mapping should support at least:
REV-001     -> OPD
4010        -> IPD
4020        -> Emergency
4030/4200   -> Laboratory
4040        -> Dialysis
4050        -> Imaging/Radiology
REV-PHARM*  -> Pharmacy
EXP-COGS*   -> Pharmacy COGS
```
