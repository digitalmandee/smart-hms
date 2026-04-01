

# Fix: Journal Entry Number Not Generated (Stuck at "TEMP")

## Problem
The `generate_journal_entry_number` trigger only fires when `entry_number IS NULL OR entry_number = ''`. The previous fix set `entry_number: 'TEMP'` to satisfy the NOT NULL constraint, but this causes the trigger to **skip** — leaving every new manual journal entry with "TEMP" as its entry number.

Confirmed in database: entry `6f2ce6b6-c56a-4528-b9b7-8dec9708afd7` shows `entry_number = 'TEMP'` despite having a proper trigger.

The double-entry posting itself is correct:
- **Debit**: Cash in Hand (1000) — Rs. 200
- **Credit**: Bank Account - Savings (1020) — Rs. 200
- `is_posted: true`, balanced at Rs. 200 each

## Fix

### File: `src/pages/app/accounts/JournalEntryFormPage.tsx`
Change `entry_number: 'TEMP'` to `entry_number: ''` so the trigger's WHEN clause matches and generates the proper sequence number (e.g., `JE-20260401-0001`).

```ts
// Before
entry_number: 'TEMP',

// After  
entry_number: '',
```

### Also: Fix existing "TEMP" entries via migration
Run a one-time SQL migration to regenerate entry numbers for any journal entries stuck with "TEMP":

```sql
UPDATE journal_entries 
SET entry_number = 'JE-' || TO_CHAR(entry_date, 'YYYYMMDD') || '-' || 
  LPAD(ROW_NUMBER() OVER (PARTITION BY organization_id, entry_date ORDER BY created_at)::TEXT, 4, '0')
WHERE entry_number = 'TEMP';
```

## Files Changed
- `src/pages/app/accounts/JournalEntryFormPage.tsx` — change `'TEMP'` to `''`
- **Migration** — fix existing TEMP entries

