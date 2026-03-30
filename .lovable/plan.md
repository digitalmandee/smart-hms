

# Fix: "Start Session" and "Complete Session" Buttons Not Visible

## Root Cause

The action buttons (Start Session, Complete Session, Cancel, No Show) are gated by `canStartComplete` (line 78):

```typescript
const canStartComplete = isNurseRole || isAdminRole;
```

This excludes `doctor`, `surgeon`, and `receptionist` roles. If you're logged in as a doctor or any non-nurse/non-admin role, the buttons are completely hidden.

## Fix

**File: `src/pages/app/dialysis/DialysisSessionDetailPage.tsx`**

Expand `canStartComplete` to include doctors:

```typescript
const canStartComplete = isNurseRole || isDoctorRole || isAdminRole;
```

This single-line change makes Start/Complete/Cancel/No Show buttons visible to nurses, doctors, and admins — all clinical roles that should manage session lifecycle.

## Files Changed
- `src/pages/app/dialysis/DialysisSessionDetailPage.tsx` — line 78, add `isDoctorRole` to `canStartComplete`

