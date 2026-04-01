

# Fix: Journal Entry Creation Error

## Problem
The `journal_entries` table has a `BEFORE INSERT` trigger (`generate_journal_entry_number`) that auto-generates `entry_number`. However, the column has a `NOT NULL` constraint without a default value, so:

1. The Supabase TypeScript types mark `entry_number` as **required** in the Insert type
2. The form code (`JournalEntryFormPage.tsx` line 106-114) does **not** include `entry_number` in the insert payload
3. This causes the insert to fail — either at the TypeScript level or at the DB level if the trigger doesn't fire before the NOT NULL check

## Fix

### File: `src/pages/app/accounts/JournalEntryFormPage.tsx`
- Add a placeholder `entry_number` to the insert payload that the trigger will overwrite:
  ```ts
  entry_number: 'TEMP', // overwritten by generate_journal_entry_number trigger
  ```
- This satisfies both the TypeScript type and the NOT NULL constraint, while the trigger replaces it with the actual auto-generated number

### Single-line change at line ~106:
Add `entry_number: 'TEMP'` to the `entryPayload` object.

## Files Changed
- `src/pages/app/accounts/JournalEntryFormPage.tsx` — add `entry_number` placeholder to insert payload

