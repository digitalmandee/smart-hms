# Accounting Blockers Audit — Findings and Fix Plan

I audited every place that writes to the ledger (16 database posting functions plus all app-side journal writes) against the live `journal_entries` / `journal_entry_lines` schema and constraints. The invoice error you hit was one instance of a wider pattern: several posting paths still reference columns and reference types that no longer exist.

## Confirmed blockers (verified against the live database)

1. **Monthly depreciation is completely broken (both paths).**
   `journal_entries` has no `reference_number` column, and its `reference_type` CHECK constraint does not allow `'depreciation'`. Both the database function `post_monthly_depreciation_per_asset` and the older `useDepreciationPosting` hook insert `reference_number` with `reference_type = 'depreciation'`, so every attempt fails.

2. **Recurring journal auto-post is broken (both paths).**
   `journal_entries` has no `total_debit` / `total_credit` / `reference_number` columns. The database function `auto_post_due_recurring_templates` inserts all three; the app hook `useRecurringEntries` inserts `total_debit` / `total_credit`. Both fail.

3. **Cash-to-bank deposit journal fails.**
   `CashToBankDepositDialog` posts with `reference_type = 'bank_deposit'`, which the CHECK constraint rejects. Worse, the bank transaction and balance update are written *before* the journal insert, so a failure leaves the bank balance updated with no ledger entry.

## Secondary issues found (worth fixing in the same pass)

4. **Write-off posts a manual journal from app code** (`useWriteOff`), which violates the trigger-only GL rule and skips fiscal-year lock/idempotency guarding. It also uses `.single()` on account lookups, so a missing BAD-DEBT/AR account throws a cryptic error instead of the intended message.
5. **`.single()` in finance write paths** — `useWriteOff` (3), `CashToBankDepositDialog` (3), `JournalEntryFormPage` (1). Each is a crash risk on 0 rows.
6. Posting functions set `is_posted = true` but leave `posted_at` / `posted_by` null (invoice, payment, expense, deposit), so "who posted this and when" is blank in the ledger UI.

## Fix plan

**Step 1 — one migration to align schema and constraints**
- Extend the `journal_entries_reference_type_check` list with `'depreciation'` and `'bank_deposit'`.
- Add a `reference_number text` column to `journal_entries` (used as the idempotency key for period-based postings such as depreciation), with an index on `(organization_id, reference_type, reference_number)`.
- Recreate `auto_post_due_recurring_templates` without the non-existent `total_debit` / `total_credit` columns (totals are derived from lines).
- Backfill `posted_at` / `posted_by` in the invoice, payment, expense and deposit posting functions.

**Step 2 — app-side cleanups**
- `useRecurringEntries`: drop `total_debit` / `total_credit` from the insert payload.
- `useDepreciationPosting` (v1): keep it aligned with the new column, or retire it in favour of the v2 per-asset RPC.
- `CashToBankDepositDialog`: post the journal first, then the bank transaction and balance, so no balance moves without a ledger entry; replace `.single()` with `.maybeSingle()`.
- `useWriteOff`: replace `.single()` with `.maybeSingle()` so the "account not found" messages surface correctly.
- `JournalEntryFormPage`: replace `.single()` with `.select()` + `data?.[0]`.

**Step 3 — verification**
- Re-run the GL coverage / trial balance health report for the current month.
- Exercise depreciation posting, a recurring template post, a cash-to-bank deposit and an invoice creation, and confirm each produces a balanced journal entry.

## Optional follow-up (not included above)
Moving the write-off posting from app code into a database trigger, to match the rest of the ledger. This is a behaviour change so I left it out unless you want it.
