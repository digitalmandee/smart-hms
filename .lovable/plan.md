

# Dialysis Module — Role-Based Access & Complete Flow Fix

## Problem
1. **Only `org_admin` has Dialysis in sidebar** — `doctor`, `nurse`, `ipd_nurse` roles have zero dialysis menu items
2. **No role-based UI differentiation** — nurses, doctors, and admins all see the same screens with no workflow separation
3. **No DashboardPage redirect** for dialysis-focused staff
4. **Session Detail lacks role-aware actions** — nurses shouldn't assign doctors, doctors shouldn't record vitals, etc.

## Complete Dialysis Flow by Role

```text
ADMIN (org_admin/branch_admin):
  → Full Dialysis sidebar (existing)
  → Enroll patients, manage machines, view reports, manage schedules

DOCTOR:
  → Dialysis > My Sessions, Patients, Reports
  → Session Detail: Assign self, write doctor notes, approve/sign-off completion
  → Cannot: manage machines, create schedules

NURSE (nurse/ipd_nurse):
  → Dialysis > Dashboard, Sessions, Patients, Schedule
  → Session Detail: Pre-assessment vitals, start session, record intra-vitals, post-vitals, nursing notes
  → Cannot: write doctor notes, assign doctors

RECEPTIONIST:
  → Dialysis > Enroll Patient, Schedule, Sessions list
  → Cannot: clinical actions
```

## Implementation Plan

### 1. Add Dialysis menu to `doctor`, `nurse`, `ipd_nurse` sidebars
**File: `src/config/role-sidebars.ts`**

- **doctor** sidebar: Add "Dialysis" section with Dashboard, My Sessions (filtered), Patients
- **nurse** sidebar: Add "Dialysis" section with Dashboard, Sessions, Patients, Schedule
- **ipd_nurse** sidebar: Add "Dialysis" section with Dashboard, Sessions, Patients

### 2. Add role-aware actions in Session Detail
**File: `src/pages/app/dialysis/DialysisSessionDetailPage.tsx`**

- Read user roles from `useAuth()`
- Nurse roles: show pre/post vitals forms, record vitals button, nursing notes — hide doctor notes and doctor assignment
- Doctor roles: show doctor notes, doctor assignment (pre-fill self), sign-off button — hide vitals recording forms
- Admin roles: see everything (current behavior)

### 3. Add DashboardPage redirect for dialysis context
**File: `src/pages/app/DashboardPage.tsx`**

- No dedicated dialysis role exists, so no redirect needed — doctors/nurses access via sidebar menu item

### 4. Add i18n keys for role-specific labels
**Files: `en.ts`, `ar.ts`, `ur.ts`**

- "My Dialysis Sessions", "Dialysis Ward", "Sign Off", "Nurse Actions", "Doctor Review"

## Files Changed
- `src/config/role-sidebars.ts` — add Dialysis section to doctor, nurse, ipd_nurse sidebars
- `src/pages/app/dialysis/DialysisSessionDetailPage.tsx` — role-aware UI sections
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

