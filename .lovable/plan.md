

# Auto-Assign Doctor & Separate Pre-Assessment Workflow

## Problems
1. **Doctor must manually select themselves** as attending doctor — when logged in as a doctor, it should auto-assign
2. **Pre-weight blocks "Start Session"** for everyone — doctors shouldn't need to enter pre-weight; that's a nurse task. Doctors should see the session and add notes, but nurses handle the pre-assessment vitals

## Changes

### 1. Auto-assign logged-in doctor as attending (`DialysisSessionDetailPage.tsx`)
- When a doctor opens a session that has no `attended_by`, auto-assign their profile ID via `useEffect`
- Show attending doctor as read-only text for doctor role (not a dropdown)
- Keep the dropdown only for admin roles who may reassign

### 2. Separate pre-assessment from "Start Session" (`DialysisSessionDetailPage.tsx`)
- **Nurse view (scheduled)**: Show pre-assessment form (pre-weight, BP, pulse, temp) + "Start Session" button. Pre-weight remains required for nurses to start.
- **Doctor view (scheduled)**: Show session info read-only, show "Approve & Start" button that does NOT require pre-weight (nurse may have already filled it). If pre-weight is already recorded, show it. If not, show a note: "Waiting for nurse pre-assessment".
- **Doctor view (in_progress)**: Show vitals chart, doctor notes field, and "Complete Session" button (post-weight still required but can be filled by nurse).
- When nurse submits pre-assessment, save it to the session without changing status. Add a "Save Pre-Assessment" button separate from "Start Session".

### 3. Show attending doctor info in header (`DialysisSessionDetailPage.tsx`)
- Add attending doctor name to the compact header row (next to patient info)
- For doctor role: show "You are attending" badge

## Files Changed
- `src/pages/app/dialysis/DialysisSessionDetailPage.tsx` — auto-assign doctor, split nurse/doctor pre-assessment flow, show doctor in header
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys: "Save Pre-Assessment", "Waiting for nurse", "You are attending"

