

# Fix: Previous Sessions Not Showing to Close

## Problem
Two related issues on the Billing Sessions page:

1. **Cannot find old unclosed sessions**: The `BillingSessionsPage` date filter defaults to today. If a session was opened yesterday (or earlier) and never closed, it doesn't appear in the list — the user cannot close it. Meanwhile, `useOpenSession` blocks opening a new session because it detects the existing open one, creating a deadlock.

2. **No prominent warning**: There's no alert telling the user they have unclosed sessions from previous days that need attention.

## Plan

### 1. Add unclosed sessions query (`useBillingSessions.ts`)
Add a new hook `useUnclosedSessions` that fetches all sessions with `status = 'open'` for the branch, regardless of date. This surfaces stale sessions.

### 2. Show unclosed sessions banner on `BillingSessionsPage.tsx`
At the top of the page, before the date-filtered table, show a warning card listing any open sessions from previous days with a "Close" button for each. This ensures users can always find and close orphaned sessions.

### 3. Expand date range automatically when open sessions exist
When the page loads and there are open sessions from outside the current date range, auto-expand the `dateFrom` to include those sessions in the main table as well.

## Files to modify
- `src/hooks/useBillingSessions.ts` — add `useUnclosedSessions` hook
- `src/pages/app/billing/BillingSessionsPage.tsx` — add unclosed sessions warning banner with close buttons

