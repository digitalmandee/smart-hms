

# Reception → Dialysis Scheduling Flow

## Problem
Reception has no access to Dialysis module. A receptionist cannot:
1. Check if a patient is already enrolled in the dialysis program
2. Schedule a dialysis session based on current machine/chair/shift availability
3. See which slots are open vs occupied for a given pattern/shift

The current flow requires navigating to the Dialysis module (admin-only sidebar) manually.

## What to Build

### 1. Add Dialysis section to Receptionist sidebar
**File: `src/config/role-sidebars.ts`**

Add a "Dialysis" children group under receptionist with:
- Enroll Patient → `/app/dialysis/patients/enroll`
- Schedule → `/app/dialysis/schedule`
- New Schedule → `/app/dialysis/schedule/new`
- Sessions → `/app/dialysis/sessions`

### 2. Add "Dialysis Scheduling" quick action to Reception dashboard
**File: `src/components/reception/ReceptionQuickActions.tsx`**

Add a new quick action button: "Dialysis Schedule" pointing to `/app/dialysis/schedule/new`.

### 3. Build availability check into Schedule Creation page
**File: `src/pages/app/dialysis/DialysisCreateSchedulePage.tsx`**

Currently the form blindly creates a schedule with no conflict awareness. Enhance it:
- When user selects a **pattern + shift**, query existing schedules for that pattern/shift
- Show a live **availability panel**: list of chairs/machines already occupied for that slot, and which are free
- If the selected patient is **already enrolled**, auto-populate their `dialysis_patient_id` and show their info
- If patient is **not enrolled**, show an inline prompt to enroll first (link to enroll page with `?redirect=schedule`)
- Show a **conflict warning** if selected chair/machine is already assigned to another patient in the same pattern+shift

### 4. Add `useDialysisScheduleAvailability` hook
**File: `src/hooks/useDialysis.ts`**

New hook that takes `pattern` and `shift` as params, queries `dialysis_schedules` for that combination, returns:
- Occupied chairs/machines with patient names
- Available machines (cross-reference with `dialysis_machines` where status = "available")
- Total capacity vs used count

### 5. Add patient enrollment check
**File: `src/pages/app/dialysis/DialysisCreateSchedulePage.tsx`**

Add a patient search input that:
- Searches `patients` table by name/MRN
- Cross-checks against `dialysis_patients` to see if already enrolled
- If enrolled: populate the patient dropdown automatically
- If not enrolled: show alert with "Enroll First" button linking to `/app/dialysis/patients/enroll?patient_id={id}&redirect=/app/dialysis/schedule/new`

### 6. i18n keys
**Files: `en.ts`, `ar.ts`, `ur.ts`**

Add keys for: "Dialysis Schedule", "Check Availability", "Occupied", "Available", "Already Enrolled", "Enroll First", "Chair Occupied", "Slot Available", capacity labels.

## Files Changed
- `src/config/role-sidebars.ts` — add Dialysis to receptionist sidebar
- `src/components/reception/ReceptionQuickActions.tsx` — add dialysis quick action
- `src/hooks/useDialysis.ts` — add `useDialysisScheduleAvailability` hook
- `src/pages/app/dialysis/DialysisCreateSchedulePage.tsx` — availability panel, patient search, conflict check
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

