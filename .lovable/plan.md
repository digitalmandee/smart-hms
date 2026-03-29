

# Fix: Missing Route for Radiology Report Verification

## Problem

The Reporting Worklist navigates to `/app/radiology/verify/${order.id}` but the route in `App.tsx` is registered as `radiology/verification` (no `:id` parameter, different path name). This causes a 404.

## Root Cause

- **App.tsx line 1000**: Route is `radiology/verification` (no `:id`)
- **ReportingWorklistPage.tsx line 112**: Navigates to `/app/radiology/verify/${order.id}`
- **ReportVerificationPage.tsx**: Already uses `useParams<{ id: string }>()` — it expects an `:id` param

## Fix

### File: `src/App.tsx` (line 1000)

Change the route from:
```
radiology/verification
```
to:
```
radiology/verify/:id
```

This matches what the worklist navigates to and what the page component expects via `useParams`.

### 1 file, 1 line change.

