
# Fix: Payroll Approval "updated_at" Column Error

## Problem
The `useApprovePayrollRun` mutation in `src/hooks/usePayroll.ts` (line 300) sets `updated_at: new Date().toISOString()` on the update payload, but the `payroll_runs` table does not have an `updated_at` column. This causes the approval to fail with: "Could not find the 'updated_at' column of 'payroll_runs' in the schema cache."

## Fix
**File: `src/hooks/usePayroll.ts`** — Remove line 300 (`updated_at: new Date().toISOString()`) from the `updateData` object in `useApprovePayrollRun`.

## Verification
After the fix, re-test the approval flow: the "Approve Payroll" button should transition status from `pending_approval` → `approved`, populating `approved_by`.
