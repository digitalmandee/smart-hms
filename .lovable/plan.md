

# Fix Missing Columns on `dialysis_sessions` Table

## Problem
The error `Could not find the 'blood_flow_rate' column of 'dialysis_sessions' in the schema cache` occurs because the code writes `blood_flow_rate`, `dialysate_flow_rate`, `heparin_dose`, and `dialyzer_type` to `dialysis_sessions`, but these columns don't exist in the database.

## Solution
Create a migration to add the 4 missing columns:

```sql
ALTER TABLE public.dialysis_sessions
  ADD COLUMN IF NOT EXISTS blood_flow_rate INTEGER,
  ADD COLUMN IF NOT EXISTS dialysate_flow_rate INTEGER,
  ADD COLUMN IF NOT EXISTS dialyzer_type TEXT,
  ADD COLUMN IF NOT EXISTS heparin_dose TEXT;
```

## Impact
- No code changes needed — the code already references these columns correctly
- After migration, creating new sessions with BFR/DFR/dialyzer/heparin will work
- Session detail page will display these values properly

## Files Changed
- 1 new migration file only

