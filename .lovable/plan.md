

# Verify & Improve OPD Token Flow, Display UI, and Status Updates

## Current State Analysis

After thorough exploration of the codebase, here is what exists and what needs attention:

### Token Generation (Walk-In Page)
- **Works**: `OPDWalkInPage.tsx` has a 4-step wizard (Patient → Doctor → Payment → Complete) that creates appointments with auto-generated `token_number` via DB trigger `generate_opd_token`
- **Works**: Token display shows `tokenDisplay` (e.g., `MED-001`) when OPD department is linked, falls back to raw number
- **Works**: Print token slip and receipt supported via `PrintableTokenSlip` component
- **Issue**: No appointments exist today (DB query returned empty), so token screens show empty states

### Token Display Screens
Three separate display pages exist:
1. **`QueueDisplayPage.tsx`** (internal, at `/app/appointments/queue-display`) -- Uses `useTodayQueue` with real-time Supabase subscriptions, shows "Now Serving" / "Next Up" split, supports OPD department filtering and fullscreen
2. **`TokenKioskPage.tsx`** (at `/app/appointments/token-display`) -- Simpler TV display with dark/light mode, audio toggle, priority coloring
3. **`PublicQueueDisplay.tsx`** -- Public-facing, no auth required

### Status Flow Issues Found
- **ConsultationPage.tsx** (line 91-98): Auto-updates appointment to `in_progress` when doctor opens it -- this is correct
- **ConsultationPage.tsx** (line 182-186): Updates to `completed` when consultation is finished -- correct
- **DoctorDashboard.tsx** (line 78-86): Clicking a `checked_in` patient sets it to `in_progress` and navigates to consultation -- correct
- **Token Display** (`QueueDisplayPage`): Filters `checked_in` and `in_progress` from `useTodayQueue`, shows `in_progress` as "Now Serving" and `checked_in` as "Next Up" -- correct
- **Gap**: The `TokenKioskPage` and `QueueDisplayPage` don't show `completed` status at all -- once done, patients just disappear from the display. No "completed" flash or transition feedback.

### UI/Branding Issues
1. **TokenKioskPage** uses hardcoded "OPD Token Display" title instead of organization name
2. **TokenKioskPage** doesn't use OPD department codes in token display (just raw `token_number`)
3. **TokenKioskPage** doesn't use the `OPDTokenBadge` component or `formatTokenDisplay` helper
4. **QueueDisplayPage** is well-designed but token numbers inside circles can overflow for department-prefixed tokens (e.g., `SURG-015` in a `w-24 h-24` circle)
5. Neither display page shows payment status or any branding colors from the organization
6. **PrintableTokenSlip** (appointments version) doesn't use department-prefixed display format

---

## Proposed Changes

### 1. Simplify & Brand the Token Display (`TokenKioskPage.tsx`)
- Replace hardcoded "OPD Token Display" with organization name from `useOrganization`
- Show organization logo in header
- Use `formatTokenDisplay` for department-prefixed tokens instead of raw `token_number`
- Add OPD department badge/name next to doctor info
- Add a "Just Completed" row that shows the last 3 completed patients for 2 minutes (flash effect) so patients see their consultation ended
- Use branded primary color from organization theme
- Add real-time subscription (like QueueDisplayPage has) for instant updates

### 2. Improve QueueDisplayPage Token Circles
- Make token circles wider for department-prefixed codes (use `min-w` instead of fixed `w-24`)
- Add status badge ("In Consultation" / "Waiting") next to patient name
- Add a "Recently Completed" section at the bottom showing last 3 completed tokens with checkmark
- Add organization logo to header

### 3. Fix PrintableTokenSlip (Appointments Version)
- Use `formatTokenDisplay` to show department-prefixed token (currently just shows raw number)
- Add department name below "OPD TOKEN" title

### 4. Add Completed Status Flash on Displays
- When consultation ends (status changes to `completed`), show the token briefly in a "Completed" section with green checkmark for ~60 seconds before removing
- This gives visual feedback to the patient and waiting area that the consultation has ended

### 5. Trilingual Translation Keys
Add new keys for:
- `opd.nowServing`, `opd.nextUp`, `opd.recentlyCompleted`, `opd.inConsultation`, `opd.waitingForDoctor`, `opd.consultationComplete`

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/app/appointments/TokenKioskPage.tsx` | **EDIT** -- Add org branding, department-prefixed tokens, completed flash, real-time subscription |
| `src/pages/app/appointments/QueueDisplayPage.tsx` | **EDIT** -- Fix token circle sizing, add org logo, add "Recently Completed" section |
| `src/components/appointments/PrintableTokenSlip.tsx` | **EDIT** -- Use `formatTokenDisplay` for department-prefixed token display |
| `src/lib/i18n/translations/en.ts` | **EDIT** -- Add ~6 new translation keys |
| `src/lib/i18n/translations/ar.ts` | **EDIT** -- Add ~6 new translation keys |
| `src/lib/i18n/translations/ur.ts` | **EDIT** -- Add ~6 new translation keys |

### Technical Details

**Recently Completed Feature**: Both display pages will query appointments with `status = 'completed'` and `updated_at > NOW() - 2 minutes` to show a brief "completed" flash. This uses the existing `useTodayQueue` pattern but with a separate query for completed appointments.

**Real-time on TokenKioskPage**: Currently uses polling (`setInterval` every 10s). Will add Supabase `postgres_changes` subscription like `QueueDisplayPage` already has for instant updates.

**Token Circle Overflow Fix**: Change from fixed `w-24 h-24 rounded-full` to `min-w-[6rem] h-24 rounded-2xl px-3` for the "Now Serving" token display to accommodate longer department-prefixed codes.

