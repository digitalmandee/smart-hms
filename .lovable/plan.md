

# Fix Nurse vs Doctor Actions — Role-Based Button Visibility

## Problem
Several components show "Start Consultation" to nurses, but only doctors should see that action. Nurses should see "Record Vitals" and "Add Chief Complaint" instead. The issue exists in three places:

1. **`AppointmentDetailPage.tsx`** (line 170): Shows "Start Consultation" button for any user when status is `checked_in` — no role check
2. **`PatientCurrentVisit.tsx`** (line 117-123): Shows "Start Consultation" link for any user when status is `checked_in` — no role check  
3. **`AppointmentCard.tsx`** dropdown (line 160-163): Shows "Start Consultation" in the menu whenever `onStart` is passed — callers need to control this

The `AppointmentQueuePage` already has `isDoctor` logic and `showConsultButton`, so that part works. The fix targets the remaining unguarded locations.

## Changes

### 1. `src/pages/app/appointments/AppointmentDetailPage.tsx`
- Import `useAuth` and check `hasRole('doctor')`
- For `checked_in` status:
  - **Doctor**: Show "Start Consultation" button (existing behavior)
  - **Nurse**: Show "Record Vitals" button (links to `/app/opd/vitals?appointmentId=...`) and "Add Complaint" text area

### 2. `src/components/patients/PatientCurrentVisit.tsx`
- Accept a `userRole` or use `useAuth().hasRole()` to check
- For `checked_in` status:
  - **Doctor**: Show "Start Consultation" (existing)
  - **Nurse/Other**: Show "Record Vitals" link to `/app/opd/vitals?appointmentId=...`
- For `in_progress` status:
  - **Doctor**: Show "Continue Consultation" (existing)
  - **Nurse**: Show "View Status" or simply hide the consultation link

### 3. `src/components/appointments/AppointmentCard.tsx`
- Add `showConsultButton` guard to the dropdown "Start Consultation" menu item (line 160-163) so it only appears when `showConsultButton` is true — matching the inline button logic already on line 138

### 4. Translations (~4 new keys)
Add to `en.ts`, `ar.ts`, `ur.ts`:
- `opd.recordVitals` — "Record Vitals" / "تسجيل العلامات الحيوية" / "وائٹلز ریکارڈ کریں"
- `opd.addComplaint` — "Add Complaint" / "إضافة الشكوى" / "شکایت درج کریں"
- `opd.viewStatus` — "View Status" / "عرض الحالة" / "حالت دیکھیں"
- `opd.nurseActions` — "Nurse Actions" / "إجراءات التمريض" / "نرس ایکشنز"

## Files to Edit

| File | Change |
|------|--------|
| `src/pages/app/appointments/AppointmentDetailPage.tsx` | Add `hasRole` check; nurse sees "Record Vitals" instead of "Start Consultation" |
| `src/components/patients/PatientCurrentVisit.tsx` | Add `hasRole` check; nurse sees "Record Vitals" instead of "Start/Continue Consultation" |
| `src/components/appointments/AppointmentCard.tsx` | Guard dropdown "Start Consultation" with `showConsultButton` |
| `src/lib/i18n/translations/en.ts` | 4 new keys |
| `src/lib/i18n/translations/ar.ts` | 4 new keys |
| `src/lib/i18n/translations/ur.ts` | 4 new keys |

## Summary of Role Behavior

```text
Status: checked_in
  Doctor  → "Start Consultation" → /app/opd/consultation/:id
  Nurse   → "Record Vitals"      → /app/opd/vitals?appointmentId=:id

Status: in_progress
  Doctor  → "Continue Consultation" → /app/opd/consultation/:id
  Nurse   → (no action / view only)

Status: scheduled
  Both    → "Record Vitals" → /app/opd/vitals?appointmentId=:id (existing)
```

