

# Fix: Prevent Multiple Open Sessions Per User

## Problem
The current validation for preventing duplicate open sessions is **client-side only** with a race condition. The check-then-insert pattern (lines 178-187 in `useBillingSessions.ts`) allows two rapid clicks or concurrent requests to both pass the check before either insert completes, resulting in 2 open sessions for the same user.

There is also no constraint preventing the same **counter** from having multiple open sessions across different users.

## Plan

### 1. Add database-level unique constraint (Supabase SQL)
Create a partial unique index to enforce at the database level:
```sql
CREATE UNIQUE INDEX unique_open_session_per_user 
  ON billing_sessions (opened_by) 
  WHERE status = 'open';

CREATE UNIQUE INDEX unique_open_session_per_counter 
  ON billing_sessions (branch_id, counter_type) 
  WHERE status = 'open';
```
This guarantees no duplicates regardless of race conditions.

### 2. Add `isPending` guard to the Open Session button (`OpenSessionDialog.tsx`)
Disable the submit button immediately on click to prevent double-clicks. Already partially done but needs the mutation's `isPending` to also disable the form inputs.

### 3. Improve error handling in `useOpenSession` (`useBillingSessions.ts`)
Catch the unique constraint violation error (Postgres code `23505`) and show a user-friendly message like "A session is already open for this counter" instead of a raw database error.

### 4. Add counter-level check in client validation
Extend the existing open-session check to also verify no other user has an open session on the same counter at the same branch:
```typescript
const { data: counterSession } = await supabase
  .from('billing_sessions')
  .select('id, session_number, opened_by_profile:profiles!billing_sessions_opened_by_fkey(full_name)')
  .eq('branch_id', profile.branch_id)
  .eq('counter_type', counterType)
  .eq('status', 'open')
  .maybeSingle();

if (counterSession) {
  throw new Error(`Counter already has an active session: ${counterSession.session_number}`);
}
```

## Files to modify
- `src/hooks/useBillingSessions.ts` — add counter-level validation and better error handling
- Supabase SQL — add unique partial indexes

